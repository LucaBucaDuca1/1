#!/bin/bash

# quick start script for homeflix
# just run ./start.sh and everything should work
# - zeloz

echo "🎬 firing up homeflix..."
echo ""

# install stuff if needed
if [ ! -d "server/node_modules" ]; then
    echo "📦 first time setup - installing server dependencies..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 installing client dependencies..."
    cd client && npm install && cd ..
fi

echo ""
echo "✅ starting everything up..."
echo "📡 backend: http://localhost:3001"
echo "🎨 frontend: http://localhost:5173"
echo ""
echo "hit ctrl+c to stop"
echo ""

npm run dev
