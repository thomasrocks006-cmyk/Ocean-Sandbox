# 🌊 Ocean Sandbox - RunPod Web Terminal Deployment
# Copy and paste these commands directly into RunPod's Web Terminal

## Step 1: Enable Web Terminal
1. Go to your RunPod dashboard
2. Find your pod: **en3nbh0wr6s143-64410fdb**
3. Click "Enable web terminal" button
4. Click "Connect" to open terminal in browser

## Step 2: Paste These Commands

```bash
# Navigate to workspace
cd /workspace

# Install dependencies
apt-get update && apt-get install -y nginx git curl

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Verify installation
node --version
npm --version

# Clone your repository (replace with your actual repo URL)
git clone https://github.com/thomasrocks006-cmyk/Ocean-Sandbox.git ocean-sandbox

# If repo is private, you'll need to use a token:
# git clone https://YOUR_TOKEN@github.com/thomasrocks006-cmyk/Ocean-Sandbox.git ocean-sandbox

cd ocean-sandbox

# Install project dependencies
npm install

# Build production bundle
npm run build

# Configure Nginx
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
    
    # Cache static assets
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
    
    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }
}
ENDNGINX

# Start Nginx
service nginx restart

# Check status
service nginx status

echo ""
echo "✅ Ocean Sandbox is LIVE!"
echo "🌐 Access at: http://213.173.107.105"
echo ""
```

## Step 3: Access Your App

Open browser: **http://213.173.107.105**

## Alternative: If GitHub Repo Doesn't Exist Yet

If you haven't pushed to GitHub, use Jupyter Lab to upload files:

### Option A: Create GitHub Repo First
1. Go to https://github.com/new
2. Name: `Ocean-Sandbox`
3. Make public (easier) or private (need token)
4. In VS Code terminal:
```bash
cd /workspaces/Ocean-Sandbox
git remote add origin https://github.com/YOUR_USERNAME/Ocean-Sandbox.git
git add .
git commit -m "Initial commit - Ocean Sandbox 2.0"
git push -u origin main
```
5. Then use the git clone command in RunPod

### Option B: Use Jupyter Lab Upload
1. Access Jupyter Lab: Click "Jupyter Lab" under HTTP services in RunPod
2. Use file browser (left side) to create folder: `/workspace/ocean-sandbox`
3. Click upload button, select all your files EXCEPT:
   - node_modules/
   - .git/
   - dist/
   - *.log files
4. Once uploaded, open terminal in Jupyter and run:
```bash
cd /workspace/ocean-sandbox
npm install
npm run build
# Then run the Nginx configuration commands above
```

### Option C: Copy-Paste Code Files
If you have just a few files, you can create them manually in RunPod:

1. In RunPod web terminal:
```bash
cd /workspace
mkdir -p ocean-sandbox
cd ocean-sandbox
```

2. Create each file using `cat`:
```bash
cat > package.json << 'EOF'
[paste your package.json content here]
EOF

cat > vite.config.ts << 'EOF'
[paste your vite.config.ts content here]
EOF

# Repeat for other files...
```

## Troubleshooting

### Port 80 Not Accessible
If http://213.173.107.105 doesn't work, try:
```bash
# Change Nginx to port 8888
sed -i 's/listen 80/listen 8888/g' /etc/nginx/sites-available/default
service nginx restart
```
Then access: `http://213.173.107.105:8888`

### Models Not Loading
```bash
# Check if models exist
ls -lh /workspace/ocean-sandbox/dist/models/

# Should show:
# shark.glb (13M)
# human.glb (12M)
# Swimming.fbx (3.3M)
# TreadingWater.fbx (1.0M)
```

### Build Errors
```bash
# Clear and reinstall
cd /workspace/ocean-sandbox
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 🎯 Which Option Should You Use?

**Easiest**: Option A (GitHub) - Just 2 commands  
**Fastest**: Option B (Jupyter Lab) - Drag & drop files  
**Most Control**: Option C (Manual) - For small projects

**I recommend Option A** - Push to GitHub then clone. Takes 2 minutes total!
