from pathlib import Path

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[1]

DATA_PATH = PROJECT_ROOT / "data" / "KAG_conversion_data.csv"
MODEL_PATH = PROJECT_ROOT / "models" / "conversion_prediction_model.pkl"
RESULTS_PATH = PROJECT_ROOT / "data" / "conversion_predictions.csv"


# ============================================================
# LOAD DATA
# ============================================================

print("=" * 70)
print("MARKETING WASTE DETECTOR - CONVERSION PREDICTION")
print("=" * 70)

print("\nLoading data...")

df = pd.read_csv(DATA_PATH)

print(f"Original shape: {df.shape}")


# ============================================================
# CLEAN COLUMN NAMES
# ============================================================

df.columns = df.columns.str.strip()


# ============================================================
# CREATE TARGET
# ============================================================

# Target:
# 1 = at least one approved conversion
# 0 = no approved conversion

df["conversion_target"] = (
    df["Approved_Conversion"] > 0
).astype(int)


print("\nTarget distribution:")

print(
    df["conversion_target"]
    .value_counts()
    .rename(index={
        0: "No Conversion",
        1: "Conversion"
    })
)


# ============================================================
# FEATURES
# ============================================================

features = [
    "Impressions",
    "Clicks",
    "Spent",
    "age",
    "gender",
    "interest",
    "xyz_campaign_id",
    "fb_campaign_id",
]

target = "conversion_target"


print("\nFeatures used:")

for feature in features:
    print(f" - {feature}")

print(f"\nTarget: {target}")


# ============================================================
# PREPARE X AND Y
# ============================================================

X = df[features].copy()
y = df[target].copy()


# ============================================================
# DEFINE FEATURE TYPES
# ============================================================

numeric_features = [
    "Impressions",
    "Clicks",
    "Spent",
    "interest",
    "xyz_campaign_id",
    "fb_campaign_id",
]

categorical_features = [
    "age",
    "gender",
]


# ============================================================
# PREPROCESSING
# ============================================================

numeric_pipeline = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(strategy="median"),
        )
    ]
)


categorical_pipeline = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(strategy="most_frequent"),
        ),
        (
            "onehot",
            OneHotEncoder(
                handle_unknown="ignore"
            ),
        ),
    ]
)


preprocessor = ColumnTransformer(
    transformers=[
        (
            "numeric",
            numeric_pipeline,
            numeric_features,
        ),
        (
            "categorical",
            categorical_pipeline,
            categorical_features,
        ),
    ]
)


# ============================================================
# MODEL
# ============================================================

model = RandomForestClassifier(
    n_estimators=300,
    random_state=42,
    class_weight="balanced",
    n_jobs=-1,
)


pipeline = Pipeline(
    steps=[
        (
            "preprocessor",
            preprocessor,
        ),
        (
            "model",
            model,
        ),
    ]
)


# ============================================================
# TRAIN / TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)


print("\nTrain shape:", X_train.shape)
print("Test shape :", X_test.shape)


# ============================================================
# TRAIN
# ============================================================

print("\nTraining Random Forest...")

pipeline.fit(
    X_train,
    y_train,
)


print("Training completed.")


# ============================================================
# PREDICTIONS
# ============================================================

print("\nGenerating predictions...")

y_pred = pipeline.predict(X_test)

y_probability = pipeline.predict_proba(X_test)[:, 1]


# ============================================================
# EVALUATION
# ============================================================

accuracy = accuracy_score(
    y_test,
    y_pred,
)

precision = precision_score(
    y_test,
    y_pred,
    zero_division=0,
)

recall = recall_score(
    y_test,
    y_pred,
    zero_division=0,
)

f1 = f1_score(
    y_test,
    y_pred,
    zero_division=0,
)

roc_auc = roc_auc_score(
    y_test,
    y_probability,
)


print("\n" + "=" * 70)
print("MODEL PERFORMANCE")
print("=" * 70)

print(f"Accuracy : {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall   : {recall:.4f}")
print(f"F1 Score : {f1:.4f}")
print(f"ROC-AUC  : {roc_auc:.4f}")


# ============================================================
# CLASSIFICATION REPORT
# ============================================================

print("\n" + "=" * 70)
print("CLASSIFICATION REPORT")
print("=" * 70)

print(
    classification_report(
        y_test,
        y_pred,
        target_names=[
            "No Conversion",
            "Conversion",
        ],
        zero_division=0,
    )
)


# ============================================================
# CONFUSION MATRIX
# ============================================================

print("=" * 70)
print("CONFUSION MATRIX")
print("=" * 70)

print(
    confusion_matrix(
        y_test,
        y_pred,
    )
)


# ============================================================
# CREATE TEST PREDICTION RESULTS
# ============================================================

results = X_test.copy()

results["actual_conversion"] = y_test.values

results["predicted_conversion"] = y_pred

results["conversion_probability"] = y_probability

results["conversion_probability"] = (
    results["conversion_probability"] * 100
).round(2)


# ============================================================
# CONVERSION PROBABILITY CATEGORY
# ============================================================

def probability_category(probability):
    if probability >= 70:
        return "High Potential"

    if probability >= 40:
        return "Medium Potential"

    return "Low Potential"


results["conversion_potential"] = (
    results["conversion_probability"]
    .apply(probability_category)
)


# ============================================================
# SAVE PREDICTIONS
# ============================================================

results.to_csv(
    RESULTS_PATH,
    index=False,
)


print("\nPredictions saved to:")

print(RESULTS_PATH)


# ============================================================
# SAVE MODEL
# ============================================================

model_package = {
    "pipeline": pipeline,
    "features": features,
    "target": target,
}


joblib.dump(
    model_package,
    MODEL_PATH,
)


print("\nModel saved to:")

print(MODEL_PATH)


# ============================================================
# SUMMARY
# ============================================================

print("\n" + "=" * 70)
print("CONVERSION POTENTIAL SUMMARY")
print("=" * 70)

print(
    results["conversion_potential"]
    .value_counts()
)


# ============================================================
# TOP HIGH-POTENTIAL EXAMPLES
# ============================================================

print("\n" + "=" * 70)
print("TOP 10 HIGH-POTENTIAL EXAMPLES")
print("=" * 70)

top_predictions = (
    results
    .sort_values(
        "conversion_probability",
        ascending=False,
    )
    .head(10)
)


print(
    top_predictions[
        [
            "Impressions",
            "Clicks",
            "Spent",
            "age",
            "gender",
            "interest",
            "conversion_probability",
            "conversion_potential",
        ]
    ].to_string(index=False)
)


print("\n" + "=" * 70)
print("DONE")
print("=" * 70)