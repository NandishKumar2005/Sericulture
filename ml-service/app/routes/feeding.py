from fastapi import APIRouter, HTTPException
from app.models.feeding_schema import FeedingOptimiserInput, FeedingOptimiserOutput
from app.models.feeding_model import optimise_feeding

router = APIRouter(prefix="/predict", tags=["Feeding Optimiser"])


@router.post("/feeding", response_model=FeedingOptimiserOutput)
def predict_feeding(payload: FeedingOptimiserInput):
    """
    Return the recommended daily leaf feeding plan for a silkworm batch.

    Uses a biological formula baseline with optional adjustments from
    previous feeding history (wastage feedback + consumption feedback).
    """
    try:
        result = optimise_feeding(
            silkworm_count          = payload.silkworm_count,
            instar                  = payload.instar,
            batch_age_days          = payload.batch_age_days,
            leaf_quality_score      = payload.leaf_quality_score,
            previous_recommended_kg = payload.previous_recommended_kg,
            previous_actual_kg      = payload.previous_actual_kg,
            previous_wastage_pct    = payload.previous_wastage_pct,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Feeding optimisation failed: {str(e)}")
