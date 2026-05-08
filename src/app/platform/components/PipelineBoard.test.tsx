import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PipelineBoard } from "./PipelineBoard";

describe("PipelineBoard", () => {
  it("renders all stages and applicants", () => {
    render(
      <PipelineBoard
        applicants={[
          {
            id: "a1",
            candidateId: "cand_1",
            stage: "sourced",
            updatedAt: "",
            history: [],
          },
        ]}
        onMove={vi.fn()}
      />
    );

    expect(screen.getByText("sourced")).toBeInTheDocument();
    expect(screen.getByText("cand_1")).toBeInTheDocument();
  });
});
