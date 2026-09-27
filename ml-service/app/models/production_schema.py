"""
Cocoon & Silk Yield Prediction Schemas
======================================
Pydantic input and output schemas for Module 4 production forecasting.
"""

from pydantic import BaseModel, Field
from typing import Optional, List


class CocoonSilkInput(BaseModel):
    silkworm_count: int = Field(..., gt=0, description="Total number of silkworms in batch")
    instar: int = Field(5, ge=1, le=5, description="Growth stage (1-5 instar)")
    batch_age_days: int = Field(25, ge=1, description="Days since batch rearing started")
    leaf_quality_score: float = Field(85.0, ge=0.0, le=100.0, description="Mulberry leaf quality score (0-100)")
    total_feeding_kg: Optional[float] = Field(None, ge=0.0, description="Total mulberry leaf fed to batch in kg")
    feeding_efficiency_pct: Optional[float] = Field(None, ge=0.0, le=100.0, description="Feeding efficiency percentage")
    wastage_pct: Optional[float] = Field(None, ge=0.0, le=100.0, description="Leaf wastage percentage")
    temperature_celsius: Optional[float] = Field(27.0, description="Rearing temperature in Celsius")
    humidity_pct: Optional[float] = Field(75.0, ge=0.0, le=100.0, description="Rearing relative humidity percentage")


class CocoonSilkOutput(BaseModel):
    predicted_cocoon_yield_kg: float
    average_cocoon_weight_gram: float
    shell_ratio_pct: float
    quality_grade: str
    predicted_silk_yield_kg: float
    silk_recovery_rate_pct: float
    filament_length: str
    confidence_score: float
    explanation: List[str]
