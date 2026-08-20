import os
import io
import torch
import torch.nn.functional as F
from PIL import Image
from torchvision import models, transforms
from flask import Flask, request, jsonify, render_template, send_from_directory

app = Flask(__name__)

# Global variables for model and transforms
MODEL_PATH = "model.pt"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = None
class_names = []

DEITY_METADATA = {
    "amman": {
        "title": "Goddess Amman / Shakti / Parvati",
        "description": "Divine Mother & sacred feminine power. Iconography includes Trishula (trident), Kirita-mukuta crown, Lotus flower, and four-armed seated or standing posture.",
        "key_features": ["Trishula (Trident)", "Kirita-mukuta Crown", "Divine Feminine Ornaments", "Lotus & Pasa"],
        "famous_temples": ["Madurai Meenakshi Temple", "Samayapuram Mariamman Temple", "Kanchipuram Kamakshi Temple"]
    },
    "murugan": {
        "title": "Lord Murugan / Kartikeya / Skanda",
        "description": "Divine warrior & commander of celestial forces. Iconography features the Vel (sacred spear), Peacock mount (Mayil), youthful posture, and rooster banner.",
        "key_features": ["Vel (Sacred Spear)", "Peacock Mount (Mayil)", "Youthful Form (Kumara)", "Rooster Pennant"],
        "famous_temples": ["Palani Murugan Temple", "Tiruchendur Murugan Temple", "Swamimalai Temple"]
    },
    "perumal": {
        "title": "Lord Perumal / Vishnu / Ranganatha",
        "description": "Preserver of the cosmos. Iconography includes Shankha (conch shell), Chakra (discus), distinctive Namam forehead mark, and four-armed standing or reclining form.",
        "key_features": ["Shankha (Conch)", "Chakra (Discus)", "Namam Forehead Mark", "Regal Four-Armed Posture"],
        "famous_temples": ["Srirangam Ranganathaswamy Temple", "Tirumala Venkateswara Temple", "Kanchipuram Varadharaja Temple"]
    },
    "shivan": {
        "title": "Lord Shiva / Nataraja / Lingam",
        "description": "Supreme ascetic and cosmic dancer. Iconography includes Trishula, Damaru (drum), crescent moon in matted locks (Jata), third eye, Lingam form, or Nataraja cosmic dance posture.",
        "key_features": ["Trishula & Damaru", "Jata (Matted Locks)", "Crescent Moon & Naga", "Nataraja / Lingam Form"],
        "famous_temples": ["Chidambaram Nataraja Temple", "Thanjavur Brihadisvara Temple", "Tiruvannamalai Annamalaiyar Temple"]
    }
}

def load_deity_model():
    global model, class_names
    if not os.path.exists(MODEL_PATH):
        print(f"Warning: Model file '{MODEL_PATH}' not found yet!")
        class_names = ["amman", "murugan", "perumal", "shivan"]
        return
    
    checkpoint = torch.load(MODEL_PATH, map_location=DEVICE)
    class_names = checkpoint.get("class_names", ["amman", "murugan", "perumal", "shivan"])
    
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

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "online",
        "backend": "Flask REST API",
        "device": str(DEVICE),
        "model_loaded": model is not None,
        "classes": class_names
    })

@app.route("/api/deities", methods=["GET"])
def get_deities_info():
    return jsonify({
        "status": "success",
        "metadata": DEITY_METADATA
    })

@app.route("/sample_image/<deity>", methods=["GET"])
def get_sample_image(deity):
    deity_dir = os.path.join(app.root_path, "deity_dataset", deity.lower())
    if os.path.exists(deity_dir):
        files = [f for f in os.listdir(deity_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
        if files:
            return send_from_directory(deity_dir, files[0])
    return jsonify({"error": f"No images found for deity: {deity}"}), 404

@app.route("/predict", methods=["POST"])
@app.route("/api/predict", methods=["POST"])
def predict_endpoint():
    if model is None:
        return jsonify({"error": "Model checkpoint not loaded. Please train or provide model.pt"}), 500

    if "file" not in request.files:
        return jsonify({"error": "No image file provided in request"}), 400
    
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
                "confidence": round(prob * 100, 2),
                "details": DEITY_METADATA.get(name, {})
            })
            
        # Sort descending by confidence
        results.sort(key=lambda x: x["confidence"], reverse=True)
        best_match = results[0]["class"]
        
        return jsonify({
            "success": True,
            "best_guess": best_match,
            "best_confidence": results[0]["confidence"],
            "best_metadata": DEITY_METADATA.get(best_match, {}),
            "predictions": results
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)

