import React, { useState } from 'react';
import { useSMM } from '../../context/SMMContext';
import {
  Globe,
  Server,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ChildPanelProps {
  onNavigate?: (tab: string) => void;
}

export const ChildPanel: React.FC<ChildPanelProps> = ({ onNavigate }) => {
  const {
    currentUser,
    childPanels,
    createChildPanel,
    settings,
    formatCurrency
  } = useSMM();

  const [domain, setDomain] = useState('');
  const [adminUser, setAdminUser] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'PKR'>('PKR');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedNs, setCopiedNs] = useState<string | null>(null);

  const monthlyFee = settings.childPanelMonthlyFee || 10.0;
  const userPanels = currentUser ? childPanels.filter(p => p.userId === currentUser.id) : [];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNs(label);
    setTimeout(() => setCopiedNs(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!currentUser) {
      setFeedback({ type: 'error', message: 'You must be logged in to order a child panel website.' });
      return;
    }

    if (!domain.trim()) {
      setFeedback({ type: 'error', message: 'Please enter a valid domain name (e.g. mypanel.pk).' });
      return;
    }

    if (!adminUser.trim()) {
      setFeedback({ type: 'error', message: 'Please enter an admin username for your panel.' });
      return;
    }

    if (!adminPassword || adminPassword.length < 6) {
      setFeedback({ type: 'error', message: 'Admin password must be at least 6 characters.' });
      return;
    }

    const res = createChildPanel({
      domain: domain.trim(),
      adminUser: adminUser.trim(),
      currency
    });

    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setDomain('');
      setAdminUser('');
      setAdminPassword('');
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Globe className="w-4 h-4" />
            <span>Website Friend & Reseller Solution</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Child Panel — Launch Your Own SMM Website
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Want to start your own SMM Panel business like <span className="text-emerald-400 font-semibold">cheappakpanel.com</span>?
            Connect your custom domain and sell all our services under your brand with custom prices and 100% automated API sync!
          </p>
        </div>

        <div className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Monthly Rental Fee</div>
            <div className="text-lg font-black text-white font-mono">
              {formatCurrency(monthlyFee)} <span className="text-xs font-normal text-slate-400">/ month</span>
            </div>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-800 text-emerald-200'
              : 'bg-rose-950/70 border-rose-800 text-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Grid: Order Form + Nameserver Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Server className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Order New Child Panel Website</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Domain Name (Your Website URL)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. fastsmm.pk, socialboost.com"
                  value={domain}
                  onChange={e => setDomain(e.target.value)}
                  className="w-full pl-3.5 pr-20 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2.5 text-[10px] text-slate-500 uppercase font-mono">
                  Domain
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Enter domain without http:// or https://. You must own this domain.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Panel Currency
                </label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value as 'USD' | 'PKR')}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-emerald-500"
                >
                  <option value="PKR">Pakistani Rupee (PKR - Rs.)</option>
                  <option value="USD">US Dollar (USD - $)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Admin Username
                </label>
                <input
                  type="text"
                  placeholder="admin"
                  value={adminUser}
                  onChange={e => setAdminUser(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin Password
              </label>
              <input
                type="password"
                placeholder="Choose a strong password (min 6 characters)"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Price Confirmation */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Charged Today:</span>
              <span className="text-emerald-400 font-bold font-mono text-sm">
                {formatCurrency(monthlyFee)}
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Child Panel Website ({formatCurrency(monthlyFee)})</span>
            </button>
          </form>
        </div>

        {/* DNS & Nameserver Info Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>DNS Configuration</span>
            </div>
            <h4 className="text-base font-bold text-white mb-2">
              Nameservers Setup Instructions
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Before or after ordering, open your domain registrar (GoDaddy, Namecheap, PKNIC) and point your domain to our cloud nameservers:
            </p>

            <div className="mt-4 space-y-2 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 font-sans">Nameserver 1:</div>
                  <div className="text-slate-200 font-semibold">ns1.cheappakpanel.com</div>
                </div>
                <button
                  onClick={() => handleCopy('ns1.cheappakpanel.com', 'ns1')}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Copy"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 font-sans">Nameserver 2:</div>
                  <div className="text-slate-200 font-semibold">ns2.cheappakpanel.com</div>
                </div>
                <button
                  onClick={() => handleCopy('ns2.cheappakpanel.com', 'ns2')}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Copy"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              {copiedNs && (
                <div className="text-center text-[11px] text-emerald-400 font-sans">
                  Copied to clipboard!
                </div>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-900/60 text-xs text-indigo-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              Need Assistance?
            </div>
            <p className="text-[11px] text-indigo-300/90">
              Our support team can configure your nameservers for free via WhatsApp:{' '}
              <span className="text-white font-mono font-bold">{settings.easypaisaNumber}</span>
            </p>
          </div>
        </div>
      </div>

      {/* User's Child Panels List */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            Your Registered Child Panels ({userPanels.length})
          </h3>
        </div>

        {userPanels.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            You don't have any child panel websites yet. Create one above to launch your own SMM business!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Domain URL</th>
                  <th className="py-2.5 px-3">Currency</th>
                  <th className="py-2.5 px-3">Admin Login</th>
                  <th className="py-2.5 px-3">Monthly Fee</th>
                  <th className="py-2.5 px-3">Nameservers</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {userPanels.map(panel => (
                  <tr key={panel.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-400">#{panel.id}</td>
                    <td className="py-3 px-3 font-semibold text-white">
                      <a
                        href={`https://${panel.domain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 underline"
                      >
                        {panel.domain}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                        {panel.currency}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {panel.adminUser}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      ${panel.priceMonthly.toFixed(2)}/mo
                    </td>
                    <td className="py-3 px-3 text-[10px] font-mono text-slate-400">
                      {panel.nameservers.join(', ')}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          panel.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : panel.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        }`}
                      >
                        {panel.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-500 font-mono text-[11px]">
                      {panel.createdAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
