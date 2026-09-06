import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const BASE = import.meta.env.BASE_URL || './';
const resolveAsset = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  const cleanPath = path.replace(/^\/+/, '');
  const cleanBase = BASE.endsWith('/') ? BASE : BASE + '/';
  return `${cleanBase}${cleanPath}`;
};

/* ==========================================================================
   CYBERNETIC AUDIO SYNTHESIZER (WEB AUDIO API)
   Zero external audio assets required - fully procedural sound effects
   ========================================================================== */

class CyberAudio {
  constructor() {
    this.enabled = false;
  }
  init() {}
  toggle() { return false; }
  playBeep() {}
  playOverdriveBlast() {}
}

const audio = new CyberAudio();

/* ==========================================================================
   APPLICATION STATE
   ========================================================================== */

const state = {
  isLoaded: false,
  freeOrbitMode: false,
  isWireframe: true,
  activeTheme: 'neon',
  currentSection: 0,
  targetScrollProgress: 0,
  currentScrollProgress: 0,
  mouseX: 0,
  mouseY: 0,
  targetMouseX: 0,
  targetMouseY: 0,
  isOverdriveActive: false,
  overdriveIntensity: 0
};

// Theme Lighting Configurations
const THEMES = {
  neon: {
    keyColor: 0x00f0ff,
    rimColor: 0xff0055,
    accentColor: 0x9d4edd,
    bgColor: 0x07090e,
    particleColor: 0x00f0ff
  },
  crimson: {
    keyColor: 0xff1a40,
    rimColor: 0xffb703,
    accentColor: 0xd90429,
    bgColor: 0x0d0407,
    particleColor: 0xff1a40
  },
  matrix: {
    keyColor: 0x00ff66,
    rimColor: 0x00e5a3,
    accentColor: 0x10b981,
    bgColor: 0x040b07,
    particleColor: 0x00ff66
  }
};

/* ==========================================================================
   SCENIC CAMERA WAYPOINTS (PER SECTION)
   Defines the camera position, look-at target, and model orientation
   ========================================================================== */

const WAYPOINTS = [
  // 0: Hero / Core - Skull midline aligned with user red line marker, tilted in opposite direction
  {
    camPos: new THREE.Vector3(-0.36, 0.05, 2.65),
    target: new THREE.Vector3(-0.34, 0.03, 0),
    modelRot: new THREE.Vector3(0.04, -0.22, 0)
  },
  // 1: Technical Arsenal & Skills - Skull perfectly centered in the left circled region with clean margins
  {
    camPos: new THREE.Vector3(0.76, 0.02, 2.55),
    target: new THREE.Vector3(0.72, 0.00, 0),
    modelRot: new THREE.Vector3(0.06, 0.20, 0)
  },
  // 2: Featured Operations & Projects - Zoomed in near-side profile looking directly at projects
  {
    camPos: new THREE.Vector3(-1.10, 0.06, 2.05),
    target: new THREE.Vector3(-0.90, 0.03, 0),
    modelRot: new THREE.Vector3(0.10, -1.05, 0)
  },
  // 3: Verified Credentials - Zoomed in near-side profile on opposite (left) side, spinning into place looking at credentials card
  {
    camPos: new THREE.Vector3(1.10, 0.06, 2.05),
    target: new THREE.Vector3(0.90, 0.03, 0),
    modelRot: new THREE.Vector3(0.10, -5.233, 0)
  },
  // 4: Communication & Overdrive Terminal - Close-up on skull zoomed out slightly and tilted upward
  {
    camPos: new THREE.Vector3(-0.52, 0.02, 1.88),
    target: new THREE.Vector3(-0.48, 0.00, 0),
    modelRot: new THREE.Vector3(-0.12, -6.38, 0)
  }
];

/* ==========================================================================
   THREE.JS SETUP & POSTPROCESSING BLOOM
   ========================================================================== */

const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x07090e, 0.12);

// Camera Setup
const camera = new THREE.PerspectiveCamera(
  42,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.copy(WAYPOINTS[0].camPos);

// WebGL Renderer Setup
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// Postprocessing EffectComposer with UnrealBloomPass for refined cyber glow
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.42, // Refined cyber bloom - eliminates harsh blinding flare
  0.3,  // Focused glow radius
  0.84  // Threshold: triggers only high-contrast cyber lines
);
composer.addPass(bloomPass);

// OrbitControls (Disabled by default, enabled when user toggles Free Look)
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 6.0;
controls.minDistance = 1.2;
controls.enablePan = false;
controls.enabled = false; // off initially for scroll experience

/* ==========================================================================
   DYNAMIC CYBERPUNK LIGHTING (BALANCED NEON MATRIX)
   ========================================================================== */

const ambientLight = new THREE.AmbientLight(0x182436, 1.6);
scene.add(ambientLight);

// Key Directional Light (Cyan) - Balanced intensity
const keyLight = new THREE.DirectionalLight(THEMES.neon.keyColor, 3.0);
keyLight.position.set(-3.5, 3.0, 3.5);
scene.add(keyLight);

