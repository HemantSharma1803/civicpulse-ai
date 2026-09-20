import { Incident, RepairEvent } from '../../types';
import { FailureMemory, RelationshipExplanation } from './types';
import { calculateRelationshipSignals } from './scoring';
import { calculateRecurrenceMetrics, analyzeRepairCycles } from './recurrenceEngine';
import { buildFailureFingerprint } from './fingerprintEngine';
import { buildFailureTimeline } from './timelineEngine';
import { buildMemoryGraph } from './memoryGraphEngine';
import {
  buildRelationshipExplanation,
  buildStateAuditExplanation,
  classifyMemoryState,
} from './explanations';
import { evaluateMemoryConfidence } from './confidence';
import { generateDeterministicSummary } from './summarizer';
import { validateMemoryIntegrity } from './validators';

/**
 * Builds a complete FailureMemory object for a primary incident.
 */
export function buildFailureMemory(
  primaryIncident: Incident,
  allIncidents: Incident[],
  allRepairs: RepairEvent[]
): FailureMemory {
  // 1. Discover all related incidents in the dataset
  const relatedIncidents: Incident[] = [primaryIncident];
  const explanations: RelationshipExplanation[] = [];

  for (const candidate of allIncidents) {
    if (candidate.id === primaryIncident.id) continue;

    const signals = calculateRelationshipSignals(
      {
        id: primaryIncident.id,
        latitude: primaryIncident.latitude,
        longitude: primaryIncident.longitude,
        category: primaryIncident.category,
        title: primaryIncident.title,
        description: primaryIncident.description,
        createdAt: primaryIncident.createdAt,
        relatedIncidentIds: primaryIncident.relatedIncidentIds,
      },
      candidate,
      allRepairs
    );

    // If there's an explicit relation link in seed data or signals are meaningful
    const isExplicitlyLinked =
      primaryIncident.relatedIncidentIds?.includes(candidate.id) ||
      candidate.relatedIncidentIds?.includes(primaryIncident.id);

    if (signals.overallScore >= 0.38 || isExplicitlyLinked) {
      relatedIncidents.push(candidate);

      const candidateRepairs = allRepairs.filter((r) => r.incidentId === candidate.id);
      const explanation = buildRelationshipExplanation(
        primaryIncident,
        candidate,
        signals,
        candidateRepairs
      );
      explanations.push(explanation);
    }
  }

  // Sort related incidents chronologically
  relatedIncidents.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // 2. Collect all associated repair work orders
  const relatedIncidentIds = new Set(relatedIncidents.map((i) => i.id));
  const relevantRepairs = allRepairs.filter((r) => relatedIncidentIds.has(r.incidentId));

  // 3. Classify Memory State
  const currentState = classifyMemoryState(relatedIncidents, relevantRepairs);

  // 4. Calculate Recurrence Metrics
  const recurrenceMetrics = calculateRecurrenceMetrics(relatedIncidents, relevantRepairs);

  // 5. Analyze Repair Cycles
  const repairCycleAnalysis = analyzeRepairCycles(relatedIncidents, relevantRepairs);

  // 6. Build Failure Fingerprint
  const fingerprint = buildFailureFingerprint(
    primaryIncident,
    relatedIncidents,
    relevantRepairs,
    recurrenceMetrics,
    currentState
  );

  // 7. Build Chronological Timeline
  const timeline = buildFailureTimeline(primaryIncident.id, relatedIncidents, relevantRepairs);

  // 8. Build Memory Graph Topology
  const graph = buildMemoryGraph(primaryIncident, relatedIncidents, relevantRepairs, explanations);

  // 9. Evaluate Confidence Signals
  const dominantSignal = explanations.length > 0 ? explanations[0].signals : undefined;
  const confidenceSignals = evaluateMemoryConfidence(
    relatedIncidents,
    relevantRepairs,
    dominantSignal
  );

  // 10. Audit Explanation
  const auditExplanation = buildStateAuditExplanation(
    currentState,
    relatedIncidents,
    relevantRepairs,
    recurrenceMetrics
  );

  // 11. Initial Deterministic Factual Summary
  const generatedSummary = generateDeterministicSummary({
    locationName: primaryIncident.address.split(',')[0].trim() || 'Municipal Node',
    category: primaryIncident.category,
    currentState,
    incidentCount: recurrenceMetrics.incidentCount,
    repairCount: recurrenceMetrics.repairCount,
    activeCount: recurrenceMetrics.activeIncidentCount,
    timeSpanDays: recurrenceMetrics.timeSpanDays,
    averageIntervalDays: recurrenceMetrics.averageIntervalDays,
    longestQuietPeriodDays: fingerprint.longestQuietPeriodDays,
    patternIndex: fingerprint.patternIndex,
    repairCyclesCount: repairCycleAnalysis.cycles.length,
    recentIncidentDate: recurrenceMetrics.latestIncident || primaryIncident.createdAt,
    firstIncidentDate: recurrenceMetrics.firstKnownIncident,
  });

  const memory: FailureMemory = {
    memoryId: `MEM-${primaryIncident.id}`,
    primaryIncidentId: primaryIncident.id,
    location: {
      name: primaryIncident.address.split(',')[0].trim() || 'Municipal Node',
      address: primaryIncident.address,
      zone: primaryIncident.zone,
      latitude: primaryIncident.latitude,
      longitude: primaryIncident.longitude,
    },
    dominantCategory: fingerprint.dominantCategory,
    currentState,
    relatedIncidents,
    repairEvents: relevantRepairs,
    recurrenceMetrics,
    repairCycleAnalysis,
    fingerprint,
    timeline,
    graph,
    relationshipExplanations: explanations,
    generatedSummary,
    confidenceSignals,
    auditExplanation,
    lastUpdated: new Date().toISOString(),
  };

  validateMemoryIntegrity(memory);

  return memory;
}
