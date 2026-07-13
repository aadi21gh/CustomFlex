import { fabric } from 'fabric';
import { useStudio } from '@/context/StudioContext';

const STICKERS = {
  desi: [
    {
      name: 'Chai Lover',
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <rect x="5" y="5" width="90" height="90" rx="45" fill="#5B4636" stroke="#DFD8C9" stroke-width="3" />
        <path d="M40 30 Q35 20 40 15 T35 5" fill="none" stroke="#EFEAE0" stroke-width="2.5" stroke-linecap="round" />
        <path d="M50 30 Q45 20 50 15 T45 5" fill="none" stroke="#EFEAE0" stroke-width="2.5" stroke-linecap="round" />
        <path d="M60 30 Q55 20 60 15 T55 5" fill="none" stroke="#EFEAE0" stroke-width="2.5" stroke-linecap="round" />
        <path d="M30 40 L35 75 C37 80 63 80 65 75 L70 40 Z" fill="#C76D4A" />
        <rect x="31" y="50" width="38" height="8" fill="#E7B8A4" />
        <text x="50" y="90" fill="#EFEAE0" font-family="'Outfit', 'Inter', sans-serif" font-weight="bold" font-size="10" text-anchor="middle">CHAI LOVER</text>
      </svg>`
    },
    {
      name: 'Horn Ok Please',
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <rect x="5" y="5" width="90" height="90" rx="12" fill="#8A9A7B" stroke="#F7F3EB" stroke-width="3" />
        <path d="M25 45 C25 25, 75 25, 75 45" fill="#FFD700" stroke="black" stroke-width="2" />
        <path d="M22 45 L78 45 L78 50 L22 50 Z" fill="black" />
        <path d="M24 50 L28 85 L72 85 L76 50 Z" fill="#FFD700" stroke="black" stroke-width="2" />
        <path d="M28 65 L32 85 L68 85 L72 65 Z" fill="#006400" />
        <rect x="30" y="38" width="40" height="14" rx="2" fill="#E0FFFF" stroke="black" stroke-width="1.5" />
        <circle cx="50" cy="72" r="7" fill="#FFFFE0" stroke="black" stroke-width="1.5" />
        <circle cx="50" cy="72" r="3" fill="#FFFF00" />
        <rect x="44" y="85" width="12" height="8" rx="2" fill="black" />
        <text x="50" y="96" fill="#F7F3EB" font-family="'Outfit', 'Inter', sans-serif" font-weight="bold" font-size="8" text-anchor="middle">HORN OK PLEASE</text>
      </svg>`
    },
    {
      name: 'Jugaad',
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="#C76D4A" stroke="#F7F3EB" stroke-width="3" />
        <polygon points="50,10 90,28 90,72 50,90 10,72 10,28" fill="#5B4636" />
        <text x="50" y="48" fill="#FFD700" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="14" text-anchor="middle" letter-spacing="1">JUGAAD</text>
        <text x="50" y="65" fill="#F7F3EB" font-family="'Outfit', 'Inter', sans-serif" font-weight="bold" font-size="7" text-anchor="middle">100% CERTIFIED</text>
        <circle cx="50" cy="78" r="4" fill="#C76D4A" />
      </svg>`
    },
    {
      name: 'Samosa Love',
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <rect x="5" y="5" width="90" height="90" rx="45" fill="#fef08a" stroke="#ca8a04" stroke-width="2" />
        <polygon points="50,15 82,70 18,70" fill="#facc15" stroke="#854d0e" stroke-width="3.5" stroke-linejoin="round" />
        <path d="M48 30 Q50 32 52 30" fill="none" stroke="#854d0e" stroke-width="2" />
        <path d="M38 50 Q40 52 42 50" fill="none" stroke="#854d0e" stroke-width="2" />
        <path d="M58 50 Q60 52 62 50" fill="none" stroke="#854d0e" stroke-width="2" />
        <path d="M30 60 L70 60" fill="none" stroke="#854d0e" stroke-width="1.5" />
        <text x="50" y="86" fill="#854d0e" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="10" text-anchor="middle">SAMOSA LOVE</text>
      </svg>`
    },
    {
      name: 'Biryani Life',
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <rect x="5" y="5" width="90" height="90" rx="45" fill="#fff7ed" stroke="#ea580c" stroke-width="2" />
        <path d="M20 50 C20 75, 80 75, 80 50 Z" fill="#ea580c" stroke="#9a3412" stroke-width="2.5" />
        <path d="M22 50 C22 30, 78 30, 78 50 Z" fill="#fef08a" />
        <path d="M35 44 C32 40, 42 35, 45 42 Z" fill="#b45309" />
        <path d="M55 42 C52 38, 62 33, 65 40 Z" fill="#b45309" />
        <circle cx="50" cy="38" r="3" fill="#16a34a" />
        <circle cx="40" cy="46" r="2.5" fill="#dc2626" />
        <circle cx="58" cy="47" r="2.5" fill="#ca8a04" />
        <path d="M40 25 Q38 18 42 14" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" />
        <path d="M50 25 Q48 18 52 14" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" />
        <path d="M60 25 Q58 18 62 14" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" />
        <text x="50" y="86" fill="#9a3412" font-family="'Outfit', 'Inter', sans-serif" font-weight="bold" font-size="9" text-anchor="middle">BIRYANI IS LIFE</text>
      </svg>`
    },
    {
      name: 'Flying Chappal',
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="#fef2f2" stroke="#dc2626" stroke-width="3" />
        <path d="M35 30 C32 20, 48 15, 52 25 C55 35, 45 60, 48 75 C49 80, 40 82, 38 75 C35 60, 38 40, 35 30 Z" fill="#3b82f6" stroke="#1d4ed8" stroke-width="2.5" />
        <path d="M34 24 Q44 26 49 20 Q54 26 50 30" fill="none" stroke="#dc2626" stroke-width="3.5" stroke-linecap="round" />
        <line x1="68" y1="35" x2="82" y2="28" stroke="#dc2626" stroke-width="3" stroke-linecap="round" />
        <line x1="62" y1="50" x2="78" y2="42" stroke="#dc2626" stroke-width="3" stroke-linecap="round" />
        <line x1="65" y1="65" x2="80" y2="58" stroke="#dc2626" stroke-width="3" stroke-linecap="round" />
        <text x="50" y="90" fill="#b91c1c" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="9" text-anchor="middle">FLYING CHAPPAL</text>
      </svg>`
    }
  ],
  meme: [
    {
      name: 'Deal With It',
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40" viewBox="0 0 100 40">
        <rect x="5" y="15" width="35" height="15" fill="black" />
        <rect x="5" y="10" width="10" height="5" fill="black" />
        <rect x="10" y="15" width="5" height="5" fill="white" />
        <rect x="15" y="20" width="5" height="5" fill="white" />
        <rect x="40" y="15" width="20" height="5" fill="black" />
        <rect x="60" y="15" width="35" height="15" fill="black" />
        <rect x="85" y="10" width="10" height="5" fill="black" />
        <rect x="65" y="15" width="5" height="5" fill="white" />
        <rect x="70" y="20" width="5" height="5" fill="white" />
      </svg>`
    },
    {
      name: 'Stonks',
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <rect x="5" y="5" width="90" height="90" rx="20" fill="#1e1b4b" stroke="#3b82f6" stroke-width="2" />
        <path d="M15 75 L35 55 L50 65 L85 20 M85 20 L65 20 M85 20 L85 40" fill="none" stroke="#22c55e" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M15 75 L35 55 L50 65 L85 20" fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <text x="50" y="90" fill="#ffffff" font-family="'Outfit', 'Inter', sans-serif" font-weight="bold" font-size="12" text-anchor="middle">STONKS</text>
      </svg>`
    },
    {
      name: 'Babu Bhaiya',
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <rect x="5" y="5" width="90" height="90" rx="45" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" />
        <rect x="22" y="28" width="22" height="18" rx="2" fill="none" stroke="black" stroke-width="4.5" />
        <rect x="56" y="28" width="22" height="18" rx="2" fill="none" stroke="black" stroke-width="4.5" />
        <line x1="44" y1="34" x2="56" y2="34" stroke="black" stroke-width="4.5" />
        <path d="M42 42 L50 36 L58 42" fill="none" stroke="black" stroke-width="2" />
        <path d="M28 58 Q40 50 50 58 Q60 50 72 58 Q80 50 82 45 Q75 62 50 62 Q25 62 18 45 Q20 50 28 58 Z" fill="black" />
        <text x="50" y="84" fill="#0f172a" font-family="'Outfit', 'Inter', sans-serif" font-weight="bold" font-size="10" text-anchor="middle">BABU BHAIYA</text>
      </svg>`
    },
    {
      name: 'Trollface',
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="#ffffff" stroke="#1e293b" stroke-width="3" />
        <ellipse cx="38" cy="38" rx="8" ry="4" fill="none" stroke="black" stroke-width="2.5" />
        <ellipse cx="62" cy="38" rx="8" ry="4" fill="none" stroke="black" stroke-width="2.5" />
        <circle cx="36" cy="38" r="2.5" fill="black" />
        <circle cx="60" cy="38" r="2.5" fill="black" />
        <path d="M30 30 Q38 26 46 30" fill="none" stroke="black" stroke-width="1.5" />
        <path d="M54 30 Q62 26 70 30" fill="none" stroke="black" stroke-width="1.5" />
        <path d="M22 50 C22 80, 78 80, 78 50" fill="none" stroke="black" stroke-width="3" stroke-linecap="round" />
        <path d="M20 50 C35 53, 65 53, 80 50" fill="none" stroke="black" stroke-width="3" />
        <line x1="30" y1="52" x2="33" y2="68" stroke="black" stroke-width="1.5" />
        <line x1="40" y1="52" x2="42" y2="72" stroke="black" stroke-width="1.5" />
        <line x1="50" y1="52" x2="50" y2="73" stroke="black" stroke-width="1.5" />
        <line x1="60" y1="52" x2="58" y2="72" stroke="black" stroke-width="1.5" />
        <line x1="70" y1="52" x2="67" y2="68" stroke="black" stroke-width="1.5" />
        <path d="M18 46 Q22 52 24 58" fill="none" stroke="black" stroke-width="2" />
        <path d="M82 46 Q78 52 76 58" fill="none" stroke="black" stroke-width="2" />
        <text x="50" y="90" fill="#020617" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="8" text-anchor="middle">PROBLEM?</text>
      </svg>`
    },
    {
      name: 'Jaane Ka Nahi',
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <polygon points="50,8 92,85 8,85" fill="#facc15" stroke="black" stroke-width="3" stroke-linejoin="round" />
        <path d="M50 30 L50 55" fill="none" stroke="black" stroke-width="5" stroke-linecap="round" />
        <circle cx="50" cy="68" r="4.5" fill="black" />
        <text x="50" y="80" fill="black" font-family="'Outfit', 'Inter', sans-serif" font-weight="bold" font-size="5.5" text-anchor="middle" letter-spacing="0.2">BULATI HAI MAGAR</text>
        <text x="50" y="96" fill="#facc15" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="9" text-anchor="middle">JAANE KA NAHI</text>
      </svg>`
    },
    {
      name: 'GigaChad',
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <rect x="5" y="5" width="90" height="90" rx="20" fill="#0f172a" stroke="#64748b" stroke-width="2" />
        <path d="M48 20 C52 20, 55 18, 58 24 C62 30, 60 38, 64 42 C68 45, 72 48, 70 54 C68 60, 60 62, 58 72 C56 82, 52 85, 48 85 C44 85, 40 82, 38 72 C36 62, 28 60, 26 54 C24 48, 28 45, 32 42 C36 38, 34 30, 38 24 C41 18, 44 20, 48 20 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5" />
        <line x1="42" y1="36" x2="46" y2="38" stroke="#38bdf8" stroke-width="2" />
        <line x1="54" y1="38" x2="58" y2="36" stroke="#38bdf8" stroke-width="2" />
        <path d="M35 48 Q48 56 61 48" fill="none" stroke="#38bdf8" stroke-width="1.5" />
        <path d="M42 70 L48 76 L54 70" fill="none" stroke="#38bdf8" stroke-width="2" />
        <text x="50" y="93" fill="#38bdf8" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="8" text-anchor="middle" letter-spacing="1">GIGACHAD</text>
      </svg>`
    }
  ]
};

