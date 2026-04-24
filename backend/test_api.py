import httpx
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("ZHIPUAI_API_KEY")

print("Testing direct HTTP request to /anthropic/chat/completions (OpenAI format)...")
try:
    resp = httpx.post(
        "https://api.ilmu.ai/anthropic/chat/completions",
        headers={"Authorization": f"Bearer {api_key}"},
        json={
            "model": "ilmu-glm-5.1",
            "messages": [{"role": "user", "content": "Hello"}],
            "max_tokens": 10
        },
        timeout=10
    )
    print("Status:", resp.status_code)
    print("Body:", resp.text)
except Exception as e:
    print("Error:", e)

print("\nTesting direct HTTP request to /v1/chat/completions (OpenAI format)...")
try:
    resp = httpx.post(
        "https://api.ilmu.ai/v1/chat/completions",
        headers={"Authorization": f"Bearer {api_key}"},
        json={
            "model": "ilmu-glm-5.1",
            "messages": [{"role": "user", "content": "Hello"}],
            "max_tokens": 10
        },
        timeout=10
    )
    print("Status:", resp.status_code)
    print("Body:", resp.text)
except Exception as e:
    print("Error:", e)

print("\nTesting direct HTTP request to /anthropic/v1/messages (Anthropic format)...")
try:
    resp = httpx.post(
        "https://api.ilmu.ai/anthropic/v1/messages",
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01"
        },
        json={
            "model": "ilmu-glm-5.1",
            "messages": [{"role": "user", "content": "Hello"}],
            "max_tokens": 10
        },
        timeout=10
    )
    print("Status:", resp.status_code)
    print("Body:", resp.text)
except Exception as e:
    print("Error:", e)
