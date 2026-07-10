import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ChevronRight, Tag } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

/* ─── Full Product Catalog (mirrors backend) ────────────────────────────────── */
const CATEGORIES = [
  {
    id: 'clothing',
    emoji: '👕',
    title: 'Clothing',
    tagline: 'Wear your design',
    description: 'Custom t-shirts, hoodies, sweatshirts, jackets and more. Wear your creativity literally.',
    gradient: 'from-blue-600 to-cyan-500',
    accentColor: '#06b6d4',
    glowColor: 'rgba(6,182,212,0.25)',
    href: '/studio/clothing',
    products: [
      { emoji: '👕', name: 'T-Shirt',        from: '₹399',  tag: 'Bestseller' },
      { emoji: '🧥', name: 'Hoodie',          from: '₹799',  tag: 'Trending' },
      { emoji: '🌀', name: 'Sweatshirt',      from: '₹649',  tag: 'Popular' },
      { emoji: '🧣', name: 'Bomber Jacket',   from: '₹1,299',tag: 'Premium' },
      { emoji: '🫱', name: 'Oversized Tee',   from: '₹499',  tag: 'Hot' },
      { emoji: '👔', name: 'Polo Shirt',      from: '₹499',  tag: 'New' },
      { emoji: '⚽', name: 'Jersey',          from: '₹599',  tag: 'Sports' },
    ],
  },
  {
    id: 'artwork',
    emoji: '🎨',
    title: 'Artwork',
    tagline: 'Hang your vision',
    description: 'Canvas prints, posters, acrylic prints, wood frames & more. Turn creativity into wall-worthy masterpieces.',
    gradient: 'from-violet-600 to-purple-500',
    accentColor: '#8b5cf6',
    glowColor: 'rgba(139,92,246,0.25)',
    href: '/studio/artwork',
    products: [
      { emoji: '🖼️', name: 'Canvas Print',   from: '₹899',  tag: 'Gallery' },
      { emoji: '🖥️', name: 'Poster',         from: '₹299',  tag: 'Affordable' },
      { emoji: '🪟', name: 'Acrylic Print',  from: '₹1,499',tag: 'Premium' },
      { emoji: '🪵', name: 'Wooden Frame',   from: '₹1,199',tag: 'Rustic' },
      { emoji: '🔲', name: 'Metal Print',    from: '₹1,699',tag: 'Modern' },
      { emoji: '🎨', name: 'Wall Decal',     from: '₹999',  tag: 'Removable' },
      { emoji: '🖼',  name: 'Photo Frame',   from: '₹599',  tag: 'Gift' },
      { emoji: '📦', name: 'Sticker Pack',   from: '₹199',  tag: 'Viral' },
    ],
  },
  {
    id: 'accessories',
    emoji: '📱',
    title: 'Accessories',
    tagline: 'Carry your style',
    description: 'Sneakers, phone cases, watches, jewelry & bags. Small items, massive impact.',
    gradient: 'from-orange-600 to-pink-500',
    accentColor: '#ec4899',
    glowColor: 'rgba(236,72,153,0.25)',
    href: '/studio/accessories',
    products: [
      { emoji: '👟', name: 'Sneakers',        from: '₹1,999',tag: 'Exclusive' },
      { emoji: '📱', name: 'Phone Case',      from: '₹349',  tag: 'Bestseller' },
      { emoji: '💻', name: 'Laptop Skin',     from: '₹449',  tag: 'Tech' },
      { emoji: '👜', name: 'Tote Bag',        from: '₹399',  tag: 'Eco' },
      { emoji: '🎒', name: 'Backpack',        from: '₹1,299',tag: 'Travel' },
      { emoji: '🧢', name: 'Cap',             from: '₹399',  tag: 'Street' },
      { emoji: '💍', name: 'Ring',            from: '₹599',  tag: 'Jewelry' },
      { emoji: '⛓️', name: 'Chain',           from: '₹799',  tag: 'Bold' },
      { emoji: '📿', name: 'Bracelet',        from: '₹499',  tag: 'Wearable' },
      { emoji: '⌚', name: 'Watch Strap',     from: '₹1,499',tag: 'Premium' },
      { emoji: '🕶️', name: 'Sunglasses',     from: '₹699',  tag: 'Fashion' },
    ],
  },
];

