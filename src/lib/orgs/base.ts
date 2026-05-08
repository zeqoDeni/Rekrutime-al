import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export function orgCollection(orgId: string, collectionName: string) {
  return collection(db, `orgs/${orgId}/${collectionName}`);
}

export async function listRecords<T>(orgId: string, collectionName: string): Promise<T[]> {
  const q = query(orgCollection(orgId, collectionName), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as T));
}

export async function createRecord<T extends Record<string, unknown>>(
  orgId: string,
  collectionName: string,
  payload: T
) {
  return addDoc(orgCollection(orgId, collectionName), payload);
}

export async function setRecord(
  orgId: string,
  collectionName: string,
  id: string,
  payload: Record<string, unknown>
) {
  return setDoc(doc(db, `orgs/${orgId}/${collectionName}/${id}`), payload, { merge: true });
}

export async function updateRecord(
  orgId: string,
  collectionName: string,
  id: string,
  payload: Record<string, unknown>
) {
  return updateDoc(doc(db, `orgs/${orgId}/${collectionName}/${id}`), payload);
}

export async function removeRecord(orgId: string, collectionName: string, id: string) {
  return deleteDoc(doc(db, `orgs/${orgId}/${collectionName}/${id}`));
}

export async function getRecord<T>(orgId: string, collectionName: string, id: string) {
  const snap = await getDoc(doc(db, `orgs/${orgId}/${collectionName}/${id}`));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as T;
}
