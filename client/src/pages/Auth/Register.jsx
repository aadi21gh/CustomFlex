import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/utils';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Welcome to CustomFlex! 🎨');
      navigate('/choose');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => { window.location.href = '/api/auth/google'; };

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strength = passwordStrength();
  const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 animate-float" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }} />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full opacity-8 animate-float-slow" style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
      </div>

      <motion.div
        className="w-full max-w-md relative"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">Custom<span className="gradient-text">Flex</span></span>
        </Link>

        <div className="glass-card-strong p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-dark-400 text-sm">Start designing custom products for free</p>
          </div>

          <button onClick={handleGoogleLogin} id="google-register-btn" className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-glass-border text-sm font-medium text-dark-200 hover:bg-white/5 hover:text-white transition-all duration-200 mb-6">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-glass-border" /></div>
            <div className="relative flex justify-center"><span className="px-3 text-xs text-dark-500" style={{ background: 'rgba(15, 23, 42, 0.95)' }}>or create with email</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input id="reg-name" label="Full Name" type="text" placeholder="John Doe" value={form.name} onChange={handleChange('name')} error={errors.name} leftIcon={<User className="w-4 h-4" />} required />
            <Input id="reg-email" label="Email Address" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange('email')} error={errors.email} leftIcon={<Mail className="w-4 h-4" />} required />
            <div>
              <Input
                id="reg-password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange('password')}
                error={errors.password}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-white transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < strength ? strengthColors[strength] : 'bg-dark-700'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-dark-500 mt-1">Password strength: <span className="font-medium text-white">{strengthLabels[strength]}</span></p>
                </div>
              )}
            </div>
            <Input id="reg-confirm" label="Confirm Password" type={showPassword ? 'text' : 'password'} placeholder="Repeat your password" value={form.confirm} onChange={handleChange('confirm')} error={errors.confirm} leftIcon={<Lock className="w-4 h-4" />} rightIcon={form.confirm && form.password === form.confirm ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : null} />

            <p className="text-xs text-dark-500">
              By signing up, you agree to our{' '}
              <Link to="/terms" className="text-brand-400 hover:underline">Terms of Service</Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-brand-400 hover:underline">Privacy Policy</Link>.
            </p>

            <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full !py-3.5" id="register-submit-btn">
              Create Account
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-dark-400 mt-6">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-brand-400 font-semibold hover:text-brand-300 transition-colors">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
