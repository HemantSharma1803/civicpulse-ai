import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  GitCommit,
  History,
  Layers,
  MapPin,
  Network,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { useCivicPulse } from '../context/CivicPulseContext';
import {
  FailureFingerprintCard,
  MemoryTimeline,
  MemoryGraphView,
  RelationshipExplanationCard,
  DuplicateWarningBanner,
  ScenarioSelector,
} from '../components/failure-memory';
import { FailureMemory, LocationMemory } from '../services/failure-memory';

export const FailureMemoryView: React.FC = () => {
  const {
    incidents,
    repairs,
    setSelectedIncidentId,
    locationMemories,
    getFailureMemory,
  } = useCivicPulse();

  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [selectedIncidentIdState, setSelectedIncidentIdState] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'timeline' | 'graph' | 'explanations' | 'repairs'>('timeline');

  // AI summary state
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [liveAiSummary, setLiveAiSummary] = useState<{
    oneLineSummary: string;
    executiveBrief: string;
    evidencePoints: string[];
    recommendedAction: string;
    source: string;
  } | null>(null);

  // Available locations from locationMemories
  const filteredLocationMemories: LocationMemory[] = useMemo(() => {
    let list = locationMemories;
    if (selectedZone !== 'all') {
      list = list.filter((m) => m.zone === selectedZone);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.locationName.toLowerCase().includes(q) ||
          m.address.toLowerCase().includes(q) ||
          m.locationId.toLowerCase().includes(q)
      );
    }
    return list;
  }, [locationMemories, selectedZone, searchQuery]);

  // Active Memory Selection
  const activeMemory: FailureMemory | null = useMemo(() => {
    // If a specific incident was selected
    if (selectedIncidentIdState) {
      return getFailureMemory(selectedIncidentIdState);
    }

    // If a location was selected
    if (selectedLocationId) {
      const loc = filteredLocationMemories.find((m) => m.locationId === selectedLocationId);
      if (loc) {
        const catMemories = Object.values(loc.memoriesByCategory);
        if (catMemories.length > 0) return catMemories[0];
      }
    }

    // Default to the first location's memory
    if (filteredLocationMemories.length > 0) {
      const firstLoc = filteredLocationMemories[0];
      const catMemories = Object.values(firstLoc.memoriesByCategory);
      if (catMemories.length > 0) return catMemories[0];
    }

    // Or fallback to first incident in dataset
    if (incidents.length > 0) {
      return getFailureMemory(incidents[0].id);
    }

    return null;
  }, [filteredLocationMemories, selectedLocationId, selectedIncidentIdState, incidents, getFailureMemory]);

  // Check for duplicate warning in active memory
  const duplicateWarningData = useMemo(() => {
    if (!activeMemory) return null;
    const dup = activeMemory.relationshipExplanations.find(
      (x) => x.relationType === 'LIKELY_DUPLICATE'
    );
    if (!dup) return null;

    return {
      duplicateIncidentId: dup.targetIncidentId,
      duplicateTitle: dup.targetTitle,
      distanceMeters: dup.signals.geographicDistanceMeters || 15,
      daysApart: dup.signals.temporalDaysDiff || 1,
    };
  }, [activeMemory]);

  // Handle location click
  const handleSelectLocation = (loc: LocationMemory) => {
    setSelectedLocationId(loc.locationId);
    const catMemories = Object.values(loc.memoriesByCategory);
    if (catMemories.length > 0) {
      setSelectedIncidentIdState(catMemories[0].primaryIncidentId);
    }
    setLiveAiSummary(null);
  };

  // Handle live AI summarization trigger
  const handleGenerateAiSummary = async () => {
    if (!activeMemory) return;

    setAiSummaryLoading(true);
    try {
      const primaryInc = incidents.find((i) => i.id === activeMemory.primaryIncidentId);
      const payload = {
        incidentId: activeMemory.primaryIncidentId,
        incidentTitle: primaryInc?.title || activeMemory.dominantCategory,
        locationName: activeMemory.location.name,
        currentState: activeMemory.currentState,
        patternIndex: activeMemory.fingerprint.patternIndex,
        incidentCount: activeMemory.fingerprint.incidentCount,
        repairCount: activeMemory.fingerprint.repairCount,
        averageIntervalDays: activeMemory.fingerprint.averageRecurrenceInterval,
        longestQuietPeriodDays: activeMemory.fingerprint.longestQuietPeriodDays,
        timelineEvents: activeMemory.timeline.map((e) => ({
          date: e.date,
          type: e.eventType,
          title: e.title,
          description: e.description,
          elapsedDays: e.daysSincePriorEvent,
        })),
        explanations: activeMemory.relationshipExplanations.map((x) => ({
          targetIncidentId: x.targetIncidentId,
          relationType: x.relationType,
          distanceMeters: x.signals.geographicDistanceMeters || 0,
          auditText: x.plainEnglishExplanation,
        })),
      };

      const res = await fetch('/api/ai/summarize-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.summary) {
          setLiveAiSummary(json.summary);
        }
      }
    } catch (err) {
      console.warn('AI summary fetch failed, relying on engine summary:', err);
    } finally {
      setAiSummaryLoading(false);
    }
  };

  // Summary display fallback
  const currentSummary = liveAiSummary || {
    oneLineSummary: activeMemory?.generatedSummary.oneLine || '',
    executiveBrief: activeMemory?.generatedSummary.detailed || '',
    evidencePoints: activeMemory?.generatedSummary.evidenceBreakdown || [],
    recommendedAction: activeMemory?.auditExplanation.basis || '',
    source: 'deterministic-engine',
  };

  return (
    <div id="failure-memory-view" className="space-y-6 pb-16">
      {/* Philosophy Header Banner */}
      <div className="rounded-2xl border border-purple-900/40 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 text-white shadow-md">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-white shadow-xs">
                <History className="h-4 w-4" />
              </span>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-purple-300">
                FAILURE MEMORY ENGINE
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              “Cities record complaints. CivicPulse remembers failures.”
            </h2>
            <p className="max-w-3xl text-xs leading-relaxed text-slate-300">
              Conventional municipal ticketing logs complaints as isolated transactions and resets memory once a work order closes. CivicPulse measures physical repair longevity, maps recurrence intervals, and correlates subsurface failures across space and time.
            </p>
          </div>

          <div className="shrink-0 space-y-1.5 rounded-xl border border-purple-700/50 bg-purple-900/40 p-4 text-xs">
            <div className="flex items-center justify-between gap-5">
              <span className="text-purple-200">Tracked Locations:</span>
              <span className="font-mono font-bold text-white">{locationMemories.length}</span>
            </div>
            <div className="flex items-center justify-between gap-5">
              <span className="text-purple-200">Recurrent Clusters:</span>
              <span className="font-mono font-bold text-purple-300">
                {locationMemories.filter((m) => m.overallState === 'RECURRING' || m.overallState === 'PERSISTENT').length}
              </span>
            </div>
            <div className="flex items-center justify-between gap-5">
              <span className="text-purple-200">Active Duplicate Defense:</span>
              <span className="font-mono font-bold text-emerald-300">Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Demonstration Scenario Selector Bar */}
      <ScenarioSelector
        onScenarioLoaded={() => {
          setSelectedLocationId('');
          setSelectedIncidentIdState('');
          setLiveAiSummary(null);
        }}
      />

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Location & Cluster Directory */}
        <div className="space-y-4 lg:col-span-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                Tracked Infrastructure Nodes ({filteredLocationMemories.length})
              </h3>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:outline-none"
              >
                <option value="all">All Zones</option>
                <option value="South Zone">South Zone</option>
                <option value="Central Zone">Central Zone</option>
                <option value="West Zone">West Zone</option>
                <option value="South-East Zone">South-East Zone</option>
                <option value="Central-West Zone">Central-West Zone</option>
                <option value="North Zone">North Zone</option>
              </select>
            </div>

            {/* Search filter */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by street or incident ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Location Cards Scrollable List */}
          <div className="max-h-[780px] space-y-2.5 overflow-y-auto pr-1">
            {filteredLocationMemories.map((loc) => {
              const isSelected = activeMemory?.location.name === loc.locationName;

              return (
                <div
                  key={loc.locationId}
                  onClick={() => handleSelectLocation(loc)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-500/30'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <MapPin
                        className={`h-4 w-4 shrink-0 ${
                          isSelected ? 'text-indigo-600' : 'text-slate-400'
                        }`}
                      />
                      <span className="font-bold text-xs text-slate-900 line-clamp-1">
                        {loc.locationName}
                      </span>
                    </div>

                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        loc.overallState === 'PERSISTENT'
                          ? 'bg-rose-100 text-rose-800'
                          : loc.overallState === 'RECURRING'
                          ? 'bg-purple-100 text-purple-800'
                          : loc.overallState === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {loc.overallState}
                    </span>
                  </div>

                  <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">{loc.address}</p>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
                    <span className="font-medium text-slate-700">
                      {loc.dominantCategory}
                    </span>
                    <span className="font-semibold text-slate-600">
                      {loc.totalIncidents} incidents • {loc.totalRepairs} repairs
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Failure Memory Dossier */}
        <div className="space-y-6 lg:col-span-8">
          {activeMemory ? (
            <>
              {/* Duplicate Safeguard Alert if applicable */}
              {duplicateWarningData && (
                <DuplicateWarningBanner
                  duplicateIncidentId={duplicateWarningData.duplicateIncidentId}
                  duplicateTitle={duplicateWarningData.duplicateTitle}
                  distanceMeters={duplicateWarningData.distanceMeters}
                  daysApart={duplicateWarningData.daysApart}
                  onViewDuplicate={(id) => setSelectedIncidentId(id)}
                />
              )}

              {/* Top Fingerprint Card */}
              <FailureFingerprintCard
                fingerprint={activeMemory.fingerprint}
                currentState={activeMemory.currentState}
                locationName={activeMemory.location.name}
                auditExplanation={activeMemory.generatedSummary.oneLine}
              />

              {/* AI Memory Executive Briefing Card */}
              <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50 p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
                      <Brain className="h-4 w-4" />
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-indigo-950 uppercase tracking-wider">
                        CivicPulse Failure Intelligence Brief
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {currentSummary.source === 'gemini-2.5-flash'
                          ? 'Grounded Synthesis via Gemini 2.5 Flash'
                          : 'Deterministic Infrastructure Evidence Engine'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateAiSummary}
                    disabled={aiSummaryLoading}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-xs hover:bg-indigo-50 hover:text-indigo-900 transition-colors disabled:opacity-60"
                  >
                    {aiSummaryLoading ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                    )}
                    <span>
                      {aiSummaryLoading ? 'Synthesizing Memory...' : 'Ask Gemini for Executive Brief'}
                    </span>
                  </button>
                </div>

                {/* Summary content */}
                <div className="mt-4 space-y-3">
                  <div className="rounded-lg bg-white p-3.5 border border-indigo-50 shadow-xs">
                    <span className="text-xs font-bold text-slate-900 block mb-1">
                      Key Takeaway
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {currentSummary.oneLineSummary}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {currentSummary.executiveBrief}
                  </p>

                  {/* Evidence Points */}
                  {currentSummary.evidencePoints && currentSummary.evidencePoints.length > 0 && (
                    <div className="rounded-lg bg-slate-50/80 p-3.5 border border-slate-100">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-2">
                        Structured Factual Evidence:
                      </span>
                      <ul className="space-y-1.5">
                        {currentSummary.evidencePoints.map((point: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommended Action */}
                  {currentSummary.recommendedAction && (
                    <div className="flex items-center gap-2 rounded-lg border border-purple-100 bg-purple-50/60 px-3.5 py-2.5 text-xs text-purple-900">
                      <Wrench className="h-4 w-4 text-purple-700 shrink-0" />
                      <div>
                        <strong>Recommended Protocol: </strong>
                        {currentSummary.recommendedAction}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* View Mode Tabs */}
              <div className="flex items-center gap-1 border-b border-slate-200">
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
                    activeTab === 'timeline'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>Chronological Lineage ({activeMemory.timeline.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('graph')}
                  className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
                    activeTab === 'graph'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Network className="h-3.5 w-3.5" />
                  <span>Interactive Topology Graph</span>
                </button>

                <button
                  onClick={() => setActiveTab('explanations')}
                  className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
                    activeTab === 'explanations'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Auditable Link Explanations ({activeMemory.relationshipExplanations.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('repairs')}
                  className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
                    activeTab === 'repairs'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Wrench className="h-3.5 w-3.5" />
                  <span>Repair Durability Audit ({activeMemory.repairCycleAnalysis.cycles.length})</span>
                </button>
              </div>

              {/* Tab Content Panes */}
              {activeTab === 'timeline' && (
                <MemoryTimeline
                  timeline={activeMemory.timeline}
                  onSelectIncident={(id) => setSelectedIncidentId(id)}
                />
              )}

              {activeTab === 'graph' && (
                <MemoryGraphView
                  graph={activeMemory.graph}
                  onSelectIncident={(id) => setSelectedIncidentId(id)}
                />
              )}

              {activeTab === 'explanations' && (
                <div className="space-y-3">
                  {activeMemory.relationshipExplanations.length > 0 ? (
                    activeMemory.relationshipExplanations.map((exp) => (
                      <RelationshipExplanationCard
                        key={exp.targetIncidentId}
                        explanation={exp}
                        onInspectTarget={(id) => setSelectedIncidentId(id)}
                      />
                    ))
                  ) : (
                    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
                      Zero historical linkages recorded for this defect. This is an isolated incident.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'repairs' && (
                <div className="space-y-4">
                  {activeMemory.repairCycleAnalysis.cycles.length > 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                      <div className="border-b border-slate-100 pb-3">
                        <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">
                          Repair Intervention & Re-emergence Interval Log
                        </h4>
                        <p className="text-xs text-slate-500">
                          {activeMemory.repairCycleAnalysis.narrative}
                        </p>
                      </div>

                      <div className="space-y-3">
                        {activeMemory.repairCycleAnalysis.cycles.map((c, i) => (
                          <div
                            key={i}
                            className="rounded-lg border border-slate-200 bg-slate-50/60 p-4"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-bold text-xs text-slate-900">
                                Cycle #{i + 1}: {c.repairAction} ({c.repairId})
                              </span>
                              {c.daysUntilNextIncident !== undefined && (
                                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold text-purple-800">
                                  Reappeared {c.daysUntilNextIncident} days post-repair
                                </span>
                              )}
                            </div>

                            <div className="mt-2 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                              <div className="text-slate-500">
                                Prior Incident: <strong className="text-slate-700">{c.incidentId}</strong>
                              </div>
                              <div className="text-slate-500">
                                Contractor: <strong className="text-slate-700">{c.contractor || 'Municipal Crew'}</strong>
                              </div>
                              <div className="text-slate-500">
                                Repair Days: <strong className="text-slate-700">{c.daysToRepair}d to patch</strong>
                              </div>
                              <div className="text-slate-500">
                                Next Ticket: <strong className="text-slate-700">{c.subsequentIncidentId || 'None'}</strong>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
                      Zero municipal repair cycles have been completed for this defect lineage yet.
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
              Select a location node or incident to inspect its Failure Memory dossier.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
