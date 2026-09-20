import React, { useState } from 'react';
import {
  X,
  FileText,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Building2,
  TrendingDown,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ExecutiveBriefing } from '../../services/intelligence/types';

interface ExecutiveBriefingModalProps {
  briefing: ExecutiveBriefing | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExecutiveBriefingModal: React.FC<ExecutiveBriefingModalProps> = ({
  briefing,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !briefing) return null;

  const handleCopy = () => {
    const text = `CIVICPULSE AI — EXECUTIVE INFRASTRUCTURE BRIEFING
Generated: ${new Date(briefing.generatedAt).toLocaleString()}
City: ${briefing.city}
Prepared For: ${briefing.preparedFor}

SYSTEM RESILIENCE INDEX: ${briefing.systemHealthIndex}/100
Active Anomalies: ${briefing.activeAnomaliesCount}
Chronic Corridors: ${briefing.chronicCorridorsCount}

EXECUTIVE SUMMARY:
${briefing.executiveSummary}

URGENT INTERVENTIONS:
${briefing.urgentInterventions
  .map(
    (u) =>
      `• [${u.severity.toUpperCase()}] ${u.title} (${u.corridorOrZone}) - Lead: ${u.leadDepartment}\n  Action: ${u.requiredAction}`
  )
  .join('\n')}

CROSS-DEPARTMENT MANDATES:
${briefing.crossDepartmentMandates
  .map(
    (m) =>
      `• Agencies: ${m.departments.join(' + ')}\n  Issue: ${m.issue}\n  Directive: ${m.jointDirective}`
  )
  .join('\n\n')}

DATA INTEGRITY:
Coverage Score: ${briefing.dataIntegrityReport.coverageScore}% | Total Records: ${briefing.dataIntegrityReport.totalIncidentsAnalyzed}
Blind Spots: ${briefing.dataIntegrityReport.blindSpots.join('; ')}
`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Control Buttons */}
        <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-code uppercase font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                INTERNAL MUNICIPAL BRIEFING
              </span>
              <span className="text-[11px] font-mono-code text-slate-500">
                {new Date(briefing.generatedAt).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Executive Infrastructure Health & Vulnerability Audit
            </h2>
            <p className="text-xs text-slate-600">
              Prepared for {briefing.preparedFor} • {briefing.city} Municipal Corporation
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Score Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-1">
              <span className="text-[10px] font-mono-code uppercase font-semibold text-slate-400">
                System Resilience Index
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono-code">
                  {briefing.systemHealthIndex}
                </span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <span className="text-[11px] text-amber-400 font-medium block">
                Moderate Risk Level
              </span>
            </div>

            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono-code uppercase font-semibold text-rose-700">
                Active Anomalies
              </span>
              <div className="text-3xl font-extrabold text-rose-900 font-mono-code">
                {briefing.activeAnomaliesCount}
              </div>
              <span className="text-[11px] text-rose-800 font-medium block">
                Surge & Siltation Outliers
              </span>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono-code uppercase font-semibold text-amber-800">
                Chronic Corridors
              </span>
              <div className="text-3xl font-extrabold text-amber-900 font-mono-code">
                {briefing.chronicCorridorsCount}
              </div>
              <span className="text-[11px] text-amber-800 font-medium block">
                Tonk, Gopalpura, Bapu Nagar
              </span>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono-code uppercase font-semibold text-emerald-700">
                Data Verification
              </span>
              <div className="text-2xl font-extrabold text-emerald-900 font-mono-code">
                {briefing.dataIntegrityReport.coverageScore}%
              </div>
              <span className="text-[11px] text-emerald-800 font-medium block">
                {briefing.dataIntegrityReport.totalIncidentsAnalyzed} Verified Incident Records
              </span>
            </div>
          </div>

          {/* Executive Summary Block */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono-code block">
              Director's Executive Summary
            </span>
            <p className="text-xs text-slate-800 leading-relaxed">
              {briefing.executiveSummary}
            </p>
          </div>

          {/* Urgent Interventions Matrix */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono-code block">
              Immediate Priority Interventions
            </span>
            <div className="space-y-2.5">
              {briefing.urgentInterventions.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold font-mono-code px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                        {item.severity}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600">
                      <strong>Location:</strong> {item.corridorOrZone} • <strong>Lead Dept:</strong>{' '}
                      {item.leadDepartment}
                    </p>
                    <p className="text-xs text-indigo-950 bg-indigo-50/60 p-2 rounded-lg border border-indigo-100/60 mt-1">
                      <strong>Directive:</strong> {item.requiredAction}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cross-Department Joint Mandates */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono-code block">
              Cross-Agency Joint Directives
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {briefing.crossDepartmentMandates.map((m, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-indigo-700 font-mono-code">
                      {m.departments.join(' + ')}
                    </div>
                    <div className="text-xs font-semibold text-slate-900">{m.issue}</div>
                  </div>
                  <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/80 leading-relaxed">
                    {m.jointDirective}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Data Integrity & Blind Spots */}
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 font-mono-code block">
              Data Governance & Analytical Blind Spots
            </span>
            <ul className="space-y-1 text-xs text-amber-950">
              {briefing.dataIntegrityReport.blindSpots.map((spot, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{spot}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>CivicPulse City Intelligence Protocol v5.2</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
          >
            Close Briefing
          </button>
        </div>
      </div>
    </div>
  );
};
