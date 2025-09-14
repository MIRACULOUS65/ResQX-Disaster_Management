import os
import threading
from flask import Flask, request, jsonify
import traceback
import joblib
import numpy as np

app = Flask(__name__)

MODEL_PATH = os.getenv("MODEL_PATH", "dataset/model.pkl")
SCALER_PATH = os.getenv("SCALER_PATH", "dataset/scaler.pkl")

# Ensure we're looking in the correct directory
if not os.path.exists(MODEL_PATH):
    # Try relative to flask_server directory
    MODEL_PATH = os.path.join(os.path.dirname(__file__), "dataset", "model.pkl")
    SCALER_PATH = os.path.join(os.path.dirname(__file__), "dataset", "scaler.pkl")
model = None
scaler = None
model_ready = False

# Disaster type mapping
DISASTER_TYPES = ["Earthquake", "Flood", "Hurricane", "Tornado", "Wildfire"]

def load_model():
    global model, scaler, model_ready
    try:
        print(f"[flask] Loading model from {MODEL_PATH} ...")
        model = joblib.load(MODEL_PATH)
        
        # Try to load scaler if it exists
        try:
            scaler = joblib.load(SCALER_PATH)
            print("[flask] Scaler loaded.")
        except:
            print("[flask] No scaler found, using raw features.")
            scaler = None
            
        model_ready = True
        print("[flask] Model loaded successfully.")
    except Exception as e:
        print("[flask] Error loading model:", e)

# Load model in background thread so the server can start fast
threading.Thread(target=load_model, daemon=True).start()

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "service": "Disaster Prediction ML Service",
        "status": "running",
        "model_ready": model_ready,
        "endpoints": {
            "health": "/health",
            "predict": "/predict (POST)",
            "train": "/train (POST)"
        },
        "usage": {
            "predict": "POST /predict with {\"features\": [0.1, 0.2, 0.3, 0.4, 0.5]}",
            "health": "GET /health"
        }
    })

@app.route("/predict", methods=["POST"])
def predict():
    if not model_ready:
        return jsonify({"error": "model not ready"}), 503

    try:
        data = request.get_json()
        if not data or "features" not in data:
            return jsonify({"error": "missing 'features' in request body"}), 400

        features = np.array(data["features"]).reshape(1, -1)
        
        # Scale features if scaler is available
        if scaler is not None:
            features = scaler.transform(features)
        
        # Get prediction and probabilities
        prediction = model.predict(features)[0]
        probabilities = model.predict_proba(features)[0]
        
        # Get disaster type name
        disaster_type = DISASTER_TYPES[prediction]
        
        # Calculate confidence and severity
        confidence = float(np.max(probabilities))
        severity = int(confidence * 5) + 1  # Scale to 1-5
        
        return jsonify({
            "prediction": int(prediction),
            "disaster_type": disaster_type,
            "confidence": confidence,
            "severity": severity,
            "probabilities": probabilities.tolist()
        })
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

@app.route("/train", methods=["POST"])
def train():
    # Optional: start retrain in background or return accepted
    # Implement as needed (authentication recommended)
    return jsonify({"message": "train endpoint not implemented"}), 501

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model_ready": model_ready
    })

if __name__ == "__main__":
    host = os.getenv("FLASK_HOST", "0.0.0.0")
    port = int(os.getenv("FLASK_PORT", 5001))
    app.run(host=host, port=port)