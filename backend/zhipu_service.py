import os
import json
from dotenv import load_dotenv
from openai import AsyncOpenAI

# Load environment variables from .env
load_dotenv()

async def process_document_workflow(ocr_text: str) -> dict:
    """
    Executes a 3-stage scam analysis workflow using Ilmu AI.
    1. Detects Scams 2. Simplifies Jargon 3. Generates Action Steps.
    """
    api_key = os.getenv("ZHIPUAI_API_KEY")
    if not api_key:
        raise ValueError("ZHIPUAI_API_KEY is not set in environment variables.")
        
    # Use OpenAI client to communicate with Ilmu AI's compatible endpoint
    client = AsyncOpenAI(
        api_key=api_key,
        base_url="https://api.ilmu.ai/v1"
    )
    
    # Specific model provided by the hackathon
    model_name = "ilmu-glm-5.1" 
    
    # Optimized prompt to ensure the AI returns the exact JSON keys we need
    prompt = f"""You are 'MyGov-Guard AI', an expert in Malaysian legal and government documents.
Task:
1. Scam Detection: Check for suspicious links, threats, or unofficial language.
2. Translation: Explain the document in very simple English/Malay (no jargon).
3. Actions: Provide clear steps for the user and official government links.

Output Requirements:
- You MUST return a PURE JSON object.
- 'status': strictly use "scam", "safe", or "warning".
- 'summary': a clear, simplified explanation of the document.
- 'steps': a list of next steps for the user.
- 'official_links': a list of safe URLs for verification.

Text to analyze:
{ocr_text}
"""

    try:
        # Call the AI model
        response = await client.chat.completions.create(
            model=model_name,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        final_output = response.choices[0].message.content
        
        # Clean up any potential markdown formatting from AI response
        clean_output = final_output.strip()
        if clean_output.startswith("```json"):
            clean_output = clean_output[7:]
        if clean_output.endswith("```"):
            clean_output = clean_output[:-3]
            
        return json.loads(clean_output.strip())
        
    except Exception as e:
        # Fallback mechanism: prevents the backend from crashing during 504 Timeout or API errors
        print(f"❌ AI Service Error: {str(e)}")
        return {
            "status": "error", 
            "summary": "⚠️ AI Processing Timeout. The document might be too long or the server is busy.",
            "steps": ["Try taking a screenshot of just the important part.", "Ensure your internet connection is stable."],
            "official_links": []
        }