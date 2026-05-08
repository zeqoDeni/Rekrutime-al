import { httpsCallable } from "firebase/functions";
import { listRecords, setRecord } from "./base";
import { functions } from "../runtime-functions";
import { AppRole, OrgMember } from "../types/ats";

export function listMembers(orgId: string) {
  return listRecords<OrgMember>(orgId, "members");
}

export function upsertMember(orgId: string, uid: string, payload: Partial<OrgMember>) {
  return setRecord(orgId, "members", uid, payload as Record<string, unknown>);
}

export async function changeMemberRole(orgId: string, targetUid: string, role: AppRole) {
  const fn = httpsCallable<{ orgId: string; targetUid: string; role: AppRole }, { success: boolean }>(
    functions,
    "changeMemberRole"
  );
  const result = await fn({
    orgId,
    targetUid,
    role,
  });
  return result.data;
}
