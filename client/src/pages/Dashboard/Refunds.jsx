import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RefreshCw, TrendingUp, Clock, CheckCircle2, XCircle, Loader2, AlertCircle, Plus } from 'lucide-react';
import { formatPrice, timeAgo, REFUND_STATUS_CONFIG } from '@/lib/utils';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const Refunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [eligibleOrders, setEligibleOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/refunds/my-refunds'),
      api.get('/orders/my-orders?status=refund_eligible'),
    ]).then(([refundsRes, ordersRes]) => {
      setRefunds(refundsRes.data.refunds);
      setEligibleOrders(ordersRes.data.orders || []);
    }).catch(() => toast.error('Failed to load refund data')).finally(() => setIsLoading(false));
  }, []);

  const requestRefund = async (orderId) => {
    try {
      const { data } = await api.post('/refunds', { orderId, reason: 'Social engagement threshold reached' });
      setRefunds((prev) => [data.refund, ...prev]);
      setEligibleOrders((prev) => prev.filter((o) => o._id !== orderId));
      toast.success('Refund request submitted!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to request refund');
    }
  };

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-brand-500 animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <RefreshCw className="w-6 h-6 text-brand-400" /> My Refunds
      </h1>
      <p className="text-dark-400 text-sm mb-6">Track your refund requests and see which orders are eligible.</p>

      {/* Info box */}
      <div className="p-4 rounded-xl mb-6 flex items-start gap-3" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <AlertCircle className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-white font-medium">How refunds work</p>
          <p className="text-xs text-dark-400 mt-1">Post your custom product purchase publicly. When your post receives likes ≥ the product price AND 2+ other users purchase the same design, your order becomes eligible for a full refund.</p>
        </div>
      </div>

      {/* Eligible orders */}
      {eligibleOrders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Eligible for Refund
          </h2>
          <div className="space-y-3">
            {eligibleOrders.map((order) => (
              <div key={order._id} className="glass-card p-5 flex items-center gap-4 border border-emerald-500/20">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{order.orderNumber}</p>
                  <p className="text-xs text-dark-400 capitalize">{order.category} · {timeAgo(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-400">{formatPrice(order.pricing?.total || 0)}</p>
                  <button onClick={() => requestRefund(order._id)} className="mt-1 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors font-semibold">
                    Request Refund
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All refunds */}
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-brand-400" /> Refund History
      </h2>
      {refunds.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <RefreshCw className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No refunds yet</h3>
          <p className="text-dark-400 mb-6">Purchase a product and share it publicly to start earning refunds!</p>
          <Link to="/choose" className="btn-primary inline-flex">Create a Design</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {refunds.map((refund) => {
            const conf = REFUND_STATUS_CONFIG[refund.status] || REFUND_STATUS_CONFIG.pending;
            return (
              <motion.div key={refund._id} className="glass-card p-5 flex items-center gap-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${conf.bg}`}>
                  {refund.status === 'processed' || refund.status === 'approved' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : refund.status === 'rejected' ? <XCircle className="w-5 h-5 text-red-400" /> : <Clock className="w-5 h-5 text-yellow-400" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white text-sm">Refund Request</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${conf.bg} ${conf.color}`}>{conf.label}</span>
                  </div>
                  <p className="text-xs text-dark-400">{refund.reason} · {timeAgo(refund.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{formatPrice(refund.amount || 0)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Refunds;
