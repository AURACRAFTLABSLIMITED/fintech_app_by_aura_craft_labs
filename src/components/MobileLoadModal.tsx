import React, { useState } from 'react';
import { X, Smartphone, CheckCircle2, Zap, ArrowLeft, ShieldCheck } from 'lucide-react';
import { TelcoBundle, TelcoOperator, Transaction, UserProfile } from '../types';
import { telcoOperators } from '../data/mockData';
import { formatMobilePK, formatPKR, generateTxnId, triggerPaymentCelebration } from '../utils/formatters';

interface MobileLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onCompleteLoad: (newTxn: Transaction) => void;
}

export const MobileLoadModal: React.FC<MobileLoadModalProps> = ({
  isOpen,
  onClose,
  user,
  onCompleteLoad,
}) => {
  const [selectedOperator, setSelectedOperator] = useState<TelcoOperator>(telcoOperators[0]);
  const [tab, setTab] = useState<'easyload' | 'bundles'>('easyload');
  const [mobileNumber, setMobileNumber] = useState<string>(user.phone);
  const [easyloadAmount, setEasyloadAmount] = useState<string>('300');
  const [selectedBundle, setSelectedBundle] = useState<TelcoBundle | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successTxn, setSuccessTxn] = useState<Transaction | null>(null);

  if (!isOpen) return null;

  const quickLoads = [100, 200, 300, 500, 1000];

  const handlePayLoad = () => {
    const finalAmount = tab === 'easyload' ? parseFloat(easyloadAmount) : (selectedBundle?.price || 0);
    if (!finalAmount || finalAmount > user.balance || !mobileNumber) return;

    setIsProcessing(true);

    setTimeout(() => {
      const title =
        tab === 'easyload'
          ? `${selectedOperator.name} Easyload`
          : `${selectedOperator.name} - ${selectedBundle?.title}`;

      const newTxn: Transaction = {
        id: generateTxnId(),
        type: 'mobile_load',
        title: title,
        subtitle: `${mobileNumber} • Prepaid ${tab === 'easyload' ? 'Balance' : 'Bundle'}`,
        amount: finalAmount,
        timestamp: 'Just now',
        status: 'completed',
        recipient: {
          name: `${selectedOperator.name} Recharge`,
          accountNumber: mobileNumber,
          bankOrWallet: selectedOperator.name,
          type: 'wallet',
          avatarBg: selectedOperator.brandColor,
        },
        fee: 0.0,
        purpose: 'Telecom Prepaid Recharge',
        category: 'Mobile Load',
      };

      setIsProcessing(false);
      setSuccessTxn(newTxn);
      triggerPaymentCelebration();
      onCompleteLoad(newTxn);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#0D1524] border border-slate-700 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-950/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Mobile Load & Packages</h3>
              <p className="text-xs text-slate-400">Jazz, Zong, Telenor, Ufone, ONIC</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {!successTxn ? (
            <>
              {/* Operator Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Mobile Network
                </label>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {telcoOperators.map((op) => (
                    <button
                      key={op.id}
                      onClick={() => setSelectedOperator(op)}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                        selectedOperator.id === op.id
                          ? 'bg-slate-800 border-amber-500 text-white shadow-md'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: op.brandColor }}
                      />
                      <span className="text-[11px] font-bold truncate max-w-full">
                        {op.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Number Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Mobile Number (03xx-xxxxxxx)
                </label>
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(formatMobilePK(e.target.value))}
                  placeholder="0301-7894562"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3.5 text-base font-mono-numbers text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Tab Switcher: Easyload vs Bundles */}
              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setTab('easyload')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    tab === 'easyload'
                      ? 'bg-amber-500 text-[#0A111E] shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Easyload (Prepaid Balance)
                </button>
                <button
                  onClick={() => setTab('bundles')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    tab === 'bundles'
                      ? 'bg-amber-500 text-[#0A111E] shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Super Cards & Bundles
                </button>
              </div>

              {/* TAB 1: EASYLOAD AMOUNT */}
              {tab === 'easyload' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Enter Load Amount (Min Rs. 100)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                        Rs.
                      </span>
                      <input
                        type="number"
                        value={easyloadAmount}
                        onChange={(e) => setEasyloadAmount(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-3 font-mono-numbers text-lg font-bold text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {quickLoads.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setEasyloadAmount(amt.toString())}
                        className="py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500 text-xs font-mono-numbers text-slate-300 font-semibold"
                      >
                        Rs. {amt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: BUNDLES LIST */}
              {tab === 'bundles' && (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedOperator.bundles.map((bundle) => {
                    const isSelected = selectedBundle?.id === bundle.id;
                    return (
                      <div
                        key={bundle.id}
                        onClick={() => setSelectedBundle(bundle)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-white">{bundle.title}</h4>
                            {bundle.isPopular && (
                              <span className="text-[9px] bg-amber-500 text-[#0A111E] font-bold px-1.5 py-0.2 rounded">
                                HOT
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-extrabold text-amber-400 font-mono-numbers">
                            {formatPKR(bundle.price)}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-1 mt-2 text-[10px] text-slate-300 bg-slate-950/50 p-1.5 rounded-lg border border-slate-800/80">
                          <div>🌐 {bundle.dataGb}</div>
                          <div>📞 {bundle.onNetMins}</div>
                          <div>⏳ {bundle.validity}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Submit CTA */}
              <button
                disabled={
                  isProcessing ||
                  !mobileNumber ||
                  (tab === 'easyload' && (!easyloadAmount || parseFloat(easyloadAmount) < 100)) ||
                  (tab === 'bundles' && !selectedBundle)
                }
                onClick={handlePayLoad}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-950 flex items-center justify-center gap-2 transition-all active:scale-95 mt-4"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Processing Instant Recharge...</span>
                  </>
                ) : (
                  <span>
                    Pay{' '}
                    {formatPKR(
                      tab === 'easyload'
                        ? parseFloat(easyloadAmount) || 0
                        : selectedBundle?.price || 0
                    )}
                  </span>
                )}
              </button>
            </>
          ) : (
            /* Success Screen */
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Recharge Successful!</h3>
              <p className="text-xs text-slate-300">
                Mobile balance / package activated for{' '}
                <span className="font-mono-numbers text-emerald-400 font-bold">{mobileNumber}</span>
              </p>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                Amount Paid: <span className="font-bold text-white font-mono-numbers">{formatPKR(successTxn.amount)}</span>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
              >
                Close / Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
