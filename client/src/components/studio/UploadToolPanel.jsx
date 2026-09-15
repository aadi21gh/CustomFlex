import { useRef, useState } from 'react';
import { fabric } from 'fabric';
import { useStudio } from '@/context/StudioContext';
import { Upload, Image as ImageIcon, Trash2, Check, Sparkles, Wand2, Scissors, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const SAMPLE_DECALS = [
  {
    name: '(: Crexza Face',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%23C76D4A"/><circle cx="35" cy="40" r="5" fill="%23FFFFFF"/><circle cx="65" cy="40" r="5" fill="%23FFFFFF"/><path d="M 30 60 Q 50 82 70 60" fill="none" stroke="%23FFFFFF" stroke-width="5" stroke-linecap="round"/></svg>',
  },
  {
    name: 'Cyber Starburst',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 100 100"><path d="M50 0 L58 38 L95 20 L68 50 L95 80 L58 62 L50 100 L42 62 L5 80 L32 50 L5 20 L42 38 Z" fill="%231A1A1A" stroke="%23C76D4A" stroke-width="2"/></svg>',
  },
  {
    name: 'Vintage Laurel Crest',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="none" stroke="%23C76D4A" stroke-width="2" stroke-dasharray="4,4"/><text x="50" y="58" font-family="Georgia, serif" font-size="28" font-weight="bold" fill="%235B4636" text-anchor="middle">C</text></svg>',
  },
  {
    name: 'Retro Sun Horizon',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 100 100"><circle cx="50" cy="42" r="30" fill="%23E7B8A4"/><rect x="15" y="42" width="70" height="4" fill="%23FFFFFF"/><rect x="18" y="50" width="64" height="4" fill="%23FFFFFF"/><rect x="22" y="58" width="56" height="4" fill="%23FFFFFF"/><path d="M10 70 L90 70" stroke="%235B4636" stroke-width="3"/></svg>',
  },
];

/* ── Smart 1-Click Background Remover (Client-side Alpha Isolator) ── */
const removeImageBackground = (imgUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Sample 4 corners to detect background color
      const corners = [
        [0, 0],
        [canvas.width - 1, 0],
        [0, canvas.height - 1],
        [canvas.width - 1, canvas.height - 1],
      ];
      let bgR = 0, bgG = 0, bgB = 0;
      corners.forEach(([x, y]) => {
        const idx = (y * canvas.width + x) * 4;
        bgR += data[idx];
        bgG += data[idx + 1];
        bgB += data[idx + 2];
      });
      bgR = bgR / 4;
      bgG = bgG / 4;
      bgB = bgB / 4;

      const tolerance = 45;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const dist = Math.sqrt(
          (r - bgR) ** 2 +
          (g - bgG) ** 2 +
          (b - bgB) ** 2
        );

        if (dist < tolerance) {
          data[i + 3] = 0; // Transparent
        } else if (dist < tolerance + 25) {
          // Soft anti-aliased edge feathering
          data[i + 3] = ((dist - tolerance) / 25) * 255;
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = imgUrl;
  });
};

const UploadToolPanel = () => {
  const { fabricRef, addCanvasObject, activeSide } = useStudio();
  const fileInputRef = useRef(null);
  const [recentUploads, setRecentUploads] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingBg, setIsProcessingBg] = useState(false);

  const addImageToCanvas = (dataUrl, name = 'Uploaded Graphic') => {
    fabric.Image.fromURL(dataUrl, (img) => {
      if (!img) return;
      const maxDim = 150;
      const scale = Math.min(maxDim / (img.width || 100), maxDim / (img.height || 100), 1);

      img.set({
        scaleX: scale,
        scaleY: scale,
        id: `upload_${Date.now()}`,
        customName: name,
        side: activeSide || 'front',
      });

      if (addCanvasObject) {
        addCanvasObject(img, { side: activeSide });
      } else if (fabricRef.current) {
        fabricRef.current.add(img);
        fabricRef.current.setActiveObject(img);
        fabricRef.current.renderAll();
      }

      toast.success('Image added to ' + (activeSide === 'back' ? 'Back' : 'Front') + '!');
    }, { crossOrigin: 'anonymous' });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target.result;
      setRecentUploads(prev => [url, ...prev.filter(u => u !== url)].slice(0, 6));
      addImageToCanvas(url, file.name);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target.result;
        setRecentUploads(prev => [url, ...prev.filter(u => u !== url)].slice(0, 6));
        addImageToCanvas(url, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 space-y-5 overflow-y-auto h-full select-none">
      <div>
        <p className="text-2xs font-semibold text-dark-500 uppercase tracking-widest mb-2.5">Upload Image</p>
        
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Drag & Drop Box */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-brand-500 bg-brand-500/10 scale-98'
              : 'border-glass-border hover:border-brand-500/40 hover:bg-dark-900/60 bg-dark-900/30'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-white mb-1">Click or drag image here</p>
          <p className="text-2xs text-dark-400">Supports PNG, JPG, SVG, WebP with transparency</p>
        </div>
      </div>

      {/* Recent Uploads */}
      {recentUploads.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-2xs font-semibold text-dark-500 uppercase tracking-widest">Your Uploads</p>
            <span className="text-3xs text-brand-400 font-mono">1-Click AI BG Removal</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {recentUploads.map((url, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden bg-dark-900/60 border border-glass-border hover:border-brand-500/40 aspect-square p-1.5 flex items-center justify-center">
                <button
                  onClick={() => addImageToCanvas(url, `Upload ${i + 1}`)}
                  className="w-full h-full flex items-center justify-center"
                  title="Add to canvas"
                >
                  <img src={url} alt="Upload" className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                </button>

                {/* AI BG Remover Overlay Action */}
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    const toastId = toast.loading('AI isolating graphic & removing background...');
                    try {
                      const transparentUrl = await removeImageBackground(url);
                      addImageToCanvas(transparentUrl, `Upload ${i + 1} (Transparent)`);
                      toast.success('Background removed & added to canvas!', { id: toastId });
                    } catch (err) {
                      toast.error('Could not isolate background', { id: toastId });
                    }
                  }}
                  className="absolute bottom-1 right-1 p-1 rounded-md bg-brand-500 hover:bg-brand-400 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  title="1-Click Remove Background"
                >
                  <Scissors className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sample Aesthetic Decals */}
      <div>
        <p className="text-2xs font-semibold text-dark-500 uppercase tracking-widest mb-2.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-brand-400" />
          <span>Starter Graphics & Decals</span>
        </p>
        <div className="grid grid-cols-2 gap-2">
          {SAMPLE_DECALS.map((d) => (
            <button
              key={d.name}
              onClick={() => addImageToCanvas(d.url, d.name)}
              className="p-3 rounded-xl bg-dark-900/40 hover:bg-dark-900 border border-glass-border hover:border-brand-500/40 transition-all text-center flex flex-col items-center gap-2 group"
            >
              <div className="w-12 h-12 flex items-center justify-center">
                <img src={d.url} alt={d.name} className="max-h-full max-w-full group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-2xs font-bold text-dark-300 group-hover:text-white">{d.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UploadToolPanel;
