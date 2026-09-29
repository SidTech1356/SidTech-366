import React, { useState } from 'react';
import { Award, Calendar, CheckCircle2, UserCheck, ShieldCheck } from 'lucide-react';
import { Project, Franchise } from '../../types/database';
import { CertificatePreview } from '../generators/CertificatePreview';
import { FranchisePartnerCertificatePreview } from '../generators/FranchisePartnerCertificatePreview';

interface FranchiseCertificatesProps {
  projects: Project[];
  franchise: Franchise;
}

export const FranchiseCertificates: React.FC<FranchiseCertificatesProps> = ({
  projects,
  franchise,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'franchise_cert' | 'client_certs'>('franchise_cert');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const deliveredProjects = projects.filter(
    (p) => p.status === 'Delivered' && p.certificateNumber
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Switcher */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#12294A] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#E86A17]" />
            Official Certificates Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View & download your official Franchise Partner Work Certificate and client delivery certificates
          </p>
        </div>

        {/* Sub Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveSubTab('franchise_cert')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'franchise_cert'
                ? 'bg-white text-[#12294A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-[#E86A17]" />
            <span>Franchise Partner Certificate</span>
          </button>
          <button
            onClick={() => setActiveSubTab('client_certs')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'client_certs'
                ? 'bg-white text-[#12294A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-[#E86A17]" />
            <span>Client Completion Certificates ({deliveredProjects.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Franchise Partner Work Certificate */}
      {activeSubTab === 'franchise_cert' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Accredited SidTech Business Partner Certificate (Database Verified)</span>
            </div>
            <span className="text-xs text-slate-500">
              Franchise ID: <strong className="font-mono text-slate-800">{franchise.franchiseId}</strong>
            </span>
          </div>
          <FranchisePartnerCertificatePreview franchise={franchise} />
        </div>
      )}

      {/* Tab 2: Client Project Certificates */}
      {activeSubTab === 'client_certs' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deliveredProjects.length === 0 ? (
              <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
                No delivered projects with certificates yet. Once a project is fully paid and delivered by SidTech, its client completion certificate will be automatically issued here.
              </div>
            ) : (
              deliveredProjects.map((project) => (
                <div
                  key={project.projectId}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#E86A17] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">
                        {project.certificateNumber}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {project.deliveredOn
                          ? new Date(project.deliveredOn).toLocaleDateString('en-IN', {
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Delivered'}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 leading-snug">
                      {project.clientName}
                    </h3>
                    <p className="text-xs text-slate-500">{project.serviceName}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Delivered & Signed
                    </div>
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="px-3.5 py-1.5 bg-[#12294A] hover:bg-[#0c1c33] text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5 text-[#E86A17]" />
                      <span>Open Certificate</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal for Client Certificate */}
      {selectedProject && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedProject(null);
          }}
          className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 bg-slate-900/75 backdrop-blur-sm overflow-y-auto overscroll-contain animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 max-w-5xl w-full border border-slate-200 relative my-auto sm:my-8 flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 print:hidden">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Official Client Project Delivery Certificate
              </span>
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <span>✕ Close</span>
              </button>
            </div>
            <CertificatePreview project={selectedProject} franchise={franchise} />
          </div>
        </div>
      )}
    </div>
  );
};
