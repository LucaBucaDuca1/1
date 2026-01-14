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

REM Run the uploader (it will keep the window open on errors)
powershell -ExecutionPolicy Bypass -File "%~dp0HomeFlix-Uploader.ps1"

REM If we get here and there was an error, show a message
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ----------------------------------------
    echo The uploader closed with an error.
    echo If you didn't see an error message above, try running:
    echo   .\test-uploader.ps1
    echo to diagnose the issue.
    pause
)
