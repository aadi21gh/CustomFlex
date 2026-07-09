import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Menu, X, Bell, User, LogOut, Settings, LayoutDashboard,
  ChevronDown, Shield, Palette,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getInitials, stringToColor } from '@/lib/utils';

const navLinks = [
  { label: 'Explore', href: '/explore' },
  { label: 'Create', href: '/choose' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-dark-950/90 backdrop-blur-xl border-b border-glass-border shadow-glass'
            : 'bg-transparent'
        }`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="section-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', filter: 'blur(8px)' }} />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Custom<span className="gradient-text">Flex</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === link.href
                      ? 'text-white bg-white/10'
                      : 'text-dark-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-purple-400 hover:text-white hover:bg-purple-500/10 transition-all duration-200 flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin
                </Link>
              )}
            </div>

            {/* Right section */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {/* User menu */}
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all duration-200 hover:bg-white/5"
                    >
                      <div
                        className="avatar w-8 h-8 flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: user?.avatar ? undefined : stringToColor(user?.name || '') }}
                      >
                        {user?.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          getInitials(user?.name || '')
                        )}
                      </div>
                      <span className="text-sm font-medium text-dark-200">{user?.name?.split(' ')[0]}</span>
                      <ChevronDown className={`w-4 h-4 text-dark-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          className="absolute right-0 top-full mt-2 w-56 glass-card-strong rounded-xl overflow-hidden"
                          initial={{ opacity: 0, y: -8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                        >
                          <div className="p-3 border-b border-glass-border">
                            <p className="text-sm font-semibold text-white">{user?.name}</p>
                            <p className="text-xs text-dark-400 truncate">{user?.email}</p>
                          </div>
                          <div className="p-1.5">
                            {[
                              { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
                              { icon: Palette, label: 'My Designs', href: '/dashboard/designs' },
                              { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
                            ].map(({ icon: Icon, label, href }) => (
                              <Link key={href} to={href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark-300 hover:text-white hover:bg-white/5 transition-colors">
                                <Icon className="w-4 h-4" />
                                {label}
                              </Link>
                            ))}
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              Log Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/auth/login" className="btn-ghost text-sm">Log In</Link>
                  <Link to="/auth/register" className="btn-primary !py-2 !px-5 text-sm">Get Started</Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden toolbar-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="md:hidden border-t border-glass-border bg-dark-950/95 backdrop-blur-xl"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="section-container py-4 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-dark-200 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" className="px-4 py-3 rounded-xl text-sm font-medium text-dark-200 hover:text-white hover:bg-white/5 transition-colors">Dashboard</Link>
                    <button onClick={handleLogout} className="px-4 py-3 rounded-xl text-sm font-medium text-red-400 text-left hover:bg-red-500/10 transition-colors">Log Out</button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 pt-2 border-t border-glass-border">
                    <Link to="/auth/login" className="btn-secondary w-full justify-center">Log In</Link>
                    <Link to="/auth/register" className="btn-primary w-full justify-center">Get Started</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Click outside handler */}
      {(userMenuOpen || notifOpen) && (
        <div className="fixed inset-0 z-30" onClick={() => { setUserMenuOpen(false); setNotifOpen(false); }} />
      )}
    </>
  );
};

export default Navbar;
