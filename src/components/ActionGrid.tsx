import React from 'react';
import {
  Send,
  Smartphone,
  ReceiptText,
  QrCode,
  PiggyBank,
  HeartHandshake,
  CreditCard,
  UserCheck,
  Zap,
} from 'lucide-react';

interface ActionGridProps {
  romanUrduAssisted: boolean;
  onSelectAction: (action: string) => void;
}

export const ActionGrid: React.FC<ActionGridProps> = ({
  romanUrduAssisted,
  onSelectAction,
}) => {
  const actions = [
    {
      id: 'send_money',
      title: 'Send Money',
      urduTitle: 'رقم بھیجیں',
      subtitle: 'RAAST / Bank / CNIC',
      icon: Send,
      badge: 'Zero Fee',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-950/60 border-emerald-800/60',
    },
    {
      id: 'mobile_load',
      title: 'Mobile Load',
      urduTitle: 'موبائل لوڈ و پیکجز',
      subtitle: 'Jazz, Zong, Telenor, Ufone',
      icon: Smartphone,
      badge: 'Super Cards',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-950/60 border-amber-800/60',
    },
    {
      id: 'bill_payments',
      title: 'Bill Payments',
      urduTitle: 'یوٹیلیٹی بلز',
      subtitle: 'Electricity, Gas, Net',
      icon: ReceiptText,
      badge: '1LINK Pay',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      iconColor: 'text-sky-400',
      iconBg: 'bg-sky-950/60 border-sky-800/60',
    },
    {
      id: 'qr_pay',
      title: 'Scan & Pay',
      urduTitle: 'کیو آر اسکین',
      subtitle: 'Merchants & RAAST QR',
      icon: QrCode,
      badge: 'Instant',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-950/60 border-purple-800/60',
    },
    {
      id: 'bachat_savings',
      title: 'Bachat Pockets',
      urduTitle: 'بچت و روزانہ منافع',
      subtitle: 'Halal Profit 11.5% p.a.',
      icon: PiggyBank,
      badge: 'Daily Profit',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      iconColor: 'text-teal-400',
      iconBg: 'bg-teal-950/60 border-teal-800/60',
    },
    {
      id: 'zakat_donations',
      title: 'Zakat & Sadqah',
      urduTitle: 'زکوٰۃ و عطیات',
      subtitle: 'Edhi, Shaukat Khanum',
      icon: HeartHandshake,
      badge: 'Verified',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-950/60 border-rose-800/60',
    },
    {
      id: 'debit_cards',
      title: 'PayFlow Cards',
      urduTitle: 'ڈیبٹ کارڈ مینجمنٹ',
      subtitle: 'PayPak & Virtual Debit',
      icon: CreditCard,
      badge: 'NFC Active',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      iconColor: 'text-indigo-400',
      iconBg: 'bg-indigo-950/60 border-indigo-800/60',
    },
    {
      id: 'request_money',
      title: 'Request Money',
      urduTitle: 'رقم کی درخواست',
      subtitle: 'Split Bills & QR Link',
      icon: UserCheck,
      badge: 'P2P',
      badgeColor: 'bg-slate-700/60 text-slate-300 border-slate-600',
      iconColor: 'text-slate-300',
      iconBg: 'bg-slate-800/80 border-slate-700',
    },
  ];

  return (
    <div className="w-full my-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-1.5">
            Financial Services
            {romanUrduAssisted && (
              <span className="text-xs font-normal text-emerald-400">(Khadmaat)</span>
            )}
          </h3>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/60">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>RAAST Enabled</span>
        </div>
      </div>

      {/* Grid of 8 Services */}
      <div className="grid grid-cols-4 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              id={`service-btn-${action.id}`}
              onClick={() => onSelectAction(action.id)}
              className="group relative flex flex-col items-center justify-between p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0A111E] border border-slate-800/90 hover:border-emerald-500/40 text-center transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-sm min-h-[96px] sm:min-h-[114px]"
            >
              {/* Optional Top Badge for Small Screen or Tablet */}
              {action.badge && (
                <span
                  className={`hidden sm:inline-block absolute top-2 right-2 text-[9px] font-semibold px-1.5 py-0.2 rounded border ${action.badgeColor}`}
                >
                  {action.badge}
                </span>
              )}

              {/* Icon Bubble */}
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border shadow-inner transition-transform group-hover:scale-105 ${action.iconBg}`}
              >
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${action.iconColor}`} />
              </div>

              {/* Text Labels */}
              <div className="w-full mt-1.5">
                <p className="text-[11px] sm:text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition-colors leading-tight line-clamp-1">
                  {action.title}
                </p>
                {romanUrduAssisted ? (
                  <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 truncate">
                    {action.urduTitle}
                  </p>
                ) : (
                  <p className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5 truncate">
                    {action.subtitle}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
