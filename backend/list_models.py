import os
import asyncio
from google import genai
from dotenv import load_datenv

load_dotenv()

async def main():
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "gcp-key.json"

    print("Listing avaible models for your project...")
    try:
        client=genai.Client(
            vertexai=True,
            project="mygovguard",
            location="us-central1"
        )

        models = client.models.list()
        print("Successfully retrieved models: ")

        for model in models:
            print(f"- {model.name}")

    except Exception as e:
        print(f"Error listing models: {e}")

if __name__ == "__main__":
    asyncio.run(main())