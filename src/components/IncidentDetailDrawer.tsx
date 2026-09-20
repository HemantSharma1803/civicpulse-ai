import React, { useState, useMemo } from 'react';
import {
  X,
  AlertOctagon,
  Calendar,
  MapPin,
  Sparkles,
  History,
  Wrench,
  ShieldCheck,
  Tag,
  ArrowRight,
  Clock,
  CheckCircle2,
  FileText,
  UserCheck,
  AlertTriangle,
  Repeat,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useCivicPulse } from '../context/CivicPulseContext';
import { IncidentStatus } from '../types';
import {
  RelationshipExplanationCard,
  DuplicateWarningBanner,
} from './failure-memory';

export const IncidentDetailDrawer: React.FC = () => {
  const {
    selectedIncident,
    setSelectedIncidentId,
    repairs,
    updateIncidentStatus,
    getFailureMemory,
  } = useCivicPulse();

  const [newStatus, setNewStatus] = useState<IncidentStatus | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [activeMemoryTab, setActiveMemoryTab] = useState<'lineage' | 'repairs' | 'explanations'>('lineage');

  // Compute live failure memory for the selected incident
  const failureMemory = useMemo(() => {
    if (!selectedIncident) return null;
    return getFailureMemory(selectedIncident.id);
  }, [selectedIncident, getFailureMemory]);

  // Check for duplicate warning in failure memory
  const duplicateWarningData = useMemo(() => {
    if (!failureMemory) return null;
    const dup = failureMemory.relationshipExplanations.find(
      (x) => x.relationType === 'LIKELY_DUPLICATE'
    );
    if (!dup) return null;

    return {
      duplicateIncidentId: dup.targetIncidentId,
      duplicateTitle: dup.targetTitle,
      distanceMeters: dup.signals.geographicDistanceMeters || 15,
      daysApart: dup.signals.temporalDaysDiff || 1,
    };
  }, [failureMemory]);

  if (!selectedIncident) return null;

  const incidentRepairs = repairs.filter((r) => r.incidentId === selectedIncident.id);

  const handleApplyStatusChange = () => {
    if (!newStatus) return;
    updateIncidentStatus(selectedIncident.id, newStatus, resolutionNote);
    setIsUpdatingStatus(false);
    setNewStatus(null);
    setResolutionNote('');
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'high':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'medium':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'in_progress':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'investigating':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  const getMemoryStateBadge = (state?: string) => {
    switch (state) {
      case 'PERSISTENT':
        return {
          label: 'PERSISTENT DEFECT',
          class: 'bg-rose-100 text-rose-800 border-rose-200',
        };
      case 'RECURRING':
        return {
          label: 'RECURRING FAILURE',
          class: 'bg-purple-100 text-purple-800 border-purple-200',
        };
      case 'RESOLVED':
        return {
          label: 'REMEDIATED',
          class: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      case 'NEW':
      default:
        return {
          label: 'BASELINE',
          class: 'bg-sky-100 text-sky-800 border-sky-200',
        };
    }
  };

  const memState = getMemoryStateBadge(failureMemory?.currentState);

  return (
    <div
      id="incident-detail-drawer-backdrop"
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => setSelectedIncidentId(null)}
    >
      <div
        id="incident-detail-drawer"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl sm:max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-250 border-l border-slate-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono font-bold text-sm text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
              {selectedIncident.id}
            </span>
            <span
              className={`px-2.5 py-1 text-xs font-semibold rounded-full border capitalize ${getStatusBadge(
                selectedIncident.status
              )}`}
            >
              {selectedIncident.status.replace('_', ' ')}
            </span>
            <span
              className={`px-2.5 py-1 text-xs font-semibold rounded-full border uppercase tracking-wider ${getSeverityBadge(
                selectedIncident.severity
              )}`}
            >
              {selectedIncident.severity}
            </span>

            {/* Failure Memory State Badge */}
            {failureMemory && (
              <span
                className={`px-2.5 py-1 text-xs font-bold rounded-full border tracking-wider ${memState.class}`}
              >
                {memState.label}
              </span>
            )}
          </div>

          <button
            id="close-drawer-btn"
            onClick={() => setSelectedIncidentId(null)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            aria-label="Close detail drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Duplicate Safeguard Alert if triggered */}
          {duplicateWarningData && (
            <DuplicateWarningBanner
              duplicateIncidentId={duplicateWarningData.duplicateIncidentId}
              duplicateTitle={duplicateWarningData.duplicateTitle}
              distanceMeters={duplicateWarningData.distanceMeters}
              daysApart={duplicateWarningData.daysApart}
              onViewDuplicate={(id) => setSelectedIncidentId(id)}
            />
          )}

          {/* SECTION: OVERVIEW */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              {selectedIncident.category}
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-snug">
              {selectedIncident.title}
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              {selectedIncident.description}
            </p>

            {/* Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Location</span>
                <span className="font-semibold text-slate-800 mt-0.5 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span className="truncate">{selectedIncident.address}</span>
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Zonal Sector</span>
                <span className="font-semibold text-slate-800 mt-0.5 block truncate">
                  {selectedIncident.zone}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Reported Date</span>
                <span className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>
                    {new Date(selectedIncident.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Coordinates</span>
                <span className="font-mono text-slate-700 mt-0.5 block text-[11px]">
                  {selectedIncident.latitude.toFixed(4)}, {selectedIncident.longitude.toFixed(4)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Assigned Team</span>
                <span className="font-semibold text-slate-800 mt-0.5 block truncate">
                  {selectedIncident.assignedTeam || 'Municipal Taskforce'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Source Type</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {selectedIncident.source}
                </span>
              </div>
            </div>

            {/* Tags */}
            {selectedIncident.tags && selectedIncident.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {selectedIncident.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-mono"
                  >
                    <Tag className="w-3 h-3 text-slate-400" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* SECTION: FAILURE MEMORY FINGERPRINT MINI-CARD */}
          {failureMemory && (
            <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50/50 via-white to-slate-50 p-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-purple-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-purple-600" />
                  <span className="font-bold text-xs text-purple-950 uppercase tracking-wider">
                    Infrastructure Memory Summary
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-purple-700">
                  Pattern Index: {failureMemory.fingerprint.patternIndex}/100
                </span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-white p-2 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-medium block">
                    Complaints
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {failureMemory.fingerprint.incidentCount}
                  </span>
                </div>
                <div className="rounded-lg bg-white p-2 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-medium block">
                    Repairs Logged
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {failureMemory.fingerprint.repairCount}
                  </span>
                </div>
                <div className="rounded-lg bg-white p-2 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-medium block">
                    Mean Interval
                  </span>
                  <span className="font-bold text-purple-700 text-sm">
                    {failureMemory.fingerprint.averageRecurrenceInterval !== null
                      ? `${failureMemory.fingerprint.averageRecurrenceInterval}d`
                      : 'N/A'}
                  </span>
                </div>
              </div>

              <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                {failureMemory.generatedSummary.oneLine}
              </p>
            </div>
          )}

          {/* Resolution Notes (If Resolved) */}
          {selectedIncident.resolutionNotes && (
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Resolution Verification & Field Inspection
              </span>
              <p className="text-emerald-800 leading-relaxed">{selectedIncident.resolutionNotes}</p>
            </div>
          )}

          {/* SECTION: PHOTOGRAPHIC EVIDENCE & AI VISION ANALYSIS */}
          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>AI Multimodal Vision Analysis</span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold text-indigo-700 bg-indigo-100 rounded">
                {selectedIncident.aiVisionAnalysis?.model || 'Gemini Vision Layer'}
              </span>
            </div>

            {selectedIncident.imageUrl && (
              <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900 max-h-48 flex items-center justify-center">
                <img
                  src={selectedIncident.imageUrl}
                  alt={selectedIncident.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 text-white text-[10px] font-mono">
                  Evidence Capture
                </div>
              </div>
            )}

            {selectedIncident.aiVisionAnalysis ? (
              <div className="p-3.5 bg-white rounded-lg border border-indigo-100/80 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">
                    {selectedIncident.aiVisionAnalysis.summary}
                  </span>
                  <span className="font-mono text-indigo-600 font-bold shrink-0 ml-2">
                    {Math.round(selectedIncident.aiVisionAnalysis.confidence * 100)}% Conf
                  </span>
                </div>

                {/* Visual Evidence Items */}
                {selectedIncident.aiVisionAnalysis.visualEvidence &&
                  selectedIncident.aiVisionAnalysis.visualEvidence.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Optical Evidence Markers
                      </span>
                      {selectedIncident.aiVisionAnalysis.visualEvidence.map((ev, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-1.5 p-1.5 rounded bg-slate-50 border border-slate-100 text-[11px]"
                        >
                          <span
                            className={`px-1.5 py-0.2 rounded font-mono font-bold text-[9px] uppercase ${
                              ev.type === 'VISIBLE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ev.type === 'INFERRED'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {ev.type}
                          </span>
                          <span className="text-slate-700">
                            {ev.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                No multimodal image analysis recorded for this ticket.
              </p>
            )}
          </div>

          {/* SECTION: FAILURE MEMORY LINEAGE & RELATIONSHIPS */}
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-800">
                <History className="w-4 h-4 text-purple-600" />
                <span>Connected Infrastructure Lineage</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveMemoryTab('lineage')}
                  className={`px-2 py-0.5 text-xs rounded font-medium ${
                    activeMemoryTab === 'lineage'
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Lineage ({failureMemory?.timeline.length || 0})
                </button>
                <button
                  onClick={() => setActiveMemoryTab('explanations')}
                  className={`px-2 py-0.5 text-xs rounded font-medium ${
                    activeMemoryTab === 'explanations'
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Signals ({failureMemory?.relationshipExplanations.length || 0})
                </button>
                <button
                  onClick={() => setActiveMemoryTab('repairs')}
                  className={`px-2 py-0.5 text-xs rounded font-medium ${
                    activeMemoryTab === 'repairs'
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Repairs ({failureMemory?.repairCycleAnalysis.cycles.length || incidentRepairs.length})
                </button>
              </div>
            </div>

            {activeMemoryTab === 'lineage' && (
              <div className="space-y-2">
                {failureMemory && failureMemory.timeline.length > 0 ? (
                  failureMemory.timeline.map((evt) => {
                    const isCurrent = evt.isPrimary;
                    return (
                      <div
                        key={evt.id}
                        onClick={() => {
                          if (evt.eventType === 'INCIDENT' && !isCurrent && evt.incidentId) {
                            setSelectedIncidentId(evt.incidentId);
                          }
                        }}
                        className={`p-3 rounded-xl border transition-all text-xs ${
                          isCurrent
                            ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-200'
                            : evt.eventType === 'INCIDENT'
                            ? 'bg-white border-slate-200 hover:border-purple-300 cursor-pointer'
                            : 'bg-emerald-50/40 border-emerald-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-slate-900">
                              {evt.id}
                            </span>
                            <span className="font-semibold text-slate-800">{evt.title}</span>
                            {isCurrent && (
                              <span className="rounded bg-indigo-600 px-1.5 py-0.2 text-[9px] font-bold text-white uppercase">
                                This Incident
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {new Date(evt.date).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <p className="mt-1 text-slate-600 text-[11px] leading-relaxed">
                          {evt.description}
                        </p>
                        {evt.daysSincePriorEvent !== undefined && evt.daysSincePriorEvent > 0 && (
                          <div className="mt-2 text-[10px] text-slate-400">
                            +{evt.daysSincePriorEvent} days elapsed since previous event
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 text-center">
                    This is currently an isolated incident with no prior recorded failures at this location.
                  </div>
                )}
              </div>
            )}

            {activeMemoryTab === 'explanations' && (
              <div className="space-y-2">
                {failureMemory && failureMemory.relationshipExplanations.length > 0 ? (
                  failureMemory.relationshipExplanations.map((exp) => (
                    <RelationshipExplanationCard
                      key={exp.targetIncidentId}
                      explanation={exp}
                      onInspectTarget={(id) => setSelectedIncidentId(id)}
                    />
                  ))
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 text-center">
                    No connected link signals computed.
                  </div>
                )}
              </div>
            )}

            {activeMemoryTab === 'repairs' && (
              <div className="space-y-2">
                {incidentRepairs.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 text-center">
                    No formal contractor repair events recorded yet for this ticket.
                  </div>
                ) : (
                  incidentRepairs.map((rep) => (
                    <div
                      key={rep.id}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900">{rep.id}</span>
                        <span className="font-mono font-semibold text-indigo-600">
                          {rep.costEstimate || '₹0'}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-800">{rep.action}</p>
                      <p className="text-slate-600 text-[11px] leading-relaxed">{rep.description}</p>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[10px] text-slate-400">
                        <span>Contractor: {rep.contractorOrTeam}</span>
                        <span>
                          Date:{' '}
                          {new Date(rep.date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* SECTION: DATA TRUST */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Data Trust & Provenance Metadata</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Report Origin: <strong className="text-slate-700">{selectedIncident.source}</strong>. All recurrence patterns, intervals, and duplicate warnings are calculated deterministically by CivicPulse Failure Memory Engine.
            </p>
          </div>
        </div>

        {/* Action Footer: Update Status */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0">
          {!isUpdatingStatus ? (
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setIsUpdatingStatus(true)}
                className="flex items-center justify-center gap-1.5 w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors shadow-2xs"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Change Operational Status
              </button>
              <button
                onClick={() => setSelectedIncidentId(null)}
                className="py-2 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
              >
                Done
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Update Incident Status</span>
                <button
                  onClick={() => setIsUpdatingStatus(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(['active', 'investigating', 'in_progress', 'resolved'] as IncidentStatus[]).map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => setNewStatus(st)}
                      className={`py-1.5 px-2 text-xs font-semibold rounded-lg capitalize border transition-all ${
                        (newStatus || selectedIncident.status) === st
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  )
                )}
              </div>
              <input
                type="text"
                placeholder="Optional inspection notes or resolution details..."
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={handleApplyStatusChange}
                className="w-full py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
              >
                Save Operational Update
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
