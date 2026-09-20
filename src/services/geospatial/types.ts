import { Incident, IncidentCategory, IncidentSeverity, IncidentStatus, Hotspot } from '../../types';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface GeoBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface PixelPoint {
  x: number;
  y: number;
}

export type MapViewMode = 'map' | 'accessible-list' | 'zonal-matrix';

export interface MapLayerToggles {
  showMarkers: boolean;
  showClusters: boolean;
  showHotspots: boolean;
  showHeatmap: boolean;
  showZoneBorders: boolean;
  showCanalsAndInfrastructure: boolean;
  showRadarPulses: boolean;
}

export interface MapFilters {
  searchQuery: string;
  selectedCategories: IncidentCategory[];
  selectedSeverities: IncidentSeverity[];
  selectedStatuses: IncidentStatus[];
  onlyRecurrent: boolean;
  selectedZone: string | null;
  activePreset: 'all' | 'chronic_hotspots' | 'active_critical' | 'drainage_corridors' | null;
}

export interface ClusterNode {
  id: string;
  center: GeoPoint;
  count: number;
  incidents: Incident[];
  dominantCategory: IncidentCategory;
  hasCritical: boolean;
  hasRecurrent: boolean;
  pixelPoint?: PixelPoint;
}

export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  weight: number; // 0 to 1
  radius: number;
}

export interface AreaSelectionState {
  isActive: boolean;
  mode: 'box' | 'radius' | null;
  bounds: GeoBounds | null;
  center: GeoPoint | null;
  radiusMeters: number | null;
  selectedIncidentIds: string[];
  stats: {
    totalCount: number;
    activeCount: number;
    recurrentCount: number;
    resolvedCount: number;
    dominantCategory: string;
    criticalCount: number;
    estimatedRepairCost: string;
  } | null;
}

export interface TimelinePlaybackState {
  isPlaying: boolean;
  speed: 1 | 2 | 4;
  currentDate: string; // ISO string
  minDate: string;
  maxDate: string;
  progressPercent: number; // 0 to 100
}

export interface GeospatialAIInsight {
  title: string;
  summary: string;
  highRiskCorridors: Array<{
    name: string;
    zone: string;
    dominantCategory: string;
    failureCount: number;
    recurrenceRate: string;
    riskLevel: 'critical' | 'high' | 'medium';
    assessment: string;
  }>;
  crossDepartmentNotice: string;
  recommendedInterventions: string[];
  generatedAt: string;
  source: 'gemini-2.5-flash' | 'deterministic-spatial-engine';
}
