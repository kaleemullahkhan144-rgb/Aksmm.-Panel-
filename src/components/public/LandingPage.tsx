import React, { useState, useEffect } from 'react';
import { useSMM } from '../../context/SMMContext';
import {
  Zap,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Clock,
  Phone,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  Sparkles,
  CreditCard,
  Building,
  Lock,
  User,
  Search,
  ChevronDown,
  ChevronUp,
  Layers,
  Star,
  Gift
} from 'lucide-react';

interface LandingPageProps {
  onNavigateToView: (view: string) => void;
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToView, onOpenAuth }) => {
  const {
    services,
    categories,
    formatCurrency,
    convertUsdToPkr,
    login,
    register,
    settings,
    currentUser
  } = useSMM();

  // Hero quick login / register state
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('kaleem');
  const [email, setEmail] = useState('kaleemullahkhan144@gmail.com');
  const [password, setPassword] = useState('password123');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [invitedBy, setInvitedBy] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
        localStorage.setItem('aksmm_invited_by', ref);
        setInvitedBy(ref);
        setAuthTab('register');
      } else {
        const saved = localStorage.getItem('aksmm_invited_by');
        if (saved) setInvitedBy(saved);
      }
    }
  }, []);

  // Price preview table filter
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
  const [searchService, setSearchService] = useState('');

  // FAQ open states
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (authTab === 'login') {
      const success = login(username.trim(), password);
      if (success) {
        onNavigateToView('dashboard');
      } else {
        setLoginError('Invalid username or password. You can click Demo Client below.');
      }
    } else {
      const success = register(username.trim(), email.trim(), password);
      if (success) {
        onNavigateToView('dashboard');
      } else {
        setLoginError('Username or email already exists.');
      }
    }
  };

  const handleQuickDemo = (role: 'user' | 'admin') => {
    if (role === 'admin') {
      login('admin', 'password');
    } else {
      login('kaleem', 'password');
    }
    onNavigateToView(role === 'admin' ? 'admin-dashboard' : 'dashboard');
  };

  const filteredPreviewServices = services.filter(s => {
    if (s.status !== 'active') return false;
    const matchesCat = activeCategory === 'all' || s.categoryId === activeCategory;
    const term = searchService.toLowerCase().trim();
    const matchesTerm = !term || s.name.toLowerCase().includes(term) || String(s.id).includes(term);
    return matchesCat && matchesTerm;
  }).slice(0, 8);

  const faqs = [
    {
      q: 'What is Cheap Pak Panel (cheappakpanel.com)?',
      a: 'Cheap Pak Panel is Pakistan’s most affordable and fully automated Social Media Marketing (SMM) provider and reseller platform. We offer direct wholesale rates for Instagram, TikTok, YouTube, Facebook, Telegram, and Twitter with instant delivery.'
    },
    {
      q: 'How can I add funds using EasyPaisa or JazzCash?',
      a: 'You can deposit funds with 0% fee! Navigate to "Add Funds", select EasyPaisa or JazzCash, send the amount to Kaleem Ullah (03338831737), and submit your Transaction ID (TRX ID). Your balance will be credited promptly.'
    },
    {
      q: 'Are the services safe for my profiles and monetization?',
      a: 'Yes, 100%. Our services utilize organic high-retention servers complying with social algorithms. Our YouTube 4,000 Watch Hours and monetization subscribers are completely safe for YouTube Partner Program approval.'
    },
    {
      q: 'Can I connect my own website or bot using the API?',
      a: 'Yes! Cheap Pak Panel fully supports standard SMM API v2. You can generate your unique API key and integrate with WordPress, custom PHP, Node.js, or any third-party panel script.'
    }
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-10">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6">
            {invitedBy && (
              <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-lg shadow-emerald-950/50">
                <div className="flex items-center gap-2.5">
                  <Gift className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Aapko <strong className="text-white underline">{invitedBy}</strong> ne invite kiya hai! Register karke foran order shuru karein.
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase shrink-0">
                  5% Ref Active
                </span>
              </div>
            )}

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              #1 Cheapest SMM Reseller Panel in Pakistan
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Grow Your Social Media with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400">
                Cheap Pak Panel
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Pakistan’s premier automated SMM reseller platform. Get highest quality Instagram followers, TikTok likes, YouTube watch time, and Facebook page reach at wholesale rates with zero-fee EasyPaisa & JazzCash deposits.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  if (currentUser) {
                    onNavigateToView('new-order');
                  } else {
                    handleQuickDemo('user');
                  }
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('pricing-preview');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 transition-colors"
              >
                View Services & Rates
              </button>
            </div>

            {/* Trust badges */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400 border-t border-slate-800/80 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Instant Auto-Processing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>EasyPaisa & JazzCash (0% Fee)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>30-Day Non-Drop Refill</span>
              </div>
            </div>
          </div>

          {/* Hero Right: Sign In / Registration Card */}
          <div className="lg:col-span-5">
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur relative">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-xs shadow-md">
                    PK
                  </div>
                  <span className="font-bold text-white text-sm">Member Access</span>
                </div>
                <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('login');
                      setLoginError(null);
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                      authTab === 'login' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('register');
                      setLoginError(null);
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                      authTab === 'register' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="mb-3 p-2.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {authTab === 'login' ? 'Username or Email' : 'Username'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="kaleem"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                {authTab === 'register' && (
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all"
                >
                  {authTab === 'login' ? 'Log In to Cheap Pak Panel' : 'Create Free Account'}
                </button>
              </form>

              {/* Instant 1-Click reviewer access */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                <span className="text-[10px] text-slate-500 block text-center mb-2 font-semibold uppercase tracking-wider">
                  Quick Access (No typing needed)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('user')}
                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 text-center transition-colors"
                  >
                    Client (Kaleem) &rarr;
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('admin')}
                    className="py-1.5 px-2 rounded-lg bg-purple-950 hover:bg-purple-900 text-purple-200 text-xs font-semibold border border-purple-800 text-center transition-colors"
                  >
                    Admin Control &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Stats Strip */}
      <section className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900 border border-slate-800 shadow-xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
              1,280,000+
            </div>
            <div className="text-xs text-slate-400 mt-1 font-semibold uppercase tracking-wider">
              Completed Orders
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              84,500+
            </div>
            <div className="text-xs text-slate-400 mt-1 font-semibold uppercase tracking-wider">
              Registered Clients
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-400 font-mono">
              1,650+
            </div>
            <div className="text-xs text-slate-400 mt-1 font-semibold uppercase tracking-wider">
              Active Services
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-mono">
              99.9%
            </div>
            <div className="text-xs text-slate-400 mt-1 font-semibold uppercase tracking-wider">
              Automated Speed
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Cheap Pak Panel Section */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            Why We Are #1 in Pakistan
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Built Specifically for Pakistani Creators, Resellers & Agencies
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Enjoy seamless local payment options, lightning fast cURL API integration, and round the clock WhatsApp support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-800/60 text-emerald-400 flex items-center justify-center font-bold">
              Rs
            </div>
            <h3 className="text-base font-bold text-white">Cheapest Rates in Pakistan</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Wholesale server clusters with the lowest prices in the market starting from as low as Rs. 20 per 1,000 units.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-950 border border-amber-800/60 text-amber-400 flex items-center justify-center font-bold">
              EP
            </div>
            <h3 className="text-base font-bold text-white">EasyPaisa & JazzCash Instant</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deposit directly into our official account: <span className="text-white font-semibold">{settings.easypaisaTitle} ({settings.easypaisaNumber})</span> with 0% fee.
            </p>
          </div>

          {/* Card 3 - Child Panel Website Friend */}
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-950 border border-purple-800/60 text-purple-400 flex items-center justify-center font-bold">
              🌐
            </div>
            <h3 className="text-base font-bold text-white">Child Panel & Website Friend</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Launch your own SMM panel on your custom domain with your brand, currency, and custom profit margins synced to our API!
            </p>
          </div>

          {/* Card 4 - Refer a Friend & URL Bookmarks */}
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-950 border border-indigo-800/60 text-indigo-400 flex items-center justify-center font-bold">
              🎁
            </div>
            <h3 className="text-base font-bold text-white">Refer a Friend & Saved URLs</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Earn 5% lifetime commissions on friend deposits. Plus, save and bookmark profile URLs for 1-click re-ordering!
            </p>
          </div>
        </div>
      </section>

      {/* Featured Services & Live Price List */}
      <section id="pricing-preview" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Live Price Table
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight mt-0.5">
              Popular Social Media Services
            </h2>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchService}
              onChange={e => setSearchService(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeCategory === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            All Services
          </button>
          {categories.filter(c => c.status === 'active').slice(0, 5).map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Pricing Table */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">Service Name</th>
                <th className="py-2.5 px-3 text-right">Price in PKR / 1k</th>
                <th className="py-2.5 px-3 text-right">Price in USD</th>
                <th className="py-2.5 px-3 text-right">Min/Max</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredPreviewServices.map(svc => (
                <tr key={svc.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-bold text-slate-300">#{svc.id}</td>
                  <td className="py-3 px-3 font-sans font-semibold text-white max-w-sm">
                    <div>{svc.name}</div>
                    {svc.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{svc.description}</p>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-400 tabular-nums">
                    Rs. {convertUsdToPkr(svc.rate).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-300 tabular-nums">
                    ${svc.rate.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-400 tabular-nums">
                    {svc.minQuantity.toLocaleString()} / {svc.maxQuantity.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-sans">
                    <button
                      onClick={() => {
                        if (currentUser) {
                          onNavigateToView('new-order');
                        } else {
                          handleQuickDemo('user');
                        }
                      }}
                      className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors"
                    >
                      Order
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Payment Methods Banner */}
      <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            Zero-Fee Deposits
          </span>
          <h3 className="text-xl font-bold text-white">Supported Payment Gateways</h3>
          <p className="text-xs text-slate-400">
            Deposit in PKR via Pakistani local accounts or international USD / Crypto
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {/* EasyPaisa */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center mx-auto mb-2">
              EP
            </div>
            <span className="font-bold text-white text-xs block">EasyPaisa</span>
            <span className="text-[10px] text-emerald-400">Kaleem Ullah</span>
          </div>

          {/* JazzCash */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
            <div className="w-10 h-10 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center mx-auto mb-2">
              JC
            </div>
            <span className="font-bold text-white text-xs block">JazzCash</span>
            <span className="text-[10px] text-red-400">03338831737</span>
          </div>

          {/* Meezan Bank */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center mx-auto mb-2">
              <Building className="w-5 h-5" />
            </div>
            <span className="font-bold text-white text-xs block">Meezan Bank</span>
            <span className="text-[10px] text-blue-400">IBAN Transfer</span>
          </div>

          {/* Binance Pay */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
            <div className="w-10 h-10 rounded-lg bg-yellow-500 text-slate-950 font-black text-xs flex items-center justify-center mx-auto mb-2">
              USDT
            </div>
            <span className="font-bold text-white text-xs block">Binance Pay</span>
            <span className="text-[10px] text-yellow-400">TRC20 / Crypto</span>
          </div>

          {/* Perfect Money */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
            <div className="w-10 h-10 rounded-lg bg-red-700 text-white font-black text-xs flex items-center justify-center mx-auto mb-2">
              PM
            </div>
            <span className="font-bold text-white text-xs block">Perfect Money</span>
            <span className="text-[10px] text-red-400">USD Auto Deposit</span>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-3xl mx-auto space-y-4">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            Got Questions?
          </span>
          <h3 className="text-xl font-bold text-white">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-3 pt-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left font-semibold text-white flex items-center justify-between hover:bg-slate-850 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-slate-300 leading-relaxed border-t border-slate-800/60 bg-slate-950/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Floating WhatsApp Support Action */}
      <div className="fixed bottom-6 right-6 z-40">
        <a
          href="https://wa.me/923338831737?text=Hello%20Cheap%20Pak%20Panel%20Support,%20I%20need%20assistance."
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xl shadow-emerald-600/40 hover:scale-105 transition-all"
          title="Direct WhatsApp Support with Kaleem Ullah (03338831737)"
        >
          <MessageCircle className="w-5 h-5 fill-white" />
          <span className="hidden sm:inline">WhatsApp Help: 03338831737</span>
        </a>
      </div>

      {/* Public Footer */}
      <footer className="pt-8 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-extrabold text-white">CHEAP PAK PANEL</span> — Pakistan's #1 SMM Reseller Panel
          <p className="text-[11px] text-slate-500 mt-0.5">cheappakpanel.com · Official Account: Kaleem Ullah (03338831737)</p>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <button onClick={() => onNavigateToView('services')} className="hover:text-white">Services</button>
          <button onClick={() => onNavigateToView('api-docs')} className="hover:text-white">API v2</button>
          <button onClick={() => onNavigateToView('add-funds')} className="hover:text-white">Payment Proof</button>
          <button onClick={onOpenAuth} className="text-emerald-400 hover:underline font-semibold">Sign In</button>
        </div>
      </footer>
    </div>
  );
};
