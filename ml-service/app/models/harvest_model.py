"""
Harvest Prediction Model
========================
Rule-based model grounded in sericulture domain knowledge.

The model estimates:
  - Days until optimal harvest
  - Expected leaf yield (kg)
  - Maturity projection at optimal time
  - Confidence score based on input data quality
  - Human-readable explanation of key factors

Designed to work without a pre-trained ML artifact so the service starts
immediately. When labelled harvest data becomes available, swap
`_rule_based_predict` for a trained XGBoost / RandomForest model loaded
from ml-models/harvest/.
"""

from __future__ import annotations

import math
from datetime import date, timedelta
from typing import Any


# ---------------------------------------------------------------------------
# Domain constants (based on standard sericulture references)
# ---------------------------------------------------------------------------

# Typical inter-harvest interval (days) per season
SEASON_INTERVAL: dict[str, int] = {
    "summer": 30,
    "monsoon": 20,
    "winter": 45,
    "normal": 35,
}

# Optimal maturity range (%)
MATURITY_OPTIMAL_MIN = 75
MATURITY_OPTIMAL_MAX = 90

# Base yield coefficient (kg per acre per harvest)
BASE_YIELD_PER_ACRE: dict[str, float] = {
    "V1":  42.0,
    "S36": 38.0,
    "M5":  45.0,
    "V2":  40.0,
}
DEFAULT_YIELD_PER_ACRE = 40.0

# Temperature sweet-spot for mulberry (°C)
TEMP_OPTIMAL_MIN = 24
TEMP_OPTIMAL_MAX = 32

# Humidity sweet-spot (%)
HUMIDITY_OPTIMAL_MIN = 60
HUMIDITY_OPTIMAL_MAX = 85


# ---------------------------------------------------------------------------
# Core prediction logic
# ---------------------------------------------------------------------------

