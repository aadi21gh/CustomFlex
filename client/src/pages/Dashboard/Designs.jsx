import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Palette, Plus, Edit3, Trash2, Eye, EyeOff, Loader2, Copy } from 'lucide-react';
import { timeAgo, formatCount } from '@/lib/utils';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const Designs = () => {
  const [designs, setDesigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    api.get('/designs/my-designs').then(({ data }) => setDesigns(data.designs)).catch(() => toast.error('Failed to load designs')).finally(() => setIsLoading(false));
  }, []);

  const deleteDesign = async (id) => {
    if (!confirm('Delete this design? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/designs/${id}`);
      setDesigns((prev) => prev.filter((d) => d._id !== id));
      toast.success('Design deleted');
    } catch { toast.error('Failed to delete'); }
    finally { setDeletingId(null); }
  };

  const duplicateDesign = async (id) => {
    try {
      const { data } = await api.post(`/designs/${id}/duplicate`);
      setDesigns((prev) => [data.design, ...prev]);
      toast.success('Design duplicated!');
    } catch { toast.error('Failed to duplicate'); }
  };

  const togglePublic = async (id, isPublic) => {
    try {
      await api.put(`/designs/${id}`, { isPublic: !isPublic });
      setDesigns((prev) => prev.map((d) => d._id === id ? { ...d, isPublic: !isPublic } : d));
    } catch { toast.error('Failed to update'); }
  };

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-brand-500 animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Palette className="w-6 h-6 text-brand-400" /> My Designs
        </h1>
        <Link to="/customize" className="btn-primary !py-2 !px-4 text-sm">
          <Plus className="w-4 h-4" /> New Design
        </Link>
      </div>

      {designs.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Palette className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No designs yet</h3>
          <p className="text-dark-400 mb-6">Start with the studio and create something amazing!</p>
          <Link to="/customize" className="btn-primary inline-flex">Open Design Studio</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {designs.map((design) => (
            <motion.div key={design._id} className="glass-card overflow-hidden group hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1" layout>
              {/* Thumbnail */}
              <div className="relative aspect-video bg-dark-800 overflow-hidden">
                {design.thumbnail ? (
                  <img src={design.thumbnail} alt={design.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))' }}>
                    <Palette className="w-12 h-12 text-dark-600" />
                  </div>
                )}
                {design.isDraft && (
                  <div className="absolute top-2 left-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Draft</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                  <Link to={`/studio/${design.category}/${design._id}`} className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-500 flex items-center justify-center text-white transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </Link>
                  <button onClick={() => duplicateDesign(design._id)} className="w-9 h-9 rounded-full bg-white/10 hover:bg-purple-500 flex items-center justify-center text-white transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm truncate">{design.title}</h3>
                    <p className="text-xs text-dark-400 capitalize">{design.category} · {timeAgo(design.updatedAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <button onClick={() => togglePublic(design._id, design.isPublic)} className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${design.isPublic ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-dark-400 hover:text-white'}`}>
                    {design.isPublic ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {design.isPublic ? 'Public' : 'Private'}
                  </button>
                  <Link to={`/checkout?designId=${design._id}&category=${design.category}`} className="flex-1 text-center text-xs py-1.5 px-2 rounded-lg bg-brand-500/15 text-brand-400 hover:bg-brand-500/25 transition-colors font-medium">
                    Order Now
                  </Link>
                  <button onClick={() => deleteDesign(design._id)} disabled={deletingId === design._id} className="p-1.5 rounded-lg text-dark-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    {deletingId === design._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Designs;
