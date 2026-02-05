import json
import os
from datetime import datetime

import joblib
import numpy as np
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS
from sklearn.linear_model import LinearRegression
from statsmodels.tsa.statespace.sarimax import SARIMAX

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
MODEL_DIR = os.path.join(BASE_DIR, "models")
DATA_PATH = os.path.join(DATA_DIR, "energy_data.csv")
MODEL_PATH = os.path.join(MODEL_DIR, "energy_model.pkl")
METADATA_PATH = os.path.join(MODEL_DIR, "model_metadata.json")

for directory in (DATA_DIR, UPLOAD_DIR, MODEL_DIR):
    os.makedirs(directory, exist_ok=True)

app = Flask(__name__)
CORS(app)


MONTH_FORMATS = ["%b-%y", "%b-%Y", "%B, %Y", "%Y-%m", "%Y/%m"]


def parse_month(value: str) -> pd.Timestamp:
    if value is None or str(value).strip() == "":
        raise ValueError("Month value is empty")
    raw = str(value).strip()
    for fmt in MONTH_FORMATS:
        try:
            parsed = datetime.strptime(raw, fmt)
            return pd.Timestamp(parsed.year, parsed.month, 1)
        except ValueError:
            continue
    parsed = pd.to_datetime(raw, errors="coerce")
    if pd.isna(parsed):
        raise ValueError(f"Unrecognized month format: {value}")
    return pd.Timestamp(parsed.year, parsed.month, 1)


def load_dataset() -> pd.DataFrame:
    if not os.path.exists(DATA_PATH):
        return pd.DataFrame(columns=["Month", "Consumption_KWh", "Bill_Amount"])
    df = pd.read_csv(DATA_PATH)
    if df.empty:
        return df
    df["Month"] = pd.to_datetime(df["Month"], errors="coerce")
    df = df.dropna(subset=["Month"])
    return df.sort_values("Month").reset_index(drop=True)


def clean_dataset(df: pd.DataFrame) -> pd.DataFrame:
    required = {"Month", "Consumption_KWh", "Bill_Amount"}
    missing = required.difference(df.columns)
    if missing:
        raise ValueError(f"Missing columns: {', '.join(sorted(missing))}")

    df = df.copy()
    df["Month"] = df["Month"].apply(parse_month)
    df["Consumption_KWh"] = pd.to_numeric(df["Consumption_KWh"], errors="coerce")
    df["Bill_Amount"] = pd.to_numeric(df["Bill_Amount"], errors="coerce")
    df = df.dropna(subset=["Month", "Consumption_KWh", "Bill_Amount"]).sort_values("Month")

    if df.empty:
        return df

    df = df.set_index("Month")
    full_range = pd.date_range(start=df.index.min(), end=df.index.max(), freq="MS")
    df = df.reindex(full_range)
    df["Consumption_KWh"] = df["Consumption_KWh"].interpolate().ffill().bfill()
    df["Bill_Amount"] = df["Bill_Amount"].interpolate().ffill().bfill()
    df = df.reset_index().rename(columns={"index": "Month"})
    return df


def compute_avg_rate(df: pd.DataFrame) -> float:
    if df.empty:
        return 0.0
    recent = df.tail(3)
    rates = recent["Bill_Amount"] / recent["Consumption_KWh"].replace(0, np.nan)
    rates = rates.dropna()
    if rates.empty:
        return 0.0
    return float(rates.mean())


def train_model(df: pd.DataFrame) -> dict:
    if df.empty:
        model_payload = {"model_type": "none", "model": None}
        joblib.dump(model_payload, MODEL_PATH)
        metadata = {
            "avg_rate_per_kwh": 0.0,
            "last_training_date": datetime.utcnow().isoformat(),
        }
        with open(METADATA_PATH, "w", encoding="utf-8") as handle:
            json.dump(metadata, handle, indent=2)
        return metadata

    avg_rate = compute_avg_rate(df)
    consumption_series = df.set_index("Month")["Consumption_KWh"]
    model_payload = None

    try:
        sarimax = SARIMAX(
            consumption_series,
            order=(1, 1, 1),
            seasonal_order=(1, 1, 1, 12),
            enforce_stationarity=False,
            enforce_invertibility=False,
        )
        fitted = sarimax.fit(disp=False)
        model_payload = {"model_type": "sarimax", "model": fitted}
    except Exception:
        time_index = np.arange(len(consumption_series)).reshape(-1, 1)
        model = LinearRegression()
        model.fit(time_index, consumption_series.values)
        model_payload = {
            "model_type": "linear",
            "model": model,
            "start_index": len(consumption_series),
        }

    joblib.dump(model_payload, MODEL_PATH)
    metadata = {
        "avg_rate_per_kwh": avg_rate,
        "last_training_date": datetime.utcnow().isoformat(),
    }
    with open(METADATA_PATH, "w", encoding="utf-8") as handle:
        json.dump(metadata, handle, indent=2)
    return metadata


def load_model() -> tuple[dict, dict]:
    if os.path.exists(MODEL_PATH):
        model_payload = joblib.load(MODEL_PATH)
    else:
        model_payload = {"model_type": "none", "model": None}

    if os.path.exists(METADATA_PATH):
        with open(METADATA_PATH, "r", encoding="utf-8") as handle:
            metadata = json.load(handle)
    else:
        metadata = {"avg_rate_per_kwh": 0.0, "last_training_date": None}
    return model_payload, metadata


def forecast_consumption(df: pd.DataFrame, steps: int) -> list[float]:
    model_payload, _ = load_model()
    if df.empty:
        return [0.0] * steps
    if model_payload["model_type"] == "sarimax":
        forecast = model_payload["model"].forecast(steps=steps)
        return [float(value) for value in forecast]
    if model_payload["model_type"] == "linear":
        start = len(df)
        indices = np.arange(start, start + steps).reshape(-1, 1)
        forecast = model_payload["model"].predict(indices)
        return [float(value) for value in forecast]
    return [float(df["Consumption_KWh"].iloc[-1])] * steps


