import { describe, expect, it } from "vitest";
import { calculateAverageTimeInStage } from "./applicants";

describe("calculateAverageTimeInStage", () => {
  it("computes hours by stage transitions", () => {
    const result = calculateAverageTimeInStage([
      {
        id: "app_1",
        candidateId: "cand_1",
        stage: "interview",
        updatedAt: "2026-01-01T05:00:00.000Z",
        history: [
          {
            stage: "sourced",
            changedAt: "2026-01-01T00:00:00.000Z",
            changedBy: "u1",
          },
          {
            stage: "screened",
            changedAt: "2026-01-01T02:00:00.000Z",
            changedBy: "u1",
          },
          {
            stage: "interview",
            changedAt: "2026-01-01T05:00:00.000Z",
            changedBy: "u1",
          },
        ],
      },
    ]);

    expect(result.sourced).toBe(2);
    expect(result.screened).toBe(3);
  });

  it("ignores open-ended current stage when computing audit history duration", () => {
    const result = calculateAverageTimeInStage([
      {
        id: "app_1",
        candidateId: "cand_1",
        stage: "offer",
        updatedAt: "2026-01-01T06:00:00.000Z",
        history: [
          {
            stage: "interview",
            changedAt: "2026-01-01T04:00:00.000Z",
            changedBy: "u1",
          },
          {
            stage: "offer",
            changedAt: "2026-01-01T06:00:00.000Z",
            changedBy: "u1",
          },
        ],
      },
    ]);

    expect(result.interview).toBe(2);
    expect(result.offer).toBeUndefined();
  });
});
