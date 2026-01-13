# 🎬 MediaFlix - Personal Media Server Suite

A production-ready, Netflix-style media server with authentication, watch history, recommendations, and beautiful interfaces for desktop, mobile, and LG TV.

![MediaFlix](https://img.shields.io/badge/Version-2.0.0-red.svg)
![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20LG%20TV-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-brightgreen.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## ✨ Features

### 🔐 User Management
- **JWT Authentication** - Secure login system
- **User Profiles** - Personalized avatars and settings
- **Multiple Users** - Each user gets their own experience

### 📺 Content Features
- **Upload Media** - Easy upload interface for movies and TV shows (up to 5GB per file)
- **Watch History** - Resume playback where you left off
- **My List** - Save favorites for later
- **Recommendations** - Smart content suggestions based on your tastes
- **Search** - Find content by title, genre, cast, or tags
- **Continue Watching** - Pick up right where you stopped

### 🎨 Beautiful UI
- **Modern Design** - Netflix-inspired interface with glassmorphism
- **Responsive** - Perfect on phone, tablet, desktop, and TV
- **Smooth Animations** - Polished transitions and effects
- **Dark Theme** - Easy on the eyes

### 🚀 Easy Deployment
- **One-Command Install** - Get running in seconds
- **Docker Support** - Containerized for easy deployment
- **Multi-Platform** - Works on Linux, macOS, Windows
- **Cloud Ready** - Deploy to AWS, GCP, DigitalOcean, etc.

---

## 🚀 Quick Start

### Method 1: Simple Start (Development)

**Linux/macOS:**
```bash
./start.sh
```

**Windows:**
```cmd
start.bat
```

**Or using npm:**
```bash
npm run dev
```

This will automatically:
- Install all dependencies
- Start the backend server (http://localhost:3001)
- Start the frontend client (http://localhost:5173)

### Method 2: Docker (Production)

### Prerequisites
- Docker and Docker Compose ([Install Docker Desktop](https://www.docker.com/products/docker-desktop))
- 2GB+ RAM
- 10GB+ disk space

### Installation

**Linux/macOS:**
```bash
chmod +x install.sh
./install.sh
```

**Windows PowerShell:**
```powershell
.\install.ps1
```

**Manual Docker Compose:**
```bash
cp .env.example .env
docker-compose up -d
```

### Access
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001/api

### Default Account
- **Username:** `demo`
- **Password:** `demo123`

### 📤 Uploading Movies & TV Shows

1. **Login** to your account (or create one if you haven't)
2. Click **"Upload"** in the navigation bar
3. Fill in the media details:
   - Title, description, type (movie/series/documentary)
   - Genre, year, duration, rating
   - Cast, director, tags
4. Select files:
   - **Video file** (MP4, MKV, AVI, MOV, WebM - up to 5GB)
   - **Poster image** (Optional - for the thumbnail)
   - **Backdrop image** (Optional - for the hero background)
5. Click **"Upload Media"** and wait for the upload to complete

Your content will immediately appear in the library!

---

## 📖 Documentation

- **[Quick Start Guide](./QUICKSTART.md)** - Get up and running in 5 minutes
- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment for VPS, cloud platforms
- **[API Documentation](#api-endpoints)** - Complete REST API reference

---

## 🏗️ Architecture

### Project Structure

```
mediaflix/
├── server/              # Backend API (Node.js + Express)
│   ├── server.js        # Main server file
│   ├── database.js      # SQLite database & queries
│   ├── auth.js          # JWT authentication
│   ├── media/           # Media files directory
│   └── data/            # Database storage
├── client/              # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context (Auth)
│   │   ├── utils/       # API client & helpers
│   │   └── styles/      # CSS files
├── lg-tv-app/          # LG webOS TV app
├── scripts/            # Utility scripts
│   ├── backup.sh       # Backup database & media
│   ├── restore.sh      # Restore from backup
│   └── update.sh       # Update to latest version
├── docker-compose.yml  # Docker orchestration
├── install.sh          # One-command installer (Linux/Mac)
└── install.ps1         # One-command installer (Windows)
```

### Tech Stack

**Backend:**
- Node.js 18+ with Express
- SQLite database
- JWT authentication with bcrypt
- CORS enabled

**Frontend:**
- React 18 with Hooks
- Vite for blazing-fast builds
- React Router for navigation
- Axios for API calls
- React Toastify for notifications
- Framer Motion for animations

**Infrastructure:**
- Docker & Docker Compose
- Nginx reverse proxy
- Health checks & monitoring

---

## 📱 Platforms

### Web (Desktop & Mobile)
- Responsive React application
- Works on all modern browsers
- Mobile-optimized touch interface
- Progressive Web App ready

### LG webOS TV
- Native TV app with remote control navigation
- D-pad and voice control support
- **4K UHD Support (3840x2160)** - Optimized for modern TVs
- 10-foot UI design with scaled elements
- Enhanced shadows and contrast for 4K clarity

---

## 🎯 Key Features

### For Users

- ✅ **Easy Login** - Simple username/password authentication
- ✅ **Resume Playback** - Never lose your place
- ✅ **My List** - Build your watchlist
- ✅ **Smart Recommendations** - Discover similar content
- ✅ **Search Everything** - Find by title, genre, cast, director
- ✅ **User Preferences** - Autoplay, quality settings
- ✅ **Statistics** - Track your watch time

### For Admins

- ✅ **Easy Setup** - One command installation
- ✅ **Docker Deployment** - Portable and scalable
- ✅ **Automated Backups** - Protect your data
- ✅ **Health Monitoring** - Built-in health checks
- ✅ **Secure** - JWT tokens, password hashing
- ✅ **REST API** - Programmatic access
- ✅ **Media Management** - Add content via API

---

## 🔧 Configuration

### Environment Variables

Create `.env` file from `.env.example`:

```env
# Server
SERVER_PORT=3001
NODE_ENV=production
JWT_SECRET=your-secure-random-secret

# Client
CLIENT_PORT=3000
VITE_API_URL=http://localhost:3001

# Nginx (for production)
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443

# Database
DB_PATH=./data/database.sqlite
MEDIA_PATH=./media
```

### Custom Ports

To change ports, edit `.env` and restart:
```bash
docker-compose down
docker-compose up -d
```

### Adding Media

1. Place video files in `./server/media/`
2. Supported formats: MP4, AVI, MKV, MOV, WebM
3. Add metadata via API or directly in database

---

## 🛠️ Management Commands

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Update to latest
./scripts/update.sh

# Backup data
./scripts/backup.sh

# Restore backup
./scripts/restore.sh backups/database_YYYYMMDD.sql

# Clean up
docker system prune -a
```

---

## 📡 API Endpoints

### Authentication

```http
POST   /api/auth/login       # Login user
POST   /api/auth/register    # Register new user
GET    /api/auth/me          # Get current user
```

### Media

```http
GET    /api/media            # Get all media (with filters)
GET    /api/media/:id        # Get specific media
POST   /api/media            # Add new media (auth required)
GET    /api/featured         # Get featured content
GET    /api/genres           # Get all genres
GET    /api/recommendations/:id  # Get recommendations
```

### Watch History

```http
GET    /api/watch-history           # Get user's watch history
POST   /api/watch-history           # Update watch progress
GET    /api/watch-history/:mediaId  # Get progress for media
```

### My List

```http
GET    /api/my-list              # Get user's list
POST   /api/my-list/:mediaId     # Add to list
DELETE /api/my-list/:mediaId     # Remove from list
GET    /api/my-list/check/:mediaId  # Check if in list
```

### User

```http
GET    /api/preferences      # Get user preferences
PUT    /api/preferences      # Update preferences
PUT    /api/profile          # Update profile
GET    /api/stats            # Get user statistics
```

---

## 🔒 Security Features

- **JWT Tokens** - Secure, stateless authentication
- **Password Hashing** - Bcrypt with salt rounds
- **Protected Routes** - Authorization middleware
- **Rate Limiting** - Prevent abuse (production nginx)
- **CORS Configuration** - Controlled cross-origin access
- **Input Validation** - Sanitized user inputs
- **Security Headers** - XSS protection, frame options

### Production Security

For production deployments:
1. Change default JWT secret
2. Enable HTTPS with SSL certificates
3. Configure firewall rules
4. Regular security updates
5. Database backups
6. Monitor access logs

See [DEPLOYMENT.md](./DEPLOYMENT.md) for details.

---

## 🌐 Deployment

### Local Development

```bash
# Install dependencies
npm install
cd server && npm install
cd ../client && npm install

# Start backend
cd server && npm run dev

# Start frontend (new terminal)
cd client && npm run dev
```

### Docker Production

```bash
# Standard deployment
docker-compose up -d

# With nginx reverse proxy
COMPOSE_PROFILES=production docker-compose up -d
```

### Cloud Platforms

Detailed guides for:
- AWS (EC2, ECS, Elastic Beanstalk)
- Google Cloud (Compute Engine, Cloud Run)
- DigitalOcean (Droplets)
- Heroku
- Railway.app

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions.

---

## 🔄 Updates & Maintenance

### Update MediaFlix

```bash
# Automated update (with backup)
./scripts/update.sh

# Manual update
git pull
docker-compose up -d --build
```

### Backup & Restore

```bash
# Create backup
./scripts/backup.sh

# List backups
ls -lh backups/

# Restore from backup
./scripts/restore.sh backups/database_20240115.sql
```

### Automated Backups

Add to crontab for daily backups at 2 AM:
```bash
crontab -e
0 2 * * * cd /path/to/mediaflix && ./scripts/backup.sh
```

---

## 🎨 Customization

### Branding

Edit these files to customize branding:
- `client/src/styles/index.css` - Global colors
- `client/src/components/Navbar.jsx` - Logo and title
- `.env` - App configuration

### Adding Features

The codebase is modular and easy to extend:
- **Backend:** Add routes in `server/server.js`
- **Frontend:** Add pages in `client/src/pages/`
- **Database:** Extend schema in `server/database.js`

---

## 🐛 Troubleshooting

### Services won't start

```bash
docker-compose logs        # View all logs
docker-compose ps          # Check status
docker-compose restart     # Restart services
```

### Port conflicts

```bash
# Check what's using ports
lsof -i :3000
lsof -i :3001

# Change ports in .env
```

### Database issues

```bash
# Reset database (⚠️ deletes data)
rm server/data/database.sqlite
docker-compose restart server
```

### Permission errors

```bash
sudo chown -R $USER:$USER .
chmod -R 755 server/media server/data
```

---

## 📊 Performance Tips

1. **Video Encoding** - Use H.264 for best compatibility
2. **Thumbnails** - Compress images for faster loading
3. **Database** - Regular cleanup and optimization
4. **Caching** - Nginx caching enabled by default
5. **Resources** - Allocate enough Docker resources

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

---

## 📝 License

This project is open source and available under the MIT License.

---

## 🙏 Acknowledgments

Inspired by Netflix and other modern streaming platforms.

Built with:
- React
- Node.js
- Express
- SQLite
- Docker

---

## 📞 Support

- **Documentation:** Check [QUICKSTART.md](./QUICKSTART.md) and [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Issues:** GitHub Issues
- **Questions:** GitHub Discussions

---

## 🎉 Getting Started

Ready to start? Run this command:

```bash
./install.sh  # Linux/macOS
.\install.ps1  # Windows
```

Then visit http://localhost:3000 and enjoy! 🍿

---

**Made with ❤️ by the MediaFlix team**
