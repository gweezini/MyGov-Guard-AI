import os
import json
from dotenv import load_dotenv
from google import genai
from google.cloud import texttospeech

# Load environment variables from .env
load_dotenv()

async def process_document_workflow(ocr_text: str, language: str = "en") -> dict:
    """
    Executes a scam analysis workflow using Google Vertex AI (Gemini).
    Handles scams, jargon simplification, and next steps.
    Strictly localized to output in the user's selected language.
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
    
    # Map language code to full name
    lang_map = {"zh": "Chinese", "ms": "Malay", "en": "English"}
    target_lang = lang_map.get(language, "English")

    # Prompt optimized for your Frontend UI
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

OUTPUT FORMAT (STRICT JSON ONLY):
{{
  "status": "safe | warning | scam",
  "summary": "[Provide your explanation here strictly in {target_lang} language]",
  "steps": ["[Step 1 in {target_lang}]", "[Step 2 in {target_lang}]"],
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
        
        # Multi-language Safety Net for connection errors
        error_msg = {
            "zh": "⚠️ 严重错误: 系统暂时离线。如果您怀疑遇到诈骗，请立即拨打 NSRC 997 热线。",
            "ms": "⚠️ Ralat Sistem: Sistem di luar talian. Jika anda mengesyaki penipuan, hubungi hotline NSRC 997 segera.",
            "en": "⚠️ System Error: System offline. If you suspect a scam, please call the NSRC 997 hotline immediately."
        }
        current_err = error_msg.get(language, error_msg["en"])
        
        return {
            "status": "error", 
            "summary": current_err,
            "steps": ["Please call the NSRC 997 hotline to verify any suspicious documents.", "Check your internet connection and try again."],
            "official_links": []
        }

async def generate_speech_audio(text: str, language: str = "en"):
    """
    Converts text to high-quality MP3 audio using Google Cloud TTS.
    Supports localized voices for English, Chinese, and Malay.
    """
    # Ensure GCP credentials are set
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "gcp-key.json"
    
    client = texttospeech.TextToSpeechClient()
    
    # Voice Mapping for MyGov-Guard localization
    voice_map = {
        "zh": "cmn-CN-Wavenet-A",
        "ms": "ms-MY-Wavenet-A",
        "en": "en-US-Wavenet-D"
    }
    
    lang_code_map = {
        "zh": "cmn-CN",
        "ms": "ms-MY",
        "en": "en-US"
    }
    
    synthesis_input = texttospeech.SynthesisInput(text=text)
    
    voice = texttospeech.VoiceSelectionParams(
        language_code=lang_code_map.get(language, "en-US"),
        name=voice_map.get(language, "en-US-Wavenet-D")
    )
    
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3,
        pitch=0.0,
        speaking_rate=0.9 # Slightly slower for clarity
    )
    
    # Call Google Cloud TTS API
    response = client.synthesize_speech(
        input=synthesis_input, 
        voice=voice, 
        audio_config=audio_config
    )
    
    return response.audio_content
