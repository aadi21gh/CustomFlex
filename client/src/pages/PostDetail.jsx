import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart, MessageCircle, Share2, Bookmark, Eye, ArrowLeft,
  Send, Loader2, MoreHorizontal, Trash2,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { formatCount, timeAgo, getInitials, stringToColor } from '@/lib/utils';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          api.get(`/posts/${id}`),
          api.get(`/posts/${id}/comments`),
        ]);
        setPost(postRes.data.post);
        setComments(commentsRes.data.comments);
      } catch {
        toast.error('Post not found');
        navigate('/explore');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleLike = async () => {
    if (!isAuthenticated) { toast.error('Sign in to like posts'); return; }
    const { data } = await api.post(`/posts/${id}/like`);
    setPost((p) => ({ ...p, isLiked: data.isLiked, likesCount: data.isLiked ? p.likesCount + 1 : p.likesCount - 1 }));
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) { toast.error('Sign in to bookmark'); return; }
    const { data } = await api.post(`/posts/${id}/bookmark`);
    setPost((p) => ({ ...p, isBookmarked: data.isBookmarked }));
  };

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    await api.post(`/posts/${id}/share`);
    toast.success('Link copied!');
  };

  const sendComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !isAuthenticated) return;
    setIsSendingComment(true);
    try {
      const { data } = await api.post(`/posts/${id}/comments`, { text: commentText });
      setComments((prev) => [data.comment, ...prev]);
      setPost((p) => ({ ...p, commentsCount: (p.commentsCount || 0) + 1 }));
      setCommentText('');
    } catch {
      toast.error('Failed to post comment');
    } finally {
      setIsSendingComment(false);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await api.delete(`/posts/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setPost((p) => ({ ...p, commentsCount: (p.commentsCount || 1) - 1 }));
    } catch { toast.error('Failed to delete'); }
  };

  if (isLoading) return (
    <div className="min-h-screen mesh-bg flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
    </div>
  );

  if (!post) return null;

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />
      <div className="section-container pt-24 pb-16">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Explore
        </button>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          {/* Left — Images */}
          <div className="space-y-4">
            <div className="relative aspect-square max-h-[600px] rounded-2xl overflow-hidden bg-dark-900">
              <img
                src={post.images[currentImageIdx]?.url}
                alt={post.caption}
                className="w-full h-full object-contain"
              />
            </div>
            {post.images.length > 1 && (
              <div className="flex gap-2">
                {post.images.map((img, i) => (
                  <button key={i} onClick={() => setCurrentImageIdx(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === currentImageIdx ? 'border-brand-500' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right — Info & Comments */}
          <div className="flex flex-col gap-6">
            {/* Post info */}
            <div className="glass-card p-6">
              {/* User */}
              <Link to={`/profile/${post.user?._id}`} className="flex items-center gap-3 mb-4 group">
                <div className="avatar w-10 h-10 flex items-center justify-center text-sm font-bold text-white" style={{ background: post.user?.avatar ? undefined : stringToColor(post.user?.name || '') }}>
                  {post.user?.avatar ? <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-full object-cover" /> : getInitials(post.user?.name || '')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-brand-300 transition-colors">{post.user?.name}</p>
                  <p className="text-xs text-dark-400">{timeAgo(post.createdAt)}</p>
                </div>
              </Link>

              {post.caption && <p className="text-dark-200 text-sm leading-relaxed mb-4">{post.caption}</p>}

              {post.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {post.tags.map((tag) => <span key={tag} className="tag">#{tag}</span>)}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-dark-400 mb-4 pt-4 border-t border-glass-border">
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{formatCount(post.viewsCount || 0)} views</span>
                <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{formatCount(post.likesCount || 0)} likes</span>
                <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" />{formatCount(post.commentsCount || 0)} comments</span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button onClick={handleLike} id="post-detail-like-btn" className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${post.isLiked ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 text-dark-300 hover:bg-red-500/10 hover:text-red-400 border border-glass-border'}`}>
                  <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-red-400' : ''}`} />
                  {post.isLiked ? 'Liked' : 'Like'}
                </button>
                <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-white/5 text-dark-300 hover:bg-green-500/10 hover:text-green-400 border border-glass-border transition-all">
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <button onClick={handleBookmark} id="post-detail-bookmark-btn" className={`flex items-center justify-center p-2.5 rounded-xl text-sm font-semibold transition-all border ${post.isBookmarked ? 'bg-brand-500/20 text-brand-400 border-brand-500/30' : 'bg-white/5 text-dark-300 hover:bg-brand-500/10 hover:text-brand-400 border-glass-border'}`}>
                  <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-brand-400' : ''}`} />
                </button>
              </div>
            </div>

            {/* Comments */}
            <div className="glass-card p-6 flex flex-col gap-4 flex-1">
              <h3 className="text-sm font-semibold text-white">Comments ({formatCount(post.commentsCount || 0)})</h3>

              {/* Comment input */}
              {isAuthenticated ? (
                <form onSubmit={sendComment} className="flex gap-2">
                  <div className="avatar w-8 h-8 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white" style={{ background: stringToColor(user?.name || '') }}>
                    {user?.avatar ? <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" /> : getInitials(user?.name || '')}
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input
                      id="comment-input"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="input-field flex-1 !py-2 text-sm"
                      maxLength={500}
                    />
                    <button type="submit" disabled={!commentText.trim() || isSendingComment} className="toolbar-btn !w-9" id="comment-submit-btn">
                      {isSendingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </form>
              ) : (
                <Link to="/auth/login" className="text-sm text-brand-400 hover:text-brand-300">Sign in to comment</Link>
              )}

              {/* Comments list */}
              <div className="space-y-4 overflow-y-auto max-h-80">
                {comments.map((comment) => (
                  <div key={comment._id} className="flex gap-2.5">
                    <div className="avatar w-7 h-7 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white" style={{ background: comment.user?.avatar ? undefined : stringToColor(comment.user?.name || '') }}>
                      {comment.user?.avatar ? <img src={comment.user.avatar} alt="" className="w-7 h-7 rounded-full object-cover" /> : getInitials(comment.user?.name || '')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-white">{comment.user?.name}</span>
                        <span className="text-xs text-dark-500">{timeAgo(comment.createdAt)}</span>
                        {user && (user._id === comment.user?._id || user.role === 'admin') && (
                          <button onClick={() => deleteComment(comment._id)} className="ml-auto text-dark-500 hover:text-red-400 transition-colors">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-dark-300 leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-xs text-dark-500 text-center py-4">No comments yet. Be the first!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
