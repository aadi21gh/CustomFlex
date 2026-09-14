import { fabric } from 'fabric';
import { getMockup, MOCKUP_IMAGES } from './mockupRegistry';

/* ═══════════════════════════════════════════════════════════════════════════════
   Product Template System — 100% Photorealistic Studio Mockups
   ─────────────────────────────────────────────────────────────────────────────
   Loads actual high-resolution studio photographs directly onto the canvas,
   providing true-to-life fabric folds, collar ribbing, stitching, and depth.
   ═══════════════════════════════════════════════════════════════════════════════ */

// ── Color Palettes ──────────────────────────────────────────────────────────
export const PRODUCT_COLORS = {
  clothing: [
    { id: 'white',    hex: '#FFFFFF', label: 'White' },
    { id: 'gray',     hex: '#71717a', label: 'Heather Gray' },
    { id: 'black',    hex: '#1a1a1a', label: 'Jet Black' },
    { id: 'cream',    hex: '#f5f0e8', label: 'Natural Cream' },
    { id: 'sand',     hex: '#d4b896', label: 'Warm Sand' },
    { id: 'navy',     hex: '#1e3a5f', label: 'Navy' },
    { id: 'red',      hex: '#b91c1c', label: 'Crimson' },
    { id: 'forest',   hex: '#166534', label: 'Forest Green' },
    { id: 'terracotta', hex: '#C76D4A', label: 'Terracotta' },
    { id: 'sage',     hex: '#8A9A7B', label: 'Sage' },
  ],
  artwork: [
    { id: 'white',    hex: '#FFFFFF', label: 'White Frame' },
    { id: 'cream',    hex: '#faf7f0', label: 'Cream Mat' },
    { id: 'black',    hex: '#1a1a1a', label: 'Black Wood' },
    { id: 'oak',      hex: '#c4a66a', label: 'Natural Oak' },
    { id: 'walnut',   hex: '#5c3d2e', label: 'Dark Walnut' },
    { id: 'silver',   hex: '#c0c0c0', label: 'Brushed Silver' },
  ],
  accessories: [
    { id: 'clear',    hex: '#e8eaed', label: 'Clear' },
    { id: 'white',    hex: '#FFFFFF', label: 'White' },
    { id: 'black',    hex: '#1a1a1a', label: 'Matte Black' },
    { id: 'midnight', hex: '#1e293b', label: 'Midnight Blue' },
    { id: 'rose',     hex: '#e8b4b8', label: 'Rose Pink' },
    { id: 'sage',     hex: '#8A9A7B', label: 'Sage' },
  ],
};

// ── Product Types per Category ──────────────────────────────────────────────
export const PRODUCT_TYPES = {
  clothing: [
    { id: 'tshirt',     label: 'T-Shirt',        emoji: '👕' },
    { id: 'oversized',  label: 'Oversized Tee',  emoji: '🫱' },
    { id: 'hoodie',     label: 'Hoodie',         emoji: '🧥' },
    { id: 'sweatshirt', label: 'Sweatshirt',     emoji: '🌀' },
    { id: 'longsleeve', label: 'Long Sleeve',    emoji: '👔' },
    { id: 'tanktop',    label: 'Tank Top',       emoji: '🎽' },
    { id: 'polo',       label: 'Polo Shirt',     emoji: '👕' },
    { id: 'jacket',     label: 'Bomber Jacket',  emoji: '🧥' },
  ],
  artwork: [
    { id: 'canvas',     label: 'Canvas Print',   emoji: '🖼️' },
    { id: 'poster',     label: 'Poster',         emoji: '🖥️' },
    { id: 'acrylic',    label: 'Acrylic Print',  emoji: '🪟' },
  ],
  accessories: [
    { id: 'phonecase',  label: 'Phone Case',     emoji: '📱' },
    { id: 'totebag',    label: 'Tote Bag',       emoji: '👜' },
    { id: 'cap',        label: 'Cap',            emoji: '🧢' },
  ],
};

/* ─── Non-interactive properties for background template objects ─────────── */
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

/**
 * Returns exact pixel design zone coordinates matching the product's print area
 */
