import React from 'react';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { Franchise } from '../../types/database';
import { IDCardPreview } from '../generators/IDCardPreview';

interface FranchiseIDCardProps {
  franchise: Franchise;
}

export const FranchiseIDCard: React.FC<FranchiseIDCardProps> = ({ franchise }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#12294A] flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#E86A17]" />
            Official SidTech Branch ID Card
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Your authorized identity credential. Present this to business clients as verified SidTech partner.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-xl text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>ST AUTHORISED PARTNER</span>
        </div>
      </div>

      {/* ID Card Display Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col items-center justify-center">
        <IDCardPreview franchise={franchise} />
      </div>
    </div>
  );
};
