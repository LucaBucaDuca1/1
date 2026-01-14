# media folder organization

this is where all your video files live. here's how i organize it:

## folders

### uploads/
files that get uploaded through the web interface go here automatically
- the upload feature handles this for you
- files are named with timestamps to avoid conflicts

### movies/
if you want to manually add movies, drop them here
- name them however you want
- i usually do: "movie-title-year.mp4"
- examples: "inception-2010.mp4", "the-matrix-1999.mkv"

### shows/
tv shows go here, i organize by show name
- create subfolders for each show
- examples:
  - shows/breaking-bad/s01e01.mp4
  - shows/the-office/season-01/episode-01.mkv
  - shows/stranger-things/s04e01-1080p.mp4

### placeholders/
placeholder images for when you don't have posters
- default poster and backdrop images
- feel free to replace with your own defaults

## file formats

works with pretty much everything:
- mp4 (most common, works everywhere)
- mkv (good quality, lots of features)
- avi (older but still works)
- mov (apple format)
- webm (web optimized)

## tips

- keep files under 5gb for uploads (or edit the limit in server.js)
- use reasonable filenames, no weird characters
- organize shows by season if you have multiple seasons
- compress large files if needed (handbrake is good for this)

## where files go

when you upload through the UI:
- video → /media/uploads/[timestamp]-[originalname]
- poster → /media/uploads/[timestamp]-poster.jpg
- backdrop → /media/uploads/[timestamp]-backdrop.jpg

manually added files:
- just drop them in movies/ or shows/
- then add metadata through the upload page (or directly in the db if you're brave)

## storage

currently using local storage (this folder)
if you want to use external storage:
- mount it to this folder
- or symlink to another drive
- or update the paths in server.js

that's it. pretty straightforward.

- zeloz
