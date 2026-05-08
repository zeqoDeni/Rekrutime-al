import { arrayUnion, collection, doc, getDocs, orderBy, query, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Applicant, PipelineStage } from "../types/ats";

export async function listApplicants(orgId: string, jobId: string): Promise<Applicant[]> {
  const q = query(
    collection(db, `orgs/${orgId}/jobs/${jobId}/applicants`),
    orderBy("updatedAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Applicant));
}

export async function upsertApplicantStage(input: {
  orgId: string;
  jobId: string;
  applicantId: string;
  candidateId: string;
  stage: PipelineStage;
  changedBy: string;
}) {
  const ref = doc(db, `orgs/${input.orgId}/jobs/${input.jobId}/applicants/${input.applicantId}`);
  const changedAt = new Date().toISOString();
  const historyEntry = {
    stage: input.stage,
    changedAt,
    changedBy: input.changedBy,
  };
  await setDoc(
    ref,
    {
      candidateId: input.candidateId,
      stage: input.stage,
      updatedAt: changedAt,
      history: arrayUnion(historyEntry),
    },
    { merge: true }
  );
}

export function calculateAverageTimeInStage(applicants: Applicant[]) {
  const totals: Record<string, number> = {};
  const counts: Record<string, number> = {};
  applicants.forEach((applicant) => {
    const orderedHistory = [...(applicant.history || [])].sort(
      (a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime()
    );
    orderedHistory.forEach((entry, index) => {
      const next = orderedHistory[index + 1];
      if (!next) return;
      const durationHours =
        (new Date(next.changedAt).getTime() - new Date(entry.changedAt).getTime()) / 36e5;
      totals[entry.stage] = (totals[entry.stage] || 0) + durationHours;
      counts[entry.stage] = (counts[entry.stage] || 0) + 1;
    });
  });
  return Object.fromEntries(
    Object.entries(totals).map(([stage, total]) => [stage, total / Math.max(1, counts[stage])])
  );
}
