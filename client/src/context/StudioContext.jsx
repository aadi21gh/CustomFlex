import { createContext, useContext, useState, useRef, useCallback } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { isTemplateObject, getDefaultProductType } from '@/components/studio/ProductTemplate';
import { MATERIAL_PRESETS, PATTERN_TEMPLATES } from '@/lib/utils';

const StudioContext = createContext(null);

export const StudioProvider = ({ children }) => {
  const fabricRef = useRef(null); // Fabric.js canvas instance
  const [activeObject, setActiveObject] = useState(null);
  const [layers, setLayers] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isSaving, setIsSaving] = useState(false);
  const [designId, setDesignId] = useState(null);
  const [designTitle, setDesignTitle] = useState('Untitled Design');
  const [category, setCategory] = useState('artwork');
  const [zoom, setZoom] = useState(1);
  const [gridVisible, setGridVisible] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [selectedTool, setSelectedTool] = useState('select');
  const [brushColor, setBrushColor] = useState('#C76D4A');
  const [brushWidth, setBrushWidth] = useState(10);
  const [brushType, setBrushType] = useState('pencil');

  // Product template state
  const [productType, setProductType] = useState('tshirt');
  const [productColor, setProductColor] = useState('#FFFFFF');
  const [activeSide, setActiveSide] = useState('front'); // 'front' | 'back'
  const [textureVersion, setTextureVersion] = useState(0);

  // ── NEW: View & Panel State ─────────────────────────────────────────────
  const [activeMainView, setActiveMainView] = useState('view3d'); // 'canvas2d' | 'view3d' | 'patternDraft'
  const [activeRightPanel, setActiveRightPanel] = useState('objectBrowser'); // 'objectBrowser' | 'materialPreview' | 'properties'

  // ── NEW: Simulation State ───────────────────────────────────────────────
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationMode, setSimulationMode] = useState('drape'); // 'drape' | 'stress' | 'wireframe'
  const [simulationStats, setSimulationStats] = useState({
    maxStrain: 0,
    avgStrain: 0,
    maxSeamGap: 0,
    solverIterationsUsed: 0,
    particleCount: 0,
    constraintCount: 0,
    fps: 0,
    energy: 0,
    convergence: 1.0,
  });
  const simulationRef = useRef(null); // XPBDSimulation instance

  // ── NEW: Material State ─────────────────────────────────────────────────
  const getDefaultMaterial = useCallback((cat) => {
    const presets = MATERIAL_PRESETS[cat] || MATERIAL_PRESETS.clothing;
    return presets[0];
  }, []);

  const [materialPreset, setMaterialPreset] = useState(() => getDefaultMaterial('clothing'));

  // ── NEW: Pattern State ──────────────────────────────────────────────────
  const [patternPieces, setPatternPieces] = useState([]);
  const [activePatternPiece, setActivePatternPiece] = useState(null);
  const [patternScale, setPatternScale] = useState(10); // px per cm

  // ── NEW: Scene Objects for Object Browser ───────────────────────────────
  const [sceneObjects, setSceneObjects] = useState([]);
  const [selectedSceneObject, setSelectedSceneObject] = useState(null);

  const notifyTextureUpdate = useCallback(() => {
    setTextureVersion(v => v + 1);
  }, []);

  const canvas = useCallback(() => fabricRef.current, []);

  // Update layers list from canvas objects — excludes template objects
  const syncLayers = useCallback(() => {
    if (!fabricRef.current) return;
    const objects = fabricRef.current.getObjects().filter(obj => !isTemplateObject(obj));
    setLayers(
      objects.map((obj, i) => ({
        id: obj.id || i,
        type: obj.type,
        name: obj.customName || obj.type || `Layer ${i + 1}`,
        visible: obj.visible !== false,
        locked: obj.lockMovementX && obj.lockMovementY,
        obj,
      })).reverse()
    );
  }, []);

  // Push to history — excludes template objects from serialization
  const pushHistory = useCallback(() => {
    if (!fabricRef.current) return;
    const allObjects = fabricRef.current.toJSON(['id', 'customName', 'selectable']);
    // Filter out template objects so undo/redo doesn't affect product templates
    allObjects.objects = (allObjects.objects || []).filter(
      obj => !obj.id || !obj.id.startsWith('__template__')
    );
    const state = JSON.stringify(allObjects);
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, state];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex <= 0 || !fabricRef.current) return;
    const newIndex = historyIndex - 1;
    fabricRef.current.loadFromJSON(JSON.parse(history[newIndex]), () => {
      fabricRef.current.renderAll();
      syncLayers();
    });
    setHistoryIndex(newIndex);
  }, [history, historyIndex, syncLayers]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1 || !fabricRef.current) return;
    const newIndex = historyIndex + 1;
    fabricRef.current.loadFromJSON(JSON.parse(history[newIndex]), () => {
      fabricRef.current.renderAll();
      syncLayers();
    });
    setHistoryIndex(newIndex);
  }, [history, historyIndex, syncLayers]);

  // ── NEW: Sync pattern pieces when product type changes ──────────────────
  const syncPatternPieces = useCallback((prodType) => {
    const templates = PATTERN_TEMPLATES[prodType] || [];
    setPatternPieces(templates.map(t => ({ ...t })));
    setActivePatternPiece(null);
  }, []);

  // ── NEW: Sync scene objects for object browser ──────────────────────────
  const syncSceneObjects = useCallback(() => {
    const objects = [];

    // 1. Add simulation mesh if available
    if (simulationRef.current) {
      objects.push({
        id: '__sim_cloth__',
        name: 'Cloth Simulation',
        type: 'simulation',
        icon: 'grid',
        particleCount: simulationRef.current.stats.particleCount,
        constraintCount: simulationRef.current.stats.constraintCount,
      });
    }

    // 2. Add pattern pieces
    patternPieces.forEach(p => {
      objects.push({
        id: `__pattern_${p.id}__`,
        name: p.name,
        type: 'pattern',
        icon: 'scissors',
        seamAllowance: p.seamAllowance,
        grainAngle: p.grainAngle,
      });
    });

    // 3. Add canvas design objects
    if (fabricRef.current) {
      const canvasObjs = fabricRef.current.getObjects().filter(obj => !isTemplateObject(obj) && obj.id !== '__grid__');
      canvasObjs.forEach((obj, i) => {
        objects.push({
          id: obj.id || `design_${i}`,
          name: obj.customName || obj.type || `Layer ${i + 1}`,
          type: 'design',
          icon: obj.type === 'i-text' || obj.type === 'text' ? 'type' : obj.type === 'image' ? 'image' : 'square',
          fabricObj: obj,
        });
      });
    }

    // 4. Add 3D product mesh
    objects.unshift({
      id: '__product_mesh__',
      name: `${productType.charAt(0).toUpperCase() + productType.slice(1)} Mesh`,
      type: 'mesh',
      icon: 'box',
    });

    setSceneObjects(objects);
  }, [patternPieces, productType]);

  // Save design to backend
  const saveDesign = useCallback(async (isDraft = false) => {
    if (!fabricRef.current) return;
    setIsSaving(true);
    try {
      const canvasData = fabricRef.current.toJSON(['id', 'customName', 'selectable']);

      // Generate thumbnail
      const thumbnailDataUrl = fabricRef.current.toDataURL({ format: 'jpeg', quality: 0.7, multiplier: 0.5 });

      let savedDesign;
      if (designId) {
        const { data } = await api.put(`/designs/${designId}`, {
          title: designTitle,
          canvasData,
          isDraft,
          isPublic: !isDraft,
        });
        savedDesign = data.design;
      } else {
        const { data } = await api.post('/designs', {
          title: designTitle,
          category,
          canvasData,
          isDraft,
          isPublic: !isDraft,
        });
        savedDesign = data.design;
        setDesignId(savedDesign._id);
      }

      // Upload thumbnail
      try {
        await api.put(`/designs/${savedDesign._id}/thumbnail`, { thumbnailDataUrl });
      } catch (e) {
        console.error('Thumbnail upload failed:', e.message);
      }

      toast.success(isDraft ? 'Draft saved!' : 'Design saved!');
      return savedDesign;
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save design');
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [designId, designTitle, category]);

  const value = {
    fabricRef,
    canvas,
    activeObject,
    setActiveObject,
    layers,
    setLayers,
    syncLayers,
    history,
    historyIndex,
    pushHistory,
    undo,
    redo,
    isSaving,
    saveDesign,
    designId,
    setDesignId,
    designTitle,
    setDesignTitle,
    category,
    setCategory,
    zoom,
    setZoom,
    gridVisible,
    setGridVisible,
    snapToGrid,
    setSnapToGrid,
    selectedTool,
    setSelectedTool,
    brushColor,
    setBrushColor,
    brushWidth,
    setBrushWidth,
    brushType,
    setBrushType,
    productType,
    setProductType,
    productColor,
    setProductColor,
    activeSide,
    setActiveSide,
    textureVersion,
    notifyTextureUpdate,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,

    // ── New state ──
    activeMainView,
    setActiveMainView,
    activeRightPanel,
    setActiveRightPanel,

    // Simulation
    simulationRunning,
    setSimulationRunning,
    simulationMode,
    setSimulationMode,
    simulationStats,
    setSimulationStats,
    simulationRef,

    // Material
    materialPreset,
    setMaterialPreset,
    getDefaultMaterial,

    // Pattern
    patternPieces,
    setPatternPieces,
    activePatternPiece,
    setActivePatternPiece,
    patternScale,
    setPatternScale,
    syncPatternPieces,

    // Scene objects
    sceneObjects,
    setSceneObjects,
    selectedSceneObject,
    setSelectedSceneObject,
    syncSceneObjects,
  };

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
};

const DEFAULT_STUDIO_CONTEXT = {
  fabricRef: { current: null },
  activeObject: null,
  setActiveObject: () => {},
  layers: [],
  setLayers: () => {},
  history: [],
  historyIndex: -1,
  canUndo: false,
  canRedo: false,
  pushHistory: () => {},
  undo: () => {},
  redo: () => {},
  isSaving: false,
  designId: null,
  setDesignId: () => {},
  designTitle: 'Untitled Design',
  setDesignTitle: () => {},
  category: 'clothing',
  setCategory: () => {},
  zoom: 1,
  setZoom: () => {},
  gridVisible: false,
  setGridVisible: () => {},
  snapToGrid: true,
  setSnapToGrid: () => {},
  selectedTool: 'select',
  setSelectedTool: () => {},
  brushColor: '#C76D4A',
  setBrushColor: () => {},
  brushWidth: 10,
  setBrushWidth: () => {},
  brushType: 'pencil',
  setBrushType: () => {},
  productType: 'tshirt',
  setProductType: () => {},
  productColor: '#FFFFFF',
  setProductColor: () => {},
  activeSide: 'front',
  setActiveSide: () => {},
  textureVersion: 0,
  notifyTextureUpdate: () => {},
  activeMainView: 'view3d',
  setActiveMainView: () => {},
  activeRightPanel: 'objectBrowser',
  setActiveRightPanel: () => {},
  simulationRunning: false,
  setSimulationRunning: () => {},
  simulationMode: 'drape',
  setSimulationMode: () => {},
  simulationStats: { maxStrain: 0, avgStrain: 0, maxSeamGap: 0, solverIterationsUsed: 0, particleCount: 0 },
  setSimulationStats: () => {},
  resetSimulation: () => {},
  materialPreset: 'cotton',
  setMaterialPreset: () => {},
  patternPieces: [],
  setPatternPieces: () => {},
  activePatternPiece: null,
  setActivePatternPiece: () => {},
  patternScale: 1,
  setPatternScale: () => {},
  syncPatternPieces: () => {},
  sceneObjects: [],
  setSceneObjects: () => {},
  selectedSceneObject: null,
  setSelectedSceneObject: () => {},
  syncSceneObjects: () => {},
  saveDesign: async () => null,
  loadDesign: async () => null,
  clearCanvas: () => {},
  syncLayers: () => {},
};

export const useStudio = () => {
  const context = useContext(StudioContext);
  if (!context) {
    console.warn('useStudio was accessed without an enclosing StudioProvider; falling back to safe defaults.');
    return DEFAULT_STUDIO_CONTEXT;
  }
  return context;
};

export default StudioContext;
