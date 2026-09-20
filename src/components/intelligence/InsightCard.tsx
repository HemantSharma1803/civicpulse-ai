import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Activity,
  Layers,
  HelpCircle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  AlertCircle,
  Compass,
} from 'lucide-react';
import { IntelligenceInsight, InsightStatus } from '../../services/intelligence/types';
import { useCivicPulse } from '../../context/CivicPulseContext';

interface InsightCardProps {
  insight: IntelligenceInsight;
  onInspectEvidence: (insight: IntelligenceInsight) => void;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight, onInspectEvidence }) => {
  const { updateInsightLifecycleStatus, setCurrentPage, setSelectedIncidentId } = useCivicPulse();
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const severityColors = {
    critical: 'bg-rose-50 text-rose-700 border-rose-200',
    high: 'bg-amber-50 text-amber-800 border-amber-200',
    medium: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    low: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const statusStyles: Record<InsightStatus, { bg: string; text: string; label: string }> = {
    active: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Active' },
    acknowledged: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Acknowledged' },
    investigating: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', label: 'Investigating' },
    actioned: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', label: 'Actioned' },
    dismissed: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-500', label: 'Dismissed' },
  };

  const currentStatus = insight.status || 'active';
  const statusInfo = statusStyles[currentStatus];

  const handleStatusSelect = (newStatus: InsightStatus) => {
    updateInsightLifecycleStatus(insight.id, newStatus);
    setIsStatusDropdownOpen(false);
  };

  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-5">
      {/* Top Meta Bar */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-mono-code font-bold uppercase px-2.5 py-0.5 rounded-md border ${
                severityColors[insight.severity || 'medium']
              }`}
            >
              {insight.badgeText || 'CIVICPULSE INSIGHT'}
            </span>

            {insight.zone && (
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-slate-400" />
                {insight.zone}
              </span>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${statusInfo.bg} ${statusInfo.text}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span>{statusInfo.label}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {isStatusDropdownOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20 text-xs">
                {(['active', 'acknowledged', 'investigating', 'actioned', 'dismissed'] as InsightStatus[]).map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusSelect(st)}
                      className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 capitalize font-medium ${
                        currentStatus === st ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Title & Core Explanation */}
        <div>
          <h3 className="text-base font-bold text-slate-900 leading-snug">
            {insight.title}
          </h3>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            {insight.explanation}
          </p>
        </div>

        {/* --- SECTION 1: OBSERVED METRICS & FACTS --- */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono-code flex items-center gap-1">
              <Activity className="w-3 h-3 text-slate-400" />
              1. OBSERVED DATA & DELTAS
            </span>
            <span className="text-[10px] text-slate-400 font-mono-code">
              {insight.relatedIncidentCount} incidents correlated
            </span>
          </div>

          {insight.observed?.metrics && insight.observed.metrics.length > 0 && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              {insight.observed.metrics.slice(0, 2).map((m, idx) => (
                <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200/60 space-y-0.5">
                  <div className="text-[10px] text-slate-500 truncate">{m.label}</div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-bold text-slate-900 font-mono-code">{m.value}</span>
                    {m.delta && (
                      <span className="text-[10px] font-semibold text-amber-700">{m.delta}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {insight.observed?.facts && insight.observed.facts[0] && (
            <p className="text-[11px] text-slate-700 leading-relaxed font-mono-code bg-white p-2 rounded-lg border border-slate-200/60">
              • {insight.observed.facts[0]}
            </p>
          )}
        </div>

        {/* --- SECTION 2: INTERPRETATION (ROOT CAUSE) --- */}
        <div className="p-3.5 bg-indigo-50/40 rounded-xl border border-indigo-100/80 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 font-mono-code flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            2. INTERPRETATION & ROOT CAUSE
          </span>
          <p className="text-xs text-slate-800 leading-relaxed">
            {insight.interpretation || insight.explanation}
          </p>
        </div>

        {/* Assigned Agency / Lead Dept */}
        {insight.assignedDepartment && (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-700">{insight.assignedDepartment}</span>
          </div>
        )}

        {/* --- SECTION 3: LIMITATION NOTICE --- */}
        {insight.limitations && insight.limitations.length > 0 && (
          <div className="text-[11px] text-amber-900 bg-amber-50/60 p-2 rounded-lg border border-amber-200/60 flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
            <span className="leading-tight">
              <strong>Caveat:</strong> {insight.limitations[0]}
            </span>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={() => onInspectEvidence(insight)}
          className="text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center gap-1.5 transition-colors group"
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
          <span>Why am I seeing this?</span>
        </button>

        <div className="flex items-center gap-2">
          {insight.relatedIncidentIds[0] && (
            <button
              onClick={() => setSelectedIncidentId(insight.relatedIncidentIds[0])}
              className="text-xs font-semibold px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
            >
              <span>Inspect {insight.relatedIncidentIds[0]}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setCurrentPage('city-intelligence')}
            className="text-xs font-bold px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1"
          >
            <span>View on Map</span>
          </button>
        </div>
      </div>
    </div>
  );
};
