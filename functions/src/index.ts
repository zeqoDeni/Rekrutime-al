import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { randomUUID } from "node:crypto";
import { sendInviteEmail } from "./adapters/email.js";
import { AppRole, assertValidRole, requireAuth, requireRole } from "./utils/auth.js";

initializeApp();

const db = getFirestore();
const inviteTtlDays = 7;

function assertNonEmptyString(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new HttpsError("invalid-argument", `${field} is required.`);
  }
}

function normalizeEmail(value: unknown): string {
  assertNonEmptyString(value, "email");
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpsError("invalid-argument", "A valid email is required.");
  }
  return email;
}

function getAppBaseUrl() {
  return process.env.APP_BASE_URL || "http://localhost:5173";
}

async function getMemberRole(orgId: string, uid: string): Promise<AppRole | undefined> {
  const memberDoc = await db.doc(`orgs/${orgId}/members/${uid}`).get();
  return memberDoc.exists ? (memberDoc.data()?.role as AppRole) : undefined;
}

export const createOrgInvite = onCall(async (request) => {
  const uid = request.auth?.uid;
  requireAuth(uid);
  const { orgId, email, role } = request.data as {
    orgId: string;
    email: string;
    role: AppRole;
  };
  assertNonEmptyString(orgId, "orgId");
  const normalizedEmail = normalizeEmail(email);
  assertValidRole(role, ["admin", "recruiter", "viewer"]);
  const currentRole = await getMemberRole(orgId, uid);
  requireRole(currentRole, ["owner", "admin"]);

  const inviteCode = randomUUID();
  const inviteRef = db.collection("invites").doc(inviteCode);
  const expiresAt = Timestamp.fromMillis(Date.now() + inviteTtlDays * 24 * 60 * 60 * 1000);
  await inviteRef.set({
    orgId,
    email: normalizedEmail,
    role,
    status: "pending",
    createdBy: uid,
    createdAt: Timestamp.now(),
    expiresAt,
  });

  const orgName = (
    await db.doc(`orgs/${orgId}`).get()
  ).data()?.name || "Agency";
  await sendInviteEmail({
    email: normalizedEmail,
    inviteCode,
    orgName,
    role,
    acceptUrl: `${getAppBaseUrl()}/app/accept-invite?code=${encodeURIComponent(inviteCode)}`,
  });

  return { inviteCode };
});

export const acceptInvite = onCall(async (request) => {
  const uid = request.auth?.uid;
  requireAuth(uid);
  const { inviteCode } = request.data as { inviteCode: string };
  assertNonEmptyString(inviteCode, "inviteCode");

  const inviteRef = db.collection("invites").doc(inviteCode);
  const inviteSnap = await inviteRef.get();
  if (!inviteSnap.exists) {
    throw new HttpsError("not-found", "Invite not found.");
  }
  const invite = inviteSnap.data()!;
  if (invite.status !== "pending") {
    throw new HttpsError("failed-precondition", "Invite is no longer pending.");
  }
  if (invite.expiresAt?.toMillis && invite.expiresAt.toMillis() < Date.now()) {
    throw new HttpsError("deadline-exceeded", "Invite has expired.");
  }
  const authEmail = request.auth?.token.email;
  if (!authEmail || String(authEmail).toLowerCase() !== invite.email) {
    throw new HttpsError("permission-denied", "Sign in with the invited email address.");
  }

  const batch = db.batch();
  batch.set(db.doc(`orgs/${invite.orgId}/members/${uid}`), {
    uid,
    role: invite.role,
    createdAt: Timestamp.now(),
  });
  batch.set(db.doc(`userOrgs/${uid}/${invite.orgId}`), {
    orgId: invite.orgId,
    role: invite.role,
    joinedAt: Timestamp.now(),
  });
  batch.update(inviteRef, { status: "accepted", acceptedBy: uid, acceptedAt: Timestamp.now() });
  await batch.commit();
  return { success: true };
});

export const revokeInvite = onCall(async (request) => {
  const uid = request.auth?.uid;
  requireAuth(uid);
  const { inviteCode } = request.data as { inviteCode: string };
  const inviteSnap = await db.collection("invites").doc(inviteCode).get();
  if (!inviteSnap.exists) return { success: true };
  const orgId = inviteSnap.data()!.orgId as string;
  const currentRole = await getMemberRole(orgId, uid);
  requireRole(currentRole, ["owner", "admin"]);
  await inviteSnap.ref.update({ status: "revoked", revokedAt: Timestamp.now() });
  return { success: true };
});

export const changeMemberRole = onCall(async (request) => {
  const uid = request.auth?.uid;
  requireAuth(uid);
  const { orgId, targetUid, role } = request.data as {
    orgId: string;
    targetUid: string;
    role: AppRole;
  };
  assertNonEmptyString(orgId, "orgId");
  assertNonEmptyString(targetUid, "targetUid");
  assertValidRole(role);
  const currentRole = await getMemberRole(orgId, uid);
  requireRole(currentRole, ["owner", "admin"]);
  const targetRef = db.doc(`orgs/${orgId}/members/${targetUid}`);
  const targetSnap = await targetRef.get();
  if (!targetSnap.exists) {
    throw new HttpsError("not-found", "Member not found.");
  }
  const targetRole = targetSnap.data()?.role as AppRole | undefined;
  if (targetRole === "owner" && role !== "owner") {
    const owners = await db.collection(`orgs/${orgId}/members`).where("role", "==", "owner").limit(2).get();
    if (owners.size < 2) {
      throw new HttpsError("failed-precondition", "An organization must keep at least one owner.");
    }
  }
  await db.doc(`orgs/${orgId}/members/${targetUid}`).set(
    { role, updatedAt: Timestamp.now(), updatedBy: uid },
    { merge: true }
  );
  await db.doc(`userOrgs/${targetUid}/${orgId}`).set({ role }, { merge: true });
  return { success: true };
});

export const deleteOrg = onCall(async (request) => {
  const uid = request.auth?.uid;
  requireAuth(uid);
  const { orgId } = request.data as { orgId: string };
  const currentRole = await getMemberRole(orgId, uid);
  requireRole(currentRole, ["owner"]);
  await db.doc(`orgs/${orgId}`).delete();
  return { success: true };
});

export const deleteClient = onCall(async (request) => {
  const uid = request.auth?.uid;
  requireAuth(uid);
  const { orgId, clientId } = request.data as { orgId: string; clientId: string };
  const currentRole = await getMemberRole(orgId, uid);
  requireRole(currentRole, ["owner", "admin"]);
  await db.doc(`orgs/${orgId}/clients/${clientId}`).delete();
  return { success: true };
});

export const deleteJob = onCall(async (request) => {
  const uid = request.auth?.uid;
  requireAuth(uid);
  const { orgId, jobId } = request.data as { orgId: string; jobId: string };
  const currentRole = await getMemberRole(orgId, uid);
  requireRole(currentRole, ["owner", "admin"]);
  await db.doc(`orgs/${orgId}/jobs/${jobId}`).delete();
  return { success: true };
});

export const auditApplicantStageChanges = onDocumentUpdated(
  "orgs/{orgId}/jobs/{jobId}/applicants/{applicantId}",
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after || before.stage === after.stage) return;
    await db.collection(`orgs/${event.params.orgId}/auditLog`).add({
      type: "applicant_stage_changed",
      jobId: event.params.jobId,
      applicantId: event.params.applicantId,
      fromStage: before.stage,
      toStage: after.stage,
      at: Timestamp.now(),
    });
  }
);
