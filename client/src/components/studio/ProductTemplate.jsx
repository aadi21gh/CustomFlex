import { fabric } from 'fabric';

/* ═══════════════════════════════════════════════════════════════════════════════
   Product Template System — 3D Product Mockups
   ─────────────────────────────────────────────────────────────────────────────
   Renders realistic 3D-looking product mockups on the Fabric.js canvas using
   gradient shading, drop shadows, ambient occlusion, edge highlights, and
   product-specific detail lines (folds, seams, collars, camera cutouts, etc.)
   ═══════════════════════════════════════════════════════════════════════════════ */

// ── Color Palettes ──────────────────────────────────────────────────────────
export const PRODUCT_COLORS = {
  clothing: [
    { id: 'white',    hex: '#FFFFFF', label: 'White' },
    { id: 'black',    hex: '#1a1a1a', label: 'Black' },
    { id: 'navy',     hex: '#1e3a5f', label: 'Navy' },
    { id: 'gray',     hex: '#6b7280', label: 'Gray' },
    { id: 'red',      hex: '#b91c1c', label: 'Red' },
    { id: 'forest',   hex: '#166534', label: 'Forest' },
    { id: 'cream',    hex: '#f5f0e8', label: 'Cream' },
    { id: 'sand',     hex: '#d4b896', label: 'Sand' },
  ],
  artwork: [
    { id: 'white',    hex: '#FFFFFF', label: 'White' },
    { id: 'cream',    hex: '#faf7f0', label: 'Cream' },
    { id: 'black',    hex: '#1a1a1a', label: 'Black' },
    { id: 'oak',      hex: '#c4a66a', label: 'Oak Frame' },
    { id: 'walnut',   hex: '#5c3d2e', label: 'Walnut' },
    { id: 'silver',   hex: '#c0c0c0', label: 'Silver' },
  ],
  accessories: [
    { id: 'clear',    hex: '#e8eaed', label: 'Clear' },
    { id: 'white',    hex: '#FFFFFF', label: 'White' },
    { id: 'black',    hex: '#1a1a1a', label: 'Black' },
    { id: 'midnight', hex: '#1e293b', label: 'Midnight' },
    { id: 'rose',     hex: '#e8b4b8', label: 'Rose' },
    { id: 'sky',      hex: '#7dd3fc', label: 'Sky' },
  ],
};

// ── Product Types per Category ──────────────────────────────────────────────
export const PRODUCT_TYPES = {
  clothing: [
    { id: 'tshirt',     label: 'T-Shirt',       emoji: '👕' },
    { id: 'hoodie',     label: 'Hoodie',         emoji: '🧥' },
    { id: 'sweatshirt', label: 'Sweatshirt',     emoji: '🌀' },
    { id: 'oversized',  label: 'Oversized Tee',  emoji: '🫱' },
  ],
  artwork: [
    { id: 'canvas',     label: 'Canvas Print',   emoji: '🖼️' },
    { id: 'poster',     label: 'Poster',         emoji: '🖥️' },
    { id: 'acrylic',    label: 'Acrylic Print',  emoji: '🪟' },
  ],
  accessories: [
    { id: 'phonecase',  label: 'Phone Case',     emoji: '📱' },
    { id: 'totebag',    label: 'Tote Bag',       emoji: '👜' },
    { id: 'cap',        label: 'Cap',             emoji: '🧢' },
  ],
};

// ── Design Zone Definitions ─────────────────────────────────────────────────
const DESIGN_ZONES = {
  tshirt:     { x: 150, y: 175, w: 300, h: 300 },
  hoodie:     { x: 140, y: 200, w: 320, h: 280 },
  sweatshirt: { x: 145, y: 190, w: 310, h: 290 },
  oversized:  { x: 130, y: 165, w: 340, h: 320 },
  canvas:     { x: 60,  y: 50,  w: 680, h: 500 },
  poster:     { x: 50,  y: 40,  w: 700, h: 520 },
  acrylic:    { x: 60,  y: 50,  w: 680, h: 500 },
  phonecase:  { x: 160, y: 90,  w: 280, h: 420 },
  totebag:    { x: 100, y: 120, w: 400, h: 340 },
  cap:        { x: 145, y: 120, w: 310, h: 230 },
};

export const getDesignZone = (productType) => DESIGN_ZONES[productType] || DESIGN_ZONES.tshirt;

