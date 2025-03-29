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
        list: Array of Base64 encoded audio strings for all chunks
    """
    # Load environment variables
    load_dotenv()
    
    # Get API key from environment variables
    api_key = os.getenv("api-subscription-key")
    
    # Max characters per chunk (API limit)
    max_chunk_chars = 500
    
    # Split text into chunks of max_chunk_chars characters
    inputs = []
    for i in range(0, len(text), max_chunk_chars):
        chunk = text[i:i + max_chunk_chars]
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
    
    # Process in batches of 3 chunks per API call (max allowed by Sarvam API)
    all_audio_chunks = []
    batch_size = 3  # Maximum chunks per API call for Sarvam API
    
    for i in range(0, len(inputs), batch_size):
        batch_inputs = inputs[i:i + batch_size]
        
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
            "inputs": batch_inputs,
        }
        
        # Headers
        headers = {
            "api-subscription-key": api_key,
            "Content-Type": "application/json"
        }
        
        # Make API request
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()  # Raise an error for non-200 responses
        
        # Parse response and add audio chunks to our collection
        response_data = response.json()
        
        # The API returns an array of audio chunks in the "audios" field
        if "audios" in response_data and isinstance(response_data["audios"], list):
            all_audio_chunks.extend(response_data["audios"])
        else:
            print(f"Warning: Unexpected API response format: {response_data}")
    
    # Always return the array of audio chunks, even if there's only one
    # This ensures consistent handling in the frontend
    return all_audio_chunks