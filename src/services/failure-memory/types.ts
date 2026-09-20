import { Incident, IncidentCategory, IncidentSeverity, IncidentStatus, RepairEvent } from '../../types';

export type MemoryState = 'NEW' | 'RECURRING' | 'PERSISTENT' | 'RESOLVED' | 'UNCERTAIN';

export type RelationType =
  | 'LIKELY_DUPLICATE'
  | 'POSSIBLE_RELATED'
  | 'HISTORICAL_RELATED'
  | 'RECURRING_FAILURE'
  | 'UNRELATED';

export type RecurrenceTrend = 'INCREASING' | 'STABLE' | 'DECREASING' | 'INSUFFICIENT_DATA';

export type ConfidenceLevel = 'HIGH' | 'MODERATE' | 'LOW';

export type ProximityThreshold = 'VERY_NEAR' | 'NEAR' | 'SAME_AREA' | 'DISTANT' | 'OUT_OF_RANGE' | 'UNKNOWN';

export interface ConfidenceDimension {
  level: ConfidenceLevel;
  label: string;
  description: string;
}

export interface MemoryConfidence {
  dataCoverage: ConfidenceDimension;
  relationshipStrength: ConfidenceDimension;
  interpretationUncertainty: ConfidenceDimension;
}

export interface RelationshipSignals {
  overallScore: number; // 0.00 - 1.00 (internal matching score)
  geographicScore: number;
  geographicDistanceMeters: number | null;
  proximityThreshold: ProximityThreshold;
  categoryScore: number;
  textScore: number;
  temporalScore: number;
  temporalDaysDiff: number;
  existingLinkScore: number;
  reasons: string[];
}

export interface EvidenceChip {
  label: string;
  value: string;
  variant: 'success' | 'warning' | 'info' | 'neutral';
}

export interface RelationshipExplanation {
  targetIncidentId: string;
  targetTitle: string;
  targetCategory: IncidentCategory | string;
  targetDate: string;
  targetStatus: IncidentStatus;
  targetSeverity: IncidentSeverity;
  relationType: RelationType;
  signals: RelationshipSignals;
  plainEnglishExplanation: string;
  evidenceChips: EvidenceChip[];
}

export interface RecurrenceMetrics {
  incidentCount: number;
  relatedIncidentCount: number;
  repairCount: number;
  activeIncidentCount: number;
  resolvedIncidentCount: number;
  firstKnownIncident: string | null;
  latestIncident: string | null;
  timeSpanDays: number;
  averageIntervalDays: number | null;
  medianIntervalDays: number | null;
  minimumIntervalDays: number | null;
  maximumIntervalDays: number | null;
  observedIntervalsCount: number;
  trendDirection: RecurrenceTrend;
  trendExplanation: string;
}

export interface RepairCycleRecord {
  cycleId: string;
  incidentId: string;
  incidentTitle: string;
  incidentDate: string;
  repairId: string;
  repairAction: string;
  repairDate: string;
  contractor: string;
  costEstimate?: string;
  daysToRepair: number;
  subsequentIncidentId?: string;
  subsequentIncidentTitle?: string;
  subsequentIncidentDate?: string;
  daysUntilNextIncident?: number;
}

export interface RepairCycleAnalysis {
  cycles: RepairCycleRecord[];
  averageDaysToRepair: number | null;
  averageDaysUntilNextIncident: number | null;
  narrative: string;
}

export interface FailureFingerprint {
  dominantCategory: IncidentCategory;
  incidentCount: number;
  repairCount: number;
  activeIncidentCount: number;
  averageRecurrenceInterval: number | null;
  latestIncidentDate: string;
  longestQuietPeriodDays: number | null;
  currentMemoryState: MemoryState;
  hasActiveIssue: boolean;
  historicalSpanDays: number;
  patternIndex: number; // 0 - 100 CivicPulse Pattern Index
  patternIndexMethodology: string;
  segments: {
    frequency: number; // 0 - 100
    recurrence: number; // 0 - 100
    repairCycle: number; // 0 - 100
    activity: number; // 0 - 100
  };
}

export interface MemoryTimelineItem {
  id: string;
  date: string;
  eventType: 'INCIDENT' | 'REPAIR' | 'SYSTEM_EVENT';
  title: string;
  description: string;
  source: string;
  incidentId?: string;
  repairId?: string;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  category?: IncidentCategory;
  costEstimate?: string;
  contractorOrTeam?: string;
  action?: string;
  daysSincePriorEvent?: number;
  isPrimary?: boolean;
}

export interface MemoryGraphNode {
  id: string;
  label: string;
  sublabel: string;
  type: 'PRIMARY' | 'INCIDENT' | 'REPAIR' | 'HOTSPOT';
  category?: string;
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  date: string;
  isCurrent?: boolean;
  x?: number;
  y?: number;
}

export interface MemoryGraphEdge {
  id: string;
  source: string;
  target: string;
  relationType: RelationType | 'REPAIRED_BY' | 'PART_OF_HOTSPOT';
  label: string;
  strength: number; // 0.0 - 1.0
  isRepairLink?: boolean;
}

export interface MemoryGraphData {
  nodes: MemoryGraphNode[];
  edges: MemoryGraphEdge[];
}

export interface MemorySummary {
  oneLine: string;
  detailed: string;
  evidenceBreakdown: string[];
  interpretation: string;
  isAiGenerated: boolean;
  modelUsed?: string;
}

export interface FailureMemory {
  memoryId: string;
  primaryIncidentId: string;
  location: {
    name: string;
    address: string;
    zone: string;
    latitude: number;
    longitude: number;
  };
  dominantCategory: IncidentCategory;
  currentState: MemoryState;
  relatedIncidents: Incident[];
  repairEvents: RepairEvent[];
  recurrenceMetrics: RecurrenceMetrics;
  repairCycleAnalysis: RepairCycleAnalysis;
  fingerprint: FailureFingerprint;
  timeline: MemoryTimelineItem[];
  graph: MemoryGraphData;
  relationshipExplanations: RelationshipExplanation[];
  generatedSummary: MemorySummary;
  confidenceSignals: MemoryConfidence;
  auditExplanation: {
    state: MemoryState;
    evidence: string[];
    basis: string;
  };
  lastUpdated: string;
}

export interface CategoryMemorySummary {
  category: IncidentCategory;
  count: number;
  activeCount: number;
  repairCount: number;
  currentState: MemoryState;
  dominantSeverity: IncidentSeverity;
  lastReportedDate: string;
}

export interface LocationMemory {
  locationId: string;
  locationName: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  zone: string;
  categoryBreakdown: CategoryMemorySummary[];
  dominantCategory: IncidentCategory;
  totalIncidents: number;
  totalRepairs: number;
  activeIncidents: number;
  overallState: MemoryState;
  memoriesByCategory: Record<string, FailureMemory>;
}