def predict_harvest(
    mulberry_variety: str,
    plantation_age_years: float,
    area_acres: float,
    days_since_last_harvest: int,
    previous_yield_kg: float | None,
    leaf_maturity_pct: float,
    temperature_celsius: float,
    humidity_pct: float,
    rainfall_mm: float,
    season: str,
) -> dict[str, Any]:

    explanation: list[str] = []
    season = season.lower()

    # ------------------------------------------------------------------
    # 1. Determine base harvest interval for this season
    # ------------------------------------------------------------------
    interval = SEASON_INTERVAL.get(season, SEASON_INTERVAL["normal"])

    # ------------------------------------------------------------------
    # 2. Estimate days until optimal harvest from current maturity
    # ------------------------------------------------------------------
    # Mulberry leaves mature roughly 0.8–1.5 % per day in the 60-95 range
    maturity_gain_per_day = _maturity_gain_rate(temperature_celsius, humidity_pct, season)

    if leaf_maturity_pct >= MATURITY_OPTIMAL_MAX:
        # Leaves are over-mature — harvest should have happened already
        days_to_harvest = 0
        status = "overdue"
        explanation.append(
            f"Leaf maturity is {leaf_maturity_pct:.0f}%, which exceeds the optimal "
            f"maximum of {MATURITY_OPTIMAL_MAX}%. Harvest immediately to prevent quality loss."
        )
    elif leaf_maturity_pct >= MATURITY_OPTIMAL_MIN:
        # Already in the optimal window
        days_to_harvest = 0
        status = "optimal"
        explanation.append(
            f"Leaf maturity is {leaf_maturity_pct:.0f}%, which is within the optimal "
            f"range ({MATURITY_OPTIMAL_MIN}–{MATURITY_OPTIMAL_MAX}%). Harvest now."
        )
    else:
        # Calculate how many days until maturity reaches the lower bound
        maturity_deficit = MATURITY_OPTIMAL_MIN - leaf_maturity_pct
        days_to_harvest = max(1, math.ceil(maturity_deficit / maturity_gain_per_day))
        status = "wait"
        explanation.append(
            f"Leaf maturity is {leaf_maturity_pct:.0f}%. At the current growth rate of "
            f"{maturity_gain_per_day:.2f}%/day, maturity will reach "
            f"{MATURITY_OPTIMAL_MIN}% in approximately {days_to_harvest} day(s)."
        )

    # ------------------------------------------------------------------
    # 3. Interval-based cross-check
    # ------------------------------------------------------------------
    days_remaining_by_interval = interval - days_since_last_harvest
    if days_remaining_by_interval > days_to_harvest and days_remaining_by_interval > 0:
        explanation.append(
            f"The {season.title()} season harvest interval is typically {interval} days. "
            f"The last harvest was {days_since_last_harvest} days ago; "
            f"waiting {days_remaining_by_interval} more day(s) is recommended by interval."
        )
        days_to_harvest = days_remaining_by_interval
        status = "wait"

    # ------------------------------------------------------------------
    # 4. Weather adjustments
    # ------------------------------------------------------------------
    weather_factor = 1.0

    temp_ok = TEMP_OPTIMAL_MIN <= temperature_celsius <= TEMP_OPTIMAL_MAX
    humid_ok = HUMIDITY_OPTIMAL_MIN <= humidity_pct <= HUMIDITY_OPTIMAL_MAX

    if temp_ok and humid_ok:
        explanation.append(
            f"Weather conditions are favourable (Temp: {temperature_celsius}°C, "
            f"Humidity: {humidity_pct}%)."
        )
    else:
        if not temp_ok:
            weather_factor *= 0.92
            explanation.append(
                f"Temperature of {temperature_celsius}°C is outside the optimal range "
                f"({TEMP_OPTIMAL_MIN}–{TEMP_OPTIMAL_MAX}°C). This may reduce leaf quality slightly."
            )
        if not humid_ok:
            weather_factor *= 0.94
            explanation.append(
                f"Humidity of {humidity_pct}% is outside the optimal range "
                f"({HUMIDITY_OPTIMAL_MIN}–{HUMIDITY_OPTIMAL_MAX}%). Adjust irrigation if possible."
            )

    if rainfall_mm > 30:
        weather_factor *= 0.95
        explanation.append(
            f"Recent rainfall of {rainfall_mm} mm may cause some leaf damage. "
            "Inspect leaves for fungal spots before harvesting."
        )
    elif rainfall_mm > 0:
        explanation.append(f"Moderate rainfall ({rainfall_mm} mm) should benefit leaf growth.")

    # ------------------------------------------------------------------
    # 5. Estimate projected maturity at harvest day
    # ------------------------------------------------------------------
    projected_maturity = min(
        leaf_maturity_pct + (maturity_gain_per_day * days_to_harvest),
        95.0
    )

    # ------------------------------------------------------------------
    # 6. Expected yield estimation
    # ------------------------------------------------------------------
    base_yield_per_acre = BASE_YIELD_PER_ACRE.get(mulberry_variety.upper(), DEFAULT_YIELD_PER_ACRE)

    # Age factor: yield peaks around 2–4 years, drops slowly after 6
    if plantation_age_years < 1:
        age_factor = 0.70
    elif plantation_age_years <= 4:
        age_factor = 0.85 + (plantation_age_years / 4) * 0.15  # 0.85 → 1.00
    elif plantation_age_years <= 7:
        age_factor = 1.00
    else:
        age_factor = max(0.75, 1.0 - (plantation_age_years - 7) * 0.04)

    expected_yield = round(
        base_yield_per_acre * area_acres * age_factor * weather_factor,
        1
    )

    # Use previous yield as an anchor if it's close to our estimate
    if previous_yield_kg is not None:
        blend_weight = 0.3
        expected_yield = round(
            (1 - blend_weight) * expected_yield + blend_weight * previous_yield_kg,
            1
        )
        explanation.append(
            f"Previous harvest yield of {previous_yield_kg} kg has been factored "
            "into the estimate."
        )

    # ------------------------------------------------------------------
    # 7. Confidence score
    # ------------------------------------------------------------------
    # Start at 85, adjust based on data completeness and conditions
    confidence = 85.0
    if previous_yield_kg is not None:
        confidence += 5
    if temp_ok:
        confidence += 2
    if humid_ok:
        confidence += 2
    if rainfall_mm > 40:
        confidence -= 5
    if leaf_maturity_pct < 50:
        confidence -= 8  # Very early; harder to predict

    confidence = round(min(max(confidence, 50.0), 97.0), 1)

    # ------------------------------------------------------------------
    # 8. Build harvest window dates
    # ------------------------------------------------------------------
    today = date.today()
    harvest_day = today + timedelta(days=days_to_harvest)
    window_start = harvest_day
    window_end = harvest_day + timedelta(days=2)  # 2-day harvest window

    return {
        "recommended_harvest_date": harvest_day.isoformat(),
        "harvest_window_start": window_start.isoformat(),
        "harvest_window_end": window_end.isoformat(),
        "expected_yield_kg": expected_yield,
        "estimated_maturity_pct": round(projected_maturity, 1),
        "confidence_score": confidence,
        "days_until_harvest": days_to_harvest,
        "explanation": explanation,
        "status": status,
    }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _maturity_gain_rate(temp: float, humidity: float, season: str) -> float:
    """
    Estimate daily leaf maturity gain (% per day).
    Baseline 1.2 %/day; adjusted for temperature, humidity, and season.
    """
    base = 1.2

    # Temperature effect
    if TEMP_OPTIMAL_MIN <= temp <= TEMP_OPTIMAL_MAX:
        temp_mult = 1.0 + (temp - TEMP_OPTIMAL_MIN) / (TEMP_OPTIMAL_MAX - TEMP_OPTIMAL_MIN) * 0.2
    elif temp < TEMP_OPTIMAL_MIN:
        temp_mult = max(0.6, 1.0 - (TEMP_OPTIMAL_MIN - temp) * 0.04)
    else:
        temp_mult = max(0.7, 1.0 - (temp - TEMP_OPTIMAL_MAX) * 0.03)

    # Humidity effect
    if HUMIDITY_OPTIMAL_MIN <= humidity <= HUMIDITY_OPTIMAL_MAX:
        hum_mult = 1.0
    elif humidity < HUMIDITY_OPTIMAL_MIN:
        hum_mult = max(0.75, 1.0 - (HUMIDITY_OPTIMAL_MIN - humidity) * 0.01)
    else:
        hum_mult = max(0.85, 1.0 - (humidity - HUMIDITY_OPTIMAL_MAX) * 0.005)

    # Season boost
    season_mult = {"monsoon": 1.15, "summer": 0.95, "winter": 0.80}.get(season, 1.0)

    return round(base * temp_mult * hum_mult * season_mult, 3)
