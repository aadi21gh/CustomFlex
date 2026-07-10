/**
 * Standalone re-seed script for CustomFlex products.
 * Wipes existing products and inserts the full catalog fresh.
 *
 * Usage:
 *   cd server
 *   node utils/seedProducts.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

const products = [

  /* ════════════════ CLOTHING (7) ════════════════ */
  {
    name: 'Classic Cotton T-Shirt', category: 'clothing', subcategory: 't-shirt',
    description: '180 GSM 100% combed ringspun cotton. Retail-fit cut. Available in 6 colours.',
    emoji: '👕', basePrice: 399, featured: true, isActive: true,
    supportedMaterials: ['cotton', 'premium-cotton', 'organic-cotton', 'dry-fit', 'polyester'],
    defaultMaterial: 'cotton', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Black', 'Navy', 'Grey', 'Red', 'Olive'],
    printAreas: [{ name: 'front' }, { name: 'back' }, { name: 'front-back' }, { name: 'left-sleeve' }, { name: 'right-sleeve' }, { name: 'all-over' }],
    tags: ['classic', 'cotton', 'everyday'],
  },
  {
    name: 'Cozy Fleece Hoodie', category: 'clothing', subcategory: 'hoodie',
    description: '320 GSM cotton-poly fleece. Double-lined hood, kangaroo pocket, ribbed cuffs.',
    emoji: '🧥', basePrice: 799, featured: true, isActive: true,
    supportedMaterials: ['cotton', 'premium-cotton', 'organic-cotton', 'oversized-cotton'],
    defaultMaterial: 'premium-cotton', sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Charcoal', 'Navy', 'Cream', 'Forest Green'],
    printAreas: [{ name: 'front' }, { name: 'back' }, { name: 'front-back' }, { name: 'all-over' }],
    tags: ['hoodie', 'winter', 'fleece'],
  },
  {
    name: 'Drop-Shoulder Sweatshirt', category: 'clothing', subcategory: 'sweatshirt',
    description: 'Oversized drop-shoulder 280 GSM French terry. Ribbed cuffs and hem.',
    emoji: '🌀', basePrice: 649, isActive: true,
    supportedMaterials: ['cotton', 'premium-cotton', 'oversized-cotton'],
    defaultMaterial: 'cotton', sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Ash Grey', 'Black', 'Cream', 'Dusty Rose'],
    printAreas: [{ name: 'front' }, { name: 'back' }, { name: 'front-back' }],
    tags: ['sweatshirt', 'oversized', 'streetwear'],
  },
  {
    name: 'Bomber Jacket', category: 'clothing', subcategory: 'jacket',
    description: 'Lightweight satin bomber with knit cuffs and collar. Fully printable outer shell.',
    emoji: '🧣', basePrice: 1299, isActive: true,
    supportedMaterials: ['polyester', 'premium'],
    defaultMaterial: 'polyester', sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Olive', 'Navy'],
    printAreas: [{ name: 'back' }, { name: 'front' }, { name: 'all-over' }],
    tags: ['jacket', 'bomber', 'outerwear'],
  },
  {
    name: 'Oversized Drop Tee', category: 'clothing', subcategory: 'oversized-tee',
    description: '240 GSM heavyweight oversized tee. Boxy fit with dropped shoulders.',
    emoji: '🫱', basePrice: 499, featured: true, isActive: true,
    supportedMaterials: ['cotton', 'oversized-cotton', 'premium-cotton'],
    defaultMaterial: 'oversized-cotton', sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Black', 'Beige', 'Washed Grey', 'Lavender'],
    printAreas: [{ name: 'front' }, { name: 'back' }, { name: 'front-back' }, { name: 'all-over' }],
    tags: ['oversized', 'boxy', 'streetwear'],
  },
  {
    name: 'Performance Polo Shirt', category: 'clothing', subcategory: 'polo-shirt',
    description: 'Piqué polo with dry-fit finish. Ideal for corporate and sports customisation.',
    emoji: '👔', basePrice: 499, isActive: true,
    supportedMaterials: ['dry-fit', 'polyester', 'cotton'],
    defaultMaterial: 'dry-fit', sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Black', 'Navy', 'Royal Blue'],
    printAreas: [{ name: 'front' }, { name: 'back' }],
    tags: ['polo', 'corporate', 'sports'],
  },
  {
    name: 'Dri-Fit Jersey', category: 'clothing', subcategory: 'jersey',
    description: 'Breathable sublimation jersey for sports teams. Full all-over print support.',
    emoji: '⚽', basePrice: 599, isActive: true,
    supportedMaterials: ['dry-fit', 'polyester'],
    defaultMaterial: 'dry-fit', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Black', 'Red', 'Blue', 'Yellow'],
    printAreas: [{ name: 'front' }, { name: 'back' }, { name: 'all-over' }],
    tags: ['jersey', 'sports', 'team'],
  },

  /* ════════════════ ARTWORK (8) ════════════════ */
  {
    name: 'Stretched Canvas Print', category: 'artwork', subcategory: 'canvas-print',
    description: 'Artist-grade cotton canvas on 18mm pine frame. Gallery-wrap edges.',
    emoji: '🖼️', basePrice: 899, designCharge: 149, featured: true, isActive: true,
    supportedMaterials: ['canvas', 'matte-paper', 'glossy-paper'],
    defaultMaterial: 'canvas', sizes: ['8×10"', '12×16"', '16×20"', '20×24"', '24×36"'],
    printAreas: [{ name: 'standard' }], tags: ['canvas', 'wall-art', 'gallery'],
  },
  {
    name: 'Premium Poster Print', category: 'artwork', subcategory: 'poster',
    description: 'Heavyweight 300 GSM matte or glossy poster. Vibrant colour reproduction.',
    emoji: '🖥️', basePrice: 299, designCharge: 99, featured: true, isActive: true,
    supportedMaterials: ['matte-paper', 'glossy-paper'],
    defaultMaterial: 'matte-paper', sizes: ['A4', 'A3', 'A2', 'A1', '18×24"'],
    printAreas: [{ name: 'standard' }], tags: ['poster', 'print', 'décor'],
  },
  {
    name: 'Acrylic Glass Print', category: 'artwork', subcategory: 'acrylic-print',
    description: 'Face-mounted 4mm acrylic with aluminium dibond backing. Ultra-vivid.',
    emoji: '🪟', basePrice: 1499, designCharge: 199, isActive: true,
    supportedMaterials: ['acrylic'],
    defaultMaterial: 'acrylic', sizes: ['8×10"', '12×16"', '16×20"', '20×24"'],
    printAreas: [{ name: 'standard' }], tags: ['acrylic', 'luxury', 'modern'],
  },
  {
    name: 'Wooden Frame Art', category: 'artwork', subcategory: 'wooden-frame',
    description: 'Birch wood panel with direct UV print. Rustic meets modern.',
    emoji: '🪵', basePrice: 1199, designCharge: 179, isActive: true,
    supportedMaterials: ['wood'],
    defaultMaterial: 'wood', sizes: ['8×10"', '12×12"', '12×16"', '16×20"'],
    printAreas: [{ name: 'standard' }], tags: ['wood', 'rustic', 'wall-art'],
  },
  {
    name: 'Aluminum Metal Print', category: 'artwork', subcategory: 'metal-print',
    description: 'Dye-sublimation on brushed aluminum. Float mount included.',
    emoji: '🔲', basePrice: 1699, designCharge: 199, isActive: true,
    supportedMaterials: ['metal'],
    defaultMaterial: 'metal', sizes: ['8×10"', '12×16"', '16×20"', '20×24"'],
    printAreas: [{ name: 'standard' }], tags: ['metal', 'modern', 'premium'],
  },
  {
    name: 'Wall Art Decal', category: 'artwork', subcategory: 'wall-art',
    description: 'Removable vinyl wall decal. No residue. Perfect for rentals.',
    emoji: '🎨', basePrice: 999, designCharge: 149, isActive: true,
    supportedMaterials: ['matte-paper', 'glossy-paper'],
    defaultMaterial: 'matte-paper',
    sizes: ['Small (30×30cm)', 'Medium (60×60cm)', 'Large (90×90cm)'],
    printAreas: [{ name: 'standard' }], tags: ['decal', 'wall', 'removable'],
  },
  {
    name: 'Photo Frame Print', category: 'artwork', subcategory: 'photo-frame',
    description: 'Custom photo print with classic black border frame. Ready to hang.',
    emoji: '🖼', basePrice: 599, designCharge: 99, isActive: true,
    supportedMaterials: ['matte-paper', 'glossy-paper'],
    defaultMaterial: 'glossy-paper', sizes: ['4×6"', '5×7"', '8×10"', '11×14"'],
    printAreas: [{ name: 'standard' }], tags: ['photo', 'frame', 'gift'],
  },
  {
    name: 'Sticker Pack', category: 'artwork', subcategory: 'sticker-pack',
    description: 'Waterproof vinyl stickers with die-cut finish. Pack of 10 custom designs.',
    emoji: '📦', basePrice: 199, designCharge: 49, featured: true, isActive: true,
    supportedMaterials: ['glossy-paper'],
    defaultMaterial: 'glossy-paper',
    sizes: ['Small (5cm)', 'Medium (8cm)', 'Large (12cm)'],
    printAreas: [{ name: 'standard' }], tags: ['sticker', 'vinyl', 'waterproof'],
  },

  /* ════════════════ ACCESSORIES (11) ════════════════ */
  {
    name: 'Custom Sneakers', category: 'accessories', subcategory: 'sneakers',
    description: 'Low-top canvas sneakers with full upper print. Vulcanised rubber sole.',
    emoji: '👟', basePrice: 1999, featured: true, isActive: true,
    supportedMaterials: ['standard', 'premium'],
    defaultMaterial: 'standard',
    sizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11', 'UK 12'],
    colors: ['White', 'Black'],
    printAreas: [{ name: 'full' }], tags: ['sneakers', 'shoes', 'custom'],
  },
  {
    name: 'Snapback Cap', category: 'accessories', subcategory: 'cap',
    description: '6-panel structured cap with flat brim. Embroidery or print on front panel.',
    emoji: '🧢', basePrice: 399, isActive: true,
    supportedMaterials: ['cotton', 'polyester'],
    defaultMaterial: 'cotton', sizes: ['One Size'],
    colors: ['Black', 'White', 'Navy', 'Red', 'Olive'],
    printAreas: [{ name: 'front' }, { name: 'back' }],
    tags: ['cap', 'hat', 'streetwear'],
  },
  {
    name: 'Phone Case', category: 'accessories', subcategory: 'phone-case',
    description: 'Slim dual-layer polycarbonate case with full-wrap print. Shockproof corners.',
    emoji: '📱', basePrice: 349, featured: true, isActive: true,
    supportedMaterials: ['hard-plastic', 'silicone'],
    defaultMaterial: 'hard-plastic',
    sizes: ['iPhone 13', 'iPhone 14', 'iPhone 14 Pro', 'iPhone 15', 'iPhone 15 Pro', 'Galaxy S22', 'Galaxy S23', 'Galaxy S24', 'Pixel 7', 'Pixel 8'],
    printAreas: [{ name: 'full' }], tags: ['phone-case', 'tech', 'gift'],
  },
  {
    name: 'Laptop Skin', category: 'accessories', subcategory: 'laptop-skin',
    description: 'Precision-cut vinyl skin. Bubble-free application, residue-free removal.',
    emoji: '💻', basePrice: 449, designCharge: 99, isActive: true,
    supportedMaterials: ['standard', 'premium'],
    defaultMaterial: 'standard', sizes: ['13"', '14"', '15"', '15.6"', '16"'],
    printAreas: [{ name: 'full' }], tags: ['laptop', 'skin', 'tech'],
  },
  {
    name: 'Tote Bag', category: 'accessories', subcategory: 'tote-bag',
    description: '14oz natural cotton tote with long handles. Eco-friendly and spacious.',
    emoji: '👜', basePrice: 399, isActive: true,
    supportedMaterials: ['cotton', 'organic-cotton'],
    defaultMaterial: 'cotton',
    sizes: ['Standard (38×42cm)', 'Large (42×48cm)'],
    colors: ['Natural', 'Black', 'Navy'],
    printAreas: [{ name: 'front' }, { name: 'back' }, { name: 'front-back' }],
    tags: ['tote', 'eco', 'bag'],
  },
  {
    name: 'Canvas Backpack', category: 'accessories', subcategory: 'backpack',
    description: '25L waxed canvas backpack. Custom print panel on main compartment front.',
    emoji: '🎒', basePrice: 1299, isActive: true,
    supportedMaterials: ['canvas', 'standard'],
    defaultMaterial: 'canvas', sizes: ['One Size'],
    colors: ['Olive', 'Black', 'Khaki'],
    printAreas: [{ name: 'front' }], tags: ['backpack', 'travel', 'canvas'],
  },
  {
    name: 'Custom Chain', category: 'accessories', subcategory: 'chain',
    description: '316L stainless steel chain with custom pendant engraving. Hypoallergenic.',
    emoji: '⛓️', basePrice: 799, designCharge: 99, isActive: true,
    supportedMaterials: ['stainless-steel', 'premium'],
    defaultMaterial: 'stainless-steel',
    sizes: ['16"', '18"', '20"', '22"', '24"'],
    printAreas: [{ name: 'standard' }], tags: ['chain', 'jewelry', 'gift'],
  },
  {
    name: 'Engraved Ring', category: 'accessories', subcategory: 'ring',
    description: 'Stainless steel band ring with custom laser engraving on inner/outer surface.',
    emoji: '💍', basePrice: 599, designCharge: 79, isActive: true,
    supportedMaterials: ['stainless-steel'],
    defaultMaterial: 'stainless-steel',
    sizes: ['US 5', 'US 6', 'US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
    printAreas: [{ name: 'standard' }], tags: ['ring', 'jewelry', 'engraved'],
  },
  {
    name: 'Custom Bracelet', category: 'accessories', subcategory: 'bracelet',
    description: 'Adjustable leather or silicone bracelet with debossed custom design.',
    emoji: '📿', basePrice: 499, designCharge: 79, isActive: true,
    supportedMaterials: ['leather', 'silicone'],
    defaultMaterial: 'silicone',
    sizes: ['S (15cm)', 'M (18cm)', 'L (21cm)'],
    colors: ['Black', 'Brown', 'White'],
    printAreas: [{ name: 'standard' }], tags: ['bracelet', 'jewelry', 'wearable'],
  },
  {
    name: 'Smart Watch Strap', category: 'accessories', subcategory: 'watch',
    description: 'Fully custom-printed silicone/leather strap. Fits all major smart watches.',
    emoji: '⌚', basePrice: 1499, designCharge: 149, isActive: true,
    supportedMaterials: ['leather', 'silicone'],
    defaultMaterial: 'silicone',
    sizes: ['38/40mm', '42/44mm', '45/49mm'],
    colors: ['Black', 'White', 'Brown'],
    printAreas: [{ name: 'full' }], tags: ['watch', 'strap', 'tech'],
  },
  {
    name: 'Polarised Sunglasses', category: 'accessories', subcategory: 'sunglasses',
    description: 'UV400 polarised lenses with custom-printed acetate temples.',
    emoji: '🕶️', basePrice: 699, designCharge: 99, isActive: true,
    supportedMaterials: ['standard', 'premium'],
    defaultMaterial: 'standard', sizes: ['One Size'],
    colors: ['Black', 'Tortoise', 'Clear'],
    printAreas: [{ name: 'standard' }], tags: ['sunglasses', 'eyewear', 'fashion'],
  },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('🔌 Connected to MongoDB');

  await Product.deleteMany({});
  console.log('🗑️  Cleared existing products');

  await Product.insertMany(products);
  console.log(`✅ Seeded ${products.length} products successfully!\n`);

  const counts = {
    clothing:    products.filter(p => p.category === 'clothing').length,
    artwork:     products.filter(p => p.category === 'artwork').length,
    accessories: products.filter(p => p.category === 'accessories').length,
  };
  console.log(`   👕 Clothing:    ${counts.clothing}`);
  console.log(`   🎨 Artwork:     ${counts.artwork}`);
  console.log(`   📱 Accessories: ${counts.accessories}`);

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
