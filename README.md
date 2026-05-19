# DentPath EDU - Interactive Educational Application in Odontogenic Oral Pathology

A cross-platform educational application for dental students featuring 3D models, AR visualization, AI-powered chatbot, quiz system, and comprehensive study modules.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| 3D/AR | Three.js + React Three Fiber |
| Styling | Tailwind CSS |
| Backend | Node.js + Express |
| Database | SQLite (better-sqlite3) |
| Auth | JWT + bcrypt |
| AI | Claude API (Anthropic) |
| Deployment | PWA + Capacitor (Android) |

## Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd dental-app

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Running the Application

```bash
# Terminal 1: Start backend server
cd server
node index.js
# Server runs on http://localhost:5000

# Terminal 2: Start frontend dev server
npm run dev
# App runs on http://localhost:5173
```

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | student@bahria.edu.pk | student123 |
| Faculty | faculty@bahria.edu.pk | faculty123 |

## Features

### Student Features
- **3D Learning Modules** - Interactive Three.js dental models (rotate, zoom, pan)
- **AR Topic Explorer** - Augmented Reality visualization of dental structures
- **AI Chatbot (DentAI)** - Claude-powered assistant for dental pathology queries
- **Quiz System** - Auto-graded MCQs with difficulty levels and explanations
- **PDF Upload & Analysis** - AI-powered document analysis and quiz generation
- **Clinical Case Studies** - Differential diagnosis practice
- **Bookmarks & Notes** - Personal study organization
- **User Guide** - In-app help documentation

### Faculty Features
- **Student Reports** - Performance analytics with score distribution
- **Quiz Management** - Full CRUD for question bank
- **Module Management** - Create and edit learning content
- **Case Management** - Create clinical case studies
- **Announcements** - Broadcast to students
- **PDF Upload** - Upload course material

### Technical Features
- **Real 3D Models** - Three.js powered dental anatomy visualization
- **AR Visualization** - WebXR-ready augmented reality viewer
- **JWT Authentication** - Secure role-based access control
- **SQLite Database** - Persistent server-side data storage
- **PWA Support** - Installable on mobile devices
- **Capacitor Ready** - Build native Android APK

## Building for Production

```bash
# Build frontend
npm run build

# The dist/ folder is ready for deployment
```

## Android Deployment (Capacitor)

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# Initialize and add Android platform
npx cap init DentPathEDU edu.bahria.dentpath --web-dir dist
npx cap add android

# Build and sync
npm run build
npx cap sync

# Open in Android Studio
npx cap open android
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | User login |
| POST | /api/auth/register | User registration |
| GET | /api/modules | List all modules |
| GET | /api/quiz/questions | Get quiz questions |
| POST | /api/quiz/submit | Submit quiz result |
| GET | /api/reports | Faculty: student reports |
| POST | /api/upload/pdf | Upload PDF file |
| GET | /api/cases | List clinical cases |
| GET | /api/announcements | List announcements |

## Project Structure

```
dental-app/
├── src/
│   ├── backend/          # Frontend API layer (localStorage fallback)
│   ├── components/
│   │   ├── 3d/           # Three.js 3D models (Tooth, Jaw, Dental scenes)
│   │   ├── layout/       # App shell, sidebar, topbar
│   │   └── ui/           # Reusable UI components
│   ├── context/          # React Context (global state)
│   ├── pages/
│   │   ├── student/      # Student dashboard, modules, quiz, AR, chatbot
│   │   └── faculty/      # Faculty dashboard, reports, management
│   ├── config.js         # API configuration
│   └── App.jsx           # Root component + router
├── server/
│   ├── index.js          # Express server entry
│   ├── db.js             # SQLite database + seeding
│   ├── middleware/        # JWT auth middleware
│   └── routes/           # API route handlers
├── public/
│   ├── manifest.json     # PWA manifest
│   ├── sw.js             # Service worker
│   └── icons/            # App icons
├── capacitor.config.json # Android build config
├── vite.config.js        # Vite + proxy config
└── package.json
```

## Authors

- Bahria University, Lahore Campus
- Department of Computer Science, BSCS 8
- Computer Vision Assignment 3

## License

Educational use only.
