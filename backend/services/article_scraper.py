# File: backend/services/article_scraper.py
import requests
from bs4 import BeautifulSoup

def extract_text_from_url(url: str) -> str:
    """
    Fetch the content of a web article and extract the main text.
    
    :param url: URL of the article.
    :return: Extracted article text or an error message.
    """
    try:
        response = requests.get(url)
        if response.status_code != 200:
            return f"Error fetching the article: {response.status_code}"
        soup = BeautifulSoup(response.text, 'html.parser')
        # Extract text from all <p> tags as a simple heuristic
        paragraphs = soup.find_all('p')
        article_text = "\n".join([p.get_text() for p in paragraphs])
        return article_text
    except Exception as e:
        return f"Error extracting text from URL: {e}"
