import { useState, useEffect } from 'react';
import { Sliders, Type, Palette } from 'lucide-react';
import { useStudio } from '@/context/StudioContext';

const FONT_FAMILIES = [
  'Inter', 'Georgia', 'Times New Roman', 'Arial', 'Courier New',
  'Verdana', 'Trebuchet MS', 'Impact', 'Comic Sans MS', 'Palatino',
];

const BLEND_MODES = ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'difference', 'exclusion'];

const PropertiesPanel = () => {
  const { activeObject, fabricRef } = useStudio();
  const canvas = () => fabricRef.current;

  const [props, setProps] = useState({
    fill: '#6366f1',
    stroke: '',
    strokeWidth: 0,
    opacity: 1,
    fontSize: 32,
    fontFamily: 'Inter',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAlign: 'left',
    lineHeight: 1.16,
    shadow: false,
    shadowColor: 'rgba(0,0,0,0.5)',
    shadowBlur: 10,
    shadowOffsetX: 5,
    shadowOffsetY: 5,
    rx: 0,
    ry: 0,
    blendMode: 'normal',
    angle: 0,
    scaleX: 1,
    scaleY: 1,
    backgroundColor: '',
  });

  // Sync props from active object
  useEffect(() => {
    if (!activeObject) return;
    setProps({
      fill: activeObject.fill || '#6366f1',
      stroke: activeObject.stroke || '',
      strokeWidth: activeObject.strokeWidth || 0,
      opacity: activeObject.opacity ?? 1,
      fontSize: activeObject.fontSize || 32,
      fontFamily: activeObject.fontFamily || 'Inter',
      fontWeight: activeObject.fontWeight || 'normal',
      fontStyle: activeObject.fontStyle || 'normal',
      textAlign: activeObject.textAlign || 'left',
      lineHeight: activeObject.lineHeight || 1.16,
      shadow: !!activeObject.shadow,
      shadowColor: activeObject.shadow?.color || 'rgba(0,0,0,0.5)',
      shadowBlur: activeObject.shadow?.blur || 10,
      shadowOffsetX: activeObject.shadow?.offsetX || 5,
      shadowOffsetY: activeObject.shadow?.offsetY || 5,
      rx: activeObject.rx || 0,
      ry: activeObject.ry || 0,
      blendMode: activeObject.globalCompositeOperation || 'normal',
      angle: Math.round(activeObject.angle || 0),
      scaleX: parseFloat((activeObject.scaleX || 1).toFixed(2)),
      scaleY: parseFloat((activeObject.scaleY || 1).toFixed(2)),
      backgroundColor: activeObject.backgroundColor || '',
    });
  }, [activeObject]);

  const apply = (key, value) => {
    if (!activeObject || !canvas()) return;
    setProps((p) => ({ ...p, [key]: value }));

    if (key === 'shadow') {
      if (value) {
        activeObject.set('shadow', new (require('fabric').fabric.Shadow)({
          color: props.shadowColor, blur: props.shadowBlur,
          offsetX: props.shadowOffsetX, offsetY: props.shadowOffsetY,
        }));
      } else {
        activeObject.set('shadow', null);
      }
    } else if (key === 'blendMode') {
      activeObject.set('globalCompositeOperation', value);
    } else {
      activeObject.set(key, value);
    }

    canvas().renderAll();
  };

  const isText = activeObject && (activeObject.type === 'text' || activeObject.type === 'i-text');
  const isRect = activeObject?.type === 'rect';
  const isImage = activeObject?.type === 'image';

  if (!activeObject) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center text-dark-500 h-full">
        <Sliders className="w-8 h-8 mb-3 text-dark-600" />
        <p className="text-xs">Select an object to edit its properties</p>
      </div>
    );
  }

  const Section = ({ title, children }) => (
    <div className="border-b border-glass-border last:border-0">
      <div className="px-4 py-2.5 text-2xs font-semibold text-dark-500 uppercase tracking-widest">{title}</div>
      <div className="px-4 pb-4 space-y-3">{children}</div>
    </div>
  );

  const PropRow = ({ label, children }) => (
    <div className="flex items-center gap-3">
      <label className="text-xs text-dark-400 w-16 flex-shrink-0">{label}</label>
      <div className="flex-1">{children}</div>
    </div>
  );

  const Slider = ({ label, propKey, min = 0, max = 1, step = 0.01, value, displayFn }) => (
    <PropRow label={label}>
      <div className="flex items-center gap-2">
        <input type="range" min={min} max={max} step={step} value={value ?? props[propKey]}
          onChange={(e) => apply(propKey, parseFloat(e.target.value))}
          className="flex-1 accent-brand-500 h-1"
        />
        <span className="text-xs text-dark-300 w-10 text-right font-mono">
          {displayFn ? displayFn(value ?? props[propKey]) : (value ?? props[propKey])}
        </span>
      </div>
    </PropRow>
  );

  return (
    <div className="text-sm">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-glass-border">
        <Sliders className="w-4 h-4 text-brand-400" />
        <span className="text-xs font-semibold text-white">Properties</span>
      </div>

      <Section title="Transform">
        <PropRow label="Rotation">
          <div className="flex items-center gap-2">
            <input type="range" min={-180} max={180} step={1} value={props.angle}
              onChange={(e) => { apply('angle', parseInt(e.target.value)); }}
              className="flex-1 accent-brand-500 h-1"
            />
            <span className="text-xs text-dark-300 w-10 text-right font-mono">{props.angle}°</span>
          </div>
        </PropRow>
        <Slider label="Scale X" propKey="scaleX" min={0.1} max={5} step={0.01} displayFn={(v) => `${(v * 100).toFixed(0)}%`} />
        <Slider label="Scale Y" propKey="scaleY" min={0.1} max={5} step={0.01} displayFn={(v) => `${(v * 100).toFixed(0)}%`} />
        <Slider label="Opacity" propKey="opacity" min={0} max={1} step={0.01} displayFn={(v) => `${(v * 100).toFixed(0)}%`} />
      </Section>

      <Section title="Appearance">
        <PropRow label="Fill">
          <input type="color" value={typeof props.fill === 'string' && props.fill.startsWith('#') ? props.fill : '#6366f1'}
            onChange={(e) => apply('fill', e.target.value)}
            className="w-full h-8 rounded-lg cursor-pointer bg-transparent border border-glass-border"
          />
        </PropRow>
        <PropRow label="Stroke">
          <input type="color" value={props.stroke || '#000000'}
            onChange={(e) => apply('stroke', e.target.value)}
            className="w-full h-8 rounded-lg cursor-pointer bg-transparent border border-glass-border"
          />
        </PropRow>
        <Slider label="Stroke W" propKey="strokeWidth" min={0} max={20} step={0.5} displayFn={(v) => `${v}px`} />
        {isRect && (
          <Slider label="Radius" propKey="rx" min={0} max={60} step={1} displayFn={(v) => `${v}px`} />
        )}
        <PropRow label="Blend">
          <select value={props.blendMode} onChange={(e) => apply('blendMode', e.target.value)}
            className="input-field !py-1.5 text-xs">
            {BLEND_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </PropRow>
      </Section>

      {isText && (
        <Section title="Typography">
          <PropRow label="Font">
            <select value={props.fontFamily} onChange={(e) => apply('fontFamily', e.target.value)}
              className="input-field !py-1.5 text-xs">
              {FONT_FAMILIES.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
            </select>
          </PropRow>
          <Slider label="Size" propKey="fontSize" min={8} max={200} step={1} displayFn={(v) => `${v}px`} />
          <PropRow label="Weight">
            <select value={props.fontWeight} onChange={(e) => apply('fontWeight', e.target.value)}
              className="input-field !py-1.5 text-xs">
              {['normal', 'bold', '300', '500', '700', '900'].map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </PropRow>
          <PropRow label="Align">
            <div className="flex gap-1">
              {['left', 'center', 'right'].map((a) => (
                <button key={a} onClick={() => apply('textAlign', a)}
                  className={`flex-1 py-1.5 text-xs rounded-lg capitalize transition-colors ${props.textAlign === a ? 'bg-brand-500/30 text-brand-300' : 'bg-white/5 text-dark-400 hover:text-white'}`}>
                  {a.charAt(0).toUpperCase() + a.slice(1)}
                </button>
              ))}
            </div>
          </PropRow>
          <Slider label="Line H" propKey="lineHeight" min={0.8} max={3} step={0.05} displayFn={(v) => v.toFixed(2)} />
          <PropRow label="BG Color">
            <input type="color" value={props.backgroundColor || '#000000'}
              onChange={(e) => apply('backgroundColor', e.target.value)}
              className="w-full h-8 rounded-lg cursor-pointer bg-transparent border border-glass-border"
            />
          </PropRow>
        </Section>
      )}

      <Section title="Shadow">
        <PropRow label="Enable">
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="relative">
              <input type="checkbox" checked={props.shadow} onChange={(e) => apply('shadow', e.target.checked)} className="sr-only" />
              <div className={`w-9 h-5 rounded-full transition-colors ${props.shadow ? 'bg-brand-500' : 'bg-dark-700'}`} />
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${props.shadow ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
            <span className="text-xs text-dark-400">{props.shadow ? 'On' : 'Off'}</span>
          </label>
        </PropRow>
        {props.shadow && (
          <>
            <PropRow label="Color">
              <input type="color" value="#000000" onChange={(e) => {
                setProps((p) => ({ ...p, shadowColor: e.target.value }));
                if (activeObject.shadow) { activeObject.shadow.color = e.target.value; canvas().renderAll(); }
              }} className="w-full h-8 rounded-lg cursor-pointer bg-transparent border border-glass-border" />
            </PropRow>
            <Slider label="Blur" propKey="shadowBlur" min={0} max={50} step={1} value={props.shadowBlur} displayFn={(v) => `${v}px`} />
            <Slider label="Offset X" propKey="shadowOffsetX" min={-30} max={30} step={1} value={props.shadowOffsetX} displayFn={(v) => `${v}px`} />
            <Slider label="Offset Y" propKey="shadowOffsetY" min={-30} max={30} step={1} value={props.shadowOffsetY} displayFn={(v) => `${v}px`} />
          </>
        )}
      </Section>

      {isImage && (
        <Section title="Image">
          <PropRow label="Filters">
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: 'Grayscale', apply: () => { activeObject.filters = [new (require('fabric').fabric.Image.filters.Grayscale)()]; activeObject.applyFilters(); canvas().renderAll(); } },
                { label: 'Sepia', apply: () => { activeObject.filters = [new (require('fabric').fabric.Image.filters.Sepia)()]; activeObject.applyFilters(); canvas().renderAll(); } },
                { label: 'Invert', apply: () => { activeObject.filters = [new (require('fabric').fabric.Image.filters.Invert)()]; activeObject.applyFilters(); canvas().renderAll(); } },
                { label: 'Blur', apply: () => { activeObject.filters = [new (require('fabric').fabric.Image.filters.Blur)({ blur: 0.5 })]; activeObject.applyFilters(); canvas().renderAll(); } },
                { label: 'Sharpen', apply: () => { activeObject.filters = [new (require('fabric').fabric.Image.filters.Convolute)({ matrix: [0, -1, 0, -1, 5, -1, 0, -1, 0] })]; activeObject.applyFilters(); canvas().renderAll(); } },
                { label: 'Clear', apply: () => { activeObject.filters = []; activeObject.applyFilters(); canvas().renderAll(); } },
              ].map(({ label, apply: applyFilter }) => (
                <button key={label} onClick={applyFilter}
                  className="py-1.5 text-xs rounded-lg bg-white/5 text-dark-400 hover:text-white hover:bg-white/10 transition-colors border border-glass-border">
                  {label}
                </button>
              ))}
            </div>
          </PropRow>
        </Section>
      )}
    </div>
  );
};

export default PropertiesPanel;
