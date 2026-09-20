import { Incident, RepairEvent } from '../../types';
import {
  RecurrenceMetrics,
  RecurrenceTrend,
  RepairCycleAnalysis,
  RepairCycleRecord,
} from './types';

/**
 * Calculates mathematical median of an array of numbers.
 */
export function calculateMedian(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }
  return sorted[mid];
}

/**
 * Recurrence Engine: Calculates transparent recurrence metrics
 */
export function calculateRecurrenceMetrics(
  incidents: Incident[],
  repairs: RepairEvent[]
): RecurrenceMetrics {
  const incidentCount = incidents.length;
  const repairCount = repairs.length;

  const activeIncidentCount = incidents.filter((i) => i.status !== 'resolved').length;
  const resolvedIncidentCount = incidents.filter((i) => i.status === 'resolved').length;

  if (incidentCount === 0) {
    return {
      incidentCount: 0,
      relatedIncidentCount: 0,
      repairCount,
      activeIncidentCount: 0,
      resolvedIncidentCount: 0,
      firstKnownIncident: null,
      latestIncident: null,
      timeSpanDays: 0,
      averageIntervalDays: null,
      medianIntervalDays: null,
      minimumIntervalDays: null,
      maximumIntervalDays: null,
      observedIntervalsCount: 0,
      trendDirection: 'INSUFFICIENT_DATA',
      trendExplanation: 'No incident history recorded at this node.',
    };
  }

  // Sort incidents chronologically ascending
  const sorted = [...incidents].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const firstKnownIncident = sorted[0].createdAt;
  const latestIncident = sorted[sorted.length - 1].createdAt;

  const timeSpanMs =
    new Date(latestIncident).getTime() - new Date(firstKnownIncident).getTime();
  const timeSpanDays = Math.max(0, Math.round(timeSpanMs / (1000 * 60 * 60 * 24)));

  if (incidentCount < 2) {
    return {
      incidentCount: 1,
      relatedIncidentCount: 0,
      repairCount,
      activeIncidentCount,
      resolvedIncidentCount,
      firstKnownIncident,
      latestIncident,
      timeSpanDays: 0,
      averageIntervalDays: null,
      medianIntervalDays: null,
      minimumIntervalDays: null,
      maximumIntervalDays: null,
      observedIntervalsCount: 0,
      trendDirection: 'INSUFFICIENT_DATA',
      trendExplanation: 'Insufficient history to calculate recurrence intervals (single incident record).',
    };
  }

  // Calculate intervals between consecutive incidents
  const intervals: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prevTime = new Date(sorted[i - 1].createdAt).getTime();
    const currTime = new Date(sorted[i].createdAt).getTime();
    const diffDays = Math.max(1, Math.round((currTime - prevTime) / (1000 * 60 * 60 * 24)));
    intervals.push(diffDays);
  }

  const sumIntervals = intervals.reduce((acc, v) => acc + v, 0);
  const averageIntervalDays = Math.round(sumIntervals / intervals.length);
  const medianIntervalDays = calculateMedian(intervals);
  const minimumIntervalDays = Math.min(...intervals);
  const maximumIntervalDays = Math.max(...intervals);
  const observedIntervalsCount = intervals.length;

  // Trend determination: Compare latest interval with previous intervals median
  let trendDirection: RecurrenceTrend = 'INSUFFICIENT_DATA';
  let trendExplanation = '';

  if (intervals.length >= 2) {
    const latestInterval = intervals[intervals.length - 1];
    const priorIntervals = intervals.slice(0, intervals.length - 1);
    const priorMedian = calculateMedian(priorIntervals) || averageIntervalDays;

    if (latestInterval <= Math.round(priorMedian * 0.85)) {
      trendDirection = 'INCREASING';
      trendExplanation = `Recent recurrence interval (${latestInterval} days) is shorter than the historical median (${priorMedian} days).`;
    } else if (latestInterval >= Math.round(priorMedian * 1.15)) {
      trendDirection = 'DECREASING';
      trendExplanation = `Recent recurrence interval (${latestInterval} days) is longer than the historical median (${priorMedian} days).`;
    } else {
      trendDirection = 'STABLE';
      trendExplanation = `Recurrence intervals have remained consistent around ~${medianIntervalDays} days.`;
    }
  } else {
    trendDirection = 'INSUFFICIENT_DATA';
    trendExplanation = `1 recurrence interval observed (${intervals[0]} days). Multiple intervals required to determine trajectory.`;
  }

  return {
    incidentCount,
    relatedIncidentCount: incidentCount - 1,
    repairCount,
    activeIncidentCount,
    resolvedIncidentCount,
    firstKnownIncident,
    latestIncident,
    timeSpanDays,
    averageIntervalDays,
    medianIntervalDays,
    minimumIntervalDays,
    maximumIntervalDays,
    observedIntervalsCount,
    trendDirection,
    trendExplanation,
  };
}

