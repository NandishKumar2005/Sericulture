"""
Synthetic Harvest Dataset Generator
=====================================
Generates a realistic labelled dataset for training a harvest prediction model.

Each row represents one plantation observation with:
  - Farm/plantation features
  - Weather conditions
  - Previous harvest data
  - Ground truth: days_to_optimal_harvest and actual_yield_kg

Run:
    python generate_harvest_dataset.py

Output:
    harvest_dataset.csv   (1000 samples, training-ready)
"""

import csv
import math
import random
from datetime import date, timedelta

random.seed(42)

VARIETIES = ["V1", "S36", "M5", "V2"]

SEASON_INTERVALS = {
    "summer":  (28, 35),
    "monsoon": (18, 25),
    "winter":  (40, 50),
    "normal":  (30, 40),
}

BASE_YIELD = {"V1": 42.0, "S36": 38.0, "M5": 45.0, "V2": 40.0}

FIELDNAMES = [
    "sample_id",
    "mulberry_variety",
    "plantation_age_years",
    "area_acres",
    "season",
    "days_since_last_harvest",
    "previous_yield_kg",
    "leaf_maturity_pct",
    "temperature_celsius",
    "humidity_pct",
    "rainfall_mm",
    # Labels
    "days_to_optimal_harvest",
    "actual_yield_kg",
    "harvest_window_start",
    "harvest_window_end",
    "confidence_score",
]


def clamp(v, lo, hi):
    return max(lo, min(hi, v))


def generate_sample(sample_id: int) -> dict:
    variety = random.choice(VARIETIES)
    age     = round(random.uniform(0.5, 10.0), 1)
    area    = round(random.uniform(0.5, 8.0),  1)
    season  = random.choice(list(SEASON_INTERVALS.keys()))

    interval_lo, interval_hi = SEASON_INTERVALS[season]
    target_interval = random.randint(interval_lo, interval_hi)
    days_since      = random.randint(3, target_interval + 15)

    # Leaf maturity: roughly correlates with days since last harvest
    maturity_base = clamp(55 + (days_since / target_interval) * 40, 50, 98)
    maturity      = round(clamp(maturity_base + random.gauss(0, 4), 40, 98), 1)

    # Weather
    temp     = round(random.uniform(18, 38), 1)
    humidity = round(random.uniform(45, 92), 1)
    rainfall = round(max(0, random.expovariate(1 / 10)), 1)  # mostly low, occasional heavy

    # Previous yield (some samples won't have it)
    base_yield   = BASE_YIELD[variety]
    prev_yield   = round(base_yield * area * random.uniform(0.80, 1.20), 1) \
                   if random.random() > 0.15 else None

    # ── Ground truth ────────────────────────────────────────────────────────
    # Days to optimal: based on maturity deficit + interval remaining
    OPTIMAL_MIN = 75
    maturity_gain = _gain_rate(temp, humidity, season)

    if maturity >= 90:
        days_to = 0
    elif maturity >= OPTIMAL_MIN:
        days_to = 0
    else:
        days_to = max(0, math.ceil((OPTIMAL_MIN - maturity) / maturity_gain))

    interval_days_remaining = target_interval - days_since
    if interval_days_remaining > days_to:
        days_to = max(0, interval_days_remaining)

    # Add small noise to label (real farms aren't perfectly deterministic)
    days_to = max(0, days_to + random.randint(-1, 1))

    # Yield
    if age < 1:
        age_f = 0.70
    elif age <= 4:
        age_f = 0.85 + (age / 4) * 0.15
    elif age <= 7:
        age_f = 1.00
    else:
        age_f = max(0.75, 1.0 - (age - 7) * 0.04)

    weather_f = 1.0
    if not (24 <= temp <= 32):
        weather_f *= random.uniform(0.88, 0.95)
    if not (60 <= humidity <= 85):
        weather_f *= random.uniform(0.90, 0.97)
    if rainfall > 30:
        weather_f *= random.uniform(0.92, 0.97)

    actual_yield = round(
        base_yield * area * age_f * weather_f * random.uniform(0.93, 1.07), 1
    )
    if prev_yield is not None:
        actual_yield = round(0.7 * actual_yield + 0.3 * prev_yield, 1)

    # Confidence
    confidence = 85
    if prev_yield is not None:
        confidence += 5
    if 24 <= temp <= 32:
        confidence += 2
    if 60 <= humidity <= 85:
        confidence += 2
    if rainfall > 40:
        confidence -= 5
    if maturity < 50:
        confidence -= 8
    confidence = clamp(confidence, 50, 97)

    today          = date.today()
    harvest_day    = today + timedelta(days=days_to)
    window_start   = harvest_day.isoformat()
    window_end     = (harvest_day + timedelta(days=2)).isoformat()

    return {
        "sample_id":              sample_id,
        "mulberry_variety":       variety,
        "plantation_age_years":   age,
        "area_acres":             area,
        "season":                 season,
        "days_since_last_harvest": days_since,
        "previous_yield_kg":      prev_yield if prev_yield is not None else "",
        "leaf_maturity_pct":      maturity,
        "temperature_celsius":    temp,
        "humidity_pct":           humidity,
        "rainfall_mm":            rainfall,
        "days_to_optimal_harvest": days_to,
        "actual_yield_kg":        actual_yield,
        "harvest_window_start":   window_start,
        "harvest_window_end":     window_end,
        "confidence_score":       confidence,
    }


def _gain_rate(temp, humidity, season):
    base = 1.2
    if 24 <= temp <= 32:
        t = 1.0 + (temp - 24) / 8 * 0.2
    elif temp < 24:
        t = max(0.6, 1.0 - (24 - temp) * 0.04)
    else:
        t = max(0.7, 1.0 - (temp - 32) * 0.03)

    if 60 <= humidity <= 85:
        h = 1.0
    elif humidity < 60:
        h = max(0.75, 1.0 - (60 - humidity) * 0.01)
    else:
        h = max(0.85, 1.0 - (humidity - 85) * 0.005)

    s = {"monsoon": 1.15, "summer": 0.95, "winter": 0.80}.get(season, 1.0)
    return base * t * h * s


if __name__ == "__main__":
    output_file = "harvest_dataset.csv"
    n_samples   = 1000

    samples = [generate_sample(i + 1) for i in range(n_samples)]

    with open(output_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(samples)

    print(f"Generated {n_samples} samples → {output_file}")

    # Quick stats
    yields = [s["actual_yield_kg"] for s in samples]
    days   = [s["days_to_optimal_harvest"] for s in samples]
    print(f"Yield  — min: {min(yields):.1f} kg  max: {max(yields):.1f} kg  avg: {sum(yields)/len(yields):.1f} kg")
    print(f"Days   — min: {min(days)}  max: {max(days)}  avg: {sum(days)/len(days):.1f}")
    print(f"Seasons: { {s: sum(1 for r in samples if r['season']==s) for s in ['normal','summer','monsoon','winter']} }")