// Rim Light (Neon Magenta) - Sleek accent highlights along wireframe contours
const rimLight = new THREE.DirectionalLight(THEMES.neon.rimColor, 3.6);
rimLight.position.set(3.5, 2.5, -2.5);
scene.add(rimLight);

// Bottom Accent Light (Deep Purple)
const bottomLight = new THREE.PointLight(THEMES.neon.accentColor, 1.6, 14);
bottomLight.position.set(0, -3.2, 1.8);
scene.add(bottomLight);

// Interactive Cursor Spotlight
const cursorLight = new THREE.PointLight(THEMES.neon.keyColor, 1.5, 10);
cursorLight.position.set(0, 0, 2.5);
scene.add(cursorLight);

/* ==========================================================================
   3D FLOATING HOLOGRAPHIC PARTICLES
   ========================================================================== */

const particleCount = 1400;
const particleGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const particleScales = new Float32Array(particleCount);

for (let i = 0; i < particleCount * 3; i += 3) {
  particlePositions[i] = (Math.random() - 0.5) * 14;
  particlePositions[i + 1] = (Math.random() - 0.5) * 14;
  particlePositions[i + 2] = (Math.random() - 0.5) * 10;
  particleScales[i / 3] = Math.random() * 0.8 + 0.2;
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
particleGeometry.setAttribute('scale', new THREE.BufferAttribute(particleScales, 1));

// Particle Texture
const createParticleTexture = () => {
  const pCanvas = document.createElement('canvas');
  pCanvas.width = 32;
  pCanvas.height = 32;
  const ctx = pCanvas.getContext('2d');
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.3, 'rgba(0,240,255,0.8)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(pCanvas);
};

const particleMaterial = new THREE.PointsMaterial({
  size: 0.08,
  map: createParticleTexture(),
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  color: THEMES.neon.particleColor
});

const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particleSystem);

/* ==========================================================================
   MODEL LOADER & SCENE GRAPH SETUP
   ========================================================================== */

const modelRoot = new THREE.Group();
scene.add(modelRoot);

// Gentle warm yellow crest accent light - subtle highlight without overpowering glow
const yellowCrestLight = new THREE.PointLight(0xffea00, 1.1, 2.8, 1.4);
yellowCrestLight.position.set(0, 0.45, 0.55);
modelRoot.add(yellowCrestLight);

const meshes = [];
let originalMaterials = new Map();

// High-Tech Preloader UI Elements
const loaderEl = document.getElementById('loader');
const loaderBar = document.getElementById('loader-bar');
const loaderPercent = document.getElementById('loader-percent');
const loaderMsg = document.getElementById('loader-msg');
const loaderSub = document.getElementById('loader-sub');

const manager = new THREE.LoadingManager();

manager.onProgress = (url, itemsLoaded, itemsTotal) => {
  const percent = Math.round((itemsLoaded / itemsTotal) * 100);
  loaderBar.style.width = `${percent}%`;
  loaderPercent.textContent = `${percent}%`;

  if (percent < 30) {
    loaderMsg.textContent = 'CONNECTING TO BIOMECHANICAL HOST...';
  } else if (percent < 70) {
    loaderMsg.textContent = 'COMPILING HIGH-DENSITY MESH ARRAYS...';
  } else if (percent < 95) {
    loaderMsg.textContent = 'INITIALIZING PBR SHADERS & LIGHTING...';
  } else {
    loaderMsg.textContent = 'SYSTEMS ONLINE // SYNCHRONIZING NEURAL LINK';
  }
};

manager.onLoad = () => {
  state.isLoaded = true;
  setTimeout(() => {
    loaderEl.classList.add('hidden');
    audio.playBeep(880, 0.15);
  }, 400);
};

// Load GLTF / GLB Model
const loader = new GLTFLoader(manager);

