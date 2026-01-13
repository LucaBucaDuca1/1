#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('\n🎬 Starting MediaFlix Server...\n');

const serverPath = path.join(__dirname, '..', 'server');

// Start the server
const serverProcess = spawn('npm', ['start'], {
  cwd: serverPath,
  stdio: 'inherit',
  shell: true
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Server exited with code ${code}`);
    process.exit(code);
  }
});

// Handle termination
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down MediaFlix Server...\n');
  serverProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  serverProcess.kill('SIGTERM');
  process.exit(0);
});

console.log('✅ MediaFlix Server is starting...');
console.log('📡 Server will be available at: http://localhost:3001');
console.log('🎨 Frontend can be run separately with: cd client && npm run dev');
console.log('\nPress Ctrl+C to stop the server\n');
