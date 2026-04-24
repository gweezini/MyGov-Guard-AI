import os
import json
from dotenv import load_dotenv
from openai import AsyncOpenAI

# Load environment variables
load_dotenv()

async def process_document_workflow(ocr_text: str) -> dict:
    """
    Executes a 3-stage workflow using Ilmu Console API (OpenAI compatible):
    Agent 1: Scam detection
    Agent 2: De-jargon translation
    Agent 3: Action generation
    
    Returns a structured JSON response containing:
    - status
    - simplified_text
    - next_steps
    """
    api_key = os.getenv("ZHIPUAI_API_KEY")
    if not api_key:
        raise ValueError("ZHIPUAI_API_KEY is not set in environment variables.")
        
    client = AsyncOpenAI(
        api_key=api_key,
        base_url="https://api.ilmu.ai/v1"
    )
    
    # We use the specific model from Ilmu Console
    model_name = "ilmu-glm-5.1" 
    
    # --- Optimized Single-Stage Workflow ---
    prompt = f"""You are an expert AI assistant that processes OCR text from documents or messages.
Please perform the following 3 tasks in order:
1. Scam Detection: Analyze the OCR text and determine if it is a scam/phishing attempt. Decide on a short status ('Safe', 'Warning: Potential Scam', 'Scam').
2. Translation: Translate any complex jargon or bureaucratic language into simple, easy-to-understand terms.
3. Action Generation: Generate a list of actionable next steps for the user based on the analysis.

You MUST output your final answer as a pure JSON object containing EXACTLY these three keys:
- "status": the short status string from task 1.
- "simplified_text": the translated simple text from task 2.
- "next_steps": a list of strings representing the actions to take from task 3.

Original OCR Text:
{ocr_text}

Output JSON only."""

    response = await client.chat.completions.create(
        model=model_name,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    
    final_output = response.choices[0].message.content
    
    try:
        if not final_output:
            raise ValueError("Empty response content from API")
            
        clean_output = final_output.strip()
        if clean_output.startswith("```json"):
            clean_output = clean_output[7:]
        if clean_output.endswith("```"):
            clean_output = clean_output[:-3]
            
        result_json = json.loads(clean_output.strip())
        return result_json
    except Exception as e:
        # Fallback if parsing fails or response is weird
        return {
            "status": "Error analyzing document",
            "simplified_text": "Could not simplify the text. Please review manually.",
            "next_steps": ["Ensure you are reading the document carefully.", "Contact support if the issue persists."]
        }
