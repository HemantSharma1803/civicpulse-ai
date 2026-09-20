import React from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Tag,
  Wrench,
} from 'lucide-react';
import { MemoryTimelineItem } from '../../services/failure-memory';

interface MemoryTimelineProps {
  timeline: MemoryTimelineItem[];
  onSelectIncident?: (id: string) => void;
  className?: string;
}

export const MemoryTimeline: React.FC<MemoryTimelineProps> = ({
  timeline,
  onSelectIncident,
  className = '',
}) => {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        No chronological failure events on record for this infrastructure node.
      </div>
    );
  }

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div
      id="memory-timeline"
      className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}
    >
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
              <Clock className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Infrastructure Failure & Repair Lineage
              </h3>
              <p className="text-xs text-slate-500">
                Chronological sequence of complaints, contractor work orders, and re-emergences
              </p>
            </div>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {timeline.length} Recorded Events
          </span>
        </div>
      </div>

      <div className="relative mt-6 pl-6">
        {/* Continuous vertical timeline spine */}
        <div className="absolute bottom-4 left-9 top-4 w-0.5 bg-slate-200" />

        <div className="space-y-6">
          {timeline.map((event) => {
            const isIncident = event.eventType === 'INCIDENT';
            const isCurrent = event.isPrimary;

            return (
              <div key={event.id} className="relative flex items-start gap-4">
                {/* Node icon marker */}
                <div
                  className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 bg-white ${
                    isCurrent
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-600 ring-4 ring-indigo-50'
                      : isIncident
                      ? 'border-amber-500 text-amber-600'
                      : 'border-emerald-500 text-emerald-600'
                  }`}
                >
                  {isIncident ? (
                    <AlertCircle className="h-3.5 w-3.5" />
                  ) : (
                    <Wrench className="h-3.5 w-3.5" />
                  )}
                </div>

                {/* Event Content Box */}
                <div
                  className={`w-full rounded-lg border p-4 transition-colors ${
                    isCurrent
                      ? 'border-indigo-200 bg-indigo-50/40 shadow-xs'
                      : 'border-slate-200/90 bg-white hover:border-slate-300'
                  }`}
                >
                  {/* Top metadata row */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900">
                        {event.title}
                      </span>
                      {isCurrent && (
                        <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                          Current Focus
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(event.date)}
                      </span>
                      {event.daysSincePriorEvent !== undefined &&
                        event.daysSincePriorEvent > 0 && (
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-700">
                            +{event.daysSincePriorEvent}d elapsed
                          </span>
                        )}
                    </div>
                  </div>

                  {/* Body description */}
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    {event.description}
                  </p>

                  {/* Context-specific details */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100/80 pt-2.5 text-xs">
                    {isIncident ? (
                      <div className="flex flex-wrap items-center gap-2">
                        {event.category && (
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                            {event.category}
                          </span>
                        )}
                        {event.severity && (
                          <span
                            className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                              event.severity === 'critical'
                                ? 'bg-rose-100 text-rose-800'
                                : event.severity === 'high'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {event.severity.toUpperCase()}
                          </span>
                        )}
                        {event.status && (
                          <span className="text-[11px] text-slate-500">
                            Status: <strong className="font-medium text-slate-700">{event.status}</strong>
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2.5">
                        {event.contractorOrTeam && (
                          <span className="flex items-center gap-1 font-medium text-slate-700 text-[11px]">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                            {event.contractorOrTeam}
                          </span>
                        )}
                        {event.costEstimate && (
                          <span className="rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-100">
                            {event.costEstimate}
                          </span>
                        )}
                        {event.action && (
                          <span className="text-[11px] text-slate-600 font-medium">
                            Action: {event.action}
                          </span>
                        )}
                      </div>
                    )}

                    {isIncident && onSelectIncident && event.incidentId && (
                      <button
                        onClick={() => onSelectIncident(event.incidentId!)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        Inspect Dossier
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
