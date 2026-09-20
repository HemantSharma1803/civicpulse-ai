import {
  Incident,
  IncidentCategory,
  IncidentSeverity,
  Hotspot,
} from '../../types';
import {
  GeoPoint,
  GeoBounds,
  PixelPoint,
  ClusterNode,
  HeatmapPoint,
  AreaSelectionState,
  GeospatialAIInsight,
} from './types';

export const MAYURA_CITY_BOUNDS: GeoBounds = {
  minLat: 26.818,
  maxLat: 26.936,
  minLng: 75.732,
  maxLng: 75.832,
};

export const SVG_VIEWBOX_WIDTH = 1000;
export const SVG_VIEWBOX_HEIGHT = 800;

/**
 * Administrative Zones of Mayura Metro City with boundary paths and centers
 */
export interface AdministrativeZoneDef {
  name: string;
  code: string;
  color: string;
  center: GeoPoint;
  pathCoordinates: GeoPoint[];
  vulnerabilityScore: number;
}

export const MAYURA_ADMIN_ZONES: AdministrativeZoneDef[] = [
  {
    name: 'South Zone',
    code: 'SZ',
    color: '#ef4444', // high risk
    center: { latitude: 26.852, longitude: 75.803 },
    vulnerabilityScore: 78,
    pathCoordinates: [
      { latitude: 26.865, longitude: 75.790 },
      { latitude: 26.865, longitude: 75.820 },
      { latitude: 26.838, longitude: 75.820 },
      { latitude: 26.838, longitude: 75.790 },
    ],
  },
  {
    name: 'South-East Zone',
    code: 'SEZ',
    color: '#f59e0b',
    center: { latitude: 26.828, longitude: 75.812 },
    vulnerabilityScore: 54,
    pathCoordinates: [
      { latitude: 26.838, longitude: 75.798 },
      { latitude: 26.838, longitude: 75.830 },
      { latitude: 26.818, longitude: 75.830 },
      { latitude: 26.818, longitude: 75.798 },
    ],
  },
  {
    name: 'Central Zone',
    code: 'CZ',
    color: '#8b5cf6',
    center: { latitude: 26.902, longitude: 75.808 },
    vulnerabilityScore: 68,
    pathCoordinates: [
      { latitude: 26.918, longitude: 75.792 },
      { latitude: 26.918, longitude: 75.828 },
      { latitude: 26.885, longitude: 75.828 },
      { latitude: 26.885, longitude: 75.792 },
    ],
  },
  {
    name: 'Central-West Zone',
    code: 'CWZ',
    color: '#3b82f6',
    center: { latitude: 26.906, longitude: 75.782 },
    vulnerabilityScore: 48,
    pathCoordinates: [
      { latitude: 26.918, longitude: 75.768 },
      { latitude: 26.918, longitude: 75.792 },
      { latitude: 26.885, longitude: 75.792 },
      { latitude: 26.885, longitude: 75.768 },
    ],
  },
  {
    name: 'West Zone',
    code: 'WZ',
    color: '#f97316',
    center: { latitude: 26.862, longitude: 75.762 },
    vulnerabilityScore: 62,
    pathCoordinates: [
      { latitude: 26.885, longitude: 75.735 },
      { latitude: 26.885, longitude: 75.790 },
      { latitude: 26.840, longitude: 75.790 },
      { latitude: 26.840, longitude: 75.735 },
    ],
  },
  {
    name: 'North Zone',
    code: 'NZ',
    color: '#10b981',
    center: { latitude: 26.924, longitude: 75.806 },
    vulnerabilityScore: 28,
    pathCoordinates: [
      { latitude: 26.936, longitude: 75.785 },
      { latitude: 26.936, longitude: 75.830 },
      { latitude: 26.918, longitude: 75.830 },
      { latitude: 26.918, longitude: 75.785 },
    ],
  },
];

/**
 * Major arterial road vectors for realistic GIS mapping
 */
export interface RoadVector {
  name: string;
  type: 'highway' | 'arterial' | 'ring' | 'metro';
  points: GeoPoint[];
}

