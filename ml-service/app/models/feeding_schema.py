from pydantic import BaseModel, Field
from typing import Optional


class FeedingOptimiserInput(BaseModel):
    # Silkworm batch
    silkworm_count:    int   = Field(..., description="Number of silkworms in the batch", gt=0)
    instar:            int   = Field(..., description="Current instar stage (1–5)", ge=1, le=5)
    batch_age_days:    int   = Field(..., description="Days since batch started", ge=0)

    # Leaf quality (0–100 score from leaf analyser, or estimated)
    leaf_quality_score: float = Field(default=80.0, description="Leaf quality score 0–100", ge=0, le=100)

    # Previous feeding data (optional — used for ML adjustment)
    previous_recommended_kg: Optional[float] = Field(default=None)
    previous_actual_kg:      Optional[float] = Field(default=None)
    previous_wastage_pct:    Optional[float] = Field(default=None, description="Actual wastage % from previous feeding")


class FeedingOptimiserOutput(BaseModel):
    daily_quantity_kg:   float   # total kg of leaf for the day
    feedings_per_day:    int     # number of feeding sessions
    quantity_per_feed_kg: float  # kg per session
    expected_wastage_pct: float  # expected wastage %
    expected_wastage_kg:  float  # wastage in kg
    leaf_per_1000_worms:  float  # normalised reference figure
    efficiency_note:      str    # short plain-text note
    explanation:          list[str]
