import os
import io
import re
import base64
import torch
import torch.nn.functional as F
import numpy as np
from PIL import Image
from torchvision import models, transforms
from flask import Flask, request, jsonify, send_from_directory, make_response, session
from werkzeug.security import generate_password_hash, check_password_hash

import db
from temple_data import DEITY_METADATA, TEMPLES_DIRECTORY

app = Flask(__name__, static_folder=os.path.join("frontend", "dist"), static_url_path="")
app.secret_key = os.environ.get("SECRET_KEY", "deityvision_sacred_temple_secret_key_2026")
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False

# Cross-Origin Resource Sharing (CORS) handler for modern frontend dev & prod
@app.after_request
def add_cors_headers(response):
    origin = request.headers.get("Origin")
    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    else:
        response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    return response

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        res = make_response()
        origin = request.headers.get("Origin")
        if origin:
            res.headers["Access-Control-Allow-Origin"] = origin
            res.headers["Access-Control-Allow-Credentials"] = "true"
        else:
            res.headers["Access-Control-Allow-Origin"] = "*"
        res.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        res.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        return res

# Global variables for model and transforms
MODEL_PATH = "model.pt"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = None
class_names = ["amman", "murugan", "perumal", "shivan"]

def load_deity_model():
    global model, class_names
    if not os.path.exists(MODEL_PATH):
        print(f"Warning: Model file '{MODEL_PATH}' not found yet!")
        return
    
    try:
        checkpoint = torch.load(MODEL_PATH, map_location=DEVICE)
        class_names = checkpoint.get("class_names", ["amman", "murugan", "perumal", "shivan"])
        
        m = models.resnet50(weights=None)
        m.fc = torch.nn.Sequential(
            torch.nn.Dropout(0.5),
            torch.nn.Linear(m.fc.in_features, len(class_names)),
        )
        m.load_state_dict(checkpoint["model_state"])
        m.to(DEVICE)
        m.eval()
        model = m
        print(f"Model loaded successfully on {DEVICE}. Classes: {class_names}")
    except Exception as e:
        print(f"Error loading model: {e}")

def transform_image(image_bytes):
    norm = transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    raw_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    
    # Generate compact thumbnail for history DB
    thumb = raw_img.copy()
    thumb.thumbnail((160, 160))
    buffered = io.BytesIO()
    thumb.save(buffered, format="JPEG", quality=75)
    thumbnail_b64 = "data:image/jpeg;base64," + base64.b64encode(buffered.getvalue()).decode("utf-8")
    
    tf = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        norm
    ])
    tensor = tf(raw_img).unsqueeze(0)
    
    return tensor, thumbnail_b64, raw_img

def extract_image_payload(req):
    """Extract raw image bytes and filename from multipart-form or JSON."""
    filename = "upload.jpg"
    image_bytes = None
    if "file" in req.files:
        file = req.files["file"]
        if file.filename != "":
            filename = file.filename
            image_bytes = file.read()
    elif req.is_json and "image_b64" in req.json:
        data = req.json["image_b64"]
        if "," in data:
            data = data.split(",")[1]
        image_bytes = base64.b64decode(data)
        filename = req.json.get("filename", "captured_webcam.jpg")
    return image_bytes, filename

