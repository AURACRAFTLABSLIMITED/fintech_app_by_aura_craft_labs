import React from 'react';
import { X, Bell, Zap, Tag, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onClearNotifications: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onClearNotifications,
}) => {
  const notifications = [
    {
      id: 'notif-1',
      type: 'raast',
      title: 'RAAST Money Received: Rs. 25,000',
      description: 'Ayesha Khan sent Rs. 25,000 via SadaPay RAAST to your account. Ref: RST-PK-77291039.',
      time: '15m ago',
      unread: true,
    },
    {
      id: 'notif-2',
      type: 'promo',
      title: '10% Cashback on K-Electric & IESCO Bills',
      description: 'Pay your monthly electricity bill before 28 Aug and earn instant Rs. 500 cashback.',
      time: '2h ago',
      unread: true,
    },
    {
      id: 'notif-3',
      type: 'security',
      title: 'Biometric Login Verified',
      description: 'Successful fingerprint sign-in on iPhone 15 Pro (Islamabad, Pakistan).',
      time: 'Yesterday',
      unread: false,
    },
    {
      id: 'notif-4',
      type: 'sbp',
      title: 'State Bank of Pakistan Annual Limit Advisory',
      description: 'Your Biometric Level 1 wallet allows up to Rs. 200,000 daily & Rs. 1,000,000 monthly.',
      time: '3 days ago',
      unread: false,
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full sm:max-w-md h-full sm:h-auto sm:max-h-[90vh] bg-[#0D1524] border-l sm:border border-slate-700 sm:rounded-3xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClearNotifications}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              Mark all as read
            </button>
            <button onClick={onClose} className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                n.unread
                  ? 'bg-slate-900 border-amber-500/40 shadow-sm'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  {n.type === 'raast' && <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />}
                  {n.type === 'promo' && <Tag className="w-3.5 h-3.5 text-amber-400" />}
                  {n.type === 'security' && <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />}
                  {n.title}
                </span>
                <span className="text-[10px] text-slate-500">{n.time}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{n.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
