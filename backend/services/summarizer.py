# File: backend/services/summarizer.py
import os
from openai import OpenAI

def azure_chatgpt_summarization(text: str) -> str:
    """
    Uses the GitHub-Azure ChatGPT model to summarize the input text.
    Requires the environment variable GITHUB_TOKEN to be set.
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
    
    # Build the messages for a summarization prompt
    response = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant that summarizes texts succinctly.",
            },
            {
                "role": "user",
                "content": f"Please summarize the following text:\n\n{text}",
            }
        ],
        temperature=1.0,
        top_p=1.0,
        max_tokens=1000,
        model=model_name
    )
    
    # Extract and return the summary from the response
    summary = response.choices[0].message.content
    return summary
