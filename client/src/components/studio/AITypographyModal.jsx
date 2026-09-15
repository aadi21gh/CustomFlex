import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fabric } from 'fabric';
import {
  Type, Sparkles, X, Wand2, Download, RefreshCw, Layers,
  Sliders, Check, Flame, Award, Cpu, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useStudio } from '@/context/StudioContext';

/* ── Typography Streetwear Presets ── */
const TYPOGRAPHY_STYLES = [
  {
    id: 'bootleg-90s',
    name: '90s Vintage Bootleg',
    tagline: 'Distressed Band & Hip-Hop Merch',
    icon: '🎸',
    defaultHeadline: 'PARANOIA',
    defaultSubtitle: 'WORLD TOUR 1996 • SPECIAL EDITION',
    defaultKanji: '混沌',
    colors: ['#E7B8A4', '#C76D4A', '#5B4636', '#F7F3EB'],
    font: 'Impact, sans-serif',
    arch: 25,
    grunge: 40,
    hasBox: true,
  },
  {
    id: 'kanji-streetwear',
    name: 'Japanese Kanji Cyber',
    tagline: 'Tokyo Underground Streetwear',
    icon: '⛩️',
    defaultHeadline: 'NEO TOKYO',
    defaultSubtitle: 'SYS.VER 2.099 // SHIBUYA DISTRICT',
    defaultKanji: '東京',
    colors: ['#00F0FF', '#FF0055', '#FFFFFF', '#1A1A1A'],
    font: 'Space Grotesk, sans-serif',
    arch: 0,
    grunge: 15,
    hasBox: false,
  },
  {
    id: 'cyber-gothic',
    name: 'Heavy Metal Gothic Arch',
    tagline: 'Aggressive Spiked Chrome Typography',
    icon: '⚡',
    defaultHeadline: 'ETERNAL',
    defaultSubtitle: 'REIGN OF THE FALLEN • MMXXVI',
    defaultKanji: '無限',
    colors: ['#E2E8F0', '#94A3B8', '#DC2626', '#000000'],
    font: 'Cinzel, Georgia, serif',
    arch: 35,
    grunge: 30,
    hasBox: false,
  },
  {
    id: 'luxury-atelier',
    name: 'Minimalist Luxury Atelier',
    tagline: 'High-Fashion Editorial Typography',
    icon: '🏛️',
    defaultHeadline: 'L\'AVENIR',
    defaultSubtitle: 'COLLECTION AUTOMNE-HIVER 2026',
    defaultKanji: '美学',
    colors: ['#F7F3EB', '#5B4636', '#D89377', '#0F172A'],
    font: 'Playfair Display, Georgia, serif',
    arch: 0,
    grunge: 0,
    hasBox: true,
  },
  {
    id: 'cyberpunk-glitch',
    name: 'Cyberpunk RGB Glitch',
    tagline: 'Split Chromatic Aberration Stencil',
    icon: '👾',
    defaultHeadline: 'CYBERFLEX',
    defaultSubtitle: 'NEURAL LINK INTERFACE • ONLINE',
    defaultKanji: '電脳',
    colors: ['#22C55E', '#06B6D4', '#F43F5E', '#FFFFFF'],
    font: 'Orbitron, monospace',
    arch: 0,
    grunge: 20,
    hasBox: false,
  },
  {
    id: 'retro-collegiate',
    name: 'Collegiate Retro Athletic',
    tagline: 'Arched Varsity League Lettering',
    icon: '🏈',
    defaultHeadline: 'CREXZA',
    defaultSubtitle: 'CHAMPIONSHIP ATHLETICS • EST. 99',
    defaultKanji: '勝者',
    colors: ['#C76D4A', '#F7F3EB', '#1E3A5F', '#EAB308'],
    font: 'Impact, Arial Black, sans-serif',
    arch: 30,
    grunge: 10,
    hasBox: false,
  },
];

/* ── Colorway Palettes ── */
const COLOR_PALETTES = [
  { id: 'vintage', name: 'Vintage Rust & Cream', primary: '#C76D4A', secondary: '#F7F3EB', bg: '#1A1A1A' },
  { id: 'chrome', name: 'Cyber Chrome Silver', primary: '#E2E8F0', secondary: '#64748B', bg: '#0A0A0C' },
  { id: 'neon-cyan', name: 'Tokyo Neon Cyan', primary: '#00F0FF', secondary: '#FF007F', bg: '#0A0E17' },
  { id: 'acid-green', name: 'Toxic Acid Green', primary: '#22C55E', secondary: '#FFFFFF', bg: '#061A0C' },
  { id: 'blood-noir', name: 'Obsidian & Crimson', primary: '#EF4444', secondary: '#F87171', bg: '#180B0E' },
  { id: 'gold-leaf', name: 'Luxury Gold Leaf', primary: '#F59E0B', secondary: '#FDE68A', bg: '#161208' },
];

