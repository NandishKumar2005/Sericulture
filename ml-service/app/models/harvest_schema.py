from pydantic import BaseModel, Field
from typing import Optional


class HarvestPredictionInput(BaseModel):
    # Farm / Plantation info
    mulberry_variety: str = Field(default="V1", description="Mulberry variety (e.g. V1, S36, M5)")
    plantation_age_years: float = Field(..., description="Age of plantation in years", ge=0)
    area_acres: float = Field(..., description="Plantation area in acres", gt=0)

    # Previous harvest
    days_since_last_harvest: int = Field(..., description="Days elapsed since the last harvest", ge=0)
    previous_yield_kg: Optional[float] = Field(default=None, description="Yield from previous harvest in kg")

    # Current observations
    leaf_maturity_pct: float = Field(..., description="Current leaf maturity percentage (0–100)", ge=0, le=100)

    # Weather
    temperature_celsius: float = Field(..., description="Current average temperature in °C")
    humidity_pct: float = Field(..., description="Current relative humidity percentage (0–100)", ge=0, le=100)
    rainfall_mm: float = Field(default=0.0, description="Recent rainfall in mm", ge=0)

    # Season
    season: str = Field(
        default="normal",
        description="Current season: summer | monsoon | winter | normal"
    )


class HarvestPredictionOutput(BaseModel):
    recommended_harvest_date: str
    harvest_window_start: str
    harvest_window_end: str
    expected_yield_kg: float
    estimated_maturity_pct: float
    confidence_score: float
    days_until_harvest: int
    explanation: list[str]
    status: str  # "optimal" | "early" | "overdue" | "wait"
