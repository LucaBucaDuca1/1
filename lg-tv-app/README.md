# MediaFlix LG TV App (4K)

## Overview
Native LG webOS TV application optimized for 4K (3840x2160) displays with full remote control support.

## Features

### 4K Optimization
- Native 3840x2160 resolution support
- Scaled UI elements for optimal viewing distance (10-foot interface)
- High DPI font rendering
- Enhanced shadows and contrast for 4K clarity
- Performance optimizations for smooth 4K playback

### TV Remote Navigation
- **Arrow Keys** - Navigate through content
- **OK/Enter** - Select items
- **Back** - Return to previous screen
- **Exit** - Close application

### Interface Features
- D-pad optimized navigation
- Focus management system
- Large touch targets (optimized for remote control)
- Clear visual feedback
- Auto-scrolling content rows
- Video playback controls

## Resolution Details

**4K UHD (3840x2160)**
- All UI elements scaled 2x from 1080p base
- Font sizes optimized for 10-foot viewing distance
- Button sizes: 40-100px padding
- Text sizes: 48-144px for headings
- Icon sizes: Appropriately scaled for 4K

## Installation

### Development Setup
1. Install webOS TV SDK
2. Configure your LG TV for developer mode
3. Update API URL in `js/api.js`

### Packaging
```bash
cd lg-tv-app
ares-package .
```

### Installation on TV
```bash
# Add your TV as a device
ares-setup-device

# Install the app
ares-install --device YOUR_TV com.mediaserver.app_1.0.0_all.ipk

# Launch the app
ares-launch --device YOUR_TV com.mediaserver.app
```

## Configuration

### API Connection
Edit `js/api.js` and update the server URL:
```javascript
const API_BASE_URL = 'http://YOUR_SERVER_IP:3001/api';
```

### Media Files
Update video source URL in `js/app.js`:
```javascript
source.src = `http://YOUR_SERVER_IP:3001/media/${this.currentMedia.video_url}`;
```

## File Structure

```
lg-tv-app/
├── appinfo.json       # App configuration (4K resolution)
├── index.html         # Main HTML (4K viewport)
├── styles/
│   └── app.css        # 4K optimized styles
├── js/
│   ├── webostv.js     # webOS API wrapper
│   ├── api.js         # Server API client
│   ├── navigation.js  # Remote control navigation
│   └── app.js         # Main application logic
└── images/
    ├── icon.png       # App icon (512x512 recommended)
    └── bg.png         # Background image
```

## UI Elements (4K Scaled)

### Typography
- Navbar Brand: 84px
- Menu Items: 56px
- Hero Title: 144px
- Hero Description: 64px
- Row Titles: 72px
- Item Titles: 48px
- Buttons: 56px

### Spacing
- Navbar Padding: 60px 120px
- Content Padding: 120px
- Button Padding: 40px 100px
- Gap between items: 40-80px

### Components
- Media Cards: 560x840px
- Focus Outline: 8px
- Border Radius: 16-24px
- Loading Spinner: 200x200px

## Performance Tips

1. **Video Format**: Use H.265/HEVC for 4K content
2. **Bitrate**: Minimum 25 Mbps for 4K streaming
3. **Network**: Wired Ethernet recommended
4. **Caching**: Leverage browser caching for images
5. **Hardware Acceleration**: Enabled by default

## Supported Video Formats

- **4K (Recommended)**
  - H.265/HEVC (best compression)
  - H.264/AVC (wider compatibility)
  - VP9 (webM)

- **Codecs**
  - Video: H.265, H.264, VP9
  - Audio: AAC, MP3, Opus

- **Containers**
  - MP4 (recommended)
  - MKV
  - WebM

## Testing

### Remote Control Testing
Use keyboard for testing:
- Arrow Keys: Navigation
- Enter: OK button
- Backspace: Back button
- Escape: Exit

### Focus Testing
- All interactive elements should be navigable
- Focus indicator should be clearly visible
- Auto-scroll should work smoothly

### Video Testing
- Test 4K playback performance
- Verify controls work with remote
- Check resume playback
- Test seek functionality

## Troubleshooting

### Video Won't Play
- Check video codec compatibility
- Ensure network speed is sufficient
- Verify file permissions on server
- Check CORS configuration

### Navigation Issues
- Verify focus management in navigation.js
- Check key code mappings
- Test with TV remote, not just keyboard

### 4K Display Issues
- Confirm TV is in 4K mode
- Check HDMI cable supports 4K
- Verify app resolution in appinfo.json
- Test different scaling factors

### Performance Issues
- Reduce image quality for thumbnails
- Enable hardware acceleration
- Check network bandwidth
- Consider lower bitrate videos

## webOS TV SDK Resources

- [webOS TV SDK Documentation](http://webostv.developer.lge.com/)
- [webOS TV API Reference](http://webostv.developer.lge.com/api/)
- [Development Guide](http://webostv.developer.lge.com/develop/)

## Notes

- Optimized for LG webOS 4.0+
- Tested on 55", 65", 75" 4K TVs
- 10-foot UI design principles applied
- Remote control is primary input method
- Keyboard input for development only

## Version History

### v1.1.0 (Current)
- Upgraded to 4K (3840x2160) resolution
- 2x UI scaling for optimal viewing
- Enhanced shadows and contrast
- Performance optimizations

### v1.0.0
- Initial release
- 1080p resolution
- Basic navigation

---

**Built for LG webOS Smart TVs with 4K UHD support**
