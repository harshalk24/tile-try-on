# EC2 Deployment Guide

This guide covers deploying the updated code to your EC2 instance.

## Prerequisites

- SSH access to your EC2 instance
- Git repository access
- Node.js and npm installed on EC2
- Python 3.x installed on EC2
- Process manager (PM2, systemd, or similar) for running the application

## Deployment Steps

### Step 1: Commit and Push Changes to Git

First, ensure all your local changes are committed and pushed to your Git repository:

```bash
# Check current status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Update: Fix room type selection, thumbnail handling, and image caching"

# Push to remote repository
git push origin main
```

### Step 2: SSH into Your EC2 Instance

```bash
ssh -i your-key.pem ec2-user@your-ec2-ip-address
# Or if using ubuntu:
ssh -i your-key.pem ubuntu@your-ec2-ip-address
```

### Step 3: Navigate to Your Application Directory

```bash
cd /path/to/your/application
# Example: cd /home/ec2-user/tile-try-on
```

### Step 4: Pull Latest Changes from Git

```bash
# Fetch latest changes
git fetch origin

# Pull latest code
git pull origin main

# Verify you're on the latest commit
git log -1
```

### Step 5: Install/Update Dependencies

```bash
# Install/update Node.js dependencies
npm install

# Install/update Python dependencies (if requirements.txt exists)
pip3 install -r requirements.txt --upgrade
```

### Step 6: Build the Frontend

```bash
# Build the React frontend (creates dist/ folder)
npm run build

# Verify dist folder was created
ls -la dist/
```

### Step 7: Set Environment Variables (if needed)

Make sure your environment variables are set. Check if you have a `.env` file or set them in your process manager:

```bash
# Check if .env file exists
cat .env

# Or set environment variables (example)
export REPLICATE_API_TOKEN=your_token_here
export PORT=3003
export NODE_ENV=production
```

**Important Environment Variables:**
- `REPLICATE_API_TOKEN` - Your Replicate API token
- `PORT` - Server port (default: 3003)
- `NODE_ENV` - Set to `production` for production

### Step 8: Restart the Application

The method depends on how you're running the application:

#### Option A: Using PM2 (Recommended)

```bash
# Stop the current process
pm2 stop tile-try-on
# Or: pm2 stop all

# Restart with new code
pm2 restart tile-try-on
# Or: pm2 restart all

# Check status
pm2 status

# View logs
pm2 logs tile-try-on
```

#### Option B: Using systemd

```bash
# Restart the service
sudo systemctl restart tile-try-on

# Check status
sudo systemctl status tile-try-on

# View logs
sudo journalctl -u tile-try-on -f
```

#### Option C: Manual Process (Not Recommended for Production)

```bash
# Find and kill the existing process
ps aux | grep node
kill -9 <process_id>

# Start the server
nohup node server.js > server.log 2>&1 &
```

### Step 9: Verify Deployment

1. **Check if the server is running:**
   ```bash
   curl http://localhost:3003/health
   ```

2. **Check server logs:**
   ```bash
   # PM2
   pm2 logs tile-try-on --lines 50
   
   # systemd
   sudo journalctl -u tile-try-on -n 50
   
   # Manual
   tail -f server.log
   ```

3. **Test the application:**
   - Visit your EC2 public IP or domain
   - Test the visualization functionality
   - Verify the new changes are working

### Step 10: Clean Up Old Files (Optional)

The application now automatically cleans up old `temp_resized_*.jpg` files, but you can manually clean them:

```bash
# Remove old temp files (older than 1 hour)
find public/ -name "temp_resized_*.jpg" -mtime +0 -delete

# Or remove all temp files (be careful!)
# rm public/temp_resized_*.jpg
```

## Troubleshooting

### Issue: Changes not reflected

1. **Clear browser cache** - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
2. **Check if build completed** - Verify `dist/` folder exists and has recent files
3. **Check server logs** - Look for errors in PM2/systemd logs
4. **Verify git pull** - Make sure you pulled the latest code

### Issue: Server won't start

1. **Check Node.js version:**
   ```bash
   node --version  # Should be v18 or higher
   ```

2. **Check Python version:**
   ```bash
   python3 --version  # Should be 3.8 or higher
   ```

3. **Check dependencies:**
   ```bash
   npm list --depth=0
   pip3 list
   ```

4. **Check port availability:**
   ```bash
   netstat -tulpn | grep 3003
   ```

### Issue: Environment variables not set

1. **Check .env file:**
   ```bash
   cat .env
   ```

2. **Set in PM2 ecosystem file:**
   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'tile-try-on',
       script: 'server.js',
       env: {
         REPLICATE_API_TOKEN: 'your_token',
         PORT: 3003,
         NODE_ENV: 'production'
       }
     }]
   }
   ```

3. **Restart PM2:**
   ```bash
   pm2 restart tile-try-on --update-env
   ```

## Quick Deployment Script

You can create a deployment script for faster deployments:

```bash
#!/bin/bash
# deploy.sh

echo "Starting deployment..."

# Pull latest code
git pull origin main

# Install dependencies
npm install

# Build frontend
npm run build

# Restart application
pm2 restart tile-try-on

echo "Deployment complete!"
```

Make it executable:
```bash
chmod +x deploy.sh
```

Run it:
```bash
./deploy.sh
```

## Important Notes

1. **Always backup before deployment:**
   ```bash
   # Create a backup
   cp -r /path/to/app /path/to/app.backup.$(date +%Y%m%d)
   ```

2. **Test in staging first** (if you have a staging environment)

3. **Monitor logs** after deployment to catch any issues early

4. **Keep environment variables secure** - Never commit `.env` files to git

5. **The application serves static files from `dist/`** - Make sure `npm run build` completes successfully

## Post-Deployment Checklist

- [ ] Code pulled from git
- [ ] Dependencies installed
- [ ] Frontend built successfully (`dist/` folder exists)
- [ ] Environment variables set correctly
- [ ] Server restarted
- [ ] Health check passes (`/health` endpoint)
- [ ] Application accessible via browser
- [ ] Visualization functionality works
- [ ] New features (room type selection, thumbnail) working correctly
- [ ] No errors in server logs

