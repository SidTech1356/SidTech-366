import React, { useState } from 'react';
import { X, Building2, User, Mail, Phone, MapPin, Lock, CheckCircle2, ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { SidTechDatabase } from '../../services/storage';
import { ImageUploadCompressor } from '../common/ImageUploadCompressor';
import { Franchise } from '../../types/database';

interface RegisterModalProps {
  onClose: () => void;
  onOpenLogin: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ onClose, onOpenLogin }) => {
  const [name, setName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredFranchise, setRegisteredFranchise] = useState<Franchise | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError('Please enter your full owner name.');
    if (!branchName.trim()) return setError('Please enter your branch / franchise name.');
    if (!email.trim() || !email.includes('@')) return setError('Please enter a valid email address.');
    if (!mobile.trim() || String(mobile).replace(/\D/g, '').length < 10) return setError('Please enter a valid 10-digit mobile number.');
    if (!address.trim()) return setError('Please provide the physical branch address.');
    if (password.length < 8) return setError('Password must be at least 8 characters long.');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    if (!agreedTerms) return setError('You must agree to the SidTech franchise partnership terms.');

    setIsSubmitting(true);
    try {
      const res = await SidTechDatabase.registerFranchise({
        name,
        branchName,
        email,
        mobile,
        address,
        password,
        photoUrl: photoUrl || undefined,
      });
      if (res.success && res.franchise) {
        setRegisteredFranchise(res.franchise);
      } else {
        setError(res.message);
        setIsSubmitting(false);
      }
    } catch (err: unknown) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain p-2 sm:p-4 bg-slate-900/75 backdrop-blur-xs flex items-start justify-center animate-in fade-in duration-150"
    >
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto sm:my-8 flex flex-col">
        {/* Header */}
        <div className="bg-[#12294A] px-6 py-4 text-white flex items-center justify-between border-b-2 border-[#E86A17] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E86A17] flex items-center justify-center font-bold text-white text-sm">
              ST
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Register as SidTech Franchise</h3>
              <p className="text-xs text-orange-200">Start delivering IT & software services in your city</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {registeredFranchise ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-800">
                Application Successfully Submitted to Central Network!
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Your branch registration has been securely recorded in the real-time database and is currently in the verification queue.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl max-w-sm mx-auto text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Reference ID:</span>
                <span className="font-mono font-bold text-[#E86A17]">{registeredFranchise.franchiseId}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Branch Name:</span>
                <span className="font-semibold text-slate-800">{registeredFranchise.branchName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Current Status:</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-300 font-bold text-[10px]">
                  Pending Admin Approval
                </span>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 p-3.5 rounded-xl text-xs text-[#12294A] max-w-md mx-auto leading-relaxed">
              <strong>Next Step:</strong> SidTech Super Admin will review your application. Once approved, your login will unlock immediately and your official Authorized Franchise ID Card will be issued automatically.
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenLogin();
                }}
                className="px-6 py-2.5 bg-[#12294A] hover:bg-[#0c1c33] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <span>Go to Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name / Owner Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                    placeholder="e.g. Siddharth Verma"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Branch / Franchise Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                    placeholder="e.g. SidTech Lucknow Central Branch"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email (Gmail) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                    placeholder="yourbranch@gmail.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number (10 digits) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                    placeholder="9876543210"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Branch Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  placeholder="Complete office or branch address with City and PIN code"
                />
              </div>
            </div>

            <ImageUploadCompressor
              label="Branch Head / Owner Photo (for Official ID Card)"
              onImageReady={(dataUrl) => setPhotoUrl(dataUrl)}
              targetMaxKB={50}
              aspectDesc="Passport or portrait photo (Auto-compressed to ≤ 50KB)"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Create Unique Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                    placeholder="Min 8 unique characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Must be unique across the platform</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                    placeholder="Re-type password"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-2">
              <input
                id="terms"
                type="checkbox"
                required
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#E86A17] focus:ring-[#E86A17]"
              />
              <label htmlFor="terms" className="text-xs text-slate-600 cursor-pointer">
                I agree to the <strong>SidTech Franchise Partnership Terms</strong>, including delivering IT solutions under SidTech quality guidelines and adhering to payment escrow policies.
              </label>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLogin();
                }}
                className="text-xs text-slate-500 hover:text-[#12294A] font-medium cursor-pointer"
              >
                Already registered? Sign in
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Registering...' : 'Submit Application'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
