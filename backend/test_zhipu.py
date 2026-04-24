import httpx

# Create a dummy file
with open("dummy.txt", "w") as f:
    f.write("test")

# Send the dummy file to the upload endpoint
url = "http://127.0.0.1:8000/upload"
files = {"file": ("dummy.pdf", open("dummy.txt", "rb"), "application/pdf")}

print("Sending request to /upload...")
# httpx uses a slightly different syntax for files if needed, but it should work the same for simple files
response = httpx.post(url, files=files, timeout=120.0)

print("Status Code:", response.status_code)
print("Response JSON:")
import json
print(json.dumps(response.json(), indent=2))
print("Response JSON:")
import json
print(json.dumps(response.json(), indent=2))
