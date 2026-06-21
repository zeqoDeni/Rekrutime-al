import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/app/shared/ui/button";
import { Skeleton } from "@/app/shared/ui/skeleton";
import { AgencyOrg } from "@/lib/types/ats";
import { useAuth } from "@/app/context/AuthContext";
import { listOrganizationsForUser } from "@/lib/orgs/orgs";

export default function SelectOrgPage() {
  const { user } = useAuth();
  const [orgs, setOrgs] = useState<AgencyOrg[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    listOrganizationsForUser(user.id)
      .then(setOrgs)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Hapësirat e punës</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Zgjidhni organizatën ose krijoni një të re.
          </p>
        </div>
        <Button asChild size="sm">
          <Link to="/app/onboarding">
            <Plus className="size-4 mr-1.5" />
            Krijo të re
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : orgs.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed py-16 text-center">
          <Building2 className="size-10 text-muted-foreground opacity-30" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Nuk keni asnjë hapësirë pune ende
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Krijoni hapësirën e parë për të filluar.
            </p>
          </div>
          <Button asChild>
            <Link to="/app/onboarding">
              <Plus className="size-4 mr-1.5" />
              Krijo hapësirën e parë
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {orgs.map((org) => (
            <Link
              key={org.id}
              to={`/app/${org.id}/dashboard`}
              className="flex items-center gap-3 rounded-lg border bg-card p-4 hover:border-primary hover:bg-muted/40 transition-colors"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-lg">
                {org.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">{org.name}</p>
                <p className="text-xs text-muted-foreground truncate">{org.id}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
