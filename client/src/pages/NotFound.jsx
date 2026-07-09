import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

const NotFound = () => {
  return (
    <div className="min-h-screen mesh-bg flex flex-col items-center justify-center">
      <Navbar />

      <div className="section-container relative z-10 text-center py-20">
        <motion.div
          className="relative inline-block mb-6"
          initial={{ rotate: -10 }}
          animate={{ rotate: 10 }}
          transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse', ease: 'easeInOut' }}
        >
          <div className="w-20 h-20 rounded-2xl bg-brand-500/10 flex items-center justify-center border border-brand-500/30 shadow-glow">
            <AlertTriangle className="w-10 h-10 text-brand-400" />
          </div>
        </motion.div>

        <motion.h1
          className="text-6xl font-black text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          404
        </motion.h1>

        <motion.p
          className="text-xl font-bold text-dark-200 mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Page Not Found
        </motion.p>

        <motion.p
          className="text-sm text-dark-400 max-w-md mx-auto mb-8 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          The page you are looking for doesn't exist or has been moved. Use the button below to head back home.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link to="/" className="btn-primary inline-flex gap-2">
            <ArrowLeft className="w-4 h-4" /> Head Back Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
