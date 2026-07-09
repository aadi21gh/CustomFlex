import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Sparkles, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/utils';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email address');
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
      <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">Custom<span className="gradient-text">Flex</span></span>
        </Link>

        <div className="glass-card-strong p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Check your inbox</h2>
              <p className="text-dark-400 text-sm mb-6">
                If <span className="text-white">{email}</span> is registered, you'll receive a password reset link within a few minutes.
              </p>
              <Link to="/auth/login" className="btn-secondary inline-flex"><ArrowLeft className="w-4 h-4" /> Back to Login</Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                  <Mail className="w-8 h-8 text-brand-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Forgot your password?</h1>
                <p className="text-dark-400 text-sm">No worries! Enter your email and we'll send you a reset link.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input id="forgot-email" label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} leftIcon={<Mail className="w-4 h-4" />} required />
                <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
                  <Send className="w-4 h-4" /> Send Reset Link
                </Button>
              </form>
              <p className="text-center text-sm text-dark-400 mt-6">
                <Link to="/auth/login" className="text-brand-400 hover:text-brand-300 inline-flex items-center gap-1.5 transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to login
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
