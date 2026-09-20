import { Incident, RepairEvent } from '../../types';
import { MemoryTimelineItem } from './types';
import { validateTimelineIntervals } from './validators';

/**
 * Builds unified, chronological Failure Timeline with elapsed interval calculations.
 */
export function buildFailureTimeline(
  primaryIncidentId: string,
  incidents: Incident[],
  repairs: RepairEvent[]
): MemoryTimelineItem[] {
  const items: MemoryTimelineItem[] = [];

  // Add all incidents
  for (const inc of incidents) {
    items.push({
      id: `TL-INC-${inc.id}`,
      date: inc.createdAt,
      eventType: 'INCIDENT',
      title: inc.title,
      description: inc.description,
      source: inc.source,
      incidentId: inc.id,
      severity: inc.severity,
      status: inc.status,
      category: inc.category,
      isPrimary: inc.id === primaryIncidentId,
    });
  }

  // Add all repairs
  for (const rep of repairs) {
    items.push({
      id: `TL-REP-${rep.id}`,
      date: rep.date,
      eventType: 'REPAIR',
      title: rep.action,
      description: rep.description,
      source: 'Municipal Works Registry',
      repairId: rep.id,
      incidentId: rep.incidentId,
      action: rep.action,
      contractorOrTeam: rep.contractorOrTeam,
      costEstimate: rep.costEstimate,
    });
  }

  // Sort ascending by timestamp
  items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Add system inspection event if there are 3 or more incidents
  if (incidents.length >= 3 && items.length > 0) {
    const thirdItemDate = items[Math.min(items.length - 1, 3)].date;
    const systemAuditDate = new Date(
      new Date(thirdItemDate).getTime() + 1000 * 60 * 60 * 12
    ).toISOString();

    items.push({
      id: 'TL-SYS-CHRONIC-FLAG',
      date: systemAuditDate,
      eventType: 'SYSTEM_EVENT',
      title: 'CivicPulse Pattern Memory Alert',
      description:
        'Threshold triggered: 3+ connected infrastructure defect events logged within municipal spatial corridor.',
      source: 'CivicPulse AI Core Engine',
    });

    items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // Validate intervals and populate daysSincePriorEvent
  return validateTimelineIntervals(items);
}
