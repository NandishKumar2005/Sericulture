"""
Mulberry Leaf Quality Analysis Model
======================================
Computer Vision pipeline using OpenCV for feature extraction.

Pipeline:
  1. Decode base64 image
  2. Pre-process (resize, segment leaf from background)
  3. Extract colour features from HSV colour space
  4. Extract texture features (edge density as damage proxy)
  5. Classify into: Excellent | Good | Moderate | Poor
  6. Generate quality score and human-readable observations

No pre-trained weights needed — this is a deterministic CV analyser.
When labelled leaf images are available, swap classify_features() with
a trained CNN/EfficientNet model loaded from ml-models/leaf-quality/.
"""

from __future__ import annotations

import base64
import math
from typing import Any

import cv2
import numpy as np


# ─── Thresholds (tuned from domain knowledge and dataset profiles) ─────────

# Green leaf HSV range (OpenCV: H 0-180, S 0-255, V 0-255)
GREEN_H_LOW,  GREEN_H_HIGH  = 35,  85
GREEN_S_LOW,  GREEN_S_HIGH  = 50, 255
GREEN_V_LOW,  GREEN_V_HIGH  = 40, 255

# Yellow leaf range (aging / nutrient deficiency)
YELLOW_H_LOW, YELLOW_H_HIGH = 20,  35
YELLOW_S_LOW                 = 50

# Brown / disease range
BROWN_H_LOW,  BROWN_H_HIGH  = 5,  22
BROWN_S_LOW                  = 40


# ─── Public API ─────────────────────────────────────────────────────────────

def analyse_leaf(image_base64: str) -> dict[str, Any]:
    """
    Full analysis pipeline.
    Returns a dict matching LeafAnalysisOutput schema.
    """
    img_bgr = _decode_image(image_base64)
    img_hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)

    # ── Step 1: Segment leaf pixels (exclude near-white/near-black background)
    leaf_mask = _get_leaf_mask(img_hsv, img_bgr)

    total_leaf_px = int(leaf_mask.sum())
    if total_leaf_px < 500:
        # Very few leaf pixels — likely no leaf detected
        return _fallback_result("Could not detect a leaf in the image. "
                                "Ensure the leaf is clearly visible against the background.")

    # ── Step 2: Colour ratios (on leaf pixels only)
    green_ratio  = _colour_ratio(img_hsv, leaf_mask, "green")
    yellow_ratio = _colour_ratio(img_hsv, leaf_mask, "yellow")
    brown_ratio  = _colour_ratio(img_hsv, leaf_mask, "brown")

    # ── Step 3: Texture / damage (edge density on leaf region)
    gray         = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    edges        = cv2.Canny(gray, 50, 150)
    edge_px      = int((edges > 0).sum())
    edge_density = edge_px / max(total_leaf_px, 1)

    # ── Step 4: Mean HSV of leaf pixels
    h_vals = img_hsv[:, :, 0][leaf_mask > 0]
    s_vals = img_hsv[:, :, 1][leaf_mask > 0]
    v_vals = img_hsv[:, :, 2][leaf_mask > 0]
    hue_mean  = float(np.mean(h_vals))  if len(h_vals) > 0 else 60.0
    sat_mean  = float(np.mean(s_vals))  if len(s_vals) > 0 else 120.0
    val_mean  = float(np.mean(v_vals))  if len(v_vals) > 0 else 130.0

    # ── Step 5: Classify and score
    features = {
        "green_ratio":  green_ratio,
        "yellow_ratio": yellow_ratio,
        "brown_ratio":  brown_ratio,
        "edge_density": edge_density,
        "hue_mean":     hue_mean,
        "sat_mean":     sat_mean,
        "val_mean":     val_mean,
    }
    result = classify_features(features)
    return result


# ─── Classification engine ──────────────────────────────────────────────────

