import React, { useState, useEffect } from 'react';
import {
  Incident,
  IncidentCategory,
  Hotspot,
} from '../../types';
import {
  AreaSelectionState,
  GeospatialAIInsight,
} from '../../services/geospatial/types';
import { generateDeterministicGeospatialInsight } from '../../services/geospatial/geoService';
import {
  Sparkles,
  Flame,
  AlertTriangle,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  Wrench,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  Layers,
  FileText,
  X,
} from 'lucide-react';

interface ContextIntelligencePanelProps {
  selectedIncident: Incident | null;
  onClearSelectedIncident: () => void;
  selectedHotspot: Hotspot | null;
  onClearSelectedHotspot: () => void;
  onSelectIncidentById: (id: string) => void;
  areaSelection: AreaSelectionState;
  allIncidents: Incident[];
  allHotspots: Hotspot[];
  onOpenFailureMemory: (incidentId?: string) => void;
  onOpenDetailDrawer: (incidentId: string) => void;
}

export const ContextIntelligencePanel: React.FC<ContextIntelligencePanelProps> = ({
  selectedIncident,
  onClearSelectedIncident,
  selectedHotspot,
  onClearSelectedHotspot,
  onSelectIncidentById,
  areaSelection,
  allIncidents,
  allHotspots,
  onOpenFailureMemory,
  onOpenDetailDrawer,
}) => {
  const [activeTab, setActiveTab] = useState<'entity' | 'city_ai'>('entity');
  const [aiInsight, setAiInsight] = useState<GeospatialAIInsight>(() =>
    generateDeterministicGeospatialInsight(allIncidents, allHotspots)
  );
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);

  // Auto-switch to entity tab when an incident, hotspot, or area is clicked
  useEffect(() => {
    if (selectedIncident || selectedHotspot || areaSelection.isActive) {
      setActiveTab('entity');
    }
  }, [selectedIncident, selectedHotspot, areaSelection.isActive]);

  const fetchAiSpatialSummary = async () => {
    setIsLoadingAi(true);
    try {
      // Aggregate zonal breakdown
      const zoneCounts: Record<string, number> = {};
      for (const inc of allIncidents) {
        zoneCounts[inc.zone] = (zoneCounts[inc.zone] || 0) + 1;
      }

      // Top categories
      const catCounts: Record<string, number> = {};
      for (const inc of allIncidents) {
        catCounts[inc.category] = (catCounts[inc.category] || 0) + 1;
      }
      const dominantCategories = Object.entries(catCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);

      const activeCorridors = allHotspots.map((h) => ({
        name: h.locationName,
        zone: h.zone,
        incidentCount: h.incidentCount,
      }));

      const res = await fetch('/api/ai/geospatial-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalIncidents: allIncidents.length,
          recurrentCount: allIncidents.filter((i) => i.recurrenceCount > 0).length,
          hotspotsCount: allHotspots.length,
          zoneCounts,
          dominantCategories,
          activeCorridors,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.summary) {
          setAiInsight({
            title: json.summary.title,
            summary: json.summary.summary,
            highRiskCorridors: aiInsight.highRiskCorridors,
            crossDepartmentNotice: json.summary.crossDepartmentAction,
            recommendedInterventions: json.summary.corridorObservations,
            generatedAt: new Date().toISOString(),
            source: json.summary.source,
          });
        }
      }
    } catch (e) {
      console.warn('Geospatial AI API fetch failed, fallback retained:', e);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div
      id="context-intelligence-panel"
      className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-5 text-slate-800"
    >
      {/* Tab Navigation: Context Focus vs AI Spatial Synthesis */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('entity')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'entity'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {selectedIncident
              ? 'Selected Incident'
              : selectedHotspot
              ? 'Hotspot Detail'
              : areaSelection.isActive
              ? 'Area Analysis'
              : 'Spatial Inspection'}
          </button>
          <button
            onClick={() => setActiveTab('city_ai')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'city_ai'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Spatial Diagnosis</span>
          </button>
        </div>

        {activeTab === 'city_ai' && (
          <button
            onClick={fetchAiSpatialSummary}
            disabled={isLoadingAi}
            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="Refresh AI Analysis"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* VIEW A: Selected Incident Context                             */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'entity' && selectedIncident && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono-code font-bold text-xs text-indigo-600">
                  {selectedIncident.id}
                </span>
                <span
                  className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    selectedIncident.severity === 'critical'
                      ? 'bg-rose-100 text-rose-800'
                      : selectedIncident.severity === 'high'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {selectedIncident.severity}
                </span>
                <span
                  className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    selectedIncident.status === 'resolved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {selectedIncident.status.replace('_', ' ')}
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 mt-1">
                {selectedIncident.title}
              </h3>
            </div>
            <button
              onClick={onClearSelectedIncident}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2">
            {selectedIncident.description}
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Location</span>
              </span>
              <span className="font-medium text-slate-800 truncate max-w-[180px]">
                {selectedIncident.address}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Zone</span>
              <span className="font-semibold text-slate-800">{selectedIncident.zone}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Coordinates</span>
              <span className="font-mono-code text-[11px] text-slate-700">
                {selectedIncident.latitude.toFixed(4)}, {selectedIncident.longitude.toFixed(4)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Reported</span>
              <span className="text-slate-700">
                {new Date(selectedIncident.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Failure Memory Intelligence Card */}
          <div className="p-3.5 bg-purple-50/70 rounded-xl border border-purple-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-purple-900 font-bold text-xs">
                <Flame className="w-4 h-4 text-purple-600" />
                <span>Infrastructure Memory Profile</span>
              </div>
              <span
                className={`text-[9px] font-mono-code font-bold px-1.5 py-0.5 rounded ${
                  selectedIncident.recurrenceCount >= 3
                    ? 'bg-purple-200 text-purple-900'
                    : selectedIncident.recurrenceCount > 0
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {selectedIncident.recurrenceCount >= 3
                  ? 'PERSISTENT'
                  : selectedIncident.recurrenceCount > 0
                  ? 'RECURRENT'
                  : 'NEW FAILURE'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center pt-1">
              <div className="p-2 bg-white/80 rounded-lg border border-purple-100">
                <span className="text-[10px] text-slate-500 block font-medium">RECURRENCE</span>
                <span className="text-sm font-mono-code font-bold text-purple-900">
                  {selectedIncident.recurrenceCount}x Logged
                </span>
              </div>
              <div className="p-2 bg-white/80 rounded-lg border border-purple-100">
                <span className="text-[10px] text-slate-500 block font-medium">REPAIRS FILED</span>
                <span className="text-sm font-mono-code font-bold text-purple-900">
                  {selectedIncident.repairEventIds.length} Work Orders
                </span>
              </div>
            </div>

            <p className="text-[11px] text-purple-800 leading-relaxed">
              {selectedIncident.recurrenceCount > 0
                ? 'Repeated infrastructure failure at this exact municipal node. Surface repairs have degraded due to sub-surface or drainage factors.'
                : 'Isolated incident recorded at this coordinate. No prior recurring failure patterns detected in memory history.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={() => onOpenDetailDrawer(selectedIncident.id)}
              className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Open Full Incident Record</span>
            </button>

            {selectedIncident.recurrenceCount > 0 && (
              <button
                onClick={() => onOpenFailureMemory(selectedIncident.id)}
                className="w-full py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Flame className="w-3.5 h-3.5 text-purple-600" />
                <span>View Full Failure Memory Story</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW B: Selected Hotspot Context                              */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'entity' && selectedHotspot && !selectedIncident && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 bg-rose-600 text-white rounded-md">
                  <Flame className="w-3.5 h-3.5" />
                </span>
                <span className="text-[10px] font-mono-code font-bold uppercase text-rose-700">
                  CHRONIC HOTSPOT
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 mt-1">
                {selectedHotspot.locationName}
              </h3>
            </div>
            <button
              onClick={onClearSelectedHotspot}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-500">{selectedHotspot.address}</p>

          <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-rose-900 font-bold">Vulnerability Risk Score</span>
              <span className="font-mono-code font-bold text-sm text-rose-700">
                {selectedHotspot.riskScore}/100
              </span>
            </div>
            <div className="w-full h-1.5 bg-rose-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-600 rounded-full"
                style={{ width: `${selectedHotspot.riskScore}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 text-center">
              <div>
                <span className="text-[10px] text-slate-500 block">FAILURES</span>
                <span className="font-mono-code font-bold text-slate-900">
                  {selectedHotspot.incidentCount}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">REPAIRS</span>
                <span className="font-mono-code font-bold text-slate-900">
                  {selectedHotspot.repairCount}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">INTERVAL</span>
                <span className="font-mono-code font-bold text-slate-900">
                  {selectedHotspot.avgIntervalDays}d avg
                </span>
              </div>
            </div>
          </div>

          {/* Linked Incidents in Hotspot */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Chronically Linked Incidents ({selectedHotspot.linkedIncidentIds.length})
            </span>
            <div className="space-y-1.5">
              {selectedHotspot.linkedIncidentIds.map((incId) => {
                const inc = allIncidents.find((i) => i.id === incId);
                if (!inc) return null;
                return (
                  <div
                    key={inc.id}
                    onClick={() => onSelectIncidentById(inc.id)}
                    className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer flex items-center justify-between gap-2 text-xs transition-colors"
                  >
                    <div className="truncate">
                      <span className="font-mono-code font-bold text-indigo-600 mr-1.5">
                        {inc.id}
                      </span>
                      <span className="font-medium text-slate-800">{inc.title}</span>
                    </div>
                    <span className="text-[10px] font-mono-code text-indigo-600 font-bold shrink-0">
                      View →
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onOpenFailureMemory()}
            className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Open in Failure Memory Engine</span>
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW C: Area Selection Analytics                             */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'entity' &&
        areaSelection.isActive &&
        areaSelection.stats &&
        !selectedIncident &&
        !selectedHotspot && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-indigo-600 text-white rounded-md">
                  <Layers className="w-3.5 h-3.5" />
                </span>
                <h3 className="font-bold text-sm text-slate-900">
                  Sub-Region Geospatial Analysis
                </h3>
              </div>
              <span className="text-[10px] font-mono-code font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded">
                {areaSelection.mode === 'box' ? 'BOUNDING BOX' : 'CIRCULAR LASSO'}
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Aggregated infrastructure statistics computed for the selected spatial corridor.
            </p>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-medium">TOTAL INCIDENTS</span>
                <span className="text-base font-mono-code font-bold text-slate-900">
                  {areaSelection.stats.totalCount}
                </span>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                <span className="text-[10px] text-purple-700 block font-medium">RECURRENT FAILURES</span>
                <span className="text-base font-mono-code font-bold text-purple-900">
                  {areaSelection.stats.recurrentCount} (
                  {areaSelection.stats.totalCount > 0
                    ? Math.round(
                        (areaSelection.stats.recurrentCount / areaSelection.stats.totalCount) * 100
                      )
                    : 0}
                  %)
                </span>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                <span className="text-[10px] text-rose-700 block font-medium">CRITICAL HAZARDS</span>
                <span className="text-base font-mono-code font-bold text-rose-900">
                  {areaSelection.stats.criticalCount}
                </span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-emerald-700 block font-medium">EST. REPAIR SUM</span>
                <span className="text-base font-mono-code font-bold text-emerald-900">
                  {areaSelection.stats.estimatedRepairCost}
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
              <span className="text-indigo-900 font-medium">Dominant Failure Mode:</span>
              <strong className="text-indigo-950 font-bold">
                {areaSelection.stats.dominantCategory}
              </strong>
            </div>

            {/* Incidents inside area */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Incidents Inside Selected Region ({areaSelection.selectedIncidentIds.length})
              </span>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {areaSelection.selectedIncidentIds.map((id) => {
                  const inc = allIncidents.find((i) => i.id === id);
                  if (!inc) return null;
                  return (
                    <div
                      key={inc.id}
                      onClick={() => onSelectIncidentById(inc.id)}
                      className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <span className="font-medium text-slate-800 truncate">{inc.title}</span>
                      <span className="text-[10px] font-mono-code text-indigo-600 font-bold shrink-0 ml-2">
                        Inspect
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW D: General Overview & Default State                       */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'entity' &&
        !selectedIncident &&
        !selectedHotspot &&
        !areaSelection.isActive && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-slate-800">
                Interactive Spatial Inspection Active
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Click any incident pin, proximity cluster, or chronic hotspot radar ring on the map
                to inspect its local failure memory and linked repair records.
              </p>
            </div>

            {/* Quick Corridor Rankings */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Chronic Infrastructure Corridors
              </span>
              <div className="space-y-2">
                {allHotspots.slice(0, 3).map((h) => (
                  <div
                    key={h.id}
                    onClick={() => onSelectIncidentById(h.linkedIncidentIds[0])}
                    className="p-2.5 bg-slate-50 hover:bg-purple-50/60 rounded-xl border border-slate-200 hover:border-purple-200 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{h.locationName}</span>
                      <span className="text-[10px] font-mono-code font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                        Risk {h.riskScore}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                      <span>{h.zone}</span>
                      <span>{h.incidentCount} failures recorded</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW E: AI Spatial Intelligence Synthesis                     */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'city_ai' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>{aiInsight.title}</span>
            </div>
            <span className="text-[9px] font-mono-code font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded">
              {aiInsight.source === 'gemini-2.5-flash' ? 'GEMINI 2.5 FLASH' : 'SPATIAL REASONER'}
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
            {aiInsight.summary}
          </p>

          {/* High-risk corridors breakdown */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Critical Failure Corridors
            </span>
            <div className="space-y-2">
              {aiInsight.highRiskCorridors.map((c) => (
                <div
                  key={c.name}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{c.name}</span>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        c.riskLevel === 'critical'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {c.riskLevel}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">{c.assessment}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cross Department Coordination Mandate */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
            <span className="text-[10px] font-bold uppercase text-amber-900 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-amber-700" />
              Inter-Departmental Notice
            </span>
            <p className="text-xs text-amber-900 leading-relaxed">
              {aiInsight.crossDepartmentNotice}
            </p>
          </div>

          {/* Recommended Interventions */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Recommended Municipal Interventions
            </span>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {aiInsight.recommendedInterventions.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
