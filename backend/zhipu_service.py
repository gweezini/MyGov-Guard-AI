import os
import json
from dotenv import load_dotenv
from openai import AsyncOpenAI

# Load environment variables from .env
load_dotenv()

async def process_document_workflow(ocr_text: str, language: str = "en") -> dict:
    """
    Executes a scam analysis workflow using Ilmu AI.
    Strictly localized to output in the user's selected language.
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

    # Map language code to full name
    lang_map = {"zh": "Chinese", "ms": "Malay", "en": "English"}
    target_lang = lang_map.get(language, "English")
    
    prompt = f"""
You are "MyGov-Guard AI", a Malaysian scam detection system.

# MANDATORY REQUIREMENT:
- All text in the "summary" and "steps" fields MUST be written strictly in {target_lang}.
- DO NOT use English if the requested language is {target_lang}.

SCAM DETECTION RULES:

Assign a risk score:

+2 points:
- Requests payment to a personal bank account

+1 point:
- Threatens urgency or legal action
- Grammar mistakes or unnatural language
- Uses unofficial email domains
- Requests sensitive information (OTP, password, IC, bank details)

-1 point:
- Contains official Malaysian agency names (LHDN, JPJ, KWSP, TNB)

-2 points:
- Contains official government domains (e.g. .gov.my)

CLASSIFICATION:
- Score ≥ 4 → "scam"
- Score = 2 or3 → "warning"
- Score ≤ 1 → "safe"

# OUTPUT FORMAT (STRICT JSON ONLY):
{{
  "status": "safe | warning | scam",
  "summary": "[Provide your explanation here strictly in {target_lang} language]",
  "steps": ["[Step 1 in {target_lang}]", "[Step 2 in {target_lang}]"],
  "official_links": []
}}

# TEXT TO ANALYZE:
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
        # Clean any potential markdown formatting
        clean_output = final_output.strip().replace("```json", "").replace("```", "")
        return json.loads(clean_output)
        
    except Exception as e:
        # Multi-language Safety Net for connection errors
        error_msg = {
            "zh": "⚠️ 网络超时: AI 服务器忙。请尝试更清晰的截图。",
            "ms": "⚠️ Talian tamat: Pelayan AI sibuk. Sila cuba tangkapan skrin yang lebih jelas.",
            "en": "⚠️ Network Timeout: AI server is busy. Try a clearer screenshot."
        }
        current_err = error_msg.get(language, error_msg["en"])
        
        print(f"❌ AI Error: {str(e)}")
        return {
            "status": "error", 
            "summary": current_err,
            "steps": ["Try again later"],
            "official_links": []
        }