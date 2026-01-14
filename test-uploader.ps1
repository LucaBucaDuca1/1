# Simple diagnostic script to test what's failing

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "HomeFlix Uploader Diagnostic Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: PowerShell version
Write-Host "[1/6] Checking PowerShell version..." -ForegroundColor Yellow
Write-Host "Version: $($PSVersionTable.PSVersion)" -ForegroundColor Green
Write-Host ""

# Test 2: Assembly loading
Write-Host "[2/6] Testing Windows Forms assembly..." -ForegroundColor Yellow
try {
    Add-Type -AssemblyName System.Windows.Forms
    Write-Host "SUCCESS: System.Windows.Forms loaded" -ForegroundColor Green
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "This means .NET Framework is missing or too old." -ForegroundColor Red
    Write-Host "Download: https://dotnet.microsoft.com/download/dotnet-framework/net48" -ForegroundColor Yellow
    pause
    exit 1
}
Write-Host ""

# Test 3: Drawing assembly
Write-Host "[3/6] Testing System.Drawing assembly..." -ForegroundColor Yellow
try {
    Add-Type -AssemblyName System.Drawing
    Write-Host "SUCCESS: System.Drawing loaded" -ForegroundColor Green
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    pause
    exit 1
}
Write-Host ""

# Test 4: Check directories
Write-Host "[4/6] Checking directory structure..." -ForegroundColor Yellow
$SERVER_PATH = Join-Path $PSScriptRoot "server"
Write-Host "Script location: $PSScriptRoot" -ForegroundColor Gray
Write-Host "Looking for: $SERVER_PATH" -ForegroundColor Gray

if (Test-Path $SERVER_PATH) {
    Write-Host "SUCCESS: Server folder found" -ForegroundColor Green
} else {
    Write-Host "FAILED: Server folder not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "The uploader must be run from the HomeFlix root directory." -ForegroundColor Yellow
    Write-Host "Expected structure:" -ForegroundColor Yellow
    Write-Host "  HomeFlix/" -ForegroundColor Gray
    Write-Host "  ├── HomeFlix-Uploader.ps1" -ForegroundColor Gray
    Write-Host "  └── server/" -ForegroundColor Gray
    Write-Host "      └── media/" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Current location: $PSScriptRoot" -ForegroundColor Gray
    pause
    exit 1
}
Write-Host ""

# Test 5: Try creating a simple form
Write-Host "[5/6] Testing form creation..." -ForegroundColor Yellow
try {
    $testForm = New-Object System.Windows.Forms.Form
    $testForm.Text = "Test"
    $testForm.Size = New-Object System.Drawing.Size(300,200)
    Write-Host "SUCCESS: Form created (not showing it)" -ForegroundColor Green
    $testForm.Dispose()
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Stack trace:" -ForegroundColor Yellow
    Write-Host $_.Exception.StackTrace -ForegroundColor Gray
    pause
    exit 1
}
Write-Host ""

# Test 6: Write permissions
Write-Host "[6/6] Testing write permissions..." -ForegroundColor Yellow
$testFile = Join-Path $SERVER_PATH "test-write-permission.tmp"
try {
    "test" | Out-File $testFile -ErrorAction Stop
    Remove-Item $testFile -ErrorAction Stop
    Write-Host "SUCCESS: Write permissions OK" -ForegroundColor Green
} catch {
    Write-Host "FAILED: No write permissions" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "All tests passed!" -ForegroundColor Green
Write-Host "The uploader should work. Try running:" -ForegroundColor Yellow
Write-Host "  .\HomeFlix-Uploader.ps1" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

pause
