# ReshmeAI ML Service

Python FastAPI microservice hosting all AI/ML models and the Sericulture Copilot for the ReshmeAI platform.

## Features

- **Harvest Scheduler** — Predicts optimal 2–3 day mulberry harvesting window using leaf maturity, temperature, humidity, rainfall, and variety profiles (V1, S36, M5)
- **Leaf Quality Scanner** — OpenCV computer vision pipeline: RGB/HSV colour distribution, spot/damage density detection, feeding suitability grading (Excellent / Good / Moderate / Poor)
- **Feeding Optimizer** — Instar-based (1st–5th) daily leaf quantity calculation with 4-session schedules and wastage feedback loop
- **Cocoon & Silk Yield Predictor** — Two-stage forecast: Stage 1 cocoon yield + shell ratio, Stage 2 raw silk yield + recovery rate
- **Sericulture Copilot** — RAG-assisted multilingual farmer advisory chatbot (EN, KN, HI, TE, TA, ML)

## Setup

1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Linux/Mac
   source venv/bin/activate
   # Windows
   venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create `.env`:
   ```
   PORT=8000
   ```

4. Run the development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/predict/harvest` | Harvest window prediction |
| POST | `/predict/leaf-quality` | Leaf image quality analysis |
| POST | `/predict/feeding` | Daily feeding schedule optimization |
| POST | `/predict/cocoon-silk` | Cocoon & silk yield forecast |
| POST | `/copilot` | AI copilot query |
