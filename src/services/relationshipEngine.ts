import {
  Incident,
  IncidentCategory,
  Hotspot,
  RelatedMatch,
  MemoryCheckResult,
  RelationType,
} from '../types';

/**
 * Calculates Haversine distance between two sets of GPS coordinates in meters.
 */
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Category compatibility graph for municipal infrastructure
 */
const RELATED_CATEGORIES: Record<string, string[]> = {
  'Pothole': ['Damaged Footpath', 'Drainage Issue'],
  'Damaged Footpath': ['Pothole'],
  'Water Leakage': ['Drainage Issue', 'Pothole'],
  'Drainage Issue': ['Water Leakage', 'Garbage Overflow', 'Pothole'],
  'Broken Streetlight': ['Traffic Signal Issue'],
  'Traffic Signal Issue': ['Broken Streetlight'],
  'Garbage Overflow': ['Drainage Issue'],
};

export function getCategorySimilarity(catA: string, catB: string): number {
  if (catA.toLowerCase() === catB.toLowerCase()) return 1.0;
  const related = RELATED_CATEGORIES[catA] || [];
  if (related.some((r) => r.toLowerCase() === catB.toLowerCase())) return 0.65;
  return 0.1;
}

/**
 * Jaccard text similarity on alphanumeric token n-grams
 */
export function calculateTextSimilarity(textA: string, textB: string): number {
  const tokenize = (str: string) => {
    return new Set(
      str
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2 && !['the', 'and', 'near', 'road', 'street', 'issue', 'with', 'for'].includes(w))
    );
  };

  const setA = tokenize(textA);
  const setB = tokenize(textB);

  if (setA.size === 0 || setB.size === 0) return 0.1;

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }

  const union = setA.size + setB.size - intersection;
  return union > 0 ? intersection / union : 0;
}

export interface MemoryCheckInput {
  latitude: number;
  longitude: number;
  category: IncidentCategory | string;
  title?: string;
  description?: string;
  excludeIncidentId?: string;
}

/**
 * CivicPulse Multi-Signal Relationship Engine
 * Correlates prospective complaints against persistent infrastructure memory.
 */
