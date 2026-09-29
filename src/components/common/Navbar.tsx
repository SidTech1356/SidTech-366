import React, { useState } from 'react';
import {
  Bell,
  Wallet,
  LogOut,
  User,
  ShieldCheck,
  ChevronDown,
  Building2,
  Menu,
  Database,
  Flame,
} from 'lucide-react';
import { AuthSession, NotificationItem } from '../../types/database';
import { NotificationDropdown } from './NotificationDropdown';

interface NavbarProps {
  session: AuthSession | null;
  notifications: NotificationItem[];
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onLogout: () => void;
  onSelectTab?: (tab: string) => void;
  onRefreshNotifications: () => void;
  onToggleSidebar?: () => void;
  onOpenVerify?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  session,
  notifications,
  onOpenLogin,
  onOpenRegister,
  onLogout,
  onSelectTab,
  onRefreshNotifications,
  onToggleSidebar,
  onOpenVerify,
}) => {
  const [showNotifs, setShowNotifs] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);

  const franchise = session?.franchise;
  const isAdmin = session?.role === 'admin';

  const userNotifications = notifications.filter((n) => {
    if (isAdmin) return n.franchiseId === 'admin';
    if (franchise) return n.franchiseId === franchise.franchiseId || n.franchiseId === '';
    return false;
  });

  const unreadCount = userNotifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-[#12294A] text-white shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Brand & Mobile Sidebar Toggle */}
        <div className="flex items-center gap-3">
          {session && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div
            onClick={() => onSelectTab && onSelectTab('overview')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#E86A17] flex items-center justify-center font-extrabold text-white text-base shadow-sm group-hover:scale-105 transition">
              ST
            </div>
            <div>
              <div className="font-extrabold text-lg text-white leading-tight tracking-wide flex items-center gap-1.5">
                SIDTECH <span className="text-[#E86A17]">366</span>
              </div>
              <div className="text-[10px] text-slate-300 font-medium tracking-wider uppercase">
                Enterprise Cloud Suite
              </div>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Universal ID Verification Button */}
          {onOpenVerify && (
            <button
              onClick={onOpenVerify}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-amber-300 hover:text-white font-semibold transition cursor-pointer"
              title="Verify Official Franchise or Certificate"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Verify ID / Certificate</span>
              <span className="sm:hidden">Verify</span>
            </button>
          )}

          {/* Real-time Cloud Database Status Pill (Strictly Admin Panel Only) */}
          {isAdmin && (
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-500/15 text-orange-300 border border-orange-500/30 text-xs font-semibold"
              title="Real-time Enterprise Cloud Database Connected"
            >
              <Database className="w-3.5 h-3.5 text-[#E86A17]" />
              <span className="text-[11px] font-bold">Cloud DB</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
          )}

          {session ? (
            <>
              {/* Franchise Wallet Chip */}
              {!isAdmin && franchise && (
                <div
                  onClick={() => onSelectTab && onSelectTab('wallet')}
                  className="hidden sm:flex items-center gap-2 bg-[#0c1c33] hover:bg-[#071324] border border-orange-500/30 px-3 py-1.5 rounded-xl cursor-pointer transition shadow-xs"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#E86A17]/20 flex items-center justify-center text-[#E86A17]">
                    <Wallet className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium leading-none">Wallet</div>
                    <div className="text-xs font-bold text-amber-300 font-mono leading-tight">
                      ₹{franchise.walletBalance.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#E86A17] text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {showNotifs && (
                  <NotificationDropdown
                    notifications={userNotifications}
                    franchiseId={isAdmin ? 'admin' : franchise?.franchiseId || ''}
                    onRefresh={onRefreshNotifications}
                    onSelectTarget={(targetId, type) => {
                      if (onSelectTab) {
                        if (type === 'Payment') onSelectTab('payments');
                        else if (type === 'Payout') onSelectTab(isAdmin ? 'payouts' : 'wallet');
                        else if (type === 'Approval') onSelectTab(isAdmin ? 'approvals' : 'overview');
                        else onSelectTab('projects');
                      }
                    }}
                    onClose={() => setShowNotifs(false)}
                  />
                )}
              </div>

              {/* Profile Avatar / Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/10 transition text-left cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-orange-400/50 bg-[#0c1c33] flex items-center justify-center flex-shrink-0">
                    {franchise?.photoUrl ? (
                      <img
                        src={franchise.photoUrl}
                        alt={franchise.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-slate-300" />
                    )}
                  </div>
                  <div className="hidden md:block max-w-[140px]">
                    <div className="text-xs font-bold text-white truncate leading-tight">
                      {isAdmin ? 'Super Admin' : franchise?.name}
                    </div>
                    <div className="text-[10px] text-orange-300 truncate leading-none">
                      {isAdmin ? 'System Root' : franchise?.franchiseId}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 text-slate-800 z-50 text-xs animate-in fade-in duration-100">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <div className="font-bold text-slate-900 truncate">
                        {isAdmin ? 'Super Admin' : franchise?.branchName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {isAdmin ? 'admin@sidtech366.com' : franchise?.email}
                      </div>
                    </div>
                    {!isAdmin && franchise && (
                      <>
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onSelectTab && onSelectTab('profile');
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                        >
                          <User className="w-3.5 h-3.5 text-[#E86A17]" />
                          My Profile Settings
                        </button>
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onSelectTab && onSelectTab('idcard');
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-[#12294A]" />
                          My Authorized ID Card
                        </button>
                      </>
                    )}
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Public Landing Header CTA */
            <div className="flex items-center gap-2.5">
              <button
                onClick={onOpenLogin}
                className="text-xs sm:text-sm font-semibold text-white hover:text-orange-200 px-3 py-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={onOpenRegister}
                className="bg-[#E86A17] hover:bg-[#d45e12] text-white text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Building2 className="w-4 h-4" />
                <span>Become a Franchise</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