export const getDesignZone = (productType, side = 'front', canvasW = 960, canvasH = 580) => {
  const mockup = getMockup(productType);
  const area = (side === 'back' && mockup.printAreaBack) ? mockup.printAreaBack : mockup.printArea;
  if (!area) {
    return { x: canvasW * 0.15, y: canvasH * 0.2, w: canvasW * 0.3, h: canvasH * 0.4 };
  }

  return {
    x: Math.round((area.x / 100) * canvasW),
    y: Math.round((area.y / 100) * canvasH),
    w: Math.round((area.w / 100) * canvasW),
    h: Math.round((area.h / 100) * canvasH),
  };
};

/**
 * Renders the authentic photorealistic studio mockup photograph onto Fabric.js canvas
 */
export function renderProductTemplate(canvas, productType, productColor, canvasW = 960, canvasH = 580, activeSide = 'front') {
  if (!canvas) return;

  // Clear existing template elements
  removeProductTemplate(canvas);

  const mockup = getMockup(productType);
  const mockupSrc = activeSide === 'back' && mockup.back ? mockup.back : mockup.front;
  const zone = getDesignZone(productType, activeSide, canvasW, canvasH);

  // Load the studio mockup photograph
  fabric.Image.fromURL(mockupSrc, (img) => {
    if (!img) return;

    // Scale photograph to fill canvas width and center vertically
    const scale = Math.min(canvasW / img.width, canvasH / img.height);
    const left = (canvasW - img.width * scale) / 2;
    const top = (canvasH - img.height * scale) / 2;

    img.set({
      left,
      top,
      scaleX: scale,
      scaleY: scale,
      ...tid('photo'),
    });

    const templateObjects = [img];

    // Fabric Color Tint Overlay (when color is not pure white)
    if (productColor && productColor.toUpperCase() !== '#FFFFFF') {
      const tint = new fabric.Rect({
        left,
        top,
        width: img.width * scale,
        height: img.height * scale,
        fill: productColor,
        opacity: 0.28,
        globalCompositeOperation: 'multiply',
        ...tid('tint'),
      });
      templateObjects.push(tint);
    }

    // Design Zone Indicator (Clean dashed bounding boundary)
    const zoneBox = new fabric.Rect({
      left: zone.x,
      top: zone.y,
      width: zone.w,
      height: zone.h,
      fill: 'transparent',
      stroke: 'rgba(199, 109, 74, 0.4)',
      strokeWidth: 1.5,
      strokeDashArray: [6, 4],
      rx: 8,
      ry: 8,
      ...tid('zone'),
    });

    // Side Badge Label
    const sideLabel = activeSide === 'back' ? 'BACK PRINT AREA' : 'FRONT PRINT AREA';
    const label = new fabric.Text(sideLabel, {
      left: zone.x + zone.w / 2,
      top: Math.max(zone.y - 20, 10),
      fontSize: 10,
      fontFamily: 'Space Grotesk, sans-serif',
      fill: 'rgba(199, 109, 74, 0.75)',
      fontWeight: '800',
      textAlign: 'center',
      originX: 'center',
      letterSpacing: 1.2,
      ...tid('label'),
    });

    templateObjects.push(zoneBox, label);

    // Insert at bottom of canvas stack
    templateObjects.forEach((obj, i) => {
      canvas.insertAt(obj, i);
    });

    // Bring all user artwork objects to front
    canvas.getObjects()
      .filter((obj) => !isTemplateObject(obj) && obj.id !== '__grid__')
      .forEach((obj) => canvas.bringToFront(obj));

    canvas.renderAll();
  }, { crossOrigin: 'anonymous' });
}

/* ─── Utility Exports ─────────────────────────────────────────────────────── */

export function createDesignZoneClipPath(productType, side = 'front', canvasW = 960, canvasH = 580) {
  const zone = getDesignZone(productType, side, canvasW, canvasH);
  return new fabric.Rect({
    left: zone.x,
    top: zone.y,
    width: zone.w,
    height: zone.h,
    rx: 8,
    ry: 8,
    absolutePositioned: true,
  });
}

export function removeProductTemplate(canvas) {
  if (!canvas) return;
  canvas.getObjects()
    .filter((o) => o.id && o.id.startsWith('__template__'))
    .forEach((o) => canvas.remove(o));
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
    const found = cat.find((p) => p.id === productType);
    if (found) return found.label;
  }
  return 'Product';
}
