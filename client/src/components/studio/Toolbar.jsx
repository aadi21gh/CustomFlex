import { useRef, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import {
  Type, Square, Circle, Triangle, Minus, Star, Image as ImageIcon,
  MousePointer, Copy, Clipboard, Trash2, AlignCenter,
  ArrowUp, ArrowDown, FlipHorizontal, FlipVertical, Lock, Unlock,
} from 'lucide-react';
import { useStudio } from '@/context/StudioContext';
import toast from 'react-hot-toast';

/* ─── Quick color swatches ─────────────────────────────────────────────────── */
const QUICK_COLORS = [
  '#F7F3EB', '#5B4636', '#C76D4A', '#8A9A7B', '#E7B8A4',
  '#D89377', '#B2C0A5', '#DFD8C9', '#EFEAE0', '#000000',
];

/* ─── Clipboard (module-level, persists across renders) ─────────────────────── */
let _clipboard = null;

const StudioToolbar = () => {
  const { fabricRef, selectedTool, setSelectedTool, syncLayers, pushHistory } = useStudio();
  const fileRef = useRef(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const canvas = () => fabricRef.current;

  /* ── Add Text ── */
  const addText = () => {
    if (!canvas()) return;
    const text = new fabric.IText('Click to edit text', {
      left: 120, top: 120,
      fontSize: 32,
      fill: '#5B4636',
      fontFamily: 'Inter',
      fontWeight: '600',
      id: `text_${Date.now()}`,
      customName: 'Text Layer',
    });
    canvas().add(text);
    canvas().setActiveObject(text);
    canvas().renderAll();
    text.enterEditing();
    setSelectedTool('select');
    pushHistory();
    syncLayers();
  };

  /* ── Add Shape ── */
  const addShape = (type) => {
    if (!canvas()) return;
    const opts = {
      left: 150, top: 150,
      fill: '#C76D4A',
      id: `${type}_${Date.now()}`,
      customName: `${type.charAt(0).toUpperCase() + type.slice(1)}`,
    };

    let shape;
    switch (type) {
      case 'rect':
        shape = new fabric.Rect({ ...opts, width: 120, height: 80, rx: 10, ry: 10 });
        break;
      case 'circle':
        shape = new fabric.Circle({ ...opts, radius: 60 });
        break;
      case 'triangle':
        shape = new fabric.Triangle({ ...opts, width: 120, height: 100 });
        break;
      case 'line':
        shape = new fabric.Line([50, 100, 250, 100], {
          ...opts, stroke: '#C76D4A', strokeWidth: 3, fill: '',
        });
        break;
      case 'star': {
        const pts = [];
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? 60 : 25;
          const angle = (i * Math.PI) / 5 - Math.PI / 2;
          pts.push({ x: r * Math.cos(angle), y: r * Math.sin(angle) });
        }
        shape = new fabric.Polygon(pts, { ...opts, left: 200, top: 200 });
        break;
      }
      default: return;
    }

    canvas().add(shape);
    canvas().setActiveObject(shape);
    canvas().renderAll();
    setSelectedTool('select');
    pushHistory();
    syncLayers();
  };

  /* ── Upload Image ── */
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      fabric.Image.fromURL(ev.target.result, (img) => {
        if (!canvas()) return;
        const maxW = canvas().width * 0.6;
        const maxH = canvas().height * 0.6;
        const scale = Math.min(maxW / img.width, maxH / img.height, 1);
        img.set({
          scaleX: scale, scaleY: scale,
          left: 60, top: 60,
          id: `img_${Date.now()}`,
          customName: 'Image Layer',
        });
        canvas().add(img);
        canvas().setActiveObject(img);
        canvas().renderAll();
        pushHistory();
        syncLayers();
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  /* ── Apply quick color to active object ── */
  const applyQuickColor = (color) => {
    const obj = canvas()?.getActiveObject();
    if (!obj) return;
    obj.set('fill', color);
    canvas().renderAll();
    pushHistory();
  };

  const primaryTools = [
    { id: 'select', icon: MousePointer, label: 'Select (V)', action: () => setSelectedTool('select') },
    { id: 'text', icon: Type, label: 'Add Text (T)', action: addText },
    { id: 'rect', icon: Square, label: 'Rectangle (R)', action: () => addShape('rect') },
    { id: 'circle', icon: Circle, label: 'Circle (C)', action: () => addShape('circle') },
    { id: 'triangle', icon: Triangle, label: 'Triangle', action: () => addShape('triangle') },
    { id: 'line', icon: Minus, label: 'Line (L)', action: () => addShape('line') },
    { id: 'star', icon: Star, label: 'Star', action: () => addShape('star') },
    { id: 'image', icon: ImageIcon, label: 'Upload Image (I)', action: () => fileRef.current?.click() },
  ];

  return (
    <div className="h-11 flex-shrink-0 flex items-center gap-1 px-3 border-b border-glass-border bg-dark-900/40 overflow-x-auto no-scrollbar">
      {/* Primary tool buttons */}
      {primaryTools.map(({ id, icon: Icon, label, action }) => (
        <button
          key={id}
          onClick={action}
          title={label}
          id={`tool-${id}`}
          className={`toolbar-btn flex-shrink-0 ${selectedTool === id ? 'active' : ''}`}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}

      {/* Divider */}
      <div className="w-px h-5 bg-glass-border mx-1 flex-shrink-0" />

      {/* Quick Color Swatches */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        {QUICK_COLORS.map((color) => (
          <button
            key={color}
            title={`Fill: ${color}`}
            onClick={() => applyQuickColor(color)}
            className="w-5 h-5 rounded-md flex-shrink-0 border border-white/20 hover:scale-110 transition-transform"
            style={{ background: color }}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-glass-border mx-1 flex-shrink-0" />

      {/* Context actions */}
      <SelectedObjectActions pushHistory={pushHistory} syncLayers={syncLayers} />

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
    </div>
  );
};

/* ─── Selected Object Actions ───────────────────────────────────────────────── */
const SelectedObjectActions = ({ pushHistory, syncLayers }) => {
  const { fabricRef, activeObject } = useStudio();
  const canvas = () => fabricRef.current;

  if (!activeObject) return (
    <span className="text-2xs text-dark-600 hidden sm:block ml-2 select-none">
      Select an object to see actions
    </span>
  );

  const isLocked = activeObject.lockMovementX;

  /* ── Copy ── */
  const handleCopy = () => {
    activeObject.clone((cloned) => {
      _clipboard = cloned;
      toast.success('Copied!', { duration: 1000 });
    });
  };

  /* ── Paste ── */
  const handlePaste = () => {
    if (!_clipboard) return;
    _clipboard.clone((cloned) => {
      cloned.set({
        left: (_clipboard.left || 0) + 20,
        top: (_clipboard.top || 0) + 20,
        id: `clone_${Date.now()}`,
        evented: true,
      });
      canvas().add(cloned);
      canvas().setActiveObject(cloned);
      canvas().renderAll();
      pushHistory();
      syncLayers();
      _clipboard = cloned; // shift clipboard for next paste
    });
  };

  /* ── Duplicate ── */
  const handleDuplicate = () => {
    activeObject.clone((cloned) => {
      cloned.set({
        left: activeObject.left + 20,
        top: activeObject.top + 20,
        id: `clone_${Date.now()}`,
        customName: `${activeObject.customName || 'Layer'} copy`,
      });
      canvas().add(cloned);
      canvas().setActiveObject(cloned);
      canvas().renderAll();
      pushHistory();
      syncLayers();
    });
  };

  /* ── Delete ── */
  const handleDelete = () => {
    canvas().remove(activeObject);
    canvas().discardActiveObject();
    canvas().renderAll();
    pushHistory();
    syncLayers();
  };

  const actions = [
    { icon: ArrowUp, label: 'Bring Forward', action: () => { canvas().bringForward(activeObject); canvas().renderAll(); } },
    { icon: ArrowDown, label: 'Send Backward', action: () => { canvas().sendBackwards(activeObject); canvas().renderAll(); } },
    { icon: FlipHorizontal, label: 'Flip Horizontal', action: () => { activeObject.set('flipX', !activeObject.flipX); canvas().renderAll(); } },
    { icon: FlipVertical, label: 'Flip Vertical', action: () => { activeObject.set('flipY', !activeObject.flipY); canvas().renderAll(); } },
    { icon: AlignCenter, label: 'Center on Canvas', action: () => { canvas().centerObject(activeObject); canvas().renderAll(); pushHistory(); } },
    { icon: isLocked ? Unlock : Lock, label: isLocked ? 'Unlock' : 'Lock', action: () => {
      activeObject.set({
        lockMovementX: !isLocked, lockMovementY: !isLocked,
        lockScalingX: !isLocked, lockScalingY: !isLocked,
        lockRotation: !isLocked,
        selectable: isLocked,
      });
      canvas().renderAll();
      syncLayers();
    }},
    { icon: Copy, label: 'Copy (Ctrl+C)', action: handleCopy },
    { icon: Clipboard, label: 'Paste (Ctrl+V)', action: handlePaste },
    { icon: Copy, label: 'Duplicate (Ctrl+D)', action: handleDuplicate, text: 'Dupe' },
    { icon: Trash2, label: 'Delete (Del)', action: handleDelete, danger: true },
  ];

  return (
    <>
      {actions.map(({ icon: Icon, label, action, danger, text }) => (
        <button
          key={label}
          onClick={action}
          title={label}
          className={`toolbar-btn flex-shrink-0 ${
            danger ? 'hover:!text-red-400 hover:!bg-red-500/10' : ''
          } ${text ? '!w-auto px-2.5 text-2xs font-medium' : ''}`}
        >
          {text ? text : <Icon className="w-3.5 h-3.5" />}
        </button>
      ))}
    </>
  );
};

export default StudioToolbar;
