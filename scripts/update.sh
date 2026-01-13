#!/bin/bash

###############################################################################
# MediaFlix Update Script
# Updates the application to the latest version
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                      ║${NC}"
echo -e "${BLUE}║         🔄  MediaFlix Update  🔄                    ║${NC}"
echo -e "${BLUE}║                                                      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# Create backup before update
echo -e "${BLUE}Creating backup before update...${NC}"
./scripts/backup.sh

# Pull latest changes
echo -e "${BLUE}Pulling latest changes...${NC}"
git pull

# Rebuild and restart services
echo -e "${BLUE}Rebuilding and restarting services...${NC}"
docker-compose down
docker-compose up -d --build

# Wait for services
echo -e "${BLUE}Waiting for services to be ready...${NC}"
sleep 5

# Check health
if docker-compose ps | grep -q "healthy"; then
    echo ""
    echo -e "${GREEN}✓ Update completed successfully!${NC}"
    echo -e "${BLUE}Services are running and healthy${NC}"
else
    echo ""
    echo -e "${YELLOW}⚠️  Update completed but health check is pending${NC}"
    echo -e "${BLUE}Check logs: docker-compose logs -f${NC}"
fi

# Show version
echo ""
echo -e "${BLUE}Current version:${NC}"
git log -1 --pretty=format:"%h - %s (%ar)" HEAD
echo ""
