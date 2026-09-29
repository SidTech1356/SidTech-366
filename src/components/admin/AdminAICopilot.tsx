import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Wand2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SidTechDatabase } from '../../services/storage';

interface AdminAICopilotProps {
  currentModule: string;
  onRefresh: () => void;
}

export const AdminAICopilot: React.FC<AdminAICopilotProps> = ({
  currentModule,
  onRefresh,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    actionType?: string;
  } | null>(null);

  const moduleNames: Record<string, string> = {
    overview: 'Executive Dashboard',
    approvals: 'Franchise Approvals',
    franchises: 'Franchise Network',
    services: 'Service Catalog',
    projects: 'Projects & Deliveries',
    payments: 'Payment Verification',
    settings: 'System & UPI Settings',
    payouts: 'Payouts Manager',
    firestore: 'Database Explorer',
  };

  const quickPromptsByModule: Record<string, string[]> = {
    approvals: [
      'Sabhi pending franchise applications approve kar do',
      'Pending branch ST366-0002 ko approve kar do',
    ],
    franchises: [
      'ST366-0001 ke wallet me 5000 rupaye add kar do',
      'Branch ST366-0001 ka wallet balance 10000 set kar do',
      'ST366-0001 ka mobile number 9876500000 update kar do',
    ],
    services: [
      'Ek naya service add karo: AI Automation Bot, price 35000, advance 30%',
      'Single Page Website service ka price 1800 kar do',
      'E-commerce Website ka commission 15% kar do',
    ],
    projects: [
      'Project PRJ-0002 ko DemoReady mark kar do with demo URL https://demo.sidtech.in',
      'Project PRJ-0001 ko Delivered mark kar do',
      'Sharma Sarees project ko Accepted mark kar do',
    ],
    payments: [
      'Sabhi submitted payments ek saath verify kar do',
      'Payment PAY-0001 verify kar do',
    ],
    settings: [
      'Company UPI ID badal kar sidtech@icici kar do',
      'Support phone number +91 9988776655 set kar do',
      'Default advance percentage 30% kar do',
    ],
    payouts: [
      'PO-0001 payout ko Paid mark kar do with ref UTR998877',
      'Pending payouts ko processing mark kar do',
    ],
    overview: [
      'Sabhi pending applications approve kar do',
      'Sabhi submitted payments verify kar do',
      'ST366-0001 ke wallet me 5000 credit kar do',
    ],
    firestore: [
      'Sabhi pending applications approve kar do',
      'Ek naya service Mobile App Pro price 25000 add karo',
    ],
  };

  const currentPrompts = quickPromptsByModule[currentModule] || quickPromptsByModule.overview;

  const parsePromptFallback = (text: string, activeMod: string) => {
    const lower = text.toLowerCase();
    if (
      (lower.includes('approve') || lower.includes('pass')) &&
      (lower.includes('all') || lower.includes('sabhi') || lower.includes('saare') || lower.includes('sab')) &&
      (lower.includes('pending') || lower.includes('franchise') || lower.includes('application'))
    ) {
      return {
        actionType: 'APPROVE_ALL_PENDING',
        payload: {},
        explanation: 'Approving all pending franchise applications',
      };
    }
    if (lower.includes('approve') && (lower.includes('st366-') || lower.includes('franchise') || lower.includes('branch'))) {
      const match = text.match(/st366-\d+/i) || text.match(/st\d+/i);
      const franchiseId = match ? match[0].toUpperCase() : 'ST366-0002';
      return {
        actionType: 'APPROVE_FRANCHISE',
        payload: { franchiseId },
        explanation: `Approving franchise application for ${franchiseId}`,
      };
    }
    if (
      (lower.includes('verify') || lower.includes('approve')) &&
      (lower.includes('all') || lower.includes('sabhi') || lower.includes('saare') || lower.includes('sab')) &&
      (lower.includes('payment') || lower.includes('utr'))
    ) {
      return {
        actionType: 'VERIFY_ALL_PAYMENTS',
        payload: {},
        explanation: 'Verifying all submitted payments',
      };
    }
    if (lower.includes('verify') && (lower.includes('pay-') || lower.includes('payment'))) {
      const match = text.match(/pay-\d+/i);
      const paymentId = match ? match[0].toUpperCase() : 'PAY-0001';
      return {
        actionType: 'VERIFY_PAYMENT',
        payload: { paymentId },
        explanation: `Verifying payment ${paymentId}`,
      };
    }
    if (lower.includes('wallet') || lower.includes('credit') || lower.includes('balance') || lower.includes('rupaye') || lower.includes('rs') || lower.includes('inr')) {
      const amtMatch = text.match(/\d{3,7}/);
      const amount = amtMatch ? parseInt(amtMatch[0], 10) : 5000;
      const fMatch = text.match(/st366-\d+/i);
      const franchiseId = fMatch ? fMatch[0].toUpperCase() : 'ST366-0001';
      const isSet = lower.includes('set') || lower.includes('barabar');
      return {
        actionType: 'UPDATE_WALLET',
        payload: {
          franchiseId,
          amount,
          mode: isSet ? 'set' : 'add',
          note: 'Admin AI Prompt Adjustment',
        },
        explanation: `${isSet ? 'Setting' : 'Adding'} ₹${amount} to wallet of ${franchiseId}`,
      };
    }
    if (lower.includes('add') && (lower.includes('service') || lower.includes('package') || lower.includes('karo'))) {
      const priceMatch = text.match(/price\s*(\d+)/i) || text.match(/(\d{4,6})/);
      const price = priceMatch ? parseInt(priceMatch[1] || priceMatch[0], 10) : 25000;
      let serviceName = 'Custom Digital Solution';
      if (lower.includes('ai') || lower.includes('bot')) serviceName = 'AI Chatbot & Automation Bot';
      else if (lower.includes('app')) serviceName = 'Mobile Application Suite';
      else if (lower.includes('website')) serviceName = 'Custom Portal Development';
      return {
        actionType: 'ADD_SERVICE',
        payload: {
          serviceName,
          price,
          advancePercent: 30,
          commissionPercent: 12,
          category: 'Software',
          description: `High-value enterprise ${serviceName} delivered by SidTech.`,
        },
        explanation: `Adding new service "${serviceName}" with price ₹${price}`,
      };
    }
    if (lower.includes('srv-') || (lower.includes('service') && lower.includes('price'))) {
      const sMatch = text.match(/srv-\d+/i);
      const serviceId = sMatch ? sMatch[0].toUpperCase() : 'SRV-0001';
      const priceMatch = text.match(/(\d{3,6})/);
      const price = priceMatch ? parseInt(priceMatch[0], 10) : 2000;
      return {
        actionType: 'UPDATE_SERVICE',
        payload: { serviceId, price },
        explanation: `Updating service ${serviceId} price to ₹${price}`,
      };
    }
    if (lower.includes('prj-') || lower.includes('project')) {
      const pMatch = text.match(/prj-\d+/i);
      const projectId = pMatch ? pMatch[0].toUpperCase() : 'PRJ-0002';
      let status = 'Delivered';
      if (lower.includes('demoready') || lower.includes('demo')) status = 'DemoReady';
      else if (lower.includes('processing')) status = 'Processing';
      else if (lower.includes('accepted')) status = 'Accepted';
      else if (lower.includes('delivered')) status = 'Delivered';
      const urlMatch = text.match(/https?:\/\/[^\s]+/);
      return {
        actionType: 'UPDATE_PROJECT_STATUS',
        payload: {
          projectId,
          status,
          demoUrl: urlMatch ? urlMatch[0] : (status === 'DemoReady' ? 'https://demo.sidtech.in' : undefined),
        },
        explanation: `Updating project ${projectId} status to ${status}`,
      };
    }
    if (lower.includes('upi') || lower.includes('phone') || lower.includes('setting')) {
      const upiMatch = text.match(/[\w.-]+@[\w.-]+/);
      return {
        actionType: 'UPDATE_SETTINGS',
        payload: {
          companyUpi: upiMatch ? upiMatch[0] : 'sidtech@icici',
        },
        explanation: `Updating company UPI ID to ${upiMatch ? upiMatch[0] : 'sidtech@icici'}`,
      };
    }
    if (activeMod === 'approvals') {
      return {
        actionType: 'APPROVE_ALL_PENDING',
        payload: {},
        explanation: 'Approving all pending franchises in this section',
      };
    }
    return {
      actionType: 'UPDATE_WALLET',
      payload: { franchiseId: 'ST366-0001', amount: 1000, mode: 'add' },
      explanation: 'Executing wallet adjustment',
    };
  };

  const handleExecutePrompt = async (promptText: string) => {
    const clean = promptText.trim();
    if (!clean) return;
    setIsProcessing(true);
    setResult(null);

    try {
      const actionToRun = parsePromptFallback(clean, currentModule);
      const execResult = await SidTechDatabase.executeAdminAiAction(actionToRun);
      if (execResult.success) {
        setResult({
          success: true,
          message: `${actionToRun.explanation ? actionToRun.explanation + ' • ' : ''}${execResult.message}`,
          actionType: actionToRun.actionType,
        });
        setPrompt('');
        onRefresh();
      } else {
        setResult({
          success: false,
          message: execResult.message,
        });
      }
    } catch (e: unknown) {
      setResult({
        success: false,
        message: e instanceof Error ? e.message : 'Failed to process AI command. Please rephrase.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#12294A] via-[#1a3860] to-[#12294A] border-2 border-[#E86A17] rounded-2xl shadow-xl p-4 text-white mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E86A17] to-amber-500 flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm tracking-wide text-white">
                Admin AI Copilot & Operations Engine
              </h3>
              <span className="text-[10px] bg-[#E86A17] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Live
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Active Context: <strong className="text-amber-300 font-semibold">{moduleNames[currentModule] || currentModule}</strong> • Give instructions in English or Hindi to auto-update system records
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3.5 space-y-3 pt-3 border-t border-slate-700/60">
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Wand2 className="w-3 h-3 text-[#E86A17]" /> Quick Suggestions:
            </span>
            {currentPrompts.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPrompt(qp);
                  handleExecutePrompt(qp);
                }}
                disabled={isProcessing}
                className="text-[11px] bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white px-2.5 py-1 rounded-lg border border-white/15 transition cursor-pointer"
              >
                "{qp}"
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleExecutePrompt(prompt);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`Tell AI what to update in ${moduleNames[currentModule] || 'this section'}... (e.g. 'ST366-0001 ke wallet me 5000 add karo')`}
                disabled={isProcessing}
                className="w-full px-3.5 py-2.5 bg-slate-900/70 border border-slate-600 rounded-xl text-xs md:text-sm text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17] focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={isProcessing || !prompt.trim()}
              className="px-4 py-2.5 bg-[#E86A17] hover:bg-[#d45e12] disabled:opacity-50 text-white rounded-xl text-xs md:text-sm font-bold shadow transition flex items-center gap-1.5 cursor-pointer flex-shrink-0"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating System...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Execute</span>
                </>
              )}
            </button>
          </form>

          {result && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in duration-200 ${
                result.success
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/70 border-rose-500/50 text-rose-200'
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span className="font-bold block text-white text-[11px]">
                  {result.success ? 'Action Executed Successfully' : 'Could Not Execute'}
                </span>
                <p className="mt-0.5 text-xs opacity-90">{result.message}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
