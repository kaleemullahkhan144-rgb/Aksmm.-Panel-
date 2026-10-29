import React, { useState } from 'react';
import { useSMM } from '../../context/SMMContext';
import { PaymentMethod } from '../../types/smm';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Building,
  QrCode,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Phone,
  Hash,
  Wallet
} from 'lucide-react';

export const AddFunds: React.FC = () => {
  const {
    currentUser,
    payments,
    submitPayment,
    formatCurrency,
    settings,
    convertPkrToUsd,
    convertUsdToPkr
  } = useSMM();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('easypaisa');

  // Form states for Pakistan local / manual methods
  const [amountPkr, setAmountPkr] = useState<number>(2800);
  const [trxId, setTrxId] = useState('');
  const [senderPhone, setSenderPhone] = useState('03338831737');
  const [accountTitle, setAccountTitle] = useState('Kaleem Ullah');

  // Form states for Crypto / Perfect Money
  const [cryptoUsd, setCryptoUsd] = useState<number>(50);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const calculatedUsdForPkr = convertPkrToUsd(amountPkr);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!currentUser) {
      setFeedback({ type: 'error', message: 'You must be signed in to add funds.' });
      return;
    }

    if (selectedMethod === 'easypaisa' || selectedMethod === 'jazzcash' || selectedMethod === 'bank_transfer') {
      if (!amountPkr || amountPkr < 100) {
        setFeedback({ type: 'error', message: 'Minimum deposit is Rs. 100 PKR.' });
        return;
      }
      if (!trxId.trim()) {
        setFeedback({ type: 'error', message: 'Please provide the transaction ID (TRX ID) from your SMS or app receipt.' });
        return;
      }

      setIsSubmitting(true);
      setTimeout(() => {
        const res = submitPayment({
          method: selectedMethod,
          amount: calculatedUsdForPkr,
          amountPkr,
          trxId: trxId.trim(),
          senderPhone: senderPhone.trim(),
          accountTitle: accountTitle.trim()
        });

        if (res.success) {
          setFeedback({ type: 'success', message: res.message });
          setTrxId('');
        } else {
          setFeedback({ type: 'error', message: res.message });
        }
        setIsSubmitting(false);
      }, 400);
    } else {
      // Crypto / Perfect Money
      if (!cryptoUsd || cryptoUsd < 5) {
        setFeedback({ type: 'error', message: 'Minimum crypto deposit is $5.00 USD.' });
        return;
      }
      const fakeTrx = 'TX_' + Math.random().toString(36).substring(2, 12).toUpperCase();

      setIsSubmitting(true);
      setTimeout(() => {
        const res = submitPayment({
          method: selectedMethod,
          amount: cryptoUsd,
          trxId: fakeTrx,
          accountTitle: currentUser.username
        });

        if (res.success) {
          setFeedback({
            type: 'success',
            message: `Crypto transfer initiated! Payment ID generated. In sandbox mode, click Admin -> Payment Approvals to verify instantly.`
          });
        }
        setIsSubmitting(false);
      }, 500);
    }
  };

  const userPayments = currentUser ? payments.filter(p => p.userId === currentUser.id) : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-indigo-400" />
          Add Account Funds
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Deposit balance using Pakistan local payment methods (EasyPaisa, JazzCash, Bank Transfer) or Crypto (USDT).
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-800 text-emerald-200'
              : 'bg-rose-950/70 border-rose-800 text-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold">{feedback.message}</p>
            {feedback.type === 'success' && (
              <p className="mt-1 text-slate-300">
                You can switch to the Admin Panel anytime to approve this transaction and immediately credit the user balance.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Gateway Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* EasyPaisa */}
        <button
          type="button"
          onClick={() => setSelectedMethod('easypaisa')}
          className={`p-3.5 rounded-xl border text-left transition-all relative ${
            selectedMethod === 'easypaisa'
              ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center mb-2">
            EP
          </div>
          <div className="text-xs font-bold text-white">EasyPaisa</div>
          <div className="text-[10px] text-emerald-400 font-medium">0% Fee · Pakistan</div>
        </button>

        {/* JazzCash */}
        <button
          type="button"
          onClick={() => setSelectedMethod('jazzcash')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedMethod === 'jazzcash'
              ? 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center mb-2">
            JC
          </div>
          <div className="text-xs font-bold text-white">JazzCash</div>
          <div className="text-[10px] text-amber-400 font-medium">0% Fee · Pakistan</div>
        </button>

        {/* Bank Transfer */}
        <button
          type="button"
          onClick={() => setSelectedMethod('bank_transfer')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedMethod === 'bank_transfer'
              ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center mb-2">
            <Building className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-white">Bank Transfer</div>
          <div className="text-[10px] text-blue-400 font-medium">Meezan Bank</div>
        </button>

        {/* Binance Pay / USDT */}
        <button
          type="button"
          onClick={() => setSelectedMethod('binance_pay')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedMethod === 'binance_pay'
              ? 'bg-yellow-950/40 border-yellow-500 shadow-md shadow-yellow-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-yellow-500 text-slate-950 font-black text-xs flex items-center justify-center mb-2">
            <QrCode className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-white">Binance Pay</div>
          <div className="text-[10px] text-yellow-400 font-medium">Crypto USDT</div>
        </button>

        {/* Perfect Money */}
        <button
          type="button"
          onClick={() => setSelectedMethod('perfect_money')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedMethod === 'perfect_money'
              ? 'bg-red-950/40 border-red-500 shadow-md shadow-red-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-red-700 text-white font-black text-xs flex items-center justify-center mb-2">
            PM
          </div>
          <div className="text-xs font-bold text-white">Perfect Money</div>
          <div className="text-[10px] text-red-400 font-medium">USD Automatic</div>
        </button>
      </div>

      {/* Payment Instructions & Submission Form */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
        {(selectedMethod === 'easypaisa' || selectedMethod === 'jazzcash') && (
          <div className="space-y-6">
            {/* Account Details Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {selectedMethod === 'easypaisa' ? 'EasyPaisa Account Details' : 'JazzCash Account Details'}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-mono font-bold text-white tracking-wide">
                    {settings.easypaisaNumber}
                  </span>
                  <button
                    onClick={() => copyToClipboard(settings.easypaisaNumber, 'account_num')}
                    className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                    title="Copy Account Number"
                  >
                    {copiedKey === 'account_num' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <div className="text-xs text-slate-300">
                  Account Title:{' '}
                  <span className="font-bold text-emerald-400">{settings.easypaisaTitle}</span>
                </div>
              </div>

              <div className="px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-right">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Exchange Rate</span>
                <span className="text-xs font-mono font-bold text-slate-200">
                  1 USD = {settings.usdToPkrRate} PKR
                </span>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1">
              <span className="font-semibold text-white">How to pay:</span>
              <ol className="list-decimal pl-5 space-y-1 text-slate-400">
                <li>Open your <span className="text-white font-medium">{selectedMethod === 'easypaisa' ? 'EasyPaisa' : 'JazzCash'}</span> App or dial USSD.</li>
                <li>Send money to <span className="text-white font-mono font-semibold">{settings.easypaisaNumber}</span> ({settings.easypaisaTitle}).</li>
                <li>Copy the 11 or 12 digit <span className="text-white font-semibold">Transaction ID (TRX ID)</span> from the confirmation SMS/Receipt.</li>
                <li>Fill the form below and submit. Your funds will be credited to your balance upon admin verification.</li>
              </ol>
            </div>

            {/* Submission Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Amount Sent (PKR) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Amount Sent (PKR) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="100"
                      step="10"
                      value={amountPkr}
                      onChange={e => setAmountPkr(Math.max(0, parseInt(e.target.value || '0', 10)))}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                      required
                    />
                    <div className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">
                      PKR
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-400 font-mono mt-1">
                    ≈ ${calculatedUsdForPkr.toFixed(2)} USD will be added to your balance
                  </p>
                </div>

                {/* Transaction ID */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Transaction ID (TRX ID) *</span>
                    <span className="text-[10px] text-slate-500">From SMS receipt</span>
                  </label>
                  <input
                    type="text"
                    value={trxId}
                    onChange={e => setTrxId(e.target.value)}
                    placeholder="e.g. 849201928471"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Sender Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Sender Mobile Number *
                  </label>
                  <input
                    type="text"
                    value={senderPhone}
                    onChange={e => setSenderPhone(e.target.value)}
                    placeholder="03338831737"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Account Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Sender Account Name / Title
                  </label>
                  <input
                    type="text"
                    value={accountTitle}
                    onChange={e => setAccountTitle(e.target.value)}
                    placeholder="Kaleem Ullah"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSubmitting ? 'Verifying...' : 'Submit Payment for Verification'}
                </button>
              </div>
            </form>
          </div>
        )}

        {selectedMethod === 'bank_transfer' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-4 h-4 text-blue-400" />
                Meezan Bank Limited (Pakistan)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <span className="text-slate-500 text-[11px]">Account Title:</span>
                  <p className="font-bold text-white mt-0.5">{settings.bankTitle}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Account Number:</span>
                  <p className="font-bold text-white mt-0.5">{settings.bankAccount}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 text-[11px]">IBAN:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="font-bold text-indigo-400">{settings.bankIban}</p>
                    <button
                      onClick={() => copyToClipboard(settings.bankIban, 'iban')}
                      className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                    >
                      {copiedKey === 'iban' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Amount Sent (PKR)</label>
                  <input
                    type="number"
                    min="500"
                    value={amountPkr}
                    onChange={e => setAmountPkr(Math.max(0, parseInt(e.target.value || '0', 10)))}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                    required
                  />
                  <p className="text-[11px] text-emerald-400 font-mono mt-1">
                    ≈ ${calculatedUsdForPkr.toFixed(2)} USD
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Bank Reference / TRX ID</label>
                  <input
                    type="text"
                    value={trxId}
                    onChange={e => setTrxId(e.target.value)}
                    placeholder="e.g. MEZN-98218731"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Submit Bank Deposit
                </button>
              </div>
            </form>
          </div>
        )}

        {selectedMethod === 'binance_pay' && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-5">
              <div className="w-24 h-24 rounded-lg bg-white p-2 flex items-center justify-center shrink-0">
                <QrCode className="w-20 h-20 text-slate-900" />
              </div>
              <div className="space-y-1.5 text-xs flex-1">
                <span className="text-[11px] text-yellow-400 uppercase font-semibold">
                  USDT (TRC20 Network Only)
                </span>
                <p className="text-slate-300">
                  Send USDT to the official SMM panel deposit wallet. Instant confirmation upon blockchain block verification:
                </p>
                <div className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-white break-all">
                  <span>{settings.binanceTrc20Address}</span>
                  <button
                    onClick={() => copyToClipboard(settings.binanceTrc20Address, 'crypto')}
                    className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white shrink-0 ml-auto"
                  >
                    {copiedKey === 'crypto' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Deposit Amount ($ USD)
                </label>
                <input
                  type="number"
                  min="5"
                  value={cryptoUsd}
                  onChange={e => setCryptoUsd(Math.max(5, parseInt(e.target.value || '5', 10)))}
                  className="w-full sm:w-64 px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs"
              >
                Initiate Crypto Payment (${cryptoUsd})
              </button>
            </form>
          </div>
        )}

        {selectedMethod === 'perfect_money' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <span className="font-semibold text-white">Perfect Money Automatic Deposit</span>
              <p className="text-slate-400">
                Official PM USD Account: <span className="font-mono text-white font-bold">{settings.perfectMoneyAccount}</span>
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Amount in USD</label>
                <input
                  type="number"
                  min="5"
                  value={cryptoUsd}
                  onChange={e => setCryptoUsd(Math.max(5, parseInt(e.target.value || '5', 10)))}
                  className="w-full sm:w-64 px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
              >
                Pay with Perfect Money
              </button>
            </form>
          </div>
        )}
      </div>

      {/* User's Payment Log */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-1">Your Deposit History</h3>
        <p className="text-xs text-slate-400 mb-4">Tracking all manual and gateway balance transactions</p>

        {userPayments.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No deposits found. Make your first deposit above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Payment ID</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Gateway</th>
                  <th className="py-2.5 px-3">TRX ID</th>
                  <th className="py-2.5 px-3 text-right">Amount (USD)</th>
                  <th className="py-2.5 px-3 text-right">Amount (PKR)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {userPayments.map(pay => {
                  let badge = 'bg-slate-800 text-slate-300';
                  if (pay.status === 'approved') badge = 'bg-emerald-950 text-emerald-400 border border-emerald-800/50';
                  if (pay.status === 'pending') badge = 'bg-amber-950 text-amber-300 border border-amber-800/50';
                  if (pay.status === 'rejected') badge = 'bg-rose-950 text-rose-300 border border-rose-800/50';

                  return (
                    <tr key={pay.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-bold text-slate-200">#{pay.id}</td>
                      <td className="py-3 px-3 text-slate-400 font-sans">{pay.createdAt}</td>
                      <td className="py-3 px-3 font-sans uppercase text-[11px] font-semibold text-slate-300">
                        {pay.method.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-3 text-slate-300 truncate max-w-[120px]">{pay.trxId}</td>
                      <td className="py-3 px-3 text-right text-emerald-400 font-bold tabular-nums">
                        ${pay.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-400 tabular-nums">
                        {pay.amountPkr ? `Rs. ${pay.amountPkr.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-3 px-3 text-center font-sans">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${badge}`}>
                          {pay.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-sans text-[11px] truncate max-w-[160px]">
                        {pay.adminNotes || '-'}
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
