import { Incident, IncidentCategory, RepairEvent } from '../../types';
import {
  ProximityThreshold,
  RelationshipSignals,
  RelationType,
} from './types';
import { isValidCoordinate } from './validators';

/**
 * Calculates exact Haversine distance in meters between two GPS coordinates.
 */
export function calculateHaversineDistance(
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
 * Evaluates proximity threshold from distance in meters.
 */
export function classifyProximity(distanceMeters: number | null): {
  threshold: ProximityThreshold;
  score: number;
  label: string;
} {
  if (distanceMeters === null) {
    return { threshold: 'UNKNOWN', score: 0.1, label: 'Insufficient coordinates' };
  }
  if (distanceMeters <= 60) {
    return { threshold: 'VERY_NEAR', score: 1.0, label: `Approx. ${distanceMeters} m away (Immediate node)` };
  }
  if (distanceMeters <= 120) {
    return { threshold: 'NEAR', score: 0.85, label: `Approx. ${distanceMeters} m away (Same block)` };
  }
  if (distanceMeters <= 350) {
    return { threshold: 'SAME_AREA', score: 0.55, label: `Approx. ${distanceMeters} m away (Immediate corridor)` };
  }
  if (distanceMeters <= 800) {
    return { threshold: 'DISTANT', score: 0.25, label: `Approx. ${distanceMeters} m away (Zonal perimeter)` };
  }
  return { threshold: 'OUT_OF_RANGE', score: 0.0, label: `Approx. ${distanceMeters} m away (Distant)` };
}

/**
 * Domain-specific Category Compatibility Matrix
 */
const CATEGORY_COMPATIBILITY: Record<string, Record<string, number>> = {
  'Pothole': {
    'Pothole': 1.0,
    'Damaged Footpath': 0.70,
    'Drainage Issue': 0.65,
    'Water Leakage': 0.55,
  },
  'Damaged Footpath': {
    'Damaged Footpath': 1.0,
    'Pothole': 0.70,
    'Drainage Issue': 0.50,
  },
  'Water Leakage': {
    'Water Leakage': 1.0,
    'Drainage Issue': 0.75,
    'Pothole': 0.55,
  },
  'Drainage Issue': {
    'Drainage Issue': 1.0,
    'Water Leakage': 0.75,
    'Pothole': 0.65,
    'Garbage Overflow': 0.60,
  },
  'Garbage Overflow': {
    'Garbage Overflow': 1.0,
    'Drainage Issue': 0.60,
  },
  'Broken Streetlight': {
    'Broken Streetlight': 1.0,
    'Traffic Signal Issue': 0.70,
  },
  'Traffic Signal Issue': {
    'Traffic Signal Issue': 1.0,
    'Broken Streetlight': 0.70,
  },
};

export function getCategoryCompatibilityScore(
  categoryA: string,
  categoryB: string
): { score: number; reason: string } {
  const normA = categoryA.trim();
  const normB = categoryB.trim();

  if (normA.toLowerCase() === normB.toLowerCase()) {
    return { score: 1.0, reason: `Identical civic infrastructure defect category (${categoryA})` };
  }

  const lookup = CATEGORY_COMPATIBILITY[normA]?.[normB] ?? CATEGORY_COMPATIBILITY[normB]?.[normA];
  if (lookup !== undefined) {
    return { score: lookup, reason: `Functionally connected infrastructure domain (${categoryA} ↔ ${categoryB})` };
  }

  return { score: 0.10, reason: `Dissimilar infrastructure categories (${categoryA} vs ${categoryB})` };
}

/**
 * Text token & keyword similarity engine
 */
const STOP_WORDS = new Set([
  'the', 'and', 'near', 'road', 'street', 'issue', 'with', 'for', 'from',
  'area', 'side', 'main', 'lane', 'gate', 'nagar', 'colony', 'marg',
]);

export function calculateNormalizedTextSimilarity(
  textA: string,
  textB: string
): { score: number; sharedKeywords: string[] } {
  const tokenize = (str: string) => {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  };

  const tokensA = new Set(tokenize(textA));
  const tokensB = new Set(tokenize(textB));

  if (tokensA.size === 0 || tokensB.size === 0) {
    return { score: 0.1, sharedKeywords: [] };
  }

  const shared: string[] = [];
  for (const t of tokensA) {
    if (tokensB.has(t)) {
      shared.push(t);
    }
  }

  const union = new Set([...tokensA, ...tokensB]).size;
  const jaccard = union > 0 ? shared.length / union : 0;

  // Normalized score between 0.1 and 1.0
  const normalized = Math.min(1.0, Math.max(0.1, jaccard * 1.6));
  return { score: Number(normalized.toFixed(2)), sharedKeywords: shared };
}

/**
 * Transparent temporal weighting
 */
export function calculateTemporalRelationship(
  dateAStr: string,
  dateBStr: string,
  hasInterveningRepair: boolean
): { score: number; daysDiff: number; reason: string } {
  const timeA = new Date(dateAStr).getTime();
  const timeB = new Date(dateBStr).getTime();
  const diffMs = Math.abs(timeA - timeB);
  const daysDiff = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));

  if (hasInterveningRepair) {
    return {
      score: 0.88,
      daysDiff,
      reason: `Occurred ${daysDiff} days after a previous repair event`,
    };
  }

  if (daysDiff <= 7) {
    return {
      score: 0.95,
      daysDiff,
      reason: `Reported within ${daysDiff} days of prior record (high temporal overlap)`,
    };
  }
  if (daysDiff <= 30) {
    return {
      score: 0.85,
      daysDiff,
      reason: `Reported within ${daysDiff} days (rapid re-emergence window)`,
    };
  }
  if (daysDiff <= 90) {
    return {
      score: 0.70,
      daysDiff,
      reason: `Recorded ${daysDiff} days later (observed seasonal recurrence cycle)`,
    };
  }
  if (daysDiff <= 180) {
    return {
      score: 0.50,
      daysDiff,
      reason: `Historical interval: ${daysDiff} days elapsed`,
    };
  }

  return {
    score: 0.30,
    daysDiff,
    reason: `Extended historical lineage: ${daysDiff} days elapsed`,
  };
}