loader.load(
  resolveAsset('cyber_skull.glb'),
  (gltf) => {
    const rawModel = gltf.scene;

    // Calculate Bounding Box to perfectly normalize scale and center point
    const box = new THREE.Box3().setFromObject(rawModel);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2.45 / maxDim;
    rawModel.scale.setScalar(scale);

    // Reposition internal pivot to origin (0, 0, 0)
    rawModel.position.x = -center.x * scale;
    rawModel.position.y = -center.y * scale;
    rawModel.position.z = -center.z * scale;

    // Traverse and enhance materials
    rawModel.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        meshes.push(node);
        originalMaterials.set(node, node.material);

        if (node.material) {
          node.material.wireframe = true; // Wireframe permanent design
          node.material.roughness = Math.min(0.65, node.material.roughness || 0.45);
          node.material.metalness = Math.max(0.75, node.material.metalness || 0.85);
          node.material.envMapIntensity = 1.0;

          const matName = node.material.name || '';
          // Yellow glow components: refined emissive lines instead of blown-out flare
          if (
            matName === 'CapPlates_Mat' ||
            matName === 'CapAndBackTrack_Mat' ||
            matName === 'TempleCircut_Mat'
          ) {
            node.material.emissive = new THREE.Color(0xffea00);
            node.material.emissiveIntensity = 1.3;
          } else if (matName === 'Skull1_Mat' || matName === 'Horns_Mat' || matName === 'Vents_Mat' || matName === 'FixturesAndPlugs_Mat') {
            // Keep the skull bone and horn titanium dark and non-emissive
            node.material.emissive = new THREE.Color(0x000000);
            node.material.emissiveIntensity = 0;
          } else if (node.material.emissiveMap) {
            node.material.emissiveIntensity = 0.5;
          }
        }
      }
    });

    modelRoot.add(rawModel);
    const initialWP = WAYPOINTS[state.currentSection || 0] || WAYPOINTS[0];
    modelRoot.rotation.x = initialWP.modelRot.x;
    modelRoot.rotation.y = initialWP.modelRot.y;
    modelRoot.rotation.z = initialWP.modelRot.z;

    console.log('Cyber Skull model loaded successfully:', { meshesCount: meshes.length, size });
  },
  (xhr) => {
    if (xhr.lengthComputable) {
      const mbLoaded = (xhr.loaded / (1024 * 1024)).toFixed(1);
      const mbTotal = (xhr.total / (1024 * 1024)).toFixed(1);
      loaderSub.textContent = `${mbLoaded}MB / ${mbTotal}MB STREAMED`;
    }
  },
  (error) => {
    console.error('Error loading Cyber Skull model:', error);
    loaderMsg.textContent = 'ERROR INITIALIZING ASSET. RETRYING...';
  }
);

/* ==========================================================================
   SCROLL & SECTION INTERPOLATION ENGINE
   ========================================================================== */

const sections = Array.from(document.querySelectorAll('.story-section'));
const navLinks = Array.from(document.querySelectorAll('.nav-link'));
const scrollProgressFill = document.getElementById('scroll-progress');
const telemetryCam = document.getElementById('telemetry-cam');

/* ==========================================================================
   CINEMATIC WAYPOINT TRANSITION CONTROLLER
   Delivers ultra-smooth, slow, luxurious transitions between sections
   using Ken Perlin's C2-continuous smootherstep easing.
   ========================================================================== */

const initWP = WAYPOINTS[state.currentSection || 0] || WAYPOINTS[0];
const currentCamPos = new THREE.Vector3().copy(initWP.camPos);
const currentTarget = new THREE.Vector3().copy(initWP.target);
const currentModelRot = new THREE.Vector3().copy(initWP.modelRot);

// Ken Perlin's Smootherstep (zero velocity and zero acceleration at t=0 and t=1)
const smootherstep = (t) => t * t * t * (t * (t * 6 - 15) + 10);

const waypointTransition = {
  active: false,
  progress: 1.0,
  duration: 1.85,
  startCamPos: new THREE.Vector3().copy(initWP.camPos),
  startTarget: new THREE.Vector3().copy(initWP.target),
  startModelRot: new THREE.Vector3().copy(initWP.modelRot),
  targetCamPos: new THREE.Vector3().copy(initWP.camPos),
  targetTarget: new THREE.Vector3().copy(initWP.target),
  targetModelRot: new THREE.Vector3().copy(initWP.modelRot),
  targetSection: state.currentSection || 0
};

const triggerWaypointTransition = (sectionIdx) => {
  const wp = WAYPOINTS[sectionIdx];
  if (!wp) return;

  waypointTransition.targetSection = sectionIdx;
  waypointTransition.startCamPos.copy(currentCamPos);
  waypointTransition.startTarget.copy(currentTarget);
  waypointTransition.startModelRot.copy(currentModelRot);

  waypointTransition.targetCamPos.copy(wp.camPos);
  waypointTransition.targetTarget.copy(wp.target);
  waypointTransition.targetModelRot.copy(wp.modelRot);

  // Slower, more majestic duration: 2.25s for large 240° pirouette/traversal, 1.85s for standard section shifts
  const rotDist = Math.abs(wp.modelRot.y - currentModelRot.y);
  waypointTransition.duration = rotDist > 2.0 ? 2.25 : 1.85;

  waypointTransition.progress = 0.0;
  waypointTransition.active = true;
};

const onScroll = () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const scrollFraction = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;

  state.targetScrollProgress = scrollFraction;
  scrollProgressFill.style.width = `${(scrollFraction * 100).toFixed(1)}%`;

  // Determine active section index based on scroll position (when section enters viewport midpoint)
  let currentIdx = 0;
  sections.forEach((sec, idx) => {
    const rect = sec.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.5) {
      currentIdx = idx;
    }
  });

  if (currentIdx !== state.currentSection) {
    state.currentSection = currentIdx;

    sections.forEach((sec, idx) => {
      sec.classList.toggle('active', idx === currentIdx);
    });

    navLinks.forEach((link, idx) => {
      link.classList.toggle('active', idx === currentIdx);
    });

    audio.playBeep(520 + currentIdx * 70, 0.06);
    triggerWaypointTransition(currentIdx);
  }
};

