#!/bin/bash

# quick script to see what media you have and how much space it's using
# - zeloz

MEDIA_DIR="$(cd "$(dirname "$0")/.." && pwd)/server/media"

echo "📊 media storage stats"
echo ""

if [ ! -d "$MEDIA_DIR" ]; then
    echo "❌ media directory doesn't exist yet"
    exit 1
fi

# count files
TOTAL_VIDEOS=$(find "$MEDIA_DIR" -type f \( -iname "*.mp4" -o -iname "*.mkv" -o -iname "*.avi" -o -iname "*.mov" -o -iname "*.webm" \) | wc -l)
MOVIES=$(find "$MEDIA_DIR/movies" -type f \( -iname "*.mp4" -o -iname "*.mkv" -o -iname "*.avi" -o -iname "*.mov" -o -iname "*.webm" \) 2>/dev/null | wc -l)
SHOWS=$(find "$MEDIA_DIR/shows" -type f \( -iname "*.mp4" -o -iname "*.mkv" -o -iname "*.avi" -o -iname "*.mov" -o -iname "*.webm" \) 2>/dev/null | wc -l)
UPLOADS=$(find "$MEDIA_DIR/uploads" -type f \( -iname "*.mp4" -o -iname "*.mkv" -o -iname "*.avi" -o -iname "*.mov" -o -iname "*.webm" \) 2>/dev/null | wc -l)

echo "total video files: $TOTAL_VIDEOS"
echo "  movies: $MOVIES"
echo "  shows: $SHOWS"
echo "  uploads: $UPLOADS"
echo ""

# storage space
if command -v du &> /dev/null; then
    TOTAL_SIZE=$(du -sh "$MEDIA_DIR" 2>/dev/null | cut -f1)
    MOVIES_SIZE=$(du -sh "$MEDIA_DIR/movies" 2>/dev/null | cut -f1)
    SHOWS_SIZE=$(du -sh "$MEDIA_DIR/shows" 2>/dev/null | cut -f1)
    UPLOADS_SIZE=$(du -sh "$MEDIA_DIR/uploads" 2>/dev/null | cut -f1)

    echo "storage used:"
    echo "  total: $TOTAL_SIZE"
    echo "  movies: $MOVIES_SIZE"
    echo "  shows: $SHOWS_SIZE"
    echo "  uploads: $UPLOADS_SIZE"
    echo ""
fi

# disk space available
if command -v df &> /dev/null; then
    AVAILABLE=$(df -h "$MEDIA_DIR" | tail -1 | awk '{print $4}')
    echo "available space: $AVAILABLE"
    echo ""
fi

# largest files
echo "biggest files (top 5):"
find "$MEDIA_DIR" -type f \( -iname "*.mp4" -o -iname "*.mkv" -o -iname "*.avi" -o -iname "*.mov" -o -iname "*.webm" \) -exec du -h {} \; 2>/dev/null | sort -rh | head -5

echo ""
echo "📂 media directory: $MEDIA_DIR"
