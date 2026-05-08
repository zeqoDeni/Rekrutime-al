import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((db: unknown, col: string, id: string) => `${col}/${id}`),
  updateDoc: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('./firebase', () => ({ db: 'mock-db' }));

import { updateUserName } from './userProfile';
import { doc, updateDoc } from 'firebase/firestore';

describe('updateUserName', () => {
  beforeEach(() => vi.clearAllMocks());

  it('writes the new name to users/{uid} in Firestore', async () => {
    await updateUserName('uid-123', 'Arben Hoxha');
    expect(vi.mocked(doc)).toHaveBeenCalledWith('mock-db', 'users', 'uid-123');
    expect(vi.mocked(updateDoc)).toHaveBeenCalledWith('users/uid-123', { name: 'Arben Hoxha' });
  });

  it('propagates Firestore errors to the caller', async () => {
    vi.mocked(updateDoc).mockRejectedValueOnce(new Error('permission-denied'));
    await expect(updateUserName('uid-123', 'Test')).rejects.toThrow('permission-denied');
  });
});
