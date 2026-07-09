import { createContext, useContext, useState, useRef, useCallback } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

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

  const canvas = useCallback(() => fabricRef.current, []);

  // Update layers list from canvas objects
  const syncLayers = useCallback(() => {
    if (!fabricRef.current) return;
    const objects = fabricRef.current.getObjects();
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

  // Push to history
  const pushHistory = useCallback(() => {
    if (!fabricRef.current) return;
    const state = JSON.stringify(fabricRef.current.toJSON(['id', 'customName', 'selectable']));
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
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  };

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
};

export const useStudio = () => {
  const context = useContext(StudioContext);
  if (!context) throw new Error('useStudio must be used within StudioProvider');
  return context;
};

export default StudioContext;
