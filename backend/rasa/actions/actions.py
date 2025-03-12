# File: backend/rasa/actions/actions.py
import requests
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet

class ActionSummarize(Action):
    def name(self) -> Text:
        return "action_summarize"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]
    ) -> List[Dict[Text, Any]]:
        # Retrieve slots
        text_input = tracker.get_slot("text")
        url = tracker.get_slot("url")
        file_type = tracker.get_slot("file_type")

        # Build the payload for the FastAPI endpoint
        payload = {}
        if text_input:
            payload["text"] = text_input
        elif url:
            payload["url"] = url
            if file_type:
                payload["file_type"] = file_type
        else:
            dispatcher.utter_message(text="No content provided for summarization. Please provide text or a URL.")
            return []

        # Call the FastAPI summarization endpoint
        try:
            response = requests.post("http://localhost:8000/summarize", json=payload)
            if response.status_code == 200:
                summary = response.json().get("summary", "No summary returned.")
                dispatcher.utter_message(text=summary)
            else:
                dispatcher.utter_message(text=f"Error summarizing content: {response.text}")
        except Exception as e:
            dispatcher.utter_message(text=f"Error connecting to the summarization service: {e}")

        # Clear slots after summarization
        return [SlotSet("text", None), SlotSet("url", None), SlotSet("file_type", None)]
