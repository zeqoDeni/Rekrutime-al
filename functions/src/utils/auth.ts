import { HttpsError } from "firebase-functions/v2/https";

export type AppRole = "owner" | "admin" | "recruiter" | "viewer";

export const appRoles: AppRole[] = ["owner", "admin", "recruiter", "viewer"];

export function requireAuth(uid?: string): asserts uid is string {
  if (!uid) {
    throw new HttpsError("unauthenticated", "Authentication is required.");
  }
}

export function requireRole(role: AppRole | undefined, allowed: AppRole[]): void {
  if (!role || !allowed.includes(role)) {
    throw new HttpsError("permission-denied", "Insufficient permissions.");
  }
}

export function assertValidRole(role: unknown, allowed: AppRole[] = appRoles): asserts role is AppRole {
  if (typeof role !== "string" || !allowed.includes(role as AppRole)) {
    throw new HttpsError("invalid-argument", "Invalid role.");
  }
}
