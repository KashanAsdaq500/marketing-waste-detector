import pandas as pd
import numpy as np
from pathlib import Path


# ============================================================
# MARKETING WASTE DETECTOR
# Data Preparation + Evidence-Based Risk Scoring
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_FILE = BASE_DIR / "data" / "KAG_conversion_data.csv"
OUTPUT_FILE = BASE_DIR / "data" / "processed_campaign_data.csv"


print("=" * 70)
print("MARKETING WASTE DETECTOR - DATA PREPARATION")
print("=" * 70)


# ============================================================
# 1. LOAD DATA
# ============================================================

print(f"\nReading dataset:")
print(INPUT_FILE)

df = pd.read_csv(INPUT_FILE)

print(f"\nOriginal shape: {df.shape}")


# ============================================================
# 2. CLEAN COLUMN NAMES
# ============================================================

df.columns = df.columns.str.strip()


# ============================================================
# 3. CONVERT NUMERIC COLUMNS
# ============================================================

numeric_columns = [
    "ad_id",
    "xyz_campaign_id",
    "fb_campaign_id",
    "interest",
    "Impressions",
    "Clicks",
    "Spent",
    "Total_Conversion",
    "Approved_Conversion",
]

for column in numeric_columns:
    df[column] = pd.to_numeric(
        df[column],
        errors="coerce"
    )


# ============================================================
# 4. CALCULATE MARKETING METRICS
# ============================================================

# CTR = Clicks / Impressions * 100
df["CTR"] = np.where(
    df["Impressions"] > 0,
    (df["Clicks"] / df["Impressions"]) * 100,
    np.nan
)


# CPC = Spend / Clicks
df["CPC"] = np.where(
    df["Clicks"] > 0,
    df["Spent"] / df["Clicks"],
    np.nan
)


# CVR = Approved Conversions / Clicks * 100
df["CVR"] = np.where(
    df["Clicks"] > 0,
    (df["Approved_Conversion"] / df["Clicks"]) * 100,
    np.nan
)


# CPA = Spend / Approved Conversions
df["CPA"] = np.where(
    df["Approved_Conversion"] > 0,
    df["Spent"] / df["Approved_Conversion"],
    np.nan
)


# ============================================================
# 5. BASIC EVIDENCE FLAGS
# ============================================================

df["has_spend"] = df["Spent"] > 0

df["has_clicks"] = df["Clicks"] > 0

df["has_conversions"] = (
    df["Approved_Conversion"] > 0
)


# Spend but no clicks
df["spent_without_clicks"] = (
    (df["Spent"] > 0)
    & (df["Clicks"] == 0)
)


# Meaningful traffic but no conversion
# We require at least 10 clicks so that
# one or two clicks do not create a strong waste signal.
df["clicked_without_conversion"] = (
    (df["Clicks"] >= 10)
    & (df["Approved_Conversion"] == 0)
)


# ============================================================
# 6. LEARN THRESHOLDS FROM THE DATASET
# ============================================================

ctr_q25 = df["CTR"].quantile(0.25)
ctr_q75 = df["CTR"].quantile(0.75)

cpc_q75 = df["CPC"].quantile(0.75)
cpc_q90 = df["CPC"].quantile(0.90)

cpa_q75 = df["CPA"].quantile(0.75)
cpa_q90 = df["CPA"].quantile(0.90)


# ============================================================
# 7. PERFORMANCE SIGNALS
# ============================================================

# Low CTR:
# Only evaluate ads that actually received impressions
# and spent some money.
df["low_ctr_signal"] = (
    (df["Spent"] > 0)
    & (df["Impressions"] >= 1000)
    & (df["Clicks"] >= 10)
    & (df["CTR"] < ctr_q25)
)


# High CPC:
# Require at least 10 clicks for meaningful evidence.
df["high_cpc_signal"] = (
    (df["Clicks"] >= 10)
    & (df["CPC"] > cpc_q75)
)


# Very high CPC
df["very_high_cpc_signal"] = (
    (df["Clicks"] >= 10)
    & (df["CPC"] > cpc_q90)
)


# High CPA:
# Require at least one conversion.
df["high_cpa_signal"] = (
    (df["Approved_Conversion"] > 0)
    & (df["CPA"] > cpa_q75)
)


# Very high CPA
df["very_high_cpa_signal"] = (
    (df["Approved_Conversion"] > 0)
    & (df["CPA"] > cpa_q90)
)


# ============================================================
# 8. WASTE RISK SCORE
# ============================================================

df["waste_risk_score"] = 0


# Low CTR = +1
df.loc[
    df["low_ctr_signal"],
    "waste_risk_score"
] += 1


# High CPC = +1
df.loc[
    df["high_cpc_signal"],
    "waste_risk_score"
] += 1


# Very high CPC = additional +1
df.loc[
    df["very_high_cpc_signal"],
    "waste_risk_score"
] += 1