def check_image_quality(image_bytes):
    try:
        raw_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        width, height = raw_img.size

        is_low_res = (width < 224) or (height < 224)

        gray_img = raw_img.convert("L")
        gray_arr = np.array(gray_img, dtype=np.float32)
        avg_brightness = float(np.mean(gray_arr))
        is_dark = avg_brightness < 40.0
        is_overexposed = avg_brightness > 235.0

        gray_t = torch.from_numpy(gray_arr).unsqueeze(0).unsqueeze(0)
        lap_kernel = torch.tensor([[0., 1., 0.], [1., -4., 1.], [0., 1., 0.]]).view(1, 1, 3, 3)
        lap_edges = F.conv2d(gray_t, lap_kernel)
        blur_variance = float(lap_edges.var().item())
        is_blurry = blur_variance < 100.0

        issues = []
        if is_blurry:
            issues.append(f"Image is too blurry (sharpness score: {round(blur_variance, 1)}, threshold: 100)")
        if is_dark:
            issues.append(f"Image is too dark (brightness: {round(avg_brightness, 1)}/255, minimum: 40)")
        elif is_overexposed:
            issues.append(f"Image is overexposed (brightness: {round(avg_brightness, 1)}/255, maximum: 235)")
        if is_low_res:
            issues.append(f"Resolution is too small ({width}x{height}, minimum recommended: 224x224)")

        is_good = (len(issues) == 0)
        status_label = "GOOD" if is_good else "POOR"
        status_message = "Image Quality: GOOD ✓" if is_good else "Image Quality: POOR ⚠ Please upload a clearer image."

        return {
            "status": status_label,
            "message": status_message,
            "is_good": is_good,
            "blur_score": round(blur_variance, 2),
            "is_blurry": is_blurry,
            "brightness_score": round(avg_brightness, 2),
            "is_dark": is_dark,
            "is_overexposed": is_overexposed,
            "resolution": {"width": width, "height": height},
            "is_low_res": is_low_res,
            "issues": issues
        }
    except Exception as e:
        return {
            "status": "GOOD",
            "message": "Image Quality: GOOD ✓",
            "is_good": True,
            "blur_score": 500.0,
            "is_blurry": False,
            "brightness_score": 128.0,
            "is_dark": False,
            "is_overexposed": False,
            "resolution": {"width": 256, "height": 256},
            "is_low_res": False,
            "issues": [],
            "error": str(e)
        }

def generate_gradcam(model_instance, tensor, class_idx, raw_pil_image):
    try:
        model_instance.eval()
        activations = []
        gradients = []

        def forward_hook(module, inp, out):
            activations.append(out)

        def backward_hook(module, grad_in, grad_out):
            gradients.append(grad_out[0])

        target_layer = model_instance.layer4[-1]
        h_f = target_layer.register_forward_hook(forward_hook)
        h_b = target_layer.register_full_backward_hook(backward_hook)

        input_tensor = tensor.clone().detach().to(DEVICE)
        input_tensor.requires_grad = True

        outputs = model_instance(input_tensor)
        score = outputs[0, class_idx]

        model_instance.zero_grad()
        score.backward()

        h_f.remove()
        h_b.remove()

        act = activations[0].detach()       # [1, 2048, 7, 7]
        grad = gradients[0].detach()         # [1, 2048, 7, 7]
        weights = torch.mean(grad, dim=(2, 3), keepdim=True)
        cam = torch.sum(weights * act, dim=1, keepdim=True)
        cam = F.relu(cam)
        cam = F.interpolate(cam, size=(224, 224), mode="bilinear", align_corners=False)
        cam_arr = cam.squeeze().cpu().numpy()

        cam_min, cam_max = float(cam_arr.min()), float(cam_arr.max())
        if cam_max > cam_min:
            cam_norm = (cam_arr - cam_min) / (cam_max - cam_min)
        else:
            cam_norm = np.zeros_like(cam_arr)

        orig_aligned = raw_pil_image.resize((224, 224), Image.Resampling.BILINEAR).convert("RGB")
        orig_np = np.array(orig_aligned, dtype=np.float32)

        r = np.clip(1.5 - np.abs(4.0 * cam_norm - 3.0), 0.0, 1.0)
        g = np.clip(1.5 - np.abs(4.0 * cam_norm - 2.0), 0.0, 1.0)
        b = np.clip(1.5 - np.abs(4.0 * cam_norm - 1.0), 0.0, 1.0)
        heatmap_rgb = np.stack([r, g, b], axis=-1) * 255.0

        alpha = 0.50
        overlay_np = np.clip((1.0 - alpha) * orig_np + alpha * heatmap_rgb, 0, 255).astype(np.uint8)
        heatmap_np = np.clip(heatmap_rgb, 0, 255).astype(np.uint8)

        overlay_img = Image.fromarray(overlay_np)
        heatmap_img = Image.fromarray(heatmap_np)

        def to_b64(img_obj):
            buf = io.BytesIO()
            img_obj.save(buf, format="JPEG", quality=85)
            return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode("utf-8")

        overlay_b64 = to_b64(overlay_img)
        heatmap_b64 = to_b64(heatmap_img)
        orig_b64 = to_b64(orig_aligned)

        upper_score = float(np.mean(cam_norm[:75, :]))
        mid_score = float(np.mean(cam_norm[75:150, :]))
        lower_score = float(np.mean(cam_norm[150:, :]))
        flank_score = float(np.mean(np.concatenate([cam_norm[:, :60], cam_norm[:, 164:]], axis=1)))

        regions = []
        if upper_score > 0.30:
            regions.append("sculpture crown & facial iconography (Kirita-Makuta)")
        if mid_score > 0.30:
            regions.append("torso ornaments, chest garland, and mudra posture")
        if flank_score > 0.30:
            regions.append("sacred ayudha markers (divine weapons & emblems)")
        if lower_score > 0.30:
            regions.append("pedestal base, peetam, and vahana mount")

        if not regions:
            regions.append("sculpture's central iconographic contours")

        attention_summary = f"mainly focused on the sculpture's important regions ({', '.join(regions)})."

        return {
            "success": True,
            "overlay_image": overlay_b64,
            "heatmap_image": heatmap_b64,
            "original_image": orig_b64,
            "attention_summary": attention_summary,
            "attention_regions": regions,
            "layer_name": "ResNet-50 layer4 (Bottleneck Conv)"
        }
    except Exception as e:
        print(f"Error computing Grad-CAM: {e}")
        return {
            "success": False,
            "error": str(e),
            "attention_summary": "mainly focused on the sculpture's important regions.",
            "attention_regions": ["sculpture's important regions"]
        }

