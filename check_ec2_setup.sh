#!/bin/bash

echo "=========================================="
echo "EC2 Setup Diagnostic Script"
echo "=========================================="
echo ""

# Check Node.js
echo "1. Checking Node.js..."
if command -v node &> /dev/null; then
    echo "   ✓ Node.js version: $(node --version)"
else
    echo "   ✗ Node.js not found!"
fi
echo ""

# Check Python
echo "2. Checking Python..."
if command -v python3 &> /dev/null; then
    echo "   ✓ Python3 version: $(python3 --version)"
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    echo "   ✓ Python version: $(python --version)"
    PYTHON_CMD="python"
else
    echo "   ✗ Python not found!"
    PYTHON_CMD=""
fi
echo ""

# Check Environment Variables
echo "3. Checking Environment Variables..."
if [ -z "$REPLICATE_API_TOKEN" ]; then
    echo "   ✗ REPLICATE_API_TOKEN not set"
else
    echo "   ✓ REPLICATE_API_TOKEN is set (length: ${#REPLICATE_API_TOKEN})"
fi

if [ -z "$PORT" ]; then
    echo "   ⚠ PORT not set (will use default: 3003)"
else
    echo "   ✓ PORT is set: $PORT"
fi
echo ""

# Check Python Dependencies
echo "4. Checking Python Dependencies..."
if [ ! -z "$PYTHON_CMD" ]; then
    $PYTHON_CMD -c "import replicate" 2>/dev/null && echo "   ✓ replicate" || echo "   ✗ replicate (missing)"
    $PYTHON_CMD -c "from PIL import Image" 2>/dev/null && echo "   ✓ Pillow" || echo "   ✗ Pillow (missing)"
    $PYTHON_CMD -c "import numpy" 2>/dev/null && echo "   ✓ numpy" || echo "   ✗ numpy (missing)"
    $PYTHON_CMD -c "import requests" 2>/dev/null && echo "   ✓ requests" || echo "   ✗ requests (missing)"
else
    echo "   ⚠ Cannot check (Python not found)"
fi
echo ""

# Check Directories
echo "5. Checking Required Directories..."
[ -d "uploads" ] && echo "   ✓ uploads/ exists" || echo "   ✗ uploads/ missing"
[ -d "public" ] && echo "   ✓ public/ exists" || echo "   ✗ public/ missing"
[ -d "public/room_renders" ] && echo "   ✓ public/room_renders/ exists" || echo "   ✗ public/room_renders/ missing"
echo ""

# Check Directory Permissions
echo "6. Checking Directory Permissions..."
[ -w "uploads" ] && echo "   ✓ uploads/ is writable" || echo "   ✗ uploads/ is not writable"
[ -w "public" ] && echo "   ✓ public/ is writable" || echo "   ✗ public/ is not writable"
echo ""

# Check if server is running
echo "7. Checking Server Status..."
if command -v pm2 &> /dev/null; then
    PM2_STATUS=$(pm2 list 2>/dev/null | grep -i "tile-try-on\|tile\|server" || echo "")
    if [ ! -z "$PM2_STATUS" ]; then
        echo "   ✓ PM2 process found:"
        pm2 list | grep -E "tile|server" || true
    else
        echo "   ⚠ No PM2 process found for tile-try-on"
    fi
else
    echo "   ⚠ PM2 not installed (checking process manually)"
    ps aux | grep -E "node.*server\.js" | grep -v grep && echo "   ✓ Node server process found" || echo "   ✗ No server process found"
fi
echo ""

# Check Node Dependencies
echo "8. Checking Node Dependencies..."
if [ -d "node_modules" ]; then
    echo "   ✓ node_modules/ exists"
    [ -d "node_modules/express" ] && echo "   ✓ express installed" || echo "   ✗ express missing"
    [ -d "node_modules/multer" ] && echo "   ✓ multer installed" || echo "   ✗ multer missing"
else
    echo "   ✗ node_modules/ missing (run: npm install)"
fi
echo ""

# Check if dist folder exists (for production build)
echo "9. Checking Frontend Build..."
if [ -d "dist" ]; then
    echo "   ✓ dist/ folder exists"
    [ -f "dist/index.html" ] && echo "   ✓ dist/index.html exists" || echo "   ✗ dist/index.html missing"
else
    echo "   ⚠ dist/ folder missing (run: npm run build)"
fi
echo ""

# Test Health Endpoint
echo "10. Testing Health Endpoint..."
if command -v curl &> /dev/null; then
    HEALTH_RESPONSE=$(curl -s http://localhost:3003/health 2>/dev/null)
    if [ ! -z "$HEALTH_RESPONSE" ]; then
        echo "   ✓ Health endpoint responded: $HEALTH_RESPONSE"
    else
        echo "   ✗ Health endpoint not responding (server may not be running)"
    fi
else
    echo "   ⚠ curl not available (cannot test endpoint)"
fi
echo ""

# Check .env file
echo "11. Checking .env file..."
if [ -f ".env" ]; then
    echo "   ✓ .env file exists"
    grep -q "REPLICATE_API_TOKEN" .env && echo "   ✓ REPLICATE_API_TOKEN found in .env" || echo "   ✗ REPLICATE_API_TOKEN not in .env"
else
    echo "   ⚠ .env file not found"
fi
echo ""

echo "=========================================="
echo "Diagnostic Complete"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "1. Fix any ✗ errors above"
echo "2. Check server logs: pm2 logs tile-try-on"
echo "3. Try generating a visualization and check logs"
echo ""