/* ─── Non-interactive properties shared by all template objects ──────────── */
const LOCK = {
  selectable: false,
  evented: false,
  lockMovementX: true,
  lockMovementY: true,
  lockScalingX: true,
  lockScalingY: true,
  lockRotation: true,
  hasControls: false,
  hasBorders: false,
};

function tid(suffix) {
  return { id: `__template__${suffix}`, customName: '__template__', ...LOCK };
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SVG Product Path Builders
   ═══════════════════════════════════════════════════════════════════════════════ */

function buildTshirtPath() {
  return 'M 170 80 C 170 60, 210 30, 300 30 C 390 30, 430 60, 430 80 L 530 150 L 520 200 L 460 180 L 460 680 C 460 700, 440 720, 420 720 L 180 720 C 160 720, 140 700, 140 680 L 140 180 L 80 200 L 70 150 Z';
}

function buildHoodiePath() {
  return 'M 160 100 C 160 70, 200 25, 300 25 C 400 25, 440 70, 440 100 L 540 170 L 530 225 L 460 200 L 460 690 C 460 710, 440 725, 420 725 L 180 725 C 160 725, 140 710, 140 690 L 140 200 L 70 225 L 60 170 Z M 240 25 C 240 15, 260 5, 300 5 C 340 5, 360 15, 360 25 L 350 70 C 340 60, 310 55, 300 55 C 290 55, 260 60, 250 70 Z';
}

function buildSweatshirtPath() {
  return 'M 165 90 C 165 65, 205 30, 300 30 C 395 30, 435 65, 435 90 L 535 160 L 525 215 L 455 190 L 455 690 C 455 710, 435 725, 415 725 L 185 725 C 165 725, 145 710, 145 690 L 145 190 L 75 215 L 65 160 Z';
}

function buildOversizedPath() {
  return 'M 150 90 C 150 55, 200 20, 300 20 C 400 20, 450 55, 450 90 L 560 170 L 545 230 L 470 200 L 470 695 C 470 715, 450 730, 430 730 L 170 730 C 150 730, 130 715, 130 695 L 130 200 L 55 230 L 40 170 Z';
}

function buildCanvasFramePath(w, h) {
  const f = 20;
  return `M ${f} ${f} L ${w - f} ${f} L ${w - f} ${h - f} L ${f} ${h - f} Z M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`;
}

function buildPosterPath(w, h) {
  return `M 20 15 L ${w - 20} 15 L ${w - 20} ${h - 15} L 20 ${h - 15} Z`;
}

function buildPhoneCasePath() {
  return 'M 130 -10 L 470 -10 Q 500 -10, 500 20 L 500 580 Q 500 610, 470 610 L 130 610 Q 100 610, 100 580 L 100 20 Q 100 -10, 130 -10 Z';
}

function buildToteBagPath() {
  return 'M 80 130 L 80 540 C 80 560, 100 575, 120 575 L 480 575 C 500 575, 520 560, 520 540 L 520 130 Z M 180 130 L 180 60 C 180 40, 200 25, 220 25 L 380 25 C 400 25, 420 40, 420 60 L 420 130';
}

function buildCapPath() {
  return 'M 100 350 Q 100 180, 300 140 Q 500 180, 500 350 L 550 370 C 560 375, 555 395, 545 390 L 500 370 L 500 380 Q 500 420, 300 430 Q 100 420, 100 380 L 100 370 L 55 390 C 45 395, 40 375, 50 370 Z';
}

const PATH_BUILDERS = {
  tshirt: buildTshirtPath,
  hoodie: buildHoodiePath,
  sweatshirt: buildSweatshirtPath,
  oversized: buildOversizedPath,
  canvas: buildCanvasFramePath,
  poster: buildPosterPath,
  acrylic: buildCanvasFramePath,
  phonecase: buildPhoneCasePath,
  totebag: buildToteBagPath,
  cap: buildCapPath,
};

/* ═══════════════════════════════════════════════════════════════════════════════
   3D Product Detail Builders
   Each returns an array of Fabric objects that add realistic depth cues.
   ═══════════════════════════════════════════════════════════════════════════════ */

function tshirtDetails() {
  return [
    // Collar neckline — thick soft shadow
    new fabric.Path('M 235 55 Q 270 88, 300 92 Q 330 88, 365 55', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.13)', strokeWidth: 4, strokeLineCap: 'round', ...tid('collar'),
    }),
    // Collar inner highlight
    new fabric.Path('M 240 52 Q 270 82, 300 86 Q 330 82, 360 52', {
      fill: 'transparent', stroke: 'rgba(255,255,255,0.12)', strokeWidth: 1.5, strokeLineCap: 'round', ...tid('collar_hl'),
    }),
    // Left sleeve crease
    new fabric.Path('M 138 182 Q 152 200, 175 205', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.06)', strokeWidth: 1.5, ...tid('slv_l'),
    }),
    // Right sleeve crease
    new fabric.Path('M 462 182 Q 448 200, 425 205', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.06)', strokeWidth: 1.5, ...tid('slv_r'),
    }),
    // Fabric folds — subtle vertical curves
    new fabric.Path('M 200 310 Q 208 380, 196 450', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.035)', strokeWidth: 1.5, ...tid('fold0'),
    }),
    new fabric.Path('M 400 295 Q 392 365, 404 435', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.035)', strokeWidth: 1.5, ...tid('fold1'),
    }),
    // Lower belly fold
    new fabric.Path('M 240 570 Q 300 585, 360 568', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.03)', strokeWidth: 1.5, ...tid('fold2'),
    }),
    // Bottom hem (double-stitch)
    new fabric.Path('M 145 710 Q 300 722, 455 710', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.07)', strokeWidth: 2, ...tid('hem'),
    }),
    new fabric.Path('M 147 715 Q 300 726, 453 715', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.04)', strokeWidth: 1, ...tid('hem2'),
    }),
    // Side seams
    new fabric.Line([142, 210, 142, 680], {
      stroke: 'rgba(0,0,0,0.03)', strokeWidth: 1, strokeDashArray: [5, 5], ...tid('seam_l'),
    }),
    new fabric.Line([458, 210, 458, 680], {
      stroke: 'rgba(0,0,0,0.03)', strokeWidth: 1, strokeDashArray: [5, 5], ...tid('seam_r'),
    }),
  ];
}

