import { ClientCompany } from "../types/ats";
import { createRecord, getRecord, listRecords, removeRecord, updateRecord } from "./base";

export function listClients(orgId: string) {
  return listRecords<ClientCompany>(orgId, "clients");
}

export async function createClient(orgId: string, payload: Omit<ClientCompany, "id">) {
  const docRef = await createRecord(orgId, "clients", payload);
  return docRef.id;
}

export function getClient(orgId: string, clientId: string) {
  return getRecord<ClientCompany>(orgId, "clients", clientId);
}

export function updateClient(orgId: string, clientId: string, payload: Partial<ClientCompany>) {
  return updateRecord(orgId, "clients", clientId, payload as Record<string, unknown>);
}

export function deleteClient(orgId: string, clientId: string) {
  return removeRecord(orgId, "clients", clientId);
}
