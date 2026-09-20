import { Incident, IncidentCategory, RepairEvent } from '../../types';
import {
  CategoryMemorySummary,
  FailureMemory,
  LocationMemory,
  MemoryState,
} from './types';
import { calculateHaversineDistance } from './scoring';
import { isValidCoordinate } from './validators';
import { classifyMemoryState } from './explanations';

/**
 * Groups all incidents into spatial coordinate clusters (<= 350m).
 */
export function clusterIncidentsByLocation(
  incidents: Incident[],
  radiusMeters: number = 350
): Incident[][] {
  const clusters: Incident[][] = [];
  const assigned = new Set<string>();

  for (const inc of incidents) {
    if (assigned.has(inc.id)) continue;
    if (!isValidCoordinate(inc.latitude, inc.longitude)) {
      clusters.push([inc]);
      assigned.add(inc.id);
      continue;
    }

    const currentCluster: Incident[] = [inc];
    assigned.add(inc.id);

    for (const candidate of incidents) {
      if (assigned.has(candidate.id)) continue;
      if (!isValidCoordinate(candidate.latitude, candidate.longitude)) continue;

      const dist = calculateHaversineDistance(
        inc.latitude,
        inc.longitude,
        candidate.latitude,
        candidate.longitude
      );

      if (dist <= radiusMeters) {
        currentCluster.push(candidate);
        assigned.add(candidate.id);
      }
    }

    clusters.push(currentCluster);
  }

  return clusters;
}

/**
 * Builds a LocationMemory aggregating category breakdowns while preserving category-specific context.
 */
export function buildLocationMemory(
  locationCluster: Incident[],
  allRepairs: RepairEvent[],
  memoriesByCategory: Record<string, FailureMemory>
): LocationMemory {
  const primary = locationCluster[0];
  const locationName = primary.address.split(',')[0].trim() || 'Municipal Node';
  const address = primary.address;
  const coordinates = { latitude: primary.latitude, longitude: primary.longitude };
  const zone = primary.zone;

  const clusterIncidentIds = new Set(locationCluster.map((i) => i.id));
  const clusterRepairs = allRepairs.filter((r) => clusterIncidentIds.has(r.incidentId));

  // Category breakdown
  const categoryMap: Partial<Record<IncidentCategory, Incident[]>> = {};
  for (const inc of locationCluster) {
    if (!categoryMap[inc.category]) {
      categoryMap[inc.category] = [];
    }
    categoryMap[inc.category]!.push(inc);
  }

  const categoryBreakdown: CategoryMemorySummary[] = [];
  let dominantCategory = primary.category;
  let maxCatCount = 0;

  for (const [cat, items] of Object.entries(categoryMap)) {
    const category = cat as IncidentCategory;
    const catRepairs = clusterRepairs.filter((r) =>
      items.some((i) => i.id === r.incidentId)
    );
    const catActive = items.filter((i) => i.status !== 'resolved').length;
    const catState = classifyMemoryState(items, catRepairs);

    if (items.length > maxCatCount) {
      maxCatCount = items.length;
      dominantCategory = category;
    }

    const sortedByDate = [...items].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    categoryBreakdown.push({
      category,
      count: items.length,
      activeCount: catActive,
      repairCount: catRepairs.length,
      currentState: catState,
      dominantSeverity: sortedByDate[0].severity,
      lastReportedDate: sortedByDate[0].createdAt,
    });
  }

  const totalIncidents = locationCluster.length;
  const totalRepairs = clusterRepairs.length;
  const activeIncidents = locationCluster.filter((i) => i.status !== 'resolved').length;
  const overallState = classifyMemoryState(locationCluster, clusterRepairs);

  return {
    locationId: `LOC-${primary.id}`,
    locationName,
    address,
    coordinates,
    zone,
    categoryBreakdown,
    dominantCategory,
    totalIncidents,
    totalRepairs,
    activeIncidents,
    overallState,
    memoriesByCategory,
  };
}
