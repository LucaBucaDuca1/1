# mediaflix lg tv app (4k)

the tv app for my living room LG. spent way too long getting this to work but it's pretty awesome now.

## what it does

### 4k goodness
- runs at full 3840x2160 (native 4k baby)
- ui is scaled 2x so you can actually read stuff from the couch
- fonts render super crisp on the 4k display
- added extra shadows and contrast to make everything pop
- optimized so it doesn't lag on 4k video

### remote control
- arrow keys to navigate (obviously)
- ok/enter to select
- back button works
- exit to close the app
- works with my magic remote too

### interface stuff
- designed for d-pad navigation (no mouse needed)
- everything has big click targets for remote
- shows you what you're focused on clearly
- content rows scroll automatically
- video player with playback controls

## screen resolution

**4k uhd (3840x2160)**
- everything is 2x bigger than 1080p
- fonts are huge (48px-144px) so readable from 10 feet away
- buttons have lots of padding (40-100px)
- tested on my 65" tv, looks perfect

## setup

### dev mode
1. install webos tv sdk (pain but necessary)
2. enable developer mode on your lg tv (google it)
3. change the api url in `js/api.js` to point to your server

### building the app
```bash
cd lg-tv-app
ares-package .
```

### installing on your tv
```bash
# setup your tv
ares-setup-device

# install it
ares-install --device YOUR_TV com.mediaserver.app_1.0.0_all.ipk

# launch
ares-launch --device YOUR_TV com.mediaserver.app
```

## config stuff

### api connection
edit `js/api.js` and change the server url:
```javascript
const API_BASE_URL = 'http://YOUR_SERVER_IP:3001/api';
```

replace YOUR_SERVER_IP with your actual server ip (mine is 192.168.1.100)

### media files path
in `js/app.js` update the video source if needed:
```javascript
source.src = `http://YOUR_SERVER_IP:3001/media/${this.currentMedia.video_url}`;
```

## folder layout

```
lg-tv-app/
├── appinfo.json       # app config (set to 4k here)
├── index.html         # main html file
├── styles/
│   └── app.css        # all the 4k styling
├── js/
│   ├── webostv.js     # webos stuff
│   ├── api.js         # talks to server
│   ├── navigation.js  # remote control handling
│   └── app.js         # main app code
└── images/
    ├── icon.png       # app icon (512x512 works)
    └── bg.png         # background
```

## 4k scaling reference

font sizes i used:
- navbar: 84px
- menu: 56px
- hero title: 144px
- descriptions: 64px
- row titles: 72px
- buttons: 56px

spacing:
- navbar padding: 60px 120px
- content padding: 120px
- buttons: 40px 100px padding
- gaps: 40-80px

card sizes:
- media cards: 560x840px
- focus outline: 8px thick
- border radius: 16-24px
- spinner: 200x200px

## performance notes

from my testing:
1. h.265/hevc works best for 4k
2. need at least 25mbps bitrate for smooth 4k
3. use ethernet cable, wifi can be spotty
4. browser caching helps a lot
5. hardware acceleration is on by default (good)

## video formats that work

**4k stuff:**
- h.265/hevc (best, smaller files)
- h.264/avc (more compatible)
- vp9 (webm format)

codecs that work:
- video: h.265, h.264, vp9
- audio: aac, mp3, opus

containers:
- mp4 (i use this most)
- mkv (works great)
- webm (also good)

## testing stuff

### remote control testing
when developing, use keyboard:
- arrow keys = navigation
- enter = ok button
- backspace = back
- escape = exit

actual tv remote works once installed

### what to test
- make sure everything is navigable with d-pad
- focus indicator should be obvious
- auto-scroll should be smooth
- test 4k playback (make sure it doesn't stutter)
- verify remote controls work
- check if resume works
- test seeking forward/back

## fixing common issues

**video won't play:**
- check if codec is supported
- make sure network is fast enough
- file permissions might be wrong on server
- cors config could be blocking it

**navigation broken:**
- look at focus management in navigation.js
- key codes might be mapped wrong
- test with actual tv remote, keyboard can be different

**4k looks weird:**
- make sure tv is actually in 4k mode
- hdmi cable needs to support 4k (some don't)
- check resolution in appinfo.json is 3840x2160
- try different scaling if text is too big/small

**performance sucks:**
- lower thumbnail quality
- hardware acceleration should be on
- check network speed
- might need lower bitrate videos

## useful links

- [webos sdk docs](http://webostv.developer.lge.com/)
- [api reference](http://webostv.developer.lge.com/api/)
- [dev guide](http://webostv.developer.lge.com/develop/)

## random notes

- works on webos 4.0 and newer
- tested on my 65" and friends 55" and 75" tvs
- designed for viewing from couch (10 foot interface)
- remote is how you use it (keyboard just for testing)

## changes i made

**v1.1.0 (current)**
- bumped to 4k (3840x2160)
- made ui 2x bigger
- better shadows and contrast
- performance tweaks

**v1.0.0**
- initial 1080p version

---

made by zeloz
