import React, { useState } from 'react';
import { X, PiggyBank, Plus, TrendingUp, Sparkles, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { SavingsPocket, Transaction, UserProfile } from '../types';
import { initialSavingsPockets } from '../data/mockData';
import { formatPKR, generateTxnId, triggerPaymentCelebration } from '../utils/formatters';

interface BachatSavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  pockets: SavingsPocket[];
  onUpdatePockets: (updated: SavingsPocket[]) => void;
  onPocketTransaction: (txn: Transaction) => void;
}

export const BachatSavingsModal: React.FC<BachatSavingsModalProps> = ({
  isOpen,
  onClose,
  user,
  pockets,
  onUpdatePockets,
  onPocketTransaction,
}) => {
  const [selectedPocket, setSelectedPocket] = useState<SavingsPocket | null>(pockets[0] || null);
  const [depositAmount, setDepositAmount] = useState<string>('2000');
  const [actionType, setActionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newTarget, setNewTarget] = useState<string>('50000');

  if (!isOpen) return null;

  const totalSavings = pockets.reduce((acc, p) => acc + p.currentAmount, 0);

  const handlePocketAction = () => {
    if (!selectedPocket) return;
    const num = parseFloat(depositAmount);
    if (!num || num <= 0) return;

    if (actionType === 'deposit' && num > user.balance) return;
    if (actionType === 'withdraw' && num > selectedPocket.currentAmount) return;

    setIsProcessing(true);

    setTimeout(() => {
      const updatedPockets = pockets.map((p) => {
        if (p.id === selectedPocket.id) {
          const newAmt =
            actionType === 'deposit' ? p.currentAmount + num : p.currentAmount - num;
          return { ...p, currentAmount: newAmt };
        }
        return p;
      });

      onUpdatePockets(updatedPockets);

      const newTxn: Transaction = {
        id: generateTxnId(),
        type: actionType === 'deposit' ? 'savings_deposit' : 'savings_withdraw',
        title: `${actionType === 'deposit' ? 'Deposited to' : 'Withdrawn from'} ${selectedPocket.title}`,
        subtitle: `Bachat Pocket • 11.5% Halal Profit`,
        amount: num,
        timestamp: 'Just now',
        status: 'completed',
        recipient: {
          name: selectedPocket.title,
          accountNumber: selectedPocket.id,
          bankOrWallet: 'PayFlow Bachat Pocket',
          type: 'wallet',
          avatarBg: '#0d9488',
        },
        fee: 0.0,
        purpose: 'Islamic Halal Savings',
        category: 'Savings',
      };

      setIsProcessing(false);
      triggerPaymentCelebration();
      onPocketTransaction(newTxn);
      onClose();
    }, 500);
  };

  const handleCreatePocket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newP: SavingsPocket = {
      id: `pock-${Date.now()}`,
      title: newTitle,
      urduTitle: newTitle,
      targetAmount: parseFloat(newTarget) || 50000,
      currentAmount: 0,
      category: 'general',
      profitRate: 11.5,
      lastProfitCredited: 0,
    };

    onUpdatePockets([...pockets, newP]);
    setSelectedPocket(newP);
    setShowCreateModal(false);
    setNewTitle('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#0D1524] border border-slate-700 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-teal-950/70 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Bachat Pockets & Halal Profit</h3>
              <p className="text-xs text-slate-400">Shariah-Compliant Mudarabah 11.5% - 12% p.a.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* Total Savings Overview Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-teal-950/60 to-slate-900 border border-teal-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold block">
                Total Bachat Pockets Balance
              </span>
              <h3 className="text-2xl font-extrabold text-teal-300 font-mono-numbers mt-0.5">
                {formatPKR(totalSavings)}
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] text-teal-400 font-semibold mt-1">
                <TrendingUp className="w-3 h-3" />
                Profit credited daily to your wallet
              </span>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1 shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Pocket</span>
            </button>
          </div>

          {/* Create Modal Sub-view */}
          {showCreateModal ? (
            <form onSubmit={handleCreatePocket} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-white">Create New Goal Pocket</h4>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Pocket Name</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Eid Shopping / Laptop Fund"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Target Amount (PKR)</label>
                <input
                  type="number"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  placeholder="50000"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white font-mono-numbers focus:outline-none focus:border-teal-500"
                  required
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold"
                >
                  Save Pocket
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Pockets List */}
              <div className="space-y-2.5">
                <span className="text-xs font-semibold text-slate-400 block">Your Active Pockets</span>
                {pockets.map((p) => {
                  const percent = Math.min(100, Math.round((p.currentAmount / p.targetAmount) * 100));
                  const isSelected = selectedPocket?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPocket(p)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-teal-950/40 border-teal-500 ring-1 ring-teal-500'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-white">{p.title}</h4>
                          <p className="text-[10px] text-slate-400">{p.urduTitle}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs sm:text-sm font-extrabold text-teal-300 font-mono-numbers">
                            {formatPKR(p.currentAmount)}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-mono-numbers">
                            Target: {formatPKR(p.targetAmount, false)}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2.5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                        <span>{percent}% Achieved</span>
                        <span>{p.profitRate}% Halal Annual Rate</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Deposit / Withdraw Action Box */}
              {selectedPocket && (
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setActionType('deposit')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        actionType === 'deposit'
                          ? 'bg-teal-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Deposit to {selectedPocket.title.split(' ')[0]}
                    </button>
                    <button
                      onClick={() => setActionType('withdraw')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        actionType === 'withdraw'
                          ? 'bg-teal-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Withdraw to Wallet
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">
                      {actionType === 'deposit' ? 'Deposit Amount' : 'Withdraw Amount'} (PKR)
                    </label>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-sm font-mono-numbers font-bold text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <button
                    disabled={isProcessing || !depositAmount || parseFloat(depositAmount) <= 0}
                    onClick={handlePocketAction}
                    className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    {isProcessing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>
                        Confirm {actionType === 'deposit' ? 'Deposit' : 'Withdrawal'} of{' '}
                        {formatPKR(parseFloat(depositAmount) || 0)}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
