import React from 'react';
import {
  X,
  User,
  ShieldCheck,
  Zap,
  Fingerprint,
  Sparkles,
  Phone,
  CreditCard,
  Building2,
  Lock,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile } from '../types';
import { formatPKR } from '../utils/formatters';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onToggleLanguage: () => void;
  onToggleBiometrics: () => void;
  onResetDemoData: () => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  user,
  onToggleLanguage,
  onToggleBiometrics,
  onResetDemoData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full sm:max-w-md h-full sm:h-auto sm:max-h-[92vh] bg-[#0D1524] border-l sm:border border-slate-700 sm:rounded-3xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Account & SBP Limits</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* User Profile Card */}
          <div className="p-4 bg-gradient-to-br from-slate-900 to-[#0A111E] rounded-2xl border border-slate-800 text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-extrabold text-xl mx-auto shadow-md ring-4 ring-emerald-500/20 mb-2">
              {user.avatarInitials}
            </div>
            <h4 className="text-base font-bold text-white">{user.name}</h4>
            <p className="text-xs font-mono-numbers text-emerald-400 font-semibold">{user.phone}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">CNIC: {user.cnic}</p>

            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/90 px-3 py-1 rounded-full border border-emerald-700/60 mt-2.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>NADRA Biometric Level 1 Verified</span>
            </div>
          </div>

          {/* Account Tier Limits (State Bank of Pakistan Regulations) */}
          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200">Account Limits & Quota</h4>
              <span className="text-[10px] text-amber-400 font-semibold">SBP Certified</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Daily Transfer Limit</span>
                <span className="font-mono-numbers font-bold text-slate-100">
                  {formatPKR(user.dailyLimit, false)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Monthly Transfer Limit</span>
                <span className="font-mono-numbers font-bold text-slate-100">
                  {formatPKR(user.monthlyLimit, false)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">RAAST Instant Pay Alias</span>
                <span className="font-mono-numbers font-bold text-emerald-400">
                  {user.raastId}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Account Balance Cap</span>
                <span className="font-mono-numbers font-bold text-slate-100">
                  Rs. 1,000,000.00
                </span>
              </div>
            </div>
          </div>

          {/* App Preferences */}
          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-200">Security & Language</h4>

            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    Roman Urdu Microcopy
                  </span>
                  <span className="text-[10px] text-slate-400">Assisted Urdu hints across all screens</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={user.romanUrduAssisted}
                onChange={onToggleLanguage}
                className="rounded text-emerald-600 focus:ring-0 w-4 h-4 bg-slate-800 border-slate-700"
              />
            </div>

            <div className="flex items-center justify-between py-1 border-t border-slate-800 pt-2">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    Biometric Fast Sign-In
                  </span>
                  <span className="text-[10px] text-slate-400">Touch ID / Face ID verification</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={user.isBiometricEnabled}
                onChange={onToggleBiometrics}
                className="rounded text-emerald-600 focus:ring-0 w-4 h-4 bg-slate-800 border-slate-700"
              />
            </div>
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => {
              if (confirm('Reset wallet balance and mock transactions back to default demo state?')) {
                onResetDemoData();
                onClose();
              }
            }}
            className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-400 hover:text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data to Initial State</span>
          </button>
        </div>
      </div>
    </div>
  );
};
