import React, { useState } from 'react';
import { CreditCard, Check, Zap } from 'lucide-react';
import { Payout } from '../../types/database';
import { SidTechDatabase } from '../../services/storage';
import { StatusChip } from '../common/StatusChip';

interface AdminPayoutsManagerProps {
  payouts: Payout[];
  onRefresh: () => void;
}

export const AdminPayoutsManager: React.FC<AdminPayoutsManagerProps> = ({
  payouts,
  onRefresh,
}) => {
  const [filter, setFilter] = useState<'All' | 'Requested' | 'Processing' | 'Paid' | 'Rejected'>('Requested');
  const [payModalPayout, setPayModalPayout] = useState<Payout | null>(null);
  const [refNote, setRefNote] = useState<string>('');
  const [rejectModalPayout, setRejectModalPayout] = useState<Payout | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  const filteredPayouts = payouts.filter((p) => {
    if (filter === 'All') return true;
    return p.status === filter;
  });

  const handleMarkPaid = async () => {
    if (!payModalPayout) return;
    await SidTechDatabase.markPayoutPaid(
      payModalPayout.payoutId,
      refNote.trim() || `UPI TXN REF-${Date.now().toString().slice(-8)}`
    );
    setPayModalPayout(null);
    setRefNote('');
    onRefresh();
  };

  const handleConfirmReject = async () => {
    if (!rejectModalPayout) return;
    await SidTechDatabase.rejectPayout(rejectModalPayout.payoutId, rejectReason);
    setRejectModalPayout(null);
    setRejectReason('');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#12294A] flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#E86A17]" />
            Franchise Commission Payouts Manager (Database)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Process earnings withdrawals via manual UPI transfer or future payout API stored in Database
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
          {(['Requested', 'Processing', 'Paid', 'Rejected', 'All'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                filter === tab
                  ? 'bg-white text-slate-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'Requested' ? 'Pending Action' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#12294A] text-white font-semibold">
              <tr>
                <th className="py-3 px-4">Payout ID</th>
                <th className="py-3 px-4">Franchise Branch</th>
                <th className="py-3 px-4">Amount Requested</th>
                <th className="py-3 px-4">Target UPI ID</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPayouts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No payout requests in this filter in Database.
                  </td>
                </tr>
              ) : (
                filteredPayouts.map((po) => (
                  <tr key={po.payoutId} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#12294A]">
                      {po.payoutId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{po.franchiseName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{po.franchiseId}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 text-sm">
                      ₹{po.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 select-all">
                      {po.upiId || 'Branch default UPI'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusChip status={po.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      {po.status === 'Requested' || po.status === 'Processing' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setPayModalPayout(po);
                              setRefNote(`UPI REF-${Date.now().toString().slice(-8)} transferred`);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Mark Paid</span>
                          </button>
                          <button
                            onClick={() => {
                              setRejectModalPayout(po);
                              setRejectReason('');
                            }}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg font-bold text-xs transition cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500">
                          {po.referenceNote || (po.status === 'Paid' ? 'Paid' : 'Rejected')}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mark Paid Modal */}
      {payModalPayout && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setPayModalPayout(null);
          }}
          className="fixed inset-0 z-50 overflow-y-auto overscroll-contain p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs flex items-start justify-center animate-in fade-in duration-150"
        >
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-200 space-y-4 my-auto sm:my-8">
            <h4 className="font-bold text-base text-slate-900">
              Confirm Manual UPI Payment
            </h4>
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs space-y-1">
              <div>
                Franchise: <strong>{payModalPayout.franchiseName}</strong> ({payModalPayout.franchiseId})
              </div>
              <div>
                Amount: <strong className="font-mono text-emerald-700 text-sm">₹{payModalPayout.amount.toLocaleString('en-IN')}</strong>
              </div>
              <div>
                Destination UPI: <strong className="font-mono">{payModalPayout.upiId}</strong>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bank / UPI Transfer Reference / UTR Note
              </label>
              <input
                type="text"
                required
                value={refNote}
                onChange={(e) => setRefNote(e.target.value)}
                placeholder="e.g. UPI 423500123999 - Paid via Google Pay"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-slate-400" />
                Automatic Instant Payout API (RazorpayX)
              </span>
              <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                Coming Soon
              </span>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPayModalPayout(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMarkPaid}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Confirm Paid in Database
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalPayout && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setRejectModalPayout(null);
          }}
          className="fixed inset-0 z-50 overflow-y-auto overscroll-contain p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs flex items-start justify-center animate-in fade-in duration-150"
        >
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-200 space-y-4 my-auto sm:my-8">
            <h4 className="font-bold text-base text-slate-900">
              Reject Withdrawal Request ({rejectModalPayout.payoutId})
            </h4>
            <p className="text-xs text-slate-500">
              The amount of ₹{rejectModalPayout.amount.toLocaleString('en-IN')} will be refunded immediately back to the franchise wallet balance in the database.
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
                placeholder="e.g. Invalid UPI VPA handle, KYC document re-verification needed..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalPayout(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Confirm Reject & Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
