import React, { useState, useMemo } from 'react';
import { useSMM } from '../../context/SMMContext';
import { OrderStatus } from '../../types/smm';
import {
  History,
  Search,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  HelpCircle
} from 'lucide-react';

interface OrdersHistoryProps {
  onReorder?: (serviceId: number, link: string, quantity: number) => void;
}

export const OrdersHistory: React.FC<OrdersHistoryProps> = ({ onReorder }) => {
  const { currentUser, orders, formatCurrency, createOrder } = useSMM();

  const [activeStatus, setActiveStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [reorderSuccess, setReorderSuccess] = useState<string | null>(null);

  const userOrders = useMemo(() => {
    if (!currentUser) return [];
    return orders.filter(o => o.userId === currentUser.id);
  }, [orders, currentUser]);

  const filteredOrders = useMemo(() => {
    return userOrders.filter(order => {
      const matchesStatus =
        activeStatus === 'All' ||
        (activeStatus === 'Pending' && (order.status === 'Pending' || order.status === 'Processing')) ||
        order.status.toLowerCase() === activeStatus.toLowerCase();

      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        String(order.id).includes(term) ||
        order.serviceName.toLowerCase().includes(term) ||
        order.link.toLowerCase().includes(term) ||
        order.categoryName.toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [userOrders, activeStatus, searchTerm]);

  const statuses = ['All', 'Pending', 'In progress', 'Completed', 'Partial', 'Canceled', 'Refunded'];

  const getStatusCount = (status: string) => {
    if (status === 'All') return userOrders.length;
    if (status === 'Pending') {
      return userOrders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
    }
    return userOrders.filter(o => o.status.toLowerCase() === status.toLowerCase()).length;
  };

  const copyToClipboard = (id: number) => {
    navigator.clipboard.writeText(String(id));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickReorder = (order: typeof orders[0]) => {
    const res = createOrder({
      serviceId: order.serviceId,
      link: order.link,
      quantity: order.quantity
    });
    if (res.success) {
      setReorderSuccess(`New Order #${res.orderId} successfully placed!`);
      setTimeout(() => setReorderSuccess(null), 3000);
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            Orders History Log
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time delivery progress and execution status for all your campaigns.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ID, link, service..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {reorderSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {reorderSuccess}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800">
        {statuses.map(status => {
          const count = getStatusCount(status);
          const isActive = activeStatus === status;
          return (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{status}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No orders found</p>
            <p className="text-xs text-slate-500 mt-1">
              {searchTerm ? 'Try adjusting your search criteria' : 'You have no orders matching this filter'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Service</th>
                  <th className="py-2.5 px-3">Target Link</th>
                  <th className="py-2.5 px-3 text-right">Quantity</th>
                  <th className="py-2.5 px-3 text-right">Charge</th>
                  <th className="py-2.5 px-3 text-center">Start / Remains</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredOrders.map(order => {
                  let statusBadge = 'bg-slate-800 text-slate-300';
                  if (order.status === 'Completed') statusBadge = 'bg-emerald-950 text-emerald-400 border border-emerald-800/50';
                  if (order.status === 'In progress') statusBadge = 'bg-indigo-950 text-indigo-300 border border-indigo-800/50';
                  if (order.status === 'Processing') statusBadge = 'bg-blue-950 text-blue-300 border border-blue-800/50';
                  if (order.status === 'Pending') statusBadge = 'bg-amber-950 text-amber-300 border border-amber-800/50';
                  if (order.status === 'Canceled' || order.status === 'Refunded') statusBadge = 'bg-rose-950 text-rose-300 border border-rose-800/50';
                  if (order.status === 'Partial') statusBadge = 'bg-orange-950 text-orange-300 border border-orange-800/50';

                  return (
                    <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-bold text-white">
                          <span>#{order.id}</span>
                          <button
                            onClick={() => copyToClipboard(order.id)}
                            className="text-slate-500 hover:text-slate-300"
                            title="Copy Order ID"
                          >
                            {copiedId === order.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-sans whitespace-nowrap">
                        {order.createdAt}
                      </td>
                      <td className="py-3 px-3 text-slate-200 font-sans max-w-[200px] truncate" title={order.serviceName}>
                        <div className="font-medium truncate">{order.serviceName}</div>
                        <div className="text-[10px] text-slate-500">{order.categoryName}</div>
                      </td>
                      <td className="py-3 px-3 text-indigo-400 truncate max-w-[130px] font-sans">
                        <a
                          href={order.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center gap-1"
                          title={order.link}
                        >
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
                      <td className="py-3 px-3 text-center text-[11px] text-slate-400">
                        <span className="text-slate-300">{order.startCount}</span> /{' '}
                        <span className={order.remains === 0 ? 'text-emerald-400' : 'text-amber-400'}>
                          {order.remains}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-sans">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${statusBadge}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-sans">
                        <button
                          onClick={() => handleQuickReorder(order)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-[11px] font-semibold transition-colors flex items-center gap-1 ml-auto"
                          title="Place identical order with current rates"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Re-order
                        </button>
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
