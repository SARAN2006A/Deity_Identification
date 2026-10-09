# DeityVision AI — Full-Stack South Indian Sculpture Recognition & Temple Studio

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-ResNet50-EE4C2C.svg)](https://pytorch.org/)
[![Flask](https://img.shields.io/badge/Flask-REST%20API-000000.svg)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF.svg)](https://vitejs.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-Persistence-003B57.svg)](https://sqlite.org/)

**DeityVision AI** is a production-grade Full-Stack Deep Learning application engineered for South Indian Hindu deity sculpture identification, sacred iconography analysis, and temple heritage intelligence. It combines a fine-tuned **PyTorch ResNet-50** neural backbone, a high-performance **Flask RESTful API** backend with **SQLite persistence**, and a **Luxury Heritage Temple Gold Studio** built with **React 18 & Vite**.

---

## 🏛️ Latest Updates & Interface Architecture

### 1. Luxury Heritage / Temple Gold Studio Aesthetic
- **Rich Obsidian & Molten Gold Palette**: Built on deep obsidian slate (`#080706` / `#0f0d0b`) with warm golden dust ambiance, golden chamfered borders (`#f59e0b` / `#fbbf24`), radiant ambient auras, and decorative corner filigree (`corner-tl`, `corner-tr`, etc.).
- **Regal Typography**: Heading typography with Google Fonts [`Cinzel`](https://fonts.google.com/specimen/Cinzel), clean modern body readability with [`Plus Jakarta Sans`](https://fonts.google.com/specimen/Plus+Jakarta+Sans), and high-contrast monospace metrics with [`JetBrains Mono`](https://fonts.google.com/specimen/JetBrains+Mono).

### 2. All-in-One Studio Dashboard
- **Proper Header Layout**:
  - **Left**: Royal temple emblem with `DEITYVISION` gold-gradient title and subtext *"SACRED ICONOGRAPHY & TEMPLE STUDIO"*.
  - **Center**: Polished navigation pills (`🏛️ Temple Vault`, `📜 Iconography Shastras`, `⏱️ Scan Vault`, `📊 Telemetry`) with hover animations, borders, and active glow states.
  - **Right**: Real-time neural engine telemetry indicator (`ResNet-50 Active` with an emerald pulse gem).
  - Fully responsive flexbox design preventing button stacking and layout breaks.
- **Focused Focal Dropzone (No Clutter / No Sample Images)**:
  - Clean, dedicated sculpture dropzone supporting drag-and-drop file upload and live webcam snapshot capture.
  - Removed sample benchmark images from the dashboard for a distraction-free, high-precision scanning workflow.
  - **Contained Image Viewport**: Previews are strictly contained within a framed 380px viewport (`object-fit: contain`) with animated golden laser sweep reticle (`goldLaserScan`) to prevent image overflow.
- **Integrated Divine Verdict Console**:
  - **Deity Crown Header**: Canonical divine title, Tamil name, divine aspect badge, and glowing golden match gauge (e.g., `99.1%`).
  - **Neural Confidence Spectrum**: Dynamic golden probability distribution bars across all 4 canonical deity classes.
  - **Sacred Iconography Markers Shelf**: Ornate chips detailing distinguishing weapons (*Ayudhas*), crown styles (*Kirita*), mounts (*Vahanas*), and mudras.
  - **Sacred Moola Mantra**: Dedicated recitation sanctum with a 1-click clipboard copy button.
  - **Enshrined Sacred Abodes**: Quick pilgrimage cards directly opening temple dossiers.
  - **Vault Actions**: Instant SQLite bookmarking and structured JSON report export.

### 3. Side-by-Side Slideout Dossier Drawer (`StudioDrawer.jsx`)
- Seamless side drawer that slides from the right without navigating away or losing scanner state:
  - **🏛️ Temple Vault**: Search and filter South Indian shrines (Brihadisvara, Meenakshi, Palani Murugan, Srirangam, Chidambaram, Tirumala) with UNESCO badges and architectural highlights.
  - **📜 Iconography Shastras**: Comprehensive guides on weapons, postures, and AI distinguishing contours for each deity tradition.
  - **⏱️ Scan Vault**: Archive of past neural scans with bookmarking, timestamps, and deletion.
  - **📊 Telemetry**: Real-time inference stats, average accuracy, and ResNet-50 architecture specifications.

---

## 🏛️ Supported Deity Classes & Canonical Iconography

| Deity Class | Traditional Iconography & Attributes | Enshrined Famous Temples |
| :--- | :--- | :--- |
| **Lord Shiva** *(Nataraja / Lingam / Mahadeva)* | Trishula & Damaru drum, Jatamukuta (matted locks), crescent moon, third eye, Lingam or Nataraja cosmic dance posture. | Chidambaram Nataraja, Thanjavur Brihadisvara, Tiruvannamalai Annamalaiyar |
| **Lord Murugan** *(Kartikeya / Skanda / Shanmukha)* | Vel (sacred golden spear), Peacock mount (Mayil), youthful posture (Kumara), rooster pennant (Seval Kodi). | Palani Murugan, Tiruchendur Murugan, Swamimalai |
| **Lord Perumal** *(Vishnu / Ranganatha / Venkateswara)* | Shankha (conch), Chakra (discus), Namam forehead mark, regal four-armed standing or reclining posture. | Srirangam Ranganathaswamy, Tirumala Venkateswara, Kanchipuram Varadharaja |
| **Goddess Amman** *(Shakti / Parvati / Mariamman)* | Trishula (trident), Kirita-mukuta crown, lotus flower, divine feminine ornaments, seated or standing posture. | Madurai Meenakshi, Samayapuram Mariamman, Kanchipuram Kamakshi |

---

## 📁 Repository Structure

```
deity/
├── app.py                         # Flask REST API server & production static router
├── db.py                          # SQLite database persistence layer (scans, bookmarks, stats)
├── temple_data.py                 # Comprehensive iconography encyclopedia & temple directory
├── model.pt                       # Fine-tuned PyTorch ResNet-50 checkpoint (~94 MB)
├── deity_app.db                   # SQLite database file (created automatically)
├── requirements.txt               # Python dependencies
├── train.py                       # ResNet-50 transfer learning training pipeline
├── evaluate.py                    # Confusion matrix & benchmark evaluation suite
├── predict.py                     # Standalone CLI image inference tool
├── wikimedia_scraper.py           # Wikimedia Commons image scraper with rate-limiting
├── deity_dataset/                 # Training dataset categorized by deity class
│   ├── amman/
│   ├── murugan/
│   ├── perumal/
│   └── shivan/
└── frontend/                      # Modern React + Vite SPA
    ├── package.json
    ├── vite.config.js             # Reverse proxy configuration
    ├── index.html                 # Google Fonts & SEO tags
    ├── dist/                      # Compiled production build artifacts
    └── src/
        ├── main.jsx               # Application entrypoint & stylesheet linkage
        ├── App.jsx                # Root container & drawer state management
        ├── index.css              # Luxury Temple Gold design system & layout styling
        └── components/
            ├── StudioHeader.jsx   # Top studio bar with brand & navigation pills
            ├── StudioMainStage.jsx# Focal dropzone, laser reticle & verdict console
            └── StudioDrawer.jsx   # Slide-out drawer (Temples, Shastras, Vault, Telemetry)
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Returns backend status, device (CPU/CUDA), and loaded model classes. |
| `POST` | `/api/predict` | Accepts multipart `file` or JSON `image_b64`. Returns prediction breakdown, iconographic markers, recommended temples, and stores record in SQLite. |
| `GET` | `/api/history` | Fetches scan history with optional `?deity=` and `?bookmarked=true` filters. |
| `POST` | `/api/history/<id>/bookmark` | Toggles bookmark status for a scan record. |
| `DELETE` | `/api/history/<id>` | Deletes a past scan record from SQLite. |
| `GET` | `/api/stats` | Returns aggregate statistics (total scans, average confidence, distribution). |
| `GET` | `/api/temples` | Returns curated Dravidian temple directory with search & deity filters. |
| `GET` | `/api/deities` | Comprehensive iconography encyclopedia metadata. |
| `GET` | `/api/samples` | Curated sample images from the local dataset for API testing. |
| `GET` | `/sample_image/<deity>/<filename>` | Serves high-resolution sample sculpture photos. |

---

## 🚀 Quick Start & Running Locally

### 1. Run the Full-Stack Application (Flask + Built React)

The backend directly serves both the REST API and the production React frontend from `frontend/dist`:

```powershell
# Activate Python environment
.\.venv\Scripts\activate

# Install dependencies (if needed)
pip install -r requirements.txt

# Start the Full-Stack Server
python app.py
```
> The application will be accessible at **http://127.0.0.1:5000**.

### 2. Frontend Development Server (Optional for Live Editing)

For live Hot Module Replacement (HMR) during frontend UI development:

```powershell
cd frontend
npm install
npm run dev
```
> The Vite dev server will run at **http://localhost:5173** and automatically proxy API calls to port 5000.

### 3. Rebuilding the Frontend Bundle

Whenever changes are made to the frontend React components or CSS:

```powershell
cd frontend
npm run build
```
> Recompiles into `frontend/dist`, instantly ready to be served by `app.py`.

---

## 💡 Troubleshooting & Notes
- **Browser Cache Clearing**: If you notice old styles or buttons in your browser, perform a hard refresh using `Ctrl + Shift + R` or `Ctrl + F5` to reload the latest CSS bundle.
- **Webcam Permissions**: Ensure your browser has granted camera access permissions if using the live snapshot feature.

---

## 📜 License
Academic and Research Use. Temple imagery adheres to respective Creative Commons and public domain source declarations.
