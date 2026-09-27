"""
Cocoon & Silk Yield Prediction Model
======================================
Sericulture domain-knowledge prediction model.

Establishes expected cocoon yield, shell ratio, cocoon quality grade,
raw silk yield, and silk recovery rate based on:
  - Silkworm population size
  - Rearing instar stage & batch age
  - Leaf quality score (0-100)
  - Feeding quantity & efficiency / wastage
  - Rearing ambient temperature & humidity
"""

from typing import Any, List


def predict_cocoon_silk_yield(
    silkworm_count: int,
    instar: int = 5,
    batch_age_days: int = 25,
    leaf_quality_score: float = 85.0,
    total_feeding_kg: float | None = None,
    feeding_efficiency_pct: float | None = None,
    wastage_pct: float | None = None,
    temperature_celsius: float | None = 27.0,
    humidity_pct: float | None = 75.0,
) -> dict[str, Any]:

    explanation: List[str] = []

    # 1. Base Cocoon Yield Calculation
    # Standard healthy yield is approx 21.0 kg per 10,000 silkworms (2.1 kg / 1000 worms)
    base_cocoon_per_1000 = 2.10
    base_yield = (silkworm_count / 1000.0) * base_cocoon_per_1000
    explanation.append(
        f"Base expected cocoon yield for {silkworm_count:,} silkworms: {base_yield:.1f} kg."
    )

    # 2. Leaf Quality Adjustment
    # Optimal leaf quality is 80+. Lower quality reduces cocoon weight & silk gland development.
    if leaf_quality_score >= 85:
        quality_factor = 1.03
        explanation.append(
            f"High leaf quality score ({leaf_quality_score:.0f}/100) enhances cocoon weight and shell ratio."
        )
    elif leaf_quality_score >= 70:
        quality_factor = 1.00
    elif leaf_quality_score >= 50:
        quality_factor = 0.90
        explanation.append(
            f"Moderate leaf quality score ({leaf_quality_score:.0f}/100) reduces overall cocoon build by ~10%."
        )
    else:
        quality_factor = 0.78
        explanation.append(
            f"Poor leaf quality score ({leaf_quality_score:.0f}/100) significantly impacts cocoon development (-22%)."
        )

    # 3. Feeding Efficiency & Wastage Adjustment
    feeding_factor = 1.0
    if wastage_pct is not None:
        if wastage_pct > 10.0:
            feeding_factor *= 0.93
            explanation.append(
                f"High leaf wastage ({wastage_pct:.1f}%) indicates reduced ingestion efficiency."
            )
        elif wastage_pct <= 5.0:
            feeding_factor *= 1.02
            explanation.append(
                f"Optimal leaf consumption with low wastage ({wastage_pct:.1f}%)."
            )

    if feeding_efficiency_pct is not None:
        if feeding_efficiency_pct >= 90:
            feeding_factor *= 1.02
        elif feeding_efficiency_pct < 75:
            feeding_factor *= 0.92

    # 4. Environmental Rearing Factors
    env_factor = 1.0
    temp = temperature_celsius if temperature_celsius is not None else 27.0
    hum = humidity_pct if humidity_pct is not None else 75.0

    if 24.0 <= temp <= 28.0 and 70.0 <= hum <= 80.0:
        env_factor *= 1.02
        explanation.append(f"Optimal rearing environment (Temp: {temp}°C, Humidity: {hum}%).")
    else:
        if temp < 22.0 or temp > 30.0:
            env_factor *= 0.92
            explanation.append(f"Sub-optimal rearing temperature ({temp}°C) lowers cocoon weight.")
        if hum < 60.0 or hum > 85.0:
            env_factor *= 0.95
            explanation.append(f"Sub-optimal humidity ({hum}%) affects spinning consistency.")

    # 5. Compute Final Cocoon Prediction
    cocoon_yield_kg = round(base_yield * quality_factor * feeding_factor * env_factor, 1)

    # 6. Cocoon Metrics: Avg Weight & Shell Ratio
    base_weight = 1.75  # grams
    avg_cocoon_weight = round(base_weight * (0.85 + (quality_factor * 0.15)), 2)

    base_shell_ratio = 20.5  # %
    shell_ratio = round(min(24.5, max(15.0, base_shell_ratio * quality_factor * (env_factor ** 0.5))), 1)

    # Quality Grade Determination
    if leaf_quality_score >= 80 and shell_ratio >= 21.0:
        quality_grade = "Grade A"
    elif leaf_quality_score >= 60 and shell_ratio >= 18.5:
        quality_grade = "Grade B"
    else:
        quality_grade = "Grade C"

    # 7. Stage 2: Silk Production & Recovery Rate Calculation
    # Silk recovery is derived from shell weight and reelability (~70-80% of shell mass)
    recovery_rate = round(shell_ratio * 0.73, 1)  # e.g., 22.5% shell ratio -> ~16.4% silk recovery
    silk_yield_kg = round(cocoon_yield_kg * (recovery_rate / 100.0), 1)

    # Filament Length
    if quality_grade == "Grade A":
        filament_length = "950 - 1150 meters"
    elif quality_grade == "Grade B":
        filament_length = "750 - 950 meters"
    else:
        filament_length = "550 - 750 meters"

    # 8. Confidence Score
    confidence = 88.0
    if total_feeding_kg is not None:
        confidence += 3
    if wastage_pct is not None:
        confidence += 2
    if leaf_quality_score >= 80:
        confidence += 2
    confidence = round(min(96.0, confidence), 1)

    return {
        "predicted_cocoon_yield_kg": cocoon_yield_kg,
        "average_cocoon_weight_gram": avg_cocoon_weight,
        "shell_ratio_pct": shell_ratio,
        "quality_grade": quality_grade,
        "predicted_silk_yield_kg": silk_yield_kg,
        "silk_recovery_rate_pct": recovery_rate,
        "filament_length": filament_length,
        "confidence_score": confidence,
        "explanation": explanation,
    }
