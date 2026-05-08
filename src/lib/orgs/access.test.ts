import { describe, expect, it } from "vitest";
import { canAssignRole, canManageTeam, canWriteRecords, wouldRemoveLastOwner } from "./access";
import { OrgMember } from "../types/ats";

const members: OrgMember[] = [
  { uid: "owner_1", role: "owner", createdAt: "2026-01-01T00:00:00.000Z" },
  { uid: "admin_1", role: "admin", createdAt: "2026-01-01T00:00:00.000Z" },
];

describe("role access helpers", () => {
  it("enforces team management roles", () => {
    expect(canManageTeam("owner")).toBe(true);
    expect(canManageTeam("admin")).toBe(true);
    expect(canManageTeam("recruiter")).toBe(false);
    expect(canManageTeam("viewer")).toBe(false);
  });

  it("enforces write roles", () => {
    expect(canWriteRecords("owner")).toBe(true);
    expect(canWriteRecords("admin")).toBe(true);
    expect(canWriteRecords("recruiter")).toBe(true);
    expect(canWriteRecords("viewer")).toBe(false);
  });

  it("prevents admins from assigning owners", () => {
    expect(canAssignRole("owner", "owner")).toBe(true);
    expect(canAssignRole("admin", "recruiter")).toBe(true);
    expect(canAssignRole("admin", "owner")).toBe(false);
    expect(canAssignRole("recruiter", "viewer")).toBe(false);
  });

  it("detects last owner demotion", () => {
    expect(wouldRemoveLastOwner(members, "owner_1", "admin")).toBe(true);
    expect(wouldRemoveLastOwner([...members, { uid: "owner_2", role: "owner", createdAt: "2026-01-01T00:00:00.000Z" }], "owner_1", "admin")).toBe(false);
  });
});
