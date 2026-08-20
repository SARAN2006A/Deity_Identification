# South Indian Deity Sculpture Classifier & REST API

A transfer-learning image classifier (PyTorch ResNet50 backbone) and interactive Flask Web Application for classifying South Indian deity sculptures among **Amman**, **Murugan**, **Perumal**, and **Shivan**.

---

## 🌟 Key Features

- **Transfer Learning Backbone**: Fine-tuned ResNet50 architecture with custom dropout classification head.
- **Dataset Tools**: Includes automated Wikimedia Commons scraper (`wikimedia_scraper.py`) and batch dataset importer (`import_dataset.py`).
- **Class Imbalance Handling**: Automatically computes inverse-frequency weighted cross-entropy loss.
- **Streamlined Web Interface**: Modern glassmorphism UI supporting drag-and-drop sculpture upload and instant probability & iconographic breakdown.
- **REST API Endpoint**: `/api/predict` JSON endpoint for automated multi-part image inference.
- **Evaluation Suite**: Generates per-class precision, recall, and confusion matrix (`evaluate.py`).

---

## 🚀 Quick Start & Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 📁 Dataset Management

### Dataset Structure
The training dataset is structured inside `deity_dataset/` with one folder per deity class:
```
deity_dataset/
├── amman/      (402 images)
├── murugan/    (178 images)
├── perumal/    (208 images)
└── shivan/     (378 images)
```

### Importing External Datasets
Use `import_dataset.py` to import external folders:
```bash
# Import a folder containing deity subfolders or single deity images:
python import_dataset.py "path/to/your_folder"
```

### Scrape Images from Wikimedia Commons
Use `wikimedia_scraper.py` to fetch photos from Wikimedia:
```bash
python wikimedia_scraper.py
```

---

## 🏋️ Training & Evaluation

### 1. Train Model
Train the ResNet50 transfer learning model (backbone frozen for first 5 epochs, followed by full fine-tuning with early stopping):
```bash
python train.py --data_dir deity_dataset --epochs 15 --batch_size 16 --out model.pt
```

### 2. Evaluate Model Performance
Evaluate performance and generate a full confusion matrix:
```bash
python evaluate.py --model model.pt --data_dir deity_dataset
```

---

## 📊 Empirical Benchmark & Evaluation Results

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

### Per-Class Metrics (~89.45% Overall Accuracy)
| Deity Class | Precision | Recall | Sample Size (n) |
| :--- | :---: | :---: | :---: |
| **Amman** | 0.81 | 0.95 | 64 |
| **Murugan** | 0.92 | 0.73 | 33 |
| **Perumal** | 0.94 | 0.94 | 32 |
| **Shivan** | 0.95 | 0.90 | 70 |

---

## 🌐 Running the Web Application & REST API

Launch the Flask web server:
```bash
python app.py
```
Open `http://127.0.0.1:5000` in your web browser.

### REST API Endpoint
Send a POST request to `/api/predict` with an image file:
```bash
curl -X POST -F "file=@path/to/photo.jpg" http://127.0.0.1:5000/api/predict
```

---

## 🔮 Single Image CLI Prediction

Run inference from the command line on any single image file:
```bash
python predict.py --model model.pt --image path/to/photo.jpg
```
