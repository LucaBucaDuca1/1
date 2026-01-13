# MediaFlix - Personal Media Server Suite

A Netflix-style media server with clients for desktop, mobile, and LG TV. Stream your personal collection of movies and TV shows across all your devices.

![MediaFlix](https://img.shields.io/badge/Version-1.0.0-red.svg)
![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20LG%20TV-blue.svg)

## Features

- **Netflix-like UI** - Beautiful, responsive interface inspired by Netflix
- **Multi-Platform Support** - Web (desktop/mobile) and LG webOS TV apps
- **Media Library Management** - Organize movies and TV shows with metadata
- **Video Streaming** - Built-in video player with controls
- **Search & Browse** - Find content by title, genre, or type
- **TV Remote Navigation** - Full D-pad support for LG TV app
- **Responsive Design** - Optimized for all screen sizes

## Project Structure

```
media-server-suite/
├── server/              # Backend API server
│   ├── server.js        # Express server
│   ├── database.js      # SQLite database
│   └── media/           # Media files directory
├── client/              # Web client (React + Vite)
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── pages/       # Page components
│       └── styles/      # CSS files
└── lg-tv-app/          # LG webOS TV app
    ├── appinfo.json    # App configuration
    ├── index.html      # Main HTML
    └── js/             # JavaScript files
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- For LG TV: webOS TV SDK (optional, for deployment)

## Installation

### 1. Install Dependencies

```bash
# Install all dependencies
npm run install-all

# Or install individually
npm install                    # Root dependencies
cd server && npm install       # Server dependencies
cd ../client && npm install    # Client dependencies
```

### 2. Configure the Server

```bash
cd server
cp .env.example .env
```

Edit `.env` file:
```env
PORT=3001
MEDIA_PATH=./media
DB_PATH=./database.sqlite
```

### 3. Add Your Media Files

Create a `media` directory in the `server` folder and add your video files:

```bash
mkdir -p server/media
# Copy your video files to server/media/
```

## Running the Application

### Development Mode

Run both server and client in development mode:

```bash
# From the root directory
npm run dev
```

This will start:
- Backend server at `http://localhost:3001`
- Web client at `http://localhost:3000`

### Production Mode

```bash
# Build the client
npm run build

# Start the server
npm start
```

### Running Individually

**Backend Server:**
```bash
cd server
npm run dev          # Development mode with auto-reload
# or
npm start           # Production mode
```

**Web Client:**
```bash
cd client
npm run dev         # Development mode
# or
npm run build       # Build for production
npm run preview     # Preview production build
```

## Web Client Usage

### Desktop/Mobile Browser

1. Open your browser and navigate to `http://localhost:3000`
2. Browse the media library on the home page
3. Click on any title to see details
4. Click "Play" to watch the content
5. Use the search feature to find specific titles

### Mobile Responsive Features

- Touch-optimized interface
- Swipe to scroll through media rows
- Adaptive layout for smaller screens
- Full-screen video playback

## LG TV Setup

### For Development (Testing on Computer)

1. Open `lg-tv-app/index.html` in a web browser
2. Use keyboard arrow keys to navigate
3. Press Enter to select items

### For LG webOS TV Deployment

#### Prerequisites
Install the webOS TV SDK:
```bash
# Follow instructions at:
# http://webostv.developer.lge.com/sdk/installation/
```

#### Configuration

1. Update the server IP in `lg-tv-app/js/api.js`:
```javascript
const API_BASE_URL = 'http://YOUR_SERVER_IP:3001/api';
```

2. Update the media URL in `lg-tv-app/js/app.js` (line with video source)

#### Package and Install

```bash
cd lg-tv-app

# Package the app
ares-package .

# Install on your TV (replace YOUR_TV with your TV's device name)
ares-install --device YOUR_TV com.mediaserver.app_1.0.0_all.ipk

# Launch the app
ares-launch --device YOUR_TV com.mediaserver.app
```

### TV Remote Controls

- **Arrow Keys** - Navigate through the interface
- **OK/Enter** - Select item
- **Back** - Go back to previous screen
- **Exit** - Close the app

## API Endpoints

The backend server exposes the following REST API endpoints:

### Media Endpoints

- `GET /api/media` - Get all media (supports query params: type, genre, search)
- `GET /api/media/:id` - Get specific media by ID
- `GET /api/featured` - Get featured/top-rated media
- `GET /api/genres` - Get all available genres
- `POST /api/media` - Add new media (JSON body)

### Example API Calls

```bash
# Get all movies
curl http://localhost:3001/api/media?type=movie

# Search for content
curl http://localhost:3001/api/media?search=action

# Get media details
curl http://localhost:3001/api/media/1
```

## Adding Media to the Library

### Method 1: Add Files Directly

1. Place video files in `server/media/`
2. Use the API to add metadata:

```bash
curl -X POST http://localhost:3001/api/media \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Movie",
    "description": "A great movie",
    "type": "movie",
    "genre": "Action",
    "year": 2024,
    "rating": 8.5,
    "duration": 120,
    "thumbnail": "https://example.com/poster.jpg",
    "backdrop": "https://example.com/backdrop.jpg",
    "video_url": "my-movie.mp4"
  }'
```

### Method 2: Direct Database Edit

The SQLite database is located at `server/database.sqlite`. You can use any SQLite client to add entries directly to the `media` table.

## Customization

### Changing the Theme

Edit the CSS files in `client/src/styles/` to customize colors and styling:

- Primary color: `#e50914` (Netflix red)
- Background: `#141414` (Dark)
- Text: `#fff` (White)

### Adding New Features

The codebase is modular and easy to extend:

- **Server**: Add new routes in `server/server.js`
- **Web Client**: Add new components in `client/src/components/`
- **LG TV**: Modify `lg-tv-app/js/app.js`

## Troubleshooting

### Server won't start
- Check if port 3001 is already in use
- Verify Node.js is installed correctly
- Check the `.env` file configuration

### Videos won't play
- Ensure video files are in `server/media/`
- Check video format (MP4 recommended)
- Verify the `video_url` in the database matches the filename

### LG TV app not connecting
- Update the server IP in `lg-tv-app/js/api.js`
- Ensure your TV and server are on the same network
- Check firewall settings on the server

### Web client shows "Loading..."
- Verify the backend server is running
- Check browser console for errors
- Ensure the API proxy is configured correctly in `vite.config.js`

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **SQLite** - Database
- **CORS** - Cross-origin resource sharing

### Web Client
- **React** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Routing
- **Axios** - HTTP client

### LG TV App
- **Vanilla JavaScript** - Core logic
- **webOS APIs** - TV integration
- **CSS3** - Styling

## Performance Tips

1. **Video Encoding**: Use H.264 codec for best compatibility
2. **Image Optimization**: Compress thumbnails and backdrops
3. **Server Location**: Host on the same network as viewing devices
4. **Database**: Regular cleanup of unused entries
5. **Caching**: Enable browser caching for static assets

## Security Considerations

⚠️ **This is a local network application. Do NOT expose to the internet without proper security measures:**

- No authentication is implemented
- No HTTPS/SSL encryption
- No input validation on file uploads
- Designed for trusted local network use only

For internet access, consider:
- Adding user authentication
- Implementing HTTPS
- Setting up a VPN
- Using a reverse proxy (nginx, Caddy)

## Future Enhancements

Potential features to add:
- [ ] User accounts and authentication
- [ ] Watch history and resume playback
- [ ] Subtitle support
- [ ] Multiple audio tracks
- [ ] Continue watching row
- [ ] Recommendations engine
- [ ] Mobile native apps (iOS/Android)
- [ ] Chromecast support
- [ ] Download for offline viewing
- [ ] Multi-language support

## License

This project is open source and available for personal use.

## Contributing

Feel free to fork and customize this project for your needs. Pull requests are welcome!

## Support

For issues and questions:
1. Check the Troubleshooting section
2. Review the code comments
3. Check browser/server console logs

---

**Enjoy your personal Netflix-style media server!** 🎬🍿
