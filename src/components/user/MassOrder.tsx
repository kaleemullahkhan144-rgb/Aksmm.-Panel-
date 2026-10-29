import React, { useState } from 'react';
import { useSMM } from '../../context/SMMContext';
import { Layers, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';

export const MassOrder: React.FC = () => {
  const { createMassOrder, services, formatCurrency, currentUser } = useSMM();

  const [rawText, setRawText] = useState(
    '101|1000|https://instagram.com/tech_innovator\n103|500|https://instagram.com/p/DBv9Q7Xz1/\n106|1000|https://tiktok.com/@growth_hub/video/123'
  );
  const [result, setResult] = useState<{ successCount: number; failCount: number; errors: string[] } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    if (!rawText.trim()) return;

    setIsProcessing(true);
    setTimeout(() => {
      const res = createMassOrder(rawText);
      setResult(res);
      setIsProcessing(false);
    }, 500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          Mass Order Submission
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Place hundreds of orders at once using the standard bulk syntax.
        </p>
      </div>

      {result && (
        <div
          className={`p-4 rounded-xl border text-xs space-y-2 ${
            result.failCount === 0
              ? 'bg-emerald-950/70 border-emerald-800 text-emerald-200'
              : 'bg-slate-900 border-amber-800 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            {result.failCount === 0 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400" />
            )}
            <span>
              Mass order processed: {result.successCount} succeeded, {result.failCount} failed
            </span>
          </div>
          {result.errors.length > 0 && (
            <ul className="list-disc pl-5 space-y-1 text-slate-300 font-mono text-[11px]">
              {result.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
        <form onSubmit={handleMassSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200">
              Enter one order per line:
            </label>
            <div className="text-[11px] text-indigo-400 font-mono flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              Format: service_id|quantity|link
            </div>
          </div>

          <textarea
            rows={10}
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            placeholder="101|1000|https://instagram.com/user&#10;103|500|https://instagram.com/p/post&#10;105|2000|https://tiktok.com/@account"
            className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed"
          />

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300">Quick Reference Examples:</span>
            <div className="font-mono text-indigo-300 text-[10px] space-y-0.5">
              <p>101|2000|https://instagram.com/profile_name</p>
              <p>103|500|https://instagram.com/p/reel_url</p>
              <p>106|1500|https://tiktok.com/@creator/video/9988</p>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Your Current Balance:{' '}
              <span className="font-mono font-bold text-emerald-400">
                {currentUser ? formatCurrency(currentUser.balance) : '$0.00'}
              </span>
            </div>
            <button
              type="submit"
              disabled={isProcessing || !rawText.trim()}
              className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {isProcessing ? 'Executing Mass Orders...' : 'Submit Mass Orders'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
