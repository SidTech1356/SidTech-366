import React from 'react';
import {
  Users,
  Clock,
  FolderKanban,
  TrendingUp,
  CreditCard,
  Building2,
  Shield,
  Database,
} from 'lucide-react';
import { Franchise, Project, Payment, Payout, NotificationItem } from '../../types/database';

interface AdminDashboardProps {
  franchises: Franchise[];
  projects: Project[];
  payments: Payment[];
  payouts: Payout[];
  notifications: NotificationItem[];
  onSelectTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  franchises,
  projects,
  payments,
  payouts,
  notifications,
  onSelectTab,
}) => {
  const pendingApprovals = franchises.filter((f) => f.status === 'Pending');
  const activeProjects = projects.filter(
    (p) => p.status === 'New' || p.status === 'Accepted' || p.status === 'Processing' || p.status === 'DemoReady'
  );
  const pendingPayments = payments.filter((p) => p.status === 'Submitted');
  const pendingPayouts = payouts.filter((p) => p.status === 'Requested' || p.status === 'Processing');
  const totalRevenue = payments
    .filter((p) => p.status === 'Verified')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalCommissionPaid = payouts
    .filter((p) => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#12294A] via-[#1b3a64] to-[#12294A] text-white p-6 rounded-2xl shadow-lg border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#E86A17] uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>SidTech Central Command Center • Real-time Cloud Active</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Agency Operations & Network Control
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Review branch registrations, verify client payments, and manage project deliverables powered by Enterprise Data Engine
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pendingApprovals.length > 0 && (
            <button
              onClick={() => onSelectTab('approvals')}
              className="px-4 py-2 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 animate-pulse cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>{pendingApprovals.length} Franchises Pending Review</span>
            </button>
          )}
          <button
            onClick={() => onSelectTab('firestore')}
            className="px-4 py-2 bg-orange-600/90 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold border border-orange-400/30 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Database className="w-4 h-4 text-orange-200" />
            <span>Database Explorer</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5"></span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div
          onClick={() => onSelectTab('franchises')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-[#12294A] transition"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Total Branches</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{franchises.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">
            {franchises.filter((f) => f.status === 'Approved').length} Approved Branches
          </div>
        </div>

        <div
          onClick={() => onSelectTab('approvals')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-[#E86A17] transition"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Pending Approvals</span>
            <Clock className="w-4 h-4 text-[#E86A17]" />
          </div>
          <div className="text-2xl font-bold text-[#E86A17]">{pendingApprovals.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">Awaiting ID card grant</div>
        </div>

        <div
          onClick={() => onSelectTab('projects')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-[#12294A] transition"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Active Projects</span>
            <FolderKanban className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-600">{activeProjects.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">{projects.length} Total orders</div>
        </div>

        <div
          onClick={() => onSelectTab('payments')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-emerald-600 transition"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Verified Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-mono">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {pendingPayments.length} UTRs awaiting verify
          </div>
        </div>

        <div
          onClick={() => onSelectTab('payouts')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-amber-600 transition col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Pending Payouts</span>
            <CreditCard className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{pendingPayouts.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">₹{totalCommissionPaid.toLocaleString('en-IN')} Paid out</div>
        </div>
      </div>

      {/* Grid: Pending Actions & Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#12294A] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#E86A17]" />
              Franchise Applications Queue
            </h3>
            <button
              onClick={() => onSelectTab('approvals')}
              className="text-xs font-bold text-[#E86A17] hover:underline cursor-pointer"
            >
              View All ({pendingApprovals.length})
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingApprovals.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No pending franchise registrations. All applications processed!
              </div>
            ) : (
              pendingApprovals.slice(0, 5).map((f) => (
                <div
                  key={f.franchiseId}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={f.photoUrl}
                      alt={f.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="font-bold text-slate-800">{f.name}</div>
                      <div className="text-slate-500 text-[11px]">{f.branchName} • {f.mobile}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectTab('approvals')}
                    className="px-3 py-1.5 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-lg font-bold text-xs shadow-xs cursor-pointer"
                  >
                    Review
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Activity Feed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#12294A] flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Live System Activity Stream
            </h3>
            <span className="text-[11px] text-slate-400">Real-time Enterprise audit log</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {notifications.slice(0, 10).map((n) => (
              <div key={n.notifId} className="py-2.5 flex items-start gap-2.5 text-xs">
                <div className="w-2 h-2 rounded-full bg-[#12294A] mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-700 leading-snug">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(n.createdOn).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
