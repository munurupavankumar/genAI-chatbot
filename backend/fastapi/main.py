# File: backend/fastapi/main.py
from fastapi import FastAPI, HTTPException, Request
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

app = FastAPI(title="Summarization API")

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SummarizationRequest(BaseModel):
    url: str = None        # URL to the content (if applicable)
    file_type: str = None  # Optional file type: "pdf", "image", etc.
    text: str = None       # Direct text input

def simulate_summarization(text: str) -> str:
    """
    Simulate a summarization process.
    In a real implementation, you would integrate with a model (e.g., Azure-hosted ChatGPT).
    """
    if not text:
        return "No text available for summarization."
    # Return the first 200 characters as a 'summary'
    return f"Summary: {text[:200]}..."

@app.post("/summarize")
async def summarize(request: Request):
    # Log the raw request body for debugging
    body = await request.body()
    logger.info(f"Raw request body: {body}")
    
    try:
        # Parse the request body manually for debugging
        request_data = json.loads(body)
        logger.info(f"Parsed request data: {request_data}")
        
        # Now validate using Pydantic model
        summarization_request = SummarizationRequest(**request_data)
        
        # Log validated request
        logger.info(f"Validated request: {summarization_request}")
        
        extracted_text = ""
        
        # Priority: if direct text is provided, use it.
        if summarization_request.text:
            extracted_text = summarization_request.text
            logger.info(f"Using direct text input: {summarization_request.text[:50]}...")
        elif summarization_request.url:
            logger.info(f"Processing URL: {summarization_request.url}")
            # Process based on file_type if provided.
            if summarization_request.file_type:
                logger.info(f"File type specified: {summarization_request.file_type}")
                if summarization_request.file_type.lower() == "pdf":
                    # Note: In real scenarios, you'll likely need to download the PDF locally.
                    extracted_text = extract_text_from_pdf(summarization_request.url)
                elif summarization_request.file_type.lower() in ["image", "jpg", "png"]:
                    # Similarly, ensure the image is accessible locally or downloaded.
                    extracted_text = extract_text_from_image(summarization_request.url)
                else:
                    # Unknown file type; attempt article extraction as a fallback.
                    logger.info(f"Using article extraction for file type: {summarization_request.file_type}")
                    extracted_text = extract_text_from_url(summarization_request.url)
            else:
                # If no file type is provided, assume it's an article URL.
                logger.info("No file type provided, using article extraction")
                extracted_text = extract_text_from_url(summarization_request.url)
        else:
            error_msg = "Please provide either direct text or a URL."
            logger.error(error_msg)
            raise HTTPException(status_code=400, detail=error_msg)
        
        # Simulate summarization (replace with actual model integration later)
        logger.info(f"Extracted text length: {len(extracted_text)}")
        summary = simulate_summarization(extracted_text)
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