import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { User } from './types/api';

export type MarketplaceJobType = 'full-time' | 'part-time' | 'contract' | 'freelance';
export type MarketplaceApplicationStatus = 'new' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
}

export interface MarketplaceJob {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  salary: SalaryRange;
  type: MarketplaceJobType;
  category: string;
  experience: string;
  requirements: string[];
  employerId: string;
  createdAt: string;
  updatedAt: string;
  applicationsCount: number;
  savedCount: number;
  status: 'active' | 'paused';
  isDeleted?: boolean;
}

export interface MarketplaceApplication {
  id: string;
  jobId: string;
  employerId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  coverLetter: string;
  experience: string;
  status: MarketplaceApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SavedSearch {
  id: string;
  userId: string;
  label: string;
  query: string;
  location: string;
  type: string;
  category: string;
  experience: string;
  salaryMin: number | null;
  salaryMax: number | null;
  sort: JobSort;
  createdAt: string;
}

export type JobSort = 'newest' | 'salary-high' | 'salary-low';

export interface JobFilters {
  query: string;
  location: string;
  type: string;
  category: string;
  experience: string;
  salaryMin: number | null;
  salaryMax: number | null;
  sort: JobSort;
}

export type CreateMarketplaceJobInput = Omit<
  MarketplaceJob,
  'id' | 'createdAt' | 'updatedAt' | 'applicationsCount' | 'savedCount' | 'status'
> & { status?: MarketplaceJob['status'] };

export type UpdateMarketplaceJobInput = Partial<Omit<CreateMarketplaceJobInput, 'employerId'>>;

const jobsCollection = collection(db, 'marketplaceJobs');
const applicationsCollection = collection(db, 'marketplaceApplications');

export const defaultJobFilters: JobFilters = {
  query: '',
  location: 'Të gjitha',
  type: 'Të gjitha',
  category: 'Të gjitha',
  experience: 'Të gjitha',
  salaryMin: null,
  salaryMax: null,
  sort: 'newest',
};

export function formatSalary(salary: SalaryRange) {
  return `${salary.currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
}

export function filterAndSortJobs(jobs: MarketplaceJob[], filters: JobFilters) {
  const queryText = filters.query.trim().toLowerCase();

  const filtered = jobs.filter((job) => {
    const matchesQuery =
      !queryText ||
      job.title.toLowerCase().includes(queryText) ||
      job.company.toLowerCase().includes(queryText) ||
      job.description.toLowerCase().includes(queryText) ||
      job.requirements.some((item) => item.toLowerCase().includes(queryText));
    const matchesLocation = filters.location === 'Të gjitha' || job.location === filters.location;
    const matchesType = filters.type === 'Të gjitha' || job.type === filters.type;
    const matchesCategory = filters.category === 'Të gjitha' || job.category === filters.category;
    const matchesExperience = filters.experience === 'Të gjitha' || job.experience === filters.experience;
    const matchesSalaryMin = filters.salaryMin === null || job.salary.max >= filters.salaryMin;
    const matchesSalaryMax = filters.salaryMax === null || job.salary.min <= filters.salaryMax;

    return (
      matchesQuery &&
      matchesLocation &&
      matchesType &&
      matchesCategory &&
      matchesExperience &&
      matchesSalaryMin &&
      matchesSalaryMax &&
      job.status === 'active'
    );
  });

  return filtered.sort((a, b) => {
    if (filters.sort === 'salary-high') return b.salary.max - a.salary.max;
    if (filters.sort === 'salary-low') return a.salary.min - b.salary.min;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export async function listMarketplaceJobs() {
  const snapshot = await getDocs(query(jobsCollection, orderBy('createdAt', 'desc')));
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() } as MarketplaceJob))
    .filter((job) => !job.isDeleted);
}

export async function getMarketplaceJob(jobId: string) {
  const snapshot = await getDoc(doc(db, 'marketplaceJobs', jobId));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as MarketplaceJob;
}

export async function createMarketplaceJob(input: CreateMarketplaceJobInput, user: User) {
  if (user.type !== 'employer' || input.employerId !== user.id) {
    throw new Error('Nuk lejohet të krijoni këtë punë.');
  }

  const now = new Date().toISOString();
  const payload = {
    ...input,
    status: input.status || 'active',
    createdAt: now,
    updatedAt: now,
    applicationsCount: 0,
    savedCount: 0,
  } satisfies Omit<MarketplaceJob, 'id'>;
  const ref = await addDoc(jobsCollection, payload);
  return { id: ref.id, ...payload };
}

export async function updateMarketplaceJob(jobId: string, input: UpdateMarketplaceJobInput, user: User) {
  const existing = await getMarketplaceJob(jobId);
  if (!existing) throw new Error('Puna nuk u gjet.');
  if (user.type !== 'employer' || existing.employerId !== user.id) {
    throw new Error('Nuk lejohet të ndryshoni këtë punë.');
  }

  await updateDoc(doc(db, 'marketplaceJobs', jobId), {
    ...input,
    updatedAt: new Date().toISOString(),
  });
  return { ...existing, ...input, updatedAt: new Date().toISOString() };
}

export async function deleteMarketplaceJob(jobId: string, user: User) {
  const existing = await getMarketplaceJob(jobId);
  if (!existing) throw new Error('Puna nuk u gjet.');
  if (user.type !== 'employer' || existing.employerId !== user.id) {
    throw new Error('Nuk lejohet ta fshini këtë punë.');
  }

  await updateDoc(doc(db, 'marketplaceJobs', jobId), {
    isDeleted: true,
    updatedAt: new Date().toISOString(),
  });
}

export async function applyToMarketplaceJob(input: {
  jobId: string;
  coverLetter: string;
  experience: string;
}, user: User) {
  if (user.type !== 'candidate') throw new Error('Duhet të jeni kandidat për të aplikuar.');
  const job = await getMarketplaceJob(input.jobId);
  if (!job) throw new Error('Puna nuk u gjet.');

  const duplicate = await getDocs(
    query(
      applicationsCollection,
      where('jobId', '==', input.jobId),
      where('candidateId', '==', user.id)
    )
  );
  if (!duplicate.empty) throw new Error('Keni aplikuar tashmë për këtë punë.');

  const now = new Date().toISOString();
  const payload: Omit<MarketplaceApplication, 'id'> = {
    jobId: input.jobId,
    employerId: job.employerId,
    candidateId: user.id,
    candidateName: user.name,
    candidateEmail: user.email,
    coverLetter: input.coverLetter,
    experience: input.experience,
    status: 'new',
    createdAt: now,
    updatedAt: now,
  };
  const ref = await addDoc(applicationsCollection, payload);
  await updateDoc(doc(db, 'marketplaceJobs', input.jobId), { applicationsCount: increment(1) });
  return { id: ref.id, ...payload };
}

export async function listApplicationsForEmployer(user: User) {
  if (user.type !== 'employer') throw new Error('Duhet të jeni punëdhënës.');
  const snapshot = await getDocs(
    query(applicationsCollection, where('employerId', '==', user.id), orderBy('createdAt', 'desc'))
  );
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as MarketplaceApplication));
}

export async function getApplicationForEmployer(applicationId: string, user: User) {
  if (user.type !== 'employer') throw new Error('Duhet të jeni punëdhënës.');
  const snapshot = await getDoc(doc(db, 'marketplaceApplications', applicationId));
  if (!snapshot.exists()) return null;
  const application = { id: snapshot.id, ...snapshot.data() } as MarketplaceApplication;
  if (application.employerId !== user.id) throw new Error('Nuk lejohet të lexoni këtë aplikim.');
  return application;
}

export async function listApplicationsForCandidate(user: User) {
  if (user.type !== 'candidate') throw new Error('Duhet të jeni kandidat.');
  const snapshot = await getDocs(
    query(applicationsCollection, where('candidateId', '==', user.id), orderBy('createdAt', 'desc'))
  );
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as MarketplaceApplication));
}

export async function updateMarketplaceApplicationStatus(
  applicationId: string,
  status: MarketplaceApplicationStatus,
  user: User
) {
  if (user.type !== 'employer') throw new Error('Duhet të jeni punëdhënës.');
  const ref = doc(db, 'marketplaceApplications', applicationId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) throw new Error('Aplikimi nuk u gjet.');
  const application = { id: snapshot.id, ...snapshot.data() } as MarketplaceApplication;
  if (application.employerId !== user.id) throw new Error('Nuk lejohet të ndryshoni këtë aplikim.');

  await updateDoc(ref, { status, updatedAt: new Date().toISOString() });
  return { ...application, status, updatedAt: new Date().toISOString() };
}

export async function setSavedJob(jobId: string, isSaved: boolean, user: User) {
  if (user.type !== 'candidate') throw new Error('Duhet të jeni kandidat.');
  const ref = doc(db, `users/${user.id}/savedJobs/${jobId}`);
  if (isSaved) {
    await setDoc(ref, { jobId, userId: user.id, createdAt: new Date().toISOString() });
    await updateDoc(doc(db, 'marketplaceJobs', jobId), { savedCount: increment(1) });
    return;
  }
  await deleteDoc(ref);
  await updateDoc(doc(db, 'marketplaceJobs', jobId), { savedCount: increment(-1) });
}

export async function listSavedJobIds(user: User) {
  if (user.type !== 'candidate') return [];
  const snapshot = await getDocs(collection(db, `users/${user.id}/savedJobs`));
  return snapshot.docs.map((item) => item.id);
}

export async function listSavedSearches(user: User) {
  if (user.type !== 'candidate') return [];
  const snapshot = await getDocs(query(collection(db, `users/${user.id}/savedSearches`), orderBy('createdAt', 'desc')));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as SavedSearch));
}

export async function saveSearch(input: Omit<SavedSearch, 'id' | 'userId' | 'createdAt'>, user: User) {
  if (user.type !== 'candidate') throw new Error('Duhet të jeni kandidat.');
  const payload = { ...input, userId: user.id, createdAt: new Date().toISOString() };
  const ref = await addDoc(collection(db, `users/${user.id}/savedSearches`), payload);
  return { id: ref.id, ...payload };
}

export async function deleteSavedSearch(searchId: string, user: User) {
  if (user.type !== 'candidate') throw new Error('Duhet të jeni kandidat.');
  await deleteDoc(doc(db, `users/${user.id}/savedSearches/${searchId}`));
}
