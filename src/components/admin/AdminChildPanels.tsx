import React, { useState } from 'react';
import { useSMM } from '../../context/SMMContext';
import {
  Globe,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Server,
  DollarSign,
  Users,
  Settings,
  Sparkles
} from 'lucide-react';

export const AdminChildPanels: React.FC = () => {
  const {
    childPanels,
    updateChildPanelStatus,
    settings,
    updateSettings,
    formatCurrency
  } = useSMM();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'suspended'>('all');
  const [feeInput, setFeeInput] = useState<string>(String(settings.childPanelMonthlyFee || 10));
  const [savedFeeMsg, setSavedFeeMsg] = useState(false);

  const filteredPanels = childPanels.filter(p => {
    const matchesSearch = p.domain.toLowerCase().includes(search.toLowerCase()) ||
                          p.username.toLowerCase().includes(search.toLowerCase()) ||
                          p.adminUser.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = childPanels.filter(p => p.status === 'active').length;
  const pendingCount = childPanels.filter(p => p.status === 'pending').length;
  const totalRevenue = activeCount * (settings.childPanelMonthlyFee || 10);

  const handleSaveFee = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(feeInput);
    if (!isNaN(parsed) && parsed >= 0) {
      updateSettings({ childPanelMonthlyFee: parsed });
      setSavedFeeMsg(true);
      setTimeout(() => setSavedFeeMsg(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Globe className="w-4 h-4" />
            <span>Reseller Ecosystem Management</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Child Panels & Partner Websites
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review user-connected custom domains, verify nameserver propagation, and manage monthly rental statuses.
          </p>
        </div>

        {/* Global Monthly Fee Configuration */}
        <form onSubmit={handleSaveFee} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Monthly Rental Fee</span>
            <span className="text-[10px] text-slate-500 font-mono">Current: ${settings.childPanelMonthlyFee || 10}/mo</span>
          </div>
          <div className="relative w-24">
            <span className="absolute left-2.5 top-2 text-slate-500 text-xs font-mono">$</span>
            <input
              type="number"
              step="1"
              min="0"
              value={feeInput}
              onChange={e => setFeeInput(e.target.value)}
              className="w-full pl-6 pr-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Update
          </button>
        </form>
      </div>

      {savedFeeMsg && (
        <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Child panel monthly rental price updated successfully!</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Active Reseller Websites</span>
            <Globe className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{activeCount}</div>
          <div className="text-[10px] text-emerald-400 mt-1">Live and syncing with your API</div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Pending Approvals / DNS</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{pendingCount}</div>
          <div className="text-[10px] text-slate-500 mt-1">Awaiting nameserver propagation</div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Monthly Recurring Revenue</span>
            <DollarSign className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400 font-mono">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">From active child panels</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by domain, user or admin username..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['all', 'pending', 'active', 'suspended'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Child Panels Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Server className="w-4 h-4 text-purple-400" />
            <span>Registered Child Panels ({filteredPanels.length})</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">
            Nameservers: ns1.cheappakpanel.com / ns2.cheappakpanel.com
          </span>
        </div>

        {filteredPanels.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No child panels found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/50">
                  <th className="py-3 px-4">Panel ID</th>
                  <th className="py-3 px-4">Domain URL</th>
                  <th className="py-3 px-4">Client User</th>
                  <th className="py-3 px-4">Admin Username</th>
                  <th className="py-3 px-4">Currency</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPanels.map(panel => (
                  <tr key={panel.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">#{panel.id}</td>
                    <td className="py-3 px-4">
                      <a
                        href={`https://${panel.domain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-white hover:text-purple-400 flex items-center gap-1.5"
                      >
                        {panel.domain}
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-300">
                      @{panel.username}
                    </td>
                    <td className="py-3 px-4 font-mono text-purple-300">
                      {panel.adminUser}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {panel.currency}
                    </td>
                    <td className="py-3 px-4">
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
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {panel.createdAt}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {panel.status !== 'active' && (
                          <button
                            onClick={() => updateChildPanelStatus(panel.id, 'active')}
                            className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white font-semibold text-[11px] transition-colors cursor-pointer"
                            title="Activate & connect"
                          >
                            Activate
                          </button>
                        )}
                        {panel.status !== 'suspended' && (
                          <button
                            onClick={() => updateChildPanelStatus(panel.id, 'suspended')}
                            className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-600 text-amber-300 hover:text-white font-semibold text-[11px] transition-colors cursor-pointer"
                            title="Suspend panel"
                          >
                            Suspend
                          </button>
                        )}
                        {panel.status !== 'canceled' && (
                          <button
                            onClick={() => updateChildPanelStatus(panel.id, 'canceled')}
                            className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white font-semibold text-[11px] transition-colors cursor-pointer"
                            title="Cancel panel"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
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
