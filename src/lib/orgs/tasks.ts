import { TaskRecord } from "../types/ats";
import { createRecord, listRecords, updateRecord } from "./base";

export function listTasks(orgId: string) {
  return listRecords<TaskRecord>(orgId, "tasks");
}

export async function createTask(orgId: string, payload: Omit<TaskRecord, "id">) {
  const docRef = await createRecord(orgId, "tasks", payload);
  return docRef.id;
}

export function updateTask(orgId: string, taskId: string, payload: Partial<TaskRecord>) {
  return updateRecord(orgId, "tasks", taskId, payload as Record<string, unknown>);
}
