from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from zhipu_service import process_document_workflow

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
    Receives an image or text document from the mobile app.
    Currently acts as a placeholder before we integrate AWS S3 and OCR.
    """
    try:
        # Validate file type
        if not file.content_type.startswith("image/") and file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image or PDF.")
        
        # Read file contents (in memory for now)
        contents = await file.read()
        file_size_kb = len(contents) / 1024
        
        # TODO: Step 1 - Upload to AWS S3 (Temporary Storage)
        # TODO: Step 2 - Send to OCR Service (Tesseract / AWS Textract)
        # TODO: Step 3 - Regex masking for PII 
        
        # --- PLACEHOLDER FOR OCR RESULT ---
        # Replace this with the actual extracted text from Step 2
        mock_ocr_text = "This is a final notice regarding your unpaid taxes. Click here to avoid arrest: http://scam-link.com"
        
        # --- ZHIPU AI WORKFLOW ---
        # Call the 3-stage GLM-4 workflow
        analysis_result = await process_document_workflow(mock_ocr_text)
        
        return {
            "status": "success",
            "filename": file.filename,
            "size_kb": round(file_size_kb, 2),
            "analysis": analysis_result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Print a helpful, clickable link for the developer
    print("\n" + "="*50)
    print("🚀 API Docs available at: http://127.0.0.1:8000/docs")
    print("="*50 + "\n")
    # Runs the server on port 8000 (0.0.0.0 allows mobile app to connect via Wi-Fi)
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)