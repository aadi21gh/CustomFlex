import { useEffect, useRef, useCallback, useState } from 'react';
import { fabric } from 'fabric';
import { useStudio } from '@/context/StudioContext';
import { CANVAS_DIMENSIONS } from '@/lib/utils';
import {
  renderProductTemplate,
  isTemplateObject,
  createDesignZoneClipPath,
  getDefaultProductType,
  getDesignZone,
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

  const activeSideRef = useRef(activeSide);
  activeSideRef.current = activeSide;

  const productTypeRef = useRef(productType);
  productTypeRef.current = productType;

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

  // Set default product type when category changes (preserve user-selected color)
  useEffect(() => {
    const defaultType = getDefaultProductType(category);
    setProductType(defaultType);
  }, [category, setProductType]);


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
      if (sel && !isTemplateObject(sel)) {
        setActiveObject(sel);
        if (sel.side && sel.side !== activeSideRef.current) {
          setActiveSide(sel.side);
        }
      }
    });
    canvas.on('selection:updated', (e) => {
      const sel = e.selected?.[0];
      if (sel && !isTemplateObject(sel)) {
        setActiveObject(sel);
        if (sel.side && sel.side !== activeSideRef.current) {
          setActiveSide(sel.side);
        }
      }
    });
    canvas.on('selection:cleared', () => setActiveObject(null));

    // Live texture updates for user objects
    const handleCanvasChange = (e) => {
      if (e?.target && isTemplateObject(e.target)) return;
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
      if (!obj || isTemplateObject(obj) || obj.id === '__grid__') return;

      const currentSide = obj.side || activeSideRef.current || 'front';
      const curProduct = productTypeRef.current;
      const zone = getDesignZone(curProduct, currentSide, dims.width, dims.height);
      const centerX = zone.x + zone.w / 2;
      const centerY = zone.y + zone.h / 2;

      // Ensure side and interactivity are assigned
      if (!obj.side) {
        obj.side = currentSide;
      }

      // If placed way outside zone or at random default offset, center inside the active print zone
      const isInside =
        obj.left !== undefined &&
        obj.left >= zone.x - 30 &&
        obj.left <= zone.x + zone.w + 30 &&
        obj.top >= zone.y - 30 &&
        obj.top <= zone.y + zone.h + 30;

      if (!isInside && (obj.left === undefined || obj.left === 0 || obj.left === 60 || obj.left === 80 || obj.left === 100 || obj.left === 120 || obj.left === 150 || obj.left === 200)) {
        obj.set({
          left: centerX,
          top: centerY,
          originX: 'center',
          originY: 'center',
        });
      }

      const isCurrent = (obj.side || currentSide) === activeSideRef.current;
      obj.set({
        visible: isCurrent,
        selectable: isCurrent,
        evented: isCurrent,
      });

      if (obj.type === 'path' && !obj.id) {
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

    // Interactive switch when clicking on garments
    canvas.on('mouse:down', (e) => {
      if (e.target && !isTemplateObject(e.target)) {
        if (e.target.side && e.target.side !== activeSideRef.current) {
          setActiveSide(e.target.side);
        }
        return;
      }
      const pointer = canvas.getPointer(e.e);
      const curProduct = productTypeRef.current;
      const frontZone = getDesignZone(curProduct, 'front', dims.width, dims.height);
      const backZone = getDesignZone(curProduct, 'back', dims.width, dims.height);

      if (
        pointer.x >= frontZone.x - 15 &&
        pointer.x <= frontZone.x + frontZone.w + 15 &&
        pointer.y >= frontZone.y - 15 &&
        pointer.y <= frontZone.y + frontZone.h + 15
      ) {
        if (activeSideRef.current !== 'front') {
          setActiveSide('front');
        }
      } else if (
        pointer.x >= backZone.x - 15 &&
        pointer.x <= backZone.x + backZone.w + 15 &&
        pointer.y >= backZone.y - 15 &&
        pointer.y <= backZone.y + backZone.h + 15
      ) {
        if (activeSideRef.current !== 'back') {
          setActiveSide('back');
        }
      }
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
            cloned.set({ left: cloned.left + 20, top: cloned.top + 20, id: Date.now(), side: activeSide, selectable: true, evented: true });
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

    // Render product template
    renderProductTemplate(canvas, productType, productColor, dims.width, dims.height, activeSide);

    pushHistory();

    return () => {
      document.removeEventListener('keydown', handleKeyboard);
      canvas.dispose();
    };
  }, [category]);

  // Re-render product template & update object visibility when product type, color, or active side changes
  useEffect(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    renderProductTemplate(canvas, productType, productColor, dims.width, dims.height, activeSide);

    // Toggle user objects visibility and interactivity based on activeSide (Front vs Back)
    canvas.getObjects().forEach((obj) => {
      if (!isTemplateObject(obj) && obj.id !== '__grid__') {
        if (!obj.side) {
          obj.side = 'front';
        }
        const isCurrent = obj.side === activeSide;
        obj.set({
          visible: isCurrent,
          selectable: isCurrent,
          evented: isCurrent,
        });
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
  const isGarment = category === 'clothing' || ['tshirt', 'oversized', 'hoodie', 'sweatshirt', 'longsleeve', 'tanktop', 'polo', 'jacket'].includes(productType);

  const frontCount = fabricRef.current?.getObjects().filter((o) => !isTemplateObject(o) && o.id !== '__grid__' && (o.side === 'front' || !o.side)).length || 0;
  const backCount = fabricRef.current?.getObjects().filter((o) => !isTemplateObject(o) && o.id !== '__grid__' && o.side === 'back').length || 0;

  return (
    <div className="flex-1 overflow-hidden flex flex-col relative bg-dark-950">
      {/* ── Top Floating View Switcher & Product Bar ── */}
      <div className="flex-shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 border-b border-glass-border bg-dark-900/60 backdrop-blur-md z-10">
        {/* Left: Product Type & Color summary */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-dark-950/80 border border-glass-border text-xs font-semibold text-white">
            <span>{types.find(t => t.id === productType)?.emoji || '👕'}</span>
            <span className="hidden sm:inline capitalize">{productType}</span>
          </div>

          {/* Quick Color Circle */}
          <div
            className="w-5 h-5 rounded-full border border-white/30 shadow-xs"
            style={{ background: productColor }}
            title={`Color: ${productColor}`}
          />
        </div>

        {/* Center: Prominent FRONT / BACK View Selector */}
        {isGarment ? (
          <div className="flex items-center p-0.5 rounded-xl bg-dark-950 border border-brand-500/30 shadow-lg shadow-black/40">
            <button
              onClick={() => setActiveSide('front')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSide === 'front'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800/60'
              }`}
            >
              <span>👕 Front</span>
              {frontCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${activeSide === 'front' ? 'bg-white/20 text-white' : 'bg-dark-700 text-dark-300'}`}>
                  {frontCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSide('back')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSide === 'back'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800/60'
              }`}
            >
              <span>🔄 Back</span>
              {backCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${activeSide === 'back' ? 'bg-white/20 text-white' : 'bg-dark-700 text-dark-300'}`}>
                  {backCount}
                </span>
              )}
            </button>
          </div>
        ) : (
          <div className="text-xs font-semibold text-dark-400">
            ✦ Full Surface Print
          </div>
        )}

        {/* Right: Active side hint */}
        <div className="text-2xs font-semibold text-dark-400 uppercase tracking-wider hidden sm:block">
          Editing: <span className="text-brand-400 font-bold">{isGarment ? (activeSide === 'back' ? 'Back View' : 'Front View') : 'Print Area'}</span>
        </div>
      </div>

      {/* ── Canvas Viewport ── */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden flex items-center justify-center p-4 sm:p-6 relative select-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(199,109,74,0.03) 0%, transparent 70%)' }}
      >
        <div
          className="relative transition-transform duration-150 ease-out"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)',
            borderRadius: 8,
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
