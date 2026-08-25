import React, { useState } from 'react';
import { X, HeartHandshake, Calculator, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { CharityOrg, Transaction, UserProfile } from '../types';
import { charityOrganizations } from '../data/mockData';
import { formatPKR, generateTxnId, triggerPaymentCelebration } from '../utils/formatters';

interface ZakatDonationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onCompleteDonation: (newTxn: Transaction) => void;
}

export const ZakatDonationsModal: React.FC<ZakatDonationsModalProps> = ({
  isOpen,
  onClose,
  user,
  onCompleteDonation,
}) => {
  const [activeTab, setActiveTab] = useState<'donate' | 'calculator'>('donate');
  const [selectedCharity, setSelectedCharity] = useState<CharityOrg>(charityOrganizations[0]);
  const [donationAmount, setDonationAmount] = useState<string>('2000');
  const [donationType, setDonationType] = useState<'zakat' | 'sadqah'>('zakat');

  // Calculator states
  const [cashSavings, setCashSavings] = useState<string>('250000');
  const [goldGrams, setGoldGrams] = useState<string>('0');
  const [silverGrams, setSilverGrams] = useState<string>('0');
  const [businessAssets, setBusinessAssets] = useState<string>('0');
  const [liabilities, setLiabilities] = useState<string>('0');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successTxn, setSuccessTxn] = useState<Transaction | null>(null);

  if (!isOpen) return null;

  // Nisab approximate values (PKR): Gold ~Rs. 24,000/g, Silver ~Rs. 2,800/tola
  const goldRatePerGram = 24500;
  const silverRatePerGram = 310;

  const totalWealth =
    (parseFloat(cashSavings) || 0) +
    (parseFloat(goldGrams) || 0) * goldRatePerGram +
    (parseFloat(silverGrams) || 0) * silverRatePerGram +
    (parseFloat(businessAssets) || 0) -
    (parseFloat(liabilities) || 0);

  const calculatedZakat = Math.max(0, Math.round(totalWealth * 0.025));

  const handlePayDonation = () => {
    const num = parseFloat(donationAmount);
    if (!num || num <= 0 || num > user.balance) return;

    setIsProcessing(true);

    setTimeout(() => {
      const newTxn: Transaction = {
        id: generateTxnId(),
        type: 'zakat_donation',
        title: `${selectedCharity.name}`,
        subtitle: `${donationType === 'zakat' ? 'Zakat Fund' : 'Sadqah / General Donation'} • Verified Tax Exempt`,
        amount: num,
        timestamp: 'Just now',
        status: 'completed',
        recipient: {
          name: selectedCharity.name,
          accountNumber: selectedCharity.id,
          bankOrWallet: 'Verified Pakistani Charity',
          type: 'bank',
          avatarBg: selectedCharity.color,
          verified: true,
        },
        fee: 0.0,
        purpose: donationType === 'zakat' ? 'Zakatul Maal' : 'Sadqah Jariyah',
        category: 'Donations',
      };

      setIsProcessing(false);
      setSuccessTxn(newTxn);
      triggerPaymentCelebration();
      onCompleteDonation(newTxn);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#0D1524] border border-slate-700 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-rose-950/70 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Zakat & Sadqah Hub</h3>
              <p className="text-xs text-slate-400">100% Direct Delivery to Verified Shariah Charities</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-4 pt-3">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('donate')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'donate'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Direct Donation
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'calculator'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Zakat Calculator (2.5%)
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {successTxn ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">JazakAllah! Donation Sent</h3>
              <p className="text-xs text-slate-300">
                Transferred to <span className="text-rose-400 font-bold">{selectedCharity.name}</span>
              </p>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                Donation Amount: <span className="font-bold text-emerald-400 font-mono-numbers">{formatPKR(successTxn.amount)}</span>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
              >
                Close / Done
              </button>
            </div>
          ) : activeTab === 'donate' ? (
            <>
              {/* Charity Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Shariah-Verified Organization
                </label>
                <div className="space-y-2">
                  {charityOrganizations.map((charity) => (
                    <div
                      key={charity.id}
                      onClick={() => setSelectedCharity(charity)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedCharity.id === charity.id
                          ? 'bg-rose-950/40 border-rose-500 ring-1 ring-rose-500'
                          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-extrabold text-white"
                            style={{ backgroundColor: charity.color }}
                          >
                            {charity.logoText}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">{charity.name}</h4>
                            <p className="text-[10px] text-slate-400">{charity.urduName}</p>
                          </div>
                        </div>
                        <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded-full font-bold">
                          Tax Exempt
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-1">{charity.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fund Type & Amount */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDonationType('zakat')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    donationType === 'zakat'
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Zakat Fund (Farz)
                </button>
                <button
                  type="button"
                  onClick={() => setDonationType('sadqah')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    donationType === 'sadqah'
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Sadqah / General Fund
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Donation Amount (PKR)
                </label>
                <input
                  type="number"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 font-mono-numbers text-lg font-bold text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <button
                disabled={isProcessing || !donationAmount || parseFloat(donationAmount) <= 0}
                onClick={handlePayDonation}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm shadow-lg shadow-rose-950 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Donate {formatPKR(parseFloat(donationAmount) || 0)}</span>
                )}
              </button>
            </>
          ) : (
            /* TAB 2: CALCULATOR */
            <div className="space-y-3">
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400">Total Net Eligible Wealth:</span>
                <p className="text-xl font-bold text-white font-mono-numbers">
                  {formatPKR(Math.max(0, totalWealth))}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 mt-2">
                  <span className="font-semibold text-rose-300">Payable Zakat (2.5%):</span>
                  <span className="text-lg font-extrabold text-emerald-400 font-mono-numbers">
                    {formatPKR(calculatedZakat)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-slate-400 mb-0.5">Cash in Hand & Bank Accounts (PKR)</label>
                  <input
                    type="number"
                    value={cashSavings}
                    onChange={(e) => setCashSavings(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-white font-mono-numbers"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-0.5">Gold Weight (Grams)</label>
                  <input
                    type="number"
                    value={goldGrams}
                    onChange={(e) => setGoldGrams(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-white font-mono-numbers"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-0.5">Silver Weight (Grams)</label>
                  <input
                    type="number"
                    value={silverGrams}
                    onChange={(e) => setSilverGrams(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-white font-mono-numbers"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  setDonationAmount(calculatedZakat.toString());
                  setActiveTab('donate');
                }}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all"
              >
                Use Calculated Zakat ({formatPKR(calculatedZakat)}) to Donate
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
