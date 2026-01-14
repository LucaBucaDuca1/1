# 🚀 Quick Start Guide

Get HomeFlix running in 3 minutes!

## Prerequisites

You need Node.js installed. Check by running:

```bash
node --version
npm --version
```

**Don't have Node.js?**
- Download from: https://nodejs.org/ (get LTS version)
- Or use a package manager:
  - **Mac:** `brew install node`
  - **Ubuntu/Debian:** `sudo apt install nodejs npm`

---

## Option 1: Automatic Setup (Easiest)

### Windows

Just double-click: **`start.bat`**

OR open Command Prompt and run:
```cmd
start.bat
```

### Mac/Linux

```bash
chmod +x start.sh
./start.sh
```

That's it! The script will:
1. Check for Node.js
2. Install all dependencies automatically
3. Start both backend and frontend
4. Open at http://localhost:5173

---

## Option 2: Manual Setup (Step by Step)

If the automatic setup doesn't work:

### 1. Install Dependencies

```bash
npm run setup
```

This installs packages for root, server, and client.

### 2. Start the Application

```bash
npm run dev
```

This starts both backend (port 3001) and frontend (port 5173) together.

### 3. Open Your Browser

Go to: **http://localhost:5173**

---

## First Time Login

**Demo Account:**
- Username: `demo`
- Password: `demo123`

This account has **admin** privileges.

---

## What If Something Goes Wrong?

### Quick Health Check

Run the doctor:
```bash
npm run doctor
```

This checks:
- ✓ Node.js version (need 16+)
- ✓ npm installed
- ✓ Dependencies installed
- ✓ Ports available
- ✓ ffmpeg (optional)

### Port Already in Use?

**Kill processes using the ports:**

Windows:
```cmd
netstat -ano | findstr :3001
taskkill /PID <PID> /F

netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

Mac/Linux:
```bash
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Still Having Issues?

See **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** for detailed help.

---

## Alternative: Docker Setup

If you prefer Docker:

### Prerequisites
- Docker Desktop installed and running
- Docker Compose available

### Windows
```powershell
.\install.ps1
```

### Mac/Linux
```bash
chmod +x install.sh
./install.sh
```

Docker setup uses different ports:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

---

## Stopping the Server

Press **Ctrl+C** in the terminal where HomeFlix is running.

---

## Adding Your Media

### Method 1: Web Upload
1. Login
2. Click "Upload" in nav bar
3. Fill in details and select files

### Method 2: Windows Smart Uploader (Best for Bulk)
1. Run: `HomeFlix-Uploader.ps1`
2. Drag & drop movies or TV show folders
3. Auto-organizes everything

See [UPLOADER-README.md](./UPLOADER-README.md) for details.

### Method 3: Manual Copy + Scan
1. Copy files to `server/media/movies/` or `server/media/shows/`
2. Login as admin
3. Go to Admin Dashboard
4. Click "Scan Library for New Files"

---

## Next Steps

- **Upload Media:** Add your movies and TV shows
- **Invite Users:** Create accounts with different roles
- **Configure:** Edit `server/.env` for JWT secret (production)
- **Explore:** Check out the admin dashboard
- **Customize:** Change branding, add features

---

## Useful Commands

```bash
# Install everything
npm run setup

# Start dev servers
npm run dev

# Run health check
npm run doctor

# Start only server
npm run dev:server

# Start only client
npm run dev:client

# Build for production
npm run build

# Start production server
npm start
```

---

## Getting Help

1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Run `npm run doctor` and check output
3. Review error messages in terminal
4. Check that ports 3001 and 5173 aren't in use

---

**Made by zeloz** 🎬
