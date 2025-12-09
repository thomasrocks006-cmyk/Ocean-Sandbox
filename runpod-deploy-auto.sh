#!/bin/bash
# Ocean Sandbox Auto-Deploy for RunPod
# This script runs entirely on RunPod - just wget and execute

set -e

echo "🌊 Ocean Sandbox 2.0 - Auto Deploy"
echo "===================================="
echo ""

# Navigate to workspace
cd /workspace

# Install dependencies
echo "📦 Installing system dependencies..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq nginx git curl wget

# Install Node.js 18
echo "📥 Installing Node.js 18..."
if ! command -v node &> /dev/null || ! node --version | grep -q "v18"; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - > /dev/null 2>&1
    apt-get install -y -qq nodejs
fi

echo "✅ Node.js $(node --version) installed"
echo "✅ npm $(npm --version) installed"

# Clone repository
echo "📥 Cloning Ocean Sandbox from GitHub..."
if [ -d "ocean-sandbox" ]; then
    echo "   Removing old installation..."
    rm -rf ocean-sandbox
fi

git clone --depth 1 https://github.com/thomasrocks006-cmyk/Ocean-Sandbox.git ocean-sandbox
cd ocean-sandbox

# Install dependencies
echo "📦 Installing npm dependencies (this takes ~1 minute)..."
npm install --silent --no-progress

# Build production bundle
echo "🔨 Building production bundle (this takes ~1 minute)..."
npm run build

# Configure Nginx
echo "🌐 Configuring Nginx web server..."
cat > /etc/nginx/sites-available/default << 'ENDNGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    root /workspace/ocean-sandbox/dist;
    index index.html;
    
    server_name _;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/javascript application/json application/xml+rss 
               image/x-icon;
    
    # Cache static assets aggressively
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|glb|fbx)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Models directory with CORS
    location /models/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
    }
    
    # SPA fallback routing
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}
ENDNGINX

# Test and start Nginx
nginx -t
service nginx restart

echo ""
echo "✅ =========================================="
echo "✅  OCEAN SANDBOX IS LIVE!"
echo "✅ =========================================="
echo ""
echo "🌐 Access your app at:"
echo "   http://213.173.107.105"
echo ""
echo "📊 Expected Performance:"
echo "   • 120-140 FPS @ 1080p"
echo "   • 90-110 FPS @ 1440p"
echo "   • 80-100 FPS @ 4K"
echo ""
echo "🎮 Features Enabled:"
echo "   ✓ Volumetric God Rays"
echo "   ✓ Procedural Caustics"
echo "   ✓ Photorealistic Shark Model (13MB)"
echo "   ✓ Animated Human Model (12MB)"
echo "   ✓ Marine Snow & Bubbles"
echo "   ✓ Gerstner Waves"
echo ""
echo "💰 Cost: ~\$0.79/hour"
echo "🛑 REMEMBER TO STOP YOUR POD WHEN DONE!"
echo ""
