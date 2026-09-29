import React, { useState } from 'react';
import { Settings, Copy, Check, Save, Stamp, PenTool, RotateCcw, Award, Flame } from 'lucide-react';
import { AppSettings } from '../../types/database';
import { SidTechDatabase, DEFAULT_OWNER_SIGNATURE, DEFAULT_DIGITAL_STAMP } from '../../services/storage';
import { ImageUploadCompressor } from '../common/ImageUploadCompressor';

interface AdminPaymentSettingsProps {
  settings: AppSettings;
  onRefresh: () => void;
}

export const AdminPaymentSettings: React.FC<AdminPaymentSettingsProps> = ({
  settings,
  onRefresh,
}) => {
  const [companyUpi, setCompanyUpi] = useState(settings.companyUpi);
  const [companyQrImageUrl, setCompanyQrImageUrl] = useState(settings.companyQrImageUrl);
  const [paymentApiEnabled, setPaymentApiEnabled] = useState(settings.paymentApiEnabled);
  const [paymentApiProvider, setPaymentApiProvider] = useState(settings.paymentApiProvider || 'Razorpay (Stub)');
  const [defaultAdvancePercent, setDefaultAdvancePercent] = useState(settings.defaultAdvancePercent);
  const [defaultCommissionPercent, setDefaultCommissionPercent] = useState(settings.defaultCommissionPercent);
  const [certificatePrefix, setCertificatePrefix] = useState(settings.certificatePrefix || 'ST');

  // Digital Signature & Stamp
  const [ownerSignatureUrl, setOwnerSignatureUrl] = useState(settings.ownerSignatureUrl || DEFAULT_OWNER_SIGNATURE);
  const [digitalStampUrl, setDigitalStampUrl] = useState(settings.digitalStampUrl || DEFAULT_DIGITAL_STAMP);
  const [ownerName, setOwnerName] = useState(settings.ownerName || 'Siddharth Verma');
  const [ownerDesignation, setOwnerDesignation] = useState(settings.ownerDesignation || 'Founder & Managing Director');

  const [copiedUpi, setCopiedUpi] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleResetDefaults = () => {
    setOwnerSignatureUrl(DEFAULT_OWNER_SIGNATURE);
    setDigitalStampUrl(DEFAULT_DIGITAL_STAMP);
    setOwnerName('Siddharth Verma');
    setOwnerDesignation('Founder & Managing Director');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await SidTechDatabase.updateSettings({
      companyUpi,
      companyQrImageUrl,
      paymentApiEnabled,
      paymentApiProvider,
      defaultAdvancePercent,
      defaultCommissionPercent,
      certificatePrefix,
      ownerSignatureUrl,
      digitalStampUrl,
      ownerName,
      ownerDesignation,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
    onRefresh();
  };

  const handleCopyTest = async () => {
    await navigator.clipboard.writeText(companyUpi);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#12294A] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#E86A17]" />
            Payment, Escrow & Gateway Master Settings
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage company QR code, official UPI ID, global advance %, and gateway hooks in Cloud Database
          </p>
        </div>
        {savedNotice && (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-in fade-in">
            ✓ Settings Saved to Database!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Official UPI ID & QR Code */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <h3 className="font-bold text-sm text-[#12294A] border-b border-slate-100 pb-2">
            Company Receiving UPI & QR Code
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company UPI ID (Displayed to Franchises in Payment Modal)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={companyUpi}
                    onChange={(e) => setCompanyUpi(e.target.value)}
                    placeholder="sidtech@okaxis"
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  />
                  <button
                    type="button"
                    onClick={handleCopyTest}
                    className="p-2 rounded-lg bg-[#E86A17] text-white hover:bg-[#d45e12] transition flex-shrink-0 cursor-pointer"
                    title="Test Copy Button"
                  >
                    {copiedUpi ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Franchises will copy this ID directly to pay via Google Pay / PhonePe / Paytm.
                </span>
              </div>

              <ImageUploadCompressor
                label="Company UPI QR Code Image"
                initialImageUrl={companyQrImageUrl}
                onImageReady={(dataUrl) => setCompanyQrImageUrl(dataUrl)}
                targetMaxKB={50}
                aspectDesc="Square QR code (auto-compressed ≤ 50KB)"
              />
            </div>

            {/* Live Preview Card */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Franchise View Preview
              </span>
              <div className="w-36 h-36 bg-white p-2 rounded-xl border border-slate-200 shadow-sm mx-auto flex items-center justify-center">
                <img
                  src={companyQrImageUrl}
                  alt="Company QR"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="font-mono text-xs font-bold text-[#12294A] bg-white px-3 py-1 rounded-lg border border-slate-200 inline-block">
                {companyUpi}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Global Fallback Rates */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="font-bold text-sm text-[#12294A] border-b border-slate-100 pb-2">
            Default Financial & Numbering Rates
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Advance Deposit (%)
              </label>
              <input
                type="number"
                min={10}
                max={100}
                value={defaultAdvancePercent}
                onChange={(e) => setDefaultAdvancePercent(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Commission (%)
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={defaultCommissionPercent}
                onChange={(e) => setDefaultCommissionPercent(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ID / Certificate Prefix
              </label>
              <input
                type="text"
                maxLength={4}
                value={certificatePrefix}
                onChange={(e) => setCertificatePrefix(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Official Signatures & Seal */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <div>
              <h3 className="font-bold text-sm text-[#12294A] flex items-center gap-2">
                <Stamp className="w-4 h-4 text-[#E86A17]" />
                Company Owner Digital Signature & Official Corporate Stamp
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Embedded directly on all official Franchise ID Cards and Certificates.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex-shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Restore Default Vector Seal & Signature</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Signatory Owner Name
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Siddharth Verma"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Signatory Designation
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerDesignation}
                    onChange={(e) => setOwnerDesignation(e.target.value)}
                    placeholder="Founder & Managing Director"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  />
                </div>
              </div>

              <div className="border border-slate-100 p-3.5 rounded-xl bg-slate-50/50">
                <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-[#12294A]">
                  <PenTool className="w-3.5 h-3.5 text-[#E86A17]" />
                  <span>Upload Owner Signature (Image or Transparent PNG)</span>
                </div>
                <ImageUploadCompressor
                  label="Digital Signature File"
                  initialImageUrl={ownerSignatureUrl}
                  onImageReady={(dataUrl) => setOwnerSignatureUrl(dataUrl)}
                  targetMaxKB={50}
                  aspectDesc="Owner's handwritten signature (auto-compressed ≤ 50KB)"
                />
              </div>

              <div className="border border-slate-100 p-3.5 rounded-xl bg-slate-50/50">
                <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-[#12294A]">
                  <Stamp className="w-3.5 h-3.5 text-[#E86A17]" />
                  <span>Upload Official Corporate Seal Stamp</span>
                </div>
                <ImageUploadCompressor
                  label="Digital Seal Stamp File"
                  initialImageUrl={digitalStampUrl}
                  onImageReady={(dataUrl) => setDigitalStampUrl(dataUrl)}
                  targetMaxKB={60}
                  aspectDesc="Round official corporate seal / stamp (auto-compressed ≤ 60KB)"
                />
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="bg-gradient-to-br from-amber-50/40 via-white to-orange-50/30 border-2 border-dashed border-[#12294A]/20 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-[#12294A] flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#E86A17]" />
                  Live Certificate Signatory Preview
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  LIVE SYNC
                </span>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-around gap-4 min-h-[140px]">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center p-1 bg-white shadow-sm border border-slate-100">
                    {digitalStampUrl ? (
                      <img
                        src={digitalStampUrl}
                        alt="Digital Corporate Stamp"
                        className="w-full h-full object-contain drop-shadow-xs"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                        No Stamp
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-wider">
                    Official Stamp
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center text-center">
                  <div className="h-16 w-36 flex items-center justify-center">
                    {ownerSignatureUrl ? (
                      <img
                        src={ownerSignatureUrl}
                        alt="Owner Signature"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-xs italic text-slate-400">No Signature</div>
                    )}
                  </div>
                  <div className="w-32 border-b-2 border-[#12294A] mt-1" />
                  <span className="text-xs font-black text-[#12294A] mt-1">{ownerName}</span>
                  <span className="text-[9px] font-bold text-[#E86A17]">{ownerDesignation}</span>
                  <span className="text-[8px] text-slate-400">Authorized Signatory</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Future Gateway */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-bold text-sm text-[#12294A]">
                Payment Gateway API Hook (Future Ready)
              </h3>
              <p className="text-xs text-slate-500">
                Switch from manual UTR verification to automatic payment gateway webhooks (Razorpay / Cashfree)
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={paymentApiEnabled}
                onChange={(e) => setPaymentApiEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E86A17]"></div>
            </label>
          </div>
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${!paymentApiEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gateway Provider
              </label>
              <select
                value={paymentApiProvider}
                onChange={(e) => setPaymentApiProvider(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
              >
                <option value="Razorpay">Razorpay Standard</option>
                <option value="Cashfree">Cashfree Payments</option>
                <option value="PhonePe PG">PhonePe Payment Gateway</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                API Key / Secret ID (Mock / Stub)
              </label>
              <input
                type="text"
                disabled={!paymentApiEnabled}
                placeholder="rzp_live_xxxxxxxxxxxx"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-600"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#12294A] hover:bg-[#0c1c33] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Master Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
