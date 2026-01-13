@echo off
REM MediaFlix Quick Start Script for Windows

echo.
echo ==============================================
echo    MediaFlix - Starting your media server
echo ==============================================
echo.

REM Check if server dependencies are installed
if not exist "server\node_modules" (
    echo Installing server dependencies...
    cd server
    call npm install
    cd ..
)

REM Check if client dependencies are installed
if not exist "client\node_modules" (
    echo Installing client dependencies...
    cd client
    call npm install
    cd ..
)

echo.
echo Starting MediaFlix Server...
echo Server: http://localhost:3001
echo Client: http://localhost:5173
echo.
echo Press Ctrl+C to stop
echo.

REM Start both server and client
npm run dev
