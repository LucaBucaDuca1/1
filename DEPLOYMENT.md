# 🚀 MediaFlix Deployment Guide

Complete guide for deploying MediaFlix on various platforms.

## Table of Contents
- [Quick Start (Any Platform)](#quick-start-any-platform)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [VPS Deployment (DigitalOcean, AWS, etc.)](#vps-deployment)
- [Cloud Platform Deployment](#cloud-platform-deployment)
- [Production Best Practices](#production-best-practices)

---

## Quick Start (Any Platform)

### Prerequisites
- Docker and Docker Compose installed
- 2GB+ RAM
- 10GB+ disk space

### One-Command Installation

**Linux/macOS:**
```bash
./install.sh
```

**Windows (PowerShell):**
```powershell
.\install.ps1
```

**Manual Docker Compose:**
```bash
# Copy environment file
cp .env.example .env

# Edit .env and set your JWT_SECRET
nano .env

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

That's it! Access at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

**Default Login:**
- Username: `demo`
- Password: `demo123`

---

## Local Development

### Without Docker

1. **Install Dependencies:**
```bash
npm install
cd server && npm install
cd ../client && npm install
```

2. **Setup Environment:**
```bash
cd server
cp .env.example .env
# Edit .env with your settings
```

3. **Start Development Servers:**
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

4. **Access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

---

## Docker Deployment

### Basic Docker Deployment

```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Update services
docker-compose pull
docker-compose up -d --build
```

### Docker with Production Nginx

```bash
# Enable nginx profile
export COMPOSE_PROFILES=production

# Or in .env file:
# COMPOSE_PROFILES=production

docker-compose up -d --build
```

### Custom Ports

Edit `.env`:
```env
SERVER_PORT=8080
CLIENT_PORT=8000
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443
```

---

## VPS Deployment

### DigitalOcean, AWS EC2, Linode, etc.

#### 1. Create Server
- Ubuntu 20.04+ or Debian 11+
- Minimum: 2GB RAM, 2 CPU cores, 20GB storage
- Recommended: 4GB RAM, 2 CPU cores, 50GB storage

#### 2. Initial Server Setup

```bash
# SSH into your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Create user (optional but recommended)
adduser mediaflix
usermod -aG sudo mediaflix
usermod -aG docker mediaflix

# Switch to new user
su - mediaflix
```

#### 3. Clone and Deploy

```bash
# Clone your repository
git clone <your-repo-url>
cd <repo-name>

# Run installation
chmod +x install.sh
./install.sh
```

#### 4. Configure Firewall

```bash
# Allow HTTP, HTTPS, and SSH
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

#### 5. Setup Domain (Optional)

```bash
# Point your domain DNS A record to your server IP
# Example: mediaflix.yourdomain.com -> your-server-ip

# Update .env
nano .env
# Set VITE_API_URL=https://mediaflix.yourdomain.com
```

#### 6. Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d mediaflix.yourdomain.com

# Auto-renewal is configured automatically
```

---

## Cloud Platform Deployment

### AWS (Amazon Web Services)

#### Using EC2:
1. Launch EC2 instance (Ubuntu 20.04)
2. Configure Security Group (ports 22, 80, 443, 3000, 3001)
3. Follow VPS deployment steps above

#### Using ECS (Docker):
1. Create ECS cluster
2. Push images to ECR:
```bash
# Build and tag images
docker build -t mediaflix-server ./server
docker build -t mediaflix-client ./client

# Tag for ECR
docker tag mediaflix-server:latest <account-id>.dkr.ecr.<region>.amazonaws.com/mediaflix-server:latest
docker tag mediaflix-client:latest <account-id>.dkr.ecr.<region>.amazonaws.com/mediaflix-client:latest

# Push to ECR
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/mediaflix-server:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/mediaflix-client:latest
```
3. Create ECS task definitions
4. Deploy service

### Google Cloud Platform

#### Using Compute Engine:
Similar to AWS EC2 - follow VPS deployment steps

#### Using Cloud Run:
```bash
# Build and deploy server
gcloud builds submit --tag gcr.io/PROJECT-ID/mediaflix-server ./server
gcloud run deploy mediaflix-server --image gcr.io/PROJECT-ID/mediaflix-server

# Build and deploy client
gcloud builds submit --tag gcr.io/PROJECT-ID/mediaflix-client ./client
gcloud run deploy mediaflix-client --image gcr.io/PROJECT-ID/mediaflix-client
```

### Heroku

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create apps
heroku create mediaflix-server
heroku create mediaflix-client

# Deploy server
cd server
git init
heroku git:remote -a mediaflix-server
git add .
git commit -m "Deploy server"
git push heroku main

# Deploy client
cd ../client
git init
heroku git:remote -a mediaflix-client
git add .
git commit -m "Deploy client"
git push heroku main
```

### Railway.app

1. Connect your GitHub repository
2. Create new project
3. Add services:
   - Backend: `./server`
   - Frontend: `./client`
4. Set environment variables
5. Deploy automatically on push

---

## Production Best Practices

### Security

1. **Change Default Credentials:**
```bash
# Create new admin user via API or database
```

2. **Strong JWT Secret:**
```bash
# Generate secure secret
openssl rand -base64 32
# Add to .env
JWT_SECRET=your-generated-secret
```

3. **HTTPS Only:**
- Always use SSL certificates in production
- Redirect HTTP to HTTPS
- Use Let's Encrypt for free certificates

4. **Firewall Rules:**
```bash
# Only allow necessary ports
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw deny 3000/tcp # Block direct client access
sudo ufw deny 3001/tcp # Block direct server access
```

### Performance

1. **Increase Docker Resources:**
```yaml
# In docker-compose.yml
services:
  server:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
```

2. **Enable Caching:**
- Already configured in nginx.conf
- Static assets cached for 1 year

3. **Database Optimization:**
```bash
# Regular database backups
docker-compose exec server sqlite3 /app/data/database.sqlite .dump > backup.sql
```

### Monitoring

1. **View Logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server
docker-compose logs -f client

# Last 100 lines
docker-compose logs --tail=100
```

2. **Health Checks:**
```bash
# Check service health
docker-compose ps

# Manual health check
curl http://localhost:3001/api/health
```

3. **Resource Usage:**
```bash
# Docker stats
docker stats

# System resources
htop  # Install: apt install htop
```

### Backups

1. **Database Backup:**
```bash
# Create backup directory
mkdir -p backups

# Backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T server sqlite3 /app/data/database.sqlite .dump > backups/db_$DATE.sql
```

2. **Media Backup:**
```bash
# Backup media files
tar -czf backups/media_$DATE.tar.gz server/media/
```

3. **Automated Backups:**
```bash
# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /path/to/backup-script.sh
```

### Updates

1. **Update MediaFlix:**
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up -d --build

# Or use install script
./install.sh
```

2. **Update Docker Images:**
```bash
# Pull latest base images
docker-compose pull

# Rebuild with new base images
docker-compose up -d --build
```

---

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose logs

# Check Docker
docker ps
docker-compose ps

# Restart services
docker-compose restart

# Clean restart
docker-compose down
docker-compose up -d --build
```

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :3000
sudo lsof -i :3001

# Kill process or change port in .env
```

### Database Issues

```bash
# Reset database (WARNING: Deletes all data)
rm server/data/database.sqlite
docker-compose restart server
```

### Permission Issues

```bash
# Fix permissions
sudo chown -R $USER:$USER .
chmod -R 755 server/media
chmod -R 755 server/data
```

---

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Review this guide
3. Check GitHub issues
4. Create new issue with logs

---

## Quick Reference

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f

# Restart
docker-compose restart

# Update
git pull && docker-compose up -d --build

# Backup
docker-compose exec -T server sqlite3 /app/data/database.sqlite .dump > backup.sql

# Clean up
docker system prune -a
```
