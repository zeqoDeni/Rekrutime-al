import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Plus, LogOut } from "lucide-react";
import { Button } from "@/app/shared/ui/button";
import { Skeleton } from "@/app/shared/ui/skeleton";
import { AgencyOrg } from "@/lib/types/ats";
import { useAuth } from "@/app/context/AuthContext";
import { listOrganizationsForUser } from "@/lib/orgs/orgs";

export default function SelectOrgPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState<AgencyOrg[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    listOrganizationsForUser(user.id).then((list) => {
      if (list.length === 0) {
        navigate("/app/onboarding", { replace: true });
      } else {
        setOrgs(list);
        setLoading(false);
      }
    });
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-8 py-5 border-b">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary font-black text-white text-xs select-none">
            R
          </div>
          <span className="font-bold tracking-tight text-sm">Rekrutime</span>
        </div>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={logout}>
          <LogOut className="size-4" />
          Dil
        </Button>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Hapësirat tuaja</h1>
            <p className="text-sm text-muted-foreground">
              Zgjidhni organizatën në të cilën doni të hyrni.
            </p>
          </div>

          {loading ? (
            <div className="grid gap-3 md:grid-cols-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {orgs.map((org) => (
                <Link
                  key={org.id}
                  to={`/app/${org.id}/dashboard`}
                  className="flex items-center gap-3 rounded-xl border bg-card p-4 hover:border-primary hover:bg-muted/40 transition-colors group"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg group-hover:bg-primary/20 transition-colors">
                    {org.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{org.name}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">Klikoni për të hyrë</p>
                  </div>
                </Link>
              ))}

              {/* Create new */}
              <Link
                to="/app/onboarding"
                className="flex items-center gap-3 rounded-xl border border-dashed bg-transparent p-4 hover:border-primary hover:bg-muted/30 transition-colors group"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <Plus className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Krijo hapësirë të re</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Shtoni një organizatë tjetër</p>
                </div>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
