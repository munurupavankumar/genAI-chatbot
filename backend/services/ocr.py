# File: backend/services/ocr.py
import pytesseract
from PIL import Image

def extract_text_from_image(image_path: str) -> str:
    """
    Extract text from an image file using pytesseract.
    
    :param image_path: Path to the image file.
    :return: Extracted text or an error message.
    """
    try:
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image)
        return text
    except Exception as e:
        return f"Error extracting text: {e}"
