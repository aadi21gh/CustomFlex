import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from 'framer-motion';
import {
  Sparkles, ArrowRight, Palette, ShoppingBag, Share2, Star,
  Zap, Shield, Heart, Users, TrendingUp, CheckCircle2,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import api from '@/lib/axios';
import { formatPrice } from '@/lib/utils';

/* ─── Animation Variants ───────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

/* ─── Product Cards Data ────────────────────────────────────────────────────── */
const PRODUCTS = [
  { emoji: '👕', name: 'Classic Tee', tag: 'Bestseller', color: '#C76D4A', category: 'Clothing' },
  { emoji: '🧥', name: 'Hoodie', tag: 'Trending', color: '#8A9A7B', category: 'Clothing' },
  { emoji: '👟', name: 'Sneakers', tag: 'New', color: '#5B4636', category: 'Footwear' },
  { emoji: '🧢', name: 'Cap', tag: 'Popular', color: '#D89377', category: 'Accessories' },
  { emoji: '🖼️', name: 'Canvas Art', tag: 'Art', color: '#8A9A7B', category: 'Artwork' },
  { emoji: '🎨', name: 'Wall Decor', tag: 'Creative', color: '#E7B8A4', category: 'Artwork' },
  { emoji: '📱', name: 'Phone Case', tag: 'Hot', color: '#B24C3D', category: 'Accessories' },
  { emoji: '☕', name: 'Coffee Mug', tag: 'Cozy', color: '#8A9A7B', category: 'Lifestyle' },
  { emoji: '💻', name: 'Laptop Skin', tag: 'Tech', color: '#5B4636', category: 'Accessories' },
  { emoji: '🎒', name: 'Backpack', tag: 'Carry', color: '#C76D4A', category: 'Bags' },
  { emoji: '👜', name: 'Tote Bag', tag: 'Eco', color: '#8A9A7B', category: 'Bags' },
  { emoji: '🖥️', name: 'Poster', tag: 'Print', color: '#C76D4A', category: 'Artwork' },
  { emoji: '💍', name: 'Ring', tag: 'Luxury', color: '#DFD8C9', category: 'Jewelry' },
  { emoji: '⌚', name: 'Watch', tag: 'Style', color: '#7A6C5C', category: 'Jewelry' },
  { emoji: '🕶️', name: 'Sunglasses', tag: 'Vibe', color: '#8A9A7B', category: 'Accessories' },
  { emoji: '📦', name: 'Sticker Pack', tag: 'Fun', color: '#EFEAE0', category: 'Stickers' },
  { emoji: '🧣', name: 'Sweatshirt', tag: 'Warm', color: '#5B4636', category: 'Clothing' },
  { emoji: '🪙', name: 'Chain', tag: 'Bold', color: '#C76D4A', category: 'Jewelry' },
];

/* ─── Layout positions for 18 floating cards ───────────────────────────────── */
const CARD_POSITIONS = [
  // Left column — 6 cards
  { x: -52, y: -38, depth: 0.7, rotateBase: -8,  size: 'md', delay: 0.0 },
  { x: -44, y:  -8, depth: 0.5, rotateBase:  6,  size: 'sm', delay: 0.15 },
  { x: -55, y:  18, depth: 0.9, rotateBase: -4,  size: 'lg', delay: 0.3 },
  { x: -36, y:  42, depth: 0.6, rotateBase:  9,  size: 'sm', delay: 0.08 },
  { x: -62, y:  -2, depth: 0.4, rotateBase: -12, size: 'xs', delay: 0.4 },
  { x: -28, y: -52, depth: 0.8, rotateBase:  5,  size: 'md', delay: 0.22 },

  // Right column — 6 cards
  { x:  52, y: -38, depth: 0.7, rotateBase:  8,  size: 'md', delay: 0.05 },
  { x:  44, y:  -8, depth: 0.5, rotateBase: -6,  size: 'sm', delay: 0.2 },
  { x:  55, y:  18, depth: 0.9, rotateBase:  4,  size: 'lg', delay: 0.35 },
  { x:  36, y:  42, depth: 0.6, rotateBase: -9,  size: 'sm', delay: 0.12 },
  { x:  62, y:  -2, depth: 0.4, rotateBase:  12, size: 'xs', delay: 0.45 },
  { x:  28, y: -52, depth: 0.8, rotateBase: -5,  size: 'md', delay: 0.28 },

  // Top row — 3 cards
  { x: -20, y: -60, depth: 0.6, rotateBase:  3,  size: 'sm', delay: 0.18 },
  { x:   0, y: -68, depth: 0.8, rotateBase: -3,  size: 'md', delay: 0.1 },
  { x:  20, y: -60, depth: 0.6, rotateBase:  6,  size: 'sm', delay: 0.25 },

  // Bottom row — 3 cards
  { x: -20, y:  62, depth: 0.7, rotateBase: -4,  size: 'sm', delay: 0.32 },
  { x:   0, y:  70, depth: 0.5, rotateBase:  2,  size: 'md', delay: 0.14 },
  { x:  20, y:  62, depth: 0.7, rotateBase:  8,  size: 'sm', delay: 0.38 },
];

const CARD_SIZES = {
  xs: { card: 'w-24 h-28', emoji: 'text-2xl', name: 'text-[9px]', tag: 'text-[8px]' },
  sm: { card: 'w-28 h-32', emoji: 'text-3xl', name: 'text-[10px]', tag: 'text-[8px]' },
  md: { card: 'w-32 h-36', emoji: 'text-4xl', name: 'text-xs', tag: 'text-[9px]' },
  lg: { card: 'w-36 h-40', emoji: 'text-5xl', name: 'text-xs', tag: 'text-[9px]' },
};

/* ─── Single Floating Product Card ─────────────────────────────────────────── */
const FloatingCard = ({ product, position, index, mouseX, mouseY }) => {
  const { x, y, depth, rotateBase, size, delay } = position;
  const s = CARD_SIZES[size];

  // Parallax: faster-moving cards have higher depth factor
  const cardX = useTransform(mouseX, [-1, 1], [-18 * depth, 18 * depth]);
  const cardY = useTransform(mouseY, [-1, 1], [-12 * depth, 12 * depth]);
  const springX = useSpring(cardX, { stiffness: 80, damping: 30 });
  const springY = useSpring(cardY, { stiffness: 80, damping: 30 });

  return (
    <motion.div
      className="absolute"
      style={{
        left: `calc(50% + ${x}vw)`,
        top: `calc(50% + ${y}vh)`,
        x: springX,
        y: springY,
        translateX: '-50%',
        translateY: '-50%',
      }}
      initial={{ opacity: 0, scale: 0.3, rotate: rotateBase * 2 }}
      animate={{
        opacity: 1,
        scale: 1,
        rotate: rotateBase,
        y: [0, -12, 0, 8, 0],
      }}
      transition={{
        opacity: { delay: delay + 0.4, duration: 0.7, ease: 'easeOut' },
        scale:   { delay: delay + 0.4, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] },
        rotate:  { delay: delay + 0.4, duration: 0.7, ease: 'easeOut' },
        y: {
          delay: delay + 1.0,
          duration: 5 + depth * 3,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }}
      whileHover={{
        scale: 1.15,
        rotate: 0,
        zIndex: 20,
        transition: { duration: 0.25, ease: 'easeOut' },
      }}
    >
      <div
        className={`${s.card} rounded-2xl cursor-pointer relative overflow-hidden group select-none`}
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
          border: `1px solid rgba(255,255,255,0.12)`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${product.color}22, inset 0 1px 0 rgba(255,255,255,0.08)`,
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Color accent glow at top */}
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
          style={{ background: product.color, opacity: 0.8 }}
        />

        {/* Subtle glow behind card */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl"
          style={{ background: `radial-gradient(circle at 50% 30%, ${product.color}, transparent 70%)` }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full gap-1 p-2">
          <span className={`${s.emoji} leading-none mb-1`}>{product.emoji}</span>
          <p className={`${s.name} font-bold text-white text-center leading-tight`}>
            {product.name}
          </p>
          <p className="text-[8px] text-dark-500 font-medium tracking-wider uppercase">
            {product.category}
          </p>
          {/* Tag badge */}
          <span
            className={`${s.tag} px-1.5 py-0.5 rounded-full font-bold mt-1`}
            style={{ background: `${product.color}25`, color: product.color, border: `1px solid ${product.color}40` }}
          >
            {product.tag}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Reused sub-components ─────────────────────────────────────────────────── */
const FeatureCard = ({ icon: Icon, title, description, gradient, delay }) => (
  <motion.div
    className="glass-card p-6 hover:shadow-card-hover transition-all duration-300 group cursor-default"
    variants={fadeUp}
    custom={delay}
    whileHover={{ y: -6, transition: { duration: 0.2 } }}
  >
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${gradient}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-brand-300 transition-colors">{title}</h3>
    <p className="text-dark-400 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

const TestimonialCard = ({ name, handle, text, rating }) => (
  <motion.div
    className="glass-card p-6 flex-shrink-0 w-80"
    variants={fadeUp}
    whileHover={{ scale: 1.02 }}
  >
    <div className="flex items-center gap-1 mb-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-dark-600'}`} />
      ))}
    </div>
    <p className="text-dark-300 text-sm leading-relaxed mb-4">"{text}"</p>
    <div className="flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
        style={{ background: `hsl(${name.charCodeAt(0) * 7 % 360}, 65%, 45%)` }}
      >
        {name.slice(0, 2).toUpperCase()}
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{name}</p>
        <p className="text-xs text-dark-500">{handle}</p>
      </div>
    </div>
  </motion.div>
);

