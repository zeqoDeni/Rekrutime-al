import { describe, expect, it, vi } from "vitest";

const callable = vi.fn();

vi.mock("firebase/functions", () => ({
  httpsCallable: vi.fn(() => callable),
}));

vi.mock("../runtime-functions", () => ({
  functions: {},
}));

describe("invite service", () => {
  it("returns invite code from create invite callable", async () => {
    callable.mockResolvedValueOnce({ data: { inviteCode: "invite_1" } });
    const { createInvite } = await import("./invites");

    await expect(createInvite("org_1", "User@Example.com", "recruiter")).resolves.toEqual({
      inviteCode: "invite_1",
    });
    expect(callable).toHaveBeenCalledWith({ orgId: "org_1", email: "User@Example.com", role: "recruiter" });
  });

  it("accepts invite through callable", async () => {
    callable.mockResolvedValueOnce({ data: { success: true } });
    const { acceptInvite } = await import("./invites");

    await expect(acceptInvite("invite_1")).resolves.toEqual({ success: true });
    expect(callable).toHaveBeenCalledWith({ inviteCode: "invite_1" });
  });
});
