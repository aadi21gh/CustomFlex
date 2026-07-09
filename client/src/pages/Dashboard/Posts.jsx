import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Heart, MessageCircle, Eye, Trash2, Plus, Sparkles, Loader2 } from 'lucide-react';
import { timeAgo, formatCount } from '@/lib/utils';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input, { Textarea } from '@/components/ui/Input';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eligibleDesigns, setEligibleDesigns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState('');
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMyPosts = async () => {
    try {
      const { data } = await api.get('/posts/my-posts');
      setPosts(data.posts);
    } catch {
      toast.error('Failed to load posts');
    }
  };

  const fetchEligible = async () => {
    try {
      // Fetch orders to see designs that can be shared (i.e. designs that have been ordered/paid)
      const { data } = await api.get('/orders/my-orders');
      // Extract unique designs from paid orders
      const designsMap = {};
      data.orders.filter(o => o.isPaid && o.design).forEach(o => {
        designsMap[o.design._id] = o.design;
      });
      setEligibleDesigns(Object.values(designsMap));
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    Promise.all([fetchMyPosts(), fetchEligible()]).finally(() => setIsLoading(false));
  }, []);

  const handleDelete = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      setPosts((p) => p.filter((item) => item._id !== postId));
      toast.success('Post deleted successfully');
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!selectedDesign) return toast.error('Please select a design');
    setIsSubmitting(true);
    try {
      // Get design details to find thumbnail
      const designToShare = eligibleDesigns.find(d => d._id === selectedDesign);
      if (!designToShare) throw new Error('Selected design not found');

      await api.post('/posts', {
        design: selectedDesign,
        caption,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        images: [{ url: designToShare.thumbnail || '', alt: designToShare.title }],
      });

      toast.success('Post shared to community feed! 🚀');
      setIsModalOpen(false);
      setCaption('');
      setTags('');
      setSelectedDesign('');
      fetchMyPosts();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-brand-500 animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-brand-400" /> My Posts
        </h1>
        {eligibleDesigns.length > 0 && (
          <Button onClick={() => setIsModalOpen(true)} className="!py-2 !px-4 text-sm">
            <Plus className="w-4 h-4" /> Share a Purchase
          </Button>
        )}
      </div>

      {posts.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <ImageIcon className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No posts shared yet</h3>
          {eligibleDesigns.length > 0 ? (
            <>
              <p className="text-dark-400 mb-6">You have ordered designs ready to be shared with the community!</p>
              <Button onClick={() => setIsModalOpen(true)}>Share Your First Purchase</Button>
            </>
          ) : (
            <>
              <p className="text-dark-400 mb-6">Order one of your designs first to share it on the community feed and unlock refund eligibility.</p>
              <Link to="/choose" className="btn-primary inline-flex">Design a Product</Link>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <motion.div key={post._id} className="glass-card overflow-hidden group hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1" layout>
              {/* Thumbnail */}
              <div className="relative aspect-square bg-dark-800 overflow-hidden">
                {post.images?.[0]?.url ? (
                  <img src={post.images[0].url} alt={post.caption} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-dark-600" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <Link to={`/explore/post/${post._id}`} className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-500 flex items-center justify-center text-white transition-colors" title="View Post">
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button onClick={() => handleDelete(post._id)} className="w-9 h-9 rounded-full bg-white/10 hover:bg-red-500 flex items-center justify-center text-white transition-colors" title="Delete Post">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stats & Info */}
              <div className="p-4">
                <p className="text-xs text-dark-400 mb-2">{timeAgo(post.createdAt)}</p>
                <p className="text-sm font-semibold text-white truncate mb-3">{post.caption || 'No caption'}</p>
                <div className="flex items-center gap-4 text-xs text-dark-400 border-t border-glass-border pt-3">
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {formatCount(post.viewsCount || 0)}</span>
                  <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {formatCount(post.likesCount || 0)}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {formatCount(post.commentsCount || 0)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Share Post Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Share Purchased Design to Feed">
        <form onSubmit={handleCreatePost} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Select Ordered Design</label>
            <select
              value={selectedDesign}
              onChange={(e) => setSelectedDesign(e.target.value)}
              className="input-field text-sm"
              id="select-ordered-design"
              required
            >
              <option value="" className="bg-dark-950">-- Select a design --</option>
              {eligibleDesigns.map((d) => (
                <option key={d._id} value={d._id} className="bg-dark-950">{d.title} ({d.category})</option>
              ))}
            </select>
          </div>

          <Textarea
            id="share-post-caption"
            label="Caption"
            placeholder="Tell the community about your design..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            required
            rows={3}
          />

          <Input
            id="share-post-tags"
            label="Tags (comma separated)"
            placeholder="gaming, art, vaporwave"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
            <Button type="submit" isLoading={isSubmitting}>
              <Sparkles className="w-4 h-4" /> Share Post
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Posts;