def classify_features(f: dict) -> dict[str, Any]:
    green  = f["green_ratio"]
    yellow = f["yellow_ratio"]
    brown  = f["brown_ratio"]
    edge   = f["edge_density"]
    hue    = f["hue_mean"]
    sat    = f["sat_mean"]
    val    = f["val_mean"]

    observations: list[str] = []

    # ── Damage score (0–100)
    damage_score = round(
        min(100, (yellow * 60) + (brown * 80) + (edge * 120)),
        1
    )

    # ── Maturity estimate from hue + saturation
    # Optimal green = hue 50-75, high saturation
    if 50 <= hue <= 75 and sat >= 100:
        maturity_pct = round(min(95, 65 + (green * 40)), 1)
        maturity_stage = "Optimal"
    elif hue > 75 or sat < 80:
        maturity_pct = round(max(20, 40 - (yellow * 30)), 1)
        maturity_stage = "Young"
    else:
        maturity_pct = round(max(15, 35 - (brown * 50)), 1)
        maturity_stage = "Over-mature"

    # ── Quality scoring
    # Green ratio contributes most (+60 pts max)
    # Yellow penalises   (-40 pts max)
    # Brown penalises    (-50 pts max)
    # Edge density       (-30 pts max, damage / tears)
    score = (
        40
        + (green  * 60)
        - (yellow * 40)
        - (brown  * 50)
        - (edge   * 30)
    )
    score = round(max(5, min(100, score)), 1)

    # ── Category
    if score >= 85:
        category     = "Excellent"
        suitability  = "Suitable"
    elif score >= 68:
        category     = "Good"
        suitability  = "Suitable"
    elif score >= 45:
        category     = "Moderate"
        suitability  = "Marginal"
    else:
        category     = "Poor"
        suitability  = "Unsuitable"

    # ── Confidence (based on how clearly the leaf falls into a bucket)
    # Higher confidence when score is far from thresholds (85/68/45)
    thresholds = [45, 68, 85]
    min_dist   = min(abs(score - t) for t in thresholds)
    confidence = round(min(97, 65 + min_dist * 1.8), 1)

    # ── Colour tone label
    if green >= 0.55:
        color_tone = "Dark Green"
    elif green >= 0.35:
        color_tone = "Light Green"
    elif yellow >= 0.25:
        color_tone = "Yellowish"
    else:
        color_tone = "Brownish"

    # ── Texture label
    if edge < 0.10:
        texture = "Smooth"
    elif edge < 0.22:
        texture = "Slightly Rough"
    else:
        texture = "Rough"

    # ── Visible damage label
    if damage_score < 10:
        visible_damage = "None"
    elif damage_score < 28:
        visible_damage = "Minor"
    elif damage_score < 55:
        visible_damage = "Moderate"
    else:
        visible_damage = "Severe"

    # ── Build observations
    if green >= 0.65:
        observations.append(
            f"Leaf shows strong green pigmentation ({green*100:.0f}% green coverage), "
            "indicating healthy chlorophyll levels."
        )
    if yellow > 0.10:
        observations.append(
            f"Yellowing detected ({yellow*100:.0f}% of leaf area). This may indicate "
            "nutrient deficiency, aging, or early disease stress."
        )
    if brown > 0.08:
        observations.append(
            f"Browning or discolouration detected ({brown*100:.0f}% of leaf area). "
            "Inspect for fungal infection or physical damage."
        )
    if edge > 0.20:
        observations.append(
            "High edge density suggests visible spots, tears, or insect damage. "
            "Examine leaf surface closely before feeding."
        )
    if maturity_stage == "Young":
        observations.append(
            "Leaf appears to be at an early growth stage. "
            "Consider waiting for fuller maturity for better nutritional value."
        )
    elif maturity_stage == "Over-mature":
        observations.append(
            "Leaf shows signs of over-maturity. "
            "Harvest soon to prevent further quality decline."
        )
    if not observations:
        observations.append(
            "Leaf appears healthy with no significant visual issues detected."
        )

    return {
        "quality_score":           score,
        "quality_category":        category,
        "feeding_suitability":     suitability,
        "confidence":              confidence,
        "color_tone":              color_tone,
        "maturity_stage":          maturity_stage,
        "texture":                 texture,
        "visible_damage":          visible_damage,
        "green_ratio":             round(green,  3),
        "yellow_ratio":            round(yellow, 3),
        "brown_ratio":             round(brown,  3),
        "damage_score":            damage_score,
        "estimated_maturity_pct":  maturity_pct,
        "observations":            observations,
    }


