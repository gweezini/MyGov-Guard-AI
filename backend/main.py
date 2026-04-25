from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Response
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from zhipu_service import process_document_workflow, generate_speech_audio
from ocr_service import extract_text_from_image

# Load environment variables from your .env file
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="MyGov-Guard AI Backend", version="1.1")

# Configure CORS to allow communication with React Native (Expo)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint to verify backend status."""
    return {"message": "MyGov-Guard AI Backend is running!"}

@app.get("/tts")
async def text_to_speech(text: str, language: str = "en"):
    """
    Receives text and returns high-quality MP3 audio content.
    Used by the mobile app for localized voice synthesis.
    """
    try:
        if not text:
            raise HTTPException(status_code=400, detail="Text parameter is required")
            
        print(f"🎙️ Generating TTS for language: {language}")
        audio_content = await generate_speech_audio(text, language)
        
        return Response(
            content=audio_content, 
            media_type="audio/mpeg",
            headers={"Content-Disposition": "attachment; filename=speech.mp3"}
        )
    except Exception as e:
        print(f"❌ TTS Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload")
async def upload_document(
    file: UploadFile = File(...), 
    language: str = Form("en") 
):
    """
    Receives images or PDFs, extracts text via OCR, and requests 
    a localized AI analysis based on the provided language.
    """
    try:
        # Step 1: Validate file type (Images and PDFs allowed)
        if not file.content_type.startswith("image/") and file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image or PDF.")
        
        # Step 2: Read file contents into memory
        contents = await file.read()
        file_size_kb = len(contents) / 1024
        
        # Log receiving details for debugging
        print(f"\n🚀 Received file: {file.filename} | Target Language: {language}")
        
        # Step 3: OCR Process - Extract text from the uploaded file
        extracted_text = await extract_text_from_image(contents, filename=file.filename)
        
        # Step 4: Handle cases where no text is detected (low quality image/blank doc)
        if not extracted_text or len(extracted_text.strip()) == 0:
            print("⚠️ No readable text found. Sending localized error tips.")
            
            # Localized error messages for the UI
            error_details = {
                "zh": {
                    "summary": "⚠️ 未发现可读文字。请确保上传的文档清晰可见。",
                    "steps": ["重新拍摄清晰的照片", "确保图片中有文字内容", "不要上传风景照或空白照片"]
                },
                "ms": {
                    "summary": "⚠️ Tiada teks dapat dibaca. Sila pastikan dokumen yang dimuat naik adalah jelas.",
                    "steps": ["Ambil gambar yang lebih jelas", "Pastikan terdapat teks dalam imej", "Jangan muat naik gambar kosong"]
                },
                "en": {
                    "summary": "⚠️ No readable text found. Please ensure you are uploading a clear document.",
                    "steps": ["Take a clearer photo", "Make sure there is text in the image", "Do not upload blank photos"]
                }
            }
            
            current_error = error_details.get(language, error_details["en"])
            
            return {
                "status": "success",
                "analysis": {
                    "status": "error",
                    "summary": current_error["summary"],
                    "steps": current_error["steps"]
                }
            }
        
        print(f"🤖 Text extracted. Requesting AI analysis in: {language}")
        
        # Step 5: Send text and language preference to the Zhipu AI Workflow
        # The 'language' parameter ensures the AI responds in English, Malay, or Chinese.
        analysis_result = await process_document_workflow(extracted_text, language)
        
        print("✅ AI Analysis Complete!")
        
        # Step 6: Return final localized result to mobile app
        return {
            "status": "success",
            "filename": file.filename,
            "size_kb": round(file_size_kb, 2),
            "analysis": analysis_result
        }
        
    except Exception as e:
        # Log backend crashes to terminal
        print(f"❌ Backend Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*50)
    print("API Ready. Docs: http://127.0.0.1:8000/docs")
    print("="*50 + "\n")
    # Auto-reload enabled for easier development
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)