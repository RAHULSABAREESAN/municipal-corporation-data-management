export type ComplaintCategory =
  | 'Waterlogging & Stormwater'
  | 'Potholes & Road Damage'
  | 'Sewage Overflow'
  | 'Solid Waste / Canal Choking'
  | 'Streetlight Outage'
  | 'Fallen Tree / Hazard';

export type ComplaintSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ComplaintStatus =
  | 'reported'
  | 'triaged'
  | 'assigned'
  | 'investigating'
  | 'repair_scheduled'
  | 'work_completed_pending_inspection'
  | 'verified_resolved';

export type ResponsibleDepartment =
  | 'Stormwater Drainage Department (SWD)'
  | 'Roads & Bridges Department'
  | 'Solid Waste Management Division'
  | 'Chennai Metro Water (CMWSSB)'
  | 'Parks & Electrical Division';

export interface Complaint {
  id: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  originalLanguage: 'en' | 'ta' | 'tanglish';
  englishTranslation?: string;
  area: string;
  zone: string;
  ward: number;
  landmark: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  severity: ComplaintSeverity;
  status: ComplaintStatus;
  clusterId?: string;
  photoUrl?: string;
  photoLatitude?: number;
  photoLongitude?: number;
  photoCapturedAt?: string;
  citizenName?: string;
  citizenPhone?: string;
  isPostRepairRecurrence?: boolean;
  daysSincePreviousRepair?: number;
  assignedDepartment?: ResponsibleDepartment;
  assignedTeam?: string;
  priorityReason?: string;
  isDuplicate?: boolean;
  duplicateOfId?: string;
  geocodingSource?: 'coordinates' | 'landmark_lookup' | 'ai_estimated' | 'unverified';
}

export type ClusterStatus =
  | 'chronic_active'
  | 'in_remediation'
  | 'work_completed_pending_inspection'
  | 'verified_resolved'
  | 'post_repair_relapse';

export interface RootCauseHypothesis {
  id: string;
  title: string;
  hypothesis: string;
  supportingEvidence: string[];
  engineeringCategory:
    | 'Hydraulic Capacity'
    | 'Topographical Bottleneck'
    | 'Siltation & Debris'
    | 'Utility Cross-Interference'
    | 'Structural Failure';
  confidence: 'high' | 'moderate' | 'exploratory';
}

export interface RecommendedInspection {
  step: number;
  inspectionType: string;
  targetAsset: string;
  description: string;
  urgency: 'Immediate' | 'Next Dry Spell' | 'Pre-Monsoon';
}

export interface AIAnalysis {
  analyzedAt: string;
  modelUsed: string;
  confidenceScore: number;
  summary: string;
  hypotheses: RootCauseHypothesis[];
  recommendedInspections: RecommendedInspection[];
  permanentRemedy: string;
  temporaryMitigation: string;
  disclaimer: string;
}

export interface RepairRecord {
  id: string;
  interventionDate: string;
  officerName: string;
  officerDesignation: string;
  contractorAgency?: string;
  workType: string;
  description: string;
  estimatedCostINR?: number;
  beforePhotoUrl?: string;
  duringPhotoUrl?: string;
  workCompletedAt: string;
}

export interface InspectionRecord {
  id: string;
  inspectionDate: string;
  inspectorName: string;
  inspectorDesignation: string;
  inspectionFindings: string;
  waterFlowClearanceObserved: boolean;
  siltLevelCM: number;
  approvalStatus: 'approved_verified' | 'rejected_rework_needed';
  afterPhotoUrl: string;
  verifiedAt: string;
}

export interface PriorityBreakdown {
  recurrencePoints: number;
  severityPoints: number;
  durationPoints: number;
  vulnerabilityModifier: number;
  total: number;
  rationale: string;
}

export interface RecurrenceFingerprint {
  clusterId: string;
  geographicBounds: {
    centerLat: number;
    centerLng: number;
    radiusMeters: number;
  };
  incidentCount: number;
  timeline: Array<{
    date: string;
    type: 'complaint' | 'repair' | 'inspection' | 'relapse';
    referenceId: string;
    summary: string;
    severity?: string;
  }>;
  recurringCategories: string[];
  previousRepairsCount: number;
  inspectionHistoryCount: number;
  timeBetweenRepairAndRelapseDays?: number;
  openComplaintsCount: number;
  contributingCausesHypotheses: string[];
  supportingEvidenceSummary: string[];
  nextRecommendedInspections: string[];
  confidenceLevel: 'High (Verified Physical Data)' | 'Moderate (Correlated Reports)' | 'Preliminary';
  confidenceRationale: string;
  lastFingerprintGeneratedAt: string;
}

export interface InspectionTask {
  id: string;
  clusterId: string;
  complaintId?: string;
  title: string;
  category: ComplaintCategory;
  location: string;
  zone: string;
  ward: number;
  suspectedIssue: string;
  previousRepairsSummary: string;
  evidenceSummary: string;
  suggestedChecklist: string[];
  assignedDepartment: ResponsibleDepartment;
  assignedTeam: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  findings?: string;
  siltLevelCM?: number;
  waterFlowClearance?: boolean;
  approvalStatus?: 'approved_verified' | 'rejected_rework_needed';
  completedAt?: string;
  createdAt: string;
}

export interface FollowUpCheck {
  id: string;
  clusterId: string;
  repairId: string;
  checkDay: 7 | 30 | 90;
  dueDate: string;
  status: 'scheduled' | 'monitored' | 'breached' | 'passed';
  notes?: string;
  verifiedAt?: string;
}

export interface CivicNotification {
  id: string;
  type:
    | 'critical_complaint'
    | 'relapse_detected'
    | 'inspection_due'
    | 'repair_awaiting_verification'
    | 'followup_due'
    | 'duplicate_flagged'
    | 'system_alert';
  title: string;
  message: string;
  clusterId?: string;
  complaintId?: string;
  timestamp: string;
  read: boolean;
  severity: 'info' | 'warning' | 'critical';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  entityType: 'complaint' | 'cluster' | 'repair' | 'inspection' | 'task';
  entityId: string;
  action: string;
  performedBy: string;
  details: string;
}

export interface RecurrenceCluster {
  id: string;
  title: string;
  category: ComplaintCategory;
  area: string;
  zone: string;
  ward: number;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  complaintIds: string[];
  recurrenceCount: number;
  firstReportedAt: string;
  lastReportedAt: string;
  status: ClusterStatus;
  priorityScore: number;
  priorityBreakdown: PriorityBreakdown;
  aiAnalysis?: AIAnalysis;
  repairs: RepairRecord[];
  inspections: InspectionRecord[];
  isPostRepairRecurrence: boolean;
  lastRepairedAt?: string;
  daysBetweenRepairAndRecurrence?: number;
  assignedDepartment?: ResponsibleDepartment;
  assignedTeam?: string;
  fingerprint?: RecurrenceFingerprint;
  inspectionTasks?: InspectionTask[];
  followUpChecks?: FollowUpCheck[];
}

export interface SystemStats {
  totalComplaints: number;
  unresolvedCases: number;
  recurringIncidents: number;
  verifiedRepairs: number;
  recurrenceRatePct: number;
  postRepairRelapses: number;
  avgResolutionDays: number;
  medianResolutionDays: number;
  inspectionBacklog: number;
  repairEffectivenessPct: number;
  activeInspectionTasksCount: number;
  totalUnreadNotificationsCount: number;
  topVulnerableZones: Array<{ zone: string; count: number }>;
}
