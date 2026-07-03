# MedVision+ - Flask Frontend Landing Page

This repository contains the Flask web application client dashboard for **MedVision+**. It features a glassmorphic user dashboard, pill image scanner uploads, interactive real-time allergy-clash sandbox simulation, and medication alarm notifications.

---

## 📁 Project Structure (Frontend Only)
```
frontend/
├── app.py                 # Flask application (proxy to Backend API)
├── requirements.txt       # Python dependencies
├── reminders.json         # Locally scheduled alarm alerts
├── templates/
│   └── index.html        # Glassmorphic landing page template
├── static/
│   ├── css/style.css     # Responsive page styling (sandbox compacted)
│   └── js/main.js        # Auth, camera scan, search, and alarm audio triggers
└── docs/
    └── KAGGLER_WRITEUP.md # Hackathon Writeup Submission Report
```

---

## 🚀 Setup & Execution

### Prerequisites
- Python (3.8+)

### 1. Run the Flask Server
```bash
# Install dependencies
pip install -r requirements.txt

# Start the Flask web application
python app.py
```
The client UI will run on **http://localhost:5002**.

### 2. Configure Backend Connectivity
By default, the frontend points to the live backend URL `https://medvision-backend-egoh.onrender.com`. If you wish to override this to point to a local instance running on port 3000, set the environment variable:
```bash
# Windows PowerShell
$env:BACKEND_URL="http://localhost:3000"

# macOS/Linux Bash
export BACKEND_URL="http://localhost:3000"
```

---

## 🛡️ Hackathon Evaluation Concept Mapping

| Key Concept | Implementation Details | Location in Code |
| :--- | :--- | :--- |
| **Allergy Sandbox UI** | Embedded client sandbox section allowing users to select allergies, input drugs, and simulate real-time clash evaluations. | [templates/index.html](file:///c:/Users/Kundan/Downloads/MedVisionApp%202/MedVisionApp%202/frontend/templates/index.html) |
| **Pill Scan Camera** | HTML5 Camera stream capture and multipart visual uploads forwarding to backend Nvidia Vision parser. | [static/js/main.js](file:///c:/Users/Kundan/Downloads/MedVisionApp%202/MedVisionApp%202/frontend/static/js/main.js) |
| **Security features** | Implements JWT authorization payload tokens on API headers to guarantee patient allergy isolation. | [app.py](file:///c:/Users/Kundan/Downloads/MedVisionApp%202/MedVisionApp%202/frontend/app.py) |

---

## 📝 License
© MedVision+. Advancing healthcare through AI innovation.