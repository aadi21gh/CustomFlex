import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const cachedUser = localStorage.getItem('user');

      if (token && cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
          setIsAuthenticated(true);
          // Verify token is still valid
          const { data } = await api.get('/auth/me');
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore logout errors
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  }, []);

  const updateUser = useCallback((updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  }, [user]);

  // Handle Google OAuth token from URL params
  const handleGoogleCallback = useCallback(async (token) => {
    localStorage.setItem('token', token);
    const { data } = await api.get('/auth/me');
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    setIsAuthenticated(true);
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    handleGoogleCallback,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
