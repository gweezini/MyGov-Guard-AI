import os
import json
from dotenv import load_dotenv
from google import genai

# Load environment variables from .env
load_dotenv()

async def process_document_workflow(ocr_text: str) -> dict:
    """
    Executes a scam analysis workflow using Google Vertex AI (Gemini).
    Handles scams, jargon simplification, and next steps.
    """
    # 1. Setup Authentication for Vertex AI using your JSON key
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "gcp-key.json"
    
    # 2. Initialize the Google GenAI Client
    client = genai.Client(
        vertexai=True,
        project="mygovguard",
        location="us-central1"
    )
    
    # The official Gemini model on Vertex AI (Found via scan)
    model_name = "gemini-2.5-flash" 
    
    # Prompt optimized for your Frontend UI
    prompt = f"""
You are "MyGov-Guard AI", a Malaysian scam detection system.

Your task is to analyze the text and classify it using a scoring system.

SCAM DETECTION RULES:

Assign a risk score:

+2 points:
- Requests payment to a personal bank account
- Threatens arrest, legal action, or urgency (e.g. "act now", "final warning")

+1 point:
- Grammar mistakes or unnatural language
- Uses unofficial email domains (e.g. @gmail.com, @yahoo.com)
- Requests sensitive information (OTP, password, IC number, bank details)

CLASSIFICATION:
- Score >= 3 -> "scam"
- Score = 2 -> "warning"
- Score <= 1 -> "safe"

IMPORTANT:
- You MUST strictly follow the scoring rules
- Do NOT randomly guess
- If unsure, choose "warning"

OUTPUT FORMAT (STRICT JSON ONLY):
{{
  "status": "safe | warning | scam",
  "summary": "Explain in simple English why it is classified this way",
  "steps": ["Clear action 1", "Clear action 2"],
  "official_links": []
}}

Text:
{ocr_text}
"""

    try:
        # 3. Call Gemini on Vertex AI (Async)
        response = await client.aio.models.generate_content(
            model=model_name,
            contents=prompt,
            config={
                'response_mime_type': 'application/json',
                'temperature': 0.0
            }
        )
        
        # 4. Parse the JSON response
        return json.loads(response.text)
        
    except Exception as e:
        # THE SAFETY NET: Returns "error" status to fix the UI bug
        print(f"AI Error: {str(e)}")
        return {
            "status": "error", 
            "summary": "Network Timeout: The AI server is too busy. PDF might be too long.",
            "steps": ["Try a shorter screenshot instead of a full PDF.", "Check your phone hotspot connection."],
            "official_links": []
        }