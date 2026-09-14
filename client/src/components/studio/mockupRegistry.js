/* ═══════════════════════════════════════════════════════════════════════════════
   Crexza — Photorealistic Mockup Image Registry
   ─────────────────────────────────────────────────────────────────────────────
   Maps every product type to its studio-quality mockup image paths.
   Each entry defines:
   - front / back image URLs (served from /mockups/)
   - printArea: The % coordinates of the designable area on the mockup image
     (used for overlaying artwork on the preview thumbnails)
   ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Mockup image registry. Each product has front/back mockup images
 * and a printArea definition as percentages (x%, y%, w%, h%) 
 * describing where artwork should be overlaid on the LEFT product
 * in the side-by-side mockup images.
 */
export const MOCKUP_IMAGES = {
  tshirt: {
    label: 'T-Shirt',
    front: '/mockups/tshirt.jpg',
    back: '/mockups/tshirt.jpg',
    // Design area on the LEFT garment (front) in the side-by-side image
    printArea: { x: 12, y: 25, w: 26, h: 35 },
    // Design area on the RIGHT garment (back) in the side-by-side image
    printAreaBack: { x: 62, y: 22, w: 26, h: 38 },
  },
  oversized: {
    label: 'Oversized Tee',
    front: '/mockups/oversized.jpg',
    back: '/mockups/oversized.jpg',
    printArea: { x: 11, y: 24, w: 28, h: 36 },
    printAreaBack: { x: 61, y: 20, w: 28, h: 40 },
  },
  hoodie: {
    label: 'Hoodie',
    front: '/mockups/hoodie.jpg',
    back: '/mockups/hoodie.jpg',
    printArea: { x: 11, y: 35, w: 28, h: 30 },
    printAreaBack: { x: 60, y: 30, w: 28, h: 34 },
  },
  sweatshirt: {
    label: 'Sweatshirt',
    front: '/mockups/sweatshirt.jpg',
    back: '/mockups/sweatshirt.jpg',
    printArea: { x: 12, y: 25, w: 26, h: 35 },
    printAreaBack: { x: 61, y: 22, w: 26, h: 38 },
  },
  longsleeve: {
    label: 'Long Sleeve',
    front: '/mockups/longsleeve.jpg',
    back: '/mockups/longsleeve.jpg',
    printArea: { x: 12, y: 24, w: 26, h: 36 },
    printAreaBack: { x: 62, y: 20, w: 26, h: 40 },
  },
  tanktop: {
    label: 'Tank Top',
    front: '/mockups/tanktop.jpg',
    back: '/mockups/tanktop.jpg',
    printArea: { x: 13, y: 22, w: 24, h: 38 },
    printAreaBack: { x: 63, y: 20, w: 24, h: 40 },
  },
  polo: {
    label: 'Polo Shirt',
    front: '/mockups/polo.jpg',
    back: '/mockups/polo.jpg',
    printArea: { x: 11, y: 28, w: 26, h: 34 },
    printAreaBack: { x: 61, y: 24, w: 26, h: 38 },
  },
  jacket: {
    label: 'Bomber Jacket',
    front: '/mockups/jacket.jpg',
    back: '/mockups/jacket.jpg',
    printArea: { x: 12, y: 28, w: 26, h: 32 },
    printAreaBack: { x: 62, y: 24, w: 26, h: 36 },
  },
  canvas: {
    label: 'Canvas Print',
    front: '/mockups/canvas.jpg',
    back: '/mockups/canvas.jpg',
    printArea: { x: 10, y: 10, w: 80, h: 80 },
    printAreaBack: { x: 10, y: 10, w: 80, h: 80 },
  },
  poster: {
    label: 'Poster',
    front: '/mockups/poster.jpg',
    back: '/mockups/poster.jpg',
    printArea: { x: 18, y: 10, w: 64, h: 80 },
    printAreaBack: { x: 18, y: 10, w: 64, h: 80 },
  },
  acrylic: {
    label: 'Acrylic Print',
    front: '/mockups/acrylic.jpg',
    back: '/mockups/acrylic.jpg',
    printArea: { x: 10, y: 10, w: 80, h: 80 },
    printAreaBack: { x: 10, y: 10, w: 80, h: 80 },
  },
  phonecase: {
    label: 'Phone Case',
    front: '/mockups/phonecase.jpg',
    back: '/mockups/phonecase.jpg',
    // Left phone (back of case) is the printable area
    printArea: { x: 8, y: 8, w: 38, h: 84 },
    printAreaBack: { x: 8, y: 8, w: 38, h: 84 },
  },
  totebag: {
    label: 'Tote Bag',
    front: '/mockups/totebag.jpg',
    back: '/mockups/totebag.jpg',
    printArea: { x: 8, y: 28, w: 38, h: 50 },
    printAreaBack: { x: 56, y: 28, w: 38, h: 50 },
  },
  cap: {
    label: 'Cap',
    front: '/mockups/cap.jpg',
    back: '/mockups/cap.jpg',
    printArea: { x: 10, y: 18, w: 30, h: 35 },
    printAreaBack: { x: 60, y: 18, w: 30, h: 35 },
  },
};

/**
 * Returns mockup data for a given product type, falling back to tshirt.
 */
export function getMockup(productType) {
  return MOCKUP_IMAGES[productType] || MOCKUP_IMAGES.tshirt;
}

/**
 * Returns all available product types as a list.
 */
export function getAllProductTypes() {
  return Object.entries(MOCKUP_IMAGES).map(([id, data]) => ({
    id,
    label: data.label,
    front: data.front,
    back: data.back,
  }));
}
