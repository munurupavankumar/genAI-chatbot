import os
from dotenv import load_dotenv
import requests

def text_to_speech_telugu(text, speaker="manisha", pitch=0, pace=1, loudness=1, sample_rate=22050, language="te"):
    """
    Convert Telugu (or other supported language) text to speech using Sarvam TTS API.
    
    Args:
        text (str): Text to convert to speech.
        speaker (str, optional): Voice speaker name. Defaults to "manisha".
        pitch (int, optional): Voice pitch. Defaults to 0.
        pace (float, optional): Speech pace. Defaults to 1.
        loudness (float, optional): Audio loudness. Defaults to 1.
        sample_rate (int, optional): Speech sample rate. Defaults to 22050.
        language (str, optional): Two-letter language code. Allowed values:
            'en': English,
            'hi': Hindi,
            'te': Telugu,
            'ta': Tamil,
            'bn': Bengali,
            'mr': Marathi,
            'gu': Gujarati,
            'kn': Kannada,
            'ml': Malayalam,
            'pa': Punjabi.
            Defaults to "te".
    
    Returns:
        str: Base64 encoded audio string
    """
    # Load environment variables
    load_dotenv()
    
    # Get API key from environment variables
    api_key = os.getenv("api-subscription-key")
    
    # Check and split text into chunks of max 500 words and total max 1500 words (3 chunks)
    words = text.split()
    total_words = len(words)
    max_total_words = 1500
    chunk_size = 500
    if total_words > max_total_words:
        raise ValueError(f"Text exceeds maximum allowed {max_total_words} words (received {total_words} words)")
    
    inputs = []
    for i in range(0, total_words, chunk_size):
        chunk = " ".join(words[i: i + chunk_size])
        inputs.append(chunk)
    
    # Validate the language parameter against allowed options
    allowed_languages = {
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
    if language not in allowed_languages:
        raise ValueError(f"Language '{language}' is not supported. Allowed languages: {list(allowed_languages.keys())}")
    
    # Construct target_language_code using the provided language code (e.g., "te-IN")
    target_language_code = f"{language}-IN"
    
    # API endpoint
    url = "https://api.sarvam.ai/text-to-speech"
    
    # Payload configuration
    payload = {
        "speaker": speaker,
        "pitch": pitch,
        "pace": pace,
        "loudness": loudness,
        "speech_sample_rate": sample_rate,
        "enable_preprocessing": True,
        "target_language_code": target_language_code,
        "model": "bulbul:v2",
        "inputs": inputs,
    }
    
    # Headers
    headers = {
        "api-subscription-key": api_key,
        "Content-Type": "application/json"
    }
    
    # Make API request
    response = requests.post(url, json=payload, headers=headers)
    response.raise_for_status()  # Raise an error for non-200 responses
    
    # Parse response and return base64 encoded audio string (first audio chunk)
    response_data = response.json()
    return response_data["audios"][0]

