import { AppRole, OrgMember } from "../types/ats";

const roleRank: Record<AppRole, number> = {
  viewer: 0,
  recruiter: 1,
  admin: 2,
  owner: 3,
};

export function canManageTeam(role: AppRole | null | undefined) {
  return role === "owner" || role === "admin";
}

export function canWriteRecords(role: AppRole | null | undefined) {
  return role === "owner" || role === "admin" || role === "recruiter";
}

export function canAssignRole(actorRole: AppRole | null | undefined, targetRole: AppRole) {
  if (!actorRole) return false;
  if (actorRole === "owner") return true;
  if (actorRole === "admin") return targetRole !== "owner";
  return false;
}

export function wouldRemoveLastOwner(members: OrgMember[], targetUid: string, nextRole: AppRole) {
  const target = members.find((member) => member.uid === targetUid);
  if (!target || target.role !== "owner" || nextRole === "owner") return false;
  return members.filter((member) => member.role === "owner").length <= 1;
}

export function sortMembersByRole(members: OrgMember[]) {
  return [...members].sort((a, b) => roleRank[b.role] - roleRank[a.role] || a.uid.localeCompare(b.uid));
}
