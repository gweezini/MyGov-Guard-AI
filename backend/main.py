from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Response
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from zhipu_service import process_document_workflow, generate_speech_audio
from ocr_service import extract_text_from_image

load_dotenv()

app = FastAPI(title="MyGov-Guard Final Stable")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 演示数据
alerts_db = [
    {
        "id": "1", "level": "Critical", "time": "Just Now",
        "en": {"title": "🚨 PTPTN: Fake Settlement", "desc": "WhatsApp scammers alert."},
        "zh": {"title": "🚨 PTPTN: 虚假优惠", "desc": "WhatsApp 诈骗预警。"},
        "ms": {"title": "🚨 PTPTN: Tawaran Palsu", "desc": "Amaran scam WhatsApp."}
    },
    {
        "id": "2", "level": "High", "time": "1h ago",
        "en": {"title": "📱 APK Scam: Cleaning", "desc": "Fake cleaning ads stealing bank info."},
        "zh": {"title": "📱 APK 诈骗: 清洁服务", "desc": "FB 虚假广告盗取银行信息。"},
        "ms": {"title": "📱 Scam APK: Cuci Rumah", "desc": "Iklan cuci rumah palsu mencuri login bank."}
    }
]

@app.get("/alerts")
async def get_alerts(lang: str = "en"):
    print(f"📡 DEBUG: App calling /alerts! Language: {lang}")
    localized = []
    try:
        for a in alerts_db:
            content = a.get(lang, a["en"])
            # 🌟 字段双重备份：同时提供小写和大写，防止前端代码写错
            item = {
                "id": str(a["id"]),
                "level": str(a["level"]),
                "time": str(a["time"]),
                "title": str(content["title"]),
                "desc": str(content["desc"]),
                # 额外备份（防止前端用大写开头）
                "Title": str(content["title"]),
                "Desc": str(content["desc"])
            }
            localized.append(item)
        print(f"✅ DEBUG: Sending {len(localized)} items to phone.")
        return localized
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return []

@app.post("/upload")
async def upload_document(file: UploadFile = File(...), language: str = Form("en")):
    try:
        contents = await file.read()
        extracted_text = await extract_text_from_image(contents, filename=file.filename)
        analysis = await process_document_workflow(extracted_text, language)
        return {"status": "success", "analysis": analysis}
    except Exception as e:
        print(f"❌ Upload Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/tts")
async def text_to_speech(text: str, language: str = "en"):
    audio = await generate_speech_audio(text, language)
    return Response(content=audio, media_type="audio/mpeg")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)