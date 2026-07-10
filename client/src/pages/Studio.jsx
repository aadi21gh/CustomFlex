import { useEffect, useRef, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Undo2, Redo2, ZoomIn, ZoomOut, Grid3X3, Eye, EyeOff,
  Download, Share2, ArrowLeft, Loader2, ShoppingCart, Palette, Settings,
  Check, Cloud, CloudLightning
} from 'lucide-react';
import toast from 'react-hot-toast';
import { StudioProvider, useStudio } from '@/context/StudioContext';
import StudioToolbar from '@/components/studio/Toolbar';
import StudioCanvas from '@/components/studio/Canvas';
import LayersPanel from '@/components/studio/LayersPanel';
import PropertiesPanel from '@/components/studio/PropertiesPanel';
import ShapeLibrary from '@/components/studio/ShapeLibrary';
import AIImageGenerator from '@/components/studio/AIImageGenerator';
import ProductPreview from '@/components/studio/ProductPreview';
import api from '@/lib/axios';

// Clipboard state helper
let localClipboardObj = null;

const StudioContent = ({ category, designId: editId }) => {
  const {
    fabricRef, undo, redo, canUndo, canRedo, isSaving, saveDesign,
    designTitle, setDesignTitle, setCategory, setDesignId, zoom, setZoom,
    gridVisible, setGridVisible, pushHistory, syncLayers,
  } = useStudio();
  const navigate = useNavigate();
  const [leftPanel, setLeftPanel] = useState('shapes'); // 'shapes' | 'ai'
  const [showPreview, setShowPreview] = useState(false);
  const [isLoadingDesign, setIsLoadingDesign] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'dirty'

  // Set category on mount
  useEffect(() => {
    setCategory(category);
  }, [category, setCategory]);

  // Load existing design if editing
  useEffect(() => {
    if (editId) {
      const loadDesign = async () => {
        setIsLoadingDesign(true);
        try {
          const { data } = await api.get(`/designs/${editId}`);
          setDesignTitle(data.design.title);
          setDesignId(editId);
          if (fabricRef.current && data.design.canvasData) {
            fabricRef.current.loadFromJSON(data.design.canvasData, () => {
              fabricRef.current.renderAll();
              syncLayers();
              pushHistory();
              // Zoom to fit after loaded
              handleZoomToFit();
            });
          }
        } catch (err) {
          toast.error('Failed to load design');
        } finally {
          setIsLoadingDesign(false);
        }
      };
      loadDesign();
    }
  }, [editId]);

  // Autosave monitor - sets status to dirty when modifications occur
  useEffect(() => {
    if (!fabricRef.current) return;
    const markDirty = () => setSaveStatus('dirty');
    fabricRef.current.on('object:added', markDirty);
    fabricRef.current.on('object:modified', markDirty);
    fabricRef.current.on('object:removed', markDirty);
    return () => {
      if (fabricRef.current) {
        fabricRef.current.off('object:added', markDirty);
        fabricRef.current.off('object:modified', markDirty);
        fabricRef.current.off('object:removed', markDirty);
      }
    };
  }, [fabricRef.current]);

  const handleSave = async () => {
    setSaveStatus('saving');
    const result = await saveDesign(false);
    if (result) {
      setSaveStatus('saved');
    } else {
      setSaveStatus('dirty');
    }
  };

  const handleSaveDraft = async () => {
    setSaveStatus('saving');
    const result = await saveDesign(true);
    if (result) {
      setSaveStatus('saved');
    } else {
      setSaveStatus('dirty');
    }
  };

  const handleExport = () => {
    if (!fabricRef.current) return;
    const dataUrl = fabricRef.current.toDataURL({ format: 'png', multiplier: 2 });
    const link = document.createElement('a');
    link.download = `${designTitle || 'design'}.png`;
    link.href = dataUrl;
    link.click();
    toast.success('Design exported!');
  };

  const handleZoom = (direction) => {
    const newZoom = direction === 'in' ? Math.min(zoom + 0.1, 3) : Math.max(zoom - 0.1, 0.3);
    setZoom(newZoom);
    if (fabricRef.current) {
      fabricRef.current.setZoom(newZoom);
      fabricRef.current.renderAll();
    }
  };

  const handleZoomToFit = () => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    // Simple fit logic based on wrapper dimensions (standard sizing)
    setZoom(1);
    canvas.setZoom(1);
    canvas.renderAll();
  };

  const handleCheckout = async () => {
    setSaveStatus('saving');
    const savedDesign = await saveDesign(false);
    if (savedDesign) {
      setSaveStatus('saved');
      navigate(`/checkout?designId=${savedDesign._id}&category=${category}`);
    } else {
      setSaveStatus('dirty');
    }
  };

  /* ── Keyboard Shortcuts ── */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!fabricRef.current) return;
      const canvas = fabricRef.current;
      const activeObj = canvas.getActiveObject();

      // Skip shortcuts if the user is typing in a text field
      const activeEl = document.activeElement;
      const isInput = activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.contentEditable === 'true';
      const isITextEditing = activeObj && activeObj.isEditing;

      if (isInput || isITextEditing) {
        return;
      }

      // 1. Copy (Ctrl + C)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        if (activeObj) {
          activeObj.clone((cloned) => {
            localClipboardObj = cloned;
            toast.success('Copied to clipboard', { duration: 800 });
          });
        }
      }

      // 2. Paste (Ctrl + V)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        if (localClipboardObj) {
          localClipboardObj.clone((cloned) => {
            cloned.set({
              left: (localClipboardObj.left || 0) + 20,
              top: (localClipboardObj.top || 0) + 20,
              id: `clone_${Date.now()}`,
              evented: true,
            });
            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            canvas.renderAll();
            pushHistory();
            syncLayers();
            localClipboardObj = cloned; // set up next paste
          });
        }
      }

      // 3. Duplicate (Ctrl + D)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (activeObj) {
          activeObj.clone((cloned) => {
            cloned.set({
              left: activeObj.left + 20,
              top: activeObj.top + 20,
              id: `clone_${Date.now()}`,
              customName: `${activeObj.customName || 'Layer'} copy`,
            });
            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            canvas.renderAll();
            pushHistory();
            syncLayers();
          });
        }
      }

      // 4. Undo (Ctrl + Z)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      }

      // 5. Redo (Ctrl + Y)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }

      // 6. Delete / Backspace (Del / Backspace)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (activeObj) {
          canvas.remove(activeObj);
          canvas.discardActiveObject();
          canvas.renderAll();
          pushHistory();
          syncLayers();
        }
      }

      // 7. Escape (Deselct selection)
      if (e.key === 'Escape') {
        e.preventDefault();
        canvas.discardActiveObject();
        canvas.renderAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fabricRef.current, undo, redo, pushHistory, syncLayers]);

  return (
    <div className="h-screen bg-dark-950 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="h-14 flex-shrink-0 flex items-center gap-4 px-4 border-b border-glass-border bg-dark-900/80 backdrop-blur-xl">
        {/* Left */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1">
          <button onClick={() => navigate(-1)} className="toolbar-btn animate-fadeIn" title="Go back">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setShowLeftPanel(!showLeftPanel);
              setShowRightPanel(false);
            }}
            className={`toolbar-btn md:hidden ${showLeftPanel ? 'bg-brand-500/20 text-brand-300' : ''}`}
            title="Toggle Elements"
          >
            <Palette className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-glass-border" />
          {/* Editable title */}
          <input
            value={designTitle}
            onChange={(e) => setDesignTitle(e.target.value)}
            className="bg-transparent text-xs sm:text-sm font-semibold text-white focus:outline-none border-b border-transparent hover:border-glass-border focus:border-brand-500 transition-colors px-1 py-0.5 max-w-[100px] sm:max-w-xs"
            id="design-title-input"
          />
          
          {/* Autosave Status Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 ml-2 text-xs text-dark-500 select-none">
            {saveStatus === 'saved' && (
              <>
                <Cloud className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-medium">All changes saved</span>
              </>
            )}
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="w-3.5 h-3.5 text-brand-400 animate-spin" />
                <span className="text-brand-400">Saving...</span>
              </>
            )}
            {saveStatus === 'dirty' && (
              <>
                <CloudLightning className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
                <span className="text-yellow-500">Unsaved changes</span>
              </>
            )}
          </div>
        </div>

        {/* Center — History & Zoom */}
        <div className="flex items-center gap-1">
          <button onClick={undo} disabled={!canUndo} className="toolbar-btn disabled:opacity-30" title="Undo (Ctrl+Z)"><Undo2 className="w-4 h-4" /></button>
          <button onClick={redo} disabled={!canRedo} className="toolbar-btn disabled:opacity-30" title="Redo (Ctrl+Y)"><Redo2 className="w-4 h-4" /></button>
          <div className="w-px h-5 bg-glass-border mx-1" />
          <button onClick={() => handleZoom('out')} className="toolbar-btn" title="Zoom out"><ZoomOut className="w-4 h-4" /></button>
          <span className="text-xs text-dark-300 w-10 text-center font-mono cursor-pointer hover:text-white transition-colors" title="Zoom to Fit" onClick={handleZoomToFit}>
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={() => handleZoom('in')} className="toolbar-btn" title="Zoom in"><ZoomIn className="w-4 h-4" /></button>
          <div className="w-px h-5 bg-glass-border mx-1 hidden sm:block" />
          <button onClick={() => setGridVisible(!gridVisible)} className={`toolbar-btn ${gridVisible ? 'active' : ''} hidden sm:flex`} title="Toggle grid">
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button onClick={() => setShowPreview(!showPreview)} className={`toolbar-btn ${showPreview ? 'active' : ''}`} title="Product preview">
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-end">
          <button
            onClick={() => {
              setShowRightPanel(!showRightPanel);
              setShowLeftPanel(false);
            }}
            className={`toolbar-btn md:hidden ${showRightPanel ? 'bg-brand-500/20 text-brand-300' : ''}`}
            title="Toggle Properties"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button onClick={handleSaveDraft} className="toolbar-btn text-xs gap-1.5 px-3 !w-auto hidden sm:flex" title="Save as draft">
            <Save className="w-3.5 h-3.5" />
            Draft
          </button>
          <button onClick={handleExport} className="toolbar-btn text-xs gap-1.5 px-2.5 sm:px-3 !w-auto" title="Export PNG">
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white transition-all bg-white/5 border border-glass-border hover:bg-white/10"
            title="Save design"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Save</span>
          </button>
          <button
            onClick={handleCheckout}
            disabled={isSaving}
            className="btn-primary !py-1.5 !px-2.5 sm:!py-2 sm:!px-4 text-xs sm:text-sm animate-pulse"
            id="studio-checkout-btn"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Order
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Panel */}
        <div className={`w-64 flex-shrink-0 flex flex-col border-r border-glass-border bg-dark-950/95 fixed md:relative z-20 top-0 bottom-0 left-0 transition-transform duration-300 md:translate-x-0 ${showLeftPanel ? 'translate-x-0' : '-translate-x-full'}`}>
          {/* Tab switcher */}
          <div className="flex border-b border-glass-border">
            {[
              { id: 'shapes', label: 'Elements' },
              { id: 'ai', label: 'AI Art' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setLeftPanel(id)}
                className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${leftPanel === id ? 'text-brand-400 border-b-2 border-brand-500' : 'text-dark-400 hover:text-white'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            {leftPanel === 'shapes' ? <ShapeLibrary /> : <AIImageGenerator />}
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <StudioToolbar />
          {/* Canvas */}
          <div className="flex-1 overflow-hidden">
            <StudioCanvas category={category} />
          </div>
        </div>

        {/* Right Panel */}
        <div className={`w-72 flex-shrink-0 flex flex-col border-l border-glass-border bg-dark-950/95 fixed md:relative z-20 top-0 bottom-0 right-0 transition-transform duration-300 md:translate-x-0 ${showRightPanel ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Layers Panel (top) */}
          <div className="h-64 border-b border-glass-border">
            <LayersPanel />
          </div>
          {/* Properties Panel (bottom) */}
          <div className="flex-1 overflow-y-auto">
            <PropertiesPanel />
          </div>
        </div>
      </div>

      {/* Product Preview Overlay */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ProductPreview category={category} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading overlay */}
      {isLoadingDesign && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-dark-950/90 backdrop-blur-sm">
          <div className="glass-card p-8 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
            <p className="text-dark-300">Loading your design...</p>
          </div>
        </div>
      )}
    </div>
  );
};

const Studio = () => {
  const { category, designId } = useParams();

  return (
    <StudioProvider>
      <StudioContent category={category || 'artwork'} designId={designId} />
    </StudioProvider>
  );
};

export default Studio;
