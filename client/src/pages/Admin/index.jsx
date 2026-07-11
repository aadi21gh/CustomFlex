import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Users, ShoppingBag, RefreshCw, BarChart2,
  CheckCircle2, XCircle, Search, Edit2, Loader2, ArrowRight,
  TrendingUp, Clock, Truck, Trophy, Palette,
} from 'lucide-react';
import RewardConfigPanel from './RewardConfig';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, formatDate } from '@/lib/utils';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'stats', label: 'Stats & Revenue', icon: BarChart2 },
  { id: 'users', label: 'Users Manager', icon: Users },
  { id: 'orders', label: 'Orders Manager', icon: ShoppingBag },
  { id: 'designs', label: 'Designs Manager', icon: Palette },
  { id: 'refunds', label: 'Reward Requests', icon: RefreshCw },
  { id: 'reward-config', label: 'Reward Config', icon: Trophy },
];

const AdminPanel = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [refunds, setRefunds] = useState([]);

  // Sub-actions states
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [refundNote, setRefundNote] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'stats') {
        const { data } = await api.get('/admin/stats');
        setStats(data);
      } else if (activeTab === 'users') {
        const { data } = await api.get('/admin/users');
        setUsers(data.users);
      } else if (activeTab === 'orders') {
        const { data } = await api.get('/admin/orders');
        setOrders(data.orders);
      } else if (activeTab === 'refunds') {
        const { data } = await api.get('/admin/refunds');
        setRefunds(data.refunds);
      } else if (activeTab === 'designs') {
        const { data } = await api.get('/admin/designs');
        setDesigns(data.designs);
      }
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUser = async (id, currentActive) => {
    try {
      const { data } = await api.put(`/admin/users/${id}/toggle-active`);
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isActive: data.isActive } : u));
      toast.success(data.message);
    } catch {
      toast.error('Failed to toggle user status');
    }
  };

  const handleUpdateOrderStatus = async (id, status) => {
    try {
      const { data } = await api.put(`/admin/orders/${id}/status`, {
        status,
        ...(trackingInput && { trackingNumber: trackingInput }),
      });
      setOrders((prev) => prev.map((o) => o._id === id ? data.order : o));
      setUpdatingOrderId(null);
      setTrackingInput('');
      toast.success('Order status updated!');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleProcessRefund = async (id, status) => {
    try {
      const { data } = await api.put(`/admin/refunds/${id}/process`, {
        status,
        adminNote: refundNote,
      });
      setRefunds((prev) => prev.map((r) => r._id === id ? data.refund : r));
      setRefundNote('');
      toast.success(`Refund request ${status}`);
    } catch {
      toast.error('Failed to process refund');
    }
  };

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />
      <div className="section-container pt-24 pb-16">
        {/* Title */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
            <Shield className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Admin Control Center
            </h1>
            <p className="text-dark-400 text-sm">System oversight, user security, order fulfillment, and refund requests.</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-glass-border mb-8 gap-2 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all border-b-2 ${
                activeTab === t.id
                  ? 'text-purple-400 border-purple-500'
                  : 'text-dark-400 hover:text-white border-transparent'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {/* Stats Tab */}
            {activeTab === 'stats' && stats && (
              <div className="space-y-8">
                {/* Mini Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Revenue', value: formatPrice(stats.stats.totalRevenue), color: '#10b981' },
                    { label: 'Total Users', value: stats.stats.userCount, color: '#6366f1' },
                    { label: 'Total Orders', value: stats.stats.orderCount, color: '#8b5cf6' },
                    { label: 'Pending Refunds', value: stats.stats.pendingRefunds, color: '#f59e0b' },
                  ].map((card) => (
                    <div key={card.label} className="glass-card p-5">
                      <p className="text-xs text-dark-400 font-medium mb-1">{card.label}</p>
                      <p className="text-2xl font-black text-white" style={{ color: card.color }}>{card.value}</p>
                    </div>
                  ))}
                </div>

                {/* Category breakdown */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Breakdown by Category</h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {stats.categoryBreakdown?.map((cat) => (
                      <div key={cat._id} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <p className="text-sm font-semibold text-white capitalize">{cat._id}</p>
                        <p className="text-xs text-dark-400 mt-1">Orders: {cat.count}</p>
                        <p className="text-lg font-bold text-brand-400 mt-1">{formatPrice(cat.revenue)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-glass-border">
                  <h3 className="text-sm font-semibold text-white">All Users</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-glass-border text-dark-400">
                        <th className="p-4 font-semibold">User</th>
                        <th className="p-4 font-semibold">Email</th>
                        <th className="p-4 font-semibold">Role</th>
                        <th className="p-4 font-semibold">Joined</th>
                        <th className="p-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id} className="border-b border-glass-border hover:bg-white/5 transition-colors">
                          <td className="p-4 text-white font-medium">{u.name}</td>
                          <td className="p-4 text-dark-300">{u.email}</td>
                          <td className="p-4 uppercase text-xs font-bold text-brand-400">{u.role}</td>
                          <td className="p-4 text-dark-400">{formatDate(u.createdAt)}</td>
                          <td className="p-4">
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => handleToggleUser(u._id, u.isActive)}
                                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                                  u.isActive
                                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                    : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                }`}
                              >
                                {u.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {orders.map((o) => (
                  <div key={o._id} className="glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-semibold text-white">{o.orderNumber}</span>
                        <span className="text-xs text-dark-400 capitalize">· {o.design?.category || 'custom'}</span>
                      </div>
                      <p className="text-xs text-dark-300">Customer: {o.user?.name} ({o.user?.email})</p>
                      <p className="text-xs text-dark-400 mt-1">
                        Material: {o.selectedMaterial?.replace(/-/g, ' ') || 'standard'} · Print Area: {o.selectedPrintArea?.replace(/-/g, ' ') || 'standard'}
                        {o.selectedSize && ` · Size: ${o.selectedSize}`}
                        {o.pricing?.couponCode && (
                          <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full ml-2 font-medium">
                            Coupon: {o.pricing.couponCode} (-{formatPrice(o.pricing.couponDiscount)})
                          </span>
                        )}
                      </p>
                      {o.trackingNumber && <p className="text-xs text-purple-400 mt-1">Tracking: {o.trackingNumber}</p>}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-white">{formatPrice(o.pricing?.total)}</p>
                        <span className="text-xs text-dark-500 capitalize">{o.status}</span>
                      </div>

                      {updatingOrderId === o._id ? (
                        <div className="flex flex-col gap-2">
                          <input
                            type="text"
                            placeholder="Tracking #"
                            value={trackingInput}
                            onChange={(e) => setTrackingInput(e.target.value)}
                            className="input-field !py-1 text-xs w-36"
                          />
                          <div className="flex gap-1.5">
                            <button onClick={() => handleUpdateOrderStatus(o._id, 'shipped')} className="text-2xs px-2 py-1 bg-purple-500 text-white rounded">Ship</button>
                            <button onClick={() => handleUpdateOrderStatus(o._id, 'delivered')} className="text-2xs px-2 py-1 bg-green-500 text-white rounded">Deliver</button>
                            <button onClick={() => setUpdatingOrderId(null)} className="text-2xs px-2 py-1 bg-white/10 text-white rounded">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        ['delivered', 'cancelled', 'refunded'].indexOf(o.status) === -1 && (
                          <button onClick={() => { setUpdatingOrderId(o._id); }} className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1">
                            <Edit2 className="w-3 h-3" /> Status
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Refunds Tab */}
            {activeTab === 'refunds' && (
              <div className="space-y-4">
                {refunds.map((r) => (
                  <div key={r._id} className="glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-semibold text-white">Refund Request</span>
                        <span className="tag text-xs" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', borderColor: 'rgba(245,158,11,0.2)' }}>{r.status}</span>
                      </div>
                      <p className="text-xs text-dark-300">Customer: {r.user?.name} ({r.user?.email})</p>
                      <p className="text-xs text-dark-400 mt-1">Reason: {r.reason}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-white">{formatPrice(r.amount)}</p>
                        <p className="text-xs text-dark-500">{formatDate(r.createdAt)}</p>
                      </div>

                      {r.status === 'pending' && (
                        <div className="flex flex-col gap-2">
                          <input
                            type="text"
                            placeholder="Admin note"
                            value={refundNote}
                            onChange={(e) => setRefundNote(e.target.value)}
                            className="input-field !py-1 text-xs w-44"
                          />
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => handleProcessRefund(r._id, 'approved')} className="text-xs px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button onClick={() => handleProcessRefund(r._id, 'rejected')} className="text-xs px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {refunds.length === 0 && (
                  <p className="text-center py-10 text-dark-400">No reward requests pending</p>
                )}
              </div>
            )}

            {/* Designs Tab */}
            {activeTab === 'designs' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {designs.map((d) => (
                  <div key={d._id} className="glass-card overflow-hidden flex flex-col justify-between h-full hover:border-purple-500/40 transition-colors">
                    <div>
                      <div className="aspect-[4/3] bg-dark-800 relative flex items-center justify-center border-b border-glass-border overflow-hidden group">
                        {d.thumbnail?.url ? (
                          <img src={d.thumbnail.url} alt={d.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        ) : (
                          <div className="text-dark-500 text-sm font-medium">No Preview</div>
                        )}
                        <span className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-dark-900/80 border-glass-border text-dark-200 capitalize">
                          {d.category}
                        </span>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-white truncate text-base" title={d.title}>{d.title}</h4>
                        <p className="text-xs text-dark-400 mt-2 truncate">
                          Owner: <span className="text-white font-medium">{d.user?.name || 'Unknown'}</span>
                        </p>
                        <p className="text-[11px] text-dark-500 truncate mt-0.5">
                          {d.user?.email || 'N/A'}
                        </p>
                        <p className="text-[11px] text-dark-500 mt-2">
                          Created: {formatDate(d.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 pt-0 border-t border-glass-border/30 flex items-center justify-between mt-4">
                      <span className="text-xs font-semibold text-brand-400">
                        Purchases: {d.purchaseCount || 0}
                      </span>
                      <a href={`/studio/${d.category}/${d._id}`} target="_blank" rel="noopener noreferrer" className="btn-secondary !py-1 !px-2.5 text-xs flex items-center gap-1">
                        View Studio <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
                {designs.length === 0 && (
                  <p className="col-span-full text-center py-10 text-dark-400">No user designs found</p>
                )}
              </div>
            )}

            {/* Reward Config Tab */}
            {activeTab === 'reward-config' && <RewardConfigPanel />}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
