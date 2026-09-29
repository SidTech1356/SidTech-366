import React, { useState } from 'react';
import { CreditCard, Check, X } from 'lucide-react';
import { Payment } from '../../types/database';
import { SidTechDatabase } from '../../services/storage';
import { StatusChip } from '../common/StatusChip';

interface AdminPaymentsVerificationProps {
  payments: Payment[];
  onRefresh: () => void;
}

export const AdminPaymentsVerification: React.FC<AdminPaymentsVerificationProps> = ({
  payments,
  onRefresh,
}) => {
  const [filter, setFilter] = useState<'All' | 'Submitted' | 'Verified' | 'Rejected'>('Submitted');
  const [rejectModalPayment, setRejectModalPayment] = useState<Payment | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  const filteredPayments = payments.filter((p) => {
    if (filter === 'All') return true;
    return p.status === filter;
  });

  const handleVerify = async (paymentId: string) => {
    await SidTechDatabase.verifyPayment(paymentId, 'admin');
    onRefresh();
  };

  const handleReject = async () => {
    if (!rejectModalPayment) return;
    await SidTechDatabase.rejectPayment(rejectModalPayment.paymentId, rejectReason);
    setRejectModalPayment(null);
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
            Payments & UTR Verification Queue (Database)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit submitted bank UTRs against your agency bank statement and update Database ledgers
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
          {(['Submitted', 'Verified', 'Rejected', 'All'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                filter === tab
                  ? 'bg-white text-slate-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'Submitted' ? 'Pending Verify' : tab}
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
                <th className="py-3 px-4">Payment ID</th>
                <th className="py-3 px-4">Project ID</th>
                <th className="py-3 px-4">Franchise Branch</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">UTR Number</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No payments found in this filter view in Database.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.paymentId} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#12294A]">
                      {p.paymentId}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#E86A17]">
                      {p.projectId}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {p.franchiseName}
                      <span className="block text-[10px] text-slate-400 font-mono">{p.franchiseId}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 text-sm">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 select-all">
                      {p.utr}
                      <span className="block text-[10px] text-slate-400 font-sans font-normal">
                        {new Date(p.submittedOn).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusChip status={p.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      {p.status === 'Submitted' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleVerify(p.paymentId)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Verify Payment</span>
                          </button>
                          <button
                            onClick={() => {
                              setRejectModalPayment(p);
                              setRejectReason('');
                            }}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg font-bold text-xs transition cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] font-medium">
                          {p.status === 'Verified' ? `Verified by ${p.verifiedBy || 'admin'}` : 'Rejected'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalPayment && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setRejectModalPayment(null);
          }}
          className="fixed inset-0 z-50 overflow-y-auto overscroll-contain p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs flex items-start justify-center animate-in fade-in duration-150"
        >
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-200 space-y-4 my-auto sm:my-8">
            <h4 className="font-bold text-base text-slate-900">
              Reject Submitted Payment ({rejectModalPayment.paymentId})
            </h4>
            <p className="text-xs text-slate-500">
              State the reason for rejecting UTR <strong>{rejectModalPayment.utr}</strong> (Amount: ₹{rejectModalPayment.amount.toLocaleString('en-IN')}).
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rejection Reason
              </label>
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. UTR not reflected in bank account statement, amount mismatch..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalPayment(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
