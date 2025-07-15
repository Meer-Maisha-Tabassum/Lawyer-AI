import os
import google.generativeai as genai
import spacy
import re
import json
import random
import datetime
from firebase_admin import firestore

# --- CONFIGURATION ---
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Load spaCy model
nlp = spacy.load("en_core_web_sm")

# --- A/B TESTING SETUP ---
AB_TEST_ENABLED = os.getenv("AB_TEST_ENABLED", "False").lower() == "true"
MODEL_A_NAME = os.getenv("MODEL_A_NAME", "gemini-1.5-flash-latest")
MODEL_B_NAME = os.getenv("MODEL_B_NAME", "gemini-1.5-pro-latest")
MODEL_B_TRAFFIC_PERCENTAGE = int(os.getenv("MODEL_B_TRAFFIC_PERCENTAGE", "0"))

# Initialize models for A/B testing
model_a = genai.GenerativeModel(MODEL_A_NAME)
model_b = genai.GenerativeModel(MODEL_B_NAME) if AB_TEST_ENABLED else None

# Initialize Firestore client for logging
db = firestore.client()

# --- HELPER FUNCTIONS ---
def extract_json(text: str) -> str | None:
    """
    Extracts a JSON string from a larger text.
    It looks for JSON blocks enclosed in ```json...``` or standalone JSON objects/arrays.
    """
    json_regex = r"```json\s*([\s\S]*?)\s*```|(\[[\s\S]*\]|\{[\s\S]*\})[^`]*$"
    match = re.search(json_regex, text, re.MULTILINE | re.DOTALL)
    if match:
        # Prioritize content within ```json block, then standalone JSON
        if match.group(1):
            return match.group(1)
        elif match.group(2):
            return match.group(2)
    return None

async def _log_ab_test_event(user_id: str, prompt: str, chosen_model_name: str, response_text: str):
    """Logs the A/B test interaction to Firestore."""
    try:
        log_ref = db.collection('ab_test_logs').document()
        log_data = {
            "user_id": user_id,
            "timestamp": datetime.datetime.now(datetime.timezone.utc),
            "prompt_hash": hash(prompt), # Hash prompt to avoid storing PII
            "chosen_model": chosen_model_name,
            "response_length": len(response_text),
            "was_successful": not response_text.startswith("Error:")
        }
        await log_ref.set(log_data)
        print(f"A/B test event logged for user {user_id} with model {chosen_model_name}")
    except Exception as e:
        print(f"Error logging A/B test event: {e}")


async def get_gemini_response(prompt: str, user_id: str) -> str:
    """
    Generic function to call the Gemini API.
    Includes A/B testing logic to select between two models.
    """
    chosen_model = model_a
    chosen_model_name = MODEL_A_NAME
    
    # A/B Testing Logic
    if AB_TEST_ENABLED and random.randint(1, 100) <= MODEL_B_TRAFFIC_PERCENTAGE:
        chosen_model = model_b
        chosen_model_name = MODEL_B_NAME
        
    try:
        response = await chosen_model.generate_content_async(prompt)
        response_text = response.text
    except Exception as e:
        print(f"Error calling Gemini API ({chosen_model_name}): {e}")
        response_text = f"Error: Could not get a response from model {chosen_model_name}. Details: {e}"

    # Log the event if A/B testing is enabled
    if AB_TEST_ENABLED:
        await _log_ab_test_event(user_id, prompt, chosen_model_name, response_text)
        
    return response_text

def perform_ner_with_spacy(text: str) -> list[dict]:
    """
    Performs Named Entity Recognition and returns a list of UNIQUE entities.
    Entities are considered unique if their text and label are the same.
    """
    doc = nlp(text)
    unique_entities = {} # Use a dictionary to store unique entities based on (text, label) key
    
    allowed_labels = {"PERSON", "ORG", "GPE", "DATE"}

    # Process spaCy entities
    for ent in doc.ents:
        if ent.label_ in allowed_labels:
            # Create a unique key for the entity (text and label combined)
            key = (ent.text, ent.label_)
            unique_entities[key] = {"text": ent.text, "label": ent.label_}
            
    # Process custom LAW entities via regex
    law_pattern = r"\b(the\s+)?([A-Z][a-zA-Z\s]+Act\s+of\s+\d{4})\b"
    for match in re.finditer(law_pattern, text):
        law_text = match.group(2)
        key = (law_text, "LAW")
        unique_entities[key] = {"text": law_text, "label": "LAW"}
            
    # Convert the dictionary values back to a list of unique entities
    return list(unique_entities.values())

