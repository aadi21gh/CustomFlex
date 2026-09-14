import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fabric } from 'fabric';
import {
  Sparkles, Type, Shapes, Smile, Image as ImageIcon, Palette,
  ChevronDown, Check, Undo2, Redo2, ZoomIn, ZoomOut, RotateCcw,
  Trash2, Copy, MoveUp, MoveDown, Upload, Eye, ShoppingCart,
  Search, Plus, AlignLeft, AlignCenter, AlignRight, Bold, Italic,
  Square, Circle, Triangle, Star, Heart, Shield, Minus, Hexagon,
  Layers, ArrowRight, X, Sliders, RefreshCw, Feather, Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useStudio } from '@/context/StudioContext';
import { STARTER_TEMPLATES, TEMPLATE_STYLES, applyTemplateToFabricCanvas } from './templatesData';
import { getMockup, getAllProductTypes, MOCKUP_IMAGES } from './mockupRegistry';
import { isTemplateObject } from './ProductTemplate';
import StudioCanvas from './Canvas';

/* ─── Fabric Materials & Quality Specifications ───────────────────────────────── */
export const FABRIC_MATERIALS = {
  clothing: [
    {
      id: 'combed_cotton',
      name: '100% Combed Ring-Spun Cotton',
      gsm: '180 GSM',
      badge: 'Standard Included',
      priceAddon: 0,
      description: 'Ultra-breathable, pre-shrunk, soft regular daily fit.',
      tag: 'Eco Bio-Washed',
      feel: 'Lightweight & Breathable',
    },
    {
      id: 'french_terry',
      name: 'Heavyweight French Terry Cotton',
      gsm: '320 GSM',
      badge: 'Streetwear Luxury',
      priceAddon: 249,
      description: 'Plush interior loops, dense structured boxy drape, high durability.',
      tag: 'Streetwear Choice',
      feel: 'Heavyweight & Structured',
    },
    {
      id: 'supima_cotton',
      name: 'Luxury Supima® Long-Staple Cotton',
      gsm: '240 GSM',
      badge: 'Artisan Grade',
      priceAddon: 399,
      description: '2x stronger than standard cotton, featherweight silk sheen, museum colorfast.',
      tag: 'Luxury Silk Feel',
      feel: 'Silky Smooth & Lustrous',
    },
    {
      id: 'organic_bamboo',
      name: 'Organic Bamboo & Bio-Cotton Blend',
      gsm: '210 GSM',
      badge: 'Sustainable Eco',
      priceAddon: 299,
      description: 'Naturally hypoallergenic, thermal regulating, antibacterial soft touch.',
      tag: '100% Eco-Friendly',
      feel: 'Cooling & Silky',
    },
    {
      id: 'acid_wash_fleece',
      name: 'Heavyweight Acid-Wash Fleece',
      gsm: '380 GSM',
      badge: 'Vintage Distressed',
      priceAddon: 449,
      description: 'Garment-dyed vintage streetwear aesthetic with ultra-thick thermal fleece warmth.',
      tag: 'Heavy Thermal Fleece',
      feel: 'Ultra Warm & Plush',
    },
  ],
  artwork: [
    {
      id: 'fine_art_paper',
      name: 'Matte Archival Fine Art Paper',
      gsm: '280 GSM',
      badge: 'Standard Gallery',
      priceAddon: 0,
      description: 'Acid-free smooth matte finish with crisp high-definition line sharpness.',
      tag: 'Museum Grade',
      feel: 'Smooth Matte Finish',
    },
    {
      id: 'textured_canvas',
      name: 'Heavyweight Textured Gallery Canvas',
      gsm: '380 GSM',
      badge: 'Artist Cotton Canvas',
      priceAddon: 399,
      description: '100% genuine woven artist canvas stretched over seasoned pine wood.',
      tag: 'Textured Weave',
      feel: 'Rich Woven Texture',
    },
    {
      id: 'acrylic_glass',
      name: 'High-Gloss 4mm Ultra-Clear Acrylic',
      gsm: '4mm Solid',
      badge: 'Ultra Luxury Float',
      priceAddon: 699,
      description: 'Shatter-resistant diamond polished optical acrylic with floating wall mount.',
      tag: 'Floating Glass Depth',
      feel: 'High-Gloss Glass',
    },
  ],
  accessories: [
    {
      id: 'matte_polycarbonate',
      name: 'Matte Polycarbonate Slim Shell',
      gsm: 'Slim 1.5mm',
      badge: 'Slim Fit',
      priceAddon: 0,
      description: 'Ultra-thin snap case with scratch-resistant matte soft-touch coating.',
      tag: 'Featherweight',
      feel: 'Matte Soft-Touch',
    },
    {
      id: 'shockproof_armor',
      name: 'Impact Armor Dual-Layer Shockproof',
      gsm: 'Drop-Tested 10ft',
      badge: 'Heavy Protection',
      priceAddon: 199,
      description: 'Shock-absorbing TPU inner lining + impact resistant outer shell.',
      tag: '10ft Drop Certified',
      feel: 'Military Armor Shield',
    },
    {
      id: 'raw_canvas_16oz',
      name: '16oz Heavyweight Raw Canvas',
      gsm: '450 GSM',
      badge: 'Heavyweight Utility',
      priceAddon: 249,
      description: 'Ultra-sturdy natural cotton duck canvas with reinforced cross-stitching.',
      tag: 'Extreme Durability',
      feel: 'Heavy Duty Woven',
    },
  ],
};

const BASE_PRICES = {
  tshirt: 799,
  oversized: 899,
  hoodie: 1499,
  sweatshirt: 1299,
  longsleeve: 999,
  tanktop: 699,
  polo: 1099,
  jacket: 1999,
  canvas: 899,
  poster: 599,
  acrylic: 1299,
  phonecase: 499,
  totebag: 449,
  cap: 549,
};

