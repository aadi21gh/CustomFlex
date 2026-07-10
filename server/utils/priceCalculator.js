/**
 * CustomFlex Universal Pricing Engine
 *
 * Transparent, data-driven pricing formula:
 *   Final Price = Base Product Price + Material Price + Design Charge + Delivery Charge
 *
 * All values are in INR (₹).
 * Adding a new product only requires new pricing data — zero business-logic changes.
 */

/* ─── Base Product Prices (INR) ─────────────────────────────────────────────── */
const BASE_PRICES = {
  clothing: {
    't-shirt':      399,
    'hoodie':       799,
    'sweatshirt':   649,
    'jacket':       1299,
    'jersey':       599,
    'oversized-tee':499,
    'polo-shirt':   499,
  },
  artwork: {
    'canvas-print': 899,
    'poster':       299,
    'acrylic-print':1499,
    'wooden-frame': 1199,
    'metal-print':  1699,
    'wall-art':     999,
    'photo-frame':  599,
    'sticker-pack': 199,
  },
  accessories: {
    'sneakers':     1999,
    'cap':          399,
    'chain':        799,
    'ring':         599,
    'bracelet':     499,
    'wallet':       699,
    'watch':        1499,
    'phone-case':   349,
    'laptop-skin':  449,
    'sunglasses':   699,
    'tote-bag':     399,
    'backpack':     1299,
  },
};

/* ─── Material Options (INR add-on price + label) ───────────────────────────── */
const MATERIAL_OPTIONS = {
  // Clothing materials
  cotton:           { label: 'Cotton',           addOn: 0,    description: 'Standard 180 GSM cotton' },
  'premium-cotton': { label: 'Premium Cotton',   addOn: 120,  description: 'Soft 240 GSM combed cotton' },
  'organic-cotton': { label: 'Organic Cotton',   addOn: 200,  description: 'GOTS certified organic' },
  'oversized-cotton': { label: 'Oversized Cotton', addOn: 80, description: 'Relaxed fit 220 GSM' },
  'dry-fit':        { label: 'Dry Fit',          addOn: 150,  description: 'Moisture-wicking polyester' },
  polyester:        { label: 'Polyester',        addOn: 60,   description: 'Durable synthetic blend' },
  silk:             { label: 'Silk',             addOn: 300,  description: 'Pure 100% mulberry silk' },
  linen:            { label: 'Linen',            addOn: 150,  description: 'Premium lightweight breathable linen' },

  // Artwork materials
  'matte-paper':    { label: 'Matte Paper',      addOn: 0,    description: 'Standard 250 GSM matte' },
  'glossy-paper':   { label: 'Glossy Paper',     addOn: 50,   description: 'High-gloss 300 GSM' },
  'canvas':         { label: 'Canvas',           addOn: 300,  description: 'Artist-grade stretched canvas' },
  'acrylic':        { label: 'Acrylic Glass',    addOn: 500,  description: '4mm shatter-resistant acrylic' },
  'wood':           { label: 'Wood',             addOn: 400,  description: 'Birch wood panel' },
  'metal':          { label: 'Aluminum',         addOn: 600,  description: 'Brushed aluminum sheet' },

  // Accessories materials
  'standard':       { label: 'Standard',         addOn: 0,    description: 'Default quality material' },
  'premium':        { label: 'Premium',          addOn: 200,  description: 'Upgraded premium material' },
  'silicone':       { label: 'Silicone',         addOn: 0,    description: 'Flexible silicone case' },
  'hard-plastic':   { label: 'Hard Plastic',     addOn: 50,   description: 'Impact-resistant polycarbonate' },
  'leather':        { label: 'Leather',          addOn: 350,  description: 'Genuine leather finish' },
  'stainless-steel':{ label: 'Stainless Steel',  addOn: 250,  description: 'Brushed 316L stainless' },
};

/* ─── Design Charges (INR) — flat fee per print area ───────────────────────── */
const DESIGN_CHARGES = {
  front:       0,
  back:        0,
  'front-back':0,
  'left-sleeve':0,
  'right-sleeve':0,
  'all-over':  0,
  full:        0,
  // Artwork / single-area products
  standard:    0,
};

/* ─── Delivery Options (INR) ─────────────────────────────────────────────────── */
const DELIVERY_OPTIONS = {
  standard: { label: 'Standard Shipping', price: 99,  days: '2-3 weeks' },
};

/* ─── Default material per category ─────────────────────────────────────────── */
const DEFAULT_MATERIAL = {
  clothing:    'cotton',
  artwork:     'matte-paper',
  accessories: 'standard',
};

/* ─── Default print area per category ───────────────────────────────────────── */
const DEFAULT_PRINT_AREA = {
  clothing:    'front',
  artwork:     'standard',
  accessories: 'standard',
};

