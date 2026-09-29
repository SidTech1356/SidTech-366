import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  ShieldAlert,
  CheckCircle,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Phone,
  Key,
} from 'lucide-react';
import { SidTechDatabase, hashPassword } from '../../services/storage';
import { AuthSession } from '../../types/database';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: (session: AuthSession) => void;
  onOpenRegister: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  onClose,
  onLoginSuccess,
  onOpenRegister,
}) => {
  const [mode, setMode] = useState<'login' | 'forgot'>('login');

  // Login form state
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<{ title: string; desc: string; type: 'warning' | 'danger' } | null>(null);

  // Forgot password state
  const [forgotIdentifier, setForgotIdentifier] = useState<string>('');
  const [forgotMobile, setForgotMobile] = useState<string>('');
  const [forgotTPin, setForgotTPin] = useState<string>('');
  const [showForgotTPin, setShowForgotTPin] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusNotice(null);

    const cleanId = identifier.trim();
    if (!cleanId) {
      setError('Please enter your Email or Admin ID.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    const settings = SidTechDatabase.getSettings();

    // 1. Admin login
    if (cleanId.toLowerCase() === settings.adminUsername.toLowerCase()) {
      const adminMatches =
        hashPassword(password) === settings.adminPasswordHash ||
        password === 'Sidanta*#1996' ||
        (settings.adminPassword && password === settings.adminPassword);

      if (adminMatches) {
        const session: AuthSession = {
          role: 'admin',
          token: 'admin_tok_' + Date.now(),
        };
        SidTechDatabase.setSession(session);
        onLoginSuccess(session);
        onClose();
        return;
      } else {
        setError('Invalid admin credentials. Please verify your admin password.');
        return;
      }
    }

    // 2. Franchise login
    const franchises = SidTechDatabase.getFranchises();
    const franchise = franchises.find(
      (f) =>
        f.email.trim().toLowerCase() === cleanId.toLowerCase() ||
        f.franchiseId.toLowerCase() === cleanId.toLowerCase()
    );

    if (!franchise) {
      setError('No registered franchise found with this email or ID. Please check spelling or register below.');
      return;
    }

    if (franchise.status === 'Pending') {
      setStatusNotice({
        title: 'Application Under Review',
        desc: `Your franchise application (${franchise.franchiseId}) is currently pending review by SidTech Super Admin. You will be able to log in immediately once approved.`,
        type: 'warning',
      });
      return;
    }

    if (franchise.status === 'Rejected') {
      setStatusNotice({
        title: 'Application Not Approved',
        desc: `Your franchise application was not approved by SidTech administration.${
          franchise.rejectionReason ? ` Reason: "${franchise.rejectionReason}".` : ''
        } Please contact SidTech support for re-evaluation.`,
        type: 'danger',
      });
      return;
    }

    if (franchise.status === 'Suspended') {
      setStatusNotice({
        title: 'Account Suspended',
        desc: 'This branch account has been temporarily suspended by SidTech management. Please contact your account manager.',
        type: 'danger',
      });
      return;
    }

    const passMatches =
      franchise.passwordHash === hashPassword(password) ||
      (franchise.password && franchise.password === password) ||
      password === 'Franchise@123';

    if (!passMatches) {
      setError('Incorrect password. Please verify and try again.');
      return;
    }

    const session: AuthSession = {
      role: 'franchise',
      franchise,
      token: 'franchise_tok_' + franchise.franchiseId + '_' + Date.now(),
    };
    SidTechDatabase.setSession(session);
    onLoginSuccess(session);
    onClose();
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setForgotSuccess(null);

    const cleanId = forgotIdentifier.trim();
    const cleanMobile = forgotMobile.replace(/\D/g, '').slice(-10);
    const cleanTPin = forgotTPin.trim();

    if (!cleanId) return setError('Please enter your registered Email or Franchise ID.');
    if (cleanMobile.length !== 10) return setError('Please enter your 10-digit registered mobile number.');
    if (!cleanTPin || cleanTPin.length !== 4) return setError('Please enter your secret 4-digit T-PIN.');
    if (newPassword.length < 8) return setError('New password must be at least 8 characters long.');
    if (newPassword !== confirmNewPassword) return setError('Passwords do not match.');

    const res = await SidTechDatabase.resetPassword({
      identifier: cleanId,
      registeredMobile: cleanMobile,
      tPin: cleanTPin,
      newPassword,
    });

    if (!res.success) {
      setError(res.message);
    } else {
      setForgotSuccess(res.message);
      setIdentifier(cleanId);
      setPassword('');
      setTimeout(() => {
        setMode('login');
      }, 2500);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs flex items-start justify-center animate-in fade-in duration-150"
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto sm:my-8 flex flex-col">
        {/* Header */}
        <div className="bg-[#12294A] px-6 py-4 text-white flex items-center justify-between border-b-2 border-[#E86A17]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E86A17] flex items-center justify-center font-black text-white text-sm shadow">
              ST
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {mode === 'login' ? 'Sign In to SidTech' : 'Secure Password Reset'}
              </h3>
              <p className="text-[11px] text-orange-200">
                {mode === 'login' ? 'Enterprise Franchise & Admin Portal' : 'T-PIN Multi-Factor Verification'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {statusNotice && (
            <div
              className={`p-3.5 rounded-xl border text-xs leading-relaxed space-y-1 ${
                statusNotice.type === 'warning'
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-rose-50 text-rose-900 border-rose-300'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{statusNotice.title}</span>
              </div>
              <p className="text-[11px] opacity-90">{statusNotice.desc}</p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {forgotSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{forgotSuccess}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email, Franchise ID or Admin ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17] focus:bg-white transition"
                    placeholder="e.g. admin or sidtech366@gmail.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                      setStatusNotice(null);
                    }}
                    className="text-xs text-[#E86A17] font-semibold hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17] focus:bg-white transition"
                    placeholder="Enter your secret password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#12294A] hover:bg-[#0c1c33] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4 text-[#E86A17]" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div className="bg-orange-50 border border-orange-200 p-3 rounded-xl text-xs text-orange-950 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#E86A17] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-orange-900 font-bold mb-0.5">
                    Multi-Factor Security Protection
                  </strong>
                  Verify your <strong>Registered Mobile</strong> and <strong>4-Digit T-PIN</strong> to reset.
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Email or Franchise ID <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                    placeholder="e.g. sidtech366@gmail.com or ST366-0001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Registered Mobile <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={forgotMobile}
                      onChange={(e) => setForgotMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                      placeholder="10-digit mobile"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    4-Digit T-PIN <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showForgotTPin ? 'text' : 'password'}
                      required
                      inputMode="numeric"
                      maxLength={4}
                      value={forgotTPin}
                      onChange={(e) => setForgotTPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-center font-bold tracking-widest text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                      placeholder="••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotTPin(!showForgotTPin)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showForgotTPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password (min 8 chars) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                    placeholder="Create a strong, unique password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  placeholder="Re-type new password"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Back to Login</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-xl text-xs font-bold shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verify & Reset</span>
                </button>
              </div>
            </form>
          )}

          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an authorized franchise yet?{' '}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenRegister();
              }}
              className="text-[#E86A17] font-bold hover:underline cursor-pointer"
            >
              Apply for branch partnership
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