/* ─── Curated Color Palettes ─────────────────────────────────────────────────── */
const COLOR_PRESETS = [
  { label: 'Walnut & Terracotta', text: '#5B4636', accent: '#C76D4A', bg: '#F7F3EB' },
  { label: 'Obsidian Noir', text: '#1E1E1E', accent: '#5B4636', bg: '#FFFFFF' },
  { label: 'Sage & Forest', text: '#3E4B37', accent: '#8A9A7B', bg: '#F7F3EB' },
  { label: 'Vintage Rust', text: '#7C341E', accent: '#D89377', bg: '#FAF7F0' },
  { label: 'Warm Cream', text: '#5B4636', accent: '#C76D4A', bg: '#FAF7F0' },
  { label: 'Golden Hour', text: '#2A231D', accent: '#E65100', bg: '#FFFFFF' },
];

const GARMENT_COLORS = [
  { label: 'Pure White', hex: '#FFFFFF' },
  { label: 'Warm Cream', hex: '#F7F3EB' },
  { label: 'Heather Gray', hex: '#71717A' },
  { label: 'Jet Black', hex: '#1C1917' },
  { label: 'Forest Sage', hex: '#8A9A7B' },
  { label: 'Terracotta', hex: '#C76D4A' },
  { label: 'Navy Blue', hex: '#1E3A5F' },
  { label: 'Crimson', hex: '#B91C1C' },
  { label: 'Charcoal', hex: '#44403C' },
  { label: 'Warm Sand', hex: '#D4B896' },
];

const QUICK_COLORS = [
  '#C76D4A', '#8A9A7B', '#5B4636', '#1E1E1E', '#FFFFFF',
  '#FF5722', '#E65100', '#B91C1C', '#1E3A5F', '#166534',
  '#E7B8A4', '#D4B896', '#71717A', '#3E4B37', '#7C341E'
];

const FONT_FAMILIES = [
  { id: 'Space Grotesk', label: 'Space Grotesk (Modern / Cyber)' },
  { id: 'Inter', label: 'Inter (Clean / Minimal)' },
  { id: 'Georgia', label: 'Georgia (Luxury Serif)' },
  { id: 'Impact', label: 'Impact (Bold Varsity)' },
  { id: 'Caveat', label: 'Caveat (Handwritten / Casual)' },
  { id: 'Outfit', label: 'Outfit (Geometric Urban)' },
  { id: 'Courier New', label: 'Courier New (Monospace / Code)' },
];

/* ─── Curated Viral & Pop Culture Stickers ───────────────────────────────────── */
const QUICK_STICKERS = [
  {
    name: '(: Crexza Seal',
    category: 'crexza',
    svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <path d="M 46 32 C 30 32 24 40 24 50 C 24 60 30 68 46 68" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="62" cy="40" r="4.2" fill="#FFFFFF" />
      <circle cx="62" cy="60" r="4.2" fill="#FFFFFF" />
      <text x="50" y="22" fill="#FFFFFF" font-family="'Inter', sans-serif" font-weight="bold" font-size="6" letter-spacing="1" text-anchor="middle">CREXZA ARCHIVE</text>
      <text x="50" y="82" fill="#FFFFFF" font-family="'Inter', sans-serif" font-weight="bold" font-size="6" letter-spacing="1" text-anchor="middle">OFFICIAL EDITION</text>
    </svg>`
  },
  {
    name: 'Doge Wow',
    category: 'memes',
    svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="#eab308" stroke="#ca8a04" stroke-width="2.5" />
      <polygon points="20,35 15,10 38,22" fill="#ca8a04" stroke="#854d0e" stroke-width="2" />
      <polygon points="80,35 85,10 62,22" fill="#ca8a04" stroke="#854d0e" stroke-width="2" />
      <ellipse cx="50" cy="60" rx="22" ry="18" fill="#fef08a" />
      <ellipse cx="50" cy="52" rx="7" ry="5" fill="#1e293b" />
      <ellipse cx="36" cy="40" rx="5" ry="6" fill="#ffffff" stroke="#1e293b" stroke-width="1.5" />
      <ellipse cx="64" cy="40" rx="5" ry="6" fill="#ffffff" stroke="#1e293b" stroke-width="1.5" />
      <circle cx="38" cy="40" r="3.2" fill="#1e293b" />
      <circle cx="66" cy="40" r="3.2" fill="#1e293b" />
      <text x="25" y="24" fill="#3b82f6" font-family="'Comic Sans MS', sans-serif" font-weight="bold" font-size="7">much wow</text>
      <text x="60" y="85" fill="#ec4899" font-family="'Comic Sans MS', sans-serif" font-weight="bold" font-size="7">so flex</text>
    </svg>`
  },
  {
    name: 'This Is Fine',
    category: 'memes',
    svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <rect x="5" y="5" width="90" height="90" rx="16" fill="#ffedd5" stroke="#ea580c" stroke-width="2.5" />
      <path d="M10 85 Q15 45 25 60 Q35 30 45 55 Q55 25 65 50 Q75 35 85 65 L90 85 Z" fill="#f97316" opacity="0.85" />
      <circle cx="50" cy="50" r="16" fill="#d97706" stroke="#78350f" stroke-width="2" />
      <ellipse cx="50" cy="36" rx="10" ry="3" fill="#15803d" />
      <rect x="44" y="26" width="12" height="10" fill="#15803d" />
      <circle cx="45" cy="48" r="3.5" fill="#ffffff" stroke="#78350f" stroke-width="1" />
      <circle cx="55" cy="48" r="3.5" fill="#ffffff" stroke="#78350f" stroke-width="1" />
      <circle cx="45" cy="48" r="1.5" fill="#000000" />
      <circle cx="55" cy="48" r="1.5" fill="#000000" />
      <text x="50" y="92" fill="#7c2d12" font-family="'Outfit', sans-serif" font-weight="900" font-size="8" text-anchor="middle">THIS IS FINE.</text>
    </svg>`
  },
  {
    name: 'Pepe Feels Good',
    category: 'memes',
    svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="#4ade80" stroke="#15803d" stroke-width="3" />
      <ellipse cx="34" cy="34" rx="12" ry="10" fill="#ffffff" stroke="#15803d" stroke-width="2.5" />
      <ellipse cx="66" cy="34" rx="12" ry="10" fill="#ffffff" stroke="#15803d" stroke-width="2.5" />
      <circle cx="34" cy="34" r="5" fill="#1e293b" />
      <circle cx="66" cy="34" r="5" fill="#1e293b" />
      <path d="M18 56 Q50 68 82 56 Q50 82 18 56 Z" fill="#b91c1c" stroke="#7f1d1d" stroke-width="2" />
      <text x="50" y="91" fill="#14532d" font-family="'Outfit', sans-serif" font-weight="900" font-size="7.5" text-anchor="middle">FEELS GOOD</text>
    </svg>`
  },
  {
    name: 'Tokyo Barcode',
    category: 'streetwear',
    svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <rect x="5" y="10" width="90" height="80" rx="8" fill="#18181B" stroke="#C76D4A" stroke-width="2" />
      <g fill="#F4F4F5" transform="translate(14, 25)">
        <rect x="0" y="0" width="3" height="30" />
        <rect x="5" y="0" width="1.5" height="30" />
        <rect x="9" y="0" width="4.5" height="30" />
        <rect x="16" y="0" width="2" height="30" />
        <rect x="20" y="0" width="6" height="30" />
        <rect x="28" y="0" width="2.5" height="30" />
        <rect x="33" y="0" width="5" height="30" />
        <rect x="40" y="0" width="2" height="30" />
        <rect x="44" y="0" width="4" height="30" />
        <rect x="50" y="0" width="1.5" height="30" />
        <rect x="54" y="0" width="6" height="30" />
        <rect x="63" y="0" width="2" height="30" />
        <rect x="67" y="0" width="5" height="30" />
      </g>
      <text x="50" y="70" fill="#C76D4A" font-family="'Space Grotesk', monospace" font-weight="bold" font-size="6.5" text-anchor="middle">TOKYO // クレクサ</text>
      <text x="50" y="80" fill="#A1A1AA" font-family="monospace" font-size="4.5" text-anchor="middle">35°39'N 139°41'E</text>
    </svg>`
  },
  {
    name: 'Alpine Crest',
    category: 'streetwear',
    svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <path d="M 50 8 C 80 8 92 18 92 50 C 92 80 50 96 50 96 C 50 96 8 80 8 50 C 8 18 20 8 50 8 Z" fill="#3E4B37" stroke="#C76D4A" stroke-width="3" />
      <polygon points="50,22 68,52 32,52" fill="#F7F3EB" />
      <polygon points="50,30 60,52 40,52" fill="#C76D4A" />
      <text x="50" y="72" fill="#F7F3EB" font-family="'Impact', sans-serif" font-weight="bold" font-size="9" text-anchor="middle">ALPINE</text>
      <text x="50" y="83" fill="#C76D4A" font-family="sans-serif" font-weight="bold" font-size="5" text-anchor="middle">EXPEDITION</text>
    </svg>`
  },
  {
    name: 'Star Badge',
    category: 'badges',
    svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="#E65100" stroke="#FFE082" stroke-width="3" />
      <polygon points="50,15 58,35 80,38 64,54 68,76 50,65 32,76 36,54 20,38 42,35" fill="#FFD54F" stroke="#B26A00" stroke-width="2" />
      <circle cx="50" cy="50" r="12" fill="#E65100" />
      <text x="50" y="54" fill="#FFFFFF" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="12" text-anchor="middle">★</text>
    </svg>`
  },
  {
    name: 'Heart Flame',
    category: 'badges',
    svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="#18181B" stroke="#EF4444" stroke-width="3" />
      <path d="M50 82 C50 82 20 62 20 40 C20 26 30 20 40 25 C45 28 48 32 50 36 C52 32 55 28 60 25 C70 20 80 26 80 40 C80 62 50 82 50 82 Z" fill="#EF4444" />
      <path d="M50 70 C50 70 32 54 32 40 C32 30 38 26 44 30 C47 32 49 35 50 38 C51 35 53 32 56 30 C62 26 68 30 68 40 C68 54 50 70 50 70 Z" fill="#FBBF24" />
    </svg>`
  }
];

