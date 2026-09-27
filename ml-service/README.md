# ML Service

Python / FastAPI microservice hosting Machine Learning models & AI Copilot logic for the Smart Sericulture application.

## Features

- **Harvest Scheduler**: Predicts optimal 2-3 day mulberry harvesting window.
- **Leaf Quality Assessment**: Computer Vision model (CNN / MobileNet) for leaf analysis.
- **Feeding Optimizer**: Recommends daily leaf quantity and feeding schedules.
- **Cocoon & Silk Yield Prediction**: Dual-stage yield forecasting.
- **Sericulture Copilot**: Text-based RAG-assisted farmer copilot.

## Setup & Execution

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
