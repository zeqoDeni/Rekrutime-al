import { addDoc, collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "./firebase";

export interface JobRecord {
  id: string;
  title: string;
  description: string;
  location: string;
  salary?: string;
  employerId: string;
  createdAt?: string;
}

export type CreateJobInput = Omit<JobRecord, "id">;

export async function createJob(job: CreateJobInput): Promise<JobRecord> {
  const docRef = await addDoc(collection(db, "jobs"), {
    ...job,
    createdAt: job.createdAt || new Date().toISOString(),
  });

  return { id: docRef.id, ...job };
}

export async function getJobs(): Promise<JobRecord[]> {
  const jobsQuery = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(jobsQuery);

  return snapshot.docs.map((jobDoc) => ({
    id: jobDoc.id,
    ...(jobDoc.data() as Omit<JobRecord, "id">),
  }));
}
