# 🚀 Ocean Sandbox 2.0 - RunPod Quick Start

## Your RunPod Instance Details
- **IP Address**: 213.173.107.105
- **SSH Port**: 16864
- **HTTP Access**: Port 8888 (Jupyter Lab)
- **Pod ID**: en3nbh0wr6s143

## 🎯 Quick Deploy (3 Commands)

### Option 1: Upload Project Files via SCP (Recommended)
```bash
# 1. Create tarball of project (run locally)
cd /workspaces/Ocean-Sandbox
tar -czf ocean-sandbox-full.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='*.log' \
    .

# 2. Upload to RunPod (run locally)
scp -P 16864 -i ~/.ssh/id_ed25519 \
    ocean-sandbox-full.tar.gz \
    root@213.173.107.105:/workspace/

# 3. SSH into RunPod and deploy
ssh root@213.173.107.105 -p 16864 -i ~/.ssh/id_ed25519
```

### Once Connected to RunPod:
```bash
# Extract project
cd /workspace
tar -xzf ocean-sandbox-full.tar.gz -C ocean-sandbox
cd ocean-sandbox

# Run setup script
chmod +x runpod-setup.sh
./runpod-setup.sh
```

## 🌐 Access Your App

**After deployment completes:**
1. Open browser: `http://213.173.107.105`
2. Your Ocean Sandbox will load at max quality!

**Note**: If port 80 is blocked, use the HTTP service:
- RunPod provides a proxied domain on port 8888
- Check your RunPod dashboard for the exact URL

## 📊 Expected Performance

### On RunPod GPU (likely A4000/A5000/3090):
- **1080p**: 120-140 FPS
- **1440p**: 90-110 FPS
- **4K**: 80-100 FPS

### Features Running at Full Quality:
✅ Volumetric God Rays (no performance mode)  
✅ Procedural Caustics (full resolution)  
✅ Marine Snow (1000+ particles)  
✅ Bubbles (dynamic)  
✅ 65,536 vertex ocean mesh  
✅ Photorealistic 13MB Shark Model  
✅ 12MB Human Model with animations  

## 🎮 Testing Checklist

Once deployed, test these features:

### Visual Quality
- [ ] God rays shine through waves (volumetric lighting)
- [ ] Caustics dance on ocean floor (procedural)
- [ ] Shark model is photorealistic (not placeholder)
- [ ] Human model swims/treads smoothly
- [ ] Marine snow drifts naturally
- [ ] Bubbles rise from human

### Performance
- [ ] Open browser DevTools → Performance Monitor
- [ ] Check FPS counter (should be 90+)
- [ ] Move camera around (smooth motion)
- [ ] No stuttering or lag

### Controls
- [ ] Left-click drag: Orbit camera
- [ ] Scroll wheel: Zoom in/out
- [ ] Leva panel (right side): Adjust parameters
- [ ] Try disabling effects to see FPS impact

## 🎥 Optional: Record 4K Demo

If you want to capture footage:

```bash
# Inside RunPod
apt-get install -y ffmpeg x11vnc xvfb chromium-browser

# Start virtual display
Xvfb :99 -screen 0 3840x2160x24 &
export DISPLAY=:99

# Launch Chrome in headless mode
chromium-browser --headless --disable-gpu \
    --screenshot=ocean-sandbox-4k.png \
    --window-size=3840,2160 \
    http://localhost

# Or use OBS Studio for video recording
```

## 🛑 Remember to Stop Your Pod!

**Cost**: ~$0.79/hour  
**To stop**: Go to RunPod dashboard → Stop Pod

Don't let it run overnight! Set a timer if needed.

## 🔧 Troubleshooting

### Port 80 Access Issues
If `http://213.173.107.105` doesn't work:

1. Check RunPod HTTP services tab for proxied URL
2. Modify nginx to listen on port 8888:
```bash
sed -i 's/listen 80/listen 8888/g' /etc/nginx/sites-available/ocean-sandbox
service nginx restart
```
3. Access via: `http://213.173.107.105:8888`

### Models Not Loading
```bash
# Verify models are in dist/
ls -lh /workspace/ocean-sandbox/dist/models/
# Should show: shark.glb (13M), human.glb (12M), Swimming.fbx (3.3M), TreadingWater.fbx (1M)

# Check nginx logs
tail -f /var/log/nginx/error.log
```

### Low FPS on RunPod
```bash
# Check GPU utilization
nvidia-smi

# Should show GPU usage ~70-90%
# If 0%, Chrome might not be using GPU acceleration
```

### Build Fails
```bash
# Clear npm cache and retry
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📱 Share Your Results!

Once working:
1. Take screenshots with Leva panel visible
2. Note FPS in top-left
3. Compare with your local PC performance
4. You can then deploy to Vercel for permanent hosting

## 🎯 Next Steps After Testing

### If Everything Looks Great:
1. Stop RunPod instance (save money)
2. Deploy to Vercel for free permanent hosting:
   - `cd /workspaces/Ocean-Sandbox`
   - `vercel --prod` (or use website)
3. Share Vercel URL with others!

### If You Need Adjustments:
1. Keep RunPod running
2. Make changes locally in VS Code
3. Re-upload with SCP (step 2 above)
4. Rebuild with `npm run build`
5. Nginx will serve updated files

## 💡 Performance Comparison

| Location | Hardware | Expected FPS |
|----------|----------|-------------|
| Your PC (Low-end) | Integrated/Old GPU | 25-40 FPS |
| RunPod | RTX 3090/A5000 | 120-140 FPS |
| Viewer on Mid-range PC | GTX 1660 / RX 580 | 60-75 FPS |
| Viewer on High-end PC | RTX 4070+ | 100-140 FPS |

**Key Insight**: Vercel hosting allows viewers to render at THEIR hardware's capability. Your low-end PC becomes irrelevant once deployed!

---

**Ready to deploy?** Run the commands in Option 1 above! 🚀
