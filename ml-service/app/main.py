from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.harvest import router as harvest_router
from app.routes.leaf import router as leaf_router
from app.routes.feeding import router as feeding_router
from app.routes.production import router as production_router

app = FastAPI(
    title="Smart Sericulture AI Service",
    description="Microservice providing machine learning predictions & AI copilot capabilities",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---
app.include_router(harvest_router)
app.include_router(leaf_router)
app.include_router(feeding_router)
app.include_router(production_router)


@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Smart Sericulture ML API",
        "version": "1.0.0",
        "endpoints": [
            "POST /predict/harvest",
            "POST /predict/leaf-quality",
            "POST /predict/feeding",
            "POST /predict/cocoon-silk",
        ]
    }

