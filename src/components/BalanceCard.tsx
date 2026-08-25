import React, { useState } from 'react';
import { Eye, EyeOff, Send, PlusCircle, QrCode, Copy, Check, Zap, ArrowUpRight } from 'lucide-react';
import { UserProfile } from '../types';
import { formatPKR } from '../utils/formatters';

interface BalanceCardProps {
  user: UserProfile;
  onSendMoney: () => void;
  onAddMoney: () => void;
  onOpenQR: () => void;
  onOpenLimits: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  user,
  onSendMoney,
  onAddMoney,
  onOpenQR,
  onOpenLimits,
}) => {
  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [copiedRaast, setCopiedRaast] = useState<boolean>(false);

  const handleCopyRaast = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(user.raastId);
    setCopiedRaast(true);
    setTimeout(() => setCopiedRaast(false), 2000);
  };

  const limitPercentage = Math.min(100, Math.round((user.dailyUsed / user.dailyLimit) * 100));

  return (
    <div className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0E1A2E] to-[#0A111E] border border-emerald-500/20 shadow-xl text-white p-4 sm:p-6 transition-all">
      {/* Background Decorative Mesh / Subtle Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl pointer-events-none -ml-16 -mb-16" />

      {/* Top Row: Label + RAAST ID Badge */}
      <div className="flex items-center justify-between gap-2 relative z-10 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-medium text-slate-300 flex items-center gap-1.5">
            Total Available Balance
            {user.romanUrduAssisted && (
              <span className="text-[11px] text-emerald-400/90 font-normal">(Kul Raqam)</span>
            )}
          </span>
          <button
            id="toggle-balance-visibility"
            onClick={() => setShowBalance(!showBalance)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            aria-label={showBalance ? 'Hide Balance' : 'Show Balance'}
          >
            {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        {/* RAAST ID Pill */}
        <button
          id="copy-raast-id-btn"
          onClick={handleCopyRaast}
          className="group flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/50 hover:border-emerald-500 text-[11px] font-mono-numbers text-emerald-300 transition-all active:scale-95"
          title="Click to copy RAAST ID"
        >
          <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="font-semibold text-emerald-200">RAAST:</span>
          <span>{user.raastId}</span>
          {copiedRaast ? (
            <Check className="w-3 h-3 text-emerald-400 ml-0.5" />
          ) : (
            <Copy className="w-3 h-3 text-emerald-400/60 group-hover:text-emerald-300 ml-0.5" />
          )}
        </button>
      </div>

      {/* Center: Main Balance readout */}
      <div className="relative z-10 my-2">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-mono-numbers">
            {showBalance ? formatPKR(user.balance) : 'Rs. ••••••••'}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Live
          </span>
        </div>
      </div>

      {/* Daily Transfer Limit Progress */}
      <div 
        onClick={onOpenLimits}
        className="relative z-10 my-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all group"
      >
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400 flex items-center gap-1">
            Daily Transfer Limit
            {user.romanUrduAssisted && (
              <span className="text-[10px] text-slate-500">(Rozana Limit)</span>
            )}
          </span>
          <span className="font-mono-numbers text-slate-300 font-medium group-hover:text-emerald-300 transition-colors flex items-center gap-1">
            {formatPKR(user.dailyUsed, false)} / {formatPKR(user.dailyLimit, false)}
            <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400" />
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              limitPercentage > 85 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${limitPercentage}%` }}
          />
        </div>
      </div>

      {/* High-Contrast Quick Action Buttons (48px+ touch targets) */}
      <div className="relative z-10 grid grid-cols-3 gap-2.5 sm:gap-3 mt-4 pt-2 border-t border-slate-800/80">
        {/* Send Money CTA */}
        <button
          id="quick-send-money-btn"
          onClick={onSendMoney}
          className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 py-3 px-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-emerald-900/30 active:scale-95 transition-all border border-emerald-400/30"
        >
          <Send className="w-4 h-4 text-white" />
          <span>Send Money</span>
        </button>

        {/* Add Money CTA */}
        <button
          id="quick-add-money-btn"
          onClick={onAddMoney}
          className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 py-3 px-2 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-100 font-semibold text-xs sm:text-sm border border-slate-700/80 active:scale-95 transition-all hover:border-slate-600"
        >
          <PlusCircle className="w-4 h-4 text-amber-400" />
          <span>Add Money</span>
        </button>

        {/* QR Code CTA */}
        <button
          id="quick-qr-code-btn"
          onClick={onOpenQR}
          className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 py-3 px-2 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-100 font-semibold text-xs sm:text-sm border border-slate-700/80 active:scale-95 transition-all hover:border-slate-600"
        >
          <QrCode className="w-4 h-4 text-emerald-400" />
          <span>Scan / QR</span>
        </button>
      </div>
    </div>
  );
};
