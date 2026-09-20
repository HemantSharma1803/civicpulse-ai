/**
 * CivicPulse AI — Core Domain Data Models & Types
 * "Cities record complaints. CivicPulse remembers failures."
 */

export type IncidentCategory =
  | 'Pothole'
  | 'Broken Streetlight'
  | 'Garbage Overflow'
  | 'Water Leakage'
  | 'Drainage Issue'
  | 'Damaged Footpath'
  | 'Traffic Signal Issue';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus = 'active' | 'investigating' | 'in_progress' | 'resolved';

export type RecurrenceState = 'NEW' | 'RECURRENT' | 'PERSISTENT' | 'RESOLVED';

export type IncidentSource = 'Citizen Report' | 'Demo Data' | 'Operator Entry' | 'Sensor Network';

export type ClassificationSource = 'AI_CONFIRMED' | 'USER_MODIFIED' | 'USER_SUPPLIED';

export type RelationType = 'LIKELY_DUPLICATE' | 'POSSIBLE_RELATED' | 'HISTORICAL_RELATED' | 'NO_STRONG_MATCH';

export interface VisualEvidenceItem {
  text: string;
  type: 'VISIBLE' | 'INFERRED' | 'UNCERTAIN';
}

export interface StructuredVisionAnalysis {
  isCivicIssue: boolean;
  primaryCategory: IncidentCategory | 'Other Civic Issue' | 'Unclear';
  secondaryCategory: string | null;
  severity: 'Low' | 'Medium' | 'High' | 'Critical' | 'Unclear';
  summary: string;
  visualEvidence: VisualEvidenceItem[];
  estimatedImpact: string;
  confidence: number;
  uncertainties: string[];
  requiresHumanReview: boolean;
  suggestedTags: string[];
  model?: string;
  analyzedAt: string;
  rawOutput?: string;
}

export interface AIAnalysis {
  category?: string;
  severity?: IncidentSeverity;
  summary?: string;
  visualEvidence?: string;
  confidence?: number;
  requiresHumanReview?: boolean;
  model?: string;
  createdAt?: string;
  structured?: StructuredVisionAnalysis;
}

export interface RelatedMatch {
  incidentId: string;
  incidentTitle: string;
  category: IncidentCategory;
  status: IncidentStatus;
  severity: IncidentSeverity;
  distanceMeters: number;
  relationType: RelationType;
  categorySimilarity: number;
  semanticSimilarity: number;
  temporalRelevance: number;
  overallMatchScore: number; // 0 - 100
  reasons: string[];
  createdAt: string;
  recurrenceCount: number;
  repairsCount: number;
  repairEventIds?: string[];
}

export interface MemoryCheckResult {
  matches: RelatedMatch[];
  duplicateWarning: boolean;
  likelyDuplicateMatch: RelatedMatch | null;
  chronicHotspot: Hotspot | null;
  locationHistorySummary: string;
  hasLocationHistory: boolean;
  typicalRecurrenceIntervalDays?: number;
}

export interface RepairEvent {
  id: string;
  incidentId: string;
  workOrderId?: string;
  memoryId?: string;
  date: string;
  action: string;
  description: string;
  contractorOrTeam: string;
  costEstimate?: string;
  source: string;
  createdAt: string;
  status?: 'PLANNED' | 'RECORDED' | 'VERIFIED' | 'DISPUTED';
  operator?: string;
  evidenceImageUrl?: string;
  afterImageUrl?: string;
  notes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNotes?: string;
  verificationImageUrl?: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  latitude: number;
  longitude: number;
  address: string;
  zone: string;
  createdAt: string;
  updatedAt: string;
  source: IncidentSource;
  tags: string[];
  imageUrl: string | null;
  aiAnalysis: AIAnalysis | null;
  aiVisionAnalysis?: StructuredVisionAnalysis | null;
  relatedIncidentIds: string[];
  recurrenceCount: number;
  repairEventIds: string[];
  assignedTeam?: string;
  resolutionNotes?: string;
  classificationSource?: ClassificationSource;
  analysisVersion?: number;
  userContext?: string;
}

export interface LocationRecord {
  id: string;
  name: string;
  address: string;
  zone: string;
  latitude: number;
  longitude: number;
  totalIncidents: number;
  activeIncidents: number;
  recurrenceState: RecurrenceState;
  firstReportedAt: string;
  lastReportedAt: string;
}

export interface Hotspot {
  id: string;
  locationName: string;
  address: string;
  zone: string;
  latitude: number;
  longitude: number;
  dominantCategory: IncidentCategory;
  incidentCount: number;
  activeCount: number;
  repairCount: number;
  mostRecentIncidentDate: string;
  recurrenceState: RecurrenceState;
  avgIntervalDays?: number;
  linkedIncidentIds: string[];
  riskScore: number; // 0 - 100
}

export interface CategoryHealth {
  category: IncidentCategory;
  label: string;
  incidentVolume: number;
  activeCount: number;
  recurringCount: number;
  resolvedCount: number;
  healthScore: number; // 0 - 100
  status: 'optimal' | 'moderate' | 'degraded' | 'critical';
  trend: 'improving' | 'stable' | 'deteriorating';
  description: string;
  unresolvedAvgDays: number;
}

export interface ScoreMethodology {
  baseScore: number;
  activeDeduction: number;
  recurrenceDeduction: number;
  durationDeduction: number;
  finalScore: number;
  explanation: string;
}

export interface Insight {
  id: string;
  type: 'pattern' | 'risk' | 'anomaly' | 'durability';
  insightType?: 'anomaly' | 'trend' | 'hotspot' | 'data-quality' | 'cross-department';
  title: string;
  explanation: string;
  evidence: string;
  relatedIncidentCount: number;
  relatedCategory?: IncidentCategory;
  relatedIncidentIds: string[];
  confidence: number;
  generatedAt: string;
  badgeText: string;
  actionRecommendation: string;
  // Segment 5 Intelligence Extensions
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'active' | 'acknowledged' | 'investigating' | 'actioned' | 'dismissed';
  observed?: {
    metrics: Array<{ label: string; value: string; baseline?: string; delta?: string; formula?: string; sampleSize?: number }>;
    facts: string[];
    primaryZone?: string;
    corridorName?: string;
    timeWindowDays?: number;
  };
  interpretation?: string;
  recommendations?: string[];
  limitations?: string[];
  dataQualityScore?: number;
  zone?: string;
  corridor?: string;
  source?: 'deterministic' | 'gemini-3.8-flash';
  assignedDepartment?: string;
}

export * from './services/intelligence/types';
export * from './services/operations/types';

export interface ActivityEvent {
  id: string;
  incidentId: string;
  incidentTitle: string;
  location: string;
  type: 'report' | 'status_change' | 'repair' | 'hotspot_flagged' | 'ai_analysis' | 'memory_match';
  title: string;
  description: string;
  timestamp: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  recurrenceBadge: boolean;
  actor?: 'USER' | 'AI' | 'SYSTEM';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'status' | 'hotspot' | 'repair' | 'alert';
  linkIncidentId?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  email: string;
  notificationsEnabled: boolean;
  highContrast: boolean;
}

export type NavigationPage =
  | 'overview'
  | 'report'
  | 'city-intelligence'
  | 'incidents'
  | 'failure-memory'
  | 'ai-insights'
  | 'operations'
  | 'analytics'
  | 'settings'
  | 'help-docs';

export type DateRangeFilter = '7d' | '30d' | '90d' | 'custom';