window.addEventListener('scroll', onScroll, { passive: true });
// Run once initially to ensure state matches current scroll position on page load
onScroll();

/* ==========================================================================
   MOUSE & PARALLAX TRACKING
   ========================================================================== */

const onMouseMove = (e) => {
  // Normalized device coordinates (-1 to 1)
  state.targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
  state.targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;

  // Move dynamic cursor light
  cursorLight.position.x = state.targetMouseX * 3.0;
  cursorLight.position.y = state.targetMouseY * 2.2;
};

window.addEventListener('mousemove', onMouseMove, { passive: true });

// Touch support for mobile interaction
window.addEventListener('touchmove', (e) => {
  if (e.touches.length > 0) {
    const t = e.touches[0];
    state.targetMouseX = (t.clientX / window.innerWidth) * 2 - 1;
    state.targetMouseY = -(t.clientY / window.innerHeight) * 2 + 1;
  }
}, { passive: true });

/* ==========================================================================
   INTERACTIVE HUD BUTTONS & THEME SWITCHER
   ========================================================================== */

// Theme Switcher
const themeButtons = Array.from(document.querySelectorAll('.theme-btn'));

const setTheme = (themeName) => {
  if (!THEMES[themeName]) return;
  state.activeTheme = themeName;
  const cfg = THEMES[themeName];

  // Update HTML body theme class
  document.body.className = `theme-${themeName}`;

  // Update Active Button
  themeButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.theme === themeName);
  });

  // Transition Three.js Lights
  keyLight.color.setHex(cfg.keyColor);
  rimLight.color.setHex(cfg.rimColor);
  bottomLight.color.setHex(cfg.accentColor);
  cursorLight.color.setHex(cfg.keyColor);
  particleMaterial.color.setHex(cfg.particleColor);
  scene.fog.color.setHex(cfg.bgColor);

  if (themeName === 'neon') {
    yellowCrestLight.color.setHex(0xffea00);
  } else if (themeName === 'crimson') {
    yellowCrestLight.color.setHex(0xff3b30);
  } else if (themeName === 'matrix') {
    yellowCrestLight.color.setHex(0x00ff66);
  }

  audio.playBeep(620, 0.1);
};

themeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    setTheme(btn.dataset.theme);
  });
});

// Overdrive Trigger
const btnOverdrive = document.getElementById('btn-overdrive');
const overdriveStatus = document.getElementById('overdrive-status');

btnOverdrive?.addEventListener('click', () => {
  state.isOverdriveActive = true;
  state.overdriveIntensity = 1.0;
  overdriveStatus.textContent = 'NEURAL LINK ACTIVE // OPENING INSTAGRAM';
  overdriveStatus.style.color = '#ff0055';
  audio.playOverdriveBlast();

  setTimeout(() => {
    state.isOverdriveActive = false;
    overdriveStatus.textContent = 'INSTAGRAM LINK ACTIVE [ @CYBERSAMURAIAK ]';
    overdriveStatus.style.color = 'var(--accent-primary)';
  }, 2200);
});

// Nav Link Smooth Scroll
navLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetIdx = parseInt(link.dataset.target, 10);
    if (sections[targetIdx]) {
      sections[targetIdx].scrollIntoView({ behavior: 'smooth' });
      if (state.currentSection !== targetIdx) {
        state.currentSection = targetIdx;
        sections.forEach((sec, idx) => sec.classList.toggle('active', idx === targetIdx));
        navLinks.forEach((l, idx) => l.classList.toggle('active', idx === targetIdx));
        audio.playBeep(520 + targetIdx * 70, 0.06);
        triggerWaypointTransition(targetIdx);
      }
    }
  });
});

// View Projects CTA button
const ctaViewProjects = document.getElementById('cta-view-projects');
ctaViewProjects?.addEventListener('click', (e) => {
  e.preventDefault();
  const projSection = document.getElementById('projects');
  projSection?.scrollIntoView({ behavior: 'smooth' });
  if (state.currentSection !== 2) {
    state.currentSection = 2;
    sections.forEach((sec, idx) => sec.classList.toggle('active', idx === 2));
    navLinks.forEach((l, idx) => l.classList.toggle('active', idx === 2));
    audio.playBeep(520 + 2 * 70, 0.06);
    triggerWaypointTransition(2);
  }
});

// Project Tabs Switcher
const projectTabs = document.querySelectorAll('.project-tab');
const projectPanels = document.querySelectorAll('.project-panel');

projectTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const projId = tab.dataset.project;
    projectTabs.forEach((t) => t.classList.toggle('active', t === tab));
    projectPanels.forEach((p) => {
      p.classList.toggle('active', p.id === `panel-${projId}`);
    });
    audio.playBeep(680, 0.08);
  });
});