function oversizedDetails() {
  return [
    // Collar (wider)
    new fabric.Path('M 220 48 Q 260 85, 300 90 Q 340 85, 380 48', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.13)', strokeWidth: 4, strokeLineCap: 'round', ...tid('collar'),
    }),
    new fabric.Path('M 225 45 Q 262 78, 300 83 Q 338 78, 375 45', {
      fill: 'transparent', stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1.5, ...tid('collar_hl'),
    }),
    // Dropped sleeve creases
    new fabric.Path('M 128 202 Q 148 225, 178 232', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.055)', strokeWidth: 1.5, ...tid('slv_l'),
    }),
    new fabric.Path('M 472 202 Q 452 225, 422 232', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.055)', strokeWidth: 1.5, ...tid('slv_r'),
    }),
    // Folds
    new fabric.Path('M 195 320 Q 205 400, 190 480', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.035)', strokeWidth: 1.5, ...tid('fold0'),
    }),
    new fabric.Path('M 410 310 Q 398 385, 412 460', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.035)', strokeWidth: 1.5, ...tid('fold1'),
    }),
    // Hem
    new fabric.Path('M 135 720 Q 300 735, 465 720', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.07)', strokeWidth: 2, ...tid('hem'),
    }),
  ];
}

function hoodieDetails() {
  return [
    // Hood inner shadow
    new fabric.Path('M 248 28 Q 300 72, 352 28', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.12)', strokeWidth: 4, strokeLineCap: 'round', ...tid('hood'),
    }),
    // Hood opening highlight
    new fabric.Path('M 252 25 Q 300 66, 348 25', {
      fill: 'transparent', stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1.5, ...tid('hood_hl'),
    }),
    // Drawstrings
    new fabric.Path('M 278 95 L 272 180', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.06)', strokeWidth: 2, strokeLineCap: 'round', ...tid('draw_l'),
    }),
    new fabric.Path('M 322 95 L 328 180', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.06)', strokeWidth: 2, strokeLineCap: 'round', ...tid('draw_r'),
    }),
    // Kangaroo pocket
    new fabric.Path('M 200 480 Q 300 468, 400 480 L 400 560 Q 400 578, 382 578 L 218 578 Q 200 578, 200 560 Z', {
      fill: 'rgba(0,0,0,0.018)', stroke: 'rgba(0,0,0,0.06)', strokeWidth: 1.2, ...tid('pocket'),
    }),
    // Pocket opening shadow
    new fabric.Path('M 205 483 Q 300 472, 395 483', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.08)', strokeWidth: 2, ...tid('pocket_sh'),
    }),
    // Side fold
    new fabric.Path('M 198 340 Q 210 400, 200 460', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.03)', strokeWidth: 1.5, ...tid('fold0'),
    }),
    // Hem
    new fabric.Path('M 145 715 Q 300 728, 455 715', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.07)', strokeWidth: 2, ...tid('hem'),
    }),
  ];
}

