import { v4 as uuidv4 } from 'uuid';
import {
  User,
  Candidate,
  Employer,
  Job,
  Application,
  Message,
  AuthToken,
  ApiResponse,
  PaginatedResponse,
  LoginRequest,
  SignupRequest,
  CreateJobRequest,
  CreateApplicationRequest,
  UpdateApplicationStatusRequest,
} from '@/lib/types/api';
import { dataStore } from '@/lib/storage/dataStore';

/**
 * Custom API Error class for better error handling
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Simulate network delays
 */
const delay = <T>(value: T, ms: number = 300): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

/**
 * Simulate occasional network errors (for testing error handling)
 * Set to false in production
 */
const SIMULATE_ERRORS = false;

const simulateNetworkError = () => {
  if (SIMULATE_ERRORS && Math.random() < 0.1) {
    throw new ApiError('Gabim në lidhje. Kontrolloni internetin tuaj.', 503);
  }
};

/**
 * Initialize sample data if store is empty
 */
const initializeSampleData = () => {
  if (dataStore.getAllJobs().length === 0) {
    // Create sample employers
    const employer1: Employer = {
      id: uuidv4(),
      email: 'hr@balkantechcompany.com',
      name: 'BalkanTech',
      type: 'employer',
      createdAt: new Date().toISOString(),
      profile: {
        company: 'BalkanTech',
        industry: 'Teknologji',
        size: '50-100',
        location: 'Tiranë',
        description: 'Lider në zhvillimin e zgjidhjeve teknologjike',
      },
      jobs: [],
      applications: [],
    };

    const employer2: Employer = {
      id: uuidv4(),
      email: 'careers@aventus.com',
      name: 'Aventus',
      type: 'employer',
      createdAt: new Date().toISOString(),
      profile: {
        company: 'Aventus',
        industry: 'E-commerce',
        size: '100-500',
        location: 'Prishtinë',
        description: 'Platforma e-commerce që përballet me inovacion',
      },
      jobs: [],
      applications: [],
    };

    dataStore.saveEmployers([employer1, employer2]);

    // Create sample jobs
    const job1: Job = {
      id: uuidv4(),
      title: 'Inxhinier/e Senior Frontend',
      description:
        'Kërkojmë inxhinier senior frontend me përvojë të konsiderueshme në React, TypeScript dhe moderne UX/UI.',
      location: 'Tiranë',
      salary: { min: 2000, max: 2700, currency: 'EUR' },
      type: 'full-time',
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
      experience: '5+ vite',
      employerId: employer1.id,
      postedAt: new Date().toISOString(),
      applicants: 0,
      saved: 0,
    };

    const job2: Job = {
      id: uuidv4(),
      title: 'Menaxher/e Produkti',
      description:
        'Qeruese të strategjisë të produktit dhe koordinuese me ekipin e zhvillimit.',
      location: 'Prishtinë',
      salary: { min: 1700, max: 2300, currency: 'EUR' },
      type: 'full-time',
      skills: ['Product Management', 'Data Analysis', 'Leadership'],
      experience: '3+ vite',
      employerId: employer2.id,
      postedAt: new Date().toISOString(),
      applicants: 0,
      saved: 0,
    };

    const job3: Job = {
      id: uuidv4(),
      title: 'Zhvillues/e Backend',
      description:
        'Zhvillim i API-ve robust dhe scalable duke përdorur Node.js dhe PostgreSQL.',
      location: 'Tiranë',
      salary: { min: 1800, max: 2400, currency: 'EUR' },
      type: 'full-time',
      skills: ['Node.js', 'PostgreSQL', 'REST API', 'Docker'],
      experience: '3+ vite',
      employerId: employer1.id,
      postedAt: new Date().toISOString(),
      applicants: 0,
      saved: 0,
    };

    employer1.jobs = [job1.id, job3.id];
    employer2.jobs = [job2.id];
    dataStore.saveEmployers([employer1, employer2]);
    dataStore.saveJobs([job1, job2, job3]);

    // Create sample candidate
    const candidate: Candidate = {
      id: uuidv4(),
      email: 'elena@example.com',
      name: 'Elena Gashi',
      type: 'candidate',
      createdAt: new Date().toISOString(),
      profile: {
        bio: 'Frontend inxhiniere me pasion për dizajn dhe zhvillim modern',
        location: 'Tiranë',
        skills: ['React', 'TypeScript', 'Tailwind CSS', 'UI/UX'],
        experience: '5 vite',
        education: 'Bachelor në Informatikë',
      },
      savedJobs: [job1.id],
      applications: [],
    };

    dataStore.saveCandidates([candidate]);
  }
};