# Meaningful clicks with zero conversions = +2
df.loc[
    df["clicked_without_conversion"],
    "waste_risk_score"
] += 2


# High CPA = +1
df.loc[
    df["high_cpa_signal"],
    "waste_risk_score"
] += 1


# Very high CPA = additional +1
df.loc[
    df["very_high_cpa_signal"],
    "waste_risk_score"
] += 1


# Spend without clicks = +1
df.loc[
    df["spent_without_clicks"],
    "waste_risk_score"
] += 1


# ============================================================
# 9. RISK CLASSIFICATION
# ============================================================

def classify_risk(score):
    if score >= 4:
        return "High Risk"

    if score >= 2:
        return "Medium Risk"

    return "Low Risk"


df["waste_risk"] = (
    df["waste_risk_score"]
    .apply(classify_risk)
)


# ============================================================
# 10. EVIDENCE STRENGTH
# ============================================================

def calculate_evidence_strength(row):

    if row["Clicks"] >= 50:
        return "Strong"

    if row["Clicks"] >= 10:
        return "Moderate"

    if row["Clicks"] > 0:
        return "Weak"

    if row["Spent"] > 0:
        return "Weak"

    return "Insufficient Data"


df["evidence_strength"] = df.apply(
    calculate_evidence_strength,
    axis=1
)


# ============================================================
# 11. HUMAN-READABLE EVIDENCE
# ============================================================

def create_evidence(row):

    signals = []

    if row["low_ctr_signal"]:
        signals.append("low CTR")

    if row["high_cpc_signal"]:
        signals.append("high CPC")

    if row["clicked_without_conversion"]:
        signals.append(
            "10+ clicks but no approved conversions"
        )

    if row["high_cpa_signal"]:
        signals.append("high CPA")

    if row["spent_without_clicks"]:
        signals.append("spend without clicks")

    if not signals:
        return "No major waste signal detected"

    return ", ".join(signals)


df["waste_evidence"] = df.apply(
    create_evidence,
    axis=1
)


# ============================================================
# 12. DATA QUALITY FLAGS
# ============================================================

df["data_quality_flag"] = "OK"


# Flag unusual records where conversions exist
# despite zero clicks.
df.loc[
    (df["Approved_Conversion"] > 0)
    & (df["Clicks"] == 0),
    "data_quality_flag"
] = "Review: conversions without clicks"


# Flag negative values if any appear.
negative_columns = [
    "Impressions",
    "Clicks",
    "Spent",
    "Total_Conversion",
    "Approved_Conversion",
]

for column in negative_columns:

    df.loc[
        df[column] < 0,
        "data_quality_flag"
    ] = "Review: negative value"


# ============================================================
# 13. SAVE PROCESSED DATA
# ============================================================

df.to_csv(
    OUTPUT_FILE,
    index=False
)


# ============================================================
# 14. SUMMARY
# ============================================================

print("\n" + "=" * 70)
print("DATA PREPARATION COMPLETE")
print("=" * 70)

print(f"\nProcessed shape: {df.shape}")


print("\nCalculated metrics:")
print("  - CTR")
print("  - CPC")
print("  - CVR")
print("  - CPA")


print("\nRisk distribution:")
print(
    df["waste_risk"]
    .value_counts()
    .to_string()
)


print("\nRisk percentages:")
print(
    (
        df["waste_risk"]
        .value_counts(normalize=True)
        * 100
    )
    .round(2)
    .to_string()
)


print("\nEvidence strength:")
print(
    df["evidence_strength"]
    .value_counts()
    .to_string()
)


print("\nData quality:")
print(
    df["data_quality_flag"]
    .value_counts()
    .to_string()
)


print("\nLearned thresholds:")
print(
    f"CTR 25th percentile : {ctr_q25:.4f}%"
)

print(
    f"CTR 75th percentile : {ctr_q75:.4f}%"
)

print(
    f"CPC 75th percentile : {cpc_q75:.4f}"
)

print(
    f"CPC 90th percentile : {cpc_q90:.4f}"
)

print(
    f"CPA 75th percentile : {cpa_q75:.4f}"
)

print(
    f"CPA 90th percentile : {cpa_q90:.4f}"
)


print("\nTotal spend by risk:")
print(
    df.groupby("waste_risk")["Spent"]
    .agg(["count", "sum", "mean"])
    .round(2)
    .to_string()
)


print("\nOutput file:")
print(OUTPUT_FILE)


# ============================================================
# 15. SAMPLE RESULTS
# ============================================================

print("\nFirst 10 results:")

display_columns = [
    "ad_id",
    "Spent",
    "Clicks",
    "Approved_Conversion",
    "CTR",
    "CPC",
    "CVR",
    "CPA",
    "waste_risk_score",
    "waste_risk",
    "evidence_strength",
    "waste_evidence",
]

print(
    df[display_columns]
    .head(10)
    .to_string(index=False)
)


print("\n" + "=" * 70)
print("DONE")
print("=" * 70)