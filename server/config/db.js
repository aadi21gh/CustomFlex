const mongoose = require('mongoose');
const Product = require('../models/Product');

const seedProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count > 0) return;

    const defaultProducts = [
      {
        name: 'Premium Cotton T-Shirt',
        category: 'clothing',
        subcategory: 't-shirt',
        description: '100% combed ringspun cotton t-shirt with retail fit.',
        basePrice: 20,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'White', 'Navy'],
        materials: [
          { name: 'standard', priceModifier: 1.0 },
          { name: 'premium', priceModifier: 1.5 },
          { name: 'organic', priceModifier: 1.8 }
        ],
        printAreas: [
          { name: 'front', priceModifier: 1.0 },
          { name: 'back', priceModifier: 1.0 },
          { name: 'front-back', priceModifier: 1.6 }
        ]
      },
      {
        name: 'Cozy Fleece Hoodie',
        category: 'clothing',
        subcategory: 'hoodie',
        description: 'Soft fleece hoodie made with a cotton-poly blend.',
        basePrice: 40,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'Grey', 'Navy'],
        materials: [
          { name: 'standard', priceModifier: 1.0 },
          { name: 'premium', priceModifier: 1.5 },
          { name: 'luxury', priceModifier: 2.2 }
        ],
        printAreas: [
          { name: 'front', priceModifier: 1.0 },
          { name: 'back', priceModifier: 1.0 },
          { name: 'front-back', priceModifier: 1.6 }
        ]
      },
      {
        name: 'Classic Canvas Print',
        category: 'artwork',
        subcategory: 'canvas-print',
        description: 'Textured canvas print stretched over a wooden frame.',
        basePrice: 25,
        sizes: ['Standard'],
        colors: ['Default'],
        materials: [
          { name: 'standard', priceModifier: 1.0 },
          { name: 'premium', priceModifier: 1.5 }
        ],
        printAreas: [
          { name: 'front', priceModifier: 1.0 }
        ]
      },
      {
        name: 'High-Gloss Poster',
        category: 'artwork',
        subcategory: 'poster',
        description: 'Vibrant, high-resolution poster print on premium paper.',
        basePrice: 12,
        sizes: ['Standard'],
        colors: ['Default'],
        materials: [
          { name: 'standard', priceModifier: 1.0 },
          { name: 'premium', priceModifier: 1.5 }
        ],
        printAreas: [
          { name: 'front', priceModifier: 1.0 }
        ]
      },
      {
        name: 'Matte Phone Case',
        category: 'accessories',
        subcategory: 'phone-case',
        description: 'Sleek, double-layered phone case with matte finish.',
        basePrice: 18,
        sizes: ['iPhone 14', 'iPhone 15', 'Galaxy S23'],
        colors: ['Black', 'White', 'Clear'],
        materials: [
          { name: 'standard', priceModifier: 1.0 },
          { name: 'premium', priceModifier: 1.5 }
        ],
        printAreas: [
          { name: 'front', priceModifier: 1.0 }
        ]
      },
      {
        name: 'Ceramic Mug',
        category: 'accessories',
        subcategory: 'mug',
        description: 'Durable 11oz ceramic mug, dishwasher and microwave safe.',
        basePrice: 14,
        sizes: ['11oz', '15oz'],
        colors: ['White', 'Black'],
        materials: [
          { name: 'standard', priceModifier: 1.0 },
          { name: 'premium', priceModifier: 1.5 }
        ],
        printAreas: [
          { name: 'front', priceModifier: 1.0 }
        ]
      }
    ];

    await Product.insertMany(defaultProducts);
    console.log('🌱 Successfully seeded default products database!');
  } catch (error) {
    console.error('❌ Failed to seed default products:', error.message);
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
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
