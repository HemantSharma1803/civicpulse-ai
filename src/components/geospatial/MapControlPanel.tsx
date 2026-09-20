import React from 'react';
import {
  Incident,
  IncidentCategory,
  IncidentSeverity,
  IncidentStatus,
} from '../../types';
import {
  MapFilters,
  MapLayerToggles,
  AreaSelectionState,
} from '../../services/geospatial/types';
import {
  Search,
  Filter,
  Flame,
  AlertOctagon,
  Layers,
  Sparkles,
  Droplet,
  Radio,
  Trash2,
  Lightbulb,
  Car,
  Footprints,
  AlertTriangle,
  Crosshair,
  RotateCcw,
  CheckCircle2,
  X,
} from 'lucide-react';

interface MapControlPanelProps {
  filters: MapFilters;
  onFilterChange: (filters: MapFilters) => void;
  layers: MapLayerToggles;
  onToggleLayer: (layer: keyof MapLayerToggles) => void;
  areaSelection: AreaSelectionState;
  onAreaSelectionChange: (selection: AreaSelectionState) => void;
  allIncidents: Incident[];
  filteredCount: number;
}

const ALL_CATEGORIES: IncidentCategory[] = [
  'Pothole',
  'Drainage Issue',
  'Water Leakage',
  'Traffic Signal Issue',
  'Broken Streetlight',
  'Damaged Footpath',
  'Garbage Overflow',
];

const ALL_SEVERITIES: IncidentSeverity[] = ['critical', 'high', 'medium', 'low'];

