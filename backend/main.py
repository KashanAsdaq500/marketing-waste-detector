from pathlib import Path
from typing import Optional
from io import BytesIO

import joblib
import numpy as np
import pandas as pd

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[1]

PROCESSED_DATA_PATH = (
    PROJECT_ROOT / "data" / "processed_campaign_data.csv"
)

ANOMALY_DATA_PATH = (
    PROJECT_ROOT / "data" / "anomaly_results.csv"
)

CONVERSION_MODEL_PATH = (
    PROJECT_ROOT / "models" / "best_conversion_model.pkl"
)

ANOMALY_MODEL_PATH = (
    PROJECT_ROOT / "models" / "isolation_forest.pkl"
)


# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="Marketing Waste Detector API",
    description=(
        "AI/ML-powered marketing performance, "
        "waste risk and anomaly detection API."
    ),
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
   allow_origins=[
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ============================================================
# GLOBAL RESOURCES
# ============================================================

processed_df: Optional[pd.DataFrame] = None
anomaly_df: Optional[pd.DataFrame] = None

conversion_model = None
anomaly_model_package = None


# ============================================================
# LOAD RESOURCES
# ============================================================

def load_resources():
    global processed_df
    global anomaly_df
    global conversion_model
    global anomaly_model_package

    # Processed campaign data
    if PROCESSED_DATA_PATH.exists():
        processed_df = pd.read_csv(
            PROCESSED_DATA_PATH
        )

    # Existing anomaly results
    if ANOMALY_DATA_PATH.exists():
        anomaly_df = pd.read_csv(
            ANOMALY_DATA_PATH
        )

    # Conversion prediction model
    if CONVERSION_MODEL_PATH.exists():
        conversion_model = joblib.load(
            CONVERSION_MODEL_PATH
        )

    # Isolation Forest anomaly model
    if ANOMALY_MODEL_PATH.exists():
        anomaly_model_package = joblib.load(
            ANOMALY_MODEL_PATH
        )


load_resources()


# ============================================================
# HELPER: CALCULATE METRICS
# ============================================================

def calculate_metrics(df: pd.DataFrame) -> pd.DataFrame:

    df = df.copy()

    numeric_columns = [
        "Impressions",
        "Clicks",
        "Spent",
        "Total_Conversion",
        "Approved_Conversion",
    ]

    for column in numeric_columns:
        if column in df.columns:
            df[column] = pd.to_numeric(
                df[column],
                errors="coerce",
            ).fillna(0)

    if "Total_Conversion" not in df.columns:
        df["Total_Conversion"] = 0

    if "Approved_Conversion" not in df.columns:
        df["Approved_Conversion"] = 0

    # --------------------------------------------------------
    # CTR
    # --------------------------------------------------------

    df["CTR"] = np.where(
        df["Impressions"] > 0,
        (
            df["Clicks"]
            / df["Impressions"]
            * 100
        ),
        0,
    )

    # --------------------------------------------------------
    # CPC
    # --------------------------------------------------------

    df["CPC"] = np.where(
        df["Clicks"] > 0,
        df["Spent"] / df["Clicks"],
        0,
    )

    # --------------------------------------------------------
    # CVR
    # --------------------------------------------------------

    df["CVR"] = np.where(
        df["Clicks"] > 0,
        (
            df["Approved_Conversion"]
            / df["Clicks"]
            * 100
        ),
        0,
    )

    # --------------------------------------------------------
    # CPA
    # --------------------------------------------------------

    df["CPA"] = np.where(
        df["Approved_Conversion"] > 0,
        (
            df["Spent"]
            / df["Approved_Conversion"]
        ),
        0,
    )

    return df


# ============================================================
# HELPER: WASTE RISK
# ============================================================

def calculate_waste_risk(
    df: pd.DataFrame,
) -> pd.DataFrame:

    df = df.copy()

    # --------------------------------------------------------
    # Percentile thresholds
    # --------------------------------------------------------

    ctr_q25 = float(
        df["CTR"].quantile(0.25)
    )

    cpc_q75 = float(
        df["CPC"].quantile(0.75)
    )

    cpc_q90 = float(
        df["CPC"].quantile(0.90)
    )

    cpa_q75 = float(
        df["CPA"].quantile(0.75)
    )

    cpa_q90 = float(
        df["CPA"].quantile(0.90)
    )

    # --------------------------------------------------------
    # Basic signals
    # --------------------------------------------------------

    df["has_spend"] = (
        df["Spent"] > 0
    )

    df["has_clicks"] = (
        df["Clicks"] > 0
    )

    df["has_conversions"] = (
        df["Approved_Conversion"] > 0
    )

    df["spent_without_clicks"] = (
        (df["Spent"] > 0)
        & (df["Clicks"] == 0)
    )

    df["clicked_without_conversion"] = (
        (df["Clicks"] >= 10)
        & (
            df["Approved_Conversion"]
            == 0
        )
    )

    # --------------------------------------------------------
    # Performance signals
    # --------------------------------------------------------

    df["low_ctr_signal"] = (
        (df["Spent"] > 0)
        & (df["Impressions"] >= 1000)
        & (df["Clicks"] >= 10)
        & (df["CTR"] < ctr_q25)
    )

    df["high_cpc_signal"] = (
        df["CPC"] > cpc_q75
    )

    df["very_high_cpc_signal"] = (
        df["CPC"] > cpc_q90
    )

    df["high_cpa_signal"] = (
        (df["CPA"] > cpa_q75)
        & (df["Approved_Conversion"] > 0)
    )

    df["very_high_cpa_signal"] = (
        (df["CPA"] > cpa_q90)
        & (df["Approved_Conversion"] > 0)
    )

    # --------------------------------------------------------
    # Risk score
    # --------------------------------------------------------

    df["waste_risk_score"] = 0

    df["waste_risk_score"] += (
        df["low_ctr_signal"]
        .astype(int)
    )

    df["waste_risk_score"] += (
        df["high_cpc_signal"]
        .astype(int)
    )

    df["waste_risk_score"] += (
        df["very_high_cpc_signal"]
        .astype(int)
    )

    df["waste_risk_score"] += (
        df["clicked_without_conversion"]
        .astype(int)
        * 2
    )

    df["waste_risk_score"] += (
        df["high_cpa_signal"]
        .astype(int)
    )

    df["waste_risk_score"] += (
        df["very_high_cpa_signal"]
        .astype(int)
    )

    df["waste_risk_score"] += (
        df["spent_without_clicks"]
        .astype(int)
    )

    # --------------------------------------------------------
    # Risk category
    # --------------------------------------------------------

    df["waste_risk"] = np.select(
        [
            df["waste_risk_score"] >= 4,
            df["waste_risk_score"] >= 2,
        ],
        [
            "High Risk",
            "Medium Risk",
        ],
        default="Low Risk",
    )

    # --------------------------------------------------------
    # Evidence strength
    # --------------------------------------------------------

    df["evidence_strength"] = np.select(
        [
            df["Clicks"] >= 50,
            df["Clicks"] >= 10,
            df["Clicks"] > 0,
            df["Spent"] > 0,
        ],
        [
            "Strong",
            "Moderate",
            "Weak",
            "Weak",
        ],
        default="Insufficient Data",
    )

    # --------------------------------------------------------
    # Human-readable evidence
    # --------------------------------------------------------

    def build_evidence(row):

        reasons = []

        if row["low_ctr_signal"]:
            reasons.append(
                "low CTR"
            )

        if row["very_high_cpc_signal"]:
            reasons.append(
                "very high CPC"
            )
        elif row["high_cpc_signal"]:
            reasons.append(
                "high CPC"
            )

        if row["clicked_without_conversion"]:
            reasons.append(
                "10+ clicks without approved conversions"
            )

        if row["very_high_cpa_signal"]:
            reasons.append(
                "very high CPA"
            )
        elif row["high_cpa_signal"]:
            reasons.append(
                "high CPA"
            )

        if row["spent_without_clicks"]:
            reasons.append(
                "spend without clicks"
            )

        if not reasons:
            return "No strong waste signal detected."

        return "; ".join(reasons) + "."

    df["waste_evidence"] = df.apply(
        build_evidence,
        axis=1,
    )

    # --------------------------------------------------------
    # Data quality
    # --------------------------------------------------------

    df["data_quality_flag"] = np.where(
        (
            df["Approved_Conversion"] > 0
        )
        & (df["Clicks"] == 0),
        "Review: conversions without clicks",
        "OK",
    )

    return df


# ============================================================
# HELPER: ANOMALY DETECTION
# ============================================================

def detect_anomalies(
    df: pd.DataFrame,
) -> pd.DataFrame:

    df = df.copy()

    if anomaly_model_package is None:

        df["anomaly_label"] = (
            "Not Available"
        )

        df["anomaly_score"] = None

        df["anomaly_reason"] = (
            "Anomaly model is not available."
        )

        return df

    features = anomaly_model_package.get(
        "features",
        [],
    )

    model = anomaly_model_package.get(
        "model"
    )

    scaler = anomaly_model_package.get(
        "scaler"
    )

    if not features or model is None or scaler is None:

        df["anomaly_label"] = (
            "Not Available"
        )

        df["anomaly_score"] = None

        df["anomaly_reason"] = (
            "Anomaly model package is incomplete."
        )

        return df

    # --------------------------------------------------------
    # Check features
    # --------------------------------------------------------

    missing_features = [
        column
        for column in features
        if column not in df.columns
    ]

    if missing_features:

        df["anomaly_label"] = (
            "Not Available"
        )

        df["anomaly_score"] = None

        df["anomaly_reason"] = (
            "Required anomaly features are missing."
        )

        return df

    # --------------------------------------------------------
    # Prepare features
    # --------------------------------------------------------

    X = df[features].copy()

    X = X.replace(
        [np.inf, -np.inf],
        np.nan,
    )

    X = X.fillna(0)

    try:

        X_scaled = scaler.transform(X)

        predictions = model.predict(
            X_scaled
        )

        scores = model.decision_function(
            X_scaled
        )

        df["anomaly_label"] = np.where(
            predictions == -1,
            "Anomaly",
            "Normal",
        )

        # Lower Isolation Forest decision
        # function means more unusual.
        df["anomaly_score"] = (
            -scores
        ).round(6)

        # ----------------------------------------------------
        # Dynamic anomaly reasons
        # ----------------------------------------------------

        cpc_q90 = float(
            df["CPC"].quantile(0.90)
        )

        cpa_q90 = float(
            df["CPA"].quantile(0.90)
        )

        spend_q90 = float(
            df["Spent"].quantile(0.90)
        )

        ctr_q10 = float(
            df["CTR"].quantile(0.10)
        )

        def build_anomaly_reason(row):

            reasons = []

            if row["CPC"] > cpc_q90:
                reasons.append(
                    "very high CPC"
                )

            if (
                row["CPA"] > cpa_q90
                and row["Approved_Conversion"] > 0
            ):
                reasons.append(
                    "very high CPA"
                )

            if row["Spent"] > spend_q90:
                reasons.append(
                    "unusually high spend"
                )

            if (
                row["CTR"] < ctr_q10
                and row["Impressions"] > 0
            ):
                reasons.append(
                    "unusually low CTR"
                )

            if (
                row["Clicks"] >= 10
                and row["Approved_Conversion"] == 0
            ):
                reasons.append(
                    "clicks without approved conversions"
                )

            if not reasons:
                return "Unusual combination of performance metrics."

            return "; ".join(reasons) + "."

        df["anomaly_reason"] = df.apply(
            build_anomaly_reason,
            axis=1,
        )

        return df

    except Exception as exc:

        df["anomaly_label"] = (
            "Not Available"
        )

        df["anomaly_score"] = None

        df["anomaly_reason"] = (
            f"Anomaly detection failed: {exc}"
        )

        return df


# ============================================================
# HEALTH
# ============================================================

@app.get("/api/v1/health")
def health():

    return {
        "status": "healthy",
        "service": "Marketing Waste Detector API",
        "version": "1.0.0",
        "processed_data_loaded": (
            processed_df is not None
        ),
        "anomaly_data_loaded": (
            anomaly_df is not None
        ),
        "conversion_model_loaded": (
            conversion_model is not None
        ),
        "anomaly_model_loaded": (
            anomaly_model_package is not None
        ),
    }


# ============================================================
# SUMMARY
# ============================================================

@app.get("/api/v1/summary")
def summary():

    if processed_df is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "Processed campaign data "
                "is not available."
            ),
        )

    df = processed_df

    total_spend = float(
        df["Spent"].sum()
    )

    total_clicks = int(
        df["Clicks"].sum()
    )

    total_conversions = int(
        df["Approved_Conversion"].sum()
    )

    total_impressions = int(
        df["Impressions"].sum()
    )

    total_campaigns = len(df)

    avg_cpc = (
        total_spend / total_clicks
        if total_clicks > 0
        else 0
    )

    avg_cpa = (
        total_spend / total_conversions
        if total_conversions > 0
        else 0
    )

    risk_counts = (
        df["waste_risk"]
        .value_counts()
        .to_dict()
    )

    return {
        "total_campaigns": total_campaigns,
        "total_spend": round(
            total_spend,
            2,
        ),
        "total_impressions": (
            total_impressions
        ),
        "total_clicks": total_clicks,
        "total_conversions": (
            total_conversions
        ),
        "average_cpc": round(
            avg_cpc,
            2,
        ),
        "average_cpa": round(
            avg_cpa,
            2,
        ),
        "risk_distribution": (
            risk_counts
        ),
    }


