import json
import os
from langchain_together import Together
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv

load_dotenv()

os.environ["TOGETHER_API_KEY"] = os.getenv('TOGETHER_API_KEY')

def generate_story_block(previous_story, user_choice):
    """
    Generate the next block of the story using Together AI's Mistral model.
    """
    prompt = PromptTemplate(
        input_variables=["previous_story", "user_choice"],
        template=(
            "Continue the story based on the following narrative:\n\n"
            "Story so far:\n{previous_story}\n\n"
            "User chose: {user_choice}\n\n"
            "Write the next part of the story in a compelling way."
        )
    )
    
    # Initialize Together AI with Mistral model
    llm = Together(
        model="mistralai/Mistral-7B-Instruct-v0.1",
        temperature=0,
        max_tokens=512,
        together_api_key=os.environ["TOGETHER_API_KEY"]
    )
    
    chain = prompt | llm
    
    # Generate the next block of the story
    next_story = chain.invoke({
        "previous_story": previous_story, 
        "user_choice": user_choice
    })
    
    return next_story

def conclude_story(previous_story):
    prompt = PromptTemplate(
        input_variables=["current_story"],
        template=(
            "You are a novelist given the task to conclude the story with a compelling ending"
            "Write a suitable conclusion to the following story, tying up all loose ends"
            "Story so far:\n{current_story}\n\n"
        )
    )

    llm = Together(
        model="mistralai/Mistral-7B-Instruct-v0.1",
        temperature=0,  # Ensures minimum randomness
        max_tokens=512,
        together_api_key=os.environ["TOGETHER_API_KEY"]
    )
    
    chain = prompt | llm

    final_block = chain.invoke({'current_story': previous_story})

    return final_block

def generate_story_options(current_story: str) -> dict:
    """
    Generate story continuation options using Together AI's Mistral model via Langchain.
    """
    
    # Define the prompt template with escaped curly braces for the JSON format
    prompt = PromptTemplate(
        input_variables=["current_story"],
        template=(
            "You are a story option generator that MUST follow these EXACT rules:\n\n"
            "1. Output ONLY a JSON object\n"
            "2. Use EXACTLY this format and generate only 3 options:\n"
            "<OPTIONS>\n"
            "{{\n"
            '    "option1": "[One sentence describing the first option]",\n'
            '    "option2": "[One sentence describing the second option]",\n'
            '    "option3": "[One sentence describing the third option]"\n'
            "}}\n"
            "</OPTIONS>\n\n"
            "3. Each option MUST be exactly ONE sentence\n"
            "4. Do NOT use line breaks within the sentences\n"
            "5. Do NOT include any text outside the OPTIONS tags\n"
            "6. Keep all punctuation and formatting EXACTLY as shown\n\n"
            "Story so far:\n{current_story}\n\n"
            "Generate options:"
        )
    )
    
    # Initialize Together AI with Mistral model
    llm = Together(
        model="mistralai/Mistral-7B-Instruct-v0.1",
        temperature=0,  # Ensures minimum randomness
        max_tokens=512,
        together_api_key=os.environ["TOGETHER_API_KEY"]
    )
    
    # Create the chain
    chain = prompt | llm
    
    try:
        # Generate options using the chain
        raw_output = chain.invoke({"current_story": current_story})
        
        # Extract content between OPTIONS tags
        options_text = raw_output.split('<OPTIONS>')[1].split('</OPTIONS>')[0].strip()
        
        # Parse JSON
        options = json.loads(options_text)
        
        return options
        
    except Exception as e:
        print(f"Error generating options: {e}")
        # Always return a consistently formatted fallback if anything fails
        return {
            "option1": "ERROR",
            "option2": "ERROR",
            "option3": "ERROR"
        }


def test_generate_story_functions():
    # Initial story setup
    previous_story = (
        "Once upon a time, in a small village surrounded by enchanted forests, "
        "a young adventurer named Alina discovered a mysterious glowing artifact."
    )
    user_choice = "Alina decided to touch the artifact."

    # Test the generate_story_block function
    print("Testing generate_story_block...\n")
    try:
        next_story = generate_story_block(previous_story, user_choice)
        print("Next part of the story:\n")
        print(next_story)
    except Exception as e:
        print(f"Error generating story block: {e}")

    # Test the generate_story_options function
    print("\nTesting generate_story_options...\n")
    try:
        options = generate_story_options(next_story)
        print("Options for what happens next:\n")
        for i, option in enumerate(options, 1):
            print(f"{i}. {option.strip()}")
    except Exception as e:
        print(f"Error generating story options: {e}")
        

# Run the test
if __name__ == "__main__":
    test_generate_story_functions()
