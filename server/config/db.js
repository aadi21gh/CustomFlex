const mongoose = require('mongoose');
const Product = require('../models/Product');

/**
 * Full product catalog seed — INR pricing, 20+ products across 3 categories.
 * Only runs if the database has 0 products (idempotent on first boot).
 * To force a full re-seed, run: node server/utils/seedProducts.js
 */
const seedProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count > 0) return; // Already seeded

    const products = [

      /* ════════════════════════════════════════════════
         CLOTHING
      ════════════════════════════════════════════════ */
      {
        name: 'Classic Cotton T-Shirt',
        category: 'clothing',
        subcategory: 't-shirt',
        description: '180 GSM 100% combed ringspun cotton. Available in multiple colours, retail-fit cut.',
        emoji: '👕',
        basePrice: 399,
        designCharge: null,      // use engine default
        deliveryCharge: null,    // use engine default
        supportedMaterials: ['cotton', 'premium-cotton', 'organic-cotton', 'dry-fit', 'polyester'],
        defaultMaterial: 'cotton',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: ['White', 'Black', 'Navy', 'Grey', 'Red', 'Olive'],
        printAreas: [
          { name: 'front' }, { name: 'back' }, { name: 'front-back' },
          { name: 'left-sleeve' }, { name: 'right-sleeve' }, { name: 'all-over' },
        ],
        tags: ['classic', 'cotton', 'everyday'],
        featured: true,
        isActive: true,
      },
      {
        name: 'Cozy Fleece Hoodie',
        category: 'clothing',
        subcategory: 'hoodie',
        description: '320 GSM cotton-poly blend fleece hoodie. Double-lined hood, kangaroo pocket.',
        emoji: '🧥',
        basePrice: 799,
        supportedMaterials: ['cotton', 'premium-cotton', 'organic-cotton', 'oversized-cotton'],
        defaultMaterial: 'premium-cotton',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['Black', 'Charcoal', 'Navy', 'Cream', 'Forest Green'],
        printAreas: [
          { name: 'front' }, { name: 'back' }, { name: 'front-back' }, { name: 'all-over' },
        ],
        tags: ['hoodie', 'winter', 'fleece'],
        featured: true,
        isActive: true,
      },
      {
        name: 'Drop-Shoulder Sweatshirt',
        category: 'clothing',
        subcategory: 'sweatshirt',
        description: 'Oversized drop-shoulder fit in 280 GSM French terry. Ribbed cuffs and hem.',
        emoji: '🫏',
        basePrice: 649,
        supportedMaterials: ['cotton', 'premium-cotton', 'oversized-cotton'],
        defaultMaterial: 'cotton',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['Ash Grey', 'Black', 'Cream', 'Dusty Rose'],
        printAreas: [
          { name: 'front' }, { name: 'back' }, { name: 'front-back' },
        ],
        tags: ['sweatshirt', 'oversized', 'streetwear'],
        isActive: true,
      },
      {
        name: 'Bomber Jacket',
        category: 'clothing',
        subcategory: 'jacket',
        description: 'Lightweight satin bomber with knit cuffs and collar. Fully printable outer shell.',
        emoji: '🧣',
        basePrice: 1299,
        supportedMaterials: ['polyester', 'premium'],
        defaultMaterial: 'polyester',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'Olive', 'Navy'],
        printAreas: [
          { name: 'back' }, { name: 'front' }, { name: 'all-over' },
        ],
        tags: ['jacket', 'bomber', 'outerwear'],
        isActive: true,
      },
      {
        name: 'Oversized Drop Tee',
        category: 'clothing',
        subcategory: 'oversized-tee',
        description: '240 GSM heavyweight oversized tee. Boxy fit with dropped shoulders.',
        emoji: '🫱',
        basePrice: 499,
        supportedMaterials: ['cotton', 'oversized-cotton', 'premium-cotton'],
        defaultMaterial: 'oversized-cotton',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['White', 'Black', 'Beige', 'Washed Grey', 'Lavender'],
        printAreas: [
          { name: 'front' }, { name: 'back' }, { name: 'front-back' }, { name: 'all-over' },
        ],
        tags: ['oversized', 'boxy', 'streetwear'],
        featured: true,
        isActive: true,
      },
      {
        name: 'Performance Polo Shirt',
        category: 'clothing',
        subcategory: 'polo-shirt',
        description: 'Piqué polo with dry-fit finish. Ideal for corporate and sports customisation.',
        emoji: '👔',
        basePrice: 499,
        supportedMaterials: ['dry-fit', 'polyester', 'cotton'],
        defaultMaterial: 'dry-fit',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['White', 'Black', 'Navy', 'Royal Blue'],
        printAreas: [
          { name: 'front' }, { name: 'back' },
        ],
        tags: ['polo', 'corporate', 'sports'],
        isActive: true,
      },
      {
        name: 'Dri-Fit Jersey',
        category: 'clothing',
        subcategory: 'jersey',
        description: 'Breathable sublimation jersey for sports teams. Full all-over print support.',
        emoji: '⚽',
        basePrice: 599,
        supportedMaterials: ['dry-fit', 'polyester'],
        defaultMaterial: 'dry-fit',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: ['White', 'Black', 'Red', 'Blue', 'Yellow'],
        printAreas: [
          { name: 'front' }, { name: 'back' }, { name: 'all-over' },
        ],
        tags: ['jersey', 'sports', 'team'],
        isActive: true,
      },

      /* ════════════════════════════════════════════════
         ARTWORK
      ════════════════════════════════════════════════ */
      {
        name: 'Stretched Canvas Print',
        category: 'artwork',
        subcategory: 'canvas-print',
        description: 'Artist-grade cotton canvas stretched over a 18mm pine frame. Gallery-wrap edges.',
        emoji: '🖼️',
        basePrice: 899,
        designCharge: 149,
        supportedMaterials: ['canvas', 'matte-paper', 'glossy-paper'],
        defaultMaterial: 'canvas',
        sizes: ['8×10"', '12×16"', '16×20"', '20×24"', '24×36"'],
        printAreas: [{ name: 'standard' }],
        tags: ['canvas', 'wall-art', 'gallery'],
        featured: true,
        isActive: true,
      },
      {
        name: 'Premium Poster Print',
        category: 'artwork',
        subcategory: 'poster',
        description: 'Heavyweight 300 GSM matte or glossy poster. Vibrant colour reproduction.',
        emoji: '🖥️',
        basePrice: 299,
        designCharge: 99,
        supportedMaterials: ['matte-paper', 'glossy-paper'],
        defaultMaterial: 'matte-paper',
        sizes: ['A4', 'A3', 'A2', 'A1', '18×24"'],
        printAreas: [{ name: 'standard' }],
        tags: ['poster', 'print', 'décor'],
        featured: true,
        isActive: true,
      },
      {
        name: 'Acrylic Glass Print',
        category: 'artwork',
        subcategory: 'acrylic-print',
        description: 'Face-mounted 4mm acrylic with aluminium dibond backing. Ultra-vivid colours.',
        emoji: '🪟',
        basePrice: 1499,
        designCharge: 199,
        supportedMaterials: ['acrylic'],
        defaultMaterial: 'acrylic',
        sizes: ['8×10"', '12×16"', '16×20"', '20×24"'],
        printAreas: [{ name: 'standard' }],
        tags: ['acrylic', 'luxury', 'modern'],
        isActive: true,
      },
      {
        name: 'Wooden Frame Art',
        category: 'artwork',
        subcategory: 'wooden-frame',
        description: 'Birch wood panel with direct UV print. Rustic meets modern wall art.',
        emoji: '🪵',
        basePrice: 1199,
        designCharge: 179,
        supportedMaterials: ['wood'],
        defaultMaterial: 'wood',
        sizes: ['8×10"', '12×12"', '12×16"', '16×20"'],
        printAreas: [{ name: 'standard' }],
        tags: ['wood', 'rustic', 'wall-art'],
        isActive: true,
      },
      {
        name: 'Aluminum Metal Print',
        category: 'artwork',
        subcategory: 'metal-print',
        description: 'Dye-sublimation on brushed aluminum sheet. Float mount included.',
        emoji: '🔲',
        basePrice: 1699,
        designCharge: 199,
        supportedMaterials: ['metal'],
        defaultMaterial: 'metal',
        sizes: ['8×10"', '12×16"', '16×20"', '20×24"'],
        printAreas: [{ name: 'standard' }],
        tags: ['metal', 'modern', 'premium'],
        isActive: true,
      },
      {
        name: 'Custom Wall Art Decal',
        category: 'artwork',
        subcategory: 'wall-art',
        description: 'Removable vinyl wall decal. Leaves no residue. Perfect for rentals.',
        emoji: '🎨',
        basePrice: 999,
        designCharge: 149,
        supportedMaterials: ['matte-paper', 'glossy-paper'],
        defaultMaterial: 'matte-paper',
        sizes: ['Small (30×30cm)', 'Medium (60×60cm)', 'Large (90×90cm)'],
        printAreas: [{ name: 'standard' }],
        tags: ['decal', 'wall', 'removable'],
        isActive: true,
      },
      {
        name: 'Photo Frame Print',
        category: 'artwork',
        subcategory: 'photo-frame',
        description: 'Custom photo print with classic black border frame. Ready to hang.',
        emoji: '🖼',
        basePrice: 599,
        designCharge: 99,
        supportedMaterials: ['matte-paper', 'glossy-paper'],
        defaultMaterial: 'glossy-paper',
        sizes: ['4×6"', '5×7"', '8×10"', '11×14"'],
        printAreas: [{ name: 'standard' }],
        tags: ['photo', 'frame', 'gift'],
        isActive: true,
      },
      {
        name: 'Sticker Pack',
        category: 'artwork',
        subcategory: 'sticker-pack',
        description: 'Waterproof vinyl stickers with die-cut finish. Pack of 10 custom designs.',
        emoji: '📦',
        basePrice: 199,
        designCharge: 49,
        supportedMaterials: ['glossy-paper'],
        defaultMaterial: 'glossy-paper',
        sizes: ['Small (5cm)', 'Medium (8cm)', 'Large (12cm)'],
        printAreas: [{ name: 'standard' }],
        tags: ['sticker', 'vinyl', 'waterproof'],
        featured: true,
        isActive: true,
      },

      /* ════════════════════════════════════════════════
         ACCESSORIES
      ════════════════════════════════════════════════ */
      {
        name: 'Custom Sneakers',
        category: 'accessories',
        subcategory: 'sneakers',
        description: 'Low-top canvas sneakers with full upper print area. Vulcanised rubber sole.',
        emoji: '👟',
        basePrice: 1999,
        supportedMaterials: ['standard', 'premium'],
        defaultMaterial: 'standard',
        sizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11', 'UK 12'],
        colors: ['White', 'Black'],
        printAreas: [{ name: 'full' }],
        tags: ['sneakers', 'shoes', 'custom'],
        featured: true,
        isActive: true,
      },
      {
        name: 'Classic Snapback Cap',
        category: 'accessories',
        subcategory: 'cap',
        description: '6-panel structured cap with flat brim. Embroidery or print on front panel.',
        emoji: '🧢',
        basePrice: 399,
        supportedMaterials: ['cotton', 'polyester'],
        defaultMaterial: 'cotton',
        sizes: ['One Size'],
        colors: ['Black', 'White', 'Navy', 'Red', 'Olive'],
        printAreas: [{ name: 'front' }, { name: 'back' }],
        tags: ['cap', 'hat', 'streetwear'],
        isActive: true,
      },
      {
        name: 'Phone Case',
        category: 'accessories',
        subcategory: 'phone-case',
        description: 'Slim dual-layer polycarbonate case with full-wrap print. Shockproof corners.',
        emoji: '📱',
        basePrice: 349,
        supportedMaterials: ['hard-plastic', 'silicone'],
        defaultMaterial: 'hard-plastic',
        sizes: [
          'iPhone 13', 'iPhone 14', 'iPhone 14 Pro', 'iPhone 15', 'iPhone 15 Pro',
          'Galaxy S22', 'Galaxy S23', 'Galaxy S24',
          'Pixel 7', 'Pixel 8',
        ],
        printAreas: [{ name: 'full' }],
        tags: ['phone-case', 'tech', 'gift'],
        featured: true,
        isActive: true,
      },
      {
        name: 'Laptop Skin',
        category: 'accessories',
        subcategory: 'laptop-skin',
        description: 'Precision-cut vinyl skin for laptops. Bubble-free application, residue-free removal.',
        emoji: '💻',
        basePrice: 449,
        designCharge: 99,
        supportedMaterials: ['standard', 'premium'],
        defaultMaterial: 'standard',
        sizes: ['13"', '14"', '15"', '15.6"', '16"'],
        printAreas: [{ name: 'full' }],
        tags: ['laptop', 'skin', 'tech'],
        isActive: true,
      },
      {
        name: 'Tote Bag',
        category: 'accessories',
        subcategory: 'tote-bag',
        description: '14oz natural cotton tote with long handles. Eco-friendly and spacious.',
        emoji: '👜',
        basePrice: 399,
        supportedMaterials: ['cotton', 'organic-cotton'],
        defaultMaterial: 'cotton',
        sizes: ['Standard (38×42cm)', 'Large (42×48cm)'],
        colors: ['Natural', 'Black', 'Navy'],
        printAreas: [{ name: 'front' }, { name: 'back' }, { name: 'front-back' }],
        tags: ['tote', 'eco', 'bag'],
        isActive: true,
      },
      {
        name: 'Canvas Backpack',
        category: 'accessories',
        subcategory: 'backpack',
        description: '25L waxed canvas backpack. Custom print panel on the main compartment front.',
        emoji: '🎒',
        basePrice: 1299,
        supportedMaterials: ['canvas', 'standard'],
        defaultMaterial: 'canvas',
        sizes: ['One Size'],
        colors: ['Olive', 'Black', 'Khaki'],
        printAreas: [{ name: 'front' }],
        tags: ['backpack', 'travel', 'canvas'],
        isActive: true,
      },
      {
        name: 'Custom Chain',
        category: 'accessories',
        subcategory: 'chain',
        description: '316L stainless steel chain with custom pendant engraving. Hypoallergenic.',
        emoji: '⛓️',
        basePrice: 799,
        designCharge: 99,
        supportedMaterials: ['stainless-steel', 'premium'],
        defaultMaterial: 'stainless-steel',
        sizes: ['16"', '18"', '20"', '22"', '24"'],
        printAreas: [{ name: 'standard' }],
        tags: ['chain', 'jewelry', 'gift'],
        isActive: true,
      },
      {
        name: 'Engraved Ring',
        category: 'accessories',
        subcategory: 'ring',
        description: 'Stainless steel band ring with custom laser engraving on inner/outer surface.',
        emoji: '💍',
        basePrice: 599,
        designCharge: 79,
        supportedMaterials: ['stainless-steel'],
        defaultMaterial: 'stainless-steel',
        sizes: ['US 5', 'US 6', 'US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
        printAreas: [{ name: 'standard' }],
        tags: ['ring', 'jewelry', 'engraved'],
        isActive: true,
      },
      {
        name: 'Custom Bracelet',
        category: 'accessories',
        subcategory: 'bracelet',
        description: 'Adjustable leather or silicone bracelet with debossed custom design.',
        emoji: '📿',
        basePrice: 499,
        designCharge: 79,
        supportedMaterials: ['leather', 'silicone'],
        defaultMaterial: 'silicone',
        sizes: ['S (15cm)', 'M (18cm)', 'L (21cm)'],
        colors: ['Black', 'Brown', 'White'],
        printAreas: [{ name: 'standard' }],
        tags: ['bracelet', 'jewelry', 'wearable'],
        isActive: true,
      },
      {
        name: 'Smart Watch Strap',
        category: 'accessories',
        subcategory: 'watch',
        description: 'Fully custom-printed silicone watch strap. Compatible with all major smart watches.',
        emoji: '⌚',
        basePrice: 1499,
        designCharge: 149,
        supportedMaterials: ['leather', 'silicone'],
        defaultMaterial: 'silicone',
        sizes: ['38/40mm', '42/44mm', '45/49mm'],
        colors: ['Black', 'White', 'Brown'],
        printAreas: [{ name: 'full' }],
        tags: ['watch', 'strap', 'tech'],
        isActive: true,
      },
      {
        name: 'Polarised Sunglasses',
        category: 'accessories',
        subcategory: 'sunglasses',
        description: 'Custom temple printing on UV400 polarised sunglasses. Acetate frames.',
        emoji: '🕶️',
        basePrice: 699,
        designCharge: 99,
        supportedMaterials: ['standard', 'premium'],
        defaultMaterial: 'standard',
        sizes: ['One Size'],
        colors: ['Black', 'Tortoise', 'Clear'],
        printAreas: [{ name: 'standard' }],
        tags: ['sunglasses', 'eyewear', 'fashion'],
        isActive: true,
      },
    ];

    await Product.insertMany(products);
    console.log(`🌱 Seeded ${products.length} products across Clothing, Artwork & Accessories!`);
  } catch (error) {
    console.error('❌ Product seed failed:', error.message);
  }
};

