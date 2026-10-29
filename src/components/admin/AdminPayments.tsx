import React, { useState } from 'react';
import { useSMM } from '../../context/SMMContext';
import { Payment } from '../../types/smm';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Search,
  Phone,
  AlertTriangle,
  X,
  CreditCard
} from 'lucide-react';

export const AdminPayments: React.FC = () => {
  const { payments, approvePayment, rejectPayment, formatCurrency } = useSMM();

  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectingPayment, setRejectingPayment] = useState<Payment | null>(null);
  const [rejectReason, setRejectReason] = useState('Transaction ID not found in EasyPaisa/JazzCash statement');
  const [copiedTrx, setCopiedTrx] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filteredPayments = payments.filter(p => {
    const matchesFilter = filter === 'all' || p.status === filter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      String(p.id).includes(term) ||
      p.username.toLowerCase().includes(term) ||
      p.trxId.toLowerCase().includes(term) ||
      (p.senderPhone && p.senderPhone.includes(term));

    return matchesFilter && matchesSearch;
  });

  const copyTrx = (trx: string) => {
    navigator.clipboard.writeText(trx);
    setCopiedTrx(trx);
    setTimeout(() => setCopiedTrx(null), 2000);
  };

  const handleApprove = (payment: Payment) => {
    approvePayment(payment.id);
    setFeedback(`Payment #${payment.id} approved! $${payment.amount.toFixed(2)} credited to ${payment.username}'s balance.`);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingPayment) return;

    rejectPayment(rejectingPayment.id, rejectReason);
    setFeedback(`Payment #${rejectingPayment.id} marked as rejected.`);
    setRejectingPayment(null);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-purple-400" />
            Payment Verification & Manual Approvals
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review user-submitted EasyPaisa, JazzCash, and Bank TRX IDs. Approving instantly credits client balances.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by TRX ID, user, phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {feedback}
        </div>
      )}

      {/* Segmented Filter Buttons */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
        {(['pending', 'approved', 'rejected', 'all'] as const).map(st => {
          const count = st === 'all' ? payments.length : payments.filter(p => p.status === st).length;
          const isActive = filter === st;
          return (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 uppercase ${
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

      {/* Payments Table */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Pay ID</th>
                <th className="py-2.5 px-3">Client</th>
                <th className="py-2.5 px-3">Gateway</th>
                <th className="py-2.5 px-3">Transaction ID (TRX)</th>
                <th className="py-2.5 px-3">Sender Phone / Title</th>
                <th className="py-2.5 px-3 text-right">PKR Amount</th>
                <th className="py-2.5 px-3 text-right">Credit USD</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredPayments.map(pay => {
                let statusBadge = 'bg-slate-800 text-slate-300';
                if (pay.status === 'approved') statusBadge = 'bg-emerald-950 text-emerald-400 border border-emerald-800/50';
                if (pay.status === 'pending') statusBadge = 'bg-amber-950 text-amber-300 border border-amber-800/50';
                if (pay.status === 'rejected') statusBadge = 'bg-rose-950 text-rose-300 border border-rose-800/50';

                return (
                  <tr key={pay.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-bold text-white">#{pay.id}</td>
                    <td className="py-3 px-3 font-sans font-semibold text-slate-200">
                      {pay.username}
                    </td>
                    <td className="py-3 px-3 font-sans uppercase text-[11px] font-semibold text-indigo-300">
                      {pay.method.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <span>{pay.trxId}</span>
                        <button
                          onClick={() => copyTrx(pay.trxId)}
                          className="text-slate-500 hover:text-slate-300"
                          title="Copy TRX ID"
                        >
                          {copiedTrx === pay.trxId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-400 text-[11px]">
                      <div>{pay.senderPhone || '-'}</div>
                      <div className="text-[10px] text-slate-500">{pay.accountTitle}</div>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300 tabular-nums">
                      {pay.amountPkr ? `Rs. ${pay.amountPkr.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-400 tabular-nums">
                      ${pay.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${statusBadge}`}>
                        {pay.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-sans">
                      {pay.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApprove(pay)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-sm transition-colors flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectingPayment(pay)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-rose-950 text-rose-300 text-[11px] font-semibold border border-rose-900/40 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px] font-sans">
                          {pay.status === 'approved' ? 'Credited' : 'Dismissed'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectingPayment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setRejectingPayment(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Reject Payment #{rejectingPayment.id}
            </h3>

            <p className="text-xs text-slate-400">
              Provide a note explaining why this TRX ID was rejected:
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-3 text-xs">
              <textarea
                rows={3}
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                required
              />

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingPayment(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
