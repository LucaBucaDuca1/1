# HomeFlix Smart Uploader for Windows

the easy way to add your media to homeflix. just drag and drop, it figures out the rest.

made by zeloz

---

## Quick Start

**Easiest way to launch:**

Double-click: **`launch-uploader.bat`**

The launcher will check your system and fix common issues automatically.

**Having trouble?** See [UPLOADER-TROUBLESHOOTING.md](./UPLOADER-TROUBLESHOOTING.md)

---

## what it does

automatically organizes your movies and TV shows:
- **movies**: drop any video file, it'll parse the title and year
- **tv shows**: drop entire show folders, it'll organize by season/episode

## how to use

1. **run it**: double-click `launch-uploader.bat` (or right-click `HomeFlix-Uploader.ps1` → "Run with PowerShell")
2. **drop files**: drag and drop movies or show folders into the window
3. **click process**: hit the "Process Files" button
4. **done**: files are automatically organized in `server/media/`

**Note:** If the app won't open, see [UPLOADER-TROUBLESHOOTING.md](./UPLOADER-TROUBLESHOOTING.md) for solutions.

## supported formats

- MP4, MKV, AVI, MOV, WEBM
- pretty much any video file format

## examples

### movies

drop files named like:
```
Inception (2010).mp4
The Matrix.mkv
Fight Club 1999.avi
```

result: automatically organized in `server/media/movies/`

### tv shows

drop folders structured like:
```
Breaking Bad/
  Season 1/
    S01E01.mp4
    S01E02.mp4
  Season 2/
    S02E01.mp4
```

or:
```
The Office/
  Season 1/
    Episode 1.mkv
    Episode 2.mkv
```

result: automatically organized in `server/media/shows/Breaking Bad/Season 1/`

## naming patterns it understands

**for episodes:**
- S01E01, s01e01 (standard)
- 1x01 (alternate)
- Episode 1, Episode 01
- E01, e01
- just numbers: 01.mp4, 1.mp4

**for movies:**
- Title (2010).mp4
- Title 2010.mp4
- Title.mp4 (uses current year)

## after uploading

1. files are organized in `server/media/`
2. go to http://localhost:5173
3. use the upload page to add metadata (descriptions, posters, etc)

or just leave them as is, they'll show up in your library with basic info

## troubleshooting

**"Can't run PowerShell scripts"**
- open PowerShell as admin
- run: `Set-ExecutionPolicy RemoteSigned`
- try again

**"Files not showing up"**
- make sure the server is running (`npm run dev`)
- check `server/media/movies/` or `server/media/shows/` to see if files copied
- refresh the web interface

**"Wrong season/episode numbers"**
- check your file naming
- use S01E01 format for best results
- look at the log output to see what it parsed

## features

- **smart parsing**: figures out titles, years, seasons, episodes from filenames
- **drag and drop**: no complicated forms, just drop your files
- **batch processing**: drop entire show folders at once
- **real-time log**: see exactly what's happening
- **error handling**: tells you if something went wrong

## tips

- keep your file names clean
- use (year) in movie names for better parsing
- use Season X folders for TV shows
- name episodes like S01E01 for best results
- drop entire folders for shows, single files for movies

---

made by zeloz for homeflix
