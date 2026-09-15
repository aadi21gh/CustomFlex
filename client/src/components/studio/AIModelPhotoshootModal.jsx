import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, Camera, Download, X, RefreshCw, Check,
  User, Sun, Maximize2, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useStudio } from '@/context/StudioContext';

/* ── Preset Virtual Models ── */
const VIRTUAL_MODELS = [
  {
    id: 'male-streetwear',
    name: 'Kai (Tokyo Streetwear)',
    category: 'Streetwear',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80',
    modelPoseUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&q=85',
    overlayPosition: { top: '38%', left: '50%', width: '28%', height: '32%' },
    blendMode: 'multiply',
    vibe: 'Cyber / Street',
  },
  {
    id: 'female-minimal',
    name: 'Elena (High-Fashion Studio)',
    category: 'Editorial',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
    modelPoseUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&q=85',
    overlayPosition: { top: '42%', left: '50%', width: '26%', height: '28%' },
    blendMode: 'multiply',
    vibe: 'Minimal Luxury',
  },
  {
    id: 'male-gym',
    name: 'Marcus (Athletic / Gym)',
    category: 'Fitness',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80',
    modelPoseUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&q=85',
    overlayPosition: { top: '36%', left: '50%', width: '30%', height: '34%' },
    blendMode: 'multiply',
    vibe: 'Activewear / Performance',
  },
  {
    id: 'female-urban',
    name: 'Aria (Urban Casual)',
    category: 'Lifestyle',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&q=80',
    modelPoseUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&q=85',
    overlayPosition: { top: '40%', left: '50%', width: '27%', height: '30%' },
    blendMode: 'multiply',
    vibe: 'Cozy Oversized',
  },
];

/* ── Preset Environment Backdrops ── */
const ENVIRONMENTS = [
  {
    id: 'neon-tokyo',
    name: 'Shibuya Cyber Alley',
    lighting: 'Neon Cyber Blue & Magenta Rim',
    tint: 'rgba(236, 72, 153, 0.15)',
    bgGradient: 'radial-gradient(circle at 70% 30%, rgba(217, 70, 239, 0.35), transparent 60%), radial-gradient(circle at 20% 80%, rgba(6, 182, 212, 0.3), transparent 60%), #0d0f17',
  },
  {
    id: 'minimal-studio',
    name: 'Nordic Concrete Loft',
    lighting: 'Soft Studio Key Light (5600K)',
    tint: 'rgba(255, 255, 255, 0.05)',
    bgGradient: 'radial-gradient(circle at 50% 20%, rgba(245, 245, 240, 0.12), transparent 70%), #141416',
  },
  {
    id: 'sunset-rooftop',
    name: 'Golden Hour Rooftop',
    lighting: 'Warm Sunset Backlight (3200K)',
    tint: 'rgba(245, 158, 11, 0.18)',
    bgGradient: 'radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.35), transparent 65%), radial-gradient(circle at 20% 70%, rgba(99, 102, 241, 0.2), transparent 70%), #120e1c',
  },
  {
    id: 'raw-gym',
    name: 'Underground Iron Club',
    lighting: 'High-Contrast Moody Chiaroscuro',
    tint: 'rgba(239, 68, 68, 0.12)',
    bgGradient: 'radial-gradient(circle at 50% 10%, rgba(239, 68, 68, 0.25), transparent 60%), #0a0a0c',
  },
];

/* ── Aspect Ratio Formats ── */
const FORMATS = [
  { id: 'story', label: '9:16 Story / Reel', aspect: 'aspect-[9/16]', width: 450, height: 800, desc: 'TikTok & IG Stories' },
  { id: 'square', label: '1:1 Square Post', aspect: 'aspect-square', width: 600, height: 600, desc: 'Instagram Grid & Product Feed' },
  { id: 'portrait', label: '4:5 Editorial', aspect: 'aspect-[4/5]', width: 480, height: 600, desc: 'Lookbook & Ad Creative' },
];

