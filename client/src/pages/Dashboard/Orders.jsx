import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Package, ExternalLink, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { formatPrice, formatDate, ORDER_STATUS_CONFIG } from '@/lib/utils';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get('/orders/my-orders').then(({ data }) => setOrders(data.orders)).catch(() => toast.error('Failed to load orders')).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-brand-500 animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <ShoppingBag className="w-6 h-6 text-brand-400" /> My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <ShoppingBag className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No orders yet</h3>
          <p className="text-dark-400 mb-6">Start creating custom products!</p>
          <Link to="/choose" className="btn-primary inline-flex">Create a Design</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusConf = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.pending;
            const isExpanded = expanded === order._id;

            return (
              <motion.div key={order._id} className="glass-card overflow-hidden" layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="p-5 flex items-center gap-4 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : order._id)}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(99,102,241,0.15)' }}>
                    <Package className="w-6 h-6 text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-white">{order.orderNumber}</p>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusConf.color} ${statusConf.bg} ${statusConf.border}`}>
                        {statusConf.label}
                      </span>
                    </div>
                    <p className="text-xs text-dark-400 mt-0.5">{formatDate(order.createdAt)} · {order.category}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-white">{formatPrice(order.pricing?.total || 0)}</p>
                    <p className="text-xs text-dark-500">×{order.quantity}</p>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-dark-400" /> : <ChevronDown className="w-4 h-4 text-dark-400" />}
                </div>

                {isExpanded && (
                  <motion.div
                    className="border-t border-glass-border p-5 space-y-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-dark-400 text-xs mb-1">Shipping Address</p>
                        <p className="text-dark-200">{order.shippingAddress?.fullName}</p>
                        <p className="text-dark-300 text-xs">{order.shippingAddress?.address}, {order.shippingAddress?.city} {order.shippingAddress?.postalCode}</p>
                      </div>
                      <div>
                        <p className="text-dark-400 text-xs mb-1">Order Details</p>
                        <p className="text-dark-200 capitalize">Material: {order.material}</p>
                        <p className="text-dark-200 capitalize">Print: {order.printArea}</p>
                        {order.trackingNumber && <p className="text-brand-400 text-xs mt-1">Tracking: {order.trackingNumber}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      {order.design && (
                        <Link to={`/studio/${order.category}/${order.design}`} className="btn-secondary text-sm">
                          <ExternalLink className="w-3.5 h-3.5" /> View Design
                        </Link>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
