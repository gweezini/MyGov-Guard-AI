import os
import json
from dotenv import load_dotenv
from openai import AsyncOpenAI

# Load environment variables from .env
load_dotenv()

async def process_document_workflow(ocr_text: str) -> dict:
    """
    Executes a scam analysis workflow using Ilmu AI.
    Handles scams, jargon simplification, and next steps.
    """
    api_key = os.getenv("ZHIPUAI_API_KEY")
    if not api_key:
        raise ValueError("ZHIPUAI_API_KEY is not set in environment variables.")
        
    # Use OpenAI client format to talk to Ilmu AI
    client = AsyncOpenAI(
        api_key=api_key,
        base_url="https://api.ilmu.ai/v1"
    )
    
    # The official hackathon model
    model_name = "ilmu-glm-5.1" 
    
    # Prompt optimized for your Frontend UI
    prompt = f"""You are 'MyGov-Guard AI', a Malaysian document expert.
Analyze the following text for:
1. Scam Detection: Identity threats or fake info.
2. Translation: Use simple daily language.
3. Actions: Clear steps and official links.

IMPORTANT:
- You MUST provide the "summary" and "steps" in English ONLY.
- Even if the input text is in Malay, your response MUST be in English.

Return ONLY a JSON object:
- "status": use "scam", "safe", or "warning".
- "summary": simple explanation.
- "steps": list of actions.
- "official_links": list of URLs.

Text:
{ocr_text}
"""

    try:
        response = await client.chat.completions.create(
            model=model_name,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.0
        )
        
        final_output = response.choices[0].message.content
        clean_output = final_output.strip().replace("```json", "").replace("```", "")
        return json.loads(clean_output)
        
    except Exception as e:
        # 🚨 THE SAFETY NET: Returns "error" status to fix the UI bug
        print(f"❌ AI Error: {str(e)}")
        return {
            "status": "error", 
            "summary": "⚠️ Network Timeout: The AI server (ilmu.ai) is too busy. PDF might be too long.",
            "steps": ["Try a shorter screenshot instead of a full PDF.", "Check your phone hotspot connection."],
            "official_links": []
        }