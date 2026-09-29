import React, { useState } from 'react';
import { Check, X, UserCheck, AlertTriangle, Eye, CreditCard } from 'lucide-react';
import { Franchise } from '../../types/database';
import { SidTechDatabase } from '../../services/storage';
import { StatusChip } from '../common/StatusChip';
import { IDCardPreview } from '../generators/IDCardPreview';

interface AdminFranchiseApprovalsProps {
  franchises: Franchise[];
  onRefresh: () => void;
}

export const AdminFranchiseApprovals: React.FC<AdminFranchiseApprovalsProps> = ({
  franchises,
  onRefresh,
}) => {
  const [selectedFranchise, setSelectedFranchise] = useState<Franchise | null>(null);
  const [rejectModalFranchise, setRejectModalFranchise] = useState<Franchise | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [previewIdCardFranchise, setPreviewIdCardFranchise] = useState<Franchise | null>(null);

  const pendingList = franchises.filter((f) => f.status === 'Pending');

  const handleApprove = async (franchiseId: string) => {
    const success = await SidTechDatabase.approveFranchise(franchiseId);
    if (success) {
      setSelectedFranchise(null);
      onRefresh();
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectModalFranchise) return;
    await SidTechDatabase.rejectFranchise(rejectModalFranchise.franchiseId, rejectReason);
    setRejectModalFranchise(null);
    setSelectedFranchise(null);
    setRejectReason('');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#12294A] flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#E86A17]" />
            Franchise Approval Queue (Real-time Database)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verify branch documents, approve regional operations in Database, and issue authorized digital ID cards
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-300 text-amber-800 px-3.5 py-1.5 rounded-xl text-xs font-bold">
          {pendingList.length} Pending Review
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#12294A] text-white font-semibold">
              <tr>
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Branch Display Name</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Registered On</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {pendingList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No pending franchise applications in Database. All registrations are approved or processed!
                  </td>
                </tr>
              ) : (
                pendingList.map((f) => (
                  <tr key={f.franchiseId} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={f.photoUrl}
                          alt={f.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{f.name}</div>
                          <div className="font-mono text-[11px] text-[#E86A17] font-semibold">
                            {f.franchiseId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {f.branchName}
                    </td>
                    <td className="py-3 px-4 space-y-0.5">
                      <div className="text-slate-800 font-medium">{f.mobile}</div>
                      <div className="text-slate-500 text-[11px]">{f.email}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-medium">
                      {new Date(f.registeredOn).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <StatusChip status={f.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedFranchise(f)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-[#12294A] hover:bg-slate-100 transition cursor-pointer"
                          title="View Profile Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleApprove(f.franchiseId)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Issue ID</span>
                        </button>
                        <button
                          onClick={() => {
                            setRejectModalFranchise(f);
                            setRejectReason('');
                          }}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Profile Review Modal */}
      {selectedFranchise && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedFranchise(null);
          }}
          className="fixed inset-0 z-50 overflow-y-auto overscroll-contain p-2 sm:p-4 bg-slate-900/75 backdrop-blur-xs flex items-start justify-center animate-in fade-in duration-150"
        >
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto sm:my-8 flex flex-col">
            <div className="bg-[#12294A] px-6 py-4 text-white flex items-center justify-between border-b-2 border-[#E86A17]">
              <div>
                <h3 className="font-bold text-base text-white">Franchise Application Details</h3>
                <p className="text-xs text-orange-200">{selectedFranchise.franchiseId}</p>
              </div>
              <button
                onClick={() => setSelectedFranchise(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <img
                  src={selectedFranchise.photoUrl}
                  alt={selectedFranchise.name}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm"
                />
                <div>
                  <h4 className="font-bold text-base text-slate-900">{selectedFranchise.name}</h4>
                  <div className="text-xs font-semibold text-slate-600">{selectedFranchise.branchName}</div>
                  <div className="font-mono text-xs text-[#E86A17] font-bold mt-0.5">
                    {selectedFranchise.franchiseId}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Email Address:</span>
                  <span className="font-semibold text-slate-800">{selectedFranchise.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Mobile Number:</span>
                  <span className="font-semibold text-slate-800">{selectedFranchise.mobile}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block">Office / Branch Address:</span>
                  <span className="font-semibold text-slate-800 leading-snug">{selectedFranchise.address}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Application Date:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(selectedFranchise.registeredOn).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setPreviewIdCardFranchise(selectedFranchise)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Preview ID Card</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRejectModalFranchise(selectedFranchise);
                      setRejectReason('');
                    }}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Reject Application
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedFranchise.franchiseId)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve in Database</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalFranchise && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setRejectModalFranchise(null);
          }}
          className="fixed inset-0 z-50 overflow-y-auto overscroll-contain p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs flex items-start justify-center animate-in fade-in duration-150"
        >
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-200 space-y-4 my-auto sm:my-8">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="font-bold text-base text-slate-900">
                Reject Franchise Application
              </h4>
            </div>
            <p className="text-xs text-slate-500">
              Please state the reason for rejecting <strong>{rejectModalFranchise.name}</strong> ({rejectModalFranchise.branchName}).
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Rejection
              </label>
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Incomplete address, territorial overlap, missing documents..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalFranchise(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ID Card Preview Modal */}
      {previewIdCardFranchise && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewIdCardFranchise(null);
          }}
          className="fixed inset-0 z-50 overflow-y-auto overscroll-contain p-2 sm:p-4 bg-slate-900/75 backdrop-blur-xs flex items-start justify-center animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 max-w-2xl w-full border border-slate-200 relative my-auto sm:my-8 flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 print:hidden">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Authorized Franchise ID Card
              </span>
              <button
                type="button"
                onClick={() => setPreviewIdCardFranchise(null)}
                className="px-3 py-1 bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            <IDCardPreview franchise={previewIdCardFranchise} />
          </div>
        </div>
      )}
    </div>
  );
};