export const MAYURA_ROAD_NETWORK: RoadVector[] = [
  // Tonk Corridor (North-South Arterial spine)
  {
    name: 'Tonk Road Arterial Corridor',
    type: 'arterial',
    points: [
      { latitude: 26.822, longitude: 75.804 },
      { latitude: 26.840, longitude: 75.803 },
      { latitude: 26.852, longitude: 75.8016 },
      { latitude: 26.872, longitude: 75.801 },
      { latitude: 26.890, longitude: 75.802 },
      { latitude: 26.912, longitude: 75.803 },
    ],
  },
  // JLN Marg Boulevard
  {
    name: 'JLN Marg Boulevard',
    type: 'arterial',
    points: [
      { latitude: 26.830, longitude: 75.810 },
      { latitude: 26.850, longitude: 75.812 },
      { latitude: 26.875, longitude: 75.814 },
      { latitude: 26.895, longitude: 75.814 },
      { latitude: 26.918, longitude: 75.812 },
    ],
  },
  // Gopalpura Bypass Ring
  {
    name: 'Gopalpura Bypass & Feeder',
    type: 'highway',
    points: [
      { latitude: 26.862, longitude: 75.735 },
      { latitude: 26.8625, longitude: 75.7799 },
      { latitude: 26.863, longitude: 75.801 },
      { latitude: 26.864, longitude: 75.828 },
    ],
  },
  // Ajmer Elevated Corridor
  {
    name: 'Ajmer Expressway Corridor',
    type: 'highway',
    points: [
      { latitude: 26.884, longitude: 75.732 },
      { latitude: 26.884, longitude: 75.760 },
      { latitude: 26.885, longitude: 75.785 },
      { latitude: 26.887, longitude: 75.800 },
    ],
  },
  // Jawahar Circle Outer Ring
  {
    name: 'Jawahar Circle Peripheral Ring',
    type: 'ring',
    points: [
      { latitude: 26.8285, longitude: 75.803 },
      { latitude: 26.832, longitude: 75.806 },
      { latitude: 26.8285, longitude: 75.809 },
      { latitude: 26.825, longitude: 75.806 },
      { latitude: 26.8285, longitude: 75.803 },
    ],
  },
  // MI Avenue East-West
  {
    name: 'MI Avenue & Central Boulevard',
    type: 'arterial',
    points: [
      { latitude: 26.918, longitude: 75.780 },
      { latitude: 26.919, longitude: 75.800 },
      { latitude: 26.919, longitude: 75.8113 },
      { latitude: 26.920, longitude: 75.830 },
    ],
  },
  // Metro Line 1 Elevated Corridor
  {
    name: 'Metro Line 1 (Elevated)',
    type: 'metro',
    points: [
      { latitude: 26.855, longitude: 75.755 },
      { latitude: 26.859, longitude: 75.762 },
      { latitude: 26.882, longitude: 75.775 },
      { latitude: 26.906, longitude: 75.787 },
      { latitude: 26.921, longitude: 75.798 },
    ],
  },
];

/**
 * Natural drainage culvert & stormwater canal (catalyst for subbase erosion)
 */
export const MAYURA_STORMWATER_CANALS: RoadVector[] = [
  {
    name: 'Amanishah Stormwater Culvert Channel',
    type: 'arterial',
    points: [
      { latitude: 26.932, longitude: 75.770 },
      { latitude: 26.905, longitude: 75.778 },
      { latitude: 26.875, longitude: 75.788 },
      { latitude: 26.8529, longitude: 75.8021 }, // passes directly through Tonk Corridor Culvert!
      { latitude: 26.835, longitude: 75.815 },
      { latitude: 26.820, longitude: 75.825 },
    ],
  },
];

/**
 * Converts geographic coordinates (lat, lng) to SVG pixel coordinates (x, y)
 */
export function geoToPixel(
  lat: number,
  lng: number,
  bounds: GeoBounds = MAYURA_CITY_BOUNDS,
  viewWidth: number = SVG_VIEWBOX_WIDTH,
  viewHeight: number = SVG_VIEWBOX_HEIGHT
): PixelPoint {
  const latRatio = (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat);
  const lngRatio = (lng - bounds.minLng) / (bounds.maxLng - bounds.minLng);

  // In SVG, y=0 is at the top, so higher latitude is smaller y
  const x = lngRatio * viewWidth;
  const y = (1 - latRatio) * viewHeight;

  return { x, y };
}

/**
 * Converts SVG pixel coordinates (x, y) back to geographic coordinates (lat, lng)
 */
export function pixelToGeo(
  x: number,
  y: number,
  bounds: GeoBounds = MAYURA_CITY_BOUNDS,
  viewWidth: number = SVG_VIEWBOX_WIDTH,
  viewHeight: number = SVG_VIEWBOX_HEIGHT
): GeoPoint {
  const lngRatio = x / viewWidth;
  const latRatio = 1 - y / viewHeight;

  const longitude = bounds.minLng + lngRatio * (bounds.maxLng - bounds.minLng);
  const latitude = bounds.minLat + latRatio * (bounds.maxLat - bounds.minLat);

  return { latitude, longitude };
}

/**
 * Haversine formula to compute distance in meters between two lat/lng points
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaPhi = toRad(lat2 - lat1);
  const deltaLambda = toRad(lon2 - lon1);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Clusters incidents based on geographic proximity.
 * Clustering threshold adjusts with zoom level (higher zoom = smaller cluster radius).
 */
