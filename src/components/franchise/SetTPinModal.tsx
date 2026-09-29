import React, { useState } from 'react';
import { ShieldCheck, KeyRound, Eye, EyeOff, Lock, AlertCircle, LogOut } from 'lucide-react';
import { Franchise } from '../../types/database';
import { SidTechDatabase } from '../../services/storage';

interface SetTPinModalProps {
  franchise: Franchise;
  onSuccess: () => void;
  onLogout: () => void;
}

export const SetTPinModal: React.FC<SetTPinModalProps> = ({
  franchise,
  onSuccess,
  onLogout,
}) => {
  const [pin, setPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanPin = pin.trim();
    const cleanConfirm = confirmPin.trim();

    if (!/^\d{4}$/.test(cleanPin)) {
      setError('T-PIN must be exactly 4 numeric digits (0-9).');
      return;
    }
    if (cleanPin !== cleanConfirm) {
      setError('Confirm T-PIN does not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    const res = await SidTechDatabase.setFranchiseTPin(franchise.franchiseId, cleanPin);
    if (res.success) {
      setIsSubmitting(false);
      onSuccess();
    } else {
      setIsSubmitting(false);
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm flex items-start justify-center animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col my-auto sm:my-8">
        {/* Top Header */}
        <div className="bg-[#12294A] p-6 text-white text-center relative border-b-4 border-[#E86A17]">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#E86A17] to-amber-500 mx-auto flex items-center justify-center shadow-lg mb-3">
            <KeyRound className="w-7 h-7 text-white" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/30">
            Mandatory First-Time Security Setup
          </span>
          <h2 className="text-xl font-black mt-2 tracking-tight text-white">
            Set Your 4-Digit T-PIN
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Transaction & Credential Protection for {franchise.branchName}
          </p>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-1.5 text-xs text-amber-900">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <ShieldCheck className="w-4 h-4 text-[#E86A17] flex-shrink-0" />
              <span>Why is T-PIN required?</span>
            </div>
            <ul className="text-[11px] text-amber-800/90 list-disc list-inside space-y-1 pl-1">
              <li>Required to authorize <strong>Wallet Cash Payouts / Withdrawals</strong>.</li>
              <li>Required to authenticate <strong>Password Changes & Resets</strong>.</li>
              <li>Stored securely in Cloud Database.</li>
            </ul>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Create 4-Digit Security T-PIN
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={4}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-center text-xl font-mono font-bold tracking-widest text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block text-center">
                Enter any 4-digit number that only you know.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Confirm 4-Digit Security T-PIN
              </label>
              <input
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={4}
                required
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-center text-xl font-mono font-bold tracking-widest text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || pin.length !== 4 || confirmPin.length !== 4}
              className="w-full py-3 bg-[#E86A17] hover:bg-[#d45e12] disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Lock className="w-4 h-4" />
              <span>{isSubmitting ? 'Securing Account in Database...' : 'Save T-PIN & Access Dashboard'}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-center">
            <button
              type="button"
              onClick={onLogout}
              className="text-xs text-slate-400 hover:text-rose-600 font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out / Set later on next login</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
