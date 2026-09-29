import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Search,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Building2,
  Phone,
  MapPin,
  Calendar,
  Award,
  QrCode as QrIcon,
  Sparkles,
} from 'lucide-react';
import { SidTechDatabase } from '../../services/storage';
import { Franchise, Project } from '../../types/database';

interface IDVerificationModalProps {
  initialQuery?: string;
  onClose: () => void;
}

export const IDVerificationModal: React.FC<IDVerificationModalProps> = ({
  initialQuery = '',
  onClose,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    found: boolean;
    type?: 'franchise' | 'certificate';
    franchise?: Franchise & { wrappedMobile: string };
    project?: Project;
    message: string;
  } | null>(null);
  const [hdQrUrl, setHdQrUrl] = useState<string>('');

  const executeSearch = (searchTerm: string) => {
    const clean = searchTerm.trim();
    if (!clean) return;
    setIsSearching(true);
    setTimeout(() => {
      const res = SidTechDatabase.verifyFranchiseOrCertificate(clean);
      setSearchResult(res);
      setIsSearching(false);
      if (res.found) {
        const verifyUrl = `${window.location.origin}/#verify?id=${encodeURIComponent(clean)}`;
        // HD QR Code with High Error Correction
        QRCode.toDataURL(verifyUrl, {
          width: 500,
          margin: 1,
          errorCorrectionLevel: 'H',
          color: {
            dark: '#12294A',
            light: '#FFFFFF',
          },
        })
          .then((url) => setHdQrUrl(url))
          .catch((err) => console.error('HD QR generation error:', err));
      } else {
        setHdQrUrl('');
      }
    }, 150);
  };

  useEffect(() => {
    if (initialQuery.trim()) {
      executeSearch(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 bg-slate-900/75 backdrop-blur-sm overflow-y-auto overscroll-contain animate-in fade-in duration-150"
    >
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto sm:my-8 relative flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-[#12294A] px-4 sm:px-6 py-3.5 text-white flex items-center justify-between border-b-2 border-[#E86A17] shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E86A17] flex items-center justify-center font-bold text-white text-sm shadow">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                Official SidTech Verification Registry
              </h3>
              <p className="text-[11px] sm:text-xs text-orange-200">
                Authenticate Genuine Franchises, Branch ID Cards & Certificates
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-rose-600 text-white font-bold text-xs transition cursor-pointer border border-white/20"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Close</span>
          </button>
        </div>

        {/* Search Input Box */}
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Franchise ID (e.g. ST366-0001), Owner Name, or Certificate No..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs md:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-5 py-2.5 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-xl text-xs md:text-sm font-bold shadow transition flex items-center gap-1.5 cursor-pointer flex-shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>{isSearching ? 'Verifying...' : 'Verify'}</span>
            </button>
          </form>

          {/* Quick Examples */}
          <div className="mt-2.5 flex items-center gap-2 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-400">Try verifying:</span>
            <button
              type="button"
              onClick={() => {
                setQuery('ST366-0001');
                executeSearch('ST366-0001');
              }}
              className="text-[#E86A17] hover:underline font-mono"
            >
              ST366-0001
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setQuery('ST-CERT-000101');
                executeSearch('ST-CERT-000101');
              }}
              className="text-[#E86A17] hover:underline font-mono"
            >
              ST-CERT-000101
            </button>
          </div>
        </div>

        {/* Search Results Display */}
        <div className="p-6">
          {!searchResult && !isSearching && (
            <div className="text-center py-10 px-4 space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="font-bold text-slate-700 text-sm">
                Instant Public Verification & Anti-Fraud Engine
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Scan any HD QR code from a physical ID Card or Certificate, or enter the ID above to confirm authenticity directly from the encrypted SidTech Central Cloud Registry.
              </p>
            </div>
          )}

          {searchResult && !searchResult.found && (
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-rose-900 text-base">
                  Record Not Found in Official Registry
                </h4>
                <p className="text-xs text-rose-700 mt-1 max-w-md mx-auto leading-relaxed">
                  {searchResult.message}
                </p>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-rose-200 text-[11px] text-rose-800">
                <strong>Safety Notice:</strong> Only authorized SidTech branches with active status and validated IDs are legal partners. If anyone is offering services under an unverified ID, please report to <a href="mailto:support@sidtech366.com" className="underline font-bold">support@sidtech366.com</a>.
              </div>
            </div>
          )}

          {searchResult && searchResult.found && searchResult.franchise && (
            /* Verified Franchise Profile Card */
            <div className="space-y-5">
              {/* Verified Ribbon */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black text-xs text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>OFFICIAL VERIFIED SIDTECH FRANCHISE PARTNER</span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 inline" />
                    </div>
                    <div className="text-[11px] text-emerald-700">
                      ID: <span className="font-mono font-bold">{searchResult.franchise.franchiseId}</span> • Status: <span className="font-bold">{searchResult.franchise.status}</span>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block text-right">
                  <span className="text-[10px] text-emerald-800 uppercase tracking-wide bg-emerald-200/60 px-2 py-0.5 rounded font-bold">
                    Authenticated
                  </span>
                </div>
              </div>

              {/* Main Profile Grid: Photo, Name, Wrapped Mobile, Branch */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row gap-5 items-center sm:items-start">
                {/* Photo with verified badge */}
                <div className="relative flex-shrink-0">
                  <div className="w-28 h-32 rounded-xl overflow-hidden border-2 border-[#12294A] shadow-md bg-slate-100">
                    <img
                      src={searchResult.franchise.photoUrl}
                      alt={searchResult.franchise.name}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1 rounded-full border-2 border-white shadow">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
                  <div>
                    <span className="text-[10px] font-bold text-[#E86A17] uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                      Branch Director / Owner
                    </span>
                    <h3 className="font-extrabold text-xl text-[#12294A] mt-1">
                      {searchResult.franchise.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-700">
                      {searchResult.franchise.branchName}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <Phone className="w-3.5 h-3.5 text-[#E86A17] flex-shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block leading-tight">Registered Mobile (Wrapped):</span>
                        <span className="font-mono font-bold text-slate-800 text-xs">
                          {searchResult.franchise.wrappedMobile}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <MapPin className="w-3.5 h-3.5 text-[#E86A17] flex-shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block leading-tight">Branch Location:</span>
                        <span className="font-medium text-slate-800 truncate block max-w-[180px]">
                          {searchResult.franchise.address}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <Calendar className="w-3.5 h-3.5 text-[#E86A17] flex-shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block leading-tight">Authorized Since:</span>
                        <span className="font-medium text-slate-800">
                          {searchResult.franchise.approvedOn
                            ? new Date(searchResult.franchise.approvedOn).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'Active Partner'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <Building2 className="w-3.5 h-3.5 text-[#E86A17] flex-shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block leading-tight">Official Partner:</span>
                        <span className="font-medium text-slate-800">SidTech Enterprise Suite</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* HD QR Code Box */}
                {hdQrUrl && (
                  <div className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-xl flex-shrink-0">
                    <img
                      src={hdQrUrl}
                      alt="HD Verification QR"
                      className="w-20 h-20 bg-white p-1 rounded-lg border border-slate-200 shadow-xs"
                    />
                    <span className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-wider flex items-center gap-1">
                      <QrIcon className="w-2.5 h-2.5 text-[#E86A17]" />
                      HD QR
                    </span>
                  </div>
                )}
              </div>

              {/* If verified via Certificate */}
              {searchResult.type === 'certificate' && searchResult.project && (
                <div className="bg-amber-50/70 border border-amber-300 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wide">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>Associated Project Completion Certificate Details</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Client / Organization:</span>
                      <span className="font-bold text-slate-900">{searchResult.project.clientName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Delivered Service:</span>
                      <span className="font-bold text-slate-900">{searchResult.project.serviceName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Certificate Number:</span>
                      <span className="font-mono font-bold text-[#E86A17]">{searchResult.project.certificateNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Delivered Date:</span>
                      <span className="font-medium text-slate-900">
                        {searchResult.project.deliveredOn
                          ? new Date(searchResult.project.deliveredOn).toLocaleDateString('en-IN')
                          : 'Delivered'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Official Seal / Footer Note */}
              <div className="bg-slate-900 text-slate-300 p-3 rounded-xl text-center text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Legally Registered & Verified Active Partner
                </span>
                <span className="text-slate-400 text-[10px]">Registry Ver: 2026.4</span>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 bg-[#12294A] hover:bg-[#0c1c33] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <X className="w-4 h-4 text-[#E86A17]" />
                  <span>Close Verification Window</span>
                </button>
              </div>
            </div>
          )}

          {!searchResult && (
            <div className="pt-4 flex justify-center border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-500" />
                <span>Close Window</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
