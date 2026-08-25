import React from 'react';
import { Bell, ShieldCheck, User, Sparkles, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile;
  unreadNotifications: number;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onToggleLanguage: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  unreadNotifications,
  onOpenNotifications,
  onOpenProfile,
  onToggleLanguage,
}) => {
  return (
    <header className="w-full bg-[#0A111E] text-white pt-4 pb-3 px-4 sm:px-6 sticky top-0 z-30 border-b border-slate-800/80 shadow-md">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Left: User Profile & Greeting */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={onOpenProfile}>
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-base shadow-sm ring-2 ring-emerald-400/30 group-hover:ring-emerald-400 transition-all">
              {user.avatarInitials}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 rounded-full p-0.5 ring-2 ring-[#0A111E]" title="Biometric Verified">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm sm:text-base font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors">
                {user.name}
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/50">
                <ShieldCheck className="w-3 h-3" />
                {user.tier}
              </span>
              <span className="hidden sm:inline text-slate-500">•</span>
              <span className="hidden sm:inline text-slate-400 font-mono-numbers">{user.phone}</span>
            </div>
          </div>
        </div>

        {/* Right: Actions (Language toggle, Notifications, Profile) */}
        <div className="flex items-center gap-2">
          {/* Roman Urdu / English Toggle */}
          <button
            id="lang-toggle-btn"
            onClick={onToggleLanguage}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              user.romanUrduAssisted
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Toggle Urdu Assistance"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="tracking-wide">
              {user.romanUrduAssisted ? 'Roman Urdu: ON' : 'English'}
            </span>
          </button>

          {/* Notifications Button */}
          <button
            id="notification-bell-btn"
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 text-slate-300 hover:text-white transition-all active:scale-95"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-amber-500 text-[#0A111E] font-bold text-[10px] rounded-full flex items-center justify-center ring-2 ring-[#0A111E] animate-pulse">
                {unreadNotifications}
              </span>
            )}
          </button>

          {/* Profile Details Button */}
          <button
            id="profile-trigger-btn"
            onClick={onOpenProfile}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 text-slate-300 hover:text-white transition-all active:scale-95 hidden sm:flex"
            aria-label="Profile"
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
