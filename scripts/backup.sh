#!/bin/bash

###############################################################################
# MediaFlix Backup Script
# Creates backups of database and media files
###############################################################################

set -e

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_BACKUP="$BACKUP_DIR/database_$DATE.sql"
MEDIA_BACKUP="$BACKUP_DIR/media_$DATE.tar.gz"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Starting backup...${NC}"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup database
echo -e "${BLUE}Backing up database...${NC}"
if docker-compose ps | grep -q "server.*Up"; then
    docker-compose exec -T server sqlite3 /app/data/database.sqlite .dump > "$DB_BACKUP"
    echo -e "${GREEN}✓ Database backed up to: $DB_BACKUP${NC}"
else
    echo -e "${RED}❌ Server container is not running!${NC}"
    exit 1
fi

# Backup media files
echo -e "${BLUE}Backing up media files...${NC}"
if [ -d "server/media" ] && [ "$(ls -A server/media)" ]; then
    tar -czf "$MEDIA_BACKUP" server/media/
    echo -e "${GREEN}✓ Media files backed up to: $MEDIA_BACKUP${NC}"
else
    echo -e "${BLUE}No media files to backup${NC}"
fi

# Show backup size
echo ""
echo -e "${GREEN}Backup completed!${NC}"
echo -e "Database backup size: $(du -h "$DB_BACKUP" | cut -f1)"
if [ -f "$MEDIA_BACKUP" ]; then
    echo -e "Media backup size: $(du -h "$MEDIA_BACKUP" | cut -f1)"
fi

# Clean old backups (keep last 7 days)
echo ""
echo -e "${BLUE}Cleaning old backups (keeping last 7 days)...${NC}"
find "$BACKUP_DIR" -name "database_*.sql" -mtime +7 -delete
find "$BACKUP_DIR" -name "media_*.tar.gz" -mtime +7 -delete
echo -e "${GREEN}✓ Old backups cleaned${NC}"
