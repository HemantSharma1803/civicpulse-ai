import React from 'react';
import {
  CheckCircle2,
  ChevronRight,
  Compass,
  FileText,
  HelpCircle,
  Layers,
  MapPin,
  Scale,
  Sparkles,
  Tag,
} from 'lucide-react';
import { RelationshipExplanation } from '../../services/failure-memory';

interface RelationshipExplanationCardProps {
  explanation: RelationshipExplanation;
  onInspectTarget?: (id: string) => void;
  className?: string;
}

export const RelationshipExplanationCard: React.FC<RelationshipExplanationCardProps> = ({
  explanation,
  onInspectTarget,
  className = '',
}) => {
  const {
    targetIncidentId,
    targetTitle,
    targetCategory,
    relationType,
    signals,
    plainEnglishExplanation,
    evidenceChips,
  } = explanation;

  const getRelationBadge = (type: string) => {
    switch (type) {
      case 'RECURRING_FAILURE':
        return {
          label: 'RECURRING FAILURE',
          bg: 'bg-purple-50 text-purple-800 border-purple-200',
        };
      case 'LIKELY_DUPLICATE':
        return {
          label: 'LIKELY DUPLICATE',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'HISTORICAL_RELATED':
      default:
        return {
          label: 'HISTORICAL ANTECEDENT',
          bg: 'bg-slate-100 text-slate-800 border-slate-200',
        };
    }
  };

  const badge = getRelationBadge(relationType);

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 ${className}`}
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs text-slate-900">{targetIncidentId}</span>
          <span className="text-slate-400">•</span>
          <span className="text-xs text-slate-600 truncate max-w-[280px]">
            {targetTitle}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${badge.bg}`}
          >
            {badge.label}
          </span>
          {onInspectTarget && (
            <button
              onClick={() => onInspectTarget(targetIncidentId)}
              className="text-slate-400 hover:text-indigo-600"
              title="Inspect Incident Dossier"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Signals Breakdown 4-metric row */}
      <div className="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {/* Proximity */}
        <div className="rounded-lg bg-slate-50 p-2.5">
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <MapPin className="h-3 w-3 text-indigo-500" />
            <span>Proximity</span>
          </div>
          <div className="mt-1 font-semibold text-xs text-slate-900">
            {signals.geographicDistanceMeters !== null
              ? `${signals.geographicDistanceMeters}m away`
              : 'Unknown distance'}
          </div>
          <div className="text-[10px] text-slate-500">
            Score: {Math.round(signals.geographicScore * 100)}%
          </div>
        </div>

        {/* Category Match */}
        <div className="rounded-lg bg-slate-50 p-2.5">
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <Tag className="h-3 w-3 text-emerald-500" />
            <span>Category</span>
          </div>
          <div className="mt-1 font-semibold text-xs text-slate-900 truncate">
            {targetCategory}
          </div>
          <div className="text-[10px] text-slate-500">
            Score: {Math.round(signals.categoryScore * 100)}%
          </div>
        </div>

        {/* Text Similarity */}
        <div className="rounded-lg bg-slate-50 p-2.5">
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <FileText className="h-3 w-3 text-amber-500" />
            <span>Semantic Overlap</span>
          </div>
          <div className="mt-1 font-semibold text-xs text-slate-900">
            {Math.round(signals.textScore * 100)}% Match
          </div>
          <div className="text-[10px] text-slate-500">Semantic similarity</div>
        </div>

        {/* Temporal relevance */}
        <div className="rounded-lg bg-slate-50 p-2.5">
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <Scale className="h-3 w-3 text-purple-500" />
            <span>Temporal Interval</span>
          </div>
          <div className="mt-1 font-semibold text-xs text-slate-900">
            {signals.temporalDaysDiff} Days
          </div>
          <div className="text-[10px] text-slate-500">
            Score: {Math.round(signals.temporalScore * 100)}%
          </div>
        </div>
      </div>

      {/* Evidence Chips */}
      {evidenceChips && evidenceChips.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {evidenceChips.map((chip, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700"
            >
              <strong>{chip.label}:</strong> {chip.value}
            </span>
          ))}
        </div>
      )}

      {/* Transparent Audit Justification Statement */}
      <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 text-xs text-slate-600 leading-relaxed">
        <span className="font-semibold text-slate-900">Audit Justification: </span>
        {plainEnglishExplanation}
      </div>
    </div>
  );
};
