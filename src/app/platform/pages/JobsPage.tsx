import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Briefcase } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/app/shared/ui/button";
import { Input } from "@/app/shared/ui/input";
import { Badge } from "@/app/shared/ui/badge";
import { Skeleton } from "@/app/shared/ui/skeleton";
import { createJob, listJobs } from "@/lib/orgs/jobs";
import { listCandidates } from "@/lib/orgs/candidates";
import { listApplicants, upsertApplicantStage } from "@/lib/orgs/applicants";
import { useOrg } from "../context/OrgContext";
import { useAuth } from "@/app/context/AuthContext";
import { PipelineBoard } from "../components/PipelineBoard";
import { Applicant, CandidateProfile, JobRequisition, JobStatus, PipelineStage } from "@/lib/types/ats";

const STATUS_LABELS: Record<JobStatus, string> = {
  open: "E hapur",
  paused: "Pausë",
  filled: "E mbushur",
  closed: "Mbyllur",
};

const STATUS_VARIANTS: Record<JobStatus, "default" | "secondary" | "outline" | "destructive"> = {
  open: "default",
  paused: "secondary",
  filled: "outline",
  closed: "destructive",
};

export default function JobsPage() {
  const { orgId } = useOrg();
  const { user } = useAuth();

  const [jobs, setJobs] = useState<JobRequisition[]>([]);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [activeJobId, setActiveJobId] = useState<string>("");
  const [applicants, setApplicants] = useState<Applicant[]>([]);

  const [title, setTitle] = useState("");
  const [candidateId, setCandidateId] = useState("");

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [creating, setCreating] = useState(false);
  const [addingApplicant, setAddingApplicant] = useState(false);

  const reloadJobs = useCallback(async () => {
    if (!orgId) return;
    setLoadingJobs(true);
    try {
      const [jobsData, candidatesData] = await Promise.all([
        listJobs(orgId),
        listCandidates(orgId),
      ]);
      setJobs(jobsData);
      setCandidates(candidatesData);
      if (jobsData.length && !activeJobId) {
        setActiveJobId(jobsData[0].id);
      }
    } finally {
      setLoadingJobs(false);
    }
  }, [orgId, activeJobId]);

  useEffect(() => {
    reloadJobs();
  }, [reloadJobs]);

  useEffect(() => {
    if (!orgId || !activeJobId) return;
    setLoadingApplicants(true);
    listApplicants(orgId, activeJobId)
      .then(setApplicants)
      .finally(() => setLoadingApplicants(false));
  }, [orgId, activeJobId]);

  const activeJob = useMemo(
    () => jobs.find((j) => j.id === activeJobId) ?? null,
    [jobs, activeJobId]
  );

  const candidateMap = useMemo(
    () => Object.fromEntries(candidates.map((c) => [c.id, c])),
    [candidates]
  );

  const createJobSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!orgId || !title.trim() || !user) return;
    setCreating(true);
    try {
      await createJob(orgId, {
        title: title.trim(),
        status: "open",
        clientId: "",
        ownerUid: user.id,
        createdAt: new Date().toISOString(),
      });
      toast.success("Puna u krijua.");
      setTitle("");
      reloadJobs();
    } catch {
      toast.error("Puna nuk u ruajt.");
    } finally {
      setCreating(false);
    }
  };

  const addApplicant = async (e: FormEvent) => {
    e.preventDefault();
    if (!orgId || !activeJobId || !candidateId.trim() || !user) return;
    setAddingApplicant(true);
    try {
      await upsertApplicantStage({
        orgId,
        jobId: activeJobId,
        applicantId: candidateId.trim(),
        candidateId: candidateId.trim(),
        stage: "sourced",
        changedBy: user.id,
      });
      toast.success("Kandidati u shtua në pipeline.");
      setCandidateId("");
      const data = await listApplicants(orgId, activeJobId);
      setApplicants(data);
    } catch {
      toast.error("Kandidati nuk u shtua.");
    } finally {
      setAddingApplicant(false);
    }
  };

  const moveApplicant = async (applicantId: string, stage: PipelineStage) => {
    if (!orgId || !activeJobId || !user) return;
    const existing = applicants.find((a) => a.id === applicantId);
    try {
      await upsertApplicantStage({
        orgId,
        jobId: activeJobId,
        applicantId,
        candidateId: existing?.candidateId ?? applicantId,
        stage,
        changedBy: user.id,
      });
      toast.success("Faza u ndryshua.");
      const data = await listApplicants(orgId, activeJobId);
      setApplicants(data);
    } catch {
      toast.error("Ndryshimi i fazës dështoi.");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Punët &amp; Pipeline</h1>
          {!loadingJobs && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {jobs.filter((j) => j.status === "open").length} të hapura ·{" "}
              {jobs.length} gjithsej
            </p>
          )}
        </div>
      </div>

      {/* Create job form */}
      <form onSubmit={createJobSubmit} className="flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titulli i punës së re..."
          className="h-9 max-w-xs text-sm"
          disabled={creating}
        />
        <Button type="submit" size="sm" disabled={!title.trim() || creating}>
          {creating ? "Duke krijuar..." : "+ Krijo punë"}
        </Button>
      </form>

      {/* Job selector */}
      {loadingJobs ? (
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-28 rounded-md" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
          <Briefcase className="size-10 text-muted-foreground opacity-30" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Nuk ka punë ende
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Krijoni punën e parë duke përdorur formularin më sipër.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {jobs.map((job) => (
            <button
              key={job.id}
              onClick={() => setActiveJobId(job.id)}
              className={[
                "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors",
                activeJobId === job.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:border-primary/50 hover:bg-muted",
              ].join(" ")}
            >
              {job.title}
              <Badge
                variant={STATUS_VARIANTS[job.status]}
                className="text-[10px] py-0 px-1.5 h-4"
              >
                {STATUS_LABELS[job.status]}
              </Badge>
            </button>
          ))}
        </div>
      )}

      {/* Pipeline section */}
      {activeJob && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold">
              Pipeline — {activeJob.title}
            </h2>

            {/* Add candidate by ID */}
            <form onSubmit={addApplicant} className="flex gap-2">
              <Input
                value={candidateId}
                onChange={(e) => setCandidateId(e.target.value)}
                placeholder="ID e kandidatit..."
                className="h-8 w-52 font-mono text-xs"
                disabled={addingApplicant}
              />
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="h-8"
                disabled={!candidateId.trim() || addingApplicant}
              >
                {addingApplicant ? "Duke shtuar..." : "Shto"}
              </Button>
            </form>
          </div>

          {loadingApplicants ? (
            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-lg border p-3 space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-12 w-full rounded-md" />
                </div>
              ))}
            </div>
          ) : (
            <PipelineBoard
              applicants={applicants}
              candidates={candidateMap}
              onMove={moveApplicant}
            />
          )}
        </div>
      )}
    </div>
  );
}
