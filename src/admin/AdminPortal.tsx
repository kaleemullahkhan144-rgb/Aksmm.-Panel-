import React, { useState } from 'react';
import { useSMM } from '../context/SMMContext';
import {
  ShieldCheck,
  BarChart3,
  Users,
  ListOrdered,
  History,
  Server,
  FileCheck2,
  LifeBuoy,
  Settings,
  Database,
  Globe,
  LogOut,
  RefreshCw,
  Menu,
  X
} from 'lucide-react';

import { AdminDashboard } from '../components/admin/AdminDashboard';
import { AdminUsers } from '../components/admin/AdminUsers';
import { AdminServices } from '../components/admin/AdminServices';
import { AdminOrders } from '../components/admin/AdminOrders';
import { AdminProviders } from '../components/admin/AdminProviders';
import { AdminPayments } from '../components/admin/AdminPayments';
import { AdminTickets } from '../components/admin/AdminTickets';
import { AdminSettings } from '../components/admin/AdminSettings';
import { AdminDeploymentGuide } from '../components/admin/AdminDeploymentGuide';
import { AdminChildPanels } from '../components/admin/AdminChildPanels';

interface AdminPortalProps {
  onGoToUserSite: () => void;
  onLogoutAdmin: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onGoToUserSite, onLogoutAdmin }) => {
  const {
    payments,
    tickets,
    orders,
    childPanels,
    activeCurrency,
    setActiveCurrency,
    runAutomatedCron
  } = useSMM();

  const [activeAdminTab, setActiveAdminTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [cronFeedback, setCronFeedback] = useState<string | null>(null);

  const pendingPaymentsCount = payments.filter(p => p.status === 'pending').length;
  const openTicketsCount = tickets.filter(t => t.status === 'open').length;
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
  const pendingPanelsCount = childPanels.filter(p => p.status === 'pending').length;

  const handleCronTrigger = () => {
    const res = runAutomatedCron();
    setCronFeedback(`Cron Cycle: ${res.forwarded} forwarded, ${res.synced} synced!`);
    setTimeout(() => setCronFeedback(null), 3500);
  };

  const navItems = [
    { id: 'dashboard', label: 'Master Analytics', icon: BarChart3 },
    {
      id: 'payments',
      label: 'Payment Approvals',
      icon: FileCheck2,
      badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : undefined,
      badgeColor: 'bg-amber-500'
    },
    { id: 'users', label: 'User Management', icon: Users },
    {
      id: 'orders',
      label: 'Order Queue',
      icon: History,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined
    },
    { id: 'services', label: 'Services & Pricing', icon: ListOrdered },
    { id: 'providers', label: 'API Providers (Sync)', icon: Server },
    {
      id: 'child-panels',
      label: 'Child Panels & Resellers',
      icon: Globe,
      badge: pendingPanelsCount > 0 ? pendingPanelsCount : undefined,
      badgeColor: 'bg-indigo-600'
    },
    {
      id: 'tickets',
      label: 'Ticket Center',
      icon: LifeBuoy,
      badge: openTicketsCount > 0 ? openTicketsCount : undefined
    },
    { id: 'settings', label: 'System Settings', icon: Settings },
    { id: 'deployment', label: 'cPanel & MySQL Setup', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 sm:px-6 py-3 bg-slate-900 border-b border-purple-900/40 text-slate-100 shadow-md">
        {/* Brand & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(prev => !prev)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-purple-600/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-white whitespace-nowrap">
                AK SMM <span className="text-purple-400">Admin Center</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] text-purple-300 font-mono bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                /admin portal
              </span>
            </div>
          </div>
        </div>

        {/* Currency Switcher & Quick Cron */}
        <div className="hidden md:flex items-center gap-3 text-xs">
          <div className="flex items-center rounded-lg bg-slate-950 p-0.5 border border-slate-800">
            <button
              onClick={() => setActiveCurrency('PKR')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                activeCurrency === 'PKR' ? 'bg-emerald-600 text-white' : 'text-slate-400'
              }`}
            >
              Rs. PKR
            </button>
            <button
              onClick={() => setActiveCurrency('USD')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                activeCurrency === 'USD' ? 'bg-purple-600 text-white' : 'text-slate-400'
              }`}
            >
              $ USD
            </button>
          </div>

          <button
            onClick={handleCronTrigger}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5"
            title="Trigger automated order forwarding & status sync"
          >
            <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
            <span>Trigger Cron</span>
          </button>

          {cronFeedback && (
            <span className="text-emerald-400 text-xs font-semibold">
              {cronFeedback}
            </span>
          )}
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-2">
          {/* Switch to user site */}
          <button
            onClick={onGoToUserSite}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
            title="Open User Facing Storefront & Dashboard"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">User Website (/)</span>
          </button>

          {/* Logout */}
          <button
            onClick={onLogoutAdmin}
            className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-semibold border border-rose-800 flex items-center gap-1.5 transition-colors"
            title="Exit Admin Session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Admin Shell */}
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile backdrop */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          />
        )}

        {/* Dedicated Admin Sidebar */}
        <aside
          className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <span className="text-xs uppercase tracking-widest text-purple-400 font-bold">
              Admin Navigation
            </span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-white lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeAdminTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveAdminTab(item.id);
                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-purple-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full text-white ${
                        item.badgeColor || 'bg-purple-900 border border-purple-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800 bg-slate-950/70 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-white">Administrator: Kaleem Ullah</div>
            <div className="text-[10px] text-slate-500 font-mono">EasyPaisa: 03338831737</div>
          </div>
        </aside>

        {/* Admin Content Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full">
          {activeAdminTab === 'dashboard' && <AdminDashboard onNavigate={setActiveAdminTab} />}
          {activeAdminTab === 'payments' && <AdminPayments />}
          {activeAdminTab === 'users' && <AdminUsers />}
          {activeAdminTab === 'orders' && <AdminOrders />}
          {activeAdminTab === 'services' && <AdminServices />}
          {activeAdminTab === 'providers' && <AdminProviders />}
          {activeAdminTab === 'child-panels' && <AdminChildPanels />}
          {activeAdminTab === 'tickets' && <AdminTickets />}
          {activeAdminTab === 'settings' && <AdminSettings />}
          {activeAdminTab === 'deployment' && <AdminDeploymentGuide />}
        </main>
      </div>
    </div>
  );
};