const StickerLibrary = () => {
  const { fabricRef, syncLayers, pushHistory } = useStudio();
  const canvas = () => fabricRef.current;

  const addSticker = (sticker) => {
    if (!canvas()) return;

    fabric.loadSVGFromString(sticker.svgString, (objects, options) => {
      const obj = fabric.util.groupSVGElements(objects, options);
      
      const offset = 40;
      const left = (canvas().width - (obj.width || 100)) / 2 + (Math.random() - 0.5) * offset * 2;
      const top = (canvas().height - (obj.height || 100)) / 2 + (Math.random() - 0.5) * offset * 2;

      obj.set({
        left,
        top,
        id: `sticker_${Date.now()}`,
        customName: `${sticker.name} Sticker`,
      });

      const maxDim = 120;
      if (obj.width > maxDim || obj.height > maxDim) {
        const scale = maxDim / Math.max(obj.width, obj.height);
        obj.set({ scaleX: scale, scaleY: scale });
      }

      canvas().add(obj);
      canvas().setActiveObject(obj);
      canvas().renderAll();
      syncLayers();
      pushHistory();
    });
  };

  return (
    <div className="p-4 space-y-6 overflow-y-auto h-full">
      <div>
        <p className="text-2xs font-semibold text-dark-500 uppercase tracking-widest mb-3">Desi Classics</p>
        <div className="grid grid-cols-3 gap-2">
          {STICKERS.desi.map((sticker) => (
            <button
              key={sticker.name}
              onClick={() => addSticker(sticker)}
              title={sticker.name}
              className="flex flex-col items-center justify-center p-2 rounded-xl border border-glass-border hover:border-brand-500/40 hover:bg-brand-500/10 transition-all duration-200 aspect-square group bg-dark-900/20"
            >
              <div
                className="w-14 h-14 flex items-center justify-center group-hover:scale-110 transition-transform"
                dangerouslySetInnerHTML={{ __html: sticker.svgString }}
              />
              <span className="text-[10px] mt-1 text-dark-400 group-hover:text-brand-300 font-medium truncate w-full text-center">
                {sticker.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-2xs font-semibold text-dark-500 uppercase tracking-widest mb-3">Meme Central</p>
        <div className="grid grid-cols-3 gap-2">
          {STICKERS.meme.map((sticker) => (
            <button
              key={sticker.name}
              onClick={() => addSticker(sticker)}
              title={sticker.name}
              className="flex flex-col items-center justify-center p-2 rounded-xl border border-glass-border hover:border-brand-500/40 hover:bg-brand-500/10 transition-all duration-200 aspect-square group bg-dark-900/20"
            >
              <div
                className="w-14 h-14 flex items-center justify-center group-hover:scale-110 transition-transform"
                dangerouslySetInnerHTML={{ __html: sticker.svgString }}
              />
              <span className="text-[10px] mt-1 text-dark-400 group-hover:text-brand-300 font-medium truncate w-full text-center">
                {sticker.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StickerLibrary;
