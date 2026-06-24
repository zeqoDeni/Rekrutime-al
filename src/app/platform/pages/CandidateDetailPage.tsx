import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Briefcase, Check, FileText, Mail, Pencil, Phone, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/app/shared/ui/button";
import { Input } from "@/app/shared/ui/input";
import { Label } from "@/app/shared/ui/label";
import { Textarea } from "@/app/shared/ui/textarea";
import { Badge } from "@/app/shared/ui/badge";
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
import { useOrg } from "../context/OrgContext";
import { useAuth } from "@/app/context/AuthContext";
import {
  getCandidate,
  reassignCandidate,
  softDeleteCandidate,
  updateCandidate,
  updateCrmStatus,
} from "@/lib/orgs/candidates";
import { createNote, listNotesForRef } from "@/lib/orgs/notes";
import { listMembers } from "@/lib/orgs/members";
import { listJobs } from "@/lib/orgs/jobs";
import { upsertApplicantStage } from "@/lib/orgs/applicants";
import { CandidateProfile, CrmStatus, JobRequisition, NoteRecord, OrgMember } from "@/lib/types/ats";

const CRM_LABELS: Record<CrmStatus, string> = {
  new: "I ri",
  screening: "Në vlerësim",
  ready: "Gati",
  rejected: "Refuzuar",
};

const CRM_VARIANTS: Record<CrmStatus, "default" | "secondary" | "outline" | "destructive"> = {
  new: "secondary",
  screening: "default",
  ready: "outline",
  rejected: "destructive",
};

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr_220px]">
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

