import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBag, Palette, Image, RefreshCw, Heart, Settings,
  LayoutDashboard, TrendingUp, ChevronRight, Sparkles, X, Menu,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, getInitials, stringToColor } from '@/lib/utils';
import api from '@/lib/axios';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'orders', label: 'Orders', icon: ShoppingBag, href: '/dashboard/orders' },
  { id: 'designs', label: 'My Designs', icon: Palette, href: '/dashboard/designs' },
  { id: 'posts', label: 'My Posts', icon: Image, href: '/dashboard/posts' },
  { id: 'refunds', label: 'Refunds', icon: RefreshCw, href: '/dashboard/refunds' },
  { id: 'wishlist', label: 'Wishlist', icon: Heart, href: '/dashboard/wishlist' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

const Dashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    api.get('/users/dashboard-stats').then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  const activeTab = TABS.find((t) => t.href === location.pathname) || TABS[0];

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />
      <div className="pt-16 flex">
        {/* Sidebar */}
        <aside className={`fixed left-0 top-16 bottom-0 w-64 border-r border-glass-border bg-dark-950/90 backdrop-blur-xl z-20 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
          {/* User info */}
          <div className="p-5 border-b border-glass-border">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                style={{ background: user?.avatar ? undefined : stringToColor(user?.name || '') }}
              >
                {user?.avatar ? <img src={user.avatar} alt="" className="w-10 h-10 rounded-xl object-cover" /> : getInitials(user?.name || '')}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-dark-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          {stats && (
            <div className="grid grid-cols-2 gap-2 p-4 border-b border-glass-border">
              <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(99,102,241,0.08)' }}>
                <p className="text-lg font-bold text-brand-400">{stats.stats.orderCount}</p>
                <p className="text-xs text-dark-500">Orders</p>
              </div>
              <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(139,92,246,0.08)' }}>
                <p className="text-lg font-bold text-purple-400">{stats.stats.designCount}</p>
                <p className="text-xs text-dark-500">Designs</p>
              </div>
            </div>
          )}

          {/* Nav links */}
          <nav className="p-3 space-y-1">
            {TABS.map(({ id, label, icon: Icon, href }) => (
              <Link
                key={id}
                to={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab.id === id ? 'bg-brand-500/20 text-brand-300 border border-brand-500/20' : 'text-dark-400 hover:text-white hover:bg-white/5'}`}
              >
                <Icon className={`w-4 h-4 ${activeTab.id === id ? 'text-brand-400' : 'text-dark-500'}`} />
                {label}
                {activeTab.id === id && <ChevronRight className="w-3.5 h-3.5 ml-auto text-brand-500" />}
              </Link>
            ))}
          </nav>

          <div className="p-4 absolute bottom-0 left-0 right-0 border-t border-glass-border">
            <Link to="/choose" className="btn-primary w-full justify-center text-sm">
              <Sparkles className="w-4 h-4" /> New Design
            </Link>
          </div>
        </aside>

        {/* Mobile sidebar toggle */}
        <button className="lg:hidden fixed bottom-6 left-6 z-30 w-12 h-12 rounded-full flex items-center justify-center shadow-glow" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
        </button>

        {/* Overlay for mobile */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-10 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Main content */}
        <main className="flex-1 lg:ml-64 p-6 min-h-screen">
          <Outlet context={{ stats }} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