function sweatshirtDetails() {
  return [
    // Crew neck shadow
    new fabric.Path('M 232 56 Q 266 82, 300 86 Q 334 82, 368 56', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.12)', strokeWidth: 4, strokeLineCap: 'round', ...tid('collar'),
    }),
    new fabric.Path('M 236 53 Q 268 76, 300 80 Q 332 76, 364 53', {
      fill: 'transparent', stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1.5, ...tid('collar_hl'),
    }),
    // Ribbed cuff hints (wrist bands)
    new fabric.Path('M 145 190 Q 146 198, 145 205', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.04)', strokeWidth: 10, strokeLineCap: 'round', ...tid('cuff_l'),
    }),
    new fabric.Path('M 455 190 Q 454 198, 455 205', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.04)', strokeWidth: 10, strokeLineCap: 'round', ...tid('cuff_r'),
    }),
    // Folds
    new fabric.Path('M 205 340 Q 215 400, 208 460', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.035)', strokeWidth: 1.5, ...tid('fold0'),
    }),
    // Hem
    new fabric.Path('M 150 715 Q 300 728, 450 715', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.07)', strokeWidth: 2, ...tid('hem'),
    }),
  ];
}

function canvasDetails(w, h) {
  return [
    // Frame depth — right edge (3D perspective strip)
    new fabric.Rect({
      left: w - 20, top: 20, width: 20, height: h - 40,
      fill: new fabric.Gradient({
        type: 'linear', coords: { x1: 0, y1: 0, x2: 20, y2: 0 },
        colorStops: [
          { offset: 0, color: 'rgba(0,0,0,0.06)' },
          { offset: 1, color: 'rgba(0,0,0,0.18)' },
        ],
      }),
      ...tid('frame_r'),
    }),
    // Frame depth — bottom edge
    new fabric.Rect({
      left: 20, top: h - 20, width: w - 40, height: 20,
      fill: new fabric.Gradient({
        type: 'linear', coords: { x1: 0, y1: 0, x2: 0, y2: 20 },
        colorStops: [
          { offset: 0, color: 'rgba(0,0,0,0.05)' },
          { offset: 1, color: 'rgba(0,0,0,0.16)' },
        ],
      }),
      ...tid('frame_b'),
    }),
    // Top edge highlight (light hits the top)
    new fabric.Line([20, 20, w - 20, 20], {
      stroke: 'rgba(255,255,255,0.25)', strokeWidth: 2, ...tid('frame_hl_t'),
    }),
    // Left edge highlight
    new fabric.Line([20, 20, 20, h - 20], {
      stroke: 'rgba(255,255,255,0.18)', strokeWidth: 2, ...tid('frame_hl_l'),
    }),
    // Inner mat border
    new fabric.Rect({
      left: 35, top: 35, width: w - 70, height: h - 70,
      fill: 'transparent', stroke: 'rgba(0,0,0,0.05)', strokeWidth: 1, rx: 1, ry: 1, ...tid('mat'),
    }),
  ];
}

function posterDetails(w, h) {
  return [
    // Subtle paper curl bottom-right
    new fabric.Path(`M ${w - 70} ${h - 15} Q ${w - 40} ${h - 28}, ${w - 20} ${h - 15}`, {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.06)', strokeWidth: 1.5, ...tid('curl'),
    }),
    // Paper edge shadow (right)
    new fabric.Line([w - 20, 20, w - 20, h - 15], {
      stroke: 'rgba(0,0,0,0.06)', strokeWidth: 2, ...tid('edge_r'),
    }),
    // Paper edge shadow (bottom)
    new fabric.Line([20, h - 15, w - 20, h - 15], {
      stroke: 'rgba(0,0,0,0.06)', strokeWidth: 2, ...tid('edge_b'),
    }),
    // Top edge highlight
    new fabric.Line([20, 15, w - 20, 15], {
      stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1.5, ...tid('edge_hl'),
    }),
  ];
}

