from fastapi import FastAPI

app = FastAPI()

# This is just a test to make sure the server is awake
@app.get("/")
def root():
    return {"status": "MyGov-Guard API is running!"}

# This is your new route for the React Native app to send images to
@app.post("/upload-document")
def upload_document():
    # We will let Copilot write the logic to handle the image and send it to Zhipu here
    return {"message": "Image received successfully!"}