import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RotateCw, RefreshCw, Eye, Sparkles, Move3d, Compass } from 'lucide-react';
import { useStudio } from '@/context/StudioContext';
import { getProductLabel } from '@/components/studio/ProductTemplate';

/* ═══════════════════════════════════════════════════════════════════════════════
   Product3DViewer — Interactive WebGL 3D Product Rotating Studio
   ─────────────────────────────────────────────────────────────────────────────
   Renders real-time interactive 3D product models (T-Shirt, Hoodie, Phone Case,
   Canvas Frame, Cap) with Three.js WebGL & OrbitControls. Maps the live Fabric
   2D canvas onto the 3D product surface in real time.
   ═══════════════════════════════════════════════════════════════════════════════ */

// ── Procedural 3D Mesh Builders ─────────────────────────────────────────────

function createTShirtGeometry() {
  // Curved torso geometry for realistic garment volume
  const shape = new THREE.Shape();
  // Outer outline coordinates scaled for 3D units
  shape.moveTo(-1.2, 1.9);
  shape.quadraticCurveTo(-0.6, 1.6, 0, 1.6);
  shape.quadraticCurveTo(0.6, 1.6, 1.2, 1.9);
  shape.lineTo(1.8, 1.4);
  shape.lineTo(1.65, 0.9);
  shape.lineTo(1.2, 1.1);
  shape.lineTo(1.2, -1.9);
  shape.quadraticCurveTo(0, -2.0, -1.2, -1.9);
  shape.lineTo(-1.2, 1.1);
  shape.lineTo(-1.65, 0.9);
  shape.lineTo(-1.8, 1.4);
  shape.closePath();

  const extrudeSettings = {
    steps: 2,
    depth: 0.35,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.08,
    bevelSegments: 5,
  };

  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.center();
  return geom;
}

function createHoodieGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-1.25, 1.85);
  shape.quadraticCurveTo(0, 1.55, 1.25, 1.85);
  shape.lineTo(1.9, 1.35);
  shape.lineTo(1.7, 0.8);
  shape.lineTo(1.25, 1.05);
  shape.lineTo(1.25, -1.95);
  shape.quadraticCurveTo(0, -2.05, -1.25, -1.95);
  shape.lineTo(-1.25, 1.05);
  shape.lineTo(-1.7, 0.8);
  shape.lineTo(-1.9, 1.35);
  shape.closePath();

  const extrudeSettings = {
    steps: 3,
    depth: 0.5,
    bevelEnabled: true,
    bevelThickness: 0.12,
    bevelSize: 0.1,
    bevelSegments: 6,
  };

  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.center();
  return geom;
}

function createPhoneCaseGeometry() {
  const shape = new THREE.Shape();
  const w = 1.0, h = 2.0, r = 0.25;
  shape.moveTo(-w + r, -h);
  shape.lineTo(w - r, -h);
  shape.quadraticCurveTo(w, -h, w, -h + r);
  shape.lineTo(w, h - r);
  shape.quadraticCurveTo(w, h, w - r, h);
  shape.lineTo(-w + r, h);
  shape.quadraticCurveTo(-w, h, -w, h - r);
  shape.lineTo(-w, -h + r);
  shape.quadraticCurveTo(-w, -h, -w + r, -h);

  const extrudeSettings = {
    depth: 0.2,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.06,
    bevelSegments: 4,
  };

  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.center();
  return geom;
}

function createCanvasFrameGeometry() {
  const geom = new THREE.BoxGeometry(3.6, 2.7, 0.25);
  return geom;
}

function createCapGeometry() {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, 1.2, 0, Math.PI, false);
  const extrudeSettings = {
    depth: 1.0,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 4,
  };
  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.center();
  return geom;
}

const GEOMETRY_FACTORY = {
  tshirt: createTShirtGeometry,
  hoodie: createHoodieGeometry,
  sweatshirt: createTShirtGeometry,
  oversized: createHoodieGeometry,
  canvas: createCanvasFrameGeometry,
  poster: createCanvasFrameGeometry,
  acrylic: createCanvasFrameGeometry,
  phonecase: createPhoneCaseGeometry,
  totebag: createTShirtGeometry,
  cap: createCapGeometry,
};

