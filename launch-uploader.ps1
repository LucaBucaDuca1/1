# Launcher wrapper for HomeFlix Uploader
# Handles errors and keeps window open for debugging

$ErrorActionPreference = "Stop"

Write-Host "========================================"
Write-Host "HomeFlix Uploader Launcher"
Write-Host "========================================"
Write-Host ""

# Check assemblies
Write-Host "Checking system..."
try {
    Add-Type -AssemblyName System.Windows.Forms -ErrorAction Stop
    Add-Type -AssemblyName System.Drawing -ErrorAction Stop
    Write-Host "  Windows Forms: OK"
} catch {
    Write-Host ""
    Write-Host "ERROR: Cannot load Windows Forms"
    Write-Host $_.Exception.Message
    Write-Host ""
    Write-Host "Install .NET Framework 4.8 from:"
    Write-Host "https://dotnet.microsoft.com/download/dotnet-framework/net48"
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Check directory
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$SERVER_PATH = Join-Path $SCRIPT_DIR "server"

if (-not (Test-Path $SERVER_PATH)) {
    Write-Host ""
    Write-Host "ERROR: Server folder not found"
    Write-Host "Looking for: $SERVER_PATH"
    Write-Host "Current location: $SCRIPT_DIR"
    Write-Host ""
    Write-Host "Make sure you run this from the HomeFlix root folder"
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host "  Server folder: OK"
Write-Host ""
Write-Host "Launching uploader..."
Write-Host ""

# Run the actual uploader
try {
    & "$SCRIPT_DIR\HomeFlix-Uploader.ps1"
} catch {
    Write-Host ""
    Write-Host "========================================"
    Write-Host "ERROR: Uploader crashed"
    Write-Host "========================================"
    Write-Host ""
    Write-Host $_.Exception.Message
    Write-Host ""
    if ($_.Exception.StackTrace) {
        Write-Host "Stack trace:"
        Write-Host $_.Exception.StackTrace
        Write-Host ""
    }
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}
