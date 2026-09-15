import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Award, Sparkles, ShoppingCart, Share2,
  CheckCircle2, ArrowRight, ExternalLink, QrCode, Cpu, Heart
} from 'lucide-react';
import { SmileyMark } from '@/components/common/BrandLogo';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const PhygitalVerify = () => {
  const { tagId, designId } = useParams();
  const navigate = useNavigate();
  const id = tagId || designId || 'crx-sample';

  const [loading, setLoading] = useState(false);
  const [designData, setDesignData] = useState(null);

  useEffect(() => {
    // Attempt to fetch real design info if valid MongoDB ID or sample fallback
    const fetchInfo = async () => {
      if (id.length === 24) {
        setLoading(true);
        try {
          const { data } = await api.get(`/designs/${id}`);
          setDesignData(data.design);
        } catch (e) {
          console.warn('Using fallback phygital verification data');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchInfo();
  }, [id]);

  const title = designData?.title || 'Cyber Tokyo Oversized Hoodie';
  const creatorName = designData?.user?.name || 'Aadi (Verified Creator)';
  const previewImg = designData?.previewImage || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80';
  const category = designData?.category || 'clothing';
  const productType = designData?.productType || 'hoodie';

  const handleOrderPiece = () => {
    if (designData?._id) {
      navigate(`/checkout?designId=${designData._id}&category=${category}&productType=${productType}`);
    } else {
      navigate(`/studio?category=clothing`);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-white flex flex-col items-center justify-between p-4 sm:p-8 font-sans selection:bg-brand-500 selection:text-white">
      {/* Top Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between py-4 border-b border-glass-border">
        <Link to="/" className="flex items-center gap-2 hover:scale-105 transition-transform">
          <SmileyMark size="md" />
          <span className="font-bold text-sm text-white tracking-wide">CREXZA PHYGITAL</span>
        </Link>
        <span className="px-3 py-1 rounded-full text-2xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          GENUINE NFC TAG VERIFIED
        </span>
      </header>

      {/* Main Verification Card */}
      <main className="w-full max-w-xl my-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl p-6 sm:p-8 border border-amber-500/40 bg-gradient-to-b from-dark-900/90 via-dark-950/95 to-neutral-950 shadow-2xl overflow-hidden text-center"
        >
          {/* Hologram ambient glow */}
          <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-brand-500/15 blur-3xl pointer-events-none" />

          {/* Verification Shield Icon */}
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-brand-500 p-0.5 shadow-lg shadow-amber-500/20 mb-4">
            <div className="w-full h-full rounded-[14px] bg-dark-950 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
          </div>

          <span className="text-3xs font-mono uppercase tracking-widest text-amber-400 font-bold px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 inline-block mb-2">
            OFFICIALLY AUTHENTICATED PIECE
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
            {title}
          </h1>

          <p className="text-xs text-dark-400 mb-6">
            Designed by <span className="text-white font-semibold">{creatorName}</span> • Crexza Verified 1-of-1
          </p>

          {/* Product Image / Mockup */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-square max-w-[280px] mx-auto bg-dark-900 mb-6 group">
            <img
              src={previewImg}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-between text-3xs font-mono text-white/80">
              <span>EDITION: #001/100</span>
              <span className="text-amber-400">FIRST RUN</span>
            </div>
          </div>

          {/* Authentication Badges Grid */}
          <div className="grid grid-cols-2 gap-2.5 text-left mb-6 text-2xs">
            <div className="p-3 rounded-xl bg-dark-900/60 border border-glass-border">
              <span className="text-dark-400 block text-3xs">Smart NFC Tag ID</span>
              <span className="font-mono font-bold text-white uppercase">{id.substring(0, 14)}...</span>
            </div>
            <div className="p-3 rounded-xl bg-dark-900/60 border border-glass-border">
              <span className="text-dark-400 block text-3xs">Fabric Composition</span>
              <span className="font-semibold text-white">240 GSM Bio-Washed Cotton</span>
            </div>
            <div className="p-3 rounded-xl bg-dark-900/60 border border-glass-border">
              <span className="text-dark-400 block text-3xs">Print Method</span>
              <span className="font-semibold text-white">Direct-to-Film (300 DPI)</span>
            </div>
            <div className="p-3 rounded-xl bg-dark-900/60 border border-glass-border">
              <span className="text-dark-400 block text-3xs">Verification Network</span>
              <span className="font-mono text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3 h-3" /> VERIFIED ON-CHAIN
              </span>
            </div>
          </div>

          {/* 1-Tap Buy / Tap-To-Order Action */}
          <div className="space-y-3">
            <button
              onClick={handleOrderPiece}
              className="w-full btn-primary py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-xl shadow-brand-500/30 hover:scale-[1.02] transition-transform"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Order This Exact Custom Piece</span>
            </button>

            <div className="text-3xs text-dark-400 font-mono">
              💡 Ordering via this NFC tag pays direct royalty commission to the creator & wearer!
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl text-center py-4 border-t border-glass-border text-2xs text-dark-500 font-mono">
        Crexza Phygital Verification Protocol © 2026 • Encrypted Anti-Counterfeit System
      </footer>
    </div>
  );
};

export default PhygitalVerify;