// Initialize on module load
if (typeof window !== 'undefined') {
  initializeSampleData();
}

// ============ Authentication API ============

export async function login(
  request: LoginRequest
): Promise<ApiResponse<AuthToken>> {
  simulateNetworkError();
  await delay({});

  const candidates = dataStore.getAllCandidates();
  const employers = dataStore.getAllEmployers();
  const allUsers = [...candidates, ...employers];

  const user = allUsers.find(
    (u) => u.email === request.email && u.email.includes('@')
  );

  if (!user) {
    throw new ApiError('Email ose fjalëkalim i gabuar', 401);
  }

  const token: AuthToken = {
    token: `token_${uuidv4()}`,
    user,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
  };

  dataStore.setCurrentToken(token);
  dataStore.setCurrentUser(user);

  return {
    success: true,
    data: token,
    timestamp: new Date().toISOString(),
  };
}

export async function signup(
  request: SignupRequest
): Promise<ApiResponse<AuthToken>> {
  simulateNetworkError();
  await delay({});

  const allUsers = [
    ...dataStore.getAllCandidates(),
    ...dataStore.getAllEmployers(),
  ];

  if (allUsers.some((u) => u.email === request.email)) {
    throw new ApiError('Ky email është i regjistruar tashmë', 400);
  }

  let user: User;

  if (request.type === 'candidate') {
    user = {
      id: uuidv4(),
      email: request.email,
      name: request.name,
      type: 'candidate',
      createdAt: new Date().toISOString(),
    };
    const candidate: Candidate = {
      ...user,
      type: 'candidate',
      profile: {
        bio: '',
        location: '',
        skills: [],
        experience: '',
        education: '',
      },
      savedJobs: [],
      applications: [],
    };
    dataStore.saveCandidates([...dataStore.getAllCandidates(), candidate]);
  } else {
    user = {
      id: uuidv4(),
      email: request.email,
      name: request.name,
      type: 'employer',
      createdAt: new Date().toISOString(),
    };
    const employer: Employer = {
      ...user,
      type: 'employer',
      profile: {
        company: request.name,
        industry: '',
        size: '',
        location: '',
        description: '',
      },
      jobs: [],
      applications: [],
    };
    dataStore.saveEmployers([...dataStore.getAllEmployers(), employer]);
  }

  const token: AuthToken = {
    token: `token_${uuidv4()}`,
    user,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };

  dataStore.setCurrentToken(token);
  dataStore.setCurrentUser(user);

  return {
    success: true,
    data: token,
    timestamp: new Date().toISOString(),
  };
}

export async function logout(): Promise<ApiResponse<null>> {
  simulateNetworkError();
  await delay({});

  dataStore.logout();

  return {
    success: true,
    data: null,
    timestamp: new Date().toISOString(),
  };
}

// ============ Job API ============

