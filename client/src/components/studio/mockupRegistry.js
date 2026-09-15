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
    // Precise full product silhouette on LEFT garment (front)
    printArea: { x: 4, y: 15, w: 45, h: 75 },
    // Precise full product silhouette on RIGHT garment (back)
    printAreaBack: { x: 51, y: 15, w: 45, h: 75 },
  },
  oversized: {
    label: 'Oversized Tee',
    front: '/mockups/oversized.jpg',
    back: '/mockups/oversized.jpg',
    printArea: { x: 4, y: 15, w: 45, h: 75 },
    printAreaBack: { x: 51, y: 15, w: 45, h: 75 },
  },
  hoodie: {
    label: 'Hoodie',
    front: '/mockups/hoodie.jpg',
    back: '/mockups/hoodie.jpg',
    printArea: { x: 4, y: 14, w: 45, h: 76 },
    printAreaBack: { x: 51, y: 14, w: 45, h: 76 },
  },
  sweatshirt: {
    label: 'Sweatshirt',
    front: '/mockups/sweatshirt.jpg',
    back: '/mockups/sweatshirt.jpg',
    printArea: { x: 4, y: 15, w: 45, h: 75 },
    printAreaBack: { x: 51, y: 15, w: 45, h: 75 },
  },
  longsleeve: {
    label: 'Long Sleeve',
    front: '/mockups/longsleeve.jpg',
    back: '/mockups/longsleeve.jpg',
    printArea: { x: 3, y: 15, w: 46, h: 75 },
    printAreaBack: { x: 51, y: 15, w: 46, h: 75 },
  },
  tanktop: {
    label: 'Tank Top',
    front: '/mockups/tanktop.jpg',
    back: '/mockups/tanktop.jpg',
    printArea: { x: 6, y: 15, w: 40, h: 75 },
    printAreaBack: { x: 54, y: 15, w: 40, h: 75 },
  },
  polo: {
    label: 'Polo Shirt',
    front: '/mockups/polo.jpg',
    back: '/mockups/polo.jpg',
    printArea: { x: 4, y: 15, w: 45, h: 75 },
    printAreaBack: { x: 51, y: 15, w: 45, h: 75 },
  },
  jacket: {
    label: 'Bomber Jacket',
    front: '/mockups/jacket.jpg',
    back: '/mockups/jacket.jpg',
    printArea: { x: 4, y: 14, w: 45, h: 76 },
    printAreaBack: { x: 51, y: 14, w: 45, h: 76 },
  },
  canvas: {
    label: 'Canvas Print',
    front: '/mockups/canvas.jpg',
    back: '/mockups/canvas.jpg',
    printArea: { x: 4, y: 4, w: 92, h: 92 },
    printAreaBack: { x: 4, y: 4, w: 92, h: 92 },
  },
  poster: {
    label: 'Poster',
    front: '/mockups/poster.jpg',
    back: '/mockups/poster.jpg',
    printArea: { x: 6, y: 6, w: 88, h: 88 },
    printAreaBack: { x: 6, y: 6, w: 88, h: 88 },
  },
  acrylic: {
    label: 'Acrylic Print',
    front: '/mockups/acrylic.jpg',
    back: '/mockups/acrylic.jpg',
    printArea: { x: 4, y: 4, w: 92, h: 92 },
    printAreaBack: { x: 4, y: 4, w: 92, h: 92 },
  },
  phonecase: {
    label: 'Phone Case',
    front: '/mockups/phonecase.jpg',
    back: '/mockups/phonecase.jpg',
    printArea: { x: 6, y: 8, w: 40, h: 84 },
    printAreaBack: { x: 54, y: 8, w: 40, h: 84 },
  },
  totebag: {
    label: 'Tote Bag',
    front: '/mockups/totebag.jpg',
    back: '/mockups/totebag.jpg',
    printArea: { x: 5, y: 12, w: 42, h: 80 },
    printAreaBack: { x: 53, y: 12, w: 42, h: 80 },
  },
  cap: {
    label: 'Cap',
    front: '/mockups/cap.jpg',
    back: '/mockups/cap.jpg',
    printArea: { x: 5, y: 14, w: 42, h: 74 },
    printAreaBack: { x: 53, y: 14, w: 42, h: 74 },
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
