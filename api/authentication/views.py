from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiExample
from .serializers import UserSerializer, UserProfileSerializer
from .models import UserProfile


# API endpoint for creating a new user
class CreateUserView(APIView):
    @extend_schema(
        summary="Create a new user",
        description="Endpoint to create a new user with username, email, and password.",
        request=UserSerializer,
        responses={
            201: 'User created successfully!',
            400: 'Validation error',
        },
    )
    def post(self, request, *args, **kwargs):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()  # Save the user if data is valid
            return Response({'message': 'User created successfully!'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(generics.RetrieveUpdateAPIView, generics.CreateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """Retrieve the user profile for the authenticated user."""
        return UserProfile.objects.get(user=self.request.user)

    @extend_schema(
        summary="Create, Retrieve, or Update a User Profile",
        description="This endpoint allows authenticated users to create a profile if it doesn't exist, retrieve their existing profile, or update it.",
        request=UserProfileSerializer,
        responses={200: UserProfileSerializer, 201: UserProfileSerializer},
        examples=[
            OpenApiExample(
                "Sample Request",
                summary="Example request body",
                description="An example request for creating/updating a user profile",
                value={
                    "display_name": "John Doe",
                    "email_address": "johndoe@example.com",
                    "date_of_birth": "1995-06-15",
                    "address": "123 Street, City",
                    "bio": "Hello, I love coding!",
                    "profile_pic": None
                },
                request_only=True  
            ),
            OpenApiExample(
                "Sample Response",
                summary="Example response body",
                description="Example response after successfully retrieving or updating a user profile",
                value={
                    "id": 10,
                    "user": 1,
                    "display_name": "John Doe",
                    "email_address": "johndoe@example.com",
                    "date_of_birth": "1995-06-15",
                    "address": "123 Street, City",
                    "bio": "Hello, I love coding!",
                    "profile_pic": None,
                    "created_at": "2025-02-02T12:00:00Z"
                },
                response_only=True  
            ),
        ],
    )
    def get(self, request, *args, **kwargs):
        """Retrieve the user's profile if it exists."""
        try:
            profile = self.get_object()
            serializer = self.get_serializer(profile)
            return Response(serializer.data, status=200)
        except UserProfile.DoesNotExist:
            return Response({"detail": "User profile not found"}, status=404)

    def post(self, request, *args, **kwargs):
        """Create a new user profile only if it does not exist."""
        if UserProfile.objects.filter(user=request.user).exists():
            return Response({"detail": "Profile already exists"}, status=400)
        return super().post(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        """Update an existing user profile."""
        profile = self.get_object()
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=200)