# ============================================================
# CAMPAIGNS
# ============================================================

@app.get("/api/v1/campaigns")
def campaigns(
    risk: Optional[str] = None,
    limit: int = 100,
):

    if processed_df is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "Processed campaign data "
                "is not available."
            ),
        )

    if limit < 1:
        limit = 1

    if limit > 500:
        limit = 500

    df = processed_df.copy()

    if risk:

        df = df[
            df["waste_risk"]
            .str.lower()
            == risk.lower()
        ]

    df = df.head(limit)

    records = (
        df.replace(
            {np.nan: None}
        )
        .to_dict(
            orient="records"
        )
    )

    return {
        "count": len(records),
        "campaigns": records,
    }


# ============================================================
# ANOMALIES
# ============================================================

@app.get("/api/v1/anomalies")
def anomalies(
    limit: int = 20,
):

    if anomaly_df is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "Anomaly data is not available."
            ),
        )

    if limit < 1:
        limit = 1

    if limit > 100:
        limit = 100

    df = anomaly_df.copy()

    df = df[
        df["anomaly_label"]
        == "Anomaly"
    ]

    df = df.sort_values(
        "anomaly_score",
        ascending=False,
    )

    df = df.head(limit)

    records = (
        df.replace(
            {np.nan: None}
        )
        .to_dict(
            orient="records"
        )
    )

    return {
        "count": len(records),
        "anomalies": records,
    }


