import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { AgencyOrg, AppRole } from "../types/ats";

export async function createOrganization(input: { name: string; userId: string }) {
  const orgRef = doc(collection(db, "orgs"));
  const createdAt = new Date().toISOString();
  await setDoc(orgRef, {
    name: input.name,
    createdBy: input.userId,
    createdAt,
    updatedAt: serverTimestamp(),
  });
  await setDoc(doc(db, `orgs/${orgRef.id}/members/${input.userId}`), {
    uid: input.userId,
    role: "owner" satisfies AppRole,
    createdAt,
  });
  await setDoc(doc(db, `userOrgs/${input.userId}/memberships/${orgRef.id}`), {
    orgId: orgRef.id,
    role: "owner",
    joinedAt: createdAt,
  });
  return orgRef.id;
}

export async function listOrganizationsForUser(userId: string): Promise<AgencyOrg[]> {
  const membershipDocs = await getDocs(query(collection(db, `userOrgs/${userId}/memberships`)));
  const orgs = await Promise.all(
    membershipDocs.docs.map(async (membership) => {
      const orgRef = await getDoc(doc(db, `orgs/${membership.id}`));
      if (!orgRef.exists()) return null;
      return { id: orgRef.id, ...(orgRef.data() as Omit<AgencyOrg, "id">) } as AgencyOrg;
    })
  );
  return orgs.filter(Boolean) as AgencyOrg[];
}
