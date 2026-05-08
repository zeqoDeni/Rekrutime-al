import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/app/shared/ui/button";
import { Input } from "@/app/shared/ui/input";
import { Label } from "@/app/shared/ui/label";
import { Textarea } from "@/app/shared/ui/textarea";
import { useOrg } from "../context/OrgContext";
import { useAuth } from "@/app/context/AuthContext";
import { createCandidate, updateCandidate } from "@/lib/orgs/candidates";
import { createNote } from "@/lib/orgs/notes";
import { uploadResume } from "@/lib/orgs/storage";
import { crmCandidateSchema } from "@/lib/schemas/validation";

export default function CandidateNewPage() {
  const { orgId } = useOrg();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!orgId || !user) return;

    const result = crmCandidateSchema.safeParse({ fullName, email, phone, notes });
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      setErrors(
        Object.fromEntries(
          Object.entries(flat).map(([k, v]) => [k, (v as string[])[0] ?? ""])
        )
      );
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const now = new Date().toISOString();
      const candidateId = await createCandidate(orgId, {
        fullName: result.data.fullName,
        email: result.data.email || undefined,
        phone: result.data.phone || undefined,
        source: "manual",
        crmStatus: "new",
        ownerUid: user.id,
        assignedTo: user.id,
        createdAt: now,
        updatedAt: now,
      });

      if (cvFile) {
        try {
          const { url } = await uploadResume(orgId, candidateId, cvFile);
          await updateCandidate(orgId, candidateId, { cvUrl: url });
        } catch {
          toast.error("CV-ja nuk u ngarkua, por kandidati u krijua.");
        }
      }

      if (result.data.notes?.trim()) {
        await createNote(orgId, {
          refType: "candidate",
          refId: candidateId,
          body: result.data.notes,
          createdBy: user.id,
          createdAt: now,
        });
      }

      toast.success("Kandidati u shtua me sukses.");
      navigate(`/app/${orgId}/candidates/${candidateId}`);
    } catch (err) {
      toast.error((err as Error).message ?? "Gabim gjatë shtimit.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold">Shto Kandidat</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="fullName">Emri i plotë *</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="p.sh. Andi Kelmendi"
          />
          {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="kandidat@shembull.com"
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+355 69 123 4567"
          />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="cv">CV (PDF, DOC)</Label>
          <input
            id="cv"
            type="file"
            accept=".pdf,.doc,.docx"
            className="block text-sm"
            onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="notes">Shënim fillestar</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Vërejtje ose kontekst shtesë..."
            rows={3}
          />
          {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Duke ruajtur..." : "Shto kandidat"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/app/${orgId}/candidates`)}
          >
            Anulo
          </Button>
        </div>
      </form>
    </div>
  );
}
