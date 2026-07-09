import { useRef } from 'react';
import { fabric } from 'fabric';
import {
  Type, Square, Circle, Triangle, Minus, Star, Image as ImageIcon,
  Maximize2, MousePointer, Pen,
} from 'lucide-react';
import { useStudio } from '@/context/StudioContext';
import toast from 'react-hot-toast';

const StudioToolbar = () => {
  const { fabricRef, selectedTool, setSelectedTool, syncLayers, pushHistory } = useStudio();
  const fileRef = useRef(null);

  const canvas = () => fabricRef.current;

  const addText = () => {
    if (!canvas()) return;
    const text = new fabric.IText('Click to edit text', {
      left: 100, top: 100, fontSize: 32, fill: '#1a1a2e',
      fontFamily: 'Inter', fontWeight: '600', id: `text_${Date.now()}`,
      customName: 'Text Layer',
    });
    canvas().add(text);
    canvas().setActiveObject(text);
    canvas().renderAll();
    text.enterEditing();
    setSelectedTool('select');
  };

  const addShape = (type) => {
    if (!canvas()) return;
    const opts = { left: 150, top: 150, fill: '#6366f1', id: `${type}_${Date.now()}`, customName: `${type.charAt(0).toUpperCase() + type.slice(1)} Layer` };

    let shape;
    switch (type) {
      case 'rect': shape = new fabric.Rect({ ...opts, width: 120, height: 80, rx: 8, ry: 8 }); break;
      case 'circle': shape = new fabric.Circle({ ...opts, radius: 60 }); break;
      case 'triangle': shape = new fabric.Triangle({ ...opts, width: 120, height: 100 }); break;
      case 'line':
        shape = new fabric.Line([50, 100, 250, 100], { ...opts, stroke: '#6366f1', strokeWidth: 3, fill: '' });
        break;
      case 'star':
        const points = [];
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? 60 : 25;
          const angle = (i * Math.PI) / 5 - Math.PI / 2;
          points.push({ x: r * Math.cos(angle), y: r * Math.sin(angle) });
        }
        shape = new fabric.Polygon(points, { ...opts, left: 200, top: 200 });
        break;
      default: return;
    }

    canvas().add(shape);
    canvas().setActiveObject(shape);
    canvas().renderAll();
    setSelectedTool('select');
  };

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
          left: 50, top: 50,
          id: `img_${Date.now()}`, customName: 'Image Layer',
        });
        canvas().add(img);
        canvas().setActiveObject(img);
        canvas().renderAll();
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const tools = [
    { id: 'select', icon: MousePointer, label: 'Select', action: () => setSelectedTool('select') },
    { id: 'text', icon: Type, label: 'Add Text', action: addText },
    { id: 'rect', icon: Square, label: 'Rectangle', action: () => addShape('rect') },
    { id: 'circle', icon: Circle, label: 'Circle', action: () => addShape('circle') },
    { id: 'triangle', icon: Triangle, label: 'Triangle', action: () => addShape('triangle') },
    { id: 'line', icon: Minus, label: 'Line', action: () => addShape('line') },
    { id: 'star', icon: Star, label: 'Star', action: () => addShape('star') },
    { id: 'image', icon: ImageIcon, label: 'Upload Image', action: () => fileRef.current?.click() },
  ];

  return (
    <div className="h-11 flex-shrink-0 flex items-center gap-1 px-3 border-b border-glass-border bg-dark-900/40">
      {tools.map(({ id, icon: Icon, label, action }) => (
        <button
          key={id}
          onClick={action}
          title={label}
          id={`tool-${id}`}
          className={`toolbar-btn ${selectedTool === id ? 'active' : ''}`}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}

      {/* Divider */}
      <div className="w-px h-5 bg-glass-border mx-1" />

      {/* Quick actions on selected */}
      <SelectedObjectActions />

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
    </div>
  );
};

const SelectedObjectActions = () => {
  const { fabricRef, activeObject, syncLayers, pushHistory } = useStudio();
  const canvas = () => fabricRef.current;

  if (!activeObject) return null;

  const actions = [
    { label: 'Bring Fwd', action: () => { canvas().bringForward(activeObject); canvas().renderAll(); } },
    { label: 'Send Back', action: () => { canvas().sendBackwards(activeObject); canvas().renderAll(); } },
    { label: 'Flip H', action: () => { activeObject.set('flipX', !activeObject.flipX); canvas().renderAll(); } },
    { label: 'Flip V', action: () => { activeObject.set('flipY', !activeObject.flipY); canvas().renderAll(); } },
    { label: 'Center', action: () => { canvas().centerObject(activeObject); canvas().renderAll(); pushHistory(); } },
    { label: 'Lock', action: () => {
      const locked = activeObject.lockMovementX;
      activeObject.set({ lockMovementX: !locked, lockMovementY: !locked, selectable: locked });
      canvas().renderAll(); syncLayers();
    }},
    { label: 'Duplicate', action: () => {
      activeObject.clone((cloned) => {
        cloned.set({ left: activeObject.left + 20, top: activeObject.top + 20, id: `clone_${Date.now()}` });
        canvas().add(cloned);
        canvas().setActiveObject(cloned);
        canvas().renderAll();
      });
    }},
    { label: 'Delete', action: () => { canvas().remove(activeObject); canvas().discardActiveObject(); canvas().renderAll(); }, danger: true },
  ];

  return (
    <>
      {actions.map(({ label, action, danger }) => (
        <button
          key={label}
          onClick={action}
          className={`toolbar-btn !w-auto px-2.5 text-2xs font-medium ${danger ? 'hover:!text-red-400 hover:!bg-red-500/10' : ''}`}
          title={label}
        >
          {label}
        </button>
      ))}
    </>
  );
};

export default StudioToolbar;
