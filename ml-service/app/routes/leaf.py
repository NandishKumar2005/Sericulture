from fastapi import APIRouter, HTTPException
from app.models.leaf_schema import LeafAnalysisInput, LeafAnalysisOutput
from app.models.leaf_model import analyse_leaf

router = APIRouter(prefix="/predict", tags=["Leaf Quality"])


@router.post("/leaf-quality", response_model=LeafAnalysisOutput)
def analyse_leaf_quality(payload: LeafAnalysisInput):
    """
    Analyse a mulberry leaf image and return a quality assessment.

    Accepts a base64-encoded image, runs OpenCV-based colour and
    texture analysis, and returns:
    - Quality score (0–100)
    - Category: Excellent | Good | Moderate | Poor
    - Feeding suitability
    - Visual observations
    - Confidence score
    """
    try:
        result = analyse_leaf(payload.image_base64)
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Leaf analysis failed: {str(e)}")
