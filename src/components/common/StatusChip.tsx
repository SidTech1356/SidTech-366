import React from 'react';
import { ProjectStatus, FranchiseStatus, PaymentStatus, PayoutStatus } from '../../types/database';

interface StatusChipProps {
  status: ProjectStatus | FranchiseStatus | PaymentStatus | PayoutStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'md' }) => {
  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-300';

  switch (status) {
    case 'New':
      colorClasses = 'bg-gray-100 text-gray-700 border-gray-300';
      break;
    case 'Accepted':
      colorClasses = 'bg-orange-50 text-[#E86A17] border-orange-300 font-semibold';
      break;
    case 'Processing':
    case 'DemoReady':
      colorClasses = 'bg-blue-50 text-[#1565C0] border-blue-300 font-semibold';
      break;
    case 'Delivered':
    case 'Received':
      colorClasses = 'bg-emerald-50 text-[#2E7D32] border-emerald-300 font-semibold';
      break;
    case 'Rejected':
      colorClasses = 'bg-rose-50 text-[#C62828] border-rose-300 font-semibold';
      break;
    case 'Pending':
    case 'Requested':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-300 font-medium';
      break;
    case 'Approved':
    case 'Verified':
    case 'Paid':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-300 font-medium';
      break;
    case 'Suspended':
      colorClasses = 'bg-slate-200 text-slate-800 border-slate-400 font-medium';
      break;
    case 'Submitted':
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-300 font-medium';
      break;
    default:
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-300';
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5',
  }[size];

  const displayLabel = status === 'DemoReady' ? 'Demo Ready' : status;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${colorClasses} ${sizeClasses} tracking-wide transition shadow-xs`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {displayLabel}
    </span>
  );
};