export const MapControlPanel: React.FC<MapControlPanelProps> = ({
  filters,
  onFilterChange,
  layers,
  onToggleLayer,
  areaSelection,
  onAreaSelectionChange,
  allIncidents,
  filteredCount,
}) => {
  // Category counts
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const inc of allIncidents) {
      counts[inc.category] = (counts[inc.category] || 0) + 1;
    }
    return counts;
  }, [allIncidents]);

  const handleSearchChange = (query: string) => {
    onFilterChange({
      ...filters,
      searchQuery: query,
      activePreset: null,
    });
  };

  const handleToggleCategory = (cat: IncidentCategory) => {
    const exists = filters.selectedCategories.includes(cat);
    const updated = exists
      ? filters.selectedCategories.filter((c) => c !== cat)
      : [...filters.selectedCategories, cat];

    onFilterChange({
      ...filters,
      selectedCategories: updated,
      activePreset: null,
    });
  };

  const handleToggleSeverity = (sev: IncidentSeverity) => {
    const exists = filters.selectedSeverities.includes(sev);
    const updated = exists
      ? filters.selectedSeverities.filter((s) => s !== sev)
      : [...filters.selectedSeverities, sev];

    onFilterChange({
      ...filters,
      selectedSeverities: updated,
      activePreset: null,
    });
  };

  const applyPreset = (preset: MapFilters['activePreset']) => {
    if (preset === 'chronic_hotspots') {
      onFilterChange({
        ...filters,
        activePreset: 'chronic_hotspots',
        onlyRecurrent: true,
        selectedCategories: [],
        selectedSeverities: [],
        searchQuery: '',
      });
    } else if (preset === 'active_critical') {
      onFilterChange({
        ...filters,
        activePreset: 'active_critical',
        selectedSeverities: ['critical', 'high'],
        selectedStatuses: ['active', 'investigating', 'in_progress'],
        onlyRecurrent: false,
        selectedCategories: [],
        searchQuery: '',
      });
    } else if (preset === 'drainage_corridors') {
      onFilterChange({
        ...filters,
        activePreset: 'drainage_corridors',
        selectedCategories: ['Pothole', 'Drainage Issue', 'Water Leakage'],
        selectedSeverities: [],
        onlyRecurrent: false,
        searchQuery: '',
      });
    } else {
      // Reset all
      onFilterChange({
        searchQuery: '',
        selectedCategories: [],
        selectedSeverities: [],
        selectedStatuses: [],
        onlyRecurrent: false,
        selectedZone: null,
        activePreset: 'all',
      });
    }
  };

  const getCategoryIcon = (category: IncidentCategory) => {
    switch (category) {
      case 'Pothole':
        return <Car className="w-3.5 h-3.5" />;
      case 'Drainage Issue':
        return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'Water Leakage':
        return <Droplet className="w-3.5 h-3.5" />;
      case 'Traffic Signal Issue':
        return <Radio className="w-3.5 h-3.5" />;
      case 'Broken Streetlight':
        return <Lightbulb className="w-3.5 h-3.5" />;
      case 'Damaged Footpath':
        return <Footprints className="w-3.5 h-3.5" />;
      case 'Garbage Overflow':
        return <Trash2 className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div
      id="map-control-panel"
      className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-5 text-slate-800"
    >
      {/* Top Title & Reset */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Filter className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-slate-900 tracking-tight">
            Geospatial Intelligence Lenses
          </span>
        </div>
        <span className="text-[11px] font-mono-code font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
          {filteredCount} / {allIncidents.length} Visible
        </span>
      </div>

      {/* Smart Search Bar */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search street, corridor, ID (e.g. Tonk, Pillar 14)..."
          className="w-full pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
        {filters.searchQuery && (
          <button
            onClick={() => handleSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Strategic Analytical Presets */}
      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Strategic Spatial Presets
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => applyPreset('all')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left border transition-all ${
              filters.activePreset === 'all' ||
              (!filters.activePreset &&
                filters.selectedCategories.length === 0 &&
                filters.selectedSeverities.length === 0 &&
                !filters.onlyRecurrent)
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            All Incidents
          </button>

          <button
            onClick={() => applyPreset('chronic_hotspots')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left border flex items-center gap-1.5 transition-all ${
              filters.activePreset === 'chronic_hotspots' || filters.onlyRecurrent
                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                : 'bg-purple-50 hover:bg-purple-100/70 text-purple-900 border-purple-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Chronic Hotspots</span>
          </button>

          <button
            onClick={() => applyPreset('active_critical')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left border flex items-center gap-1.5 transition-all ${
              filters.activePreset === 'active_critical'
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-rose-50 hover:bg-rose-100/70 text-rose-900 border-rose-200'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Critical Hazards</span>
          </button>

          <button
            onClick={() => applyPreset('drainage_corridors')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left border flex items-center gap-1.5 transition-all ${
              filters.activePreset === 'drainage_corridors'
                ? 'bg-cyan-700 text-white border-cyan-700 shadow-xs'
                : 'bg-cyan-50 hover:bg-cyan-100/70 text-cyan-900 border-cyan-200'
            }`}
          >
            <Droplet className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Drain & Road Link</span>
          </button>
        </div>
      </div>

      {/* Area Selection Tool Button Trigger */}
      <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-indigo-600" />
            Spatial Area Selection Tool
          </span>
          {areaSelection.isActive && (
            <button
              onClick={() =>
                onAreaSelectionChange({
                  isActive: false,
                  mode: null,
                  bounds: null,
                  center: null,
                  radiusMeters: null,
                  selectedIncidentIds: [],
                  stats: null,
                })
              }
              className="text-[10px] font-bold text-rose-600 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        <p className="text-[11px] text-indigo-800 leading-snug">
          Drag directly on the map to compute damage density and failure repair cost inside a sub-region.
        </p>
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() =>
              onAreaSelectionChange({
                ...areaSelection,
                mode: areaSelection.mode === 'box' ? null : 'box',
              })
            }
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors ${
              areaSelection.mode === 'box'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-indigo-900 border-indigo-200 hover:bg-indigo-100/50'
            }`}
          >
            Box Drag
          </button>
          <button
            onClick={() =>
              onAreaSelectionChange({
                ...areaSelection,
                mode: areaSelection.mode === 'radius' ? null : 'radius',
              })
            }
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors ${
              areaSelection.mode === 'radius'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-indigo-900 border-indigo-200 hover:bg-indigo-100/50'
            }`}
          >
            Radius Lasso
          </button>
        </div>
      </div>

      {/* Recurrence Filter Switch */}
      <div className="pt-1">
        <label className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 cursor-pointer transition-colors">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            <span className="text-xs font-bold text-slate-900">
              Only Recurrent Failures (≥ 2x)
            </span>
          </div>
          <input
            type="checkbox"
            checked={filters.onlyRecurrent}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                onlyRecurrent: e.target.checked,
                activePreset: null,
              })
            }
            className="rounded border-slate-300 text-purple-600 focus:ring-0 cursor-pointer"
          />
        </label>
      </div>

      {/* Filter by Category */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Filter by Infrastructure Category
          </label>
          {filters.selectedCategories.length > 0 && (
            <button
              onClick={() => onFilterChange({ ...filters, selectedCategories: [] })}
              className="text-[10px] text-indigo-600 hover:underline font-semibold"
            >
              Reset
            </button>
          )}
        </div>

        <div className="space-y-1">
          {ALL_CATEGORIES.map((cat) => {
            const isSelected = filters.selectedCategories.includes(cat);
            const count = categoryCounts[cat] || 0;

            return (
              <button
                key={cat}
                onClick={() => handleToggleCategory(cat)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200'
                    : 'text-slate-600 hover:bg-slate-50 font-medium'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={isSelected ? 'text-indigo-600' : 'text-slate-400'}>
                    {getCategoryIcon(cat)}
                  </span>
                  <span className="truncate">{cat}</span>
                </div>
                <span className="text-[10px] font-mono-code font-bold text-slate-400">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter by Severity */}
      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Severity Level
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {ALL_SEVERITIES.map((sev) => {
            const isSelected = filters.selectedSeverities.includes(sev);
            return (
              <button
                key={sev}
                onClick={() => handleToggleSeverity(sev)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border transition-colors ${
                  isSelected
                    ? sev === 'critical'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : sev === 'high'
                      ? 'bg-orange-500 text-white border-orange-500'
                      : sev === 'medium'
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-sky-600 text-white border-sky-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {sev}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
