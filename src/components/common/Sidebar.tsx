import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  FolderKanban,
  CreditCard,
  Wallet,
  Award,
  User,
  Users,
  Settings,
  ShieldCheck,
  Database,
  Flame,
  X,
} from 'lucide-react';
import { AuthSession } from '../../types/database';

interface SidebarProps {
  session: AuthSession;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  pendingApprovalsCount: number;
  pendingPaymentsCount: number;
  pendingPayoutsCount: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  session,
  activeTab,
  onSelectTab,
  pendingApprovalsCount,
  pendingPaymentsCount,
  pendingPayoutsCount,
  isOpenMobile,
  onCloseMobile,
}) => {
  const isAdmin = session.role === 'admin';

  const franchiseLinks: SidebarItem[] = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'catalog', label: 'Service Catalog', icon: ShoppingBag, badge: 'Book' },
    { id: 'projects', label: 'My Projects', icon: FolderKanban },
    { id: 'payments', label: 'Payments Ledger', icon: CreditCard },
    { id: 'wallet', label: 'Wallet & Payouts', icon: Wallet },
    { id: 'idcard', label: 'My ID Card', icon: ShieldCheck },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'profile', label: 'Profile Settings', icon: User },
  ];

  const adminLinks: SidebarItem[] = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'approvals',
      label: 'Franchise Approvals',
      icon: Users,
      badge: pendingApprovalsCount > 0 ? String(pendingApprovalsCount) : undefined,
      badgeColor: 'bg-[#E86A17]',
    },
    { id: 'franchises', label: 'All Franchises', icon: Users },
    { id: 'services', label: 'Service Catalog', icon: ShoppingBag },
    { id: 'projects', label: 'Projects & Orders', icon: FolderKanban },
    {
      id: 'payments',
      label: 'Payment Verify',
      icon: CreditCard,
      badge: pendingPaymentsCount > 0 ? String(pendingPaymentsCount) : undefined,
      badgeColor: 'bg-emerald-600',
    },
    { id: 'settings', label: 'Payment Settings', icon: Settings },
    {
      id: 'payouts',
      label: 'Payouts Manager',
      icon: Wallet,
      badge: pendingPayoutsCount > 0 ? String(pendingPayoutsCount) : undefined,
      badgeColor: 'bg-amber-600',
    },
    {
      id: 'firestore',
      label: 'Database Explorer',
      icon: Database,
      badge: 'Live',
      badgeColor: 'bg-emerald-600',
    },
  ];

  const links = isAdmin ? adminLinks : franchiseLinks;

  const content = (
    <div className="w-64 bg-[#12294A] text-slate-300 flex flex-col h-full border-r border-slate-800">
      {/* Mobile close button */}
      <div className="lg:hidden p-4 flex items-center justify-between border-b border-slate-800">
        <span className="font-bold text-white text-sm">Navigation Menu</span>
        <button
          onClick={onCloseMobile}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav items */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2">
          {isAdmin ? 'System Administration' : 'Branch Operations'}
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = activeTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => {
                onSelectTab(link.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                isActive
                  ? 'bg-[#E86A17] text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </div>
              {link.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white text-[#E86A17]'
                      : link.badgeColor || 'bg-white/10 text-white'
                  }`}
                >
                  {link.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Brand footer with Live Database indicator */}
      <div className="p-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="font-semibold text-slate-300">Live Database</span>
        <span className="text-emerald-400 text-[10px] font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
          Connected
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden lg:block w-64 flex-shrink-0 h-[calc(100vh-4rem)] sticky top-16 z-30">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