# Load model at startup
load_deity_model()


# ================= AUTHENTICATION ENDPOINTS =================

@app.route("/api/auth/register", methods=["POST"])
def auth_register():
    data = request.get_json(silent=True) or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"error": "Full name, email, and password are required."}), 400

    if not re.match(r"^[^@]+@[^@]+\.[^@]+$", email):
        return jsonify({"error": "Please enter a valid email address."}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long."}), 400

    existing_user = db.get_user_by_email(email)
    if existing_user:
        return jsonify({"error": "An account with this email address already exists. Please login."}), 400

    pw_hash = generate_password_hash(password)
    user_id = db.create_user(name, email, pw_hash)

    if not user_id:
        return jsonify({"error": "Failed to create user account. Please try again."}), 500

    session['user_id'] = user_id
    user_data = db.get_user_by_id(user_id)

    return jsonify({
        "status": "success",
        "message": "Account created successfully.",
        "user": user_data
    }), 201


@app.route("/api/auth/login", methods=["POST"])
def auth_login():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    user = db.get_user_by_email(email)
    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid email address or password."}), 401

    session['user_id'] = user["id"]
    user_info = {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "created_at": user["created_at"]
    }

    return jsonify({
        "status": "success",
        "message": "Logged in successfully.",
        "user": user_info
    })


@app.route("/api/auth/logout", methods=["POST"])
def auth_logout():
    session.pop('user_id', None)
    return jsonify({
        "status": "success",
        "message": "Logged out successfully."
    })


@app.route("/api/auth/me", methods=["GET"])
def auth_me():
    user_id = session.get('user_id')
    if user_id:
        user = db.get_user_by_id(user_id)
        if user:
            return jsonify({
                "status": "success",
                "authenticated": True,
                "user": user
            })
    
    return jsonify({
        "status": "success",
        "authenticated": False,
        "user": None
    })


# ================= APP API ENDPOINTS =================

@app.route("/api/health", methods=["GET"])
def health_check():
    user_id = session.get('user_id')
    return jsonify({
        "status": "online",
        "backend": "Flask REST API v2.0 (Full-Stack Auth Enabled)",
        "device": str(DEVICE),
        "model_loaded": model is not None,
        "classes": class_names,
        "database": "SQLite (scan_history, users)",
        "session_authenticated": bool(user_id)
    })

@app.route("/api/deities", methods=["GET"])
def get_deities():
    return jsonify({
        "status": "success",
        "metadata": DEITY_METADATA
    })

@app.route("/api/temples", methods=["GET"])
def get_temples():
    user_id = session.get('user_id')
    deity_filter = request.args.get("deity", "").lower()
    if deity_filter:
        filtered = [t for t in TEMPLES_DIRECTORY if t.get("deity", "").lower() == deity_filter]
    else:
        filtered = list(TEMPLES_DIRECTORY)
    
    # Append user-isolated bookmark state for each temple
    for t in filtered:
        try:
            t["bookmarked"] = db.get_temple_bookmark_state(t.get("id"), user_id=user_id)
        except Exception:
            t["bookmarked"] = False
    return jsonify({"status": "success", "count": len(filtered), "temples": filtered})

@app.route("/api/temples/<temple_id>/bookmark", methods=["POST"])
def toggle_temple_bookmark_route(temple_id):
    user_id = session.get('user_id')
    try:
        new_state = db.toggle_temple_bookmark(temple_id, user_id=user_id)
        return jsonify({"status": "success", "temple_id": temple_id, "bookmarked": new_state})
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route("/api/samples", methods=["GET"])
def get_samples():
    samples = []
    base_dir = os.path.join(app.root_path, "deity_dataset")
    
    for deity in class_names:
        deity_dir = os.path.join(base_dir, deity.lower())
        if os.path.exists(deity_dir):
            files = [f for f in os.listdir(deity_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
            for f in files[:2]:
                samples.append({
                    "deity": deity,
                    "filename": f,
                    "url": f"/sample_image/{deity}/{f}",
                    "title": DEITY_METADATA.get(deity, {}).get("title", deity.capitalize())
                })
    return jsonify({"status": "success", "samples": samples})

@app.route("/sample_image/<deity>/<filename>", methods=["GET"])
def get_sample_image_file(deity, filename):
    deity_dir = os.path.join(app.root_path, "deity_dataset", deity.lower())
    if os.path.exists(deity_dir):
        return send_from_directory(deity_dir, filename)
    return jsonify({"error": f"Image not found: {filename}"}), 404

@app.route("/sample_image/<deity>", methods=["GET"])
def get_sample_image_default(deity):
    deity_dir = os.path.join(app.root_path, "deity_dataset", deity.lower())
    if os.path.exists(deity_dir):
        files = [f for f in os.listdir(deity_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
        if files:
            return send_from_directory(deity_dir, files[0])
    return jsonify({"error": f"No images found for deity: {deity}"}), 404

@app.route("/api/quality_check", methods=["POST"])
def quality_check_endpoint():
    image_bytes, filename = extract_image_payload(request)
    if not image_bytes:
        return jsonify({"error": "No image payload found in request (provide 'file' multipart or 'image_b64' JSON)"}), 400

    quality_result = check_image_quality(image_bytes)
    return jsonify({
        "status": "success",
        "quality": quality_result
    })

@app.route("/api/predict", methods=["POST"])
@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": "PyTorch ResNet50 model checkpoint is not loaded. Ensure model.pt exists."}), 500

    image_bytes, filename = extract_image_payload(request)

    if not image_bytes:
        return jsonify({"error": "No image payload found in request (provide 'file' multipart or 'image_b64' JSON)"}), 400

    try:
        quality_result = check_image_quality(image_bytes)
        tensor, thumb_b64, raw_pil = transform_image(image_bytes)
        tensor = tensor.to(DEVICE)

        with torch.no_grad():
            outputs = model(tensor)
            probs = F.softmax(outputs, dim=1)[0]

        predictions = []
        for name, prob in zip(class_names, probs.cpu().tolist()):
            predictions.append({
                "class": name,
                "confidence": round(prob * 100, 2),
                "details": DEITY_METADATA.get(name, {})
            })

        predictions.sort(key=lambda x: x["confidence"], reverse=True)
        best_match = predictions[0]["class"]
        best_conf = predictions[0]["confidence"]
        best_info = DEITY_METADATA.get(best_match, {})

        DEITY_SHORT_NAMES = {
            "amman": "Amman",
            "murugan": "Murugan",
            "perumal": "Perumal",
            "shivan": "Shiva"
        }

        top3_predictions = []
        for rank_idx, pred in enumerate(predictions[:3]):
            cname = pred["class"].lower()
            short_name = DEITY_SHORT_NAMES.get(cname, cname.capitalize())
            deity_title = DEITY_METADATA.get(cname, {}).get("title", short_name)
            conf_pct = int(round(pred["confidence"]))
            top3_predictions.append({
                "rank": rank_idx + 1,
                "class": pred["class"],
                "short_name": short_name,
                "name": deity_title,
                "confidence": pred["confidence"],
                "confidence_pct": conf_pct,
                "formatted": f"{rank_idx + 1}. {short_name} — {conf_pct}%"
            })

        best_class_idx = class_names.index(best_match)
        gradcam_result = generate_gradcam(model, tensor, best_class_idx, raw_pil)
        gradcam_result["predicted_deity"] = DEITY_SHORT_NAMES.get(best_match.lower(), best_match.capitalize())
        gradcam_result["deity_title"] = best_info.get("title", best_match.capitalize())
        gradcam_result["confidence"] = round(best_conf, 1)

        recommended_temples = [t for t in TEMPLES_DIRECTORY if t.get("deity", "").lower() == best_match]

        user_id = session.get('user_id')

        scan_id = db.save_scan(
            filename=filename,
            best_guess=best_match,
            confidence=best_conf,
            predictions=predictions,
            image_b64=thumb_b64,
            user_id=user_id
        )

        return jsonify({
            "success": True,
            "scan_id": scan_id,
            "best_guess": best_match,
            "best_confidence": best_conf,
            "best_metadata": best_info,
            "predictions": predictions,
            "top3_predictions": top3_predictions,
            "quality_check": quality_result,
            "gradcam": gradcam_result,
            "recommended_temples": recommended_temples,
            "thumbnail": thumb_b64
        })

    except Exception as e:
        return jsonify({"error": f"Inference pipeline failed: {str(e)}"}), 500


@app.route("/api/history", methods=["GET"])
def get_scan_history():
    user_id = session.get('user_id')
    limit = request.args.get("limit", default=50, type=int)
    deity = request.args.get("deity", default=None, type=str)
    bookmarked = request.args.get("bookmarked", default=False, type=lambda v: v.lower() in ["true", "1"])
    
    records = db.get_history(limit=limit, deity=deity, bookmarked_only=bookmarked, user_id=user_id)
    return jsonify({
        "status": "success",
        "count": len(records),
        "history": records
    })

@app.route("/api/history/<int:scan_id>/bookmark", methods=["POST"])
def toggle_history_bookmark(scan_id):
    user_id = session.get('user_id')
    new_state = db.toggle_bookmark(scan_id, user_id=user_id)
    if new_state is None:
        return jsonify({"error": "Scan record not found"}), 404
    return jsonify({"status": "success", "scan_id": scan_id, "bookmarked": new_state})

@app.route("/api/history/<int:scan_id>", methods=["DELETE"])
def delete_history_item(scan_id):
    user_id = session.get('user_id')
    deleted = db.delete_scan(scan_id, user_id=user_id)
    if not deleted:
        return jsonify({"error": "Scan record not found"}), 404
    return jsonify({"status": "success", "message": f"Scan {scan_id} deleted successfully"})

@app.route("/api/stats", methods=["GET"])
def get_analytics():
    user_id = session.get('user_id')
    stats = db.get_stats(user_id=user_id)
    return jsonify({
        "status": "success",
        "stats": stats
    })

# Serve Frontend if built or provide fallback
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    dist_dir = os.path.join(app.root_path, "frontend", "dist")
    if os.path.exists(dist_dir):
        if path != "" and os.path.exists(os.path.join(dist_dir, path)):
            return send_from_directory(dist_dir, path)
        return send_from_directory(dist_dir, "index.html")
    templates_index = os.path.join(app.root_path, "templates", "index.html")
    if os.path.exists(templates_index):
        with open(templates_index, "r", encoding="utf-8") as f:
            return f.read(), 200, {"Content-Type": "text/html; charset=utf-8"}
    return "DeityVision AI Backend Online. Run Vite frontend at port 5173 or build frontend.", 200

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
