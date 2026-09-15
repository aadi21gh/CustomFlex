import { fabric } from 'fabric';
import { getMockup, MOCKUP_IMAGES } from './mockupRegistry';

/* ═══════════════════════════════════════════════════════════════════════════════
   Product Template System — Photorealistic Studio Mockups
   ─────────────────────────────────────────────────────────────────────────────
   Loads high-resolution studio photographs directly onto the canvas.
   Supports centered single-garment Front and Back views with full-product coverage.
   ═══════════════════════════════════════════════════════════════════════════════ */

// ── Color Palettes ──────────────────────────────────────────────────────────
export const PRODUCT_COLORS = {
  clothing: [
    { id: 'white',      hex: '#FFFFFF', label: 'White' },
    { id: 'gray',       hex: '#71717a', label: 'Heather Gray' },
    { id: 'black',      hex: '#1a1a1a', label: 'Jet Black' },
    { id: 'cream',      hex: '#f5f0e8', label: 'Natural Cream' },
    { id: 'sand',       hex: '#d4b896', label: 'Warm Sand' },
    { id: 'navy',       hex: '#1e3a5f', label: 'Navy' },
    { id: 'red',        hex: '#b91c1c', label: 'Crimson' },
    { id: 'forest',     hex: '#166534', label: 'Forest Green' },
    { id: 'terracotta', hex: '#C76D4A', label: 'Terracotta' },
    { id: 'sage',       hex: '#8A9A7B', label: 'Sage' },
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

export const isDualGarment = (productType) => {
  return ['tshirt', 'oversized', 'hoodie', 'sweatshirt', 'longsleeve', 'tanktop', 'polo', 'jacket', 'phonecase', 'totebag', 'cap'].includes(productType);
};

/**
 * Returns exact pixel design zone coordinates matching the full centered product
 */
export const getDesignZone = (productType, side = 'front', canvasW = 960, canvasH = 580) => {
  if (!isDualGarment(productType)) {
    return {
      x: Math.round(canvasW * 0.06),
      y: Math.round(canvasH * 0.06),
      w: Math.round(canvasW * 0.88),
      h: Math.round(canvasH * 0.88),
    };
  }

  if (productType === 'tanktop') {
    return {
      x: Math.round(canvasW * 0.28),
      y: Math.round(canvasH * 0.09),
      w: Math.round(canvasW * 0.44),
      h: Math.round(canvasH * 0.82),
    };
  }

  if (productType === 'cap') {
    return {
      x: Math.round(canvasW * 0.26),
      y: Math.round(canvasH * 0.12),
      w: Math.round(canvasW * 0.48),
      h: Math.round(canvasH * 0.74),
    };
  }

  if (productType === 'totebag') {
    return {
      x: Math.round(canvasW * 0.25),
      y: Math.round(canvasH * 0.08),
      w: Math.round(canvasW * 0.50),
      h: Math.round(canvasH * 0.84),
    };
  }

  if (productType === 'phonecase') {
    return {
      x: Math.round(canvasW * 0.30),
      y: Math.round(canvasH * 0.06),
      w: Math.round(canvasW * 0.40),
      h: Math.round(canvasH * 0.88),
    };
  }

  // T-shirts, Hoodies, Sweatshirts, Polos, Jackets, Long Sleeves
  return {
    x: Math.round(canvasW * 0.22),
    y: Math.round(canvasH * 0.08),
    w: Math.round(canvasW * 0.56),
    h: Math.round(canvasH * 0.84),
  };
};

/**
 * Renders the authentic photorealistic studio mockup photograph onto Fabric.js canvas
 * Centers the active side (Front or Back) large and prominent on the screen.
 */
export function renderProductTemplate(canvas, productType, productColor, canvasW = 960, canvasH = 580, activeSide = 'front') {
  if (!canvas) return;

  // Clear existing template elements
  removeProductTemplate(canvas);

  const mockup = getMockup(productType);
  const mockupSrc = mockup.front;
  const isDual = isDualGarment(productType);
  const zone = getDesignZone(productType, activeSide, canvasW, canvasH);

  // Load the studio mockup photograph
  fabric.Image.fromURL(mockupSrc, (img) => {
    if (!img) return;

    let cropX = 0;
    let cropY = 0;
    let cropW = img.width;
    let cropH = img.height;

    if (isDual) {
      cropW = img.width / 2;
      if (activeSide === 'back') {
        cropX = img.width / 2;
      }
    }

    // Scale single focused garment to fill canvas height gracefully and center horizontally
    const maxW = canvasW * 0.88;
    const maxH = canvasH * 0.94;
    const scale = Math.min(maxW / cropW, maxH / cropH);
    const left = (canvasW - cropW * scale) / 2;
    const top = (canvasH - cropH * scale) / 2;

    img.set({
      cropX,
      cropY,
      width: cropW,
      height: cropH,
      left,
      top,
      scaleX: scale,
      scaleY: scale,
      ...tid('photo'),
    });

    const templateObjects = [img];

    // Fabric Color Tinting — applied directly onto the centered garment
    const isNeutral = ['#FFFFFF', '#ffffff', '#F7F3EB', '#FAF7F0', '#faf7f0', '#f7f3eb'].includes(productColor);
    if (productColor && !isNeutral) {
      const isDark = ['#1a1a1a', '#000000', '#1e293b', '#1e3a5f', '#166534', '#b91c1c', '#71717a'].includes(productColor.toLowerCase());

      const garmentTint = new fabric.Rect({
        left: zone.x,
        top: zone.y,
        width: zone.w,
        height: zone.h,
        rx: 24,
        ry: 24,
        fill: productColor,
        opacity: isDark ? 0.72 : 0.58,
        globalCompositeOperation: 'multiply',
        ...tid('tint'),
      });

      const garmentHue = new fabric.Rect({
        left: zone.x,
        top: zone.y,
        width: zone.w,
        height: zone.h,
        rx: 24,
        ry: 24,
        fill: productColor,
        opacity: isDark ? 0.18 : 0.25,
        globalCompositeOperation: 'color',
        ...tid('hue'),
      });

      templateObjects.push(garmentTint, garmentHue);
    }

    // Active Design Zone Indicator — full product coverage dashed boundary
    const activeZoneBox = new fabric.Rect({
      left: zone.x,
      top: zone.y,
      width: zone.w,
      height: zone.h,
      fill: 'rgba(199, 109, 74, 0.03)',
      stroke: '#C76D4A',
      strokeWidth: 2,
      strokeDashArray: [8, 5],
      rx: 20,
      ry: 20,
      ...tid('active_zone'),
    });

    const sideLabel = activeSide === 'back' ? '● BACK PRINT AREA (FULL PRODUCT)' : '● FRONT PRINT AREA (FULL PRODUCT)';
    const activeLabel = new fabric.Text(sideLabel, {
      left: zone.x + zone.w / 2,
      top: Math.max(6, zone.y - 18),
      fontSize: 10,
      fontFamily: 'Space Grotesk, Inter, sans-serif',
      fill: '#C76D4A',
      fontWeight: '800',
      textAlign: 'center',
      originX: 'center',
      letterSpacing: 1.2,
      ...tid('active_label'),
    });

    templateObjects.push(activeZoneBox, activeLabel);

    // Insert at bottom of canvas stack
    templateObjects.forEach((obj, i) => {
      canvas.insertAt(obj, i);
    });

    // Bring user artwork objects to front
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
    rx: 20,
    ry: 20,
    absolutePositioned: true,
  });
}

export function removeProductTemplate(canvas) {
  if (!canvas) return;
  canvas.getObjects()
    .filter(isTemplateObject)
    .forEach((obj) => canvas.remove(obj));
}

export function isTemplateObject(obj) {
  if (!obj) return false;
  return (
    obj.id?.startsWith('__template__') ||
    obj.customName === '__template__' ||
    obj.id === '__active_zone__' ||
    obj.id === '__active_label__' ||
    obj.id === '__inactive_zone__' ||
    obj.id === '__inactive_label__'
  );
}

export function getDefaultProductType(category) {
  const types = PRODUCT_TYPES[category] || PRODUCT_TYPES.clothing;
  return types[0]?.id || 'tshirt';
}

export function getProductLabel(productType) {
  for (const cat of Object.values(PRODUCT_TYPES)) {
    const found = cat.find((p) => p.id === productType);
    if (found) return found.label;
  }
  return productType;
}

export default {
  renderProductTemplate,
  removeProductTemplate,
  getDesignZone,
  createDesignZoneClipPath,
  isTemplateObject,
  PRODUCT_COLORS,
  PRODUCT_TYPES,
  getDefaultProductType,
  getProductLabel,
  isDualGarment,
};
