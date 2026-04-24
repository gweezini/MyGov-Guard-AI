import httpx
import json

print("Sending document to your FastAPI backend...")
print("Please be patient, the Ilmu AI server is currently very slow (might take 2-3 minutes).")
print("Waiting for response...\n")

url = "http://127.0.0.1:8000/upload"

# Use the new test_text.png file
files = {"file": ("test_text.png", open("test_text.png", "rb"), "image/png")}

try:
    # No timeout! Just wait as long as it takes
    response = httpx.post(url, files=files, timeout=600.0)
    
    print("=== SUCCESS ===")
    print("Status Code:", response.status_code)
    print("Response JSON:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print("\n=== ERROR ===")
    print(e)
