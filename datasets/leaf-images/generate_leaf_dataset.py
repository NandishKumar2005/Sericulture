"""
Synthetic Leaf Quality Dataset Generator
==========================================
Generates a labelled metadata CSV for mulberry leaf quality classification.

Each row represents one leaf image observation with extracted visual
features and a ground-truth quality label.

In production, replace the synthetic feature values with real features
extracted from actual leaf photos using OpenCV (see leaf_model.py).

Run:
    python generate_leaf_dataset.py

Output:
    leaf_quality_dataset.csv   (1200 samples, balanced across 4 classes)
"""

import csv
import random
import math

random.seed(2026)

FIELDNAMES = [
    "sample_id",
    "quality_label",          # Excellent | Good | Moderate | Poor
    "quality_score",          # 0–100
    # Color features (HSV)
    "hue_mean",               # degrees 0–180 (OpenCV HSV)
    "saturation_mean",        # 0–255
    "value_mean",             # 0–255 (brightness)
    "green_ratio",            # fraction of pixels in green HSV range
    "yellow_ratio",           # yellowing indicator
    "brown_ratio",            # browning / disease indicator
    # Texture features
    "contrast",               # GLCM contrast
    "homogeneity",            # GLCM homogeneity
    "energy",                 # GLCM energy
    "edge_density",           # Canny edge pixel ratio (spots, damage)
    # Morphology
    "leaf_area_ratio",        # leaf pixels / bounding box area
    "aspect_ratio",           # bounding box width/height
    "solidity",               # contour area / convex hull area
    # Lighting / background conditions
    "lighting_condition",     # bright | dim | mixed
    "background",             # white | field | dark | mixed
    "leaf_age_stage",         # young | mature | old
    # Derived
    "damage_score",           # 0–100 (higher = more damage)
    "estimated_maturity_pct", # 0–100
    "feeding_suitability",    # Suitable | Marginal | Unsuitable
]

# ─── Quality profile definitions ───────────────────────────────────────────

PROFILES = {
    "Excellent": {
        "score_range":      (88, 100),
        "hue":              (52, 72),       # healthy green
        "saturation":       (130, 200),
        "value":            (100, 180),
        "green_ratio":      (0.65, 0.90),
        "yellow_ratio":     (0.00, 0.05),
        "brown_ratio":      (0.00, 0.02),
        "contrast":         (0.5, 2.0),
        "homogeneity":      (0.75, 0.95),
        "energy":           (0.15, 0.35),
        "edge_density":     (0.02, 0.08),
        "leaf_area_ratio":  (0.70, 0.92),
        "aspect_ratio":     (0.80, 1.30),
        "solidity":         (0.90, 0.99),
        "damage_score":     (0, 8),
        "maturity":         (78, 92),
        "suitability":      "Suitable",
        "age_stages":       ["mature"],
        "lighting":         ["bright", "mixed"],
        "backgrounds":      ["white", "field", "dark", "mixed"],
    },
    "Good": {
        "score_range":      (70, 87),
        "hue":              (45, 78),
        "saturation":       (100, 180),
        "value":            (90, 190),
        "green_ratio":      (0.50, 0.75),
        "yellow_ratio":     (0.03, 0.15),
        "brown_ratio":      (0.01, 0.06),
        "contrast":         (1.0, 4.0),
        "homogeneity":      (0.60, 0.82),
        "energy":           (0.10, 0.28),
        "edge_density":     (0.05, 0.15),
        "leaf_area_ratio":  (0.60, 0.88),
        "aspect_ratio":     (0.75, 1.45),
        "solidity":         (0.82, 0.95),
        "damage_score":     (5, 22),
        "maturity":         (65, 85),
        "suitability":      "Suitable",
        "age_stages":       ["young", "mature"],
        "lighting":         ["bright", "dim", "mixed"],
        "backgrounds":      ["white", "field", "dark", "mixed"],
    },
    "Moderate": {
        "score_range":      (45, 69),
        "hue":              (30, 80),
        "saturation":       (70, 150),
        "value":            (80, 200),
        "green_ratio":      (0.30, 0.60),
        "yellow_ratio":     (0.10, 0.30),
        "brown_ratio":      (0.04, 0.18),
        "contrast":         (2.5, 7.0),
        "homogeneity":      (0.45, 0.68),
        "energy":           (0.07, 0.20),
        "edge_density":     (0.10, 0.28),
        "leaf_area_ratio":  (0.50, 0.78),
        "aspect_ratio":     (0.65, 1.60),
        "solidity":         (0.70, 0.88),
        "damage_score":     (18, 45),
        "maturity":         (45, 70),
        "suitability":      "Marginal",
        "age_stages":       ["young", "mature", "old"],
        "lighting":         ["bright", "dim", "mixed"],
        "backgrounds":      ["white", "field", "dark", "mixed"],
    },
    "Poor": {
        "score_range":      (10, 44),
        "hue":              (15, 45),       # yellowed / browned
        "saturation":       (30, 120),
        "value":            (60, 220),
        "green_ratio":      (0.05, 0.35),
        "yellow_ratio":     (0.25, 0.60),
        "brown_ratio":      (0.15, 0.50),
        "contrast":         (5.0, 14.0),
        "homogeneity":      (0.25, 0.52),
        "energy":           (0.04, 0.14),
        "edge_density":     (0.22, 0.55),
        "leaf_area_ratio":  (0.30, 0.65),
        "aspect_ratio":     (0.50, 1.80),
        "solidity":         (0.50, 0.76),
        "damage_score":     (40, 90),
        "maturity":         (15, 50),
        "suitability":      "Unsuitable",
        "age_stages":       ["young", "old"],
        "lighting":         ["bright", "dim", "mixed"],
        "backgrounds":      ["white", "field", "dark", "mixed"],
    },
}

