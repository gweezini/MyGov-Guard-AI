import pytesseract
from PIL import Image
import io
import os

# --- STEP 1: LOCATING THE OCR ENGINE ---
# Tesseract is picky on Windows. We need to tell Python exactly where the 'brain' is.
# If you installed it elsewhere, just swap this path.
TESSERACT_EXE_PATH = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Checking if the engine is actually there before we start the fire
if os.path.exists(TESSERACT_EXE_PATH):
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_EXE_PATH
else:
    print(f"⚠️ HEADS UP: Tesseract not found at {TESSERACT_EXE_PATH}!")
    print("If you're on a different machine, please update the path or add it to your System PATH.")

async def extract_text_from_image(file_bytes: bytes) -> str:
    """
     Converts image pixels into actual strings.
    """
    try:
        # 1. Open the image from memory (stream) instead of saving it to disk first.
        # This keeps our backend snappy and clean.
        image = Image.open(io.BytesIO(file_bytes))
        
        # 2. Safety check: Convert to RGB. 
        # Some PNGs with transparency (RGBA) can make Tesseract go crazy.
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # We're using English ('eng') for now. 
        # Pro tip: If you want Malay support, change it to lang='eng+ms'
        text = pytesseract.image_to_string(image, lang='eng') 
        
        # Clean up the mess (remove trailing spaces/newlines)
        extracted_text = text.strip()
        
        if not extracted_text:
            return "OCR worked, but I couldn't find any readable text in this image. Try a clearer shot?"
            
        return extracted_text

    except Exception as e:
        # If something blows up, we want to know EXACTLY why.
        error_info = f"Oops! OCR process crashed: {str(e)}"
        print(f"❌ {error_info}")
        raise Exception(error_info)