export function clusterIncidents(
  incidents: Incident[],
  zoomLevel: number = 1,
  bounds: GeoBounds = MAYURA_CITY_BOUNDS
): { clusters: ClusterNode[]; singles: Incident[] } {
  if (zoomLevel >= 3.5) {
    // High zoom: show individual markers with no clustering
    return { clusters: [], singles: incidents };
  }

  // Cluster radius in meters: at zoom 1 ~ 600m, zoom 2 ~ 350m, zoom 3 ~ 180m
  const radiusMeters = Math.max(120, Math.round(650 / zoomLevel));

  const clusters: ClusterNode[] = [];
  const singles: Incident[] = [];
  const assigned = new Set<string>();

  for (let i = 0; i < incidents.length; i++) {
    const inc = incidents[i];
    if (assigned.has(inc.id)) continue;

    const group: Incident[] = [inc];
    assigned.add(inc.id);

    for (let j = i + 1; j < incidents.length; j++) {
      const candidate = incidents[j];
      if (assigned.has(candidate.id)) continue;

      const dist = calculateHaversineDistance(
        inc.latitude,
        inc.longitude,
        candidate.latitude,
        candidate.longitude
      );

      if (dist <= radiusMeters) {
        group.push(candidate);
        assigned.add(candidate.id);
      }
    }

    if (group.length > 1) {
      // Calculate cluster center
      const avgLat = group.reduce((sum, item) => sum + item.latitude, 0) / group.length;
      const avgLng = group.reduce((sum, item) => sum + item.longitude, 0) / group.length;

      // Find dominant category
      const catCount: Record<string, number> = {};
      let dominantCategory: IncidentCategory = group[0].category;
      let maxCount = 0;
      for (const item of group) {
        catCount[item.category] = (catCount[item.category] || 0) + 1;
        if (catCount[item.category] > maxCount) {
          maxCount = catCount[item.category];
          dominantCategory = item.category;
        }
      }

      const hasCritical = group.some((item) => item.severity === 'critical');
      const hasRecurrent = group.some((item) => item.recurrenceCount > 0);
      const pixelPoint = geoToPixel(avgLat, avgLng, bounds);

      clusters.push({
        id: `cluster-${inc.id}`,
        center: { latitude: avgLat, longitude: avgLng },
        count: group.length,
        incidents: group,
        dominantCategory,
        hasCritical,
        hasRecurrent,
        pixelPoint,
      });
    } else {
      singles.push(inc);
    }
  }

  return { clusters, singles };
}

/**
 * Generates heatmap data points with density weights
 */
export function generateHeatmapPoints(
  incidents: Incident[],
  hotspots: Hotspot[]
): HeatmapPoint[] {
  const points: HeatmapPoint[] = [];

  for (const inc of incidents) {
    let weight = 0.4;
    if (inc.severity === 'critical') weight = 0.9;
    else if (inc.severity === 'high') weight = 0.7;
    else if (inc.severity === 'medium') weight = 0.5;

    if (inc.recurrenceCount > 0) {
      weight = Math.min(1.0, weight * 1.35);
    }

    points.push({
      latitude: inc.latitude,
      longitude: inc.longitude,
      weight,
      radius: 40 + (inc.recurrenceCount > 0 ? 25 : 0),
    });
  }

  // Boost chronic hotspots
  for (const hot of hotspots) {
    points.push({
      latitude: hot.latitude,
      longitude: hot.longitude,
      weight: 1.0,
      radius: 65,
    });
  }

  return points;
}

/**
 * Filter incidents inside a geometric bounding box or circular radius
 */
