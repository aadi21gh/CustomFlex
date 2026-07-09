import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Sparkles, ArrowRight, Palette, ShoppingBag, Share2, Star,
  Zap, Shield, Heart, Users, TrendingUp, CheckCircle2,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

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

const TestimonialCard = ({ name, handle, avatar, text, rating }) => (
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

const Landing = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const features = [
    { icon: Palette, title: 'Professional Design Studio', description: 'Canva-level editor with layers, AI generation, text, shapes, and real-time product preview.', gradient: 'bg-gradient-to-br from-brand-600 to-purple-600', delay: 0 },
    { icon: ShoppingBag, title: 'Order Custom Products', description: 'Turn your designs into real products. Dynamic pricing based on materials, size, and complexity.', gradient: 'bg-gradient-to-br from-blue-600 to-cyan-600', delay: 1 },
    { icon: Share2, title: 'Share & Earn Refunds', description: 'Post your purchases publicly. When your design goes viral, get your money back automatically.', gradient: 'bg-gradient-to-br from-emerald-600 to-teal-600', delay: 2 },
    { icon: Zap, title: 'AI Image Generation', description: 'Generate stunning AI artwork directly in the studio and add it instantly to your canvas.', gradient: 'bg-gradient-to-br from-orange-600 to-yellow-600', delay: 3 },
    { icon: Shield, title: 'Secure Payments', description: 'Stripe-powered checkout with bank-grade security. Your financial data is always protected.', gradient: 'bg-gradient-to-br from-red-600 to-pink-600', delay: 4 },
    { icon: Users, title: 'Vibrant Community', description: 'Follow creators, like posts, leave comments, and discover trending designs every day.', gradient: 'bg-gradient-to-br from-violet-600 to-purple-600', delay: 5 },
  ];

  const testimonials = [
    { name: 'Sarah Chen', handle: '@sarahcreates', text: 'CustomFlex is insane. I designed a hoodie, shared it, got 500 likes and got my money back in a week. This is the future!', rating: 5 },
    { name: 'Marcus Rivera', handle: '@marcusart', text: 'The design studio is on par with Figma for product design. AI generation saved me hours of work.', rating: 5 },
    { name: 'Aisha Patel', handle: '@aishastyle', text: 'I love how my designs can earn me refunds. It gamifies creativity in the most addictive way.', rating: 5 },
    { name: 'James Wu', handle: '@jameswu_', text: 'Best custom product platform I\'ve used. The UI is stunning and everything just works smoothly.', rating: 5 },
  ];

  const howItWorks = [
    { step: '01', title: 'Design', description: 'Open the studio and create your custom product using our professional editing tools.', icon: Palette },
    { step: '02', title: 'Order', description: 'Select your product specs, review dynamic pricing, and checkout securely via Stripe.', icon: ShoppingBag },
    { step: '03', title: 'Share', description: 'Upload a photo of your product to the community feed and start getting engagement.', icon: Share2 },
    { step: '04', title: 'Earn', description: 'Once your post hits the engagement threshold, get your full purchase price refunded.', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />

      {/* ─── Hero ────────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated background orbs */}
        <motion.div style={{ y, opacity }} className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 animate-float" style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full opacity-15 animate-float-slow" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)', animationDelay: '2s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full opacity-10 animate-float" style={{ background: 'radial-gradient(circle, #ec4899, transparent 70%)', animationDelay: '4s' }} />
          {/* Floating particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-30"
              style={{
                width: Math.random() * 4 + 2,
                height: Math.random() * 4 + 2,
                background: ['#6366f1', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 3)],
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${6 + Math.random() * 8}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </motion.div>

        <div className="section-container relative z-10 text-center py-20">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium text-brand-300"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Sparkles className="w-4 h-4" />
            <span>Now with AI-powered design generation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[1.05] tracking-tight mb-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Design.{' '}
            <span className="gradient-text">Customize.</span>
            <br />
            Share & Earn.
          </motion.h1>

          {/* Sub */}
          <motion.p
            className="text-lg md:text-xl text-dark-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            The world's most creative marketplace. Design custom artwork, clothing & accessories — then share with the community to earn your money back.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <Link to="/choose" id="hero-get-started-btn" className="btn-primary !px-8 !py-4 text-base group">
              <Sparkles className="w-5 h-5" />
              Get Started Free
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
            transition={{ delay: 0.6 }}
          >
            <div className="flex -space-x-2">
              {['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981'].map((color, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-dark-950 flex items-center justify-center text-xs font-bold text-white" style={{ background: color }}>
                  {['JL', 'AK', 'MS', 'TW', '+'][i]}
                </div>
              ))}
            </div>
            <p className="text-sm text-dark-400">
              Trusted by <span className="text-white font-semibold">50,000+</span> creators worldwide
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── Stats ───────────────────────────────────────────────────────────── */}
      <section className="py-20 border-y border-glass-border relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(99,102,241,0.08) 0%, transparent 60%)' }} />
        <div className="section-container relative">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } }, hidden: {} }}
          >
            <StatCard value="50K+" label="Active Creators" icon={Users} />
            <StatCard value="200K+" label="Designs Created" icon={Palette} />
            <StatCard value="$2M+" label="Refunds Paid Out" icon={TrendingUp} />
            <StatCard value="4.9★" label="Average Rating" icon={Star} />
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

      {/* ─── How It Works ────────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.06) 0%, transparent 60%)' }} />
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
              Four steps to <span className="gradient-text">earn back</span>
            </h2>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto">
              CustomFlex is the only platform where community engagement can refund your purchase.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4), rgba(139,92,246,0.4), transparent)' }} />

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
                  <div className="w-20 h-20 rounded-2xl glass-card flex items-center justify-center" style={{ border: '1px solid rgba(99,102,241,0.3)' }}>
                    <Icon className="w-8 h-8 text-brand-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
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

      {/* ─── Refund Feature Highlight ─────────────────────────────────────────── */}
      <section className="py-24 section-container">
        <motion.div
          className="glass-card gradient-border p-8 md:p-12 lg:p-16 relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <div className="absolute top-0 right-0 w-96 h-96 opacity-10" style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
          <div className="relative grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="tag mb-4">Refund System</span>
              <h2 className="text-4xl font-black text-white mb-4">
                Your creativity
                <span className="gradient-text"> pays you back</span>
              </h2>
              <p className="text-dark-400 text-lg leading-relaxed mb-8">
                CustomFlex's unique refund system rewards viral designs. Share your custom products, grow your audience, and when your post accumulates enough likes — we refund your purchase automatically.
              </p>
              <ul className="space-y-3">
                {[
                  'Post goes live → Community discovers it',
                  'Likes ≥ Product price = Refund eligible',
                  '2+ people purchase same design = Confirmed',
                  'Admin approves → Stripe refund issued',
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
              {/* Mock refund status card */}
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-dark-400">Custom Hoodie Design</span>
                  <span className="tag">Refund Eligible ✨</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-400">Post Likes</span>
                    <span className="text-emerald-400 font-semibold">847 / 750 ✓</span>
                  </div>
                  <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: '100%', background: 'linear-gradient(90deg, #10b981, #06b6d4)' }} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-400">Unique Buyers</span>
                    <span className="text-blue-400 font-semibold">3 / 2 ✓</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold mt-2">
                    <span className="text-white">Refund Amount</span>
                    <span className="gradient-text text-xl">$65.00</span>
                  </div>
                </div>
              </div>
              <div className="glass-card p-5">
                <div className="text-xs text-dark-500 mb-2">Recent Refund Activity</div>
                {[
                  { user: 'Sarah M.', amount: '$42.00', time: '2h ago' },
                  { user: 'James W.', amount: '$89.00', time: '5h ago' },
                  { user: 'Aisha P.', amount: '$35.00', time: '1d ago' },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-glass-border last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                        {r.user[0]}
                      </div>
                      <span className="text-xs text-dark-300">{r.user} got refunded</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-emerald-400">{r.amount}</div>
                      <div className="text-xs text-dark-500">{r.time}</div>
                    </div>
                  </div>
                ))}
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
          {[...testimonials, ...testimonials].map((t, i) => (
            <TestimonialCard key={i} {...t} />
          ))}
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
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(99,102,241,0.15) 0%, transparent 60%)' }} />
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
