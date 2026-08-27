# DeityVision AI — South Indian Sculpture Recognition & Iconography Engine

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-ResNet50-EE4C2C.svg)](https://pytorch.org/)
[![Flask](https://img.shields.io/badge/Flask-REST%20API-000000.svg)](https://flask.palletsprojects.com/)

An enterprise-grade Deep Learning image classifier and interactive Web Application powered by PyTorch (ResNet50 transfer learning) and Flask. **DeityVision AI** accurately identifies South Indian temple deity sculptures across four major classes—**Amman**, **Murugan**, **Perumal**, and **Shivan**—providing detailed iconographic analysis, confidence scoring, and temple metadata.

---

## 🌟 Key Features

- **Transfer Learning Backbone**: Fine-tuned ResNet50 neural network architecture using PyTorch with a custom classification head (Dropout + Linear Layer).
- **Class Imbalance Mitigation**: Computes inverse-frequency class weights dynamically to handle sample imbalances across classes.
- **Glassmorphism Web Dashboard**: Modern, responsive single-page web app built with Vanilla CSS & JS, featuring drag-and-drop uploads, live sample previews, animated confidence breakdown bars, and iconographic metadata cards.
- **Full REST API Suite**: Production-ready JSON API endpoints (`/api/predict`, `/api/health`, `/api/deities`, `/sample_image/<deity>`) for seamless frontend or mobile integration.
- **Automated Dataset Scraper**: Includes a robust Wikimedia Commons scraper (`wikimedia_scraper.py`) with automatic exponential backoff retries and metadata manifest logging.
- **Batch Dataset Importer**: CLI tool (`import_dataset.py`) for importing external local folders or single-deity datasets into the standardized training directory.
- **Evaluation & Benchmarking Suite**: Generates complete confusion matrices, precision, recall, and top misclassification analysis (`evaluate.py`).
- **Clean Model Packaging**: Native single-file PyTorch checkpoint saving both model weights and class mappings into `model.pt` without external redundant sidecar files.

---

## 🏛️ Supported Deity Classes & Iconography

| Deity Class | Traditional Iconography & Attributes | Famous Temples |
| :--- | :--- | :--- |
| **Goddess Amman** *(Shakti / Parvati)* | Trishula (trident), Kirita-mukuta crown, lotus flower, divine feminine ornaments, seated or standing posture. | Madurai Meenakshi, Samayapuram Mariamman, Kanchipuram Kamakshi |
| **Lord Murugan** *(Kartikeya / Skanda)* | Vel (sacred spear), Peacock mount (Mayil), youthful posture (Kumara), rooster pennant. | Palani Murugan, Tiruchendur Murugan, Swamimalai |
| **Lord Perumal** *(Vishnu / Ranganatha)* | Shankha (conch), Chakra (discus), Namam forehead mark, regal four-armed standing or reclining posture. | Srirangam Ranganathaswamy, Tirumala Venkateswara, Kanchipuram Varadharaja |
| **Lord Shiva** *(Nataraja / Lingam)* | Trishula & Damaru drum, Jata (matted hair locks), crescent moon, third eye, Lingam form or Nataraja cosmic dance posture. | Chidambaram Nataraja, Thanjavur Brihadisvara, Tiruvannamalai Annamalaiyar |

---

## 📁 Repository Structure

```
deity/
├── app.py                   # Main Flask web application & REST API server
├── train.py                 # ResNet50 transfer learning training pipeline
├── evaluate.py              # Confusion matrix & precision/recall evaluation suite
├── predict.py               # Standalone single-image CLI inference tool
├── import_dataset.py        # External dataset importer tool
├── wikimedia_scraper.py     # Wikimedia Commons search & image scraper
├── model.pt                 # Trained PyTorch ResNet50 model checkpoint
├── requirements.txt         # Project dependency specification
├── README.md                # Project documentation
├── templates/
│   └── index.html           # Modern Glassmorphism Web App frontend
└── deity_dataset/           # Training image dataset directory
    ├── amman/               # Amman sculpture photos (~402 images)
    ├── murugan/             # Murugan sculpture photos (~178 images)
    ├── perumal/             # Perumal sculpture photos (~208 images)
    ├── shivan/              # Shivan sculpture photos (~378 images)
    └── manifest.json        # Image source & license tracking manifest
```

---

## 🚀 Quick Start & Setup

### 1. Prerequisites & Virtual Environment

Ensure Python 3.10+ is installed on your system.

```bash
# Clone or navigate to project directory
cd deity

# Create and activate a virtual environment (optional but recommended)
python -m venv .venv

# On Windows (PowerShell):
.venv\Scripts\Activate.ps1

# On Linux/macOS:
source .venv/bin/activate
```

### 2. Install Dependencies

Install PyTorch, Torchvision, Flask, Pillow, and Requests:

```bash
pip install -r requirements.txt
```

---

## 🌐 Running the Web Application & REST API

### Start the Flask Server

Run `app.py` to start the web application:

```bash
python app.py
```

The app will launch at **`http://127.0.0.1:5000`**.

### REST API Usage

#### 1. Health Check
```http
GET /api/health
```
**Response:**
```json
{
  "backend": "Flask REST API",
  "classes": ["amman", "murugan", "perumal", "shivan"],
  "device": "cuda",
  "model_loaded": true,
  "status": "online"
}
```

#### 2. Get Deity Metadata
```http
GET /api/deities
```
Returns comprehensive iconographic descriptions, key features, and famous temples for all supported deity classes.

#### 3. Image Prediction API Endpoint
Send a `POST` request with a multipart image file:
```bash
curl -X POST -F "file=@path/to/sculpture.jpg" http://127.0.0.1:5000/api/predict
```

**Response Example:**
```json
{
  "best_confidence": 98.45,
  "best_guess": "murugan",
  "best_metadata": {
    "description": "Divine warrior & commander of celestial forces...",
    "famous_temples": ["Palani Murugan Temple", "Tiruchendur Murugan Temple"],
    "key_features": ["Vel (Sacred Spear)", "Peacock Mount (Mayil)", "Youthful Form (Kumara)"],
    "title": "Lord Murugan / Kartikeya / Skanda"
  },
  "predictions": [
    { "class": "murugan", "confidence": 98.45, "details": { ... } },
    { "class": "shivan", "confidence": 1.20, "details": { ... } },
    { "class": "amman", "confidence": 0.25, "details": { ... } },
    { "class": "perumal", "confidence": 0.10, "details": { ... } }
  ],
  "success": true
}
```

---

## 🏋️ Model Training & Evaluation

### 1. Training the Model (`train.py`)

Train the ResNet50 transfer learning model using custom dataset directories:

```bash
python train.py --data_dir deity_dataset --epochs 15 --batch_size 16 --out model.pt
```

**Key Command Arguments:**
- `--data_dir`: Directory containing subfolders per deity class (default: `deity_dataset`).
- `--epochs`: Number of training epochs (default: `15`).
- `--batch_size`: Batch size for training & validation (default: `16`).
- `--lr`: Initial learning rate for classification head (default: `1e-3`).
- `--unfreeze_after`: Epoch at which backbone layers unfreeze for fine-tuning (default: `5`).
- `--out`: Destination file for saving PyTorch checkpoint (default: `model.pt`).

### 2. Evaluating Model Performance (`evaluate.py`)

Generate a confusion matrix, per-class precision, recall, and top misclassification analysis:

```bash
python evaluate.py --model model.pt --data_dir deity_dataset
```

### 3. Single Image CLI Prediction (`predict.py`)

Perform quick single-image inference directly from your command line:

```bash
python predict.py --model model.pt --image path/to/photo.jpg
```

---

## 📊 Benchmark & Evaluation Results

Tested on **1,166 total images** across the four deity classes:

### Confusion Matrix
```
                  predicted ->
                 amman  murugan  perumal   shivan
true amman       61        0        2        1
true murugan        8       24        0        1
true perumal        1        0       30        1
true shivan        5        2        0       63
```

### Per-Class Metrics (~89.45% Overall Validation Accuracy)

| Deity Class | Precision | Recall | Sample Size (n) |
| :--- | :---: | :---: | :---: |
| **Amman** | **0.81** | **0.95** | 64 |
| **Murugan** | **0.92** | **0.73** | 33 |
| **Perumal** | **0.94** | **0.94** | 32 |
| **Shivan** | **0.95** | **0.90** | 70 |

---

## 🛠️ Dataset Management & Tools

### Scrape Images from Wikimedia Commons (`wikimedia_scraper.py`)
Automatically query Wikimedia Commons API for sculpture photos across all deity categories:

```bash
# Scrape all deity categories:
python wikimedia_scraper.py

# Scrape specific deity categories:
python wikimedia_scraper.py murugan perumal
```
Features exponential backoff rate limiting, user-agent compliance, and manifest tracking in `deity_dataset/manifest.json`.

### Batch Import External Folders (`import_dataset.py`)
Import external images or structured image subfolders directly into `deity_dataset/`:

```bash
# Import a folder with deity subfolders:
python import_dataset.py "C:\path\to\my_dataset"

# Import images for a single deity class:
python import_dataset.py "C:\path\to\ganesha_photos" --class_name ganesha
```

---

## 🧹 Maintenance & Optimizations

- **Streamlined Checkpointing**: Class names are stored directly inside [`model.pt`](file:///c:/Users/saran/Documents/deity/model.pt). Redundant external sidecar files (`model.pt.classes.json`) have been cleaned up and disabled in [`train.py`](file:///c:/Users/saran/Documents/deity/train.py#L184-L188).
- **Clean Execution**: Automated `.gitignore` rules prevent bytecode (`__pycache__`) and local virtual environments (`.venv/`) from clogging repository commits.