def compute_confidence(months_ahead: int) -> str:
    if months_ahead <= 3:
        return "HIGH"
    if months_ahead <= 6:
        return "MEDIUM"
    return "LOW"


def serialize_month(timestamp: pd.Timestamp) -> str:
    return timestamp.strftime("%b-%y")


@app.route("/upload", methods=["POST"])
def upload_data():
    if "file" not in request.files:
        return jsonify({"message": "No file uploaded", "status": "error"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"message": "No file selected", "status": "error"}), 400

    raw_path = os.path.join(UPLOAD_DIR, file.filename)
    file.save(raw_path)
    try:
        df = pd.read_csv(raw_path)
        cleaned = clean_dataset(df)
    except Exception as exc:
        return jsonify({"message": str(exc), "status": "error"}), 400

    cleaned.to_csv(DATA_PATH, index=False)
    metadata = train_model(cleaned)

    response_rows = cleaned.copy()
    response_rows["Month"] = response_rows["Month"].dt.strftime("%b-%y")
    return (
        jsonify(
            {
                "message": "Upload successful",
                "rows": response_rows.to_dict(orient="records"),
                "status": "success",
                "metadata": metadata,
            }
        ),
        200,
    )


@app.route("/forecast", methods=["GET"])
def get_forecast():
    df = load_dataset()
    if df.empty:
        return jsonify({"actual": [], "forecast": []}), 200

    metadata = train_model(df)
    last_month = df["Month"].iloc[-1]
    future_months = pd.date_range(start=last_month + pd.offsets.MonthBegin(1), periods=6, freq="MS")
    consumption_forecast = forecast_consumption(df, 6)
    avg_rate = metadata.get("avg_rate_per_kwh", 0.0)

    forecast_rows = []
    for month, consumption in zip(future_months, consumption_forecast):
        bill = float(consumption) * avg_rate
        forecast_rows.append(
            {
                "month": serialize_month(month),
                "consumption": round(float(consumption), 2),
                "bill": round(float(bill), 2),
            }
        )

    actual_rows = df.copy()
    actual_rows["month"] = actual_rows["Month"].dt.strftime("%b-%y")
    return (
        jsonify(
            {
                "actual": actual_rows[["month", "Consumption_KWh", "Bill_Amount"]]
                .rename(columns={"Consumption_KWh": "consumption", "Bill_Amount": "bill"})
                .to_dict(orient="records"),
                "forecast": forecast_rows,
            }
        ),
        200,
    )


@app.route("/predict", methods=["POST"])
def predict():
    payload = request.get_json(silent=True) or {}
    if "month" not in payload:
        return jsonify({"message": "Month is required"}), 400
    try:
        target_month = parse_month(payload["month"])
    except ValueError as exc:
        return jsonify({"message": str(exc)}), 400

    df = load_dataset()
    if df.empty:
        return jsonify({"message": "No data available"}), 400

    metadata = train_model(df)
    last_month = df["Month"].iloc[-1]
    months_ahead = (target_month.year - last_month.year) * 12 + (target_month.month - last_month.month)
    if months_ahead < 0:
        existing = df[df["Month"] == target_month]
        if not existing.empty:
            consumption = float(existing["Consumption_KWh"].iloc[0])
        else:
            consumption = float(df["Consumption_KWh"].iloc[-1])
        months_ahead = 0
    else:
        consumption = forecast_consumption(df, months_ahead + 1)[-1]

    avg_rate = metadata.get("avg_rate_per_kwh", 0.0)
    predicted_bill = float(consumption) * avg_rate

    response = {
        "month": payload["month"],
        "predicted_consumption": round(float(consumption), 2),
        "predicted_bill": round(float(predicted_bill), 2),
        "confidence": compute_confidence(months_ahead),
        "model_used": "SARIMAX + Rate per kWh Estimation",
    }
    return jsonify(response), 200


@app.route("/insights", methods=["GET"])
def insights():
    df = load_dataset()
    if df.empty:
        return jsonify({"message": "No data available"}), 200

    avg_rate = compute_avg_rate(df)
    avg_consumption = float(df["Consumption_KWh"].mean())
    peak_row = df.loc[df["Consumption_KWh"].idxmax()]
    low_row = df.loc[df["Consumption_KWh"].idxmin()]
    total_bill = float(df["Bill_Amount"].sum())

    recommendations = []
    if avg_rate > 0:
        recommendations.append(
            "Monitor high-consumption months and schedule maintenance to reduce peak usage."
        )
    if avg_consumption > df["Consumption_KWh"].median():
        recommendations.append("Evaluate HVAC efficiency and shift loads where possible.")
    recommendations.append("Continue tracking monthly data to improve forecast accuracy.")

    response = {
        "average_consumption": round(avg_consumption, 2),
        "peak_month": serialize_month(peak_row["Month"]),
        "peak_value": round(float(peak_row["Consumption_KWh"]), 2),
        "lowest_month": serialize_month(low_row["Month"]),
        "lowest_value": round(float(low_row["Consumption_KWh"]), 2),
        "total_bill": round(total_bill, 2),
        "avg_rate_per_kwh": round(avg_rate, 4),
        "recommendations": recommendations,
    }
    return jsonify(response), 200


@app.route("/history", methods=["GET"])
def history():
    df = load_dataset()
    if df.empty:
        return jsonify([]), 200
    df = df.copy()
    df["Month"] = df["Month"].dt.strftime("%b-%y")
    return jsonify(df.to_dict(orient="records")), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
