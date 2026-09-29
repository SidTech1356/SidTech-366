import React, { useRef, useState, useEffect } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { Download, Printer, Award, ShieldCheck, CheckCircle2, Phone, Mail, FileText, AlertCircle } from 'lucide-react';
import { Franchise } from '../../types/database';
import { SidTechDatabase, DEFAULT_OWNER_SIGNATURE, DEFAULT_DIGITAL_STAMP } from '../../services/storage';
import { downloadElementAsPNG, downloadElementAsPDF } from '../../utils/canvasExport';

interface FranchisePartnerCertificatePreviewProps {
  franchise: Franchise;
}

export const FranchisePartnerCertificatePreview: React.FC<FranchisePartnerCertificatePreviewProps> = ({
  franchise,
}) => {
  const certRef = useRef<HTMLDivElement>(null);
  const [hdQrDataUrl, setHdQrDataUrl] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportType, setExportType] = useState<'png' | 'pdf' | null>(null);
  const [downloadedImageUrl, setDownloadedImageUrl] = useState<string | null>(null);
  const [downloadedPdfUrl, setDownloadedPdfUrl] = useState<string | null>(null);
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const settings = SidTechDatabase.getSettings();
  const ownerSignature = settings.ownerSignatureUrl || DEFAULT_OWNER_SIGNATURE;
  const digitalStamp = settings.digitalStampUrl || DEFAULT_DIGITAL_STAMP;
  const ownerName = settings.ownerName || 'Siddharth Verma';
  const ownerDesignation = settings.ownerDesignation || 'Founder & Managing Director';

  useEffect(() => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
    const verificationUrl = `${window.location.origin}/#verify?id=${encodeURIComponent(franchise.franchiseId)}`;
    QRCode.toDataURL(verificationUrl, {
      margin: 1,
      width: 500,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#12294A',
        light: '#FFFFFF',
      },
    })
      .then((url) => setHdQrDataUrl(url))
      .catch((err) => console.error('HD QR generation error:', err));
  }, [franchise]);

  const handleDownloadPDF = async () => {
    if (!certRef.current) return;
    setIsExporting(true);
    setExportType('pdf');
    setDownloadSuccessNotice(null);
    setDownloadError(null);
    const fileName = `SidTech_Franchise_Certificate_${franchise.franchiseId}.pdf`;
    const res = await downloadElementAsPDF(certRef.current, {
      fileName,
      pdfType: 'a4_certificate',
      scale: 2.5,
      backgroundColor: '#fdfbf7',
    });
    setIsExporting(false);
    setExportType(null);
    if (res.success && res.pdfBlobUrl) {
      setDownloadedPdfUrl(res.pdfBlobUrl);
      setDownloadSuccessNotice('Official A4 Certificate PDF generated and downloaded!');
      setTimeout(() => setDownloadSuccessNotice(null), 10000);
    } else {
      setDownloadError(res.error || 'Failed to download certificate PDF.');
    }
  };

  const handleDownloadPNG = async () => {
    if (!certRef.current) return;
    setIsExporting(true);
    setExportType('png');
    setDownloadSuccessNotice(null);
    setDownloadError(null);
    const fileName = `SidTech_Franchise_Authorization_Certificate_${franchise.franchiseId}.png`;
    const res = await downloadElementAsPNG(certRef.current, {
      fileName,
      scale: 2.5,
      backgroundColor: '#fdfbf7',
    });
    setIsExporting(false);
    setExportType(null);
    if (res.success && res.dataUrl) {
      setDownloadedImageUrl(res.dataUrl);
      setDownloadSuccessNotice('Official Certificate PNG image downloaded!');
      setTimeout(() => setDownloadSuccessNotice(null), 8000);
    } else {
      setDownloadError(res.error || 'Failed to download certificate image.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = franchise.approvedOn
    ? new Date(franchise.approvedOn).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

  return (
    <div className="flex flex-col items-center">
      {/* Controls */}
      <div className="flex flex-col items-center gap-3 mb-6 print:hidden">
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition cursor-pointer disabled:opacity-50"
            title="Download high-resolution printable PDF (Standard A4 Landscape)"
          >
            <FileText className="w-4 h-4" />
            <span>{isExporting && exportType === 'pdf' ? 'Generating PDF...' : 'Download Certificate (PDF)'}</span>
          </button>
          <button
            onClick={handleDownloadPNG}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting && exportType === 'png' ? 'Generating PNG...' : 'Download Image (PNG)'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-[#12294A] hover:bg-[#0c1c33] text-white rounded-xl font-semibold text-xs sm:text-sm shadow transition cursor-pointer"
            title="Open browser print preview dialog"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>

        {downloadError && (
          <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-center gap-2 animate-in fade-in shadow-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{downloadError}</span>
          </div>
        )}

        {downloadSuccessNotice && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex flex-col sm:flex-row items-center gap-2 animate-in fade-in shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{downloadSuccessNotice}</span>
            </div>
            <div className="flex items-center gap-3">
              {downloadedPdfUrl && (
                <a
                  href={downloadedPdfUrl}
                  download={`SidTech_Franchise_Certificate_${franchise.franchiseId}.pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline font-bold text-emerald-900 hover:text-emerald-700"
                >
                  Click to re-download PDF
                </a>
              )}
              {downloadedImageUrl && (
                <a
                  href={downloadedImageUrl}
                  download={`SidTech_Franchise_Authorization_Certificate_${franchise.franchiseId}.png`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline font-bold text-emerald-900 hover:text-emerald-700"
                >
                  Click to re-download PNG
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Swipe Hint */}
      <div className="lg:hidden text-[11px] text-slate-500 mb-2 flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
        <span>↔️</span>
        <span>Swipe horizontally to view certificate. Downloads & prints are always 100% full-size A4 format.</span>
      </div>

      {/* Printable Certificate Sheet (Standard A4 Landscape - Unconstrained for 100% full-size capture) */}
      <div className="w-full overflow-x-auto pb-4 pt-1 flex justify-start lg:justify-center">
        <div
          ref={certRef}
          id="printable-franchise-certificate"
          className="w-[840px] min-w-[840px] bg-[#fdfbf7] p-8 rounded-xl shadow-2xl border-8 border-[#12294A] relative select-none overflow-hidden print:w-full print:shadow-none print:border-8 text-slate-800 flex-shrink-0"
          style={{ aspectRatio: '1.414 / 1', height: '594px' }}
        >
          <div className="w-full h-full border-2 border-dashed border-[#E86A17] p-6 flex flex-col justify-between relative bg-white/80">
          <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-[#12294A]" />
          <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-[#12294A]" />
          <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-[#12294A]" />
          <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-[#12294A]" />

          {/* Header */}
          <div className="text-center space-y-1 relative">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E86A17] flex items-center justify-center font-black text-white text-base shadow">
                ST
              </div>
              <div className="text-left">
                <h1 className="text-xl font-extrabold tracking-wider text-[#12294A] leading-tight">
                  SIDTECH TECHNOLOGIES
                </h1>
                <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                  Enterprise Cloud Solutions & Software Delivery Network
                </p>
              </div>
            </div>
            <div className="pt-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#E86A17] bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                OFFICIAL FRANCHISE & BUSINESS PARTNER AUTHORIZATION
              </span>
              <h2 className="text-2xl font-black text-[#12294A] font-serif tracking-wide mt-2">
                Certificate of Authorization & Partnership
              </h2>
            </div>
          </div>

          {/* Body Section */}
          <div className="my-3 space-y-3 text-center">
            <p className="text-xs text-slate-600 italic">
              This is to officially certify that the following entrepreneur & enterprise branch has been accredited and authorized as an official partner of SidTech Technologies:
            </p>

            <div className="bg-gradient-to-r from-orange-50/40 via-white to-orange-50/40 border border-slate-200 rounded-xl p-3.5 flex items-center justify-center gap-6 max-w-xl mx-auto shadow-xs">
              <div className="w-20 h-24 rounded-lg overflow-hidden border-2 border-[#12294A] shadow-sm bg-slate-100 flex-shrink-0">
                <img
                  src={franchise.photoUrl}
                  alt={franchise.name}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              </div>
              <div className="text-left space-y-1">
                <span className="text-[9px] font-bold text-[#E86A17] uppercase tracking-wider block font-mono">
                  Franchise ID: {franchise.franchiseId}
                </span>
                <h3 className="text-lg font-black text-[#12294A] leading-tight">
                  {franchise.name}
                </h3>
                <p className="text-xs font-bold text-slate-700">
                  {franchise.branchName}
                </p>
                <div className="pt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-600 border-t border-slate-200">
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-2.5 h-2.5 text-[#E86A17]" /> {franchise.mobile}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-2.5 h-2.5 text-[#E86A17]" /> {franchise.email}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-700 max-w-2xl mx-auto leading-relaxed">
              Authorized to represent <strong>SidTech Technologies</strong> for consulting, booking, and delivering high-performance IT solutions, including Web Development, Mobile Applications, Custom Software, and Cloud ERP Systems.
            </p>
          </div>

          {/* Certificate Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-end justify-between px-4">
            <div className="flex items-center gap-3">
              {hdQrDataUrl ? (
                <img
                  src={hdQrDataUrl}
                  alt="HD Verification QR"
                  className="w-16 h-16 rounded border-2 border-[#12294A] bg-white p-0.5 shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 bg-slate-100 rounded border border-slate-200" />
              )}
              <div className="text-left">
                <div className="text-[9px] font-bold text-[#12294A] uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  HD Verified
                </div>
                <div className="text-[8px] text-slate-500 font-mono">
                  ID: {franchise.franchiseId}
                </div>
                <div className="text-[8px] text-slate-400">
                  Issued: {formattedDate}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center p-1 bg-white shadow-md border-2 border-amber-300 relative group">
                {digitalStamp ? (
                  <img
                    src={digitalStamp}
                    alt="Official Corporate Seal"
                    className="w-full h-full object-contain drop-shadow-xs"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-500 text-white flex flex-col items-center justify-center">
                    <Award className="w-6 h-6 text-[#12294A]" />
                    <span className="text-[6px] font-black uppercase text-[#12294A]">OFFICIAL SEAL</span>
                  </div>
                )}
              </div>
              <span className="text-[8px] font-black text-[#12294A] mt-1 uppercase tracking-wider">
                Official Digital Stamp
              </span>
              <span className="text-[7px] text-slate-400 font-medium">SidTech Corporate Seal</span>
            </div>

            <div className="text-right space-y-1">
              <div className="h-12 w-36 ml-auto flex items-end justify-end">
                {ownerSignature ? (
                  <img
                    src={ownerSignature}
                    alt="Authorized Digital Signature"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="font-serif italic font-bold text-sm text-[#12294A]">
                    {ownerName}
                  </div>
                )}
              </div>
              <div className="w-36 border-b-2 border-[#12294A] ml-auto" />
              <div className="text-xs font-black text-[#12294A] leading-tight">{ownerName}</div>
              <div className="text-[9px] font-bold text-[#E86A17]">{ownerDesignation}</div>
              <div className="text-[8px] text-slate-400">Authorized Signatory • SidTech Technologies</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <p className="text-xs text-slate-400 mt-3 text-center print:hidden">
        Official Partner Certificate for Franchise Owner. Scan the HD QR code with any phone camera to verify directly.
      </p>
    </div>
  );
};
