import React, { useState } from 'react';
import { useSMM } from '../../context/SMMContext';
import {
  Settings,
  DollarSign,
  Phone,
  Building,
  QrCode,
  AlertTriangle,
  CheckCircle2,
  Megaphone,
  Save
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings } = useSMM();

  const [form, setForm] = useState({ ...settings });
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setFeedback('System and gateway settings saved successfully!');
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-400" />
          System Settings & Payment Gateways Configuration
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Customize website branding, Pakistan local payment details (EasyPaisa/JazzCash), currency rates, and notices.
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {feedback}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Brand Settings */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-4 h-4 text-purple-400" />
            General Branding & Currencies
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Website Title</label>
              <input
                type="text"
                value={form.siteTitle}
                onChange={e => setForm({ ...form, siteTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                USD to PKR Exchange Rate (1 USD = ? PKR)
              </label>
              <input
                type="number"
                step="0.5"
                value={form.usdToPkrRate}
                onChange={e => setForm({ ...form, usdToPkrRate: parseFloat(e.target.value || '280') })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5 text-indigo-400" />
                Global Dashboard Announcement Banner
              </label>
              <input
                type="text"
                value={form.announcement}
                onChange={e => setForm({ ...form, announcement: e.target.value })}
                placeholder="Message displayed prominently on user dashboard"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
              />
            </div>
          </div>
        </div>

        {/* Pakistan Payment Gateways (EasyPaisa & JazzCash) */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Pakistan Local Payment Gateways (EasyPaisa & JazzCash)
          </h3>
          <p className="text-xs text-slate-400">
            These accounts are displayed to users on the "Add Funds" page for manual TRX verification.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* EasyPaisa Title */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">EasyPaisa Account Title</label>
              <input
                type="text"
                value={form.easypaisaTitle}
                onChange={e => setForm({ ...form, easypaisaTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-bold"
              />
            </div>

            {/* EasyPaisa Number */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">EasyPaisa Mobile Number</label>
              <input
                type="text"
                value={form.easypaisaNumber}
                onChange={e => setForm({ ...form, easypaisaNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono font-bold"
              />
            </div>

            {/* JazzCash Title */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">JazzCash Account Title</label>
              <input
                type="text"
                value={form.jazzcashTitle}
                onChange={e => setForm({ ...form, jazzcashTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-bold"
              />
            </div>

            {/* JazzCash Number */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">JazzCash Mobile Number</label>
              <input
                type="text"
                value={form.jazzcashNumber}
                onChange={e => setForm({ ...form, jazzcashNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Bank & Crypto Gateways */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4" />
            Bank Transfer & Crypto (Binance / Perfect Money)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Bank Name</label>
              <input
                type="text"
                value={form.bankName}
                onChange={e => setForm({ ...form, bankName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Bank Account Title</label>
              <input
                type="text"
                value={form.bankTitle}
                onChange={e => setForm({ ...form, bankTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Bank Account Number</label>
              <input
                type="text"
                value={form.bankAccount}
                onChange={e => setForm({ ...form, bankAccount: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Bank IBAN</label>
              <input
                type="text"
                value={form.bankIban}
                onChange={e => setForm({ ...form, bankIban: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Binance USDT (TRC20 Address)</label>
              <input
                type="text"
                value={form.binanceTrc20Address}
                onChange={e => setForm({ ...form, binanceTrc20Address: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Perfect Money Account</label>
              <input
                type="text"
                value={form.perfectMoneyAccount}
                onChange={e => setForm({ ...form, perfectMoneyAccount: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Maintenance Mode
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Disable client order placement temporarily for platform upgrades.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={form.maintenanceMode}
              onChange={e => setForm({ ...form, maintenanceMode: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            Save All Settings
          </button>
        </div>
      </form>
    </div>
  );
};
