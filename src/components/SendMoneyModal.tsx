import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowLeft,
  Search,
  Building2,
  Wallet,
  CreditCard,
  User,
  Zap,
  CheckCircle2,
  AlertCircle,
  Lock,
  Share2,
  Download,
  Fingerprint,
  Star,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Beneficiary, DestinationType, RecipientInfo, Transaction, UserProfile } from '../types';
import { pakistaniBanks, pakistaniWallets } from '../data/mockData';
import {
  formatCNICPK,
  formatMobilePK,
  formatPKR,
  generateRaastRef,
  generateTxnId,
  getWhatsAppReceiptText,
  triggerPaymentCelebration,
} from '../utils/formatters';

interface SendMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  beneficiaries: Beneficiary[];
  prefilledRecipient?: Beneficiary | null;
  onCompleteTransfer: (newTxn: Transaction, saveBeneficiary?: boolean) => void;
}

export const SendMoneyModal: React.FC<SendMoneyModalProps> = ({
  isOpen,
  onClose,
  user,
  beneficiaries,
  prefilledRecipient,
  onCompleteTransfer,
}) => {
  // Wizard steps: 1: Destination, 2: Recipient Details, 3: Amount, 4: Review, 5: PIN, 6: Success Receipt
  const [step, setStep] = useState<number>(1);

  // Form State
  const [destinationType, setDestinationType] = useState<DestinationType>('raast');
  const [selectedBank, setSelectedBank] = useState<string>('meezan');
  const [selectedWallet, setSelectedWallet] = useState<string>('easypaisa');
  
  const [accountInput, setAccountInput] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('Family Support (Ghar Kharcha)');
  const [pin, setPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isVerifyingTitle, setIsVerifyingTitle] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [saveAsBeneficiary, setSaveAsBeneficiary] = useState<boolean>(false);
  const [completedTxn, setCompletedTxn] = useState<Transaction | null>(null);

  // Quick Amount presets
  const quickAmounts = [500, 1000, 2500, 5000, 10000, 25000];

  // Purpose options
  const purposes = [
    'Family Support (Ghar Kharcha)',
    'Business / Merchant Payment',
    'Educational Fees',
    'House Rent & Utilities',
    'Medical & Health Expense',
    'Gift / Eidi / Sadqah',
  ];

  // Reset or prefill on open
  useEffect(() => {
    if (isOpen) {
      if (prefilledRecipient) {
        setDestinationType(prefilledRecipient.type);
        setAccountInput(prefilledRecipient.phoneOrAccount);
        setRecipientName(prefilledRecipient.name);
        setStep(3); // jump straight to amount entry
      } else {
        setStep(1);
        setDestinationType('raast');
        setAccountInput('');
        setRecipientName('');
        setAmount('');
        setPin('');
        setCompletedTxn(null);
      }
    }
  }, [isOpen, prefilledRecipient]);

  if (!isOpen) return null;

  // Recipient Title Auto-Lookup simulator
  const handleProceedToAmount = () => {
    if (!accountInput.trim()) return;

    setIsVerifyingTitle(true);
    setTimeout(() => {
      // Look in beneficiaries or generate realistic name
      const matchedBen = beneficiaries.find(
        (b) => b.phoneOrAccount.replace(/\D/g, '') === accountInput.replace(/\D/g, '')
      );

      if (matchedBen) {
        setRecipientName(matchedBen.name);
      } else if (accountInput.startsWith('0300') || accountInput.startsWith('0301')) {
        setRecipientName('Tariq Mahmood');
      } else if (accountInput.startsWith('0321') || accountInput.startsWith('0322')) {
        setRecipientName('Ayesha Khan');
      } else if (accountInput.startsWith('0345') || accountInput.startsWith('0346')) {
        setRecipientName('Muhammad Usman');
      } else if (destinationType === 'cnic') {
        setRecipientName('Zainab Bibi (CNIC Pickup)');
      } else {
        setRecipientName('Bilal Ahmed Siddiqui');
      }

      setIsVerifyingTitle(false);
      setStep(3);
    }, 450);
  };

  const handleSelectQuickBen = (ben: Beneficiary) => {
    setDestinationType(ben.type);
    setAccountInput(ben.phoneOrAccount);
    setRecipientName(ben.name);
    setStep(3);
  };

  const numAmount = parseFloat(amount) || 0;
  const isAmountValid = numAmount >= 50 && numAmount <= user.balance;

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setPinError('');
      if (nextPin.length === 4) {
        // Auto-submit after 4 digits
        processTransaction(nextPin);
      }
    }
  };

  const handlePinBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const processTransaction = (enteredPin: string) => {
    if (enteredPin !== '1234' && enteredPin.length === 4) {
      // For ease of use, accept any 4-digit pin or standard '1234'
    }

    setIsSubmitting(true);

    setTimeout(() => {
      let bankOrWalletName = 'RAAST Instant Payment';
      if (destinationType === 'bank') {
        const found = pakistaniBanks.find((b) => b.id === selectedBank);
        bankOrWalletName = found ? found.name : 'Pakistani Commercial Bank';
      } else if (destinationType === 'wallet') {
        const found = pakistaniWallets.find((w) => w.id === selectedWallet);
        bankOrWalletName = found ? found.name : 'Digital Wallet';
      } else if (destinationType === 'cnic') {
        bankOrWalletName = 'CNIC Cash Pickup (150,000+ Agents)';
      }

      const newTxn: Transaction = {
        id: generateTxnId(),
        type: 'transfer_send',
        title: recipientName || 'Beneficiary Transfer',
        subtitle: `${bankOrWalletName} • ${accountInput}`,
        amount: numAmount,
        timestamp: 'Just now',
        status: 'completed',
        recipient: {
          name: recipientName || 'Verified Recipient',
          accountNumber: accountInput,
          bankOrWallet: bankOrWalletName,
          type: destinationType,
          raastId: destinationType === 'raast' ? `${accountInput.replace(/\D/g, '')}@raast` : undefined,
          iban: destinationType === 'bank' ? accountInput : undefined,
          cnic: destinationType === 'cnic' ? accountInput : undefined,
          avatarBg: '#059669',
          verified: true,
        },
        raastRef: generateRaastRef(),
        fee: 0.0,
        purpose: purpose,
        category: 'Transfer',
      };

      setCompletedTxn(newTxn);
      setIsSubmitting(false);
      setStep(6); // Success screen
      triggerPaymentCelebration();
      onCompleteTransfer(newTxn, saveAsBeneficiary);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#0D1524] border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Top Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step > 1 && step < 6 && (
              <button
                onClick={() => setStep(step - 1)}
                className="p-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                {step === 6 ? 'Transfer Receipt' : 'Send Money'}
                {user.romanUrduAssisted && step !== 6 && (
                  <span className="text-xs font-normal text-emerald-400">(Raqam Bhejein)</span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">
                {step === 1 && 'Select transfer destination channel'}
                {step === 2 && 'Enter verified recipient account details'}
                {step === 3 && 'Specify transfer amount (PKR)'}
                {step === 4 && 'Verify recipient name & transfer purpose'}
                {step === 5 && 'Enter 4-digit PayFlow security PIN'}
                {step === 6 && 'State Bank of Pakistan RAAST Instant Transfer'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          {/* STEP 1: DESTINATION SELECTOR */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Quick Beneficiaries Carousel */}
              {beneficiaries.length > 0 && (
                <div className="mb-3">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mb-2">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    Quick Favorites
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {beneficiaries.slice(0, 3).map((ben) => (
                      <button
                        key={ben.id}
                        onClick={() => handleSelectQuickBen(ben)}
                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 border border-slate-700 hover:border-emerald-500/60 transition-all text-left group"
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: ben.avatarBg || '#059669' }}
                        >
                          {ben.name[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 truncate">
                            {ben.name.split(' ')[0]}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate font-mono-numbers">
                            {ben.type.toUpperCase()}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <span className="text-xs font-semibold text-slate-400 block mb-1">
                Choose Transfer Destination
              </span>

              {/* 4 Main Transfer Channels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. RAAST ID */}
                <button
                  onClick={() => {
                    setDestinationType('raast');
                    setStep(2);
                  }}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-950/20 text-left transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-600/50 flex items-center justify-center flex-shrink-0 text-emerald-400">
                    <Zap className="w-5 h-5 fill-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-300">
                        RAAST ID / Mobile
                      </h4>
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-700/60">
                        0 Fee
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Instant P2P to any Pakistani mobile number linked to RAAST.
                    </p>
                  </div>
                </button>

                {/* 2. Bank Account / IBAN */}
                <button
                  onClick={() => {
                    setDestinationType('bank');
                    setStep(2);
                  }}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-sky-500 hover:bg-sky-950/20 text-left transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-950/80 border border-sky-600/50 flex items-center justify-center flex-shrink-0 text-sky-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-sky-300">
                      Pakistani Bank Account
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Transfer to Meezan, HBL, UBL, Alfalah & all 35+ SBP banks.
                    </p>
                  </div>
                </button>

                {/* 3. Other Wallets */}
                <button
                  onClick={() => {
                    setDestinationType('wallet');
                    setStep(2);
                  }}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500 hover:bg-amber-950/20 text-left transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-600/50 flex items-center justify-center flex-shrink-0 text-amber-400">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-300">
                      Other Wallets
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Send to Easypaisa, JazzCash, SadaPay, NayaPay, UPaisa.
                    </p>
                  </div>
                </button>

                {/* 4. Direct to CNIC */}
                <button
                  onClick={() => {
                    setDestinationType('cnic');
                    setStep(2);
                  }}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500 hover:bg-purple-950/20 text-left transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-600/50 flex items-center justify-center flex-shrink-0 text-purple-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-purple-300">
                      Direct to CNIC
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Cash pickup at any authorized retailer shop nationwide.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: RECIPIENT DETAILS */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Destination Bank / Wallet Selector if applicable */}
              {destinationType === 'bank' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Select Recipient Bank
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {pakistaniBanks.map((bank) => (
                      <option key={bank.id} value={bank.id}>
                        {bank.name} ({bank.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {destinationType === 'wallet' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Select Digital Wallet
                  </label>
                  <select
                    value={selectedWallet}
                    onChange={(e) => setSelectedWallet(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {pakistaniWallets.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Input Field based on destination */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {destinationType === 'raast' && 'Enter 11-Digit Pakistani Mobile / RAAST ID'}
                  {destinationType === 'bank' && 'Enter Account Number or 24-Digit IBAN'}
                  {destinationType === 'wallet' && 'Enter Wallet Mobile Number (03xx-xxxxxxx)'}
                  {destinationType === 'cnic' && 'Enter 13-Digit Recipient CNIC (National ID)'}
                </label>

                <div className="relative">
                  <input
                    type="text"
                    value={accountInput}
                    onChange={(e) => {
                      if (destinationType === 'cnic') {
                        setAccountInput(formatCNICPK(e.target.value));
                      } else if (destinationType === 'raast' || destinationType === 'wallet') {
                        setAccountInput(formatMobilePK(e.target.value));
                      } else {
                        setAccountInput(e.target.value);
                      }
                    }}
                    placeholder={
                      destinationType === 'cnic'
                        ? '35201-9482103-7'
                        : destinationType === 'bank'
                        ? 'e.g. PK82MEZN00192837465'
                        : '0300-1234567'
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-3.5 text-base font-mono-numbers text-white placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
                  />
                  {accountInput && (
                    <button
                      onClick={() => setAccountInput('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Title fetch queries State Bank of Pakistan 1LINK Directory</span>
                </div>
              </div>

              {/* Sample Quick Fill Pill for fast demonstration */}
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Try Sample Verified Account:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setAccountInput('0300-8451920');
                      setRecipientName('Tariq Mahmood');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono-numbers"
                  >
                    0300-8451920 (Tariq Mahmood)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAccountInput('0321-4567890');
                      setRecipientName('Ayesha Khan');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono-numbers"
                  >
                    0321-4567890 (Ayesha Khan)
                  </button>
                </div>
              </div>

              <button
                disabled={!accountInput.trim() || isVerifyingTitle}
                onClick={handleProceedToAmount}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition-all"
              >
                {isVerifyingTitle ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Fetching Account Title...</span>
                  </>
                ) : (
                  <span>Verify Account & Continue</span>
                )}
              </button>
            </div>
          )}

          {/* STEP 3: AMOUNT ENTRY */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Recipient Badge Banner */}
              <div className="p-3 bg-slate-900/90 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-sm">
                    {recipientName ? recipientName[0] : 'U'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1">
                      {recipientName || 'Verified Recipient'}
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </h4>
                    <p className="text-xs text-slate-400 font-mono-numbers">{accountInput}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  Verified
                </span>
              </div>

              {/* Amount Input */}
              <div className="text-center py-3">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Enter Amount (PKR)
                </label>
                <div className="relative inline-flex items-center justify-center max-w-full">
                  <span className="text-2xl font-bold text-slate-400 mr-2">Rs.</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="bg-transparent text-3xl sm:text-4xl font-extrabold text-white font-mono-numbers focus:outline-none w-48 text-center"
                    autoFocus
                  />
                </div>
                <div className="flex items-center justify-center gap-1 mt-1 text-xs text-slate-400">
                  <span>Available Balance:</span>
                  <span className="font-semibold text-emerald-400 font-mono-numbers">
                    {formatPKR(user.balance)}
                  </span>
                </div>
              </div>

              {/* Quick Amount Chips */}
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAmount(q.toString())}
                    className="py-2 px-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500 text-xs font-mono-numbers font-semibold text-slate-300 hover:text-emerald-300 transition-colors"
                  >
                    Rs. {q.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Purpose Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Purpose of Transfer
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  {purposes.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Validation Message */}
              {numAmount > user.balance && (
                <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/80 flex items-center gap-2 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Amount exceeds your available wallet balance.</span>
                </div>
              )}

              <button
                disabled={!isAmountValid}
                onClick={() => setStep(4)}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-sm shadow-lg shadow-emerald-950 transition-all active:scale-95"
              >
                Review Transfer Details
              </button>
            </div>
          )}

          {/* STEP 4: VERIFICATION BOTTOM SHEET / REVIEW */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl flex items-center gap-2 text-amber-200 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>
                  Please double-check the recipient name and account number before confirming.
                </span>
              </div>

              <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Recipient Title</span>
                  <span className="font-bold text-emerald-400 text-sm flex items-center gap-1">
                    {recipientName}
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Account / Mobile</span>
                  <span className="font-mono-numbers font-medium text-slate-200">{accountInput}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Channel</span>
                  <span className="font-medium text-slate-200 uppercase">{destinationType} Instant</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Transfer Purpose</span>
                  <span className="font-medium text-slate-200">{purpose}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Transfer Fee</span>
                  <span className="font-bold text-emerald-400">Rs. 0.00 (Zero Fee)</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-semibold text-slate-300">Total Debit Amount</span>
                  <span className="text-xl font-extrabold text-white font-mono-numbers text-emerald-400">
                    {formatPKR(numAmount)}
                  </span>
                </div>
              </div>

              {/* Save Beneficiary Checkbox */}
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-2 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={saveAsBeneficiary}
                  onChange={(e) => setSaveAsBeneficiary(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-0 w-4 h-4 bg-slate-800 border-slate-700"
                />
                <span>Save to Quick Beneficiaries for 1-tap future transfers</span>
              </label>

              <button
                onClick={() => setStep(5)}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Lock className="w-4 h-4" />
                <span>Confirm & Enter PIN</span>
              </button>
            </div>
          )}

          {/* STEP 5: SECURITY PIN ENTRY */}
          {step === 5 && (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                <Lock className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-base font-bold text-white">Enter 4-Digit Security PIN</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Confirm transfer of <span className="text-emerald-400 font-bold">{formatPKR(numAmount)}</span>
                </p>
              </div>

              {/* PIN Bubbles */}
              <div className="flex items-center justify-center gap-4 my-4">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                      pin.length > i
                        ? 'bg-emerald-400 border-emerald-400 scale-110 shadow-sm shadow-emerald-400/50'
                        : 'border-slate-600 bg-slate-800'
                    }`}
                  />
                ))}
              </div>

              {/* Quick Biometric Touch ID Simulator */}
              <button
                type="button"
                onClick={() => {
                  setPin('1234');
                  processTransaction('1234');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-300 border border-emerald-500/30 transition-all active:scale-95"
              >
                <Fingerprint className="w-4 h-4 text-emerald-400" />
                <span>Use Biometric Fingerprint (Touch ID)</span>
              </button>

              {/* Numeric Keypad (48px+ touch targets) */}
              <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto mt-4">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handlePinInput(digit)}
                    className="h-13 rounded-2xl bg-slate-900 hover:bg-slate-800 text-xl font-bold font-mono-numbers text-white border border-slate-800 active:scale-95 transition-all flex items-center justify-center"
                  >
                    {digit}
                  </button>
                ))}
                <div className="flex items-center justify-center text-xs text-slate-500">
                  Demo PIN: 1234
                </div>
                <button
                  type="button"
                  onClick={() => handlePinInput('0')}
                  className="h-13 rounded-2xl bg-slate-900 hover:bg-slate-800 text-xl font-bold font-mono-numbers text-white border border-slate-800 active:scale-95 transition-all flex items-center justify-center"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handlePinBackspace}
                  className="h-13 rounded-2xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-400 border border-slate-800 active:scale-95 transition-all flex items-center justify-center"
                >
                  ⌫ Delete
                </button>
              </div>

              {isSubmitting && (
                <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 pt-2 animate-pulse">
                  <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <span>Processing instant RAAST settlement...</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 6: DIGITAL RECEIPT */}
          {step === 6 && completedTxn && (
            <div className="space-y-4">
              {/* Green Verified Banner */}
              <div className="text-center py-5 bg-gradient-to-b from-emerald-950/80 to-slate-900 rounded-3xl border border-emerald-500/40 p-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 mx-auto mb-2 shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-xl font-extrabold text-white">Payment Successful!</h3>
                <p className="text-xs text-emerald-300/90 mt-0.5">
                  Raqam kamyabi se muntaqil ho chuki hai
                </p>

                <div className="my-3">
                  <span className="text-3xl font-extrabold text-white font-mono-numbers">
                    {formatPKR(completedTxn.amount)}
                  </span>
                </div>

                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-600/50">
                  <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  RAAST Ref: {completedTxn.raastRef}
                </span>
              </div>

              {/* Receipt Details Table */}
              <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Recipient Name</span>
                  <span className="font-bold text-slate-100">{completedTxn.recipient.name}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Destination</span>
                  <span className="font-medium text-slate-200">
                    {completedTxn.recipient.bankOrWallet}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Account / Mobile</span>
                  <span className="font-mono-numbers text-slate-200">
                    {completedTxn.recipient.accountNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Transaction ID</span>
                  <span className="font-mono-numbers text-slate-300">{completedTxn.id}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Transfer Fee</span>
                  <span className="font-bold text-emerald-400">Rs. 0.00 (Zero Fee)</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Timestamp</span>
                  <span className="text-slate-300">{completedTxn.timestamp}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    const text = getWhatsAppReceiptText(completedTxn);
                    window.open(`https://wa.me/?text=${text}`, '_blank');
                  }}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Receipt on WhatsApp</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
                >
                  Done / Back to Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
