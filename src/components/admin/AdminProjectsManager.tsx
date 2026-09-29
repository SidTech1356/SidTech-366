import React, { useState } from 'react';
import {
  FolderKanban,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  Award,
  DollarSign,
  X,
  Edit3,
  Save,
  Wallet,
  Percent,
  Calendar,
  Plus,
  Trash2,
  Split,
  Check,
  AlertCircle,
  CreditCard,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Project, Franchise, ProjectStatus, ProjectInstallment, InstallmentStatus } from '../../types/database';
import { SidTechDatabase } from '../../services/storage';
import { StatusChip } from '../common/StatusChip';
import { CertificatePreview } from '../generators/CertificatePreview';
import { SandboxDemoPreview } from '../common/SandboxDemoPreview';

interface AdminProjectsManagerProps {
  projects: Project[];
  franchises: Franchise[];
  filterFranchiseId?: string;
  onRefresh: () => void;
}

export const AdminProjectsManager: React.FC<AdminProjectsManagerProps> = ({
  projects,
  franchises,
  filterFranchiseId,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'All' | 'New' | 'Accepted' | 'Processing' | 'Delivered'>('All');
  const [search, setSearch] = useState('');
  const [drawerProject, setDrawerProject] = useState<Project | null>(null);

  // Drawer form edit states
  const [drawerTab, setDrawerTab] = useState<'lifecycle' | 'editor' | 'installments'>('lifecycle');
  const [hasInstallmentsActive, setHasInstallmentsActive] = useState<boolean>(false);
  const [projectInstallments, setProjectInstallments] = useState<ProjectInstallment[]>([]);
  const [percentBasis, setPercentBasis] = useState<'remaining' | 'total'>('remaining');
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editAdvancePercent, setEditAdvancePercent] = useState<number>(25);
  const [editAmountPaid, setEditAmountPaid] = useState<number>(0);
  const [editAmountDue, setEditAmountDue] = useState<number>(0);
  const [editCommissionPercent, setEditCommissionPercent] = useState<number>(10);
  const [editCommissionAmount, setEditCommissionAmount] = useState<number>(0);
  const [editClientName, setEditClientName] = useState<string>('');
  const [editClientMobile, setEditClientMobile] = useState<string>('');
  const [editServiceName, setEditServiceName] = useState<string>('');
  const [editStatus, setEditStatus] = useState<ProjectStatus>('New');
  const [editRequirementNotes, setEditRequirementNotes] = useState<string>('');
  const [editCertNumber, setEditCertNumber] = useState<string>('');
  const [demoUrlInput, setDemoUrlInput] = useState<string>('');
  const [finalUrlInput, setFinalUrlInput] = useState<string>('');
  const [rejectReason, setRejectReason] = useState<string>('');
  const [showRejectForm, setShowRejectForm] = useState<boolean>(false);
  const [showCertModal, setShowCertModal] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const openDrawer = (project: Project, tab: 'lifecycle' | 'editor' | 'installments' = 'lifecycle') => {
    setDrawerProject(project);
    setDrawerTab(tab);
    setHasInstallmentsActive(Boolean(project.hasInstallments));
    setProjectInstallments(
      project.installments && project.installments.length > 0
        ? JSON.parse(JSON.stringify(project.installments))
        : []
    );
    setPercentBasis(project.amountPaid > 0 ? 'remaining' : 'total');
    setEditPrice(project.finalPrice);
    setEditAdvancePercent(project.advancePercent);
    setEditAmountPaid(project.amountPaid);
    setEditAmountDue(project.amountDue);
    setEditCommissionPercent(project.commissionPercent);
    setEditCommissionAmount(project.commissionAmount);
    setEditClientName(project.clientName);
    setEditClientMobile(project.clientMobile);
    setEditServiceName(project.serviceName);
    setEditStatus(project.status);
    setDemoUrlInput(project.demoUrl || '');
    setFinalUrlInput(project.finalUrl || '');
    setEditRequirementNotes(project.requirementNotes || '');
    setEditCertNumber(project.certificateNumber || '');
    setRejectReason('');
    setShowRejectForm(false);
    setStatusMsg(null);
  };

  // Specific project installments action helpers
  const handleActivatePresetInstallments = (count: 2 | 3 | 4) => {
    if (!drawerProject) return;
    const price = editPrice || drawerProject.finalPrice;
    const alreadyPaid = Number(editAmountPaid !== undefined ? editAmountPaid : drawerProject.amountPaid) || 0;
    let newPlan: ProjectInstallment[] = [];

    if (alreadyPaid > 0) {
      // Advance has already been taken!
      // Step 1 represents the Advance already received and verified in Database
      const advancePercent = price > 0 ? Math.round((alreadyPaid / price) * 100) : 0;
      const advanceStep: ProjectInstallment = {
        installmentId: 'INST-1',
        installmentNumber: 1,
        title: `Installment 1: Initial Advance (Received ₹${alreadyPaid.toLocaleString('en-IN')})`,
        amount: alreadyPaid,
        percent: advancePercent,
        status: 'Paid',
        dueDate: 'Upon Order Booking',
        notes: 'Advance token already collected and verified in Database',
        paidAt: drawerProject.acceptedOn || new Date().toISOString(),
        utr: 'ADVANCE-VERIFIED',
      };

      const remainingBalance = Math.max(0, price - alreadyPaid);

      if (count === 2) {
        // 1 Advance + 1 Final Balance Handover
        const finalStep: ProjectInstallment = {
          installmentId: 'INST-2',
          installmentNumber: 2,
          title: `Installment 2: Final Handover (Remaining Balance)`,
          amount: remainingBalance,
          percent: 100 - advancePercent,
          status: 'Pending',
          dueDate: 'Final Delivery & Live Launch',
          notes: 'Remaining balance required before final domain & source handover',
        };
        newPlan = [advanceStep, finalStep];
      } else if (count === 3) {
        // 1 Advance + 2 Remaining Milestones (50% / 50% of remaining balance)
        const part1 = Math.round(remainingBalance * 0.5);
        const part2 = remainingBalance - part1;
        const pct1 = price > 0 ? Math.round((part1 / price) * 100) : 0;
        const pct2 = 100 - advancePercent - pct1;
        newPlan = [
          advanceStep,
          {
            installmentId: 'INST-2',
            installmentNumber: 2,
            title: 'Installment 2: Sandbox Demo Review (50% of Balance)',
            amount: part1,
            percent: pct1,
            status: 'Pending',
            dueDate: 'Live Sandbox Demo Ready',
            notes: 'Payable upon testing features on preview sandbox link',
          },
          {
            installmentId: 'INST-3',
            installmentNumber: 3,
            title: 'Installment 3: Final Production Release (50% of Balance)',
            amount: part2,
            percent: pct2,
            status: 'Pending',
            dueDate: 'Final Launch & Domain Connect',
            notes: 'Final delivery milestone before production release',
          },
        ];
      } else {
        // 1 Advance + 3 Remaining Milestones (40% / 30% / 30% of remaining balance)
        const part1 = Math.round(remainingBalance * 0.4);
        const part2 = Math.round(remainingBalance * 0.3);
        const part3 = remainingBalance - part1 - part2;
        const pct1 = price > 0 ? Math.round((part1 / price) * 100) : 0;
        const pct2 = price > 0 ? Math.round((part2 / price) * 100) : 0;
        const pct3 = 100 - advancePercent - pct1 - pct2;
        newPlan = [
          advanceStep,
          {
            installmentId: 'INST-2',
            installmentNumber: 2,
            title: 'Installment 2: Architecture & Layout (40% of Balance)',
            amount: part1,
            percent: pct1,
            status: 'Pending',
            dueDate: 'Layout Sign-off',
            notes: 'Frontend and database setup review',
          },
          {
            installmentId: 'INST-3',
            installmentNumber: 3,
            title: 'Installment 3: Sandbox Demo Inspection (30% of Balance)',
            amount: part2,
            percent: pct2,
            status: 'Pending',
            dueDate: 'Live Sandbox Ready',
            notes: 'Payable on preview inspection',
          },
          {
            installmentId: 'INST-4',
            installmentNumber: 4,
            title: 'Installment 4: Final Handover (30% of Balance)',
            amount: part3,
            percent: pct3,
            status: 'Pending',
            dueDate: 'Live Deployment',
            notes: 'Final delivery and certificate issue',
          },
        ];
      }
    } else {
      if (count === 2) {
        const part1 = Math.round(price * 0.5);
        const part2 = price - part1;
        newPlan = [
          {
            installmentId: 'INST-1',
            installmentNumber: 1,
            title: 'Installment 1: Advance Token (50%)',
            amount: part1,
            percent: 50,
            status: 'Pending',
            dueDate: 'Upon Booking / Start',
            notes: 'Required to initiate development',
          },
          {
            installmentId: 'INST-2',
            installmentNumber: 2,
            title: 'Installment 2: Final Delivery Handover (50%)',
            amount: part2,
            percent: 50,
            status: 'Pending',
            dueDate: 'Final Delivery & Live Launch',
            notes: 'Required before final source & domain handover',
          },
        ];
      } else if (count === 3) {
        const part1 = Math.round(price * 0.4);
        const part2 = Math.round(price * 0.3);
        const part3 = price - part1 - part2;
        newPlan = [
          {
            installmentId: 'INST-1',
            installmentNumber: 1,
            title: 'Installment 1: Advance Token (40%)',
            amount: part1,
            percent: 40,
            status: 'Pending',
            dueDate: 'Upon Order Confirmation',
            notes: 'Scope freeze & database architecture',
          },
          {
            installmentId: 'INST-2',
            installmentNumber: 2,
            title: 'Installment 2: Demo Review & Approval (30%)',
            amount: part2,
            percent: 30,
            status: 'Pending',
            dueDate: 'Live Sandbox Demo Ready',
            notes: 'Payable upon testing features on preview link',
          },
          {
            installmentId: 'INST-3',
            installmentNumber: 3,
            title: 'Installment 3: Final Production Release (30%)',
            amount: part3,
            percent: 30,
            status: 'Pending',
            dueDate: 'Final Launch & Domain Connect',
            notes: 'Delivery certificate & live production release',
          },
        ];
      } else {
        const part = Math.round(price * 0.25);
        const remainder = price - part * 3;
        newPlan = [
          {
            installmentId: 'INST-1',
            installmentNumber: 1,
            title: 'Installment 1: Project Kick-off (25%)',
            amount: part,
            percent: 25,
            status: 'Pending',
            dueDate: 'Initial Setup',
          },
          {
            installmentId: 'INST-2',
            installmentNumber: 2,
            title: 'Installment 2: Frontend UI & Layout (25%)',
            amount: part,
            percent: 25,
            status: 'Pending',
            dueDate: 'Milestone 2 Review',
          },
          {
            installmentId: 'INST-3',
            installmentNumber: 3,
            title: 'Installment 3: Backend & Database (25%)',
            amount: part,
            percent: 25,
            status: 'Pending',
            dueDate: 'Milestone 3 Demo',
          },
          {
            installmentId: 'INST-4',
            installmentNumber: 4,
            title: 'Installment 4: Final Handover (25%)',
            amount: remainder,
            percent: 25,
            status: 'Pending',
            dueDate: 'Live Deployment',
          },
        ];
      }
    }

    setHasInstallmentsActive(true);
    setProjectInstallments(newPlan);
    setStatusMsg({
      text: alreadyPaid > 0
        ? `Configured installment schedule: Advance of ₹${alreadyPaid.toLocaleString('en-IN')} marked Paid, and remaining balance of ₹${Math.max(0, price - alreadyPaid).toLocaleString('en-IN')} distributed.`
        : `Generated ${count}-part installment schedule for this project. Review and click 'Save Installment Plan' below.`,
    });
  };

  const handleDistributeRemainingBalance = () => {
    if (!drawerProject || projectInstallments.length === 0) return;
    const price = editPrice || drawerProject.finalPrice;

    // Sum of paid installments
    const paidAmount = projectInstallments
      .filter((i) => i.status === 'Paid')
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    const remainingDue = Math.max(0, price - paidAmount);
    const pendingIndices = projectInstallments
      .map((inst, idx) => (inst.status !== 'Paid' ? idx : -1))
      .filter((idx) => idx !== -1);

    if (pendingIndices.length === 0) {
      setStatusMsg({ text: 'All installments are already marked as Paid!' });
      return;
    }

    const updated = [...projectInstallments];
    const pendingCount = pendingIndices.length;

    // Check if pending items have custom percentages defined
    const pendingPercents = pendingIndices.map((idx) => Number(updated[idx].percent) || 0);
    const sumPendingPercents = pendingPercents.reduce((s, p) => s + p, 0);

    let allocated = 0;
    if (sumPendingPercents > 0) {
      pendingIndices.forEach((pIdx, i) => {
        const isLast = i === pendingCount - 1;
        if (isLast) {
          const amt = Math.max(0, remainingDue - allocated);
          updated[pIdx].amount = amt;
          updated[pIdx].percent = price > 0 ? Math.round((amt / price) * 100) : 0;
        } else {
          const ratio = (Number(updated[pIdx].percent) || 0) / sumPendingPercents;
          const amt = Math.round(remainingDue * ratio);
          allocated += amt;
          updated[pIdx].amount = amt;
          updated[pIdx].percent = price > 0 ? Math.round((amt / price) * 100) : 0;
        }
      });
    } else {
      const baseAmt = Math.floor(remainingDue / pendingCount);
      pendingIndices.forEach((pIdx, i) => {
        const isLast = i === pendingCount - 1;
        const amt = isLast ? remainingDue - allocated : baseAmt;
        allocated += amt;
        updated[pIdx].amount = amt;
        updated[pIdx].percent = price > 0 ? Math.round((amt / price) * 100) : 0;
      });
    }

    setProjectInstallments(updated);
    setStatusMsg({
      text: `Remaining balance of ₹${remainingDue.toLocaleString('en-IN')} distributed across ${pendingCount} pending installment(s).`,
    });
  };

  const handleAddInstallmentRow = () => {
    if (!drawerProject) return;
    const price = editPrice || drawerProject.finalPrice;
    const nextNumber = projectInstallments.length + 1;
    const currentTotal = projectInstallments.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const remaining = Math.max(0, price - currentTotal);
    const percent = price > 0 ? Math.round((remaining / price) * 100) : 0;

    const newRow: ProjectInstallment = {
      installmentId: `INST-${nextNumber}`,
      installmentNumber: nextNumber,
      title: `Installment ${nextNumber}: Milestone Phase`,
      amount: remaining > 0 ? remaining : 1000,
      percent: percent,
      status: 'Pending',
      dueDate: `Milestone ${nextNumber}`,
      notes: 'Custom milestone deliverable',
    };

    setProjectInstallments([...projectInstallments, newRow]);
    setHasInstallmentsActive(true);
  };

  const handleRemoveInstallmentRow = (idx: number) => {
    const updated = projectInstallments
      .filter((_, i) => i !== idx)
      .map((item, i) => ({
        ...item,
        installmentId: `INST-${i + 1}`,
        installmentNumber: i + 1,
      }));
    setProjectInstallments(updated);
  };

  const handleUpdateInstallmentField = (
    index: number,
    field: keyof ProjectInstallment,
    value: any
  ) => {
    const price = editPrice || (drawerProject ? drawerProject.finalPrice : 1);
    const updated = [...projectInstallments];
    const item = { ...updated[index], [field]: value };

    // Calculate basis: if percentBasis is 'remaining', use remaining balance for pending installments
    const paidAmount = projectInstallments
      .filter((inst, idx) => inst.status === 'Paid' && idx !== index)
      .reduce((sum, inst) => sum + (Number(inst.amount) || 0), 0);
    const remainingBalance = Math.max(1, price - paidAmount);
    const calcBasis = percentBasis === 'remaining' && item.status !== 'Paid' ? remainingBalance : price;

    if (field === 'amount') {
      const numAmt = Number(value) || 0;
      item.amount = numAmt;
      item.percent = calcBasis > 0 ? Math.round((numAmt / calcBasis) * 100) : 0;
    } else if (field === 'percent') {
      const numPct = Number(value) || 0;
      item.percent = numPct;
      item.amount = Math.round((calcBasis * numPct) / 100);
    }

    updated[index] = item;
    setProjectInstallments(updated);
  };

  const handleToggleInstallmentStatus = (index: number) => {
    const updated = [...projectInstallments];
    const current = updated[index];
    if (current.status === 'Paid') {
      current.status = 'Pending';
      current.paidAt = undefined;
    } else {
      current.status = 'Paid';
      current.paidAt = new Date().toISOString();
      if (!current.utr) {
        current.utr = `ADM-VERIFIED-${Math.floor(100000 + Math.random() * 900000)}`;
      }
    }
    updated[index] = current;
    setProjectInstallments(updated);
  };

  const handleDistributeEvenly = () => {
    if (!drawerProject || projectInstallments.length === 0) return;
    const paidAmount = projectInstallments
      .filter((i) => i.status === 'Paid')
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    if (paidAmount > 0) {
      handleDistributeRemainingBalance();
      return;
    }

    const price = editPrice || drawerProject.finalPrice;
    const count = projectInstallments.length;
    const baseAmt = Math.floor(price / count);
    const basePct = Math.floor(100 / count);

    const updated = projectInstallments.map((inst, i) => {
      const isLast = i === count - 1;
      const amt = isLast ? price - baseAmt * (count - 1) : baseAmt;
      const pct = isLast ? 100 - basePct * (count - 1) : basePct;
      return {
        ...inst,
        amount: amt,
        percent: pct,
      };
    });

    setProjectInstallments(updated);
    setStatusMsg({ text: `Installment amounts distributed evenly to match ₹${price.toLocaleString('en-IN')}.` });
  };

  const handleSaveInstallmentPlan = async () => {
    if (!drawerProject) return;
    const price = editPrice || drawerProject.finalPrice;
    const totalInstAmt = projectInstallments.reduce((s, i) => s + (Number(i.amount) || 0), 0);

    if (hasInstallmentsActive && projectInstallments.length > 0 && Math.abs(totalInstAmt - price) > 10) {
      if (!confirm(`Warning: The sum of installments (₹${totalInstAmt.toLocaleString('en-IN')}) does not match the project total price (₹${price.toLocaleString('en-IN')}). Do you want to proceed and save anyway?`)) {
        return;
      }
    }

    const updated = await SidTechDatabase.updateProjectInstallments(
      drawerProject.projectId,
      hasInstallmentsActive ? projectInstallments : [],
      hasInstallmentsActive
    );

    if (updated) {
      setDrawerProject(updated);
      setEditAmountPaid(updated.amountPaid);
      setEditAmountDue(updated.amountDue);
      setStatusMsg({ text: 'Project installment schedule updated in Database successfully!' });
      onRefresh();
    } else {
      setStatusMsg({ text: 'Failed to update installment schedule.', error: true });
    }
  };

  const handlePriceChange = (val: number) => {
    setEditPrice(val);
    setEditAmountDue(Math.max(0, val - editAmountPaid));
    setEditCommissionAmount(Math.round((val * editCommissionPercent) / 100));
  };

  const handlePaidChange = (val: number) => {
    setEditAmountPaid(val);
    setEditAmountDue(Math.max(0, editPrice - val));
  };

  const handleCommissionPercentChange = (val: number) => {
    setEditCommissionPercent(val);
    setEditCommissionAmount(Math.round((editPrice * val) / 100));
  };

  const handleSaveFullOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drawerProject) return;

    const updates: Partial<Project> = {
      finalPrice: Number(editPrice) || 0,
      advancePercent: Number(editAdvancePercent) || 0,
      advanceRequired: Math.round(((Number(editPrice) || 0) * (Number(editAdvancePercent) || 0)) / 100),
      amountPaid: Number(editAmountPaid) || 0,
      amountDue: Number(editAmountDue) || 0,
      commissionPercent: Number(editCommissionPercent) || 0,
      commissionAmount: Number(editCommissionAmount) || 0,
      clientName: editClientName.trim(),
      clientMobile: editClientMobile.trim(),
      serviceName: editServiceName.trim(),
      status: editStatus,
      demoUrl: demoUrlInput.trim() || undefined,
      finalUrl: finalUrlInput.trim() || undefined,
      requirementNotes: editRequirementNotes.trim(),
      certificateNumber: editCertNumber.trim() || undefined,
    };

    const updated = await SidTechDatabase.updateProjectFull(drawerProject.projectId, updates);
    if (updated) {
      setDrawerProject(updated);
      setStatusMsg({ text: 'Order details and financials updated in Database successfully!' });
      onRefresh();
    } else {
      setStatusMsg({ text: 'Failed to update order.', error: true });
    }
  };

  const handleAcceptProject = async () => {
    if (!drawerProject) return;
    const updated = await SidTechDatabase.acceptProject(drawerProject.projectId, editPrice, editAdvancePercent);
    if (updated) {
      setDrawerProject(updated);
      setStatusMsg({ text: 'Project accepted! Status changed to Accepted in Database.' });
      onRefresh();
    }
  };

  const handleSaveDemoUrl = async () => {
    if (!drawerProject || !demoUrlInput.trim()) return;
    const updated = await SidTechDatabase.setDemoUrl(drawerProject.projectId, demoUrlInput.trim());
    if (updated) {
      setDrawerProject(updated);
      setStatusMsg({ text: 'Live Demo URL published! Franchise can preview inside sandboxed iframe.' });
      onRefresh();
    }
  };

  const handleDeliverProject = async () => {
    if (!drawerProject) return;
    if (!finalUrlInput.trim()) {
      setStatusMsg({ text: 'Please enter the live final delivery URL.', error: true });
      return;
    }
    const res = await SidTechDatabase.markDelivered(drawerProject.projectId, finalUrlInput.trim());
    if (res.success && res.project) {
      setDrawerProject(res.project);
      setStatusMsg({ text: 'Project Delivered! Commission credited to wallet & completion certificate issued in Database.' });
      onRefresh();
    } else {
      setStatusMsg({ text: res.message, error: true });
    }
  };

  const handleRejectProject = async () => {
    if (!drawerProject) return;
    await SidTechDatabase.rejectProject(drawerProject.projectId, rejectReason);
    setDrawerProject(null);
    onRefresh();
  };

  const filteredProjects = projects.filter((p) => {
    if (filterFranchiseId && p.franchiseId !== filterFranchiseId) return false;
    if (activeTab === 'New' && p.status !== 'New') return false;
    if (activeTab === 'Accepted' && p.status !== 'Accepted') return false;
    if (activeTab === 'Processing' && p.status !== 'Processing' && p.status !== 'DemoReady') return false;
    if (activeTab === 'Delivered' && p.status !== 'Delivered') return false;

    const matchesSearch =
      p.clientName.toLowerCase().includes(search.toLowerCase()) ||
      p.clientMobile.includes(search) ||
      p.projectId.toLowerCase().includes(search.toLowerCase()) ||
      p.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      p.franchiseId.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#12294A] flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-[#E86A17]" />
            Projects & Order Fulfillment Control
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Accept client orders, configure delivery URLs, and approve completion certificates in Database
          </p>
        </div>

        {/* Search & Tabs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs w-full sm:w-auto overflow-x-auto">
            {(['All', 'New', 'Accepted', 'Processing', 'Delivered'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex-shrink-0 cursor-pointer ${
                  activeTab === tab
                    ? 'bg-white text-slate-800 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
            />
          </div>
        </div>
      </div>

      {/* Table of Orders */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#12294A] text-white font-semibold">
              <tr>
                <th className="py-3 px-4">Project ID</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Service & Client</th>
                <th className="py-3 px-4">Financials</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No projects found for the selected filter.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => {
                  const franchise = franchises.find((f) => f.franchiseId === p.franchiseId);
                  return (
                    <tr key={p.projectId} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-[#12294A]">
                        {p.projectId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">
                          {franchise?.branchName || p.franchiseId}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{p.franchiseId}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{p.serviceName}</div>
                        <div className="text-slate-500 text-[11px]">
                          Client: <strong className="text-slate-700">{p.clientName}</strong> ({p.clientMobile})
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-slate-800">₹{p.finalPrice.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-slate-400">
                          Paid: <span className="text-emerald-600 font-semibold">₹{p.amountPaid.toLocaleString('en-IN')}</span> | Due: <span className="text-rose-500 font-semibold">₹{p.amountDue.toLocaleString('en-IN')}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <StatusChip status={p.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openDrawer(p, 'editor')}
                            className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#E86A17] border border-orange-200 rounded-lg font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
                            title="Edit Order, Price, Paid, Due & Franchise Earning"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => openDrawer(p, 'lifecycle')}
                            className="px-3 py-1.5 bg-[#12294A] hover:bg-[#0c1c33] text-white rounded-lg font-bold text-xs shadow-xs transition cursor-pointer"
                          >
                            Manage
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail / Edit Drawer Modal */}
      {drawerProject && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setDrawerProject(null);
          }}
          className="fixed inset-0 z-50 overflow-y-auto overscroll-contain p-2 sm:p-4 bg-slate-900/75 backdrop-blur-xs flex items-start justify-center animate-in fade-in duration-150"
        >
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto sm:my-8 flex flex-col">
            <div className="bg-[#12294A] px-6 py-4 text-white flex items-center justify-between border-b-2 border-[#E86A17]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-[#E86A17] text-white px-2 py-0.5 rounded">
                    {drawerProject.projectId}
                  </span>
                  <h3 className="font-bold text-base text-white">{drawerProject.serviceName}</h3>
                </div>
                <p className="text-xs text-orange-200 mt-0.5">
                  Client: {drawerProject.clientName} ({drawerProject.clientMobile}) • Branch: {drawerProject.franchiseId}
                </p>
              </div>
              <button
                onClick={() => setDrawerProject(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDrawerTab('lifecycle')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    drawerTab === 'lifecycle'
                      ? 'bg-white text-[#12294A] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-[#E86A17]" />
                  <span>Workflow & Delivery</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerTab('installments')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    drawerTab === 'installments'
                      ? 'bg-white text-[#12294A] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-[#E86A17]" />
                  <span>Installment Plan & Milestones</span>
                  {hasInstallmentsActive && projectInstallments.length > 0 && (
                    <span className="bg-[#E86A17] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                      {projectInstallments.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerTab('editor')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    drawerTab === 'editor'
                      ? 'bg-white text-[#12294A] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#E86A17]" />
                  <span>Edit Financials, Earnings & Order</span>
                </button>
              </div>
              <StatusChip status={drawerProject.status} size="sm" />
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {statusMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium ${
                    statusMsg.error
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {statusMsg.text}
                </div>
              )}

              {drawerTab === 'lifecycle' && (
                <div className="space-y-5">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                    <span className="text-slate-400 block font-semibold mb-1">
                      Client Requirement Notes:
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {drawerProject.requirementNotes || 'Standard catalog package requested without extra notes.'}
                    </p>
                  </div>

                  {drawerProject.status === 'New' && (
                    <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 text-sm font-bold text-[#E86A17]">
                        <Clock className="w-4 h-4" />
                        <span>Stage 1: Review & Accept Order in Database</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Confirm or adjust final agreed price and mandatory advance deposit percentage for this project.
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Agreed Final Price (₹)
                          </label>
                          <input
                            type="number"
                            min={500}
                            value={editPrice}
                            onChange={(e) => setEditPrice(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold font-mono text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Advance Deposit Required (%)
                          </label>
                          <input
                            type="number"
                            min={10}
                            max={100}
                            value={editAdvancePercent}
                            onChange={(e) => setEditAdvancePercent(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs font-semibold text-[#12294A]">
                          Advance Demanded: ₹{Math.round((editPrice * editAdvancePercent) / 100).toLocaleString('en-IN')}
                        </span>
                        <button
                          type="button"
                          onClick={handleAcceptProject}
                          className="px-4 py-2 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                        >
                          Accept Project (Turn Orange)
                        </button>
                      </div>
                    </div>
                  )}

                  {(drawerProject.status === 'Accepted' ||
                    drawerProject.status === 'Processing' ||
                    drawerProject.status === 'DemoReady') && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-bold text-blue-900">
                          <Layers className="w-4 h-4 text-blue-600" />
                          <span>Stage 2 & 3: Development & Sandboxed Demo</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-700">
                          Paid: ₹{drawerProject.amountPaid.toLocaleString('en-IN')} / Due: ₹{drawerProject.amountDue.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Live Demo URL (Rendered in franchise sandboxed iframe - raw link hidden)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            value={demoUrlInput}
                            onChange={(e) => setDemoUrlInput(e.target.value)}
                            placeholder="https://preview-instance.sidtech366.live/test-site"
                            className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                          />
                          <button
                            type="button"
                            onClick={handleSaveDemoUrl}
                            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                          >
                            Publish Demo
                          </button>
                        </div>
                      </div>

                      {drawerProject.demoUrl && (
                        <div className="pt-2">
                          <SandboxDemoPreview
                            demoUrl={drawerProject.demoUrl}
                            serviceName={drawerProject.serviceName}
                            projectId={drawerProject.projectId}
                            clientName={drawerProject.clientName}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {drawerProject.status !== 'Delivered' && drawerProject.status !== 'Rejected' && (
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                          <Award className="w-4 h-4 text-emerald-600" />
                          <span>Stage 4: Final Production Delivery & Certificate</span>
                        </div>
                        <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                          drawerProject.amountDue === 0 ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {drawerProject.amountDue === 0 ? '✓ Fully Paid (₹0 Due)' : `₹${drawerProject.amountDue.toLocaleString('en-IN')} Pending`}
                        </span>
                      </div>
                      {drawerProject.amountDue > 0 ? (
                        <p className="text-xs text-rose-700 font-medium">
                          Delivery locked: The client/branch still has a pending balance of ₹{drawerProject.amountDue.toLocaleString('en-IN')}. Verify full payments first.
                        </p>
                      ) : (
                        <p className="text-xs text-emerald-700">
                          Full payment received! Enter the final production domain to unlock copyable URLs, issue completion certificate, and credit ₹{drawerProject.commissionAmount.toLocaleString('en-IN')} commission to franchise wallet.
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          value={finalUrlInput}
                          onChange={(e) => setFinalUrlInput(e.target.value)}
                          placeholder="https://clientdomain.com or final deploy link"
                          className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                        />
                        <button
                          type="button"
                          onClick={handleDeliverProject}
                          disabled={drawerProject.amountDue > 0}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md disabled:opacity-40 transition cursor-pointer"
                        >
                          Mark Delivered in Database
                        </button>
                      </div>
                    </div>
                  )}

                  {drawerProject.status === 'Delivered' && (
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-800 text-xs flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Project Delivered
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowCertModal(true)}
                          className="text-xs font-bold text-[#E86A17] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Award className="w-3.5 h-3.5" /> View Certificate
                        </button>
                      </div>
                      <div className="text-xs text-slate-700">
                        Delivered URL: <a href={drawerProject.finalUrl} target="_blank" rel="noreferrer" className="text-blue-600 font-semibold underline">{drawerProject.finalUrl}</a>
                      </div>
                    </div>
                  )}

                  {drawerProject.status !== 'Delivered' && drawerProject.status !== 'Rejected' && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      {!showRejectForm ? (
                        <button
                          type="button"
                          onClick={() => setShowRejectForm(true)}
                          className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                        >
                          Reject This Booking
                        </button>
                      ) : (
                        <div className="w-full flex items-center gap-2">
                          <input
                            type="text"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Reason for rejecting project..."
                            className="flex-1 px-3 py-1.5 bg-white border border-rose-300 rounded-lg text-xs"
                          />
                          <button
                            type="button"
                            onClick={handleRejectProject}
                            className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Confirm Reject
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {drawerTab === 'editor' && (
                <form onSubmit={handleSaveFullOrder} className="space-y-5">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold text-[#12294A] flex items-center gap-1.5">
                        <Wallet className="w-4 h-4 text-[#E86A17]" />
                        <span>Order Financials & Franchise Commission Earning</span>
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                        Admin Live Edit (Database)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Agreed Price (₹)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={editPrice}
                          onChange={(e) => handlePriceChange(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Amount Paid (₹)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={editAmountPaid}
                          onChange={(e) => handlePaidChange(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-emerald-700 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Amount Due (₹)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={editAmountDue}
                          onChange={(e) => setEditAmountDue(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-rose-700 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Advance %
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={editAdvancePercent}
                            onChange={(e) => setEditAdvancePercent(Number(e.target.value))}
                            className="w-14 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-800"
                          />
                          <span className="text-[10px] text-slate-500 font-mono">
                            % (₹{Math.round((editPrice * editAdvancePercent) / 100).toLocaleString('en-IN')})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50/60 p-3 rounded-lg border border-amber-200/80">
                      <div>
                        <label className="block text-[11px] font-bold text-[#12294A] mb-1 flex items-center gap-1">
                          <Percent className="w-3.5 h-3.5 text-[#E86A17]" />
                          <span>Franchise Commission %</span>
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={editCommissionPercent}
                          onChange={(e) => handleCommissionPercentChange(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#12294A] mb-1 flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Franchise Earning Amount (₹)</span>
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={editCommissionAmount}
                          onChange={(e) => setEditCommissionAmount(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-mono font-bold text-emerald-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Order Lifecycle Status
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as ProjectStatus)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                      >
                        <option value="New">New (Pending Review)</option>
                        <option value="Accepted">Accepted (Advance Awaiting)</option>
                        <option value="Processing">Processing (In Development)</option>
                        <option value="DemoReady">DemoReady (Preview Link Active)</option>
                        <option value="Delivered">Delivered (Completed & Certificate Active)</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Completion Certificate Number
                      </label>
                      <input
                        type="text"
                        value={editCertNumber}
                        onChange={(e) => setEditCertNumber(e.target.value)}
                        placeholder="e.g. ST-CERT-100452"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Live Demo URL (Sandboxed)
                      </label>
                      <input
                        type="url"
                        value={demoUrlInput}
                        onChange={(e) => setDemoUrlInput(e.target.value)}
                        placeholder="https://preview.example.com"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Final Production URL
                      </label>
                      <input
                        type="url"
                        value={finalUrlInput}
                        onChange={(e) => setFinalUrlInput(e.target.value)}
                        placeholder="https://clientdomain.com"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Client Name
                      </label>
                      <input
                        type="text"
                        value={editClientName}
                        onChange={(e) => setEditClientName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Client Phone
                      </label>
                      <input
                        type="tel"
                        value={editClientMobile}
                        onChange={(e) => setEditClientMobile(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Service Title
                      </label>
                      <input
                        type="text"
                        value={editServiceName}
                        onChange={(e) => setEditServiceName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setDrawerTab('lifecycle')}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                    >
                      Back to Workflow
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save All Order Changes to Database</span>
                    </button>
                  </div>
                </form>
              )}

              {drawerTab === 'installments' && (
                <div className="space-y-5">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-[#E86A17] flex-shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#12294A]">Installment Payment System for Project</h4>
                        <p className="text-xs text-slate-500">
                          Configure multi-part milestone payments, token advance and balance collections for {drawerProject.projectId}.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label htmlFor="toggle-inst-active" className="text-xs font-semibold text-slate-700 cursor-pointer">
                        Enable Installment System:
                      </label>
                      <input
                        id="toggle-inst-active"
                        type="checkbox"
                        checked={hasInstallmentsActive}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setHasInstallmentsActive(val);
                          if (val && projectInstallments.length === 0) {
                            handleActivatePresetInstallments(3);
                          }
                        }}
                        className="w-4 h-4 rounded text-[#E86A17] focus:ring-[#E86A17] cursor-pointer"
                      />
                    </div>
                  </div>

                  {!hasInstallmentsActive ? (
                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div className="max-w-md mx-auto">
                        <h4 className="font-bold text-sm text-slate-800">Installments Currently Inactive for this Project</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          This project is currently on a standard payment mode (Advance ₹{drawerProject.advanceRequired.toLocaleString('en-IN')} + Balance ₹{drawerProject.amountDue.toLocaleString('en-IN')}).
                          Activate an installment schedule below to split into multiple milestone payments.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => handleActivatePresetInstallments(2)}
                          className="px-3.5 py-2 bg-[#12294A] hover:bg-[#0c1c33] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Split className="w-3.5 h-3.5 text-[#E86A17]" />
                          <span>Activate 2 Installments (50% / 50%)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleActivatePresetInstallments(3)}
                          className="px-3.5 py-2 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <Split className="w-3.5 h-3.5 text-white" />
                          <span>Activate 3 Installments (40% / 30% / 30%)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleActivatePresetInstallments(4)}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Split className="w-3.5 h-3.5 text-white" />
                          <span>Activate 4 Installments (25% each)</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Metric cards */}
                      {(() => {
                        const targetPrice = editPrice || drawerProject.finalPrice;
                        const sumAmount = projectInstallments.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
                        const paidAmount = projectInstallments
                          .filter((i) => i.status === 'Paid')
                          .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
                        const paidCount = projectInstallments.filter((i) => i.status === 'Paid').length;
                        const mismatch = Math.abs(sumAmount - targetPrice);

                        return (
                          <>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs">
                                <span className="text-slate-400 block text-[11px]">Agreed Total Price</span>
                                <span className="text-sm font-bold font-mono text-[#12294A]">
                                  ₹{targetPrice.toLocaleString('en-IN')}
                                </span>
                              </div>
                              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs">
                                <span className="text-slate-400 block text-[11px]">Total Installments</span>
                                <span className="text-sm font-bold font-mono text-slate-800">
                                  {projectInstallments.length} Milestones
                                </span>
                              </div>
                              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs">
                                <span className="text-emerald-700 block text-[11px] font-medium">Installments Paid</span>
                                <span className="text-sm font-bold font-mono text-emerald-800">
                                  {paidCount} of {projectInstallments.length} (₹{paidAmount.toLocaleString('en-IN')})
                                </span>
                              </div>
                              <div className="bg-orange-50 border border-orange-200 p-3 rounded-xl text-xs">
                                <span className="text-orange-700 block text-[11px] font-medium">Remaining Due</span>
                                <span className="text-sm font-bold font-mono text-[#E86A17]">
                                  ₹{Math.max(0, targetPrice - paidAmount).toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>

                            {((editAmountPaid > 0) || (drawerProject.amountPaid > 0)) && (
                              <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                                <div>
                                  <div className="font-bold text-blue-900 flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-blue-600" />
                                    Advance Received: ₹{(editAmountPaid || drawerProject.amountPaid).toLocaleString('en-IN')}
                                  </div>
                                  <p className="text-slate-600 mt-0.5">
                                    Remaining project balance is <strong>₹{Math.max(0, targetPrice - (editAmountPaid || drawerProject.amountPaid)).toLocaleString('en-IN')}</strong>. Installments below are automatically distributed across this balance.
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <button
                                    type="button"
                                    onClick={handleDistributeRemainingBalance}
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs transition flex items-center gap-1.5 text-xs cursor-pointer"
                                  >
                                    <Split className="w-3.5 h-3.5 text-blue-200" />
                                    <span>Distribute Remaining Balance</span>
                                  </button>
                                </div>
                              </div>
                            )}

                            {mismatch > 1 && (
                              <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                                  <span>
                                    Sum of installments (₹{sumAmount.toLocaleString('en-IN')}) does not match project total (₹{targetPrice.toLocaleString('en-IN')}). Difference: ₹{mismatch.toLocaleString('en-IN')}.
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={handleDistributeEvenly}
                                  className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold rounded-lg text-[11px] cursor-pointer"
                                >
                                  Auto-Distribute Evenly
                                </button>
                              </div>
                            )}

                            {/* Toolbar */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={handleAddInstallmentRow}
                                  className="px-3 py-1.5 bg-[#12294A] hover:bg-[#0c1c33] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add Milestone Step</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={handleDistributeEvenly}
                                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border border-slate-200"
                                >
                                  <Split className="w-3.5 h-3.5 text-slate-500" />
                                  <span>{paidAmount > 0 ? 'Auto-Split Remaining' : 'Auto Equal Split'}</span>
                                </button>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
                                  <button
                                    type="button"
                                    onClick={() => setPercentBasis('remaining')}
                                    className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer ${
                                      percentBasis === 'remaining' ? 'bg-[#12294A] text-white' : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                  >
                                    % of Balance
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setPercentBasis('total')}
                                    className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer ${
                                      percentBasis === 'total' ? 'bg-[#12294A] text-white' : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                  >
                                    % of Total
                                  </button>
                                </div>

                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                  <span className="text-[11px] font-medium hidden sm:inline">Presets:</span>
                                  <button
                                    type="button"
                                    onClick={() => handleActivatePresetInstallments(2)}
                                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold cursor-pointer border border-slate-200"
                                  >
                                    {paidAmount > 0 ? '1 Final Step' : '2 Parts'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleActivatePresetInstallments(3)}
                                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold cursor-pointer border border-slate-200"
                                  >
                                    {paidAmount > 0 ? '2 Milestones' : '3 Parts'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleActivatePresetInstallments(4)}
                                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold cursor-pointer border border-slate-200"
                                  >
                                    {paidAmount > 0 ? '3 Milestones' : '4 Parts'}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Installments Table */}
                            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-[#12294A] text-white font-semibold">
                                  <tr>
                                    <th className="py-2.5 px-3 w-12 text-center">#</th>
                                    <th className="py-2.5 px-3">Milestone Title</th>
                                    <th className="py-2.5 px-3 w-28">Amount (₹)</th>
                                    <th className="py-2.5 px-3 w-24">Share % ({percentBasis === 'remaining' ? 'Balance' : 'Total'})</th>
                                    <th className="py-2.5 px-3">Due Milestone / Condition</th>
                                    <th className="py-2.5 px-3 w-32">Status</th>
                                    <th className="py-2.5 px-3">Payment Info</th>
                                    <th className="py-2.5 px-3 w-14 text-center">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                  {projectInstallments.map((inst, idx) => (
                                    <tr key={inst.installmentId || idx} className="hover:bg-slate-50/80 transition">
                                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">
                                        {inst.installmentNumber || idx + 1}
                                      </td>
                                      <td className="py-2.5 px-3">
                                        <input
                                          type="text"
                                          value={inst.title}
                                          onChange={(e) => handleUpdateInstallmentField(idx, 'title', e.target.value)}
                                          placeholder="e.g. Installment 1: Advance Token"
                                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#E86A17]"
                                        />
                                      </td>
                                      <td className="py-2.5 px-3">
                                        <input
                                          type="number"
                                          min={0}
                                          value={inst.amount}
                                          onChange={(e) => handleUpdateInstallmentField(idx, 'amount', e.target.value)}
                                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-[#E86A17]"
                                        />
                                      </td>
                                      <td className="py-2.5 px-3">
                                        <div className="flex items-center gap-1">
                                          <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={inst.percent || 0}
                                            onChange={(e) => handleUpdateInstallmentField(idx, 'percent', e.target.value)}
                                            className="w-12 px-1.5 py-1 bg-white border border-slate-300 rounded text-xs font-mono text-center text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#E86A17]"
                                          />
                                          <span className="text-[10px] text-slate-400">%</span>
                                        </div>
                                      </td>
                                      <td className="py-2.5 px-3">
                                        <input
                                          type="text"
                                          value={inst.dueDate || ''}
                                          onChange={(e) => handleUpdateInstallmentField(idx, 'dueDate', e.target.value)}
                                          placeholder="e.g. Upon Booking / Demo"
                                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-[#E86A17]"
                                        />
                                      </td>
                                      <td className="py-2.5 px-3">
                                        <select
                                          value={inst.status}
                                          onChange={(e) => handleUpdateInstallmentField(idx, 'status', e.target.value as InstallmentStatus)}
                                          className={`w-full px-2 py-1 rounded text-xs font-bold border focus:outline-hidden ${
                                            inst.status === 'Paid'
                                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                              : inst.status === 'Processing'
                                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                                              : 'bg-amber-50 text-amber-800 border-amber-300'
                                          }`}
                                        >
                                          <option value="Pending">Pending</option>
                                          <option value="Processing">Processing</option>
                                          <option value="Paid">Paid</option>
                                        </select>
                                      </td>
                                      <td className="py-2.5 px-3">
                                        {inst.status === 'Paid' ? (
                                          <div className="text-[11px] text-emerald-700 font-mono flex items-center gap-1.5">
                                            <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                            <div>
                                              <span className="font-semibold block truncate max-w-[120px]" title={inst.utr || 'Verified'}>
                                                {inst.utr || 'Verified'}
                                              </span>
                                              <span className="text-[10px] text-slate-400 block">
                                                {inst.paidAt ? new Date(inst.paidAt).toLocaleDateString('en-IN') : 'Confirmed'}
                                              </span>
                                            </div>
                                          </div>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => handleToggleInstallmentStatus(idx)}
                                            className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold rounded transition cursor-pointer"
                                          >
                                            Mark Paid
                                          </button>
                                        )}
                                      </td>
                                      <td className="py-2.5 px-3 text-center">
                                        {projectInstallments.length > 1 && (
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveInstallmentRow(idx)}
                                            className="text-slate-400 hover:text-rose-600 p-1 rounded transition cursor-pointer"
                                            title="Delete installment row"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Save installments action bar */}
                            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <p className="text-xs text-slate-500">
                                Changes will be saved directly in the real-time Database for project <strong>{drawerProject.projectId}</strong>.
                              </p>
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => setDrawerTab('lifecycle')}
                                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                                >
                                  Back to Workflow
                                </button>
                                <button
                                  type="button"
                                  onClick={handleSaveInstallmentPlan}
                                  className="px-5 py-2.5 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Save className="w-4 h-4" />
                                  <span>Save Installment Plan to Database</span>
                                </button>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showCertModal && drawerProject && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCertModal(false);
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
                onClick={() => setShowCertModal(false)}
                className="px-3 py-1 bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            <CertificatePreview
              project={drawerProject}
              franchise={franchises.find((f) => f.franchiseId === drawerProject.franchiseId)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
