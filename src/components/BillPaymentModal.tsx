import React, { useState } from 'react';
import { X, Receipt, CheckCircle2, ShieldCheck, Search, Building2 } from 'lucide-react';
import { BillCompany, Transaction, UserProfile } from '../types';
import { billCompanies } from '../data/mockData';
import { formatPKR, generateTxnId, triggerPaymentCelebration } from '../utils/formatters';

interface BillPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onCompletePayment: (newTxn: Transaction) => void;
}

export const BillPaymentModal: React.FC<BillPaymentModalProps> = ({
  isOpen,
  onClose,
  user,
  onCompletePayment,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('electricity');
  const [selectedCompany, setSelectedCompany] = useState<BillCompany>(billCompanies[0]);
  const [consumerNo, setConsumerNo] = useState<string>(billCompanies[0].sampleConsumerNo);
  const [isLookingUp, setIsLookingUp] = useState<boolean>(false);
  const [fetchedBill, setFetchedBill] = useState<{
    consumerTitle: string;
    amount: number;
    dueDate: string;
    status: 'unpaid' | 'paid';
    billMonth: string;
  } | null>(null);
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const [successTxn, setSuccessTxn] = useState<Transaction | null>(null);

  if (!isOpen) return null;

  const categories = [
    { id: 'electricity', label: 'Electricity', icon: '⚡' },
    { id: 'gas', label: 'Gas', icon: '🔥' },
    { id: 'internet', label: 'Internet / Phone', icon: '🌐' },
    { id: 'water', label: 'Water', icon: '💧' },
    { id: 'government', label: 'Govt / Challan', icon: '🏛️' },
  ];

  const filteredCompanies = billCompanies.filter((c) => c.category === selectedCategory);

  const handleSelectCompany = (comp: BillCompany) => {
    setSelectedCompany(comp);
    setConsumerNo(comp.sampleConsumerNo);
    setFetchedBill(null);
  };

  const handleLookupBill = () => {
    if (!consumerNo.trim()) return;
    setIsLookingUp(true);

    setTimeout(() => {
      setFetchedBill({
        consumerTitle: selectedCompany.sampleConsumerTitle,
        amount: selectedCompany.sampleAmount,
        dueDate: selectedCompany.sampleDueDate,
        status: 'unpaid',
        billMonth: 'August 2026',
      });
      setIsLookingUp(false);
    }, 450);
  };

  const handlePayBill = () => {
    if (!fetchedBill || fetchedBill.amount > user.balance) return;

    setIsPaying(true);

    setTimeout(() => {
      const newTxn: Transaction = {
        id: generateTxnId(),
        type: 'bill_payment',
        title: `${selectedCompany.name} Bill`,
        subtitle: `Consumer #: ${consumerNo} • ${fetchedBill.billMonth}`,
        amount: fetchedBill.amount,
        timestamp: 'Just now',
        status: 'completed',
        recipient: {
          name: selectedCompany.name,
          accountNumber: consumerNo,
          bankOrWallet: `${selectedCompany.category.toUpperCase()} Utility 1LINK`,
          type: 'wallet',
          avatarBg: selectedCompany.badgeColor,
        },
        fee: 0.0,
        purpose: `${selectedCompany.name} Utility Bill Payment`,
        category: 'Bills',
      };

      setIsPaying(false);
      setSuccessTxn(newTxn);
      triggerPaymentCelebration();
      onCompletePayment(newTxn);
    }, 650);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#0D1524] border border-slate-700 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-sky-950/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Utility Bill Payments</h3>
              <p className="text-xs text-slate-400">1LINK Verified Utility & Challan Gateway</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {!successTxn ? (
            <>
              {/* Category Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      const firstComp = billCompanies.find((c) => c.category === cat.id);
                      if (firstComp) handleSelectCompany(firstComp);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-sky-500 text-[#0A111E] font-bold shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Utility Company Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Billing Company
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {filteredCompanies.map((comp) => (
                    <button
                      key={comp.id}
                      onClick={() => handleSelectCompany(comp)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        selectedCompany.id === comp.id
                          ? 'bg-sky-950/40 border-sky-500 ring-1 ring-sky-500 text-white'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-extrabold text-white flex-shrink-0"
                        style={{ backgroundColor: comp.badgeColor }}
                      >
                        {comp.logoText}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{comp.name.split(' ')[0]}</p>
                        <p className="text-[10px] text-slate-400 truncate">{comp.urduName}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Consumer / Reference Number Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Consumer Number / Reference ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={consumerNo}
                    onChange={(e) => setConsumerNo(e.target.value)}
                    placeholder={`e.g. ${selectedCompany.sampleConsumerNo}`}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3.5 text-sm font-mono-numbers text-white focus:border-sky-500 focus:outline-none"
                  />
                  <button
                    onClick={handleLookupBill}
                    disabled={!consumerNo.trim() || isLookingUp}
                    className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    {isLookingUp ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                    <span>Fetch Bill</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Reference number is printed at the top of your paper utility bill.
                </p>
              </div>

              {/* Fetched Bill Details Card */}
              {fetchedBill && (
                <div className="p-4 bg-slate-900/90 rounded-2xl border border-sky-500/40 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-sky-400" />
                      {fetchedBill.consumerTitle}
                    </span>
                    <span className="text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full">
                      UNPAID
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px]">Due Date:</span>
                      <p className="font-semibold text-slate-200">{fetchedBill.dueDate}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Billing Month:</span>
                      <p className="font-semibold text-slate-200">{fetchedBill.billMonth}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-xs text-slate-400">Total Payable Amount</span>
                    <span className="text-xl font-extrabold text-sky-400 font-mono-numbers">
                      {formatPKR(fetchedBill.amount)}
                    </span>
                  </div>

                  {/* Pay CTA */}
                  <button
                    disabled={isPaying || fetchedBill.amount > user.balance}
                    onClick={handlePayBill}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-40 text-white font-bold text-sm shadow-lg shadow-sky-950 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    {isPaying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing 1LINK Clearing...</span>
                      </>
                    ) : (
                      <span>Confirm & Pay {formatPKR(fetchedBill.amount)}</span>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Success Screen */
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Bill Paid Successfully!</h3>
              <p className="text-xs text-slate-300">
                Receipt generated and cleared with{' '}
                <span className="text-sky-400 font-bold">{selectedCompany.name}</span>
              </p>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                Amount Cleared: <span className="font-bold text-emerald-400 font-mono-numbers">{formatPKR(successTxn.amount)}</span>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
              >
                Done / Back to Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
