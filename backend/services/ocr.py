# File: backend/services/ocr.py
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

def extract_text_from_image(image_path: str) -> str:
    """
    Extract text from an image file using the Azure-GitHub model API.
    
    :param image_path: Path to the image file.
    :return: Extracted text or an error message.
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
    
    # Send the image to the model with a prompt to extract text
    response = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant that extracts text from images accurately. Return only the extracted text without any additional commentary."
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Extract all text from this image:"},
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
    extracted_text = response.choices[0].message.content
    return extracted_text