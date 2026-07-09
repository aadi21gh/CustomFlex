import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, Eye, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatCount, timeAgo, getInitials, stringToColor } from '@/lib/utils';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const PostCard = ({ post, onLikeToggle, onBookmarkToggle }) => {
  const { isAuthenticated, user } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Sign in to like posts'); return; }
    if (isLiking) return;
    setIsLiking(true);
    try {
      const { data } = await api.post(`/posts/${post._id}/like`);
      const newCount = data.isLiked ? post.likesCount + 1 : post.likesCount - 1;
      onLikeToggle?.(post._id, data.isLiked, newCount);
    } catch (err) {
      toast.error('Failed to like post');
    } finally {
      setIsLiking(false);
    }
  };

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Sign in to bookmark'); return; }
    if (isBookmarking) return;
    setIsBookmarking(true);
    try {
      const { data } = await api.post(`/posts/${post._id}/bookmark`);
      onBookmarkToggle?.(post._id, data.isBookmarked);
    } catch (err) {
      toast.error('Failed to bookmark');
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/explore/post/${post._id}`);
      await api.post(`/posts/${post._id}/share`);
      toast.success('Link copied!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const primaryImage = post.images?.[0]?.url;

  return (
    <motion.div
      className="post-card group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <Link to={`/explore/post/${post._id}`} className="block">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-dark-800">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={post.caption || 'Design post'}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-900/30 to-purple-900/30">
              <span className="text-5xl">🎨</span>
            </div>
          )}

          {/* Category badge */}
          {post.category && (
            <div className="absolute top-3 left-3">
              <span className="tag text-xs capitalize">{post.category}</span>
            </div>
          )}

          {/* Views */}
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white/80" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
            <Eye className="w-3 h-3" />
            {formatCount(post.viewsCount || 0)}
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-4">
              <div className="text-white text-center">
                <Heart className={`w-6 h-6 mx-auto mb-1 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                <span className="text-xs font-semibold">{formatCount(post.likesCount || 0)}</span>
              </div>
              <div className="text-white text-center">
                <MessageCircle className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs font-semibold">{formatCount(post.commentsCount || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          {/* User */}
          <div className="flex items-center gap-2.5 mb-3">
            <Link to={`/profile/${post.user?._id}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 group/user">
              <div
                className="avatar w-7 h-7 flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: post.user?.avatar ? undefined : stringToColor(post.user?.name || '') }}
              >
                {post.user?.avatar ? (
                  <img src={post.user.avatar} alt={post.user.name} className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  getInitials(post.user?.name || '')
                )}
              </div>
              <span className="text-xs font-medium text-dark-300 group-hover/user:text-white transition-colors">
                {post.user?.name || 'Unknown'}
              </span>
            </Link>
            <span className="text-xs text-dark-600 ml-auto">{timeAgo(post.createdAt)}</span>
          </div>

          {/* Caption */}
          {post.caption && (
            <p className="text-xs text-dark-300 leading-relaxed line-clamp-2 mb-3">{post.caption}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${post.isLiked ? 'text-red-400 bg-red-500/10' : 'text-dark-400 hover:text-red-400 hover:bg-red-500/10'}`}
              id={`like-btn-${post._id}`}
            >
              <Heart className={`w-3.5 h-3.5 ${post.isLiked ? 'fill-red-400' : ''}`} />
              {formatCount(post.likesCount || 0)}
            </button>

            <button
              onClick={(e) => { e.preventDefault(); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-dark-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-200"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              {formatCount(post.commentsCount || 0)}
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-dark-400 hover:text-green-400 hover:bg-green-500/10 transition-all duration-200"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleBookmark}
              className={`ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${post.isBookmarked ? 'text-brand-400 bg-brand-500/10' : 'text-dark-400 hover:text-brand-400 hover:bg-brand-500/10'}`}
              id={`bookmark-btn-${post._id}`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${post.isBookmarked ? 'fill-brand-400' : ''}`} />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PostCard;
