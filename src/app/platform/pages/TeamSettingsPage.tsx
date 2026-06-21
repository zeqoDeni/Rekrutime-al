import { FormEvent, useCallback, useEffect, useState } from "react";
import { Button } from "@/app/shared/ui/button";
import { Input } from "@/app/shared/ui/input";
import { useOrg } from "../context/OrgContext";
import { changeMemberRole, listMembers } from "@/lib/orgs/members";
import { createInvite } from "@/lib/orgs/invites";
import { canAssignRole, sortMembersByRole, wouldRemoveLastOwner } from "@/lib/orgs/access";
import { AppRole, OrgMember } from "@/lib/types/ats";
import { RbacGuard } from "../components/RbacGuard";

export default function TeamSettingsPage() {
  const { orgId, role: currentRole } = useOrg();
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppRole>("recruiter");
  const [message, setMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);

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
      await createInvite(orgId, email, role);
      setMessage("Ftesa u dërgua.");
      setEmail("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ftesa dështoi.");
    } finally {
      setIsBusy(false);
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
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ndryshimi i rolit dështoi.");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <RbacGuard allow={["owner", "admin"]}>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Cilësimet e Ekipit</h1>
        <form className="flex flex-wrap gap-2" onSubmit={sendInvite}>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="koleg@agjencia.com" />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as AppRole)}
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="admin">Admin</option>
            <option value="recruiter">Recruiter</option>
            <option value="viewer">Viewer</option>
          </select>
          <Button type="submit" disabled={isBusy}>Fto</Button>
        </form>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
        <div className="space-y-2">
          {sortMembersByRole(members).map((member) => (
            <div key={member.uid} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3 text-sm">
              <div>
                <p className="font-medium">{member.displayName || member.email || member.uid}</p>
                <p className="text-xs text-muted-foreground">{member.uid}</p>
              </div>
              <select
                value={member.role}
                disabled={isBusy || !canAssignRole(currentRole, member.role)}
                onChange={(event) => updateRole(member.uid, event.target.value as AppRole)}
                className="h-10 rounded-md border bg-background px-3 text-sm"
              >
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="recruiter">Recruiter</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </RbacGuard>
  );
}
