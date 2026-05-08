import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { User } from './types/api';
import type { MarketplaceApplication, MarketplaceJob } from './marketplace';

export interface ActivityLogEntry {
  id: string;
  type: string;
  actorUid: string;
  actorName: string;
  entityId: string;
  entityType: 'job' | 'application' | 'user';
  details?: string;
  timestamp: string;
}

export function assertAdmin(user: User): void {
  if (user.type !== 'admin') throw new Error('Duhet të jeni administrator.');
}

export async function listAllUsers(user: User): Promise<User[]> {
  assertAdmin(user);
  const snapshot = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as User));
}

export async function setUserDisabled(targetUid: string, isDisabled: boolean, user: User): Promise<void> {
  assertAdmin(user);
  await updateDoc(doc(db, 'users', targetUid), { isDisabled });
}

export async function setUserRole(
  targetUid: string,
  type: 'candidate' | 'employer' | 'admin',
  user: User
): Promise<void> {
  assertAdmin(user);
  await updateDoc(doc(db, 'users', targetUid), { type });
}

export async function listAllApplicationsForAdmin(user: User): Promise<MarketplaceApplication[]> {
  assertAdmin(user);
  const snapshot = await getDocs(
    query(collection(db, 'marketplaceApplications'), orderBy('createdAt', 'desc'))
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as MarketplaceApplication));
}

export async function listAllJobsForAdmin(user: User): Promise<MarketplaceJob[]> {
  assertAdmin(user);
  const snapshot = await getDocs(
    query(collection(db, 'marketplaceJobs'), orderBy('createdAt', 'desc'))
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as MarketplaceJob));
}

export async function adminSetJobStatus(
  jobId: string,
  action: 'active' | 'paused' | 'delete' | 'restore',
  user: User
): Promise<void> {
  assertAdmin(user);
  const now = new Date().toISOString();
  if (action === 'delete') {
    await updateDoc(doc(db, 'marketplaceJobs', jobId), { isDeleted: true, updatedAt: now });
  } else if (action === 'restore') {
    await updateDoc(doc(db, 'marketplaceJobs', jobId), { isDeleted: false, status: 'active', updatedAt: now });
  } else {
    await updateDoc(doc(db, 'marketplaceJobs', jobId), { status: action, isDeleted: false, updatedAt: now });
  }
}

export async function logActivity(
  entry: Omit<ActivityLogEntry, 'id' | 'timestamp' | 'actorName'>,
  actorUser: User
): Promise<void> {
  try {
    await addDoc(collection(db, 'activityLog'), {
      ...entry,
      actorName: actorUser.name,
      timestamp: new Date().toISOString(),
    });
  } catch {
    // fire-and-forget
  }
}

export async function listRecentActivity(user: User, count = 20): Promise<ActivityLogEntry[]> {
  assertAdmin(user);
  const snapshot = await getDocs(
    query(collection(db, 'activityLog'), orderBy('timestamp', 'desc'), limit(count))
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ActivityLogEntry));
}
