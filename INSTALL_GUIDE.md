# 🎯 MediaFlix Installation Guide

## ⚡ Lightning Quick Installation

### For Linux/macOS Users:

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd mediaflix

# 2. Run the installer
./install.sh

# That's it! ✨
```

### For Windows Users:

```powershell
# 1. Clone the repository
git clone <your-repo-url>
cd mediaflix

# 2. Run the installer (PowerShell as Administrator)
.\install.ps1

# That's it! ✨
```

---

## 🎬 What You Get

After running the installer:

✅ **Backend Server** running at http://localhost:3001
✅ **Frontend Web App** running at http://localhost:3000
✅ **Secure JWT Authentication** automatically configured
✅ **Sample Data** pre-loaded for testing
✅ **Health Monitoring** enabled
✅ **Default User** ready to use:
   - Username: `demo`
   - Password: `demo123`

---

## 📦 What the Installer Does

1. ✅ Checks for Docker and Docker Compose
2. ✅ Creates environment file with secure secrets
3. ✅ Sets up required directories
4. ✅ Builds Docker containers
5. ✅ Starts all services
6. ✅ Verifies health status
7. ✅ Shows you access URLs

**Total Time: 2-3 minutes** ⏱️

---

## 🌐 Access Your Server

Once installation completes:

1. **Open your browser:** http://localhost:3000
2. **Login with:** Username: `demo`, Password: `demo123`
3. **Start using MediaFlix!** 🍿

---

## 📁 Add Your Media

```bash
# Copy your video files to:
cp /path/to/your/movies/*.mp4 ./server/media/

# Videos will appear automatically in the app
```

Supported formats: MP4, AVI, MKV, MOV, WebM

---

## 🔄 Common Commands

```bash
# View logs
docker-compose logs -f

# Stop the server
docker-compose down

# Restart the server
docker-compose restart

# Update to latest version
./scripts/update.sh

# Backup your data
./scripts/backup.sh

# Get help
docker-compose --help
```

---

## 🚀 Deploy to Production

### Option 1: VPS (DigitalOcean, AWS, etc.)

```bash
# 1. SSH into your server
ssh root@your-server-ip

# 2. Install Docker
curl -fsSL https://get.docker.com | sh

# 3. Clone and install
git clone <your-repo-url>
cd mediaflix
./install.sh

# 4. Configure firewall
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Done! Access at: http://your-server-ip:3000
```

### Option 2: Cloud Platforms

**Heroku, Railway, Google Cloud, AWS - See [DEPLOYMENT.md](./DEPLOYMENT.md)**

---

## 🛟 Troubleshooting

### Installation Issues

**Problem:** "Docker not found"
```bash
# Solution: Install Docker Desktop
# Visit: https://docs.docker.com/get-docker/
```

**Problem:** "Port already in use"
```bash
# Solution: Change ports in .env
nano .env
# Change SERVER_PORT and CLIENT_PORT
docker-compose down && docker-compose up -d
```

**Problem:** "Permission denied"
```bash
# Solution: Fix permissions
chmod +x install.sh
# Or run with sudo (Linux only)
sudo ./install.sh
```

### Service Issues

**Problem:** Services won't start
```bash
# Check logs
docker-compose logs

# Restart everything
docker-compose down
docker-compose up -d --build
```

**Problem:** Can't access the website
```bash
# Check if services are running
docker-compose ps

# Check for port conflicts
lsof -i :3000
lsof -i :3001

# Try different ports in .env
```

---

## 💡 Pro Tips

### 1. Custom Configuration

```bash
# Copy and edit environment
cp .env.example .env
nano .env

# Change any setting:
SERVER_PORT=8080
CLIENT_PORT=8000
JWT_SECRET=your-super-secret-key

# Restart services
docker-compose down && docker-compose up -d
```

### 2. HTTPS Setup (Production)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Enable nginx profile
export COMPOSE_PROFILES=production
docker-compose up -d
```

### 3. Automated Backups

```bash
# Add to crontab
crontab -e

# Add this line (backup daily at 2 AM)
0 2 * * * cd /path/to/mediaflix && ./scripts/backup.sh
```

### 4. Keep Updated

```bash
# Easy update with automatic backup
./scripts/update.sh
```

---

## 📊 System Requirements

### Minimum
- 2 CPU cores
- 2GB RAM
- 10GB disk space
- Docker 20.10+
- Docker Compose 2.0+

### Recommended
- 4 CPU cores
- 4GB RAM
- 50GB+ disk space
- Fast internet connection
- SSD storage

---

## 🎓 Learning Path

1. **Day 1:** Install locally, explore features
2. **Day 2:** Add your media, customize settings
3. **Day 3:** Deploy to production VPS
4. **Day 4:** Setup SSL/HTTPS
5. **Day 5:** Configure automated backups

---

## 📚 Additional Resources

- **[Quick Start](./QUICKSTART.md)** - 5-minute guide
- **[Full Deployment](./DEPLOYMENT.md)** - Complete guide
- **[Main README](./README.md)** - Feature documentation
- **GitHub Issues** - Report problems
- **GitHub Discussions** - Ask questions

---

## 🎉 Success Checklist

After installation, verify:

- [ ] Can access http://localhost:3000
- [ ] Can login with demo/demo123
- [ ] Can browse sample media
- [ ] Can search for content
- [ ] Can add to My List
- [ ] Can view profile
- [ ] Services are healthy: `docker-compose ps`

---

## 🆘 Need Help?

1. Check the [Troubleshooting](#troubleshooting) section above
2. Review [DEPLOYMENT.md](./DEPLOYMENT.md)
3. Check `docker-compose logs -f` for errors
4. Create a GitHub issue with:
   - Your OS and version
   - Docker version: `docker --version`
   - Error messages from logs
   - Steps you've tried

---

## 🎊 You're All Set!

MediaFlix is now running! Here's what you can do:

1. 🎬 **Browse** sample content
2. 👤 **Create** your own account
3. 📁 **Add** your media files
4. ⚙️ **Customize** settings
5. 🚀 **Deploy** to production (optional)

**Enjoy your personal Netflix! 🍿**

---

Made with ❤️ by the MediaFlix team
