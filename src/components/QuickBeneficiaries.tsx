import React from 'react';
import { Plus, Star, UserCheck } from 'lucide-react';
import { Beneficiary } from '../types';

interface QuickBeneficiariesProps {
  beneficiaries: Beneficiary[];
  onSelectBeneficiary: (beneficiary: Beneficiary) => void;
  onAddNewBeneficiary: () => void;
  romanUrduAssisted: boolean;
}

export const QuickBeneficiaries: React.FC<QuickBeneficiariesProps> = ({
  beneficiaries,
  onSelectBeneficiary,
  onAddNewBeneficiary,
  romanUrduAssisted,
}) => {
  return (
    <div className="w-full my-3">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          Quick Beneficiaries
          {romanUrduAssisted && (
            <span className="text-[11px] font-normal text-slate-400">(Mehfooz Accounts)</span>
          )}
        </h3>
        <button
          onClick={onAddNewBeneficiary}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New</span>
        </button>
      </div>

      {/* Horizontal Scroll Area */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-1 px-1">
        {/* Quick Add Button */}
        <button
          onClick={onAddNewBeneficiary}
          className="flex-shrink-0 flex flex-col items-center justify-center w-16 sm:w-20 group"
          title="Add New Recipient"
        >
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-700 group-hover:border-emerald-400/80 bg-slate-900/60 flex items-center justify-center text-slate-400 group-hover:text-emerald-300 transition-all">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-200 mt-1.5 text-center leading-tight">
            Add
          </span>
        </button>

        {/* Beneficiaries List */}
        {beneficiaries.map((ben) => {
          const initials = ben.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2);

          return (
            <button
              key={ben.id}
              onClick={() => onSelectBeneficiary(ben)}
              className="flex-shrink-0 flex flex-col items-center w-16 sm:w-20 group active:scale-95 transition-all text-center"
              title={`${ben.name} (${ben.bankOrWallet})`}
            >
              <div className="relative">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-slate-800 group-hover:ring-emerald-400 transition-all"
                  style={{ backgroundColor: ben.avatarBg || '#059669' }}
                >
                  {initials}
                </div>
                {ben.isFavorite && (
                  <span className="absolute -bottom-0.5 -right-0.5 bg-amber-500 rounded-full p-0.5 ring-2 ring-[#0A111E]">
                    <Star className="w-2.5 h-2.5 text-white fill-white" />
                  </span>
                )}
              </div>
              <p className="text-[11px] font-semibold text-slate-200 group-hover:text-emerald-300 mt-1.5 truncate max-w-full">
                {ben.name.split(' ')[0]}
              </p>
              <p className="text-[9px] text-slate-400 truncate max-w-full font-mono-numbers">
                {ben.type === 'raast' ? 'RAAST' : ben.bankOrWallet.split(' ')[0]}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