function phonecaseDetails() {
  return [
    // Camera module background
    new fabric.Rect({
      left: 330, top: 12, width: 120, height: 75, rx: 18, ry: 18,
      fill: 'rgba(0,0,0,0.06)', stroke: 'rgba(0,0,0,0.1)', strokeWidth: 1, ...tid('cam_bg'),
    }),
    // Camera lenses
    new fabric.Circle({ left: 360, top: 25, radius: 15,
      fill: 'rgba(0,0,0,0.1)', stroke: 'rgba(0,0,0,0.15)', strokeWidth: 1.5, ...tid('lens1'),
    }),
    new fabric.Circle({ left: 410, top: 25, radius: 15,
      fill: 'rgba(0,0,0,0.1)', stroke: 'rgba(0,0,0,0.15)', strokeWidth: 1.5, ...tid('lens2'),
    }),
    // Lens reflections
    new fabric.Circle({ left: 366, top: 30, radius: 4,
      fill: 'rgba(255,255,255,0.15)', stroke: 'none', ...tid('lens_r1'),
    }),
    new fabric.Circle({ left: 416, top: 30, radius: 4,
      fill: 'rgba(255,255,255,0.15)', stroke: 'none', ...tid('lens_r2'),
    }),
    // Flash
    new fabric.Circle({ left: 360, top: 62, radius: 5,
      fill: 'rgba(255,220,120,0.12)', stroke: 'rgba(0,0,0,0.1)', strokeWidth: 1, ...tid('flash'),
    }),
    // Side buttons
    ...[170, 220, 300].map((y, i) => new fabric.Rect({
      left: 496, top: y, width: 4, height: 25, rx: 2, ry: 2,
      fill: 'rgba(0,0,0,0.08)', ...tid(`btn_${i}`),
    })),
    // Left edge bevel highlight
    new fabric.Line([103, 15, 103, 585], {
      stroke: 'rgba(255,255,255,0.18)', strokeWidth: 2, strokeLineCap: 'round', ...tid('bevel_l'),
    }),
    // Right edge shadow
    new fabric.Line([497, 15, 497, 585], {
      stroke: 'rgba(0,0,0,0.08)', strokeWidth: 2, strokeLineCap: 'round', ...tid('bevel_r'),
    }),
    // Bottom speaker grill dots
    ...[260, 280, 300, 320, 340].map((x, i) => new fabric.Circle({
      left: x, top: 592, radius: 2,
      fill: 'rgba(0,0,0,0.08)', ...tid(`spk_${i}`),
    })),
  ];
}

function totebagDetails() {
  return [
    // Handle stitching
    new fabric.Path('M 183 130 L 183 65 C 183 45, 203 30, 223 30 L 377 30 C 397 30, 417 45, 417 65 L 417 130', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.06)', strokeWidth: 1.5, strokeDashArray: [4, 3], ...tid('hstitch'),
    }),
    // Handle thickness (inner line)
    new fabric.Path('M 177 130 L 177 62 C 177 38, 197 22, 217 22 L 383 22 C 403 22, 423 38, 423 62 L 423 130', {
      fill: 'transparent', stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1, ...tid('hinner'),
    }),
    // Bottom gusset fold
    new fabric.Path('M 88 535 Q 300 550, 512 535', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.06)', strokeWidth: 1.5, ...tid('gusset'),
    }),
    // Fabric crease lines
    new fabric.Path('M 160 250 Q 170 350, 158 440', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.025)', strokeWidth: 1.5, ...tid('fold0'),
    }),
    new fabric.Path('M 440 260 Q 432 350, 442 430', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.025)', strokeWidth: 1.5, ...tid('fold1'),
    }),
    // Bottom seam
    new fabric.Path('M 85 568 Q 300 578, 515 568', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.05)', strokeWidth: 1.5, ...tid('bseam'),
    }),
  ];
}

