# File: backend/services/summarizer.py
import os
import base64
from pathlib import Path
from openai import OpenAI

def get_image_data_url(image_path, image_format):
    """
    Convert an image file to a data URL.
    
    :param image_path: Path to the image file
    :param image_format: Format of the image (jpg, png, etc.)
    :return: Data URL of the image
    """
    try:
        with open(image_path, "rb") as image_file:
            image_data = image_file.read()
            base64_encoded = base64.b64encode(image_data).decode('utf-8')
            return f"data:image/{image_format};base64,{base64_encoded}"
    except Exception as e:
        return f"Error: Could not read image file: {e}"

# Map language codes to full language names for better API understanding
def get_language_name(language_code):
    language_map = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'zh': 'Chinese',
        'ja': 'Japanese',
        'ko': 'Korean',
        'ru': 'Russian',
        'ar': 'Arabic',
        # Indian languages with full names
        'hi': 'Hindi',
        'te': 'Telugu',
        'ta': 'Tamil',
        'bn': 'Bengali',
        'mr': 'Marathi',
        'gu': 'Gujarati',
        'kn': 'Kannada',
        'ml': 'Malayalam',
        'pa': 'Punjabi',
        'ur': 'Urdu'
    }
    return language_map.get(language_code, 'English')

def extract_and_summarize_image(image_path: str, language: str = "en") -> str:
    """
    Extract text from an image and summarize it in a single API call.
    
    :param image_path: Path to the image file.
    :param language: Language code for the summary (default: "en").
    :return: Summarized text or an error message.
    """
    # Get the token from environment variables
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        raise ValueError("GITHUB_TOKEN environment variable not set.")
    
    # Define endpoint and model name
    endpoint = "https://models.inference.ai.azure.com"
    model_name = "gpt-4o"
    
    # Determine image format from file extension
    image_format = Path(image_path).suffix.lower().strip('.')
    if image_format not in ['jpg', 'jpeg', 'png', 'gif']:
        image_format = 'jpeg'  # Default to jpeg if unknown format
    
    # Convert image to data URL
    image_data_url = get_image_data_url(image_path, image_format)
    
    # Create an OpenAI client instance
    client = OpenAI(
        base_url=endpoint,
        api_key=token,
    )
    
    # Get full language name for clearer instruction to the model
    language_name = get_language_name(language)
    
    # Create language-specific system prompt with explicit language name
    system_prompt = (
        "You are a helpful assistant that extracts text from images and provides clear, well-formatted summaries. "
        "For longer texts, structure the summary with bullet points. "
        "For shorter texts, provide a concise paragraph. "
        "Use clean formatting without asterisks or markdown symbols. "
        "Ensure the summary is readable and captures the key points. "
        f"You must respond in {language_name} language only."
    )
    
    # Send the image to the model with a prompt to extract and summarize text in one call
    response = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": f"Extract all text from this image and provide a clear, well-formatted summary in {language_name} language only. Do not use any other language."},
                    {"type": "image_url", "image_url": {"url": image_data_url}}
                ]
            }
        ],
        temperature=0.3,  # Lower temperature for more consistent output
        top_p=1.0,
        max_tokens=1500,
        model=model_name
    )
    
    # Extract and return the text from the response
    summary = response.choices[0].message.content
    return summary

def azure_chatgpt_summarization(text: str, language: str = "en") -> str:
    """
    Uses the GitHub-Azure ChatGPT model to summarize the input text.
    Requires the environment variable GITHUB_TOKEN to be set.
    
    :param text: The text to summarize.
    :param language: Language code for the summary (default: "en").
    :return: Summarized text.
    """
    # Get the token from environment variables
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        raise ValueError("GITHUB_TOKEN environment variable not set.")
    
    # Define endpoint and model name
    endpoint = "https://models.inference.ai.azure.com"
    model_name = "gpt-4o"
    
    # Create an OpenAI client instance
    client = OpenAI(
        base_url=endpoint,
        api_key=token,
    )
    
    # Get full language name for clearer instruction to the model
    language_name = get_language_name(language)
    
    # Create language-specific system prompt with explicit language name
    system_prompt = (
        "You are a helpful assistant that summarizes texts succinctly and clearly. "
        "For longer texts, provide a well-structured summary with bullet points. "
        "For shorter texts, provide a concise paragraph. "
        "Use clean formatting without asterisks or markdown symbols. "
        "Ensure the summary is readable and captures the key points. "
        f"You must respond in {language_name} language only."
    )
    
    # Build the messages for a summarization prompt with improved formatting instructions
    response = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": f"Please summarize the following text in {language_name} language only. Do not use any other language:\n\n{text}",
            }
        ],
        temperature=0.7,
        top_p=1.0,
        max_tokens=1000,
        model=model_name
    )
    
    # Extract and return the summary from the response
    summary = response.choices[0].message.content
    return summary