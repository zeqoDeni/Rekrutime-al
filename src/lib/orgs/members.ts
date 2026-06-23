import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { listRecords } from "./base";
import { AppRole, OrgMember } from "../types/ats";

export function listMembers(orgId: string) {
  return listRecords<OrgMember>(orgId, "members");
}

export async function changeMemberRole(orgId: string, targetUid: string, role: AppRole): Promise<void> {
  await updateDoc(doc(db, `orgs/${orgId}/members/${targetUid}`), { role });
}