function capDetails() {
  return [
    // Brim shadow line
    new fabric.Path('M 105 352 Q 300 368, 495 352', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.12)', strokeWidth: 3, strokeLineCap: 'round', ...tid('brim_sh'),
    }),
    // Brim edge highlight
    new fabric.Path('M 55 370 Q 150 395, 300 402 Q 450 395, 545 370', {
      fill: 'transparent', stroke: 'rgba(255,255,255,0.12)', strokeWidth: 1.5, ...tid('brim_hl'),
    }),
    // Panel seams
    new fabric.Path('M 300 142 L 300 348', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.05)', strokeWidth: 1, strokeDashArray: [5, 5], ...tid('seam_c'),
    }),
    new fabric.Path('M 200 175 L 195 350', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.035)', strokeWidth: 1, strokeDashArray: [5, 5], ...tid('seam_l'),
    }),
    new fabric.Path('M 400 175 L 405 350', {
      fill: 'transparent', stroke: 'rgba(0,0,0,0.035)', strokeWidth: 1, strokeDashArray: [5, 5], ...tid('seam_r'),
    }),
    // Top button
    new fabric.Circle({
      left: 300, top: 140, radius: 6, originX: 'center', originY: 'center',
      fill: 'rgba(0,0,0,0.06)', stroke: 'rgba(0,0,0,0.1)', strokeWidth: 1.5, ...tid('topbtn'),
    }),
    // Button highlight
    new fabric.Circle({
      left: 298, top: 138, radius: 2, originX: 'center', originY: 'center',
      fill: 'rgba(255,255,255,0.12)', stroke: 'none', ...tid('topbtn_hl'),
    }),
  ];
}

const DETAIL_BUILDERS = {
  tshirt: tshirtDetails,
  hoodie: hoodieDetails,
  sweatshirt: sweatshirtDetails,
  oversized: oversizedDetails,
  canvas: canvasDetails,
  poster: posterDetails,
  acrylic: canvasDetails,
  phonecase: phonecaseDetails,
  totebag: totebagDetails,
  cap: capDetails,
};

/* ═══════════════════════════════════════════════════════════════════════════════
   Main Render Function — 3D Product Template
   ═══════════════════════════════════════════════════════════════════════════════ */

