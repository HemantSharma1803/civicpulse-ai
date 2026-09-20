import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  History,
  Building2,
  PlusCircle,
  ArrowRight,
  Sparkles,
  MapPin,
  ShieldAlert,
} from 'lucide-react';
import { Incident } from '../../types';

interface SubmissionSuccessStepProps {
  createdIncident: Incident;
  onViewIncident: (id: string) => void;
  onViewFailureMemory: () => void;
  onGoToCityIntelligence: () => void;
  onReportAnother: () => void;
}

export const SubmissionSuccessStep: React.FC<SubmissionSuccessStepProps> = ({
  createdIncident,
  onViewIncident,
  onViewFailureMemory,
  onGoToCityIntelligence,
  onReportAnother,
}) => {
  const [copied, setCopied] = useState(false);

  const copyId = () => {
    navigator.clipboard.writeText(createdIncident.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasLinkedHistory = createdIncident.relatedIncidentIds.length > 0;

  return (
    <div className="space-y-6 py-4">
      {/* Top Banner */}
      <div className="p-8 border border-emerald-200 bg-emerald-50/50 rounded-2xl text-center space-y-4 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-1 max-w-md mx-auto">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Incident remembered.
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your report has been structured, corroborated against spatial history, and registered in CivicPulse infrastructure memory.
          </p>
        </div>

        {/* Incident ID Token */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-emerald-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">INCIDENT TRACKING ID:</span>
          <span className="font-mono font-bold text-sm text-indigo-700">
            {createdIncident.id}
          </span>
          <button
            type="button"
            onClick={copyId}
            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
            title="Copy Incident ID"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Summary Matrix */}
      <div className="p-5 border border-slate-200 rounded-xl bg-white space-y-4 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Registered Memory Record
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Category & Severity
            </span>
            <span className="font-bold text-slate-900 block truncate">
              {createdIncident.category}
            </span>
            <span className="text-[11px] text-slate-500 capitalize">
              {createdIncident.severity} Severity
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Location & Zone
            </span>
            <span className="font-bold text-slate-900 block truncate">
              {createdIncident.address}
            </span>
            <span className="text-[11px] text-slate-500 truncate block">
              {createdIncident.zone}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Memory Connection
            </span>
            <span className={`font-bold block truncate ${hasLinkedHistory ? 'text-amber-700' : 'text-emerald-700'}`}>
              {hasLinkedHistory ? 'Connected Lineage' : 'New Baseline Node'}
            </span>
            <span className="text-[11px] text-slate-500">
              {hasLinkedHistory
                ? `${createdIncident.relatedIncidentIds.length} historically linked events`
                : 'Zero previous complaints'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Classification Source
            </span>
            <span className="font-bold text-slate-900 block font-mono text-[11px]">
              {createdIncident.classificationSource || 'AI_CONFIRMED'}
            </span>
            <span className="text-[11px] text-slate-500">
              Auditable provenance log
            </span>
          </div>
        </div>

        {hasLinkedHistory && (
          <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2">
            <History className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              CivicPulse linked this report to prior incidents:{' '}
              <strong className="font-semibold text-indigo-950">
                {createdIncident.relatedIncidentIds.join(', ')}
              </strong>
              . If contractor repairs were recorded at this node, recurrence penalties will update automatically on the failure memory dashboard.
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          id="btn-report-another"
          onClick={onReportAnother}
          className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors"
        >
          <PlusCircle className="w-4 h-4 text-slate-500" />
          <span>Report Another Issue</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {hasLinkedHistory && (
            <button
              type="button"
              id="btn-success-failure-memory"
              onClick={onViewFailureMemory}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <History className="w-4 h-4 text-indigo-300" />
              <span>View Failure Memory</span>
            </button>
          )}

          <button
            type="button"
            id="btn-success-city-intelligence"
            onClick={onGoToCityIntelligence}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Building2 className="w-4 h-4 text-slate-500" />
            <span>City Intelligence</span>
          </button>

          <button
            type="button"
            id="btn-success-view-incident"
            onClick={() => onViewIncident(createdIncident.id)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>View Incident Details</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
