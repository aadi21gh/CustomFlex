import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Palette, Shirt, Watch, ArrowRight, Sparkles } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

const categories = [
  {
    id: 'artwork',
    icon: Palette,
    title: 'Artwork',
    description: 'Canvas prints, posters, framed art, digital prints, and more. Turn your creativity into wall-worthy masterpieces.',
    products: ['Canvas Print', 'Poster', 'Framed Art', 'Digital Download'],
    gradient: 'from-violet-600 to-purple-600',
    bgGlow: 'rgba(139,92,246,0.3)',
    emoji: '🎨',
    href: '/studio/artwork',
  },
  {
    id: 'clothing',
    icon: Shirt,
    title: 'Clothing',
    description: 'Custom t-shirts, hoodies, jackets, caps, and tote bags. Wear your design, literally.',
    products: ['T-Shirt', 'Hoodie', 'Jacket', 'Cap', 'Tote Bag'],
    gradient: 'from-blue-600 to-cyan-600',
    bgGlow: 'rgba(99,102,241,0.3)',
    emoji: '👕',
    href: '/studio/clothing',
  },
  {
    id: 'accessories',
    icon: Watch,
    title: 'Accessories',
    description: 'Phone cases, mugs, pillows, stickers, notebooks. Small items, big impact.',
    products: ['Phone Case', 'Mug', 'Pillow', 'Sticker', 'Notebook'],
    gradient: 'from-orange-600 to-pink-600',
    bgGlow: 'rgba(236,72,153,0.3)',
    emoji: '📱',
    href: '/studio/accessories',
  },
];

const CategorySelect = () => (
  <div className="min-h-screen mesh-bg">
    <Navbar />
    <div className="min-h-screen flex flex-col items-center justify-center section-container py-24">
      <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <span className="tag mb-4">Design Studio</span>
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
          What are you <span className="gradient-text">designing?</span>
        </h1>
        <p className="text-dark-400 text-lg max-w-lg mx-auto">
          Choose a product category to open the design studio and start creating your custom product.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 w-full max-w-5xl">
        {categories.map(({ id, icon: Icon, title, description, products, gradient, bgGlow, emoji, href }, i) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
          >
            <Link to={href} id={`category-${id}`} className="group block">
              <div className="glass-card p-7 h-full transition-all duration-400 group-hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)] group-hover:-translate-y-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-all duration-500" style={{ background: `linear-gradient(90deg, transparent, ${bgGlow}, transparent)` }} />

                {/* Emoji badge */}
                <div className="text-4xl mb-5">{emoji}</div>

                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`} style={{ boxShadow: `0 6px 20px ${bgGlow}` }}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
                <p className="text-dark-400 text-sm leading-relaxed mb-5">{description}</p>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {products.map((p) => (
                    <span key={p} className="text-xs px-2.5 py-1 rounded-full text-dark-400" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {p}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold text-brand-400 group-hover:gap-3 transition-all duration-200">
                  <Sparkles className="w-4 h-4" />
                  Open Studio
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

export default CategorySelect;
