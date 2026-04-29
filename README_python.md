# MedVision+ Landing Page (Python Flask)

A modern, clean, and futuristic landing page for MedVision+, an AI-powered medical application for pill recognition and medication safety, built with Python Flask.

## Features

- **Professional Healthcare Design**: Soft blue-white gradients with medical-themed icons
- **Responsive Layout**: Optimized for web, tablet, and mobile devices
- **Modern UI Components**: Clean navigation, hero section, features, and about section
- **AI/ML Technology Showcase**: Highlights PyTorch, TensorFlow, Computer Vision capabilities
- **Production-Ready**: Built with Flask for web deployment

## Tech Stack

- **Backend**: Python Flask
- **Frontend**: HTML5, CSS3, JavaScript
- **Icons**: Font Awesome
- **Styling**: Modern CSS with gradients and animations

## Quick Start

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the Application**
   ```bash
   python app.py
   ```

3. **View in Browser**
   Open [http://localhost:5000](http://localhost:5000)

## Project Structure

```
medvision+/
├── app.py                 # Flask application
├── requirements.txt       # Python dependencies
├── templates/
│   └── index.html        # Main HTML template
├── static/
│   └── css/
│       └── style.css     # Stylesheet
└── README.md             # This file
```

## Design Features

- **Navigation**: Clean navbar with MedVision+ logo and auth buttons
- **Hero Section**: AI-powered messaging with gradient background
- **Features**: Three-card layout showcasing core technologies
- **About Section**: Company information with key statistics
- **Responsive**: Adapts to different screen sizes seamlessly

## Deployment

For production deployment:

```bash
# Using Gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# Or deploy to cloud platforms like Heroku, AWS, GCP
```

## Customization

The design uses a consistent color palette:
- Primary Blue: `#4A90E2`
- Light Blue: `#7BB3F0`
- Dark Text: `#2C3E50`
- Light Text: `#5A6C7D`
- Background: `#FFFFFF` with gradient overlays