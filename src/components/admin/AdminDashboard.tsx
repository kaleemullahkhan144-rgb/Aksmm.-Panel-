import React, { useState } from 'react';
import { useSMM } from '../../context/SMMContext';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Server,
  ShoppingBag,
  CreditCard,
  RefreshCw,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const {
    users,
    orders,
    payments,
    apiProviders,
    formatCurrency,
    runAutomatedCron
  } = useSMM();

  const [cronNotice, setCronNotice] = useState<string | null>(null);

  // Analytics Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + o.charge, 0);
  // Estimate cost from providers (assuming 60% average wholesale provider cost)
  const totalWholesaleCost = totalRevenue * 0.55;
  const estimatedProfit = totalRevenue - totalWholesaleCost;
  const activeUsersCount = users.filter(u => u.status === 'active').length;
  const totalProviderBalance = apiProviders.reduce((sum, p) => sum + p.balance, 0);
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Processing');

  const handleCron = () => {
    const res = runAutomatedCron();
    setCronNotice(`Executed Cron Runner: ${res.forwarded} pending orders forwarded, ${res.synced} in-progress orders updated!`);
    setTimeout(() => setCronNotice(null), 4000);
  };

  // Mock 7-day order distribution
  const orderVolumeDays = [
    { day: 'Mon', count: 18, revenue: 42.5 },
    { day: 'Tue', count: 24, revenue: 68.0 },
    { day: 'Wed', count: 31, revenue: 95.2 },
    { day: 'Thu', count: 28, revenue: 84.1 },
    { day: 'Fri', count: 45, revenue: 142.0 },
    { day: 'Sat', count: 52, revenue: 168.4 },
    { day: 'Sun', count: 39, revenue: 110.0 },
  ];

  const maxVolume = Math.max(...orderVolumeDays.map(d => d.count));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Admin Master Analytics & Control Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time platform financial statistics, provider API balances, and order pipelines.
          </p>
        </div>

        {/* Cron Runner Trigger */}
        <button
          onClick={handleCron}
          className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Trigger Automated Cron Cycle
        </button>
      </div>

      {cronNotice && (
        <div className="p-3.5 rounded-lg bg-purple-950/80 border border-purple-800 text-purple-200 text-xs flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-purple-400" />
          {cronNotice}
        </div>
      )}

      {/* Pending payments alert if any */}
      {pendingPayments.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold text-amber-200">
                {pendingPayments.length} Pending Local Payment Request{pendingPayments.length > 1 ? 's' : ''} (EasyPaisa/JazzCash)
              </p>
              <p className="text-slate-400 mt-0.5">
                Users are awaiting manual transaction ID approval to credit their account balances.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('admin-payments')}
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shrink-0 flex items-center gap-1 shadow-sm"
          >
            Review & Approve
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estimated Profit */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Estimated Gross Profit</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800/40">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-emerald-400 font-mono tabular-nums">
              {formatCurrency(estimatedProfit)}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Based on ~45% markup over wholesale
            </p>
          </div>
        </div>

        {/* Total Platform Turnover */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Client Orders Volume</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-950 text-indigo-400 flex items-center justify-center border border-indigo-800/40">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {orders.length} total client transactions
            </p>
          </div>
        </div>

        {/* Active Users */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Registered Clients</span>
            <div className="w-8 h-8 rounded-lg bg-purple-950 text-purple-400 flex items-center justify-center border border-purple-800/40">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-purple-400 font-mono tabular-nums">
              {activeUsersCount}
            </div>
            <button
              onClick={() => onNavigate('admin-users')}
              className="mt-1 text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
            >
              Manage Users & Rates <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Provider API Balances */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>API Providers Balance</span>
            <div className="w-8 h-8 rounded-lg bg-blue-950 text-blue-400 flex items-center justify-center border border-blue-800/40">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-blue-400 font-mono tabular-nums">
              {formatCurrency(totalProviderBalance)}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Across {apiProviders.length} active API nodes
            </p>
          </div>
        </div>
      </div>

      {/* Order Volume Chart & API Nodes Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Order Volume Graph */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                7-Day Order Volume & Throughput
              </h3>
              <p className="text-[11px] text-slate-500">Daily placed client orders</p>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-400">
              {orders.length} orders total
            </span>
          </div>

          <div className="pt-6 pb-2 grid grid-cols-7 gap-3 items-end h-44 border-b border-slate-800">
            {orderVolumeDays.map(item => {
              const heightPercent = Math.round((item.count / maxVolume) * 100);
              return (
                <div key={item.day} className="flex flex-col items-center gap-2 group">
                  <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                    {item.count}
                  </div>
                  <div className="w-full max-w-[36px] bg-slate-800 rounded-t-md relative overflow-hidden flex items-end h-28">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-md transition-all group-hover:brightness-125"
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">{item.day}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
            <span>Average: ~34 orders/day</span>
            <span className="text-emerald-400 font-bold">+18.4% WoW Growth</span>
          </div>
        </div>

        {/* API Providers Status Card */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-4 h-4 text-purple-400" />
                API Providers Status
              </h3>
              <button
                onClick={() => onNavigate('admin-providers')}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
              >
                Manage
              </button>
            </div>

            <div className="space-y-3">
              {apiProviders.map(prov => (
                <div key={prov.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between font-semibold text-white">
                    <span className="truncate max-w-[150px]">{prov.name}</span>
                    <span className="text-emerald-400 font-mono">${prov.balance.toFixed(2)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="truncate max-w-[140px] font-mono">{prov.url.replace('https://', '')}</span>
                    <span className="text-indigo-400">Synced {prov.lastSync?.split(' ')[1] || 'Just now'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-200">Cron Jobs Guide:</span>
            <p>Ensure `cron/orders.php` runs every 1 min and `cron/status.php` runs every 2 mins in your cPanel.</p>
            <button
              onClick={() => onNavigate('admin-deployment')}
              className="text-purple-400 hover:underline font-bold text-[11px] block mt-1"
            >
              View cPanel Cron Setup Commands &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
