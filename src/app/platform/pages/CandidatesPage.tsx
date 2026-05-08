import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/app/shared/ui/button";
import { Input } from "@/app/shared/ui/input";
import { Badge } from "@/app/shared/ui/badge";
import { Checkbox } from "@/app/shared/ui/checkbox";
import { Skeleton } from "@/app/shared/ui/skeleton";
import { Separator } from "@/app/shared/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/shared/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/shared/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/shared/ui/table";
import { useOrg } from "../context/OrgContext";
import { useAuth } from "@/app/context/AuthContext";
import {
  listCandidates,
  reassignCandidate,
  updateCrmStatus,
} from "@/lib/orgs/candidates";
import { listMembers } from "@/lib/orgs/members";
import { listJobs } from "@/lib/orgs/jobs";
import { listApplicants, upsertApplicantStage } from "@/lib/orgs/applicants";
import { CandidateProfile, CrmStatus, JobRequisition, OrgMember } from "@/lib/types/ats";

const CRM_LABELS: Record<CrmStatus, string> = {
  new: "I ri",
  screening: "Vlerësim",
  ready: "Gati",
  rejected: "Refuzuar",
};

const CRM_VARIANTS: Record<CrmStatus, "default" | "secondary" | "outline" | "destructive"> = {
  new: "secondary",
  screening: "default",
  ready: "outline",
  rejected: "destructive",
};

function memberLabel(m: OrgMember) {
  return m.displayName ?? m.email ?? m.uid;
}

function formatDate(iso: string | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("sq-AL", { day: "2-digit", month: "short" });
}

