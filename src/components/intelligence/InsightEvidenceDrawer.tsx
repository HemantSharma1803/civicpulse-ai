import React from 'react';
import {
  X,
  ShieldCheck,
  Calculator,
  ExternalLink,
  Layers,
  MapPin,
  Calendar,
  AlertCircle,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { IntelligenceInsight } from '../../services/intelligence/types';
import { useCivicPulse } from '../../context/CivicPulseContext';

interface InsightEvidenceDrawerProps {
  insight: IntelligenceInsight | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InsightEvidenceDrawer: React.FC<InsightEvidenceDrawerProps> = ({
  insight,
  isOpen,
  onClose,
}) => {
  const { setSelectedIncidentId } = useCivicPulse();

  if (!isOpen || !insight) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden border-l border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono-code uppercase font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                {insight.badgeText || 'Audit Log'}
              </span>
              <span className="text-[11px] font-mono-code text-slate-500">
                Traceability ID: {insight.id}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              Why Am I Seeing This Insight?
            </h3>
            <p className="text-xs text-slate-600">
              Complete mathematical derivation, sample sizes, and underlying evidence records.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
            title="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary Banner */}
          <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-2">
            <div className="flex items-center gap-2 text-indigo-900 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Grounded Empirical Truth</span>
            </div>
            <p className="text-xs text-indigo-950 leading-relaxed">
              {insight.explanation}
            </p>
          </div>

          {/* Mathematical Formulations & Baseline Deltas */}
          {insight.observed?.metrics && insight.observed.metrics.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-slate-500" />
                  Calculated Metrics & Benchmark Deltas
                </span>
                <span className="text-[11px] font-mono-code text-slate-500">
                  Time Window: {insight.observed.timeWindowDays || 60} Days
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {insight.observed.metrics.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5"
                  >
                    <div className="text-[11px] font-medium text-slate-500">{m.label}</div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-extrabold text-slate-900 font-mono-code">
                        {m.value}
                      </span>
                      {m.delta && (
                        <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                          {m.delta}
                        </span>
                      )}
                    </div>
                    {m.baseline && (
                      <div className="text-[11px] text-slate-500">
                        Baseline: <strong className="text-slate-700">{m.baseline}</strong>
                      </div>
                    )}
                    {m.formula && (
                      <div className="text-[10px] font-mono-code text-slate-400 bg-white p-1 rounded border border-slate-100">
                        fx: {m.formula}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Factual Observations Log */}
          {insight.observed?.facts && insight.observed.facts.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-slate-500" />
                Empirical Observations
              </span>
              <ul className="space-y-2">
                {insight.observed.facts.map((fact, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/70 flex items-start gap-2.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Corroborating Linked Incident Records */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-500" />
                Linked Incidents ({insight.relatedIncidentIds.length})
              </span>
              <span className="text-[11px] text-indigo-600 font-medium">
                Click to inspect incident
              </span>
            </div>

            <div className="space-y-2">
              {insight.evidenceRecords && insight.evidenceRecords.length > 0 ? (
                insight.evidenceRecords.map((rec) => (
                  <div
                    key={rec.incidentId}
                    onClick={() => {
                      setSelectedIncidentId(rec.incidentId);
                      onClose();
                    }}
                    className="p-3 bg-white hover:bg-indigo-50/40 rounded-xl border border-slate-200 cursor-pointer transition-all hover:border-indigo-300 flex items-center justify-between group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono-code text-indigo-700">
                          {rec.incidentId}
                        </span>
                        <span className="text-xs font-semibold text-slate-800">
                          {rec.title}
                        </span>
                        <span className="text-[10px] uppercase font-mono-code px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {rec.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {rec.address}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(rec.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0 transition-colors" />
                  </div>
                ))
              ) : (
                <div className="flex flex-wrap gap-2">
                  {insight.relatedIncidentIds.map((id) => (
                    <button
                      key={id}
                      onClick={() => {
                        setSelectedIncidentId(id);
                        onClose();
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-100 text-slate-800 hover:text-indigo-900 font-mono-code text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center gap-1"
                    >
                      <span>{id}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Analytical Limitations & Boundary Warnings */}
          {insight.limitations && insight.limitations.length > 0 && (
            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                <span>Analytical Caveats & Data Limitations</span>
              </div>
              <ul className="space-y-1 text-xs text-amber-950">
                {insight.limitations.map((lim, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{lim}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Engine Source:{' '}
            <strong className="text-slate-800 font-mono-code">
              {insight.source || 'deterministic'}
            </strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
          >
            Done Inspecting
          </button>
        </div>
      </div>
    </div>
  );
};
