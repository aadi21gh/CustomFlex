import { useEffect, useRef, useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SmileyMark } from '@/components/common/BrandLogo';
import {
  Save, Undo2, Redo2, ZoomIn, ZoomOut, Grid3X3, Eye, EyeOff,
  Download, ArrowLeft, Loader2, ShoppingCart, Palette, Settings,
  Check, Cloud, CloudLightning, Layers, Sliders, Type, Shapes,
  Smile, Upload, Wand2, Shirt, Sparkles, X, RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { StudioProvider, useStudio } from '@/context/StudioContext';
import StudioCanvas from '@/components/studio/Canvas';
import TextToolPanel from '@/components/studio/TextToolPanel';
import ShapeLibrary from '@/components/studio/ShapeLibrary';
import StickerLibrary from '@/components/studio/StickerLibrary';
import UploadToolPanel from '@/components/studio/UploadToolPanel';
import AIDesigner from '@/components/studio/AIDesigner';
import ProductFabricPanel from '@/components/studio/ProductFabricPanel';
import LayersPanel from '@/components/studio/LayersPanel';
import PropertiesPanel from '@/components/studio/PropertiesPanel';
import ProductPreview from '@/components/studio/ProductPreview';
import api from '@/lib/axios';

// Clipboard state helper
let localClipboardObj = null;

const StudioContent = ({ category, designId: editId }) => {
  const {
    fabricRef, undo, redo, canUndo, canRedo, isSaving, saveDesign,
    designTitle, setDesignTitle, setCategory, setDesignId, zoom, setZoom,
    gridVisible, setGridVisible, pushHistory, syncLayers,
    activeObject, productType, setProductType, productColor, setProductColor,
    fabricMaterial, setFabricMaterial, activeSide,
  } = useStudio();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchProductType = searchParams.get('productType');
  const searchMaterial = searchParams.get('material');
  const searchColor = searchParams.get('color');

  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'shapes' | 'stickers' | 'upload' | 'ai' | 'product' | 'layers'
  const [showPreview, setShowPreview] = useState(false);
  const [isLoadingDesign, setIsLoadingDesign] = useState(false);
  const [showRightInspector, setShowRightInspector] = useState(true);
  const [saveStatus, setSaveStatus] = useState('saved');

  // Set category and search param overrides on mount
  useEffect(() => {
    if (category) setCategory(category);
    if (searchProductType) setProductType(searchProductType);
    if (searchMaterial) setFabricMaterial(searchMaterial);
    if (searchColor) setProductColor(searchColor);
  }, [category, searchProductType, searchMaterial, searchColor, setCategory, setProductType, setFabricMaterial, setProductColor]);

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

  // Autosave monitor
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
    const canvas = fabricRef.current;

    // Temporarily hide editor guide boundaries & indicator badges
    const guideObjs = canvas.getObjects().filter((o) =>
      o.id === '__grid__' ||
      o.id?.includes('active_zone') ||
      o.id?.includes('active_label') ||
      o.id?.includes('inactive_zone') ||
      o.id?.includes('inactive_label')
    );

    const prevVis = guideObjs.map((o) => o.visible);
    guideObjs.forEach((o) => (o.visible = false));
    canvas.renderAll();

    const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 2 });

    // Restore guide indicators
    guideObjs.forEach((o, i) => (o.visible = prevVis[i]));
    canvas.renderAll();

    const link = document.createElement('a');
    link.download = `${(designTitle || 'crexza-design').toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = dataUrl;
    link.click();
    toast.success('High-resolution design exported!');
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
    setZoom(1);
    canvas.setZoom(1);
    canvas.renderAll();
  };

  const handleCheckout = async () => {
    setSaveStatus('saving');
    const savedDesign = await saveDesign(false);
    if (savedDesign) {
      setSaveStatus('saved');
      const params = new URLSearchParams({
        designId: savedDesign._id,
        category: category || 'clothing',
        productType: productType || 'tshirt',
        color: productColor || '#FFFFFF',
        material: fabricMaterial || 'cotton',
      });
      navigate(`/checkout?${params.toString()}`);
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

      const activeEl = document.activeElement;
      const isInput = activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.contentEditable === 'true';
      const isITextEditing = activeObj && activeObj.isEditing;

      if (isInput || isITextEditing) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        if (activeObj) {
          activeObj.clone((cloned) => {
            localClipboardObj = cloned;
            toast.success('Copied to clipboard', { duration: 800 });
          });
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        if (localClipboardObj) {
          localClipboardObj.clone((cloned) => {
            cloned.set({
              left: (localClipboardObj.left || 0) + 20,
              top: (localClipboardObj.top || 0) + 20,
              id: `clone_${Date.now()}`,
              evented: true,
              side: activeSide,
            });
            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            canvas.renderAll();
            pushHistory();
            syncLayers();
            localClipboardObj = cloned;
          });
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (activeObj) {
          activeObj.clone((cloned) => {
            cloned.set({
              left: activeObj.left + 20,
              top: activeObj.top + 20,
              id: `clone_${Date.now()}`,
              customName: `${activeObj.customName || 'Layer'} copy`,
              side: activeSide,
            });
            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            canvas.renderAll();
            pushHistory();
            syncLayers();
          });
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }

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

      if (e.key === 'Escape') {
        e.preventDefault();
        canvas.discardActiveObject();
        canvas.renderAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fabricRef.current, undo, redo, pushHistory, syncLayers, activeSide]);

  const handleGoBack = () => {
    try {
      if (window.history.length > 1 && window.history.state?.idx > 0) {
        navigate(-1);
      } else {
        navigate('/explore');
      }
    } catch {
      navigate('/explore');
    }
  };

  const navTools = [
    { id: 'text', label: 'Text', icon: Type },
    { id: 'shapes', label: 'Shapes', icon: Shapes },
    { id: 'stickers', label: 'Graphics', icon: Smile },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'ai', label: 'AI Magic', icon: Wand2 },
    { id: 'product', label: 'Product', icon: Shirt },
    { id: 'layers', label: 'Layers', icon: Layers },
  ];

  return (
    <div className="h-screen bg-dark-950 flex flex-col overflow-hidden text-white font-sans select-none">
      {/* ══════════════════════════════════════════════════════════════════
          TOP BAR
          ══════════════════════════════════════════════════════════════════ */}
      <header className="h-14 flex-shrink-0 flex items-center justify-between px-3 sm:px-5 border-b border-glass-border bg-dark-900/80 backdrop-blur-xl z-30">
        {/* Left: Brand & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handleGoBack}
            className="p-1.5 rounded-lg hover:bg-white/10 text-dark-400 hover:text-white transition-colors flex items-center gap-1"
            title="Go back to Explore"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <Link to="/" title="Crexza Home (:" className="hover:scale-105 transition-transform flex-shrink-0">
            <SmileyMark size="sm" />
          </Link>

          <div className="w-px h-5 bg-glass-border hidden sm:block" />

          {/* Inline Editable Design Title */}
          <div className="flex items-center gap-2">
            <input
              value={designTitle}
              onChange={(e) => setDesignTitle(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-bold text-white focus:outline-none border-b border-transparent hover:border-glass-border focus:border-brand-500 transition-colors px-1 py-0.5 max-w-[140px] sm:max-w-xs"
              placeholder="Untitled Design"
            />

            {/* Autosave Status Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 text-2xs select-none">
              {saveStatus === 'saved' && (
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <Cloud className="w-3 h-3 text-emerald-400" />
                  Saved
                </span>
              )}
              {saveStatus === 'saving' && (
                <span className="flex items-center gap-1 text-brand-400 font-semibold">
                  <Loader2 className="w-3 h-3 text-brand-400 animate-spin" />
                  Saving...
                </span>
              )}
              {saveStatus === 'dirty' && (
                <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                  <CloudLightning className="w-3 h-3 text-yellow-400" />
                  Unsaved
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Undo / Redo & Zoom Controls */}
        <div className="hidden md:flex items-center gap-1 bg-dark-950/60 p-1 rounded-xl border border-glass-border">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg hover:bg-white/10 text-dark-400 hover:text-white disabled:opacity-30 transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg hover:bg-white/10 text-dark-400 hover:text-white disabled:opacity-30 transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-glass-border mx-1" />

          <button
            onClick={() => handleZoom('out')}
            className="p-1.5 rounded-lg hover:bg-white/10 text-dark-400 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span
            onClick={handleZoomToFit}
            className="text-2xs font-mono text-dark-300 hover:text-white px-1.5 cursor-pointer"
            title="Reset Zoom"
          >
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => handleZoom('in')}
            className="p-1.5 rounded-lg hover:bg-white/10 text-dark-400 hover:text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-glass-border mx-1" />

          <button
            onClick={() => setGridVisible(!gridVisible)}
            className={`p-1.5 rounded-lg transition-colors ${gridVisible ? 'bg-brand-500/20 text-brand-400' : 'text-dark-400 hover:text-white'}`}
            title="Toggle Alignment Grid"
          >
            <Grid3X3 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(true)}
            className="px-2.5 py-1.5 rounded-xl border border-glass-border hover:border-brand-500/40 bg-dark-900/40 hover:bg-dark-900 text-xs font-semibold text-dark-300 hover:text-white flex items-center gap-1.5 transition-all hidden sm:flex"
            title="Preview 3D Simulation"
          >
            <Eye className="w-3.5 h-3.5 text-brand-400" />
            <span>3D Mockup</span>
          </button>

          <button
            onClick={handleExport}
            className="px-2.5 py-1.5 rounded-xl border border-glass-border hover:border-white/20 bg-dark-900/40 hover:bg-dark-900 text-xs font-semibold text-dark-300 hover:text-white flex items-center gap-1.5 transition-all hidden sm:flex"
            title="Download PNG"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="px-3 py-1.5 rounded-xl border border-glass-border hover:border-brand-500/40 bg-dark-900/60 hover:bg-dark-900 text-xs font-semibold text-white flex items-center gap-1.5 transition-all"
            title="Save as draft"
          >
            <Save className="w-3.5 h-3.5 text-brand-400" />
            <span className="hidden sm:inline">Draft</span>
          </button>

          <button
            onClick={handleCheckout}
            disabled={isSaving}
            className="btn-primary !py-1.5 !px-3.5 text-xs flex items-center gap-1.5 shadow-lg shadow-brand-500/25"
            id="studio-order-btn"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Order</span>
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════
          MAIN STUDIO WORKSPACE
          ══════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ── 1. Left Vertical Icon Dock ───────────────────────────────── */}
        <aside className="w-16 flex-shrink-0 flex flex-col items-center py-3 border-r border-glass-border bg-dark-950 z-20">
          <div className="flex flex-col gap-1.5 w-full px-2">
            {navTools.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                  activeTab === id
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                    : 'text-dark-400 hover:text-white hover:bg-dark-900/80'
                }`}
                title={label}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[9px] font-bold tracking-tight">{label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* ── 2. Active Tool Drawer / Panel ───────────────────────────── */}
        <div className="w-80 sm:w-88 flex-shrink-0 border-r border-glass-border bg-dark-900/50 backdrop-blur-md flex flex-col overflow-hidden z-10">
          {/* Drawer Title Header */}
          <div className="p-3.5 border-b border-glass-border flex items-center justify-between bg-dark-900/40">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-dark-300">
              {navTools.find(t => t.id === activeTab)?.label}
            </h2>
            <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wider">
              {activeSide === 'back' ? 'Editing Back' : 'Editing Front'}
            </span>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'text' && <TextToolPanel />}
            {activeTab === 'shapes' && <ShapeLibrary />}
            {activeTab === 'stickers' && <StickerLibrary />}
            {activeTab === 'upload' && <UploadToolPanel />}
            {activeTab === 'ai' && <AIDesigner />}
            {activeTab === 'product' && <ProductFabricPanel />}
            {activeTab === 'layers' && <LayersPanel />}
          </div>
        </div>

        {/* ── 3. Center Canvas Stage ───────────────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-dark-950">
          <StudioCanvas category={category} />
        </main>

        {/* ── 4. Right Properties Inspector (Collapsible / Contextual) ── */}
        {activeObject && (
          <aside className="w-72 flex-shrink-0 border-l border-glass-border bg-dark-900/50 backdrop-blur-md flex flex-col overflow-hidden z-10 animate-slideUp">
            <div className="p-3 border-b border-glass-border flex items-center justify-between bg-dark-900/40">
              <span className="text-xs font-extrabold uppercase tracking-wider text-dark-300">
                Layer Properties
              </span>
              <button
                onClick={() => fabricRef.current?.discardActiveObject().renderAll()}
                className="p-1 rounded-md hover:bg-white/10 text-dark-400 hover:text-white"
                title="Deselect"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <PropertiesPanel />
            </div>
          </aside>
        )}
      </div>

      {/* 3D Product Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl"
            >
              <ProductPreview category={category} onClose={() => setShowPreview(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {isLoadingDesign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/90 backdrop-blur-sm">
          <div className="glass-card p-8 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
            <p className="text-dark-300 font-semibold">Loading your design...</p>
          </div>
        </div>
      )}
    </div>
  );
};

const Studio = () => {
  const { category: pathCategory, designId: pathDesignId } = useParams();
  const [searchParams] = useSearchParams();

  const category = pathCategory || searchParams.get('category') || 'clothing';
  const designId = pathDesignId || searchParams.get('designId');

  return (
    <StudioProvider>
      <StudioContent category={category} designId={designId} />
    </StudioProvider>
  );
};

export default Studio;