/**
 * Analyzes Repair Cycles and subsequent incident recurrence without claiming causality.
 */
export function analyzeRepairCycles(
  incidents: Incident[],
  repairs: RepairEvent[]
): RepairCycleAnalysis {
  if (repairs.length === 0) {
    return {
      cycles: [],
      averageDaysToRepair: null,
      averageDaysUntilNextIncident: null,
      narrative: 'No municipal contractor repair interventions are recorded for this lineage.',
    };
  }

  const sortedIncidents = [...incidents].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const sortedRepairs = [...repairs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const cycles: RepairCycleRecord[] = [];
  const daysToRepairList: number[] = [];
  const daysUntilNextList: number[] = [];

  for (const repair of sortedRepairs) {
    // Find incident repaired
    const incident = sortedIncidents.find((i) => i.id === repair.incidentId) || sortedIncidents[0];
    const incidentTime = new Date(incident.createdAt).getTime();
    const repairTime = new Date(repair.date).getTime();

    const daysToRepair = Math.max(
      0,
      Math.round((repairTime - incidentTime) / (1000 * 60 * 60 * 24))
    );
    daysToRepairList.push(daysToRepair);

    // Find first subsequent incident recorded after this repair event
    const subsequent = sortedIncidents.find(
      (i) => i.id !== incident.id && new Date(i.createdAt).getTime() > repairTime
    );

    let daysUntilNextIncident: number | undefined;
    if (subsequent) {
      const nextTime = new Date(subsequent.createdAt).getTime();
      daysUntilNextIncident = Math.max(
        0,
        Math.round((nextTime - repairTime) / (1000 * 60 * 60 * 24))
      );
      daysUntilNextList.push(daysUntilNextIncident);
    }

    cycles.push({
      cycleId: `CYC-${repair.id}`,
      incidentId: incident.id,
      incidentTitle: incident.title,
      incidentDate: incident.createdAt,
      repairId: repair.id,
      repairAction: repair.action,
      repairDate: repair.date,
      contractor: repair.contractorOrTeam,
      costEstimate: repair.costEstimate,
      daysToRepair,
      subsequentIncidentId: subsequent?.id,
      subsequentIncidentTitle: subsequent?.title,
      subsequentIncidentDate: subsequent?.createdAt,
      daysUntilNextIncident,
    });
  }

  const avgRepair =
    daysToRepairList.length > 0
      ? Math.round(daysToRepairList.reduce((a, b) => a + b, 0) / daysToRepairList.length)
      : null;

  const avgNext =
    daysUntilNextList.length > 0
      ? Math.round(daysUntilNextList.reduce((a, b) => a + b, 0) / daysUntilNextList.length)
      : null;

  let narrative = `${cycles.length} repair cycle(s) recorded.`;
  if (avgNext !== null) {
    narrative += ` An average of ${avgNext} days elapsed between recorded repair events and subsequent incident reports.`;
  } else {
    narrative += ` No subsequent incidents recorded after the most recent repair.`;
  }

  return {
    cycles,
    averageDaysToRepair: avgRepair,
    averageDaysUntilNextIncident: avgNext,
    narrative,
  };
}
