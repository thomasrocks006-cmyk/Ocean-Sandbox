# 🚀 Ocean Sandbox 2.0 - RunPod Deployment Guide

Complete guide for deploying Ocean Sandbox to RunPod for high-performance GPU rendering.

---

## 📋 Prerequisites

1. **RunPod Account**: Sign up at [runpod.io](https://www.runpod.io/)
2. **Docker Hub Account**: (Optional) For custom image hosting
3. **Git Repository**: Push your code to GitHub/GitLab
4. **Credit**: ~$0.50-$2.00/hour depending on GPU tier

---

## 🎯 Why RunPod?

### **Advantages**:
✅ **High-end GPUs**: RTX 3090, 4090, A100, etc.  
✅ **4K Recording**: Render promotional footage at ultra settings  
✅ **Batch Processing**: Generate screenshots/videos in bulk  
✅ **Multi-GPU Testing**: Test performance across hardware configs  
✅ **Cloud Access**: Share demos without local setup  

### **When NOT to Use**:
❌ **Development**: Use local dev environment (free, faster iteration)  
❌ **Basic Testing**: Current laptop/PC is sufficient  
❌ **Cost-Sensitive**: $50-$200/month for regular use  

---

## 🏗️ Deployment Methods

### **Method 1: Simple Web Deployment (Recommended)**

Deploy as a static website - easiest and cheapest.

#### **Step 1: Build Locally**
```bash
cd /workspaces/Ocean-Sandbox
npm run build
```
This creates a `dist/` folder with optimized files (3.2MB).

#### **Step 2: Deploy to RunPod Web Hosting**

1. Go to RunPod Dashboard → **Serverless** → **New Endpoint**
2. Choose **Static Website** template
3. Upload `dist/` folder contents
4. Set environment:
   - **Memory**: 512MB (sufficient for static files)
   - **GPU**: None needed (browser does rendering)
5. Deploy → Get public URL

**Cost**: ~$0.05/hour active + $0.01/GB storage

---

### **Method 2: Docker Container (Full Control)**

For advanced features like server-side rendering or custom backend.

#### **Step 1: Build Docker Image**

We've included a `Dockerfile` in the repo. Build it:

```bash
cd /workspaces/Ocean-Sandbox

# Build the image
docker build -t ocean-sandbox:latest .

# Test locally first
docker run -p 8080:80 ocean-sandbox:latest

# Open http://localhost:8080 to verify
```

#### **Step 2: Push to Docker Hub**

```bash
# Login to Docker Hub
docker login

# Tag the image
docker tag ocean-sandbox:latest YOUR_USERNAME/ocean-sandbox:latest

# Push to registry
docker push YOUR_USERNAME/ocean-sandbox:latest
```

#### **Step 3: Deploy to RunPod**

1. Go to RunPod Dashboard → **Pods** → **Deploy**
2. Select GPU:
   - **Budget**: GTX 1080 Ti ($0.34/hr) - 60+ FPS
   - **Recommended**: RTX 3090 ($0.79/hr) - 120+ FPS, 4K ready
   - **Premium**: RTX 4090 ($1.39/hr) - Ultra settings, 8K
3. Configure:
   - **Docker Image**: `YOUR_USERNAME/ocean-sandbox:latest`
   - **Expose Ports**: `80/http`
   - **Volume**: None needed (stateless app)
   - **Environment Variables**: None required
4. Deploy → Wait 2-3 minutes
5. Access via **Connect** → **HTTP Service** URL

**Cost**: $0.34-$1.39/hour + $0.20/GB storage

---

### **Method 3: RunPod GPU Development Workspace**

For active development with GPU access (overkill for this project).

1. Dashboard → **Pods** → **GPU Development**
2. Select template: **VSCode + Node.js + GPU**
3. Choose GPU tier (RTX 3090 recommended)
4. Clone repo:
   ```bash
   git clone <your-repo-url>
   cd Ocean-Sandbox
   npm install
   npm run dev
   ```
5. Port forward 5173 → Access via RunPod URL

**Cost**: $0.79-$2.50/hour (expensive for dev work)

---

## 🎬 Use Case: 4K Marketing Video Recording

Perfect use of RunPod - record ultra-high quality footage for promotion.

### **Setup**:

1. Deploy via Method 2 (Docker)
2. Choose RTX 4090 pod
3. Access the deployed URL
4. Use browser dev tools:
   - Open Chrome DevTools (F12)
   - Console → Run:
     ```javascript
     // Set ultra-high resolution
     window.innerWidth = 3840;
     window.innerHeight = 2160;
     
     // Enable all atmospheric effects
     // (via Leva panel in-app)
     ```
5. Use OBS Studio or browser screen recorder
6. Record 2-5 minute demo
7. **Terminate pod immediately** to stop billing

**Total Cost**: ~$2-5 for 1-2 hours of recording/editing

---

## 📊 GPU Performance Benchmarks

| GPU Tier | Cost/Hour | FPS (1080p) | FPS (4K) | Recommended Use |
|----------|-----------|-------------|----------|-----------------|
| GTX 1080 Ti | $0.34 | 75-90 | 30-45 | Testing, basic demos |
| RTX 3070 | $0.54 | 110-130 | 50-65 | HD video recording |
| RTX 3090 | $0.79 | 140-160 | 80-100 | 4K recording, marketing |
| RTX 4090 | $1.39 | 180-240 | 120-144 | 8K, ultra settings |
| A100 (40GB) | $2.09 | 150-180 | 90-110 | Multi-instance, research |

*Ocean Sandbox 2.0 tested values with all effects enabled*

---

## 🔧 Configuration Tweaks

### **Optimize for RunPod**:

Edit `vite.config.ts` for production:

```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three-core': ['three'],
          'three-addons': ['@react-three/fiber', '@react-three/drei'],
          'physics': ['@react-three/rapier'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    host: '0.0.0.0', // Allow external access
    port: 80,
  }
});
```

### **Enable GPU Metrics**:

Add FPS counter to HUD (`src/components/UI/HUD.tsx`):

```tsx
const [fps, setFps] = useState(60);

useFrame(() => {
  setFps(Math.round(1 / state.clock.getDelta()));
});

// In JSX:
<div>FPS: {fps}</div>
```

---

## 💰 Cost Optimization

### **Free Alternatives** (for basic deployment):
1. **Vercel**: Free tier, 100GB bandwidth/month
   ```bash
   npm install -g vercel
   vercel deploy
   ```
   
2. **Netlify**: Free tier, drag-and-drop `dist/` folder
   - Go to [app.netlify.com](https://app.netlify.com)
   - Drag `dist/` folder
   - Instant deployment

3. **GitHub Pages**: Free, public repos only
   ```bash
   npm install -g gh-pages
   npm run build
   gh-pages -d dist
   ```

### **RunPod Cost Reduction**:
- ✅ Use **Spot Instances** (-70% cost, may interrupt)
- ✅ Auto-shutdown after 1 hour idle
- ✅ Only deploy during recording/testing sessions
- ✅ Use community cloud (cheaper than secure cloud)

---

## 🚀 Quick Start (5 Minutes)

### **Fastest Path to Live Demo**:

1. **Build**:
   ```bash
   npm run build
   ```

2. **Deploy to Vercel** (free):
   ```bash
   npx vercel --prod
   ```

3. **Share URL**:
   - Vercel gives you: `ocean-sandbox-xyz.vercel.app`
   - Share with anyone, no RunPod needed!

**Cost**: $0 (Vercel free tier)  
**Performance**: Great for demos, 60 FPS on viewer's GPU

---

## 🎥 Recording High-Quality Footage (RunPod Method)

### **Full Workflow**:

1. **Deploy to RunPod** (RTX 3090 pod, Method 2)
2. **Open in Chrome** on the pod
3. **Set Up Recording**:
   ```bash
   # SSH into pod
   apt-get update && apt-get install -y ffmpeg

   # Record desktop (Xvfb + FFmpeg)
   Xvfb :99 -screen 0 3840x2160x24 &
   export DISPLAY=:99
   
   # Start browser
   chromium-browser --no-sandbox http://localhost:80
   
   # Record with FFmpeg
   ffmpeg -video_size 3840x2160 -framerate 60 -f x11grab -i :99 \
          -c:v libx264 -preset ultrafast -crf 18 output.mp4
   ```

4. **Download Video**:
   ```bash
   # From local machine
   scp runpod-pod:/root/output.mp4 ./marketing-footage.mp4
   ```

5. **Terminate Pod** immediately

**Total Cost**: ~$3-5 for 2-3 hours of recording

---

## 🐛 Troubleshooting

### **Issue**: Models not loading on RunPod

**Fix**: Check CORS headers in `nginx.conf` (already added):
```nginx
add_header Access-Control-Allow-Origin "*";
```

### **Issue**: Low FPS on RunPod

**Fix**: Enable GPU acceleration in browser:
```bash
chromium-browser --enable-gpu-rasterization --enable-features=VaapiVideoDecoder
```

### **Issue**: Port 80 blocked

**Fix**: Use alternate port in Dockerfile:
```dockerfile
EXPOSE 8080
```
Then in nginx.conf: `listen 8080;`

---

## 📈 Scaling Strategy

### **For Production** (if launching publicly):

1. **CDN**: Use Cloudflare (free) to cache static assets
2. **Load Balancer**: Multiple RunPod instances behind Cloudflare
3. **Auto-Scaling**: RunPod Serverless scales automatically
4. **Monitoring**: Add Sentry.io for error tracking

**Estimated Cost** (1000 users/day):
- Cloudflare CDN: Free
- RunPod Serverless: ~$50-100/month
- Sentry: Free tier

---

## ✅ Deployment Checklist

Before deploying:

- [ ] Run `npm run build` successfully
- [ ] Test `dist/` folder locally (`npx serve dist`)
- [ ] Verify all models load (`/models/shark.glb`, `/models/human.glb`)
- [ ] Check bundle size (`ls -lh dist/assets/*.js`)
- [ ] Test on target GPU tier
- [ ] Set up auto-shutdown (RunPod settings)
- [ ] Document access URL for team
- [ ] Enable HTTPS (RunPod provides free SSL)

---

## 🎓 Recommended Approach

**For your use case** (Ocean Sandbox 2.0):

1. **Development**: Keep using local dev container (free, fast)
2. **Demo Sharing**: Deploy to Vercel (free, instant)
3. **Marketing Video**: Rent RTX 3090 RunPod for 2-3 hours ($2-4 total)
4. **Public Launch**: Vercel or Netlify (free tier handles 1000s of users)

**You DON'T need RunPod for regular use** - only for:
- High-end marketing footage (4K+)
- GPU performance testing
- Multi-GPU benchmarks

---

## 📞 Support

- RunPod Docs: [docs.runpod.io](https://docs.runpod.io)
- Ocean Sandbox Issues: GitHub repo issues
- Community: RunPod Discord

---

**Ready to deploy?** Start with Vercel (free) first, then try RunPod only if you need GPU-specific features!
