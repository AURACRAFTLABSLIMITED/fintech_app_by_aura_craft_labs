import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Smartphone,
  QrCode,
  HeartHandshake,
  PiggyBank,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  Download,
  RotateCcw,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Transaction } from '../types';
import { formatPKR, getWhatsAppReceiptText } from '../utils/formatters';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onRepeatTransfer: (txn: Transaction) => void;
  romanUrduAssisted: boolean;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  onRepeatTransfer,
  romanUrduAssisted,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTxn, setActiveTxn] = useState<Transaction | null>(null);
  const [copiedId, setCopiedId] = useState<boolean>(false);

  const categories = [
    { id: 'all', label: 'All', urdu: 'تمام' },
    { id: 'Transfer', label: 'Transfers', urdu: 'ٹرانسفرز' },
    { id: 'Bills', label: 'Bills', urdu: 'بلز' },
    { id: 'Mobile Load', label: 'Mobile Load', urdu: 'لوڈ' },
    { id: 'QR Payment', label: 'QR Pay', urdu: 'کیو آر' },
  ];

  const filtered = transactions.filter((t) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      t.category.toLowerCase() === selectedCategory.toLowerCase() ||
      (selectedCategory === 'Transfer' && (t.type === 'transfer_send' || t.type === 'transfer_receive'));

    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.raastRef && t.raastRef.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleShareWhatsApp = (txn: Transaction) => {
    const text = getWhatsAppReceiptText(txn);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const getIcon = (txn: Transaction) => {
    switch (txn.type) {
      case 'transfer_receive':
        return <ArrowDownLeft className="w-5 h-5 text-emerald-400" />;
      case 'transfer_send':
        return <ArrowUpRight className="w-5 h-5 text-slate-300" />;
      case 'bill_payment':
        return <Receipt className="w-5 h-5 text-sky-400" />;
      case 'mobile_load':
        return <Smartphone className="w-5 h-5 text-amber-400" />;
      case 'qr_pay':
        return <QrCode className="w-5 h-5 text-purple-400" />;
      case 'zakat_donation':
        return <HeartHandshake className="w-5 h-5 text-rose-400" />;
      case 'savings_deposit':
      case 'savings_withdraw':
        return <PiggyBank className="w-5 h-5 text-teal-400" />;
      default:
        return <ArrowUpRight className="w-5 h-5 text-slate-300" />;
    }
  };

  return (
    <div className="w-full my-4">
      {/* Header & Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 px-1">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-1.5">
            Transaction History
            {romanUrduAssisted && (
              <span className="text-xs font-normal text-emerald-400">(Tafseelat)</span>
            )}
          </h3>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500 text-[#0A111E] shadow-sm font-bold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
              }`}
            >
              {cat.label} {romanUrduAssisted && `(${cat.urdu})`}
            </button>
          ))}
        </div>
      </div>

      {/* Optional Search Bar */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by recipient, bank, RAAST ID or ref #..."
          className="w-full bg-slate-900/80 border border-slate-800 focus:border-emerald-500/80 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none transition-all"
        />
      </div>

      {/* Transactions List */}
      {filtered.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center">
          <Receipt className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-400">No transactions found</p>
          <p className="text-xs text-slate-600 mt-1">Try selecting another filter or search term.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((txn) => {
            const isCredit = txn.type === 'transfer_receive';
            return (
              <div
                key={txn.id}
                id={`txn-${txn.id}`}
                onClick={() => setActiveTxn(txn)}
                className="group flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all active:scale-[0.99]"
              >
                {/* Left: Icon & Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    {getIcon(txn)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors truncate">
                        {txn.title}
                      </h4>
                      {txn.raastRef && (
                        <span className="hidden sm:inline-block text-[10px] font-semibold text-amber-400 bg-amber-950/80 border border-amber-800/60 px-1.5 rounded">
                          RAAST
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{txn.subtitle}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{txn.timestamp}</p>
                  </div>
                </div>

                {/* Right: Amount & Status */}
                <div className="text-right flex-shrink-0 ml-3">
                  <span
                    className={`text-xs sm:text-sm font-extrabold font-mono-numbers ${
                      isCredit ? 'text-emerald-400' : 'text-slate-100'
                    }`}
                  >
                    {isCredit ? '+' : '-'} {formatPKR(txn.amount)}
                  </span>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span className="text-[10px] font-medium text-emerald-400/90">Successful</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transaction Details Modal / Bottom Sheet */}
      {activeTxn && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full max-w-lg bg-[#0E1726] border border-slate-700 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-900/60 to-slate-900 p-5 border-b border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Transaction Receipt</h3>
                  <p className="text-xs text-slate-400">State Bank of Pakistan RAAST Certified</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTxn(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Receipt Ticket */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Amount Display */}
              <div className="text-center py-4 bg-slate-900/90 rounded-2xl border border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Amount Transferred
                </span>
                <h2 className="text-3xl font-extrabold text-white font-mono-numbers mt-1 text-emerald-400">
                  {formatPKR(activeTxn.amount)}
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/90 px-2.5 py-0.5 rounded-full border border-emerald-800/80 mt-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Transfer Completed (RAAST Zero Fee)
                </span>
              </div>

              {/* Data Breakdown Table */}
              <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Recipient Name</span>
                  <span className="font-semibold text-slate-200">{activeTxn.recipient.name}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Destination Account / Bank</span>
                  <span className="font-semibold text-slate-200">{activeTxn.recipient.bankOrWallet}</span>
                </div>
                {activeTxn.recipient.accountNumber && (
                  <div className="flex items-center justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Account / Mobile / IBAN</span>
                    <span className="font-mono-numbers font-medium text-slate-200">
                      {activeTxn.recipient.accountNumber}
                    </span>
                  </div>
                )}
                {activeTxn.raastRef && (
                  <div className="flex items-center justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">RAAST Ref #</span>
                    <div className="flex items-center gap-1.5 font-mono-numbers text-amber-300 font-semibold">
                      <span>{activeTxn.raastRef}</span>
                      <button
                        onClick={() => handleCopy(activeTxn.raastRef!)}
                        className="text-slate-400 hover:text-white"
                        title="Copy Reference"
                      >
                        {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Transaction ID</span>
                  <span className="font-mono-numbers text-slate-300">{activeTxn.id}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Date & Time</span>
                  <span className="text-slate-200">{activeTxn.timestamp}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Service Fee</span>
                  <span className="font-bold text-emerald-400">Rs. 0.00 (Free)</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2.5">
              <button
                onClick={() => handleShareWhatsApp(activeTxn)}
                className="flex-1 py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md"
              >
                <Share2 className="w-4 h-4" />
                <span>Share WhatsApp</span>
              </button>

              <button
                onClick={() => {
                  onRepeatTransfer(activeTxn);
                  setActiveTxn(null);
                }}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all border border-slate-700"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>Repeat</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