/**
 * calculatePrice — Universal pricing engine
 *
 * @param {Object} params
 * @param {string} params.category       - 'clothing' | 'artwork' | 'accessories'
 * @param {string} params.subcategory    - e.g. 't-shirt', 'hoodie', 'phone-case'
 * @param {string} params.material       - Key from MATERIAL_OPTIONS
 * @param {string} params.printArea      - Key from DESIGN_CHARGES
 * @param {number} params.quantity       - Number of items
 * @param {string} params.deliveryMethod - Key from DELIVERY_OPTIONS
 * @param {number} [params.customBasePrice] - Override base price (for DB-fetched products)
 * @param {number} [params.customDesignCharge] - Override design charge (from Product model)
 * @param {number} [params.customDeliveryCharge] - Override delivery charge (from Product model)
 * @returns {Object} Full price breakdown
 */
const calculatePrice = ({
  category = 'clothing',
  subcategory,
  material,
  printArea,
  quantity = 1,
  deliveryMethod = 'standard',
  customBasePrice = null,
  customDesignCharge = null,
  customDeliveryCharge = null,
}) => {
  // 1. Base product price
  const categoryPrices = BASE_PRICES[category] || BASE_PRICES.clothing;
  const basePrice = customBasePrice
    || (subcategory && categoryPrices[subcategory])
    || Object.values(categoryPrices)[0]
    || 399;

  // 2. Material price (add-on)
  const resolvedMaterial = material || DEFAULT_MATERIAL[category] || 'standard';
  const materialData = MATERIAL_OPTIONS[resolvedMaterial] || MATERIAL_OPTIONS.standard;
  const materialPrice = materialData.addOn;

  // 3. Design charge
  const resolvedPrintArea = printArea || DEFAULT_PRINT_AREA[category] || 'standard';
  const designCharge = customDesignCharge !== null
    ? customDesignCharge
    : (DESIGN_CHARGES[resolvedPrintArea] || DESIGN_CHARGES.standard);

  // 4. Delivery charge
  const deliveryData = DELIVERY_OPTIONS[deliveryMethod] || DELIVERY_OPTIONS.standard;
  const deliveryCharge = customDeliveryCharge !== null
    ? customDeliveryCharge
    : deliveryData.price;

  // 5. Per-unit subtotal
  const unitPrice = basePrice + materialPrice + designCharge;

  // 6. Quantity total (before delivery)
  const itemsTotal = unitPrice * quantity;

  // 7. Quantity discount
  let quantityDiscount = 0;
  if (quantity >= 10) quantityDiscount = Math.round(itemsTotal * 0.15);
  else if (quantity >= 5) quantityDiscount = Math.round(itemsTotal * 0.10);
  else if (quantity >= 3) quantityDiscount = Math.round(itemsTotal * 0.05);

  const discountedTotal = itemsTotal - quantityDiscount;

  // 8. Final total
  const total = discountedTotal + deliveryCharge;

  return {
    // Breakdown line items (what the UI shows)
    basePrice,
    materialPrice,
    materialLabel: materialData.label,
    materialDescription: materialData.description,
    designCharge,
    printAreaLabel: resolvedPrintArea.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    deliveryCharge,
    deliveryLabel: deliveryData.label,
    deliveryDays: deliveryData.days,

    // Totals
    unitPrice,
    quantity,
    itemsTotal,
    quantityDiscount,
    discountedTotal,
    total,

    // Currency
    currency: 'INR',

    // Legacy-compatible fields (used by Order model)
    subtotal: itemsTotal,
    shipping: deliveryCharge,
    tax: 0, // GST is included in base prices for simplicity
  };
};

/**
 * getAvailableOptions — Returns all selectable options for the frontend
 */
const getAvailableOptions = () => ({
  basePrices: BASE_PRICES,
  materials: Object.entries(MATERIAL_OPTIONS).map(([id, data]) => ({
    id,
    label: data.label,
    addOn: data.addOn,
    description: data.description,
  })),
  materialsByCategory: {
    clothing:    ['cotton', 'premium-cotton', 'organic-cotton', 'oversized-cotton', 'dry-fit', 'polyester', 'silk', 'linen'],
    artwork:     ['matte-paper', 'glossy-paper', 'canvas', 'acrylic', 'wood', 'metal'],
    accessories: ['standard', 'premium', 'silicone', 'hard-plastic', 'leather', 'stainless-steel'],
  },
  printAreas: Object.entries(DESIGN_CHARGES).map(([id, charge]) => ({
    id,
    label: id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    charge,
  })),
  deliveryOptions: Object.entries(DELIVERY_OPTIONS).map(([id, data]) => ({
    id,
    label: data.label,
    price: data.price,
    days: data.days,
  })),
  currency: 'INR',
});

module.exports = { calculatePrice, getAvailableOptions, MATERIAL_OPTIONS, DESIGN_CHARGES, DELIVERY_OPTIONS, BASE_PRICES };