async def process_document_analysis(text: str, user_id: str, question: str | None) -> dict:
    """Handles the full document analysis pipeline."""
    results = {}

    summary_prompt = "Generate a concise, professional legal summary..." + text
    results['summary'] = await get_gemini_response(summary_prompt, user_id)

    clauses_prompt = "Analyze the following legal document and extract key clauses. Provide the output as a JSON array where each object has a 'clause_type' and 'clause_text' field. Example: ```json\n[\n  {\"clause_type\": \"Definitions\", \"clause_text\": \"...\"}\n]\n```\nDocument:\n" + text
    clauses_str = await get_gemini_response(clauses_prompt, user_id)
    clauses_json_str = extract_json(clauses_str)
    try:
        results['clauses'] = json.loads(clauses_json_str) if clauses_json_str else []
    except json.JSONDecodeError:
        results['clauses'] = [{"clause_type": "Parsing Error", "clause_text": f"Invalid JSON. Raw: {clauses_str}"}]

    # This call will now return distinct entities based on (text, label)
    results['entities'] = perform_ner_with_spacy(text) 

    if question:
        qa_prompt = f"Based *only* on the document, answer: '{question}'\n---\n{text}"
        results['answer'] = await get_gemini_response(qa_prompt, user_id)

    return results

async def generate_event_timeline(text: str, user_id: str) -> dict:
    """
    Extracts a chronological sequence of key events and a short summary from the given text.
    The prompt is enhanced to explicitly ask for a JSON object containing both a summary and an array of events.
    """
    prompt = f"""
    From the provided text, perform two tasks:
    1.  Generate a concise, 1-2 sentence summary of the overall timeline or sequence of events described.
    2.  Extract a chronological sequence of key events. Each event should include a 'date' (if explicitly mentioned or clearly implied), 
        a 'title' (a brief description of the event), and a 'description' (more details about the event).
        If a specific date is not available, use a general time reference (e.g., "early period", "later that year").
        
    Provide the output as a single JSON object with two keys:
    -   `summary`: A string containing the concise timeline summary.
    -   `events`: An array of event objects.
    
    Example JSON structure:
    ```json
    {{
      "summary": "This document outlines the key developments of [topic] from [start date] to [end date], highlighting major milestones.",
      "events": [
        {{
          "date": "YYYY-MM-DD",
          "title": "Brief event title",
          "description": "Detailed description of the event."
        }},
        {{
          "date": "YYYY-MM-DD",
          "title": "Another event",
          "description": "More details about the second event."
        }}
      ]
    }}
    ```
    
    If no events can be extracted, the 'events' array should be empty `[]`, and the 'summary' should state that no significant timeline could be extracted.
    
    Document Text:
    {text}
    """
    
    response_str = await get_gemini_response(prompt, user_id)
    timeline_json_str = extract_json(response_str)
    
    try:
        # Attempt to parse the extracted JSON
        parsed_timeline_data = json.loads(timeline_json_str) if timeline_json_str else {}
        
        # Validate that it's a dictionary and contains the expected keys
        if not isinstance(parsed_timeline_data, dict) or "summary" not in parsed_timeline_data or "events" not in parsed_timeline_data:
            print(f"Warning: Model returned unexpected JSON structure for timeline. Raw: {response_str}")
            # Fallback to a default error structure or an empty one if parsing failed
            return {
                "error": "Model did not return the expected JSON structure for timeline.",
                "raw": response_str,
                "timeline_summary": "Could not generate timeline summary.",
                "timeline_events": []
            }
        
        # Ensure 'events' is a list
        if not isinstance(parsed_timeline_data.get("events"), list):
             print(f"Warning: 'events' key is not a list in timeline JSON. Raw: {response_str}")
             parsed_timeline_data["events"] = [] # Ensure it's an empty list if not
             
        return {
            "timeline_summary": parsed_timeline_data.get("summary", "No summary provided."),
            "timeline_events": parsed_timeline_data.get("events", [])
        }
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error in timeline: {e}. Raw response: {response_str}")
        return {
            "error": "Failed to parse timeline JSON from model response.",
            "raw": response_str,
            "decode_error": str(e),
            "timeline_summary": "Failed to generate timeline summary due to parsing error.",
            "timeline_events": []
        }
    except Exception as e:
        print(f"Unexpected error in timeline generation: {e}. Raw response: {response_str}")
        return {
            "error": f"An unexpected error occurred: {str(e)}",
            "raw": response_str,
            "timeline_summary": "An error occurred while generating the timeline summary.",
            "timeline_events": []
        }
