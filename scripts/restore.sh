#!/bin/bash

###############################################################################
# MediaFlix Restore Script
# Restores database and media files from backup
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${RED}Usage: $0 <database_backup.sql> [media_backup.tar.gz]${NC}"
    echo ""
    echo "Available backups:"
    ls -lh backups/ 2>/dev/null || echo "No backups found"
    exit 1
fi

DB_BACKUP="$1"
MEDIA_BACKUP="$2"

# Confirm restore
echo -e "${YELLOW}⚠️  WARNING: This will replace current data!${NC}"
echo -e "${YELLOW}Database backup: $DB_BACKUP${NC}"
if [ -n "$MEDIA_BACKUP" ]; then
    echo -e "${YELLOW}Media backup: $MEDIA_BACKUP${NC}"
fi
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${BLUE}Restore cancelled${NC}"
    exit 0
fi

# Stop services
echo -e "${BLUE}Stopping services...${NC}"
docker-compose down

# Restore database
echo -e "${BLUE}Restoring database...${NC}"
if [ -f "$DB_BACKUP" ]; then
    # Backup current database
    if [ -f "server/data/database.sqlite" ]; then
        mv server/data/database.sqlite "server/data/database.sqlite.backup.$(date +%Y%m%d_%H%M%S)"
    fi

    # Create new database from backup
    sqlite3 server/data/database.sqlite < "$DB_BACKUP"
    echo -e "${GREEN}✓ Database restored${NC}"
else
    echo -e "${RED}❌ Database backup file not found: $DB_BACKUP${NC}"
    exit 1
fi

# Restore media files
if [ -n "$MEDIA_BACKUP" ] && [ -f "$MEDIA_BACKUP" ]; then
    echo -e "${BLUE}Restoring media files...${NC}"

    # Backup current media
    if [ -d "server/media" ] && [ "$(ls -A server/media)" ]; then
        mv server/media "server/media.backup.$(date +%Y%m%d_%H%M%S)"
    fi

    # Extract media backup
    tar -xzf "$MEDIA_BACKUP"
    echo -e "${GREEN}✓ Media files restored${NC}"
fi

# Start services
echo -e "${BLUE}Starting services...${NC}"
docker-compose up -d

echo ""
echo -e "${GREEN}✓ Restore completed successfully!${NC}"
echo -e "${BLUE}Services are starting up...${NC}"
