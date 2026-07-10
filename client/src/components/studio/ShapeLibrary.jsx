import { fabric } from 'fabric';
import { useStudio } from '@/context/StudioContext';
import {
  Square, Circle, Triangle, Star, Hexagon, Heart, Minus,
  Type, Image as ImageIcon,
} from 'lucide-react';

const SHAPES = [
  { name: 'Rectangle', icon: Square, create: (canvas) => new fabric.Rect({ width: 120, height: 80, fill: '#C76D4A', rx: 8 }) },
  { name: 'Circle', icon: Circle, create: (canvas) => new fabric.Circle({ radius: 60, fill: '#8A9A7B' }) },
  { name: 'Triangle', icon: Triangle, create: (canvas) => new fabric.Triangle({ width: 100, height: 90, fill: '#5B4636' }) },
  { name: 'Line', icon: Minus, create: () => new fabric.Line([0, 0, 150, 0], { stroke: '#C76D4A', strokeWidth: 3 }) },
  { name: 'Star', icon: Star, create: () => {
    const points = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 55 : 22;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      points.push({ x: r * Math.cos(a), y: r * Math.sin(a) });
    }
    return new fabric.Polygon(points, { fill: '#E7B8A4' });
  }},
  { name: 'Pentagon', icon: Hexagon, create: () => {
    const sides = 6;
    const points = Array.from({ length: sides }, (_, i) => {
      const a = (2 * Math.PI * i) / sides - Math.PI / 2;
      return { x: 60 * Math.cos(a), y: 60 * Math.sin(a) };
    });
    return new fabric.Polygon(points, { fill: '#8A9A7B' });
  }},
  { name: 'Heart', icon: Heart, create: () => {
    const path = 'M 0,-30 C 0,-45 15,-60 30,-55 C 50,-50 55,-30 40,-10 L 0,20 L -40,-10 C -55,-30 -50,-50 -30,-55 C -15,-60 0,-45 0,-30 Z';
    return new fabric.Path(path, { fill: '#B24C3D' });
  }},
];

const COLORS = [
  '#C76D4A', '#8A9A7B', '#5B4636', '#B24C3D', '#E7B8A4',
  '#D89377', '#B2C0A5', '#DFD8C9', '#EFEAE0', '#F7F3EB',
  '#7A6C5C', '#5F4F40', '#3E2E22', '#000000', '#ffffff',
];

const GRADIENTS = [
  { name: 'Warmth', colors: ['#C76D4A', '#8A9A7B'] },
  { name: 'Studio', colors: ['#C76D4A', '#5B4636'] },
  { name: 'Sage', colors: ['#8A9A7B', '#5B4636'] },
  { name: 'Peach', colors: ['#E7B8A4', '#C76D4A'] },
  { name: 'Earth', colors: ['#DFD8C9', '#7A6C5C'] },
  { name: 'Creamy', colors: ['#F7F3EB', '#DFD8C9'] },
];

const ShapeLibrary = () => {
  const { fabricRef, syncLayers } = useStudio();
  const canvas = () => fabricRef.current;

  const addShape = (shapeDef) => {
    if (!canvas()) return;
    const shape = shapeDef.create(canvas());
    shape.set({ left: 80 + Math.random() * 100, top: 80 + Math.random() * 100, id: `shape_${Date.now()}`, customName: `${shapeDef.name}` });
    canvas().add(shape);
    canvas().setActiveObject(shape);
    canvas().renderAll();
  };

  const addGradient = (grad) => {
    if (!canvas()) return;
    const rect = new fabric.Rect({
      width: 150, height: 100, rx: 12, ry: 12,
      left: 100, top: 100, id: `grad_${Date.now()}`, customName: `${grad.name} Gradient`,
      fill: new fabric.Gradient({
        type: 'linear',
        gradientUnits: 'percentage',
        coords: { x1: 0, y1: 0, x2: 1, y2: 0 },
        colorStops: [{ offset: 0, color: grad.colors[0] }, { offset: 1, color: grad.colors[1] }],
      }),
    });
    canvas().add(rect);
    canvas().setActiveObject(rect);
    canvas().renderAll();
  };

  const addColorRect = (color) => {
    if (!canvas()) return;
    const rect = new fabric.Rect({ width: 80, height: 80, rx: 8, fill: color, left: 100, top: 100, id: `color_${Date.now()}`, customName: 'Color Block' });
    canvas().add(rect);
    canvas().setActiveObject(rect);
    canvas().renderAll();
  };

  return (
    <div className="p-4 space-y-5 overflow-y-auto h-full">
      <div>
        <p className="text-2xs font-semibold text-dark-500 uppercase tracking-widest mb-3">Shapes</p>
        <div className="grid grid-cols-4 gap-2">
          {SHAPES.map((s) => (
            <button
              key={s.name}
              onClick={() => addShape(s)}
              title={s.name}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-glass-border hover:border-brand-500/40 hover:bg-brand-500/10 transition-all duration-200 text-dark-400 hover:text-brand-300 group"
            >
              <s.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-2xs">{s.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-2xs font-semibold text-dark-500 uppercase tracking-widest mb-3">Colors</p>
        <div className="grid grid-cols-5 gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => addColorRect(color)}
              title={color}
              className="w-full aspect-square rounded-lg border-2 border-transparent hover:border-white/30 transition-all hover:scale-110"
              style={{ background: color }}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-2xs font-semibold text-dark-500 uppercase tracking-widest mb-3">Gradients</p>
        <div className="grid grid-cols-2 gap-2">
          {GRADIENTS.map((g) => (
            <button
              key={g.name}
              onClick={() => addGradient(g)}
              className="h-10 rounded-xl text-xs font-semibold text-white hover:scale-105 transition-all shadow-sm"
              style={{ background: `linear-gradient(135deg, ${g.colors[0]}, ${g.colors[1]})` }}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-2xs font-semibold text-dark-500 uppercase tracking-widest mb-3">Quick Text</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Heading', size: 48, weight: '800' },
            { label: 'Subheading', size: 28, weight: '600' },
            { label: 'Body', size: 18, weight: '400' },
            { label: 'Caption', size: 13, weight: '400' },
          ].map(({ label, size, weight }) => (
            <button
              key={label}
              onClick={() => {
                if (!canvas()) return;
                const text = new fabric.IText(label, {
                  fontSize: size, fontWeight: weight, fill: '#5B4636',
                  fontFamily: 'Inter', left: 80, top: 80,
                  id: `text_${Date.now()}`, customName: `${label} Text`,
                });
                canvas().add(text);
                canvas().setActiveObject(text);
                canvas().renderAll();
              }}
              className="py-3 px-2 rounded-xl text-center border border-glass-border hover:border-brand-500/40 hover:bg-brand-500/10 transition-all text-white"
              style={{ fontSize: Math.max(12, Math.min(size * 0.4, 18)) }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShapeLibrary;
