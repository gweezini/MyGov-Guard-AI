import httpx
import os
import json
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("ZHIPUAI_API_KEY")

def test_endpoint(url, headers, json_payload, name):
    print(f"\n--- Testing {name} ---")
    try:
        resp = httpx.post(url, headers=headers, json=json_payload, timeout=10)
        print("Status:", resp.status_code)
        print("Body:", resp.text)
    except Exception as e:
        print("Error:", e)

# 1. Test exactly /anthropic with Anthropic format
test_endpoint(
    "https://api.ilmu.ai/anthropic",
    headers={"x-api-key": api_key, "anthropic-version": "2023-06-01"},
    json_payload={"model": "ilmu-glm-5.1", "messages": [{"role": "user", "content": "Hello, what is 1+1?"}], "max_tokens": 50},
    name="Exactly /anthropic (Anthropic format)"
)

# 2. Test exactly /anthropic with OpenAI format
test_endpoint(
    "https://api.ilmu.ai/anthropic",
    headers={"Authorization": f"Bearer {api_key}"},
    json_payload={"model": "ilmu-glm-5.1", "messages": [{"role": "user", "content": "Hello, what is 1+1?"}], "max_tokens": 50},
    name="Exactly /anthropic (OpenAI format)"
)
