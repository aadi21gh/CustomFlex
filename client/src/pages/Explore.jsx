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

const CURATED_COMMUNITY_POSTS = [
  {
    _id: 'curated-1',
    caption: 'Tokyo Cyberpunk Heavyweight Vintage Oversized Hoodie with custom back typography & neon sleeve accents 🔥',
    category: 'clothing',
    images: [{ url: '/mockups/hoodie.jpg' }],
    user: { _id: 'u1', name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
    likesCount: 842,
    commentsCount: 39,
    viewsCount: 3420,
    isLiked: false,
    isBookmarked: false,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    _id: 'curated-2',
    caption: 'Minimalist Bauhaus Arch Artwork Print on 300gsm matte art paper. Customized in Crexza Studio 🎨',
    category: 'artwork',
    images: [{ url: '/mockups/poster.jpg' }],
    user: { _id: 'u2', name: 'Marcus Rivera', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
    likesCount: 620,
    commentsCount: 28,
    viewsCount: 2890,
    isLiked: false,
    isBookmarked: false,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    _id: 'curated-3',
    caption: 'Botanical Flora Heavy Canvas Tote Bag with reinforced handles and vintage screenprint badge.',
    category: 'accessories',
    images: [{ url: '/mockups/totebag.jpg' }],
    user: { _id: 'u3', name: 'Aisha Patel', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
    likesCount: 512,
    commentsCount: 19,
    viewsCount: 1940,
    isLiked: false,
    isBookmarked: false,
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
  {
    _id: 'curated-4',
    caption: 'Desi Diva Pop-Art Streetwear Classic Boxy Tee in organic ring-spun cotton.',
    category: 'clothing',
    images: [{ url: '/mockups/tshirt.jpg' }],
    user: { _id: 'u4', name: 'Kavya Sharma', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80' },
    likesCount: 780,
    commentsCount: 45,
    viewsCount: 4100,
    isLiked: false,
    isBookmarked: false,
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
  },
  {
    _id: 'curated-5',
    caption: 'Alpine Explorer Club Crest Patch Varsity Jacket with custom embroidered chest badge.',
    category: 'clothing',
    images: [{ url: '/mockups/jacket.jpg' }],
    user: { _id: 'u5', name: 'James Wu', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
    likesCount: 934,
    commentsCount: 52,
    viewsCount: 5600,
    isLiked: false,
    isBookmarked: false,
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
  {
    _id: 'curated-6',
    caption: 'Frosted Acrylic Floating Frame with neon geometric typography & iridescent sheen.',
    category: 'artwork',
    images: [{ url: '/mockups/acrylic.jpg' }],
    user: { _id: 'u6', name: 'Sofia Lindqvist', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80' },
    likesCount: 430,
    commentsCount: 15,
    viewsCount: 2200,
    isLiked: false,
    isBookmarked: false,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    _id: 'curated-7',
    caption: 'Vintage Washed Dad Cap with custom 3D puffy embroidered monogram crest.',
    category: 'accessories',
    images: [{ url: '/mockups/cap.jpg' }],
    user: { _id: 'u7', name: 'David Kim', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80' },
    likesCount: 390,
    commentsCount: 22,
    viewsCount: 1850,
    isLiked: false,
    isBookmarked: false,
    createdAt: new Date(Date.now() - 3600000 * 60).toISOString(),
  },
  {
    _id: 'curated-8',
    caption: 'Sunset Mirage Premium Textured Canvas Wall Art on gallery solid wood stretcher bars.',
    category: 'artwork',
    images: [{ url: '/mockups/canvas.jpg' }],
    user: { _id: 'u8', name: 'Maya Lin', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80' },
    likesCount: 670,
    commentsCount: 31,
    viewsCount: 3100,
    isLiked: false,
    isBookmarked: false,
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
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

  // Fetch posts with fallback to curated designs
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
      let newPosts = data?.posts || [];

      // If backend returned empty on first load without search, supply curated fallback designs
      if (pageNum === 1 && newPosts.length === 0) {
        let filtered = [...CURATED_COMMUNITY_POSTS];
        if (category !== 'all') {
          filtered = filtered.filter((p) => p.category === category);
        }
        if (debouncedSearch) {
          const q = debouncedSearch.toLowerCase();
          filtered = filtered.filter((p) => p.caption.toLowerCase().includes(q) || p.user.name.toLowerCase().includes(q));
        }
        if (sort === 'popular') filtered.sort((a, b) => b.likesCount - a.likesCount);
        if (sort === 'trending') filtered.sort((a, b) => b.viewsCount - a.viewsCount);
        newPosts = filtered;
      }

      setPosts((prev) => reset || pageNum === 1 ? newPosts : [...prev, ...newPosts]);
      setHasMore(data?.pagination?.pages ? pageNum < data.pagination.pages : false);
      setPage(pageNum);
    } catch (err) {
      // Graceful fallback on network/backend error
      let filtered = [...CURATED_COMMUNITY_POSTS];
      if (category !== 'all') {
        filtered = filtered.filter((p) => p.category === category);
      }
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        filtered = filtered.filter((p) => p.caption.toLowerCase().includes(q) || p.user.name.toLowerCase().includes(q));
      }
      if (sort === 'popular') filtered.sort((a, b) => b.likesCount - a.likesCount);
      if (sort === 'trending') filtered.sort((a, b) => b.viewsCount - a.viewsCount);
      setPosts(filtered);
      setHasMore(false);
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
                className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all duration-200 ${category === cat ? 'bg-brand-500 text-white shadow-sm' : 'text-dark-400 hover:text-brand-500 hover:bg-brand-500/10'}`}
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
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${sort === id ? 'bg-brand-500 text-white shadow-sm' : 'text-dark-400 hover:text-brand-500 hover:bg-brand-500/10'}`}
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
