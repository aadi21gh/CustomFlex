import { useState, useRef, useEffect } from 'react';
import { fabric } from 'fabric';
import {
  Sparkles, Loader2, Wand2, AlertCircle, Zap, RefreshCw,
  Image as ImageIcon, Layers, Target, Clock, ChevronDown,
  ChevronUp, X, Check, Palette,
} from 'lucide-react';
import { useStudio } from '@/context/StudioContext';
import { getDesignZone, getProductLabel } from '@/components/studio/ProductTemplate';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

/* ═══════════════════════════════════════════════════════════════════════════════
   AI Designer — Product-aware intelligent design assistant
   ═══════════════════════════════════════════════════════════════════════════════ */

// ── Design Modes ────────────────────────────────────────────────────────────
const DESIGN_MODES = [
  {
    id: 'full',
    label: 'Full Design',
    icon: ImageIcon,
    description: 'Complete artwork covering the design area',
    promptSuffix: 'complete full artwork design, high quality, detailed',
  },
  {
    id: 'pattern',
    label: 'Pattern',
    icon: Layers,
    description: 'Seamless tiling pattern for all-over prints',
    promptSuffix: 'seamless tileable repeating pattern, uniform distribution',
  },
  {
    id: 'logo',
    label: 'Logo / Emblem',
    icon: Target,
    description: 'Centered icon, badge, or text design',
    promptSuffix: 'centered logo emblem design, isolated on clean background, vector-style',
  },
];

// ── Style Presets (expanded and categorized) ────────────────────────────────
const STYLE_CATEGORIES = [
  {
    label: 'Artistic',
    styles: ['Digital Art', 'Watercolor', 'Oil Painting', 'Sketch', 'Abstract', 'Pop Art'],
  },
  {
    label: 'Modern',
    styles: ['Minimalist', 'Geometric', 'Gradient', 'Neon Glow', 'Vaporwave', 'Cyberpunk'],
  },
  {
    label: 'Cultural',
    styles: ['Japanese', 'Mandala', 'Tribal', 'Vintage Retro', 'Art Deco', 'Street Art'],
  },
  {
    label: 'Nature',
    styles: ['Botanical', 'Cosmic Space', 'Ocean Waves', 'Mountain Landscape', 'Floral'],
  },
];

// ── Smart Prompt Suggestions per Category ───────────────────────────────────
const PROMPT_SUGGESTIONS = {
  clothing: [
    'vintage band logo with distressed texture',
    'abstract geometric shapes in bold colors',
    'streetwear typography with graffiti style',
    'retro sunset with palm trees',
    'minimalist line art portrait',
    'cosmic galaxy swirl pattern',
    'Japanese wave art inspired',
    'skull with floral elements',
  ],
  artwork: [
    'impressionist landscape at golden hour',
    'abstract color field painting',
    'surreal dreamscape with floating islands',
    'modern geometric composition',
    'botanical illustration with fine detail',
    'urban cityscape at night with neon',
    'ethereal fantasy forest scene',
    'ocean waves crashing on rocks',
  ],
  accessories: [
    'marble texture with gold veins',
    'tropical leaf pattern',
    'galaxy and stars pattern',
    'geometric mosaic tiles',
    'watercolor splashes abstract',
    'minimalist line art flowers',
    'holographic gradient effect',
    'vintage map illustration',
  ],
};

// ── Prompt History (stored in component state, max 10) ──────────────────────
const MAX_HISTORY = 10;

