import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { User } from './types/api';

vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(),
  collection: vi.fn(() => 'mock-collection'),
  deleteDoc: vi.fn(),
  doc: vi.fn(() => 'mock-doc-ref'),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  increment: vi.fn((n: number) => ({ _increment: n })),
  orderBy: vi.fn(),
  query: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn().mockResolvedValue(undefined),
  where: vi.fn(),
}));

vi.mock('./firebase', () => ({ db: 'mock-db' }));

import { applyToMarketplaceJob, updateMarketplaceApplicationStatus } from './marketplace';
import { addDoc, getDoc, getDocs, updateDoc } from 'firebase/firestore';

const candidateUser: User = {
  id: 'cand-1',
  email: 'c@test.com',
  name: 'Candidate',
  type: 'candidate',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const employerOwner: User = {
  id: 'emp-1',
  email: 'owner@test.com',
  name: 'Owner Employer',
  type: 'employer',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const otherEmployer: User = {
  id: 'emp-2',
  email: 'other@test.com',
  name: 'Other Employer',
  type: 'employer',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const mockAppData = {
  jobId: 'job-1',
  employerId: 'emp-1',
  candidateId: 'cand-1',
  candidateName: 'Candidate',
  candidateEmail: 'c@test.com',
  coverLetter: '',
  experience: '',
  status: 'new' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const mockJobData = {
  id: 'job-1',
  title: 'Developer',
  company: 'ACME',
  description: 'desc',
  location: 'Tiranë',
  salary: { min: 1000, max: 2000, currency: 'EUR' },
  type: 'full-time' as const,
  category: 'IT',
  experience: 'Mid',
  requirements: [],
  employerId: 'emp-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  applicationsCount: 0,
  savedCount: 0,
  status: 'active' as const,
};

describe('updateMarketplaceApplicationStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      id: 'app-1',
      data: () => mockAppData,
    } as ReturnType<typeof getDoc> extends Promise<infer T> ? T : never);
    vi.mocked(updateDoc).mockResolvedValue(undefined);
  });

  it('throws when the caller is not an employer', async () => {
    await expect(
      updateMarketplaceApplicationStatus('app-1', 'reviewed', candidateUser)
    ).rejects.toThrow('Duhet të jeni punëdhënës');
  });

  it('throws when employer does not own the application', async () => {
    await expect(
      updateMarketplaceApplicationStatus('app-1', 'reviewed', otherEmployer)
    ).rejects.toThrow('Nuk lejohet');
  });

  it('calls updateDoc with the new status for the owning employer', async () => {
    await updateMarketplaceApplicationStatus('app-1', 'shortlisted', employerOwner);
    expect(vi.mocked(updateDoc)).toHaveBeenCalledWith(
      'mock-doc-ref',
      expect.objectContaining({ status: 'shortlisted' })
    );
  });

  it('returns the application with the updated status', async () => {
    const result = await updateMarketplaceApplicationStatus('app-1', 'hired', employerOwner);
    expect(result.status).toBe('hired');
    expect(result.id).toBe('app-1');
  });
});

describe('applyToMarketplaceJob', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // getDoc returns the job document
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      id: 'job-1',
      data: () => mockJobData,
    } as ReturnType<typeof getDoc> extends Promise<infer T> ? T : never);
    // getDocs returns empty (no duplicate application)
    vi.mocked(getDocs).mockResolvedValue({
      empty: true,
      docs: [],
    } as unknown as ReturnType<typeof getDocs> extends Promise<infer T> ? T : never);
    vi.mocked(addDoc).mockResolvedValue({ id: 'new-app-1' } as ReturnType<typeof addDoc> extends Promise<infer T> ? T : never);
    vi.mocked(updateDoc).mockResolvedValue(undefined);
  });

  it('throws for non-candidate callers', async () => {
    await expect(
      applyToMarketplaceJob({ jobId: 'job-1', coverLetter: '', experience: '' }, employerOwner)
    ).rejects.toThrow('Duhet të jeni kandidat');
  });

  it('throws when the job does not exist', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => false,
      id: 'job-1',
      data: () => null,
    } as ReturnType<typeof getDoc> extends Promise<infer T> ? T : never);
    await expect(
      applyToMarketplaceJob({ jobId: 'job-1', coverLetter: '', experience: '' }, candidateUser)
    ).rejects.toThrow('Puna nuk u gjet');
  });

  it('throws when a duplicate application exists', async () => {
    vi.mocked(getDocs).mockResolvedValue({
      empty: false,
      docs: [{ id: 'existing-app' }],
    } as unknown as ReturnType<typeof getDocs> extends Promise<infer T> ? T : never);
    await expect(
      applyToMarketplaceJob({ jobId: 'job-1', coverLetter: '', experience: '' }, candidateUser)
    ).rejects.toThrow('Keni aplikuar tashmë');
  });

  it('creates an application document with correct fields', async () => {
    const result = await applyToMarketplaceJob(
      { jobId: 'job-1', coverLetter: 'Cover text', experience: 'Exp text' },
      candidateUser
    );
    expect(vi.mocked(addDoc)).toHaveBeenCalledWith(
      'mock-collection',
      expect.objectContaining({
        jobId: 'job-1',
        employerId: 'emp-1',
        candidateId: 'cand-1',
        candidateName: 'Candidate',
        candidateEmail: 'c@test.com',
        coverLetter: 'Cover text',
        experience: 'Exp text',
        status: 'new',
      })
    );
    expect(result.id).toBe('new-app-1');
    expect(result.status).toBe('new');
    expect(result.employerId).toBe('emp-1');
  });

  it('increments the job applicationsCount after applying', async () => {
    await applyToMarketplaceJob(
      { jobId: 'job-1', coverLetter: '', experience: '' },
      candidateUser
    );
    expect(vi.mocked(updateDoc)).toHaveBeenCalledWith(
      'mock-doc-ref',
      expect.objectContaining({ applicationsCount: { _increment: 1 } })
    );
  });
});