SAMPLES_PER_CLASS = 300  # 4 × 300 = 1200 total, balanced


def rand_range(lo, hi, decimals=3):
    return round(random.uniform(lo, hi), decimals)


def generate_sample(sample_id: int, label: str) -> dict:
    p = PROFILES[label]

    score        = random.randint(*p["score_range"])
    hue          = rand_range(*p["hue"], 1)
    saturation   = rand_range(*p["saturation"], 1)
    value        = rand_range(*p["value"], 1)
    green_ratio  = rand_range(*p["green_ratio"])
    yellow_ratio = rand_range(*p["yellow_ratio"])
    brown_ratio  = rand_range(*p["brown_ratio"])

    # Ratios must sum ≤ 1
    total = green_ratio + yellow_ratio + brown_ratio
    if total > 0.98:
        scale = 0.95 / total
        green_ratio  = round(green_ratio  * scale, 3)
        yellow_ratio = round(yellow_ratio * scale, 3)
        brown_ratio  = round(brown_ratio  * scale, 3)

    contrast    = rand_range(*p["contrast"])
    homogeneity = rand_range(*p["homogeneity"])
    energy      = rand_range(*p["energy"])
    edge_density = rand_range(*p["edge_density"])

    leaf_area_ratio = rand_range(*p["leaf_area_ratio"])
    aspect_ratio    = rand_range(*p["aspect_ratio"])
    solidity        = rand_range(*p["solidity"])

    damage_score = random.randint(*p["damage_score"])
    maturity_pct = random.randint(*p["maturity"])

    lighting  = random.choice(p["lighting"])
    background = random.choice(p["backgrounds"])
    age_stage = random.choice(p["age_stages"])

    # Add noise to simulate real-world variability
    score = max(0, min(100, score + random.randint(-3, 3)))

    return {
        "sample_id":              sample_id,
        "quality_label":          label,
        "quality_score":          score,
        "hue_mean":               hue,
        "saturation_mean":        saturation,
        "value_mean":             value,
        "green_ratio":            green_ratio,
        "yellow_ratio":           yellow_ratio,
        "brown_ratio":            brown_ratio,
        "contrast":               contrast,
        "homogeneity":            homogeneity,
        "energy":                 energy,
        "edge_density":           edge_density,
        "leaf_area_ratio":        leaf_area_ratio,
        "aspect_ratio":           aspect_ratio,
        "solidity":               solidity,
        "lighting_condition":     lighting,
        "background":             background,
        "leaf_age_stage":         age_stage,
        "damage_score":           damage_score,
        "estimated_maturity_pct": maturity_pct,
        "feeding_suitability":    p["suitability"],
    }


if __name__ == "__main__":
    output_file = "leaf_quality_dataset.csv"
    labels      = ["Excellent", "Good", "Moderate", "Poor"]
    samples     = []

    sid = 1
    for label in labels:
        for _ in range(SAMPLES_PER_CLASS):
            samples.append(generate_sample(sid, label))
            sid += 1

    # Shuffle so classes are interleaved
    random.shuffle(samples)

    with open(output_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(samples)

    print(f"Generated {len(samples)} samples → {output_file}")

    # Stats
    for label in labels:
        subset = [s for s in samples if s["quality_label"] == label]
        scores = [s["quality_score"] for s in subset]
        print(f"  {label:10s}  n={len(subset)}  score avg={sum(scores)/len(scores):.1f}  "
              f"min={min(scores)}  max={max(scores)}")
