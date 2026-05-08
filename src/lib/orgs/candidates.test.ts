import { describe, expect, it, vi, beforeEach } from "vitest";

const { mockAddDoc, mockGetDocs, mockUpdateDoc } = vi.hoisted(() => ({
  mockAddDoc: vi.fn().mockResolvedValue({ id: "cand-new" }),
  mockGetDocs: vi.fn(),
  mockUpdateDoc: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("firebase/firestore", () => ({
  addDoc: mockAddDoc,
  collection: vi.fn(() => "mock-col"),
  doc: vi.fn(() => "mock-doc-ref"),
  getDocs: mockGetDocs,
  getDoc: vi.fn(),
  orderBy: vi.fn(),
  query: vi.fn(),
  updateDoc: mockUpdateDoc,
}));

vi.mock("../firebase", () => ({ db: "mock-db" }));

import {
  createCandidate,
  listCandidates,
  reassignCandidate,
  softDeleteCandidate,
  updateCrmStatus,
} from "./candidates";

const ORG = "org_1";

beforeEach(() => {
  vi.clearAllMocks();
  mockAddDoc.mockResolvedValue({ id: "cand-new" });
  mockUpdateDoc.mockResolvedValue(undefined);
});

describe("listCandidates", () => {
  it("returns only non-deleted candidates", async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        { id: "c1", data: () => ({ fullName: "Andi", createdAt: "2026-01-01T00:00:00.000Z" }) },
        {
          id: "c2",
          data: () => ({
            fullName: "Besa",
            isDeleted: true,
            createdAt: "2026-01-01T00:00:00.000Z",
          }),
        },
        {
          id: "c3",
          data: () => ({
            fullName: "Drita",
            isDeleted: false,
            createdAt: "2026-01-01T00:00:00.000Z",
          }),
        },
      ],
    });

    const result = await listCandidates(ORG);
    expect(result).toHaveLength(2);
    expect(result.map((c) => c.id)).toEqual(["c1", "c3"]);
  });

  it("returns empty array when all candidates are deleted", async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        {
          id: "c1",
          data: () => ({
            fullName: "Andi",
            isDeleted: true,
            createdAt: "2026-01-01T00:00:00.000Z",
          }),
        },
      ],
    });

    const result = await listCandidates(ORG);
    expect(result).toHaveLength(0);
  });
});

describe("createCandidate", () => {
  it("returns the new document id", async () => {
    const id = await createCandidate(ORG, {
      fullName: "Andi Kelmendi",
      source: "manual",
      crmStatus: "new",
      ownerUid: "u1",
      assignedTo: "u1",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    expect(id).toBe("cand-new");
    expect(mockAddDoc).toHaveBeenCalledOnce();
  });
});

describe("updateCrmStatus", () => {
  it("writes crmStatus and updatedAt", async () => {
    await updateCrmStatus(ORG, "cand-1", "screening");

    expect(mockUpdateDoc).toHaveBeenCalledOnce();
    const payload = mockUpdateDoc.mock.calls[0][1] as Record<string, unknown>;
    expect(payload.crmStatus).toBe("screening");
    expect(typeof payload.updatedAt).toBe("string");
  });
});

describe("reassignCandidate", () => {
  it("writes assignedTo and updatedAt", async () => {
    await reassignCandidate(ORG, "cand-1", "recruiter-uid");

    expect(mockUpdateDoc).toHaveBeenCalledOnce();
    const payload = mockUpdateDoc.mock.calls[0][1] as Record<string, unknown>;
    expect(payload.assignedTo).toBe("recruiter-uid");
    expect(typeof payload.updatedAt).toBe("string");
  });
});

describe("softDeleteCandidate", () => {
  it("sets isDeleted to true and writes updatedAt", async () => {
    await softDeleteCandidate(ORG, "cand-1");

    expect(mockUpdateDoc).toHaveBeenCalledOnce();
    const payload = mockUpdateDoc.mock.calls[0][1] as Record<string, unknown>;
    expect(payload.isDeleted).toBe(true);
    expect(typeof payload.updatedAt).toBe("string");
  });
});
