import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  X,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { Franchise, Project, Payout } from '../../types/database';
import { SidTechDatabase } from '../../services/storage';
import { StatusChip } from '../common/StatusChip';

interface FranchiseWalletProps {
  franchise: Franchise;
  projects: Project[];
  payouts: Payout[];
  onRefresh: () => void;
}

export const FranchiseWallet: React.FC<FranchiseWalletProps> = ({
  franchise,
  projects,
  payouts,
  onRefresh,
}) => {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState<number>(franchise.walletBalance);
  const [upiId, setUpiId] = useState<string>(franchise.email.includes('@') ? franchise.email.split('@')[0] + '@okaxis' : '');
  const [tPin, setTPin] = useState<string>('');
  const [showTPin, setShowTPin] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deliveredCommissionProjects = projects.filter((p) => p.status === 'Delivered');

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (amount <= 0) {
      setError('Please enter a valid withdrawal amount.');
      return;
    }
    if (amount > franchise.walletBalance) {
      setError(`Cannot withdraw more than current balance of ₹${franchise.walletBalance.toLocaleString('en-IN')}`);
      return;
    }
    if (!upiId.trim() || !upiId.includes('@')) {
      setError('Please provide a valid recipient UPI ID (e.g. yourname@oksbi).');
      return;
    }
    if (!tPin.trim() || tPin.trim().length !== 4) {
      setError('Please enter your 4-digit Transaction Security PIN (T-PIN).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await SidTechDatabase.requestPayout({
        franchiseId: franchise.franchiseId,
        amount,
        upiId,
        tPin: tPin.trim(),
      });
      if (res.success) {
        setIsSubmitting(false);
        setShowWithdrawModal(false);
        setTPin('');
        onRefresh();
      } else {
        setError(res.message);
        setIsSubmitting(false);
      }
    } catch {
      setError('Failed to submit withdrawal request.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Wallet Balance Card */}
        <div className="bg-gradient-to-br from-[#12294A] to-[#1e3e6b] text-white p-6 rounded-2xl shadow-md border border-slate-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-orange-300 uppercase tracking-wider">
                Available Wallet Balance
              </span>
              <Wallet className="w-5 h-5 text-[#E86A17]" />
            </div>
            <div className="text-3xl font-black mt-2 font-mono text-amber-300">
              ₹{franchise.walletBalance.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Ready for instant UPI payout transfer (Live Synced)
            </p>
          </div>
          <button
            onClick={() => {
              setAmount(franchise.walletBalance);
              setShowWithdrawModal(true);
            }}
            disabled={franchise.walletBalance <= 0}
            className="mt-5 w-full py-2.5 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Request Withdrawal</span>
          </button>
        </div>

        {/* Total Earned Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Total Lifetime Earnings
              </span>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-black mt-2 font-mono text-emerald-600">
              ₹{franchise.totalEarned.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              From {deliveredCommissionProjects.length} completed project deliveries
            </p>
          </div>
          <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-3 mt-4">
            Guaranteed commission auto-credited upon delivery.
          </div>
        </div>

        {/* Total Withdrawn Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Total Payouts Received
              </span>
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-black mt-2 font-mono text-slate-800">
              ₹{franchise.totalWithdrawn.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Processed directly to your registered bank / UPI
            </p>
          </div>
          <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-3 mt-4">
            Processed within 24 hours of request.
          </div>
        </div>
      </div>

      {/* Two Columns: Commission Breakdown & Payouts History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#12294A]">
              Project Commission Breakdown
            </h3>
            <span className="text-xs font-semibold text-slate-400">
              {deliveredCommissionProjects.length} Credited
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Project</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3">Comm %</th>
                  <th className="py-2.5 px-3 text-right">Credited</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {deliveredCommissionProjects.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No delivered projects yet. Commission will appear here upon completion.
                    </td>
                  </tr>
                ) : (
                  deliveredCommissionProjects.map((p) => (
                    <tr key={p.projectId} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3">
                        <div className="font-mono font-bold text-[#12294A]">{p.projectId}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[120px]">{p.serviceName}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        ₹{p.finalPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-600">
                        {p.commissionPercent}%
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-600 text-right">
                        +₹{p.commissionAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#12294A]">
              Withdrawal & Payout History
            </h3>
            <span className="text-xs font-semibold text-slate-400">
              {payouts.length} Requests
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Payout ID</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {payouts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No withdrawal requests yet.
                    </td>
                  </tr>
                ) : (
                  payouts.map((po) => (
                    <tr key={po.payoutId} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#12294A]">
                        {po.payoutId}
                        {po.referenceNote && (
                          <div className="text-[10px] text-slate-400 font-sans truncate max-w-[140px]">
                            {po.referenceNote}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                        ₹{po.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusChip status={po.status} size="sm" />
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-right font-medium">
                        {new Date(po.requestedOn).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
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

      {/* Withdrawal Request Modal */}
      {showWithdrawModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowWithdrawModal(false);
          }}
          className="fixed inset-0 z-50 overflow-y-auto overscroll-contain p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs flex items-start justify-center animate-in fade-in duration-150"
        >
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto sm:my-8 flex flex-col">
            <div className="bg-[#12294A] px-6 py-4 text-white flex items-center justify-between border-b-2 border-[#E86A17]">
              <div>
                <h3 className="font-bold text-base text-white">Request Commission Payout</h3>
                <p className="text-xs text-orange-200">Transfer to your personal or branch UPI ID</p>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="p-6 space-y-4">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Available Wallet Balance:</span>
                <span className="font-mono font-bold text-emerald-600 text-sm">
                  ₹{franchise.walletBalance.toLocaleString('en-IN')}
                </span>
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Withdrawal Amount (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    required
                    min={100}
                    max={franchise.walletBalance}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Receiving UPI ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. mobile@paytm or name@okaxis"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    4-Digit Transaction Security PIN (T-PIN) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Required for payout</span>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showTPin ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={4}
                    required
                    value={tPin}
                    onChange={(e) => setTPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="••••"
                    className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono tracking-widest text-center font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTPin(!showTPin)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showTPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || tPin.length !== 4}
                  className="px-5 py-2.5 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Verifying T-PIN in Database...' : 'Confirm Withdrawal Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
