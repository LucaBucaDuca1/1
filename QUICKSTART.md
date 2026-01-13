# 🚀 Quick Start Guide

Get MediaFlix running in under 5 minutes!

## Prerequisites

✅ **Docker Desktop** installed ([Download here](https://www.docker.com/products/docker-desktop))
- Includes Docker and Docker Compose
- Available for Windows, macOS, and Linux

✅ **Git** (optional, for cloning)

✅ **2GB RAM** minimum, 4GB recommended

---

## Installation

### Option 1: One-Command Install (Recommended)

**Linux/macOS:**
```bash
chmod +x install.sh
./install.sh
```

**Windows PowerShell (Run as Administrator):**
```powershell
.\install.ps1
```

### Option 2: Manual Install

```bash
# 1. Copy environment file
cp .env.example .env

# 2. (Optional) Edit .env for custom settings
nano .env

# 3. Start services
docker-compose up -d

# 4. View logs
docker-compose logs -f
```

---

## Access Your Server

### URLs
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api

### Default Login
- **Username:** `demo`
- **Password:** `demo123`

---

## Add Your Media

1. **Place video files** in `./server/media/` directory
2. **Supported formats:** MP4, AVI, MKV, MOV, etc.
3. **Add via web UI** or API (coming soon)

---

## Common Commands

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Update to latest version
./scripts/update.sh

# Create backup
./scripts/backup.sh

# Restore from backup
./scripts/restore.sh backups/database_YYYYMMDD_HHMMSS.sql
```

---

## Troubleshooting

### Services won't start?
```bash
# Check what's running
docker-compose ps

# View detailed logs
docker-compose logs server
docker-compose logs client

# Restart everything
docker-compose down && docker-compose up -d
```

### Port already in use?
Edit `.env` file and change ports:
```env
SERVER_PORT=8080
CLIENT_PORT=8000
```

### Need to reset everything?
```bash
# ⚠️ WARNING: This deletes all data!
docker-compose down -v
rm -rf server/data/database.sqlite
docker-compose up -d
```

---

## Next Steps

1. **Create your account** at http://localhost:3000/register
2. **Upload your media** to `./server/media/`
3. **Configure preferences** in your profile
4. **Add to My List** your favorite content
5. **Enjoy!** 🍿

---

## Production Deployment

For production deployment on a VPS or cloud:
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete guide
- Covers AWS, DigitalOcean, Google Cloud, and more
- Includes SSL setup and security best practices

---

## Need Help?

- 📖 Full documentation: [README.md](./README.md)
- 🚀 Deployment guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- 🐛 Report issues: GitHub Issues
- 💬 Ask questions: GitHub Discussions

---

## Features at a Glance

✨ **User Authentication** - Secure login with JWT tokens

📺 **Watch History** - Resume where you left off

❤️ **My List** - Save your favorites

🎯 **Recommendations** - Smart content suggestions

📱 **Responsive Design** - Works on phone, tablet, desktop, and TV

🎨 **Beautiful UI** - Modern Netflix-style interface

🔐 **Secure** - Password hashing, token authentication

🐳 **Easy Deploy** - One command Docker setup

---

**Enjoy MediaFlix!** 🎬🍿
