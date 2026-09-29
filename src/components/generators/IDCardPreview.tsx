import React, { useRef, useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Download, Printer, ShieldCheck, CheckCircle2, QrCode as QrIcon, Sparkles, FileText, AlertCircle } from 'lucide-react';
import { Franchise } from '../../types/database';
import { SidTechDatabase, DEFAULT_OWNER_SIGNATURE, DEFAULT_DIGITAL_STAMP } from '../../services/storage';
import { downloadElementAsPNG, downloadElementAsPDF } from '../../utils/canvasExport';

interface IDCardPreviewProps {
  franchise: Franchise;
  onClose?: () => void;
}

export const IDCardPreview: React.FC<IDCardPreviewProps> = ({ franchise }) => {
  const cardRef = useRef<HTMLDivElement>(null);
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
  const ownerDesignation = settings.ownerDesignation || 'Founder & CEO';

  useEffect(() => {
    const verificationUrl = `${window.location.origin}/#verify?id=${encodeURIComponent(franchise.franchiseId)}`;
    QRCode.toDataURL(verificationUrl, {
      margin: 1,
      width: 500,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
    })
      .then((url) => setHdQrDataUrl(url))
      .catch((err) => console.error('HD QR generation error:', err));
  }, [franchise]);

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    setExportType('pdf');
    setDownloadSuccessNotice(null);
    setDownloadError(null);
    const fileName = `SidTech_PVC_IDCard_${franchise.franchiseId}.pdf`;
    const res = await downloadElementAsPDF(cardRef.current, {
      fileName,
      pdfType: 'pvc_card',
      scale: 3,
      backgroundColor: '#ffffff',
    });
    setIsExporting(false);
    setExportType(null);
    if (res.success && res.pdfBlobUrl) {
      setDownloadedPdfUrl(res.pdfBlobUrl);
      setDownloadSuccessNotice('PVC Ready PDF generated and downloaded! (Includes CR80 Card Size & A4 Print Sheet).');
      setTimeout(() => setDownloadSuccessNotice(null), 10000);
    } else {
      setDownloadError(res.error || 'Failed to generate PDF file.');
    }
  };

  const handleDownloadPNG = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    setExportType('png');
    setDownloadSuccessNotice(null);
    setDownloadError(null);
    const fileName = `SidTech_Official_IDCard_${franchise.franchiseId}.png`;
    const res = await downloadElementAsPNG(cardRef.current, {
      fileName,
      scale: 3,
      backgroundColor: '#ffffff',
    });
    setIsExporting(false);
    setExportType(null);
    if (res.success && res.dataUrl) {
      setDownloadedImageUrl(res.dataUrl);
      setDownloadSuccessNotice('High Definition ID Card PNG generated and downloaded!');
      setTimeout(() => setDownloadSuccessNotice(null), 8000);
    } else {
      setDownloadError(res.error || 'Failed to download image automatically.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center">
      {/* Action Controls */}
      <div className="flex flex-col items-center gap-3 mb-5 print:hidden">
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition cursor-pointer disabled:opacity-50"
            title="Download real PDF with exact CR80 PVC dimensions and A4 print guidelines"
          >
            <FileText className="w-4 h-4" />
            <span>{isExporting && exportType === 'pdf' ? 'Generating PVC PDF...' : 'Download PVC Card (PDF)'}</span>
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
                  download={`SidTech_PVC_IDCard_${franchise.franchiseId}.pdf`}
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
                  download={`SidTech_Official_IDCard_${franchise.franchiseId}.png`}
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
      <div className="sm:hidden text-[11px] text-slate-500 mb-2 flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
        <span>↔️</span>
        <span>Swipe left/right to view full card. Downloads are always 100% full-size.</span>
      </div>

      {/* Printable ID Card Container (Unconstrained for 100% full-size capture) */}
      <div className="w-full overflow-x-auto pb-4 pt-1 flex justify-start sm:justify-center">
        <div
          ref={cardRef}
          id="printable-id-card"
          className="w-[470px] min-w-[470px] bg-white rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-300 text-slate-800 relative select-none flex flex-col justify-between flex-shrink-0"
        >
        {/* Navy Header Strip */}
        <div className="bg-[#12294A] px-4 py-2.5 text-white flex items-center justify-between border-b-2 border-[#E86A17]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#E86A17] flex items-center justify-center font-black text-white text-xs tracking-wider shadow">
              ST
            </div>
            <div>
              <div className="font-extrabold text-[13px] tracking-wide text-white leading-tight flex items-center gap-1">
                <span>SIDTECH TECHNOLOGIES</span>
                <Sparkles className="w-3 h-3 text-amber-400 inline" />
              </div>
              <div className="text-[8.5px] text-amber-300 font-bold tracking-wider uppercase leading-none mt-0.5">
                Authorized Franchise & Branch Partner
              </div>
            </div>
          </div>
          <div className="bg-emerald-500/20 border border-emerald-400/60 text-emerald-300 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide flex items-center gap-1 shadow-inner">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            VERIFIED
          </div>
        </div>

        {/* Card Body */}
        <div className="p-3.5 flex gap-3.5 items-center bg-gradient-to-br from-white via-slate-50 to-orange-50/20 relative flex-1">
          <div className="absolute right-4 bottom-2 text-slate-200/35 text-8xl font-black pointer-events-none select-none">
            366
          </div>

          {/* Left: Owner Photo & Badge */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="w-22 h-26 rounded-xl overflow-hidden border-2 border-[#12294A] shadow-md bg-slate-100 relative">
              <img
                src={franchise.photoUrl}
                alt={franchise.name}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            </div>
            <div className="mt-1 text-[7.5px] font-extrabold text-[#12294A] bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 text-center tracking-wider">
              BRANCH DIRECTOR
            </div>
          </div>

          {/* Center Details */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="text-[9.5px] font-black text-[#E86A17] tracking-wider uppercase">
              ID: {franchise.franchiseId}
            </div>
            <h3 className="font-extrabold text-sm sm:text-[15px] text-[#12294A] truncate leading-tight mt-0.5">
              {franchise.name}
            </h3>
            <p className="text-[11px] font-bold text-slate-700 truncate">
              {franchise.branchName}
            </p>
            <div className="mt-1.5 space-y-0.5 text-[9.5px] text-slate-600 border-t border-slate-200 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Mobile:</span>
                <span className="font-mono font-bold text-slate-800">{franchise.mobile}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Email:</span>
                <span className="font-medium text-slate-800 truncate max-w-[145px]">{franchise.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Address:</span>
                <span className="font-medium text-slate-700 truncate max-w-[145px]">{franchise.address}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Issue Date:</span>
                <span className="font-semibold text-slate-800">
                  {franchise.approvedOn
                    ? new Date(franchise.approvedOn).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Active'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Crisp HD QR Code */}
          <div className="flex flex-col items-center justify-center pl-2 border-l border-slate-200 flex-shrink-0">
            {hdQrDataUrl ? (
              <img
                src={hdQrDataUrl}
                alt="HD Verification QR"
                className="w-15 h-15 rounded-lg border-2 border-[#12294A] bg-white p-0.5 shadow-sm"
              />
            ) : (
              <div className="w-15 h-15 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                <QrIcon className="w-5 h-5 animate-pulse" />
              </div>
            )}
            <span className="text-[7.5px] text-[#12294A] font-bold mt-1 tracking-wider uppercase flex items-center gap-0.5">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
              HD QR
            </span>
            <span className="text-[6.5px] text-slate-400">Scan to Verify</span>
          </div>
        </div>

        {/* Card Official Authorization Strip */}
        <div className="bg-gradient-to-r from-amber-50/70 via-slate-50 to-orange-50/50 px-3.5 py-1.5 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center p-0.5 bg-white border border-amber-200 shadow-2xs">
              <img
                src={digitalStamp}
                alt="Official Seal"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-left">
              <div className="text-[7px] font-black uppercase text-[#E86A17] tracking-wider leading-none">
                Official Corporate Stamp
              </div>
              <div className="text-[7.5px] font-bold text-[#12294A] leading-tight mt-0.5">
                Accredited Branch Seal
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-right">
            <div className="text-right">
              <div className="text-[7px] font-bold text-slate-500 uppercase leading-none">
                Authorized Signatory
              </div>
              <div className="text-[8px] font-black text-[#12294A] leading-tight mt-0.5">
                {ownerName}
              </div>
              <div className="text-[6.5px] text-[#E86A17] font-semibold leading-none">
                {ownerDesignation}
              </div>
            </div>
            <div className="h-6 w-18 flex items-center justify-end border-b border-[#12294A]/40 pb-0.5">
              <img
                src={ownerSignature}
                alt="Authorized Signature"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* Card Footer Bar */}
        <div className="bg-[#12294A] text-slate-200 px-4 py-1.5 text-[8.5px] flex items-center justify-between border-t border-slate-700">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3 h-3" /> Legally Authorized SidTech Branch
          </span>
          <span className="text-slate-400 font-mono text-[8px]">support@sidtech366.com</span>
        </div>
      </div>
    </div>
  </div>
  );
};
