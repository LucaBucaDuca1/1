#!/bin/bash

###############################################################################
# MediaFlix Installation Script
# One-command installation for the complete media server
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored message
print_message() {
    echo -e "${2}${1}${NC}"
}

print_header() {
    echo ""
    echo "╔══════════════════════════════════════════════════════╗"
    echo "║                                                      ║"
    echo "║         🎬  MediaFlix Installation  🎬              ║"
    echo "║                                                      ║"
    echo "╚══════════════════════════════════════════════════════╝"
    echo ""
}

# Check if Docker is installed
check_docker() {
    print_message "Checking for Docker..." "$BLUE"
    if ! command -v docker &> /dev/null; then
        print_message "❌ Docker is not installed!" "$RED"
        print_message "Please install Docker from: https://docs.docker.com/get-docker/" "$YELLOW"
        exit 1
    fi
    print_message "✓ Docker found" "$GREEN"
}

# Check if Docker Compose is installed
check_docker_compose() {
    print_message "Checking for Docker Compose..." "$BLUE"
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_message "❌ Docker Compose is not installed!" "$RED"
        print_message "Please install Docker Compose from: https://docs.docker.com/compose/install/" "$YELLOW"
        exit 1
    fi
    print_message "✓ Docker Compose found" "$GREEN"
}

# Generate random JWT secret
generate_jwt_secret() {
    if command -v openssl &> /dev/null; then
        openssl rand -base64 32
    else
        cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1
    fi
}

# Setup environment file
setup_env() {
    print_message "Setting up environment configuration..." "$BLUE"

    if [ -f .env ]; then
        print_message "⚠️  .env file already exists. Skipping..." "$YELLOW"
    else
        cp .env.example .env

        # Generate secure JWT secret
        JWT_SECRET=$(generate_jwt_secret)

        # Update .env file
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/change-this-to-a-random-secure-string-in-production/$JWT_SECRET/" .env
        else
            # Linux
            sed -i "s/change-this-to-a-random-secure-string-in-production/$JWT_SECRET/" .env
        fi

        print_message "✓ Environment file created with secure JWT secret" "$GREEN"
    fi
}

# Create required directories
create_directories() {
    print_message "Creating required directories..." "$BLUE"
    mkdir -p server/media
    mkdir -p server/data
    mkdir -p nginx/ssl
    print_message "✓ Directories created" "$GREEN"
}

# Build and start services
start_services() {
    print_message "Building and starting services..." "$BLUE"
    print_message "This may take a few minutes on first run..." "$YELLOW"

    docker-compose up -d --build

    print_message "✓ Services started successfully!" "$GREEN"
}

# Wait for services to be healthy
wait_for_services() {
    print_message "Waiting for services to be ready..." "$BLUE"

    echo -n "Checking health"
    for i in {1..30}; do
        if docker-compose ps | grep -q "healthy"; then
            echo ""
            print_message "✓ Services are healthy!" "$GREEN"
            return 0
        fi
        echo -n "."
        sleep 2
    done

    echo ""
    print_message "⚠️  Services started but health check timed out" "$YELLOW"
    print_message "Check 'docker-compose logs' for details" "$YELLOW"
}

# Print success message with instructions
print_success() {
    echo ""
    print_message "╔══════════════════════════════════════════════════════╗" "$GREEN"
    print_message "║                                                      ║" "$GREEN"
    print_message "║         ✨  Installation Complete!  ✨              ║" "$GREEN"
    print_message "║                                                      ║" "$GREEN"
    print_message "╚══════════════════════════════════════════════════════╝" "$GREEN"
    echo ""

    print_message "🌐 Access your MediaFlix server at:" "$BLUE"
    print_message "   Frontend: http://localhost:3000" "$GREEN"
    print_message "   Backend:  http://localhost:3001" "$GREEN"
    echo ""

    print_message "👤 Demo Account Credentials:" "$BLUE"
    print_message "   Username: demo" "$GREEN"
    print_message "   Password: demo123" "$GREEN"
    echo ""

    print_message "📝 Useful Commands:" "$BLUE"
    print_message "   View logs:        docker-compose logs -f" "$YELLOW"
    print_message "   Stop services:    docker-compose down" "$YELLOW"
    print_message "   Restart services: docker-compose restart" "$YELLOW"
    print_message "   Update services:  docker-compose up -d --build" "$YELLOW"
    echo ""

    print_message "📁 Add your media files to: ./server/media/" "$BLUE"
    echo ""
}

# Main installation flow
main() {
    print_header

    check_docker
    check_docker_compose
    setup_env
    create_directories
    start_services
    wait_for_services
    print_success
}

# Run main function
main
