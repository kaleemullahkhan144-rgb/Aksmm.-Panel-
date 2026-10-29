import React, { useState, useEffect } from 'react';
import { useSMM } from '../../context/SMMContext';
import {
  X,
  Lock,
  User,
  Mail,
  Zap,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Gift
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useSMM();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [identifier, setIdentifier] = useState('kaleem');
  const [email, setEmail] = useState('kaleemullahkhan144@gmail.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [referredBy, setReferredBy] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
        localStorage.setItem('aksmm_invited_by', ref);
        setReferredBy(ref);
        setMode('register');
      } else {
        const savedRef = localStorage.getItem('aksmm_invited_by');
        if (savedRef) setReferredBy(savedRef);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (mode === 'login') {
      const ok = login(identifier.trim(), password);
      if (ok) {
        onClose();
      } else {
        setError('Invalid username or password.');
      }
    } else if (mode === 'register') {
      const ok = register(identifier.trim(), email.trim(), password);
      if (ok) {
        setSuccess('Account created successfully! You are now logged in.');
        setTimeout(() => onClose(), 1200);
      } else {
        setError('Username or email already exists.');
      }
    } else if (mode === 'forgot') {
      setSuccess('Password reset link sent to your email address (Simulated).');
      setTimeout(() => setMode('login'), 2000);
    }
  };

  const handleQuickDemoLogin = (role: 'user' | 'admin') => {
    if (role === 'admin') {
      login('admin', 'password');
    } else {
      login('kaleem', 'password');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-md shadow-indigo-600/30">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-white">
            {mode === 'login' && 'Sign in to ApexSMM'}
            {mode === 'register' && 'Create your SMM Account'}
            {mode === 'forgot' && 'Reset Password'}
          </h3>
          <p className="text-xs text-slate-400">
            {mode === 'login' && 'Access your dashboard, balance, and order history'}
            {mode === 'register' && 'Instant registration with API key generation'}
            {mode === 'forgot' && 'Enter your email to receive recovery instructions'}
          </p>
        </div>

        {referredBy && mode === 'register' && (
          <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs flex items-center gap-2">
            <Gift className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Invited by: <strong className="text-white underline">{referredBy}</strong> (5% Referral Active)
            </span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {mode === 'login' ? 'Username or Email' : 'Username'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="kaleem"
                className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@agency.com"
                  className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          )}

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-indigo-400 hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all mt-1"
          >
            {mode === 'login' && 'Sign In'}
            {mode === 'register' && 'Register Account'}
            {mode === 'forgot' && 'Send Reset Email'}
          </button>
        </form>

        {/* Quick Demo Login options for seamless reviewer testing */}
        <div className="pt-2 border-t border-slate-800">
          <span className="text-[10px] text-slate-500 block text-center mb-2 font-semibold uppercase tracking-wider">
            1-Click Demo Profiles
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickDemoLogin('user')}
              className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-[11px] font-semibold border border-slate-700 transition-colors"
            >
              Demo Client (Kaleem)
            </button>
            <button
              onClick={() => handleQuickDemoLogin('admin')}
              className="py-1.5 px-2 rounded-lg bg-purple-950 hover:bg-purple-900 text-purple-200 text-[11px] font-semibold border border-purple-800 transition-colors"
            >
              Admin Master
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 pt-1">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => setMode('register')}
                className="text-indigo-400 hover:underline font-semibold"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-indigo-400 hover:underline font-semibold"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
