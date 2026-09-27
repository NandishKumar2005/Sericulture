from pydantic import BaseModel, Field
from typing import Optional


class LeafAnalysisInput(BaseModel):
    """
    Accepts a base64-encoded image string.
    The image should be a photo of a single mulberry leaf.
    Supported formats: JPEG, PNG, WebP (any format OpenCV can decode).
    """
    image_base64: str = Field(..., description="Base64-encoded leaf image (no data URI prefix needed)")
    farm_id: Optional[str] = Field(default=None, description="Optional farm ID for context")


class LeafAnalysisOutput(BaseModel):
    quality_score: float           # 0–100
    quality_category: str          # Excellent | Good | Moderate | Poor
    feeding_suitability: str       # Suitable | Marginal | Unsuitable
    confidence: float              # 0–100

    # Visual observations
    color_tone: str                # Dark Green | Light Green | Yellowish | Brownish
    maturity_stage: str            # Young | Optimal | Over-mature
    texture: str                   # Smooth | Slightly Rough | Rough
    visible_damage: str            # None | Minor | Moderate | Severe

    # Feature values (for transparency / debugging)
    green_ratio: float
    yellow_ratio: float
    brown_ratio: float
    damage_score: float
    estimated_maturity_pct: float

    # Explanation
    observations: list[str]
