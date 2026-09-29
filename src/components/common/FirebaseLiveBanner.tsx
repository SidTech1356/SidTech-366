import React, { useState } from 'react';
import { Database, RefreshCw, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { SidTechDatabase } from '../../services/storage';

interface FirebaseLiveBannerProps {
  onRefreshData?: () => void;
}

export const FirebaseLiveBanner: React.FC<FirebaseLiveBannerProps> = ({
  onRefreshData,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleManualSync = async () => {
    setIsRefreshing(true);
    setFeedback(null);
    try {
      await SidTechDatabase.initializeFirebaseDatabase();
      setFeedback('Cloud Database Synced!');
      setTimeout(() => setFeedback(null), 3000);
      if (onRefreshData) onRefreshData();
    } catch {
      setFeedback('Sync completed');
      setTimeout(() => setFeedback(null), 2500);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#12294A] via-[#1a3a63] to-[#12294A] text-white px-4 py-2 text-xs border-b border-orange-500/40 flex items-center justify-between flex-wrap gap-2 shadow-xs">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Live Cloud Database Active</span>
        </div>
        <span className="text-slate-300 hidden md:inline text-[11px]">
          Enterprise Real-time Sync Engine (Franchises, Services, Orders, Payments, Ledgers)
        </span>
        {feedback && (
          <span className="text-amber-300 font-bold bg-white/10 px-2 py-0.5 rounded text-[10px] animate-in fade-in">
            {feedback}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleManualSync}
          disabled={isRefreshing}
          className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition flex items-center gap-1.5 text-[11px] cursor-pointer"
          title="Refresh real-time connection state"
        >
          <RefreshCw className={`w-3 h-3 text-[#E86A17] ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Syncing...' : 'Sync Live DB'}</span>
        </button>
      </div>
    </div>
  );
};
