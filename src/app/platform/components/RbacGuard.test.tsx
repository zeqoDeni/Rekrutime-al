import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { RbacGuard } from "./RbacGuard";

vi.mock("../context/OrgContext", () => ({
  useOrg: () => ({ orgId: "org_1", role: "admin", loading: false }),
}));

describe("RbacGuard", () => {
  it("renders children when role is allowed", () => {
    render(
      <MemoryRouter>
        <RbacGuard allow={["admin"]}>
          <div>allowed content</div>
        </RbacGuard>
      </MemoryRouter>
    );

    expect(screen.getByText("allowed content")).toBeInTheDocument();
  });
});
