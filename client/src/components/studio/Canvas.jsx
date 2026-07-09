import { useEffect, useRef, useCallback } from 'react';
import { fabric } from 'fabric';
import { useStudio } from '@/context/StudioContext';
import { CANVAS_DIMENSIONS } from '@/lib/utils';

const StudioCanvas = ({ category }) => {
  const canvasRef = useRef(null);
  const {
    fabricRef, setActiveObject, syncLayers, pushHistory,
    gridVisible, snapToGrid, zoom,
  } = useStudio();

  const dims = CANVAS_DIMENSIONS[category] || CANVAS_DIMENSIONS.artwork;

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: dims.width,
      height: dims.height,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      selection: true,
      selectionColor: 'rgba(99, 102, 241, 0.1)',
      selectionBorderColor: '#6366f1',
      selectionLineWidth: 1,
      controlsAboveOverlay: true,
    });

    // Custom control style
    fabric.Object.prototype.set({
      cornerColor: '#6366f1',
      cornerStyle: 'circle',
      cornerSize: 8,
      transparentCorners: false,
      borderColor: '#6366f1',
      borderScaleFactor: 1.5,
    });

    fabricRef.current = canvas;

    // Events
    canvas.on('selection:created', (e) => setActiveObject(e.selected?.[0] || null));
    canvas.on('selection:updated', (e) => setActiveObject(e.selected?.[0] || null));
    canvas.on('selection:cleared', () => setActiveObject(null));

    canvas.on('object:modified', () => { pushHistory(); syncLayers(); });
    canvas.on('object:added', () => { syncLayers(); pushHistory(); });
    canvas.on('object:removed', () => { syncLayers(); pushHistory(); });

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
        if (active) { canvas.remove(active); canvas.discardActiveObject(); canvas.renderAll(); }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (active) active.clone((cloned) => { canvas._clipboard = cloned; });
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        if (canvas._clipboard) {
          canvas._clipboard.clone((cloned) => {
            cloned.set({ left: cloned.left + 20, top: cloned.top + 20, id: Date.now() });
            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            canvas.renderAll();
          });
        }
      }
      // Arrow keys to move
      if (active && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        active.set({ left: active.left + dx, top: active.top + dy });
        canvas.renderAll();
      }
    };

    document.addEventListener('keydown', handleKeyboard);

    // Initial history state
    pushHistory();

    return () => {
      document.removeEventListener('keydown', handleKeyboard);
      canvas.dispose();
    };
  }, [category]);

  // Grid overlay
  useEffect(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;

    // Remove old grid
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

  // Center the canvas in the viewport
  return (
    <div
      className="flex-1 overflow-auto flex items-center justify-center p-8"
      style={{ background: 'repeating-conic-gradient(rgba(255,255,255,0.02) 0% 25%, transparent 0% 50%) 0 0 / 32px 32px' }}
    >
      <div
        className="relative"
        style={{
          boxShadow: '0 0 0 1px rgba(99,102,241,0.3), 0 20px 60px rgba(0,0,0,0.5)',
          borderRadius: 4,
        }}
      >
        <canvas ref={canvasRef} id="studio-canvas" />
      </div>
    </div>
  );
};

export default StudioCanvas;