/* ─── Category Card ─────────────────────────────────────────────────────────── */
const CategoryCard = ({ cat, index, isSelected, onSelect }) => {
  const { emoji, title, tagline, description, gradient, accentColor, glowColor, products } = cat;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div
        className={`group relative rounded-3xl cursor-pointer transition-all duration-400 overflow-hidden ${
          isSelected ? 'ring-2' : ''
        }`}
        style={{
          background: isSelected
            ? `linear-gradient(145deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)`
            : `linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)`,
          border: isSelected ? `1px solid ${accentColor}60` : '1px solid rgba(255,255,255,0.08)',
          boxShadow: isSelected
            ? `0 20px 60px rgba(0,0,0,0.4), 0 0 40px ${glowColor}`
            : '0 8px 32px rgba(0,0,0,0.2)',
          ringColor: accentColor,
        }}
        onClick={() => onSelect(cat.id)}
      >
        {/* Top gradient bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} transition-opacity duration-300 ${
            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
          }`}
        />

        {/* Glow orb */}
        <div
          className={`absolute -top-12 -right-12 w-40 h-40 rounded-full transition-opacity duration-500 pointer-events-none ${
            isSelected ? 'opacity-30' : 'opacity-0 group-hover:opacity-20'
          }`}
          style={{ background: `radial-gradient(circle, ${accentColor}, transparent 70%)` }}
        />

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-4xl mb-2">{emoji}</div>
              <h2 className="text-xl font-black text-white">{title}</h2>
              <p className="text-xs font-semibold uppercase tracking-wider mt-0.5" style={{ color: accentColor }}>
                {tagline}
              </p>
            </div>
            <motion.div
              animate={{ rotate: isSelected ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-5 h-5 text-dark-500 group-hover:text-dark-300 mt-1" />
            </motion.div>
          </div>

          <p className="text-dark-400 text-sm leading-relaxed mb-5">{description}</p>

          {/* Product count badge */}
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}30` }}
          >
            <Tag className="w-3 h-3" />
            {products.length} products
          </div>

          {/* Product mini-grid — always visible */}
          <div className="grid grid-cols-4 gap-1.5">
            {products.slice(0, 8).map((p) => (
              <div
                key={p.name}
                className="flex flex-col items-center justify-center gap-0.5 rounded-xl py-2 px-1 text-center transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span className="text-xl leading-none">{p.emoji}</span>
                <span className="text-[9px] text-dark-400 leading-tight font-medium line-clamp-1">{p.name}</span>
                <span className="text-[9px] font-bold" style={{ color: accentColor }}>{p.from}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Expanded Product Browser ───────────────────────────────────────────────── */
const ProductBrowser = ({ cat }) => {
  if (!cat) return null;
  const { products, gradient, accentColor, href, title } = cat;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={cat.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.35 }}
        className="glass-card p-6 mt-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-white">{title} — All Products</h3>
            <p className="text-dark-400 text-sm mt-0.5">
              Select any product to open the Design Studio
            </p>
          </div>
          <Link
            to={href}
            id={`open-studio-${cat.id}`}
            className="btn-primary !py-2.5 !px-5 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            Open Studio
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {products.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              <Link
                to={href}
                className="group flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 hover:-translate-y-1"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span className="text-4xl group-hover:scale-110 transition-transform duration-200">
                  {p.emoji}
                </span>
                <div className="text-center">
                  <p className="text-xs font-bold text-white leading-tight">{p.name}</p>
                  <p className="text-[10px] font-semibold mt-0.5" style={{ color: accentColor }}>
                    from {p.from}
                  </p>
                </div>
                {/* Tag badge */}
                <span
                  className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                  style={{ background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}25` }}
                >
                  {p.tag}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA banner */}
        <div
          className={`mt-6 p-4 rounded-2xl flex items-center justify-between bg-gradient-to-r ${gradient}`}
          style={{ opacity: 0.85 }}
        >
          <div>
            <p className="text-white font-bold text-sm">Ready to design?</p>
            <p className="text-white/70 text-xs mt-0.5">
              Open the studio → customize → order. Transparent pricing, instant preview.
            </p>
          </div>
          <Link to={href} className="btn-secondary !py-2 !px-4 text-xs flex-shrink-0 !bg-white/20 !border-white/30 hover:!bg-white/30">
            Design Now <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ─── Main Page ─────────────────────────────────────────────────────────────── */
const CategorySelect = () => {
  const [selected, setSelected] = useState('clothing');
  const selectedCat = CATEGORIES.find((c) => c.id === selected);

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />
      <div className="section-container py-24 min-h-screen">

        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="tag mb-4">Design Studio</span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
            What are you <span className="gradient-text">designing?</span>
          </h1>
          <p className="text-dark-400 text-lg max-w-lg mx-auto">
            Choose a category, pick a product, and open the studio. Transparent pricing — no surprises.
          </p>
        </motion.div>

        {/* Category grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {CATEGORIES.map((cat, i) => (
            <CategoryCard
              key={cat.id}
              cat={cat}
              index={i}
              isSelected={selected === cat.id}
              onSelect={setSelected}
            />
          ))}
        </div>

        {/* Expanded product browser for selected category */}
        <ProductBrowser cat={selectedCat} />

        {/* Bottom info strip */}
        <motion.div
          className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[
            { emoji: '💰', label: 'Transparent Pricing', sub: 'Base + Material + Design + Delivery. No hidden fees.' },
            { emoji: '🎁', label: 'Earn Rewards', sub: 'Share your design. Get likes. Earn your money back.' },
            { emoji: '⚡', label: 'Fast Production', sub: 'Orders dispatched within 3–5 business days.' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 p-4 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className="text-2xl">{item.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="text-xs text-dark-500 leading-snug mt-0.5">{item.sub}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default CategorySelect;
