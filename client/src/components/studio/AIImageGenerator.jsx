import { useState } from 'react';
import { fabric } from 'fabric';
import { Sparkles, Loader2, Wand2, AlertCircle } from 'lucide-react';
import { useStudio } from '@/context/StudioContext';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const STYLE_PRESETS = [
  'Digital art', 'Photorealistic', 'Watercolor', 'Oil painting',
  'Pixel art', 'Anime style', 'Minimalist', 'Neon glow',
];

const AIImageGenerator = () => {
  const { fabricRef } = useStudio();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);

  const fullPrompt = [prompt, style].filter(Boolean).join(', ');

  const generate = async () => {
    if (!prompt.trim()) { toast.error('Please enter a prompt'); return; }
    setIsGenerating(true);
    try {
      const { data } = await api.post('/upload/ai-generate', { prompt: fullPrompt, width: 512, height: 512 });
      setGeneratedImages((prev) => [data.url, ...prev].slice(0, 6));
      toast.success('Image generated!');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Generation failed';
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const addToCanvas = (url) => {
    if (!fabricRef.current) return;
    fabric.Image.fromURL(url, (img) => {
      const maxW = fabricRef.current.width * 0.5;
      const maxH = fabricRef.current.height * 0.5;
      const scale = Math.min(maxW / img.width, maxH / img.height, 1);
      img.set({ scaleX: scale, scaleY: scale, left: 60, top: 60, id: `ai_${Date.now()}`, customName: 'AI Image' });
      fabricRef.current.add(img);
      fabricRef.current.setActiveObject(img);
      fabricRef.current.renderAll();
      toast.success('Added to canvas!');
    }, { crossOrigin: 'anonymous' });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Wand2 className="w-4 h-4 text-purple-400" />
        <span className="text-xs font-semibold text-white">AI Image Generator</span>
      </div>

      <div className="p-3 rounded-xl text-xs text-dark-400 flex items-start gap-2" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
        <AlertCircle className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
        Powered by Stability AI. Requires STABILITY_API_KEY in your .env file.
      </div>

      <div>
        <label className="text-2xs font-semibold text-dark-500 uppercase tracking-widest block mb-1.5">Style</label>
        <div className="flex flex-wrap gap-1.5">
          {STYLE_PRESETS.map((s) => (
            <button
              key={s}
              onClick={() => setStyle(style === s ? '' : s)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${style === s ? 'border-purple-500/60 bg-purple-500/20 text-purple-300' : 'border-glass-border text-dark-400 hover:text-white hover:border-white/20'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-2xs font-semibold text-dark-500 uppercase tracking-widest block mb-1.5">Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A futuristic city at night with neon lights and flying cars..."
          rows={4}
          className="input-field resize-none text-xs"
          id="ai-prompt-input"
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) generate(); }}
        />
        <p className="text-2xs text-dark-600 mt-1">Ctrl+Enter to generate</p>
      </div>

      <button
        onClick={generate}
        disabled={isGenerating || !prompt.trim()}
        id="ai-generate-btn"
        className="btn-primary w-full !py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
      >
        {isGenerating ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
        ) : (
          <><Sparkles className="w-4 h-4" /> Generate Image</>
        )}
      </button>

      {generatedImages.length > 0 && (
        <div>
          <p className="text-2xs font-semibold text-dark-500 uppercase tracking-widest mb-2">Generated</p>
          <div className="grid grid-cols-2 gap-2">
            {generatedImages.map((url, i) => (
              <button
                key={i}
                onClick={() => addToCanvas(url)}
                className="relative aspect-square rounded-xl overflow-hidden border border-glass-border hover:border-purple-500/40 transition-all group"
                title="Click to add to canvas"
              >
                <img src={url} alt={`Generated ${i}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-xs text-white font-semibold">Add to Canvas</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIImageGenerator;
