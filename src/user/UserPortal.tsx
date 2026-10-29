import React, { useState } from 'react';
import { useSMM } from '../context/SMMContext';
import {
  Menu,
  X,
  Zap,
  LayoutDashboard,
  PlusCircle,
  Layers,
  History,
  ListOrdered,
  CreditCard,
  Code2,
  LifeBuoy,
  Home,
  ShieldCheck,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Lock,
  Globe,
  Bookmark,
  Users
} from 'lucide-react';

import { LandingPage } from '../components/public/LandingPage';
import { UserDashboard } from '../components/user/UserDashboard';
import { NewOrder } from '../components/user/NewOrder';
import { MassOrder } from '../components/user/MassOrder';
import { OrdersHistory } from '../components/user/OrdersHistory';
import { ServicesCatalog } from '../components/user/ServicesCatalog';
import { AddFunds } from '../components/user/AddFunds';
import { ApiDocs } from '../components/user/ApiDocs';
import { SupportTickets } from '../components/user/SupportTickets';
import { ChildPanel } from '../components/user/ChildPanel';
import { SavedUrls } from '../components/user/SavedUrls';
import { Affiliates } from '../components/user/Affiliates';
import { AuthModal } from '../components/auth/AuthModal';

interface UserPortalProps {
  onGoToAdmin: () => void;
}

