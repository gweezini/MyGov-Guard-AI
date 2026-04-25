import pytesseract
from PIL import Image
import io
import os
from pdf2image import convert_from_bytes
from dotenv import load_dotenv
load_dotenv()

# The engine that reads text from images
TESSERACT_EXE_PATH = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# The tool that converts PDF pages into imagesS
POPPLER_PATH = os.getenv('POPPLER_PATH', r'C:\Users\User\Downloads\Release-25.12.0-0\poppler-25.12.0\Library\bin')

# Connect Python to Tesseract
if os.path.exists(TESSERACT_EXE_PATH):
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_EXE_PATH

async def extract_text_from_image(file_bytes: bytes, filename: str = "image.jpg") -> str:
    """
    Takes raw file data and turns it into readable text.
    It is smart enough to handle both PDFs and standard images (JPG/PNG).
    """
    try:
        # Case 1: The user uploaded a PDF document
        if filename.lower().endswith('.pdf'):
            print(f"📦 PDF detected ({filename})! Slicing pages with Poppler...")
            
            # Convert the PDF file into a list of images (one image per page)
            pages = convert_from_bytes(file_bytes, poppler_path=POPPLER_PATH)
            full_text = ""
            
            # Read text from every single page
            for index, page in enumerate(pages):
                print(f"   -> Reading page {index + 1}...")
                text = pytesseract.image_to_string(page, lang='eng')
                full_text += text + "\n"
                
            return full_text.strip()
        
        # Case 2: The user uploaded a normal photo or screenshot
        else:
            print(f"📸 Image detected ({filename})! Reading directly with Tesseract...")
            
            # Open the image from memory
            image = Image.open(io.BytesIO(file_bytes))
            
            # Make sure the image is in RGB format (Tesseract hates transparent backgrounds)
            if image.mode != 'RGB':
                image = image.convert('RGB')
                
            # Extract and return the text
            return pytesseract.image_to_string(image, lang='eng').strip()

    except Exception as e:
        # Just log the error and return empty text
        print(f"❌ OCR processing failed: {str(e)}")
        return ""