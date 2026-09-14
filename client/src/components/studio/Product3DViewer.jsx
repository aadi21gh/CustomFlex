import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  RotateCw, Play, Pause, RotateCcw, Eye, Move3d,
  Thermometer, Grid3X3, Wind, Gauge, Activity, Sparkles,
} from 'lucide-react';
import { useStudio } from '@/context/StudioContext';
import { PRODUCT_TYPES, getProductLabel } from '@/components/studio/ProductTemplate';
import { createSimulationForCategory } from '@/lib/XPBDSimulation';

/* ═══════════════════════════════════════════════════════════════════════════════
   Product3DViewer — Photorealistic WebGL 3D Studio & XPBD Simulator
   ─────────────────────────────────────────────────────────────────────────────
   Features:
   - Real-time 3D models for ALL clothing (T-Shirt, Oversized, Hoodie, Sweatshirt,
     Long Sleeve, Tank Top, Polo, Jacket), Artwork, and Accessories
   - Working Camera Preset views (Front, Back, Left, Right, 3D Angle, Spin)
   - Product selector directly within 3D View
   - Real-time XPBD physics draping & strain heatmap visualization
   - Three-point studio lighting with floor contact shadow
   ═══════════════════════════════════════════════════════════════════════════════ */

// ── Procedural 3D Mesh Builders ─────────────────────────────────────────────

function createTShirtGeometry() {
  const shape = new THREE.Shape();
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
  const extrudeSettings = { steps: 2, depth: 0.35, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 5 };
  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.center();
  return geom;
}

function createOversizedGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-1.45, 1.95);
  shape.quadraticCurveTo(-0.7, 1.68, 0, 1.68);
  shape.quadraticCurveTo(0.7, 1.68, 1.45, 1.95);
  shape.lineTo(2.1, 1.35);
  shape.lineTo(1.9, 0.7);
  shape.lineTo(1.4, 1.0);
  shape.lineTo(1.4, -2.1);
  shape.quadraticCurveTo(0, -2.2, -1.4, -2.1);
  shape.lineTo(-1.4, 1.0);
  shape.lineTo(-1.9, 0.7);
  shape.lineTo(-2.1, 1.35);
  shape.closePath();
  const extrudeSettings = { steps: 3, depth: 0.45, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 5 };
  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.center();
  return geom;
}

function createHoodieGeometry() {
  const shape = new THREE.Shape();
  // Hood top curve
  shape.moveTo(-1.3, 1.85);
  shape.quadraticCurveTo(0, 1.5, 1.3, 1.85);
  shape.lineTo(2.0, 1.3);
  shape.lineTo(1.75, 0.75);
  shape.lineTo(1.3, 1.0);
  shape.lineTo(1.3, -2.05);
  shape.quadraticCurveTo(0, -2.15, -1.3, -2.05);
  shape.lineTo(-1.3, 1.0);
  shape.lineTo(-1.75, 0.75);
  shape.lineTo(-2.0, 1.3);
  shape.closePath();
  const extrudeSettings = { steps: 3, depth: 0.55, bevelEnabled: true, bevelThickness: 0.14, bevelSize: 0.12, bevelSegments: 6 };
  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.center();
  return geom;
}

function createSweatshirtGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-1.25, 1.9);
  shape.quadraticCurveTo(-0.6, 1.65, 0, 1.65);
  shape.quadraticCurveTo(0.6, 1.65, 1.25, 1.9);
  shape.lineTo(1.85, 1.35);
  shape.lineTo(1.7, 0.85);
  shape.lineTo(1.25, 1.05);
  shape.lineTo(1.25, -1.95);
  shape.quadraticCurveTo(0, -2.05, -1.25, -1.95);
  shape.lineTo(-1.25, 1.05);
  shape.lineTo(-1.7, 0.85);
  shape.lineTo(-1.85, 1.35);
  shape.closePath();
  const extrudeSettings = { steps: 2, depth: 0.42, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.09, bevelSegments: 5 };
  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.center();
  return geom;
}

function createLongSleeveGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-1.2, 1.9);
  shape.quadraticCurveTo(-0.6, 1.6, 0, 1.6);
  shape.quadraticCurveTo(0.6, 1.6, 1.2, 1.9);
  shape.lineTo(2.3, 0.6);
  shape.lineTo(2.05, 0.15);
  shape.lineTo(1.2, 0.9);
  shape.lineTo(1.2, -1.9);
  shape.quadraticCurveTo(0, -2.0, -1.2, -1.9);
  shape.lineTo(-1.2, 0.9);
  shape.lineTo(-2.05, 0.15);
  shape.lineTo(-2.3, 0.6);
  shape.closePath();
  const extrudeSettings = { steps: 2, depth: 0.38, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 5 };
  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.center();
  return geom;
}

function createTankTopGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.85, 1.85);
  shape.quadraticCurveTo(-0.4, 1.4, 0, 1.4);
  shape.quadraticCurveTo(0.4, 1.4, 0.85, 1.85);
  shape.lineTo(1.1, 1.8);
  shape.quadraticCurveTo(0.9, 0.9, 1.15, 0.7);
  shape.lineTo(1.15, -1.9);
  shape.quadraticCurveTo(0, -2.0, -1.15, -1.9);
  shape.lineTo(-1.15, 0.7);
  shape.quadraticCurveTo(-0.9, 0.9, -1.1, 1.8);
  shape.closePath();
  const extrudeSettings = { steps: 2, depth: 0.32, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.07, bevelSegments: 5 };
  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.center();
  return geom;
}

function createPoloGeometry() {
  return createTShirtGeometry();
}

function createJacketGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-1.3, 1.9);
  shape.quadraticCurveTo(0, 1.6, 1.3, 1.9);
  shape.lineTo(1.95, 1.35);
  shape.lineTo(1.75, 0.8);
  shape.lineTo(1.3, 1.05);
  shape.lineTo(1.3, -2.0);
  shape.quadraticCurveTo(0, -2.1, -1.3, -2.0);
  shape.lineTo(-1.3, 1.05);
  shape.lineTo(-1.75, 0.8);
  shape.lineTo(-1.95, 1.35);
  shape.closePath();
  const extrudeSettings = { steps: 3, depth: 0.5, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.1, bevelSegments: 6 };
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
  const extrudeSettings = { depth: 0.2, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 4 };
  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.center();
  return geom;
}

function createCanvasFrameGeometry() {
  return new THREE.BoxGeometry(3.6, 2.7, 0.25);
}

function createCapGeometry() {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, 1.2, 0, Math.PI, false);
  const extrudeSettings = { depth: 1.0, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 4 };
  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.center();
  return geom;
}

const GEOMETRY_FACTORY = {
  tshirt: createTShirtGeometry,
  oversized: createOversizedGeometry,
  hoodie: createHoodieGeometry,
  sweatshirt: createSweatshirtGeometry,
  longsleeve: createLongSleeveGeometry,
  tanktop: createTankTopGeometry,
  polo: createPoloGeometry,
  jacket: createJacketGeometry,
  canvas: createCanvasFrameGeometry,
  poster: createCanvasFrameGeometry,
  acrylic: createCanvasFrameGeometry,
  phonecase: createPhoneCaseGeometry,
  totebag: createTShirtGeometry,
  cap: createCapGeometry,
};

