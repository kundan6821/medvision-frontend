# MedVision+ Landing Page

A modern, clean, and futuristic landing page for MedVision+, an AI-powered medical application for pill recognition and medication safety.

## Features

- **Professional Healthcare Design**: Soft blue-white gradients with medical-themed icons
- **Responsive Layout**: Optimized for web, tablet, and mobile devices
- **Modern UI Components**: Clean navigation, hero section, features, and about section
- **AI/ML Technology Showcase**: Highlights PyTorch, TensorFlow, Computer Vision capabilities
- **Production-Ready**: Built with React Native and Expo for cross-platform deployment

## Tech Stack

- **Frontend**: React Native, Expo
- **Styling**: React Native StyleSheet with LinearGradient
- **Icons**: Expo Vector Icons (Ionicons)
- **Platform**: Web, iOS, Android compatible

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run web
   ```

3. **View in Browser**
   Open [http://localhost:19006](http://localhost:19006)

## Project Structure

```
medvision+/
├── App.js              # Main landing page component
├── package.json        # Dependencies and scripts
├── app.json           # Expo configuration
├── babel.config.js    # Babel configuration
└── README.md          # This file
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
# Build for web
expo build:web

# Deploy to various platforms
expo publish
```

## Customization

The design uses a consistent color palette:
- Primary Blue: `#4A90E2`
- Light Blue: `#7BB3F0`
- Dark Text: `#2C3E50`
- Light Text: `#5A6C7D`
- Background: `#FFFFFF` with gradient overlays