import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

// Format date for display
export const formatDate = (date) => {
  const d = new Date(date);
  if (isToday(d)) return `Today at ${format(d, 'h:mm a')}`;
  if (isYesterday(d)) return `Yesterday at ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d, yyyy');
};

export const timeAgo = (date) => formatDistanceToNow(new Date(date), { addSuffix: true });

// Format price — defaults to INR (₹)
export const formatPrice = (amount, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

// Format large numbers
export const formatCount = (num) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
};

// Truncate text
export const truncate = (text, maxLen = 100) =>
  text.length > maxLen ? `${text.slice(0, maxLen)}...` : text;

// Get initials for avatar fallback
export const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

// Generate random color from string (for avatar backgrounds)
export const stringToColor = (str = '') => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 45%)`;
};

// Category config
export const CATEGORIES = [
  { id: 'artwork', label: 'Artwork', emoji: '🎨', description: 'Canvas prints, posters, framed art' },
  { id: 'clothing', label: 'Clothing', emoji: '👕', description: 'T-shirts, hoodies, caps, bags' },
  { id: 'accessories', label: 'Accessories', emoji: '📱', description: 'Phone cases, mugs, pillows' },
];

export const getCategoryConfig = (categoryId) =>
  CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[0];

// Status badge config
export const ORDER_STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
  paid: { label: 'Paid', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  processing: { label: 'Processing', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  shipped: { label: 'Shipped', color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' },
  delivered: { label: 'Delivered', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
  refund_eligible: { label: 'Refund Eligible', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  refunded: { label: 'Refunded', color: 'text-teal-400', bg: 'bg-teal-400/10', border: 'border-teal-400/20' },
};

export const REFUND_STATUS_CONFIG = {
  pending: { label: 'Pending Review', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  under_review: { label: 'Under Review', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  approved: { label: 'Approved', color: 'text-green-400', bg: 'bg-green-400/10' },
  rejected: { label: 'Rejected', color: 'text-red-400', bg: 'bg-red-400/10' },
  processed: { label: 'Processed', color: 'text-teal-400', bg: 'bg-teal-400/10' },
};

// Canvas dimensions per category (16:9 studio mockup photograph ratio)
export const CANVAS_DIMENSIONS = {
  artwork: { width: 960, height: 560, label: '16:9 Studio' },
  clothing: { width: 960, height: 560, label: '16:9 Studio' },
  accessories: { width: 960, height: 560, label: '16:9 Studio' },
};

// Debounce utility
export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

// Error message extractor
export const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || 'Something went wrong';

/* ═══════════════════════════════════════════════════════════════════════════════
   Material Preset Database — per category
   ═══════════════════════════════════════════════════════════════════════════════ */

export const MATERIAL_PRESETS = {
  clothing: [
    { id: 'cotton-poplin',   name: 'Cotton Poplin',     weight: 120, unit: 'GSM', weave: 'Plain',  stretch: 2,  drape: 0.45, stiffness: 0.6,  bending: 0.3,  damping: 0.98, friction: 0.5,  threadCount: 60, description: 'Crisp, smooth, tightly woven cotton. Ideal for shirts and lightweight garments.' },
    { id: 'denim',           name: 'Denim',             weight: 340, unit: 'GSM', weave: 'Twill',  stretch: 5,  drape: 0.25, stiffness: 0.85, bending: 0.7,  damping: 0.95, friction: 0.7,  threadCount: 40, description: 'Heavy twill-weave cotton. Durable with characteristic diagonal ribbing.' },
    { id: 'silk-charmeuse',  name: 'Silk Charmeuse',    weight: 75,  unit: 'GSM', weave: 'Satin',  stretch: 3,  drape: 0.85, stiffness: 0.15, bending: 0.08, damping: 0.99, friction: 0.2,  threadCount: 120, description: 'Luxurious satin-weave silk with lustrous front face. Exceptional drape.' },
    { id: 'jersey-knit',     name: 'Jersey Knit',       weight: 180, unit: 'GSM', weave: 'Knit',   stretch: 25, drape: 0.65, stiffness: 0.25, bending: 0.12, damping: 0.97, friction: 0.4,  threadCount: 0,  description: 'Stretchy single-knit fabric. Comfortable and form-fitting.' },
    { id: 'canvas-duck',     name: 'Canvas Duck',       weight: 370, unit: 'GSM', weave: 'Plain',  stretch: 1,  drape: 0.15, stiffness: 0.92, bending: 0.8,  damping: 0.94, friction: 0.8,  threadCount: 30, description: 'Heavy-duty plain weave cotton. Extremely durable and rigid.' },
    { id: 'french-terry',    name: 'French Terry',      weight: 280, unit: 'GSM', weave: 'Knit',   stretch: 15, drape: 0.5,  stiffness: 0.35, bending: 0.2,  damping: 0.96, friction: 0.45, threadCount: 0,  description: 'Looped-back knit, smooth outside. Perfect for sweatshirts and hoodies.' },
    { id: 'fleece',          name: 'Fleece',            weight: 300, unit: 'GSM', weave: 'Knit',   stretch: 10, drape: 0.4,  stiffness: 0.3,  bending: 0.18, damping: 0.96, friction: 0.6,  threadCount: 0,  description: 'Soft, insulating synthetic knit. Warm and lightweight.' },
    { id: 'linen',           name: 'Linen',             weight: 150, unit: 'GSM', weave: 'Plain',  stretch: 1,  drape: 0.55, stiffness: 0.5,  bending: 0.35, damping: 0.97, friction: 0.45, threadCount: 50, description: 'Natural flax fiber. Breathable with characteristic texture.' },
  ],
  artwork: [
    { id: 'stretched-canvas', name: 'Stretched Canvas',  weight: 380, unit: 'GSM', weave: 'Plain',  stretch: 1,  drape: 0.1,  stiffness: 0.95, bending: 0.9,  damping: 0.93, friction: 0.85, threadCount: 20, description: 'Cotton duck canvas stretched over wooden bars. Gallery-standard substrate.' },
    { id: 'photo-paper',     name: 'Photo Paper',       weight: 260, unit: 'GSM', weave: 'N/A',    stretch: 0,  drape: 0.08, stiffness: 0.98, bending: 0.95, damping: 0.92, friction: 0.3,  threadCount: 0,  description: 'Premium glossy/matte photo paper. Sharp color reproduction.' },
    { id: 'fine-art-paper',  name: 'Fine Art Paper',    weight: 310, unit: 'GSM', weave: 'N/A',    stretch: 0,  drape: 0.12, stiffness: 0.96, bending: 0.88, damping: 0.93, friction: 0.4,  threadCount: 0,  description: 'Acid-free cotton rag paper. Museum-grade archival quality.' },
    { id: 'acrylic-sheet',   name: 'Acrylic Sheet',     weight: 0,   unit: 'mm',  weave: 'N/A',    stretch: 0,  drape: 0.0,  stiffness: 1.0,  bending: 1.0,  damping: 0.90, friction: 0.15, threadCount: 0,  description: 'Clear PMMA sheet with UV-printed backing. Vibrant, glossy finish.' },
    { id: 'aluminum',        name: 'Aluminum Sheet',    weight: 0,   unit: 'mm',  weave: 'N/A',    stretch: 0,  drape: 0.0,  stiffness: 1.0,  bending: 1.0,  damping: 0.88, friction: 0.2,  threadCount: 0,  description: 'Brushed or polished aluminum. Modern, sleek presentation.' },
    { id: 'wood-panel',      name: 'Wood Panel',        weight: 0,   unit: 'mm',  weave: 'N/A',    stretch: 0,  drape: 0.0,  stiffness: 1.0,  bending: 1.0,  damping: 0.90, friction: 0.7,  threadCount: 0,  description: 'Natural birch or maple panel. Warm, organic aesthetic.' },
  ],
  accessories: [
    { id: 'leather',         name: 'Leather',           weight: 0,   unit: 'oz',  weave: 'N/A',    stretch: 8,  drape: 0.3,  stiffness: 0.7,  bending: 0.55, damping: 0.95, friction: 0.75, threadCount: 0,  description: 'Full-grain leather. Durable with natural character marks.' },
    { id: 'silicone-tpu',    name: 'Silicone / TPU',    weight: 0,   unit: 'mm',  weave: 'N/A',    stretch: 40, drape: 0.2,  stiffness: 0.4,  bending: 0.15, damping: 0.97, friction: 0.85, threadCount: 0,  description: 'Flexible thermoplastic. Impact-resistant with soft-touch feel.' },
    { id: 'nylon-cordura',   name: 'Nylon Cordura',     weight: 500, unit: 'D',   weave: 'Plain',  stretch: 5,  drape: 0.2,  stiffness: 0.8,  bending: 0.6,  damping: 0.94, friction: 0.55, threadCount: 0,  description: 'High-denier ballistic nylon. Extreme abrasion and tear resistance.' },
    { id: 'polycarbonate',   name: 'Polycarbonate',     weight: 0,   unit: 'mm',  weave: 'N/A',    stretch: 0,  drape: 0.0,  stiffness: 1.0,  bending: 0.95, damping: 0.90, friction: 0.2,  threadCount: 0,  description: 'Rigid transparent thermoplastic. Impact-resistant hard case material.' },
    { id: 'canvas-cotton',   name: 'Canvas Cotton',     weight: 340, unit: 'GSM', weave: 'Plain',  stretch: 2,  drape: 0.2,  stiffness: 0.85, bending: 0.7,  damping: 0.95, friction: 0.7,  threadCount: 30, description: 'Heavy cotton canvas for bags. Sturdy and paintable.' },
    { id: 'metal-alloy',     name: 'Metal Alloy',       weight: 0,   unit: 'mm',  weave: 'N/A',    stretch: 0,  drape: 0.0,  stiffness: 1.0,  bending: 1.0,  damping: 0.88, friction: 0.3,  threadCount: 0,  description: 'Stainless steel or titanium alloy. Premium jewelry and watch material.' },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════════
   Pattern Piece Templates — per product type
   Each piece has: id, name, path (SVG-like points in cm), seam allowance (cm),
   grainAngle (degrees), and color for display
   ═══════════════════════════════════════════════════════════════════════════════ */

export const PATTERN_TEMPLATES = {
  // ── Clothing ──
  tshirt: [
    { id: 'front-panel', name: 'Front Panel', points: [[12,18],[18,18],[24,19],[28,21],[34,23],[38,20],[40,24],[38,32],[37,42],[38,70],[12,70],[13,42],[12,32],[10,24],[12,20],[16,23],[12,18]], seamAllowance: 1.5, grainAngle: 0, color: '#C76D4A' },
    { id: 'back-panel', name: 'Back Panel', points: [[48,21],[54,20],[60,20],[64,21],[70,23],[74,20],[76,24],[74,32],[73,42],[74,70],[48,70],[49,42],[48,32],[46,24],[48,20],[52,23],[48,21]], seamAllowance: 1.5, grainAngle: 0, color: '#8A9A7B' },
    { id: 'sleeve-l', name: 'Left Sleeve', points: [[84,18],[92,14],[100,14],[106,18],[104,36],[86,36],[84,18]], seamAllowance: 1.0, grainAngle: 0, color: '#D89377' },
    { id: 'sleeve-r', name: 'Right Sleeve', points: [[84,42],[92,38],[100,38],[106,42],[104,60],[86,60],[84,42]], seamAllowance: 1.0, grainAngle: 0, color: '#E7B8A4' },
    { id: 'collar', name: 'Collar Ribbing Band', points: [[12,76],[54,76],[54,80],[12,80]], seamAllowance: 0.8, grainAngle: 90, color: '#B2C0A5' },
  ],
  oversized: [
    { id: 'front-panel', name: 'Front Panel (Boxy)', points: [[10,18],[18,18],[26,19],[32,22],[40,24],[44,20],[47,26],[44,36],[43,48],[44,74],[10,74],[11,48],[10,36],[7,26],[10,20],[14,24],[10,18]], seamAllowance: 1.5, grainAngle: 0, color: '#C76D4A' },
    { id: 'back-panel', name: 'Back Panel (Boxy)', points: [[54,21],[62,20],[70,20],[76,21],[84,24],[88,20],[91,26],[88,36],[87,48],[88,74],[54,74],[55,48],[54,36],[51,26],[54,20],[58,24],[54,21]], seamAllowance: 1.5, grainAngle: 0, color: '#8A9A7B' },
    { id: 'sleeve-l', name: 'Left Drop Sleeve', points: [[100,18],[110,14],[122,14],[128,18],[124,40],[104,40],[100,18]], seamAllowance: 1.0, grainAngle: 0, color: '#D89377' },
    { id: 'sleeve-r', name: 'Right Drop Sleeve', points: [[100,46],[110,42],[122,42],[128,46],[124,68],[104,68],[100,46]], seamAllowance: 1.0, grainAngle: 0, color: '#E7B8A4' },
    { id: 'collar', name: 'Wide Crew Neckband', points: [[10,80],[58,80],[58,85],[10,85]], seamAllowance: 0.8, grainAngle: 90, color: '#B2C0A5' },
  ],
  hoodie: [
    { id: 'front-panel', name: 'Front Panel', points: [[12,18],[20,18],[26,19],[30,22],[36,24],[40,20],[43,26],[40,36],[39,48],[40,72],[12,72],[13,48],[12,36],[9,26],[12,20],[16,24],[12,18]], seamAllowance: 1.5, grainAngle: 0, color: '#C76D4A' },
    { id: 'back-panel', name: 'Back Panel', points: [[50,21],[58,20],[64,20],[68,21],[74,24],[78,20],[81,26],[78,36],[77,48],[78,72],[50,72],[51,48],[50,36],[47,26],[50,20],[54,24],[50,21]], seamAllowance: 1.5, grainAngle: 0, color: '#8A9A7B' },
    { id: 'sleeve-l', name: 'Left Sleeve', points: [[88,18],[96,13],[106,13],[112,18],[108,46],[92,46],[88,18]], seamAllowance: 1.0, grainAngle: 0, color: '#D89377' },
    { id: 'sleeve-r', name: 'Right Sleeve', points: [[88,52],[96,47],[106,47],[112,52],[108,80],[92,80],[88,52]], seamAllowance: 1.0, grainAngle: 0, color: '#E7B8A4' },
    { id: 'hood-l', name: 'Hood (Left)', points: [[12,78],[28,78],[34,88],[33,106],[26,110],[12,106],[12,78]], seamAllowance: 1.0, grainAngle: 0, color: '#B2C0A5' },
    { id: 'hood-r', name: 'Hood (Right)', points: [[40,78],[56,78],[62,88],[61,106],[54,110],[40,106],[40,78]], seamAllowance: 1.0, grainAngle: 0, color: '#AFA38E' },
    { id: 'pocket', name: 'Kangaroo Pocket', points: [[68,84],[90,84],[94,94],[94,104],[64,104],[64,94],[68,84]], seamAllowance: 1.2, grainAngle: 0, color: '#DFD8C9' },
  ],
  sweatshirt: [
    { id: 'front-panel', name: 'Front Panel', points: [[12,18],[18,18],[24,19],[28,21],[34,23],[38,20],[40,24],[38,32],[37,42],[38,68],[12,68],[13,42],[12,32],[10,24],[12,20],[16,23],[12,18]], seamAllowance: 1.5, grainAngle: 0, color: '#C76D4A' },
    { id: 'back-panel', name: 'Back Panel', points: [[48,21],[54,20],[60,20],[64,21],[70,23],[74,20],[76,24],[74,32],[73,42],[74,68],[48,68],[49,42],[48,32],[46,24],[48,20],[52,23],[48,21]], seamAllowance: 1.5, grainAngle: 0, color: '#8A9A7B' },
    { id: 'sleeve-l', name: 'Left Sleeve', points: [[84,18],[92,13],[102,13],[108,18],[104,44],[88,44],[84,18]], seamAllowance: 1.0, grainAngle: 0, color: '#D89377' },
    { id: 'sleeve-r', name: 'Right Sleeve', points: [[84,50],[92,45],[102,45],[108,50],[104,76],[88,76],[84,50]], seamAllowance: 1.0, grainAngle: 0, color: '#E7B8A4' },
    { id: 'collar', name: 'Neckband', points: [[12,74],[50,74],[50,78],[12,78]], seamAllowance: 0.8, grainAngle: 90, color: '#B2C0A5' },
    { id: 'cuff-l', name: 'Cuff (Left)', points: [[54,74],[68,74],[68,80],[54,80]], seamAllowance: 0.8, grainAngle: 90, color: '#AFA38E' },
    { id: 'cuff-r', name: 'Cuff (Right)', points: [[72,74],[86,74],[86,80],[72,80]], seamAllowance: 0.8, grainAngle: 90, color: '#DFD8C9' },
    { id: 'waistband', name: 'Ribbed Waistband', points: [[12,84],[76,84],[76,90],[12,90]], seamAllowance: 1.0, grainAngle: 90, color: '#B2C0A5' },
  ],
  longsleeve: [
    { id: 'front-panel', name: 'Front Panel', points: [[12,18],[18,18],[24,19],[28,21],[34,23],[38,20],[40,24],[38,32],[37,42],[38,70],[12,70],[13,42],[12,32],[10,24],[12,20],[16,23],[12,18]], seamAllowance: 1.5, grainAngle: 0, color: '#C76D4A' },
    { id: 'back-panel', name: 'Back Panel', points: [[48,21],[54,20],[60,20],[64,21],[70,23],[74,20],[76,24],[74,32],[73,42],[74,70],[48,70],[49,42],[48,32],[46,24],[48,20],[52,23],[48,21]], seamAllowance: 1.5, grainAngle: 0, color: '#8A9A7B' },
    { id: 'sleeve-l', name: 'Left Long Sleeve', points: [[84,16],[92,12],[102,12],[108,16],[102,62],[90,62],[84,16]], seamAllowance: 1.0, grainAngle: 0, color: '#D89377' },
    { id: 'sleeve-r', name: 'Right Long Sleeve', points: [[112,16],[120,12],[130,12],[136,16],[130,62],[118,62],[112,16]], seamAllowance: 1.0, grainAngle: 0, color: '#E7B8A4' },
    { id: 'collar', name: 'Collar Band', points: [[12,76],[52,76],[52,80],[12,80]], seamAllowance: 0.8, grainAngle: 90, color: '#B2C0A5' },
  ],
  tanktop: [
    { id: 'front-panel', name: 'Front Racer (Scoop)', points: [[14,18],[20,18],[24,24],[28,24],[32,18],[38,18],[35,30],[34,44],[35,68],[17,68],[18,44],[17,30],[14,18]], seamAllowance: 1.2, grainAngle: 0, color: '#C76D4A' },
    { id: 'back-panel', name: 'Back Racer', points: [[48,18],[54,18],[56,22],[60,22],[62,18],[68,18],[64,30],[63,44],[64,68],[52,68],[53,44],[52,30],[48,18]], seamAllowance: 1.2, grainAngle: 0, color: '#8A9A7B' },
    { id: 'armhole-rib-l', name: 'Left Armhole Binding', points: [[74,18],[104,18],[104,21],[74,21]], seamAllowance: 0.6, grainAngle: 90, color: '#D89377' },
    { id: 'armhole-rib-r', name: 'Right Armhole Binding', points: [[74,26],[104,26],[104,29],[74,29]], seamAllowance: 0.6, grainAngle: 90, color: '#E7B8A4' },
    { id: 'neck-rib', name: 'Neckline Binding', points: [[74,34],[110,34],[110,37],[74,37]], seamAllowance: 0.6, grainAngle: 90, color: '#B2C0A5' },
  ],
  polo: [
    { id: 'front-panel', name: 'Front Panel', points: [[12,18],[18,18],[24,19],[28,21],[34,23],[38,20],[40,24],[38,32],[37,42],[38,70],[12,70],[13,42],[12,32],[10,24],[12,20],[16,23],[12,18]], seamAllowance: 1.5, grainAngle: 0, color: '#C76D4A' },
    { id: 'back-panel', name: 'Back Panel', points: [[48,21],[54,20],[60,20],[64,21],[70,23],[74,20],[76,24],[74,32],[73,42],[74,72],[48,72],[49,42],[48,32],[46,24],[48,20],[52,23],[48,21]], seamAllowance: 1.5, grainAngle: 0, color: '#8A9A7B' },
    { id: 'sleeve-l', name: 'Left Sleeve', points: [[84,18],[92,14],[100,14],[106,18],[104,36],[86,36],[84,18]], seamAllowance: 1.0, grainAngle: 0, color: '#D89377' },
    { id: 'sleeve-r', name: 'Right Sleeve', points: [[84,42],[92,38],[100,38],[106,42],[104,60],[86,60],[84,42]], seamAllowance: 1.0, grainAngle: 0, color: '#E7B8A4' },
    { id: 'polo-collar', name: 'Knit Polo Collar', points: [[12,78],[48,78],[46,86],[14,86]], seamAllowance: 0.8, grainAngle: 0, color: '#B2C0A5' },
    { id: 'placket-under', name: 'Under Placket', points: [[54,78],[57,78],[57,92],[54,92]], seamAllowance: 0.8, grainAngle: 0, color: '#AFA38E' },
    { id: 'placket-top', name: 'Top Placket', points: [[62,78],[66,78],[66,92],[62,92]], seamAllowance: 0.8, grainAngle: 0, color: '#DFD8C9' },
  ],
  jacket: [
    { id: 'front-l', name: 'Front Left Panel', points: [[12,18],[24,18],[26,24],[24,34],[23,46],[24,70],[12,70],[12,46],[12,34],[10,24],[12,18]], seamAllowance: 1.5, grainAngle: 0, color: '#C76D4A' },
    { id: 'front-r', name: 'Front Right Panel', points: [[30,18],[42,18],[40,24],[38,34],[37,46],[38,70],[26,70],[26,46],[27,34],[28,24],[30,18]], seamAllowance: 1.5, grainAngle: 0, color: '#D89377' },
    { id: 'back-panel', name: 'Back Jacket Panel', points: [[50,20],[58,19],[66,19],[72,21],[78,23],[82,20],[84,25],[82,34],[80,46],[82,70],[50,70],[52,46],[50,34],[48,25],[50,20]], seamAllowance: 1.5, grainAngle: 0, color: '#8A9A7B' },
    { id: 'sleeve-l', name: 'Left Jacket Sleeve', points: [[90,18],[98,14],[108,14],[114,18],[110,54],[94,54],[90,18]], seamAllowance: 1.2, grainAngle: 0, color: '#E7B8A4' },
    { id: 'sleeve-r', name: 'Right Jacket Sleeve', points: [[90,60],[98,56],[108,56],[114,60],[110,96],[94,96],[90,60]], seamAllowance: 1.2, grainAngle: 0, color: '#AFA38E' },
    { id: 'rib-collar', name: 'Bomber Rib Collar', points: [[12,76],[46,76],[46,82],[12,82]], seamAllowance: 0.8, grainAngle: 90, color: '#B2C0A5' },
    { id: 'rib-waist', name: 'Bomber Rib Waist', points: [[12,88],[76,88],[76,96],[12,96]], seamAllowance: 1.0, grainAngle: 90, color: '#DFD8C9' },
  ],
  // ── Artwork ──
  canvas: [
    { id: 'canvas-face', name: 'Canvas Face Print', points: [[12,12],[72,12],[72,57],[12,57]], seamAllowance: 4.0, grainAngle: 0, color: '#C76D4A' },
    { id: 'stretcher-top', name: 'Stretcher Bar (Top)', points: [[12,64],[72,64],[72,67.5],[12,67.5]], seamAllowance: 0, grainAngle: 0, color: '#8A9A7B' },
    { id: 'stretcher-bottom', name: 'Stretcher Bar (Bottom)', points: [[12,71],[72,71],[72,74.5],[12,74.5]], seamAllowance: 0, grainAngle: 0, color: '#D89377' },
    { id: 'stretcher-left', name: 'Stretcher Bar (Left)', points: [[78,12],[81.5,12],[81.5,57],[78,57]], seamAllowance: 0, grainAngle: 90, color: '#E7B8A4' },
    { id: 'stretcher-right', name: 'Stretcher Bar (Right)', points: [[86,12],[89.5,12],[89.5,57],[86,57]], seamAllowance: 0, grainAngle: 90, color: '#B2C0A5' },
  ],
  poster: [
    { id: 'print-area', name: 'Print Area (A2)', points: [[12,12],[62,12],[62,82],[12,82]], seamAllowance: 0.5, grainAngle: 0, color: '#C76D4A' },
    { id: 'bleed-zone', name: 'Bleed Border', points: [[70,12],[122,12],[122,84],[70,84]], seamAllowance: 0, grainAngle: 0, color: '#8A9A7B' },
  ],
  acrylic: [
    { id: 'acrylic-face', name: 'Acrylic Face Plate', points: [[12,12],[72,12],[72,57],[12,57]], seamAllowance: 0, grainAngle: 0, color: '#C76D4A' },
    { id: 'mounting-rail-top', name: 'Mounting Rail (Top)', points: [[16,64],[68,64],[68,68],[16,68]], seamAllowance: 0, grainAngle: 0, color: '#8A9A7B' },
    { id: 'mounting-rail-bot', name: 'Mounting Rail (Bottom)', points: [[16,72],[68,72],[68,76],[16,76]], seamAllowance: 0, grainAngle: 0, color: '#D89377' },
  ],
  // ── Accessories ──
  phonecase: [
    { id: 'case-shell', name: 'Case Back Shell', points: [[12,12],[20,12],[20,28],[12,28]], seamAllowance: 0.2, grainAngle: 0, color: '#C76D4A' },
    { id: 'camera-cutout', name: 'Camera Bumper Ring', points: [[26,12],[30,12],[30,16],[26,16]], seamAllowance: 0, grainAngle: 0, color: '#8A9A7B' },
    { id: 'bumper-wrap', name: 'Shock Edge Bumper', points: [[34,12],[44,12],[44,30],[34,30]], seamAllowance: 0.3, grainAngle: 90, color: '#D89377' },
  ],
  totebag: [
    { id: 'body-front', name: 'Body (Front)', points: [[12,12],[47,12],[47,52],[12,52]], seamAllowance: 1.5, grainAngle: 0, color: '#C76D4A' },
    { id: 'body-back', name: 'Body (Back)', points: [[54,12],[89,12],[89,52],[54,52]], seamAllowance: 1.5, grainAngle: 0, color: '#8A9A7B' },
    { id: 'gusset', name: 'Bottom Gusset', points: [[12,58],[47,58],[47,68],[12,68]], seamAllowance: 1.5, grainAngle: 90, color: '#D89377' },
    { id: 'handle-l', name: 'Handle (Left)', points: [[54,58],[57.5,58],[57.5,92],[54,92]], seamAllowance: 0.5, grainAngle: 0, color: '#E7B8A4' },
    { id: 'handle-r', name: 'Handle (Right)', points: [[64,58],[67.5,58],[67.5,92],[64,92]], seamAllowance: 0.5, grainAngle: 0, color: '#B2C0A5' },
  ],
  cap: [
    { id: 'crown-front-l', name: 'Crown Front (Left)', points: [[12,12],[21,12],[22,25],[17,32],[12,25]], seamAllowance: 0.7, grainAngle: 0, color: '#C76D4A' },
    { id: 'crown-front-r', name: 'Crown Front (Right)', points: [[26,12],[35,12],[36,25],[31,32],[26,25]], seamAllowance: 0.7, grainAngle: 0, color: '#D89377' },
    { id: 'crown-back-l', name: 'Crown Back (Left)', points: [[40,12],[49,12],[50,25],[45,32],[40,25]], seamAllowance: 0.7, grainAngle: 0, color: '#8A9A7B' },
    { id: 'crown-back-r', name: 'Crown Back (Right)', points: [[54,12],[63,12],[64,25],[59,32],[54,25]], seamAllowance: 0.7, grainAngle: 0, color: '#AFA38E' },
    { id: 'brim', name: 'Visor Brim', points: [[12,40],[34,40],[37,48],[34,50],[12,50],[9,48]], seamAllowance: 0.5, grainAngle: 0, color: '#B2C0A5' },
    { id: 'sweatband', name: 'Inside Sweatband', points: [[12,56],[72,56],[72,60],[12,60]], seamAllowance: 0.5, grainAngle: 90, color: '#DFD8C9' },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════════
   Unit Conversion Helpers — px ↔ cm
   ═══════════════════════════════════════════════════════════════════════════════ */

const DEFAULT_DPI = 96;
const CM_PER_INCH = 2.54;

export const pxToCm = (px, dpi = DEFAULT_DPI) => (px / dpi) * CM_PER_INCH;
export const cmToPx = (cm, dpi = DEFAULT_DPI) => (cm / CM_PER_INCH) * dpi;

// Scale factor: how many px per cm at a given DPI
export const pxPerCm = (dpi = DEFAULT_DPI) => dpi / CM_PER_INCH;

// Format a cm value with fixed precision
export const formatCm = (cm, decimals = 1) => `${cm.toFixed(decimals)} cm`;
