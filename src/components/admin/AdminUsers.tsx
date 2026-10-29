import React, { useState } from 'react';
import { useSMM } from '../../context/SMMContext';
import { User } from '../../types/smm';
import {
  Users,
  Search,
  PlusCircle,
  DollarSign,
  Percent,
  Shield,
  Ban,
  CheckCircle2,
  X,
  Wallet,
  Key,
  Trash2
} from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const {
    users,
    services,
    formatCurrency,
    adjustUserBalance,
    updateUserStatus,
    setUserCustomRate,
    regenerateApiKey
  } = useSMM();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserForBalance, setSelectedUserForBalance] = useState<User | null>(null);
  const [balanceAmount, setBalanceAmount] = useState<number>(50);
  const [balanceAction, setBalanceAction] = useState<'add' | 'deduct'>('add');
  const [balanceReason, setBalanceReason] = useState('Manual admin adjustment');

  const [selectedUserForRate, setSelectedUserForRate] = useState<User | null>(null);
  const [targetServiceId, setTargetServiceId] = useState<number>(services[0]?.id || 101);
  const [customRate, setCustomRate] = useState<string>('1.10');

  const [feedback, setFeedback] = useState<string | null>(null);

  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    return (
      u.username.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term)
    );
  });

  const handleApplyBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForBalance) return;

    const delta = balanceAction === 'add' ? balanceAmount : -balanceAmount;
    adjustUserBalance(selectedUserForBalance.id, delta, balanceReason);
    setFeedback(`Adjusted balance for ${selectedUserForBalance.username} by ${delta >= 0 ? '+' : ''}$${delta.toFixed(2)}`);
    setSelectedUserForBalance(null);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleApplyCustomRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForRate) return;

    const rateNum = parseFloat(customRate);
    setUserCustomRate(selectedUserForRate.id, targetServiceId, isNaN(rateNum) ? null : rateNum);
    setFeedback(`Custom rate saved for ${selectedUserForRate.username} on service #${targetServiceId}`);
    setSelectedUserForRate(null);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            User Management & Client Accounts
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Credit/deduct client balances, assign VIP discounts, and govern user permissions.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search users by name, email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-lg bg-purple-950/80 border border-purple-800 text-purple-200 text-xs flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-purple-400" />
          {feedback}
        </div>
      )}

      {/* Users Table */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">User ID</th>
                <th className="py-2.5 px-3">Username</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3 text-right">Balance</th>
                <th className="py-2.5 px-3 text-right">Total Spent</th>
                <th className="py-2.5 px-3 text-center">Role</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredUsers.map(user => {
                let statusBadge = 'bg-slate-800 text-slate-300';
                if (user.status === 'active') statusBadge = 'bg-emerald-950 text-emerald-400 border border-emerald-800/50';
                if (user.status === 'suspended') statusBadge = 'bg-amber-950 text-amber-400 border border-amber-800/50';
                if (user.status === 'banned') statusBadge = 'bg-rose-950 text-rose-400 border border-rose-800/50';

                return (
                  <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-300">#{user.id}</td>
                    <td className="py-3 px-3 font-sans font-semibold text-white">
                      {user.username}
                      {user.customRates && Object.keys(user.customRates).length > 0 && (
                        <span className="ml-1.5 px-1.5 py-0.2 rounded text-[10px] bg-purple-950 text-purple-300 border border-purple-800">
                          VIP Discount
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-400 truncate max-w-[160px]">
                      {user.email}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-400 tabular-nums">
                      {formatCurrency(user.balance)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300 tabular-nums">
                      {formatCurrency(user.spent)}
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                        user.role === 'admin'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${statusBadge}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Adjust balance */}
                        <button
                          onClick={() => {
                            setSelectedUserForBalance(user);
                            setBalanceAmount(50);
                            setBalanceAction('add');
                          }}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white text-[11px] font-semibold transition-colors flex items-center gap-1"
                          title="Add or Deduct Balance"
                        >
                          <Wallet className="w-3 h-3 text-emerald-400" />
                          Balance
                        </button>

                        {/* Custom rates */}
                        <button
                          onClick={() => {
                            setSelectedUserForRate(user);
                            const existingRate = user.customRates?.[targetServiceId];
                            setCustomRate(existingRate ? String(existingRate) : '1.10');
                          }}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white text-[11px] font-semibold transition-colors flex items-center gap-1"
                          title="Configure Custom Rates"
                        >
                          <Percent className="w-3 h-3 text-purple-400" />
                          Rates
                        </button>

                        {/* Ban / Active toggle */}
                        {user.status === 'banned' ? (
                          <button
                            onClick={() => updateUserStatus(user.id, 'active')}
                            className="px-2 py-1 rounded bg-emerald-950 text-emerald-300 hover:bg-emerald-900 text-[11px] font-semibold border border-emerald-800"
                            title="Unban User"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => updateUserStatus(user.id, 'banned')}
                            className="px-2 py-1 rounded bg-rose-950 text-rose-300 hover:bg-rose-900 text-[11px] font-semibold border border-rose-800"
                            title="Ban User"
                          >
                            <Ban className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Balance Adjustment Modal */}
      {selectedUserForBalance && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedUserForBalance(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              Adjust Balance: {selectedUserForBalance.username}
            </h3>

            <div className="p-3 rounded-lg bg-slate-950 text-xs font-mono">
              <span className="text-slate-500">Current Balance:</span>
              <span className="ml-2 font-bold text-emerald-400">
                {formatCurrency(selectedUserForBalance.balance)}
              </span>
            </div>

            <form onSubmit={handleApplyBalance} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Operation</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBalanceAction('add')}
                    className={`py-2 rounded-lg font-bold transition-colors ${
                      balanceAction === 'add'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    + Add Funds
                  </button>
                  <button
                    type="button"
                    onClick={() => setBalanceAction('deduct')}
                    className={`py-2 rounded-lg font-bold transition-colors ${
                      balanceAction === 'deduct'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    - Deduct Funds
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Amount ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={balanceAmount}
                  onChange={e => setBalanceAmount(parseFloat(e.target.value || '0'))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Audit Reason / Note</label>
                <input
                  type="text"
                  value={balanceReason}
                  onChange={e => setBalanceReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForBalance(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Rates Modal */}
      {selectedUserForRate && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedUserForRate(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Percent className="w-4 h-4 text-purple-400" />
              Custom Discount Rates: {selectedUserForRate.username}
            </h3>

            <p className="text-xs text-slate-400">
              Configure specific rate per 1,000 units for this reseller or high volume client.
            </p>

            <form onSubmit={handleApplyCustomRate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Service</label>
                <select
                  value={targetServiceId}
                  onChange={e => {
                    const sid = Number(e.target.value);
                    setTargetServiceId(sid);
                    const existing = selectedUserForRate.customRates?.[sid];
                    setCustomRate(existing ? String(existing) : '1.00');
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                >
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      #{s.id} - {s.name} (Base: ${s.rate.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Custom Rate / 1,000 units ($ USD)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={customRate}
                  onChange={e => setCustomRate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  placeholder="e.g. 0.95"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForRate(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Save Custom Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
