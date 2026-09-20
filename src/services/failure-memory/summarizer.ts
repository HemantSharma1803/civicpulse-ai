import { IncidentCategory } from '../../types';
import {
  FailureFingerprint,
  MemoryState,
  MemorySummary,
  RecurrenceMetrics,
  RepairCycleAnalysis,
} from './types';

export interface MemoryFactsPayload {
  locationName: string;
  category: IncidentCategory;
  currentState: MemoryState;
  incidentCount: number;
  repairCount: number;
  activeCount: number;
  timeSpanDays: number;
  averageIntervalDays: number | null;
  longestQuietPeriodDays: number | null;
  patternIndex: number;
  repairCyclesCount: number;
  recentIncidentDate: string;
  firstIncidentDate: string | null;
}

/**
 * Deterministic, fact-based summary generator.
 * Strictly adheres to empirical numbers without hallucinating or assigning blame.
 */
export function generateDeterministicSummary(facts: MemoryFactsPayload): MemorySummary {
  const {
    locationName,
    category,
    currentState,
    incidentCount,
    repairCount,
    activeCount,
    timeSpanDays,
    averageIntervalDays,
    repairCyclesCount,
    recentIncidentDate,
  } = facts;

  const intervalStr =
    averageIntervalDays !== null ? `approx. ${averageIntervalDays} days` : 'N/A';

  // 1. One-line summary
  let oneLine = '';
  if (incidentCount <= 1) {
    oneLine = `CivicPulse registered 1 initial ${category} incident at ${locationName}. No antecedent municipal repairs on record.`;
  } else if (repairCount > 0) {
    oneLine = `CivicPulse connected ${incidentCount} related ${category.toLowerCase()} incidents at this location across ${timeSpanDays} days. ${repairCount} municipal repair events are recorded.`;
  } else {
    oneLine = `CivicPulse connected ${incidentCount} related ${category.toLowerCase()} incidents across ${timeSpanDays} days at ${locationName}, recurring on average every ${intervalStr}.`;
  }

  // 2. Detailed summary
  let detailed = `Municipal records for ${locationName} show a total of ${incidentCount} logged ${category.toLowerCase()} defect reports spanning ${timeSpanDays} days.`;
  if (repairCount > 0) {
    detailed += ` ${repairCount} contractor work order intervention(s) were deployed to this corridor during this period.`;
  } else {
    detailed += ` No formal contractor work orders are cataloged in municipal records for these coordinates.`;
  }

  if (averageIntervalDays !== null) {
    detailed += ` Incidents have reappeared at an average interval of ${averageIntervalDays} days.`;
  }

  if (activeCount > 0) {
    detailed += ` Currently, ${activeCount} active complaint(s) remain open for investigation.`;
  } else {
    detailed += ` All historical complaints at this location are currently documented as resolved.`;
  }

  // 3. Evidence breakdown (empirical bullet points)
  const evidenceBreakdown: string[] = [
    `${incidentCount} total incident report(s) cataloged at this physical node`,
    `${repairCount} contractor repair work order(s) logged in municipal registry`,
    `${timeSpanDays} days elapsed between initial baseline report and latest activity`,
    activeCount > 0
      ? `${activeCount} complaint(s) currently open and requiring field response`
      : 'Zero active complaints currently outstanding',
  ];

  if (averageIntervalDays !== null) {
    evidenceBreakdown.push(`Observed recurrence interval: ~${averageIntervalDays} days between defect emergence`);
  }

  // 4. Neutral interpretation
  let interpretation = '';
  switch (currentState) {
    case 'NEW':
      interpretation = 'Baseline infrastructure record with no antecedent failure history.';
      break;
    case 'RECURRING':
      interpretation = 'The location shows a recurring incident pattern in the available records.';
      break;
    case 'PERSISTENT':
      interpretation =
        'Chronic multi-cycle failure pattern observed with repeated work order interventions.';
      break;
    case 'RESOLVED':
      interpretation =
        'Historical defect cycle successfully mitigated with zero active reports in the current period.';
      break;
    case 'UNCERTAIN':
    default:
      interpretation = 'Additional field inspections recommended to establish structural pattern.';
      break;
  }

  return {
    oneLine,
    detailed,
    evidenceBreakdown,
    interpretation,
    isAiGenerated: false,
    modelUsed: 'deterministic-factual-engine',
  };
}

/**
 * Attempts to fetch AI-generated grounded summary from the server Gemini endpoint,
 * falling back gracefully to deterministic factual summary if offline or unconfigured.
 */
export async function fetchAiMemorySummary(
  facts: MemoryFactsPayload
): Promise<MemorySummary> {
  try {
    const res = await fetch('/api/ai/summarize-memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(facts),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.summary) {
        return {
          ...data.summary,
          isAiGenerated: true,
          modelUsed: data.modelUsed || 'gemini-3.8-flash',
        };
      }
    }
  } catch {
    // Network or server error -> use deterministic fallback
  }

  return generateDeterministicSummary(facts);
}
