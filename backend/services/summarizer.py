# File: backend/services/summarizer.py
import os
import base64
import re
from pathlib import Path
from openai import OpenAI

# Import the text-to-speech function
from .tts_service import text_to_speech_telugu

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
        'hi': 'Hindi',
        'te': 'Telugu',
        'ta': 'Tamil',
        'bn': 'Bengali',
        'mr': 'Marathi',
        'gu': 'Gujarati',
        'kn': 'Kannada',
        'ml': 'Malayalam',
        'pa': 'Punjabi'
    }
    return language_map.get(language_code, 'English')

def clean_text_for_tts(text):
    """
    Remove formatting characters that might cause issues with the TTS API.
    Keeps the text clean for API processing while preserving basic punctuation.
    
    :param text: Input text with potential formatting characters
    :return: Cleaned text suitable for TTS API
    """
    # Replace multiple newlines with a single space
    cleaned = re.sub(r'\n+', ' ', text)
    
    # Remove markdown formatting characters (asterisks, underscores, etc.)
    cleaned = re.sub(r'[*_~`#]', '', cleaned)
    
    # Replace multiple spaces with a single space
    cleaned = re.sub(r'\s+', ' ', cleaned)
    
    # Remove any other special formatting characters that might cause issues
    cleaned = re.sub(r'[\r\t\f\v]', '', cleaned)
    
    return cleaned.strip()

def extract_and_summarize_image(image_path: str, language: str = "te") -> dict:
    """
    Extract text from an image, summarize it, and generate TTS.
    
    :param image_path: Path to the image file.
    :param language: Language code for the summary (default: "te").
    :return: Dictionary with summary and audio
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
        "IMPORTANT: Your summary MUST be between 500-1400 characters to ensure proper text-to-speech functionality. "
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
    
    # Extract summary from the response
    summary = response.choices[0].message.content
    
    # Generate text-to-speech for the summary
    try:
        # Clean the text before sending to TTS service
        cleaned_summary = clean_text_for_tts(summary)
        audio_base64 = text_to_speech_telugu(cleaned_summary, language=language)
    except Exception as e:
        audio_base64 = []  # Return empty array on error
        print(f"TTS generation failed: {e}")
    
    return {
        "summary": summary,
        "audio": audio_base64
    }

def azure_chatgpt_summarization(text: str, language: str = "te") -> dict:
    """
    Uses the GitHub-Azure ChatGPT model to summarize the input text.
    Generates TTS for the summary.
    
    :param text: The text to summarize.
    :param language: Language code for the summary (default: "te").
    :return: Dictionary with summary and audio
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
        "You are a helpful assistant that summarizes texts succinctly, clearly and within specific length requirements. "
        "IMPORTANT: Your summary MUST be between 500-1400 characters to ensure proper text-to-speech functionality. "
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
    
    # Extract summary from the response
    summary = response.choices[0].message.content
    
    # Generate text-to-speech for the summary
    try:
        # Clean the text before sending to TTS service
        cleaned_summary = clean_text_for_tts(summary)
        audio_base64 = text_to_speech_telugu(cleaned_summary, language=language)
    except Exception as e:
        audio_base64 = []  # Return empty array on error
        print(f"TTS generation failed: {e}")
    
    return {
        "summary": summary,
        "audio": audio_base64
    }