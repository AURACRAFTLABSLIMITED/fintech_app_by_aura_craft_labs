import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Lock,
  Unlock,
  Shield,
  Eye,
  EyeOff,
  Sliders,
  Sparkles,
  Wifi,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile } from '../types';
import { formatPKR } from '../utils/formatters';

interface CardManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

export const CardManagementModal: React.FC<CardManagementModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [isCardFrozen, setIsCardFrozen] = useState<boolean>(false);
  const [showCardDetails, setShowCardDetails] = useState<boolean>(false);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [onlineSpendLimit, setOnlineSpendLimit] = useState<number>(50000);
  const [atmWithdrawalLimit, setAtmWithdrawalLimit] = useState<number>(50000);
  const [eCommerceEnabled, setECommerceEnabled] = useState<boolean>(true);
  const [internationalEnabled, setInternationalEnabled] = useState<boolean>(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#0D1524] border border-slate-700 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-950/70 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">PayFlow PK Debit Card</h3>
              <p className="text-xs text-slate-400">PayPak & UnionPay 1LINK Debit Card</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5">
          {/* Interactive Card Canvas (Emerald Green & Gold Luxury Card) */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className={`relative w-full h-52 sm:h-56 rounded-2xl p-5 cursor-pointer shadow-2xl transition-all duration-500 text-white flex flex-col justify-between overflow-hidden ${
              isCardFrozen
                ? 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 filter grayscale'
                : 'bg-gradient-to-br from-emerald-800 via-[#0A4D34] to-[#06291C] border border-emerald-400/40'
            }`}
          >
            {/* Background Texture Patterns */}
            <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-emerald-400/10 blur-xl pointer-events-none" />
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <CreditCard className="w-40 h-40" />
            </div>

            {/* Card Top: Chip + PayFlow PK logo + NFC */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold tracking-widest text-emerald-300">
                  PayFlow PK
                </span>
                <span className="text-[9px] bg-emerald-950/80 border border-emerald-400/40 px-1.5 py-0.2 rounded text-emerald-300 font-bold">
                  DEBIT
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-emerald-200 rotate-90" />
                {isCardFrozen && (
                  <span className="text-[10px] bg-rose-600 text-white font-bold px-2 py-0.5 rounded-full">
                    FROZEN
                  </span>
                )}
              </div>
            </div>

            {/* Card Middle: EMV Chip & Number */}
            <div className="relative z-10 my-1">
              <div className="w-9 h-7 rounded bg-gradient-to-tr from-amber-300 to-amber-500 border border-amber-600 shadow-inner mb-2" />
              <p className="font-mono-numbers text-base sm:text-lg font-bold tracking-widest text-emerald-100">
                {showCardDetails ? '4242  8192  9482  1034' : '••••  ••••  ••••  1034'}
              </p>
            </div>

            {/* Card Bottom: Cardholder + Expiry + PayPak Logo */}
            <div className="flex items-center justify-between relative z-10 pt-1 border-t border-emerald-600/30">
              <div>
                <span className="text-[9px] text-emerald-300/80 uppercase tracking-wider block">
                  Cardholder
                </span>
                <p className="text-xs font-bold text-white uppercase tracking-wider">{user.name}</p>
              </div>

              <div className="text-right">
                <span className="text-[9px] text-emerald-300/80 uppercase tracking-wider block">
                  Expires / CVV
                </span>
                <p className="text-xs font-mono-numbers font-bold text-white">
                  {showCardDetails ? '08/30 • 491' : '08/30 • •••'}
                </p>
              </div>

              <div className="flex items-center gap-1 font-bold text-sm text-white">
                <span className="text-amber-400 font-extrabold">Pay</span>
                <span className="text-emerald-300 font-extrabold">Pak</span>
              </div>
            </div>
          </div>

          {/* Quick Card Controls */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowCardDetails(!showCardDetails)}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition-colors"
            >
              {showCardDetails ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-emerald-400" />}
              <span>{showCardDetails ? 'Hide Details' : 'Show Card Details'}</span>
            </button>

            <button
              onClick={() => setIsCardFrozen(!isCardFrozen)}
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                isCardFrozen
                  ? 'bg-rose-950/60 border-rose-600 text-rose-300'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200'
              }`}
            >
              {isCardFrozen ? <Unlock className="w-4 h-4 text-rose-400" /> : <Lock className="w-4 h-4 text-amber-400" />}
              <span>{isCardFrozen ? 'Unfreeze Card' : 'Freeze Card'}</span>
            </button>
          </div>

          {/* Security & Spending Limits */}
          <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Security & Daily Spending Limits
            </h4>

            {/* Online E-commerce Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300">Online / E-Commerce Daily Limit</span>
                <span className="font-mono-numbers font-bold text-emerald-400">
                  {formatPKR(onlineSpendLimit, false)}
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="200000"
                step="5000"
                value={onlineSpendLimit}
                onChange={(e) => setOnlineSpendLimit(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* ATM Withdrawal Limit */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300">ATM Cash Withdrawal Daily Limit</span>
                <span className="font-mono-numbers font-bold text-emerald-400">
                  {formatPKR(atmWithdrawalLimit, false)}
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="100000"
                step="5000"
                value={atmWithdrawalLimit}
                onChange={(e) => setAtmWithdrawalLimit(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Switches */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between py-1">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    Online Shopping & E-Commerce
                  </span>
                  <span className="text-[10px] text-slate-400">Enable Daraz, Foodpanda & online POS</span>
                </div>
                <input
                  type="checkbox"
                  checked={eCommerceEnabled}
                  onChange={(e) => setECommerceEnabled(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-0 w-4 h-4 bg-slate-800 border-slate-700"
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    International Payments
                  </span>
                  <span className="text-[10px] text-slate-400">Cross-border USD/EUR card clearing</span>
                </div>
                <input
                  type="checkbox"
                  checked={internationalEnabled}
                  onChange={(e) => setInternationalEnabled(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-0 w-4 h-4 bg-slate-800 border-slate-700"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
