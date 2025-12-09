#!/bin/bash

# Ocean Sandbox 2.0 - Quick Deploy Script
# Usage: ./deploy.sh [vercel|docker|runpod]

set -e

echo "🌊 Ocean Sandbox 2.0 - Deployment Script"
echo "========================================="

DEPLOY_METHOD=${1:-"vercel"}

case $DEPLOY_METHOD in
  "vercel")
    echo "📦 Building for Vercel..."
    npm run build
    
    echo "🚀 Deploying to Vercel..."
    npx vercel --prod
    
    echo "✅ Deployed to Vercel!"
    echo "Your app is live at the URL shown above"
    ;;
    
  "docker")
    echo "🐳 Building Docker image..."
    docker build -t ocean-sandbox:latest .
    
    echo "✅ Docker image built!"
    echo "Run locally: docker run -p 8080:80 ocean-sandbox:latest"
    echo "Push to registry: docker push YOUR_USERNAME/ocean-sandbox:latest"
    ;;
    
  "runpod")
    echo "☁️  Preparing for RunPod..."
    npm run build
    
    echo "🐳 Building Docker image..."
    docker build -t ocean-sandbox:latest .
    
    echo "📤 Push to Docker Hub:"
    echo "  1. docker login"
    echo "  2. docker tag ocean-sandbox:latest YOUR_USERNAME/ocean-sandbox:latest"
    echo "  3. docker push YOUR_USERNAME/ocean-sandbox:latest"
    echo ""
    echo "🚀 Then deploy on RunPod:"
    echo "  1. Go to runpod.io dashboard"
    echo "  2. Create new Pod with GPU"
    echo "  3. Use image: YOUR_USERNAME/ocean-sandbox:latest"
    echo "  4. Expose port 80"
    echo "  5. Access via HTTP Service URL"
    ;;
    
  *)
    echo "❌ Unknown deployment method: $DEPLOY_METHOD"
    echo "Usage: ./deploy.sh [vercel|docker|runpod]"
    exit 1
    ;;
esac

echo ""
echo "🎉 Deployment complete!"