// Certificate Lightbox / Audit Modal & CV Viewer
const certTiles = document.querySelectorAll('.cert-tile');
const certModal = document.getElementById('cert-modal');
const certModalTitle = document.getElementById('cert-modal-title');
const certModalDownload = document.getElementById('cert-modal-download');
const certModalClose = document.getElementById('cert-modal-close');
const certModalLoader = document.getElementById('cert-modal-loader');
const certModalIframe = document.getElementById('cert-modal-iframe');
const certModalImg = document.getElementById('cert-modal-img');
const certModalTag = document.getElementById('cert-modal-tag');
const certModalPdfContainer = document.getElementById('cert-modal-pdf-container');
const pdfFloatingToolbar = document.getElementById('pdf-floating-toolbar');
const pdfZoomIn = document.getElementById('pdf-zoom-in');
const pdfZoomOut = document.getElementById('pdf-zoom-out');
const pdfZoomFit = document.getElementById('pdf-zoom-fit');
const pdfZoomLabel = document.getElementById('pdf-zoom-label');

// Pre-rendered Retina High-DPI Manifest for 100% Pure White Clarity
const PDF_IMAGE_MANIFEST = {
  "/Aneesh_Kumar_Poddar_Resume.pdf": [
    "/cv_pages/cv_page_1.png",
    "/cv_pages/cv_page_2.png",
    "/cv_pages/cv_page_3.png"
  ],
  "/Certificates/amity_Certificate.pdf": [
    "/cert_pages/amity_Certificate_p1.png"
  ],
  "/Certificates/Amity__Acing_Your_Interview.pdf": [
    "/cert_pages/Amity__Acing_Your_Interview_p1.png"
  ],
  "/Certificates/Aneesh APT.pdf": [
    "/cert_pages/Aneesh APT_p1.png"
  ],
  "/Certificates/Aneesh CHFI.pdf": [
    "/cert_pages/Aneesh CHFI_p1.png"
  ],
  "/Certificates/Aneesh EH.pdf": [
    "/cert_pages/Aneesh EH_p1.png"
  ],
  "/Certificates/Aneesh Kumar Poddar (Linux).pdf": [
    "/cert_pages/Aneesh Kumar Poddar (Linux)_p1.png"
  ],
  "/Certificates/Aneesh Kumar Poddar mobileapp.pdf": [
    "/cert_pages/Aneesh Kumar Poddar mobileapp_p1.png"
  ],
  "/Certificates/Aneesh Kumar Poddar webapp.pdf": [
    "/cert_pages/Aneesh Kumar Poddar webapp_p1.png"
  ],
  "/Certificates/Aneesh Kumar Poddar.pdf": [
    "/cert_pages/Aneesh Kumar Poddar_p1.png",
    "/cert_pages/Aneesh Kumar Poddar_p2.png"
  ],
  "/Certificates/Aneesh Networking.pdf": [
    "/cert_pages/Aneesh Networking_p1.png"
  ],
  "/Certificates/Aneesh Python.pdf": [
    "/cert_pages/Aneesh Python_p1.png"
  ],
  "/Certificates/Aneesh_Kumar_AWS_Associate_0.pdf": [
    "/cert_pages/Aneesh_Kumar_AWS_Associate_0_p1.png"
  ],
  "/Certificates/Aneesh_Kumar_End_Point_Security_0.pdf": [
    "/cert_pages/Aneesh_Kumar_End_Point_Security_0_p1.png"
  ],
  "/Certificates/Aneesh_Kumar_Poddar_1year_diploma.pdf": [
    "/cert_pages/Aneesh_Kumar_Poddar_1year_diploma_p1.png"
  ],
  "/Certificates/Aneesh_Kumar_poddar_AWS_Security_0.pdf": [
    "/cert_pages/Aneesh_Kumar_poddar_AWS_Security_0_p1.png"
  ],
  "/Certificates/Aneesh_Kumar_poddar_Internet_of_Things_Pentesting_0.pdf": [
    "/cert_pages/Aneesh_Kumar_poddar_Internet_of_Things_Pentesting_0_p1.png"
  ],
  "/Certificates/BCA_all_semester_marksheet.pdf": [
    "/cert_pages/BCA_all_semester_marksheet_p1.png",
    "/cert_pages/BCA_all_semester_marksheet_p2.png"
  ],
  "/Certificates/BCA_degree.pdf": [
    "/cert_pages/BCA_degree_p1.png"
  ],
  "/Certificates/Deltaware_Internship.pdf": [
    "/cert_pages/Deltaware_Internship_p1.png"
  ],
  "/Certificates/IIT Jodhpur.pdf": [
    "/cert_pages/IIT Jodhpur_p1.png"
  ],
  "/Certificates/Oracle Cloud Infrastructure 2025 Certified AI Foundations Associate.pdf": [
    "/cert_pages/Oracle Cloud Infrastructure 2025 Certified AI Foundations Associate_p1.png"
  ],
  "/Certificates/_Aneesh Kumar Poddar_Internet Of Things (IOT) Pentesting_0.pdf": [
    "/cert_pages/_Aneesh Kumar Poddar_Internet Of Things (IOT) Pentesting_0_p1.png"
  ]
};

