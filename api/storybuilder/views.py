import json
import os
from django.contrib.auth.models import User
from django.shortcuts import HttpResponse, get_object_or_404
from django.urls import reverse
from django.core.files.storage import default_storage
from django.conf import settings
from django.core.files.base import ContentFile
from jsonschema import ValidationError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from rest_framework import status
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.units import inch
from io import BytesIO
from .utils import generate_story_block, generate_story_options, conclude_story
from .models import Story, StoryBlock


# Create your views here.
def home(request):
    return HttpResponse('Hello, World!')

class CreateStoryView(APIView):
    permission_classes = [IsAuthenticated]  # Enforce authentication

    @extend_schema(
        summary="Create a new story",
        description="Allows an authenticated user to create a new story with a title.",
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "The title of the story to be created.",
                        "example": "The Adventures of a Brave Knight"
                    }
                },
                "required": ["title"]
            }
        },
    )
    def post(self, request, *args, **kwargs):
        if not request.user or not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication required."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        title = request.data.get("title", "").strip()

        # Validate input
        if not title:
            return Response(
                {"detail": "'title' is required and cannot be blank."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create the story
        story = Story.objects.create(
            title=title,
            user=request.user  # Use the authenticated user
        )

        return Response(
            {
                "id": story.id,
                "title": story.title,
                "user": story.user.id,
                "created_at": story.created_at
            },
            status=status.HTTP_201_CREATED
        )



class StoryBlockView(APIView):
    @extend_schema(
        summary="Generate the next block of the story with options for the next part.",
        description=(
            "If no previous blocks exist, the user must provide a starting prompt for the story. "
            "For subsequent calls, fetches the previous story from the database and generates the next block and options."
        ),
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "story_id": {
                        "type": "integer",
                        "description": "The ID of the story to continue.",
                        "example": 1
                    },
                    "user_choice": {
                        "type": "string",
                        "description": "The user's choice influencing the next part of the story.",
                        "example": "The knight decides to take the mountain path."
                    },
                    "starting_prompt": {
                        "type": "string",
                        "description": "The starting template for the story (only required if no blocks exist).",
                        "example": "Once upon a time, a knight set off on a quest to rescue the princess."
                    }
                },
                "required": ["story_id"]
            }
        },
    )
    def post(self, request, *args, **kwargs):
        story_id = request.data.get("story_id")
        user_choice = request.data.get("user_choice", None)
        starting_prompt = request.data.get("starting_prompt", None)

        # Validate input
        if not story_id:
            return Response(
                {"detail": "'story_id' is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Fetch the story
        story = get_object_or_404(Story, id=story_id)

        # Get the last block of the story (if it exists)
        all_blocks = story.blocks.all()
        if all_blocks:
            previous_story = " ".join(block.content for block in all_blocks)
        else:
            if not starting_prompt:
                return Response(
                    {"detail": "'starting_prompt' is required when no story blocks exist."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            previous_story = starting_prompt
            user_choice = None

        # Generate the next story block
        next_block = generate_story_block(previous_story, user_choice)
        
        # Generate options and validate JSON format
        try:
            options = generate_story_options(next_block)
            
            # Validate options is proper JSON format
            if isinstance(options, str):
                options = json.loads(options)  # Try to parse if string
            else:
                # Verify serializable to JSON
                json.dumps(options)
                
            # Validate expected structure (assuming options should have option1, option2, option3)
            required_keys = ['option1', 'option2', 'option3']
            if not all(key in options for key in required_keys):
                raise ValidationError("Options missing required keys")

        except (json.JSONDecodeError, ValidationError, TypeError) as e:
            # Log the error for debugging
            print(f"Options generation error: {str(e)}")
            print(f"Raw options output: {options}")
            
            # Create error response with redirect information
            error_response = {
                "error": "Failed to generate valid story options",
                "detail": str(e),
                "redirect_url": reverse('regenerate-options', kwargs={'story_id': story_id}),
                "next_block": next_block  # Include the generated block for reference
            }
            
            # Save the block without options for later update
            new_block = StoryBlock.objects.create(
                story=story,
                content=next_block,
                choices={},  # Empty choices
                user_choice=user_choice
            )
            
            return Response(
                error_response,
                status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )

        # If validation passes, save the new story block
        new_block = StoryBlock.objects.create(
            story=story,
            content=next_block,
            choices=options,
            user_choice=user_choice
        )

        return Response({
            "next_block": new_block.content,
            "options": new_block.choices,
        }, status=status.HTTP_200_OK)
        
class RegenerateOptionsView(APIView):
    @extend_schema(
        summary="Regenerate options for a story block",
        description="Attempts to regenerate options when the initial generation failed"
    )
    def post(self, request, story_id):
        # Get the latest block for this story
        story_block = StoryBlock.objects.filter(
            story_id=story_id
        ).order_by('-created_at').first()
        
        if not story_block:
            return Response(
                {"error": "No story block found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            # Attempt to regenerate options
            new_options = generate_story_options(story_block.content)
            
            # Validate new options
            if isinstance(new_options, str):
                new_options = json.loads(new_options)
            
            # Verify required structure
            required_keys = ['option1', 'option2', 'option3']
            if not all(key in new_options for key in required_keys):
                raise ValidationError("Regenerated options missing required keys")
            
            # Update the story block with new options
            story_block.choices = new_options
            story_block.save()
            
            return Response({
                "next_block": story_block.content,
                "options": new_options
            })
            
        except (json.JSONDecodeError, ValidationError, TypeError) as e:
            return Response({
                "error": "Failed to regenerate valid options",
                "detail": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class ConcludeStoryView(APIView):
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Conclude the story by generating the final block.",
        description=(
            "Fetches the existing story and generates a final conclusion block. "
            "If no blocks exist, an error is returned."
        ),
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "story_id": {
                        "type": "integer",
                        "description": "The ID of the story to conclude.",
                        "example": 1
                    }
                },
                "required": ["story_id"]
            }
        },
    )
    def post(self, request):
        story_id = request.data.get("story_id")
        
        if not story_id:
            return Response(
                {"detail": "'story_id' is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Fetch the story
        story = get_object_or_404(Story, id=story_id, user=request.user)
        
        # Ensure the story has content before concluding
        all_blocks = story.blocks.all()
        if not all_blocks:
            return Response(
                {"detail": "Cannot conclude an empty story."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Combine story text from existing blocks
        full_story_text = " ".join(block.content for block in all_blocks)
        
        # Generate the final block
        final_block = conclude_story(full_story_text)
        
        # Validate generated content
        if not final_block:
            return Response(
                {"error": "Failed to generate the final block."},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )
        
        # Save the final block
        new_block = StoryBlock.objects.create(
            story=story,
            content=final_block,
            choices={},  # No further choices since it's the conclusion
        )
        
        return Response(
            {"final_block": new_block.content},
            status=status.HTTP_200_OK
        )
    

class GeneratePDFView(APIView):
    def get(self, request, story_id, *args, **kwargs):
        try:
            # Fetch the story and its blocks
            story = Story.objects.get(id=story_id)
            blocks = StoryBlock.objects.filter(story=story).order_by('created_at')

            if not blocks.exists():
                return Response({"error": "No story blocks found for the given Story ID."}, status=status.HTTP_404_NOT_FOUND)

            # Ensure the directory exists
            pdf_dir = os.path.join(settings.MEDIA_ROOT, 'story_pdfs')
            os.makedirs(pdf_dir, exist_ok=True)

            # Prepare the PDF buffer
            buffer = BytesIO()
            pdf = SimpleDocTemplate(
                buffer,
                pagesize=letter,
                rightMargin=0.5 * inch,
                leftMargin=0.5 * inch,
                topMargin=0.75 * inch,
                bottomMargin=0.75 * inch
            )

            # Define styles
            styles = getSampleStyleSheet()
            title_style = styles["Title"]
            metadata_style = styles["Normal"]
            paragraph_style = ParagraphStyle(
                "Paragraph",
                parent=styles["BodyText"],
                spaceAfter=12,
                leading=14,
                alignment=4,
            )

            # PDF content
            content = []

            # Add the title
            content.append(Paragraph(f"Story Title: {story.title}", title_style))

            # Add metadata
            metadata = (
                f"<b>Created By:</b> {story.user.username}<br/>"
                f"<b>Created At:</b> {story.created_at.strftime('%Y-%m-%d %H:%M:%S')}<br/>"
                f"<b>Last Updated:</b> {story.updated_at.strftime('%Y-%m-%d %H:%M:%S')}"
            )
            content.append(Paragraph(metadata, metadata_style))
            content.append(Spacer(1, 0.25 * inch))

            # Add each story block
            for block in blocks:
                content.append(Paragraph(block.content, paragraph_style))

                if block.choices:
                    choices_text = "<b>Choices:</b><br/>"
                    for i, (key, value) in enumerate(block.choices.items(), start=1):
                        choices_text += f"choice {i}: {value}<br/>"
                    content.append(Paragraph(choices_text, paragraph_style))

                content.append(Spacer(1, 0.25 * inch))

            # Build the PDF
            pdf.build(content)
            buffer.seek(0)

            # Save the PDF file
            pdf_filename = f"story_{story_id}.pdf"
            pdf_path = f"story_pdfs/{pdf_filename}"
            default_storage.save(pdf_path, ContentFile(buffer.getvalue()))

            # Update the Story model with the PDF path
            story.pdf.name = pdf_path
            story.save()

            # Return response
            return Response({
                "message": "PDF generated successfully.",
                "pdf_url": default_storage.url(pdf_path)
            })

        except Story.DoesNotExist:
            return Response({"error": "Story not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserPDFListView(APIView):
    """
    Endpoint to retrieve all PDFs associated with a given user.
    """
    
    def get(self, request, user_id, *args, **kwargs):
        try:
            user = User.objects.get(id=user_id)
            stories = Story.objects.filter(user=user, pdf__isnull=False).exclude(pdf='')  # Fetch stories with PDFs

            if not stories.exists():
                return Response({"message": "No PDFs found for this user."}, status=status.HTTP_404_NOT_FOUND)

            pdf_list = [{"story_id": story.id, "title": story.title, "pdf_url": default_storage.url(story.pdf.name)} for story in stories]

            return Response({"user_id": user_id, "pdfs": pdf_list}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)