const Product3DViewer = () => {
  const containerRef = useRef(null);
  const { fabricRef, productType, productColor, textureVersion } = useStudio();
  const [autoRotate, setAutoRotate] = useState(true);
  const [cameraAngle, setCameraAngle] = useState('iso'); // 'front' | 'back' | 'left' | 'right' | 'iso'

  const sceneRef = useRef(null);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);
  const meshRef = useRef(null);
  const textureRef = useRef(null);
  const materialRef = useRef(null);

  // Initialize Three.js scene & WebGL Renderer
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#14151a');
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(2.5, 1.8, 5.0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    containerRef.current.appendChild(renderer.domElement);

    // 4. Orbit Controls (Interactive 3D Mouse Drag Rotation)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 12;
    controls.minDistance = 2;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;
    controlsRef.current = controls;

    // 5. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(4, 6, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xb0c4de, 0.7);
    fillLight.position.set(-4, 3, -3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffa500, 0.4);
    rimLight.position.set(0, -4, -4);
    scene.add(rimLight);

    // 6. Ground Shadow Plane
    const shadowPlaneGeo = new THREE.PlaneGeometry(10, 10);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.25 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -2.2;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update 3D Mesh & Material when productType or productColor changes
  useEffect(() => {
    if (!sceneRef.current) return;

    // Remove old mesh
    if (meshRef.current) {
      sceneRef.current.remove(meshRef.current);
      meshRef.current.geometry.dispose();
    }

    // Build geometry
    const factory = GEOMETRY_FACTORY[productType] || GEOMETRY_FACTORY.tshirt;
    const geom = factory();

    // Live texture from Fabric.js Canvas
    let texture = textureRef.current;
    if (fabricRef.current) {
      const fabricCanvasEl = fabricRef.current.getElement();
      texture = new THREE.CanvasTexture(fabricCanvasEl);
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      textureRef.current = texture;
    }

    // Material with physical lighting
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(productColor),
      map: texture || null,
      roughness: 0.65,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
    materialRef.current = mat;

    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    meshRef.current = mesh;

    sceneRef.current.add(mesh);
  }, [productType, productColor, fabricRef]);

  // Sync canvas edits to 3D texture in real-time
  useEffect(() => {
    if (textureRef.current) {
      textureRef.current.needsUpdate = true;
    }
  }, [textureVersion]);

  // Handle Auto-Rotate toggle
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Camera preset positions
  const setPresetAngle = (preset) => {
    setCameraAngle(preset);
    if (!controlsRef.current || !cameraRef.current) return;

    const controls = controlsRef.current;
    controls.autoRotate = false;
    setAutoRotate(false);

    switch (preset) {
      case 'front':
        cameraRef.current.position.set(0, 0, 5.2);
        break;
      case 'back':
        cameraRef.current.position.set(0, 0, -5.2);
        break;
      case 'left':
        cameraRef.current.position.set(-5.2, 0, 0);
        break;
      case 'right':
        cameraRef.current.position.set(5.2, 0, 0);
        break;
      case 'iso':
      default:
        cameraRef.current.position.set(2.5, 1.8, 5.0);
        break;
    }
    controls.target.set(0, 0, 0);
    controls.update();
  };

  const productLabel = getProductLabel(productType);

  return (
    <div className="relative w-full h-full flex flex-col bg-dark-950 overflow-hidden select-none">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D Control Bar (Top Left) */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-2 rounded-xl bg-dark-900/80 backdrop-blur-md border border-glass-border">
        <Move3d className="w-4 h-4 text-brand-400 animate-pulse" />
        <span className="text-xs font-bold text-white">{productLabel} (3D View)</span>
        <span className="text-2xs text-dark-400 hidden sm:inline">• Drag mouse to rotate 360°</span>
      </div>

      {/* Angle Presets & Controls (Bottom Center) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 p-1.5 rounded-2xl bg-dark-900/85 backdrop-blur-xl border border-glass-border shadow-2xl">
        <button
          onClick={() => setPresetAngle('front')}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            cameraAngle === 'front' ? 'bg-brand-500 text-white' : 'text-dark-300 hover:text-white hover:bg-white/5'
          }`}
          title="Front View"
        >
          Front
        </button>
        <button
          onClick={() => setPresetAngle('back')}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            cameraAngle === 'back' ? 'bg-brand-500 text-white' : 'text-dark-300 hover:text-white hover:bg-white/5'
          }`}
          title="Back View"
        >
          Back
        </button>
        <button
          onClick={() => setPresetAngle('left')}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            cameraAngle === 'left' ? 'bg-brand-500 text-white' : 'text-dark-300 hover:text-white hover:bg-white/5'
          }`}
          title="Left Profile"
        >
          Left
        </button>
        <button
          onClick={() => setPresetAngle('right')}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            cameraAngle === 'right' ? 'bg-brand-500 text-white' : 'text-dark-300 hover:text-white hover:bg-white/5'
          }`}
          title="Right Profile"
        >
          Right
        </button>
        <button
          onClick={() => setPresetAngle('iso')}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            cameraAngle === 'iso' ? 'bg-brand-500 text-white' : 'text-dark-300 hover:text-white hover:bg-white/5'
          }`}
          title="3D Perspective"
        >
          3D Angle
        </button>

        <div className="w-px h-5 bg-glass-border mx-1" />

        {/* Auto Spin Toggle */}
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            autoRotate ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-dark-400 hover:text-white'
          }`}
          title="Toggle 360 Spin"
        >
          <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Spin</span>
        </button>
      </div>
    </div>
  );
};

export default Product3DViewer;
