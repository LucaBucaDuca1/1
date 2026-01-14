@echo off
REM quick start for windows
REM - zeloz

echo.
echo firing up mediaflix...
echo.

REM install dependencies if needed
if not exist "server\node_modules" (
    echo first time setup - installing server stuff...
    cd server
    call npm install
    cd ..
)

if not exist "client\node_modules" (
    echo installing client stuff...
    cd client
    call npm install
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
