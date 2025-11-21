# EC2 Troubleshooting Guide - No Output Image

This guide helps diagnose why visualization works locally but not on EC2.

## Quick Diagnostic Steps

### Step 1: Check Server Logs

```bash
# If using PM2
pm2 logs tile-try-on --lines 100

# If using systemd
sudo journalctl -u tile-try-on -n 100

# If running manually
tail -f server.log
```

**Look for:**
- `REPLICATE_API_TOKEN is not set` - Environment variable missing
- `Python script error` - Python execution failed
- `Cannot identify image file` - File path/permission issue
- `No result URL found` - Python script didn't complete

### Step 2: Verify Environment Variables

```bash
# Check if REPLICATE_API_TOKEN is set
echo $REPLICATE_API_TOKEN

# If using PM2, check environment
pm2 env 0

# If using .env file
cat .env | grep REPLICATE
```

**Fix if missing:**
```bash
# Set temporarily
export REPLICATE_API_TOKEN=your_token_here

# Or add to .env file
echo "REPLICATE_API_TOKEN=your_token_here" >> .env

# Or set in PM2 ecosystem file (see below)
```

### Step 3: Check Python Installation

```bash
# Check Python version
python3 --version  # Should be 3.8+

# Check if python3 command exists
which python3

# Test Python import
python3 -c "import replicate; print('OK')"
python3 -c "import PIL; print('OK')"
python3 -c "import requests; print('OK')"
```

**If imports fail, install dependencies:**
```bash
pip3 install -r requirements.txt
# Or if using virtual environment:
# source venv/bin/activate
# pip install -r requirements.txt
```

### Step 4: Check Directory Permissions

```bash
# Check if uploads directory exists and is writable
ls -la uploads/
ls -la public/

# Create directories if missing
mkdir -p uploads
mkdir -p public
chmod 755 uploads
chmod 755 public

# Check if server can write to these directories
touch uploads/test.txt && rm uploads/test.txt && echo "OK"
touch public/test.txt && rm public/test.txt && echo "OK"
```

### Step 5: Test Python Script Manually

Create a test script to verify Python can run:

```bash
# Create test script
cat > test_python.py << 'EOF'
import os
import sys

print("Python version:", sys.version)
print("REPLICATE_API_TOKEN set:", "REPLICATE_API_TOKEN" in os.environ)
print("Current directory:", os.getcwd())

try:
    import replicate
    print("✓ replicate module imported")
except ImportError as e:
    print("✗ replicate module not found:", e)

try:
    from PIL import Image
    print("✓ PIL module imported")
except ImportError as e:
    print("✗ PIL module not found:", e)

try:
    import requests
    print("✓ requests module imported")
except ImportError as e:
    print("✗ requests module not found:", e)
EOF

# Run test
python3 test_python.py
```

### Step 6: Check File Paths

The server uses absolute paths. Verify they work:

```bash
# Check current working directory
pwd

# Check if paths resolve correctly
node -e "const path = require('path'); console.log(path.resolve(process.cwd(), 'uploads'))"
```

### Step 7: Test API Endpoint Directly

```bash
# Test health endpoint
curl http://localhost:3003/health

# Test with a simple visualization request (if you have test files)
# This will show detailed error messages
```

## Common Issues and Solutions

### Issue 1: REPLICATE_API_TOKEN Not Set

**Symptoms:**
- Error: `REPLICATE_API_TOKEN is not set as an environment variable`
- No output image

**Solution:**

**Option A: Using .env file**
```bash
# Create .env file in project root
echo "REPLICATE_API_TOKEN=your_token_here" > .env
echo "PORT=3003" >> .env
echo "NODE_ENV=production" >> .env

# Make sure server.js loads .env (it should with dotenv.config())
```

**Option B: Using PM2 ecosystem file**
```bash
# Create ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'tile-try-on',
    script: 'server.js',
    cwd: '/path/to/your/app',
    env: {
      NODE_ENV: 'production',
      PORT: 3003,
      REPLICATE_API_TOKEN: 'your_token_here'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}
EOF

# Restart PM2
pm2 delete tile-try-on
pm2 start ecosystem.config.js
pm2 save
```

**Option C: Export in shell**
```bash
# Add to ~/.bashrc or ~/.profile
export REPLICATE_API_TOKEN=your_token_here
export PORT=3003

# Reload
source ~/.bashrc

# Restart server
pm2 restart tile-try-on
```

### Issue 2: Python Dependencies Not Installed

**Symptoms:**
- Error: `ModuleNotFoundError: No module named 'replicate'`
- Python script fails immediately