const Product3DViewer = () => {
  const containerRef = useRef(null);
  const {
    fabricRef, productType, setProductType, productColor, textureVersion,
    simulationRunning, setSimulationRunning,
    simulationMode, setSimulationMode,
    simulationStats, setSimulationStats,
    simulationRef, materialPreset, category,
  } = useStudio();

  const [autoRotate, setAutoRotate] = useState(true);
  const [cameraAngle, setCameraAngle] = useState('iso');
  const [windStrength, setWindStrength] = useState(0);
  const [showStats, setShowStats] = useState(true);

  const sceneRef = useRef(null);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);
  const meshRef = useRef(null);
  const textureRef = useRef(null);
  const materialRef = useRef(null);
  const rendererRef = useRef(null);

  // XPBD simulation mesh refs
  const clothMeshRef = useRef(null);
  const clothGeomRef = useRef(null);
  const animFrameRef = useRef(null);

  // Initialize Three.js scene & WebGL Renderer
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#121317');
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
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    containerRef.current.appendChild(renderer.domElement);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 14;
    controls.minDistance = 1.8;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;
    controlsRef.current = controls;

    // 5. Studio Three-Point Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff8f0, 1.6);
    keyLight.position.set(4, 6, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x88bbff, 0.8);
    fillLight.position.set(-5, 3, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffd0a0, 0.9);
    rimLight.position.set(0, 5, -5);
    scene.add(rimLight);

    // Floor Shadow Receiver
    const shadowGeo = new THREE.PlaneGeometry(8, 8);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -2.3;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Animation Loop
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTime = performance.now();
    let currentFps = 60;

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // FPS counter
      frameCount++;
      if (now - fpsTime > 500) {
        currentFps = Math.round((frameCount * 1000) / (now - fpsTime));
        frameCount = 0;
        fpsTime = now;
      }

      // Step XPBD simulation if running
      if (simulationRef.current && simulationRef.current.running) {
        simulationRef.current.step(dt);

        // Update Three.js cloth geometry from simulation
        if (clothGeomRef.current && clothMeshRef.current) {
          const posAttr = clothGeomRef.current.getAttribute('position');
          const normalAttr = clothGeomRef.current.getAttribute('normal');
          const simPos = simulationRef.current.getPositionBuffer();
          const simNormals = simulationRef.current.getNormalBuffer();

          posAttr.copyArray(simPos);
          posAttr.needsUpdate = true;
          normalAttr.copyArray(simNormals);
          normalAttr.needsUpdate = true;

          // Update strain colors if in stress mode
          if (simulationMode === 'stress') {
            const colorAttr = clothGeomRef.current.getAttribute('color');
            if (colorAttr) {
              const strainColors = simulationRef.current.getStrainColorBuffer();
              colorAttr.copyArray(strainColors);
              colorAttr.needsUpdate = true;
            }
          }

          // Push stats to StudioContext
          const simObj = simulationRef.current;
          const stats = (simObj && typeof simObj.getStats === 'function')
            ? simObj.getStats()
            : (simObj?.stats || {});
          setSimulationStats({ ...stats, fps: currentFps });
        }
      }

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
      cancelAnimationFrame(animFrameRef.current);
      controls.dispose();
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update product mesh when productType or productColor changes
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

    // Physical Material with tactile sheen
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
    if (textureRef.current && textureRef.current.image) {
      textureRef.current.needsUpdate = true;
    }
  }, [textureVersion]);

  // Initialize XPBD simulation mesh
  useEffect(() => {
    if (!sceneRef.current) return;

    if (clothMeshRef.current) {
      sceneRef.current.remove(clothMeshRef.current);
      if (clothGeomRef.current) clothGeomRef.current.dispose();
    }

    const sim = createSimulationForCategory(category, materialPreset);
    simulationRef.current = sim;

    const geom = new THREE.BufferGeometry();
    const posBuffer = sim.getPositionBuffer();
    const normalBuffer = sim.getNormalBuffer();
    const uvBuffer = sim.getUVBuffer();
    const indexBuffer = sim.getIndexBuffer();

    geom.setAttribute('position', new THREE.BufferAttribute(posBuffer, 3));
    geom.setAttribute('normal', new THREE.BufferAttribute(normalBuffer, 3));
    geom.setAttribute('uv', new THREE.BufferAttribute(uvBuffer, 2));
    geom.setIndex(new THREE.BufferAttribute(indexBuffer, 1));

    clothGeomRef.current = geom;

    const clothMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#C76D4A'),
      roughness: 0.7,
      metalness: 0.0,
      side: THREE.DoubleSide,
      wireframe: simulationMode === 'wireframe',
      vertexColors: simulationMode === 'stress',
      transparent: true,
      opacity: 0.88,
    });

    const clothMesh = new THREE.Mesh(geom, clothMat);
    clothMesh.castShadow = true;
    clothMesh.position.set(0, 0, 0.1);
    clothMeshRef.current = clothMesh;

    sceneRef.current.add(clothMesh);
    const initialStats = typeof sim?.getStats === 'function' ? sim.getStats() : (sim?.stats || {});
    setSimulationStats({ ...initialStats });
  }, [category, materialPreset]);

  // Update simulation mode
  useEffect(() => {
    if (!clothMeshRef.current) return;
    const mat = clothMeshRef.current.material;
    mat.wireframe = simulationMode === 'wireframe';
    mat.vertexColors = simulationMode === 'stress';

    if (simulationMode === 'stress') {
      const sim = simulationRef.current;
      if (sim && clothGeomRef.current) {
        const strainColors = sim.getStrainColorBuffer();
        clothGeomRef.current.setAttribute('color', new THREE.BufferAttribute(strainColors, 3));
      }
      mat.color.set('#ffffff');
    } else {
      mat.color.set('#C76D4A');
    }
    mat.needsUpdate = true;
  }, [simulationMode]);

  // Auto-Rotate toggle
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Wind force
  useEffect(() => {
    if (simulationRef.current) {
      simulationRef.current.setWind(windStrength * 5, 0, windStrength * 2);
    }
  }, [windStrength]);

  // Camera preset positions — FIXED TDZ issue!
  const setPresetAngle = useCallback((preset) => {
    setCameraAngle(preset);
    const cam = cameraRef.current;
    const controls = controlsRef.current;
    if (!cam || !controls) return;

    // Pause auto-spin on fixed camera angles so user can inspect
    if (preset !== 'iso') {
      controls.autoRotate = false;
      setAutoRotate(false);
    }

    const dist = 5.0;
    switch (preset) {
      case 'front':
        cam.position.set(0, 0, dist);
        break;
      case 'back':
        cam.position.set(0, 0, -dist);
        break;
      case 'left':
        cam.position.set(-dist, 0, 0);
        break;
      case 'right':
        cam.position.set(dist, 0, 0);
        break;
      case 'iso':
      default:
        cam.position.set(2.5, 1.8, dist);
        break;
    }
    cam.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
    controls.update();
  }, []);

  // Simulation controls
  const toggleSimulation = () => setSimulationRunning(!simulationRunning);

  const resetSimulation = () => {
    if (simulationRef.current) {
      simulationRef.current.reset();
      setSimulationStats({ ...simulationRef.current.stats });
    }
    setSimulationRunning(false);
  };

  const productLabel = getProductLabel(productType);
  const availableProducts = PRODUCT_TYPES[category] || PRODUCT_TYPES.clothing;

  const categoryLabels = {
    clothing: { sim: 'Cloth Drape', type: 'Garment' },
    artwork: { sim: 'Canvas Tension', type: 'Substrate' },
    accessories: { sim: 'Surface Stretch', type: 'Form' },
  };
  const catLabel = categoryLabels[category] || categoryLabels.clothing;

  return (
    <div className="relative w-full h-full flex flex-col bg-dark-950 overflow-hidden select-none">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Header: Product Selector & Badge (Top Left) */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5 max-w-[calc(100%-240px)]">
        {/* Active Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-900/85 backdrop-blur-md border border-glass-border flex-shrink-0">
          <Move3d className="w-4 h-4 text-brand-400" />
          <span className="text-xs font-bold text-dark-100">{productLabel}</span>
          <span className="text-2xs text-dark-400 hidden lg:inline">• Drag to rotate</span>
        </div>

        {/* Product Type Switcher for 3D View */}
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-dark-900/80 backdrop-blur-md border border-glass-border overflow-x-auto scrollbar-none">
          {availableProducts.map(({ id, label, emoji }) => (
            <button
              key={id}
              onClick={() => setProductType(id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-2xs font-semibold whitespace-nowrap transition-all ${
                productType === id
                  ? 'bg-brand-500 text-white font-bold shadow-sm'
                  : 'text-dark-300 hover:text-brand-500 hover:bg-brand-500/10'
              }`}
              title={label}
            >
              <span>{emoji}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Simulation Controls (Top Right) */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 p-1.5 rounded-xl bg-dark-900/85 backdrop-blur-xl border border-glass-border">
        {/* Play/Pause */}
        <button
          onClick={toggleSimulation}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            simulationRunning
              ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30'
              : 'text-dark-300 hover:text-dark-100 hover:bg-white/5'
          }`}
          title={simulationRunning ? 'Pause Simulation' : 'Start Simulation'}
        >
          {simulationRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{simulationRunning ? 'Pause' : 'Play'}</span>
        </button>

        {/* Reset */}
        <button
          onClick={resetSimulation}
          className="px-2 py-1.5 rounded-lg text-xs text-dark-400 hover:text-dark-200 hover:bg-white/5 transition-all"
          title="Reset Simulation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-glass-border mx-0.5" />

        {/* Visualization modes */}
        {[
          { id: 'drape', icon: Eye, label: catLabel.sim },
          { id: 'stress', icon: Thermometer, label: 'Strain Map' },
          { id: 'wireframe', icon: Grid3X3, label: 'Wireframe' },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setSimulationMode(id)}
            className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              simulationMode === id
                ? 'bg-brand-500/20 text-brand-300 ring-1 ring-brand-500/30'
                : 'text-dark-400 hover:text-dark-200 hover:bg-white/5'
            }`}
            title={label}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        ))}

        <div className="w-px h-4 bg-glass-border mx-0.5" />

        {/* Wind control */}
        <div className="flex items-center gap-1 px-1">
          <Wind className="w-3.5 h-3.5 text-dark-400" />
          <input
            type="range"
            min={0} max={10} step={0.5}
            value={windStrength}
            onChange={(e) => setWindStrength(parseFloat(e.target.value))}
            className="w-16 accent-brand-500 h-1 bg-dark-800 rounded-lg appearance-none cursor-pointer"
            title={`Wind: ${windStrength}`}
          />
        </div>
      </div>

      {/* Live Stats Overlay (Bottom Left) */}
      {showStats && (
        <div className="absolute bottom-14 left-3 z-10 p-2.5 rounded-xl bg-dark-900/80 backdrop-blur-md border border-glass-border space-y-1.5 min-w-[140px]">
          <div className="flex items-center gap-1.5 text-2xs text-dark-500">
            <Activity className="w-3 h-3 text-brand-400" />
            <span className="font-semibold uppercase tracking-wider">Live Stats</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-2xs">
            <span className="text-dark-500">FPS</span>
            <span className="text-dark-200 font-mono text-right">{simulationStats.fps}</span>
            <span className="text-dark-500">Particles</span>
            <span className="text-dark-200 font-mono text-right">{simulationStats.particleCount}</span>
            <span className="text-dark-500">Max Strain</span>
            <span className="font-mono text-right" style={{
              color: simulationStats.maxStrain > 0.5 ? '#ef4444' : simulationStats.maxStrain > 0.2 ? '#eab308' : '#22c55e'
            }}>
              {(simulationStats.maxStrain * 100).toFixed(1)}%
            </span>
            <span className="text-dark-500">Seam Gap</span>
            <span className="text-dark-200 font-mono text-right">{(simulationStats.maxSeamGap * 1000).toFixed(1)}mm</span>
            <span className="text-dark-500">Solver</span>
            <span className="text-dark-200 font-mono text-right">{simulationStats.solverIterationsUsed}it</span>
          </div>
        </div>
      )}

      {/* Angle Presets & Controls (Bottom Center) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 p-1.5 rounded-2xl bg-dark-900/85 backdrop-blur-xl border border-glass-border shadow-2xl">
        {['front', 'back', 'left', 'right', 'iso'].map((preset) => (
          <button
            key={preset}
            onClick={() => setPresetAngle(preset)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              cameraAngle === preset ? 'bg-brand-500 text-dark-950 font-bold' : 'text-dark-300 hover:text-dark-100 hover:bg-white/5'
            }`}
            title={`${preset.charAt(0).toUpperCase() + preset.slice(1)} View`}
          >
            {preset === 'iso' ? '3D Angle' : preset.charAt(0).toUpperCase() + preset.slice(1)}
          </button>
        ))}

        <div className="w-px h-5 bg-glass-border mx-1" />

        {/* Auto Spin Toggle */}
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            autoRotate ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-dark-400 hover:text-dark-100'
          }`}
          title="Toggle 360 Spin"
        >
          <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Spin</span>
        </button>

        {/* Toggle stats */}
        <button
          onClick={() => setShowStats(!showStats)}
          className={`px-2 py-1.5 rounded-xl text-xs transition-all ${
            showStats ? 'text-brand-300 bg-brand-500/10' : 'text-dark-400 hover:text-dark-200'
          }`}
          title="Toggle Stats"
        >
          <Gauge className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default Product3DViewer;
