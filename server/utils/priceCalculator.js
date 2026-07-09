/**
 * Dynamic price calculator for CustomFlex products
 * Formula: (basePrice × materialModifier × printAreaModifier + aiComplexityFee) × quantity + shipping + tax
 */

const BASE_PRICES = {
  artwork: {
    'canvas-print': 25,
    'poster': 12,
    'framed-print': 45,
    'digital': 5,
  },
  clothing: {
    't-shirt': 20,
    'hoodie': 40,
    'jacket': 65,
    'cap': 18,
    'tote-bag': 15,
  },
  accessories: {
    'phone-case': 18,
    'mug': 14,
    'pillow': 22,
    'sticker': 5,
    'notebook': 16,
  },
};

const MATERIAL_MODIFIERS = {
  standard: 1.0,
  premium: 1.5,
  luxury: 2.2,
  organic: 1.8,
  recycled: 1.3,
};

const PRINT_AREA_MODIFIERS = {
  'front': 1.0,
  'back': 1.0,
  'front-back': 1.6,
  'left-sleeve': 1.2,
  'right-sleeve': 1.2,
  'all-over': 2.5,
  'full': 1.5,
};

const AI_COMPLEXITY_PRICING = {
  0: 0,      // No AI
  1: 1,      // Very simple
  2: 2,
  3: 3,
  4: 4.5,
  5: 6,
  6: 8,
  7: 10,
  8: 13,
  9: 16,
  10: 20,    // Maximum complexity
};

const SHIPPING_RATES = {
  standard: 5.99,
  express: 12.99,
  overnight: 24.99,
};

const TAX_RATE = 0.08; // 8%

const calculatePrice = ({
  category,
  subcategory,
  material = 'standard',
  printArea = 'front',
  aiComplexityScore = 0,
  quantity = 1,
  shippingMethod = 'standard',
  customBasePrice = null,
}) => {
  // Get base price
  const categoryPrices = BASE_PRICES[category] || BASE_PRICES.artwork;
  const basePrice = customBasePrice || categoryPrices[subcategory] || categoryPrices[Object.keys(categoryPrices)[0]] || 20;

  // Apply modifiers
  const materialMod = MATERIAL_MODIFIERS[material] || 1.0;
  const printAreaMod = PRINT_AREA_MODIFIERS[printArea] || 1.0;
  const aiComplexityFee = AI_COMPLEXITY_PRICING[Math.min(Math.round(aiComplexityScore), 10)] || 0;

  // Calculate per-unit price
  const unitPrice = basePrice * materialMod * printAreaMod + aiComplexityFee;
  const subtotal = unitPrice * quantity;

  // Quantity discount
  let quantityDiscount = 0;
  if (quantity >= 10) quantityDiscount = 0.15;
  else if (quantity >= 5) quantityDiscount = 0.10;
  else if (quantity >= 3) quantityDiscount = 0.05;

  const discountedSubtotal = subtotal * (1 - quantityDiscount);
  const shipping = SHIPPING_RATES[shippingMethod] || SHIPPING_RATES.standard;
  const tax = discountedSubtotal * TAX_RATE;
  const total = discountedSubtotal + shipping + tax;

  return {
    basePrice: parseFloat(basePrice.toFixed(2)),
    materialModifier: materialMod,
    printAreaModifier: printAreaMod,
    aiComplexityFee: parseFloat(aiComplexityFee.toFixed(2)),
    unitPrice: parseFloat(unitPrice.toFixed(2)),
    quantity,
    subtotal: parseFloat(subtotal.toFixed(2)),
    quantityDiscount: parseFloat((subtotal * quantityDiscount).toFixed(2)),
    discountedSubtotal: parseFloat(discountedSubtotal.toFixed(2)),
    shipping: parseFloat(shipping.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
  };
};

const getAvailableOptions = () => ({
  basePrices: BASE_PRICES,
  materials: Object.keys(MATERIAL_MODIFIERS).map((key) => ({
    id: key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    modifier: MATERIAL_MODIFIERS[key],
  })),
  printAreas: Object.keys(PRINT_AREA_MODIFIERS).map((key) => ({
    id: key,
    label: key.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    modifier: PRINT_AREA_MODIFIERS[key],
  })),
  shippingMethods: Object.entries(SHIPPING_RATES).map(([key, rate]) => ({
    id: key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    price: rate,
  })),
  taxRate: TAX_RATE,
});

module.exports = { calculatePrice, getAvailableOptions };
