# Deploy Flutter WOE Dashboard to Vercel

## ✅ Yes, you can run this on Vercel!

Flutter web apps work perfectly on Vercel. Here are your deployment options:

## Option 1: Quick Deploy (Recommended)

### 1. **Build locally and deploy**
```bash
# In the flutter_woe directory
flutter build web --release --web-renderer html
```

### 2. **Deploy to Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (from flutter_woe directory)
vercel --prod
```

When prompted:
- **Set up and deploy**: Yes
- **Which scope**: Your account
- **Link to existing project**: No
- **Project name**: woe-dashboard (or your choice)
- **Directory**: `./build/web`
- **Override settings**: No

## Option 2: GitHub Integration (Automatic)

### 1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial Flutter WOE dashboard"
git branch -M main
git remote add origin https://github.com/yourusername/woe-flutter-dashboard.git
git push -u origin main
```

### 2. **Connect to Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Other
   - **Build Command**: `flutter build web --release --web-renderer html`
   - **Output Directory**: `build/web`
   - **Install Command**: `flutter pub get`

## Option 3: Manual Upload

### 1. **Build the project**
```bash
flutter build web --release
```

### 2. **Upload build/web folder**
- Zip the contents of `build/web/`
- Upload to Vercel dashboard
- Deploy

## Vercel Configuration

The included `vercel.json` handles:
- ✅ **Single Page App routing** (all routes → index.html)
- ✅ **Asset caching** (fonts, images cached for 1 year)
- ✅ **Proper MIME types** for Flutter web assets

## Environment Setup for Vercel

### If Vercel needs Flutter installed:

Add this to your `vercel.json`:
```json
{
  "functions": {
    "build/web/index.html": {
      "runtime": "@vercel/static-build"
    }
  },
  "build": {
    "env": {
      "FLUTTER_WEB": "true"
    }
  }
}
```

## Performance Optimizations

### 1. **Web Renderer Choice**
```bash
# HTML renderer (better compatibility, larger size)
flutter build web --web-renderer html

# CanvasKit renderer (better performance, smaller size)
flutter build web --web-renderer canvaskit
```

### 2. **Asset Optimization**
- Fonts are loaded from CDN (faster)
- Images are optimized for web
- Code splitting enabled

## Custom Domain

After deployment:
1. Go to Vercel dashboard
2. Select your project
3. Go to Settings → Domains
4. Add your custom domain

## Expected Performance

- **First Load**: ~2-3 seconds
- **Subsequent Loads**: ~0.5 seconds (cached)
- **Bundle Size**: ~2-4MB (typical Flutter web app)
- **Lighthouse Score**: 90+ (with proper optimization)

## Troubleshooting

### Build Fails?
```bash
# Clear Flutter cache
flutter clean
flutter pub get
flutter build web --release
```

### Assets Not Loading?
- Check `pubspec.yaml` asset paths
- Ensure fonts are in `assets/fonts/`
- Verify image URLs are accessible

### Routing Issues?
- The `vercel.json` handles SPA routing
- All routes redirect to `index.html`
- Flutter handles client-side routing

## Live Example

Once deployed, your app will be available at:
- `https://your-project-name.vercel.app`
- Or your custom domain

## Advantages of Flutter on Vercel

✅ **Global CDN**: Fast loading worldwide  
✅ **Automatic HTTPS**: Secure by default  
✅ **Zero config**: Works out of the box  
✅ **Preview deployments**: Test before going live  
✅ **Analytics**: Built-in performance monitoring  

Your pixel-perfect Flutter dashboard will run beautifully on Vercel!