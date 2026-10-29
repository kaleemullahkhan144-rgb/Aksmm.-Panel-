import React, { useState } from 'react';
import { useSMM } from '../../context/SMMContext';
import {
  Zap,
  Globe,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Bell,
  RefreshCw,
  Menu,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenAuth: () => void;
  activeView: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenAuth, activeView }) => {
  const {
    currentUser,
    logout,
    switchRole,
    activeCurrency,
    setActiveCurrency,
    formatCurrency,
    runAutomatedCron,
    settings
  } = useSMM();

  const [cronFeedback, setCronFeedback] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleCronTrigger = () => {
    const res = runAutomatedCron();
    setCronFeedback(`Cron executed: ${res.forwarded} forwarded, ${res.synced} synced`);
    setTimeout(() => setCronFeedback(null), 3000);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 sm:px-6 py-3 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100">
      {/* Zone 1: Brand & Sidebar toggle */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors lg:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.hash = ''}>
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-extrabold text-xs shadow-md shadow-emerald-500/20">
            PK
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-white whitespace-nowrap leading-none">
              Cheap<span className="text-emerald-400">Pak</span>Panel
            </span>
            <span className="text-[9px] text-slate-400 font-mono tracking-wider">
              cheappakpanel.com
            </span>
          </div>
        </div>
      </div>

      {/* Zone 2: Navigation Info, Currency Switcher & Quick Cron */}
      <div className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-400">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-800/80 border border-slate-700/60">
          <span className="text-slate-500">View:</span>
          <span className="text-slate-200 capitalize font-medium">{activeView.replace('-', ' ')}</span>
        </div>

        {/* Currency Switcher (PKR default) */}
        <div className="flex items-center rounded-lg bg-slate-950 p-0.5 border border-slate-800">
          <button
            onClick={() => setActiveCurrency('PKR')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
              activeCurrency === 'PKR'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Rs. PKR
          </button>
          <button
            onClick={() => setActiveCurrency('USD')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
              activeCurrency === 'USD'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            $ USD
          </button>
        </div>

        {/* Quick Cron Runner for Testing */}
        <button
          onClick={handleCronTrigger}
          title="Run background order forwarding and status sync simulation"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
          <span>Sync Engine</span>
        </button>

        {cronFeedback && (
          <span className="text-emerald-400 flex items-center gap-1 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {cronFeedback}
          </span>
        )}
      </div>

      {/* Zone 3: User Details, Balance & Role Switcher */}
      <div className="flex items-center gap-3 shrink-0">
        {currentUser ? (
          <>
            {/* Balance Display */}
            <div className="flex flex-col items-end px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/70">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Balance</span>
              <span className="text-sm font-bold text-emerald-400 font-mono tabular-nums">
                {formatCurrency(currentUser.balance)}
              </span>
            </div>

            {/* Role quick toggle for easy testing */}
            <button
              onClick={() => switchRole(currentUser.role === 'admin' ? 'user' : 'admin')}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                currentUser.role === 'admin'
                  ? 'bg-purple-950/80 text-purple-300 border-purple-800/80 hover:bg-purple-900/80'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
              }`}
              title="Click to switch instantly between User and Admin perspectives"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Role: {currentUser.role === 'admin' ? 'Admin' : 'User'}</span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(prev => !prev)}
                className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white uppercase overflow-hidden">
                  {currentUser.username.substring(0, 2)}
                </div>
                <span className="hidden sm:inline text-xs font-medium text-slate-200">
                  {currentUser.username}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg bg-slate-900 border border-slate-800 shadow-xl py-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="font-semibold text-white">{currentUser.username}</p>
                    <p className="text-slate-400 truncate">{currentUser.email}</p>
                    <p className="text-[10px] text-indigo-400 font-mono mt-1">
                      Role: {currentUser.role.toUpperCase()}
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        switchRole(currentUser.role === 'admin' ? 'user' : 'admin');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-purple-400" />
                      Switch to {currentUser.role === 'admin' ? 'User Mode' : 'Admin Panel'}
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-rose-400 hover:bg-slate-800 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <button
            onClick={onOpenAuth}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-md shadow-indigo-600/20"
          >
            Sign In / Register
          </button>
        )}
      </div>
    </header>
  );
};
