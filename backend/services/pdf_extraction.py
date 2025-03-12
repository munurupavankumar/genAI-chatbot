# File: backend/services/pdf_extraction.py
import fitz  # PyMuPDF

def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract text from a PDF file using PyMuPDF.
    
    :param pdf_path: Path to the PDF file.
    :return: Extracted text or an error message.
    """
    text = ""
    try:
        doc = fitz.open(pdf_path)
        for page in doc:
            text += page.get_text()
        return text
    except Exception as e:
        return f"Error extracting PDF text: {e}"