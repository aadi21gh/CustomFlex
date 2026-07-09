import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, TrendingUp, Clock, Star, SlidersHorizontal } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PostCard from '@/components/explore/PostCard';
import Spinner from '@/components/ui/Spinner';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['all', 'artwork', 'clothing', 'accessories'];
const SORTS = [
  { id: 'newest', label: 'Latest', icon: Clock },
  { id: 'popular', label: 'Popular', icon: Star },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
];

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { isAuthenticated } = useAuth();
  const observerRef = useRef(null);
  const loaderRef = useRef(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch posts
  const fetchPosts = useCallback(async (pageNum = 1, reset = false) => {
    try {
      if (pageNum === 1) setIsLoading(true);
      else setIsLoadingMore(true);

      const params = new URLSearchParams({
        page: pageNum, limit: 12, sort,
        ...(category !== 'all' && { category }),
        ...(debouncedSearch && { search: debouncedSearch }),
      });

      const { data } = await api.get(`/posts?${params}`);
      const newPosts = data.posts;

      setPosts((prev) => reset || pageNum === 1 ? newPosts : [...prev, ...newPosts]);
      setHasMore(pageNum < data.pagination.pages);
      setPage(pageNum);
    } catch (err) {
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [category, sort, debouncedSearch]);

  // Reset on filter change
  useEffect(() => {
    fetchPosts(1, true);
  }, [category, sort, debouncedSearch]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasMore && !isLoadingMore) fetchPosts(page + 1); },
      { threshold: 0.1 }
    );
    observerRef.current = observer;
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, page, fetchPosts]);

  const handleLikeToggle = (postId, isLiked, likesCount) => {
    setPosts((prev) => prev.map((p) => p._id === postId ? { ...p, isLiked, likesCount } : p));
  };

  const handleBookmarkToggle = (postId, isBookmarked) => {
    setPosts((prev) => prev.map((p) => p._id === postId ? { ...p, isBookmarked } : p));
  };

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />

      <div className="section-container pt-24 pb-16">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="tag mb-4">Community</span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">Explore Designs</h1>
          <p className="text-dark-400 text-lg max-w-xl mx-auto">Discover stunning custom creations from our global community of designers.</p>
        </motion.div>

        {/* Filters */}
        <div className="glass-card p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
            <input
              id="explore-search"
              type="text"
              placeholder="Search designs, creators..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-200 ${category === cat ? 'bg-brand-500/25 text-brand-300 border border-brand-500/30' : 'text-dark-400 hover:text-white hover:bg-white/5'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5 border-l border-glass-border pl-4">
            {SORTS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSort(id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${sort === id ? 'bg-brand-500/25 text-brand-300 border border-brand-500/30' : 'text-dark-400 hover:text-white hover:bg-white/5'}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" label="Loading designs..." />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold text-white mb-2">No designs found</h3>
            <p className="text-dark-400">Try a different search or category</p>
          </div>
        ) : (
          <>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05 } }, hidden: {} }}
            >
              <AnimatePresence>
                {posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onLikeToggle={handleLikeToggle}
                    onBookmarkToggle={handleBookmarkToggle}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Infinite scroll loader */}
            <div ref={loaderRef} className="flex justify-center py-8">
              {isLoadingMore && <Spinner size="md" label="Loading more..." />}
              {!hasMore && posts.length > 0 && (
                <p className="text-dark-500 text-sm">You've seen all posts ✨</p>
              )}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Explore;
