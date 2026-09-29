from pathlib import Path

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from xgboost import XGBClassifier


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[1]

DATA_PATH = PROJECT_ROOT / "data" / "KAG_conversion_data.csv"

RESULTS_PATH = (
    PROJECT_ROOT
    / "data"
    / "conversion_model_comparison.csv"
)

BEST_MODEL_PATH = (
    PROJECT_ROOT
    / "models"
    / "best_conversion_model.pkl"
)


# ============================================================
# LOAD DATA
# ============================================================

print("=" * 70)
print("MARKETING WASTE DETECTOR - MODEL COMPARISON")
print("=" * 70)

print("\nLoading data...")

df = pd.read_csv(DATA_PATH)

df.columns = df.columns.str.strip()

print(f"Dataset shape: {df.shape}")


# ============================================================
# TARGET
# ============================================================

df["conversion_target"] = (
    df["Approved_Conversion"] > 0
).astype(int)


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


X = df[features].copy()
y = df[target].copy()


# ============================================================
# FEATURE TYPES
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
            OneHotEncoder(handle_unknown="ignore"),
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
# TRAIN / TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)


print(f"\nTraining rows: {len(X_train)}")
print(f"Testing rows : {len(X_test)}")


# ============================================================
# MODELS
# ============================================================

models = {

    "Logistic Regression": LogisticRegression(
        max_iter=1000,
        class_weight="balanced",
        random_state=42,
    ),

    "Random Forest": RandomForestClassifier(
        n_estimators=300,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    ),

    "XGBoost": XGBClassifier(
        n_estimators=300,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        objective="binary:logistic",
        eval_metric="logloss",
        random_state=42,
        n_jobs=-1,
    ),
}


# ============================================================
# TRAIN + EVALUATE
# ============================================================

results = []

trained_models = {}


for model_name, model in models.items():

    print("\n" + "=" * 70)
    print(f"TRAINING: {model_name}")
    print("=" * 70)

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

    pipeline.fit(
        X_train,
        y_train,
    )

    y_pred = pipeline.predict(X_test)

    y_probability = pipeline.predict_proba(X_test)[:, 1]

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

    print(f"Accuracy : {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall   : {recall:.4f}")
    print(f"F1 Score : {f1:.4f}")
    print(f"ROC-AUC  : {roc_auc:.4f}")

    results.append(
        {
            "model": model_name,
            "accuracy": accuracy,
            "precision": precision,
            "recall": recall,
            "f1_score": f1,
            "roc_auc": roc_auc,
        }
    )

    trained_models[model_name] = pipeline


# ============================================================
# COMPARISON TABLE
# ============================================================

comparison = pd.DataFrame(results)

comparison = comparison.sort_values(
    "roc_auc",
    ascending=False,
).reset_index(drop=True)


print("\n" + "=" * 70)
print("MODEL COMPARISON")
print("=" * 70)

print(
    comparison.to_string(
        index=False,
        float_format=lambda x: f"{x:.4f}",
    )
)


# ============================================================
# SAVE COMPARISON
# ============================================================

comparison.to_csv(
    RESULTS_PATH,
    index=False,
)

print("\nComparison saved to:")

print(RESULTS_PATH)


# ============================================================
# SELECT MODEL
# ============================================================

best_model_name = comparison.iloc[0]["model"]

best_model = trained_models[best_model_name]


# ============================================================
# SAVE BEST MODEL
# ============================================================

model_package = {
    "pipeline": best_model,
    "features": features,
    "target": target,
    "model_name": best_model_name,
}


joblib.dump(
    model_package,
    BEST_MODEL_PATH,
)


print("\n" + "=" * 70)
print("BEST MODEL")
print("=" * 70)

print(f"Selected model: {best_model_name}")

print("\nSaved to:")

print(BEST_MODEL_PATH)


# ============================================================
# FINAL
# ============================================================

print("\n" + "=" * 70)
print("DONE")
print("=" * 70)