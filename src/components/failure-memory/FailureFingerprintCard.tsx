import React from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  History,
  Info,
  Layers,
  Repeat,
  ShieldAlert,
  Wrench,
} from 'lucide-react';
import { FailureFingerprint, MemoryState } from '../../services/failure-memory';

interface FailureFingerprintCardProps {
  fingerprint: FailureFingerprint;
  currentState: MemoryState;
  locationName: string;
  auditExplanation?: string;
  className?: string;
}

export const FailureFingerprintCard: React.FC<FailureFingerprintCardProps> = ({
  fingerprint,
  currentState,
  locationName,
  auditExplanation,
  className = '',
}) => {
  const {
    patternIndex,
    dominantCategory,
    incidentCount,
    repairCount,
    activeIncidentCount,
    averageRecurrenceInterval,
    longestQuietPeriodDays,
    patternIndexMethodology,
  } = fingerprint;

  // Determine state badge styling
  const getStateBadge = (state: MemoryState) => {
    switch (state) {
      case 'PERSISTENT':
        return {
          label: 'PERSISTENT DEFECT',
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
          dot: 'bg-rose-500',
          desc: 'High recurrence pattern with repeated work order interventions.',
        };
      case 'RECURRING':
        return {
          label: 'RECURRING FAILURE',
          bg: 'bg-purple-50 border-purple-200 text-purple-800',
          dot: 'bg-purple-500',
          desc: 'Defect re-emerged following prior municipal repair cycle.',
        };
      case 'RESOLVED':
        return {
          label: 'REMEDIATED / STABILIZED',
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          dot: 'bg-emerald-500',
          desc: 'Historical failure mitigated. Zero active tickets reported.',
        };
      case 'NEW':
      default:
        return {
          label: 'BASELINE RECORD',
          bg: 'bg-sky-50 border-sky-200 text-sky-800',
          dot: 'bg-sky-500',
          desc: 'Initial baseline report with no antecedent failure history.',
        };
    }
  };

  const badgeInfo = getStateBadge(currentState);

  // Meter color according to index
  const getIndexColor = (idx: number) => {
    if (idx >= 75) return 'from-rose-500 to-amber-500';
    if (idx >= 40) return 'from-amber-500 to-indigo-500';
    if (idx > 0) return 'from-indigo-500 to-sky-500';
    return 'from-slate-400 to-slate-500';
  };

  return (
    <div
      id="failure-fingerprint-card"
      className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}
    >
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <History className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Infrastructure Failure Fingerprint
              </h3>
              <p className="text-xs text-slate-500">
                Location memory profile for {locationName} • {dominantCategory}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${badgeInfo.bg}`}
          >
            <span className={`h-2 w-2 rounded-full ${badgeInfo.dot}`} />
            {badgeInfo.label}
          </span>
        </div>
      </div>

      {/* Pattern Index Dial / Bar */}
      <div className="mt-5 rounded-lg border border-slate-100 bg-slate-50/70 p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              CivicPulse Pattern Index
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                {patternIndex}
              </span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
          </div>
          <div className="max-w-[280px] text-right">
            <span className="text-xs font-medium text-slate-700">
              {patternIndexMethodology || 'Composite frequency and interval metric'}
            </span>
            <p className="mt-0.5 text-[11px] text-slate-500 leading-tight">
              Calculated across frequency, interval re-emergence, and open status.
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getIndexColor(
              patternIndex
            )} transition-all duration-500`}
            style={{ width: `${Math.max(4, patternIndex)}%` }}
          />
        </div>
      </div>

      {/* Core Quantitative Metrics Grid */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-200/80 bg-white p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            <span>Total Reports</span>
          </div>
          <div className="mt-1 text-xl font-bold text-slate-900">{incidentCount}</div>
          <div className="text-[11px] text-slate-500">
            {activeIncidentCount > 0 ? `${activeIncidentCount} currently open` : 'All closed'}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-white p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Wrench className="h-3.5 w-3.5 text-indigo-600" />
            <span>Repairs Logged</span>
          </div>
          <div className="mt-1 text-xl font-bold text-slate-900">{repairCount}</div>
          <div className="text-[11px] text-slate-500">
            Work order interventions
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-white p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Repeat className="h-3.5 w-3.5 text-purple-600" />
            <span>Mean Interval</span>
          </div>
          <div className="mt-1 text-xl font-bold text-slate-900">
            {averageRecurrenceInterval !== null ? `${averageRecurrenceInterval}d` : 'N/A'}
          </div>
          <div className="text-[11px] text-slate-500">
            {averageRecurrenceInterval !== null ? 'Between failures' : 'Single occurrence'}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-white p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5 text-slate-600" />
            <span>Max Quiet Gap</span>
          </div>
          <div className="mt-1 text-xl font-bold text-slate-900">
            {longestQuietPeriodDays !== null ? `${longestQuietPeriodDays}d` : 'N/A'}
          </div>
          <div className="text-[11px] text-slate-500">Longest interval logged</div>
        </div>
      </div>

      {/* Audit Justification Statement */}
      {auditExplanation && (
        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
          <div className="leading-relaxed">
            <span className="font-semibold text-slate-900">Auditable Grounding: </span>
            {auditExplanation}
          </div>
        </div>
      )}
    </div>
  );
};
