# Simple diagnostic script to test what's failing

$ErrorActionPreference = "Stop"

Write-Host "========================================"
Write-Host "HomeFlix Uploader Diagnostic Test"
Write-Host "========================================"
Write-Host ""

# Test 1: PowerShell version
Write-Host "[1/6] Checking PowerShell version..."
Write-Host "Version: $($PSVersionTable.PSVersion)"
Write-Host ""

# Test 2: Assembly loading
Write-Host "[2/6] Testing Windows Forms assembly..."
try {
    Add-Type -AssemblyName System.Windows.Forms
    Write-Host "SUCCESS: System.Windows.Forms loaded"
} catch {
    Write-Host "FAILED: $($_.Exception.Message)"
    Write-Host ""
    Write-Host "This means .NET Framework is missing or too old."
    Write-Host "Download: https://dotnet.microsoft.com/download/dotnet-framework/net48"
    pause
    exit 1
}
Write-Host ""

# Test 3: Drawing assembly
Write-Host "[3/6] Testing System.Drawing assembly..."
try {
    Add-Type -AssemblyName System.Drawing
    Write-Host "SUCCESS: System.Drawing loaded"
} catch {
    Write-Host "FAILED: $($_.Exception.Message)"
    pause
    exit 1
}
Write-Host ""

# Test 4: Check directories
Write-Host "[4/6] Checking directory structure..."
$SERVER_PATH = Join-Path $PSScriptRoot "server"
Write-Host "Script location: $PSScriptRoot"
Write-Host "Looking for: $SERVER_PATH"

if (Test-Path $SERVER_PATH) {
    Write-Host "SUCCESS: Server folder found"
} else {
    Write-Host "FAILED: Server folder not found!"
    Write-Host ""
    Write-Host "The uploader must be run from the HomeFlix root directory."
    Write-Host "Expected structure:"
    Write-Host "  HomeFlix/"
    Write-Host "  +-- HomeFlix-Uploader.ps1"
    Write-Host "  +-- server/"
    Write-Host "      +-- media/"
    Write-Host ""
    Write-Host "Current location: $PSScriptRoot"
    pause
    exit 1
}
Write-Host ""

# Test 5: Try creating a simple form
Write-Host "[5/6] Testing form creation..."
try {
    $testForm = New-Object System.Windows.Forms.Form
    $testForm.Text = "Test"
    $testForm.Size = New-Object System.Drawing.Size(300,200)
    Write-Host "SUCCESS: Form created (not showing it)"
    $testForm.Dispose()
} catch {
    Write-Host "FAILED: $($_.Exception.Message)"
    Write-Host ""
    Write-Host "Stack trace:"
    Write-Host $_.Exception.StackTrace
    pause
    exit 1
}
Write-Host ""

# Test 6: Write permissions
Write-Host "[6/6] Testing write permissions..."
$testFile = Join-Path $SERVER_PATH "test-write-permission.tmp"
try {
    "test" | Out-File $testFile -ErrorAction Stop
    Remove-Item $testFile -ErrorAction Stop
    Write-Host "SUCCESS: Write permissions OK"
} catch {
    Write-Host "FAILED: No write permissions"
    Write-Host "Error: $($_.Exception.Message)"
}
Write-Host ""

Write-Host "========================================"
Write-Host "All tests passed!"
Write-Host "The uploader should work. Try running:"
Write-Host "  .\HomeFlix-Uploader.ps1"
Write-Host "========================================"
Write-Host ""

pause
