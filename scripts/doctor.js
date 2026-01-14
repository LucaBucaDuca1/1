const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏥 HomeFlix Doctor\n');

let hasErrors = false;

function check(name, fn) {
  process.stdout.write(`Checking ${name}... `);
  try {
    const result = fn();
    if (result === true) {
      console.log('✓');
    } else {
      console.log('✓', result);
    }
  } catch (error) {
    console.log('✗', error.message);
    hasErrors = true;
  }
}

check('Node.js version', () => {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0]);
  if (major < 16) {
    throw new Error(`Node ${version} is too old. Need 16+`);
  }
  return version;
});

check('npm', () => {
  try {
    const version = execSync('npm --version', { encoding: 'utf8' }).trim();
    return version;
  } catch {
    throw new Error('npm not found');
  }
});

check('ffmpeg (optional)', () => {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return 'installed';
  } catch {
    return 'not found (thumbnails disabled)';
  }
});

check('Port 3001 (server)', () => {
  try {
    const output = execSync('netstat -an 2>/dev/null || ss -an 2>/dev/null', { encoding: 'utf8' });
    if (output.includes(':3001')) {
      throw new Error('Port 3001 already in use');
    }
    return 'available';
  } catch (error) {
    if (error.message.includes('already in use')) {
      throw error;
    }
    return 'check skipped';
  }
});

check('Port 5173 (client)', () => {
  try {
    const output = execSync('netstat -an 2>/dev/null || ss -an 2>/dev/null', { encoding: 'utf8' });
    if (output.includes(':5173')) {
      throw new Error('Port 5173 already in use');
    }
    return 'available';
  } catch (error) {
    if (error.message.includes('already in use')) {
      throw error;
    }
    return 'check skipped';
  }
});

check('server/node_modules', () => {
  if (!fs.existsSync(path.join(__dirname, '../server/node_modules'))) {
    throw new Error('Run: npm run setup');
  }
  return true;
});

check('client/node_modules', () => {
  if (!fs.existsSync(path.join(__dirname, '../client/node_modules'))) {
    throw new Error('Run: npm run setup');
  }
  return true;
});

check('server/.env or env vars', () => {
  const envPath = path.join(__dirname, '../server/.env');
  if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8');
    if (env.includes('JWT_SECRET=your-secret-key')) {
      return 'found (change JWT_SECRET!)';
    }
    return 'found';
  }
  if (process.env.JWT_SECRET) {
    return 'env vars set';
  }
  return 'missing (optional)';
});

check('server/media directory', () => {
  const mediaPath = path.join(__dirname, '../server/media');
  if (!fs.existsSync(mediaPath)) {
    fs.mkdirSync(mediaPath, { recursive: true });
    return 'created';
  }
  return true;
});

console.log('\n' + (hasErrors ? '❌ Issues found. Fix them before running.' : '✅ All checks passed!'));
process.exit(hasErrors ? 1 : 0);
