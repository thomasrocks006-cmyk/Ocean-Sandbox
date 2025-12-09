#!/bin/bash
# Quick deploy to RunPod - Run this from your LOCAL machine (not in dev container)

echo "🌊 Ocean Sandbox 2.0 - RunPod Deployment Helper"
echo "================================================"
echo ""
echo "📋 Your RunPod Details:"
echo "   IP: 213.173.107.105"
echo "   Port: 16864"
echo "   User: root"
echo ""

# Check if running in dev container
if [ -f "/.dockerenv" ]; then
    echo "⚠️  WARNING: You're running this inside a dev container!"
    echo "   This script uploads files from your LOCAL machine."
    echo ""
    echo "📝 Copy these commands and run them in your HOST terminal:"
    echo ""
    echo "# 1. Navigate to project directory"
    echo "cd ~/path/to/Ocean-Sandbox"
    echo ""
    echo "# 2. Upload project files to RunPod"
    echo "scp -P 16864 -i ~/.ssh/id_ed25519 \\"
    echo "    ocean-sandbox-full.tar.gz \\"
    echo "    root@213.173.107.105:/workspace/"
    echo ""
    echo "# 3. Upload setup script"
    echo "scp -P 16864 -i ~/.ssh/id_ed25519 \\"
    echo "    runpod-setup.sh \\"
    echo "    root@213.173.107.105:/workspace/"
    echo ""
    echo "# 4. Connect to RunPod"
    echo "ssh root@213.173.107.105 -p 16864 -i ~/.ssh/id_ed25519"
    echo ""
    echo "# 5. Once connected, run these commands:"
    echo "cd /workspace"
    echo "mkdir -p ocean-sandbox"
    echo "tar -xzf ocean-sandbox-full.tar.gz -C ocean-sandbox"
    echo "cd ocean-sandbox"
    echo "chmod +x runpod-setup.sh"
    echo "./runpod-setup.sh"
    echo ""
    exit 0
fi

# If running on host, proceed with deployment
echo "Step 1: Uploading project files to RunPod..."
scp -P 16864 -i ~/.ssh/id_ed25519 \
    ocean-sandbox-full.tar.gz \
    root@213.173.107.105:/workspace/

if [ $? -ne 0 ]; then
    echo "❌ Upload failed! Check your SSH key and RunPod status."
    exit 1
fi

echo "✅ Project files uploaded!"
echo ""

echo "Step 2: Uploading setup script..."
scp -P 16864 -i ~/.ssh/id_ed25519 \
    runpod-setup.sh \
    root@213.173.107.105:/workspace/

echo "✅ Setup script uploaded!"
echo ""

echo "Step 3: Connecting to RunPod and deploying..."
echo ""

# SSH and run deployment
ssh root@213.173.107.105 -p 16864 -i ~/.ssh/id_ed25519 << 'ENDSSH'
cd /workspace
mkdir -p ocean-sandbox
echo "📦 Extracting project files..."
tar -xzf ocean-sandbox-full.tar.gz -C ocean-sandbox
cd ocean-sandbox
chmod +x runpod-setup.sh
echo "🚀 Running setup script..."
./runpod-setup.sh
ENDSSH

echo ""
echo "✨ Deployment complete!"
echo ""
echo "🌐 Access your app at: http://213.173.107.105"
echo ""
echo "🛑 Remember to STOP your RunPod instance when done!"
echo "   Cost: ~$0.79/hour"
echo ""
