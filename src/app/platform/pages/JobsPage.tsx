import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Briefcase, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/app/shared/ui/button";
import { Input } from "@/app/shared/ui/input";
import { Badge } from "@/app/shared/ui/badge";
import { Skeleton } from "@/app/shared/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/shared/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/shared/ui/alert-dialog";
import { createJob, deleteJob, listJobs, updateJob } from "@/lib/orgs/jobs";
import { listCandidates } from "@/lib/orgs/candidates";
import { listClients } from "@/lib/orgs/clients";
import { listApplicants, upsertApplicantStage } from "@/lib/orgs/applicants";
import { useOrg } from "../context/OrgContext";
import { useAuth } from "@/app/context/AuthContext";
import { PipelineBoard } from "../components/PipelineBoard";
import { Applicant, ClientCompany, CandidateProfile, JobRequisition, JobStatus, PipelineStage } from "@/lib/types/ats";

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
  const [clients, setClients] = useState<ClientCompany[]>([]);
  const [activeJobId, setActiveJobId] = useState<string>("");
  const [applicants, setApplicants] = useState<Applicant[]>([]);

  const [title, setTitle] = useState("");
  const [newJobClientId, setNewJobClientId] = useState("");
  const [selectedCandidateId, setSelectedCandidateId] = useState("");

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [creating, setCreating] = useState(false);
  const [addingApplicant, setAddingApplicant] = useState(false);

  const reloadJobs = useCallback(async () => {
    if (!orgId) return;
    setLoadingJobs(true);
    try {
      const [jobsData, candidatesData, clientsData] = await Promise.all([
        listJobs(orgId),
        listCandidates(orgId),
        listClients(orgId),
      ]);
      setJobs(jobsData);
      setCandidates(candidatesData);
      setClients(clientsData);
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

  // Candidates not yet in this job's pipeline
  const availableCandidates = useMemo(() => {
    const inPipeline = new Set(applicants.map((a) => a.candidateId));
    return candidates.filter((c) => !inPipeline.has(c.id));
  }, [candidates, applicants]);

  const createJobSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!orgId || !title.trim() || !user) return;
    setCreating(true);
    try {
      await createJob(orgId, {
        title: title.trim(),
        status: "open",
        clientId: newJobClientId,
        ownerUid: user.id,
        createdAt: new Date().toISOString(),
      });
      toast.success("Puna u krijua.");
      setTitle("");
      setNewJobClientId("");
      reloadJobs();
    } catch {
      toast.error("Puna nuk u ruajt.");
    } finally {
      setCreating(false);
    }
  };

  const addApplicant = async (e: FormEvent) => {
    e.preventDefault();
    if (!orgId || !activeJobId || !selectedCandidateId || !user) return;
    setAddingApplicant(true);
    try {
      await upsertApplicantStage({
        orgId,
        jobId: activeJobId,
        applicantId: selectedCandidateId,
        candidateId: selectedCandidateId,
        stage: "sourced",
        changedBy: user.id,
      });
      toast.success("Kandidati u shtua në pipeline.");
      setSelectedCandidateId("");
      const data = await listApplicants(orgId, activeJobId);
      setApplicants(data);
    } catch {
      toast.error("Kandidati nuk u shtua.");
    } finally {
      setAddingApplicant(false);
    }
  };

  const handleStatusChange = async (jobId: string, status: JobStatus) => {
    if (!orgId) return;
    setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, status } : j));
    try {
      await updateJob(orgId, jobId, { status });
      toast.success("Statusi u ndryshua.");
    } catch {
      toast.error("Statusi nuk u ndryshua.");
      reloadJobs();
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!orgId) return;
    try {
      await deleteJob(orgId, jobId);
      toast.success("Puna u fshi.");
      if (activeJobId === jobId) {
        const remaining = jobs.filter((j) => j.id !== jobId);
        setActiveJobId(remaining[0]?.id ?? "");
      }
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch {
      toast.error("Fshirja dështoi.");
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
      <form onSubmit={createJobSubmit} className="flex flex-wrap gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titulli i punës së re..."
          className="h-9 max-w-xs text-sm"
          disabled={creating}
        />
        {clients.length > 0 && (
          <Select value={newJobClientId} onValueChange={setNewJobClientId}>
            <SelectTrigger className="h-9 w-44 text-sm">
              <SelectValue placeholder="Klienti (opsional)" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
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
            <p className="text-sm font-medium text-muted-foreground">Nuk ka punë ende</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Krijoni punën e parë duke përdorur formularin më sipër.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {jobs.map((job) => (
            <div
              key={job.id}
              className={[
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-sm transition-colors",
                activeJobId === job.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:border-primary/50 hover:bg-muted",
              ].join(" ")}
            >
              <button
                onClick={() => setActiveJobId(job.id)}
                className="flex items-center gap-1.5"
              >
                {job.title}
                <Badge
                  variant={activeJobId === job.id ? "outline" : STATUS_VARIANTS[job.status]}
                  className="text-[10px] py-0 px-1.5 h-4"
                >
                  {STATUS_LABELS[job.status]}
                </Badge>
              </button>

              {/* Status change */}
              <Select
                value={job.status}
                onValueChange={(v) => handleStatusChange(job.id, v as JobStatus)}
              >
                <SelectTrigger className="h-5 w-5 border-none shadow-none bg-transparent p-0 focus:ring-0 opacity-60 hover:opacity-100 [&>svg]:size-3 [&>svg]:shrink-0">
                  <span className="sr-only">Ndrysho statusin</span>
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_LABELS) as JobStatus[]).map((s) => (
                    <SelectItem key={s} value={s} className="text-xs">
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Delete */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="opacity-40 hover:opacity-100 hover:text-destructive transition-opacity ml-0.5">
                    <Trash2 className="size-3" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Fshi punën</AlertDialogTitle>
                    <AlertDialogDescription>
                      A jeni të sigurt që doni të fshini{" "}
                      <strong>{job.title}</strong>? Ky veprim nuk kthehet mbrapa.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Anulo</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteJob(job.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Fshi
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
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

            {/* Add candidate dropdown */}
            <form onSubmit={addApplicant} className="flex gap-2">
              <Select
                value={selectedCandidateId}
                onValueChange={setSelectedCandidateId}
                disabled={addingApplicant}
              >
                <SelectTrigger className="h-8 w-52 text-xs">
                  <SelectValue placeholder="Zgjidh kandidatin..." />
                </SelectTrigger>
                <SelectContent>
                  {availableCandidates.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground">
                      Të gjithë kandidatët janë në pipeline.
                    </div>
                  ) : (
                    availableCandidates.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-xs">
                        <span className="font-medium">{c.fullName}</span>
                        {c.email && (
                          <span className="text-muted-foreground ml-1">· {c.email}</span>
                        )}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="h-8"
                disabled={!selectedCandidateId || addingApplicant}
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
