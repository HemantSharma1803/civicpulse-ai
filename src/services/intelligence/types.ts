import { IncidentCategory, IncidentSeverity } from '../../types';

export type InsightType =
  | 'anomaly'
  | 'trend'
  | 'hotspot'
  | 'data-quality'
  | 'cross-department';

export type InsightSeverity = 'low' | 'medium' | 'high' | 'critical';

export type InsightStatus =
  | 'active'
  | 'acknowledged'
  | 'investigating'
  | 'actioned'
  | 'dismissed';

export interface ObservedMetric {
  label: string;
  value: string;
  baseline?: string;
  delta?: string;
  formula?: string;
  sampleSize?: number;
}

export interface ObservedDataBlock {
  metrics: ObservedMetric[];
  facts: string[];
  primaryZone?: string;
  corridorName?: string;
  timeWindowDays: number;
}

export interface EvidenceRecord {
  incidentId: string;
  title: string;
  category: IncidentCategory;
  date: string;
  address: string;
  severity: IncidentSeverity;
  status: string;
  role: 'primary' | 'preceding' | 'subsequent' | 'corroborating';
}

export interface IntelligenceInsight {
  id: string;
  type: 'pattern' | 'risk' | 'anomaly' | 'durability'; // for backwards-compatibility with Insight
  insightType: InsightType;
  title: string;
  explanation: string;
  evidence: string;
  observed: ObservedDataBlock;
  interpretation: string;
  recommendations: string[];
  limitations: string[];
  dataQualityScore: number; // 0 - 100
  relatedCategory?: IncidentCategory;
  relatedIncidentCount: number;
  relatedIncidentIds: string[];
  relatedHotspotIds?: string[];
  evidenceRecords?: EvidenceRecord[];
  zone?: string;
  corridor?: string;
  confidence: number; // 0 - 100
  severity: InsightSeverity;
  status: InsightStatus;
  generatedAt: string;
  badgeText: string;
  actionRecommendation: string;
  source: 'deterministic' | 'gemini-3.8-flash';
  statusNotes?: string;
  assignedDepartment?: string;
}

export interface AskCivicPulseQuery {
  id: string;
  query: string;
  timestamp: string;
  interpretedIntent: {
    category?: IncidentCategory | 'all';
    zone?: string | 'all';
    severity?: IncidentSeverity | 'all';
    isRecurrenceFocus: boolean;
    keywords: string[];
    summary: string;
  };
  matchedIncidentIds: string[];
  matchedHotspotIds: string[];
  answer: {
    headline: string;
    observedFacts: string[];
    interpretation: string;
    recommendation: string;
    limitations: string[];
    confidence: number;
    source: 'gemini-3.8-flash' | 'deterministic-city-analyst';
  };
}

export interface ExecutiveBriefing {
  generatedAt: string;
  city: string;
  preparedFor: string;
  systemHealthIndex: number;
  activeAnomaliesCount: number;
  chronicCorridorsCount: number;
  executiveSummary: string;
  urgentInterventions: Array<{
    title: string;
    corridorOrZone: string;
    severity: InsightSeverity;
    requiredAction: string;
    leadDepartment: string;
  }>;
  crossDepartmentMandates: Array<{
    departments: string[];
    issue: string;
    jointDirective: string;
  }>;
  dataIntegrityReport: {
    totalIncidentsAnalyzed: number;
    verifiedIncidentRatio: string;
    coverageScore: number;
    blindSpots: string[];
  };
}
