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
  design = null,
}) => {
  // Get original base price
  const categoryPrices = BASE_PRICES[category] || BASE_PRICES.artwork;
  const originalBasePrice = customBasePrice || categoryPrices[subcategory] || categoryPrices[Object.keys(categoryPrices)[0]] || 20;
  let basePrice = originalBasePrice;

  // AI Dynamic Price Prediction factors
  let aiAnalysis = null;

  if (design) {
    let layers = [];
    if (design.canvasData && typeof design.canvasData === 'object') {
      layers = design.canvasData.objects || [];
    } else if (design.canvasData && typeof design.canvasData === 'string') {
      try {
        const parsed = JSON.parse(design.canvasData);
        layers = parsed.objects || [];
      } catch (e) {}
    }

    // Count layer types
    let vectorsCount = 0;
    let textCount = 0;
    let imageCount = 0;
    let shapesCount = 0;
    const colorsSet = new Set();

    layers.forEach(obj => {
      const type = obj.type || '';
      if (type === 'path') {
        vectorsCount++;
      } else if (type === 'text' || type === 'i-text' || type.includes('text')) {
        textCount++;
      } else if (type === 'image') {
        imageCount++;
      } else {
        shapesCount++;
      }

      // Track colors
      if (obj.fill && typeof obj.fill === 'string') {
        const fillLower = obj.fill.toLowerCase();
        if (fillLower !== 'transparent' && fillLower !== 'none' && !fillLower.includes('url')) {
          colorsSet.add(obj.fill);
        }
      }
      if (obj.stroke && typeof obj.stroke === 'string') {
        const strokeLower = obj.stroke.toLowerCase();
        if (strokeLower !== 'transparent' && strokeLower !== 'none') {
          colorsSet.add(obj.stroke);
        }
      }
    });

    const colorsCount = colorsSet.size || 1; // At least 1 color

    // Compute complexity percentage and dynamic modifiers
    let complexityModifier = 0.0;
    let insights = [];

    const totalElements = layers.length;
    if (totalElements === 0) {
      complexityModifier -= 0.15;
      insights.push('Blank canvas base rate adjustment (-15%)');
    } else if (totalElements <= 2) {
      complexityModifier -= 0.10;
      insights.push('Minimalist design layout discount (-10%)');
    } else if (totalElements > 12) {
      complexityModifier += 0.15;
      insights.push(`High-density layout processing (${totalElements} elements) (+15%)`);
    } else if (totalElements > 6) {
      complexityModifier += 0.08;
      insights.push(`Multi-layered layout setup (+8%)`);
    } else {
      insights.push('Standard layout complexity (Optimal print rate)');
    }

    // Color density modifier
    let colorModifier = 0.0;
    if (colorsCount === 1) {
      colorModifier -= 0.05;
      insights.push('Monochromatic color print discount (-5%)');
    } else if (colorsCount > 5) {
      colorModifier += 0.05;
      insights.push(`High color diversity print rate (${colorsCount} colors) (+5%)`);
    } else {
      insights.push('Standard color density (Eco-friendly CMYK ink usage)');
    }

    // Creator popularity modifier
    let popularityModifier = 0.0;
    const purchaseCount = design.purchaseCount || 0;
    if (purchaseCount > 20) {
      popularityModifier += 0.10;
      insights.push('Trending creator layout royalty (+10%)');
    } else if (purchaseCount > 5) {
      popularityModifier += 0.05;
      insights.push('Featured creator template royalty (+5%)');
    }

    // AI elements check
    if (design.aiElementsUsed) {
      insights.push('AI-generated design components detected');
    }

    // Apply modifiers to base price
    const totalModifier = complexityModifier + colorModifier + popularityModifier;
    basePrice = originalBasePrice * (1 + totalModifier);

    // Limit price change to be safe (min 75%, max 140% of original base price)
    const minPrice = originalBasePrice * 0.75;
    const maxPrice = originalBasePrice * 1.40;
    basePrice = Math.max(minPrice, Math.min(maxPrice, basePrice));

    // Calculate score values for UI (0 to 100)
    const complexityScore = Math.min(Math.round((totalElements / 15) * 100), 100);
    const inkDensityScore = Math.min(Math.round((colorsCount / 10) * 100), 100);
    const manufacturingLoadScore = Math.min(Math.round(((vectorsCount * 2 + textCount * 5 + imageCount * 15 + shapesCount * 3) / 40) * 100), 100);

    aiAnalysis = {
      layerCount: totalElements,
      vectorsCount,
      textCount,
      imageCount,
      shapesCount,
      colorsCount,
      insights,
      inkDensityScore,
      complexityScore,
      manufacturingLoadScore,
      originalBasePrice: parseFloat(originalBasePrice.toFixed(2)),
      aiPricePredictionApplied: true
    };
  }

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
    originalBasePrice: parseFloat(originalBasePrice.toFixed(2)),
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
    aiAnalysis,
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
