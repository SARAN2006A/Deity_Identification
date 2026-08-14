import os
import io
import torch
import torch.nn.functional as F
from PIL import Image
from torchvision import models, transforms
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

# Global variables for model and transforms
MODEL_PATH = "model.pt"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = None
class_names = []

def load_deity_model():
    global model, class_names
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file '{MODEL_PATH}' not found!")
    
    checkpoint = torch.load(MODEL_PATH, map_location=DEVICE)
    class_names = checkpoint["class_names"]
    
    model = models.resnet50(weights=None)
    model.fc = torch.nn.Sequential(
        torch.nn.Dropout(0.5),
        torch.nn.Linear(model.fc.in_features, len(class_names)),
    )
    model.load_state_dict(checkpoint["model_state"])
    model.to(DEVICE)
    model.eval()
    print(f"Model loaded successfully on {DEVICE}. Classes: {class_names}")

def transform_image(image_bytes):
    tf = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    return tf(image).unsqueeze(0)

# Load model at startup
load_deity_model()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict_endpoint():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    try:
        image_bytes = file.read()
        tensor = transform_image(image_bytes).to(DEVICE)
        
        with torch.no_grad():
            outputs = model(tensor)
            probs = F.softmax(outputs, dim=1)[0]
            
        results = []
        for name, prob in zip(class_names, probs.cpu().tolist()):
            results.append({
                "class": name,
                "confidence": round(prob * 100, 2)
            })
            
        # Sort descending by confidence
        results.sort(key=lambda x: x["confidence"], reverse=True)
        
        return jsonify({
            "success": True,
            "best_guess": results[0]["class"],
            "best_confidence": results[0]["confidence"],
            "predictions": results
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
