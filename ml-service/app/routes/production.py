from fastapi import APIRouter, HTTPException
from app.models.production_schema import CocoonSilkInput, CocoonSilkOutput
from app.models.production_model import predict_cocoon_silk_yield

router = APIRouter(prefix="/predict", tags=["Cocoon & Silk Yield Prediction"])


@router.post("/cocoon-silk", response_model=CocoonSilkOutput)
def predict_production(payload: CocoonSilkInput):
    """
    Predict Cocoon and Silk Yield based on silkworm batch parameters,
    leaf quality, feeding history, and environmental conditions.
    """
    try:
        result = predict_cocoon_silk_yield(
            silkworm_count=payload.silkworm_count,
            instar=payload.instar,
            batch_age_days=payload.batch_age_days,
            leaf_quality_score=payload.leaf_quality_score,
            total_feeding_kg=payload.total_feeding_kg,
            feeding_efficiency_pct=payload.feeding_efficiency_pct,
            wastage_pct=payload.wastage_pct,
            temperature_celsius=payload.temperature_celsius,
            humidity_pct=payload.humidity_pct,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Production prediction failed: {str(e)}")