# ============================================================
# SINGLE CAMPAIGN
# ============================================================

@app.get("/api/v1/campaigns/{ad_id}")
def campaign_detail(
    ad_id: int,
):

    if processed_df is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "Processed campaign data "
                "is not available."
            ),
        )

    result = processed_df[
        processed_df["ad_id"]
        == ad_id
    ]

    if result.empty:
        raise HTTPException(
            status_code=404,
            detail="Campaign not found.",
        )

    record = (
        result.iloc[0]
        .replace(
            {np.nan: None}
        )
        .to_dict()
    )

    return record


# ============================================================
# CONVERSION PREDICTION
# ============================================================

@app.post("/api/v1/predict-conversion")
async def predict_conversion(
    file: UploadFile = File(...),
):

    if conversion_model is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "Conversion prediction model "
                "is not available."
            ),
        )

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file provided.",
        )

    if not file.filename.lower().endswith(
        ".csv"
    ):
        raise HTTPException(
            status_code=400,
            detail="Please upload a CSV file.",
        )

    try:

        contents = await file.read()

        input_df = pd.read_csv(
            BytesIO(contents)
        )

    except Exception as exc:

        raise HTTPException(
            status_code=400,
            detail=(
                f"Could not read CSV: {exc}"
            ),
        )

    required_features = [
        "Impressions",
        "Clicks",
        "Spent",
        "age",
        "gender",
        "interest",
        "xyz_campaign_id",
        "fb_campaign_id",
    ]

    missing_features = [
        column
        for column in required_features
        if column not in input_df.columns
    ]

    if missing_features:

        raise HTTPException(
            status_code=400,
            detail={
                "message": (
                    "Missing required columns."
                ),
                "missing_columns": (
                    missing_features
                ),
            },
        )

    try:

        X = input_df[
            required_features
        ].copy()

        pipeline = conversion_model[
            "pipeline"
        ]

        probabilities = (
            pipeline.predict_proba(
                X
            )[:, 1]
        )

        predictions = (
            probabilities >= 0.5
        ).astype(int)

        output = input_df.copy()

        output[
            "conversion_probability"
        ] = (
            probabilities * 100
        ).round(2)

        output[
            "predicted_conversion"
        ] = predictions

        output[
            "conversion_potential"
        ] = output[
            "conversion_probability"
        ].apply(
            lambda x:
                "High Potential"
                if x >= 70
                else (
                    "Medium Potential"
                    if x >= 40
                    else "Low Potential"
                )
        )

        records = (
            output
            .replace(
                {np.nan: None}
            )
            .to_dict(
                orient="records"
            )
        )

        return {
            "count": len(records),
            "predictions": records,
        }

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Prediction failed: {exc}"
            ),
        )