export async function fetchJobs(
  page: number = 1,
  limit: number = 10,
  search?: string,
  filters?: Record<string, any>
): Promise<ApiResponse<PaginatedResponse<Job>>> {
  simulateNetworkError();
  await delay({});

  let jobs = dataStore.getAllJobs();

  if (search) {
    jobs = jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.description.toLowerCase().includes(search.toLowerCase()) ||
        j.location.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (filters?.location) {
    jobs = jobs.filter((j) =>
      j.location.toLowerCase().includes(filters.location.toLowerCase())
    );
  }

  if (filters?.type) {
    jobs = jobs.filter((j) => j.type === filters.type);
  }

  if (filters?.salaryMin) {
    jobs = jobs.filter((j) => j.salary.min >= filters.salaryMin);
  }

  const total = jobs.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginatedJobs = jobs.slice(startIndex, startIndex + limit);

  return {
    success: true,
    data: {
      items: paginatedJobs,
      total,
      page,
      limit,
      totalPages,
    },
    timestamp: new Date().toISOString(),
  };
}

export async function getJobById(id: string): Promise<ApiResponse<Job>> {
  simulateNetworkError();
  await delay({});

  const job = dataStore.getJobById(id);
  if (!job) {
    throw new ApiError('Puna nuk u gjet', 404);
  }

  return {
    success: true,
    data: job,
    timestamp: new Date().toISOString(),
  };
}

export async function createJob(
  request: CreateJobRequest
): Promise<ApiResponse<Job>> {
  simulateNetworkError();
  await delay({});

  const currentUser = dataStore.getCurrentUser();
  if (!currentUser || currentUser.type !== 'employer') {
    throw new ApiError('Duhet të jeni punëdhënës për të krijuar punë', 401);
  }

  const job: Job = {
    id: uuidv4(),
    ...request,
    employerId: currentUser.id,
    postedAt: new Date().toISOString(),
    applicants: 0,
    saved: 0,
  };

  dataStore.saveJob(job);

  // Update employer
  const employers = dataStore.getAllEmployers();
  const employer = employers.find((e) => e.id === currentUser.id);
  if (employer) {
    employer.jobs.push(job.id);
    dataStore.saveEmployers(employers);
  }

  return {
    success: true,
    data: job,
    timestamp: new Date().toISOString(),
  };
}

export async function updateJob(
  id: string,
  request: Partial<CreateJobRequest>
): Promise<ApiResponse<Job>> {
  simulateNetworkError();
  await delay({});

  const job = dataStore.getJobById(id);
  if (!job) {
    throw new ApiError('Puna nuk u gjet', 404);
  }

  const currentUser = dataStore.getCurrentUser();
  if (currentUser?.id !== job.employerId) {
    throw new ApiError('Nuk lejohet të ndryshoni këtë punë', 403);
  }

  const updatedJob: Job = {
    ...job,
    ...request,
  };

  dataStore.saveJob(updatedJob);

  return {
    success: true,
    data: updatedJob,
    timestamp: new Date().toISOString(),
  };
}

export async function deleteJob(id: string): Promise<ApiResponse<null>> {
  simulateNetworkError();
  await delay({});

  const job = dataStore.getJobById(id);
  if (!job) {
    throw new ApiError('Puna nuk u gjet', 404);
  }

  const currentUser = dataStore.getCurrentUser();
  if (currentUser?.id !== job.employerId) {
    throw new ApiError('Nuk lejohet ta fshini këtë punë', 403);
  }

  dataStore.deleteJob(id);

  // Update employer
  const employers = dataStore.getAllEmployers();
  const employer = employers.find((e) => e.id === currentUser.id);
  if (employer) {
    employer.jobs = employer.jobs.filter((jid) => jid !== id);
    dataStore.saveEmployers(employers);
  }

  return {
    success: true,
    data: null,
    timestamp: new Date().toISOString(),
  };
}

// ============ Application API ============

export async function applyForJob(
  request: CreateApplicationRequest
): Promise<ApiResponse<Application>> {
  simulateNetworkError();
  await delay({});

  const currentUser = dataStore.getCurrentUser();
  if (!currentUser || currentUser.type !== 'candidate') {
    throw new ApiError('Duhet të jeni kandidat për të aplikuar', 401);
  }

  const job = dataStore.getJobById(request.jobId);
  if (!job) {
    throw new ApiError('Puna nuk u gjet', 404);
  }

  if (dataStore.applicationExists(request.jobId, currentUser.id)) {
    throw new ApiError('Ju keni aplikuar tashmë për këtë punë', 400);
  }

  const application: Application = {
    id: uuidv4(),
    jobId: request.jobId,
    candidateId: currentUser.id,
    employerId: job.employerId,
    status: 'applied',
    appliedAt: new Date().toISOString(),
    messages: [],
    notes: '',
  };

  dataStore.saveApplication(application);

  // Update job applicants
  job.applicants++;
  dataStore.saveJob(job);

  // Update candidate
  const candidates = dataStore.getAllCandidates();
  const candidate = candidates.find((c) => c.id === currentUser.id);
  if (candidate) {
    candidate.applications.push(application.id);
    dataStore.saveCandidates(candidates);
  }

  // Update employer
  const employers = dataStore.getAllEmployers();
  const employer = employers.find((e) => e.id === job.employerId);
  if (employer) {
    employer.applications.push(application.id);
    dataStore.saveEmployers(employers);
  }

  return {
    success: true,
    data: application,
    timestamp: new Date().toISOString(),
  };
}

export async function getApplications(
  page: number = 1,
  limit: number = 10
): Promise<ApiResponse<PaginatedResponse<Application>>> {
  simulateNetworkError();
  await delay({});

  const currentUser = dataStore.getCurrentUser();
  if (!currentUser) {
    throw new ApiError('Nuk jeni i loguar', 401);
  }

  let applications: Application[];

  if (currentUser.type === 'candidate') {
    applications = dataStore.getApplicationsByCandidate(currentUser.id);
  } else {
    applications = dataStore.getApplicationsByEmployer(currentUser.id);
  }

  const total = applications.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginatedApps = applications.slice(startIndex, startIndex + limit);

  return {
    success: true,
    data: {
      items: paginatedApps,
      total,
      page,
      limit,
      totalPages,
    },
    timestamp: new Date().toISOString(),
  };
}

export async function updateApplicationStatus(
  applicationId: string,
  request: UpdateApplicationStatusRequest
): Promise<ApiResponse<Application>> {
  simulateNetworkError();
  await delay({});

  const application = dataStore.getApplicationById(applicationId);
  if (!application) {
    throw new ApiError('Aplikimi nuk u gjet', 404);
  }

  const currentUser = dataStore.getCurrentUser();
  if (currentUser?.id !== application.employerId) {
    throw new ApiError('Nuk lejohet të përditësoni këtë aplikim', 403);
  }

  application.status = request.status;
  if (request.notes) {
    application.notes = request.notes;
  }

  dataStore.saveApplication(application);

  return {
    success: true,
    data: application,
    timestamp: new Date().toISOString(),
  };
}

// ============ Messages API ============

export async function sendMessage(
  applicationId: string,
  content: string
): Promise<ApiResponse<Message>> {
  simulateNetworkError();
  await delay({});

  const application = dataStore.getApplicationById(applicationId);
  if (!application) {
    throw new ApiError('Aplikimi nuk u gjet', 404);
  }

  const currentUser = dataStore.getCurrentUser();
  if (
    !currentUser ||
    (currentUser.id !== application.candidateId &&
      currentUser.id !== application.employerId)
  ) {
    throw new ApiError('Nuk lejohet të dërgoni mesazhe', 403);
  }

  const message: Message = {
    id: uuidv4(),
    senderId: currentUser.id,
    senderType: currentUser.type,
    content,
    sentAt: new Date().toISOString(),
    read: false,
  };

  dataStore.addMessageToApplication(applicationId, message);

  return {
    success: true,
    data: message,
    timestamp: new Date().toISOString(),
  };
}

// ============ Saved Jobs API ============

export async function saveJob(jobId: string): Promise<ApiResponse<null>> {
  simulateNetworkError();
  await delay({});

  const currentUser = dataStore.getCurrentUser();
  if (!currentUser || currentUser.type !== 'candidate') {
    throw new ApiError('Duhet të jeni kandidat për të ruajtur punë', 401);
  }

  const job = dataStore.getJobById(jobId);
  if (!job) {
    throw new ApiError('Puna nuk u gjet', 404);
  }

  dataStore.addSavedJob(currentUser.id, jobId);
  job.saved++;
  dataStore.saveJob(job);

  return {
    success: true,
    data: null,
    timestamp: new Date().toISOString(),
  };
}

export async function unsaveJob(jobId: string): Promise<ApiResponse<null>> {
  simulateNetworkError();
  await delay({});

  const currentUser = dataStore.getCurrentUser();
  if (!currentUser || currentUser.type !== 'candidate') {
    throw new ApiError('Duhet të jeni kandidat', 401);
  }

  const job = dataStore.getJobById(jobId);
  if (!job) {
    throw new ApiError('Puna nuk u gjet', 404);
  }

  dataStore.removeSavedJob(currentUser.id, jobId);
  job.saved = Math.max(0, job.saved - 1);
  dataStore.saveJob(job);

  return {
    success: true,
    data: null,
    timestamp: new Date().toISOString(),
  };
}

// ============ Profile API ============

export async function getUserProfile(): Promise<ApiResponse<User>> {
  simulateNetworkError();
  await delay({});

  const user = dataStore.getCurrentUser();
  if (!user) {
    throw new ApiError('Nuk jeni i loguar', 401);
  }

  return {
    success: true,
    data: user,
    timestamp: new Date().toISOString(),
  };
}

// ============ Dashboard API ============

export async function getEmployerDashboard(): Promise<
  ApiResponse<{
    analytics: any;
    recentApplications: Application[];
    activeJobs: Job[];
  }>
> {
  simulateNetworkError();
  await delay({});

  const currentUser = dataStore.getCurrentUser();
  if (!currentUser || currentUser.type !== 'employer') {
    throw new ApiError('Duhet të jeni punëdhënës', 401);
  }

  const analytics = dataStore.getEmployerAnalytics(currentUser.id);
  const recentApplications = dataStore
    .getApplicationsByEmployer(currentUser.id)
    .slice(0, 5);
  const activeJobs = dataStore.getJobsByEmployer(currentUser.id);

  return {
    success: true,
    data: {
      analytics,
      recentApplications,
      activeJobs,
    },
    timestamp: new Date().toISOString(),
  };
}

export async function getCandidateDashboard(): Promise<
  ApiResponse<{
    analytics: any;
    recentApplications: Application[];
    suggestedJobs: Job[];
  }>
> {
  simulateNetworkError();
  await delay({});

  const currentUser = dataStore.getCurrentUser();
  if (!currentUser || currentUser.type !== 'candidate') {
    throw new ApiError('Duhet të jeni kandidat', 401);
  }

  const analytics = dataStore.getCandidateAnalytics(currentUser.id);
  const recentApplications = dataStore
    .getApplicationsByCandidate(currentUser.id)
    .slice(0, 5);
  const suggestedJobs = dataStore.getAllJobs().slice(0, 5);

  return {
    success: true,
    data: {
      analytics,
      recentApplications,
      suggestedJobs,
    },
    timestamp: new Date().toISOString(),
  };
}

// ============ Backward Compatibility Functions ============
// These functions maintain the old API for existing pages
// They wrap the new API and return the old data structures

export interface EmployerJob {
  id: string | number;
  title: string;
  status: 'active' | 'paused';
  applications: number;
  views: number;
  postedDate: string;
  salary: string;
  location?: string;
  description?: string;
}

export interface EmployerJobCreateInput {
  title: string;
  salary: string;
  location: string;
  description: string;
  status?: 'active' | 'paused';
}

export interface CandidateApplication {
  id: string | number;
  jobTitle: string;
  company: string;
  status: 'pending' | 'interview' | 'rejected' | 'accepted' | 'applied' | 'reviewing';
  appliedDate: string;
  salary: string;
  candidateName?: string;
}

export interface SavedJob {
  id: string | number;
  title: string;
  company: string;
  salary: string;
  savedDate: string;
}

export interface CandidateMessage {
  id: string | number;
  from: string;
  subject: string;
  received: string;
  body?: string;
}

export async function fetchEmployerDashboard() {
  try {
    const response = await getEmployerDashboard();
    const jobs = dataStore.getJobsByEmployer(dataStore.getCurrentUser()?.id || '');
    
    return {
      stats: {
        activeJobs: response.data?.activeJobs.length || 0,
        applicationsToday: response.data?.recentApplications.length || 0,
        profileViews: Math.floor(Math.random() * 100),
        conversionRate: 12.5,
      },
      jobs: jobs.map((j) => ({
        id: j.id,
        title: j.title,
        status: 'active' as const,
        applications: j.applicants,
        views: Math.floor(Math.random() * 100),
        postedDate: new Date(j.postedAt).toISOString().split('T')[0],
        salary: `EUR ${j.salary.min} - ${j.salary.max}`,
        location: j.location,
        description: j.description,
      })) as EmployerJob[],
      recentApplications: response.data?.recentApplications || [],
    };
  } catch (error) {
    return {
      stats: {
        activeJobs: 0,
        applicationsToday: 0,
        profileViews: 0,
        conversionRate: 0,
      },
      jobs: [],
      recentApplications: [],
    };
  }
}

export async function createEmployerJob(job: EmployerJobCreateInput) {
  const currentUser = dataStore.getCurrentUser();
  const response = await createJob({
    title: job.title,
    description: job.description,
    location: job.location,
    salary: {
      min: parseInt(job.salary.split('-')[0].replace(/\D/g, '')) || 1500,
      max: parseInt(job.salary.split('-')[1]?.replace(/\D/g, '') || '2500') || 2500,
      currency: 'EUR',
    },
    type: 'full-time',
    skills: [],
    experience: '',
  });

  return {
    id: response.data?.id,
    title: response.data?.title,
    status: job.status || ('active' as const),
    applications: 0,
    views: 0,
    postedDate: response.data?.postedAt.split('T')[0],
    salary: job.salary,
    location: job.location,
    description: job.description,
  } as EmployerJob;
}

export async function fetchCandidateDashboard() {
  try {
    const response = await getCandidateDashboard();
    const currentUser = dataStore.getCurrentUser();
    const candidate = dataStore.getCandidateById(currentUser?.id || '');

    return {
      stats: {
        activeJobs: 2,
        applicationsToday: 0,
        profileViews: Math.floor(Math.random() * 50),
        conversionRate: 0,
        savedJobs: candidate?.savedJobs.length || 0,
        newMessages: 0,
      },
      applications: (response.data?.recentApplications || []).map((app) => {
        const job = dataStore.getJobById(app.jobId);
        const employer = dataStore.getEmployerById(app.employerId);
        return {
          id: app.id,
          jobTitle: job?.title || '',
          company: employer?.profile.company || employer?.name || '',
          status: mapApplicationStatus(app.status),
          appliedDate: new Date(app.appliedAt).toISOString().split('T')[0],
          salary: job ? `EUR ${job.salary.min} - ${job.salary.max}` : '',
        } as CandidateApplication;
      }),
      savedJobs: (candidate?.savedJobs || []).map((jobId) => {
        const job = dataStore.getJobById(jobId);
        const employer = dataStore.getEmployerById(job?.employerId || '');
        return {
          id: jobId,
          title: job?.title || '',
          company: employer?.profile.company || employer?.name || '',
          salary: job ? `EUR ${job.salary.min} - ${job.salary.max}` : '',
          savedDate: new Date().toISOString().split('T')[0],
        } as SavedJob;
      }),
    };
  } catch (error) {
    return {
      stats: {
        activeJobs: 0,
        applicationsToday: 0,
        profileViews: 0,
        conversionRate: 0,
        savedJobs: 0,
        newMessages: 0,
      },
      applications: [],
      savedJobs: [],
    };
  }
}

export async function fetchCandidateSavedJobs() {
  try {
    const currentUser = dataStore.getCurrentUser();
    const candidate = dataStore.getCandidateById(currentUser?.id || '');

    return (candidate?.savedJobs || []).map((jobId) => {
      const job = dataStore.getJobById(jobId);
      const employer = dataStore.getEmployerById(job?.employerId || '');
      return {
        id: jobId,
        title: job?.title || '',
        company: employer?.profile.company || employer?.name || '',
        salary: job ? `EUR ${job.salary.min} - ${job.salary.max}` : '',
        savedDate: new Date().toISOString().split('T')[0],
      } as SavedJob;
    });
  } catch (error) {
    return [];
  }
}

export async function fetchEmployerApplications() {
  try {
    const response = await getApplications();
    return (response.data?.items || []).map((app) => {
      const candidate = dataStore.getCandidateById(app.candidateId);
      const job = dataStore.getJobById(app.jobId);
      return {
        id: app.id,
        candidateName: candidate?.name || '',
        jobTitle: job?.title || '',
        status: mapApplicationStatusForOldUI(app.status),
        appliedDate: new Date(app.appliedAt).toISOString().split('T')[0],
        coverLetter: '',
        experience: candidate?.profile.experience || '',
        email: candidate?.email || '',
        phone: '',
      };
    });
  } catch (error) {
    return [];
  }
}

export async function fetchEmployerApplicationById(id: string | number) {
  try {
    const application = dataStore.getApplicationById(String(id));
    if (!application) return null;

    const candidate = dataStore.getCandidateById(application.candidateId);
    const job = dataStore.getJobById(application.jobId);

    return {
      id: application.id,
      candidateName: candidate?.name || '',
      jobTitle: job?.title || '',
      status: mapApplicationStatusForOldUI(application.status),
      appliedDate: new Date(application.appliedAt).toISOString().split('T')[0],
      coverLetter: '',
      experience: candidate?.profile.experience || '',
      email: candidate?.email || '',
      phone: '',
    };
  } catch (error) {
    return null;
  }
}

export async function fetchCandidateMessages() {
  try {
    const currentUser = dataStore.getCurrentUser();
    const applications = dataStore.getApplicationsByCandidate(currentUser?.id || '');

    return applications.flatMap((app) => 
      app.messages.map((msg) => ({
        id: msg.id,
        from: msg.senderType === 'employer' ? 'Punëdhënës' : 'Kandidat',
        subject: 'Mesazh për aplikim',
        received: new Date(msg.sentAt).toISOString().split('T')[0],
      }))
    );
  } catch (error) {
    return [];
  }
}

export async function fetchCandidateMessageById(id: string | number) {
  try {
    const currentUser = dataStore.getCurrentUser();
    const applications = dataStore.getApplicationsByCandidate(currentUser?.id || '');

    for (const app of applications) {
      const msg = app.messages.find((m) => m.id === String(id));
      if (msg) {
        return {
          id: msg.id,
          from: msg.senderType === 'employer' ? 'Punëdhënës' : 'Kandidat',
          subject: 'Mesazh për aplikim',
          received: new Date(msg.sentAt).toISOString().split('T')[0],
          body: msg.content,
        };
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function fetchUserProfile(userId: string) {
  try {
    const currentUser = dataStore.getCurrentUser();
    if (currentUser?.type === 'employer') {
      const employer = dataStore.getEmployerById(currentUser.id);
      return {
        id: employer?.id,
        name: employer?.name,
        email: employer?.email,
        company: employer?.profile.company,
        bio: employer?.profile.description,
      };
    } else {
      const candidate = dataStore.getCandidateById(currentUser?.id || '');
      return {
        id: candidate?.id,
        name: candidate?.name,
        email: candidate?.email,
        bio: candidate?.profile.bio,
      };
    }
  } catch (error) {
    return {
      id: userId,
      name: 'Përdorues',
      email: 'user@example.com',
      bio: '',
    };
  }
}

// ============ Helper Functions ============

function mapApplicationStatus(status: string): 'pending' | 'interview' | 'rejected' | 'accepted' {
  const statusMap: Record<string, 'pending' | 'interview' | 'rejected' | 'accepted'> = {
    'applied': 'pending',
    'reviewing': 'interview',
    'accepted': 'accepted',
    'rejected': 'rejected',
  };
  return statusMap[status] || 'pending';
}

function mapApplicationStatusForOldUI(status: string): string {
  const statusMap: Record<string, string> = {
    'applied': 'Në pritje',
    'reviewing': 'Intervistë e planifikuar',
    'accepted': 'E pranuar',
    'rejected': 'E refuzuar',
  };
  return statusMap[status] || 'Në pritje';
}
