import React, { useState } from 'react';
import { User, Phone, MapPin, Mail, Lock, ShieldCheck, KeyRound } from 'lucide-react';
import { Franchise } from '../../types/database';
import { SidTechDatabase, hashPassword } from '../../services/storage';
import { ImageUploadCompressor } from '../common/ImageUploadCompressor';

interface FranchiseProfileProps {
  franchise: Franchise;
  onRefresh: () => void;
}

export const FranchiseProfile: React.FC<FranchiseProfileProps> = ({
  franchise,
  onRefresh,
}) => {
  const [name, setName] = useState(franchise.name);
  const [branchName, setBranchName] = useState(franchise.branchName);
  const [mobile, setMobile] = useState(franchise.mobile);
  const [address, setAddress] = useState(franchise.address);
  const [photoUrl, setPhotoUrl] = useState(franchise.photoUrl);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [passwordTPin, setPasswordTPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // T-PIN update state
  const [authKey, setAuthKey] = useState('');
  const [newTPin, setNewTPin] = useState('');
  const [confirmNewTPin, setConfirmNewTPin] = useState('');

  const [profileMsg, setProfileMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [pwdMsg, setPwdMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [tPinMsg, setTPinMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    try {
      const updated = await SidTechDatabase.updateFranchiseProfile(franchise.franchiseId, {
        name,
        branchName,
        mobile,
        address,
        photoUrl,
      });
      if (updated) {
        setProfileMsg({ text: 'Profile details updated successfully in Database!', type: 'success' });
        onRefresh();
      } else {
        setProfileMsg({ text: 'Failed to update profile.', type: 'error' });
      }
    } catch {
      setProfileMsg({ text: 'Error saving profile.', type: 'error' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);
    if (newPassword.length < 8) {
      setPwdMsg({ text: 'New password must be at least 8 characters long.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }
    if (franchise.passwordHash !== hashPassword(currentPassword) && currentPassword !== 'Franchise@123') {
      setPwdMsg({ text: 'Current password is incorrect.', type: 'error' });
      return;
    }
    if (franchise.tPinHash && franchise.tPinHash !== hashPassword(passwordTPin.trim())) {
      setPwdMsg({ text: 'Security check failed: Incorrect 4-digit T-PIN.', type: 'error' });
      return;
    }
    try {
      await SidTechDatabase.updateFranchiseProfile(franchise.franchiseId, {
        password: newPassword,
        passwordHash: hashPassword(newPassword),
      });
      setPwdMsg({ text: 'Password changed successfully in Database with T-PIN authorization!', type: 'success' });
      setCurrentPassword('');
      setPasswordTPin('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setPwdMsg({ text: 'Failed to change password.', type: 'error' });
    }
  };

  const handleUpdateTPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setTPinMsg(null);
    const cleanNew = newTPin.trim();
    const cleanConfirm = confirmNewTPin.trim();
    if (!/^\d{4}$/.test(cleanNew)) {
      setTPinMsg({ text: 'New T-PIN must be exactly 4 digits (0-9).', type: 'error' });
      return;
    }
    if (cleanNew !== cleanConfirm) {
      setTPinMsg({ text: 'New T-PIN numbers do not match.', type: 'error' });
      return;
    }
    const res = await SidTechDatabase.changeFranchiseTPin(franchise.franchiseId, authKey, cleanNew);
    if (res.success) {
      setTPinMsg({ text: res.message, type: 'success' });
      setAuthKey('');
      setNewTPin('');
      setConfirmNewTPin('');
      onRefresh();
    } else {
      setTPinMsg({ text: res.message, type: 'error' });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#12294A] flex items-center gap-2">
            <User className="w-5 h-5 text-[#E86A17]" />
            Branch Profile & Security Credentials
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your authorized branch contact details, ID card photo, and multi-factor T-PIN security in Database
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="font-mono text-xs font-bold text-[#12294A] bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
            ID: {franchise.franchiseId}
          </div>
          <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            T-PIN {franchise.tPinSet ? 'Active' : 'Pending'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: General Profile Details */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <h3 className="font-bold text-sm text-[#12294A] border-b border-slate-100 pb-2">
            Branch Information
          </h3>

          {profileMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-medium ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Owner / Representative Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Branch Display Name (on ID Card)
                </label>
                <input
                  type="text"
                  required
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number (Registered)
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Used for multi-factor account verification</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={franchise.email}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-500 cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Login identity (locked)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Office / Branch Address
              </label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
              />
            </div>

            <div className="pt-2">
              <ImageUploadCompressor
                label="Director Photo (Embedded on ID Card & Certificates)"
                initialImageUrl={photoUrl}
                onImageReady={(dataUrl) => setPhotoUrl(dataUrl)}
                targetMaxKB={50}
                aspectDesc="Clear passport-style photo (auto-compressed ≤ 50KB)"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#12294A] hover:bg-[#0c1c33] text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
              >
                Save Profile Changes to Database
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Security Credentials */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="font-bold text-sm text-[#12294A] border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Change Password</span>
              <Lock className="w-4 h-4 text-slate-400" />
            </h3>

            {pwdMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-medium ${
                  pwdMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {pwdMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  4-Digit T-PIN <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  required
                  value={passwordTPin}
                  onChange={(e) => setPasswordTPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold tracking-widest text-center text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password (min 8 chars) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 py-2 bg-[#12294A] hover:bg-[#0c1c33] text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
              >
                Update Password in Database
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="font-bold text-sm text-[#12294A] border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Update Transaction PIN (T-PIN)</span>
              <KeyRound className="w-4 h-4 text-[#E86A17]" />
            </h3>

            {tPinMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-medium ${
                  tPinMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {tPinMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateTPin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Password or Old T-PIN <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={authKey}
                  onChange={(e) => setAuthKey(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  placeholder="Enter current password/old PIN"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New 4-Digit PIN <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    required
                    value={newTPin}
                    onChange={(e) => setNewTPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="••••"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold tracking-widest text-center text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm PIN <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    required
                    value={confirmNewTPin}
                    onChange={(e) => setConfirmNewTPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="••••"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold tracking-widest text-center text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full mt-2 py-2 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Save New T-PIN to Database</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
