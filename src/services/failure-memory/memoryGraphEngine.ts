import { Incident, RepairEvent } from '../../types';
import {
  MemoryGraphData,
  MemoryGraphEdge,
  MemoryGraphNode,
  RelationshipExplanation,
} from './types';

/**
 * Builds Node & Edge graph topology for the interactive Failure Memory Graph
 */
export function buildMemoryGraph(
  primaryIncident: Incident,
  relatedIncidents: Incident[],
  repairs: RepairEvent[],
  explanations: RelationshipExplanation[]
): MemoryGraphData {
  const nodes: MemoryGraphNode[] = [];
  const edges: MemoryGraphEdge[] = [];

  // Center node: Primary Incident
  nodes.push({
    id: primaryIncident.id,
    label: primaryIncident.id,
    sublabel: primaryIncident.title,
    type: 'PRIMARY',
    category: primaryIncident.category,
    status: primaryIncident.status,
    severity: primaryIncident.severity,
    date: primaryIncident.createdAt,
    isCurrent: true,
  });

  // Historical related incident nodes
  for (const rel of relatedIncidents) {
    if (rel.id === primaryIncident.id) continue;
    nodes.push({
      id: rel.id,
      label: rel.id,
      sublabel: rel.title,
      type: 'INCIDENT',
      category: rel.category,
      status: rel.status,
      severity: rel.severity,
      date: rel.createdAt,
      isCurrent: false,
    });

    // Find explanation edge
    const exp = explanations.find((e) => e.targetIncidentId === rel.id);
    const label = exp
      ? `${exp.relationType.replace('_', ' ')} (${exp.signals.temporalDaysDiff}d)`
      : 'RELATED';

    edges.push({
      id: `EDGE-${primaryIncident.id}-${rel.id}`,
      source: primaryIncident.id,
      target: rel.id,
      relationType: exp?.relationType || 'POSSIBLE_RELATED',
      label,
      strength: exp?.signals.overallScore || 0.6,
    });
  }

  // Repair nodes and edges
  for (const rep of repairs) {
    nodes.push({
      id: rep.id,
      label: rep.id,
      sublabel: rep.action,
      type: 'REPAIR',
      date: rep.date,
      isCurrent: false,
    });

    edges.push({
      id: `EDGE-${rep.incidentId}-${rep.id}`,
      source: rep.incidentId,
      target: rep.id,
      relationType: 'REPAIRED_BY',
      label: `Repaired (${rep.costEstimate || 'Work Order'})`,
      strength: 1.0,
      isRepairLink: true,
    });
  }

  return { nodes, edges };
}
