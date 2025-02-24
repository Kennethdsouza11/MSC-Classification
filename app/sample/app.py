from flask import Flask, request, jsonify
import numpy as np
import cv2
import tensorflow as tf
from tensorflow.keras.applications import InceptionV3
from sklearn.preprocessing import StandardScaler
import joblib
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load the trained SVM model and scaler
svm_model = joblib.load("svm_model.pkl")
scaler = joblib.load("scaler.pkl")

# Load the pre-trained InceptionV3 model
crop_size = 299
base_model = InceptionV3(
    weights="imagenet", include_top=False, input_shape=(crop_size, crop_size, 3)
)
model = tf.keras.Sequential([base_model, tf.keras.layers.GlobalAveragePooling2D()])


def preprocess_image(image):
    """Preprocess the uploaded image."""
    image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
    image = cv2.resize(image, (crop_size, crop_size))
    image = np.array(image) / 255.0
    return np.expand_dims(image, axis=0)


def extract_features(image):
    """Extract features from an image."""
    features = model.predict(image)
    features = features.reshape(1, -1)
    return scaler.transform(features)


def predict(image):
    """Predict if the cell is live or dead."""
    features = extract_features(image)
    prediction = svm_model.predict(features)[0]
    probability = svm_model.predict_proba(features)[0][1]
    return "Live Cell" if prediction == 1 else "Dead Cell", probability


@app.route("/predict", methods=["POST"])
def predict_images():
    if "files" not in request.files:
        return jsonify({"error": "No files uploaded"}), 400

    files = request.files.getlist("files")
    results = []
    live_count = 0
    dead_count = 0

    for file in files:
        try:
            image = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_GRAYSCALE)
            if image is None:
                results.append({"filename": file.filename, "error": "Could not read image"})
                continue

            processed_image = preprocess_image(image)
            label, _ = predict(processed_image)
            results.append({"filename": file.filename, "label": label})
            if label == "Live Cell":
                live_count += 1
            else:
                dead_count += 1
        except Exception as e:
            results.append({"filename": file.filename, "error": str(e)})

    total_images = len(results)
    live_percentage = (live_count / total_images) * 100 if total_images > 0 else 0
    dead_percentage = (dead_count / total_images) * 100 if total_images > 0 else 0

    return jsonify(
        {
            "results": results,
            "summary": {
                "total_images": total_images,
                "live_count": live_count,
                "dead_count": dead_count,
                "live_percentage": live_percentage,
                "dead_percentage": dead_percentage,
            },
        }
    )


if __name__ == "__main__":
    app.run(debug=True)