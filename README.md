# 🎬 MediaFlix

my personal netflix clone for hosting my own movie/tv show library. supports desktop, mobile, and even my LG TV in the living room.

made by **zeloz**

![MediaFlix](https://img.shields.io/badge/Version-2.0.0-red.svg)
![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20LG%20TV-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-brightgreen.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## what it does

### user stuff
- login/register with JWT auth
- multiple user profiles (each person in the house can have their own)
- personal avatars and settings

### media features
- upload your own movies & tv shows (up to 5gb per file)
- watch history so you can resume where you left off
- my list feature to save favorites
- recommendations based on what you watch
- search by title, genre, cast, tags, whatever
- continue watching row on homepage

### design
- looks like netflix but with my own twist (glassmorphism effects are sick)
- works on everything - phone, tablet, desktop, 4K TV
- dark theme because light themes hurt my eyes
- smooth animations

### deployment
- super easy to set up (just run a script)
- docker support if you're into that
- works on linux, mac, windows
- can deploy to any cloud provider

---

## 🚀 how to run it

### easiest way (development mode)

just run one of these depending on your OS:

**linux/mac:**
```bash
./start.sh
```

**windows:**
```cmd
start.bat
```

**or if you prefer npm:**
```bash
npm run dev
```

this will:
- auto install dependencies if you don't have them
- start the server on http://localhost:3001
- start the frontend on http://localhost:5173

### docker way (if you want)

you'll need docker installed first (obviously)

**linux/mac:**
```bash
chmod +x install.sh
./install.sh
```

**windows powershell:**
```powershell
.\install.ps1
```

**or do it manually:**
```bash
cp .env.example .env
docker-compose up -d
```

then go to:
- frontend: http://localhost:3000
- backend api: http://localhost:3001/api

### test account
username: `demo`
password: `demo123`

### uploading your movies

1. login (or make an account)
2. hit the "upload" button in the nav bar
3. fill out the form - title and type are required, rest is optional
4. pick your files:
   - video (mp4, mkv, avi, mov, webm - max 5gb)
   - poster image if you want
   - backdrop image for the hero section
5. hit upload and wait

that's it, your movie shows up instantly in the library

### bulk adding media (for large libraries)

if you have a ton of files to add at once:

**option 1: upload through web**
- go to /upload page
- upload each file with metadata
- takes time but metadata is added automatically

**option 2: manual copy (faster for bulk)**
```bash
# check where your media folder is
./scripts/media-stats.sh

# organize files from an external drive or download folder
./scripts/organize-media.sh /path/to/your/movies

# then use the upload page to add metadata for each file
```

**media organization:**
- see `server/media/README.md` for detailed organization tips
- movies go in `server/media/movies/`
- shows go in `server/media/shows/` (organized by show name)
- uploaded files automatically go to `server/media/uploads/`

**supported formats:**
mp4, mkv, avi, mov, webm (basically everything)

---

## 📖 more info

check out these if you need more details:
- [QUICKSTART.md](./QUICKSTART.md) - detailed setup guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - how to deploy to a vps/cloud
- [API docs](#api-endpoints) - all the endpoints

---

## 🏗️ how it's built

### folder structure

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

### what's under the hood

**backend:**
- node.js + express (simple and works)
- sqlite for database (no need for mysql/postgres, this is way easier)
- JWT tokens for staying logged in
- bcrypt for secure passwords
- multer for handling file uploads
- rate limiting to prevent spam

**frontend:**
- react 18 with hooks
- vite for super fast dev builds
- react router for navigation
- axios for api calls
- react toastify for those nice popup notifications
- custom css with glassmorphism effects

**deployment:**
- docker + docker compose (optional but recommended)
- can run without docker too
- works on any linux/mac/windows machine

---

## 📱 where it works

### web (desktop & mobile)
- responsive design, looks good everywhere
- works on chrome, firefox, safari, edge, whatever
- touch-friendly on mobile
- could make it a PWA if i wanted to

### lg webos tv (the cool part)
- built a custom app for my LG TV
- works with the remote control (d-pad navigation)
- **supports 4k (3840x2160)** - looks amazing on my 65" tv
- ui is scaled 2x so everything's readable from the couch
- took forever to get the tv app working but totally worth it

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