export default function CandidateDetailPage() {
  const { orgId } = useOrg();
  const { user } = useAuth();
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [jobs, setJobs] = useState<JobRequisition[]>([]);
  const [noteText, setNoteText] = useState("");
  const [assignJobId, setAssignJobId] = useState("");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [loading, setLoading] = useState(true);

  // Inline edit
  const [editing, setEditing] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Tags
  const [tagInput, setTagInput] = useState("");

  const reload = useCallback(async () => {
    if (!orgId || !candidateId) return;
    const [cand, noteList, memberList, jobList] = await Promise.all([
      getCandidate(orgId, candidateId),
      listNotesForRef(orgId, candidateId),
      listMembers(orgId),
      listJobs(orgId),
    ]);
    setCandidate(cand);
    setNotes(noteList);
    setMembers(memberList);
    setJobs(jobList.filter((j) => j.status === "open"));
    setLoading(false);
  }, [orgId, candidateId]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function handleStatusChange(value: string) {
    if (!orgId || !candidateId) return;
    const prev = candidate?.crmStatus;
    setCandidate((c) => c ? { ...c, crmStatus: value as CrmStatus } : c);
    try {
      await updateCrmStatus(orgId, candidateId, value as CrmStatus);
      toast.success("Statusi u përditësua.");
    } catch {
      setCandidate((c) => c ? { ...c, crmStatus: prev } : c);
      toast.error("Statusi nuk u ndryshua.");
    }
  }

  async function handleReassign(uid: string) {
    if (!orgId || !candidateId) return;
    const prev = candidate?.assignedTo;
    setCandidate((c) => c ? { ...c, assignedTo: uid } : c);
    try {
      await reassignCandidate(orgId, candidateId, uid);
      toast.success("Rekruteri u caktua.");
    } catch {
      setCandidate((c) => c ? { ...c, assignedTo: prev } : c);
      toast.error("Ndryshimi nuk u ruajt.");
    }
  }

  async function handleAddNote(e: FormEvent) {
    e.preventDefault();
    if (!orgId || !candidateId || !noteText.trim() || !user) return;
    setSavingNote(true);
    try {
      await createNote(orgId, {
        refType: "candidate",
        refId: candidateId,
        body: noteText,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
      });
      setNoteText("");
      const fresh = await listNotesForRef(orgId, candidateId);
      setNotes(fresh);
    } catch {
      toast.error("Shënimi nuk u ruajt.");
    } finally {
      setSavingNote(false);
    }
  }

  async function handleAssignToJob(e: FormEvent) {
    e.preventDefault();
    if (!orgId || !candidateId || !assignJobId || !user) return;
    setAssigning(true);
    try {
      await upsertApplicantStage({
        orgId,
        jobId: assignJobId,
        applicantId: candidateId,
        candidateId,
        stage: "sourced",
        changedBy: user.id,
      });
      toast.success("Kandidati u caktua në punë.");
      setAssignDialogOpen(false);
      setAssignJobId("");
    } catch (err) {
      toast.error((err as Error).message ?? "Caktimi dështoi.");
    } finally {
      setAssigning(false);
    }
  }

  function startEdit() {
    if (!candidate) return;
    setEditFullName(candidate.fullName);
    setEditEmail(candidate.email ?? "");
    setEditPhone(candidate.phone ?? "");
    setEditing(true);
  }

  async function handleEditSave() {
    if (!orgId || !candidateId || !editFullName.trim()) return;
    setSavingEdit(true);
    try {
      await updateCandidate(orgId, candidateId, {
        fullName: editFullName.trim(),
        email: editEmail.trim() || undefined,
        phone: editPhone.trim() || undefined,
      });
      setCandidate((c) =>
        c ? { ...c, fullName: editFullName.trim(), email: editEmail.trim() || undefined, phone: editPhone.trim() || undefined } : c
      );
      toast.success("Kandidati u përditësua.");
      setEditing(false);
    } catch {
      toast.error("Ndryshimet nuk u ruajtën.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleAddTag(e: FormEvent) {
    e.preventDefault();
    const tag = tagInput.trim().toLowerCase();
    if (!tag || !orgId || !candidateId || !candidate) return;
    if ((candidate.tags ?? []).includes(tag)) { setTagInput(""); return; }
    const tags = [...(candidate.tags ?? []), tag];
    setCandidate((c) => c ? { ...c, tags } : c);
    setTagInput("");
    try {
      await updateCandidate(orgId, candidateId, { tags });
    } catch {
      toast.error("Etiketa nuk u ruajt.");
      reload();
    }
  }

  async function handleRemoveTag(tag: string) {
    if (!orgId || !candidateId || !candidate) return;
    const tags = (candidate.tags ?? []).filter((t) => t !== tag);
    setCandidate((c) => c ? { ...c, tags } : c);
    try {
      await updateCandidate(orgId, candidateId, { tags });
    } catch {
      toast.error("Etiketa nuk u fshi.");
      reload();
    }
  }

  async function handleDelete() {
    if (!orgId || !candidateId) return;
    try {
      await softDeleteCandidate(orgId, candidateId);
      toast.success("Kandidati u fshi.");
      navigate(`/app/${orgId}/candidates`);
    } catch {
      toast.error("Fshirja dështoi.");
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <LoadingSkeleton />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
        <p className="text-sm">Kandidati nuk u gjet.</p>
        <Button asChild variant="outline" size="sm">
          <Link to={`/app/${orgId}/candidates`}>Kthehu te lista</Link>
        </Button>
      </div>
    );
  }

  const assignedMember = members.find((m) => m.uid === candidate.assignedTo);

  return (
    <div className="space-y-5">
      {/* Back breadcrumb */}
      <Link
        to={`/app/${orgId}/candidates`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        Kandidatët
      </Link>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr_200px]">

        {/* ── Left: Candidate info ── */}
        <aside className="space-y-4">
          {editing ? (
            <div className="space-y-2">
              <Input
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                placeholder="Emri i plotë"
                className="h-8 text-sm font-medium"
                disabled={savingEdit}
                autoFocus
              />
              <div className="flex items-center gap-1.5">
                <Mail className="size-3.5 text-muted-foreground shrink-0" />
                <Input
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="Email"
                  type="email"
                  className="h-8 text-sm"
                  disabled={savingEdit}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="size-3.5 text-muted-foreground shrink-0" />
                <Input
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Telefon"
                  className="h-8 text-sm"
                  disabled={savingEdit}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button size="sm" className="h-7 gap-1.5" onClick={handleEditSave} disabled={!editFullName.trim() || savingEdit}>
                  <Check className="size-3.5" />
                  {savingEdit ? "Duke ruajtur..." : "Ruaj"}
                </Button>
                <Button size="sm" variant="ghost" className="h-7 gap-1.5" onClick={() => setEditing(false)} disabled={savingEdit}>
                  <X className="size-3.5" />
                  Anulo
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between gap-2">
                <h1 className="text-xl font-semibold leading-tight">
                  {candidate.fullName}
                </h1>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={startEdit}
                >
                  <Pencil className="size-3.5" />
                </Button>
              </div>
              <Badge
                variant={CRM_VARIANTS[candidate.crmStatus ?? "new"]}
                className="mt-2 text-xs"
              >
                {CRM_LABELS[candidate.crmStatus ?? "new"]}
              </Badge>
            </div>
          )}

          {!editing && (
          <div className="space-y-2 text-sm">
            {candidate.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-3.5 shrink-0" />
                <a
                  href={`mailto:${candidate.email}`}
                  className="truncate hover:text-foreground transition-colors"
                >
                  {candidate.email}
                </a>
              </div>
            )}
            {candidate.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-3.5 shrink-0" />
                <a
                  href={`tel:${candidate.phone}`}
                  className="hover:text-foreground transition-colors"
                >
                  {candidate.phone}
                </a>
              </div>
            )}
            {candidate.cvUrl && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="size-3.5 shrink-0" />
                <a
                  href={candidate.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Shiko CV
                </a>
              </div>
            )}
          </div>
          )}

          {/* Tags */}
          <div className="space-y-2">
            {(candidate.tags ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1">
                {(candidate.tags ?? []).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <form onSubmit={handleAddTag} className="flex gap-1">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Shto etiketë..."
                className="h-7 text-xs"
              />
              <Button type="submit" size="sm" variant="outline" className="h-7 w-7 p-0 shrink-0">
                <Plus className="size-3.5" />
              </Button>
            </form>
          </div>

          <Separator />

          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              Shtuar:{" "}
              {new Date(candidate.createdAt).toLocaleDateString("sq-AL", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
            {candidate.source && (
              <p>
                Burimi:{" "}
                <span className="capitalize">
                  {candidate.source === "manual" ? "Manual" : "Aplikim"}
                </span>
              </p>
            )}
            {assignedMember && (
              <p>
                Rekruteri:{" "}
                <span className="text-foreground font-medium">
                  {assignedMember.displayName ?? assignedMember.email}
                </span>
              </p>
            )}
          </div>
        </aside>

        {/* ── Center: Notes / activity timeline ── */}
        <section className="space-y-4 min-w-0">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Shënime &amp; Aktivitet
          </h2>

          {/* Add note form */}
          <form onSubmit={handleAddNote} className="space-y-2">
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Shto shënim mbi kandidatin..."
              rows={2}
              className="resize-none text-sm"
              disabled={savingNote}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!noteText.trim() || savingNote}
            >
              {savingNote ? "Duke ruajtur..." : "Shto shënim"}
            </Button>
          </form>

          <Separator />

          {/* Notes timeline */}
          {notes.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <p className="text-sm">Nuk ka shënime ende.</p>
              <p className="text-xs">
                Shtoni shënimin e parë për të mbajtur historikun.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-lg border bg-muted/30 px-4 py-3"
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {note.body}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(note.createdAt).toLocaleString("sq-AL", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Right: Actions ── */}
        <aside className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Veprime
          </h2>

          {/* Status */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Statusi CRM</Label>
            <Select
              value={candidate.crmStatus ?? "new"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(CRM_LABELS) as CrmStatus[]).map((s) => (
                  <SelectItem key={s} value={s} className="text-sm">
                    {CRM_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recruiter assignment */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Rekruteri përgjegjës
            </Label>
            <Select
              value={candidate.assignedTo ?? ""}
              onValueChange={handleReassign}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Cakto rekruterin..." />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.uid} value={m.uid} className="text-sm">
                    {m.displayName ?? m.email ?? m.uid}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Assign to job */}
          <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Briefcase className="size-3.5" />
                Cakto në Punë
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Cakto {candidate.fullName} në Punë
                </DialogTitle>
              </DialogHeader>
              {jobs.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  Nuk ka punë të hapura momentalisht.
                </p>
              ) : (
                <form onSubmit={handleAssignToJob} className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Zgjidhni punën</Label>
                    <Select value={assignJobId} onValueChange={setAssignJobId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Zgjidh punën..." />
                      </SelectTrigger>
                      <SelectContent>
                        {jobs.map((j) => (
                          <SelectItem key={j.id} value={j.id}>
                            {j.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="submit"
                    disabled={!assignJobId || assigning}
                    className="w-full"
                  >
                    {assigning ? "Duke caktuar..." : "Cakto"}
                  </Button>
                </form>
              )}
            </DialogContent>
          </Dialog>

          <Separator />

          {/* Delete */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
                Fshi kandidatin
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Konfirmo fshirjen</AlertDialogTitle>
                <AlertDialogDescription>
                  Kandidati <strong>{candidate.fullName}</strong> do të
                  fshihet. Ky veprim mund të kthehet nga adminët.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Anulo</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Fshi
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </aside>
      </div>
    </div>
  );
}
