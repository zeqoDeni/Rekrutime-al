import { JobRequisition } from "../types/ats";
import { createRecord, getRecord, listRecords, removeRecord, updateRecord } from "./base";

export function listJobs(orgId: string) {
  return listRecords<JobRequisition>(orgId, "jobs");
}

export async function createJob(orgId: string, payload: Omit<JobRequisition, "id">) {
  const docRef = await createRecord(orgId, "jobs", payload);
  return docRef.id;
}

export function getJob(orgId: string, jobId: string) {
  return getRecord<JobRequisition>(orgId, "jobs", jobId);
}

export function updateJob(orgId: string, jobId: string, payload: Partial<JobRequisition>) {
  return updateRecord(orgId, "jobs", jobId, payload as Record<string, unknown>);
}

export function deleteJob(orgId: string, jobId: string) {
  return removeRecord(orgId, "jobs", jobId);
}
