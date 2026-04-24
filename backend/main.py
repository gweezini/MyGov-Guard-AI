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
    allow_origins=["*"],  
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
    Receives images or PDFs from the mobile app. 
    First, it extracts text using our OCR service, then sends it to 
    the AI brain (Zhipu) for scam analysis.
    """
    try:
        # Step 1: The Bouncer check. We now allow BOTH images and PDFs to enter!
        if not file.content_type.startswith("image/") and file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image or PDF.")
        
        # Step 2: Read the file data into memory
        contents = await file.read()
        file_size_kb = len(contents) / 1024
        
        print(f"\n🚀 Received a new file: {file.filename}")
        
        # Step 3: Extract the text. 
        # (Crucial detail: passing the filename so OCR knows whether to use Tesseract for images or Poppler for PDFs!)
        extracted_text = await extract_text_from_image(contents, filename=file.filename)
        
        if not extracted_text:
            raise HTTPException(status_code=400, detail="No text could be extracted. Please try a clearer image.")
        
        print("🤖 Text successfully extracted! Sending to Zhipu AI for analysis...")
        
        # Step 4: Pass the extracted text to your custom 3-stage GLM-4 workflow
        analysis_result = await process_document_workflow(extracted_text)
        
        print("✅ AI Analysis Complete!")
        
        # Step 5: Send everything back to the mobile app
        return {
            "status": "success",
            "filename": file.filename,
            "size_kb": round(file_size_kb, 2),
            "analysis": analysis_result
        }
        
    except Exception as e:
        # If something crashes, log it to the terminal and let the app know
        print(f"❌ Backend Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*50)
    print("🚀 API Docs available at: http://127.0.0.1:8000/docs")
    print("="*50 + "\n")
    # reload=True means the server auto-restarts every time you hit save. Super handy!
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)