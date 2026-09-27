"""
Synthetic Feeding Dataset Generator
=====================================
1000 labelled feeding records for future ML model training.

Run:  python generate_feeding_dataset.py
Out:  feeding_dataset.csv
"""

import csv, random, math
random.seed(42)

BASE_KG = {1: 0.02, 2: 0.10, 3: 0.35, 4: 1.20, 5: 3.80}
INSTAR_DUR = {1: 4, 2: 3, 3: 4, 4: 5, 5: 7}
FEEDINGS   = {1: 3, 2: 3, 3: 4, 4: 4, 5: 4}
BASE_W     = {1: 8.0, 2: 7.0, 3: 6.0, 4: 5.5, 5: 5.0}

FIELDS = [
    "sample_id","silkworm_count","instar","batch_age_days",
    "leaf_quality_score","previous_recommended_kg","previous_actual_kg",
    "previous_wastage_pct","recommended_daily_kg","actual_consumed_kg",
    "feedings_per_day","quantity_per_feed_kg","actual_wastage_pct",
]

def gen(sid):
    instar  = random.randint(1,5)
    count   = random.randint(5000, 50000)
    days_before = sum(INSTAR_DUR[i] for i in range(1, instar))
    day_in  = random.randint(1, INSTAR_DUR[instar])
    age     = days_before + day_in
    lqs     = round(random.uniform(30, 98), 1)

    base    = (count/1000) * BASE_KG[instar]
    prog    = 0.85 + (day_in / INSTAR_DUR[instar]) * 0.25
    qf      = 1.0 if lqs >= 80 else (1.05 if lqs >= 60 else (1.10 if lqs >= 40 else 1.15))
    rec     = round(base * prog * qf, 1)

    prev_rec = round(rec * random.uniform(0.85, 1.10), 1) if random.random() > 0.2 else None
    prev_act = round(prev_rec * random.uniform(0.90, 1.10), 1) if prev_rec else None
    prev_w   = round(BASE_W[instar] + random.gauss(0, 2), 1) if prev_rec else None

    actual  = round(rec * random.uniform(0.88, 1.12), 1)
    act_w   = round(max(1, BASE_W[instar] + random.gauss(0, 2.5)), 1)

    return {
        "sample_id": sid,
        "silkworm_count": count,
        "instar": instar,
        "batch_age_days": age,
        "leaf_quality_score": lqs,
        "previous_recommended_kg": prev_rec or "",
        "previous_actual_kg": prev_act or "",
        "previous_wastage_pct": prev_w or "",
        "recommended_daily_kg": rec,
        "actual_consumed_kg": actual,
        "feedings_per_day": FEEDINGS[instar],
        "quantity_per_feed_kg": round(rec / FEEDINGS[instar], 2),
        "actual_wastage_pct": act_w,
    }

samples = [gen(i+1) for i in range(1000)]
with open("feeding_dataset.csv","w",newline="") as f:
    w = csv.DictWriter(f, fieldnames=FIELDS)
    w.writeheader(); w.writerows(samples)

print(f"Generated {len(samples)} samples → feeding_dataset.csv")
for instar in range(1,6):
    s = [r for r in samples if r["instar"]==instar]
    avg = sum(r["recommended_daily_kg"] for r in s)/len(s)
    print(f"  Instar {instar}  n={len(s)}  avg_rec={avg:.1f} kg/day")
