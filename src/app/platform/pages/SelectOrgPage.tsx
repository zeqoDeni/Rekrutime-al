import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AgencyOrg } from "@/lib/types/ats";
import { useAuth } from "@/app/context/AuthContext";
import { listOrganizationsForUser } from "@/lib/orgs/orgs";

export default function SelectOrgPage() {
  const { user } = useAuth();
  const [orgs, setOrgs] = useState<AgencyOrg[]>([]);

  useEffect(() => {
    if (!user) return;
    listOrganizationsForUser(user.id).then(setOrgs);
  }, [user]);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold">Select workspace</h1>
      <div className="grid gap-3 md:grid-cols-2">
        {orgs.map((org) => (
          <Link
            key={org.id}
            to={`/app/${org.id}/dashboard`}
            className="rounded-lg border p-4 hover:bg-muted"
          >
            <div className="font-medium">{org.name}</div>
            <div className="text-xs text-muted-foreground">{org.id}</div>
          </Link>
        ))}
      </div>
      <Link to="/app/onboarding" className="text-sm text-primary underline">
        Create a new workspace
      </Link>
    </div>
  );
}
