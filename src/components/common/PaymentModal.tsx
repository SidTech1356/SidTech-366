import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, QrCode, ShieldAlert, CreditCard } from 'lucide-react';
import { Project, AppSettings } from '../../types/database';
import { SidTechDatabase } from '../../services/storage';

interface PaymentModalProps {
  project: Project;
  settings: AppSettings;
  franchiseId: string;
  defaultInstallmentId?: string;
  onClose: () => void;
  onPaymentSubmitted: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  project,
  settings,
  franchiseId,
  defaultInstallmentId,
  onClose,
  onPaymentSubmitted,
}) => {
  const pendingInstallments = (project.installments || []).filter((i) => i.status !== 'Paid');
  const targetInitialInst =
    (project.installments || []).find((i) => i.installmentId === defaultInstallmentId) ||
    pendingInstallments[0] ||
    project.installments?.[0];

  const [selectedInstallmentId, setSelectedInstallmentId] = useState<string | null>(
    project.hasInstallments && targetInitialInst ? targetInitialInst.installmentId : null
  );

  const suggestedAmount =
    project.hasInstallments && targetInitialInst
      ? targetInitialInst.amount
      : project.amountPaid === 0
      ? project.advanceRequired
      : project.amountDue;

  const [amount, setAmount] = useState<number>(suggestedAmount);
  const [utr, setUtr] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dynamicHdQr, setDynamicHdQr] = useState<string>('');
  const [intentFeedback, setIntentFeedback] = useState<string | null>(null);

  useEffect(() => {
    // Generate crisp HD UPI QR Code with High error correction
    const upiUrl = `upi://pay?pa=${settings.companyUpi}&pn=SidTechTechnologies&am=${amount || suggestedAmount}&cu=INR&tn=Project-${project.projectId}`;
    QRCode.toDataURL(upiUrl, {
      width: 450,
      margin: 1,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#12294A',
        light: '#FFFFFF',
      },
    })
      .then((url) => setDynamicHdQr(url))
      .catch((err) => {
        console.error('Error generating HD payment QR:', err);
        setDynamicHdQr(settings.companyQrImageUrl);
      });
  }, [amount, settings.companyUpi, project.projectId, settings.companyQrImageUrl, suggestedAmount]);

  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText(settings.companyUpi);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!amount || amount <= 0) {
      setError('Please enter a valid payment amount.');
      return;
    }
    if (amount > project.amountDue) {
      setError(`Amount cannot exceed the total due amount of ₹${project.amountDue.toLocaleString('en-IN')}.`);
      return;
    }
    if (!utr.trim() || utr.trim().length < 6) {
      setError('Please enter a valid 12-digit UTR or Transaction Reference number.');
      return;
    }

    setIsSubmitting(true);
    const activeInst = project.installments?.find((i) => i.installmentId === selectedInstallmentId);
    try {
      const res = await SidTechDatabase.submitPayment({
        projectId: project.projectId,
        franchiseId,
        amount: Number(amount),
        utr: utr.trim(),
        mode: 'UPI/QR-Manual',
        installmentId: activeInst?.installmentId,
        installmentNumber: activeInst?.installmentNumber,
      });
      if (res.success) {
        onPaymentSubmitted();
        onClose();
      } else {
        setError(res.message);
        setIsSubmitting(false);
      }
    } catch {
      setError('Failed to submit payment. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleOpenUpiApp = (app: 'phonepe' | 'gpay' | 'paytm' | 'bhim') => {
    const payAmount = amount || suggestedAmount;
    const upiId = settings.companyUpi;
    const payeeName = settings.companyName ? encodeURIComponent(settings.companyName) : 'SidTech';
    const note = encodeURIComponent(`Project-${project.projectId}`);
    const genericUpiUri = `upi://pay?pa=${upiId}&pn=${payeeName}&am=${payAmount}&cu=INR&tn=${note}`;

    let appUri = genericUpiUri;
    let appLabel = 'UPI App';

    if (app === 'phonepe') {
      appUri = `phonepe://pay?pa=${upiId}&pn=${payeeName}&am=${payAmount}&cu=INR&tn=${note}`;
      appLabel = 'PhonePe';
    } else if (app === 'gpay') {
      appUri = `tez://upi/pay?pa=${upiId}&pn=${payeeName}&am=${payAmount}&cu=INR&tn=${note}`;
      appLabel = 'Google Pay';
    } else if (app === 'paytm') {
      appUri = `paytmmp://pay?pa=${upiId}&pn=${payeeName}&am=${payAmount}&cu=INR&tn=${note}`;
      appLabel = 'Paytm';
    } else {
      appUri = genericUpiUri;
      appLabel = 'BHIM / Any UPI App';
    }

    // Always copy UPI ID to clipboard as immediate safe fallback
    try {
      navigator.clipboard?.writeText?.(upiId);
    } catch {
      // ignore
    }

    setIntentFeedback(
      `Opening ${appLabel}... (UPI ID "${upiId}" auto-copied). If the app doesn't launch automatically on your device, use the QR code or tap 'All UPI Apps' below.`
    );
    setTimeout(() => setIntentFeedback(null), 8000);

    // Reliable intent dispatch via anchor element click + fallback
    try {
      const link = document.createElement('a');
      link.href = appUri;
      link.rel = 'noreferrer';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (link.parentNode) link.parentNode.removeChild(link);
      }, 500);
    } catch {
      window.location.href = appUri;
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-slate-900/75 backdrop-blur-xs p-2 sm:p-4 md:p-6 flex items-start justify-center animate-in fade-in duration-150"
    >
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto sm:my-8 flex flex-col">
        {/* Sticky Header */}
        <div className="bg-[#12294A] px-5 sm:px-6 py-4 text-white flex items-center justify-between border-b-2 border-[#E86A17] shrink-0">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-white">Make Payment via UPI / HD QR</h3>
            <p className="text-[11px] sm:text-xs text-orange-200">
              Project: <span className="font-mono font-bold text-white">{project.projectId}</span> - {project.serviceName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto overscroll-contain flex-1 p-4 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Project Price Stats */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center text-xs">
            <div>
              <div className="text-slate-500 font-medium">Total Price</div>
              <div className="text-sm font-bold text-slate-800">
                ₹{project.finalPrice.toLocaleString('en-IN')}
              </div>
            </div>
            <div>
              <div className="text-slate-500 font-medium">Already Paid</div>
              <div className="text-sm font-bold text-emerald-600">
                ₹{project.amountPaid.toLocaleString('en-IN')}
              </div>
            </div>
            <div>
              <div className="text-slate-500 font-medium">Balance Due</div>
              <div className="text-sm font-bold text-rose-600">
                ₹{project.amountDue.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Installment Milestone Selector (If enabled for this project) */}
          {project.hasInstallments && project.installments && project.installments.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#12294A] flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#E86A17]" />
                  <span>Select Installment Milestone to Pay</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {project.installments.filter((i) => i.status === 'Paid').length} of {project.installments.length} Completed
                </span>
              </div>

              <div className="space-y-1.5">
                {project.installments.map((inst) => {
                  const isSelected = selectedInstallmentId === inst.installmentId;
                  const isPaid = inst.status === 'Paid';
                  const isProcessing = inst.status === 'Processing';

                  return (
                    <div
                      key={inst.installmentId}
                      onClick={() => {
                        if (!isPaid) {
                          setSelectedInstallmentId(inst.installmentId);
                          setAmount(inst.amount);
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-xs transition flex items-center justify-between gap-3 ${
                        isPaid
                          ? 'bg-emerald-50/60 border-emerald-200 text-slate-500 cursor-not-allowed opacity-80'
                          : isSelected
                          ? 'bg-orange-50 border-[#E86A17] ring-1 ring-[#E86A17] text-[#12294A] shadow-xs cursor-pointer'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono shrink-0 ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-700'
                            : isSelected
                            ? 'bg-[#E86A17] text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {inst.installmentNumber}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold truncate flex items-center gap-1.5">
                            <span>{inst.title}</span>
                            {inst.percent && (
                              <span className="text-[10px] text-slate-400 font-normal">({inst.percent}%)</span>
                            )}
                          </div>
                          {inst.dueDate && (
                            <div className="text-[10px] text-slate-400">Due: {inst.dueDate}</div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-sm text-[#12294A]">
                          ₹{inst.amount.toLocaleString('en-IN')}
                        </span>
                        {isPaid ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Paid
                          </span>
                        ) : isProcessing ? (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            Processing
                          </span>
                        ) : isSelected ? (
                          <span className="bg-[#E86A17] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            Selected
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-md">
                            Pay Next
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Instant App Redirect Buttons (PhonePe, Google Pay, Paytm, BHIM) */}
          <div className="bg-gradient-to-r from-slate-900 to-[#12294A] text-white p-4 rounded-xl space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-300 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#E86A17]" />
                Direct UPI App Redirect (Mobile)
              </span>
              <span className="text-[10px] text-slate-300">Amount: ₹{(amount || suggestedAmount).toLocaleString('en-IN')}</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Click any app below to automatically launch pre-filled payment:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {/* PhonePe */}
              <button
                type="button"
                onClick={() => handleOpenUpiApp('phonepe')}
                className="py-2.5 px-3 bg-[#5f259f] hover:bg-[#4d1e82] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95 border border-purple-400/40"
                title="Pay via PhonePe app"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="11" fill="white" />
                  <path
                    d="M14.8 6.5H9.2C8.5 6.5 8 7 8 7.7v8.6c0 .7.5 1.2 1.2 1.2h1.6v-3.5h2.2c2.4 0 4.1-1.6 4.1-3.8 0-2.3-1.6-3.7-4.1-3.7h1.8zm-1.8 5.2h-2.2V8.7h2.2c1.2 0 2 .7 2 1.8 0 1.2-.8 1.8-2 1.8z"
                    fill="#5f259f"
                  />
                  <path d="M12.5 14.5l3.2 4.5h-2.4l-2.6-3.8z" fill="#5f259f" />
                </svg>
                <div className="text-left leading-tight">
                  <div className="font-extrabold text-xs">PhonePe</div>
                  <div className="text-[9px] text-purple-200">1-Tap Pay</div>
                </div>
              </button>

              {/* Google Pay */}
              <button
                type="button"
                onClick={() => handleOpenUpiApp('gpay')}
                className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95"
                title="Pay via Google Pay"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.86c2.26-2.09 3.685-5.17 3.685-9.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09C3.26 21.3 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.28C.46 8.24 0 10.06 0 12s.46 3.76 1.28 5.38l3.99-3.09z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.7 1.28 6.62l3.99 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                  />
                </svg>
                <div className="text-left leading-tight">
                  <div className="font-extrabold text-xs text-slate-800">GPay</div>
                  <div className="text-[9px] text-slate-500">Google Pay</div>
                </div>
              </button>

              {/* Paytm */}
              <button
                type="button"
                onClick={() => handleOpenUpiApp('paytm')}
                className="py-2.5 px-3 bg-[#002e6e] hover:bg-[#002252] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95 border border-[#00baf2]/40"
                title="Pay via Paytm app"
              >
                <div className="w-5 h-5 rounded-full bg-[#00baf2] text-white font-black text-[9px] flex items-center justify-center shrink-0 shadow-xs">
                  pay
                </div>
                <div className="text-left leading-tight">
                  <div className="font-extrabold text-xs text-white">Paytm</div>
                  <div className="text-[9px] text-cyan-200">UPI / Wallet</div>
                </div>
              </button>

              {/* BHIM / All UPI */}
              <button
                type="button"
                onClick={() => handleOpenUpiApp('bhim')}
                className="py-2.5 px-3 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95 border border-amber-300/40"
                title="Pay via Any UPI App (BHIM, CRED, Amazon Pay, Any Bank App)"
              >
                <div className="w-5 h-5 rounded-full bg-white text-[#E86A17] font-black text-[11px] flex items-center justify-center shrink-0">
                  ⚡
                </div>
                <div className="text-left leading-tight">
                  <div className="font-extrabold text-xs text-white">All UPI</div>
                  <div className="text-[9px] text-amber-200">BHIM / CRED</div>
                </div>
              </button>
            </div>

            {intentFeedback && (
              <div className="p-3 bg-amber-500/20 border border-amber-400/40 rounded-xl text-xs text-amber-200 mt-2 space-y-2 animate-in fade-in">
                <div className="flex items-start gap-2">
                  <span className="text-sm">📲</span>
                  <span className="leading-relaxed">{intentFeedback}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-400/30">
                  <button
                    type="button"
                    onClick={() => handleOpenUpiApp('bhim')}
                    className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-[11px] font-bold transition cursor-pointer"
                  >
                    Open Generic App Chooser (UPI Intent)
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyUPI}
                    className="px-2.5 py-1 bg-amber-500/40 hover:bg-amber-500/60 text-white rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy UPI ID Again</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* HD QR Code & UPI Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-orange-50/50 p-4 rounded-xl border border-orange-200/80">
            {/* QR Box */}
            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-xs border border-orange-200 text-center">
              <img
                src={dynamicHdQr || settings.companyQrImageUrl}
                alt="HD Company UPI QR"
                className="w-32 h-32 object-contain"
              />
              <span className="text-[10px] text-slate-500 font-bold mt-1.5 flex items-center gap-1">
                <QrCode className="w-3 h-3 text-[#E86A17]" /> HD QR • Amount ₹{amount || 0}
              </span>
            </div>

            {/* UPI ID Details */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                  Official SidTech UPI ID
                </label>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-xs text-[#12294A] flex-1 truncate select-all">
                    {settings.companyUpi}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUPI}
                    title="Copy UPI ID"
                    className="p-2 rounded-lg bg-[#E86A17] hover:bg-[#d45e12] text-white transition flex-shrink-0 cursor-pointer"
                  >
                    {copiedUpi ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                {copiedUpi && (
                  <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                    ✓ UPI ID copied to clipboard!
                  </p>
                )}
              </div>

              <div className="text-[11px] text-slate-500 leading-relaxed bg-white/80 p-2.5 rounded-lg border border-slate-200">
                1. Tap PhonePe, GPay, Paytm above or scan HD QR.<br />
                2. Complete payment & note the 12-digit <strong>UTR</strong>.
              </div>
            </div>
          </div>

          {/* Submission Form */}
          <form id="payment-submit-form" onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Payment Amount (INR)
                </label>
                <span className="text-[10px] text-slate-400">
                  {project.amountPaid === 0 ? 'Min. Advance Suggested' : 'Installment or Full'}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  required
                  min={1}
                  max={project.amountDue}
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  placeholder="Enter amount being paid"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                12-Digit UTR / Transaction Reference Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono text-slate-800 uppercase focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                placeholder="e.g. 423412345678"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Found in PhonePe, Google Pay, or Paytm receipt under "UPI Ref No" or "UTR".
              </p>
            </div>
          </form>
        </div>

        {/* Sticky Modal Action Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3.5 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="payment-submit-form"
            disabled={isSubmitting}
            className="px-5 py-2 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Recording Payment...' : 'Submit Payment Proof'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
