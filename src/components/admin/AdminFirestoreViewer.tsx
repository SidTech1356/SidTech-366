import React, { useState } from 'react';
import {
  Download,
  RefreshCw,
  Search,
  Database,
  CheckCircle2,
  AlertCircle,
  Flame,
  ShieldCheck,
  Table,
} from 'lucide-react';
import { SidTechDatabase } from '../../services/storage';

interface AdminFirestoreViewerProps {
  onRefresh?: () => void;
}

export const AdminFirestoreViewer: React.FC<AdminFirestoreViewerProps> = ({ onRefresh }) => {
  const [activeCollection, setActiveCollection] = useState<
    'franchises' | 'services' | 'projects' | 'payments' | 'payouts' | 'settings' | 'notifications'
  >('franchises');
  const [searchTerm, setSearchTerm] = useState('');
  const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const collections = [
    'franchises',
    'services',
    'projects',
    'payments',
    'payouts',
    'settings',
    'notifications',
  ] as const;

  const franchises = SidTechDatabase.getFranchises();
  const services = SidTechDatabase.getServices();
  const projects = SidTechDatabase.getProjects();
  const payments = SidTechDatabase.getPayments();
  const payouts = SidTechDatabase.getPayouts();
  const notifications = SidTechDatabase.getNotifications();
  const settings = SidTechDatabase.getSettings();

  const handleSyncFirestore = async () => {
    setIsRefreshing(true);
    try {
      await SidTechDatabase.initializeFirebaseDatabase();
      setNotice({ type: 'success', text: 'Enterprise Database collections re-synced in real-time!' });
      setTimeout(() => setNotice(null), 3000);
      if (onRefresh) onRefresh();
    } catch {
      setNotice({ type: 'error', text: 'Error refreshing database connection' });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr = SidTechDatabase.exportFullDatabase();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SidTech_Enterprise_DB_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setNotice({ type: 'success', text: 'Full System Database JSON backup downloaded!' });
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Database Header Bar */}
      <div className="bg-gradient-to-r from-[#12294A] via-[#16355e] to-[#0f223d] text-white p-5 rounded-2xl border border-slate-700 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-orange-500/20 text-[#E86A17] rounded-xl border border-orange-500/30">
              <Database className="w-6 h-6 text-[#E86A17]" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  SIDTECH Enterprise Database Inspector
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Cloud Database
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Primary persistent database: All 7 collections sync in real-time across users and devices.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSyncFirestore}
              disabled={isRefreshing}
              className="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Cloud DB'}</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON Backup</span>
            </button>
          </div>
        </div>
      </div>

      {notice && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border shadow-xs animate-in fade-in ${
            notice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Collection Tab Switcher */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 text-xs">
        {collections.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCollection(c)}
            className={`px-4 py-2 rounded-t-xl font-bold transition flex items-center gap-1.5 border-t border-x cursor-pointer ${
              activeCollection === c
                ? 'bg-[#12294A] text-white border-[#12294A] shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Table className="w-3.5 h-3.5 text-[#E86A17]" />
            <span className="capitalize">{c}</span>
          </button>
        ))}
      </div>

      {/* Table Data Viewer */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="font-semibold text-slate-700 flex items-center gap-2">
            <span>
              Database Collection: <strong className="text-[#E86A17]">/{activeCollection}</strong>
            </span>
          </div>
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Filter ${activeCollection}...`}
              className="w-full pl-8 pr-3 py-1 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>
        </div>

        {/* Franchises Collection */}
        {activeCollection === 'franchises' && (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#12294A] text-white">
                <tr>
                  <th className="py-2.5 px-3">Doc ID</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">BranchName</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Mobile</th>
                  <th className="py-2.5 px-3 bg-indigo-900/60 text-indigo-200">Password</th>
                  <th className="py-2.5 px-3 bg-amber-900/40 text-amber-200">T-PIN</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">WalletBalance</th>
                  <th className="py-2.5 px-3">TotalEarned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {franchises.map((f) => (
                  <tr key={f.franchiseId} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-[#E86A17]">{f.franchiseId}</td>
                    <td className="py-2 px-3 font-sans font-semibold">{f.name}</td>
                    <td className="py-2 px-3 font-sans">{f.branchName}</td>
                    <td className="py-2 px-3">{f.email}</td>
                    <td className="py-2 px-3">{f.mobile}</td>
                    <td className="py-2 px-3 font-bold text-indigo-700 bg-indigo-50/50">
                      {f.password || 'Franchise@123'}
                    </td>
                    <td className="py-2 px-3 font-bold text-amber-700 bg-amber-50/40">
                      {f.tPin || '1234'}
                    </td>
                    <td className="py-2 px-3 font-bold">{f.status}</td>
                    <td className="py-2 px-3 text-emerald-700 font-bold">₹{f.walletBalance}</td>
                    <td className="py-2 px-3">₹{f.totalEarned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Services Collection */}
        {activeCollection === 'services' && (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#12294A] text-white">
                <tr>
                  <th className="py-2.5 px-3">Doc ID</th>
                  <th className="py-2.5 px-3">ServiceName</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3">Advance%</th>
                  <th className="py-2.5 px-3">Commission%</th>
                  <th className="py-2.5 px-3">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {services.map((s) => (
                  <tr key={s.serviceId} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-[#E86A17]">{s.serviceId}</td>
                    <td className="py-2 px-3 font-sans font-semibold">{s.serviceName}</td>
                    <td className="py-2 px-3">{s.category}</td>
                    <td className="py-2 px-3 font-bold">₹{s.price}</td>
                    <td className="py-2 px-3">{s.advancePercent}%</td>
                    <td className="py-2 px-3">{s.commissionPercent}%</td>
                    <td className="py-2 px-3">{s.active ? 'TRUE' : 'FALSE'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Projects Collection */}
        {activeCollection === 'projects' && (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#12294A] text-white">
                <tr>
                  <th className="py-2.5 px-3">Doc ID</th>
                  <th className="py-2.5 px-3">FranchiseID</th>
                  <th className="py-2.5 px-3">ServiceName</th>
                  <th className="py-2.5 px-3">ClientName</th>
                  <th className="py-2.5 px-3">FinalPrice</th>
                  <th className="py-2.5 px-3">AmountPaid</th>
                  <th className="py-2.5 px-3">AmountDue</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">CertificateNumber</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {projects.map((p) => (
                  <tr key={p.projectId} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-[#E86A17]">{p.projectId}</td>
                    <td className="py-2 px-3">{p.franchiseId}</td>
                    <td className="py-2 px-3 font-sans font-semibold">{p.serviceName}</td>
                    <td className="py-2 px-3 font-sans">{p.clientName}</td>
                    <td className="py-2 px-3 font-bold">₹{p.finalPrice}</td>
                    <td className="py-2 px-3 text-emerald-700 font-bold">₹{p.amountPaid}</td>
                    <td className="py-2 px-3 text-rose-700 font-bold">₹{p.amountDue}</td>
                    <td className="py-2 px-3 font-bold">{p.status}</td>
                    <td className="py-2 px-3">{p.certificateNumber || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Payments Collection */}
        {activeCollection === 'payments' && (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#12294A] text-white">
                <tr>
                  <th className="py-2.5 px-3">Doc ID</th>
                  <th className="py-2.5 px-3">ProjectID</th>
                  <th className="py-2.5 px-3">FranchiseID</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">UTR / Ref</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">VerifiedOn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {payments.map((py) => (
                  <tr key={py.paymentId} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-[#E86A17]">{py.paymentId}</td>
                    <td className="py-2 px-3">{py.projectId}</td>
                    <td className="py-2 px-3">{py.franchiseId}</td>
                    <td className="py-2 px-3 font-bold text-emerald-700">₹{py.amount}</td>
                    <td className="py-2 px-3">{py.mode}</td>
                    <td className="py-2 px-3 font-bold select-all">{py.utr}</td>
                    <td className="py-2 px-3 font-bold">{py.status}</td>
                    <td className="py-2 px-3">
                      {py.verifiedOn ? new Date(py.verifiedOn).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Payouts Collection */}
        {activeCollection === 'payouts' && (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#12294A] text-white">
                <tr>
                  <th className="py-2.5 px-3">Doc ID</th>
                  <th className="py-2.5 px-3">FranchiseID</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">RequestedOn</th>
                  <th className="py-2.5 px-3">ReferenceNote</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {payouts.map((po) => (
                  <tr key={po.payoutId} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-[#E86A17]">{po.payoutId}</td>
                    <td className="py-2 px-3">{po.franchiseId}</td>
                    <td className="py-2 px-3 font-bold text-amber-600">₹{po.amount}</td>
                    <td className="py-2 px-3 font-bold">{po.status}</td>
                    <td className="py-2 px-3">{po.mode}</td>
                    <td className="py-2 px-3">{new Date(po.requestedOn).toLocaleDateString()}</td>
                    <td className="py-2 px-3 font-sans">{po.referenceNote || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Settings Collection */}
        {activeCollection === 'settings' && (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#12294A] text-white">
                <tr>
                  <th className="py-2.5 px-3">Property</th>
                  <th className="py-2.5 px-3">Value</th>
                  <th className="py-2.5 px-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="bg-indigo-50/50">
                  <td className="py-2 px-3 font-bold text-indigo-900">adminUsername</td>
                  <td className="py-2 px-3 font-bold text-indigo-700">{settings.adminUsername}</td>
                  <td className="py-2 px-3 text-slate-500 font-sans">Super Admin login username</td>
                </tr>
                <tr className="bg-indigo-50/50">
                  <td className="py-2 px-3 font-bold text-indigo-900">adminPassword</td>
                  <td className="py-2 px-3 font-bold text-indigo-700">{settings.adminPassword || 'Sidanta*#1996'}</td>
                  <td className="py-2 px-3 text-slate-500 font-sans">Super Admin master login password</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold text-[#E86A17]">companyName</td>
                  <td className="py-2 px-3 font-sans">{settings.companyName}</td>
                  <td className="py-2 px-3 text-slate-400 font-sans">Official company display name</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold text-[#E86A17]">companyUpi</td>
                  <td className="py-2 px-3">{settings.companyUpi}</td>
                  <td className="py-2 px-3 text-slate-400 font-sans">Direct advance deposit UPI address</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold text-[#E86A17]">cloudSyncConnected</td>
                  <td className="py-2 px-3 font-bold text-emerald-600">TRUE</td>
                  <td className="py-2 px-3 text-slate-400 font-sans">Active Enterprise Cloud DB connection</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold text-[#E86A17]">defaultAdvancePercent</td>
                  <td className="py-2 px-3">{settings.defaultAdvancePercent}%</td>
                  <td className="py-2 px-3 text-slate-400 font-sans">Fallback advance %</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold text-[#E86A17]">defaultCommissionPercent</td>
                  <td className="py-2 px-3">{settings.defaultCommissionPercent}%</td>
                  <td className="py-2 px-3 text-slate-400 font-sans">Franchise commission default</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Notifications Collection */}
        {activeCollection === 'notifications' && (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#12294A] text-white">
                <tr>
                  <th className="py-2.5 px-3">Doc ID</th>
                  <th className="py-2.5 px-3">TargetFranchiseID</th>
                  <th className="py-2.5 px-3">Message</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Read</th>
                  <th className="py-2.5 px-3">CreatedOn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {notifications.map((n) => (
                  <tr key={n.notifId} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-[#E86A17]">{n.notifId}</td>
                    <td className="py-2 px-3">{n.franchiseId || 'BROADCAST'}</td>
                    <td className="py-2 px-3 font-sans truncate max-w-sm">{n.message}</td>
                    <td className="py-2 px-3">{n.type}</td>
                    <td className="py-2 px-3">{n.read ? 'TRUE' : 'FALSE'}</td>
                    <td className="py-2 px-3">{new Date(n.createdOn).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
