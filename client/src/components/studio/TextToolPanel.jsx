import { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import { useStudio } from '@/context/StudioContext';
import { Type, Sparkles, AlignLeft, AlignCenter, AlignRight, Bold, Italic } from 'lucide-react';
import toast from 'react-hot-toast';

const FONT_OPTIONS = [
  'Space Grotesk', 'Inter', 'Poppins', 'Montserrat',
  'Playfair Display', 'Oswald', 'Outfit', 'Barlow',
  'Orbitron', 'Cinzel', 'Abril Fatface', 'Impact',
  'Courier New', 'Georgia', 'Arial', 'Trebuchet MS',
];

const TEXT_COLORS = [
  '#FFFFFF', '#1A1A1A', '#5B4636', '#C76D4A', '#8A9A7B',
  '#E7B8A4', '#D89377', '#B24C3D', '#1E3A5F', '#EAB308',
];

const TYPOGRAPHY_PRESETS = [
  {
    label: 'Streetwear Iconic',
    text: 'HAVE A NICE DAY (:',
    font: 'Space Grotesk',
    size: 24,
    weight: '900',
    color: '#5B4636',
    spacing: 180,
  },
  {
    label: 'Tokyo Cyber',
    text: 'NEO TOKYO 2099',
    font: 'Space Grotesk',
    size: 22,
    weight: '900',
    color: '#1A1A1A',
    spacing: 200,
  },
  {
    label: 'Varsity Athletic',
    text: 'CREXZA ATHLETICS 99',
    font: 'Impact',
    size: 26,
    weight: 'bold',
    color: '#C76D4A',
    spacing: 120,
  },
  {
    label: 'Bauhaus Modern',
    text: 'BAUHAUS 1923',
    font: 'Space Grotesk',
    size: 22,
    weight: '900',
    color: '#1A1A1A',
    spacing: 220,
  },
  {
    label: 'Atelier Luxury',
    text: 'CREXZA ATELIER',
    font: 'Georgia',
    size: 18,
    weight: 'bold',
    color: '#5B4636',
    spacing: 180,
  },
  {
    label: 'Alpine Outdoor',
    text: 'ALPINE EXPLORER',
    font: 'Impact',
    size: 20,
    weight: '900',
    color: '#8A9A7B',
    spacing: 160,
  },
];

const TextToolPanel = () => {
  const { fabricRef, addCanvasObject, activeSide, setSelectedTool, activeObject, pushHistory } = useStudio();
  const [customText, setCustomText] = useState('');
  const [selectedFont, setSelectedFont] = useState('Space Grotesk');
  const [selectedColor, setSelectedColor] = useState('#1A1A1A');

  const isTextSelected = activeObject && (activeObject.type === 'i-text' || activeObject.type === 'text');

  // Sync with selected text object
  useEffect(() => {
    if (isTextSelected && activeObject) {
      if (activeObject.text) setCustomText(activeObject.text);
      if (activeObject.fontFamily) setSelectedFont(activeObject.fontFamily);
      if (activeObject.fill) setSelectedColor(typeof activeObject.fill === 'string' ? activeObject.fill : '#1A1A1A');
    }
  }, [activeObject, isTextSelected]);

  const addText = (textValue, size = 28, weight = '700', font = selectedFont, color = selectedColor, spacing = 0) => {
    const textStr = textValue || 'Your Text Here';
    const textObj = new fabric.IText(textStr, {
      fontSize: size,
      fontFamily: font,
      fontWeight: weight,
      fill: color,
      charSpacing: spacing,
      id: `text_${Date.now()}`,
      customName: `${textStr.slice(0, 15)} Text`,
      side: activeSide || 'front',
      editable: true,
      cursorColor: '#C76D4A',
    });

    if (addCanvasObject) {
      addCanvasObject(textObj, { side: activeSide });
    } else if (fabricRef.current) {
      fabricRef.current.add(textObj);
      fabricRef.current.setActiveObject(textObj);
      fabricRef.current.renderAll();
    }

    if (setSelectedTool) setSelectedTool('select');
    toast.success('Text added to ' + (activeSide === 'back' ? 'Back' : 'Front') + '!');
  };

  const updateSelectedText = (newVal) => {
    setCustomText(newVal);
    if (isTextSelected && activeObject && fabricRef.current) {
      activeObject.set({ text: newVal });
      fabricRef.current.renderAll();
    }
  };

  const updateSelectedFont = (font) => {
    setSelectedFont(font);
    if (isTextSelected && activeObject && fabricRef.current) {
      activeObject.set({ fontFamily: font });
      fabricRef.current.renderAll();
      if (pushHistory) pushHistory();
    }
  };

  const updateSelectedColor = (color) => {
    setSelectedColor(color);
    if (isTextSelected && activeObject && fabricRef.current) {
      activeObject.set({ fill: color });
      fabricRef.current.renderAll();
      if (pushHistory) pushHistory();
    }
  };

  return (
    <div className="p-4 space-y-5 overflow-y-auto h-full select-none">
      {/* Quick Add Buttons */}
      <div>
        <p className="text-2xs font-semibold text-dark-500 uppercase tracking-widest mb-2.5">Add Text</p>
        <div className="space-y-2">
          <button
            onClick={() => addText('Add Heading', 36, '900')}
            className="w-full py-3 px-4 rounded-xl bg-dark-900/60 hover:bg-brand-500/15 border border-glass-border hover:border-brand-500/40 transition-all text-left text-white font-extrabold text-lg flex items-center justify-between group"
          >
            <span>Add Heading</span>
            <span className="text-xs text-dark-500 group-hover:text-brand-400 font-normal">36px Bold</span>
          </button>

          <button
            onClick={() => addText('Add Subheading', 22, '700')}
            className="w-full py-2.5 px-4 rounded-xl bg-dark-900/60 hover:bg-brand-500/15 border border-glass-border hover:border-brand-500/40 transition-all text-left text-white font-bold text-sm flex items-center justify-between group"
          >
            <span>Add Subheading</span>
            <span className="text-2xs text-dark-500 group-hover:text-brand-400 font-normal">22px Medium</span>
          </button>

          <button
            onClick={() => addText('Add little bit of body text', 15, '400')}
            className="w-full py-2 px-4 rounded-xl bg-dark-900/60 hover:bg-brand-500/15 border border-glass-border hover:border-brand-500/40 transition-all text-left text-dark-200 text-xs flex items-center justify-between group"
          >
            <span>Add Body Text</span>
            <span className="text-2xs text-dark-500 group-hover:text-brand-400 font-normal">15px Regular</span>
          </button>
        </div>
      </div>

      {/* Custom Text Input & Font */}
      <div className="space-y-3">
        <p className="text-2xs font-semibold text-dark-500 uppercase tracking-widest">
          {isTextSelected ? 'Edit Selected Text' : 'Custom Text'}
        </p>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={customText}
            onChange={(e) => updateSelectedText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customText.trim()) {
                if (!isTextSelected) {
                  addText(customText.trim());
                  setCustomText('');
                }
              }
            }}
            placeholder="Type your slogan or text..."
            className="flex-1 bg-dark-900/80 border border-glass-border rounded-xl px-3 py-2 text-xs text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
          <button
            onClick={() => {
              if (customText.trim()) {
                addText(customText.trim());
                setCustomText('');
              }
            }}
            disabled={!customText.trim()}
            className="btn-primary !py-2 !px-3 text-xs disabled:opacity-40"
          >
            {isTextSelected ? 'Add New' : 'Add'}
          </button>
        </div>

        {/* Font Family Selector */}
        <div>
          <label className="text-2xs text-dark-400 font-medium block mb-1.5">Font Style</label>
          <select
            value={selectedFont}
            onChange={(e) => updateSelectedFont(e.target.value)}
            className="w-full bg-dark-900/80 border border-glass-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f} value={f} style={{ fontFamily: f }}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Color Swatches */}
        <div>
          <label className="text-2xs text-dark-400 font-medium block mb-1.5">Text Color</label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {TEXT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => updateSelectedColor(c)}
                className={`w-6 h-6 rounded-full border transition-all ${selectedColor === c ? 'border-brand-500 ring-2 ring-brand-500/40 scale-110' : 'border-white/20 hover:scale-105'}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Curated Aesthetic Typography Presets */}
      <div>
        <p className="text-2xs font-semibold text-dark-500 uppercase tracking-widest mb-2.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-brand-400" />
          <span>Curated Typography Presets</span>
        </p>
        <div className="grid grid-cols-1 gap-2">
          {TYPOGRAPHY_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => addText(p.text, p.size, p.weight, p.font, p.color, p.spacing)}
              className="p-3 rounded-xl bg-dark-900/40 hover:bg-dark-900 border border-glass-border hover:border-brand-500/40 transition-all text-left group"
            >
              <div className="text-2xs text-dark-400 group-hover:text-brand-400 font-medium mb-1">{p.label}</div>
              <div
                className="text-white text-sm font-bold truncate tracking-wider"
                style={{ fontFamily: p.font, color: p.color === '#FFFFFF' ? '#F7F3EB' : p.color }}
              >
                {p.text}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TextToolPanel;
