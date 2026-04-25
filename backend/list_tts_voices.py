import os
from google.cloud import texttospeech

def list_voices():
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "gcp-key.json"
    client = texttospeech.TextToSpeechClient()
    
    # Performs the list voices request
    voices = client.list_voices()
    
    print("Available Voices:")
    for voice in voices.voices:
        print(f"Name: {voice.name}")
        print(f"  Languages: {', '.join(voice.language_codes)}")
        print(f"  SSML Gender: {texttospeech.SsmlVoiceGender(voice.ssml_gender).name}")
        print("-" * 20)

if __name__ == "__main__":
    list_voices()
