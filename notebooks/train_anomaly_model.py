from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[1]

DATA_PATH = PROJECT_ROOT / "data" / "processed_campaign_data.csv"
MODEL_PATH = PROJECT_ROOT / "models" / "isolation_forest.pkl"
RESULTS_PATH = PROJECT_ROOT / "data" / "anomaly_results.csv"


# ============================================================
# LOAD DATA
# ============================================================

print("=" * 70)
print("MARKETING WASTE DETECTOR - ANOMALY DETECTION")
print("=" * 70)

print("\nLoading processed data...")

df = pd.read_csv(DATA_PATH)

print(f"Loaded shape: {df.shape}")


# ============================================================
# SELECT FEATURES
# ============================================================

features = [
    "Impressions",
    "Clicks",
    "Spent",
    "Total_Conversion",
    "Approved_Conversion",
    "CTR",
    "CPC",
    "CVR",
    "CPA",
]


print("\nSelected features:")
for feature in features:
    print(f" - {feature}")


# ============================================================
# PREPARE DATA
# ============================================================

model_data = df[features].copy()

# Replace infinite values with NaN
model_data = model_data.replace([np.inf, -np.inf], np.nan)

# Fill missing metric values with 0.
# Missing CPC/CVR/CPA generally means the denominator was zero.
model_data = model_data.fillna(0)

print(f"\nRows used for anomaly detection: {len(model_data)}")


# ============================================================
# SCALE FEATURES
# ============================================================

print("\nScaling features...")

scaler = StandardScaler()

X = scaler.fit_transform(model_data)


# ============================================================
# TRAIN ISOLATION FOREST
# ============================================================

print("\nTraining Isolation Forest...")

model = IsolationForest(
    n_estimators=200,
    contamination=0.05,
    random_state=42,
    n_jobs=-1,
)

model.fit(X)


# ============================================================
# PREDICTIONS
# ============================================================

print("Detecting anomalies...")

predictions = model.predict(X)

# Isolation Forest:
#  1  = normal
# -1  = anomaly

df["anomaly_label"] = np.where(
    predictions == -1,
    "Anomaly",
    "Normal",
)

# Higher values = more unusual
df["anomaly_score"] = -model.decision_function(X)


# ============================================================
# ANOMALY REASON
# ============================================================

def generate_anomaly_reason(row):
    reasons = []

    if row["CPC"] > 0 and row["CPC"] >= df["CPC"].quantile(0.90):
        reasons.append("very high CPC")

    if row["CPA"] > 0 and row["CPA"] >= df["CPA"].quantile(0.90):
        reasons.append("very high CPA")

    if row["Spent"] >= df["Spent"].quantile(0.90):
        reasons.append("unusually high spend")

    if row["Clicks"] >= 10 and row["Approved_Conversion"] == 0:
        reasons.append("clicks without approved conversions")

    if row["CTR"] > 0 and row["CTR"] <= df["CTR"].quantile(0.10):
        reasons.append("unusually low CTR")

    if not reasons:
        reasons.append("unusual combination of marketing metrics")

    return "; ".join(reasons)


df["anomaly_reason"] = df.apply(
    generate_anomaly_reason,
    axis=1,
)


# ============================================================
# SAVE RESULTS
# ============================================================

df.to_csv(RESULTS_PATH, index=False)

print(f"\nResults saved to:")
print(RESULTS_PATH)


# ============================================================
# SAVE MODEL + SCALER
# ============================================================

model_package = {
    "model": model,
    "scaler": scaler,
    "features": features,
}

joblib.dump(model_package, MODEL_PATH)

print("\nModel saved to:")
print(MODEL_PATH)


# ============================================================
# SUMMARY
# ============================================================

anomaly_count = (df["anomaly_label"] == "Anomaly").sum()
normal_count = (df["anomaly_label"] == "Normal").sum()

print("\n" + "=" * 70)
print("ANOMALY SUMMARY")
print("=" * 70)

print(f"Normal rows  : {normal_count}")
print(f"Anomalies    : {anomaly_count}")
print(f"Anomaly rate : {(anomaly_count / len(df)) * 100:.2f}%")


# ============================================================
# TOP ANOMALIES
# ============================================================

print("\n" + "=" * 70)
print("TOP 10 ANOMALIES")
print("=" * 70)

top_anomalies = (
    df[df["anomaly_label"] == "Anomaly"]
    .sort_values("anomaly_score", ascending=False)
    .head(10)
)

columns_to_show = [
    "ad_id",
    "Spent",
    "Clicks",
    "Approved_Conversion",
    "CTR",
    "CPC",
    "CVR",
    "CPA",
    "anomaly_score",
    "anomaly_reason",
]

print(
    top_anomalies[columns_to_show].to_string(index=False)
)


print("\n" + "=" * 70)
print("DONE")
print("=" * 70)