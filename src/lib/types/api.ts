// Complete API types and response structures for Rekrutime

export interface User {
  id: string;
  email: string;
  password?: string; // Only in auth flows
  name: string;
  type: 'candidate' | 'employer' | 'admin';
  isDisabled?: boolean;
  createdAt: string;
}

export interface Candidate extends User {
  type: 'candidate';
  profile: CandidateProfile;
  savedJobs: string[]; // Job IDs
  applications: string[]; // Application IDs
}

export interface CandidateProfile {
  bio: string;
  location: string;
  skills: string[];
  experience: string;
  education: string;
  avatar?: string;
}

export interface Employer extends User {
  type: 'employer';
  profile: EmployerProfile;
  jobs: string[]; // Job IDs
  applications: string[]; // Application IDs
}

export interface EmployerProfile {
  company: string;
  industry: string;
  size: string;
  location: string;
  website?: string;
  description: string;
  logo?: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  type: 'full-time' | 'part-time' | 'contract' | 'freelance';
  skills: string[];
  experience: string;
  employerId: string;
  employer?: Employer;
  postedAt: string;
  applicants: number;
  saved: number;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  employerId: string;
  status: 'applied' | 'reviewing' | 'accepted' | 'rejected';
  appliedAt: string;
  messages: Message[];
  notes?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderType: 'candidate' | 'employer' | 'admin';
  content: string;
  sentAt: string;
  read: boolean;
}

export interface AuthToken {
  token: string;
  user: User;
  expiresAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  filters?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth API Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  type: 'candidate' | 'employer' | 'admin';
}

export interface SignupResponse {
  token: string;
  user: User;
}

// Job API Types
export interface CreateJobRequest {
  title: string;
  description: string;
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  type: Job['type'];
  skills: string[];
  experience: string;
}

export type UpdateJobRequest = Partial<CreateJobRequest>;

// Application API Types
export interface CreateApplicationRequest {
  jobId: string;
  coverLetter?: string;
}

export interface UpdateApplicationStatusRequest {
  status: 'reviewing' | 'accepted' | 'rejected';
  notes?: string;
}

// Analytics Types
export interface CandidateAnalytics {
  totalApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  pendingApplications: number;
  savedJobs: number;
  applicationRate: number; // Applications per saved job
  averageTimeToResponse: number; // In hours
}

export interface EmployerAnalytics {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  averageApplicationsPerJob: number;
  profileViews: number;
  averageTimeToHire: number; // In hours
}

// Matching Types
export interface JobMatch {
  job: Job;
  matchScore: number; // 0-100
  matchReason: string;
}

export interface CandidateMatch {
  candidate: Candidate;
  matchScore: number; // 0-100
  matchReason: string;
}

export interface NotificationEvent {
  id: string;
  type: 'application' | 'message' | 'status_update' | 'saved_job';
  userId: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}
