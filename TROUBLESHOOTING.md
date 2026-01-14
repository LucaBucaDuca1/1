# HomeFlix Installation Troubleshooting

## Quick Start (No Docker Required)

### For Windows:

1. **Check if you have Node.js installed:**
   ```cmd
   node --version
   npm --version
   ```
   If not installed, download from: https://nodejs.org/ (use LTS version)

2. **Install dependencies:**
   ```cmd
   npm run setup
   ```

3. **Run the app:**
   ```cmd
   start.bat
   ```
   OR
   ```cmd
   npm run dev
   ```

### For Linux/Mac:

1. **Check Node.js:**
   ```bash
   node --version
   npm --version
   ```

2. **Install dependencies:**
   ```bash
   npm run setup
   ```

3. **Run the app:**
   ```bash
   ./start.sh
   ```
   OR
   ```bash
   npm run dev
   ```

---

## Common Issues & Solutions

### Issue 1: "npm not found" or "node not found"

**Solution:** Install Node.js
- Download from: https://nodejs.org/
- Windows: Use the .msi installer
- Mac: Use Homebrew: `brew install node`
- Linux: `sudo apt install nodejs npm` (Ubuntu/Debian)

### Issue 2: "Port already in use"

**Error:** `EADDRINUSE: address already in use :::3001`

**Solution:**
- **Windows:**
  ```cmd
  netstat -ano | findstr :3001
  taskkill /PID <PID> /F
  ```
- **Linux/Mac:**
  ```bash
  lsof -ti:3001 | xargs kill -9
  lsof -ti:5173 | xargs kill -9
  ```

### Issue 3: "Permission denied" errors

**Windows Solution:**
- Run PowerShell or Command Prompt as Administrator
- Or right-click start.bat → Run as administrator

**Linux/Mac Solution:**
```bash
chmod +x start.sh
chmod +x scripts/*.sh
```

### Issue 4: "concurrently not found"

**Solution:** Install dependencies properly:
```bash
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### Issue 5: SQLite database errors

**Solution:** Delete and recreate database:
```bash
# Windows
del server\database.sqlite

# Linux/Mac
rm server/database.sqlite
```
The database will be recreated on next start.

### Issue 6: "Cannot find module" errors

**Solution:** Clean install:
```bash
# Remove all node_modules
rm -rf node_modules server/node_modules client/node_modules

# Windows
rmdir /s /q node_modules
rmdir /s /q server\node_modules
rmdir /s /q client\node_modules

# Reinstall
npm run setup
```

### Issue 7: Docker install failing

If you're trying the Docker install (`install.sh` or `install.ps1`):

**Windows:**
1. Install Docker Desktop: https://docs.docker.com/desktop/install/windows-install/
2. Start Docker Desktop
3. Run PowerShell as Admin
4. Run: `.\install.ps1`

**Linux/Mac:**
1. Install Docker: https://docs.docker.com/engine/install/
2. Install Docker Compose: https://docs.docker.com/compose/install/
3. Run: `./install.sh`

---

## Health Check

Run the doctor command to check your setup:
```bash
npm run doctor
```

This will check:
- ✓ Node.js version (need 16+)
- ✓ npm installed
- ✓ ffmpeg (optional, for thumbnails)
- ✓ Ports 3001 and 5173 available
- ✓ Dependencies installed
- ✓ Environment variables

---

## Still Having Issues?

### Check logs:

**Server logs:**
```bash
cd server && npm run dev
```
Watch for error messages in the console.

**Client logs:**
```bash
cd client && npm run dev
```

### Manual step-by-step install:

```bash
# 1. Install root dependencies
npm install

# 2. Install server dependencies
cd server
npm install
cd ..

# 3. Install client dependencies
cd client
npm install
cd ..

# 4. Create server/.env file (optional)
cp server/.env.example server/.env
# Edit server/.env and change JWT_SECRET

# 5. Start server (terminal 1)
cd server
npm run dev

# 6. Start client (terminal 2)
cd client
npm run dev

# 7. Visit http://localhost:5173
```

---

## System Requirements

- **Node.js:** v16 or higher
- **npm:** v7 or higher
- **RAM:** 2GB minimum
- **Disk:** 500MB for app + space for your media
- **OS:** Windows 10+, macOS 10.15+, Linux (any modern distro)

---

## Getting Help

If you're still stuck:
1. Run `npm run doctor` and save the output
2. Check the error messages carefully
3. Try the manual step-by-step install above
4. Make sure ports 3001 and 5173 aren't blocked by firewall
