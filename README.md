# 🛡️ MyGov-Guard AI
### Empowering Citizens with AI-Driven Fraud Protection & Document Simplification

[![Framework: React Native](https://img.shields.io/badge/Frontend-React_Native-61DAFB?logo=react)](https://reactnative.dev/)
[![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![AI Core: Gemini_2.5_Flash](https://img.shields.io/badge/AI-Gemini_2.5_Flash-4285F4?logo=google-gemini)](https://deepmind.google/technologies/gemini/)

## 📺 Pitching Video
**Watch our project demonstration here:** [▶️ Click to Watch MyGov-Guard AI Pitch Video](在这里替换成你的视频链接)

**Pitch Deck:** [📊 View Presentation Slides](在这里替换成你的PitchDeck链接)

## 📂 Project Documentation
Access the comprehensive technical and product documentation for MyGov-Guard AI:
* **Product Requirement Document (PRD):** [📄 View PRD](https://github.com/gweezini/MyGov-Guard-AI/blob/main/Product%20Requirement%20Documentation_Gimme4.docx.pdf)
* **System Analysis Documentation (SAD):** [📄 View SAD](https://github.com/gweezini/MyGov-Guard-AI/blob/main/System%20Analysis%20Documentation_Gimme4.pdf)
* **Quality Assurance Testing Documentation (QATD):** [📄 View QATD](https://github.com/gweezini/MyGov-Guard-AI/blob/main/Sample%20Testing%20Analysis%20Documentation%20(Preliminary)_Gimme4.pdf)

---

## 📌 Project Overview
**MyGov-Guard AI** is a state-of-the-art multimodal security platform dedicated to protecting vulnerable communities against the trillion-ringgit scam threat. Our mission is to bridge the digital divide by transforming complex, jargon-heavy government notices into simple, actionable guidance. By integrating **Gemini 2.5 Flash**, the system provides real-time scam verification and document simplification through a robust, privacy-centric architecture.

---

## 🚨 The Problem: The Trillion-Ringgit Threat
The current digital landscape is plagued by three critical issues that leave citizens vulnerable:
* **The Scam Epidemic:** Sophisticated impersonation scams (LHDN, PDRM, PTPTN, and various banks) are causing massive financial losses daily.
* **The Language Barrier:** Bureaucratic and legal jargon in official messages often leads to confusion, fear, and misinformed decisions among the public.
* **The Verification Gap:** There is a total lack of instant, user-friendly tools capable of verifying physical letters, multi-page PDFs, or digital screenshots simultaneously.

## ✨ The Solution: MyGov-Guard AI
Our application simplifies the verification process through a streamlined three-step user journey:
1. **📸 Snap & Upload:** Users can capture photos of physical letters, upload screenshots of messages, or attach multi-page PDFs.
2. **🧠 Smart Analysis:** The AI processes unstructured data to identify red flags and translates content into plain language (English, Malay, or Chinese).
3. **🛡️ Actionable Protection:** The system generates verified next steps and direct contact links for official services, such as the **NSRC 997** hotline.

---

## 👥 Target Audience
MyGov-Guard AI is designed as a universal tool with a specific focus on those most in need:

* **General Malaysian Citizens:** A universal "Digital Shield" for everyone.
* **Primary Focus:** Elderly and B40 communities facing the highest risk of financial loss.
* **The Mass Market:** Busy professionals & youth needing instant verification for complex official jargon.

---

## 🌏 Real-World Impact
MyGov-Guard AI is built to deliver tangible benefits to Malaysian society:

* **Financial Security:** Directly protecting life savings and retirement funds from being drained by fraudulent schemes.
* **Digital Confidence:** Replacing the fear and anxiety associated with complex official jargon with clarity and understanding.
* **Closing the Gap:** Ensuring no Malaysian is left behind in the national transition to **e-Kerajaan** (Digital Government).

---

## 🛠️ Technical Architecture & System Design
MyGov-Guard AI is built on a **Hybrid Cloud-Native Architecture** designed for high availability and strict data privacy.

### 1. Multi-Tiered Backend
* **API Gateway (FastAPI):** An asynchronous backend that manages routing and coordinates between microservices.
* **OCR & Document Service:** Utilizes **Tesseract OCR** and **Poppler** to handle both high-resolution images and sequential multi-page PDF extraction.
* **Agentic Workflow Service:** A 3-stage reasoning pipeline that prioritizes security checks before generating user guidance.

### 2. Local-First Data Strategy
To ensure maximum compliance with data privacy standards:
* **Decentralized Storage:** We utilize **AsyncStorage** for local-on-device persistence. Sensitive scan history and logs are never stored on a central server.
* **Stateless Processing:** Documents are processed in-memory and are automatically discarded immediately after the analysis is delivered to the client.

### 3. Audio Accessibility Engine
* Powered by **Google Cloud WaveNet**, our system synthesizes high-quality, localized speech to read summaries aloud, ensuring the platform is fully accessible to visually impaired or illiterate users.

---

## 🛡️ Engineering Excellence (QA & Reliability)
We adhere to rigorous software engineering standards to ensure enterprise-grade reliability:

* **3-Stage Agentic Workflow:**
    * **Stage 1 (Scam Detection):** Acts as a security auditor to analyze linguistic patterns and risk scores.
    * **Stage 2 (Translation):** Converts formal jargon into "Plain Language" summaries.
    * **Stage 3 (Action Guide):** Generates a localized Standard Operating Procedure (SOP) for the user.
* **Safety Net UI:** If upstream AI services experience latency or outages, the system catches the exception and displays a localized fail-safe UI with static safety instructions.
* **CI/CD Pipeline:** Automated modular testing and deployment validation via **GitHub Actions** to ensure codebase integrity.


---

## 🚀 Future Roadmap: Engineering & Experience Evolution

### 1. Scalability & Performance
* **Intelligent Caching:** Implementing **Redis caching** to enable faster response times and lower Gemini 2.5 Flash API costs for common document formats.
* **Edge-Computing OCR:** Migrating text extraction to the device using **Google ML Kit** or **iOS Vision API** to reduce upload latency.
* **High Availability:** Deploying across **multiple regions** to ensure the system remains accessible during localized outages.

### 2. Reliability & Intelligence
* **Dynamic Threat Intelligence:** Transitioning to a dynamic scam alert database powered by **PostgreSQL** or **Firebase**.
* **National Safety Integration:** Establishing real-time data pipelines with **PDRM** and **Malaysian CERT** for the most up-to-date scam pattern detection.

### 3. User Engagement & Experience
* **Instantaneous Communication:** Utilizing **WebSockets** or **SSE** for real-time analysis progress updates.
* **Proactive Alerts:** Integrating **push notifications** to warn users about emerging localized scam threats.
* **Personalized Security:** Allowing users to manage **personalized subscriptions** and track their own alert history.


---

## 👥 The Team: Gimme4
* **Gwee Zi Ni** - Project Lead & Frontend Engineer
* **Lee Jia Yee** - AI Integration & Backend Engineer
* **Michelle Ho Chia Xin** - DevOps & QA Lead
* **Tay Xin Ying** - UI/UX Designer & Product Strategist