const seedCommunityData = async () => {
  try {
    const User = require('../models/User');
    const Design = require('../models/Design');
    const Order = require('../models/Order');
    const Post = require('../models/Post');
    const Comment = require('../models/Comment');
    const Refund = require('../models/Refund');
    const Product = require('../models/Product');

    const userCount = await User.countDocuments();
    if (userCount > 1) return; // Already seeded community data or has other users

    console.log('🌱 Seeding community data...');

    // 1. Create Users
    const usersData = [
      { name: 'Sarah Chen', email: 'sarah@customflex.com', password: 'password123', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', role: 'user', isEmailVerified: true },
      { name: 'Marcus Rivera', email: 'marcus@customflex.com', password: 'password123', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', role: 'user', isEmailVerified: true },
      { name: 'Aisha Patel', email: 'aisha@customflex.com', password: 'password123', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', role: 'user', isEmailVerified: true },
      { name: 'James Wu', email: 'james@customflex.com', password: 'password123', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', role: 'user', isEmailVerified: true },
      { name: 'Elena Rostova', email: 'elena@customflex.com', password: 'password123', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', role: 'user', isEmailVerified: true }
    ];

    const users = [];
    for (const u of usersData) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        user = await User.create(u);
      }
      users.push(user);
    }

    // 2. Fetch Products
    const tShirtProduct = await Product.findOne({ subcategory: 't-shirt' });
    const hoodieProduct = await Product.findOne({ subcategory: 'hoodie' });
    const canvasProduct = await Product.findOne({ subcategory: 'canvas-print' });

    if (!tShirtProduct || !hoodieProduct || !canvasProduct) {
      console.log('⚠️ Required products for seeding community data not found. Skipping.');
      return;
    }

    // 3. Create Designs
    const designsData = [
      { title: 'Cyberpunk Sunset', category: 'clothing', canvasData: { objects: [] }, thumbnail: { url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400' }, user: users[0]._id, isPublic: true, isDraft: false, purchaseCount: 12 },
      { title: 'Aesthetic Line Art', category: 'clothing', canvasData: { objects: [] }, thumbnail: { url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400' }, user: users[1]._id, isPublic: true, isDraft: false, purchaseCount: 8 },
      { title: 'Neon Dreamscape', category: 'artwork', canvasData: { objects: [] }, thumbnail: { url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400' }, user: users[2]._id, isPublic: true, isDraft: false, purchaseCount: 15 },
      { title: 'Retro Vaporwave', category: 'clothing', canvasData: { objects: [] }, thumbnail: { url: 'https://images.unsplash.com/photo-1515260268569-9271009adfdb?w=400' }, user: users[3]._id, isPublic: true, isDraft: false, purchaseCount: 4 },
      { title: 'Minimalist Mountain', category: 'artwork', canvasData: { objects: [] }, thumbnail: { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400' }, user: users[4]._id, isPublic: true, isDraft: false, purchaseCount: 9 },
    ];

    const designs = await Design.insertMany(designsData);

    // 4. Create Orders
    const ordersData = [
      {
        user: users[0]._id, design: designs[0]._id, product: hoodieProduct._id, quantity: 1, selectedMaterial: 'premium-cotton', selectedSize: 'L', selectedColor: 'Black',
        pricing: { basePrice: 799, subtotal: 799, total: 899 }, isPaid: true, paidAt: new Date(Date.now() - 5*24*60*60*1000), status: 'refunded', refundEligible: true,
        shippingAddress: { fullName: 'Sarah Chen', address: '123 Tech Lane', city: 'Mumbai', state: 'MH', postalCode: '400001', country: 'India' }
      },
      {
        user: users[1]._id, design: designs[1]._id, product: tShirtProduct._id, quantity: 1, selectedMaterial: 'cotton', selectedSize: 'M', selectedColor: 'White',
        pricing: { basePrice: 399, subtotal: 399, total: 499 }, isPaid: true, paidAt: new Date(Date.now() - 4*24*60*60*1000), status: 'refunded', refundEligible: true,
        shippingAddress: { fullName: 'Marcus Rivera', address: '456 Art Way', city: 'Delhi', state: 'DL', postalCode: '110001', country: 'India' }
      },
      {
        user: users[2]._id, design: designs[2]._id, product: canvasProduct._id, quantity: 1, selectedMaterial: 'canvas', selectedSize: '12×16"', selectedColor: 'Standard',
        pricing: { basePrice: 899, subtotal: 899, total: 999 }, isPaid: true, paidAt: new Date(Date.now() - 3*24*60*60*1000), status: 'refunded', refundEligible: true,
        shippingAddress: { fullName: 'Aisha Patel', address: '789 Design Blvd', city: 'Bangalore', state: 'KA', postalCode: '560001', country: 'India' }
      },
      {
        user: users[3]._id, design: designs[3]._id, product: tShirtProduct._id, quantity: 1, selectedMaterial: 'cotton', selectedSize: 'XL', selectedColor: 'Black',
        pricing: { basePrice: 399, subtotal: 399, total: 499 }, isPaid: true, paidAt: new Date(Date.now() - 2*24*60*60*1000), status: 'paid', refundEligible: false,
        shippingAddress: { fullName: 'James Wu', address: '101 Code Ave', city: 'Pune', state: 'MH', postalCode: '411001', country: 'India' }
      },
      {
        user: users[4]._id, design: designs[4]._id, product: canvasProduct._id, quantity: 1, selectedMaterial: 'canvas', selectedSize: '16×20"', selectedColor: 'Standard',
        pricing: { basePrice: 899, subtotal: 899, total: 999 }, isPaid: true, paidAt: new Date(Date.now() - 1*24*60*60*1000), status: 'paid', refundEligible: false,
        shippingAddress: { fullName: 'Elena Rostova', address: '202 Moscow St', city: 'Kolkata', state: 'WB', postalCode: '700001', country: 'India' }
      }
    ];

    const orders = [];
    for (const o of ordersData) {
      const order = await Order.create(o);
      orders.push(order);
    }

    // 5. Create Posts
    const postsData = [
      { user: users[0]._id, order: orders[0]._id, design: designs[0]._id, images: [{ url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600' }], caption: 'Designed this sweet Cyberpunk Hoodie on CustomFlex! Super comfy and the printing is high quality. Let me know what you think!', category: 'clothing', likesCount: 847, commentsCount: 12, isPublic: true, isFeatured: true },
      { user: users[1]._id, order: orders[1]._id, design: designs[1]._id, images: [{ url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600' }], caption: 'Just received my custom Line Art Tee! Simple but premium. High quality combed ringspun cotton.', category: 'clothing', likesCount: 520, commentsCount: 5, isPublic: true, isFeatured: true },
      { user: users[2]._id, order: orders[2]._id, design: designs[2]._id, images: [{ url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600' }], caption: 'My new Stretched Canvas Print looks stunning on the bedroom wall! Turned my design into real gallery art.', category: 'artwork', likesCount: 310, commentsCount: 8, isPublic: true, isFeatured: true },
      { user: users[3]._id, order: orders[3]._id, design: designs[3]._id, images: [{ url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600' }], caption: 'Retro Vaporwave vibes for this custom tee. The colors are incredibly vibrant.', category: 'clothing', likesCount: 145, commentsCount: 3, isPublic: true, isFeatured: false },
      { user: users[4]._id, order: orders[4]._id, design: designs[4]._id, images: [{ url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600' }], caption: 'My custom wall print is finally here. Minimalist mountains.', category: 'artwork', likesCount: 95, commentsCount: 4, isPublic: true, isFeatured: false },
    ];

    const posts = await Post.insertMany(postsData);

    // 6. Create Comments
    const commentsData = [
      { user: users[0]._id, post: posts[0]._id, text: 'CustomFlex is insane. I designed a hoodie, shared it, got 500 likes and got my money back in a week. This is the future!' },
      { user: users[1]._id, post: posts[0]._id, text: 'The design studio is on par with Figma for product design. The canvas tools saved me hours of work.' },
      { user: users[2]._id, post: posts[0]._id, text: 'I love how my designs can earn me rewards. It gamifies creativity in the most addictive way.' },
      { user: users[3]._id, post: posts[0]._id, text: 'Best custom product platform I\'ve used. The UI is stunning and everything just works smoothly.' },
      { user: users[4]._id, post: posts[0]._id, text: 'The canvas editor is so smooth. Adding shapes and text is super simple. 10/10 recommend!' }
    ];

    await Comment.insertMany(commentsData);

    // 7. Create Refunds (Rewards)
    const refundsData = [
      { order: orders[0]._id, user: users[0]._id, post: posts[0]._id, design: designs[0]._id, amount: 899, status: 'processed', eligibilityReason: { likesCount: 847, requiredLikes: 750, uniquePurchasers: 3, requiredPurchasers: 2 }, processedAt: new Date(Date.now() - 2*60*60*1000) },
      { order: orders[1]._id, user: users[1]._id, post: posts[1]._id, design: designs[1]._id, amount: 499, status: 'processed', eligibilityReason: { likesCount: 520, requiredLikes: 500, uniquePurchasers: 2, requiredPurchasers: 2 }, processedAt: new Date(Date.now() - 5*60*60*1000) },
      { order: orders[2]._id, user: users[2]._id, post: posts[2]._id, design: designs[2]._id, amount: 999, status: 'processed', eligibilityReason: { likesCount: 310, requiredLikes: 300, uniquePurchasers: 2, requiredPurchasers: 2 }, processedAt: new Date(Date.now() - 24*60*60*1000) }
    ];

    await Refund.insertMany(refundsData);
    console.log('🌱 Seeded users, posts, comments, orders, and refunds for a fully populated dynamic community feed!');

  } catch (error) {
    console.error('❌ Community seeding failed:', error.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    await seedProducts();
    await seedCommunityData();
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