# ============================================================
# ANALYZE UPLOADED CSV
# ============================================================

@app.post("/api/v1/analyze")
async def analyze_csv(
    file: UploadFile = File(...),
):

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file provided.",
        )

    if not file.filename.lower().endswith(
        ".csv"
    ):
        raise HTTPException(
            status_code=400,
            detail="Please upload a CSV file.",
        )

    try:

        contents = await file.read()

        input_df = pd.read_csv(
            BytesIO(contents)
        )

    except Exception as exc:

        raise HTTPException(
            status_code=400,
            detail=(
                f"Could not read CSV: {exc}"
            ),
        )

    # --------------------------------------------------------
    # REQUIRED COLUMNS
    # --------------------------------------------------------

    required_columns = [
        "Impressions",
        "Clicks",
        "Spent",
        "Approved_Conversion",
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in input_df.columns
    ]

    if missing_columns:

        raise HTTPException(
            status_code=400,
            detail={
                "message": (
                    "Missing required columns."
                ),
                "missing_columns": (
                    missing_columns
                ),
            },
        )

    try:

        # ----------------------------------------------------
        # 1. METRICS
        # ----------------------------------------------------

        df = calculate_metrics(
            input_df
        )

        # ----------------------------------------------------
        # 2. WASTE RISK
        # ----------------------------------------------------

        df = calculate_waste_risk(
            df
        )

        # ----------------------------------------------------
        # 3. ANOMALIES
        # ----------------------------------------------------

        df = detect_anomalies(
            df
        )

        # ----------------------------------------------------
        # 4. CONVERSION PREDICTION
        # ----------------------------------------------------

        conversion_prediction_available = False

        conversion_features = [
            "Impressions",
            "Clicks",
            "Spent",
            "age",
            "gender",
            "interest",
            "xyz_campaign_id",
            "fb_campaign_id",
        ]

        if (
            conversion_model is not None
            and all(
                column in df.columns
                for column
                in conversion_features
            )
        ):

            try:

                pipeline = conversion_model[
                    "pipeline"
                ]

                probabilities = (
                    pipeline
                    .predict_proba(
                        df[
                            conversion_features
                        ]
                    )[:, 1]
                )

                df[
                    "conversion_probability"
                ] = (
                    probabilities * 100
                ).round(2)

                df[
                    "predicted_conversion"
                ] = (
                    probabilities >= 0.5
                ).astype(int)

                df[
                    "conversion_potential"
                ] = df[
                    "conversion_probability"
                ].apply(
                    lambda x:
                        "High Potential"
                        if x >= 70
                        else (
                            "Medium Potential"
                            if x >= 40
                            else "Low Potential"
                        )
                )

                conversion_prediction_available = True

            except Exception:

                conversion_prediction_available = False

        # ----------------------------------------------------
        # 5. SUMMARY
        # ----------------------------------------------------

        total_spend = float(
            df["Spent"].sum()
        )

        total_impressions = int(
            df["Impressions"].sum()
        )

        total_clicks = int(
            df["Clicks"].sum()
        )

        total_conversions = int(
            df[
                "Approved_Conversion"
            ].sum()
        )

        average_cpc = (
            total_spend
            / total_clicks
            if total_clicks > 0
            else 0
        )

        average_cpa = (
            total_spend
            / total_conversions
            if total_conversions > 0
            else 0
        )

        risk_distribution = (
            df[
                "waste_risk"
            ]
            .value_counts()
            .to_dict()
        )

        if (
            "anomaly_label"
            in df.columns
        ):

            anomalies_detected = int(
                (
                    df[
                        "anomaly_label"
                    ]
                    == "Anomaly"
                ).sum()
            )

        else:

            anomalies_detected = 0

        # ----------------------------------------------------
        # 6. TOP WASTE RISK
        # ----------------------------------------------------

        top_waste = (
            df.sort_values(
                [
                    "waste_risk_score",
                    "Spent",
                ],
                ascending=[
                    False,
                    False,
                ],
            )
            .head(20)
        )

        # ----------------------------------------------------
        # 7. TOP ANOMALIES
        # ----------------------------------------------------

        top_anomalies = pd.DataFrame()

        if (
            "anomaly_label"
            in df.columns
            and "anomaly_score"
            in df.columns
        ):

            top_anomalies = (
                df[
                    df[
                        "anomaly_label"
                    ]
                    == "Anomaly"
                ]
                .sort_values(
                    "anomaly_score",
                    ascending=False,
                )
                .head(20)
            )

        # ----------------------------------------------------
        # 8. CONVERSION SUMMARY
        # ----------------------------------------------------

        conversion_summary = {
            "available": (
                conversion_prediction_available
            ),
        }

        if conversion_prediction_available:

            conversion_summary.update(
                {
                    "high_potential": int(
                        (
                            df[
                                "conversion_potential"
                            ]
                            == "High Potential"
                        ).sum()
                    ),
                    "medium_potential": int(
                        (
                            df[
                                "conversion_potential"
                            ]
                            == "Medium Potential"
                        ).sum()
                    ),
                    "low_potential": int(
                        (
                            df[
                                "conversion_potential"
                            ]
                            == "Low Potential"
                        ).sum()
                    ),
                }
            )

        # ----------------------------------------------------
        # 9. JSON-SAFE RECORDS
        # ----------------------------------------------------

        top_waste_records = (
            top_waste
            .replace(
                {np.nan: None}
            )
            .to_dict(
                orient="records"
            )
        )

        if not top_anomalies.empty:

            top_anomaly_records = (
                top_anomalies
                .replace(
                    {np.nan: None}
                )
                .to_dict(
                    orient="records"
                )
            )

        else:

            top_anomaly_records = []

        # ----------------------------------------------------
        # 10. FINAL RESPONSE
        # ----------------------------------------------------

        return {

            "filename": (
                file.filename
            ),

            "summary": {

                "total_campaigns": len(
                    df
                ),

                "total_spend": round(
                    total_spend,
                    2,
                ),

                "total_impressions": (
                    total_impressions
                ),

                "total_clicks": (
                    total_clicks
                ),

                "total_conversions": (
                    total_conversions
                ),

                "average_cpc": round(
                    average_cpc,
                    2,
                ),

                "average_cpa": round(
                    average_cpa,
                    2,
                ),

                "risk_distribution": (
                    risk_distribution
                ),

                "anomalies_detected": (
                    anomalies_detected
                ),
            },

            "models": {

                "waste_risk": True,

                "anomaly_detection": (
                    anomaly_model_package
                    is not None
                ),

                "conversion_prediction": (
                    conversion_prediction_available
                ),
            },

            "conversion_summary": (
                conversion_summary
            ),

            "top_waste_risk": (
                top_waste_records
            ),

            "top_anomalies": (
                top_anomaly_records
            ),

            "records_returned": {

                "top_waste_risk": len(
                    top_waste_records
                ),

                "top_anomalies": len(
                    top_anomaly_records
                ),
            },

            "note": (
                "The complete uploaded CSV "
                "was analyzed. Only the top "
                "20 waste-risk records and "
                "top 20 anomalies are returned "
                "to keep the API response small."
            ),
        }

    except HTTPException:
        raise

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Analysis failed: {exc}"
            ),
        )


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "message": (
            "Marketing Waste Detector API"
        ),
        "docs": "/docs",
        "health": (
            "/api/v1/health"
        ),
        "analyze": (
            "/api/v1/analyze"
        ),
    }