/**
 * Composite Relationship Scorer
 */
export function calculateRelationshipSignals(
  source: {
    id?: string;
    latitude: number;
    longitude: number;
    category: IncidentCategory | string;
    title: string;
    description: string;
    createdAt: string;
    relatedIncidentIds?: string[];
  },
  target: Incident,
  allRepairs: RepairEvent[] = []
): RelationshipSignals {
  const reasons: string[] = [];

  // 1. Geographic distance & score
  let distanceMeters: number | null = null;
  if (
    isValidCoordinate(source.latitude, source.longitude) &&
    isValidCoordinate(target.latitude, target.longitude)
  ) {
    distanceMeters = calculateHaversineDistance(
      source.latitude,
      source.longitude,
      target.latitude,
      target.longitude
    );
  }

  const proximity = classifyProximity(distanceMeters);
  const geographicScore = proximity.score;
  reasons.push(proximity.label);

  // 2. Category score
  const categoryResult = getCategoryCompatibilityScore(source.category, target.category);
  const categoryScore = categoryResult.score;
  reasons.push(categoryResult.reason);

  // 3. Text & Description score
  const textResult = calculateNormalizedTextSimilarity(
    `${source.title} ${source.description}`,
    `${target.title} ${target.description} ${target.tags.join(' ')}`
  );
  const textScore = textResult.score;
  if (textResult.sharedKeywords.length > 0) {
    reasons.push(`Shared defect descriptors: ${textResult.sharedKeywords.slice(0, 3).join(', ')}`);
  }

  // Check for intervening repair events
  const targetRepairs = allRepairs.filter((r) => r.incidentId === target.id);
  const hasInterveningRepair = targetRepairs.length > 0;
  if (hasInterveningRepair) {
    reasons.push(`${targetRepairs.length} recorded repair intervention(s) in historical registry`);
  }

  // 4. Temporal score
  const temporalResult = calculateTemporalRelationship(
    source.createdAt,
    target.createdAt,
    hasInterveningRepair
  );
  const temporalScore = temporalResult.score;
  reasons.push(temporalResult.reason);

  // 5. Existing explicit link signal
  const hasExistingLink =
    (source.relatedIncidentIds && source.relatedIncidentIds.includes(target.id)) ||
    (target.relatedIncidentIds && source.id && target.relatedIncidentIds.includes(source.id));
  const existingLinkScore = hasExistingLink ? 1.0 : 0.0;
  if (hasExistingLink) {
    reasons.push('Explicit historical linkage recorded in registry');
  }

  // Composite calculation
  // Proximity (40%) + Category (30%) + Text (15%) + Temporal (10%) + Link (5%)
  const rawComposite =
    geographicScore * 0.40 +
    categoryScore * 0.30 +
    textScore * 0.15 +
    temporalScore * 0.10 +
    existingLinkScore * 0.05;

  const overallScore = Number(Math.min(1.0, Math.max(0.0, rawComposite)).toFixed(2));

  return {
    overallScore,
    geographicScore,
    geographicDistanceMeters: distanceMeters,
    proximityThreshold: proximity.threshold,
    categoryScore,
    textScore,
    temporalScore,
    temporalDaysDiff: temporalResult.daysDiff,
    existingLinkScore,
    reasons,
  };
}

/**
 * Distinguishes Duplicate vs Recurrence vs Historical Link
 */
export function classifyRelationType(
  signals: RelationshipSignals,
  targetStatus: Incident['status'],
  hasInterveningRepair: boolean
): RelationType {
  const { geographicDistanceMeters, categoryScore, temporalDaysDiff, overallScore } = signals;

  const isVeryClose = geographicDistanceMeters !== null && geographicDistanceMeters <= 100;
  const isSameCategory = categoryScore >= 0.90;
  const isRecent = temporalDaysDiff <= 14;
  const isTargetActive = targetStatus !== 'resolved';

  // LIKELY_DUPLICATE: very close, same category, recent, active, NO intervening repair
  if (isVeryClose && isSameCategory && isRecent && isTargetActive && !hasInterveningRepair) {
    return 'LIKELY_DUPLICATE';
  }

  // RECURRING_FAILURE: occurred after prior repair event OR same location with temporal separation
  if (
    (geographicDistanceMeters !== null && geographicDistanceMeters <= 250) &&
    categoryScore >= 0.65 &&
    (hasInterveningRepair || temporalDaysDiff >= 15) &&
    overallScore >= 0.50
  ) {
    return 'RECURRING_FAILURE';
  }

  // HISTORICAL_RELATED: relevant history in the area
  if (
    (geographicDistanceMeters !== null && geographicDistanceMeters <= 400) &&
    categoryScore >= 0.50 &&
    (temporalDaysDiff > 45 || hasInterveningRepair || signals.existingLinkScore > 0) &&
    overallScore >= 0.45
  ) {
    return 'HISTORICAL_RELATED';
  }

  // POSSIBLE_RELATED: meaningful signals
  if (overallScore >= 0.38) {
    return 'POSSIBLE_RELATED';
  }

  return 'UNRELATED';
}
