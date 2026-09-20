import React, { useState, useMemo, useCallback } from 'react';
import {
  Building2,
  MapPin,
  Flame,
  Layers,
  Sparkles,
  Table,
  Radio,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { useCivicPulse } from '../context/CivicPulseContext';
import {
  MapLayerToggles,
  MapFilters,
  AreaSelectionState,
  TimelinePlaybackState,
  MapViewMode,
} from '../services/geospatial/types';
import { filterIncidentsByTimeline } from '../services/geospatial/geoService';

import { CityIntelligenceMap } from '../components/geospatial/CityIntelligenceMap';
import { MapControlPanel } from '../components/geospatial/MapControlPanel';
import { ContextIntelligencePanel } from '../components/geospatial/ContextIntelligencePanel';
import { TimelinePlaybackBar } from '../components/geospatial/TimelinePlaybackBar';
import { AccessibleMapListView } from '../components/geospatial/AccessibleMapListView';
import { AdministrativeZonalMatrix } from '../components/geospatial/AdministrativeZonalMatrix';

export const CityIntelligenceView: React.FC = () => {
  const {
    incidents,
    hotspots,
    selectedIncidentId,
    setSelectedIncidentId,
    setCurrentPage,
  } = useCivicPulse();

  // Primary View Mode
  const [viewMode, setViewMode] = useState<MapViewMode>('map');

  // Selected Hotspot
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);

  // Map Layer Toggles
  const [layers, setLayers] = useState<MapLayerToggles>({
    showMarkers: true,
    showClusters: true,
    showHotspots: true,
    showHeatmap: true,
    showZoneBorders: true,
    showCanalsAndInfrastructure: true,
    showRadarPulses: true,
  });

  const handleToggleLayer = useCallback((layer: keyof MapLayerToggles) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  }, []);

  // Filter State
  const [filters, setFilters] = useState<MapFilters>({
    searchQuery: '',
    selectedCategories: [],
    selectedSeverities: [],
    selectedStatuses: [],
    onlyRecurrent: false,
    selectedZone: null,
    activePreset: 'all',
  });

  // Area Selection State
  const [areaSelection, setAreaSelection] = useState<AreaSelectionState>({
    isActive: false,
    mode: null,
    bounds: null,
    center: null,
    radiusMeters: null,
    selectedIncidentIds: [],
    stats: null,
  });

  // Timeline Playback State
  const [playback, setPlayback] = useState<TimelinePlaybackState>({
    isPlaying: false,
    speed: 1,
    currentDate: '2026-09-20T00:00:00Z',
    minDate: '2026-07-08T00:00:00Z',
    maxDate: '2026-09-20T00:00:00Z',
    progressPercent: 100,
  });

  // 1. Time-filtered incidents based on current playback scrubber
  const timeFilteredIncidents = useMemo(() => {
    return filterIncidentsByTimeline(incidents, playback.currentDate);
  }, [incidents, playback.currentDate]);

  // 2. Apply search, category, severity, and recurrence filters
  const visibleIncidents = useMemo(() => {
    let list = timeFilteredIncidents;

    // Search query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      list = list.filter(
        (i) =>
          i.id.toLowerCase().includes(q) ||
          i.title.toLowerCase().includes(q) ||
          i.address.toLowerCase().includes(q) ||
          i.zone.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (filters.selectedCategories.length > 0) {
      list = list.filter((i) => filters.selectedCategories.includes(i.category));
    }

    // Severity filter
    if (filters.selectedSeverities.length > 0) {
      list = list.filter((i) => filters.selectedSeverities.includes(i.severity));
    }

    // Status filter
    if (filters.selectedStatuses.length > 0) {
      list = list.filter((i) => filters.selectedStatuses.includes(i.status));
    }

    // Recurrent only
    if (filters.onlyRecurrent) {
      list = list.filter((i) => i.recurrenceCount > 0);
    }

    // Selected Zone filter
    if (filters.selectedZone) {
      list = list.filter((i) => i.zone === filters.selectedZone);
    }

    return list;
  }, [timeFilteredIncidents, filters]);

  // Currently selected incident object
  const currentSelectedIncident = useMemo(() => {
    if (!selectedIncidentId) return null;
    return incidents.find((i) => i.id === selectedIncidentId) || null;
  }, [selectedIncidentId, incidents]);

  // Currently selected hotspot object
  const currentSelectedHotspot = useMemo(() => {
    if (!selectedHotspotId) return null;
    return hotspots.find((h) => h.id === selectedHotspotId) || null;
  }, [selectedHotspotId, hotspots]);

  return (
    <div id="city-intelligence-container" className="space-y-6 pb-12">
      {/* Flagship Header */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 bg-indigo-600 text-white rounded-md">
                <Building2 className="w-3.5 h-3.5" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 font-mono-code">
                GEOSPATIAL INFRASTRUCTURE RADAR & FAILURE CORRIDOR ENGINE
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              City Intelligence Geospatial Command
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
              Spatial clustering, chronic recurrence corridor detection, and temporal playback across Mayura Metropolitan District.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl shrink-0 self-start md:self-auto">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                viewMode === 'map'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-indigo-600" />
              <span>Spatial Map</span>
            </button>

            <button
              onClick={() => setViewMode('accessible-list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                viewMode === 'accessible-list'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Table className="w-3.5 h-3.5 text-slate-500" />
              <span>Directory Table</span>
            </button>

            <button
              onClick={() => setViewMode('zonal-matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                viewMode === 'zonal-matrix'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Administrative Sectors</span>
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MODE 1: Flagship Geospatial Map View                               */}
      {/* ------------------------------------------------------------------ */}
      {viewMode === 'map' && (
        <div className="space-y-6">
          {/* Main 3-Column Geospatial Command Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Control Panel: Filters & Presets (3 cols on large screen) */}
            <div className="lg:col-span-3 order-2 lg:order-1">
              <MapControlPanel
                filters={filters}
                onFilterChange={setFilters}
                layers={layers}
                onToggleLayer={handleToggleLayer}
                areaSelection={areaSelection}
                onAreaSelectionChange={setAreaSelection}
                allIncidents={incidents}
                filteredCount={visibleIncidents.length}
              />
            </div>

            {/* Center Map Canvas Stage (6 cols on large screen) */}
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
              <CityIntelligenceMap
                incidents={visibleIncidents}
                hotspots={hotspots}
                selectedIncidentId={selectedIncidentId}
                onSelectIncident={(id) => {
                  setSelectedIncidentId(id);
                  setSelectedHotspotId(null);
                }}
                selectedHotspotId={selectedHotspotId}
                onSelectHotspot={(id) => {
                  setSelectedHotspotId(id);
                  setSelectedIncidentId(null);
                }}
                layers={layers}
                onToggleLayer={handleToggleLayer}
                areaSelection={areaSelection}
                onAreaSelectionChange={setAreaSelection}
                targetDateIso={playback.currentDate}
              />
            </div>

            {/* Right Context Intelligence Panel (3 cols on large screen) */}
            <div className="lg:col-span-3 order-3">
              <ContextIntelligencePanel
                selectedIncident={currentSelectedIncident}
                onClearSelectedIncident={() => setSelectedIncidentId(null)}
                selectedHotspot={currentSelectedHotspot}
                onClearSelectedHotspot={() => setSelectedHotspotId(null)}
                onSelectIncidentById={(id) => {
                  setSelectedIncidentId(id);
                  setSelectedHotspotId(null);
                }}
                areaSelection={areaSelection}
                allIncidents={incidents}
                allHotspots={hotspots}
                onOpenFailureMemory={(incId) => {
                  if (incId) setSelectedIncidentId(incId);
                  setCurrentPage('failure-memory');
                }}
                onOpenDetailDrawer={(incId) => {
                  setSelectedIncidentId(incId);
                }}
              />
            </div>
          </div>

          {/* Bottom Row: Chronological Timeline Playback Scrubber */}
          <TimelinePlaybackBar
            playback={playback}
            onPlaybackChange={setPlayback}
            totalIncidentsCount={incidents.length}
            visibleIncidentsCount={timeFilteredIncidents.length}
          />
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODE 2: Accessible Keyboard Directory View                         */}
      {/* ------------------------------------------------------------------ */}
      {viewMode === 'accessible-list' && (
        <AccessibleMapListView
          incidents={visibleIncidents}
          onSelectIncident={(id) => setSelectedIncidentId(id)}
          onOpenDetailDrawer={(id) => setSelectedIncidentId(id)}
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODE 3: Administrative Zonal Vulnerability Matrix                  */}
      {/* ------------------------------------------------------------------ */}
      {viewMode === 'zonal-matrix' && (
        <AdministrativeZonalMatrix
          incidents={incidents}
          hotspots={hotspots}
          onSelectIncident={(id) => setSelectedIncidentId(id)}
          onNavigateToFailureMemory={() => setCurrentPage('failure-memory')}
        />
      )}
    </div>
  );
};
