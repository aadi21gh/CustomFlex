import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight, LayoutGrid, Check, ChevronDown, Shirt, Frame, ShoppingBag } from 'lucide-react';
import { STARTER_TEMPLATES, TEMPLATE_STYLES } from './templatesData';
import { MOCKUP_IMAGES, getMockup } from './mockupRegistry';

/* ─── Product Category Tabs ───────────────────────────────────────────────────── */
const PRODUCT_CATEGORIES = [
  { id: 'clothing', label: 'Clothing', icon: Shirt, products: ['tshirt', 'oversized', 'hoodie', 'sweatshirt', 'longsleeve', 'tanktop', 'polo', 'jacket'] },
  { id: 'artwork', label: 'Wall Art', icon: Frame, products: ['canvas', 'poster', 'acrylic'] },
  { id: 'accessories', label: 'Accessories', icon: ShoppingBag, products: ['phonecase', 'totebag', 'cap'] },
];

/* ─── Photorealistic Mockup Preview Card ──────────────────────────────────────── */
const RealisticMockupPreview = ({ template, productType = 'tshirt' }) => {
  const mockup = getMockup(productType);
  const { garment: garmentColor, text: textColor, accent: accentColor } = template.defaultColors;

  return (
    <div className="w-full h-44 rounded-2xl flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-[#EAE4D9]/30 to-[#DFD7C8]/40 border border-glass-border shadow-inner">
      {/* Photorealistic Product Image */}
      <img
        src={mockup.front}
        alt={`${mockup.label} mockup`}
        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
        loading="lazy"
        draggable={false}
        style={{ filter: garmentColor !== '#FFFFFF' ? `sepia(0.15) hue-rotate(${getHueRotation(garmentColor)}deg)` : 'none' }}
      />

      {/* Design Artwork Overlay on Front */}
      <div
        className="absolute pointer-events-none flex items-center justify-center"
        style={{
          left: `${mockup.printArea.x}%`,
          top: `${mockup.printArea.y}%`,
          width: `${mockup.printArea.w}%`,
          height: `${mockup.printArea.h}%`,
        }}
      >
        <TemplateArtworkOverlay template={template} textColor={textColor} accentColor={accentColor} />
      </div>

      {/* Product Type Label Badge */}
      <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-dark-950/70 backdrop-blur-sm text-[10px] font-bold text-white/80 tracking-wide uppercase">
        {MOCKUP_IMAGES[productType]?.label || 'T-Shirt'}
      </span>

      {/* Subtle shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 pointer-events-none" />
    </div>
  );
};

/* ─── Template-Specific Artwork Overlay (SVG) ─────────────────────────────────── */
const TemplateArtworkOverlay = ({ template, textColor, accentColor }) => {
  return (
    <svg viewBox="0 0 100 110" className="w-full h-full opacity-85" fill="none" xmlns="http://www.w3.org/2000/svg">
      {template.id === 'signature-smiley' && (
        <g>
          <rect x="8" y="4" width="84" height="96" rx="4" fill="none" stroke={accentColor} strokeWidth="1" strokeDasharray="3 2" />
          <circle cx="50" cy="42" r="22" fill={accentColor} fillOpacity="0.12" />
          <text x="50" y="50" textAnchor="middle" fontSize="22" fontWeight="900" fontFamily="monospace" fill={accentColor}>(:</text>
          <text x="50" y="14" textAnchor="middle" fontSize="6" fontWeight="900" fontFamily="sans-serif" fill={textColor} letterSpacing="0.5">HAVE A NICE DAY</text>
          <text x="50" y="80" textAnchor="middle" fontSize="4.5" fontWeight="bold" fontFamily="sans-serif" fill={textColor} opacity="0.7">CREXZA ARCHIVE</text>
          <text x="50" y="94" textAnchor="middle" fontSize="3.5" fontFamily="monospace" fill={accentColor} opacity="0.6">N° 024 — SPECIAL EDITION</text>
        </g>
      )}

      {template.id === 'tokyo-streetwear' && (
        <g>
          <text x="50" y="14" textAnchor="middle" fontSize="12" fontWeight="900" fontFamily="sans-serif" fill={textColor} letterSpacing="1">CREXZA</text>
          <line x1="10" y1="20" x2="90" y2="20" stroke={accentColor} strokeWidth="1.5" />
          <text x="50" y="32" textAnchor="middle" fontSize="5" fontWeight="bold" fontFamily="sans-serif" fill={textColor}>TOKYO // クレクサ</text>
          <g transform="translate(20, 40)">
            {[1, 0.5, 1.2, 0.4, 0.8, 1.5, 0.5, 1, 0.8, 1.4, 0.5, 1, 0.8, 1.2, 0.6, 1, 0.7, 1.3].map((w, i) => (
              <rect key={i} x={i * 3.2} y="0" width={w * 2} height="16" fill={textColor} />
            ))}
          </g>
          <text x="50" y="72" textAnchor="middle" fontSize="4" fontFamily="monospace" fill={accentColor}>35°39'N 139°41'E</text>
          <text x="50" y="90" textAnchor="middle" fontSize="3.5" fontFamily="monospace" fill={textColor} opacity="0.5">METROPOLITAN 2025</text>
        </g>
      )}

      {template.id === 'varsity-athletic' && (
        <g>
          <text x="50" y="16" textAnchor="middle" fontSize="10" fontWeight="900" fontFamily="sans-serif" fill={textColor} stroke={accentColor} strokeWidth="0.5" letterSpacing="0.5">CREXZA</text>
          <text x="50" y="62" textAnchor="middle" fontSize="38" fontWeight="900" fontFamily="Impact, sans-serif" fill={accentColor} stroke={textColor} strokeWidth="0.8">08</text>
          <line x1="12" y1="78" x2="38" y2="78" stroke={textColor} strokeWidth="0.8" />
          <text x="50" y="80" textAnchor="middle" fontSize="8" fill={accentColor}>★</text>
          <line x1="62" y1="78" x2="88" y2="78" stroke={textColor} strokeWidth="0.8" />
          <text x="50" y="96" textAnchor="middle" fontSize="4" fontWeight="bold" fontFamily="sans-serif" fill={textColor} opacity="0.6">ALL-STAR DIVISION</text>
        </g>
      )}

      {template.id === 'luxury-monogram' && (
        <g>
          <text x="50" y="10" textAnchor="middle" fontSize="4" fontFamily="Georgia, serif" fill={accentColor}>MMXXV</text>
          <circle cx="50" cy="46" r="28" fill="none" stroke={accentColor} strokeWidth="1.2" />
          <circle cx="50" cy="46" r="24" fill="none" stroke={textColor} strokeWidth="0.6" strokeDasharray="2 1.5" />
          <text x="50" y="56" textAnchor="middle" fontSize="26" fontWeight="bold" fontFamily="Georgia, serif" fill={textColor}>C</text>
          <text x="50" y="88" textAnchor="middle" fontSize="6" fontWeight="bold" fontFamily="Georgia, serif" fill={textColor} letterSpacing="0.5">ATELIER</text>
          <text x="50" y="100" textAnchor="middle" fontSize="3" fontFamily="Georgia, serif" fill={accentColor} opacity="0.7">HAUTE COUTURE & READY-TO-WEAR</text>
        </g>
      )}

      {template.id === 'polaroid-frame' && (
        <g>
          <rect x="14" y="6" width="72" height="86" rx="2" fill="#FFFFFF" stroke="#D8D0C5" strokeWidth="1" />
          <defs>
            <linearGradient id="photo-grad-modal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D98A6C" />
              <stop offset="50%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>
          <rect x="19" y="11" width="62" height="50" rx="1" fill="url(#photo-grad-modal)" />
          <rect x="32" y="0" width="36" height="8" fill="#E8D8BA" opacity="0.7" />
          <text x="50" y="74" textAnchor="middle" fontSize="5" fontWeight="bold" fontFamily="cursive, sans-serif" fill={textColor}>Positano '25</text>
          <text x="50" y="84" textAnchor="middle" fontSize="3.5" fontFamily="monospace" fill={accentColor} opacity="0.6">35MM FILM</text>
        </g>
      )}

      {template.id === 'retro-mountain' && (
        <g>
          <polygon points="50,6 88,46 50,86 12,46" fill="none" stroke={accentColor} strokeWidth="1.2" />
          <polygon points="50,22 72,52 28,52" fill={textColor} />
          <polygon points="50,32 62,52 38,52" fill={accentColor} fillOpacity="0.35" />
          <text x="50" y="98" textAnchor="middle" fontSize="6" fontWeight="900" fontFamily="sans-serif" fill={textColor} letterSpacing="0.3">PACIFIC</text>
        </g>
      )}

      {template.id === 'bauhaus-poster' && (
        <g>
          <circle cx="42" cy="45" r="24" fill={accentColor} fillOpacity="0.85" />
          <circle cx="62" cy="55" r="16" fill="none" stroke={textColor} strokeWidth="1.2" />
          <line x1="16" y1="78" x2="84" y2="78" stroke={textColor} strokeWidth="1.5" />
          <text x="50" y="24" textAnchor="middle" fontSize="8" fontWeight="900" fontFamily="sans-serif" fill={textColor} letterSpacing="0.5">BAUHAUS</text>
          <text x="50" y="90" textAnchor="middle" fontSize="3.5" fontWeight="bold" fontFamily="sans-serif" fill={textColor}>1923 WEIMAR</text>
        </g>
      )}

      {template.id === 'botanical-art' && (
        <g>
          <rect x="15" y="8" width="70" height="92" fill="none" stroke={accentColor} strokeWidth="0.8" strokeDasharray="3 2" />
          <path d="M 50 25 Q 55 45 42 60 Q 58 50 62 38" stroke={accentColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <text x="50" y="78" textAnchor="middle" fontSize="6" fontWeight="bold" fontFamily="serif" fill={textColor}>FLORA</text>
          <text x="50" y="88" textAnchor="middle" fontSize="3" fontStyle="italic" fontFamily="serif" fill={accentColor}>Herbarium No. 04</text>
        </g>
      )}

      {template.id === 'cyber-matrix' && (
        <g>
          <rect x="12" y="8" width="76" height="92" fill="none" stroke={textColor} strokeWidth="1" />
          <text x="50" y="26" textAnchor="middle" fontSize="6" fontWeight="900" fontFamily="monospace" fill={textColor}>NEO TOKYO</text>
          <g transform="translate(24, 38)">
            {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 2].map((w, i) => (
              <rect key={i} x={i * 4.6} y="0" width={w} height="14" fill={textColor} />
            ))}
          </g>
          <text x="50" y="68" textAnchor="middle" fontSize="3.5" fontWeight="bold" fontFamily="monospace" fill={accentColor}>SYSTEM OVERRIDE</text>
          <text x="50" y="86" textAnchor="middle" fontSize="3" fontFamily="monospace" fill={textColor} opacity="0.6">SYS.08 // VER 4.09</text>
        </g>
      )}

      {template.id === 'vintage-crest-patch' && (
        <g>
          <path d="M 50 12 C 76 12 88 20 88 52 C 88 82 50 102 50 102 C 50 102 12 82 12 52 C 12 20 24 12 50 12 Z" fill="none" stroke={accentColor} strokeWidth="1.8" />
          <text x="50" y="36" textAnchor="middle" fontSize="12" fill={accentColor}>★</text>
          <text x="50" y="58" textAnchor="middle" fontSize="5.5" fontWeight="900" fontFamily="sans-serif" fill={textColor}>ALPINE</text>
          <text x="50" y="70" textAnchor="middle" fontSize="3.5" fontWeight="bold" fontFamily="sans-serif" fill={textColor}>EXPLORER</text>
          <text x="50" y="86" textAnchor="middle" fontSize="3" fontFamily="monospace" fill={accentColor}>ELEV. 2840M</text>
        </g>
      )}

      {template.id === 'archive-longsleeve' && (
        <g>
          <rect x="8" y="12" width="84" height="84" fill="none" stroke={accentColor} strokeWidth="0.8" strokeDasharray="5 3" />
          <line x1="12" y1="22" x2="88" y2="22" stroke={textColor} strokeWidth="1" />
          <text x="50" y="36" textAnchor="middle" fontSize="8" fontWeight="900" fontFamily="sans-serif" fill={textColor} letterSpacing="0.6">ARCHIVE</text>
          <text x="50" y="48" textAnchor="middle" fontSize="8" fontWeight="900" fontFamily="sans-serif" fill={textColor} letterSpacing="0.6">MEMBER</text>
          <rect x="12" y="54" width="76" height="3" fill={accentColor} />
          <text x="50" y="66" textAnchor="middle" fontSize="4" fontWeight="bold" fontFamily="sans-serif" fill={textColor} opacity="0.75">EXTENDED EDITION NO. 03</text>
          {[1, 0.5, 1.5, 0.8, 1.2, 2, 0.6, 1.4, 1, 0.7, 1.6, 0.5, 1.1, 0.9].map((w, i) => (
            <rect key={i} x={18 + i * 4.4} y="74" width={w * 2} height="10" fill={textColor} opacity="0.65" />
          ))}
          <line x1="12" y1="90" x2="88" y2="90" stroke={textColor} strokeWidth="1" />
        </g>
      )}

      {template.id === 'sundowner-tanktop' && (
        <g>
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * 360) / 12;
            const rad = (angle * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={50 + Math.cos(rad) * 20}
                y1={42 + Math.sin(rad) * 20}
                x2={50 + Math.cos(rad) * 30}
                y2={42 + Math.sin(rad) * 30}
                stroke={accentColor}
                strokeWidth="1.2"
                opacity="0.7"
              />
            );
          })}
          <circle cx="50" cy="42" r="17" fill={accentColor} opacity="0.88" />
          <text x="50" y="74" textAnchor="middle" fontSize="11" fontWeight="900" fontFamily="Impact, sans-serif" fill={textColor} letterSpacing="0.3">SUNDOWNER</text>
          <line x1="12" y1="80" x2="33" y2="80" stroke={textColor} strokeWidth="0.8" />
          <line x1="67" y1="80" x2="88" y2="80" stroke={textColor} strokeWidth="0.8" />
          <text x="50" y="88" textAnchor="middle" fontSize="4" fontWeight="bold" fontFamily="sans-serif" fill={textColor}>BEACH ATHLETICS CLUB</text>
          <text x="50" y="100" textAnchor="middle" fontSize="3.5" fontFamily="monospace" fill={accentColor}>EST. 1986 • MALIBU</text>
        </g>
      )}

      {template.id === 'prep-polo-crest' && (
        <g>
          <ellipse cx="50" cy="50" rx="38" ry="46" fill="none" stroke={accentColor} strokeWidth="1.4" />
          <ellipse cx="50" cy="50" rx="33" ry="41" fill="none" stroke={textColor} strokeWidth="0.6" strokeDasharray="2 1.5" />
          <line x1="17" y1="20" x2="83" y2="20" stroke={accentColor} strokeWidth="1" />
          <line x1="17" y1="80" x2="83" y2="80" stroke={accentColor} strokeWidth="1" />
          <text x="50" y="16" textAnchor="middle" fontSize="5" fontWeight="bold" fontFamily="Georgia, serif" fill={textColor} letterSpacing="0.4">CREXZA FIELDS</text>
          <text x="50" y="58" textAnchor="middle" fontSize="22" fontWeight="bold" fontFamily="Georgia, serif" fill={textColor}>CF</text>
          <text x="50" y="92" textAnchor="middle" fontSize="4" fontStyle="italic" fontFamily="Georgia, serif" fill={accentColor}>Polo Club MMXXV</text>
        </g>
      )}

      {template.id === 'neon-cityscape' && (
        <g>
          <rect x="5" y="5" width="90" height="100" fill="#0F172A" opacity="0.9" />
          {[0, 1, 2, 3, 4].map(i => (
            <line key={`h${i}`} x1="8" y1={60 + i * 10} x2="92" y2={60 + i * 10} stroke={accentColor} strokeWidth="0.5" opacity={0.25 + i * 0.05} />
          ))}
          {[-3, -2, -1, 0, 1, 2, 3].map(i => (
            <line key={`v${i}`} x1={50 + i * 14} y1="20" x2={50 + i * 8} y2="105" stroke={accentColor} strokeWidth="0.5" opacity="0.25" />
          ))}
          {[
            { x: 10, h: 28, w: 8 }, { x: 20, h: 20, w: 6 }, { x: 28, h: 36, w: 10 },
            { x: 40, h: 22, w: 7 }, { x: 49, h: 40, w: 9 }, { x: 60, h: 25, w: 8 },
            { x: 70, h: 32, w: 10 }, { x: 82, h: 18, w: 6 },
          ].map((b, i) => (
            <rect key={`b${i}`} x={b.x} y={60 - b.h} width={b.w} height={b.h} fill={accentColor} opacity={0.12 + (i % 3) * 0.06} stroke={accentColor} strokeWidth="0.5" />
          ))}
          <line x1="8" y1="60" x2="92" y2="60" stroke={accentColor} strokeWidth="1.2" opacity="0.8" />
          <text x="50" y="22" textAnchor="middle" fontSize="8" fontWeight="900" fontFamily="sans-serif" fill={accentColor} letterSpacing="0.5">NEON DISTRICT</text>
          <text x="50" y="80" textAnchor="middle" fontSize="3.5" fontWeight="bold" fontFamily="sans-serif" fill="#FFFFFF" opacity="0.75">METROPOLITAN SKYLINE</text>
          <text x="50" y="96" textAnchor="middle" fontSize="3" fontFamily="monospace" fill={accentColor} opacity="0.7">VOL. III — INDIGO CITY</text>
        </g>
      )}

      {template.id === 'block-logo-cap' && (
        <g>
          <path d="M 8 70 L 2 38 Q 50 8 98 38 L 92 70 Z" fill="none" stroke={textColor} strokeWidth="1.2" />
          <path d="M 12 38 Q 50 14 88 38" fill="none" stroke={accentColor} strokeWidth="1.2" />
          <text x="50" y="52" textAnchor="middle" fontSize="18" fontWeight="900" fontFamily="Impact, sans-serif" fill={textColor} letterSpacing="0.4">CREXZA</text>
          <rect x="16" y="58" width="68" height="2" fill={accentColor} />
          <text x="50" y="68" textAnchor="middle" fontSize="5" fontWeight="700" fontFamily="sans-serif" fill={textColor} letterSpacing="0.5">ARCH DIVISION</text>
          <text x="50" y="80" textAnchor="middle" fontSize="3.5" fontFamily="monospace" fill={accentColor}>SNAPBACK • ONE SIZE</text>
        </g>
      )}

      {/* Fallback for templates without specific artwork */}
      {!['signature-smiley', 'tokyo-streetwear', 'varsity-athletic', 'luxury-monogram', 'polaroid-frame', 'retro-mountain', 'bauhaus-poster', 'botanical-art', 'cyber-matrix', 'vintage-crest-patch', 'archive-longsleeve', 'sundowner-tanktop', 'prep-polo-crest', 'neon-cityscape', 'block-logo-cap'].includes(template.id) && (
        <g>
          <text x="50" y="50" textAnchor="middle" fontSize="8" fontWeight="900" fontFamily="monospace" fill={accentColor}>(:</text>
          <text x="50" y="70" textAnchor="middle" fontSize="5" fontWeight="bold" fontFamily="sans-serif" fill={textColor}>CREXZA</text>
        </g>
      )}
    </svg>
  );
};

/* ─── Utility: Approximate hue rotation for garment tinting ───────────────────── */
function getHueRotation(hexColor) {
  if (!hexColor || hexColor === '#FFFFFF') return 0;
  const r = parseInt(hexColor.slice(1, 3), 16) / 255;
  const g = parseInt(hexColor.slice(3, 5), 16) / 255;
  const b = parseInt(hexColor.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0;
  if (max !== min) {
    const d = max - min;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return Math.round(h * 360);
}

/* ─── Product Type Selector Dropdown ──────────────────────────────────────────── */
const ProductTypePicker = ({ selectedProduct, onSelectProduct }) => {
  const [isOpen, setIsOpen] = useState(false);
  const mockup = getMockup(selectedProduct);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-dark-800/60 border border-glass-border text-xs font-semibold text-white hover:bg-dark-700/80 transition-all"
      >
        <img src={mockup.front} alt="" className="w-6 h-6 object-cover rounded" />
        <span>{mockup.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-dark-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-72 max-h-80 overflow-y-auto rounded-2xl glass-card-strong border border-glass-border shadow-2xl z-50 p-2"
          >
            {PRODUCT_CATEGORIES.map((cat) => (
              <div key={cat.id} className="mb-2">
                <div className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-dark-400 uppercase tracking-wider">
                  <cat.icon className="w-3.5 h-3.5" />
                  {cat.label}
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {cat.products.map((pId) => {
                    const m = MOCKUP_IMAGES[pId];
                    if (!m) return null;
                    const isActive = selectedProduct === pId;
                    return (
                      <button
                        key={pId}
                        onClick={() => { onSelectProduct(pId); setIsOpen(false); }}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-brand-500/15 text-brand-500 border border-brand-500/30'
                            : 'text-dark-300 hover:bg-dark-800/60 hover:text-white border border-transparent'
                        }`}
                      >
                        <img src={m.front} alt="" className="w-8 h-8 object-cover rounded-lg" />
                        <span className="truncate">{m.label}</span>
                        {isActive && <Check className="w-3 h-3 text-brand-500 ml-auto flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════════
   Main Template Picker Modal
   ═══════════════════════════════════════════════════════════════════════════════ */
const TemplatePickerModal = ({ isOpen, onClose, onSelectTemplate, onSelectBlank }) => {
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState('tshirt');

  if (!isOpen) return null;

  const filteredTemplates = selectedStyle === 'all'
    ? STARTER_TEMPLATES
    : STARTER_TEMPLATES.filter((t) => t.style === selectedStyle);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-dark-950/80 backdrop-blur-md">
        <motion.div
          className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl glass-card-strong overflow-hidden border border-glass-border shadow-2xl"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {/* Header */}
          <div className="p-5 border-b border-glass-border flex items-center justify-between flex-shrink-0 bg-dark-900/40">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-lg text-[#F7F3EB] select-none"
                style={{ background: 'linear-gradient(135deg, #C76D4A, #8A9A7B)' }}
              >
                (:
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Realistic Product Templates</h2>
                <p className="text-xs text-dark-400">Choose a product &amp; template — see it on a real mockup instantly.</p>
              </div>
            </div>
            <button onClick={onClose} className="toolbar-btn" title="Close modal">
              <X className="w-5 h-5 text-dark-400" />
            </button>
          </div>

          {/* Controls Row: Product Picker + Style Filters */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-glass-border bg-dark-900/20 overflow-x-auto no-scrollbar flex-shrink-0">
            <ProductTypePicker
              selectedProduct={selectedProduct}
              onSelectProduct={setSelectedProduct}
            />
            <div className="w-px h-6 bg-glass-border flex-shrink-0" />
            {TEMPLATE_STYLES.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setSelectedStyle(id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedStyle === id
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-dark-400 hover:text-brand-500 hover:bg-brand-500/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Blank Canvas Card */}
            <div
              onClick={onSelectBlank}
              className="glass-card p-5 rounded-2xl flex flex-col justify-between items-center text-center border-2 border-dashed border-dark-700 hover:border-brand-500 transition-all cursor-pointer group hover:-translate-y-1 hover:shadow-card-hover min-h-[290px]"
            >
              <div className="w-full h-44 rounded-2xl bg-dark-800/40 flex items-center justify-center my-auto group-hover:scale-105 transition-transform border border-glass-border overflow-hidden relative">
                {/* Show a faded mockup image for the selected product */}
                <img
                  src={getMockup(selectedProduct).front}
                  alt="Blank canvas"
                  className="w-full h-full object-cover object-center opacity-30 group-hover:opacity-50 transition-opacity"
                  draggable={false}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <LayoutGrid className="w-8 h-8 text-dark-400 group-hover:text-brand-500 transition-colors mb-2" />
                  <span className="text-xs text-dark-400 font-semibold">Your Design Here</span>
                </div>
              </div>
              <div className="mt-3">
                <h3 className="font-bold text-sm text-white mb-1">Start with Blank Canvas</h3>
                <p className="text-xs text-dark-400 leading-relaxed">Full creative freedom with layers, vector tools, and AI generation.</p>
              </div>
              <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-500 group-hover:underline">
                Blank Pro Studio <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Template Cards with Realistic Mockup Previews */}
            {filteredTemplates.map((template) => (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                onClick={() => onSelectTemplate(template, selectedProduct)}
                className="glass-card p-4 rounded-2xl flex flex-col justify-between border border-glass-border hover:border-brand-500 transition-all cursor-pointer group hover:-translate-y-1 hover:shadow-card-hover relative overflow-hidden"
              >
                {/* Badge */}
                {template.badge && (
                  <span className="absolute top-3.5 right-3.5 tag text-2xs z-10 shadow-sm">
                    {template.badge}
                  </span>
                )}

                {/* Photorealistic Mockup Preview */}
                <RealisticMockupPreview template={template} productType={selectedProduct} />

                {/* Details */}
                <div className="mt-3">
                  <h3 className="font-bold text-sm text-white mb-1 group-hover:text-brand-500 transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-xs text-dark-400 leading-relaxed mb-3 line-clamp-2">
                    {template.tagline}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-glass-border">
                  <span className="text-2xs text-dark-500 font-medium">
                    {template.hasPhoto ? 'Photo Upload' : 'Instant Text'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-500 group-hover:translate-x-1 transition-transform">
                    Customize <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer Note */}
          <div className="p-4 border-t border-glass-border bg-dark-900/40 flex items-center justify-between text-xs text-dark-400">
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              All templates are 100% editable on front &amp; back — works on every product type.
            </span>
            <span className="text-brand-500 font-semibold cursor-pointer hover:underline" onClick={onSelectBlank}>
              Switch to Pro Mode →
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TemplatePickerModal;
