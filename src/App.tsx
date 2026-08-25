import React, { useState, useEffect } from 'react';
import {
  Send,
  Home,
  ReceiptText,
  CreditCard,
  User,
  QrCode,
  ShieldCheck,
  Zap,
  Sparkles,
  Search,
} from 'lucide-react';
import { Beneficiary, SavingsPocket, Transaction, UserProfile } from './types';
import {
  initialBeneficiaries,
  initialSavingsPockets,
  initialTransactions,
  initialUserProfile,
} from './data/mockData';
import { Header } from './components/Header';
import { BalanceCard } from './components/BalanceCard';
import { ActionGrid } from './components/ActionGrid';
import { QuickBeneficiaries } from './components/QuickBeneficiaries';
import { RecentTransactions } from './components/RecentTransactions';
import { SendMoneyModal } from './components/SendMoneyModal';
import { MobileLoadModal } from './components/MobileLoadModal';
import { BillPaymentModal } from './components/BillPaymentModal';
import { QRCodeModal } from './components/QRCodeModal';
import { AddMoneyModal } from './components/AddMoneyModal';
import { BachatSavingsModal } from './components/BachatSavingsModal';
import { ZakatDonationsModal } from './components/ZakatDonationsModal';
import { CardManagementModal } from './components/CardManagementModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { ProfileDrawer } from './components/ProfileDrawer';

