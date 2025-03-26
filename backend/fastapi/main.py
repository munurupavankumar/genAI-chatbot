# File: backend/fastapi/main.py
from dotenv import load_dotenv
import os
import shutil
from pathlib import Path

# Load environment variables from the .env file in the backend directory
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

from fastapi import FastAPI, HTTPException, Request, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import our service functions
from services.pdf_extraction import extract_text_from_pdf
from services.article_scraper import extract_text_from_url
from services.summarizer import azure_chatgpt_summarization, extract_and_summarize_image

app = FastAPI(title="Summarization API")

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create assets directory if it doesn't exist
ASSETS_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets')
os.makedirs(ASSETS_DIR, exist_ok=True)
logger.info(f"Assets directory: {ASSETS_DIR}")

class SummarizationRequest(BaseModel):
    url: Optional[str] = None        # URL to the content (if applicable)
    file_type: Optional[str] = None  # Optional file type: "pdf", "image", etc.
    text: Optional[str] = None       # Direct text input
    file_path: Optional[str] = None  # Path to uploaded file (if applicable)
    language: Optional[str] = "te"   # Language code, default to English

def detect_file_type(filename):
    """Detect file type based on extension"""
    extension = os.path.splitext(filename)[1].lower().strip('.')
    if extension in ['pdf']:
        return 'pdf'
    elif extension in ['jpg', 'jpeg', 'png', 'gif']:
        return 'image'
    elif extension in ['txt', 'md', 'markdown']:
        return 'text'
    return ''

@app.post("/upload_and_summarize")
async def upload_and_summarize(
    file: UploadFile = File(...), 
    file_type: Optional[str] = Form(None),
    language: Optional[str] = Form("te")
):
    try:
        logger.info(f"Received file upload for immediate summarization: {file.filename} (language: {language})")
        # Save the file
        safe_filename = Path(file.filename).name
        file_path = os.path.join(ASSETS_DIR, safe_filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        logger.info(f"Saved file to: {file_path}")

        # Determine file type if not provided
        if not file_type:
            file_type = detect_file_type(safe_filename)

        # Process based on file type
        if file_type.lower() in ["image", "jpg", "jpeg", "png", "gif"]:
            # For images, use the combined extract and summarize function
            result = extract_and_summarize_image(file_path, language)
            logger.info(f"Generated summary from image: {result['summary'][:50]}...")
        else:
            # Extract text from other file types
            extracted_text = await extract_text_from_file(file_path, file_type)
            # Generate summary
            result = azure_chatgpt_summarization(extracted_text, language)
            logger.info(f"Generated summary: {result['summary'][:50]}...")
        
        return {
            "summary": result['summary'], 
            "audio": result['audio'],
            "file_path": file_path, 
            "filename": safe_filename, 
            "content_type": file.content_type
        }
    except Exception as e:
        logger.error(f"Error in upload_and_summarize: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Upload and summarization failed: {str(e)}")

async def extract_text_from_file(file_path, file_type=None):
    """Extract text from a file based on its type"""
    try:
        # Determine file type if not provided
        if not file_type:
            file_type = detect_file_type(file_path)
        
        logger.info(f"Extracting text from file: {file_path} (type: {file_type})")
        
        # Extract text based on file type
        if file_type.lower() == "pdf":
            return extract_text_from_pdf(file_path)
        elif file_type.lower() in ["image", "jpg", "jpeg", "png", "gif"]:
            # We use the combined function for images
            logger.info("Using combined extract_and_summarize_image function")
            result = extract_and_summarize_image(file_path)
            return result['summary']
        else:  # Default to text file
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            except UnicodeDecodeError:
                # Try again with a different encoding if UTF-8 fails
                with open(file_path, 'r', encoding='latin-1') as f:
                    return f.read()
    except Exception as e:
        logger.error(f"Error extracting text from file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error extracting text from file: {str(e)}")

@app.post("/summarize")
async def summarize(request: SummarizationRequest):
    try:
        logger.info(f"Summarization request: {request}")
        extracted_text = ""
        
        # Extract text based on input type
        if request.text:
            extracted_text = request.text
            logger.info(f"Using direct text input: {request.text[:50]}...")
        elif request.file_path:
            # Check if it's an image file
            if request.file_type and request.file_type.lower() in ["image", "jpg", "jpeg", "png", "gif"]:
                # Use the combined extract and summarize function for images
                result = extract_and_summarize_image(request.file_path, request.language)
                return {
                    "summary": result['summary'],
                    "audio": result['audio']
                }
            else:
                extracted_text = await extract_text_from_file(request.file_path, request.file_type)
        elif request.url:
            logger.info(f"Processing URL: {request.url}")
            if request.file_type and request.file_type.lower() == "pdf":
                extracted_text = extract_text_from_pdf(request.url)
            elif request.file_type and request.file_type.lower() in ["image", "jpg", "png"]:
                # We would need to download the image first to use our combined function
                return {"error": "Direct image URL summarization not supported yet"}
            else:
                extracted_text = extract_text_from_url(request.url)
        else:
            error_msg = "Please provide either direct text, a file path, or a URL."
            logger.error(error_msg)
            raise HTTPException(status_code=400, detail=error_msg)
        
        logger.info(f"Extracted text length: {len(extracted_text)}")
        
        # Only summarize if we haven't already (for images)
        if not extracted_text.startswith("Error"):
            # Summarize and get TTS
            result = azure_chatgpt_summarization(extracted_text, request.language)
            logger.info(f"Generated summary: {result['summary'][:50]}...")
            return {
                "summary": result['summary'],
                "audio": result['audio']
            }
        else:
            return {"error": extracted_text}
    
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)