export function filterIncidentsByArea(
  incidents: Incident[],
  selection: {
    mode: 'box' | 'radius';
    bounds?: GeoBounds | null;
    center?: GeoPoint | null;
    radiusMeters?: number | null;
  }
): {
  selected: Incident[];
  stats: NonNullable<AreaSelectionState['stats']>;
} {
  let matched: Incident[] = [];

  if (selection.mode === 'box' && selection.bounds) {
    const { minLat, maxLat, minLng, maxLng } = selection.bounds;
    matched = incidents.filter(
      (i) =>
        i.latitude >= Math.min(minLat, maxLat) &&
        i.latitude <= Math.max(minLat, maxLat) &&
        i.longitude >= Math.min(minLng, maxLng) &&
        i.longitude <= Math.max(minLng, maxLng)
    );
  } else if (selection.mode === 'radius' && selection.center && selection.radiusMeters) {
    matched = incidents.filter((i) => {
      const dist = calculateHaversineDistance(
        selection.center!.latitude,
        selection.center!.longitude,
        i.latitude,
        i.longitude
      );
      return dist <= selection.radiusMeters!;
    });
  }

  // Compute aggregate metrics
  const totalCount = matched.length;
  const activeCount = matched.filter((i) => i.status !== 'resolved').length;
  const recurrentCount = matched.filter((i) => i.recurrenceCount > 0).length;
  const resolvedCount = matched.filter((i) => i.status === 'resolved').length;
  const criticalCount = matched.filter((i) => i.severity === 'critical').length;

  const catCounts: Record<string, number> = {};
  for (const i of matched) {
    catCounts[i.category] = (catCounts[i.category] || 0) + 1;
  }
  let dominantCategory = 'None';
  let maxC = 0;
  for (const [cat, count] of Object.entries(catCounts)) {
    if (count > maxC) {
      maxC = count;
      dominantCategory = cat;
    }
  }

  // Estimated repair cost: ~₹16,500 average per work order in dataset
  const estimatedCostValue = totalCount * 16500;
  const formattedCost = `₹${(estimatedCostValue / 1000).toFixed(0)}k`;

  return {
    selected: matched,
    stats: {
      totalCount,
      activeCount,
      recurrentCount,
      resolvedCount,
      dominantCategory,
      criticalCount,
      estimatedRepairCost: formattedCost,
    },
  };
}

/**
 * Filter incidents active or created up to a specific date in timeline playback
 */
export function filterIncidentsByTimeline(
  incidents: Incident[],
  targetDateIso: string
): Incident[] {
  const targetTime = new Date(targetDateIso).getTime();
  return incidents.filter((i) => new Date(i.createdAt).getTime() <= targetTime);
}

/**
 * Generate Structured AI Geospatial Intelligence Summary
 */
export function generateDeterministicGeospatialInsight(
  incidents: Incident[],
  hotspots: Hotspot[]
): GeospatialAIInsight {
  const total = incidents.length;
  const recurrent = incidents.filter((i) => i.recurrenceCount > 0).length;
  const chronicHotspotCount = hotspots.length;

  return {
    title: 'Metropolitan Geospatial Infrastructure Failure Diagnosis',
    summary: `Spatial analysis of ${total} recorded municipal incidents reveals ${recurrent} recurrent failure points (${Math.round(
      (recurrent / total) * 100
    )}% recurrence rate) and ${chronicHotspotCount} chronic high-density corridors. Geographic clustering identifies high correlation between surface stormwater culvert backflow and repeated subbase asphalt depression.`,
    highRiskCorridors: [
      {
        name: 'Tonk Corridor Junction (Pillar 14)',
        zone: 'South Zone',
        dominantCategory: 'Pothole & Drainage',
        failureCount: 4,
        recurrenceRate: '75%',
        riskLevel: 'critical',
        assessment:
          'Monsoon stormwater runoff from Culvert Box 4B channels directly across the road base, repeatedly stripping cold bitumen patches within an average of 22 days.',
      },
      {
        name: 'Gopalpura Bypass Feeder Intersection',
        zone: 'West Zone',
        dominantCategory: 'Traffic Signal & Power Surge',
        failureCount: 3,
        recurrenceRate: '100%',
        riskLevel: 'critical',
        assessment:
          'Substation grid fluctuations coincide with master controller timing board burns. Secondary controller crash occurred 17 days after initial relay board repair.',
      },
      {
        name: 'Jawahar Circle Peripheral Ring',
        zone: 'South-East Zone',
        dominantCategory: 'Water Transmission Main',
        failureCount: 3,
        recurrenceRate: '67%',
        riskLevel: 'high',
        assessment:
          'High-pressure cast iron sleeve collar clamp shows cyclical stress. Joint seepage softens road embankment tiles.',
      },
      {
        name: 'Bapu Nagar Commercial Corner',
        zone: 'Central Zone',
        dominantCategory: 'Garbage & Sanitation',
        failureCount: 3,
        recurrenceRate: '67%',
        riskLevel: 'high',
        assessment:
          'Compactor bin capacity exceeded during weekend market cycles, overflowing onto adjacent pedestrian walkway berm.',
      },
    ],
    crossDepartmentNotice:
      'Inter-agency coordination required: Roads & Bridges Division and Stormwater Drainage Board must execute joint sub-surface culvert regrading before issuing another asphalt work order on Tonk Corridor.',
    recommendedInterventions: [
      'Prioritize Tonk Corridor Pillar 14 for integrated drainage siphon installation rather than surface bituminous patch.',
      'Deploy surge suppression line filters on Gopalpura Bypass master controller junction.',
      'Schedule preventative ultrasonic thickness check on Jawahar Circle 300mm water transmission pipeline.',
    ],
    generatedAt: new Date().toISOString(),
    source: 'deterministic-spatial-engine',
  };
}
