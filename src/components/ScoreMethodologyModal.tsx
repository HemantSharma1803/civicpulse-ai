import React from 'react';
import { X, Calculator, ShieldCheck, ArrowRight } from 'lucide-react';
import { useCivicPulse } from '../context/CivicPulseContext';
import { dataService } from '../services/dataService';

export const ScoreMethodologyModal: React.FC = () => {
  const {
    isMethodologyModalOpen,
    setIsMethodologyModalOpen,
    methodologyCategory,
    categoryHealth,
  } = useCivicPulse();

  if (!isMethodologyModalOpen) return null;

  const currentCategoryHealth = categoryHealth.find((c) => c.category === methodologyCategory);
  const methodology = dataService.getScoreMethodology(methodologyCategory);

  return (
    <div
      id="score-methodology-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => setIsMethodologyModalOpen(false)}
    >
      <div
        id="score-methodology-card"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                Transparent Health Score Methodology
              </h2>
              <p className="text-[11px] text-slate-500">
                Formula derived mathematically from active tickets, recurrence & severity weights
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMethodologyModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-800">
                {currentCategoryHealth?.label || methodologyCategory}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Calculated Infrastructure Health Score
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono-code text-indigo-600">
                {methodology.finalScore}
              </span>
              <span className="text-[10px] text-slate-400 block font-semibold">/ 100 PTS</span>
            </div>
          </div>

          {/* Mathematical Formula Breakdown */}
          <div className="space-y-2 text-xs">
            <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
              Mathematical Derivation Formula
            </span>
            <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono-code text-[11px] leading-relaxed">
              Health_Score = 100 - (Active × 6) - (Recurring × 7) - (Critical × 8 + High × 4)
            </div>
          </div>

          {/* Deductions Table */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-slate-50">
              <span className="text-slate-600">Base Optimal Infrastructure Baseline</span>
              <span className="font-mono-code font-bold text-slate-900">+100 pts</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-rose-50 text-rose-900">
              <span>Active Unresolved Tickets Deduction</span>
              <span className="font-mono-code font-bold">-{methodology.activeDeduction} pts</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-purple-50 text-purple-900">
              <span>Recurrence Penalty (Repeated Failures)</span>
              <span className="font-mono-code font-bold">-{methodology.recurrenceDeduction} pts</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-amber-50 text-amber-900">
              <span>Severity Weight Multiplier</span>
              <span className="font-mono-code font-bold">-{methodology.durationDeduction} pts</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold">
              <span>Resulting Derived Score</span>
              <span className="font-mono-code text-sm">{methodology.finalScore} / 100</span>
            </div>
          </div>

          {/* Audit Statement */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verifiable & Explainable Civic Metric</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              {methodology.explanation}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setIsMethodologyModalOpen(false)}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close Methodology
          </button>
        </div>
      </div>
    </div>
  );
};
