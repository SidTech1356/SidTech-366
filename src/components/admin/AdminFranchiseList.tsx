import React, { useState } from 'react';
import {
  Building2,
  Search,
  CreditCard,
  UserX,
  UserCheck,
  FolderKanban,
  Edit,
} from 'lucide-react';
import { Franchise, Project } from '../../types/database';
import { SidTechDatabase } from '../../services/storage';
import { StatusChip } from '../common/StatusChip';
import { IDCardPreview } from '../generators/IDCardPreview';
import { AdminEditFranchiseModal } from './AdminEditFranchiseModal';

interface AdminFranchiseListProps {
  franchises: Franchise[];
  projects: Project[];
  onRefresh: () => void;
  onFilterProjectsByFranchise: (franchiseId: string) => void;
}

export const AdminFranchiseList: React.FC<AdminFranchiseListProps> = ({
  franchises,
  projects,
  onRefresh,
  onFilterProjectsByFranchise,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [viewIdCardFranchise, setViewIdCardFranchise] = useState<Franchise | null>(null);
  const [editFranchise, setEditFranchise] = useState<Franchise | null>(null);

  const filteredFranchises = franchises.filter((f) => {
    const matchesStatus = statusFilter === 'All' || f.status === statusFilter;
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.branchName.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase()) ||
      f.franchiseId.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleToggleSuspend = async (franchise: Franchise) => {
    const nextStatus = franchise.status === 'Suspended' ? 'Approved' : 'Suspended';
    await SidTechDatabase.updateFranchiseStatus(franchise.franchiseId, nextStatus);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#12294A] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#E86A17]" />
            All Franchise Branches ({franchises.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage regional licenses, audit branch wallets, and view credentials in Database
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved Only</option>
            <option value="Pending">Pending Review</option>
            <option value="Suspended">Suspended</option>
            <option value="Rejected">Rejected</option>
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID, branch..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
            />
          </div>
        </div>
      </div>

      {/* Grid of Branches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFranchises.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No franchises match the search filter.
          </div>
        ) : (
          filteredFranchises.map((f) => {
            const branchProjects = projects.filter((p) => p.franchiseId === f.franchiseId);
            return (
              <div
                key={f.franchiseId}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={f.photoUrl}
                      alt={f.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-mono text-[10px] font-bold text-[#E86A17] uppercase">
                        {f.franchiseId}
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 truncate">{f.name}</h3>
                      <p className="text-xs text-slate-500 truncate font-medium">{f.branchName}</p>
                    </div>
                  </div>
                  <StatusChip status={f.status} size="sm" />
                </div>

                {/* Details */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mobile:</span>
                    <span className="font-medium text-slate-800">{f.mobile}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[170px]">{f.email}</span>
                  </div>
                  <div className="flex justify-between items-center bg-indigo-50/80 px-2 py-1 rounded-md border border-indigo-100/80 text-[11px]">
                    <span className="text-indigo-900 font-medium">Password:</span>
                    <span className="font-mono font-bold text-indigo-700">{f.password || 'Franchise@123'}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/60 pt-1.5 mt-1.5">
                    <span className="text-slate-400">Wallet Balance:</span>
                    <span className="font-mono font-bold text-emerald-600">
                      ₹{f.walletBalance.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Projects:</span>
                    <span className="font-bold text-[#12294A]">
                      {branchProjects.length} orders
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditFranchise(f)}
                      className="px-2.5 py-1.5 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-2xs cursor-pointer"
                      title="Fully View, Update & Edit Franchise Profile"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewIdCardFranchise(f)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-[#12294A]" />
                      <span>ID Card</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onFilterProjectsByFranchise(f.franchiseId)}
                      className="px-2 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                      title="View Projects by this Franchise"
                    >
                      <FolderKanban className="w-3.5 h-3.5" />
                      <span>Orders</span>
                    </button>
                    {f.status === 'Approved' && (
                      <button
                        type="button"
                        onClick={() => handleToggleSuspend(f)}
                        className="px-2 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition cursor-pointer"
                        title="Suspend Branch Access"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {f.status === 'Suspended' && (
                      <button
                        type="button"
                        onClick={() => handleToggleSuspend(f)}
                        className="px-2 py-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg text-xs font-semibold transition cursor-pointer"
                        title="Reactivate Branch"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ID Card Modal */}
      {viewIdCardFranchise && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewIdCardFranchise(null);
          }}
          className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 bg-slate-900/75 backdrop-blur-sm overflow-y-auto animate-in fade-in"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full border border-slate-200 relative my-6">
            <button
              onClick={() => setViewIdCardFranchise(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 z-10 cursor-pointer font-bold"
            >
              ✕
            </button>
            <IDCardPreview franchise={viewIdCardFranchise} />
          </div>
        </div>
      )}

      {/* Edit Franchise Modal */}
      {editFranchise && (
        <AdminEditFranchiseModal
          franchise={editFranchise}
          onClose={() => setEditFranchise(null)}
          onRefresh={onRefresh}
          onOpenIdCard={(f) => setViewIdCardFranchise(f)}
          onViewProjects={onFilterProjectsByFranchise}
        />
      )}
    </div>
  );
};
