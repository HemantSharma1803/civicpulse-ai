import React, { useState } from 'react';
import {
  History,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Wrench,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Clock,
  MapPin,
  Layers,
  XCircle,
} from 'lucide-react';
import { MemoryCheckResult, RelatedMatch, RepairEvent } from '../../types';
import { useCivicPulse } from '../../context/CivicPulseContext';

interface MemoryCheckStepProps {
  memoryResult: MemoryCheckResult;
  onSelectExistingIncident: (id: string) => void;
  onCancelReport: () => void;
  onBack: () => void;
  onProceedToReview: () => void;
}

export const MemoryCheckStep: React.FC<MemoryCheckStepProps> = ({
  memoryResult,
  onSelectExistingIncident,
  onCancelReport,
  onBack,
  onProceedToReview,
}) => {
  const { setCurrentPage, repairs } = useCivicPulse();
  const [showExplanation, setShowExplanation] = useState(true);

  const {
    matches,
    duplicateWarning,
    likelyDuplicateMatch,
    chronicHotspot,
    hasLocationHistory,
    locationHistorySummary,
    typicalRecurrenceIntervalDays,
  } = memoryResult;

  // Find repairs linked to matching incidents
  const linkedRepairs = repairs.filter((r) =>
    matches.some((m) => m.incidentId === r.incidentId)
  );

  return (
    <div className="space-y-6">
      {/* Duplicate Warning Callout (if likely duplicate found) */}
      {duplicateWarning && likelyDuplicateMatch && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-3 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-lg bg-amber-200/70 text-amber-900 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-amber-800" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-950">
                  Potential Matching Recent Report Detected
                </h4>
                <p className="text-xs text-amber-900 mt-0.5 leading-relaxed">
                  CivicPulse identified an active report of identical category within{' '}
                  <strong className="font-semibold text-amber-950">
                    {likelyDuplicateMatch.distanceMeters} meters
                  </strong>
                  . Submitting another ticket may create operational redundancy.
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-200 text-amber-900 shrink-0">
              {likelyDuplicateMatch.overallMatchScore}% Match Score
            </span>
          </div>

          {/* Duplicate candidate card */}
          <div className="p-3 bg-white rounded-lg border border-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-indigo-700">
                  {likelyDuplicateMatch.incidentId}
                </span>
                <span className="font-semibold text-slate-900">
                  {likelyDuplicateMatch.incidentTitle}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-100 text-amber-800">
                  {likelyDuplicateMatch.status}
                </span>
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Distance: {likelyDuplicateMatch.distanceMeters}m • Created:{' '}
                {new Date(likelyDuplicateMatch.createdAt).toLocaleDateString()} • Category:{' '}
                {likelyDuplicateMatch.category}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                id="btn-view-duplicate-incident"
                onClick={() => onSelectExistingIncident(likelyDuplicateMatch.incidentId)}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded text-xs transition-colors flex items-center gap-1"
              >
                <span>View Existing</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onCancelReport}
                className="px-3 py-1.5 text-slate-500 hover:text-slate-800 text-xs font-medium"
              >
                Cancel Report
              </button>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px] text-amber-900">
            <span>If this is a distinct issue or newly expanded defect, you may proceed.</span>
            <span className="font-semibold">Option: Report as New Incident</span>
          </div>
        </div>
      )}

      {/* Historical Lineage Stream or Baseline Confirmation */}
      {hasLocationHistory ? (
        <div className="border border-slate-200 rounded-xl bg-white p-5 space-y-5 shadow-xs">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600 text-white">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Infrastructure Memory Lineage
                </h3>
                <p className="text-xs text-slate-500">
                  {locationHistorySummary}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage('failure-memory')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View Full Failure Memory</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <div>
              <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">
                Related Incidents
              </p>
              <p className="text-lg font-mono font-bold text-slate-900">
                {matches.length}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">
                Repairs Recorded
              </p>
              <p className="text-lg font-mono font-bold text-indigo-600">
                {linkedRepairs.length}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">
                Recurrence State
              </p>
              <p className="text-xs font-bold text-amber-700 mt-1 uppercase">
                {chronicHotspot ? 'Chronic Hotspot' : matches.length > 1 ? 'Recurring Cycle' : 'Local History'}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">
                Avg. Recurrence
              </p>
              <p className="text-lg font-mono font-bold text-slate-900">
                ~{typicalRecurrenceIntervalDays}d
              </p>
            </div>
          </div>

          {/* Chronological Event Stream */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Chronological Incident & Remediation Timeline
            </span>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {/* Node 0: Current Draft Report */}
              <div className="relative flex items-start gap-3">
                <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-indigo-600 ring-4 ring-indigo-100" />
                <div className="flex-1 p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-900">
                      CURRENT DRAFT REPORT (Now)
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-200 text-indigo-900 font-bold">
                      IN PROGRESS
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5">
                    Will be registered into CivicPulse persistent memory upon submission.
                  </p>
                </div>
              </div>

              {/* Node 1 to N: Matches & Repairs */}
              {matches.slice(0, 3).map((match, idx) => (
                <div key={match.incidentId} className="relative flex items-start gap-3">
                  <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-slate-400 ring-4 ring-white" />
                  <div className="flex-1 p-2.5 rounded-lg bg-white border border-slate-200 text-xs hover:border-indigo-300 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectExistingIncident(match.incidentId)}
                          className="font-mono font-bold text-indigo-600 hover:underline"
                        >
                          {match.incidentId}
                        </button>
                        <span className="font-semibold text-slate-800">
                          {match.incidentTitle}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {match.distanceMeters}m away • {new Date(match.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                        {match.category}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                          match.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {match.status}
                      </span>
                      <span className="text-[10px] font-mono text-indigo-600 font-semibold">
                        Correlation: {match.overallMatchScore}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Linked Repairs if any */}
              {linkedRepairs.slice(0, 2).map((repair) => (
                <div key={repair.id} className="relative flex items-start gap-3">
                  <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white" />
                  <div className="flex-1 p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-950 flex items-center gap-1">
                        <Wrench className="w-3 h-3 text-emerald-600" />
                        Remediation Intervention ({repair.action})
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700">
                        {new Date(repair.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      {repair.description} • Executed by {repair.contractorOrTeam}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Explainability Accordion ("Why did CivicPulse connect these?") */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
            <button
              type="button"
              onClick={() => setShowExplanation((prev) => !prev)}
              className="w-full flex items-center justify-between p-3.5 text-xs font-bold text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Why did CivicPulse connect these incidents?</span>
              </div>
              {showExplanation ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {showExplanation && (
              <div className="p-3.5 pt-0 text-xs space-y-2.5 border-t border-slate-200 bg-white">
                <p className="text-slate-600 text-[11px] italic">
                  CivicPulse identified empirical signals suggesting these incidents may be part of a continuous failure lineage:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {matches[0]?.reasons?.map((reason, i) => (
                    <div
                      key={i}
                      className="p-2 rounded bg-slate-50 border border-slate-200 text-slate-700 flex items-start gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </div>
                  ))}
                  {chronicHotspot && (
                    <div className="p-2 rounded bg-slate-50 border border-slate-200 text-slate-700 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span>Coordinates fall within established Hotspot "{chronicHotspot.locationName}"</span>
                    </div>
                  )}
                </div>

                <div className="p-2.5 rounded bg-slate-100 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Audit Disclaimer: </span>
                  Relationships are probabilistic correlations intended to aid municipal planning and contractor accountability. They do not constitute judicial proof of contractor liability.
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* No prior records (Isolated incident) */
        <div className="p-6 border border-slate-200 rounded-xl bg-white text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-sm font-bold text-slate-900">
              No Prior Incidents Recorded at This Coordinate Node
            </h3>
            <p className="text-xs text-slate-600">
              CivicPulse checked surrounding records within a 350m radius. This complaint will establish a new baseline in the city's infrastructure memory.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-mono">
            <span>Spatial Status: Isolated Baseline Node</span>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Location</span>
        </button>

        <button
          type="button"
          id="proceed-to-review-button"
          onClick={onProceedToReview}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
        >
          <span>Proceed to Final Review</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
