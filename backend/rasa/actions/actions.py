from typing import Any, Text, Dict, List

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet

class ActionSummarize(Action):
    def name(self) -> Text:
        return "action_summarize"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Get the URL from slot if available
        url = tracker.get_slot("url")
        file_type = tracker.get_slot("file_type")
        
        # If we don't have a URL yet, ask for it
        if not url:
            dispatcher.utter_message(text="Please provide a URL to the content you want me to summarize.")
            return []
        
        # In a real implementation, you would:
        # 1. Fetch content from the URL
        # 2. Process it based on file_type if provided
        # 3. Use an NLP library or API to generate a summary
        
        # For now, just acknowledge we received the URL
        response = f"I received your request to summarize content from: {url}"
        if file_type:
            response += f" (file type: {file_type})"
        
        response += "\n\nHere's a simulated summary: This article discusses important developments in technology and their implications for society."
        
        dispatcher.utter_message(text=response)
        
        # Clear slots for next conversation
        return [SlotSet("url", None), SlotSet("file_type", None)]