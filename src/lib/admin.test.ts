import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { User } from './types/api';

vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn().mockResolvedValue({ id: 'log-1' }),
  collection: vi.fn(() => 'mock-collection'),
  doc: vi.fn(() => 'mock-doc-ref'),
  getDocs: vi.fn(),
  limit: vi.fn(),
  orderBy: vi.fn(),
  query: vi.fn(),
  updateDoc: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('./firebase', () => ({ db: 'mock-db' }));

import { assertAdmin, listAllUsers, setUserDisabled, adminSetJobStatus } from './admin';
import { getDocs, updateDoc } from 'firebase/firestore';

const adminUser: User = {
  id: 'admin-1',
  email: 'admin@test.com',
  name: 'Admin',
  type: 'admin',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const candidateUser: User = {
  id: 'cand-1',
  email: 'c@test.com',
  name: 'Candidate',
  type: 'candidate',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const employerUser: User = {
  id: 'emp-1',
  email: 'e@test.com',
  name: 'Employer',
  type: 'employer',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const mockUserDocs = [
  { id: 'u-1', data: () => ({ name: 'Alice', type: 'candidate', email: 'alice@test.com', createdAt: '2026-01-01T00:00:00.000Z' }) },
  { id: 'u-2', data: () => ({ name: 'Bob', type: 'employer', email: 'bob@test.com', createdAt: '2026-01-01T00:00:00.000Z' }) },
];

describe('assertAdmin', () => {
  it('does not throw for admin users', () => {
    expect(() => assertAdmin(adminUser)).not.toThrow();
  });

  it('throws for candidate users', () => {
    expect(() => assertAdmin(candidateUser)).toThrow('Duhet të jeni administrator.');
  });

  it('throws for employer users', () => {
    expect(() => assertAdmin(employerUser)).toThrow('Duhet të jeni administrator.');
  });
});

describe('listAllUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDocs).mockResolvedValue({
      docs: mockUserDocs,
    } as ReturnType<typeof getDocs> extends Promise<infer T> ? T : never);
  });

  it('throws for non-admin callers', async () => {
    await expect(listAllUsers(candidateUser)).rejects.toThrow('Duhet të jeni administrator.');
  });

  it('returns all users for admin', async () => {
    const result = await listAllUsers(adminUser);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('u-1');
    expect(result[1].id).toBe('u-2');
  });
});

describe('setUserDisabled', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(updateDoc).mockResolvedValue(undefined);
  });

  it('throws for non-admin callers', async () => {
    await expect(setUserDisabled('u-1', true, employerUser)).rejects.toThrow('Duhet të jeni administrator.');
  });

  it('calls updateDoc with isDisabled flag for admin', async () => {
    await setUserDisabled('u-1', true, adminUser);
    expect(vi.mocked(updateDoc)).toHaveBeenCalledWith('mock-doc-ref', { isDisabled: true });
  });
});

describe('adminSetJobStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(updateDoc).mockResolvedValue(undefined);
  });

  it('throws for non-admin callers', async () => {
    await expect(adminSetJobStatus('job-1', 'delete', candidateUser)).rejects.toThrow('Duhet të jeni administrator.');
  });

  it('soft-deletes a job for admin', async () => {
    await adminSetJobStatus('job-1', 'delete', adminUser);
    expect(vi.mocked(updateDoc)).toHaveBeenCalledWith(
      'mock-doc-ref',
      expect.objectContaining({ isDeleted: true })
    );
  });

  it('restores a deleted job for admin', async () => {
    await adminSetJobStatus('job-1', 'restore', adminUser);
    expect(vi.mocked(updateDoc)).toHaveBeenCalledWith(
      'mock-doc-ref',
      expect.objectContaining({ isDeleted: false, status: 'active' })
    );
  });

  it('pauses an active job for admin', async () => {
    await adminSetJobStatus('job-1', 'paused', adminUser);
    expect(vi.mocked(updateDoc)).toHaveBeenCalledWith(
      'mock-doc-ref',
      expect.objectContaining({ status: 'paused', isDeleted: false })
    );
  });
});
