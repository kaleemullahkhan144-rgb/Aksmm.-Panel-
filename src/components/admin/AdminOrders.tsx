import React, { useState } from 'react';
import { useSMM } from '../../context/SMMContext';
import { OrderStatus } from '../../types/smm';
import {
  History,
  Search,
  ExternalLink,
  RotateCcw,
  RefreshCw,
  DollarSign,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const {
    orders,
    formatCurrency,
    updateOrderStatus,
    refundOrder,
    resendOrderToApi
  } = useSMM();

  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const filteredOrders = orders.filter(o => {
    const matchesStatus = filterStatus === 'All' || o.status.toLowerCase() === filterStatus.toLowerCase();
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      String(o.id).includes(term) ||
      o.username.toLowerCase().includes(term) ||
      o.serviceName.toLowerCase().includes(term) ||
      o.link.toLowerCase().includes(term);

    return matchesStatus && matchesSearch;
  });

  const handleRefund = (orderId: number, username: string, charge: number) => {
    if (confirm(`Refund order #${orderId} for client ${username}? This will return $${charge.toFixed(2)} to their account balance.`)) {
      refundOrder(orderId);
      setFeedback(`Order #${orderId} refunded and $${charge.toFixed(2)} credited back to ${username}!`);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleResend = (orderId: number) => {
    resendOrderToApi(orderId);
    setFeedback(`Order #${orderId} resent to upstream API provider successfully!`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const statuses = ['All', 'Pending', 'In progress', 'Completed', 'Partial', 'Canceled', 'Refunded'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-purple-400" />
            Order Queue & Fulfillment Control
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Monitor incoming client orders, forward to API nodes, adjust statuses, and process refunds.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ID, user, link..."
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800">
        {statuses.map(st => {
          const count = st === 'All' ? orders.length : orders.filter(o => o.status.toLowerCase() === st.toLowerCase()).length;
          const isActive = filterStatus === st;
          return (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <span>{st}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-purple-800 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">Client</th>
                <th className="py-2.5 px-3">Service</th>
                <th className="py-2.5 px-3">Target Link</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">Cost</th>
                <th className="py-2.5 px-3">Ext Order ID</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredOrders.map(ord => {
                let statusBadge = 'bg-slate-800 text-slate-300';
                if (ord.status === 'Completed') statusBadge = 'bg-emerald-950 text-emerald-400 border border-emerald-800/50';
                if (ord.status === 'In progress') statusBadge = 'bg-indigo-950 text-indigo-300 border border-indigo-800/50';
                if (ord.status === 'Processing') statusBadge = 'bg-blue-950 text-blue-300 border border-blue-800/50';
                if (ord.status === 'Pending') statusBadge = 'bg-amber-950 text-amber-300 border border-amber-800/50';
                if (ord.status === 'Refunded' || ord.status === 'Canceled') statusBadge = 'bg-rose-950 text-rose-300 border border-rose-800/50';

                return (
                  <tr key={ord.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-bold text-white">#{ord.id}</td>
                    <td className="py-3 px-3 font-sans font-semibold text-slate-200">
                      {ord.username}
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-300 max-w-xs truncate" title={ord.serviceName}>
                      {ord.serviceName}
                    </td>
                    <td className="py-3 px-3 text-indigo-400 truncate max-w-[120px] font-sans">
                      <a href={ord.link} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                        {ord.link.replace('https://', '')}
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300 tabular-nums">
                      {ord.quantity.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-400 tabular-nums">
                      ${ord.charge.toFixed(4)}
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-400">
                      {ord.apiOrderId ? (
                        <span className="text-purple-300 font-mono">{ord.apiOrderId}</span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      <select
                        value={ord.status}
                        onChange={e => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                        className={`text-[11px] font-semibold px-2 py-1 rounded bg-slate-950 border border-slate-700 cursor-pointer ${statusBadge}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="In progress">In progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Partial">Partial</option>
                        <option value="Canceled">Canceled</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </td>
                    <td className="py-3 px-3 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleResend(ord.id)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors"
                          title="Resend to external provider API"
                        >
                          <RefreshCw className="w-3 h-3 text-purple-400" />
                        </button>
                        {ord.status !== 'Refunded' && ord.status !== 'Canceled' && (
                          <button
                            onClick={() => handleRefund(ord.id, ord.username, ord.charge)}
                            className="px-2 py-1 rounded bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800 text-[11px] font-semibold transition-colors"
                            title="Refund cost back to user balance"
                          >
                            Refund
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
    </div>
  );
};
