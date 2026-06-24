import { doc, getDoc, runTransaction, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { AppRole } from "../types/ats";

export interface InviteResult {
  inviteCode: string;
  inviteUrl: string;
}

export async function createInvite(orgId: string, email: string, role: AppRole): Promise<InviteResult> {
  const user = auth.currentUser;
  if (!user) throw new Error("Ju duhet të jeni të kyçur.");

  const inviteCode = crypto.randomUUID();
  await setDoc(doc(db, "invites", inviteCode), {
    orgId,
    email: email.trim().toLowerCase(),
    role,
    status: "pending",
    createdBy: user.uid,
    createdAt: new Date().toISOString(),
  });

  const inviteUrl = `${window.location.origin}/app/accept-invite?code=${encodeURIComponent(inviteCode)}`;
  return { inviteCode, inviteUrl };
}

export async function acceptInvite(inviteCode: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Ju duhet të jeni të kyçur.");

  // Read invite first to give a friendly error before the transaction starts
  const inviteRef = doc(db, "invites", inviteCode);
  const inviteSnap = await getDoc(inviteRef);
  if (!inviteSnap.exists()) throw new Error("Ftesa nuk u gjet.");
  const invite = inviteSnap.data();
  if (invite.status !== "pending") throw new Error("Kjo ftesë nuk është aktive ose tashmë është pranuar.");
  if (invite.email !== user.email?.toLowerCase()) throw new Error("Kjo ftesë nuk është për llogarinë tuaj.");

  // Fetch display name from user profile (more reliable than Firebase Auth displayName)
  let displayName: string | undefined = user.displayName || undefined;
  let userEmail: string | undefined = user.email || undefined;
  try {
    const profileSnap = await getDoc(doc(db, "users", user.uid));
    if (profileSnap.exists()) {
      displayName = profileSnap.data().name || displayName;
    }
  } catch {
    // Non-fatal: member will just show UID if profile read fails
  }

  await runTransaction(db, async (tx) => {
    const freshSnap = await tx.get(inviteRef);
    if (!freshSnap.exists() || freshSnap.data().status !== "pending") {
      throw new Error("Ftesa nuk është aktive.");
    }
    const inv = freshSnap.data();
    const now = new Date().toISOString();

    tx.set(doc(db, `orgs/${inv.orgId}/members/${user.uid}`), {
      uid: user.uid,
      role: inv.role,
      displayName,
      email: userEmail,
      createdAt: now,
      inviteCode,
    });

    tx.set(doc(db, `userOrgs/${user.uid}/memberships/${inv.orgId}`), {
      orgId: inv.orgId,
      role: inv.role,
      joinedAt: now,
      inviteCode,
    });

    tx.update(inviteRef, { status: "accepted" });
  });
}

export async function revokeInvite(inviteCode: string): Promise<void> {
  const inviteRef = doc(db, "invites", inviteCode);
  await updateDoc(inviteRef, { status: "revoked" });
}
