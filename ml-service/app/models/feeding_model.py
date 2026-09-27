"""
Feeding Optimiser Model
========================
Biological formula baseline with optional ML adjustment.

Biological basis
----------------
Silkworm leaf consumption follows a well-documented progression across
instars. The 5th instar alone accounts for ~80 % of total consumption
for the full rearing cycle.

Reference consumption per 1000 silkworms per day (kg):
    Instar 1 : 0.02 kg
    Instar 2 : 0.10 kg
    Instar 3 : 0.35 kg
    Instar 4 : 1.20 kg
    Instar 5 : 3.80 kg   (peaks around day 4–5 of this instar)

Adjustments applied on top of the base rate:
  1. Instar-day progression  – consumption rises through each instar
  2. Leaf quality penalty     – poor quality → give a bit more to compensate
  3. Wastage feedback         – if previous wastage was high → reduce slightly
  4. Consumption feedback     – if worms ate more than recommended → increase

ML adjustment
-------------
Once historical feeding records accumulate, a lightweight regression
(XGBoost / Ridge) can be trained on (inputs → actual_consumed_kg) and
used to nudge the base formula prediction.  That hook is left as a
clearly marked TODO below.
"""

from __future__ import annotations
from typing import Any

# ─── Biological constants ─────────────────────────────────────────────────────

# Base kg per 1000 silkworms per day, by instar
BASE_KG_PER_1000: dict[int, float] = {
    1: 0.02,
    2: 0.10,
    3: 0.35,
    4: 1.20,
    5: 3.80,
}

# Feedings per day by instar (more frequent for younger worms)
FEEDINGS_PER_DAY: dict[int, int] = {
    1: 3,
    2: 3,
    3: 4,
    4: 4,
    5: 4,
}

# Expected day count per instar (used to compute intra-instar progression)
INSTAR_DURATION: dict[int, int] = {
    1: 4,
    2: 3,
    3: 4,
    4: 5,
    5: 7,
}

# Base wastage % by instar
BASE_WASTAGE_PCT: dict[int, float] = {
    1: 8.0,
    2: 7.0,
    3: 6.0,
    4: 5.5,
    5: 5.0,
}


# ─── Public API ───────────────────────────────────────────────────────────────

