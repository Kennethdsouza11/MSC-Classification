from flask import Flask, request, jsonify
import numpy as np
import cv2
import tensorflow as tf
from tensorflow.keras.applications import InceptionV3
from sklearn.preprocessing import StandardScaler
import joblib
import os
from flask_cors import CORS
import base64
import tempfile

app = Flask(__name__)
CORS(app)

# Load the trained SVM models and scalers
svm_model = joblib.load("svm_model.pkl")
scaler = joblib.load("scaler.pkl")
svm_model_singlet_doublet = joblib.load("svm_model_singlet_doublet.pkl")
scaler_singlet_doublet = joblib.load("scaler_singlet_doublet.pkl")

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
    return features


def predict_live_dead(image):
    """Predict if the cell is live or dead."""
    features = extract_features(image)
    features_scaled = scaler.transform(features)
    prediction = svm_model.predict(features_scaled)[0]
    probability = svm_model.predict_proba(features_scaled)[0][1]
    return "Live Cell" if prediction == 1 else "Dead Cell", probability


def predict_singlet_aggregate(image):
    """Predict if the cell is a singlet or aggregate."""
    features = extract_features(image)
    features_scaled = scaler_singlet_doublet.transform(features)
    prediction = svm_model_singlet_doublet.predict(features_scaled)[0]
    return "Singlet" if prediction == 1 else "Aggregate"


def save_temp_image(image, label):
    """Save the image to a temporary file and return its path."""
    _, temp_path = tempfile.mkstemp(suffix=".jpg")
    cv2.imwrite(temp_path, image)
    return temp_path


@app.route("/predict", methods=["POST"])
def predict_images():
    if "files" not in request.files:
        return jsonify({"error": "No files uploaded"}), 400

    files = request.files.getlist("files")
    results = []
    live_count = 0
    dead_count = 0
    singlet_count = 0
    aggregate_count = 0
    live_images = []
    dead_images = []
    singlet_images = []
    aggregate_images = []

    for file in files:
        try:
            image = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_GRAYSCALE)
            if image is None:
                results.append({"filename": file.filename, "error": "Could not read image"})
                continue

            processed_image = preprocess_image(image)
            singlet_aggregate_label = predict_singlet_aggregate(processed_image)
            results.append({"filename": file.filename, "singlet_aggregate_label": singlet_aggregate_label})

            # Save the image temporarily and store its path
            temp_image_path = save_temp_image(image, singlet_aggregate_label)
            if singlet_aggregate_label == "Singlet":
                singlet_count += 1
                if len(singlet_images) < 5:
                    singlet_images.append(temp_image_path)
                # Further classify as live or dead
                live_dead_label, _ = predict_live_dead(processed_image)
                results[-1]["live_dead_label"] = live_dead_label
                if live_dead_label == "Live Cell":
                    live_count += 1
                    if len(live_images) < 5:
                        live_images.append(temp_image_path)
                elif live_dead_label == "Dead Cell":
                    dead_count += 1
                    if len(dead_images) < 5:
                        dead_images.append(temp_image_path)
            else:
                aggregate_count += 1
                if len(aggregate_images) < 5:
                    aggregate_images.append(temp_image_path)
        except Exception as e:
            results.append({"filename": file.filename, "error": str(e)})

    total_images = len(results)
    live_percentage = (live_count / total_images) * 100 if total_images > 0 else 0
    dead_percentage = (dead_count / total_images) * 100 if total_images > 0 else 0
    singlet_percentage = (singlet_count / total_images) * 100 if total_images > 0 else 0
    aggregate_percentage = (aggregate_count / total_images) * 100 if total_images > 0 else 0

    # Convert images to base64 for frontend display
    def encode_image_to_base64(image_path):
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8")

    live_images_base64 = [encode_image_to_base64(img) for img in live_images]
    dead_images_base64 = [encode_image_to_base64(img) for img in dead_images]
    singlet_images_base64 = [encode_image_to_base64(img) for img in singlet_images]
    aggregate_images_base64 = [encode_image_to_base64(img) for img in aggregate_images]

    return jsonify(
        {
            "results": results,
            "summary": {
                "total_images": total_images,
                "live_count": live_count,
                "dead_count": dead_count,
                "singlet_count": singlet_count,
                "aggregate_count": aggregate_count,
                "live_percentage": live_percentage,
                "dead_percentage": dead_percentage,
                "singlet_percentage": singlet_percentage,
                "aggregate_percentage": aggregate_percentage,
            },
            "live_images": live_images_base64,
            "dead_images": dead_images_base64,
            "singlet_images": singlet_images_base64,
            "aggregate_images": aggregate_images_base64,
        }
    )


if __name__ == "__main__":
    app.run(debug=True)