import React, { useState } from 'react';
import { useSMM } from '../context/SMMContext';
import {
  Lock,
  ShieldCheck,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Globe
} from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
  onGoToUserSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onGoToUserSite }) => {
  const { adminLogin } = useSMM();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const ok = adminLogin(username.trim(), password);
      if (ok) {
        onSuccess();
      } else {
        setError('Access Denied: Invalid administrator credentials.');
      }
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 border border-purple-400/40 flex items-center justify-center text-white mx-auto shadow-xl shadow-purple-600/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            AK SMM Panel · Master Admin Center
          </h1>
          <p className="text-xs text-slate-400">
            Isolated Control Center for Owner / Administrator (<span className="text-purple-300 font-mono">/admin</span>)
          </p>
        </div>

        {/* Card */}
        <div className="p-7 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Admin Username / Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Master Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              {isLoading ? 'Verifying Credentials...' : 'Authenticate as Admin'}
            </button>
          </form>

          {/* Quick 1-click test credentials */}
          <div className="pt-3 border-t border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 font-mono block mb-2">
              Demo Credentials: user: <b>admin</b> / pass: <b>password</b>
            </span>
            <button
              onClick={() => {
                setUsername('admin');
                setPassword('password');
                adminLogin('admin', 'password');
                onSuccess();
              }}
              className="text-xs text-purple-400 hover:text-purple-300 font-bold underline"
            >
              1-Click Fast Admin Sign In &rarr;
            </button>
          </div>
        </div>

        {/* Return to user website */}
        <div className="text-center">
          <button
            onClick={onGoToUserSite}
            className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Return to User Website & Dashboard (/)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
