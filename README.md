# Aneesh Kumar Poddar // Cyber Security 3D Portfolio

An interactive, high-performance 3D offensive cyber security portfolio featuring a custom Three.js WebGL Cyber Skull biomechanical model, reactive lighting shaders, audited credential inspection viewer, and dark cyber-themed HUD aesthetics.

---

## ⚡ Key Highlights & Architecture

- **Real-Time 3D Cyber Skull Interface**: Built with Three.js, wireframe shader effects, dynamic mouse head tracking, and cinematic section camera waypoints.
- **Section Waypoint Transitions**: Smooth camera orbits and position interpolation synchronized with story chapters (Core, Arsenal, Projects, Credentials, Contact).
- **Interactive Lighting Matrix**: Switch between Neon Cyan, Crimson Void, and Matrix Emerald dynamic theme palettes with real-time bloom post-processing.
- **Audited Credential Lightbox**: High-resolution pre-rendered canvas document viewer with multi-page support and liquid glass zoom controls.
- **Neural Surge Overdrive**: Interactive button activating high-energy lighting bursts, audio blast synth, and direct uplink to [@cybersamuraiak](https://www.instagram.com/cybersamuraiak/) on Instagram.
- **Zero Heavy Dependencies**: Clean, optimized asset bundle (~79 MB total) ready for fast loading on GitHub Pages.

---

## 🛠️ Technology Stack

- **Core**: Vanilla JavaScript (ES6+ Modules), HTML5 Semantic Architecture
- **Graphics**: [Three.js](https://threejs.org/) (GLTFLoader, OrbitControls, EffectComposer, UnrealBloomPass)
- **Styling**: Vanilla CSS (Tailored HSL design tokens, Glassmorphism, Responsive Grid/Flexbox)
- **Document Rendering**: PDF.js & Retina High-DPI Page Canvas Manifest
- **Audio**: Web Audio API Procedural Synthesizer (zero external audio files)
- **Bundler & Dev Server**: [Vite](https://vitejs.dev/)

---

## 🚀 Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Preview production build locally**:
   ```bash
   npm run preview
   ```

---

## 🌐 Deploy to GitHub Pages

This repository is pre-configured with a **GitHub Actions CI/CD workflow** (`.github/workflows/deploy.yml`) that automatically builds and deploys your portfolio whenever you push to the `main` branch.

### Quick Setup:
1. Create a new GitHub repository (e.g., `portfolio` or `killer12161.github.io`).
2. Push this repository to GitHub:
   ```bash
   git remote add origin https://github.com/killer12161/<YOUR_REPO_NAME>.git
   git branch -M main
   git push -u origin main
   ```
3. In your GitHub repository settings:
   - Go to **Settings** → **Pages**
   - Under **Build and deployment** → **Source**, select **GitHub Actions**
4. Your site will automatically build and publish!

---

## 👤 Author

**Aneesh Kumar Poddar**  
- **Role**: Penetration Tester & Security Researcher  
- **GitHub**: [@killer12161](https://github.com/killer12161)  
- **LinkedIn**: [linkedin.com/in/aneesh-poddar-189aa328b](https://linkedin.com/in/aneesh-poddar-189aa328b)  
- **Instagram**: [@cybersamuraiak](https://www.instagram.com/cybersamuraiak/)  
- **Email**: aneeshpoddar63@gmail.com  
