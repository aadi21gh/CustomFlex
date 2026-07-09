import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Palette, Compass, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

const Choose = () => {
  const options = [
    {
      id: 'customize',
      icon: Palette,
      title: 'Customize',
      description: 'Design your own custom products from scratch using our professional studio tools.',
      href: '/customize',
      gradient: 'from-brand-600 to-purple-600',
      glow: 'rgba(99,102,241,0.4)',
      features: ['Artwork', 'Clothing', 'Accessories'],
      cta: 'Start Designing',
    },
    {
      id: 'explore',
      icon: Compass,
      title: 'Explore',
      description: 'Discover amazing designs from the community. Like, comment, and get inspired.',
      href: '/explore',
      gradient: 'from-emerald-600 to-teal-600',
      glow: 'rgba(16,185,129,0.4)',
      features: ['Community Feed', 'Trending Designs', 'Creator Profiles'],
      cta: 'Explore Now',
    },
  ];

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />

      <div className="min-h-screen flex flex-col items-center justify-center section-container py-24">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
            What would you like to do?
          </h1>
          <p className="text-dark-400 text-lg max-w-xl mx-auto">
            Choose your path — create something new, or discover what others have made.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 w-full max-w-3xl">
          {options.map(({ id, icon: Icon, title, description, href, gradient, glow, features, cta }, i) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <Link to={href} className="group block">
                <div className="glass-card p-8 h-full transition-all duration-300 group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] group-hover:-translate-y-2 relative overflow-hidden">
                  {/* Hover glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 100%, ${glow}15, transparent 70%)` }} />

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`} style={{ boxShadow: `0 8px 24px ${glow}` }}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>
                  <p className="text-dark-400 text-sm leading-relaxed mb-6">{description}</p>

                  <div className="space-y-2 mb-8">
                    {features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-dark-300">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${gradient}`} />
                        {f}
                      </div>
                    ))}
                  </div>

                  <div className={`inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${gradient} bg-clip-text text-transparent group-hover:gap-3 transition-all duration-200`}>
                    {cta} <ArrowRight className={`w-4 h-4 bg-gradient-to-r ${gradient} [&>path]:stroke-current`} style={{ color: id === 'customize' ? '#6366f1' : '#10b981' }} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Choose;
