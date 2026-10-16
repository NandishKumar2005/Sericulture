# AI Powered Sericulture Decision Support and Yield Prediction System

> ReshmeAI — An end-to-end AI-powered mobile and web platform for precision sericulture farming.

## Live Links

| Platform | URL |
|---|---|
| Public Dashboard | https://reshme-ai-dashboard.vercel.app/ |
| Mobile Web App | https://sericulture-iota.vercel.app/ |
| Android APK Download | https://reshme-ai-dashboard.vercel.app/ReshmeAI-v1.0.0.apk |
| Backend API | https://reshme-backend.onrender.com |

## Project Overview

ReshmeAI is an AI-powered decision support system built for sericulture (silk farming) farmers. It covers the complete production cycle — from mulberry leaf harvesting and computer vision quality assessment to silkworm feeding optimization and cocoon/silk yield forecasting — through a React mobile app backed by a Node.js API and a Python FastAPI ML microservice.

## Core Modules

| # | Module | Description |
|---|---|---|
| 1 | Mulberry Harvest Scheduler | Predicts the optimal 2–3 day harvesting window using leaf maturity, weather, and variety profiles |
| 2 | AI Leaf Quality Scanner | OpenCV computer vision pipeline to grade leaf feeding suitability from smartphone camera images |
| 3 | Dynamic Feeding Optimizer | Calculates precise daily leaf quantities per instar stage with 4-session schedules |
| 4 | Cocoon & Silk Yield Predictor | Two-stage forecast for cocoon yield (kg), shell ratio (%), raw silk yield (kg), and recovery rate |
| 5 | AI Sericulture Copilot | Multilingual RAG-assisted chatbot for farmer advisory in EN, KN, HI, TE, TA, ML |

## Repository Structure

```
Sericulture/
├── mobile/          # React + Vite + Capacitor Android mobile app
├── backend/         # Node.js + Express REST API (deployed on Render)
├── ml-service/      # Python FastAPI ML & AI Copilot microservice
├── web/             # Public dashboard & APK landing page (deployed on Vercel)
├── ml-models/       # Serialized ML model artifacts
├── datasets/        # Harvest, leaf image, feeding, cocoon & silk datasets
├── docs/            # Architecture, API specs, and research documents
├── .github/         # GitHub Actions CI workflow for automated APK builds
├── PROJECT_SPEC.md  # Full functional & technical requirements specification
└── README.md
```

## Tech Stack

- **Mobile App**: React 18, Vite, Tailwind CSS, Capacitor (Android)
- **Backend**: Node.js, Express, MongoDB Atlas, JWT Auth
- **ML Service**: Python, FastAPI, OpenCV, scikit-learn
- **Public Dashboard**: React 18, Vite, Tailwind CSS (Vercel)
- **CI/CD**: GitHub Actions — auto builds APK on every push to main

## Android App Installation

1. Download `ReshmeAI-v1.0.0.apk` from the dashboard or the link above
2. Enable **Install from Unknown Sources** in Android Settings → Special App Access
3. Tap the APK to install
4. Register your farm and silkworm batch to get started

> The app checks for updates automatically on launch and notifies you when a new version is available.

## Local Development

See the README inside each subfolder for setup instructions:

- `mobile/` — React + Vite dev server
- `backend/` — Node.js Express API
- `ml-service/` — Python FastAPI ML service
- `web/` — Public dashboard

## Environment Variables

**backend/.env**
```
PORT=5000
MONGODB_URI=<your MongoDB Atlas URI>
JWT_SECRET=<your secret key>
ML_SERVICE_URL=http://localhost:8000
```

**mobile/.env**
```
VITE_API_URL=https://reshme-backend.onrender.com/api
```
