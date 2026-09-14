import { useEffect, useRef, useCallback, useState } from 'react';
import { fabric } from 'fabric';
import { useStudio } from '@/context/StudioContext';
import { CANVAS_DIMENSIONS } from '@/lib/utils';
import {
  renderProductTemplate,
  isTemplateObject,
  createDesignZoneClipPath,
  getDefaultProductType,
  PRODUCT_TYPES,
  PRODUCT_COLORS,
} from '@/components/studio/ProductTemplate';

const StudioCanvas = ({ category }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const {
    fabricRef, setActiveObject, syncLayers, pushHistory,
    gridVisible, snapToGrid, zoom,
    selectedTool, setSelectedTool,
    brushColor, brushWidth, brushType,
    productType, setProductType,
    productColor, setProductColor,
    activeSide, setActiveSide,
    notifyTextureUpdate,
  } = useStudio();

  const dims = CANVAS_DIMENSIONS[category] || CANVAS_DIMENSIONS.artwork;

  // Mobile/viewport responsive scaling
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const fitWidth = containerWidth - 32;
      const fitHeight = containerHeight - 32;

      const scaleX = fitWidth / dims.width;
      const scaleY = fitHeight / dims.height;

      // Fit inside container but do not zoom past 100% (1.0)
      const newScale = Math.min(scaleX, scaleY, 1);
      setScale(newScale);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    const timer = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [dims.width, dims.height]);

  // Set default product type when category changes
  useEffect(() => {
    const defaultType = getDefaultProductType(category);
    setProductType(defaultType);
    setProductColor('#FFFFFF');
  }, [category, setProductType, setProductColor]);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: dims.width,
      height: dims.height,
      backgroundColor: '#f0ede6',
      preserveObjectStacking: true,
      selection: true,
      selectionColor: 'rgba(199, 109, 74, 0.1)',
      selectionBorderColor: '#C76D4A',
      selectionLineWidth: 1,
      controlsAboveOverlay: true,
    });

    fabric.Object.prototype.set({
      cornerColor: '#C76D4A',
      cornerStyle: 'circle',
      cornerSize: 8,
      transparentCorners: false,
      borderColor: '#C76D4A',
      borderScaleFactor: 1.5,
    });

    fabricRef.current = canvas;

    // Events — ignore template objects for selection
    canvas.on('selection:created', (e) => {
      const sel = e.selected?.[0];
      if (sel && !isTemplateObject(sel)) setActiveObject(sel);
    });
    canvas.on('selection:updated', (e) => {
      const sel = e.selected?.[0];
      if (sel && !isTemplateObject(sel)) setActiveObject(sel);
    });
    canvas.on('selection:cleared', () => setActiveObject(null));

    // Live texture updates & clip path enforcement for user objects
    const handleCanvasChange = (e) => {
      if (e?.target && isTemplateObject(e.target)) return;

      // Ensure user object has clipPath set to the design zone so it CANNOT bleed outside the item
      if (e?.target && !isTemplateObject(e.target) && e.target.id !== '__grid__' && !e.target.clipPath) {
        e.target.clipPath = createDesignZoneClipPath(productType);
      }

      notifyTextureUpdate();
    };

    canvas.on('object:modified', (e) => {
      if (e?.target && isTemplateObject(e.target)) return;
      handleCanvasChange(e);
      pushHistory();
      syncLayers();
    });

    canvas.on('object:moving', handleCanvasChange);
    canvas.on('object:scaling', handleCanvasChange);
    canvas.on('object:rotating', handleCanvasChange);

    canvas.on('object:added', (e) => {
      const obj = e?.target;
      if (obj && isTemplateObject(obj)) return;

      if (obj && !isTemplateObject(obj) && obj.id !== '__grid__') {
        // Tag object with current design side (front or back)
        if (!obj.side) {
          obj.side = activeSide;
        }
        // Enforce strict design zone clipping on added user objects
        obj.clipPath = createDesignZoneClipPath(productType, activeSide);
      }

      if (obj && obj.type === 'path' && !obj.id) {
        obj.set({
          id: `path_${Date.now()}`,
          customName: 'Brush Stroke',
        });
      }
      handleCanvasChange(e);
      syncLayers();
      pushHistory();
    });

    canvas.on('object:removed', (e) => {
      if (e?.target && isTemplateObject(e.target)) return;
      handleCanvasChange(e);
      syncLayers();
      pushHistory();
    });

    // Snap to grid
    canvas.on('object:moving', (e) => {
      if (!snapToGrid) return;
      const GRID = 20;
      e.target.set({
        left: Math.round(e.target.left / GRID) * GRID,
        top: Math.round(e.target.top / GRID) * GRID,
      });
    });

    // Keyboard shortcuts
    const handleKeyboard = (e) => {
      if (!canvas) return;
      const active = canvas.getActiveObject();
      if (document.activeElement !== document.body && document.activeElement.tagName !== 'CANVAS') return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (active && !isTemplateObject(active)) { canvas.remove(active); canvas.discardActiveObject(); canvas.renderAll(); }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (active && !isTemplateObject(active)) active.clone((cloned) => { canvas._clipboard = cloned; });
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        if (canvas._clipboard) {
          canvas._clipboard.clone((cloned) => {
            cloned.set({ left: cloned.left + 20, top: cloned.top + 20, id: Date.now(), side: activeSide });
            cloned.clipPath = createDesignZoneClipPath(productType, activeSide);
            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            canvas.renderAll();
          });
        }
      }
      if (active && !isTemplateObject(active) && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        active.set({ left: active.left + dx, top: active.top + dy });
        canvas.renderAll();
        notifyTextureUpdate();
      }
    };

    document.addEventListener('keydown', handleKeyboard);

    // Render product template & apply clip path
    renderProductTemplate(canvas, productType, productColor, dims.width, dims.height, activeSide);

    pushHistory();

    return () => {
      document.removeEventListener('keydown', handleKeyboard);
      canvas.dispose();
    };
  }, [category]);

  // Re-render product template & update clip path when product type, color, or active side changes
  useEffect(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    renderProductTemplate(canvas, productType, productColor, dims.width, dims.height, activeSide);

    // Toggle user objects visibility based on activeSide
    const clipPath = createDesignZoneClipPath(productType, activeSide);
    canvas.getObjects().forEach((obj) => {
      if (!isTemplateObject(obj) && obj.id !== '__grid__') {
        if (!obj.side) {
          obj.side = 'front';
        }
        obj.visible = (obj.side === activeSide);
        obj.clipPath = clipPath;
      }
    });
    canvas.discardActiveObject();
    canvas.renderAll();
    syncLayers();
    notifyTextureUpdate();
  }, [productType, productColor, activeSide]);

  // Handle Brush/Draw mode settings
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    if (selectedTool === 'draw') {
      canvas.isDrawingMode = true;

      if (brushType === 'spray') {
        canvas.freeDrawingBrush = new fabric.SprayBrush(canvas);
      } else if (brushType === 'circle') {
        canvas.freeDrawingBrush = new fabric.CircleBrush(canvas);
      } else {
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      }

      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = brushColor;
        canvas.freeDrawingBrush.width = brushWidth;
      }
    } else {
      canvas.isDrawingMode = false;
    }
  }, [selectedTool, brushColor, brushWidth, brushType, fabricRef.current]);

  // Grid overlay
  useEffect(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;

    const existingGrid = canvas.getObjects().filter((o) => o.id === '__grid__');
    existingGrid.forEach((g) => canvas.remove(g));

    if (gridVisible) {
      const GRID_SIZE = 20;
      const lines = [];
      for (let i = 0; i <= canvas.width; i += GRID_SIZE) {
        lines.push(new fabric.Line([i, 0, i, canvas.height], {
          stroke: 'rgba(99,102,241,0.15)', strokeWidth: 1, selectable: false, evented: false, id: '__grid__',
        }));
      }
      for (let j = 0; j <= canvas.height; j += GRID_SIZE) {
        lines.push(new fabric.Line([0, j, canvas.width, j], {
          stroke: 'rgba(99,102,241,0.15)', strokeWidth: 1, selectable: false, evented: false, id: '__grid__',
        }));
      }
      lines.forEach((l) => canvas.add(l));
      canvas.sendToBack(lines[0]);
      canvas.renderAll();
    }
  }, [gridVisible]);

  const types = PRODUCT_TYPES[category] || [];
  const colors = PRODUCT_COLORS[category] || [];
  const isGarment = ['clothing'].includes(category);

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Product selector strip */}
      <div className="flex-shrink-0 flex items-center gap-3 px-3 py-2 border-b border-glass-border bg-dark-900/20 overflow-x-auto no-scrollbar">
        {/* Product type chips */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-2xs font-semibold text-dark-500 uppercase tracking-wider mr-1 hidden sm:block">Product</span>
          {types.map(({ id, label, emoji }) => (
            <button
              key={id}
              onClick={() => setProductType(id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                productType === id
                  ? 'bg-brand-500/20 text-brand-400 ring-1 ring-brand-500/30'
                  : 'text-dark-400 hover:text-dark-200 hover:bg-white/5'
              }`}
              title={label}
            >
              <span className="text-sm">{emoji}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Front / Back Toggle (for garments) */}
        {isGarment && (
          <>
            <div className="w-px h-5 bg-glass-border flex-shrink-0" />
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-dark-950/60 border border-glass-border flex-shrink-0">
              <button
                onClick={() => setActiveSide('front')}
                className={`px-2.5 py-1 rounded-md text-2xs font-bold transition-all ${
                  activeSide === 'front' ? 'bg-brand-500 text-white' : 'text-dark-400 hover:text-white'
                }`}
              >
                Front
              </button>
              <button
                onClick={() => setActiveSide('back')}
                className={`px-2.5 py-1 rounded-md text-2xs font-bold transition-all ${
                  activeSide === 'back' ? 'bg-brand-500 text-white' : 'text-dark-400 hover:text-white'
                }`}
              >
                Back
              </button>
            </div>
          </>
        )}

        <div className="w-px h-5 bg-glass-border flex-shrink-0" />

        {/* Color picker */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-2xs font-semibold text-dark-500 uppercase tracking-wider mr-1 hidden sm:block">Color</span>
          {colors.map(({ id, hex, label }) => (
            <button
              key={id}
              onClick={() => setProductColor(hex)}
              className={`w-6 h-6 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                productColor === hex ? 'border-brand-500 ring-2 ring-brand-500/30 scale-110' : 'border-white/20'
              }`}
              style={{ background: hex }}
              title={label}
            />
          ))}
        </div>
      </div>

      {/* Canvas area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden flex items-center justify-center p-4 sm:p-8"
        style={{ background: 'repeating-conic-gradient(rgba(255,255,255,0.02) 0% 25%, transparent 0% 50%) 0 0 / 32px 32px' }}
      >
        <div
          className="relative transition-all duration-200"
          style={{
            boxShadow: '0 0 0 1px rgba(99,102,241,0.3), 0 20px 60px rgba(0,0,0,0.5)',
            borderRadius: 4,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            width: dims.width,
            height: dims.height,
          }}
        >
          <canvas ref={canvasRef} id="studio-canvas" />
        </div>
      </div>
    </div>
  );
};

export default StudioCanvas;