const QuickTemplateCustomizer = ({
  template: initialTemplate,
  category,
  onSwitchToPro,
  onCheckout,
  isSaving,
}) => {
  const {
    fabricRef,
    productColor,
    setProductColor,
    productType,
    setProductType,
    activeSide,
    setActiveSide,
    designTitle,
    setDesignTitle,
    pushHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useStudio();

  // Active creative tool tab
  const [activeTab, setActiveTab] = useState('templates'); // 'templates' | 'text' | 'materials' | 'shapes' | 'stickers' | 'images' | 'colors'
  const [currentTemplate, setCurrentTemplate] = useState(() => initialTemplate || STARTER_TEMPLATES[0]);
  const [selectedStyleFilter, setSelectedStyleFilter] = useState('all');

  // Form & Color state for active template
  const [formValues, setFormValues] = useState(() => ({ ...currentTemplate.defaultTexts }));
  const [colorValues, setColorValues] = useState(() => ({ ...currentTemplate.defaultColors }));
  const [customPhotoUrl, setCustomPhotoUrl] = useState(currentTemplate.defaultPhoto || null);

  // Fabric Material selection state
  const currentCategory = ['canvas', 'poster', 'acrylic'].includes(productType)
    ? 'artwork'
    : ['phonecase', 'totebag', 'cap'].includes(productType)
    ? 'accessories'
    : 'clothing';

  const availableMaterials = FABRIC_MATERIALS[currentCategory] || FABRIC_MATERIALS.clothing;
  const [selectedMaterialId, setSelectedMaterialId] = useState(availableMaterials[0].id);

  // Selected object inspector state
  const [activeCanvasObject, setActiveCanvasObject] = useState(null);
  const [selectedFont, setSelectedFont] = useState('Space Grotesk');
  const [newTextValue, setNewTextValue] = useState('');
  const [stickerSearch, setStickerSearch] = useState('');
  const [selectedStickerCategory, setSelectedStickerCategory] = useState('all');
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);

  const fileInputRef = useRef(null);
  const freeImageInputRef = useRef(null);

  const currentMockup = getMockup(productType);
  const allProducts = getAllProductTypes();

  // Selected Material and Dynamic Pricing
  const selectedMaterial = availableMaterials.find((m) => m.id === selectedMaterialId) || availableMaterials[0];
  const basePrice = BASE_PRICES[productType] || 799;
  const totalPrice = basePrice + (selectedMaterial?.priceAddon || 0);

  // Reset material if category changes
  useEffect(() => {
    if (!availableMaterials.some((m) => m.id === selectedMaterialId)) {
      setSelectedMaterialId(availableMaterials[0].id);
    }
  }, [currentCategory, availableMaterials, selectedMaterialId]);

  // Switch template
  const handleSelectTemplate = (tmpl) => {
    setCurrentTemplate(tmpl);
    setFormValues({ ...tmpl.defaultTexts });
    setColorValues({ ...tmpl.defaultColors });
    setCustomPhotoUrl(tmpl.defaultPhoto || null);

    if (tmpl.defaultColors?.garment) {
      setProductColor(tmpl.defaultColors.garment);
    }

    // Auto-switch product type if template targets specific category
    if (tmpl.category === 'artwork' && !['canvas', 'poster', 'acrylic'].includes(productType)) {
      setProductType('canvas');
    } else if (tmpl.category === 'accessories' && !['phonecase', 'totebag', 'cap'].includes(productType)) {
      setProductType('phonecase');
    }

    toast.success(`Loaded "${tmpl.name}"!`);
  };

  // Sync canvas object selection
  useEffect(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;

    const onSelection = (e) => {
      const obj = e.selected?.[0];
      if (obj && !isTemplateObject(obj)) {
        setActiveCanvasObject(obj);
      } else {
        setActiveCanvasObject(null);
      }
    };

    canvas.on('selection:created', onSelection);
    canvas.on('selection:updated', onSelection);
    canvas.on('selection:cleared', () => setActiveCanvasObject(null));

    return () => {
      if (canvas) {
        canvas.off('selection:created', onSelection);
        canvas.off('selection:updated', onSelection);
        canvas.off('selection:cleared');
      }
    };
  }, [fabricRef.current]);

  // Sync title
  useEffect(() => {
    if (formValues.headline) {
      setDesignTitle(`${formValues.headline} — ${currentTemplate.name}`);
    }
  }, [formValues.headline, currentTemplate.name, setDesignTitle]);

  // Apply template to Fabric Canvas
  useEffect(() => {
    if (!fabricRef.current) return;
    const timer = setTimeout(() => {
      applyTemplateToFabricCanvas(
        fabricRef.current,
        currentTemplate,
        formValues,
        colorValues,
        customPhotoUrl
      );
    }, 40);
    return () => clearTimeout(timer);
  }, [currentTemplate, formValues, colorValues, customPhotoUrl, fabricRef]);

  // Handle template text changes
  const handleInputChange = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  // Add Freeform Custom Text
  const handleAddCustomText = (textToAdd, fontName = selectedFont, size = 26, color = colorValues.text || '#1E1E1E') => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    const textObj = new fabric.IText(textToAdd || 'YOUR TEXT HERE', {
      left: canvas.width * 0.25,
      top: canvas.height * 0.44 + (Math.random() * 40 - 20),
      originX: 'center',
      originY: 'center',
      fontSize: size,
      fontFamily: fontName,
      fontWeight: '900',
      fill: color,
      id: `text_${Date.now()}`,
      customName: 'Custom Text',
    });
    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.renderAll();
    pushHistory();
    toast.success('Text added to canvas!');
    setNewTextValue('');
  };

  // Add Shapes
  const handleAddShape = (shapeType, fill = colorValues.accent || '#C76D4A') => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    const cx = canvas.width * 0.25;
    const cy = canvas.height * 0.42;
    let shape;

    if (shapeType === 'rect') {
      shape = new fabric.Rect({ width: 140, height: 90, rx: 8, ry: 8, fill });
    } else if (shapeType === 'circle') {
      shape = new fabric.Circle({ radius: 55, fill });
    } else if (shapeType === 'star') {
      const points = [];
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? 50 : 22;
        const a = (i * Math.PI) / 5 - Math.PI / 2;
        points.push({ x: r * Math.cos(a), y: r * Math.sin(a) });
      }
      shape = new fabric.Polygon(points, { fill });
    } else if (shapeType === 'triangle') {
      shape = new fabric.Triangle({ width: 100, height: 90, fill });
    } else if (shapeType === 'heart') {
      const path = 'M 0,-25 C 0,-38 12,-50 25,-45 C 42,-40 46,-25 33,-8 L 0,16 L -33,-8 C -46,-25 -42,-40 -25,-45 C -12,-50 0,-38 0,-25 Z';
      shape = new fabric.Path(path, { fill, scaleX: 1.6, scaleY: 1.6 });
    } else if (shapeType === 'shield') {
      const path = 'M 0 -40 C 25 -40 38 -32 38 0 C 38 32 0 55 0 55 C 0 55 -38 32 -38 0 C -38 -32 -25 -40 0 -40 Z';
      shape = new fabric.Path(path, { fill, stroke: '#FFFFFF', strokeWidth: 1.5, scaleX: 1.4, scaleY: 1.4 });
    } else if (shapeType === 'line') {
      shape = new fabric.Line([0, 0, 180, 0], { stroke: fill, strokeWidth: 3.5 });
    } else if (shapeType === 'diamond') {
      shape = new fabric.Rect({ width: 90, height: 90, angle: 45, fill });
    } else if (shapeType === 'hexagon') {
      const sides = 6;
      const points = Array.from({ length: sides }, (_, i) => {
        const a = (2 * Math.PI * i) / sides - Math.PI / 2;
        return { x: 55 * Math.cos(a), y: 55 * Math.sin(a) };
      });
      shape = new fabric.Polygon(points, { fill });
    }

    if (shape) {
      shape.set({
        left: cx,
        top: cy,
        originX: 'center',
        originY: 'center',
        id: `shape_${Date.now()}`,
        customName: `${shapeType} Shape`,
      });
      canvas.add(shape);
      canvas.setActiveObject(shape);
      canvas.renderAll();
      pushHistory();
      toast.success('Shape added!');
    }
  };

  // Add Sticker from SVG string
  const handleAddSticker = (sticker) => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    fabric.loadSVGFromString(sticker.svgString, (objects, options) => {
      const stickerObj = fabric.util.groupSVGElements(objects, options);
      stickerObj.set({
        left: canvas.width * 0.25,
        top: canvas.height * 0.42,
        originX: 'center',
        originY: 'center',
        id: `sticker_${Date.now()}`,
        customName: sticker.name,
      });
      stickerObj.scaleToWidth(110);
      canvas.add(stickerObj);
      canvas.setActiveObject(stickerObj);
      canvas.renderAll();
      pushHistory();
      toast.success(`Sticker "${sticker.name}" added!`);
    });
  };

  // Add User Uploaded Image
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target.result;
      fabric.Image.fromURL(dataUrl, (img) => {
        if (!fabricRef.current) return;
        const canvas = fabricRef.current;
        img.set({
          left: canvas.width * 0.25,
          top: canvas.height * 0.42,
          originX: 'center',
          originY: 'center',
          id: `img_${Date.now()}`,
          customName: file.name,
        });
        img.scaleToWidth(180);
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        pushHistory();
        toast.success('Image added to design!');
      }, { crossOrigin: 'anonymous' });
    };
    reader.readAsDataURL(file);
  };

  // Handle Photo Upload specifically for Polaroid frame template
  const handlePolaroidPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setCustomPhotoUrl(evt.target.result);
      toast.success('Photo applied to Polaroid frame!');
    };
    reader.readAsDataURL(file);
  };

  // Selected Object Actions
  const handleDeleteSelected = () => {
    if (!fabricRef.current || !activeCanvasObject) return;
    fabricRef.current.remove(activeCanvasObject);
    fabricRef.current.discardActiveObject();
    fabricRef.current.renderAll();
    setActiveCanvasObject(null);
    pushHistory();
    toast.success('Object removed');
  };

  const handleDuplicateSelected = () => {
    if (!fabricRef.current || !activeCanvasObject) return;
    activeCanvasObject.clone((cloned) => {
      cloned.set({
        left: cloned.left + 20,
        top: cloned.top + 20,
        id: `clone_${Date.now()}`,
      });
      fabricRef.current.add(cloned);
      fabricRef.current.setActiveObject(cloned);
      fabricRef.current.renderAll();
      pushHistory();
      toast.success('Object duplicated');
    });
  };

  const handleUpdateActiveColor = (newColor) => {
    if (!fabricRef.current || !activeCanvasObject) return;
    if (activeCanvasObject.type === 'i-text' || activeCanvasObject.type === 'text') {
      activeCanvasObject.set({ fill: newColor });
    } else if (activeCanvasObject.set) {
      activeCanvasObject.set({ fill: newColor });
    }
    fabricRef.current.renderAll();
    pushHistory();
  };

  const handleClearAllCustom = () => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    const objects = canvas.getObjects().filter((o) => !isTemplateObject(o) && o.id !== '__grid__');
    objects.forEach((o) => canvas.remove(o));
    canvas.discardActiveObject();
    canvas.renderAll();
    setActiveCanvasObject(null);
    pushHistory();
    toast.success('Canvas cleared');
  };

  // Filtered templates
  const filteredTemplates = selectedStyleFilter === 'all'
    ? STARTER_TEMPLATES
    : STARTER_TEMPLATES.filter((t) => t.style === selectedStyleFilter);

  // Filtered stickers
  const filteredStickers = QUICK_STICKERS.filter((s) => {
    const matchesCat = selectedStickerCategory === 'all' || s.category === selectedStickerCategory;
    const matchesSearch = !stickerSearch || s.name.toLowerCase().includes(stickerSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const isGarment = category === 'clothing' || ['tshirt', 'oversized', 'hoodie', 'sweatshirt', 'longsleeve', 'tanktop', 'polo', 'jacket'].includes(productType);

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-dark-950">
      {/* ══════════════════════════════════════════════════════════════════════
          LEFT SIDEBAR: Easy Creative Toolkit
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="w-full md:w-[420px] lg:w-[450px] flex-shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-glass-border bg-dark-950/95 backdrop-blur-xl z-20 max-h-[50vh] md:max-h-none overflow-hidden shadow-xl">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-2 border-b border-glass-border bg-dark-900/40 overflow-x-auto no-scrollbar flex-shrink-0">
          {[
            { id: 'templates', label: 'Templates', icon: Palette },
            { id: 'text', label: 'Text', icon: Type },
            { id: 'materials', label: 'Fabric & Quality', icon: Feather },
            { id: 'shapes', label: 'Shapes', icon: Shapes },
            { id: 'stickers', label: 'Stickers', icon: Smile },
            { id: 'images', label: 'Upload', icon: ImageIcon },
            { id: 'colors', label: 'Color & Theme', icon: Sliders },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === id
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Panel */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* ════════════════════════════════════════════════════════════════
              TAB 1: TEMPLATES (Direct 1-Click Pick & Edit)
              ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div>
                <span className="tag mb-1.5 text-[10px]">Instant Presets</span>
                <h3 className="text-base font-black text-white">Realistic Starter Templates</h3>
                <p className="text-xs text-dark-400">Click any template to immediately load &amp; customize it.</p>
              </div>

              {/* Style Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {TEMPLATE_STYLES.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setSelectedStyleFilter(id)}
                    className={`px-2.5 py-1 rounded-lg text-2xs font-bold whitespace-nowrap transition-all ${
                      selectedStyleFilter === id
                        ? 'bg-brand-500 text-white'
                        : 'bg-dark-900/60 text-dark-400 hover:text-white hover:bg-dark-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-2 gap-3">
                {filteredTemplates.map((t) => {
                  const isSelected = currentTemplate.id === t.id;
                  const tMockup = getMockup(t.category === 'artwork' ? 'canvas' : t.category === 'accessories' ? 'phonecase' : 'tshirt');

                  return (
                    <motion.div
                      key={t.id}
                      onClick={() => handleSelectTemplate(t)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                        isSelected
                          ? 'bg-brand-500/15 border-brand-500 ring-2 ring-brand-500/30 shadow-lg'
                          : 'glass-card border-glass-border hover:border-dark-600'
                      }`}
                    >
                      {t.badge && (
                        <span className="absolute top-2 right-2 tag text-[9px] !py-0.5 !px-1.5 z-10 shadow-sm">
                          {t.badge}
                        </span>
                      )}

                      {/* Mockup image thumbnail */}
                      <div className="w-full h-28 rounded-xl bg-dark-900/40 overflow-hidden relative mb-2 flex items-center justify-center border border-glass-border">
                        <img
                          src={tMockup.front}
                          alt={t.name}
                          className="w-full h-full object-cover object-center"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-dark-950/20" />
                        {isSelected && (
                          <div className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center text-white shadow-sm">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="font-bold text-xs text-white line-clamp-1 group-hover:text-brand-400">
                          {t.name}
                        </h4>
                        <p className="text-2xs text-dark-400 line-clamp-1 mt-0.5">
                          {t.tagline}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 2: TEXT (Edit Template Texts + Add Custom Texts)
              ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'text' && (
            <div className="space-y-5">
              {/* Template Texts Fields */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-dark-300">
                    Active Template Slogans
                  </h4>
                  <span className="text-2xs text-brand-400 font-medium">Live sync</span>
                </div>

                {currentTemplate.textFields?.map(({ key, label, placeholder, maxLength }) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-2xs font-semibold text-dark-400">
                      <span>{label}</span>
                      <span className="font-mono text-dark-500">
                        {(formValues[key] || '').length}/{maxLength}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={formValues[key] || ''}
                      onChange={(e) => handleInputChange(key, e.target.value.slice(0, maxLength))}
                      placeholder={placeholder}
                      className="input-field w-full text-xs font-bold"
                    />
                  </div>
                ))}
              </div>

              {/* Add New Custom Text */}
              <div className="p-4 rounded-2xl glass-card border border-glass-border space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-brand-500" />
                  Add Custom Text Layer
                </h4>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTextValue}
                    onChange={(e) => setNewTextValue(e.target.value)}
                    placeholder="Type anything..."
                    className="input-field flex-1 text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTextValue.trim()) {
                        handleAddCustomText(newTextValue.trim());
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (newTextValue.trim()) handleAddCustomText(newTextValue.trim());
                    }}
                    disabled={!newTextValue.trim()}
                    className="btn-primary !py-1.5 !px-3 text-xs disabled:opacity-40"
                  >
                    Add
                  </button>
                </div>

                {/* Quick Add Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    onClick={() => handleAddCustomText('CREXZA CLUB', selectedFont, 32)}
                    className="px-2.5 py-1 rounded-lg bg-dark-800 hover:bg-dark-700 text-2xs font-bold text-white border border-glass-border"
                  >
                    + Headline
                  </button>
                  <button
                    onClick={() => handleAddCustomText('SPECIAL EDITION', selectedFont, 18)}
                    className="px-2.5 py-1 rounded-lg bg-dark-800 hover:bg-dark-700 text-2xs font-medium text-dark-300 border border-glass-border"
                  >
                    + Subheading
                  </button>
                  <button
                    onClick={() => handleAddCustomText('(: HAVE A NICE DAY', 'Space Grotesk', 22, '#C76D4A')}
                    className="px-2.5 py-1 rounded-lg bg-brand-500/15 hover:bg-brand-500/25 text-2xs font-bold text-brand-400 border border-brand-500/30"
                  >
                    + (: Slogan
                  </button>
                </div>

                {/* Font Selector */}
                <div className="space-y-1.5 pt-2 border-t border-glass-border">
                  <label className="text-2xs font-bold uppercase tracking-wider text-dark-400">Font Style</label>
                  <select
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value)}
                    className="input-field w-full text-xs font-semibold bg-dark-900 text-white"
                  >
                    {FONT_FAMILIES.map((f) => (
                      <option key={f.id} value={f.id} style={{ fontFamily: f.id }}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Text Color Swatches */}
              <div className="space-y-2">
                <label className="text-2xs font-bold uppercase tracking-wider text-dark-400">Text Color</label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setColorValues((prev) => ({ ...prev, text: c }));
                        if (activeCanvasObject) handleUpdateActiveColor(c);
                      }}
                      className={`w-6 h-6 rounded-full border transition-all ${
                        colorValues.text === c ? 'ring-2 ring-brand-500 scale-110' : 'border-glass-border hover:scale-105'
                      }`}
                      style={{ background: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 3: FABRIC MATERIAL & CHARGES (Fabric Spec & Quality Selection)
              ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'materials' && (
            <div className="space-y-4">
              <div>
                <span className="tag mb-1.5 text-[10px]">Fabric Grade</span>
                <h3 className="text-base font-black text-white">Fabric Material &amp; Quality</h3>
                <p className="text-xs text-dark-400">Select garment fabric weight, weave, and finish with transparent pricing.</p>
              </div>

              <div className="space-y-3">
                {availableMaterials.map((mat) => {
                  const isSelected = selectedMaterialId === mat.id;
                  return (
                    <motion.div
                      key={mat.id}
                      onClick={() => {
                        setSelectedMaterialId(mat.id);
                        toast.success(`Selected ${mat.name}`);
                      }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-brand-500/15 border-brand-500 ring-2 ring-brand-500/30 shadow-md'
                          : 'glass-card border-glass-border hover:border-dark-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-brand-500 bg-brand-500 text-white' : 'border-dark-600 bg-dark-900'
                          }`}>
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </span>
                          <div>
                            <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                              {mat.name}
                            </h4>
                            <span className="text-[10px] text-brand-400 font-semibold">{mat.feel}</span>
                          </div>
                        </div>

                        <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                          mat.priceAddon === 0
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                        }`}>
                          {mat.priceAddon === 0 ? 'Included' : `+₹${mat.priceAddon}`}
                        </span>
                      </div>

                      <p className="text-2xs text-dark-400 leading-relaxed mb-2 pl-6">
                        {mat.description}
                      </p>

                      <div className="flex items-center gap-2 pl-6 text-2xs">
                        <span className="px-2 py-0.5 rounded bg-dark-900/80 text-dark-300 font-mono font-bold">
                          {mat.gsm}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-dark-900/80 text-brand-400/90 font-medium">
                          {mat.tag}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Material summary box */}
              <div className="p-3.5 rounded-2xl bg-dark-900/60 border border-glass-border flex items-center justify-between text-xs">
                <div>
                  <span className="text-2xs text-dark-400 font-medium block">Total Configuration</span>
                  <span className="font-bold text-white">{currentMockup.label} + {selectedMaterial.name}</span>
                </div>
                <span className="text-base font-black text-brand-400">₹{totalPrice}</span>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 4: SHAPES (1-Click Geometric Shapes & Badges)
              ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'shapes' && (
            <div className="space-y-5">
              <div>
                <span className="tag mb-1.5 text-[10px]">Vector Shapes</span>
                <h3 className="text-base font-black text-white">Add Geometric Elements</h3>
                <p className="text-xs text-dark-400">Click any shape to place it on the product.</p>
              </div>

              {/* Shape Buttons Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'rect', label: 'Rectangle', icon: Square },
                  { id: 'circle', label: 'Circle', icon: Circle },
                  { id: 'star', label: 'Star Badge', icon: Star },
                  { id: 'shield', label: 'Shield Crest', icon: Shield },
                  { id: 'heart', label: 'Heart', icon: Heart },
                  { id: 'triangle', label: 'Triangle', icon: Triangle },
                  { id: 'diamond', label: 'Diamond', icon: Sparkles },
                  { id: 'line', label: 'Divider Line', icon: Minus },
                  { id: 'hexagon', label: 'Hexagon', icon: Hexagon },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => handleAddShape(id)}
                    className="p-3 rounded-2xl glass-card border border-glass-border hover:border-brand-500 hover:bg-brand-500/10 transition-all flex flex-col items-center justify-center gap-1.5 group text-dark-300 hover:text-white"
                  >
                    <Icon className="w-5 h-5 text-brand-400 group-hover:scale-110 transition-transform" />
                    <span className="text-2xs font-bold">{label}</span>
                  </button>
                ))}
              </div>

              {/* Shape Color Swatches */}
              <div className="p-4 rounded-2xl glass-card border border-glass-border space-y-3">
                <label className="text-2xs font-bold uppercase tracking-wider text-dark-400">Shape Color</label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setColorValues((prev) => ({ ...prev, accent: c }));
                        if (activeCanvasObject) handleUpdateActiveColor(c);
                      }}
                      className={`w-6 h-6 rounded-full border transition-all ${
                        colorValues.accent === c ? 'ring-2 ring-brand-500 scale-110' : 'border-glass-border hover:scale-105'
                      }`}
                      style={{ background: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 5: STICKERS (Memes, Badges, Emojis, Streetwear)
              ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'stickers' && (
            <div className="space-y-4">
              <div>
                <span className="tag mb-1.5 text-[10px]">Graphics &amp; Memes</span>
                <h3 className="text-base font-black text-white">Sticker &amp; Badge Collection</h3>
                <p className="text-xs text-dark-400">One-click to stamp artwork onto your product.</p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-dark-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={stickerSearch}
                  onChange={(e) => setStickerSearch(e.target.value)}
                  placeholder="Search stickers, memes, badges..."
                  className="input-field w-full pl-8 text-xs"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'crexza', label: '(: Official' },
                  { id: 'memes', label: 'Viral Memes' },
                  { id: 'streetwear', label: 'Streetwear' },
                  { id: 'badges', label: 'Badges' },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setSelectedStickerCategory(id)}
                    className={`px-2.5 py-1 rounded-lg text-2xs font-bold whitespace-nowrap transition-all ${
                      selectedStickerCategory === id
                        ? 'bg-brand-500 text-white'
                        : 'bg-dark-900/60 text-dark-400 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Sticker Grid */}
              <div className="grid grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                {filteredStickers.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => handleAddSticker(s)}
                    className="p-2.5 rounded-2xl glass-card border border-glass-border hover:border-brand-500 hover:bg-brand-500/10 transition-all flex flex-col items-center justify-center gap-1.5 group"
                    title={`Add ${s.name}`}
                  >
                    <div
                      className="w-14 h-14 flex items-center justify-center group-hover:scale-105 transition-transform"
                      dangerouslySetInnerHTML={{ __html: s.svgString }}
                    />
                    <span className="text-2xs font-bold text-dark-300 line-clamp-1">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 6: IMAGES & PHOTOS (Upload Custom Logos, Photos & Art)
              ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'images' && (
            <div className="space-y-5">
              <div>
                <span className="tag mb-1.5 text-[10px]">Custom Uploads</span>
                <h3 className="text-base font-black text-white">Add Your Own Images</h3>
                <p className="text-xs text-dark-400">Upload logos, photos, illustrations or graphics.</p>
              </div>

              {/* Free Image Upload Dropzone */}
              <div
                onClick={() => freeImageInputRef.current?.click()}
                className="p-6 rounded-2xl glass-card border-2 border-dashed border-dark-700 hover:border-brand-500 transition-all flex flex-col items-center justify-center text-center cursor-pointer group hover:bg-brand-500/5"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-brand-500" />
                </div>
                <h4 className="text-xs font-bold text-white mb-1">Click to Upload Image / Photo</h4>
                <p className="text-2xs text-dark-400">Supports PNG with transparency, JPG, WebP</p>
                <input
                  ref={freeImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Polaroid Photo Frame Specific Dropzone (if active template supports it) */}
              {currentTemplate.hasPhoto && (
                <div className="p-4 rounded-2xl glass-card border border-glass-border space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                    Template Photo Frame
                  </h4>
                  <p className="text-2xs text-dark-400">Replace the photo inside the Polaroid frame:</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary w-full text-xs flex items-center justify-center gap-2"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Replace Frame Photo
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePolaroidPhotoUpload}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 7: COLOR & THEMES (Garment Color & Aesthetic Palettes)
              ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'colors' && (
            <div className="space-y-5">
              <div>
                <span className="tag mb-1.5 text-[10px]">Garment &amp; Palette</span>
                <h3 className="text-base font-black text-white">Product Model &amp; Colors</h3>
                <p className="text-xs text-dark-400">Change garment color and curated aesthetic themes.</p>
              </div>

              {/* Garment Color Swatches */}
              <div className="space-y-2.5">
                <label className="text-2xs font-bold uppercase tracking-wider text-dark-400">Product Fabric Color</label>
                <div className="grid grid-cols-5 gap-2">
                  {GARMENT_COLORS.map(({ label, hex }) => (
                    <button
                      key={hex}
                      onClick={() => setProductColor(hex)}
                      className={`h-9 rounded-xl border flex flex-col items-center justify-center transition-all ${
                        productColor === hex
                          ? 'ring-2 ring-brand-500 ring-offset-2 ring-offset-dark-950 scale-105'
                          : 'border-glass-border hover:scale-102'
                      }`}
                      style={{ background: hex }}
                      title={label}
                    />
                  ))}
                </div>
              </div>

              {/* Curated Theme Presets */}
              <div className="space-y-2.5 pt-2 border-t border-glass-border">
                <label className="text-2xs font-bold uppercase tracking-wider text-dark-400">Design Color Themes</label>
                <div className="space-y-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setColorValues({ text: preset.text, accent: preset.accent });
                        setProductColor(preset.bg);
                        toast.success(`Applied ${preset.label} theme!`);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl glass-card border border-glass-border hover:border-brand-500/50 transition-all text-left"
                    >
                      <span className="text-xs font-bold text-white">{preset.label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full border border-glass-border" style={{ background: preset.text }} />
                        <span className="w-4 h-4 rounded-full border border-glass-border" style={{ background: preset.accent }} />
                        <span className="w-4 h-4 rounded-full border border-glass-border" style={{ background: preset.bg }} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              SELECTED OBJECT QUICK INSPECTOR
              ════════════════════════════════════════════════════════════════ */}
          {activeCanvasObject && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl glass-card-strong border border-brand-500/40 bg-brand-500/10 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xs font-bold text-brand-300 uppercase tracking-wider">
                  Selected: {activeCanvasObject.customName || activeCanvasObject.type}
                </span>
                <button
                  onClick={() => {
                    fabricRef.current?.discardActiveObject();
                    fabricRef.current?.renderAll();
                    setActiveCanvasObject(null);
                  }}
                  className="text-dark-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDeleteSelected}
                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
                <button
                  onClick={handleDuplicateSelected}
                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-glass-border"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Duplicate
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          CENTER WORKSPACE: Interactive Photorealistic Studio Canvas
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col items-center justify-between p-3 sm:p-5 bg-dark-950/60 overflow-y-auto relative">
        {/* Top Floating Control Bar */}
        <div className="w-full max-w-4xl flex items-center justify-between gap-2.5 p-2.5 px-4 rounded-2xl glass-card-strong border border-glass-border mb-2 z-10 shadow-lg">
          {/* Product Switcher Dropdown */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setProductDropdownOpen(!productDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-900/90 border border-glass-border text-xs font-extrabold text-white hover:bg-dark-800 transition-all shadow-sm"
              title="Switch product model"
            >
              <img src={currentMockup.front} alt="" className="w-5 h-5 rounded object-cover" />
              <span className="truncate max-w-[90px] sm:max-w-none">{currentMockup.label}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-dark-400 transition-transform ${productDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {productDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-56 max-h-64 overflow-y-auto rounded-2xl glass-card-strong border border-glass-border shadow-2xl p-1.5 z-30 space-y-1">
                {allProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setProductType(p.id);
                      setProductDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      productType === p.id
                        ? 'bg-brand-500/20 text-brand-500 font-bold border border-brand-500/30'
                        : 'text-dark-300 hover:bg-dark-800/60 hover:text-white'
                    }`}
                  >
                    <img src={p.front} alt="" className="w-6 h-6 rounded object-cover" />
                    <span className="truncate">{p.label}</span>
                    {productType === p.id && <Check className="w-3.5 h-3.5 text-brand-500 ml-auto" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Front / Back Toggle (for clothing) */}
          {isGarment && (
            <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-dark-900/80 border border-glass-border">
              <button
                onClick={() => setActiveSide('front')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeSide === 'front'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-dark-400 hover:text-brand-500'
                }`}
              >
                Front View
              </button>
              <button
                onClick={() => setActiveSide('back')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeSide === 'back'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-dark-400 hover:text-brand-500'
                }`}
              >
                Back View
              </button>
            </div>
          )}

          {/* Canvas Utilities */}
          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="toolbar-btn disabled:opacity-30"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="toolbar-btn disabled:opacity-30"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-4 bg-glass-border mx-1 hidden sm:block" />

            <button
              onClick={handleClearAllCustom}
              className="toolbar-btn text-xs text-dark-400 hover:text-red-400"
              title="Clear Custom Graphics"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── Live Photorealistic Studio Canvas ───────────────────────────── */}
        <div className="w-full flex-1 flex items-center justify-center relative min-h-[380px] sm:min-h-[500px]">
          <StudioCanvas category={category} />
        </div>

        {/* ── Bottom Floating Bar: Sizing, Material Badge & Dynamic Order Button ─────── */}
        <div className="w-full max-w-4xl flex items-center justify-between gap-3 p-2.5 px-4 rounded-2xl glass-card-strong border border-glass-border mt-2 z-10 shadow-lg flex-wrap sm:flex-nowrap">
          {/* Active Configuration Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-2xs font-bold uppercase text-dark-400">Color:</span>
              <span
                className="w-5 h-5 rounded-full border border-glass-border shadow-xs"
                style={{ background: productColor }}
                title={productColor}
              />
            </div>

            <div className="h-4 w-px bg-glass-border hidden sm:block" />

            {/* Selected Fabric Badge */}
            <button
              onClick={() => setActiveTab('materials')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-dark-900/80 border border-glass-border hover:border-brand-500/40 text-2xs transition-all"
              title="Change Fabric Material"
            >
              <Feather className="w-3 h-3 text-brand-400" />
              <span className="text-white font-bold truncate max-w-[120px] sm:max-w-none">{selectedMaterial.name}</span>
              {selectedMaterial.priceAddon > 0 && (
                <span className="text-brand-400 font-bold">+₹{selectedMaterial.priceAddon}</span>
              )}
            </button>
          </div>

          {/* Dynamic Checkout Button */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => {
                if (onCheckout) {
                  onCheckout({
                    material: selectedMaterial,
                    totalPrice,
                  });
                }
              }}
              disabled={isSaving}
              className="btn-primary !py-2.5 !px-6 text-xs font-black flex items-center gap-2 shadow-xl shadow-brand-500/25 transition-transform active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Order Now • ₹{totalPrice}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickTemplateCustomizer;
