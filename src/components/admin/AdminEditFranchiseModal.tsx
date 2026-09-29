import React, { useState } from 'react';
import {
  X,
  User,
  Wallet,
  Shield,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  FolderKanban,
  RotateCcw,
} from 'lucide-react';
import { Franchise } from '../../types/database';
import { SidTechDatabase, hashPassword } from '../../services/storage';
import { ImageUploadCompressor } from '../common/ImageUploadCompressor';
import { StatusChip } from '../common/StatusChip';

interface AdminEditFranchiseModalProps {
  franchise: Franchise;
  onClose: () => void;
  onRefresh: () => void;
  onOpenIdCard?: (franchise: Franchise) => void;
  onViewProjects?: (franchiseId: string) => void;
}

export const AdminEditFranchiseModal: React.FC<AdminEditFranchiseModalProps> = ({
  franchise,
  onClose,
  onRefresh,
  onOpenIdCard,
  onViewProjects,
}) => {
  const [name, setName] = useState(franchise.name);
  const [branchName, setBranchName] = useState(franchise.branchName);
  const [mobile, setMobile] = useState(franchise.mobile);
  const [email, setEmail] = useState(franchise.email);
  const [address, setAddress] = useState(franchise.address);
  const [photoUrl, setPhotoUrl] = useState(franchise.photoUrl);
  const [status, setStatus] = useState<Franchise['status']>(franchise.status);
  const [walletBalance, setWalletBalance] = useState<number>(franchise.walletBalance);
  const [totalEarned, setTotalEarned] = useState<number>(franchise.totalEarned);
  const [totalWithdrawn, setTotalWithdrawn] = useState<number>(franchise.totalWithdrawn);
  const [newPassword, setNewPassword] = useState('');
  const [resetTPin, setResetTPin] = useState(false);

  // Quick Adjustment states
  const [quickAdjustAmount, setQuickAdjustAmount] = useState<string>('');
  const [quickAdjustType, setQuickAdjustType] = useState<'credit' | 'debit'>('credit');
  const [quickAdjustReason, setQuickAdjustReason] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleQuickAdjust = (e: React.MouseEvent) => {
    e.preventDefault();
    const amount = Number(quickAdjustAmount);
    if (!amount || amount <= 0) {
      setNotice({ text: 'Please enter a valid positive adjustment amount.', type: 'error' });
      return;
    }
    if (quickAdjustType === 'credit') {
      setWalletBalance((prev) => prev + amount);
      setTotalEarned((prev) => prev + amount);
      setNotice({
        text: `Credited ₹${amount.toLocaleString('en-IN')} to wallet & total earnings! Remember to click 'Save Changes' to permanently persist in Database.`,
        type: 'success',
      });
    } else {
      setWalletBalance((prev) => Math.max(0, prev - amount));
      setNotice({
        text: `Debited ₹${amount.toLocaleString('en-IN')} from wallet! Remember to click 'Save Changes' to permanently persist in Database.`,
        type: 'success',
      });
    }
    setQuickAdjustAmount('');
    setQuickAdjustReason('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    setSaving(true);
    try {
      const updates: Partial<Franchise> = {
        name: name.trim(),
        branchName: branchName.trim(),
        mobile: String(mobile || '').replace(/\D/g, '').slice(-10),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        photoUrl,
        status,
        walletBalance: Number(walletBalance) || 0,
        totalEarned: Number(totalEarned) || 0,
        totalWithdrawn: Number(totalWithdrawn) || 0,
      };

      if (status === 'Approved' && !franchise.approvedOn) {
        updates.approvedOn = new Date().toISOString();
      }

      if (newPassword.trim()) {
        if (newPassword.trim().length < 6) {
          setNotice({ text: 'New password must be at least 6 characters long.', type: 'error' });
          setSaving(false);
          return;
        }
        updates.password = newPassword.trim();
        updates.passwordHash = hashPassword(newPassword.trim());
      }

      if (resetTPin) {
        updates.tPin = '1234';
        updates.tPinSet = false;
        updates.tPinHash = undefined;
      }

      const updated = await SidTechDatabase.updateFranchiseProfile(franchise.franchiseId, updates);
      if (updated) {
        setNotice({ text: 'Franchise profile updated in Database successfully!', type: 'success' });
        setSaving(false);
        onRefresh();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setNotice({ text: 'Failed to update franchise.', type: 'error' });
        setSaving(false);
      }
    } catch (err: unknown) {
      setNotice({
        text: err instanceof Error ? err.message : 'Error updating franchise in Database',
        type: 'error',
      });
      setSaving(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 bg-slate-900/75 backdrop-blur-sm overflow-y-auto overscroll-contain animate-in fade-in duration-150"
    >
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto sm:my-8 flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#12294A] p-5 text-white flex items-center justify-between border-b-2 border-[#E86A17] sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E86A17] flex items-center justify-center font-black text-white text-sm shadow">
              ST
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">{franchise.branchName}</h3>
                <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-400/30">
                  {franchise.franchiseId}
                </span>
              </div>
              <p className="text-xs text-orange-200">
                Company Admin Full Profile View & Edit Panel
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusChip status={status} size="sm" />
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          {notice && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                notice.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}
            >
              {notice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              )}
              <span>{notice.text}</span>
            </div>
          )}

          {/* Quick Action Shortcuts */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 font-medium">Quick Branch Actions:</span>
            <div className="flex items-center gap-2">
              {onOpenIdCard && (
                <button
                  type="button"
                  onClick={() => onOpenIdCard(franchise)}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5 text-[#12294A]" />
                  <span>View ID Card</span>
                </button>
              )}
              {onViewProjects && (
                <button
                  type="button"
                  onClick={() => {
                    onViewProjects(franchise.franchiseId);
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FolderKanban className="w-3.5 h-3.5" />
                  <span>View Branch Projects</span>
                </button>
              )}
            </div>
          </div>

          {/* Section 1: Basic Information & Photo */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-[#12294A] border-b border-slate-200 pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-[#E86A17]" />
              <span>Owner & Branch Contact Information</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
              <div className="md:col-span-1 space-y-3">
                <ImageUploadCompressor
                  label="Branch Owner Photo (for ID Card & Certs)"
                  initialImageUrl={photoUrl}
                  onImageReady={(dataUrl) => setPhotoUrl(dataUrl)}
                  targetMaxKB={60}
                  aspectDesc="Passport Photo (≤ 60KB)"
                />
              </div>

              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Owner Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Branch Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registered Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Login Email / Gmail
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Physical Branch Address
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Account Status & Financials */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-[#12294A] border-b border-slate-200 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[#E86A17]" />
                <span>Status & Franchise Earnings Control</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Direct Financial Override in Database
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Franchise Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Franchise['status'])}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                >
                  <option value="Approved">Approved (Active License)</option>
                  <option value="Pending">Pending Review</option>
                  <option value="Suspended">Suspended (Blocked Access)</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current Wallet Balance (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={walletBalance}
                  onChange={(e) => setWalletBalance(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-emerald-700 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lifetime Total Earned (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={totalEarned}
                  onChange={(e) => setTotalEarned(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Total Withdrawn (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={totalWithdrawn}
                  onChange={(e) => setTotalWithdrawn(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                />
              </div>
            </div>

            {/* Quick Adjustment Tool */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#12294A] flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-[#E86A17]" />
                  <span>Quick Wallet & Earnings Adjustment</span>
                </span>
                <span className="text-[10px] text-slate-500">
                  Instant credit/debit calculation
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex bg-white rounded-lg border border-slate-300 p-0.5 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setQuickAdjustType('credit')}
                    className={`px-3 py-1.5 rounded-md cursor-pointer transition ${
                      quickAdjustType === 'credit'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    + Credit (Bonus/Earn)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickAdjustType('debit')}
                    className={`px-3 py-1.5 rounded-md cursor-pointer transition ${
                      quickAdjustType === 'debit'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    - Debit (Deduct)
                  </button>
                </div>
                <div className="relative flex-1 min-w-[130px]">
                  <span className="absolute left-3 top-2 text-slate-400 text-xs font-bold">₹</span>
                  <input
                    type="number"
                    min={1}
                    placeholder="Adjustment Amount"
                    value={quickAdjustAmount}
                    onChange={(e) => setQuickAdjustAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Reason / Reference Note (e.g. Festival Bonus, Correction)"
                  value={quickAdjustReason}
                  onChange={(e) => setQuickAdjustReason(e.target.value)}
                  className="flex-1 min-w-[160px] px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                />
                <button
                  type="button"
                  onClick={handleQuickAdjust}
                  className="px-3.5 py-1.5 bg-[#12294A] hover:bg-[#0c1c33] text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  Apply to Fields
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Credentials */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-[#12294A] border-b border-slate-200 pb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#E86A17]" />
              <span>Admin Security & Credentials Override</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Override Password (Optional)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Leave blank to keep existing password"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  T-PIN Security Status
                </label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-bold text-slate-800">
                      {franchise.tPinSet ? '✓ T-PIN Configured' : '⚠ T-PIN Unset'}
                    </span>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg border border-rose-200">
                    <input
                      type="checkbox"
                      checked={resetTPin}
                      onChange={(e) => setResetTPin(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>Force T-PIN Reset</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving to Database...' : 'Save & Update in Database'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
