import { useEffect, useRef, useCallback, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SmileyMark } from '@/components/common/BrandLogo';
import {
  Save, Undo2, Redo2, ZoomIn, ZoomOut, Grid3X3, Eye, EyeOff,
  Download, Share2, ArrowLeft, Loader2, ShoppingCart, Palette, Settings,
  Check, Cloud, CloudLightning, Box, Scissors, Layers, Sliders,
  Monitor, Activity, Gauge, Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { StudioProvider, useStudio } from '@/context/StudioContext';
import StudioToolbar from '@/components/studio/Toolbar';
import StudioCanvas from '@/components/studio/Canvas';
import LayersPanel from '@/components/studio/LayersPanel';
import PropertiesPanel from '@/components/studio/PropertiesPanel';
import ShapeLibrary from '@/components/studio/ShapeLibrary';
import StickerLibrary from '@/components/studio/StickerLibrary';
import AIDesigner from '@/components/studio/AIDesigner';
import ProductPreview from '@/components/studio/ProductPreview';
import Product3DViewer from '@/components/studio/Product3DViewer';
import PatternEditor from '@/components/studio/PatternEditor';
import MaterialPreview from '@/components/studio/MaterialPreview';
import { STARTER_TEMPLATES } from '@/components/studio/templatesData';
import TemplatePickerModal from '@/components/studio/TemplatePickerModal';
import QuickTemplateCustomizer from '@/components/studio/QuickTemplateCustomizer';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';

// Clipboard state helper
let localClipboardObj = null;

const StudioContent = ({ category, designId: editId }) => {
  const { user, isAdmin } = useAuth();
  const isUserAdmin = Boolean(isAdmin || user?.role === 'admin');

  const {
    fabricRef, undo, redo, canUndo, canRedo, isSaving, saveDesign,
    designTitle, setDesignTitle, setCategory, setDesignId, zoom, setZoom,
    gridVisible, setGridVisible, pushHistory, syncLayers,
    // New state
    activeMainView, setActiveMainView,
    activeRightPanel, setActiveRightPanel,
    simulationRunning, simulationStats,
    selectedSceneObject, activePatternPiece,
    productType, setProductType,
  } = useStudio();
  const navigate = useNavigate();
  const [leftPanel, setLeftPanel] = useState('shapes');
  const [showPreview, setShowPreview] = useState(false);
  const [isLoadingDesign, setIsLoadingDesign] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved');

  // Easy Template mode vs Pro Studio mode (Pro Mode is only accessible to admins)
  const [customizerMode, setCustomizerMode] = useState(isUserAdmin && editId ? 'pro' : 'template');
  const [selectedTemplate, setSelectedTemplate] = useState(() => STARTER_TEMPLATES[0]);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

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
    setZoom(1);
    canvas.setZoom(1);
    canvas.renderAll();
  };

  const handleCheckout = async (checkoutMeta = {}) => {
    setSaveStatus('saving');
    const savedDesign = await saveDesign(false);
    if (savedDesign) {
      setSaveStatus('saved');
      const params = new URLSearchParams({
        designId: savedDesign._id,
        category: category || 'clothing',
      });
      if (checkoutMeta?.material?.id) {
        params.set('material', checkoutMeta.material.id);
      }
      if (checkoutMeta?.totalPrice) {
        params.set('price', checkoutMeta.totalPrice);
      }
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
  }, [fabricRef.current, undo, redo, pushHistory, syncLayers]);

  // View tab configs
  const mainViewTabs = [
    { id: 'view3d', icon: Box, label: '3D View' },
    { id: 'canvas2d', icon: Monitor, label: '2D Canvas' },
    { id: 'patternDraft', icon: Scissors, label: 'Pattern' },
  ];

  // Right panel tab configs
  const rightPanelTabs = [
    { id: 'objectBrowser', icon: Layers, label: 'Objects' },
    { id: 'materialPreview', icon: Palette, label: 'Material' },
    { id: 'properties', icon: Sliders, label: 'Properties' },
  ];

  // Determine which properties panel to show
  const getPropertiesContent = () => {
    // If a simulation object is selected
    if (selectedSceneObject && selectedSceneObject.startsWith('__sim_')) {
      return <SimulationPropertiesPanel />;
    }
    // If a pattern piece is selected
    if (activePatternPiece || (selectedSceneObject && selectedSceneObject.startsWith('__pattern_'))) {
      return <PatternPropertiesPanel />;
    }
    // Default: design object properties
    return <PropertiesPanel />;
  };

  return (
    <div className="h-screen bg-dark-950 flex flex-col overflow-hidden">
      {/* ══════════════════════════════════════════════════════════════════
          TOP BAR
          ══════════════════════════════════════════════════════════════════ */}
      <div className="h-14 flex-shrink-0 flex items-center gap-2 sm:gap-4 px-2.5 sm:px-4 border-b border-glass-border bg-dark-900/80 backdrop-blur-xl">
        {/* Left */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-1 sm:flex-initial min-w-0">
          <button onClick={() => navigate(-1)} className="toolbar-btn animate-fadeIn" title="Go back">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <Link to="/" title="Crexza Home (:" className="hover:scale-105 transition-transform flex-shrink-0">
            <SmileyMark size="sm" />
          </Link>
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
          <div className="w-px h-5 bg-glass-border hidden sm:block" />
          <input
            value={designTitle}
            onChange={(e) => setDesignTitle(e.target.value)}
            className="bg-transparent text-xs sm:text-sm font-semibold text-white focus:outline-none border-b border-transparent hover:border-glass-border focus:border-brand-500 transition-colors px-1 py-0.5 max-w-[100px] sm:max-w-xs hidden sm:block"
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

        {/* Center — Mode Switcher (Admin Only) & Pro Tools */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Mode Switcher: Easy Mode vs Pro Studio (Admin Only) */}
          {isUserAdmin && (
            <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-dark-900/60 border border-glass-border">
              <button
                onClick={() => setCustomizerMode('template')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  customizerMode === 'template'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-dark-400 hover:text-brand-500'
                }`}
                title="Simple template customization"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Easy Mode</span>
              </button>
              <button
                onClick={() => setCustomizerMode('pro')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  customizerMode === 'pro'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-dark-400 hover:text-brand-500'
                }`}
                title="Full design canvas & 3D tools (Admin)"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Pro Studio</span>
              </button>
            </div>
          )}

          {/* Pro Tools (only visible in Pro Mode) */}
          {customizerMode === 'pro' ? (
            <>
              {/* View Switcher Tabs */}
              <div className="hidden md:flex items-center gap-0.5 p-0.5 rounded-lg bg-dark-950/60 border border-glass-border">
                {mainViewTabs.map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveMainView(id)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-2xs font-bold transition-all ${
                      activeMainView === id
                        ? 'bg-brand-500 text-white shadow-sm'
                        : 'text-dark-400 hover:text-brand-500'
                    }`}
                    title={label}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">{label}</span>
                  </button>
                ))}
              </div>

              <button onClick={undo} disabled={!canUndo} className="toolbar-btn disabled:opacity-30" title="Undo (Ctrl+Z)"><Undo2 className="w-4 h-4" /></button>
              <button onClick={redo} disabled={!canRedo} className="toolbar-btn disabled:opacity-30" title="Redo (Ctrl+Y)"><Redo2 className="w-4 h-4" /></button>
              
              <div className="hidden md:flex items-center gap-1">
                <div className="w-px h-5 bg-glass-border mx-1" />
                <button onClick={() => handleZoom('out')} className="toolbar-btn" title="Zoom out"><ZoomOut className="w-4 h-4" /></button>
                <span className="text-xs text-dark-300 w-10 text-center font-mono cursor-pointer hover:text-brand-500 transition-colors" title="Zoom to Fit" onClick={handleZoomToFit}>
                  {Math.round(zoom * 100)}%
                </span>
                <button onClick={() => handleZoom('in')} className="toolbar-btn" title="Zoom in"><ZoomIn className="w-4 h-4" /></button>
              </div>

              <div className="w-px h-5 bg-glass-border mx-1 hidden sm:block" />
              <button onClick={() => setGridVisible(!gridVisible)} className={`toolbar-btn ${gridVisible ? 'active' : ''} hidden sm:flex`} title="Toggle grid">
                <Grid3X3 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="toolbar-btn !w-auto px-3 text-xs font-semibold gap-1.5 text-brand-500 hover:text-brand-600 bg-brand-500/10 border border-brand-500/20"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Templates</span>
            </button>
          )}

          <button onClick={() => setShowPreview(!showPreview)} className={`toolbar-btn ${showPreview ? 'active' : ''}`} title="Product preview">
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-initial justify-end min-w-0">
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
          <button onClick={handleExport} className="toolbar-btn text-xs gap-1.5 px-2.5 sm:px-3 !w-auto hidden sm:flex" title="Export PNG">
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-secondary !py-1.5 !px-2.5 sm:!py-2 sm:!px-4 text-xs flex items-center gap-1 sm:gap-1.5"
            title="Save design"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-500" /> : <Save className="w-3.5 h-3.5 text-brand-500" />}
            <span>Save</span>
          </button>
          <button
            onClick={handleCheckout}
            disabled={isSaving}
            className="btn-primary !py-1.5 !px-2 sm:!py-2 sm:!px-4 text-xs flex items-center gap-1 sm:gap-1.5 animate-pulse"
            id="studio-checkout-btn"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Order</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MAIN LAYOUT: Quick Creator vs Pro Studio
          ══════════════════════════════════════════════════════════════════ */}
      {customizerMode === 'template' ? (
        <QuickTemplateCustomizer
          template={selectedTemplate}
          category={category}
          onSwitchToPro={() => isUserAdmin && setCustomizerMode('pro')}
          onCheckout={handleCheckout}
          isSaving={isSaving}
        />
      ) : (
        <>
          <div className="flex flex-1 overflow-hidden relative">
          {/* Tap-to-close backdrop overlay for mobile view drawers */}
          {(showLeftPanel || showRightPanel) && (
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-xs z-10 md:hidden animate-fadeIn"
              onClick={() => {
                setShowLeftPanel(false);
                setShowRightPanel(false);
              }}
            />
          )}

        {/* ── Left Panel (Elements/Stickers/AI) ─────────────────────── */}
        <div className={`w-64 flex-shrink-0 flex flex-col border-r border-glass-border bg-dark-950/95 fixed md:relative z-20 top-14 md:top-0 bottom-0 left-0 transition-transform duration-300 md:translate-x-0 ${showLeftPanel ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex border-b border-glass-border">
            {[
              { id: 'shapes', label: 'Elements' },
              { id: 'stickers', label: 'Stickers' },
              { id: 'ai', label: 'AI Designer' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setLeftPanel(id)}
                className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${leftPanel === id ? 'text-brand-500 border-b-2 border-brand-500 font-bold' : 'text-dark-400 hover:text-brand-500'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            {leftPanel === 'shapes' ? (
              <ShapeLibrary />
            ) : leftPanel === 'stickers' ? (
              <StickerLibrary />
            ) : (
              <AIDesigner />
            )}
          </div>
        </div>

        {/* ── Main Viewport Area ─────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile view switcher (md:hidden) */}
          <div className="flex md:hidden items-center gap-0.5 p-1 border-b border-glass-border bg-dark-900/40">
            {mainViewTabs.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveMainView(id)}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-2xs font-bold transition-all ${
                  activeMainView === id
                    ? 'bg-brand-500 text-dark-950'
                    : 'text-dark-400'
                }`}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>

          {/* Toolbar (for 2D Canvas mode) */}
          {activeMainView === 'canvas2d' && <StudioToolbar />}

          {/* Active View Content */}
          <div className="flex-1 overflow-hidden relative">
            {activeMainView === 'view3d' && (
              <Product3DViewer />
            )}
            {activeMainView === 'canvas2d' && (
              <StudioCanvas category={category} />
            )}
            {activeMainView === 'patternDraft' && (
              <PatternEditor />
            )}
          </div>
        </div>

        {/* ── Right Sidebar ──────────────────────────────────────────── */}
        <div className={`w-72 flex-shrink-0 flex flex-col border-l border-glass-border bg-dark-950/95 fixed md:relative z-20 top-14 md:top-0 bottom-0 right-0 transition-transform duration-300 md:translate-x-0 ${showRightPanel ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Right panel tab bar */}
          <div className="flex border-b border-glass-border flex-shrink-0">
            {rightPanelTabs.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveRightPanel(id)}
                className={`flex-1 flex items-center justify-center gap-1 py-2.5 text-xs font-semibold transition-colors ${
                  activeRightPanel === id
                    ? 'text-brand-500 border-b-2 border-brand-500 font-bold'
                    : 'text-dark-400 hover:text-brand-500'
                }`}
                title={label}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Right panel content */}
          <div className="flex-1 overflow-y-auto">
            {activeRightPanel === 'objectBrowser' && (
              <LayersPanel />
            )}
            {activeRightPanel === 'materialPreview' && (
              <MaterialPreview />
            )}
            {activeRightPanel === 'properties' && (
              <PropertiesPanel />
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          BOTTOM STATUS BAR
          ══════════════════════════════════════════════════════════════════ */}
      <div className="h-7 flex-shrink-0 flex items-center gap-4 px-3 border-t border-glass-border bg-dark-900/60 text-2xs text-dark-500 select-none">
        {/* Simulation status */}
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3" />
          <span>XPBD:</span>
          {simulationRunning ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Running
            </span>
          ) : (
            <span className="text-dark-600">Paused</span>
          )}
        </div>

        <div className="w-px h-3 bg-glass-border" />

        {/* Strain */}
        <div className="flex items-center gap-1">
          <Gauge className="w-3 h-3" />
          <span>Strain: </span>
          <span className="font-mono" style={{
            color: simulationStats.maxStrain > 0.5 ? '#ef4444' : simulationStats.maxStrain > 0.2 ? '#eab308' : '#22c55e'
          }}>
            {(simulationStats.maxStrain * 100).toFixed(1)}%
          </span>
        </div>

        {/* FPS */}
        <div className="flex items-center gap-1">
          <span>FPS:</span>
          <span className="font-mono text-dark-400">{simulationStats.fps}</span>
        </div>

        {/* Solver */}
        <div className="hidden sm:flex items-center gap-1">
          <span>Solver:</span>
          <span className="font-mono text-dark-400">{simulationStats.solverIterationsUsed} iter</span>
        </div>

        {/* Seam gap */}
        <div className="hidden sm:flex items-center gap-1">
          <span>Gap:</span>
          <span className="font-mono text-dark-400">{(simulationStats.maxSeamGap * 1000).toFixed(1)}mm</span>
        </div>

        {/* View mode */}
        <div className="ml-auto flex items-center gap-1">
          <span className="text-dark-600">{activeMainView === 'view3d' ? '3D View' : activeMainView === 'canvas2d' ? '2D Canvas' : 'Pattern'}</span>
          <span className="text-dark-600">|</span>
          <span className="text-dark-600 capitalize">{category}</span>
        </div>
      </div>
      </>
      )}

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
              <ProductPreview category={category} onClose={() => setShowPreview(false)} />
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

      {/* Template Picker Modal */}
      <TemplatePickerModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={(tmpl, prodType) => {
          setSelectedTemplate(tmpl);
          if (prodType) {
            setProductType(prodType);
          }
          setCustomizerMode('template');
          setIsTemplateModalOpen(false);
        }}
        onSelectBlank={() => {
          setCustomizerMode('pro');
          setIsTemplateModalOpen(false);
        }}
      />
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