export function renderProductTemplate(canvas, productType, productColor = '#FFFFFF', canvasW, canvasH) {
  if (!canvas) return;

  // Remove existing template objects
  canvas.getObjects()
    .filter(o => o.id && o.id.startsWith('__template__'))
    .forEach(o => canvas.remove(o));

  const pathBuilder = PATH_BUILDERS[productType];
  if (!pathBuilder) return;

  const pathData = pathBuilder(canvasW, canvasH);
  const zone = getDesignZone(productType);
  const all = []; // collect all template objects in render order

  /* ── Layer 1: Drop Shadow ─────────────────────────────────────────────── */
  all.push(new fabric.Path(pathData, {
    fill: 'rgba(0,0,0,0.03)',
    stroke: 'none',
    ...tid('shadow'),
    shadow: new fabric.Shadow({
      color: 'rgba(0,0,0,0.22)',
      blur: 40,
      offsetX: 4,
      offsetY: 10,
    }),
  }));

  /* ── Layer 2: Main Body (solid product color) ─────────────────────────── */
  all.push(new fabric.Path(pathData, {
    fill: productColor,
    stroke: 'rgba(0,0,0,0.1)',
    strokeWidth: 1.2,
    ...tid('body'),
  }));

  /* ── Layer 3: 3D Directional Lighting (gradient overlay clipped to shape)
       Light source: upper-left → creates highlight on left, shadow on right ─ */
  const lightClip = new fabric.Path(pathData, { absolutePositioned: true });
  all.push(new fabric.Rect({
    left: 0, top: 0, width: canvasW, height: canvasH,
    fill: new fabric.Gradient({
      type: 'linear',
      coords: { x1: 0, y1: 0, x2: canvasW, y2: canvasH * 0.65 },
      colorStops: [
        { offset: 0,    color: 'rgba(255,255,255,0.28)' },
        { offset: 0.2,  color: 'rgba(255,255,255,0.14)' },
        { offset: 0.45, color: 'rgba(255,255,255,0.03)' },
        { offset: 0.6,  color: 'rgba(0,0,0,0)' },
        { offset: 0.8,  color: 'rgba(0,0,0,0.06)' },
        { offset: 1,    color: 'rgba(0,0,0,0.18)' },
      ],
    }),
    clipPath: lightClip,
    ...tid('lighting'),
  }));

  /* ── Layer 4: Ambient Occlusion (bottom darkening for grounding effect) ── */
  const aoClip = new fabric.Path(pathData, { absolutePositioned: true });
  all.push(new fabric.Rect({
    left: 0, top: canvasH * 0.35, width: canvasW, height: canvasH * 0.65,
    fill: new fabric.Gradient({
      type: 'linear',
      coords: { x1: 0, y1: 0, x2: 0, y2: canvasH * 0.65 },
      colorStops: [
        { offset: 0,   color: 'rgba(0,0,0,0)' },
        { offset: 0.6, color: 'rgba(0,0,0,0.02)' },
        { offset: 1,   color: 'rgba(0,0,0,0.1)' },
      ],
    }),
    clipPath: aoClip,
    ...tid('ao'),
  }));

  /* ── Layer 5: Specular Highlight (top-left bright spot for material sheen) ─ */
  const specClip = new fabric.Path(pathData, { absolutePositioned: true });
  all.push(new fabric.Ellipse({
    left: canvasW * 0.22, top: canvasH * 0.15,
    rx: canvasW * 0.18, ry: canvasH * 0.12,
    originX: 'center', originY: 'center',
    fill: new fabric.Gradient({
      type: 'radial',
      coords: {
        x1: canvasW * 0.18, y1: canvasH * 0.12, r1: 0,
        x2: canvasW * 0.18, y2: canvasH * 0.12, r2: canvasW * 0.18,
      },
      colorStops: [
        { offset: 0,   color: 'rgba(255,255,255,0.12)' },
        { offset: 0.5, color: 'rgba(255,255,255,0.04)' },
        { offset: 1,   color: 'rgba(255,255,255,0)' },
      ],
    }),
    clipPath: specClip,
    ...tid('specular'),
  }));

  /* ── Layer 6: Edge Highlight (subtle white outline on light-facing edge) ── */
  all.push(new fabric.Path(pathData, {
    fill: 'transparent',
    stroke: 'rgba(255,255,255,0.12)',
    strokeWidth: 1.5,
    ...tid('edge_hl'),
  }));

  /* ── Layer 7: Product-specific details (folds, collar, camera, etc.) ──── */
  const detailBuilder = DETAIL_BUILDERS[productType];
  if (detailBuilder) {
    all.push(...detailBuilder(canvasW, canvasH));
  }

  /* ── Layer 8: Design Zone indicator ──────────────────────────────────── */
  all.push(new fabric.Rect({
    left: zone.x, top: zone.y, width: zone.w, height: zone.h,
    fill: 'transparent',
    stroke: 'rgba(199, 109, 74, 0.35)',
    strokeWidth: 1.5, strokeDashArray: [8, 6], rx: 4, ry: 4,
    ...tid('zone'),
  }));

  /* ── Layer 9: Zone Label ─────────────────────────────────────────────── */
  all.push(new fabric.Text('DESIGN ZONE', {
    left: zone.x + zone.w / 2, top: zone.y - 18,
    fontSize: 10, fontFamily: 'Inter, sans-serif',
    fill: 'rgba(199, 109, 74, 0.5)', fontWeight: '700',
    textAlign: 'center', originX: 'center',
    ...tid('label'),
  }));

  /* ── Add to canvas and fix z-order ──────────────────────────────────── */
  all.forEach(obj => canvas.add(obj));

  // Bring all user (non-template) objects above the template
  canvas.getObjects()
    .filter(obj => !isTemplateObject(obj) && obj.id !== '__grid__')
    .forEach(obj => canvas.bringToFront(obj));

  canvas.renderAll();
}

/* ─── Utility Exports ─────────────────────────────────────────────────────── */

export function createDesignZoneClipPath(productType) {
  const zone = getDesignZone(productType);
  return new fabric.Rect({
    left: zone.x,
    top: zone.y,
    width: zone.w,
    height: zone.h,
    rx: 4,
    ry: 4,
    absolutePositioned: true,
  });
}

export function removeProductTemplate(canvas) {
  if (!canvas) return;
  canvas.getObjects().filter(o => o.id && o.id.startsWith('__template__')).forEach(o => canvas.remove(o));
  canvas.renderAll();
}

export function isTemplateObject(obj) {
  return obj && obj.id && obj.id.startsWith('__template__');
}

export function getDefaultProductType(category) {
  const types = PRODUCT_TYPES[category];
  return types ? types[0].id : 'tshirt';
}

export function getProductLabel(productType) {
  for (const cat of Object.values(PRODUCT_TYPES)) {
    const found = cat.find(p => p.id === productType);
    if (found) return found.label;
  }
  return 'Product';
}
