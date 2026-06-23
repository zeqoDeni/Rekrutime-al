import { FormEvent, useCallback, useEffect, useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/app/shared/ui/button";
import { Input } from "@/app/shared/ui/input";
import { Badge } from "@/app/shared/ui/badge";
import { useOrg } from "../context/OrgContext";
import { changeMemberRole, listMembers } from "@/lib/orgs/members";
import { createInvite, InviteResult } from "@/lib/orgs/invites";
import { canAssignRole, sortMembersByRole, wouldRemoveLastOwner } from "@/lib/orgs/access";
import { AppRole, OrgMember } from "@/lib/types/ats";
import { RbacGuard } from "../components/RbacGuard";

const ROLE_LABELS: Record<AppRole, string> = {
  owner: "Owner",
  admin: "Admin",
  recruiter: "Recruiter",
  viewer: "Viewer",
};

const ROLE_VARIANTS: Record<AppRole, "default" | "secondary" | "outline" | "destructive"> = {
  owner: "default",
  admin: "secondary",
  recruiter: "outline",
  viewer: "outline",
};

export default function TeamSettingsPage() {
  const { orgId, role: currentRole } = useOrg();
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppRole>("recruiter");
  const [message, setMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<InviteResult[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const refreshMembers = useCallback(async () => {
    if (!orgId) return;
    setMembers(await listMembers(orgId));
  }, [orgId]);

  useEffect(() => {
    refreshMembers();
  }, [refreshMembers]);

  const sendInvite = async (event: FormEvent) => {
    event.preventDefault();
    if (!orgId || !email.trim()) return;
    setIsBusy(true);
    setMessage("");
    try {
      const result = await createInvite(orgId, email.trim(), role);
      setPendingInvites((prev) => [result, ...prev]);
      setMessage("Ftesa u krijua.");
      setEmail("");
      toast.success("Ftesa u krijua. Ndajeni linkun me kolegët tuaj.");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Ftesa dështoi.";
      setMessage(msg);
      toast.error(msg);
    } finally {
      setIsBusy(false);
    }
  };

  const copyInviteUrl = async (inviteResult: InviteResult) => {
    try {
      await navigator.clipboard.writeText(inviteResult.inviteUrl);
      setCopiedCode(inviteResult.inviteCode);
      setTimeout(() => setCopiedCode(null), 2000);
      toast.success("Linku u kopjua.");
    } catch {
      toast.error("Kopjimi dështoi.");
    }
  };

  const updateRole = async (targetUid: string, nextRole: AppRole) => {
    if (!orgId) return;
    setIsBusy(true);
    setMessage("");
    try {
      if (!canAssignRole(currentRole, nextRole)) {
        setMessage("Nuk keni leje për këtë rol.");
        return;
      }
      if (wouldRemoveLastOwner(members, targetUid, nextRole)) {
        setMessage("Organizata duhet të ketë të paktën një pronar.");
        return;
      }
      await changeMemberRole(orgId, targetUid, nextRole);
      await refreshMembers();
      setMessage("Roli u ndryshua.");
      toast.success("Roli u ndryshua.");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Ndryshimi i rolit dështoi.";
      setMessage(msg);
      toast.error(msg);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <RbacGuard allow={["owner", "admin"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Cilësimet e Ekipit</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Ftoni anëtarë të rinj dhe menaxhoni rolet e ekipit tuaj.
          </p>
        </div>

        {/* Invite form */}
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h2 className="text-sm font-semibold">Fto anëtar të ri</h2>
          <form className="flex flex-wrap gap-2" onSubmit={sendInvite}>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="koleg@agjencia.com"
              type="email"
              className="h-9 w-56 text-sm"
              disabled={isBusy}
              required
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AppRole)}
              className="h-9 rounded-md border bg-background px-3 text-sm"
              disabled={isBusy}
            >
              <option value="admin">Admin</option>
              <option value="recruiter">Recruiter</option>
              <option value="viewer">Viewer</option>
            </select>
            <Button type="submit" size="sm" className="h-9" disabled={isBusy || !email.trim()}>
              {isBusy ? "Duke dërguar..." : "Fto"}
            </Button>
          </form>

          {message && (
            <p className="text-xs text-muted-foreground">{message}</p>
          )}
        </div>

        {/* Pending invite links */}
        {pendingInvites.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold">Ftesat aktive (sesioni aktual)</h2>
            <p className="text-xs text-muted-foreground">
              Ndajini këto linqe me personat e ftuar. Linqet skadojnë kur të rifreskoni faqen.
            </p>
            {pendingInvites.map((inv) => (
              <div
                key={inv.inviteCode}
                className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2"
              >
                <Link2 className="size-3.5 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground truncate flex-1 font-mono">
                  {inv.inviteUrl}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 shrink-0"
                  onClick={() => copyInviteUrl(inv)}
                >
                  {copiedCode === inv.inviteCode ? (
                    <Check className="size-3.5 text-green-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Members list */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">
            Anëtarët · {members.length}
          </h2>
          {sortMembersByRole(members).map((member) => (
            <div
              key={member.uid}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {member.displayName || member.email || member.uid}
                </p>
                {member.email && member.displayName && (
                  <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={ROLE_VARIANTS[member.role]} className="text-xs">
                  {ROLE_LABELS[member.role]}
                </Badge>
                {canAssignRole(currentRole, member.role) && (
                  <select
                    value={member.role}
                    disabled={isBusy}
                    onChange={(event) => updateRole(member.uid, event.target.value as AppRole)}
                    className="h-8 rounded-md border bg-background px-2 text-xs"
                  >
                    {currentRole === "owner" && <option value="owner">Owner</option>}
                    <option value="admin">Admin</option>
                    <option value="recruiter">Recruiter</option>
                    <option value="viewer">Viewer</option>
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </RbacGuard>
  );
}
