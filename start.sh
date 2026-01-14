#!/bin/bash

echo "🎬 firing up homeflix..."
echo ""

if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js not found!"
    echo ""
    echo "Please install Node.js from: https://nodejs.org/"
    echo "Or use a package manager:"
    echo "  - Mac: brew install node"
    echo "  - Ubuntu/Debian: sudo apt install nodejs npm"
    echo ""
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ ERROR: npm not found!"
    echo ""
    echo "npm should come with Node.js. Try reinstalling Node.js."
    echo ""
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "📦 first time setup - installing root dependencies..."
    npm install || {
        echo ""
        echo "❌ ERROR: Failed to install root dependencies"
        echo "Try running: npm install"
        echo ""
        exit 1
    }
fi

if [ ! -d "server/node_modules" ]; then
    echo "📦 installing server dependencies..."
    cd server && npm install && cd .. || {
        echo ""
        echo "❌ ERROR: Failed to install server dependencies"
        echo "Try: cd server && npm install"
        echo ""
        exit 1
    }
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 installing client dependencies..."
    cd client && npm install && cd .. || {
        echo ""
        echo "❌ ERROR: Failed to install client dependencies"
        echo "Try: cd client && npm install"
        echo ""
        exit 1
    }
fi

echo ""
echo "✅ starting everything up..."
echo "📡 backend: http://localhost:3001"
echo "🎨 frontend: http://localhost:5173"
echo ""
echo "hit ctrl+c to stop"
echo ""

npm run dev || {
    echo ""
    echo "❌ ERROR: Failed to start servers"
    echo ""
    echo "Common fixes:"
    echo "1. Check if ports 3001 and 5173 are available"
    echo "2. Run: npm run doctor"
    echo "3. See TROUBLESHOOTING.md for more help"
    echo ""
    exit 1
}
