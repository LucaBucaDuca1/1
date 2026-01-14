@echo off
echo ========================================
echo HomeFlix Uploader Launcher
echo ========================================
echo.

REM Check if PowerShell is available
where powershell >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PowerShell not found!
    echo PowerShell is required to run the uploader.
    echo.
    pause
    exit /b 1
)

echo Checking PowerShell execution policy...
powershell -Command "Get-ExecutionPolicy" > temp_policy.txt
set /p POLICY=<temp_policy.txt
del temp_policy.txt

echo Current policy: %POLICY%
echo.

if /i "%POLICY%"=="Restricted" (
    echo WARNING: Execution policy is Restricted!
    echo The uploader cannot run with this policy.
    echo.
    echo Do you want to set it to RemoteSigned? (Y/N)
    set /p RESPONSE=
    if /i "%RESPONSE%"=="Y" (
        echo Setting execution policy...
        powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force"
        echo Policy updated!
        echo.
    ) else (
        echo Cannot continue with Restricted policy.
        echo.
        echo To fix manually, run PowerShell as Admin and execute:
        echo Set-ExecutionPolicy RemoteSigned
        echo.
        pause
        exit /b 1
    )
)

echo Launching HomeFlix Uploader...
echo.
echo If you see errors, they will be displayed below:
echo ----------------------------------------
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0HomeFlix-Uploader.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ----------------------------------------
    echo ERROR: Uploader failed to start!
    echo Error code: %ERRORLEVEL%
    echo.
    echo Common fixes:
    echo 1. Make sure .NET Framework 4.5+ is installed
    echo 2. Run as Administrator if you get permission errors
    echo 3. Check that HomeFlix-Uploader.ps1 exists in this folder
    echo.
)

pause
