<div align="center">

# 🏘️ SmartSociety

### AI-Powered Hyperlocal Community Platform

**Connect with your neighbours · Get emergency alerts · Discover local businesses**

![SmartSociety](https://img.shields.io/badge/SmartSociety-v1.0-a3f000?style=for-the-badge&labelColor=0a0a0a)
![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&labelColor=0a0a0a)
![Node.js](https://img.shields.io/badge/Node.js-20-84cc16?style=for-the-badge&logo=node.js&labelColor=0a0a0a)
![Python](https://img.shields.io/badge/Python-3.10+-3776ab?style=for-the-badge&logo=python&labelColor=0a0a0a)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47a248?style=for-the-badge&logo=mongodb&labelColor=0a0a0a)

</div>

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Project Structure](#-project-structure)
- [Step 1 — Get Your API Keys](#-step-1--get-your-api-keys)
- [Step 2 — Setup the Backend](#-step-2--setup-the-backend)
- [Step 3 — Setup the AI Service](#-step-3--setup-the-ai-service)
- [Step 4 — Setup the Frontend](#-step-4--setup-the-frontend)
- [Step 5 — Run All Services](#-step-5--run-all-services)
- [Verify Everything Works](#-verify-everything-works)
- [AI Models Reference](#-ai-models-reference)
- [API Reference](#-api-reference)
- [Troubleshooting](#-troubleshooting)

---

## 🌟 Project Overview

SmartSociety is a full-stack AI-powered neighbourhood social network with three levels of community interaction:

| Level | Audience | Examples |
|-------|----------|---------|
| 🏢 **Society** | Your building/apartment | Notices, help requests, lost & found |
| 📍 **Area** | Your locality/mohalla | Local events, business promos, area updates |
| 🌐 **Public** | City-wide | News, general discussions, emergency alerts |

### AI Features
- 🤖 **Auto-categorisation** — Every post is tagged (emergency/help/event/business/etc.)
- 🚫 **Spam detection** — Fake promotions and phishing posts are auto-blocked
- 🚨 **Emergency detection** — Urgent posts pinned to top + society notified instantly
- 😊 **Sentiment analysis** — Community mood tracking
- 🎯 **Personalised feed** — Posts ranked by your engagement preferences

---

## 🏗️ Architecture

```
SmartSociety/
│
├── 🌐 Frontend          (React + Tailwind CSS)     → Port 5173
│   └── Talks to Backend via REST API
│
├── ⚙️  Backend           (Node.js + Express + MongoDB)  → Port 5000
│   └── Talks to AI Service via HTTP
│
└── 🤖 AI Service        (Python + FastAPI + scikit-learn)  → Port 5001
    └── 5 ML models trained on startup
```

**Data flow when a user creates a post:**
```
User writes post
      ↓
React Frontend sends to Node Backend
      ↓
Node Backend calls Python AI Service /analyse
      ↓
AI returns: { category, is_spam, is_emergency, sentiment }
      ↓
if is_spam     → Reject post (422 error)
if is_emergency → Pin post + notify all society members
      ↓
Save to MongoDB
      ↓
Return post to frontend with AI-assigned category chip
```

---

## ✅ Prerequisites

Before starting, make sure you have these installed on your computer:

| Tool | Required Version | Download |
|------|-----------------|----------|
| **Node.js** | v18 or higher | https://nodejs.org (choose LTS) |
| **Python** | v3.10 or higher | https://python.org/downloads |
| **Git** | Any recent version | https://git-scm.com |
| **VS Code** | Any recent version | https://code.visualstudio.com |

### Verify installations

Open PowerShell or Terminal and run:

```powershell
node -v        # Should show v18.x.x or higher
npm -v         # Should show 9.x.x or higher
python --version   # Should show Python 3.10.x or higher
pip --version      # Should show pip 23.x or higher
```

If any of these fail, install the missing tool first before continuing.

---

## 📁 Project Structure

```
SmartSociety/
│
├── frontend/                    ← React.js app
│   ├── src/
│   │   ├── components/          ← Navbar, PostCard, Sidebar, etc.
│   │   ├── pages/               ← Login, Home, Profile, etc.
│   │   ├── context/             ← Auth state (useAuth hook)
│   │   ├── services/            ← api.js (all backend calls)
│   │   ├── hooks/               ← usePosts, useInfiniteScroll
│   │   └── utils/               ← helpers.js
│   ├── .env                     ← Frontend environment variables ← YOU CREATE THIS
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                     ← Node.js + Express API
│   ├── src/
│   │   ├── controllers/         ← auth, post, user, society, business
│   │   ├── models/              ← MongoDB schemas (User, Post, Society, etc.)
│   │   ├── routes/              ← API route definitions
│   │   ├── middleware/          ← JWT auth, error handler
│   │   └── services/            ← aiService, notificationService, tokenService
│   ├── config/
│   │   ├── db.js                ← MongoDB connection
│   │   └── cloudinary.js        ← Image upload config
│   ├── .env                     ← Backend environment variables ← YOU CREATE THIS
│   └── package.json
│
└── ai/                          ← Python FastAPI AI service
    ├── models/                  ← 5 ML models
    │   ├── category_classifier.py
    │   ├── spam_detector.py
    │   ├── emergency_detector.py
    │   ├── sentiment_analyzer.py
    │   └── recommender.py
    ├── routes/
    │   └── ai_routes.py         ← All API endpoints
    ├── data/
    │   └── training_data.py     ← Labeled dataset for training
    ├── utils/
    │   └── text_processor.py    ← Text cleaning and NLP utilities
    ├── main.py                  ← FastAPI entry point
    ├── .env                     ← AI service environment variables ← YOU CREATE THIS
    └── requirements.txt
```

---

## 🔑 Step 1 — Get Your API Keys

You need **4 external services**. All have free tiers — no credit card needed.

---

### 1A. MongoDB Atlas (Database)

MongoDB Atlas stores all your data (users, posts, societies, etc.).

1. Go to **https://cloud.mongodb.com** → Click **Sign Up Free**
2. After signup, click **Build a Database** → Choose **M0 FREE** tier → Click **Create**
3. **Create a database user:**
   - Left menu → **Database Access** → **Add New Database User**
   - Username: `smartsociety`
   - Password: Create a strong password (e.g., `Smart@2024`) — **save this**
   - Click **Add User**
4. **Allow connections from anywhere:**
   - Left menu → **Network Access** → **Add IP Address**
   - Click **Allow Access from Anywhere** → **Confirm**
5. **Get your connection string:**
   - Left menu → **Database** → **Connect** button on your cluster
   - Choose **Drivers** → Copy the connection string
   - It looks like: `mongodb+srv://smartsociety:<password>@cluster0.xxxxx.mongodb.net/`
   - Replace `<password>` with your actual password
   - Add `smartsociety` at the end: `mongodb+srv://smartsociety:Smart@2024@cluster0.xxxxx.mongodb.net/smartsociety`

---

### 1B. Cloudinary (Image Uploads)

Cloudinary stores uploaded images (post photos, profile avatars).

1. Go to **https://cloudinary.com** → Click **Sign Up for Free**
2. After signup, you land on the **Dashboard** automatically
3. You will see all three values right there:

```
Cloud Name:   your-name-xyz123
API Key:      123456789012345
API Secret:   abcDEFghiJKLmno-pqrSTU
```

Copy all three — you'll need them for the backend `.env`.

---

### 1C. Google OAuth (Google Login)

Allows users to sign in with their Google account.

1. Go to **https://console.cloud.google.com** → Sign in with Google
2. Click the **project dropdown** at the top → **New Project**
   - Name: `SmartSociety` → Click **Create**
3. Make sure your new project is selected in the dropdown
4. Left menu → **APIs & Services** → **OAuth consent screen**
   - Choose **External** → Click **Create**
   - App name: `SmartSociety`
   - User support email: your email
   - Developer contact email: your email
   - Click **Save and Continue** (skip all remaining steps)
5. Left menu → **APIs & Services** → **Credentials**
   - Click **+ Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Name: `SmartSociety Web`
   - Under **Authorised JavaScript origins** → Add:
     ```
     http://localhost:5173
     ```
   - Under **Authorised redirect URIs** → Add:
     ```
     http://localhost:5000/api/auth/google
     ```
   - Click **Create**
6. A popup shows your keys. Copy the **Client ID** — it looks like:
   ```
   1234567890-abcdefghijklmno.apps.googleusercontent.com
   ```

---

### 1D. JWT Secret (Generate Yourself)

This is a random secret string used to sign login tokens. Generate one by opening PowerShell and running:

```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output — it will be a long random string like:
```
a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8
```

---

## ⚙️ Step 2 — Setup the Backend

### 2A. Install Node.js dependencies

Open a terminal in the `backend/` folder:

```powershell
cd D:\PROJECTS\SmartSociety\backend
npm install
```

Wait for it to finish. You should see `added XXX packages`.

---

### 2B. Create the Backend `.env` file

In the `backend/` folder, create a new file named exactly `.env` (with the dot).

> In VS Code: right-click the `backend` folder → **New File** → type `.env`

Copy and paste this entire block, then replace each placeholder with your real values:

```env
# ─────────────────────────────────────────────────────
# SmartSociety Backend — Environment Variables
# ─────────────────────────────────────────────────────

# Server
PORT=5000
NODE_ENV=development

# ── MongoDB Atlas ──────────────────────────────────────
# Paste your full connection string here
# Format: mongodb+srv://username:password@cluster.xxxxx.mongodb.net/dbname
MONGODB_URI=mongodb+srv://smartsociety:YourPasswordHere@cluster0.xxxxx.mongodb.net/smartsociety?retryWrites=true&w=majority

# ── JWT Authentication ────────────────────────────────
# Paste the random string you generated in Step 1D
JWT_SECRET=paste-your-generated-random-string-here
JWT_EXPIRES_IN=7d

# ── Google OAuth ──────────────────────────────────────
# Paste your Google Client ID from Step 1C
GOOGLE_CLIENT_ID=1234567890-abcdefghijklmno.apps.googleusercontent.com

# ── Cloudinary (Image Uploads) ────────────────────────
# Paste values from your Cloudinary Dashboard (Step 1B)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-api-secret-here

# ── URLs ──────────────────────────────────────────────
# URL of your React frontend (don't change for local dev)
CLIENT_URL=http://localhost:5173

# URL of your Python AI service (don't change for local dev)
AI_SERVICE_URL=http://localhost:5001

# ── Admin ─────────────────────────────────────────────
# Secret used to trigger AI model retraining
ADMIN_SECRET=smartsociety-admin-2024
```

**Example of a correctly filled `.env`:**

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://smartsociety:Smart@2024@cluster0.abc123.mongodb.net/smartsociety?retryWrites=true&w=majority
JWT_SECRET=a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=1234567890-abcdefghijklmno.apps.googleusercontent.com
CLOUDINARY_CLOUD_NAME=smartsociety-xyz
CLOUDINARY_API_KEY=987654321098765
CLOUDINARY_API_SECRET=xyzABCdefGHIjklMNOpqr
CLIENT_URL=http://localhost:5173
AI_SERVICE_URL=http://localhost:5001
ADMIN_SECRET=smartsociety-admin-2024
```

---

### 2C. (Optional) Load demo data

If you want some sample posts and users to test with:

```powershell
npm run seed
```

This creates:
- 4 test users
- 1 demo society
- 7 sample posts (including emergency ones)
- 1 demo business

**Demo login credentials after seeding:**

| Email | Password | Role |
|-------|----------|------|
| `admin@demo.com` | `password123` | RWA Admin |
| `ravi@demo.com` | `password123` | Resident |
| `amit@demo.com` | `password123` | Business owner |

---

### 2D. Start the Backend

```powershell
npm run dev
```

**Successful output looks like:**
```
✅ MongoDB connected: cluster0.xxxxx.mongodb.net
🚀 Server running on http://localhost:5000
📋 Environment: development
🔗 Health check: http://localhost:5000/health
```

If you see this — backend is working. Leave this terminal open.

---

## 🤖 Step 3 — Setup the AI Service

### 3A. Open a NEW terminal tab

In VS Code: click the **+** button in the terminal panel to open a new tab.

Navigate to the AI folder:

```powershell
cd D:\PROJECTS\SmartSociety\ai
```

---

### 3B. Create a Python virtual environment

A virtual environment keeps Python packages isolated from other projects.

```powershell
python -m venv venv
```

This creates a `venv/` folder inside the `ai/` directory.

---

### 3C. Activate the virtual environment

```powershell
venv\Scripts\activate
```

**Your terminal prompt must change to show `(venv)`:**
```
(venv) PS D:\PROJECTS\SmartSociety\ai>
```

> ⚠️ If activation fails with a security error, run this first:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```
> Then try activating again.

**Important:** You must activate the venv every time you open a new terminal for the AI service.

---

### 3D. Install Python dependencies

```powershell
pip install -r requirements.txt
```

This installs: FastAPI, scikit-learn, PyTorch, NLTK, pandas, and more.

> ⏱️ First install takes 3–8 minutes depending on your internet speed. This is normal.

---

### 3E. Create the AI Service `.env` file

In the `ai/` folder, create a file named `.env`:

```env
# ─────────────────────────────────────────────────────
# SmartSociety AI Service — Environment Variables
# ─────────────────────────────────────────────────────

# Server
PORT=5001
HOST=0.0.0.0

# AI mode: "sklearn" = fast CPU models (recommended for development)
AI_MODE=sklearn

# Auto-train models on startup if not already saved
AUTO_TRAIN=true

# Backend URL (for CORS)
BACKEND_URL=http://localhost:5000

# Admin secret (must match backend .env)
ADMIN_SECRET=smartsociety-admin-2024
```

> The AI service has no external API keys — it trains its own ML models locally.

---

### 3F. Start the AI Service

```powershell
python main.py
```

**Successful output looks like:**
```
📦 Loading / training AI models…
   ✅ Category classifier trained | CV Accuracy: 92%
   ✅ Spam detector trained       | CV F1: 94%
   ✅ Emergency detector trained  | CV F1: 96%
   ✅ Sentiment analyzer trained  | CV Accuracy: 88%
✅ All models ready in 4.2s
🌐 Serving on http://0.0.0.0:5001
```

> 💡 First startup trains the models (~5–15 seconds). After that, saved models are loaded instantly.

Leave this terminal open.

---

## 🌐 Step 4 — Setup the Frontend

### 4A. Open a NEW terminal tab

Navigate to the frontend folder:

```powershell
cd D:\PROJECTS\SmartSociety\frontend
```

---

### 4B. Install Node.js dependencies

```powershell
npm install
```

---

### 4C. Create the Frontend `.env` file

In the `frontend/` folder, create a file named `.env`:

```env
# ─────────────────────────────────────────────────────
# SmartSociety Frontend — Environment Variables
# ─────────────────────────────────────────────────────

# URL of your Node.js backend API
# Don't change this for local development
VITE_API_URL=http://localhost:5000/api

# Your Google Client ID (same value as backend .env)
VITE_GOOGLE_CLIENT_ID=1234567890-abcdefghijklmno.apps.googleusercontent.com
```

> ⚠️ All frontend environment variables **must start with `VITE_`** — otherwise Vite ignores them.

---

### 4D. Start the Frontend

```powershell
npm run dev
```

**Successful output looks like:**
```
  VITE v5.x.x  ready in 432 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open your browser at **http://localhost:5173** — you should see the SmartSociety login page.

---

## 🚦 Step 5 — Run All Services

You need **3 terminal tabs open simultaneously** in VS Code:

```
┌─────────────────────────────────────────────────────────┐
│  Terminal Tab 1: AI Service (Python)                    │
│  cd ai && venv\Scripts\activate && python main.py       │
│  Running on: http://localhost:5001                      │
├─────────────────────────────────────────────────────────┤
│  Terminal Tab 2: Backend (Node.js)                      │
│  cd backend && npm run dev                              │
│  Running on: http://localhost:5000                      │
├─────────────────────────────────────────────────────────┤
│  Terminal Tab 3: Frontend (React)                       │
│  cd frontend && npm run dev                             │
│  Running on: http://localhost:5173                      │
└─────────────────────────────────────────────────────────┘
```

**Start order matters — always start in this order:**
1. 🤖 AI Service first
2. ⚙️ Backend second
3. 🌐 Frontend last

---

## ✅ Verify Everything Works

### Check 1 — AI Service
Open browser: **http://localhost:5001/health**

Expected response:
```json
{
  "status": "ok",
  "service": "SmartSociety AI",
  "models": ["category_classifier", "spam_detector", "emergency_detector", "sentiment_analyzer", "recommender"]
}
```

### Check 2 — Backend
Open browser: **http://localhost:5000/health**

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "env": "development"
}
```

### Check 3 — Full AI Pipeline
Test the AI service directly with this command in PowerShell:

```powershell
Invoke-RestMethod -Uri "http://localhost:5001/analyse" -Method POST -ContentType "application/json" -Body '{"text": "Water pipe burst on 3rd floor! Evacuate immediately!"}'
```

Expected response:
```json
{
  "success": true,
  "category": "emergency",
  "category_confidence": 0.96,
  "is_spam": false,
  "is_emergency": true,
  "urgency_level": "critical",
  "sentiment": "negative"
}
```

### Check 4 — Frontend
Open **http://localhost:5173**

You should see the SmartSociety login page with black background and lemon green accents.

- Register a new account → You should be redirected to the Home feed
- Create a post → It should appear with an AI-assigned category chip

---

## 🤖 AI Models Reference

| Endpoint | Input | Output | Used for |
|----------|-------|--------|----------|
| `POST /analyse` | `{ text }` | category + spam + emergency + sentiment | Creating a post |
| `POST /classify` | `{ text }` | `{ category, confidence }` | Category chip on post |
| `POST /spam-check` | `{ text }` | `{ is_spam, spam_score }` | Blocking bad posts |
| `POST /emergency-check` | `{ text }` | `{ is_emergency, urgency_level }` | Emergency banner |
| `POST /sentiment` | `{ text }` | `{ sentiment, confidence }` | Community mood |
| `POST /feed` | `{ posts, interactions }` | Ranked posts | Personalised feed |
| `POST /trending` | `{ posts }` | Trending categories | Explore page |

---

## 🔌 API Reference (Backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with email+password |
| POST | `/api/auth/google` | Login with Google |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/posts/feed/:level` | Get feed (society/area/public) |
| POST | `/api/posts` | Create post (triggers AI pipeline) |
| PUT | `/api/posts/:id/like` | Like/unlike a post |
| POST | `/api/posts/:id/comments` | Add comment |
| DELETE | `/api/posts/:id` | Delete post |
| GET | `/api/users/:id` | Get user profile |
| PUT | `/api/users/profile` | Update profile |
| POST | `/api/society` | Create society |
| POST | `/api/society/join` | Join society with invite code |
| GET | `/api/business/nearby/:areaId` | Get nearby businesses |
| POST | `/api/business` | Register business |
| GET | `/api/notifications` | Get notifications |

---

## 🔧 Troubleshooting

### ❌ `npm install` fails with ERESOLVE error
```powershell
# Delete old node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### ❌ `venv\Scripts\activate` fails with security error
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# Then try again:
venv\Scripts\activate
```

### ❌ MongoDB connection fails
- Check your `MONGODB_URI` in `backend/.env` — make sure password is correct
- Go to MongoDB Atlas → **Network Access** → Confirm **0.0.0.0/0** is in the list
- Make sure there are no special characters in your password that need URL encoding

### ❌ AI service not starting — `ModuleNotFoundError`
```powershell
# Make sure venv is activated (you should see (venv) in prompt)
venv\Scripts\activate
# Then reinstall
pip install -r requirements.txt
```

### ❌ Google login shows error
- Make sure `VITE_GOOGLE_CLIENT_ID` in `frontend/.env` matches `GOOGLE_CLIENT_ID` in `backend/.env`
- Verify `http://localhost:5173` is in **Authorised JavaScript origins** in Google Console
- The `.env` file must not have quotes around values: ✅ `KEY=value` not ❌ `KEY="value"`

### ❌ Images not uploading
- Double-check all three Cloudinary values in `backend/.env`
- Make sure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` are correct (no spaces)

### ❌ Port already in use
```powershell
# Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Same for 5001 and 5173
```

### ❌ Frontend shows blank page
- Open browser DevTools (F12) → Console tab — look for the error
- Make sure `VITE_API_URL=http://localhost:5000/api` is in `frontend/.env`
- Make sure backend is running first

---

## 📦 Tech Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18, Vite, Tailwind CSS | User interface |
| Auth | JWT, Google OAuth (GIS) | Authentication |
| Backend | Node.js, Express.js | REST API |
| Database | MongoDB Atlas, Mongoose | Data storage |
| Images | Cloudinary | Media uploads |
| AI/ML | Python, FastAPI, scikit-learn | Intelligence layer |
| NLP | TF-IDF, NLTK | Text processing |
| Models | Logistic Regression, Naive Bayes, LinearSVC | Classification |

---

<div align="center">

Built with ❤️ · SmartSociety v1.0

</div>