export default function App() {
  // 1. Persistent State
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('payflow_user_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.name && parsed.name.includes('Hamza')) {
        return initialUserProfile;
      }
      return parsed;
    }
    return initialUserProfile;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('payflow_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(() => {
    const saved = localStorage.getItem('payflow_beneficiaries');
    return saved ? JSON.parse(saved) : initialBeneficiaries;
  });

  const [savingsPockets, setSavingsPockets] = useState<SavingsPocket[]>(() => {
    const saved = localStorage.getItem('payflow_pockets');
    return saved ? JSON.parse(saved) : initialSavingsPockets;
  });

  const [unreadNotifications, setUnreadNotifications] = useState<number>(2);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('payflow_user_profile', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('payflow_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('payflow_beneficiaries', JSON.stringify(beneficiaries));
  }, [beneficiaries]);

  useEffect(() => {
    localStorage.setItem('payflow_pockets', JSON.stringify(savingsPockets));
  }, [savingsPockets]);

  // 2. Modals & Drawers Controls
  const [isSendMoneyOpen, setIsSendMoneyOpen] = useState<boolean>(false);
  const [prefilledRecipient, setPrefilledRecipient] = useState<Beneficiary | null>(null);
  const [isMobileLoadOpen, setIsMobileLoadOpen] = useState<boolean>(false);
  const [isBillPaymentOpen, setIsBillPaymentOpen] = useState<boolean>(false);
  const [isQROpen, setIsQROpen] = useState<boolean>(false);
  const [qrInitialTab, setQrInitialTab] = useState<'my_qr' | 'scan_qr'>('my_qr');
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState<boolean>(false);
  const [isBachatOpen, setIsBachatOpen] = useState<boolean>(false);
  const [isZakatOpen, setIsZakatOpen] = useState<boolean>(false);
  const [isCardsOpen, setIsCardsOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // Active Bottom Nav Tab
  const [activeBottomNav, setActiveBottomNav] = useState<'home' | 'transfers' | 'bills' | 'cards' | 'account'>('home');

  // Handle Action Grid selections
  const handleSelectAction = (actionId: string) => {
    switch (actionId) {
      case 'send_money':
        setPrefilledRecipient(null);
        setIsSendMoneyOpen(true);
        break;
      case 'mobile_load':
        setIsMobileLoadOpen(true);
        break;
      case 'bill_payments':
        setIsBillPaymentOpen(true);
        break;
      case 'qr_pay':
        setQrInitialTab('scan_qr');
        setIsQROpen(true);
        break;
      case 'bachat_savings':
        setIsBachatOpen(true);
        break;
      case 'zakat_donations':
        setIsZakatOpen(true);
        break;
      case 'debit_cards':
        setIsCardsOpen(true);
        break;
      case 'request_money':
        setQrInitialTab('my_qr');
        setIsQROpen(true);
        break;
      default:
        break;
    }
  };

  // Handle successful transfer
  const handleCompleteTransfer = (newTxn: Transaction, saveBeneficiary?: boolean) => {
    // Deduct balance and update limits
    setUser((prev) => ({
      ...prev,
      balance: Math.max(0, prev.balance - newTxn.amount),
      dailyUsed: prev.dailyUsed + newTxn.amount,
      monthlyUsed: prev.monthlyUsed + newTxn.amount,
    }));

    // Prepend transaction
    setTransactions((prev) => [newTxn, ...prev]);

    // Save beneficiary if requested
    if (saveBeneficiary && newTxn.recipient) {
      const exists = beneficiaries.some(
        (b) => b.phoneOrAccount.replace(/\D/g, '') === newTxn.recipient.accountNumber.replace(/\D/g, '')
      );
      if (!exists) {
        const newBen: Beneficiary = {
          id: `ben-${Date.now()}`,
          name: newTxn.recipient.name,
          phoneOrAccount: newTxn.recipient.accountNumber,
          bankOrWallet: newTxn.recipient.bankOrWallet,
          type: newTxn.recipient.type,
          avatarBg: newTxn.recipient.avatarBg || '#059669',
          isFavorite: true,
          lastTransferDate: 'Just now',
        };
        setBeneficiaries((prev) => [newBen, ...prev]);
      }
    }
  };

  // Handle generic transaction from bills, load, or QR
  const handleGenericTransaction = (newTxn: Transaction) => {
    setUser((prev) => {
      const isCredit = newTxn.type === 'add_money' || newTxn.type === 'transfer_receive';
      const newBal = isCredit ? prev.balance + newTxn.amount : Math.max(0, prev.balance - newTxn.amount);
      return {
        ...prev,
        balance: newBal,
        dailyUsed: isCredit ? prev.dailyUsed : prev.dailyUsed + newTxn.amount,
      };
    });

    setTransactions((prev) => [newTxn, ...prev]);
  };

  // Repeat transfer from history
  const handleRepeatTransfer = (txn: Transaction) => {
    const matchingBen = beneficiaries.find(
      (b) => b.phoneOrAccount.replace(/\D/g, '') === txn.recipient.accountNumber.replace(/\D/g, '')
    );
    if (matchingBen) {
      setPrefilledRecipient(matchingBen);
    } else {
      setPrefilledRecipient({
        id: `repeat-${Date.now()}`,
        name: txn.recipient.name,
        phoneOrAccount: txn.recipient.accountNumber,
        bankOrWallet: txn.recipient.bankOrWallet,
        type: txn.recipient.type,
        avatarBg: txn.recipient.avatarBg || '#059669',
        isFavorite: false,
      });
    }
    setIsSendMoneyOpen(true);
  };

  // Reset demo data
  const handleResetDemoData = () => {
    setUser(initialUserProfile);
    setTransactions(initialTransactions);
    setBeneficiaries(initialBeneficiaries);
    setSavingsPockets(initialSavingsPockets);
    localStorage.clear();
  };

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <Header
        user={user}
        unreadNotifications={unreadNotifications}
        onOpenNotifications={() => {
          setIsNotificationsOpen(true);
          setUnreadNotifications(0);
        }}
        onOpenProfile={() => setIsProfileOpen(true)}
        onToggleLanguage={() =>
          setUser((prev) => ({ ...prev, romanUrduAssisted: !prev.romanUrduAssisted }))
        }
      />

      {/* Main Responsive Body Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-4 mb-20 sm:mb-8">
        {/* 1. Privacy Balance Card */}
        <BalanceCard
          user={user}
          onSendMoney={() => {
            setPrefilledRecipient(null);
            setIsSendMoneyOpen(true);
          }}
          onAddMoney={() => setIsAddMoneyOpen(true)}
          onOpenQR={() => {
            setQrInitialTab('my_qr');
            setIsQROpen(true);
          }}
          onOpenLimits={() => setIsProfileOpen(true)}
        />

        {/* 2. Primary 8-Action Services Grid */}
        <ActionGrid
          romanUrduAssisted={user.romanUrduAssisted}
          onSelectAction={handleSelectAction}
        />

        {/* 3. Quick Beneficiaries Favorites Row */}
        <QuickBeneficiaries
          beneficiaries={beneficiaries}
          romanUrduAssisted={user.romanUrduAssisted}
          onSelectBeneficiary={(ben) => {
            setPrefilledRecipient(ben);
            setIsSendMoneyOpen(true);
          }}
          onAddNewBeneficiary={() => {
            setPrefilledRecipient(null);
            setIsSendMoneyOpen(true);
          }}
        />

        {/* 4. Recent Transactions Feed */}
        <RecentTransactions
          transactions={transactions}
          onRepeatTransfer={handleRepeatTransfer}
          romanUrduAssisted={user.romanUrduAssisted}
        />

        {/* Regulatory & Security Assurance Footer Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400 space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>State Bank of Pakistan (SBP) RAAST Certified Digital Wallet</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Encrypted with 256-bit SSL • 1LINK Switch PK • Biometric Level 1 Compliant
          </p>
        </div>
      </main>

      {/* Bottom Navigation Bar (High Ergonomics, 48px+ Touch Targets) */}
      <nav className="fixed bottom-0 inset-x-0 bg-[#0A111E]/95 backdrop-blur-md border-t border-slate-800/90 z-40 py-1.5 px-4 shadow-lg sm:hidden">
        <div className="max-w-md mx-auto grid grid-cols-5 items-center">
          <button
            onClick={() => setActiveBottomNav('home')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeBottomNav === 'home' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Home</span>
          </button>

          <button
            onClick={() => {
              setActiveBottomNav('transfers');
              setPrefilledRecipient(null);
              setIsSendMoneyOpen(true);
            }}
            className="flex flex-col items-center justify-center py-1.5 rounded-xl text-slate-400 hover:text-emerald-300 transition-all"
          >
            <Send className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Send</span>
          </button>

          {/* Center Raised QR Button */}
          <button
            onClick={() => {
              setQrInitialTab('scan_qr');
              setIsQROpen(true);
            }}
            className="flex flex-col items-center justify-center -mt-5 group"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 border-4 border-[#070D18] flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 group-active:scale-90 transition-transform">
              <QrCode className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-emerald-400 mt-0.5">QR Pay</span>
          </button>

          <button
            onClick={() => {
              setActiveBottomNav('bills');
              setIsBillPaymentOpen(true);
            }}
            className="flex flex-col items-center justify-center py-1.5 rounded-xl text-slate-400 hover:text-sky-300 transition-all"
          >
            <ReceiptText className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Bills</span>
          </button>

          <button
            onClick={() => {
              setActiveBottomNav('cards');
              setIsCardsOpen(true);
            }}
            className="flex flex-col items-center justify-center py-1.5 rounded-xl text-slate-400 hover:text-indigo-300 transition-all"
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Card</span>
          </button>
        </div>
      </nav>

      {/* MODALS AND DRAWERS */}
      <SendMoneyModal
        isOpen={isSendMoneyOpen}
        onClose={() => {
          setIsSendMoneyOpen(false);
          setPrefilledRecipient(null);
        }}
        user={user}
        beneficiaries={beneficiaries}
        prefilledRecipient={prefilledRecipient}
        onCompleteTransfer={handleCompleteTransfer}
      />

      <MobileLoadModal
        isOpen={isMobileLoadOpen}
        onClose={() => setIsMobileLoadOpen(false)}
        user={user}
        onCompleteLoad={handleGenericTransaction}
      />

      <BillPaymentModal
        isOpen={isBillPaymentOpen}
        onClose={() => setIsBillPaymentOpen(false)}
        user={user}
        onCompletePayment={handleGenericTransaction}
      />

      <QRCodeModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
        user={user}
        initialTab={qrInitialTab}
        onCompleteQRPay={handleGenericTransaction}
      />

      <AddMoneyModal
        isOpen={isAddMoneyOpen}
        onClose={() => setIsAddMoneyOpen(false)}
        user={user}
        onCompleteAddMoney={handleGenericTransaction}
      />

      <BachatSavingsModal
        isOpen={isBachatOpen}
        onClose={() => setIsBachatOpen(false)}
        user={user}
        pockets={savingsPockets}
        onUpdatePockets={setSavingsPockets}
        onPocketTransaction={handleGenericTransaction}
      />

      <ZakatDonationsModal
        isOpen={isZakatOpen}
        onClose={() => setIsZakatOpen(false)}
        user={user}
        onCompleteDonation={handleGenericTransaction}
      />

      <CardManagementModal
        isOpen={isCardsOpen}
        onClose={() => setIsCardsOpen(false)}
        user={user}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onClearNotifications={() => setUnreadNotifications(0)}
      />

      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onToggleLanguage={() =>
          setUser((prev) => ({ ...prev, romanUrduAssisted: !prev.romanUrduAssisted }))
        }
        onToggleBiometrics={() =>
          setUser((prev) => ({ ...prev, isBiometricEnabled: !prev.isBiometricEnabled }))
        }
        onResetDemoData={handleResetDemoData}
      />
    </div>
  );
}
