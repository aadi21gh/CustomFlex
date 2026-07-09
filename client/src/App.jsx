import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

// Pages
import Landing from '@/pages/Landing';
import Login from '@/pages/Auth/Login';
import Register from '@/pages/Auth/Register';
import ForgotPassword from '@/pages/Auth/ForgotPassword';
import ResetPassword from '@/pages/Auth/ResetPassword';
import GoogleSuccess from '@/pages/Auth/GoogleSuccess';
import Choose from '@/pages/Choose';
import Explore from '@/pages/Explore';
import PostDetail from '@/pages/PostDetail';
import Profile from '@/pages/Profile';
import CategorySelect from '@/pages/CategorySelect';
import Studio from '@/pages/Studio';
import Checkout from '@/pages/Checkout';
import NotFound from '@/pages/NotFound';

// Dashboard
import Dashboard from '@/pages/Dashboard';
import Overview from '@/pages/Dashboard/Overview';
import Orders from '@/pages/Dashboard/Orders';
import Designs from '@/pages/Dashboard/Designs';
import Posts from '@/pages/Dashboard/Posts';
import Refunds from '@/pages/Dashboard/Refunds';
import Wishlist from '@/pages/Dashboard/Wishlist';
import Settings from '@/pages/Dashboard/Settings';

// Admin
import AdminPanel from '@/pages/Admin';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/explore/post/:id" element={<PostDetail />} />
          <Route path="/profile/:id" element={<Profile />} />

          {/* Auth Routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password/:token" element={<ResetPassword />} />
          <Route path="/auth/google/success" element={<GoogleSuccess />} />

          {/* Protected Routes */}
          <Route path="/choose" element={<ProtectedRoute><Choose /></ProtectedRoute>} />
          <Route path="/customize" element={<ProtectedRoute><CategorySelect /></ProtectedRoute>} />
          <Route path="/studio/:category" element={<ProtectedRoute><Studio /></ProtectedRoute>} />
          <Route path="/studio/:category/:designId" element={<ProtectedRoute><Studio /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />

          {/* Nested Dashboard Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
            <Route index element={<Overview />} />
            <Route path="orders" element={<Orders />} />
            <Route path="designs" element={<Designs />} />
            <Route path="posts" element={<Posts />} />
            <Route path="refunds" element={<Refunds />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Global Toast Notifications */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(16px)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#6366f1',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
};

export default App;
