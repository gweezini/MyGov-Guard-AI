from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from zhipu_service import process_document_workflow
from ocr_service import extract_text_from_image

# Load the secrets from your .env file
load_dotenv()

# Initialize FastAPI
app = FastAPI(title="MyGov-Guard AI Backend", version="1.0")

# Setup CORS so your React Native frontend can communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, change this to your specific frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "MyGov-Guard AI Backend is running!"}

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Receives an image or PDF document from the mobile app.
    It reads the file, extracts the text using OCR, and sends it to Zhipu AI.
    """
    try:
        # 1. Validate file type (Now accepts BOTH images and PDFs!)
        if not file.content_type.startswith("image/") and file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image or PDF.")
        
        # 2. Read file contents into memory
        contents = await file.read()
        file_size_kb = len(contents) / 1024
        
        # TODO: Step 1 - Upload to AWS S3 (Temporary Storage)
        # TODO: Step 3 - Regex masking for PII 
        
        # --- EXTRACT OCR TEXT ---
        print(f"\n🚀 Processing new upload: {file.filename}")
        
        # 3. ⚡ THE MAGIC FIX: We pass 'file.filename' to the OCR service 
        # so it knows whether to use Tesseract (for images) or Poppler (for PDFs).
        extracted_text = await extract_text_from_image(contents, filename=file.filename)
        
        if not extracted_text:
            raise HTTPException(status_code=400, detail="No text could be extracted from the document. Please try a clearer image.")
        
        # --- ZHIPU AI WORKFLOW ---
        print("🤖 Text extracted successfully! Sending to Zhipu AI...")
        
        # 4. Call your custom 3-stage GLM-4 workflow from zhipu_service.py
        analysis_result = await process_document_workflow(extracted_text)
        
        print("✅ AI Analysis Complete!")
        
        return {
            "status": "success",
            "filename": file.filename,
            "size_kb": round(file_size_kb, 2),
            "analysis": analysis_result
        }
        
    except Exception as e:
        print(f"❌ Backend Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Print a helpful, clickable link for the developer
    print("\n" + "="*50)
    print("🚀 API Docs available at: http://127.0.0.1:8000/docs")
    print("="*50 + "\n")
    # Runs the server on port 8000 (0.0.0.0 allows mobile app to connect via Wi-Fi)
    # Note: Because reload=True is set, simply saving this file should restart the server automatically!
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)