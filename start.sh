#!/bin/bash

# MediaFlix Quick Start Script

echo "🎬 MediaFlix - Starting your media server..."
echo ""

# Check if node_modules exists in server
if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing server dependencies..."
    cd server && npm install && cd ..
fi

# Check if node_modules exists in client
if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing client dependencies..."
    cd client && npm install && cd ..
fi

echo ""
echo "✅ Starting MediaFlix Server..."
echo "📡 Server: http://localhost:3001"
echo "🎨 Client: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start both server and client
npm run dev