export default function CandidatesPage() {
  const { orgId } = useOrg();
  const { user } = useAuth();

  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [jobs, setJobs] = useState<JobRequisition[]>([]);
  const [jobCounts, setJobCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CrmStatus | "all">("all");
  const [recruiterFilter, setRecruiterFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Bulk action state
  const [bulkApplying, setBulkApplying] = useState(false);
  const [assignJobDialogOpen, setAssignJobDialogOpen] = useState(false);
  const [bulkJobId, setBulkJobId] = useState("");

  const reload = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const [list, memberList, jobList] = await Promise.all([
        listCandidates(orgId),
        listMembers(orgId),
        listJobs(orgId),
      ]);
      const allApplicants = await Promise.all(
        jobList.map((j) => listApplicants(orgId, j.id))
      );
      const counts: Record<string, number> = {};
      allApplicants.flat().forEach((app) => {
        counts[app.candidateId] = (counts[app.candidateId] ?? 0) + 1;
      });
      setCandidates(list);
      setMembers(memberList);
      setJobs(jobList.filter((j) => j.status === "open"));
      setJobCounts(counts);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => { reload(); }, [reload]);

  // ── Inline row actions ──────────────────────────────────────────────────

  const handleStatusChange = useCallback(async (candidateId: string, status: CrmStatus) => {
    setCandidates((prev) => prev.map((c) => c.id === candidateId ? { ...c, crmStatus: status } : c));
    try {
      await updateCrmStatus(orgId!, candidateId, status);
    } catch {
      toast.error("Statusi nuk u ndryshua.");
      reload();
    }
  }, [orgId, reload]);

  const handleRecruiterChange = useCallback(async (candidateId: string, uid: string) => {
    setCandidates((prev) => prev.map((c) => c.id === candidateId ? { ...c, assignedTo: uid } : c));
    try {
      await reassignCandidate(orgId!, candidateId, uid);
    } catch {
      toast.error("Rekruteri nuk u ndryshua.");
      reload();
    }
  }, [orgId, reload]);

  // ── Bulk actions ────────────────────────────────────────────────────────

  const handleBulkStatus = async (status: CrmStatus) => {
    if (!orgId || selected.size === 0) return;
    setBulkApplying(true);
    try {
      await Promise.all([...selected].map((id) => updateCrmStatus(orgId, id, status)));
      setCandidates((prev) =>
        prev.map((c) => selected.has(c.id) ? { ...c, crmStatus: status } : c)
      );
      toast.success(`Statusi u ndryshua për ${selected.size} kandidatë.`);
      setSelected(new Set());
    } catch {
      toast.error("Disa statuse nuk u ndryshuan.");
      reload();
    } finally {
      setBulkApplying(false);
    }
  };

  const handleBulkRecruiter = async (uid: string) => {
    if (!orgId || selected.size === 0) return;
    setBulkApplying(true);
    try {
      await Promise.all([...selected].map((id) => reassignCandidate(orgId, id, uid)));
      setCandidates((prev) =>
        prev.map((c) => selected.has(c.id) ? { ...c, assignedTo: uid } : c)
      );
      const recruiter = members.find((m) => m.uid === uid);
      toast.success(`${selected.size} kandidatë u caktuan te ${recruiter ? memberLabel(recruiter) : "rekruteri"}.`);
      setSelected(new Set());
    } catch {
      toast.error("Disa caktime nuk u ruajtën.");
      reload();
    } finally {
      setBulkApplying(false);
    }
  };

  const handleBulkAssignJob = async () => {
    if (!orgId || selected.size === 0 || !bulkJobId || !user) return;
    setBulkApplying(true);
    try {
      await Promise.all(
        [...selected].map((candidateId) =>
          upsertApplicantStage({
            orgId,
            jobId: bulkJobId,
            applicantId: candidateId,
            candidateId,
            stage: "sourced",
            changedBy: user.id,
          })
        )
      );
      const job = jobs.find((j) => j.id === bulkJobId);
      toast.success(`${selected.size} kandidatë u shtuan te "${job?.title ?? "puna"}".`);
      setAssignJobDialogOpen(false);
      setBulkJobId("");
      setSelected(new Set());
    } catch {
      toast.error("Disa caktime dështuan.");
    } finally {
      setBulkApplying(false);
    }
  };

  // ── Filter & selection ──────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return candidates.filter((c) => {
      const matchSearch = !q || c.fullName.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phone?.includes(q);
      const matchStatus = statusFilter === "all" || c.crmStatus === statusFilter;
      const matchRecruiter = recruiterFilter === "all" || c.assignedTo === recruiterFilter;
      return matchSearch && matchStatus && matchRecruiter;
    });
  }, [candidates, search, statusFilter, recruiterFilter]);

  const allSelected = filtered.length > 0 && selected.size === filtered.length;
  const someSelected = selected.size > 0 && !allSelected;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(filtered.map((c) => c.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Kandidatët</h1>
          {!loading && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {candidates.length} total
              {filtered.length !== candidates.length && ` · ${filtered.length} të filtruar`}
            </p>
          )}
        </div>
        {orgId && (
          <Button asChild size="sm">
            <Link to={`/app/${orgId}/candidates/new`}>+ Shto kandidat</Link>
          </Button>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Kërko emër, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-52 text-sm"
        />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CrmStatus | "all")}>
          <SelectTrigger className="h-8 w-36 text-sm">
            <SelectValue placeholder="Statusi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Të gjithë statuset</SelectItem>
            {(Object.keys(CRM_LABELS) as CrmStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{CRM_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={recruiterFilter} onValueChange={setRecruiterFilter}>
          <SelectTrigger className="h-8 w-40 text-sm">
            <SelectValue placeholder="Rekruteri" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Të gjithë rekruterët</SelectItem>
            {members.map((m) => (
              <SelectItem key={m.uid} value={m.uid}>{memberLabel(m)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(search || statusFilter !== "all" || recruiterFilter !== "all") && (
          <Button
            variant="ghost" size="sm"
            className="h-8 text-xs text-muted-foreground"
            onClick={() => { setSearch(""); setStatusFilter("all"); setRecruiterFilter("all"); }}
          >
            Pastro filtrat
          </Button>
        )}
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/60 px-4 py-2.5">
          <span className="text-sm font-semibold mr-1">
            {selected.size} të zgjedhur
          </span>

          <Separator orientation="vertical" className="h-5" />

          {/* Bulk status */}
          <Select onValueChange={(v) => handleBulkStatus(v as CrmStatus)} disabled={bulkApplying}>
            <SelectTrigger className="h-7 w-36 text-xs bg-background">
              <SelectValue placeholder="Ndrysho statusin" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(CRM_LABELS) as CrmStatus[]).map((s) => (
                <SelectItem key={s} value={s} className="text-xs">{CRM_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Bulk recruiter */}
          <Select onValueChange={handleBulkRecruiter} disabled={bulkApplying || members.length === 0}>
            <SelectTrigger className="h-7 w-40 text-xs bg-background">
              <SelectValue placeholder="Cakto rekruterin" />
            </SelectTrigger>
            <SelectContent>
              {members.map((m) => (
                <SelectItem key={m.uid} value={m.uid} className="text-xs">{memberLabel(m)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Bulk assign to job */}
          <Dialog open={assignJobDialogOpen} onOpenChange={setAssignJobDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" disabled={bulkApplying || jobs.length === 0}>
                <Briefcase className="size-3" />
                Cakto në punë
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cakto {selected.size} kandidatë në punë</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-1">
                <Select value={bulkJobId} onValueChange={setBulkJobId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Zgjidh punën..." />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map((j) => (
                      <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  className="w-full"
                  disabled={!bulkJobId || bulkApplying}
                  onClick={handleBulkAssignJob}
                >
                  {bulkApplying ? (
                    <><Loader2 className="size-4 mr-2 animate-spin" />Duke caktuar...</>
                  ) : (
                    `Cakto ${selected.size} kandidatë`
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {bulkApplying && <Loader2 className="size-4 animate-spin text-muted-foreground" />}

          <Button
            variant="ghost" size="sm"
            className="h-7 text-xs ml-auto"
            onClick={() => setSelected(new Set())}
            disabled={bulkApplying}
          >
            Çzgjidh
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10 pl-3">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={toggleAll}
                  aria-label="Zgjidh të gjithë"
                />
              </TableHead>
              <TableHead className="min-w-[180px]">Kandidati</TableHead>
              <TableHead className="w-36">Statusi</TableHead>
              <TableHead className="w-40">Rekruteri</TableHead>
              <TableHead className="w-16 text-right">Punë</TableHead>
              <TableHead className="w-24 text-right pr-4">Përditësuar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  <TableCell className="pl-3"><Skeleton className="size-4 rounded" /></TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-36 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </TableCell>
                  <TableCell><Skeleton className="h-7 w-28 rounded-md" /></TableCell>
                  <TableCell><Skeleton className="h-7 w-32 rounded-md" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-6 ml-auto" /></TableCell>
                  <TableCell className="text-right pr-4"><Skeleton className="h-4 w-14 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Users className="size-10 opacity-30" />
                    <div>
                      <p className="font-medium text-sm">
                        {candidates.length === 0 ? "Nuk ka kandidatë ende" : "Asnjë rezultat nuk u gjet"}
                      </p>
                      <p className="text-xs mt-0.5">
                        {candidates.length === 0
                          ? "Shtoni kandidatin e parë për të filluar."
                          : "Provoni të ndryshoni filtrat e kërkimit."}
                      </p>
                    </div>
                    {candidates.length === 0 && orgId && (
                      <Button asChild size="sm" className="mt-1">
                        <Link to={`/app/${orgId}/candidates/new`}>+ Shto kandidat</Link>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => {
                const assignedMember = members.find((m) => m.uid === c.assignedTo);
                const jobCount = jobCounts[c.id] ?? 0;
                const isSelected = selected.has(c.id);

                return (
                  <TableRow key={c.id} data-state={isSelected ? "selected" : undefined}>
                    <TableCell className="pl-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleOne(c.id)}
                        aria-label={`Zgjidh ${c.fullName}`}
                      />
                    </TableCell>

                    <TableCell className="py-3">
                      <Link to={`/app/${orgId}/candidates/${c.id}`} className="group block">
                        <p className="font-medium group-hover:text-primary transition-colors leading-tight">
                          {c.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                          {c.email ?? c.phone ?? "—"}
                        </p>
                      </Link>
                    </TableCell>

                    <TableCell>
                      <Select
                        value={c.crmStatus ?? "new"}
                        onValueChange={(v) => handleStatusChange(c.id, v as CrmStatus)}
                      >
                        <SelectTrigger className="h-7 w-32 text-xs border-none shadow-none bg-transparent px-1 focus:ring-0 hover:bg-muted/60 rounded-md">
                          <SelectValue>
                            <Badge variant={CRM_VARIANTS[c.crmStatus ?? "new"]} className="text-xs font-normal">
                              {CRM_LABELS[c.crmStatus ?? "new"]}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(CRM_LABELS) as CrmStatus[]).map((s) => (
                            <SelectItem key={s} value={s} className="text-xs">{CRM_LABELS[s]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell>
                      <Select
                        value={c.assignedTo ?? ""}
                        onValueChange={(v) => handleRecruiterChange(c.id, v)}
                      >
                        <SelectTrigger className="h-7 w-36 text-xs border-none shadow-none bg-transparent px-1 focus:ring-0 hover:bg-muted/60 rounded-md truncate">
                          <SelectValue placeholder="—">
                            <span className="truncate text-xs">
                              {assignedMember ? memberLabel(assignedMember) : "—"}
                            </span>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {members.map((m) => (
                            <SelectItem key={m.uid} value={m.uid} className="text-xs">
                              {memberLabel(m)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                      {jobCount > 0 ? (
                        <span className="font-medium text-foreground">{jobCount}</span>
                      ) : "—"}
                    </TableCell>

                    <TableCell className="text-right text-xs text-muted-foreground pr-4">
                      {formatDate(c.updatedAt ?? c.createdAt)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