**Solution:**
```bash
# Install Python dependencies
pip3 install -r requirements.txt

# Or install individually
pip3 install replicate Pillow numpy transformers torch requests

# Verify installation
pip3 list | grep -E "replicate|Pillow|numpy|transformers|torch|requests"
```

**If permission errors:**
```bash
# Use --user flag
pip3 install --user -r requirements.txt

# Or use virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Issue 3: Python Command Not Found

**Symptoms:**
- Error: `python3: command not found`
- Server can't execute Python script

**Solution:**
```bash
# Find Python installation
which python3
which python

# If python3 not found, install it
sudo yum install python3  # Amazon Linux
sudo apt-get install python3  # Ubuntu

# Or create alias in server.js if needed
```

### Issue 4: File Permission Issues

**Symptoms:**
- Error: `EACCES: permission denied`
- Cannot write to uploads/ or public/ directories

**Solution:**
```bash
# Fix permissions
chmod 755 uploads
chmod 755 public
chmod 644 uploads/* 2>/dev/null || true
chmod 644 public/* 2>/dev/null || true

# If running as different user, check ownership
ls -la uploads/
ls -la public/

# Fix ownership if needed (replace 'ec2-user' with your user)
sudo chown -R ec2-user:ec2-user uploads/
sudo chown -R ec2-user:ec2-user public/
```

### Issue 5: Missing Directories

**Symptoms:**
- Error: `ENOENT: no such file or directory`
- Cannot create files

**Solution:**
```bash
# Create required directories
mkdir -p uploads
mkdir -p public
mkdir -p public/room_renders
mkdir -p public/room_renders/living-room
mkdir -p public/room_renders/kitchen
mkdir -p public/room_renders/bedroom
mkdir -p public/room_renders/bathroom

# Set permissions
chmod -R 755 uploads public
```

### Issue 6: Network/Firewall Issues

**Symptoms:**
- Python script hangs
- Cannot download images from Replicate
- Timeout errors

**Solution:**
```bash
# Test internet connectivity
curl https://api.replicate.com

# Check if outbound connections are allowed
# Check security group rules in AWS console
# Ensure port 443 (HTTPS) is allowed for outbound traffic
```

### Issue 7: Path Resolution Issues

**Symptoms:**
- Error: `Cannot identify image file`
- File paths with backslashes on Linux

**Solution:**
The code should handle this, but verify:
```bash
# Check if paths are correct
node -e "
const path = require('path');
const fs = require('fs');
console.log('CWD:', process.cwd());
console.log('__dirname equivalent:', __dirname);
console.log('uploads exists:', fs.existsSync('uploads'));
console.log('public exists:', fs.existsSync('public'));
"
```

## Enhanced Debugging

### Enable Verbose Logging

Add this to your server startup to see more details:

```bash
# Set debug mode
export NODE_ENV=development
export DEBUG=*

# Or in PM2 ecosystem file
env: {
  NODE_ENV: 'development',
  DEBUG: '*'
}
```

### Test Visualization Endpoint

Create a test script to call the API directly:

```bash
# test_api.sh
curl -X POST http://localhost:3003/api/visualize \
  -F "roomImage=@test_room.jpg" \
  -F "tileId=marble-tile" \
  -F "visualizationType=floor" \
  -v
```

## Step-by-Step Fix Checklist

Run through this checklist on your EC2 instance:

```bash
# 1. Verify you're in the right directory
pwd
ls -la

# 2. Check Node.js version
node --version  # Should be 18+

# 3. Check Python version
python3 --version  # Should be 3.8+

# 4. Verify environment variables
echo $REPLICATE_API_TOKEN
echo $PORT

# 5. Check Python dependencies
python3 -c "import replicate, PIL, requests; print('All OK')"

# 6. Check directory permissions
ls -la uploads/
ls -la public/

# 7. Check if server is running
ps aux | grep node
pm2 list

# 8. Check server logs
pm2 logs tile-try-on --lines 50

# 9. Test health endpoint
curl http://localhost:3003/health

# 10. Check file structure
tree -L 2 -I node_modules
```

## Still Not Working?

If none of the above works, collect this information:

```bash
# System info
uname -a
node --version
python3 --version
npm --version

# Environment
env | grep -E "REPLICATE|PORT|NODE"

# Dependencies
npm list --depth=0
pip3 list

# Permissions
ls -la
ls -la uploads/
ls -la public/

# Recent logs
pm2 logs tile-try-on --lines 200 > debug_logs.txt

# Server status
pm2 status
pm2 info tile-try-on
```

Share these details for further debugging.