# ─── Image helpers ──────────────────────────────────────────────────────────

def _decode_image(image_base64: str) -> np.ndarray:
    """Decode base64 string → BGR numpy array."""
    # Strip data URI prefix if present
    if "," in image_base64:
        image_base64 = image_base64.split(",", 1)[1]

    img_bytes = base64.b64decode(image_base64)
    img_array = np.frombuffer(img_bytes, dtype=np.uint8)
    img_bgr   = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

    if img_bgr is None:
        raise ValueError("Could not decode image. Ensure the base64 data is a valid image.")

    # Resize to standard working size (preserve aspect ratio)
    h, w = img_bgr.shape[:2]
    max_dim = 640
    if max(h, w) > max_dim:
        scale   = max_dim / max(h, w)
        img_bgr = cv2.resize(img_bgr, (int(w * scale), int(h * scale)))

    return img_bgr


def _get_leaf_mask(img_hsv: np.ndarray, img_bgr: np.ndarray) -> np.ndarray:
    """
    Create a binary mask of leaf pixels by excluding:
    - Near-white backgrounds (high V, low S)
    - Near-black backgrounds (very low V)
    - Very bright overexposed regions
    """
    # Exclude near-white (background)
    white_mask = (
        (img_hsv[:, :, 1] < 40) &
        (img_hsv[:, :, 2] > 200)
    )
    # Exclude near-black
    black_mask = img_hsv[:, :, 2] < 25

    leaf_mask = (~white_mask & ~black_mask).astype(np.uint8)

    # Morphological cleanup — remove noise
    kernel    = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    leaf_mask = cv2.morphologyEx(leaf_mask, cv2.MORPH_OPEN,  kernel)
    leaf_mask = cv2.morphologyEx(leaf_mask, cv2.MORPH_CLOSE, kernel)

    return leaf_mask


def _colour_ratio(img_hsv: np.ndarray, leaf_mask: np.ndarray, colour: str) -> float:
    """
    Fraction of leaf pixels matching the given colour range.
    colour: "green" | "yellow" | "brown"
    """
    h = img_hsv[:, :, 0]
    s = img_hsv[:, :, 1]
    v = img_hsv[:, :, 2]

    if colour == "green":
        mask = (
            (h >= GREEN_H_LOW)  & (h <= GREEN_H_HIGH) &
            (s >= GREEN_S_LOW)  & (s <= GREEN_S_HIGH) &
            (v >= GREEN_V_LOW)  & (v <= GREEN_V_HIGH)
        )
    elif colour == "yellow":
        mask = (
            (h >= YELLOW_H_LOW) & (h <= YELLOW_H_HIGH) &
            (s >= YELLOW_S_LOW)
        )
    elif colour == "brown":
        mask = (
            (h >= BROWN_H_LOW)  & (h <= BROWN_H_HIGH) &
            (s >= BROWN_S_LOW)
        )
    else:
        raise ValueError(f"Unknown colour: {colour}")

    colour_pixels = int((mask & (leaf_mask > 0)).sum())
    total_leaf_px = int(leaf_mask.sum())

    return round(colour_pixels / max(total_leaf_px, 1), 4)


def _fallback_result(message: str) -> dict[str, Any]:
    return {
        "quality_score":           0.0,
        "quality_category":        "Poor",
        "feeding_suitability":     "Unsuitable",
        "confidence":              0.0,
        "color_tone":              "Unknown",
        "maturity_stage":          "Unknown",
        "texture":                 "Unknown",
        "visible_damage":          "Unknown",
        "green_ratio":             0.0,
        "yellow_ratio":            0.0,
        "brown_ratio":             0.0,
        "damage_score":            100.0,
        "estimated_maturity_pct":  0.0,
        "observations":            [message],
    }
