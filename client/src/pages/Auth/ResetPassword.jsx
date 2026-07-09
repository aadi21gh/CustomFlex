import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/utils';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!password || password.length < 6) errs.password = 'Minimum 6 characters';
    if (password !== confirm) errs.confirm = 'Passwords do not match';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setIsLoading(true);
    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      toast.success('Password reset successfully!');
      navigate('/auth/login');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
      <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}><Sparkles className="w-5 h-5 text-white" /></div>
          <span className="text-2xl font-bold text-white">Custom<span className="gradient-text">Flex</span></span>
        </Link>
        <div className="glass-card-strong p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
              <Lock className="w-8 h-8 text-brand-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Set new password</h1>
            <p className="text-dark-400 text-sm">Choose a strong password for your account</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="reset-password" label="New Password" type={showPassword ? 'text' : 'password'} placeholder="At least 6 characters" value={password} onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }} error={errors.password} leftIcon={<Lock className="w-4 h-4" />} rightIcon={<button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-white transition-colors">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>} required />
            <Input id="reset-confirm" label="Confirm Password" type={showPassword ? 'text' : 'password'} placeholder="Repeat password" value={confirm} onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: '' })); }} error={errors.confirm} leftIcon={<Lock className="w-4 h-4" />} rightIcon={confirm && password === confirm ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : null} required />
            <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">Reset Password</Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
