@echo off
echo Running uploader diagnostics...
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0test-uploader.ps1"
pause
