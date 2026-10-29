import React from 'react';
import { useSMM } from '../../context/SMMContext';
import {
  Home,
  LayoutDashboard,
  PlusCircle,
  Layers,
  History,
  ListOrdered,
  CreditCard,
  Code2,
  LifeBuoy,
  Users,
  Settings,
  Server,
  FileCheck2,
  Database,
  BarChart3,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeView,
  setActiveView
}) => {
  const { currentUser, orders, payments, tickets } = useSMM();

  const pendingPaymentsCount = payments.filter(p => p.status === 'pending').length;
  const openTicketsCount = tickets.filter(t => t.status === 'open').length;
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;

  const userNavItems = [
    { id: 'landing', label: 'Public Website (Home)', icon: Home },
    { id: 'dashboard', label: 'Client Dashboard', icon: LayoutDashboard },
    { id: 'new-order', label: 'New Order', icon: PlusCircle },
    { id: 'mass-order', label: 'Mass Order', icon: Layers },
    { id: 'orders', label: 'Orders Log', icon: History, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined },
    { id: 'services', label: 'Services Catalog', icon: ListOrdered },
    { id: 'add-funds', label: 'Add Funds (EasyPaisa)', icon: CreditCard },
    { id: 'api-docs', label: 'API v2 Documentation', icon: Code2 },
    { id: 'tickets', label: 'Support Tickets', icon: LifeBuoy, badge: openTicketsCount > 0 ? openTicketsCount : undefined },
  ];

  const adminNavItems = [
    { id: 'admin-dashboard', label: 'Admin Analytics', icon: BarChart3 },
    { id: 'admin-users', label: 'User Management', icon: Users },
    { id: 'admin-services', label: 'Services & Pricing', icon: ListOrdered },
    { id: 'admin-orders', label: 'Order Processing', icon: History, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined },
    { id: 'admin-providers', label: 'API Providers (Sync)', icon: Server },
    { id: 'admin-payments', label: 'Payment Approvals', icon: FileCheck2, badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : undefined, badgeColor: 'bg-amber-500' },
    { id: 'admin-tickets', label: 'Ticket Center', icon: LifeBuoy, badge: openTicketsCount > 0 ? openTicketsCount : undefined },
    { id: 'admin-settings', label: 'System Settings', icon: Settings },
    { id: 'admin-deployment', label: 'cPanel & MySQL Setup', icon: Database },
  ];

  const handleNavClick = (viewId: string) => {
    setActiveView(viewId);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold">
              Navigation Menu
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Nav Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* User Section */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              User Dashboard
            </div>
            <nav className="space-y-1">
              {userNavItems.map(item => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Admin Section (Always accessible for easy testing & demo) */}
          <div className="pt-2 border-t border-slate-800/70">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[11px] font-semibold tracking-wider text-purple-400 uppercase flex items-center gap-1.5">
                Admin Control
              </span>
              {currentUser?.role !== 'admin' && (
                <span className="text-[10px] text-slate-500">Demo Access</span>
              )}
            </div>

            <nav className="space-y-1">
              {adminNavItems.map(item => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-purple-600 text-white font-semibold shadow-sm'
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
          </div>
        </div>

        {/* Footer info box */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">API Status</span>
            <span className="text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              Operational
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
            <span>Rate 1 USD =</span>
            <span className="font-mono text-slate-400">280 PKR</span>
          </div>
        </div>
      </aside>
    </>
  );
};
