import pytesseract
from PIL import Image
import io
import os

# For Windows users, it's often necessary to specify the tesseract executable path explicitly.
# We will check common installation paths.
tesseract_paths = [
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    r"C:\Users\OWNER\AppData\Local\Programs\Tesseract-OCR\tesseract.exe"
]

# Set the path if we find it, otherwise rely on system PATH
for path in tesseract_paths:
    if os.path.exists(path):
        pytesseract.pytesseract.tesseract_cmd = path
        break

async def extract_text_from_image(file_bytes: bytes) -> str:
    """
    Takes image bytes and extracts text using Tesseract OCR.
    """
    try:
        # Load the image using Pillow
        image = Image.open(io.BytesIO(file_bytes))
        
        # Optionally pre-process the image here (e.g. convert to grayscale, etc.)
        # image = image.convert('L')
        
        # Extract text using pytesseract
        text = pytesseract.image_to_string(image)
        
        return text.strip()
    except pytesseract.TesseractNotFoundError:
        raise Exception("Tesseract OCR is not installed or not found in system PATH. Please install Tesseract-OCR from https://github.com/UB-Mannheim/tesseract/wiki.")
    except Exception as e:
        raise Exception(f"Failed to process OCR: {str(e)}")
