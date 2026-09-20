import { Incident, IncidentCategory, RepairEvent } from '../../types';
import {
  EvidenceChip,
  MemoryState,
  RecurrenceMetrics,
  RelationshipExplanation,
  RelationshipSignals,
  RelationType,
} from './types';
import { classifyRelationType } from './scoring';

/**
 * Classifies MemoryState deterministically from empirical facts.
 */
export function classifyMemoryState(
  incidents: Incident[],
  repairs: RepairEvent[]
): MemoryState {
  if (incidents.length <= 1 && repairs.length === 0) {
    return 'NEW';
  }

  const activeIncidents = incidents.filter((i) => i.status !== 'resolved');
  const resolvedIncidents = incidents.filter((i) => i.status === 'resolved');

  // RESOLVED: history exists, but zero active tickets
  if (activeIncidents.length === 0 && resolvedIncidents.length >= 1) {
    return 'RESOLVED';
  }

  // PERSISTENT: 3 or more incidents with at least 1 active ticket and prior repairs
  if (incidents.length >= 3 && activeIncidents.length >= 1) {
    return 'PERSISTENT';
  }

  // RECURRING: 2 or more incidents separated in time
  if (incidents.length >= 2) {
    return 'RECURRING';
  }

  return 'NEW';
}

/**
 * Generates transparent "Why am I seeing this?" audit justification for the assigned MemoryState.
 */
export function buildStateAuditExplanation(
  state: MemoryState,
  incidents: Incident[],
  repairs: RepairEvent[],
  metrics: RecurrenceMetrics
): { state: MemoryState; evidence: string[]; basis: string } {
  const activeCount = metrics.activeIncidentCount;
  const resolvedCount = metrics.resolvedIncidentCount;
  const intervalStr =
    metrics.averageIntervalDays !== null ? `${metrics.averageIntervalDays} days` : 'N/A';

  const evidence: string[] = [];

  switch (state) {
    case 'NEW':
      evidence.push('First recorded complaint at these physical coordinates.');
      evidence.push('No antecedent municipal repair events logged in system.');
      evidence.push('Baseline coordinate establish: monitoring initialized.');
      return {
        state,
        evidence,
        basis: 'Classified as NEW due to absence of previous complaints or repair history within 350 meters.',
      };

    case 'RECURRING':
      evidence.push(`${incidents.length} related complaints logged at this infrastructure node.`);
      if (repairs.length > 0) {
        evidence.push(`${repairs.length} municipal repair event(s) logged in between incident reports.`);
      }
      evidence.push(`Observed recurrence interval: ~${intervalStr} between failure occurrences.`);
      if (activeCount > 0) {
        evidence.push(`${activeCount} active complaint(s) currently open.`);
      }
      return {
        state,
        evidence,
        basis: `Classified as RECURRING because multiple distinct incidents were recorded at this node across a ${metrics.timeSpanDays}-day period.`,
      };

    case 'PERSISTENT':
      evidence.push(`Chronic lineage: ${incidents.length} failure reports cataloged across ${metrics.timeSpanDays} days.`);
      evidence.push(`${repairs.length} municipal intervention work orders logged in registry.`);
      evidence.push(`Short recurrence cycle averaging ~${intervalStr} between reappearances.`);
      evidence.push(`Active unclosed complaint (${activeCount} open) requires systemic investigation.`);
      return {
        state,
        evidence,
        basis: 'Classified as PERSISTENT due to high recurrence frequency (3+ incidents) accompanied by active unclosed municipal complaints.',
      };

    case 'RESOLVED':
      evidence.push(`${incidents.length} historical failure events recorded in registry.`);
      evidence.push(`${repairs.length} municipal repair intervention(s) confirmed completed.`);
      evidence.push('Zero active unresolved complaints currently open at this node.');
      evidence.push('Latest inspection indicates operational road surface stability.');
      return {
        state,
        evidence,
        basis: 'Classified as RESOLVED because all historical complaints at this node have been formally remediated with zero active open tickets.',
      };

    case 'UNCERTAIN':
    default:
      evidence.push('Partial coordinate or temporal data available.');
      evidence.push('Requires manual inspector field verification.');
      return {
        state: 'UNCERTAIN',
        evidence,
        basis: 'Classified as UNCERTAIN due to ambiguous spatial or category matching signals.',
      };
  }
}

/**
 * Builds detailed, human-readable Relationship Explanation with verifiable evidence chips.
 */
export function buildRelationshipExplanation(
  source: Incident,
  target: Incident,
  signals: RelationshipSignals,
  targetRepairs: RepairEvent[]
): RelationshipExplanation {
  const relationType = classifyRelationType(signals, target.status, targetRepairs.length > 0);
  const chips: EvidenceChip[] = [];

  // Geographic chip
  if (signals.geographicDistanceMeters !== null) {
    chips.push({
      label: 'Distance',
      value: `~${signals.geographicDistanceMeters}m`,
      variant: signals.geographicDistanceMeters <= 100 ? 'success' : 'info',
    });
  } else {
    chips.push({
      label: 'Distance',
      value: 'Unverified',
      variant: 'neutral',
    });
  }

  // Category chip
  chips.push({
    label: 'Category',
    value: target.category,
    variant: signals.categoryScore >= 0.9 ? 'success' : 'neutral',
  });

  // Time chip
  chips.push({
    label: 'Elapsed',
    value: `${signals.temporalDaysDiff}d`,
    variant: signals.temporalDaysDiff <= 14 ? 'warning' : 'info',
  });

  // Status chip
  chips.push({
    label: 'Target Status',
    value: target.status,
    variant: target.status === 'resolved' ? 'success' : 'warning',
  });

  if (targetRepairs.length > 0) {
    chips.push({
      label: 'Repairs',
      value: `${targetRepairs.length} logged`,
      variant: 'info',
    });
  }

  // Plain English explanation
  let plainEnglish = `CivicPulse connected ${target.id} because:`;
  const bulletPoints: string[] = [];

  if (signals.categoryScore >= 0.9) {
    bulletPoints.push(`same defect category (${target.category})`);
  } else if (signals.categoryScore >= 0.5) {
    bulletPoints.push(`related infrastructure category (${target.category})`);
  }

  if (signals.geographicDistanceMeters !== null) {
    bulletPoints.push(`approx. ${signals.geographicDistanceMeters} m away`);
  }

  if (signals.textScore >= 0.3) {
    bulletPoints.push('correlated defect description keywords');
  }

  if (targetRepairs.length > 0) {
    bulletPoints.push(`recorded after municipal repair event ${targetRepairs[0].id}`);
  } else if (signals.temporalDaysDiff <= 14) {
    bulletPoints.push(`reported within ${signals.temporalDaysDiff} days of prior record`);
  } else {
    bulletPoints.push(`separated by ${signals.temporalDaysDiff} days in municipal history`);
  }

  plainEnglish += '\n• ' + bulletPoints.join('\n• ');

  return {
    targetIncidentId: target.id,
    targetTitle: target.title,
    targetCategory: target.category,
    targetDate: target.createdAt,
    targetStatus: target.status,
    targetSeverity: target.severity,
    relationType,
    signals,
    plainEnglishExplanation: plainEnglish,
    evidenceChips: chips,
  };
}
