import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Grid3X3, Heart, Palette, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import PostCard from '@/components/explore/PostCard';
import { useAuth } from '@/context/AuthContext';
import { formatCount, getInitials, stringToColor, timeAgo } from '@/lib/utils';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const isOwnProfile = currentUser?._id === id || currentUser?.id === id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, postsRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/posts/user/${id}`),
        ]);
        setProfile(profileRes.data.user);
        setPosts(postsRes.data.posts);
        setIsFollowing(profileRes.data.user.followers?.includes(currentUser?._id));
      } catch {
        toast.error('Profile not found');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handleFollow = async () => {
    if (!isAuthenticated) { toast.error('Sign in to follow'); return; }
    setIsToggling(true);
    try {
      const { data } = await api.post(`/users/${id}/follow`);
      setIsFollowing(data.isFollowing);
      setProfile((p) => ({
        ...p,
        followers: data.isFollowing
          ? [...(p.followers || []), currentUser._id]
          : (p.followers || []).filter((fId) => fId !== currentUser._id),
      }));
    } catch {
      toast.error('Failed to update follow');
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen mesh-bg flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />
      <div className="section-container pt-24 pb-16">
        {/* Profile header */}
        <motion.div
          className="glass-card p-8 mb-8 relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(99,102,241,0.08) 0%, transparent 60%)' }} />
          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-2xl font-black text-white flex-shrink-0"
              style={{
                background: profile?.avatar ? undefined : stringToColor(profile?.name || ''),
                boxShadow: '0 0 0 3px rgba(99,102,241,0.4), 0 0 20px rgba(99,102,241,0.2)',
              }}
            >
              {profile?.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-24 h-24 rounded-2xl object-cover" />
              ) : (
                getInitials(profile?.name || '')
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-white mb-1">{profile?.name}</h1>
              {profile?.bio && <p className="text-dark-400 text-sm mb-4">{profile.bio}</p>}

              <div className="flex items-center justify-center sm:justify-start gap-6 mb-4 text-sm">
                <div className="text-center">
                  <p className="font-bold text-white">{formatCount(profile?.postCount || 0)}</p>
                  <p className="text-dark-400 text-xs">Posts</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-white">{formatCount(profile?.followers?.length || 0)}</p>
                  <p className="text-dark-400 text-xs">Followers</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-white">{formatCount(profile?.following?.length || 0)}</p>
                  <p className="text-dark-400 text-xs">Following</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-white">{formatCount(profile?.designCount || 0)}</p>
                  <p className="text-dark-400 text-xs">Designs</p>
                </div>
              </div>

              {!isOwnProfile && (
                <button
                  onClick={handleFollow}
                  disabled={isToggling}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                >
                  {isToggling ? <Loader2 className="w-4 h-4 animate-spin" /> : isFollowing ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}
              {isOwnProfile && (
                <Link to="/dashboard/settings" className="btn-secondary inline-flex">Edit Profile</Link>
              )}
            </div>
          </div>
        </motion.div>

        {/* Posts grid */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-brand-400" /> Posts
          </h2>
          {posts.length === 0 ? (
            <div className="text-center py-16 glass-card rounded-2xl">
              <div className="text-5xl mb-3">📸</div>
              <p className="text-dark-400">{isOwnProfile ? "You haven't posted anything yet." : "No posts yet."}</p>
              {isOwnProfile && <Link to="/choose" className="btn-primary inline-flex mt-4">Create Your First Design</Link>}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {posts.map((post) => <PostCard key={post._id} post={post} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
