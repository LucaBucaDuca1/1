@echo off
echo.
echo firing up homeflix...
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not found!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo After installing, restart your terminal and try again.
    echo.
    pause
    exit /b 1
)

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm not found!
    echo.
    echo npm should come with Node.js. Try reinstalling Node.js.
    echo.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo first time setup - installing root dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ERROR: Failed to install root dependencies
        echo Try running: npm install
        echo.
        pause
        exit /b 1
    )
)

if not exist "server\node_modules" (
    echo installing server dependencies...
    cd server
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ERROR: Failed to install server dependencies
        echo Try: cd server && npm install
        echo.
        pause
        exit /b 1
    )
    cd ..
)

if not exist "client\node_modules" (
    echo installing client dependencies...
    cd client
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ERROR: Failed to install client dependencies
        echo Try: cd client && npm install
        echo.
        pause
        exit /b 1
    )
    cd ..
)

echo.
echo starting everything...
echo backend: http://localhost:3001
echo frontend: http://localhost:5173
echo.
echo hit ctrl+c to stop
echo.

npm run dev

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to start servers
    echo.
    echo Common fixes:
    echo 1. Check if ports 3001 and 5173 are available
    echo 2. Run: npm run doctor
    echo 3. See TROUBLESHOOTING.md for more help
    echo.
    pause
    exit /b 1
)
