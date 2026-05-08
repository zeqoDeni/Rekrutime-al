// LocalStorage wrapper for data persistence
import {
  User,
  Candidate,
  Employer,
  Job,
  Application,
  Message,
  AuthToken,
  CandidateAnalytics,
  EmployerAnalytics,
} from '../types/api';

// Storage keys
const STORAGE_PREFIX = 'rekrutime_';
const KEYS = {
  CURRENT_USER: `${STORAGE_PREFIX}current_user`,
  CURRENT_TOKEN: `${STORAGE_PREFIX}current_token`,
  CANDIDATES: `${STORAGE_PREFIX}candidates`,
  EMPLOYERS: `${STORAGE_PREFIX}employers`,
  JOBS: `${STORAGE_PREFIX}jobs`,
  APPLICATIONS: `${STORAGE_PREFIX}applications`,
  MESSAGES: `${STORAGE_PREFIX}messages`,
  ANALYTICS_CACHE: `${STORAGE_PREFIX}analytics_cache`,
  SYNC_TIMESTAMP: `${STORAGE_PREFIX}sync_timestamp`,
};

/**
 * Generic storage utility
 */
class StorageManager {
  private static instance: StorageManager;

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : defaultValue || null;
    } catch (error) {
      console.error(`Error reading from storage: ${key}`, error);
      return defaultValue || null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to storage: ${key}`, error);
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from storage: ${key}`, error);
    }
  }

  clear(): void {
    try {
      Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing storage', error);
    }
  }

  getAllKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        keys.push(key);
      }
    }
    return keys;
  }
}

/**
 * Data store for managing all application data
 */
export class DataStore {
  private storage = StorageManager.getInstance();

  // ============ Authentication ============

  getCurrentUser(): User | null {
    return this.storage.get<User>(KEYS.CURRENT_USER);
  }

  setCurrentUser(user: User | null): void {
    if (user) {
      this.storage.set(KEYS.CURRENT_USER, user);
    } else {
      this.storage.remove(KEYS.CURRENT_USER);
    }
  }

  getCurrentToken(): AuthToken | null {
    return this.storage.get<AuthToken>(KEYS.CURRENT_TOKEN);
  }

  setCurrentToken(token: AuthToken | null): void {
    if (token) {
      this.storage.set(KEYS.CURRENT_TOKEN, token);
    } else {
      this.storage.remove(KEYS.CURRENT_TOKEN);
    }
  }

  isTokenExpired(): boolean {
    const token = this.getCurrentToken();
    if (!token) return true;
    return new Date(token.expiresAt) < new Date();
  }

  logout(): void {
    this.setCurrentUser(null);
    this.setCurrentToken(null);
  }

  // ============ Candidates ============

  getAllCandidates(): Candidate[] {
    return this.storage.get<Candidate[]>(KEYS.CANDIDATES, []) || [];
  }

  getCandidateById(id: string): Candidate | null {
    const candidates = this.getAllCandidates();
    return candidates.find((c) => c.id === id) || null;
  }

  saveCandidates(candidates: Candidate[]): void {
    this.storage.set(KEYS.CANDIDATES, candidates);
  }

  saveCandidateProfile(candidateId: string, profile: any): void {
    const candidates = this.getAllCandidates();
    const candidate = candidates.find((c) => c.id === candidateId);
    if (candidate) {
      candidate.profile = { ...candidate.profile, ...profile };
      this.saveCandidates(candidates);
    }
  }

  addSavedJob(candidateId: string, jobId: string): void {
    const candidates = this.getAllCandidates();
    const candidate = candidates.find((c) => c.id === candidateId);
    if (candidate && !candidate.savedJobs.includes(jobId)) {
      candidate.savedJobs.push(jobId);
      this.saveCandidates(candidates);
    }
  }

  removeSavedJob(candidateId: string, jobId: string): void {
    const candidates = this.getAllCandidates();
    const candidate = candidates.find((c) => c.id === candidateId);
    if (candidate) {
      candidate.savedJobs = candidate.savedJobs.filter((id) => id !== jobId);
      this.saveCandidates(candidates);
    }
  }

  isSavedJob(candidateId: string, jobId: string): boolean {
    const candidate = this.getCandidateById(candidateId);
    return candidate?.savedJobs.includes(jobId) || false;
  }

  // ============ Employers ============

  getAllEmployers(): Employer[] {
    return this.storage.get<Employer[]>(KEYS.EMPLOYERS, []) || [];
  }

  getEmployerById(id: string): Employer | null {
    const employers = this.getAllEmployers();
    return employers.find((e) => e.id === id) || null;
  }

  saveEmployers(employers: Employer[]): void {
    this.storage.set(KEYS.EMPLOYERS, employers);
  }

  saveEmployerProfile(employerId: string, profile: any): void {
    const employers = this.getAllEmployers();
    const employer = employers.find((e) => e.id === employerId);
    if (employer) {
      employer.profile = { ...employer.profile, ...profile };
      this.saveEmployers(employers);
    }
  }

  // ============ Jobs ============

  getAllJobs(): Job[] {
    return this.storage.get<Job[]>(KEYS.JOBS, []) || [];
  }

  getJobById(id: string): Job | null {
    const jobs = this.getAllJobs();
    return jobs.find((j) => j.id === id) || null;
  }

