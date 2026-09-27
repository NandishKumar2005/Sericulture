from fastapi import APIRouter, HTTPException
from app.models.harvest_schema import HarvestPredictionInput, HarvestPredictionOutput
from app.models.harvest_model import predict_harvest

router = APIRouter(prefix="/predict", tags=["Harvest Prediction"])


@router.post("/harvest", response_model=HarvestPredictionOutput)
def predict_harvest_window(payload: HarvestPredictionInput):
    """
    Predict the optimal mulberry leaf harvesting window.

    Accepts farm and environmental data, returns the recommended harvest
    date range, expected yield, maturity estimate, confidence score, and
    a human-readable explanation.
    """
    try:
        result = predict_harvest(
            mulberry_variety=payload.mulberry_variety,
            plantation_age_years=payload.plantation_age_years,
            area_acres=payload.area_acres,
            days_since_last_harvest=payload.days_since_last_harvest,
            previous_yield_kg=payload.previous_yield_kg,
            leaf_maturity_pct=payload.leaf_maturity_pct,
            temperature_celsius=payload.temperature_celsius,
            humidity_pct=payload.humidity_pct,
            rainfall_mm=payload.rainfall_mm,
            season=payload.season,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
