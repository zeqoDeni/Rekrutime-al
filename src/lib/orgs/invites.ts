import { httpsCallable } from "firebase/functions";
import { functions } from "../runtime-functions";
import { AppRole } from "../types/ats";

export async function createInvite(orgId: string, email: string, role: AppRole) {
  const fn = httpsCallable<{ orgId: string; email: string; role: AppRole }, { inviteCode: string }>(
    functions,
    "createOrgInvite"
  );
  const result = await fn({ orgId, email, role });
  return result.data;
}

export async function acceptInvite(inviteCode: string) {
  const fn = httpsCallable<{ inviteCode: string }, { success: boolean }>(functions, "acceptInvite");
  const result = await fn({ inviteCode });
  return result.data;
}

export async function revokeInvite(inviteCode: string) {
  const fn = httpsCallable<{ inviteCode: string }, { success: boolean }>(functions, "revokeInvite");
  const result = await fn({ inviteCode });
  return result.data;
}