const AIDesigner = () => {
  const { fabricRef, category, productType, productColor } = useStudio();

  // State
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState('full');
  const [style, setStyle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [promptHistory, setPromptHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showStyles, setShowStyles] = useState(true);
  const [transparentBg, setTransparentBg] = useState(false);

  const promptRef = useRef(null);
  const productLabel = getProductLabel(productType);
  const currentMode = DESIGN_MODES.find(m => m.id === mode) || DESIGN_MODES[0];
  const suggestions = PROMPT_SUGGESTIONS[category] || PROMPT_SUGGESTIONS.clothing;

  // Build the full enriched prompt
  const buildFullPrompt = () => {
    const parts = [prompt.trim()];
    if (style) parts.push(`${style} style`);
    parts.push(currentMode.promptSuffix);
    parts.push(`designed for ${productLabel} print`);
    if (transparentBg) parts.push('transparent background, PNG, no background');
    return parts.join(', ');
  };

  // ── Generate ──────────────────────────────────────────────────────────────
  const generate = async () => {
    if (!prompt.trim()) { toast.error('Please describe your design'); return; }
    setIsGenerating(true);

    // Save to history
    setPromptHistory(prev => {
      const updated = [prompt.trim(), ...prev.filter(p => p !== prompt.trim())];
      return updated.slice(0, MAX_HISTORY);
    });

    try {
      const fullPrompt = buildFullPrompt();
      const { data } = await api.post('/upload/ai-generate', {
        prompt: fullPrompt,
        width: 1024,
        height: 1024,
        productContext: productLabel,
        mode,
      });
      setGeneratedImages(prev => [{ url: data.url, prompt: prompt.trim(), mode }, ...prev].slice(0, 8));
      toast.success('Design generated!');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Generation failed';
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Generate Variation ────────────────────────────────────────────────────
  const generateVariation = async (originalUrl, originalPrompt) => {
    setIsGenerating(true);
    try {
      const variationPrompt = `${originalPrompt}, variation, alternative version, same style, ${currentMode.promptSuffix}, for ${productLabel}`;
      const { data } = await api.post('/upload/ai-generate', {
        prompt: variationPrompt,
        width: 1024,
        height: 1024,
        productContext: productLabel,
        mode,
        variationOf: originalUrl,
      });
      setGeneratedImages(prev => [{ url: data.url, prompt: originalPrompt, mode: 'variation' }, ...prev].slice(0, 8));
      toast.success('Variation generated!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Variation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Add to Canvas (free placement) ────────────────────────────────────────
  const addToCanvas = (url) => {
    if (!fabricRef.current) return;
    fabric.Image.fromURL(url, (img) => {
      const maxW = fabricRef.current.width * 0.5;
      const maxH = fabricRef.current.height * 0.5;
      const scale = Math.min(maxW / img.width, maxH / img.height, 1);
      img.set({
        scaleX: scale, scaleY: scale,
        left: 60, top: 60,
        id: `ai_${Date.now()}`,
        customName: 'AI Design',
      });
      fabricRef.current.add(img);
      fabricRef.current.setActiveObject(img);
      fabricRef.current.renderAll();
      toast.success('Added to canvas!');
    }, { crossOrigin: 'anonymous' });
  };

  // ── Apply to Design Zone (auto-scaled to fit) ─────────────────────────────
  const applyToDesignZone = (url) => {
    if (!fabricRef.current) return;
    const zone = getDesignZone(productType);
    fabric.Image.fromURL(url, (img) => {
      const scaleX = zone.w / img.width;
      const scaleY = zone.h / img.height;
      const fitScale = Math.min(scaleX, scaleY);
      const centeredLeft = zone.x + (zone.w - img.width * fitScale) / 2;
      const centeredTop = zone.y + (zone.h - img.height * fitScale) / 2;
      img.set({
        scaleX: fitScale,
        scaleY: fitScale,
        left: centeredLeft,
        top: centeredTop,
        id: `ai_design_${Date.now()}`,
        customName: 'AI Design',
      });
      fabricRef.current.add(img);
      fabricRef.current.setActiveObject(img);
      fabricRef.current.renderAll();
      toast.success('Applied to design zone!');
    }, { crossOrigin: 'anonymous' });
  };

  // ── Use Suggestion ────────────────────────────────────────────────────────
  const useSuggestion = (text) => {
    setPrompt(text);
    promptRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">

        {/* ── Header ── */}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
            <Sparkles className="w-4 h-4 text-white" style={{ color: '#fff' }} />
          </div>
          <div>
            <span className="text-xs font-bold text-white block leading-tight">AI Designer</span>
            <span className="text-2xs text-dark-500">
              Designing for <span className="text-brand-400 font-semibold">{productLabel}</span>
            </span>
          </div>
        </div>

        {/* ── API Notice ── */}
        <div
          className="p-2.5 rounded-xl text-2xs text-dark-400 flex items-start gap-2"
          style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}
        >
          <AlertCircle className="w-3 h-3 text-purple-400 flex-shrink-0 mt-0.5" />
          <span>Powered by Stability AI. Requires <code className="text-purple-300 font-mono">STABILITY_API_KEY</code> in .env</span>
        </div>

        {/* ── Design Mode Selector ── */}
        <div>
          <label className="text-2xs font-semibold text-dark-500 uppercase tracking-widest block mb-2">Design Mode</label>
          <div className="grid grid-cols-3 gap-1.5">
            {DESIGN_MODES.map((m) => {
              const Icon = m.icon;
              const isActive = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`ai-mode-btn flex flex-col items-center gap-1 p-2.5 rounded-xl text-center transition-all duration-200 ${
                    isActive
                      ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 ring-1 ring-purple-500/30'
                      : 'bg-white/3 border-glass-border text-dark-400 hover:text-dark-200 hover:bg-white/5'
                  }`}
                  style={{ border: `1px solid ${isActive ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.06)'}` }}
                  title={m.description}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-2xs font-semibold leading-tight">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Smart Prompt Suggestions ── */}
        <div>
          <label className="text-2xs font-semibold text-dark-500 uppercase tracking-widest block mb-2">Quick Ideas</label>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.slice(0, 6).map((s) => (
              <button
                key={s}
                onClick={() => useSuggestion(s)}
                className="text-2xs px-2.5 py-1 rounded-full transition-all duration-200 hover:scale-105"
                style={{
                  background: 'rgba(199, 109, 74, 0.08)',
                  border: '1px solid rgba(199, 109, 74, 0.2)',
                  color: 'rgba(199, 109, 74, 0.8)',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Style Presets ── */}
        <div>
          <button
            className="flex items-center justify-between w-full mb-2"
            onClick={() => setShowStyles(!showStyles)}
          >
            <label className="text-2xs font-semibold text-dark-500 uppercase tracking-widest cursor-pointer">Style</label>
            {showStyles ? <ChevronUp className="w-3 h-3 text-dark-500" /> : <ChevronDown className="w-3 h-3 text-dark-500" />}
          </button>
          {showStyles && (
            <div className="space-y-2">
              {STYLE_CATEGORIES.map((cat) => (
                <div key={cat.label}>
                  <span className="text-2xs text-dark-600 font-medium block mb-1">{cat.label}</span>
                  <div className="flex flex-wrap gap-1">
                    {cat.styles.map((s) => (
                      <button
                        key={s}
                        onClick={() => setStyle(style === s ? '' : s)}
                        className={`text-2xs px-2 py-0.5 rounded-full border transition-all duration-200 ${
                          style === s
                            ? 'border-purple-500/60 bg-purple-500/20 text-purple-300'
                            : 'border-glass-border text-dark-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Prompt Input ── */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-2xs font-semibold text-dark-500 uppercase tracking-widest">Describe Your Design</label>
            <span className="text-2xs text-dark-600">{prompt.length}/500</span>
          </div>
          <div className="relative">
            <textarea
              ref={promptRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
              placeholder={`Describe the perfect design for your ${productLabel}...`}
              rows={4}
              className="input-field resize-none text-xs pr-8"
              id="ai-designer-prompt"
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) generate(); }}
            />
            {prompt && (
              <button
                onClick={() => setPrompt('')}
                className="absolute top-2 right-2 w-5 h-5 rounded-full bg-dark-800/50 flex items-center justify-center hover:bg-dark-700/50 transition-colors"
              >
                <X className="w-3 h-3 text-dark-400" />
              </button>
            )}
          </div>

          {/* Context badge */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-2xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(199,109,74,0.12)', color: '#C76D4A', border: '1px solid rgba(199,109,74,0.25)' }}>
              {productLabel}
            </span>
            {style && (
              <span className="text-2xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' }}>
                {style}
              </span>
            )}
            <span className="text-2xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(139,92,246,0.08)', color: '#7c3aed', border: '1px solid rgba(139,92,246,0.2)' }}>
              {currentMode.label}
            </span>
          </div>

          <p className="text-2xs text-dark-600 mt-1.5">Ctrl+Enter to generate</p>
        </div>

        {/* ── Options Row ── */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer group">
            <div
              onClick={() => setTransparentBg(!transparentBg)}
              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
                transparentBg
                  ? 'bg-purple-500 border-purple-500'
                  : 'border-dark-600 group-hover:border-dark-400'
              }`}
            >
              {transparentBg && <Check className="w-3 h-3 text-white" style={{ color: '#fff' }} />}
            </div>
            <span className="text-2xs text-dark-400 group-hover:text-dark-300">Transparent background</span>
          </label>
        </div>

        {/* ── Generate Button ── */}
        <button
          onClick={generate}
          disabled={isGenerating || !prompt.trim()}
          id="ai-designer-generate-btn"
          className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: isGenerating
              ? 'rgba(139,92,246,0.2)'
              : 'linear-gradient(135deg, #7c3aed, #a855f7, #c084fc)',
            color: '#fff',
            boxShadow: isGenerating ? 'none' : '0 4px 20px rgba(124,58,237,0.3)',
          }}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#fff' }} />
              <span style={{ color: '#c4b5fd' }}>Generating your design...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" style={{ color: '#fff' }} />
              <span style={{ color: '#fff' }}>Generate Design</span>
            </>
          )}
        </button>

        {/* ── Prompt History ── */}
        {promptHistory.length > 0 && (
          <div>
            <button
              className="flex items-center gap-1.5 w-full mb-2"
              onClick={() => setShowHistory(!showHistory)}
            >
              <Clock className="w-3 h-3 text-dark-500" />
              <span className="text-2xs font-semibold text-dark-500 uppercase tracking-widest">Recent Prompts</span>
              {showHistory ? <ChevronUp className="w-3 h-3 text-dark-500 ml-auto" /> : <ChevronDown className="w-3 h-3 text-dark-500 ml-auto" />}
            </button>
            {showHistory && (
              <div className="space-y-1">
                {promptHistory.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => useSuggestion(p)}
                    className="w-full text-left text-2xs text-dark-400 hover:text-dark-200 p-2 rounded-lg hover:bg-white/5 transition-all truncate"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Generated Results Gallery ── */}
        {generatedImages.length > 0 && (
          <div>
            <label className="text-2xs font-semibold text-dark-500 uppercase tracking-widest block mb-2">
              Generated Designs ({generatedImages.length})
            </label>
            <div className="grid grid-cols-2 gap-2">
              {generatedImages.map((item, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-xl overflow-hidden border border-glass-border group"
                >
                  <img src={item.url} alt={`Generated ${i}`} className="w-full h-full object-cover" />

                  {/* Hover overlay with actions */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-2 p-2">
                    <button
                      onClick={() => applyToDesignZone(item.url)}
                      className="w-full py-1.5 px-2 rounded-lg text-2xs font-bold flex items-center justify-center gap-1.5 transition-all"
                      style={{ background: 'linear-gradient(135deg, #C76D4A, #B55938)', color: '#fff' }}
                    >
                      <Zap className="w-3 h-3" style={{ color: '#fff' }} />
                      <span style={{ color: '#fff' }}>Apply to Product</span>
                    </button>
                    <button
                      onClick={() => addToCanvas(item.url)}
                      className="w-full py-1.5 px-2 rounded-lg text-2xs font-semibold flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 transition-all"
                      style={{ color: '#fff' }}
                    >
                      <ImageIcon className="w-3 h-3" style={{ color: '#fff' }} />
                      <span style={{ color: '#fff' }}>Add to Canvas</span>
                    </button>
                    <button
                      onClick={() => generateVariation(item.url, item.prompt)}
                      disabled={isGenerating}
                      className="w-full py-1.5 px-2 rounded-lg text-2xs font-semibold flex items-center justify-center gap-1.5 bg-purple-500/20 hover:bg-purple-500/30 transition-all disabled:opacity-40"
                      style={{ color: '#c4b5fd' }}
                    >
                      <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} style={{ color: '#c4b5fd' }} />
                      <span style={{ color: '#c4b5fd' }}>Variation</span>
                    </button>
                  </div>

                  {/* Mode badge */}
                  <div className="absolute top-1.5 right-1.5">
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-md font-bold backdrop-blur-sm"
                      style={{ background: 'rgba(0,0,0,0.5)', color: '#c4b5fd' }}
                    >
                      {item.mode === 'variation' ? '🔄' : item.mode === 'pattern' ? '🔲' : item.mode === 'logo' ? '🎯' : '🎨'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIDesigner;
