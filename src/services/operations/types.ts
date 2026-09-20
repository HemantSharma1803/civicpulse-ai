import { IncidentCategory, IncidentSeverity } from '../../types';

export type WorkOrderStatus =
  | 'DRAFT'
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'BLOCKED'
  | 'COMPLETED'
  | 'CANCELLED';

export type WorkOrderPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type RepairEventStatus = 'PLANNED' | 'RECORDED' | 'VERIFIED' | 'DISPUTED';

export type CaseReviewStatus =
  | 'NEW'
  | 'UNDER_REVIEW'
  | 'ACTION_IN_PROGRESS'
  | 'MONITORING'
  | 'CLOSED';

export type BlockedReasonCategory =
  | 'Awaiting materials'
  | 'Location inaccessible'
  | 'Additional inspection required'
  | 'Insufficient information'
  | 'Adverse weather'
  | 'Inter-agency coordination required'
  | 'Other';

export interface WorkOrder {
  id: string; // e.g. WO-1042
  incidentIds: string[];
  memoryId?: string;
  title: string;
  description: string;
  category: IncidentCategory;
  location: string;
  latitude?: number;
  longitude?: number;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  assigneeId?: string;
  teamId?: string;
  createdAt: string;
  updatedAt: string;
  dueAt: string;
  startedAt?: string;
  completedAt?: string;
  blockedReason?: string;
  blockedCategory?: BlockedReasonCategory;
  notes?: string;
  attachments?: string[];
  repairEventIds: string[];
  activityEventIds?: string[];
  source: 'Manual' | 'AI_Insight' | 'Failure_Memory' | 'Incident_Escalation' | 'Demo_Seed';
  demo: boolean;
  suggestedTeamId?: string;
  followUpMonitoring?: boolean;
  monitoringClosedAt?: string;
  postRepairIncidentCount?: number;
  tags?: string[];
}

export interface DemoTeam {
  id: string;
  name: string;
  categorySpecialty: IncidentCategory[];
  leadName: string;
  memberCount: number;
  color: string;
  description: string;
}

export interface DemoUser {
  id: string;
  name: string;
  role: string;
  teamId: string;
  email: string;
  avatar: string;
}

export type AuditActorType = 'USER' | 'SYSTEM' | 'AI' | 'DEMO_OPERATOR';

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorType: AuditActorType;
  actorName: string;
  action: string;
  entityType: 'INCIDENT' | 'WORK_ORDER' | 'REPAIR_EVENT' | 'MEMORY' | 'ASSIGNMENT' | 'VERIFICATION';
  entityId: string;
  details: string;
  metadata?: Record<string, unknown>;
}

export interface OperationalRepairEvent {
  id: string;
  workOrderId?: string;
  incidentId: string;
  memoryId?: string;
  date: string;
  action: string;
  description: string;
  contractorOrTeam: string;
  status: RepairEventStatus;
  operator?: string;
  costEstimate?: string;
  evidenceImageUrl?: string;
  afterImageUrl?: string;
  notes?: string;
  source: string;
  createdAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNotes?: string;
  verificationImageUrl?: string;
}

export interface WorkOrderFilter {
  search: string;
  status: WorkOrderStatus | 'ALL';
  priority: WorkOrderPriority | 'ALL';
  teamId: string | 'ALL';
  assigneeId: string | 'ALL';
  category: IncidentCategory | 'ALL';
  dueStatus: 'ALL' | 'OVERDUE' | 'DUE_TODAY' | 'DUE_SOON' | 'COMPLETED_ON_TIME' | 'COMPLETED_LATE';
  hasMemory: 'ALL' | 'YES' | 'NO';
  dateRange: 'ALL' | '7d' | '30d' | '90d';
}

export interface SavedWorkOrderFilter {
  id: string;
  name: string;
  filter: Partial<WorkOrderFilter>;
  badge?: string;
}

export interface OperationsKPIs {
  openWorkOrders: number;
  inProgress: number;
  awaitingReview: number;
  recentlyResolved: number;
  overdue: number;
  highAttentionMemories: number;
}

export interface TeamWorkloadStats {
  team: DemoTeam;
  openCount: number;
  inProgressCount: number;
  overdueCount: number;
  completedCount: number;
  members: Array<{
    user: DemoUser;
    assignedCount: number;
    inProgressCount: number;
    overdueCount: number;
  }>;
}

export interface CaseReviewCase {
  caseId: string;
  title: string;
  category: IncidentCategory;
  location: string;
  status: CaseReviewStatus;
  primaryIncidentId: string;
  linkedIncidentIds: string[];
  memoryId?: string;
  recurrenceCount: number;
  repairCount: number;
  activeWorkOrderId?: string;
  evidenceImageUrls: string[];
  createdAt: string;
  updatedAt: string;
  riskSummary: string;
}
