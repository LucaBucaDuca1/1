# MediaFlix Installation Script for Windows
# PowerShell script for one-command installation

$ErrorActionPreference = "Stop"

# Colors for output
function Write-ColorMessage {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Header {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                                                      ║" -ForegroundColor Cyan
    Write-Host "║         🎬  MediaFlix Installation  🎬              ║" -ForegroundColor Cyan
    Write-Host "║                                                      ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

# Check if Docker is installed
function Test-Docker {
    Write-ColorMessage "Checking for Docker..." "Blue"
    try {
        $dockerVersion = docker --version
        Write-ColorMessage "✓ Docker found: $dockerVersion" "Green"
        return $true
    } catch {
        Write-ColorMessage "❌ Docker is not installed!" "Red"
        Write-ColorMessage "Please install Docker Desktop from: https://docs.docker.com/desktop/install/windows-install/" "Yellow"
        return $false
    }
}

# Check if Docker is running
function Test-DockerRunning {
    Write-ColorMessage "Checking if Docker is running..." "Blue"
    try {
        docker ps | Out-Null
        Write-ColorMessage "✓ Docker is running" "Green"
        return $true
    } catch {
        Write-ColorMessage "❌ Docker is not running!" "Red"
        Write-ColorMessage "Please start Docker Desktop and try again" "Yellow"
        return $false
    }
}

# Generate random JWT secret
function New-JWTSecret {
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::Create()
    $rng.GetBytes($bytes)
    return [Convert]::ToBase64String($bytes)
}

# Setup environment file
function Initialize-Environment {
    Write-ColorMessage "Setting up environment configuration..." "Blue"

    if (Test-Path ".env") {
        Write-ColorMessage "⚠️  .env file already exists. Skipping..." "Yellow"
    } else {
        Copy-Item ".env.example" ".env"

        # Generate secure JWT secret
        $jwtSecret = New-JWTSecret

        # Update .env file
        $content = Get-Content ".env"
        $content = $content -replace "change-this-to-a-random-secure-string-in-production", $jwtSecret
        $content | Set-Content ".env"

        Write-ColorMessage "✓ Environment file created with secure JWT secret" "Green"
    }
}

# Create required directories
function New-Directories {
    Write-ColorMessage "Creating required directories..." "Blue"

    $directories = @(
        "server\media",
        "server\data",
        "nginx\ssl"
    )

    foreach ($dir in $directories) {
        if (!(Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
    }

    Write-ColorMessage "✓ Directories created" "Green"
}

# Build and start services
function Start-Services {
    Write-ColorMessage "Building and starting services..." "Blue"
    Write-ColorMessage "This may take a few minutes on first run..." "Yellow"

    try {
        docker-compose up -d --build
        Write-ColorMessage "✓ Services started successfully!" "Green"
        return $true
    } catch {
        Write-ColorMessage "❌ Failed to start services" "Red"
        Write-ColorMessage "Error: $_" "Red"
        return $false
    }
}

# Wait for services to be healthy
function Wait-ForServices {
    Write-ColorMessage "Waiting for services to be ready..." "Blue"

    Write-Host "Checking health" -NoNewline

    for ($i = 0; $i -lt 30; $i++) {
        $status = docker-compose ps
        if ($status -match "healthy") {
            Write-Host ""
            Write-ColorMessage "✓ Services are healthy!" "Green"
            return $true
        }
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
    }

    Write-Host ""
    Write-ColorMessage "⚠️  Services started but health check timed out" "Yellow"
    Write-ColorMessage "Check 'docker-compose logs' for details" "Yellow"
    return $false
}

# Print success message
function Show-Success {
    Write-Host ""
    Write-ColorMessage "╔══════════════════════════════════════════════════════╗" "Green"
    Write-ColorMessage "║                                                      ║" "Green"
    Write-ColorMessage "║         ✨  Installation Complete!  ✨              ║" "Green"
    Write-ColorMessage "║                                                      ║" "Green"
    Write-ColorMessage "╚══════════════════════════════════════════════════════╝" "Green"
    Write-Host ""

    Write-ColorMessage "🌐 Access your MediaFlix server at:" "Blue"
    Write-ColorMessage "   Frontend: http://localhost:3000" "Green"
    Write-ColorMessage "   Backend:  http://localhost:3001" "Green"
    Write-Host ""

    Write-ColorMessage "👤 Demo Account Credentials:" "Blue"
    Write-ColorMessage "   Username: demo" "Green"
    Write-ColorMessage "   Password: demo123" "Green"
    Write-Host ""

    Write-ColorMessage "📝 Useful Commands:" "Blue"
    Write-ColorMessage "   View logs:        docker-compose logs -f" "Yellow"
    Write-ColorMessage "   Stop services:    docker-compose down" "Yellow"
    Write-ColorMessage "   Restart services: docker-compose restart" "Yellow"
    Write-ColorMessage "   Update services:  docker-compose up -d --build" "Yellow"
    Write-Host ""

    Write-ColorMessage "📁 Add your media files to: .\server\media\" "Blue"
    Write-Host ""
}

# Main installation flow
function Install-MediaFlix {
    Write-Header

    if (!(Test-Docker)) {
        exit 1
    }

    if (!(Test-DockerRunning)) {
        exit 1
    }

    Initialize-Environment
    New-Directories

    if (Start-Services) {
        Wait-ForServices
        Show-Success
    } else {
        Write-ColorMessage "Installation failed. Please check the error messages above." "Red"
        exit 1
    }
}

# Run installation
Install-MediaFlix
