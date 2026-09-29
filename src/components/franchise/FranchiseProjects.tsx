import React, { useState } from 'react';
import {
  Copy,
  Check,
  CreditCard,
  Award,
  Clock,
  Layers,
  CheckCircle2,
  XCircle,
  Monitor,
  AlertCircle,
} from 'lucide-react';
import { Project, AppSettings, Franchise } from '../../types/database';
import { StatusChip } from '../common/StatusChip';
import { PaymentModal } from '../common/PaymentModal';
import { CertificatePreview } from '../generators/CertificatePreview';
import { SandboxDemoPreview } from '../common/SandboxDemoPreview';

interface FranchiseProjectsProps {
  projects: Project[];
  franchise: Franchise;
  settings: AppSettings;
  selectedProjectId?: string;
  onRefresh: () => void;
}

export const FranchiseProjects: React.FC<FranchiseProjectsProps> = ({
  projects,
  franchise,
  settings,
  selectedProjectId,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'All' | 'New' | 'Accepted' | 'Processing' | 'Delivered'>('All');
  const [paymentModalProject, setPaymentModalProject] = useState<Project | null>(null);
  const [paymentInstallmentId, setPaymentInstallmentId] = useState<string | undefined>(undefined);
  const [certModalProject, setCertModalProject] = useState<Project | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  const filteredProjects = projects.filter((p) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'New') return p.status === 'New';
    if (activeTab === 'Accepted') return p.status === 'Accepted';
    if (activeTab === 'Processing') return p.status === 'Processing' || p.status === 'DemoReady';
    if (activeTab === 'Delivered') return p.status === 'Delivered';
    return true;
  });

  const handleCopyFinalUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#12294A]">My Client Projects</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track real-time status transitions, demo previews, payments, and delivery certificates in Database
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs bg-slate-100 p-1 rounded-xl">
          {(['All', 'New', 'Accepted', 'Processing', 'Delivered'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                activeTab === tab
                  ? 'bg-white text-slate-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredProjects.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No projects in this stage.
          </div>
        ) : (
          filteredProjects.map((project) => {
            return (
              <div
                key={project.projectId}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition space-y-4"
              >
                {/* Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold bg-slate-100 text-[#12294A] px-2.5 py-1 rounded-md border border-slate-200">
                      {project.projectId}
                    </span>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 leading-snug">
                        {project.serviceName}
                      </h3>
                      <div className="text-xs text-slate-500">
                        Client: <strong className="text-slate-700">{project.clientName}</strong> ({project.clientMobile})
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <StatusChip status={project.status} />
                  </div>
                </div>

                {/* Middle Row: Progress Bar & Financials */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Final Agreed Price</span>
                    <span className="font-bold text-slate-800 font-mono text-sm">
                      ₹{project.finalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Advance ({project.advancePercent}%)</span>
                    <span className="font-bold text-[#E86A17] font-mono text-sm">
                      ₹{project.advanceRequired.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Paid Amount</span>
                    <span className="font-bold text-emerald-600 font-mono text-sm">
                      ₹{project.amountPaid.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Balance Due</span>
                    <span className="font-bold text-rose-600 font-mono text-sm">
                      ₹{project.amountDue.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Payment Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                    <span>Payment Progress</span>
                    <span>
                      {Math.round((project.amountPaid / Math.max(1, project.finalPrice)) * 100)}% Paid
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#E86A17] to-emerald-500 transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((project.amountPaid / Math.max(1, project.finalPrice)) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {project.requirementNotes && (
                  <div className="text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    <strong className="text-slate-700">Client Requirements:</strong> {project.requirementNotes}
                  </div>
                )}

                {/* Installment Milestone Payment Schedule */}
                {project.hasInstallments && project.installments && project.installments.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#E86A17]" />
                        <span className="text-xs font-bold text-[#12294A]">Milestone Installment Schedule</span>
                        <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full font-mono">
                          {project.installments.filter((i) => i.status === 'Paid').length}/{project.installments.length} Paid
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-slate-600">
                        Total ₹{project.finalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {project.installments.map((inst, idx) => {
                        const isPaid = inst.status === 'Paid';
                        const isProcessing = inst.status === 'Processing';
                        const isPending = inst.status === 'Pending';
                        const isNextActive = isPending && project.installments?.slice(0, idx).every((prev) => prev.status === 'Paid');

                        return (
                          <div
                            key={inst.installmentId || idx}
                            className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 transition ${
                              isPaid
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                                : isProcessing
                                ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                                : isNextActive
                                ? 'bg-orange-50/70 border-orange-300 ring-1 ring-orange-400/40 text-slate-800'
                                : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Milestone {inst.installmentNumber}
                                </div>
                                <div className="font-bold text-xs leading-tight line-clamp-1">
                                  {inst.title}
                                </div>
                              </div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
                                  isPaid
                                    ? 'bg-emerald-200/80 text-emerald-800'
                                    : isProcessing
                                    ? 'bg-amber-200/80 text-amber-800'
                                    : 'bg-slate-200/70 text-slate-700'
                                }`}
                              >
                                {isPaid ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Paid</span>
                                  </>
                                ) : isProcessing ? (
                                  <>
                                    <Clock className="w-3 h-3" />
                                    <span>UTR Verifying</span>
                                  </>
                                ) : (
                                  <span>Pending</span>
                                )}
                              </span>
                            </div>

                            <div className="flex items-baseline justify-between pt-1 border-t border-slate-200/60">
                              <span className="text-base font-extrabold font-mono text-[#12294A]">
                                ₹{inst.amount.toLocaleString('en-IN')}
                              </span>
                              {inst.percent && (
                                <span className="text-[10px] font-mono text-slate-500 font-semibold">
                                  {inst.percent}%
                                </span>
                              )}
                            </div>

                            {inst.notes && (
                              <div className="text-[10px] text-slate-500 line-clamp-1 italic">
                                {inst.notes}
                              </div>
                            )}

                            {isPaid && inst.utr && (
                              <div className="text-[10px] font-mono text-emerald-700 font-semibold bg-emerald-100/60 px-1.5 py-0.5 rounded truncate">
                                UTR: {inst.utr}
                              </div>
                            )}

                            {isNextActive && project.status !== 'Delivered' && project.status !== 'Rejected' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setPaymentInstallmentId(inst.installmentId);
                                  setPaymentModalProject(project);
                                }}
                                className="w-full py-1.5 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <CreditCard className="w-3 h-3" />
                                <span>Pay Milestone (₹{inst.amount.toLocaleString('en-IN')})</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Lifecycle Specific Action Sections */}
                {project.status === 'New' && (
                  <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-xl flex items-center justify-between text-xs text-amber-900">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>
                        Project recorded in Database. Waiting for SidTech admin to review requirements and confirm final pricing/advance.
                      </span>
                    </div>
                  </div>
                )}

                {project.status === 'Accepted' && (
                  <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-[#E86A17] text-sm flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" />
                        Project Accepted by SidTech!
                      </div>
                      <p className="text-slate-600 mt-0.5">
                        Please deposit the advance of <strong>₹{project.advanceRequired.toLocaleString('en-IN')}</strong> via UPI to start development.
                      </p>
                    </div>
                    <button
                      onClick={() => setPaymentModalProject(project)}
                      className="px-4 py-2 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-xl font-bold shadow-md transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Pay Advance (₹{project.advanceRequired.toLocaleString('en-IN')})</span>
                    </button>
                  </div>
                )}

                {(project.status === 'Processing' || project.status === 'DemoReady') && (
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-bold text-blue-900 flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-blue-600" />
                          Work in Progress (SidTech Engineering)
                        </div>
                        <p className="text-slate-600 mt-0.5">
                          {project.demoUrl
                            ? 'A live demo build is ready! You can test the application inside the sandboxed preview below.'
                            : 'Engineers are building the solution. Demo preview will appear here once ready.'}
                        </p>
                      </div>
                      {project.amountDue > 0 && (
                        <button
                          onClick={() => setPaymentModalProject(project)}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs transition flex items-center gap-1.5 text-xs self-start sm:self-auto cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay Balance (Due: ₹{project.amountDue.toLocaleString('en-IN')})</span>
                        </button>
                      )}
                    </div>

                    {project.demoUrl && (
                      <SandboxDemoPreview
                        demoUrl={project.demoUrl}
                        serviceName={project.serviceName}
                        projectId={project.projectId}
                        clientName={project.clientName}
                      />
                    )}
                  </div>
                )}

                {project.status === 'Delivered' && (
                  <div className="space-y-4">
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                      <div>
                        <div className="font-bold text-emerald-800 text-sm flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Project Successfully Delivered!
                        </div>
                        <p className="text-slate-600 mt-0.5">
                          Final solution is live on production. Deliverable link & client certificate are ready.
                        </p>
                        <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                          ₹{project.commissionAmount.toLocaleString('en-IN')} commission has been credited to your Wallet.
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        {project.finalUrl && (
                          <button
                            onClick={() => handleCopyFinalUrl(project.finalUrl!)}
                            className="px-3.5 py-2 bg-[#12294A] hover:bg-[#0c1c33] text-white rounded-xl font-bold shadow-xs transition flex items-center gap-1.5 text-xs cursor-pointer"
                          >
                            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedUrl ? 'Copied to Clipboard!' : 'Copy Delivered URL'}</span>
                          </button>
                        )}
                        <button
                          onClick={() => setCertModalProject(project)}
                          className="px-3.5 py-2 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-xl font-bold shadow-xs transition flex items-center gap-1.5 text-xs cursor-pointer"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>View Certificate</span>
                        </button>
                      </div>
                    </div>

                    {(project.finalUrl || project.demoUrl) && (
                      <SandboxDemoPreview
                        demoUrl={project.finalUrl || project.demoUrl!}
                        serviceName={project.serviceName}
                        projectId={project.projectId}
                        clientName={project.clientName}
                        isDelivered={true}
                      />
                    )}
                  </div>
                )}

                {project.status === 'Rejected' && (
                  <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-center gap-2 text-xs text-rose-800">
                    <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <div>
                      <strong>Project Rejected:</strong> {project.rejectionReason || 'Contact support for details.'}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {paymentModalProject && (
        <PaymentModal
          project={paymentModalProject}
          settings={settings}
          franchiseId={franchise.franchiseId}
          defaultInstallmentId={paymentInstallmentId}
          onClose={() => {
            setPaymentModalProject(null);
            setPaymentInstallmentId(undefined);
          }}
          onPaymentSubmitted={() => {
            onRefresh();
          }}
        />
      )}

      {certModalProject && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setCertModalProject(null);
          }}
          className="fixed inset-0 z-50 overflow-y-auto overscroll-contain p-2 sm:p-4 bg-slate-900/75 backdrop-blur-xs flex items-start justify-center animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 max-w-5xl w-full border border-slate-200 relative my-auto sm:my-8 flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 print:hidden">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Official Project Delivery Certificate
              </span>
              <button
                type="button"
                onClick={() => setCertModalProject(null)}
                className="px-3 py-1 bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            <CertificatePreview project={certModalProject} franchise={franchise} />
          </div>
        </div>
      )}
    </div>
  );
};