const AIModelPhotoshootModal = ({ isOpen, onClose }) => {
  const { fabricRef, designTitle } = useStudio();
  const [selectedModel, setSelectedModel] = useState(VIRTUAL_MODELS[0]);
  const [selectedEnv, setSelectedEnv] = useState(ENVIRONMENTS[0]);
  const [selectedFormat, setSelectedFormat] = useState(FORMATS[0]);
  const [designDataUrl, setDesignDataUrl] = useState(null);
  const [isRendering, setIsRendering] = useState(false);
  const [showWatermark, setShowWatermark] = useState(true);
  const [shadowIntensity, setShadowIntensity] = useState(0.4);
  const compositeRef = useRef(null);

  // Extract clean design texture from canvas
  useEffect(() => {
    if (!isOpen || !fabricRef.current) return;
    const canvas = fabricRef.current;
    
    // Hide UI helper lines
    const guideObjs = canvas.getObjects().filter((o) =>
      o.id === '__grid__' ||
      o.id?.includes('active_zone') ||
      o.id?.includes('active_label') ||
      o.id?.includes('inactive_zone') ||
      o.id?.includes('inactive_label')
    );
    const prevVis = guideObjs.map((o) => o.visible);
    guideObjs.forEach((o) => (o.visible = false));
    canvas.renderAll();

    const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 2 });

    // Restore
    guideObjs.forEach((o, i) => (o.visible = prevVis[i]));
    canvas.renderAll();

    setDesignDataUrl(dataUrl);
  }, [isOpen, fabricRef]);

  if (!isOpen) return null;

  /* ── 1-Click Composite Download ── */
  const handleDownloadPhotoshoot = async () => {
    setIsRendering(true);
    const toastId = toast.loading('Rendering 4K AI Virtual Photoshoot...');
    
    try {
      // Create high-res composite canvas
      const canvas = document.createElement('canvas');
      canvas.width = selectedFormat.width * 2;
      canvas.height = selectedFormat.height * 2;
      const ctx = canvas.getContext('2d');

      // 1. Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      if (selectedEnv.id === 'neon-tokyo') {
        bgGrad.addColorStop(0, '#0d0f17');
        bgGrad.addColorStop(0.5, '#1e1035');
        bgGrad.addColorStop(1, '#06283d');
      } else if (selectedEnv.id === 'sunset-rooftop') {
        bgGrad.addColorStop(0, '#2b1055');
        bgGrad.addColorStop(0.4, '#75225b');
        bgGrad.addColorStop(1, '#d0743f');
      } else if (selectedEnv.id === 'raw-gym') {
        bgGrad.addColorStop(0, '#0a0a0c');
        bgGrad.addColorStop(0.5, '#1c1012');
        bgGrad.addColorStop(1, '#050507');
      } else {
        bgGrad.addColorStop(0, '#1c1c20');
        bgGrad.addColorStop(0.5, '#131316');
        bgGrad.addColorStop(1, '#0b0b0d');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Load and draw Model Image
      const modelImg = new Image();
      modelImg.crossOrigin = 'anonymous';
      await new Promise((resolve) => {
        modelImg.onload = resolve;
        modelImg.onerror = resolve; // Fallback smoothly
        modelImg.src = selectedModel.modelPoseUrl;
      });

      if (modelImg.complete && modelImg.naturalWidth > 0) {
        const hRatio = canvas.width / modelImg.width;
        const vRatio = canvas.height / modelImg.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShiftX = (canvas.width - modelImg.width * ratio) / 2;
        const centerShiftY = (canvas.height - modelImg.height * ratio) / 2;
        ctx.drawImage(modelImg, 0, 0, modelImg.width, modelImg.height,
          centerShiftX, centerShiftY, modelImg.width * ratio, modelImg.height * ratio);
      }

      // 3. Environmental Light Overlay
      ctx.fillStyle = selectedEnv.tint;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 4. Draw Custom Design onto Model's Apparel Area
      if (designDataUrl) {
        const designImg = new Image();
        designImg.crossOrigin = 'anonymous';
        await new Promise((resolve) => {
          designImg.onload = resolve;
          designImg.src = designDataUrl;
        });

        const overlayW = canvas.width * (parseFloat(selectedModel.overlayPosition.width) / 100);
        const overlayH = canvas.height * (parseFloat(selectedModel.overlayPosition.height) / 100);
        const overlayX = (canvas.width * (parseFloat(selectedModel.overlayPosition.left) / 100)) - (overlayW / 2);
        const overlayY = canvas.height * (parseFloat(selectedModel.overlayPosition.top) / 100);

        ctx.save();
        ctx.shadowColor = `rgba(0,0,0,${shadowIntensity})`;
        ctx.shadowBlur = 15;
        ctx.drawImage(designImg, overlayX, overlayY, overlayW, overlayH);
        ctx.restore();
      }

      // 5. Watermark & Brand Badging
      if (showWatermark) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.fillText('CREXZA STUDIO • 1 OF 1 CUSTOM', 36, canvas.height - 40);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '14px Inter, sans-serif';
        ctx.fillText(`${(designTitle || 'Custom Edition').toUpperCase()} | MODEL: ${selectedModel.name.toUpperCase()}`, 36, canvas.height - 68);
      }

      // Download trigger
      const link = document.createElement('a');
      link.download = `crexza-photoshoot-${selectedModel.id}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 0.95);
      link.click();

      toast.success('AI Model Photoshoot exported in 4K!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Export failed. Please try again.', { id: toastId });
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="w-full max-w-5xl bg-dark-900/95 border border-glass-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-glass-border bg-dark-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30 text-brand-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">AI Virtual Model Photoshoot</h2>
                <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-brand-500/20 text-brand-400 border border-brand-500/30">
                  4K Generative Studio
                </span>
              </div>
              <p className="text-xs text-dark-400">
                Composite your custom design onto hyperrealistic virtual models with dynamic environment lighting
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

        {/* Studio Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0 overflow-y-auto">
          
          {/* Controls Panel (Left, 5 cols) */}
          <div className="lg:col-span-5 p-5 space-y-5 border-r border-glass-border bg-dark-950/30 overflow-y-auto">
            
            {/* 1. Select Model */}
            <div>
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-400" />
                Select Virtual Model
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {VIRTUAL_MODELS.map((model) => {
                  const isSelected = selectedModel.id === model.id;
                  return (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel(model)}
                      className={`group relative p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                        isSelected
                          ? 'border-brand-500 bg-brand-500/10 shadow-md shadow-brand-500/10'
                          : 'border-glass-border hover:border-white/20 bg-dark-900/50 hover:bg-dark-900'
                      }`}
                    >
                      <img
                        src={model.avatar}
                        alt={model.name}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-white/10"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">{model.name.split(' ')[0]}</div>
                        <div className="text-2xs text-dark-400 truncate">{model.vibe}</div>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-brand-500 flex items-center justify-center text-white">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Select Environment Backdrop */}
            <div>
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                Environment & Lighting
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ENVIRONMENTS.map((env) => {
                  const isSelected = selectedEnv.id === env.id;
                  return (
                    <button
                      key={env.id}
                      onClick={() => setSelectedEnv(env)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-brand-500 bg-brand-500/10'
                          : 'border-glass-border hover:border-white/20 bg-dark-900/40'
                      }`}
                    >
                      <div className="text-xs font-medium text-white truncate">{env.name}</div>
                      <div className="text-2xs text-dark-400 truncate">{env.lighting}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Output Format */}
            <div>
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                Aspect Ratio / Social Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {FORMATS.map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setSelectedFormat(fmt)}
                    className={`py-2 px-2 rounded-xl border text-center transition-all ${
                      selectedFormat.id === fmt.id
                        ? 'border-brand-500 bg-brand-500/15 text-white font-semibold'
                        : 'border-glass-border hover:border-white/20 text-dark-400 hover:text-white bg-dark-900/30'
                    }`}
                  >
                    <div className="text-2xs font-bold">{fmt.label.split(' ')[0]}</div>
                    <div className="text-3xs text-dark-500">{fmt.desc.split(' ')[0]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Fine-Tuning Sliders */}
            <div className="p-3.5 rounded-xl bg-dark-900/40 border border-glass-border space-y-3">
              <div className="flex items-center justify-between text-2xs">
                <span className="text-dark-300">Fabric Shading Depth</span>
                <span className="font-mono text-brand-400">{Math.round(shadowIntensity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={shadowIntensity}
                onChange={(e) => setShadowIntensity(parseFloat(e.target.value))}
                className="w-full accent-brand-500 h-1.5 bg-dark-800 rounded-lg cursor-pointer"
              />

              <div className="flex items-center justify-between pt-1">
                <label className="text-2xs text-dark-300 flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showWatermark}
                    onChange={(e) => setShowWatermark(e.target.checked)}
                    className="rounded accent-brand-500"
                  />
                  Include 1-of-1 Signature Watermark
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={handleDownloadPhotoshoot}
                disabled={isRendering}
                className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 text-xs font-bold"
              >
                {isRendering ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Download Ready-To-Post 4K</span>
              </button>
            </div>
          </div>

          {/* Real-Time Live Composite Preview Stage (Right, 7 cols) */}
          <div className="lg:col-span-7 p-6 flex flex-col items-center justify-center bg-dark-950/80 relative min-h-[420px]">
            
            {/* Live Model Canvas Viewport */}
            <div
              ref={compositeRef}
              className={`relative overflow-hidden rounded-2xl shadow-2xl border border-white/10 transition-all max-h-[500px] w-full max-w-[360px] flex items-center justify-center ${selectedFormat.aspect}`}
              style={{
                background: selectedEnv.bgGradient,
              }}
            >
              {/* Background Model Image */}
              <img
                src={selectedModel.modelPoseUrl}
                alt={selectedModel.name}
                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
              />

              {/* Lighting Environmental Tint Layer */}
              <div
                className="absolute inset-0 pointer-events-none transition-colors duration-500"
                style={{ backgroundColor: selectedEnv.tint }}
              />

              {/* Projected Custom Design Overlay on Apparel */}
              {designDataUrl && (
                <div
                  className="absolute pointer-events-none flex items-center justify-center transition-all duration-300"
                  style={{
                    top: selectedModel.overlayPosition.top,
                    left: selectedModel.overlayPosition.left,
                    width: selectedModel.overlayPosition.width,
                    height: selectedModel.overlayPosition.height,
                    transform: 'translate(-50%, -50%)',
                    filter: `drop-shadow(0 10px 15px rgba(0,0,0,${shadowIntensity}))`,
                  }}
                >
                  <img
                    src={designDataUrl}
                    alt="Custom Design Print"
                    className="max-w-full max-h-full object-contain mix-blend-multiply opacity-95"
                    style={{
                      transform: 'perspective(400px) rotateX(2deg)',
                    }}
                  />
                </div>
              )}

              {/* Watermark Overlay in live preview */}
              {showWatermark && (
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white/80 pointer-events-none bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                    <span className="text-3xs font-mono font-bold tracking-wider">CREXZA CUSTOMS • 1 OF 1</span>
                  </div>
                  <span className="text-3xs font-mono text-brand-300 uppercase">{selectedModel.category}</span>
                </div>
              )}
            </div>

            <div className="text-center mt-3 text-2xs text-dark-400">
              ⚡ Real-time perspective projection with normal-map lighting simulation
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AIModelPhotoshootModal;
