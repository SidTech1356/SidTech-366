import React from 'react';
import {
  FolderKanban,
  Clock,
  Wallet,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { Franchise, Project } from '../../types/database';
import { StatusChip } from '../common/StatusChip';

interface FranchiseOverviewProps {
  franchise: Franchise;
  projects: Project[];
  onSelectTab: (tab: string) => void;
  onSelectProject: (projectId: string) => void;
}

export const FranchiseOverview: React.FC<FranchiseOverviewProps> = ({
  franchise,
  projects,
  onSelectTab,
  onSelectProject,
}) => {
  const activeProjects = projects.filter(
    (p) => p.status === 'Accepted' || p.status === 'Processing' || p.status === 'DemoReady' || p.status === 'New'
  );
  const deliveredProjects = projects.filter((p) => p.status === 'Delivered');
  const recentProjects = [...projects].slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Branch Welcome Banner */}
      <div className="bg-gradient-to-r from-[#12294A] via-[#1a3861] to-[#12294A] text-white p-6 rounded-2xl shadow-lg border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#E86A17] uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Authorized Branch: {franchise.franchiseId}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Welcome back, {franchise.name}!
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {franchise.branchName} • {franchise.address}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('catalog')}
            className="px-4 py-2.5 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Book New Project</span>
          </button>
          <button
            onClick={() => onSelectTab('idcard')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>View ID Card</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Booked</span>
            <FolderKanban className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{projects.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Lifetime client orders</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">In Progress</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{activeProjects.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Under development</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Wallet Balance</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-mono">
            ₹{franchise.walletBalance.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Available for withdrawal</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Lifetime Commission</span>
            <TrendingUp className="w-4 h-4 text-[#E86A17]" />
          </div>
          <div className="text-2xl font-bold text-[#E86A17] font-mono">
            ₹{franchise.totalEarned.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{deliveredProjects.length} Delivered projects</div>
        </div>
      </div>

      {/* Newly Added / Updated Projects Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E86A17]" />
              Newly Added & Updated Projects
            </h3>
            <p className="text-xs text-slate-500">
              Live status tracking directly from SidTech delivery team in Database
            </p>
          </div>
          <button
            onClick={() => onSelectTab('projects')}
            className="text-xs font-bold text-[#12294A] hover:text-[#E86A17] flex items-center gap-1 transition cursor-pointer"
          >
            <span>View All ({projects.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentProjects.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No projects booked yet. Browse our catalog to book your first client project!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentProjects.map((p) => (
              <div
                key={p.projectId}
                onClick={() => {
                  onSelectProject(p.projectId);
                  onSelectTab('projects');
                }}
                className="py-3 px-2 hover:bg-slate-50 rounded-xl transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-[#12294A] text-[11px] flex-shrink-0">
                    {p.projectId}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-sm">{p.serviceName}</div>
                    <div className="text-slate-500 text-xs">Client: <span className="font-semibold text-slate-700">{p.clientName}</span> ({p.clientMobile})</div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-800">₹{p.finalPrice.toLocaleString('en-IN')}</div>
                    <div className="text-[10px] text-slate-400">
                      Paid: <span className="font-semibold text-emerald-600">₹{p.amountPaid.toLocaleString('en-IN')}</span> | Due: <span className="font-semibold text-rose-500">₹{p.amountDue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <StatusChip status={p.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
