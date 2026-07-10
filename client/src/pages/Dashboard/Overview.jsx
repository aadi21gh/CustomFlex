import { useOutletContext, Link } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag, Palette, RefreshCw, TrendingUp,
  ArrowRight, Package, CheckCircle2, Clock, IndianRupee,
  Users, Sparkles, Heart, AlertCircle
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const StatCard = ({ icon: Icon, label, value, gradient, subtext }) => (
  <div className="glass-card p-5 relative overflow-hidden group hover:shadow-card-hover transition-all duration-300">
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `radial-gradient(ellipse at 0% 100%, ${gradient}08, transparent 60%)` }} />
    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-xs text-dark-400 font-medium mb-2">{label}</p>
        <p className="text-3xl font-black text-white">{value}</p>
        {subtext && (
          <p className="text-xs text-brand-300 font-medium mt-1">
            {subtext}
          </p>
        )}
      </div>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${gradient}20` }}>
        <Icon className="w-5 h-5" style={{ color: gradient }} />
      </div>
    </div>
  </div>
);

const LoaderSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="glass-card p-5 h-28 animate-pulse" />
      ))}
    </div>
    <div className="glass-card p-6 h-40 animate-pulse" />
    <div className="glass-card p-6 h-60 animate-pulse" />
  </div>
);

const Overview = () => {
  const { stats } = useOutletContext() || {};

  if (!stats) {
    return <LoaderSkeleton />;
  }

  const s = stats.stats;
  const recentOrders = stats.recentOrders || [];
  const refundProgress = stats.refundProgress || null;

  const statCards = [
    { icon: ShoppingBag, label: 'Total Orders', value: s?.orderCount || 0, gradient: '#6366f1' },
    { icon: Palette, label: 'Designs Created', value: s?.designCount || 0, gradient: '#8b5cf6' },
    { icon: IndianRupee, label: 'Total Spent', value: formatPrice(s?.totalSpent || 0), gradient: '#ec4899' },
    { 
      icon: RefreshCw, 
      label: 'Rewards Earned', 
      value: formatPrice(s?.totalRefunded || 0), 
      gradient: '#10b981',
      subtext: s?.pendingRewards > 0 ? `₹${s.pendingRewards} pending review` : undefined
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard Overview</h1>
        <p className="text-dark-400 text-sm">Welcome back! Here is what's happening with your creator profile.</p>
      </div>

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" 
        initial="hidden" 
        animate="visible" 
        variants={{ visible: { transition: { staggerChildren: 0.1 } }, hidden: {} }}
      >
        {statCards.map((card) => (
          <motion.div key={card.label} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <StatCard {...card} />
          </motion.div>
        ))}
      </motion.div>

      {/* Dual Eligibility Tracker for Active Design */}
      {refundProgress && (
        <motion.div
          className="glass-card p-6 mb-6 relative overflow-hidden"
          style={{ border: '1px solid rgba(16,185,129,0.2)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none" style={{ background: 'radial-gradient(circle, #10b981, transparent 70%)' }} />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base">Reward Eligibility Status</h3>
                <p className="text-xs text-dark-500">Design: <span className="text-brand-300 font-semibold">{refundProgress.designTitle}</span></p>
              </div>
            </div>
            <span className="tag !bg-emerald-500/10 !border-emerald-500/35 !text-emerald-400 text-xs py-1 px-3 self-start sm:self-center font-bold">
              Progressing ✨
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-4">
            {/* Left Metirc: Likes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-dark-400 font-semibold flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
                  Community Likes
                </span>
                <span className="text-white font-bold tabular-nums">
                  {refundProgress.likesCount} / {refundProgress.likeThreshold}
                </span>
              </div>
              <div className="w-full h-2.5 bg-dark-900 border border-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #ec4899, #8b5cf6)' }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${Math.min((refundProgress.likesCount / refundProgress.likeThreshold) * 100, 100)}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Right Metric: Unique Purchasers */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-dark-400 font-semibold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  Unique Buyers (incl. self)
                </span>
                <span className="text-white font-bold tabular-nums">
                  {refundProgress.uniquePurchasers} / {refundProgress.requiredPurchasers}
                </span>
              </div>
              <div className="w-full h-2.5 bg-dark-900 border border-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #3b82f6, #06b6d4)' }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${Math.min((refundProgress.uniquePurchasers / refundProgress.requiredPurchasers) * 100, 100)}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-start sm:items-center gap-2 mt-4 pt-3 border-t border-glass-border">
            <AlertCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-xs sm:text-sm text-dark-300 font-medium">
              {refundProgress.message}
            </p>
          </div>
        </motion.div>
      )}

      {/* Recent orders */}
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-400" /> Recent Orders
          </h3>
          <Link to="/dashboard/orders" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-10">
            <ShoppingBag className="w-10 h-10 text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400 text-sm">No orders placed yet</p>
            <Link to="/choose" className="btn-primary inline-flex mt-4 text-sm gap-1.5">
              <Sparkles className="w-4 h-4" /> Create Your First Design
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ background: 'rgba(99,102,241,0.15)' }}>
                  {order.product?.emoji || '🎁'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{order.orderNumber}</p>
                  <p className="text-xs text-dark-400 capitalize">{order.product?.name || order.category}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-white">{formatPrice(order.pricing?.total || 0)}</p>
                  <span className={`text-2xs font-bold px-2 py-0.5 rounded-full capitalize ${
                    order.status === 'delivered' ? 'bg-green-500/15 text-green-400' :
                    order.status === 'shipped' ? 'bg-cyan-500/15 text-cyan-400' :
                    order.status === 'processing' ? 'bg-purple-500/15 text-purple-400' :
                    'bg-yellow-500/15 text-yellow-400'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Overview;