export function findRelatedIncidents(
  input: MemoryCheckInput,
  incidentsPool: Incident[],
  hotspotsPool: Hotspot[] = []
): MemoryCheckResult {
  const matches: RelatedMatch[] = [];
  const nowTime = new Date('2026-09-20T12:00:00Z').getTime();

  for (const incident of incidentsPool) {
    if (input.excludeIncidentId && incident.id === input.excludeIncidentId) {
      continue;
    }

    const distance = calculateHaversineDistanceMeters(
      input.latitude,
      input.longitude,
      incident.latitude,
      incident.longitude
    );

    // Skip if beyond 800m
    if (distance > 800) continue;

    const catSim = getCategorySimilarity(input.category, incident.category);
    const semanticSim = calculateTextSimilarity(
      `${input.title || ''} ${input.description || ''}`,
      `${incident.title} ${incident.description} ${incident.tags.join(' ')}`
    );

    const incCreatedTime = new Date(incident.createdAt).getTime();
    const daysAgo = Math.max(1, Math.round((nowTime - incCreatedTime) / (1000 * 60 * 60 * 24)));

    let temporalRelevance = 0.5;
    if (daysAgo <= 14) temporalRelevance = 1.0;
    else if (daysAgo <= 45) temporalRelevance = 0.8;
    else if (daysAgo <= 90) temporalRelevance = 0.6;
    else temporalRelevance = 0.35;

    // Proximity score: decays with distance
    let proximityScore = 0.1;
    if (distance <= 60) proximityScore = 1.0;
    else if (distance <= 120) proximityScore = 0.9;
    else if (distance <= 200) proximityScore = 0.75;
    else if (distance <= 350) proximityScore = 0.5;
    else if (distance <= 500) proximityScore = 0.3;

    // Weighted match calculation
    const overallScore = Math.min(
      98,
      Math.round(
        proximityScore * 40 +
          catSim * 35 +
          semanticSim * 15 +
          temporalRelevance * 10
      )
    );

    // Reasons formulation (verifiable and explainable)
    const reasons: string[] = [];
    if (distance <= 100) {
      reasons.push(`Within ${distance} meters of prior complaint coordinates`);
    } else {
      reasons.push(`Located ${distance} meters away in the same municipal corridor`);
    }

    if (catSim >= 0.9) {
      reasons.push(`Identical civic infrastructure defect category (${incident.category})`);
    } else if (catSim >= 0.5) {
      reasons.push(`Functionally related municipal domain (${incident.category})`);
    }

    if (semanticSim >= 0.25) {
      reasons.push('Contextual keyword overlap in reported defect description');
    }

    if (incident.repairEventIds && incident.repairEventIds.length > 0) {
      reasons.push(`${incident.repairEventIds.length} municipal repair intervention(s) logged at this node`);
    }

    if (daysAgo <= 14 && incident.status !== 'resolved') {
      reasons.push(`Active report (${daysAgo}d ago) currently under municipal handling`);
    }

    // Determine Relation Type
    let relationType: RelationType = 'NO_STRONG_MATCH';

    const isVeryClose = distance <= 120;
    const isSameCategory = catSim >= 0.9;
    const isRecentAndActive = daysAgo <= 30 && incident.status !== 'resolved';

    if (isVeryClose && isSameCategory && isRecentAndActive && overallScore >= 75) {
      relationType = 'LIKELY_DUPLICATE';
    } else if (isVeryClose && incident.repairEventIds && incident.repairEventIds.length > 0) {
      relationType = 'HISTORICAL_RELATED';
    } else if (overallScore >= 55) {
      relationType = incident.recurrenceCount > 0 ? 'HISTORICAL_RELATED' : 'POSSIBLE_RELATED';
    } else if (overallScore >= 35 && (isVeryClose || isSameCategory)) {
      relationType = 'POSSIBLE_RELATED';
    }

    if (relationType !== 'NO_STRONG_MATCH') {
      matches.push({
        incidentId: incident.id,
        incidentTitle: incident.title,
        category: incident.category,
        status: incident.status,
        severity: incident.severity,
        distanceMeters: distance,
        relationType,
        categorySimilarity: Math.round(catSim * 100),
        semanticSimilarity: Math.round(semanticSim * 100),
        temporalRelevance: Math.round(temporalRelevance * 100),
        overallMatchScore: overallScore,
        reasons,
        createdAt: incident.createdAt,
        recurrenceCount: incident.recurrenceCount,
        repairsCount: incident.repairEventIds ? incident.repairEventIds.length : 0,
        repairEventIds: incident.repairEventIds,
      });
    }
  }

  // Sort by overall match score descending
  matches.sort((a, b) => b.overallMatchScore - a.overallMatchScore);

  // Check for chronic hotspot proximity
  let matchingHotspot: Hotspot | null = null;
  for (const hotspot of hotspotsPool) {
    const dist = calculateHaversineDistanceMeters(
      input.latitude,
      input.longitude,
      hotspot.latitude,
      hotspot.longitude
    );
    if (dist <= 300) {
      matchingHotspot = hotspot;
      break;
    }
  }

  const likelyDuplicateMatch = matches.find((m) => m.relationType === 'LIKELY_DUPLICATE') || null;
  const duplicateWarning = Boolean(likelyDuplicateMatch);

  const hasLocationHistory = matches.length > 0 || Boolean(matchingHotspot);

  let locationHistorySummary = 'No previous complaints recorded within 350 meters of these coordinates.';
  if (matchingHotspot) {
    locationHistorySummary = `This location is part of chronic hotspot "${matchingHotspot.locationName}" (${matchingHotspot.incidentCount} previous failure cycles, ${matchingHotspot.repairCount} recorded repairs).`;
  } else if (matches.length > 0) {
    locationHistorySummary = `CivicPulse memory found ${matches.length} historically linked incident(s) within the immediate spatial radius.`;
  }

  return {
    matches,
    duplicateWarning,
    likelyDuplicateMatch,
    chronicHotspot: matchingHotspot,
    locationHistorySummary,
    hasLocationHistory,
    typicalRecurrenceIntervalDays: matchingHotspot?.avgIntervalDays || 22,
  };
}
