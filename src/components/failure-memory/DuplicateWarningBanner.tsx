import React from 'react';
import { AlertTriangle, ExternalLink, ShieldAlert, ArrowRight } from 'lucide-react';

interface DuplicateWarningBannerProps {
  duplicateIncidentId: string;
  duplicateTitle: string;
  distanceMeters: number;
  daysApart: number;
  onViewDuplicate: (id: string) => void;
  onProceedAnyway?: () => void;
  className?: string;
}

export const DuplicateWarningBanner: React.FC<DuplicateWarningBannerProps> = ({
  duplicateIncidentId,
  duplicateTitle,
  distanceMeters,
  daysApart,
  onViewDuplicate,
  onProceedAnyway,
  className = '',
}) => {
  return (
    <div
      id="duplicate-warning-banner"
      className={`rounded-xl border border-amber-300 bg-amber-50/90 p-4 shadow-sm ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
          <AlertTriangle className="h-5 w-5" />
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-semibold text-sm text-amber-950">
              Potential Duplicate Incident Detected
            </h4>
            <span className="rounded-full border border-amber-300 bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-900">
              DUPLICATE SAFEGUARD
            </span>
          </div>

          <p className="mt-1 text-xs text-amber-800 leading-relaxed">
            CivicPulse identified active complaint{' '}
            <strong className="font-semibold text-amber-950">{duplicateIncidentId}</strong> (
            <em>{duplicateTitle}</em>) located only <strong>{distanceMeters} meters</strong> away, reported{' '}
            <strong>{daysApart === 0 ? 'today' : `${daysApart} day(s) ago`}</strong>. Field dispatch may
            already be scheduled for these coordinates.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onViewDuplicate(duplicateIncidentId)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-amber-700 transition-colors"
            >
              <span>View Existing Ticket ({duplicateIncidentId})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            {onProceedAnyway && (
              <button
                onClick={onProceedAnyway}
                className="text-xs font-medium text-amber-800 hover:text-amber-950 underline"
              >
                Log as distinct report
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
