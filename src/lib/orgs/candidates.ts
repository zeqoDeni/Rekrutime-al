import { CandidateProfile, CrmStatus } from "../types/ats";
import { createRecord, getRecord, listRecords, updateRecord } from "./base";

export function listCandidates(orgId: string) {
  return listRecords<CandidateProfile>(orgId, "candidates").then((list) =>
    list.filter((c) => !c.isDeleted)
  );
}

export async function createCandidate(orgId: string, payload: Omit<CandidateProfile, "id">) {
  const docRef = await createRecord(orgId, "candidates", payload);
  return docRef.id;
}

export function getCandidate(orgId: string, candidateId: string) {
  return getRecord<CandidateProfile>(orgId, "candidates", candidateId);
}

export function updateCandidate(
  orgId: string,
  candidateId: string,
  payload: Partial<CandidateProfile>
) {
  return updateRecord(orgId, "candidates", candidateId, {
    ...payload,
    updatedAt: new Date().toISOString(),
  } as Record<string, unknown>);
}

export function updateCrmStatus(orgId: string, candidateId: string, crmStatus: CrmStatus) {
  return updateRecord(orgId, "candidates", candidateId, {
    crmStatus,
    updatedAt: new Date().toISOString(),
  });
}

export function reassignCandidate(orgId: string, candidateId: string, assignedTo: string) {
  return updateRecord(orgId, "candidates", candidateId, {
    assignedTo,
    updatedAt: new Date().toISOString(),
  });
}

export function softDeleteCandidate(orgId: string, candidateId: string) {
  return updateRecord(orgId, "candidates", candidateId, {
    isDeleted: true,
    updatedAt: new Date().toISOString(),
  });
}