const AITypographyModal = ({ isOpen, onClose }) => {
  const { fabricRef, addCanvasObject, activeSide } = useStudio();
  const [selectedStyle, setSelectedStyle] = useState(TYPOGRAPHY_STYLES[0]);
  const [selectedPalette, setSelectedPalette] = useState(COLOR_PALETTES[0]);
  const [headline, setHeadline] = useState(TYPOGRAPHY_STYLES[0].defaultHeadline);
  const [subtitle, setSubtitle] = useState(TYPOGRAPHY_STYLES[0].defaultSubtitle);
  const [kanji, setKanji] = useState(TYPOGRAPHY_STYLES[0].defaultKanji);
  const [archAmount, setArchAmount] = useState(TYPOGRAPHY_STYLES[0].arch);
  const [grungeAmount, setGrungeAmount] = useState(TYPOGRAPHY_STYLES[0].grunge);
  const [previewDataUrl, setPreviewDataUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Sync defaults when selecting preset
  const handleSelectStyle = (style) => {
    setSelectedStyle(style);
    setHeadline(style.defaultHeadline);
    setSubtitle(style.defaultSubtitle);
    setKanji(style.defaultKanji);
    setArchAmount(style.arch);
    setGrungeAmount(style.grunge);
  };

  /* ── Canvas Typography Renderer ── */
  const renderTypographyCanvas = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');

    // Transparent Background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const primaryColor = selectedPalette.primary;
    const secondaryColor = selectedPalette.secondary;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 1. Draw Large Kanji / Symbol Watermark in Background
    if (kanji && (selectedStyle.id === 'kanji-streetwear' || selectedStyle.id === 'bootleg-90s' || selectedStyle.id === 'cyberpunk-glitch')) {
      ctx.save();
      ctx.font = 'bold 360px "Noto Sans JP", sans-serif';
      ctx.fillStyle = primaryColor;
      ctx.globalAlpha = 0.12;
      ctx.fillText(kanji, canvas.width / 2, canvas.height / 2 + 20);
      ctx.restore();
    }

    // 2. Draw Decorative Stencil / Frame Boxes if enabled
    if (selectedStyle.hasBox) {
      ctx.save();
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 4;
      ctx.strokeRect(100, 180, 800, 640);

      // Inner thin frame
      ctx.strokeStyle = secondaryColor;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;
      ctx.strokeRect(120, 200, 760, 600);
      ctx.restore();
    }

    // 3. Draw Arched or Bold Main Headline
    ctx.save();
    ctx.font = `900 110px ${selectedStyle.font}`;

    if (archAmount > 0) {
      // Draw Arched Text along Arc
      const text = headline.toUpperCase();
      const radius = 600 - (archAmount * 5);
      const angleStep = 0.08 * (archAmount / 25);
      const startAngle = -((text.length - 1) * angleStep) / 2;

      ctx.translate(canvas.width / 2, 420 + radius);

      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const angle = startAngle + i * angleStep;

        ctx.save();
        ctx.rotate(angle);
        ctx.translate(0, -radius);

        // Shadow / 3D extrusion effect
        ctx.fillStyle = '#000000';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 10;
        ctx.fillText(char, 2, 4);

        // Text fill with metallic or vibrant gradient
        const grad = ctx.createLinearGradient(0, -50, 0, 50);
        grad.addColorStop(0, secondaryColor);
        grad.addColorStop(0.5, primaryColor);
        grad.addColorStop(1, '#111111');
        ctx.fillStyle = grad;
        ctx.fillText(char, 0, 0);

        ctx.restore();
      }
    } else {
      // Flat bold streetwear typography
      ctx.translate(canvas.width / 2, 440);

      // Glitch Chromatic Aberration if Cyberpunk style
      if (selectedStyle.id === 'cyberpunk-glitch') {
        ctx.fillStyle = '#FF0055';
        ctx.fillText(headline.toUpperCase(), -4, 0);
        ctx.fillStyle = '#00F0FF';
        ctx.fillText(headline.toUpperCase(), 4, 0);
      }

      // Drop shadow
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillText(headline.toUpperCase(), 3, 5);

      // Main Text Fill
      const grad = ctx.createLinearGradient(0, -60, 0, 60);
      grad.addColorStop(0, secondaryColor);
      grad.addColorStop(0.7, primaryColor);
      ctx.fillStyle = grad;
      ctx.fillText(headline.toUpperCase(), 0, 0);
    }
    ctx.restore();

    // 4. Subtitle / Year / Coordinates Banner
    ctx.save();
    ctx.translate(canvas.width / 2, 580);
    ctx.font = '700 24px Inter, sans-serif';
    ctx.fillStyle = secondaryColor;
    ctx.letterSpacing = '6px';
    ctx.fillText(subtitle.toUpperCase(), 0, 0);

    // Subtle divider lines
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-280, 25);
    ctx.lineTo(280, 25);
    ctx.stroke();
    ctx.restore();

    // 5. Tech Spec / Barcode / Details at Bottom
    ctx.save();
    ctx.translate(canvas.width / 2, 700);
    ctx.font = '600 16px monospace';
    ctx.fillStyle = primaryColor;
    ctx.globalAlpha = 0.8;
    ctx.fillText('/// CREXZA STUDIO • 1-OF-1 APPAREL SPECIFICATION ///', 0, 0);
    ctx.restore();

    // 6. Apply Procedural Grunge / Distress Noise Filter
    if (grungeAmount > 0) {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const factor = grungeAmount / 100;

      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 0) {
          // Semi-random noise distress
          const noise = (Math.random() - 0.5) * factor * 255;
          if (Math.random() < factor * 0.35) {
            data[i + 3] = Math.max(0, data[i + 3] - Math.abs(noise * 2));
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    return canvas.toDataURL('image/png');
  };

  // Live generate preview
  useEffect(() => {
    if (!isOpen) return;
    try {
      const url = renderTypographyCanvas();
      setPreviewDataUrl(url);
    } catch (e) {
      console.error(e);
    }
  }, [isOpen, selectedStyle, selectedPalette, headline, subtitle, kanji, archAmount, grungeAmount]);

  if (!isOpen) return null;

  /* ── Add to Fabric Canvas ── */
  const handleAddToCanvas = () => {
    if (!previewDataUrl) return;

    fabric.Image.fromURL(previewDataUrl, (img) => {
      if (!img) return;
      const maxDim = 240;
      const scale = Math.min(maxDim / (img.width || 500), maxDim / (img.height || 500), 1);

      img.set({
        scaleX: scale,
        scaleY: scale,
        id: `typography_${Date.now()}`,
        customName: `${headline || 'Typography'} Layer`,
        side: activeSide || 'front',
      });

      if (addCanvasObject) {
        addCanvasObject(img, { side: activeSide });
      } else if (fabricRef.current) {
        fabricRef.current.add(img);
        fabricRef.current.setActiveObject(img);
        fabricRef.current.renderAll();
      }

      toast.success(`AI Typography added to ${activeSide === 'back' ? 'Back' : 'Front'}!`);
      onClose();
    }, { crossOrigin: 'anonymous' });
  };

  /* ── Download Print-Ready High-Res PNG ── */
  const handleDownloadPNG = () => {
    if (!previewDataUrl) return;
    const link = document.createElement('a');
    link.download = `crexza-typography-${(headline || 'streetwear').toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = previewDataUrl;
    link.click();
    toast.success('High-resolution typography graphic downloaded!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="w-full max-w-5xl bg-dark-900/95 border border-glass-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-glass-border bg-dark-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-brand-500/20 border border-brand-500/30 text-brand-400">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">AI Streetwear Typography & Layout Generator</h2>
                <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-brand-500/20 text-brand-400 border border-brand-500/30">
                  Vector Engine
                </span>
              </div>
              <p className="text-xs text-dark-400">
                1-click arched lettering, distressed grunge textures, Japanese kanji watermarks, and editorial fashion layouts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-dark-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Generator Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0 overflow-y-auto">
          
          {/* Controls Form (Left, 6 cols) */}
          <div className="lg:col-span-6 p-5 space-y-5 border-r border-glass-border bg-dark-950/30 overflow-y-auto">
            
            {/* 1. Style Presets */}
            <div>
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                Select Streetwear Style Preset
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TYPOGRAPHY_STYLES.map((style) => {
                  const isSelected = selectedStyle.id === style.id;
                  return (
                    <button
                      key={style.id}
                      onClick={() => handleSelectStyle(style)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-brand-500 bg-brand-500/15 shadow-md shadow-brand-500/10'
                          : 'border-glass-border hover:border-white/20 bg-dark-900/50 hover:bg-dark-900'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-base">{style.icon}</span>
                        <span className="text-xs font-bold text-white truncate">{style.name}</span>
                      </div>
                      <div className="text-3xs text-dark-400 truncate">{style.tagline}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Text Content Inputs */}
            <div className="space-y-3 p-4 rounded-xl bg-dark-900/40 border border-glass-border">
              <div>
                <label className="text-2xs font-semibold text-dark-300 uppercase tracking-wider block mb-1">
                  Primary Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. NEO TOKYO"
                  className="w-full bg-dark-950/80 border border-glass-border rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-2xs font-semibold text-dark-300 uppercase tracking-wider block mb-1">
                    Subtitle / Tour Year / Edition
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. WORLD TOUR 2026"
                    className="w-full bg-dark-950/80 border border-glass-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-2xs font-semibold text-dark-300 uppercase tracking-wider block mb-1">
                    Kanji / Watermark
                  </label>
                  <input
                    type="text"
                    value={kanji}
                    onChange={(e) => setKanji(e.target.value)}
                    placeholder="e.g. 東京"
                    className="w-full bg-dark-950/80 border border-glass-border rounded-xl px-3 py-2 text-xs text-center font-bold text-white focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 3. Colorway Palette */}
            <div>
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2 block">
                Aesthetic Colorway Palette
              </label>
              <div className="grid grid-cols-3 gap-2">
                {COLOR_PALETTES.map((pal) => (
                  <button
                    key={pal.id}
                    onClick={() => setSelectedPalette(pal)}
                    className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                      selectedPalette.id === pal.id
                        ? 'border-brand-500 bg-brand-500/15 text-white font-semibold'
                        : 'border-glass-border bg-dark-900/40 text-dark-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center -space-x-1">
                      <div className="w-3.5 h-3.5 rounded-full border border-black/40" style={{ background: pal.primary }} />
                      <div className="w-3.5 h-3.5 rounded-full border border-black/40" style={{ background: pal.secondary }} />
                    </div>
                    <span className="text-3xs truncate">{pal.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Fine-Tuning Sliders */}
            <div className="p-3.5 rounded-xl bg-dark-900/40 border border-glass-border space-y-3">
              <div>
                <div className="flex justify-between text-2xs text-dark-300 mb-1">
                  <span>Arch Curvature</span>
                  <span className="font-mono text-brand-400">{archAmount}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="45"
                  value={archAmount}
                  onChange={(e) => setArchAmount(parseInt(e.target.value))}
                  className="w-full accent-brand-500 h-1.5 bg-dark-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-2xs text-dark-300 mb-1">
                  <span>Distress Grunge Texture</span>
                  <span className="font-mono text-brand-400">{grungeAmount}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="70"
                  value={grungeAmount}
                  onChange={(e) => setGrungeAmount(parseInt(e.target.value))}
                  className="w-full accent-brand-500 h-1.5 bg-dark-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleAddToCanvas}
                className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 text-xs font-bold shadow-lg shadow-brand-500/25"
              >
                <Check className="w-4 h-4" />
                <span>Add to Canvas ({activeSide === 'back' ? 'Back' : 'Front'})</span>
              </button>

              <button
                onClick={handleDownloadPNG}
                className="btn-secondary py-3 px-4 text-xs flex items-center justify-center gap-1.5"
                title="Download 300 DPI Transparent PNG"
              >
                <Download className="w-4 h-4" />
                <span>PNG</span>
              </button>
            </div>
          </div>

          {/* Live High-Res Typography Stage (Right, 6 cols) */}
          <div className="lg:col-span-6 p-6 flex flex-col items-center justify-center bg-dark-950/90 relative min-h-[420px]">
            
            {/* Live Visual Canvas Container */}
            <div
              className="relative w-full max-w-[380px] aspect-square rounded-2xl overflow-hidden border border-brand-500/30 shadow-2xl p-4 flex items-center justify-center transition-all"
              style={{
                backgroundColor: selectedPalette.bg,
                backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.03) 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            >
              {previewDataUrl ? (
                <img
                  src={previewDataUrl}
                  alt="Live Typography Preview"
                  className="max-w-full max-h-full object-contain filter drop-shadow-2xl"
                />
              ) : (
                <div className="text-dark-400 text-xs flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-brand-400" />
                  <span>Compiling typography vector...</span>
                </div>
              )}

              {/* Badging in Preview */}
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-3xs font-mono text-brand-300">
                {selectedStyle.name.toUpperCase()}
              </div>
            </div>

            <div className="text-center mt-3 text-3xs text-dark-400 font-mono">
              ⚡ Real-time curved vector rasterization with anti-aliased edge feathering
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AITypographyModal;