def optimise_feeding(
    silkworm_count: int,
    instar: int,
    batch_age_days: int,
    leaf_quality_score: float,
    previous_recommended_kg: float | None,
    previous_actual_kg: float | None,
    previous_wastage_pct: float | None,
) -> dict[str, Any]:

    explanation: list[str] = []

    # ── 1. Base consumption ────────────────────────────────────────────────
    base_rate = BASE_KG_PER_1000[instar]          # kg per 1000 worms/day
    daily_base = (silkworm_count / 1000) * base_rate

    explanation.append(
        f"Base consumption for {silkworm_count:,} silkworms at instar {instar}: "
        f"{daily_base:.2f} kg/day ({base_rate} kg per 1,000 worms)."
    )

    # ── 2. Intra-instar progression factor ────────────────────────────────
    # Worms eat more as they progress through an instar.
    # Estimate which day within the current instar we are.
    days_before_this_instar = sum(INSTAR_DURATION[i] for i in range(1, instar))
    day_in_instar = max(1, batch_age_days - days_before_this_instar)
    instar_dur    = INSTAR_DURATION[instar]
    progress      = min(1.0, day_in_instar / instar_dur)    # 0 → 1

    # Consumption rises from ~85 % at start of instar to 110 % at end
    progression_factor = 0.85 + progress * 0.25
    daily_kg = daily_base * progression_factor

    if progress > 0.6:
        explanation.append(
            f"Worms are {int(progress*100)}% through instar {instar} "
            f"(day ~{day_in_instar} of {instar_dur}). Appetite is near peak — "
            f"consumption multiplier: {progression_factor:.2f}×."
        )

    # ── 3. Leaf quality adjustment ─────────────────────────────────────────
    # Poor quality leaf → offer ~10–15% more to maintain nutrition intake
    if leaf_quality_score >= 80:
        quality_factor = 1.00
    elif leaf_quality_score >= 60:
        quality_factor = 1.05
        explanation.append(
            f"Leaf quality score is {leaf_quality_score:.0f}/100 (Good). "
            "A small 5% increase is applied to compensate."
        )
    elif leaf_quality_score >= 40:
        quality_factor = 1.10
        explanation.append(
            f"Leaf quality score is {leaf_quality_score:.0f}/100 (Moderate). "
            "A 10% increase is recommended to maintain nutrition."
        )
    else:
        quality_factor = 1.15
        explanation.append(
            f"Leaf quality score is {leaf_quality_score:.0f}/100 (Poor). "
            "A 15% increase is applied. Consider sourcing better quality leaves."
        )

    daily_kg *= quality_factor

    # ── 4. Wastage feedback adjustment ────────────────────────────────────
    wastage_factor = 1.0
    if previous_wastage_pct is not None:
        base_wastage = BASE_WASTAGE_PCT[instar]
        if previous_wastage_pct > base_wastage + 5:
            # Much higher wastage than expected → reduce offering
            wastage_factor = 0.93
            explanation.append(
                f"Previous wastage was {previous_wastage_pct:.1f}% "
                f"(expected ≤{base_wastage + 5:.0f}%). Reducing today's quantity by 7% to avoid waste."
            )
        elif previous_wastage_pct < base_wastage - 2:
            # Lower wastage than normal → worms may need more
            wastage_factor = 1.05
            explanation.append(
                f"Previous wastage was only {previous_wastage_pct:.1f}% "
                f"— worms consumed very efficiently. Increasing by 5%."
            )

    daily_kg *= wastage_factor

    # ── 5. Consumption feedback adjustment ────────────────────────────────
    if previous_recommended_kg is not None and previous_actual_kg is not None:
        if previous_actual_kg > previous_recommended_kg * 1.10:
            # Worms ate significantly more than recommended
            daily_kg *= 1.05
            explanation.append(
                f"Previous actual consumption ({previous_actual_kg:.1f} kg) exceeded "
                f"the recommendation ({previous_recommended_kg:.1f} kg) by more than 10%. "
                "Increasing today's quantity by 5%."
            )
        elif previous_actual_kg < previous_recommended_kg * 0.85:
            daily_kg *= 0.95
            explanation.append(
                f"Previous actual consumption ({previous_actual_kg:.1f} kg) was well below "
                f"the recommendation ({previous_recommended_kg:.1f} kg). "
                "Reducing today's quantity by 5%."
            )

    # ── TODO: ML adjustment hook ──────────────────────────────────────────
    # When enough historical records exist, load a trained model here:
    #
    #   ml_adjustment = load_feeding_model().predict([[
    #       silkworm_count, instar, batch_age_days,
    #       leaf_quality_score, previous_wastage_pct or base_wastage
    #   ]])[0]
    #   daily_kg = 0.7 * daily_kg + 0.3 * ml_adjustment
    #
    # ─────────────────────────────────────────────────────────────────────

    # ── 6. Round and compute schedule ─────────────────────────────────────
    daily_kg      = round(daily_kg, 1)
    feedings      = FEEDINGS_PER_DAY[instar]
    per_feed      = round(daily_kg / feedings, 2)

    # Wastage estimate
    base_w        = BASE_WASTAGE_PCT[instar]
    if previous_wastage_pct is not None:
        expected_wastage_pct = round((base_w * 0.6) + (previous_wastage_pct * 0.4), 1)
    else:
        expected_wastage_pct = base_w

    # Adjust wastage if quality is poor
    if leaf_quality_score < 60:
        expected_wastage_pct = round(expected_wastage_pct + 1.5, 1)

    expected_wastage_kg  = round(daily_kg * expected_wastage_pct / 100, 2)
    leaf_per_1000        = round((daily_kg / silkworm_count) * 1000, 3)

    # ── 7. Efficiency note ────────────────────────────────────────────────
    if expected_wastage_pct <= 5:
        efficiency_note = "High efficiency expected. Optimal feeding conditions."
    elif expected_wastage_pct <= 9:
        efficiency_note = "Normal efficiency. Monitor actual wastage after each session."
    else:
        efficiency_note = "Wastage may be elevated. Check leaf freshness and batch health."

    if not explanation:
        explanation.append(
            f"Standard feeding recommendation for instar {instar} batch."
        )

    return {
        "daily_quantity_kg":    daily_kg,
        "feedings_per_day":     feedings,
        "quantity_per_feed_kg": per_feed,
        "expected_wastage_pct": expected_wastage_pct,
        "expected_wastage_kg":  expected_wastage_kg,
        "leaf_per_1000_worms":  leaf_per_1000,
        "efficiency_note":      efficiency_note,
        "explanation":          explanation,
    }
