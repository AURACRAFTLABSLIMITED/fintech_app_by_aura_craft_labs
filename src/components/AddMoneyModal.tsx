import React, { useState } from 'react';
import { X, CreditCard, Building2, MapPin, Copy, Check, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Transaction, UserProfile } from '../types';
import { formatPKR, generateTxnId, triggerPaymentCelebration } from '../utils/formatters';

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onCompleteAddMoney: (newTxn: Transaction) => void;
}

export const AddMoneyModal: React.FC<AddMoneyModalProps> = ({
  isOpen,
  onClose,
  user,
  onCompleteAddMoney,
}) => {
  const [method, setMethod] = useState<'card' | 'raast_deposit' | 'agent'>('card');
  const [amount, setAmount] = useState<string>('5000');
  const [cardNumber, setCardNumber] = useState<string>('4242 •••• •••• 8192');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedIban, setCopiedIban] = useState<boolean>(false);
  const [successTxn, setSuccessTxn] = useState<Transaction | null>(null);

  const quickAmounts = [1000, 2500, 5000, 10000, 25000];

  if (!isOpen) return null;

  const handleCopyIban = () => {
    navigator.clipboard.writeText('PK82PAYF03017894562001');
    setCopiedIban(true);
    setTimeout(() => setCopiedIban(false), 2000);
  };

  const handleDepositViaCard = () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) return;

    setIsProcessing(true);

    setTimeout(() => {
      const newTxn: Transaction = {
        id: generateTxnId(),
        type: 'add_money',
        title: 'Added Money via Visa Debit Card',
        subtitle: `Card ending in 8192 • Instant Load`,
        amount: num,
        timestamp: 'Just now',
        status: 'completed',
        recipient: {
          name: user.name,
          accountNumber: '•••• 8192',
          bankOrWallet: 'Linked Visa Debit Card',
          type: 'bank',
          avatarBg: '#0284c7',
        },
        fee: 0.0,
        purpose: 'Wallet Balance Top-up',
        category: 'Deposit',
      };

      setIsProcessing(false);
      setSuccessTxn(newTxn);
      triggerPaymentCelebration();
      onCompleteAddMoney(newTxn);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#0D1524] border border-slate-700 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-950/70 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add Money to Wallet</h3>
              <p className="text-xs text-slate-400">Deposit PKR via Card, RAAST or Agent</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channels */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {successTxn ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Money Added Successfully!</h3>
              <p className="text-xs text-slate-300">
                <span className="text-emerald-400 font-bold font-mono-numbers">
                  {formatPKR(successTxn.amount)}
                </span>{' '}
                has been credited to your PayFlow PK wallet.
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
              >
                Back to Home
              </button>
            </div>
          ) : (
            <>
              {/* Method Selector */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setMethod('card')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    method === 'card'
                      ? 'bg-emerald-950/40 border-emerald-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                  <span className="text-xs font-bold block">Debit Card</span>
                  <span className="text-[10px] text-slate-400">Instant</span>
                </button>

                <button
                  onClick={() => setMethod('raast_deposit')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    method === 'raast_deposit'
                      ? 'bg-emerald-950/40 border-emerald-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building2 className="w-4 h-4 mx-auto mb-1 text-sky-400" />
                  <span className="text-xs font-bold block">Bank IBAN</span>
                  <span className="text-[10px] text-slate-400">RAAST 0 Fee</span>
                </button>

                <button
                  onClick={() => setMethod('agent')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    method === 'agent'
                      ? 'bg-emerald-950/40 border-emerald-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MapPin className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                  <span className="text-xs font-bold block">Cash Agent</span>
                  <span className="text-[10px] text-slate-400">150k+ Shops</span>
                </button>
              </div>

              {/* METHOD 1: CARD DEPOSIT */}
              {method === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Deposit Amount (PKR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                        Rs.
                      </span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-3 font-mono-numbers text-lg font-bold text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {quickAmounts.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setAmount(amt.toString())}
                        className="py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500 text-xs font-mono-numbers text-slate-300 font-semibold"
                      >
                        Rs. {amt.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-xs text-slate-300">
                    <span className="text-slate-400 text-[11px]">Charging Payment Source:</span>
                    <div className="flex items-center justify-between font-semibold">
                      <span>Visa Debit Card (Meezan Bank)</span>
                      <span className="font-mono-numbers">•••• 8192</span>
                    </div>
                  </div>

                  <button
                    disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                    onClick={handleDepositViaCard}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-sm shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Authorizing 3D-Secure Otp...</span>
                      </>
                    ) : (
                      <span>Deposit {formatPKR(parseFloat(amount) || 0)}</span>
                    )}
                  </button>
                </div>
              )}

              {/* METHOD 2: RAAST DIRECT IBAN */}
              {method === 'raast_deposit' && (
                <div className="space-y-3 p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs">
                  <p className="text-slate-300">
                    Transfer money directly from any Pakistani banking app (HBL, Meezan, UBL, Alfalah) to your dedicated PayFlow IBAN:
                  </p>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-500 text-[10px]">Your PayFlow Dedicated IBAN</span>
                    <div className="flex items-center justify-between font-mono-numbers text-emerald-400 font-bold text-sm">
                      <span>PK82PAYF03017894562001</span>
                      <button onClick={handleCopyIban} className="text-slate-400 hover:text-white">
                        {copiedIban ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-500 text-[10px]">Or Send via RAAST ID</span>
                    <div className="font-mono-numbers text-amber-300 font-bold">
                      {user.raastId}
                    </div>
                  </div>
                </div>
              )}

              {/* METHOD 3: AGENT CASH DEPOSIT */}
              {method === 'agent' && (
                <div className="space-y-3 p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs text-slate-300">
                  <h4 className="font-bold text-white text-sm">Cash-In at 150,000+ Agent Shops</h4>
                  <p>Visit any authorized Easypaisa, JazzCash, or PayFlow PK agent shop across Pakistan:</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1">
                    <li>Provide your mobile number: <span className="font-mono-numbers font-bold text-emerald-400">{user.phone}</span></li>
                    <li>Show your original CNIC to the agent</li>
                    <li>Hand over the cash amount — Zero fee for deposits up to Rs. 50,000/day</li>
                    <li>Instant SMS & Push confirmation will be sent to your device</li>
                  </ol>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