let currentDocType = 'images'; // 'images' or 'pdfjs'
let currentDocImages = [];
let currentPdfDoc = null;
let currentDocScale = 1.0;

const updateZoomLabel = () => {
  if (pdfZoomLabel) {
    pdfZoomLabel.textContent = `${Math.round(currentDocScale * 100)}%`;
  }
};

const renderDocPages = async () => {
  if (!certModalPdfContainer) return;

  if (currentDocType === 'images') {
    certModalPdfContainer.innerHTML = '';
    const baseWidth = 760;
    const computedWidth = Math.round(baseWidth * currentDocScale);

    currentDocImages.forEach((src, idx) => {
      const pageCard = document.createElement('div');
      pageCard.className = 'pdf-page-card';

      const pageBadge = document.createElement('div');
      pageBadge.className = 'pdf-page-num';
      pageBadge.textContent = `PAGE ${idx + 1} / ${currentDocImages.length}`;
      pageCard.appendChild(pageBadge);

      const img = document.createElement('img');
      img.className = 'pdf-page-img';
      img.src = resolveAsset(src);
      img.alt = `Document Page ${idx + 1}`;
      img.style.width = `${computedWidth}px`;
      img.style.height = 'auto';
      img.loading = 'eager';

      pageCard.appendChild(img);
      certModalPdfContainer.appendChild(pageCard);
    });
  } else if (currentDocType === 'pdfjs' && currentPdfDoc) {
    certModalPdfContainer.innerHTML = '';
    const numPages = currentPdfDoc.numPages;
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await currentPdfDoc.getPage(pageNum);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const viewport = page.getViewport({ scale: currentDocScale * 1.3 * dpr });
      
      const pageWrapper = document.createElement('div');
      pageWrapper.className = 'pdf-page-card';
      
      const pageBadge = document.createElement('div');
      pageBadge.className = 'pdf-page-num';
      pageBadge.textContent = `PAGE ${pageNum} / ${numPages}`;
      pageWrapper.appendChild(pageBadge);

      const canvas = document.createElement('canvas');
      canvas.className = 'pdf-page-canvas';
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width / dpr}px`;
      canvas.style.height = `${viewport.height / dpr}px`;
      
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      await page.render({
        canvasContext: ctx,
        viewport: viewport,
        intent: 'display'
      }).promise;
      
      pageWrapper.appendChild(canvas);
      certModalPdfContainer.appendChild(pageWrapper);
    }
  }
};

const loadPdfInModal = async (pdfUrl) => {
  certModalLoader.classList.remove('hidden');
  certModalIframe.classList.add('hidden');
  certModalImg.classList.add('hidden');
  
  if (certModalPdfContainer) {
    certModalPdfContainer.classList.remove('hidden');
    certModalPdfContainer.innerHTML = '';
  }
  if (pdfFloatingToolbar) {
    pdfFloatingToolbar.classList.remove('hidden');
  }

  // 1. High-Performance Pre-rendered Image Path (Instant, 100% Guaranteed Bright White)
  const manifestKey = pdfUrl.startsWith('/') ? pdfUrl : `/${pdfUrl}`;
  const manifestPages = PDF_IMAGE_MANIFEST[manifestKey] || PDF_IMAGE_MANIFEST[pdfUrl];
  if (manifestPages) {
    currentDocType = 'images';
    currentDocImages = manifestPages;
    const containerWidth = certModalPdfContainer?.clientWidth || 840;
    // Set scale to comfortably fill the viewing area
    currentDocScale = Math.min(1.15, Math.max(0.9, (containerWidth - 60) / 760));
    updateZoomLabel();
    await renderDocPages();
    certModalLoader.classList.add('hidden');
    return;
  }

  // 2. Dynamic PDF.js Engine Fallback
  try {
    const loadingTask = pdfjsLib.getDocument(resolveAsset(pdfUrl));
    currentPdfDoc = await loadingTask.promise;
    currentDocType = 'pdfjs';
    const containerWidth = certModalPdfContainer?.clientWidth || 840;
    currentDocScale = Math.min(1.3, Math.max(0.9, (containerWidth - 60) / 595));
    updateZoomLabel();
    await renderDocPages();
    certModalLoader.classList.add('hidden');
  } catch (err) {
    console.warn('Fallback to iframe viewer:', err);
    if (certModalPdfContainer) certModalPdfContainer.classList.add('hidden');
    if (pdfFloatingToolbar) pdfFloatingToolbar.classList.add('hidden');
    certModalIframe.onload = () => {
      certModalLoader.classList.add('hidden');
      certModalIframe.classList.remove('hidden');
    };
    certModalIframe.src = resolveAsset(pdfUrl);
  }
};

// Zoom Controls
pdfZoomIn?.addEventListener('click', async (e) => {
  e.stopPropagation();
  currentDocScale = Math.min(2.4, currentDocScale + 0.15);
  updateZoomLabel();
  if (currentDocType === 'images') {
    const baseWidth = 760;
    const computedWidth = Math.round(baseWidth * currentDocScale);
    certModalPdfContainer.querySelectorAll('.pdf-page-img').forEach((img) => {
      img.style.width = `${computedWidth}px`;
    });
  } else {
    certModalLoader.classList.remove('hidden');
    await renderDocPages();
    certModalLoader.classList.add('hidden');
  }
  audio.playBeep(520, 0.04);
});

pdfZoomOut?.addEventListener('click', async (e) => {
  e.stopPropagation();
  currentDocScale = Math.max(0.5, currentDocScale - 0.15);
  updateZoomLabel();
  if (currentDocType === 'images') {
    const baseWidth = 760;
    const computedWidth = Math.round(baseWidth * currentDocScale);
    certModalPdfContainer.querySelectorAll('.pdf-page-img').forEach((img) => {
      img.style.width = `${computedWidth}px`;
    });
  } else {
    certModalLoader.classList.remove('hidden');
    await renderDocPages();
    certModalLoader.classList.add('hidden');
  }
  audio.playBeep(440, 0.04);
});

pdfZoomFit?.addEventListener('click', async (e) => {
  e.stopPropagation();
  const containerWidth = certModalPdfContainer?.clientWidth || 800;
  const baseWidth = currentDocType === 'images' ? 760 : 595;
  currentDocScale = Math.max(0.6, (containerWidth - 60) / baseWidth);
  updateZoomLabel();
  if (currentDocType === 'images') {
    const computedWidth = Math.round(baseWidth * currentDocScale);
    certModalPdfContainer.querySelectorAll('.pdf-page-img').forEach((img) => {
      img.style.width = `${computedWidth}px`;
    });
  } else {
    certModalLoader.classList.remove('hidden');
    await renderDocPages();
    certModalLoader.classList.add('hidden');
  }
  audio.playBeep(600, 0.04);
});

const closeCertModal = () => {
  if (!certModal) return;
  certModal.classList.remove('active');
  if (certModalIframe) certModalIframe.src = '';
  if (certModalImg) certModalImg.src = '';
  if (certModalPdfContainer) certModalPdfContainer.innerHTML = '';
  currentPdfDoc = null;
  currentDocImages = [];
  audio.playBeep(320, 0.06);
};

certTiles.forEach((tile) => {
  tile.addEventListener('click', () => {
    const certPath = tile.dataset.cert;
    if (!certPath) return;

    if (certPath === 'linkedin') {
      window.open('https://linkedin.com/in/aneesh-poddar-189aa328b', '_blank');
      return;
    }

    const title = tile.dataset.title || 'Verified Credential';
    if (certModalTag) certModalTag.textContent = 'AUDITED CREDENTIAL';
    certModalTitle.textContent = title;
    certModalDownload.href = resolveAsset(certPath);
    certModalDownload.title = 'Open Original File In New Tab';

    const isImg = certPath.endsWith('.png') || certPath.endsWith('.jpg') || certPath.endsWith('.webp');
    if (isImg) {
      if (pdfFloatingToolbar) pdfFloatingToolbar.classList.add('hidden');
      if (certModalPdfContainer) certModalPdfContainer.classList.add('hidden');
      certModalIframe.classList.add('hidden');
      certModalLoader.classList.remove('hidden');
      certModalImg.onload = () => {
        certModalLoader.classList.add('hidden');
        certModalImg.classList.remove('hidden');
      };
      certModalImg.src = resolveAsset(certPath);
    } else {
      loadPdfInModal(certPath);
    }

    certModal.classList.add('active');
    audio.playBeep(640, 0.08);
  });
});

// View CV in modal viewer (just like certificates)
const openCvModal = (e) => {
  if (e) e.preventDefault();
  if (!certModal) return;

  const cvPath = '/Aneesh_Kumar_Poddar_Resume.pdf';
  if (certModalTag) certModalTag.textContent = 'OFFICIAL DOSSIER // CURRICULUM VITAE';
  certModalTitle.textContent = 'Aneesh Kumar Poddar // Curriculum Vitae (CV)';
  certModalDownload.href = resolveAsset(cvPath);
  certModalDownload.title = 'Open Curriculum Vitae in New Tab / Download';

  loadPdfInModal(cvPath);

  certModal.classList.add('active');
  audio.playBeep(640, 0.08);
};

document.getElementById('hud-view-cv-btn')?.addEventListener('click', openCvModal);
document.getElementById('cta-view-cv')?.addEventListener('click', openCvModal);

certModalClose?.addEventListener('click', closeCertModal);
certModal?.addEventListener('click', (e) => {
  if (e.target === certModal) closeCertModal();
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && certModal?.classList.contains('active')) {
    closeCertModal();
  }
});

/* ==========================================================================
   RENDER ANIMATION LOOP
   ========================================================================== */

const clock = new THREE.Clock();
let lastFrameTime = performance.now();

// FPS Counter
const fpsCounter = document.getElementById('fps-counter');
let frameTimes = 0;
let lastFpsUpdate = 0;

const animate = () => {
  requestAnimationFrame(animate);

  const now = performance.now();
  const delta = Math.min(0.05, Math.max(0.001, (now - lastFrameTime) / 1000));
  lastFrameTime = now;

  const elapsedTime = clock.getElapsedTime();

  // Responsive mouse interpolation for dynamic tracking
  state.mouseX += (state.targetMouseX - state.mouseX) * 0.085;
  state.mouseY += (state.targetMouseY - state.mouseY) * 0.085;

  // Smooth scroll interpolation
  state.currentScrollProgress += (state.targetScrollProgress - state.currentScrollProgress) * 0.08;

  // Orbit mode vs Guided Scroll mode
  if (state.freeOrbitMode) {
    controls.update();
  } else {
    // Check if section changed and initiate majestic transition
    if (state.currentSection !== waypointTransition.targetSection) {
      triggerWaypointTransition(state.currentSection);
    }

    if (waypointTransition.active) {
      waypointTransition.progress += delta / waypointTransition.duration;

      if (waypointTransition.progress >= 1.0) {
        waypointTransition.progress = 1.0;
        waypointTransition.active = false;
        currentCamPos.copy(waypointTransition.targetCamPos);
        currentTarget.copy(waypointTransition.targetTarget);
        currentModelRot.copy(waypointTransition.targetModelRot);
      } else {
        const ease = smootherstep(waypointTransition.progress);
        currentCamPos.lerpVectors(waypointTransition.startCamPos, waypointTransition.targetCamPos, ease);
        currentTarget.lerpVectors(waypointTransition.startTarget, waypointTransition.targetTarget, ease);
        currentModelRot.lerpVectors(waypointTransition.startModelRot, waypointTransition.targetModelRot, ease);
      }
    }

    // Dynamic mouse parallax: enhanced camera translation + lookAt shift
    const camParallaxX = state.mouseX * 0.22;
    const camParallaxY = state.mouseY * 0.15;

    camera.position.x = currentCamPos.x + camParallaxX;
    camera.position.y = currentCamPos.y + camParallaxY;
    camera.position.z = currentCamPos.z;

    const lookAtPos = new THREE.Vector3(
      currentTarget.x + state.mouseX * 0.08,
      currentTarget.y + state.mouseY * 0.05,
      currentTarget.z
    );
    camera.lookAt(lookAtPos);

    // Active head tracking rotation: follows mouse direction dynamically
    const mouseRotY = state.mouseX * 0.42;
    const mouseRotX = -state.mouseY * 0.26;
    const mouseRotZ = -state.mouseX * 0.06;

    modelRoot.rotation.x = currentModelRot.x + mouseRotX;
    modelRoot.rotation.y = currentModelRot.y + mouseRotY;
    modelRoot.rotation.z = currentModelRot.z + mouseRotZ;

    // Subtle sinusoidal breathing levitation
    modelRoot.position.y = Math.sin(elapsedTime * 1.8) * 0.045;
  }

  // Handle Overdrive pulse & lighting burst
  if (state.isOverdriveActive) {
    state.overdriveIntensity *= 0.94;
    rimLight.intensity = 6.0 + Math.sin(elapsedTime * 35) * 6.0 * state.overdriveIntensity;
    keyLight.intensity = 4.2 + Math.cos(elapsedTime * 30) * 4.0 * state.overdriveIntensity;
    camera.position.x += (Math.random() - 0.5) * 0.03 * state.overdriveIntensity;
    camera.position.y += (Math.random() - 0.5) * 0.03 * state.overdriveIntensity;
  } else {
    // Normal subtle pulsing of rim lights
    rimLight.intensity = 3.6 + Math.sin(elapsedTime * 2.0) * 0.4;
  }

  // Animate Particle Field (gentle drift)
  particleSystem.rotation.y = elapsedTime * 0.025;
  particleSystem.rotation.x = Math.sin(elapsedTime * 0.015) * 0.1;

  // Update Telemetry Display
  if (telemetryCam) {
    telemetryCam.textContent = `X: ${camera.position.x.toFixed(2)} | Y: ${camera.position.y.toFixed(2)} | Z: ${camera.position.z.toFixed(2)}`;
  }

  // Render Scene through EffectComposer (Bloom Pass)
  composer.render();

  // FPS calculation
  frameTimes++;
  if (elapsedTime - lastFpsUpdate >= 0.5) {
    const fps = Math.round((frameTimes / (elapsedTime - lastFpsUpdate)));
    if (fpsCounter) fpsCounter.textContent = `${fps} FPS`;
    frameTimes = 0;
    lastFpsUpdate = elapsedTime;
  }
};

// Start Render Loop
animate();

/* ==========================================================================
   WINDOW RESIZE HANDLER
   ========================================================================== */

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  composer.setSize(window.innerWidth, window.innerHeight);
};

window.addEventListener('resize', onWindowResize);
