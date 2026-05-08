import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export interface ApplicationRecord {
  id: string;
  jobId: string;
  candidateId: string;
  employerId: string;
  status: "applied" | "reviewing" | "accepted" | "rejected";
  createdAt?: string;
}

export type ApplyToJobInput = Omit<ApplicationRecord, "id">;

export async function applyToJob(data: ApplyToJobInput): Promise<ApplicationRecord> {
  const docRef = await addDoc(collection(db, "applications"), {
    ...data,
    createdAt: data.createdAt || new Date().toISOString(),
  });

  return { id: docRef.id, ...data };
}

export async function getApplicationsByUser(
  userId: string
): Promise<ApplicationRecord[]> {
  const appsQuery = query(
    collection(db, "applications"),
    where("candidateId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(appsQuery);

  return snapshot.docs.map((appDoc) => ({
    id: appDoc.id,
    ...(appDoc.data() as Omit<ApplicationRecord, "id">),
  }));
}
