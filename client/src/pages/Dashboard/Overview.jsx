import { useOutletContext, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBag, Palette, RefreshCw, TrendingUp,
  ArrowRight, Package, CheckCircle2, Clock, DollarSign,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const StatCard = ({ icon: Icon, label, value, gradient, change }) => (
  <div className="glass-card p-5 relative overflow-hidden group hover:shadow-card-hover transition-all duration-300">
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `radial-gradient(ellipse at 0% 100%, ${gradient}08, transparent 60%)` }} />
    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-xs text-dark-400 font-medium mb-2">{label}</p>
        <p className="text-3xl font-black text-white">{value}</p>
        {change !== undefined && (
          <p className={`text-xs mt-1 ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% this month
          </p>
        )}
      </div>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${gradient}20` }}>
        <Icon className="w-5 h-5" style={{ color: gradient }} />
      </div>
    </div>
  </div>
);

const Overview = () => {
  const { stats } = useOutletContext() || {};
  const s = stats?.stats;
  const recentOrders = stats?.recentOrders || [];
  const refundProgress = stats?.refundProgress || null;

  const statCards = [
    { icon: ShoppingBag, label: 'Total Orders', value: s?.orderCount || 0, gradient: '#6366f1' },
    { icon: Palette, label: 'Designs Created', value: s?.designCount || 0, gradient: '#8b5cf6' },
    { icon: DollarSign, label: 'Total Spent', value: formatPrice(s?.totalSpent || 0), gradient: '#ec4899' },
    { icon: RefreshCw, label: 'Refunds Received', value: formatPrice(s?.totalRefunded || 0), gradient: '#10b981' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard Overview</h1>
        <p className="text-dark-400 text-sm">Welcome back! Here's what's happening with your account.</p>
      </div>

      {/* Stats */}
      <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } }, hidden: {} }}>
        {statCards.map((card) => (
          <motion.div key={card.label} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <StatCard {...card} />
          </motion.div>
        ))}
      </motion.div>

      {/* Refund tracker */}
      {refundProgress && (
        <motion.div
          className="glass-card p-6 mb-6 border border-emerald-500/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold text-white">Refund Progress</h3>
            </div>
            <span className="tag" style={{ background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)', color: '#34d399' }}>
              {refundProgress.likesCount}/{refundProgress.likeThreshold} likes
            </span>
          </div>
          <div className="w-full h-3 bg-dark-800 rounded-full overflow-hidden mb-3">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #10b981, #06b6d4)' }}
              initial={{ width: '0%' }}
              animate={{ width: `${Math.min((refundProgress.likesCount / refundProgress.likeThreshold) * 100, 100)}%` }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
            />
          </div>
          <p className="text-sm text-dark-400">{refundProgress.message}</p>
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
            <p className="text-dark-400 text-sm">No orders yet</p>
            <Link to="/choose" className="btn-primary inline-flex mt-4 text-sm">Create Your First Design</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order._id} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
                  <Package className="w-5 h-5 text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{order.orderNumber}</p>
                  <p className="text-xs text-dark-400 capitalize">{order.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{formatPrice(order.pricing?.total || 0)}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
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
