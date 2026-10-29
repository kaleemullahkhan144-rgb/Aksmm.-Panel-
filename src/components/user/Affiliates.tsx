import React, { useState } from 'react';
import { useSMM } from '../../context/SMMContext';
import {
  Users,
  Gift,
  Copy,
  CheckCircle2,
  TrendingUp,
  Wallet,
  ArrowRight,
  Share2,
  ExternalLink,
  Sparkles,
  Globe,
  Radio,
  Check
} from 'lucide-react';

export const Affiliates: React.FC = () => {
  const {
    currentUser,
    referralFriends,
    claimReferralEarnings,
    formatCurrency
  } = useSMM();

  const [copied, setCopied] = useState(false);
  const [activeLinkTab, setActiveLinkTab] = useState<'live' | 'custom'>('live');
  const [claimFeedback, setClaimFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const referralCode = currentUser ? currentUser.username : 'kaleem';

  // Real live working app URL detection
  const getLiveBaseUrl = () => {
    if (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')) {
      return window.location.origin;
    }
    return 'https://ais-pre-j6n3tfhtboovbrlu2lb3ra-375366943579.asia-east1.run.app';
  };

  const liveReferralUrl = `${getLiveBaseUrl()}/?ref=${referralCode}`;
  const customDomainReferralUrl = `https://cheappakpanel.com/?ref=${referralCode}`;

  const currentDisplayUrl = activeLinkTab === 'live' ? liveReferralUrl : customDomainReferralUrl;

  const totalEarned = referralFriends.reduce((sum, f) => sum + f.commissionEarned, 0);
  const totalDepositedByFriends = referralFriends.reduce((sum, f) => sum + f.totalDeposited, 0);

  const handleCopyLink = (urlToCopy = currentDisplayUrl) => {
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🇵🇰 AK SMM Panel - Pakistan's #1 Cheapest SMM Reseller Panel!\n\n` +
      `🔥 TikTok Followers, Instagram Likes, YouTube Subscribers & Views at lowest rates.\n` +
      `⚡ 0% Fee Instant Deposits via EasyPaisa & JazzCash (Kaleem Ullah - 03338831737).\n\n` +
      `Join with my invite link here:\n${currentDisplayUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleClaim = () => {
    setClaimFeedback(null);
    const res = claimReferralEarnings();
    if (res.success) {
      setClaimFeedback({ type: 'success', message: res.message });
    } else {
      setClaimFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-800/40 shadow-xl">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Gift className="w-3.5 h-3.5" />
            <span>Website Friend & Affiliate Referral Program</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Invite Website Friends & Earn <span className="text-emerald-400">5% Lifetime</span> Commission
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Apne doston, agencies aur social media clients ke sath apna real referral link share karein.
            Jab bhi wo EasyPaisa ya JazzCash se balance add karenge, <span className="text-emerald-400 font-bold">5% commission</span> direct aapke balance mein jama hoga!
          </p>

          {/* Link Type Selector */}
          <div className="pt-2 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveLinkTab('live')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeLinkTab === 'live'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/50'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                <span>Real Live Working Link (Active Now)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveLinkTab('custom')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeLinkTab === 'custom'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/50'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Custom Domain (cheappakpanel.com)</span>
              </button>
            </div>

            {/* Active Link Box */}
            <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold flex items-center gap-1.5">
                  {activeLinkTab === 'live' ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span className="text-emerald-400">Real Working Website Link</span>
                      <span className="text-[10px] text-slate-500 font-normal">(Instant open for anyone)</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-3 h-3 text-indigo-400" />
                      <span className="text-indigo-400">Branded Domain Link</span>
                      <span className="text-[10px] text-slate-500 font-normal">(After DNS connection)</span>
                    </>
                  )}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Ref Code: <span className="text-white font-bold">{referralCode}</span>
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex items-center px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-xs overflow-hidden">
                  <span className="truncate select-all text-emerald-300 font-semibold">{currentDisplayUrl}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleCopyLink(currentDisplayUrl)}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-emerald-600/30 cursor-pointer"
                    title="Copy Link"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Real Link</span>
                      </>
                    )}
                  </button>

                  <a
                    href={currentDisplayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs flex items-center gap-1 border border-slate-700 transition-colors"
                    title="Open live website in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Test Link</span>
                  </a>

                  <button
                    onClick={handleWhatsAppShare}
                    className="px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    title="Share directly to WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>

              {activeLinkTab === 'live' && (
                <div className="text-[11px] text-emerald-400/90 flex items-center gap-1.5 pt-1">
                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>
                    Yeh aapka <b>Real Live Working Link</b> hai. Isko share karne par website foran khulegi aur order lag sakenge!
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {claimFeedback && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
            claimFeedback.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-800 text-emerald-200'
              : 'bg-rose-950/70 border-rose-800 text-rose-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{claimFeedback.message}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Referred Friends</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {referralFriends.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Friends joined via your link</div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Commission Rate</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            5.0%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">On all future friend deposits</div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Total Friend Deposits</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {formatCurrency(totalDepositedByFriends)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Combined top-up volume</div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-emerald-900/50 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Total Commission</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {formatCurrency(totalEarned)}
          </div>
          <button
            onClick={handleClaim}
            className="mt-2 w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Claim to Balance</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Friends History Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Referred Website Friends ({referralFriends.length})</span>
          </h3>
          <span className="text-[11px] text-slate-500">Auto-tracked via ?ref= cookie</span>
        </div>

        {referralFriends.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No referred friends yet. Share your referral link above to start earning passive commissions!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="py-2.5 px-3">Friend Username</th>
                  <th className="py-2.5 px-3">Joined Date</th>
                  <th className="py-2.5 px-3">Total Deposited</th>
                  <th className="py-2.5 px-3">Commission Rate</th>
                  <th className="py-2.5 px-3 text-right">Commission Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {referralFriends.map(friend => (
                  <tr key={friend.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-emerald-400 uppercase font-bold">
                        {friend.username.substring(0, 2)}
                      </div>
                      <span>{friend.username}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                      {friend.joinedAt}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {formatCurrency(friend.totalDeposited)}
                    </td>
                    <td className="py-3 px-3 text-emerald-400 font-mono font-semibold">
                      5%
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400 text-sm">
                      {formatCurrency(friend.commissionEarned)}
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
