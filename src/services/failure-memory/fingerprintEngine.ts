import { Incident, IncidentCategory, RepairEvent } from '../../types';
import { FailureFingerprint, MemoryState, RecurrenceMetrics } from './types';

/**
 * Derives the dominant category from a collection of incidents.
 */
export function getDominantCategory(
  primaryCategory: IncidentCategory,
  incidents: Incident[]
): IncidentCategory {
  if (incidents.length === 0) return primaryCategory;

  const counts: Partial<Record<IncidentCategory, number>> = {};
  for (const inc of incidents) {
    counts[inc.category] = (counts[inc.category] || 0) + 1;
  }

  let bestCat = primaryCategory;
  let maxCount = 0;

  for (const [cat, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      bestCat = cat as IncidentCategory;
    }
  }

  return bestCat;
}

/**
 * Calculates longest quiet period (days between any two consecutive recorded events).
 */
export function calculateLongestQuietPeriod(
  incidents: Incident[],
  repairs: RepairEvent[]
): number | null {
  const allDates: number[] = [];

  for (const inc of incidents) {
    allDates.push(new Date(inc.createdAt).getTime());
  }
  for (const rep of repairs) {
    allDates.push(new Date(rep.date).getTime());
  }

  if (allDates.length < 2) return null;

  allDates.sort((a, b) => a - b);

  let maxGapDays = 0;
  for (let i = 1; i < allDates.length; i++) {
    const diffMs = allDates[i] - allDates[i - 1];
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays > maxGapDays) {
      maxGapDays = diffDays;
    }
  }

  return maxGapDays;
}

/**
 * Fingerprint Engine: Builds transparent multi-dimensional Failure Fingerprint
 */
export function buildFailureFingerprint(
  primaryIncident: Incident,
  allLineageIncidents: Incident[],
  allLineageRepairs: RepairEvent[],
  metrics: RecurrenceMetrics,
  currentState: MemoryState
): FailureFingerprint {
  const dominantCategory = getDominantCategory(primaryIncident.category, allLineageIncidents);
  const incidentCount = allLineageIncidents.length;
  const repairCount = allLineageRepairs.length;
  const activeIncidentCount = metrics.activeIncidentCount;
  const hasActiveIssue = activeIncidentCount > 0;
  const averageRecurrenceInterval = metrics.averageIntervalDays;
  const longestQuietPeriodDays = calculateLongestQuietPeriod(
    allLineageIncidents,
    allLineageRepairs
  );
  const historicalSpanDays = metrics.timeSpanDays;
  const latestIncidentDate = metrics.latestIncident || primaryIncident.createdAt;

  // 1. Frequency Segment (0 - 100)
  // 1 incident = 15, 2 incidents = 40, 3 = 65, 4 = 85, >=5 = 100
  const frequencySegment = Math.min(100, Math.round(Math.min(5, incidentCount) * 20));

  // 2. Recurrence Segment (0 - 100)
  // Rapid recurrence (<25d) = 95, moderate (25-50d) = 70, slow (>75d) = 40, no interval = 10
  let recurrenceSegment = 10;
  if (averageRecurrenceInterval !== null) {
    if (averageRecurrenceInterval <= 20) recurrenceSegment = 95;
    else if (averageRecurrenceInterval <= 35) recurrenceSegment = 80;
    else if (averageRecurrenceInterval <= 60) recurrenceSegment = 60;
    else if (averageRecurrenceInterval <= 90) recurrenceSegment = 45;
    else recurrenceSegment = 30;
  }

  // 3. Repair Cycle Segment (0 - 100)
  // 0 repairs = 10, 1 repair = 45, 2 repairs = 75, >=3 repairs = 100
  const repairCycleSegment = Math.min(100, Math.round(Math.min(3, repairCount) * 33.3));

  // 4. Activity Segment (0 - 100)
  // Active critical = 95, active moderate = 75, investigating = 55, resolved = 15
  let activitySegment = 15;
  if (hasActiveIssue) {
    const hasHighSeverity = allLineageIncidents.some(
      (i) => i.status !== 'resolved' && (i.severity === 'critical' || i.severity === 'high')
    );
    activitySegment = hasHighSeverity ? 95 : 70;
  }

  // Composite CivicPulse Pattern Index (0 - 100)
  // Weighted: Frequency (25%) + Recurrence (35%) + Repair Cycle (25%) + Activity (15%)
  const patternIndex = Math.min(
    100,
    Math.round(
      (frequencySegment * 0.25) +
      (recurrenceSegment * 0.35) +
      (repairCycleSegment * 0.25) +
      (activitySegment * 0.15)
    )
  );

  const patternIndexMethodology =
    'CivicPulse Pattern Index (0-100) measures repeated infrastructure stress across 4 empirical dimensions: Incident Frequency (25%), Recurrence Pace (35%), Repair Cycle Repetition (25%), and Active Municipal Strain (15%).';

  return {
    dominantCategory,
    incidentCount,
    repairCount,
    activeIncidentCount,
    averageRecurrenceInterval,
    latestIncidentDate,
    longestQuietPeriodDays,
    currentMemoryState: currentState,
    hasActiveIssue,
    historicalSpanDays,
    patternIndex,
    patternIndexMethodology,
    segments: {
      frequency: frequencySegment,
      recurrence: recurrenceSegment,
      repairCycle: repairCycleSegment,
      activity: activitySegment,
    },
  };
}
