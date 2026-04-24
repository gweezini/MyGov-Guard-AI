import asyncio
import os
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

async def main():
    api_key = os.getenv("ZHIPUAI_API_KEY")
    client = AsyncOpenAI(api_key=api_key, base_url="https://api.ilmu.ai/v1", timeout=10.0)
    print("Sending request...")
    try:
        resp = await client.chat.completions.create(
            model="ilmu-glm-5.1",
            messages=[{"role": "user", "content": "Hello, please reply with 'World'."}]
        )
        print("Response:", resp)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    asyncio.run(main())
