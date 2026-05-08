export type AppRole = "owner" | "admin" | "recruiter" | "viewer";
export type JobStatus = "open" | "paused" | "filled" | "closed";
export type CrmStatus = "new" | "screening" | "ready" | "rejected";
export type CandidateSource = "manual" | "application";
export type PipelineStage =
  | "sourced"
  | "screened"
  | "interview"
  | "offer"
  | "hired"
  | "rejected";

export interface AgencyOrg {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
}

export interface OrgMember {
  uid: string;
  displayName?: string;
  email?: string;
  role: AppRole;
  createdAt: string;
}

export interface ClientCompany {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  notes?: string;
  createdAt: string;
}

export interface JobRequisition {
  id: string;
  clientId: string;
  title: string;
  status: JobStatus;
  location?: string;
  ownerUid?: string;
  createdAt: string;
}

export interface CandidateProfile {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  tags?: string[];
  ownerUid?: string;
  source?: CandidateSource;
  crmStatus?: CrmStatus;
  assignedTo?: string;
  cvUrl?: string;
  isDeleted?: boolean;
  updatedAt?: string;
  createdAt: string;
}

export interface Applicant {
  id: string;
  candidateId: string;
  stage: PipelineStage;
  history: {
    stage: PipelineStage;
    changedAt: string;
    changedBy: string;
  }[];
  updatedAt: string;
}

export interface NoteRecord {
  id: string;
  refType: "candidate" | "job" | "client";
  refId: string;
  body: string;
  createdBy: string;
  createdAt: string;
}

export interface TaskRecord {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  assigneeUid?: string;
  dueAt?: string;
  createdAt: string;
}

export interface ActivityRecord {
  id: string;
  type: string;
  message: string;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  type: string;
  actorUid?: string;
  metadata?: Record<string, unknown>;
  at: string;
}