const StatCard = ({ value, label, icon: Icon }) => (
  <motion.div className="text-center" variants={fadeUp}>
    <div className="text-4xl md:text-5xl font-black gradient-text mb-2">{value}</div>
    <div className="flex items-center justify-center gap-2 text-dark-400 text-sm">
      <Icon className="w-4 h-4" />
      {label}
    </div>
  </motion.div>
);

/* ─── Animated Headline words ────────────────────────────────────────────────── */
const HEADLINE_WORDS = ['Anything.', 'Beautifully.', 'Yours.'];

const AnimatedHeadline = () => {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex((i) => (i + 1) % HEADLINE_WORDS.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="relative inline-block overflow-hidden h-[1.1em]" style={{ verticalAlign: 'middle' }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={wordIndex}
          className="gradient-text inline-block"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {HEADLINE_WORDS[wordIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

const formatTimeAgo = (dateVal) => {
  if (!dateVal) return '';
  const date = new Date(dateVal);
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return `${interval}y ago`;
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return `${interval}mo ago`;
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return `${interval}d ago`;
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return `${interval}h ago`;
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return `${interval}m ago`;
  return 'just now';
};

/* ─── Main Landing Component ─────────────────────────────────────────────────── */
const Landing = () => {
  const heroRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDesigns: 0,
    totalOrders: 0,
    totalRewards: 0,
  });

  useEffect(() => {
    api.get('/orders/public-stats')
      .then(({ data }) => {
        if (data.success && data.stats) {
          setStats(data.stats);
        }
      })
      .catch(() => {});
  }, []);

  // Scroll parallax
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroScale  = useTransform(scrollYProgress, [0, 0.6], [1, 0.92]);

  // Mouse tracking for parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      mouseX.set((e.clientX / innerWidth) * 2 - 1);
      mouseY.set((e.clientY / innerHeight) * 2 - 1);
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  /* ─── Static data ───────────────────────────────────────────────────────── */
  const features = [
    { icon: Palette, title: 'Professional Design Studio', description: 'Canva-level editor with layers, text, shapes, image upload, and real-time product preview.', gradient: 'bg-gradient-to-br from-brand-600 to-purple-600', delay: 0 },
    { icon: ShoppingBag, title: 'Order Custom Products', description: 'Turn your designs into real products. Transparent pricing based on materials, size, and delivery.', gradient: 'bg-gradient-to-br from-brand-500 to-purple-500', delay: 1 },
    { icon: Share2, title: 'Share & Earn Rewards', description: 'Post your purchases to the community. When your design goes viral, earn rewards automatically.', gradient: 'bg-gradient-to-br from-brand-700 to-brand-500', delay: 2 },
    { icon: Zap, title: 'Lightning Fast', description: 'Optimized studio with instant previews, autosave, and smooth 60fps animations throughout.', gradient: 'bg-gradient-to-br from-brand-500 to-dark-600', delay: 3 },
    { icon: Shield, title: 'Secure Payments', description: 'Stripe-powered checkout with bank-grade security. Your financial data is always protected.', gradient: 'bg-gradient-to-br from-brand-600 to-brand-800', delay: 4 },
    { icon: Users, title: 'Vibrant Community', description: 'Follow creators, like posts, leave comments, and discover trending designs every day.', gradient: 'bg-gradient-to-br from-brand-600 to-purple-500', delay: 5 },
  ];

  const testimonials = [
    { name: 'Sarah Chen', handle: '@sarahcreates', text: 'CustomFlex is insane. I designed a hoodie, shared it, got 500 likes and got my money back in a week. This is the future!', rating: 5 },
    { name: 'Marcus Rivera', handle: '@marcusart', text: 'The design studio is on par with Figma for product design. The canvas tools saved me hours of work.', rating: 5 },
    { name: 'Aisha Patel', handle: '@aishastyle', text: 'I love how my designs can earn me rewards. It gamifies creativity in the most addictive way.', rating: 5 },
    { name: 'James Wu', handle: '@jameswu_', text: 'Best custom product platform I\'ve used. The UI is stunning and everything just works smoothly.', rating: 5 },
  ];

  const howItWorks = [
    { step: '01', title: 'Design', description: 'Open the studio and create your custom product using our professional editing tools.', icon: Palette },
    { step: '02', title: 'Order', description: 'Select your product specs, review transparent pricing, and checkout securely via Stripe.', icon: ShoppingBag },
    { step: '03', title: 'Share', description: 'Upload a photo of your product to the community feed and start getting engagement.', icon: Share2 },
    { step: '04', title: 'Earn', description: 'Once your post hits the engagement threshold, get your full purchase price rewarded.', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />

      {/* ─── Hero ────────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ perspective: '1200px' }}
      >
        {/* Scroll-fade + scale wrapper */}
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="absolute inset-0 pointer-events-none"
        >
          {/* Deep background gradient */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.18) 0%, transparent 60%), ' +
                'radial-gradient(ellipse 60% 50% at 20% 80%, rgba(139,92,246,0.1) 0%, transparent 60%), ' +
                'radial-gradient(ellipse 40% 40% at 80% 70%, rgba(236,72,153,0.08) 0%, transparent 60%)',
            }}
          />

          {/* Noise texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Slow rotating gradient ring */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          >
            <div
              className="w-[900px] h-[900px] rounded-full border opacity-[0.06]"
              style={{ borderColor: 'rgba(99,102,241,0.8)', boxShadow: '0 0 120px rgba(99,102,241,0.1) inset' }}
            />
          </motion.div>
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            animate={{ rotate: -360 }}
            transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
          >
            <div
              className="w-[1200px] h-[1200px] rounded-full border opacity-[0.04]"
              style={{ borderColor: 'rgba(139,92,246,0.6)' }}
            />
          </motion.div>
        </motion.div>

        {/* ── Floating product cards ── */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {PRODUCTS.map((product, i) => (
            <FloatingCard
              key={product.name}
              product={product}
              position={CARD_POSITIONS[i]}
              index={i}
              mouseX={mouseX}
              mouseY={mouseY}
            />
          ))}
        </motion.div>

        {/* ── Central content ── */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-20">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium text-brand-300"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-4 h-4" />
            </motion.span>
            <span>18+ Customizable Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[1.05] tracking-tight mb-4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Customize{' '}
            <AnimatedHeadline />
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            className="text-lg md:text-xl text-dark-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            The world's most creative marketplace. Design custom clothing, artwork &amp; accessories —
            then share with the community to earn rewards.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <Link to="/choose" id="hero-get-started-btn" className="btn-primary !px-8 !py-4 text-base group">
              <Sparkles className="w-5 h-5" />
              Start Creating Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/explore" id="hero-explore-btn" className="btn-secondary !px-8 !py-4 text-base group">
              <Share2 className="w-5 h-5" />
              Explore Designs
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            className="flex items-center justify-center gap-3 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex -space-x-2">
              {['#C76D4A', '#8A9A7B', '#5B4636', '#D89377', '#AFA38E'].map((color, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-dark-950 flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: color }}
                >
                  {['JL', 'AK', 'MS', 'TW', '+'][i]}
                </div>
              ))}
            </div>
            <p className="text-sm text-dark-400">
              Trusted by <span className="text-white font-semibold">{stats.totalUsers}+</span> creators worldwide
            </p>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <span className="text-xs text-dark-600 tracking-widest uppercase font-medium">Scroll</span>
            <motion.div
              className="w-px h-8 rounded-full"
              style={{ background: 'linear-gradient(to bottom, rgba(199,109,74,0.6), transparent)' }}
              animate={{ scaleY: [0.3, 1, 0.3], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </div>
      </section>

      {/* ─── Stats ───────────────────────────────────────────────────────────── */}
      <section className="py-20 border-y border-glass-border relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(199,109,74,0.08) 0%, transparent 60%)' }} />
        <div className="section-container relative">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } }, hidden: {} }}
          >
            <StatCard value={stats.totalUsers.toLocaleString()} label="Active Creators" icon={Users} />
            <StatCard value={stats.totalDesigns.toLocaleString()} label="Designs Created" icon={Palette} />
            <StatCard value={formatPrice(stats.totalRewards)} label="Rewards Paid Out" icon={TrendingUp} />
            <StatCard value={stats.totalOrders.toLocaleString()} label="Orders Placed" icon={ShoppingBag} />
          </motion.div>
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────────────────────────── */}
      <section className="py-24 section-container">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <span className="tag mb-4">Features</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Everything you need to create
          </h2>
          <p className="text-dark-400 text-lg max-w-2xl mx-auto">
            A complete creative toolkit built for designers, artists, and everyday creators who want to bring their ideas to life.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } }, hidden: {} }}
        >
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </motion.div>
      </section>

      {/* ─── Product Showcase Strip ──────────────────────────────────────────── */}
      <section className="py-16 overflow-hidden border-y border-glass-border relative">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(199,109,74,0.05) 0%, transparent 70%)' }} />
        <div className="section-container mb-10 relative">
          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <span className="tag mb-3">Product Catalog</span>
            <h2 className="text-3xl md:text-4xl font-black text-white mt-2 mb-2">
              Customize <span className="gradient-text">18+ products</span>
            </h2>
            <p className="text-dark-400 text-base">From clothing to jewelry — if you can imagine it, we can make it.</p>
          </motion.div>
        </div>

        {/* Scrolling product strip */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #F7F3EB, transparent)' }} />
          <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, #F7F3EB, transparent)' }} />
          <motion.div
            className="flex gap-4 px-4"
            animate={{ x: [0, `-${PRODUCTS.length * (160 / 2)}px`] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            style={{ width: 'max-content' }}
          >
            {[...PRODUCTS, ...PRODUCTS].map((p, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-36 h-20 rounded-2xl flex items-center gap-3 px-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
                  border: `1px solid ${p.color}30`,
                  boxShadow: `0 4px 16px rgba(0,0,0,0.2)`,
                }}
              >
                <span className="text-2xl">{p.emoji}</span>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">{p.name}</p>
                  <p className="text-[10px] text-dark-500">{p.category}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── How It Works ────────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(199,109,74,0.06) 0%, transparent 60%)' }} />
        <div className="section-container relative">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <span className="tag mb-4">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Four steps to <span className="gradient-text">earn rewards</span>
            </h2>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto">
              CustomFlex is the only platform where community engagement rewards your creativity.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(199, 109, 74, 0.4), rgba(138, 154, 123, 0.4), transparent)' }} />

            {howItWorks.map(({ step, title, description, icon: Icon }, i) => (
              <motion.div
                key={step}
                className="relative text-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
              >
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="w-20 h-20 rounded-2xl glass-card flex items-center justify-center" style={{ border: '1px solid rgba(199,109,74,0.3)' }}>
                    <Icon className="w-8 h-8 text-brand-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: 'linear-gradient(135deg, #C76D4A, #8A9A7B)' }}>
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Reward Feature Highlight ─────────────────────────────────────────── */}
      <section className="py-24 section-container">
        <motion.div
          className="glass-card gradient-border p-8 md:p-12 lg:p-16 relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <div className="absolute top-0 right-0 w-96 h-96 opacity-10" style={{ background: 'radial-gradient(circle, #C76D4A, transparent 70%)' }} />
          <div className="relative grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="tag mb-4">Reward System</span>
              <h2 className="text-4xl font-black text-white mb-4">
                Your creativity
                <span className="gradient-text"> pays you back</span>
              </h2>
              <p className="text-dark-400 text-lg leading-relaxed mb-8">
                CustomFlex's unique reward system celebrates viral designs. Share your custom products, grow your audience, and when your post accumulates enough likes — we reward your purchase automatically.
              </p>
              <ul className="space-y-3">
                {[
                  'Post goes live → Community discovers it',
                  'Likes reach engagement threshold = Reward eligible',
                  '2+ people purchase same design = Confirmed',
                  'Admin approves → Reward issued instantly',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-dark-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/choose" className="btn-primary mt-8 inline-flex">
                Start Creating <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {/* Dynamic reward status card */}
              {(() => {
                const featured = stats.featuredReward || {
                  title: 'Custom Hoodie Design',
                  likes: 847,
                  requiredLikes: 750,
                  buyers: 3,
                  requiredBuyers: 2,
                  amount: '₹4,250'
                };
                return (
                  <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-dark-400">{featured.title}</span>
                      <span className="tag">
                        {featured.likes >= featured.requiredLikes && featured.buyers >= featured.requiredBuyers ? 'Reward Eligible ✨' : 'In Progress ⏳'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-400">Post Likes</span>
                        <span className="text-emerald-400 font-semibold">
                          {featured.likes} / {featured.requiredLikes} {featured.likes >= featured.requiredLikes ? '✓' : ''}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, (featured.likes / featured.requiredLikes) * 100)}%`,
                            background: 'linear-gradient(90deg, #8A9A7B, #C76D4A)'
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-400">Unique Buyers</span>
                        <span className="text-brand-400 font-semibold">
                          {featured.buyers} / {featured.requiredBuyers} {featured.buyers >= featured.requiredBuyers ? '✓' : ''}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold mt-2">
                        <span className="text-white">Reward Amount</span>
                        <span className="gradient-text text-xl">{featured.amount}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="glass-card p-5">
                <div className="text-xs text-dark-500 mb-2">Recent Reward Activity</div>
                {(() => {
                  const displayRewards = stats.recentRewards && stats.recentRewards.length > 0
                    ? stats.recentRewards
                    : [
                        { user: 'Sarah M.', amount: '₹2,800', time: '2h ago' },
                        { user: 'James W.', amount: '₹5,200', time: '5h ago' },
                        { user: 'Aisha P.', amount: '₹1,950', time: '1d ago' },
                      ];
                  return displayRewards.map((r, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-glass-border last:border-0">
                      <div className="flex items-center gap-2">
                        {r.avatar ? (
                          <img src={r.avatar} alt={r.user} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                            {r.user ? r.user[0] : 'C'}
                          </div>
                        )}
                        <span className="text-xs text-dark-300">{r.user} got rewarded</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-emerald-400">{r.amount}</div>
                        <div className="text-xs text-dark-500">
                          {typeof r.time === 'string' && r.time.includes('ago') ? r.time : formatTimeAgo(r.time)}
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Testimonials ─────────────────────────────────────────────────────── */}
      <section className="py-24 overflow-hidden">
        <div className="section-container mb-12">
          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <span className="tag mb-4">Testimonials</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Loved by creators</h2>
          </motion.div>
        </div>
        <motion.div
          className="flex gap-6 px-4"
          initial={{ x: 0 }}
          animate={{ x: '-50%' }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          style={{ width: 'max-content' }}
        >
          {(() => {
            const displayTestimonials = stats.testimonials && stats.testimonials.length > 0
              ? stats.testimonials
              : testimonials;
            return [...displayTestimonials, ...displayTestimonials].map((t, i) => (
              <TestimonialCard key={i} {...t} />
            ));
          })()}
        </motion.div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-24 section-container">
        <motion.div
          className="glass-card gradient-border text-center py-20 px-8 relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(199,109,74,0.15) 0%, transparent 60%)' }} />
          <motion.div
            className="relative"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles className="w-16 h-16 mx-auto mb-6 text-brand-400" />
          </motion.div>
          <h2 className="relative text-4xl md:text-6xl font-black text-white mb-4">
            Ready to create something <span className="gradient-text">extraordinary?</span>
          </h2>
          <p className="relative text-dark-400 text-lg mb-10 max-w-xl mx-auto">
            Join 50,000+ creators on CustomFlex and start turning your ideas into beautiful custom products today.
          </p>
          <div className="relative flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register" id="footer-cta-btn" className="btn-primary !px-10 !py-4 text-lg">
              <Sparkles className="w-5 h-5" />
              Start Creating — It's Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/explore" className="btn-secondary !px-10 !py-4 text-lg">
              Explore Designs
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
