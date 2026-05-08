import { ActivityRecord } from "../types/ats";
import { createRecord, listRecords } from "./base";

export function listActivities(orgId: string) {
  return listRecords<ActivityRecord>(orgId, "activities");
}

export async function createActivity(orgId: string, payload: Omit<ActivityRecord, "id">) {
  const docRef = await createRecord(orgId, "activities", payload);
  return docRef.id;
}