  getJobsByEmployer(employerId: string): Job[] {
    const jobs = this.getAllJobs();
    return jobs.filter((j) => j.employerId === employerId);
  }

  saveJob(job: Job): void {
    const jobs = this.getAllJobs();
    const existingIndex = jobs.findIndex((j) => j.id === job.id);
    if (existingIndex >= 0) {
      jobs[existingIndex] = job;
    } else {
      jobs.push(job);
    }
    this.storage.set(KEYS.JOBS, jobs);
  }

  saveJobs(jobs: Job[]): void {
    this.storage.set(KEYS.JOBS, jobs);
  }

  deleteJob(id: string): void {
    const jobs = this.getAllJobs();
    this.storage.set(
      KEYS.JOBS,
      jobs.filter((j) => j.id !== id)
    );
  }

  // ============ Applications ============

  getAllApplications(): Application[] {
    return this.storage.get<Application[]>(KEYS.APPLICATIONS, []) || [];
  }

  getApplicationById(id: string): Application | null {
    const applications = this.getAllApplications();
    return applications.find((a) => a.id === id) || null;
  }

  getApplicationsByCandidate(candidateId: string): Application[] {
    const applications = this.getAllApplications();
    return applications.filter((a) => a.candidateId === candidateId);
  }

  getApplicationsByEmployer(employerId: string): Application[] {
    const applications = this.getAllApplications();
    return applications.filter((a) => a.employerId === employerId);
  }

  getApplicationsByJob(jobId: string): Application[] {
    const applications = this.getAllApplications();
    return applications.filter((a) => a.jobId === jobId);
  }

  saveApplication(application: Application): void {
    const applications = this.getAllApplications();
    const existingIndex = applications.findIndex((a) => a.id === application.id);
    if (existingIndex >= 0) {
      applications[existingIndex] = application;
    } else {
      applications.push(application);
    }
    this.storage.set(KEYS.APPLICATIONS, applications);
  }

  saveApplications(applications: Application[]): void {
    this.storage.set(KEYS.APPLICATIONS, applications);
  }

  applicationExists(jobId: string, candidateId: string): boolean {
    const applications = this.getAllApplications();
    return applications.some(
      (a) => a.jobId === jobId && a.candidateId === candidateId
    );
  }

  // ============ Messages ============

  getMessagesByApplication(applicationId: string): Message[] {
    const applications = this.getAllApplications();
    const app = applications.find((a) => a.id === applicationId);
    return app?.messages || [];
  }

  addMessageToApplication(applicationId: string, message: Message): void {
    const applications = this.getAllApplications();
    const app = applications.find((a) => a.id === applicationId);
    if (app) {
      app.messages.push(message);
      this.saveApplication(app);
    }
  }

  // ============ Analytics ============

  getCandidateAnalytics(candidateId: string): CandidateAnalytics {
    const applications = this.getApplicationsByCandidate(candidateId);
    const candidate = this.getCandidateById(candidateId);

    const accepted = applications.filter((a) => a.status === 'accepted').length;
    const rejected = applications.filter((a) => a.status === 'rejected').length;
    const pending = applications.filter((a) => a.status === 'applied').length;
    const reviewing = applications.filter((a) => a.status === 'reviewing').length;

    return {
      totalApplications: applications.length,
      acceptedApplications: accepted,
      rejectedApplications: rejected,
      pendingApplications: pending + reviewing,
      savedJobs: candidate?.savedJobs.length || 0,
      applicationRate:
        (candidate?.savedJobs.length || 0) > 0
          ? applications.length / (candidate?.savedJobs.length || 1)
          : 0,
      averageTimeToResponse: 24, // Mock value
    };
  }

  getEmployerAnalytics(employerId: string): EmployerAnalytics {
    const jobs = this.getJobsByEmployer(employerId);
    const applications = this.getApplicationsByEmployer(employerId);

    const accepted = applications.filter((a) => a.status === 'accepted').length;
    const rejected = applications.filter((a) => a.status === 'rejected').length;

    return {
      totalJobs: jobs.length,
      activeJobs: jobs.length,
      totalApplications: applications.length,
      acceptedApplications: accepted,
      rejectedApplications: rejected,
      averageApplicationsPerJob:
        jobs.length > 0 ? applications.length / jobs.length : 0,
      profileViews: Math.floor(Math.random() * 500), // Mock value
      averageTimeToHire: 48, // Mock value
    };
  }

  // ============ Utility ============

  exportData(): string {
    const data = {
      currentUser: this.getCurrentUser(),
      candidates: this.getAllCandidates(),
      employers: this.getAllEmployers(),
      jobs: this.getAllJobs(),
      applications: this.getAllApplications(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      this.saveCandidates(data.candidates || []);
      this.saveEmployers(data.employers || []);
      this.saveJobs(data.jobs || []);
      this.saveApplications(data.applications || []);
      if (data.currentUser) {
        this.setCurrentUser(data.currentUser);
      }
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  clearAllData(): void {
    this.storage.clear();
  }

  getStorageSize(): number {
    let total = 0;
    for (const key of this.storage.getAllKeys()) {
      const value = localStorage.getItem(key);
      total += value?.length || 0;
    }
    return total;
  }
}

// Export singleton instance
export const dataStore = new DataStore();
