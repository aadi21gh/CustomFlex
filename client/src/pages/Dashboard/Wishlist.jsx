import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Palette, ShoppingBag, Trash2, Loader2, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const [designs, setDesigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const { data } = await api.get('/users/wishlist');
      setDesigns(data.designs || []);
    } catch {
      toast.error('Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (designId) => {
    try {
      await api.post(`/users/wishlist/${designId}`);
      setDesigns((prev) => prev.filter((d) => d._id !== designId));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove design');
    }
  };

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-brand-500 animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <Heart className="w-6 h-6 text-red-500 fill-red-500" /> My Wishlist
      </h1>
      <p className="text-dark-400 text-sm mb-6">Designs you've saved to order or customize later.</p>

      {designs.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Heart className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Your wishlist is empty</h3>
          <p className="text-dark-400 mb-6">Explore the community feed and save designs you love!</p>
          <Link to="/explore" className="btn-primary inline-flex">Explore Designs</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map((design) => (
            <motion.div key={design._id} className="glass-card overflow-hidden group hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1" layout>
              {/* Thumbnail */}
              <div className="relative aspect-video bg-dark-800 overflow-hidden">
                {design.thumbnail ? (
                  <img src={design.thumbnail} alt={design.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-900/10 to-purple-900/10">
                    <Palette className="w-12 h-12 text-dark-600" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <button onClick={() => handleRemove(design._id)} className="w-8 h-8 rounded-lg bg-dark-900/80 backdrop-blur-sm flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all border border-glass-border">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="p-4">
                <h3 className="font-semibold text-white text-sm truncate mb-1">{design.title}</h3>
                <p className="text-xs text-dark-400 capitalize mb-3">By {design.user?.name || 'Unknown'}</p>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-glass-border">
                  <Link to={`/studio/${design.category}/${design._id}`} className="flex-1 text-center text-xs py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors border border-glass-border font-medium">
                    Customize
                  </Link>
                  <Link to={`/checkout?designId=${design._id}&category=${design.category}`} className="flex-1 text-center text-xs py-2 px-3 rounded-lg bg-brand-500/20 text-brand-300 hover:bg-brand-500/30 transition-colors font-semibold flex items-center justify-center gap-1">
                    <ShoppingBag className="w-3.5 h-3.5" /> Order
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
