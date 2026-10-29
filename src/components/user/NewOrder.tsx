import React, { useState, useMemo } from 'react';
import { useSMM } from '../../context/SMMContext';
import {
  ShoppingBag,
  Info,
  Link2,
  Hash,
  Calculator,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Bookmark,
  Plus
} from 'lucide-react';

interface NewOrderProps {
  onNavigate: (view: string) => void;
  prefillUrl?: string;
}

export const NewOrder: React.FC<NewOrderProps> = ({ onNavigate, prefillUrl }) => {
  const {
    currentUser,
    categories,
    services,
    createOrder,
    formatCurrency,
    convertUsdToPkr,
    savedUrls,
    addSavedUrl
  } = useSMM();

  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(categories[0]?.id || 1);
  const [selectedServiceId, setSelectedServiceId] = useState<number>(() => {
    const firstInCat = services.find(s => s.categoryId === (categories[0]?.id || 1));
    return firstInCat ? firstInCat.id : services[0]?.id || 101;
  });

  const [link, setLink] = useState(prefillUrl || '');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedUrlTitle, setSavedUrlTitle] = useState('');
  const [urlSavedFeedback, setUrlSavedFeedback] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1000);
  const [isDripfeed, setIsDripfeed] = useState(false);
  const [runs, setRuns] = useState<number>(1);
  const [interval, setInterval] = useState<number>(60);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string; orderId?: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available services in current category
  const categoryServices = useMemo(() => {
    return services.filter(s => s.categoryId === selectedCategoryId && s.status === 'active');
  }, [services, selectedCategoryId]);

  // Selected service object
  const currentService = useMemo(() => {
    return services.find(s => s.id === selectedServiceId) || categoryServices[0] || services[0];
  }, [services, selectedServiceId, categoryServices]);

  // Handle category change
  const handleCategoryChange = (catId: number) => {
    setSelectedCategoryId(catId);
    const firstSvc = services.find(s => s.categoryId === catId && s.status === 'active');
    if (firstSvc) {
      setSelectedServiceId(firstSvc.id);
      setQuantity(firstSvc.minQuantity);
    }
  };

  // Price calculations
  const unitRate = useMemo(() => {
    if (!currentUser || !currentService) return 0;
    return currentUser.customRates?.[currentService.id] ?? currentService.rate;
  }, [currentUser, currentService]);

  const totalUnits = isDripfeed ? quantity * runs : quantity;
  const totalPriceUsd = useMemo(() => {
    return Math.round(((totalUnits / 1000) * unitRate) * 10000) / 10000;
  }, [totalUnits, unitRate]);

  const hasEnoughBalance = currentUser ? currentUser.balance >= totalPriceUsd : false;
  const isQuantityValid = currentService ? quantity >= currentService.minQuantity && quantity <= currentService.maxQuantity : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!currentUser) {
      setFeedback({ type: 'error', message: 'You must be signed in to place an order.' });
      return;
    }

    if (!link.trim()) {
      setFeedback({ type: 'error', message: 'Please enter a target profile URL, post link, or username.' });
      return;
    }

    if (!isQuantityValid) {
      setFeedback({
        type: 'error',
        message: `Quantity must be between ${currentService.minQuantity.toLocaleString()} and ${currentService.maxQuantity.toLocaleString()}`
      });
      return;
    }

    if (!hasEnoughBalance) {
      setFeedback({
        type: 'error',
        message: `Insufficient balance (${formatCurrency(currentUser.balance)}). Needed: ${formatCurrency(totalPriceUsd)}. Please add funds.`
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = createOrder({
        serviceId: currentService.id,
        link: link.trim(),
        quantity,
        runs: isDripfeed ? runs : 1,
        interval: isDripfeed ? interval : 0
      });

      if (res.success) {
        setFeedback({ type: 'success', message: res.message, orderId: res.orderId });
        setLink('');
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-indigo-400" />
          Create New Order
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Select your target social media service, configure parameters, and receive automated delivery.
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
          <div className="flex-1">
            <p className="font-semibold">{feedback.message}</p>
            {feedback.orderId && (
              <p className="mt-1 text-slate-300">
                You can monitor this order in the{' '}
                <button
                  onClick={() => onNavigate('orders')}
                  className="underline font-bold text-white hover:text-emerald-300"
                >
                  Orders History Log
                </button>
                .
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Order Form */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-slate-900 border border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                1. Select Category
              </label>
              <select
                value={selectedCategoryId}
                onChange={e => handleCategoryChange(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {categories.filter(c => c.status === 'active').map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                2. Select Service
              </label>
              <select
                value={currentService?.id}
                onChange={e => {
                  const sId = Number(e.target.value);
                  setSelectedServiceId(sId);
                  const found = services.find(s => s.id === sId);
                  if (found) setQuantity(found.minQuantity);
                }}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {categoryServices.map(svc => (
                  <option key={svc.id} value={svc.id}>
                    ID {svc.id} — {svc.name} (${svc.rate.toFixed(2)}/1k)
                  </option>
                ))}
              </select>
            </div>

            {/* Link Input with Saved URLs Fast-Picker */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-indigo-400" />
                  3. Link / Target URL
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('saved-urls')}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 underline"
                  >
                    <Bookmark className="w-3 h-3" />
                    Manage URLs
                  </button>
                  <span className="text-[10px] text-slate-500">Public profile or post URL</span>
                </div>
              </div>

              {/* Fast Pick Dropdown from Saved URLs */}
              {savedUrls.length > 0 && (
                <div className="mb-2">
                  <select
                    onChange={e => {
                      if (e.target.value) setLink(e.target.value);
                    }}
                    defaultValue=""
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px] focus:outline-none focus:border-indigo-500"
                  >
                    <option value="" disabled>
                      Select from Saved URLs ({savedUrls.length} available)...
                    </option>
                    {savedUrls.map(u => (
                      <option key={u.id} value={u.url}>
                        [{u.platform}] {u.title} — {u.url}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <input
                type="text"
                value={link}
                onChange={e => setLink(e.target.value)}
                placeholder="https://instagram.com/username or https://tiktok.com/@video"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />

              {/* Quick Save URL action */}
              <div className="mt-2 flex items-center justify-between">
                {link && !showSaveModal && (
                  <button
                    type="button"
                    onClick={() => setShowSaveModal(true)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Save this URL to your bookmarks for fast reuse
                  </button>
                )}

                {urlSavedFeedback && (
                  <span className="text-[11px] text-emerald-400 font-medium">
                    {urlSavedFeedback}
                  </span>
                )}
              </div>

              {showSaveModal && (
                <div className="mt-2 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-300">
                    Bookmark this URL ({link})
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Title (e.g. My Main IG Page)"
                      value={savedUrlTitle}
                      onChange={e => setSavedUrlTitle(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!savedUrlTitle.trim()) return;
                        addSavedUrl({
                          title: savedUrlTitle.trim(),
                          url: link.trim(),
                          platform: 'Social Media'
                        });
                        setSavedUrlTitle('');
                        setShowSaveModal(false);
                        setUrlSavedFeedback('URL saved to bookmarks!');
                        setTimeout(() => setUrlSavedFeedback(null), 3000);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSaveModal(false)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-indigo-400" />
                  4. Quantity
                </label>
                {currentService && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    Min: {currentService.minQuantity.toLocaleString()} · Max: {currentService.maxQuantity.toLocaleString()}
                  </span>
                )}
              </div>
              <input
                type="number"
                value={quantity}
                min={currentService?.minQuantity || 1}
                max={currentService?.maxQuantity || 100000}
                step="1"
                onChange={e => setQuantity(Math.max(0, parseInt(e.target.value || '0', 10)))}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              {!isQuantityValid && currentService && (
                <p className="text-[11px] text-rose-400 mt-1">
                  Quantity must be between {currentService.minQuantity} and {currentService.maxQuantity}.
                </p>
              )}
            </div>

            {/* Drip-feed Toggle */}
            {currentService?.dripfeed && (
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDripfeed}
                      onChange={e => setIsDripfeed(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-700 focus:ring-0"
                    />
                    <span className="text-xs font-semibold text-slate-200">
                      Enable Drip-feed (Gradual natural delivery)
                    </span>
                  </label>
                  <span className="text-[10px] text-indigo-400">Recommended for organic growth</span>
                </div>

                {isDripfeed && (
                  <div className="grid grid-cols-2 gap-3 mt-3 p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Runs (Times to repeat)</label>
                      <input
                        type="number"
                        min="2"
                        max="100"
                        value={runs}
                        onChange={e => setRuns(Math.max(1, parseInt(e.target.value || '1', 10)))}
                        className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Interval (Minutes between runs)</label>
                      <input
                        type="number"
                        min="10"
                        max="1440"
                        value={interval}
                        onChange={e => setInterval(Math.max(10, parseInt(e.target.value || '60', 10)))}
                        className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                      />
                    </div>
                    <div className="col-span-2 text-[10px] text-slate-400 font-mono">
                      Total units will be: {runs} runs × {quantity} = {runs * quantity} units
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit & Live Price Action */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-500">Total Calculated Cost</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-emerald-400 font-mono tabular-nums">
                    {formatCurrency(totalPriceUsd)}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    (Rs. {convertUsdToPkr(totalPriceUsd).toLocaleString()})
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isQuantityValid || !hasEnoughBalance}
                className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md ${
                  !hasEnoughBalance
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                }`}
              >
                {isSubmitting ? 'Submitting to API...' : 'Submit Order'}
              </button>
            </div>

            {/* Low balance helper */}
            {!hasEnoughBalance && currentUser && (
              <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/40 flex items-center justify-between text-xs text-amber-300">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Your balance is {formatCurrency(currentUser.balance)}. Deposit needed.
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('add-funds')}
                  className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-semibold transition-colors flex items-center gap-1"
                >
                  Deposit Now
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Sidebar Service Details Info Box */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Info className="w-4 h-4 text-indigo-400" />
              Service Specifications
            </h3>

            {currentService && (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px]">Service Name:</span>
                  <p className="font-semibold text-white mt-0.5">{currentService.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-500">Service ID</span>
                    <p className="font-mono font-bold text-indigo-400">#{currentService.id}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Base Rate</span>
                    <p className="font-mono font-bold text-emerald-400">
                      ${currentService.rate.toFixed(2)} / 1k
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Min Order</span>
                    <p className="font-mono text-slate-300">{currentService.minQuantity.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Max Order</span>
                    <p className="font-mono text-slate-300">{currentService.maxQuantity.toLocaleString()}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-500 text-[11px] block mb-1">Features</span>
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    {currentService.refill ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-semibold flex items-center gap-1">
                        <RotateCcw className="w-3 h-3" /> Auto Refill Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        No Refill
                      </span>
                    )}

                    {currentService.dripfeed && (
                      <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/60 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Dripfeed Allowed
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-500 text-[11px] block mb-1">Description & Guidelines</span>
                  <p className="text-slate-300 leading-relaxed text-[11px] bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                    {currentService.description || 'Standard high speed social media service. Provide public link.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick FAQ / Notice */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-2">
            <p className="font-semibold text-slate-200">Important Reminders:</p>
            <ul className="list-disc pl-4 space-y-1 text-slate-400">
              <li>Ensure the social media account/post is set to <span className="text-white font-medium">Public</span> before ordering.</li>
              <li>Do not place two identical orders for the same link concurrently; wait for completion.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
