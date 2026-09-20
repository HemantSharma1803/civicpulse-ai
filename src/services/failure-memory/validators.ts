import { Incident, RepairEvent } from '../../types';
import { FailureMemory, MemoryTimelineItem } from './types';

export interface ValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
}

/**
 * Validates GPS latitude/longitude numbers.
 */
export function isValidCoordinate(latitude: unknown, longitude: unknown): boolean {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return false;
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return false;
  if (latitude < -90 || latitude > 90) return false;
  if (longitude < -180 || longitude > 180) return false;
  return true;
}

/**
 * Validates that an ISO date string or timestamp can be parsed.
 */
export function isValidDate(dateStr: unknown): boolean {
  if (typeof dateStr !== 'string' && !(dateStr instanceof Date)) return false;
  const parsed = new Date(dateStr as string);
  return !Number.isNaN(parsed.getTime());
}

/**
 * Validates incident integrity and cleans broken references.
 */
export function validateAndSanitizeIncident(
  incident: Incident,
  allIncidentIds: Set<string>,
  allRepairIds: Set<string>
): { incident: Incident; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];

  // Check coordinates
  const hasValidCoords = isValidCoordinate(incident.latitude, incident.longitude);
  if (!hasValidCoords) {
    issues.push({
      field: 'coordinates',
      message: `Incident ${incident.id} has invalid coordinates (${incident.latitude}, ${incident.longitude}).`,
      severity: 'warning',
    });
  }

  // Check createdAt
  if (!isValidDate(incident.createdAt)) {
    issues.push({
      field: 'createdAt',
      message: `Incident ${incident.id} has unparseable createdAt date.`,
      severity: 'error',
    });
  }

  // Filter out dangling relatedIncidentIds
  const cleanRelated = (incident.relatedIncidentIds || []).filter((id) => {
    const exists = allIncidentIds.has(id);
    if (!exists && id !== incident.id) {
      issues.push({
        field: 'relatedIncidentIds',
        message: `Pruned dangling incident reference ${id} from ${incident.id}.`,
        severity: 'warning',
      });
    }
    return exists && id !== incident.id;
  });

  // Filter out dangling repairEventIds
  const cleanRepairs = (incident.repairEventIds || []).filter((id) => {
    const exists = allRepairIds.has(id);
    if (!exists) {
      issues.push({
        field: 'repairEventIds',
        message: `Pruned dangling repair reference ${id} from ${incident.id}.`,
        severity: 'warning',
      });
    }
    return exists;
  });

  const sanitized: Incident = {
    ...incident,
    relatedIncidentIds: cleanRelated,
    repairEventIds: cleanRepairs,
  };

  return { incident: sanitized, issues };
}

/**
 * Verifies that timeline chronological ordering has no negative elapsed intervals.
 */
export function validateTimelineIntervals(timeline: MemoryTimelineItem[]): MemoryTimelineItem[] {
  let prevTimestamp: number | null = null;

  return timeline.map((item) => {
    const currentTimestamp = new Date(item.date).getTime();
    let daysSincePrior = 0;

    if (prevTimestamp !== null) {
      const diffMs = currentTimestamp - prevTimestamp;
      // Guarantee no negative intervals even if source timestamps had minor jitter
      daysSincePrior = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
    }

    prevTimestamp = currentTimestamp;

    return {
      ...item,
      daysSincePriorEvent: daysSincePrior,
    };
  });
}

/**
 * Audits complete FailureMemory object before returning to consumers.
 */
export function validateMemoryIntegrity(memory: FailureMemory): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!memory.primaryIncidentId) {
    issues.push({
      field: 'primaryIncidentId',
      message: 'FailureMemory must specify a primary incident ID.',
      severity: 'error',
    });
  }

  if (memory.recurrenceMetrics.observedIntervalsCount > 0) {
    if (
      memory.recurrenceMetrics.averageIntervalDays !== null &&
      memory.recurrenceMetrics.averageIntervalDays < 0
    ) {
      issues.push({
        field: 'averageIntervalDays',
        message: 'Recurrence interval cannot be negative.',
        severity: 'error',
      });
    }
  }

  return {
    isValid: issues.filter((i) => i.severity === 'error').length === 0,
    issues,
  };
}
