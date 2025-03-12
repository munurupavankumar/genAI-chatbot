# File: backend/fastapi/main.py
from dotenv import load_dotenv
import os
import shutil
from pathlib import Path

# Load environment variables from the .env file in the backend directory
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import json
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import our service functions
from services.ocr import extract_text_from_image
from services.pdf_extraction import extract_text_from_pdf
from services.article_scraper import extract_text_from_url
from services.summarizer import azure_chatgpt_summarization  # New summarization service

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
    url: str = None        # URL to the content (if applicable)
    file_type: str = None  # Optional file type: "pdf", "image", etc.
    text: str = None       # Direct text input
    file_path: str = None  # Path to uploaded file (if applicable)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        logger.info(f"Received file upload: {file.filename}")
        
        # Create a safe filename to prevent path traversal attacks
        safe_filename = Path(file.filename).name
        file_path = os.path.join(ASSETS_DIR, safe_filename)
        
        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        logger.info(f"Saved file to: {file_path}")
        
        return {
            "file_path": file_path,
            "filename": safe_filename,
            "content_type": file.content_type
        }
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

@app.post("/summarize")
async def summarize(request: Request):
    # Log the raw request body for debugging
    body = await request.body()
    logger.info(f"Raw request body: {body}")
    
    try:
        # Parse the request body manually for debugging
        request_data = json.loads(body)
        logger.info(f"Parsed request data: {request_data}")
        
        # Validate using Pydantic model
        summarization_request = SummarizationRequest(**request_data)
        logger.info(f"Validated request: {summarization_request}")
        
        extracted_text = ""
        
        # Priority: if direct text is provided, use it.
        if summarization_request.text:
            extracted_text = summarization_request.text
            logger.info(f"Using direct text input: {summarization_request.text[:50]}...")
        # Next priority: check for a file path (from uploaded file)
        elif summarization_request.file_path:
            logger.info(f"Processing uploaded file: {summarization_request.file_path}")
            
            if summarization_request.file_type:
                logger.info(f"File type specified: {summarization_request.file_type}")
                if summarization_request.file_type.lower() == "pdf":
                    extracted_text = extract_text_from_pdf(summarization_request.file_path)
                elif summarization_request.file_type.lower() in ["image", "jpg", "png"]:
                    extracted_text = extract_text_from_image(summarization_request.file_path)
                else:
                    # For text files or other recognized formats
                    try:
                        with open(summarization_request.file_path, 'r', encoding='utf-8') as file:
                            extracted_text = file.read()
                    except Exception as e:
                        logger.error(f"Error reading file: {str(e)}")
                        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")
            else:
                # Try to guess file type from extension
                file_ext = os.path.splitext(summarization_request.file_path)[1].lower()
                if file_ext in ['.pdf']:
                    extracted_text = extract_text_from_pdf(summarization_request.file_path)
                elif file_ext in ['.jpg', '.jpeg', '.png', '.gif']:
                    extracted_text = extract_text_from_image(summarization_request.file_path)
                else:
                    # Default to trying to read as text
                    try:
                        with open(summarization_request.file_path, 'r', encoding='utf-8') as file:
                            extracted_text = file.read()
                    except Exception as e:
                        logger.error(f"Error reading file: {str(e)}")
                        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")
        # Last priority: check for URL
        elif summarization_request.url:
            logger.info(f"Processing URL: {summarization_request.url}")
            # Process based on file_type if provided.
            if summarization_request.file_type:
                logger.info(f"File type specified: {summarization_request.file_type}")
                if summarization_request.file_type.lower() == "pdf":
                    extracted_text = extract_text_from_pdf(summarization_request.url)
                elif summarization_request.file_type.lower() in ["image", "jpg", "png"]:
                    extracted_text = extract_text_from_image(summarization_request.url)
                else:
                    logger.info(f"Using article extraction for file type: {summarization_request.file_type}")
                    extracted_text = extract_text_from_url(summarization_request.url)
            else:
                logger.info("No file type provided, using article extraction")
                extracted_text = extract_text_from_url(summarization_request.url)
        else:
            error_msg = "Please provide either direct text, a file path, or a URL."
            logger.error(error_msg)
            raise HTTPException(status_code=400, detail=error_msg)
        
        # Use the Azure ChatGPT summarization service
        logger.info(f"Extracted text length: {len(extracted_text)}")
        summary = azure_chatgpt_summarization(extracted_text)
        logger.info(f"Generated summary: {summary[:50]}...")
        return {"summary": summary}
    
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid JSON: {str(e)}")
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)