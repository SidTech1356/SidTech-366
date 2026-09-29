import React from 'react';
import { CreditCard } from 'lucide-react';
import { Payment } from '../../types/database';
import { StatusChip } from '../common/StatusChip';

interface FranchisePaymentsProps {
  payments: Payment[];
}

export const FranchisePayments: React.FC<FranchisePaymentsProps> = ({ payments }) => {
  const totalPaid = payments
    .filter((p) => p.status === 'Verified')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalSubmitted = payments
    .filter((p) => p.status === 'Submitted')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#12294A] flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#E86A17]" />
            Payments & Installment Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full record of all UPI & bank transfers stored in Database
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-xs">
            <span className="text-emerald-700 block text-[10px] font-semibold">Total Verified</span>
            <span className="font-mono font-bold text-emerald-800 text-sm">
              ₹{totalPaid.toLocaleString('en-IN')}
            </span>
          </div>

          {totalSubmitted > 0 && (
            <div className="bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-xl text-xs">
              <span className="text-amber-700 block text-[10px] font-semibold">Pending Admin Verify</span>
              <span className="font-mono font-bold text-amber-800 text-sm">
                ₹{totalSubmitted.toLocaleString('en-IN')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#12294A] text-white font-semibold">
              <tr>
                <th className="py-3 px-4">Payment ID</th>
                <th className="py-3 px-4">Project ID</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4">UTR / Ref Number</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Submitted Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No payment records found. When you deposit advance or project installments, they will appear here.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.paymentId} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#12294A]">
                      {p.paymentId}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#E86A17]">
                      {p.projectId}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 text-sm">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600">
                      {p.mode}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800 select-all">
                      {p.utr}
                    </td>
                    <td className="py-3 px-4">
                      <StatusChip status={p.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-right font-medium">
                      {new Date(p.submittedOn).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
