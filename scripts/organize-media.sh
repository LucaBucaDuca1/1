#!/bin/bash

# simple script to help organize media files
# useful if you're moving a bunch of movies/shows at once
# - zeloz

echo "🎬 media organizer"
echo ""

# check if source directory is provided
if [ -z "$1" ]; then
    echo "usage: ./organize-media.sh /path/to/source/folder"
    echo ""
    echo "this will help you move files to the right places"
    echo ""
    echo "examples:"
    echo "  ./organize-media.sh ~/Downloads/movies"
    echo "  ./organize-media.sh /mnt/external/tv-shows"
    exit 1
fi

SOURCE_DIR="$1"
MEDIA_DIR="$(cd "$(dirname "$0")/.." && pwd)/server/media"

if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ source directory doesn't exist: $SOURCE_DIR"
    exit 1
fi

echo "source: $SOURCE_DIR"
echo "destination: $MEDIA_DIR"
echo ""

# count video files
VIDEO_COUNT=$(find "$SOURCE_DIR" -type f \( -iname "*.mp4" -o -iname "*.mkv" -o -iname "*.avi" -o -iname "*.mov" -o -iname "*.webm" \) | wc -l)

echo "found $VIDEO_COUNT video files"
echo ""

if [ $VIDEO_COUNT -eq 0 ]; then
    echo "no video files found in source directory"
    exit 0
fi

# ask what type of content
echo "what kind of content is this?"
echo "1) movies"
echo "2) tv shows"
echo "3) mixed (i'll sort them manually)"
read -p "choice (1-3): " CONTENT_TYPE

case $CONTENT_TYPE in
    1)
        DEST="$MEDIA_DIR/movies"
        echo ""
        echo "copying movies to $DEST"
        find "$SOURCE_DIR" -type f \( -iname "*.mp4" -o -iname "*.mkv" -o -iname "*.avi" -o -iname "*.mov" -o -iname "*.webm" \) -exec cp -v {} "$DEST/" \;
        ;;
    2)
        DEST="$MEDIA_DIR/shows"
        echo ""
        echo "preserving directory structure for tv shows"
        echo "copying to $DEST"
        rsync -av --include='*/' --include='*.mp4' --include='*.mkv' --include='*.avi' --include='*.mov' --include='*.webm' --exclude='*' "$SOURCE_DIR/" "$DEST/"
        ;;
    3)
        echo ""
        echo "okay, files are still in: $SOURCE_DIR"
        echo "manually copy them to:"
        echo "  movies: $MEDIA_DIR/movies"
        echo "  shows: $MEDIA_DIR/shows"
        ;;
    *)
        echo "invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ done!"
echo ""
echo "next steps:"
echo "1. go to the upload page in the web interface"
echo "2. add metadata for each video (title, description, etc)"
echo "3. link the database entries to the files you just copied"
echo ""
echo "or if you're brave, you can manually insert into the sqlite database"