export const UserPortal: React.FC<UserPortalProps> = ({ onGoToAdmin }) => {
  const {
    currentUser,
    logout,
    activeCurrency,
    setActiveCurrency,
    formatCurrency,
    settings,
    orders,
    tickets
  } = useSMM();

  const [activeUserTab, setActiveUserTab] = useState<string>('landing');
  const [prefillOrderUrl, setPrefillOrderUrl] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const pendingOrdersCount = currentUser
    ? orders.filter(o => o.userId === currentUser.id && o.status === 'Pending').length
    : 0;

  const openTicketsCount = currentUser
    ? tickets.filter(t => t.userId === currentUser.id && t.status === 'open').length
    : 0;

  const clientNavItems = [
    { id: 'landing', label: 'Home Website', icon: Home },
    { id: 'dashboard', label: 'Client Dashboard', icon: LayoutDashboard },
    { id: 'new-order', label: 'New Order', icon: PlusCircle },
    { id: 'saved-urls', label: 'Saved URLs & Links', icon: Bookmark },
    { id: 'mass-order', label: 'Mass Order', icon: Layers },
    {
      id: 'orders',
      label: 'Orders Log',
      icon: History,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined
    },
    { id: 'services', label: 'Services Catalog', icon: ListOrdered },
    { id: 'child-panels', label: 'Child Panel (Website)', icon: Globe },
    { id: 'affiliates', label: 'Refer a Friend (5% Comm)', icon: Users },
    { id: 'add-funds', label: 'Add Funds (EasyPaisa)', icon: CreditCard },
    { id: 'api-docs', label: 'API v2 Key & Docs', icon: Code2 },
    {
      id: 'tickets',
      label: 'Support Tickets',
      icon: LifeBuoy,
      badge: openTicketsCount > 0 ? openTicketsCount : undefined
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* User Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 sm:px-6 py-3 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100 shadow-sm">
        {/* Brand & Mobile Hamburger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsSidebarOpen(prev => !prev)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors lg:hidden"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setActiveUserTab('landing')}
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-extrabold text-xs shadow-md shadow-emerald-500/20">
              AK
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-white whitespace-nowrap leading-none">
                AK <span className="text-emerald-400">SMM Panel</span>
              </span>
              <span className="text-[9px] text-slate-400 font-mono tracking-wider">
                cheappakpanel.com
              </span>
            </div>
          </div>
        </div>

        {/* Currency Switcher & Current View */}
        <div className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-800/80 border border-slate-700/60">
            <span className="text-slate-500">Page:</span>
            <span className="text-slate-200 capitalize font-medium">{activeUserTab.replace('-', ' ')}</span>
          </div>

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
        </div>

        {/* User Balance & Account Dropdown */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser ? (
            <>
              {/* Balance */}
              <div className="flex flex-col items-end px-3 py-1 rounded-lg bg-slate-800/90 border border-slate-700/70">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Balance</span>
                <span className="text-sm font-bold text-emerald-400 font-mono tabular-nums">
                  {formatCurrency(currentUser.balance)}
                </span>
              </div>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(prev => !prev)}
                  className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                    {currentUser.username.substring(0, 2)}
                  </div>
                  <span className="hidden sm:inline text-xs font-medium text-slate-200">
                    {currentUser.username}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl bg-slate-900 border border-slate-800 shadow-xl py-2 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="font-semibold text-white">{currentUser.username}</p>
                      <p className="text-slate-400 truncate text-[11px]">{currentUser.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setActiveUserTab('add-funds');
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                      >
                        <CreditCard className="w-4 h-4 text-emerald-400" />
                        Add Funds (EasyPaisa)
                      </button>
                      <button
                        onClick={() => {
                          setActiveUserTab('orders');
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                      >
                        <History className="w-4 h-4 text-indigo-400" />
                        My Orders
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
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-md shadow-emerald-600/20"
            >
              Sign In / Register
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile backdrop */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          />
        )}

        {/* Client Sidebar */}
        <aside
          className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
              User Menu
            </span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-white lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items (User Only - No Admin options) */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {clientNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeUserTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveUserTab(item.id);
                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-emerald-300 border border-slate-700">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Box with discreet Link to /admin */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/70 text-[11px] text-slate-400 space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span>Deposit Info</span>
              <span className="text-emerald-400 font-mono">0% Fee</span>
            </div>
            <div className="text-[10px] text-slate-500">
              EasyPaisa: <span className="text-white font-mono">{settings.easypaisaNumber}</span> ({settings.easypaisaTitle})
            </div>

            {/* Separate Admin Portal Link */}
            <div className="pt-2 border-t border-slate-800/60">
              <button
                onClick={onGoToAdmin}
                className="w-full py-1.5 px-2 rounded bg-slate-900 hover:bg-purple-950/80 text-slate-400 hover:text-purple-300 text-[10px] font-mono border border-slate-800 flex items-center justify-center gap-1.5 transition-colors"
                title="Go to separate Admin Control Center (/admin)"
              >
                <Lock className="w-3 h-3 text-purple-400" />
                <span>Admin Login (/admin)</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Client Content Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full">
          {activeUserTab === 'landing' && (
            <LandingPage
              onNavigateToView={setActiveUserTab}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          )}
          {activeUserTab === 'dashboard' && <UserDashboard onNavigate={setActiveUserTab} />}
          {activeUserTab === 'new-order' && (
            <NewOrder
              onNavigate={setActiveUserTab}
              prefillUrl={prefillOrderUrl}
            />
          )}
          {activeUserTab === 'saved-urls' && (
            <SavedUrls
              onNavigateToOrder={u => {
                setPrefillOrderUrl(u);
                setActiveUserTab('new-order');
              }}
            />
          )}
          {activeUserTab === 'mass-order' && <MassOrder />}
          {activeUserTab === 'orders' && <OrdersHistory />}
          {activeUserTab === 'services' && (
            <ServicesCatalog
              onNavigateToOrder={serviceId => {
                setActiveUserTab('new-order');
              }}
            />
          )}
          {activeUserTab === 'child-panels' && <ChildPanel onNavigate={setActiveUserTab} />}
          {activeUserTab === 'affiliates' && <Affiliates />}
          {activeUserTab === 'add-funds' && <AddFunds />}
          {activeUserTab === 'api-docs' && <ApiDocs />}
          {activeUserTab === 'tickets' && <SupportTickets />}
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};
