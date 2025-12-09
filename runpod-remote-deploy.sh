#!/bin/bash
# Remote deployment script to paste into RunPod Web Terminal

set -e

echo "🌊 Ocean Sandbox 2.0 - Remote Deployment"
echo "=========================================="

# Install system dependencies
echo "📦 Installing system dependencies..."
apt-get update -qq
apt-get install -y -qq nginx curl wget git nodejs npm > /dev/null 2>&1

# Install Node.js 18 if needed
if ! node --version | grep -q "v18"; then
    echo "📥 Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - > /dev/null 2>&1
    apt-get install -y nodejs > /dev/null 2>&1
fi

echo "✅ Node.js $(node --version) ready"

# Setup workspace
cd /workspace
mkdir -p ocean-sandbox
cd ocean-sandbox

# Clone or download project
echo "📥 Downloading Ocean Sandbox..."
if [ ! -f "package.json" ]; then
    # Option 1: Download from a URL (you'll need to provide this)
    echo "Please provide download URL or use Option 2 below"
    
    # Option 2: Direct GitHub clone
    # git clone https://github.com/thomasrocks006-cmyk/Ocean-Sandbox.git .
    
    # Option 3: Create project files directly
    echo "Creating project structure..."
fi

# For now, let's create a minimal working setup
# The user will need to upload their files or clone from GitHub

cat > /tmp/instructions.txt << 'EOF'
🌊 OCEAN SANDBOX DEPLOYMENT - NEXT STEPS

You have 3 options to get your code onto RunPod:

OPTION 1: GitHub (Easiest)
--------------------------
1. Push your Ocean-Sandbox to GitHub if not already there
2. In RunPod web terminal, run:
   git clone https://github.com/YOUR_USERNAME/Ocean-Sandbox.git /workspace/ocean-sandbox
   cd /workspace/ocean-sandbox
   npm install
   npm run build

OPTION 2: Direct File Upload
-----------------------------
1. In RunPod, click "Upload Files" button
2. Upload: ocean-sandbox-full.tar.gz
3. In web terminal:
   cd /workspace
   tar -xzf ocean-sandbox-full.tar.gz -C ocean-sandbox
   cd ocean-sandbox
   npm install
   npm run build

OPTION 3: Jupyter Lab
---------------------
1. Access Jupyter Lab at: Port 8888 (from RunPod dashboard)
2. Use Jupyter's file browser to upload files
3. Open terminal in Jupyter and run build commands

After files are ready, run this to start the server:
----------------------------------------------------
cd /workspace/ocean-sandbox
npm install
npm run build

# Configure Nginx
cat > /etc/nginx/sites-available/default << 'NGINX'
server {
    listen 80 default_server;
    root /workspace/ocean-sandbox/dist;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location ~* \.(glb|fbx)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
    }
}
NGINX

service nginx restart

echo "✅ Ocean Sandbox is live at: http://213.173.107.105"
EOF

cat /tmp/instructions.txt

echo ""
echo "============================================"
echo "✨ Setup script ready!"
echo "============================================"
