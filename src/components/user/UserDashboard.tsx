import React from 'react';
import { useSMM } from '../../context/SMMContext';
import {
  Wallet,
  ShoppingBag,
  Clock,
  CheckCircle,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  PlusCircle,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

interface UserDashboardProps {
  onNavigate: (view: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onNavigate }) => {
  const { currentUser, orders, services, formatCurrency, settings } = useSMM();

  if (!currentUser) return null;

  const userOrders = orders.filter(o => o.userId === currentUser.id);
  const pendingOrders = userOrders.filter(o => o.status === 'Pending' || o.status === 'Processing');
  const inProgressOrders = userOrders.filter(o => o.status === 'In progress');
  const completedOrders = userOrders.filter(o => o.status === 'Completed');

  const recentOrders = userOrders.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Announcement notice if enabled */}
      {settings.announcement && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-800/50 flex items-start gap-3 text-xs text-indigo-200">
          <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Notice: </span>
            {settings.announcement}
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Balance Card */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Available Balance</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 text-emerald-400 flex items-center justify-center border border-emerald-800/40">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
              {formatCurrency(currentUser.balance)}
            </div>
            <button
              onClick={() => onNavigate('add-funds')}
              className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              Add Funds (EasyPaisa / JazzCash)
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-950/80 text-indigo-400 flex items-center justify-center border border-indigo-800/40">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
              {userOrders.length}
            </div>
            <p className="mt-2 text-xs text-slate-500 font-medium">
              Lifetime placed orders
            </p>
          </div>
        </div>

        {/* In Progress / Pending */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Pending & Active</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 text-amber-400 flex items-center justify-center border border-amber-800/40">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-amber-400 font-mono tabular-nums">
              {pendingOrders.length + inProgressOrders.length}
            </div>
            <p className="mt-2 text-xs text-slate-500 font-medium">
              {pendingOrders.length} in queue · {inProgressOrders.length} delivering
            </p>
          </div>
        </div>

        {/* Total Spent */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Spent</span>
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 text-purple-400 flex items-center justify-center border border-purple-800/40">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
              {formatCurrency(currentUser.spent)}
            </div>
            <p className="mt-2 text-xs text-slate-500 font-medium">
              Completed {completedOrders.length} orders
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Place Order CTA Card */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-900/40 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-900/40 border border-indigo-700/50 text-[11px] font-semibold text-indigo-300">
              <PlusCircle className="w-3.5 h-3.5" />
              Instant Social Growth
            </div>
            <h3 className="mt-3 text-lg font-bold text-white">
              Ready to boost your social media engagement?
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Order real Instagram followers, TikTok views, YouTube watchtime, and Telegram members directly from verified API nodes.
            </p>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={() => onNavigate('new-order')}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Create Single Order
            </button>
            <button
              onClick={() => onNavigate('mass-order')}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              Mass Bulk Order
            </button>
          </div>
        </div>

        {/* Pakistan Gateways Highlight */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-slate-900 to-emerald-950/30 border border-emerald-900/40 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-900/40 border border-emerald-700/50 text-[11px] font-semibold text-emerald-300">
              <CreditCard className="w-3.5 h-3.5" />
              Pakistan Local Gateways
            </div>
            <h3 className="mt-3 text-lg font-bold text-white">
              Instant Deposit with EasyPaisa & JazzCash
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Account Title: <span className="text-emerald-300 font-semibold">{settings.easypaisaTitle}</span> · Number: <span className="text-white font-mono">{settings.easypaisaNumber}</span>. 0% transaction fee and instant verification!
            </p>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={() => onNavigate('add-funds')}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Deposit via EasyPaisa / JazzCash
            </button>
            <button
              onClick={() => onNavigate('services')}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              View Rates Table
            </button>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Orders</h3>
            <p className="text-xs text-slate-500">Your latest social media campaign requests</p>
          </div>
          <button
            onClick={() => onNavigate('orders')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            View All ({userOrders.length})
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-lg">
            <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No orders placed yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Select a service from the New Order page to start growing your presence.
            </p>
            <button
              onClick={() => onNavigate('new-order')}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              Place First Order
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Service</th>
                  <th className="py-2.5 px-3">Link</th>
                  <th className="py-2.5 px-3 text-right">Quantity</th>
                  <th className="py-2.5 px-3 text-right">Cost</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {recentOrders.map(order => {
                  let statusBadge = 'bg-slate-800 text-slate-300';
                  if (order.status === 'Completed') statusBadge = 'bg-emerald-950 text-emerald-400 border border-emerald-800/50';
                  if (order.status === 'In progress') statusBadge = 'bg-indigo-950 text-indigo-300 border border-indigo-800/50';
                  if (order.status === 'Processing') statusBadge = 'bg-blue-950 text-blue-300 border border-blue-800/50';
                  if (order.status === 'Pending') statusBadge = 'bg-amber-950 text-amber-300 border border-amber-800/50';
                  if (order.status === 'Canceled' || order.status === 'Refunded') statusBadge = 'bg-rose-950 text-rose-300 border border-rose-800/50';

                  return (
                    <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-200">#{order.id}</td>
                      <td className="py-3 px-3 text-slate-400 font-sans">{order.createdAt}</td>
                      <td className="py-3 px-3 text-slate-200 font-sans max-w-xs truncate" title={order.serviceName}>
                        {order.serviceName}
                      </td>
                      <td className="py-3 px-3 text-indigo-400 truncate max-w-[140px] font-sans">
                        <a href={order.link} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                          {order.link.replace('https://', '')}
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums text-slate-300">
                        {order.quantity.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-400 tabular-nums">
                        {formatCurrency(order.charge)}
                      </td>
                      <td className="py-3 px-3 text-center font-sans">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${statusBadge}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
