# 🌐 MeetUp — Full-Stack AI-Powered Video Meeting & Conferencing Platform

<div align="center">

![MeetUp Banner](https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&w=1400&q=80)

**A Next-Generation, Enterprise-Grade Real-Time Video Conferencing Application built on the PERN Stack (PostgreSQL, Express, React, Node.js) with Peer-to-Peer WebRTC, Socket.io, OpenRouter AI, and Cloudinary Media Management.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![WebRTC](https://img.shields.io/badge/WebRTC-333333?style=for-the-badge&logo=webrtc&logoColor=white)](https://webrtc.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![OpenRouter AI](https://img.shields.io/badge/OpenRouter_AI-7C3AED?style=for-the-badge&logo=openai&logoColor=white)](https://openrouter.ai/)

[Live Frontend (Vercel)](https://meetup-ten-lemon.vercel.app) • [Live Backend (Render)](https://meetup-backend-gbhg.onrender.com) • [Report Bug](https://github.com/melan-Akash/Meetup_FullStackVideoMeetingApp_PERN-Stack/issues) • [Request Feature](https://github.com/melan-Akash/Meetup_FullStackVideoMeetingApp_PERN-Stack/issues)

</div>

---

## 📖 Table of Contents
- [✨ Key Features](#-key-features)
  - [🎥 Real-Time Video & Audio](#-real-time-video--audio)
  - [🤖 Built-In AI Suite (OpenRouter)](#-built-in-ai-suite-openrouter)
  - [🎨 Interactive Collaboration](#-interactive-collaboration)
  - [🛡️ Enterprise Host Moderation](#️-enterprise-host-moderation)
  - [☁️ Cloudinary Media & Storage](#️-cloudinary-media--storage)
  - [📱 100% Mobile & Tablet Responsive](#-100-mobile--tablet-responsive)
- [🏗️ System Architecture](#️-system-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Quick Start & Installation](#-quick-start--installation)
  - [Prerequisites](#prerequisites)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Setup (`server/`)](#2-backend-setup-server)
  - [3. Frontend Setup (`client/`)](#3-frontend-setup-client)
- [🔐 Environment Variables Configuration](#-environment-variables-configuration)
  - [`server/.env`](#serverenv)
  - [`client/.env`](#clientenv)
- [🌐 Deployment Guide](#-deployment-guide)
  - [Deploy Backend on Render](#deploy-backend-on-render)
  - [Deploy Frontend on Vercel](#deploy-frontend-on-vercel)
- [📁 Project Folder Structure](#-project-folder-structure)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Key Features

### 🎥 Real-Time Video & Audio
- **HD WebRTC Peer-to-Peer Video**: Crystal clear video and spatial audio streams using Google STUN & TURN signaling.
- **Screen Sharing**: High-framerate desktop, window, and tab sharing with audio forwarding.
- **Virtual Backgrounds**: Real-time canvas segmentation offering Blur, Minimalist Studio, Modern Office, and Custom Image Background uploads.
- **In-Meeting Local Recording**: Capture full meeting audio & video directly in-browser with `.webm` export.
- **Live Closed Captions (CC)**: Real-time speech-to-text live subtitles displayed dynamically during calls.

### 🤖 Built-In AI Suite (OpenRouter)
- **🧠 Live In-Meeting AI Co-Pilot**: An interactive context-aware assistant answering queries, brainstorming ideas, and looking up data during live discussions.
- **🌐 Real-Time Chat Multi-Language Translation**: Instant one-click message translation across Sinhala, English, Tamil, Japanese, Spanish, Hindi, and German.
- **📝 Automated Meeting Summaries & Action Items**: Generate comprehensive executive summaries, key takeaways, decisions, and assigned action item lists from transcripts and chat logs.

### 🎨 Interactive Collaboration
- **Real-Time Collaborative Whiteboard**: Multi-user interactive drawing canvas with brush size presets, multi-color palette, highlighter, eraser, and PNG export.
- **Live Shared Meeting Notes**: Real-time synced markdown notepad with collaborative auto-save and `.txt` file export.
- **Floating Emoji Reactions**: Live flying emoji bursts (❤️, 👍, 👏, 🎉, 🚀, 🔥) with participant attribution.
- **Raise Hand Queue**: Non-disruptive speaking request indicator for organized seminars and lectures.
- **Permanent Cloud File Sharing**: Drag-and-drop file sharing in chat backed by Cloudinary cloud storage.

### 🛡️ Enterprise Host Moderation
- **Waiting Lobby (Doorbell System)**: Guests wait in a secure lobby until the host explicitly admits or denies entry.
- **One-Click Room Lock**: Prevent any new participants from entering confidential sessions.
- **Mute All / Mute Individual**: Host authority to mute noisy microphones instantly.
- **Kick Participant**: Remove disruptive users from the active session.
- **Instant Email Invitations**: Send styled meeting invitation emails with meeting links via Nodemailer SMTP.

### ☁️ Cloudinary Media & Storage
- **Profile Photo Uploads**: Custom profile avatars stored securely on Cloudinary.
- **Chat Attachments**: Permanent image and document attachments accessible across devices.
- **Custom Virtual Backgrounds**: Upload and apply personalized backdrop imagery.

### 📱 100% Mobile & Tablet Responsive
- Crafted for mobile devices (iPhone SE, Pro Max, iPads, Android) with sliding touch drawers, swipeable horizontal meeting toolbars, and dynamic touch-friendly canvases.

---

## 🏗️ System Architecture

```
                               ┌───────────────────────────────────┐
                               │       Client Applications         │
                               │   (Desktop, Tablet, Mobile Web)   │
                               └─────────────────┬─────────────────┘
                                                 │
                        ┌────────────────────────┼────────────────────────┐
                        │ HTTPS (REST API)       │ WSS (WebSockets)       │ WebRTC P2P
                        ▼                        ▼                        ▼
         ┌──────────────────────────┐ ┌───────────────────┐ ┌──────────────────────┐
         │     Express.js API       │ │  Socket.io Server │ │ Remote Peer Clients  │
         │   Authentication, CRUD   │ │ Signaling & Chat  │ │ Direct Audio / Video │
         └──────────────┬───────────┘ └─────────┬─────────┘ └──────────────────────┘
                        │                       │
      ┌─────────────────┼───────────────────────┼─────────────────┐
      ▼                 ▼                       ▼                 ▼
┌──────────────┐ ┌──────────────┐     ┌───────────────────┐ ┌──────────────┐
│  PostgreSQL  │ │  Cloudinary  │     │   OpenRouter AI   │ │  Nodemailer  │
│ Neon (Cloud) │ │ Media Storage│     │ (LLM & Summaries) │ │ (Email SMTP) │
└──────────────┘ └──────────────┘     └───────────────────┘ └──────────────┘
```

---

## 🛠️ Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite 8, Tailwind CSS v4 | Ultra-fast SPA with modern glassmorphism aesthetics |
| **Icons & UI** | Lucide React, React Hot Toast, Canvas API | Smooth micro-animations and intuitive responsive UX |
| **Real-Time** | WebRTC, Socket.io-client | Low-latency P2P mesh video calling and signaling |
| **Backend** | Node.js, Express.js | High-performance RESTful API and WebSocket gateway |
| **Database** | PostgreSQL (Neon Serverless) | Relational database with connection pooling |
| **AI Engine** | OpenRouter API (`google/gemini-2.0-flash`) | Fast intelligent meeting assistants and translation |
| **Media Cloud**| Cloudinary SDK v2, Multer | Cloud storage for user avatars, files, and backgrounds |
| **Email** | Nodemailer (Gmail SMTP) | Instant styled meeting invitation delivery |
| **Hosting** | Vercel (Frontend), Render (Backend) | 24/7 Global serverless & persistent cloud infrastructure |

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js** v18.0.0 or higher
- **npm** or **yarn**
- PostgreSQL database instance (or a free [Neon](https://neon.tech) connection string)
- Free [Cloudinary](https://cloudinary.com) Account
- [OpenRouter](https://openrouter.ai) API Key

### 1. Clone Repository
```bash
git clone https://github.com/melan-Akash/Meetup_FullStackVideoMeetingApp_PERN-Stack.git
cd Meetup_FullStackVideoMeetingApp_PERN-Stack
```

---

### 2. Backend Setup (`server/`)
```bash
# Navigate to backend directory
cd server

# Install dependencies
npm install

# Create environment configuration file
cp .env.example .env
```
Fill in the `.env` configuration (see [Environment Variables](#-environment-variables-configuration)).

```bash
# Start backend server in development mode
npm run dev
```
Backend will start on `http://localhost:5000`.

---

### 3. Frontend Setup (`client/`)
```bash
# Open a new terminal and navigate to client
cd ../client

# Install dependencies
npm install

# Create frontend environment configuration
cp .env.example .env
```
Ensure `VITE_API_URL` and `VITE_SOCKET_URL` point to `http://localhost:5000` for local development.

```bash
# Start frontend development server
npm run dev
```
Frontend will be accessible at `http://localhost:5173`.

---

## 🔐 Environment Variables Configuration

### `server/.env`
```env
PORT=5000
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:5173

# Email SMTP Setup
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# AI Assistant & Summaries
OPENROUTER_KEY=sk-or-v1-your-openrouter-api-key

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### `client/.env`
```env
# For Local Development:
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# For Production Deployment:
# VITE_API_URL=https://meetup-backend-gbhg.onrender.com/api
# VITE_SOCKET_URL=https://meetup-backend-gbhg.onrender.com
```

---

## 🌐 Deployment Guide

### Deploy Backend on [Render](https://render.com)
1. Create a new **Web Service** on Render and connect this repository.
2. Configure settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
3. Add the environment variables from `server/.env` under **Environment**.
4. Set `CLIENT_URL` to your Vercel frontend URL (e.g. `https://meetup-ten-lemon.vercel.app`).
5. Click **Deploy Web Service**.

### Deploy Frontend on [Vercel](https://vercel.com)
1. Import this repository into Vercel.
2. Configure settings:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
3. Under **Environment Variables**, add:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api`
   - `VITE_SOCKET_URL` = `https://your-backend.onrender.com`
4. Click **Deploy**.

---

## 📁 Project Folder Structure

```
meetup/
├── client/                     # Frontend Application (React 19 + Vite)
│   ├── public/                 # Static Assets (Logos, Icons, Audio)
│   ├── src/
│   │   ├── components/
│   │   │   ├── meeting/        # VideoGrid, ControlBar, ChatPanel, Whiteboard, etc.
│   │   │   ├── profile/        # User Profile Modal, Avatar Uploader
│   │   │   └── navbar.jsx      # Navigation Bar with Mobile Drawer
│   │   ├── config/             # Axios API & Socket.io Instances
│   │   ├── context/            # Authentication & State Context
│   │   ├── hooks/              # useWebRTC, useChat, useRecording, useAudioLevel
│   │   ├── pages/              # Dashboard, MeetingRoom, Login, Sessions, Pricing
│   │   ├── App.jsx             # Main Router & Providers
│   │   └── main.jsx            # React DOM Entrypoint
│   ├── vercel.json             # Vercel SPA Client Rewrites
│   └── package.json
│
├── server/                     # Backend Application (Node.js + Express + Socket.io)
│   ├── config/                 # PostgreSQL (Neon) & Cloudinary SDK Setup
│   ├── controllers/            # Auth, Meeting, AI, Email, Upload Controllers
│   ├── routes/                 # Express API Endpoint Routes
│   ├── services/               # AI Service (OpenRouter) & Email Service (Nodemailer)
│   ├── socket/                 # WebRTC Signaling & Room Socket Handlers
│   ├── db/schema.sql           # PostgreSQL Table Schemas & Indices
│   ├── server.js               # Main HTTP & Socket.io Server Entrypoint
│   └── package.json
│
└── README.md                   # Project Documentation
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

**Developed with ❤️ by [Melan Akash](https://github.com/melan-Akash)**

⭐ Star this repository if you find it helpful!

</div>