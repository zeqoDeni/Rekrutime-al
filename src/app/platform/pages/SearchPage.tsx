import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Building2, Search, Users } from "lucide-react";
import { Input } from "@/app/shared/ui/input";
import { Skeleton } from "@/app/shared/ui/skeleton";
import { Badge } from "@/app/shared/ui/badge";
import { useOrg } from "../context/OrgContext";
import { listCandidates } from "@/lib/orgs/candidates";
import { listClients } from "@/lib/orgs/clients";
import { listJobs } from "@/lib/orgs/jobs";

type ResultType = "candidate" | "job" | "client";

interface PoolItem {
  type: ResultType;
  id: string;
  label: string;
  sub?: string;
}

const TYPE_CONFIG: Record<ResultType, {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  variant: "default" | "secondary" | "outline";
}> = {
  candidate: { icon: Users, label: "Kandidat", variant: "secondary" },
  job: { icon: Briefcase, label: "Punë", variant: "default" },
  client: { icon: Building2, label: "Klient", variant: "outline" },
};

export default function SearchPage() {
  const { orgId } = useOrg();
  const [term, setTerm] = useState("");
  const [pool, setPool] = useState<PoolItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;
    Promise.all([listCandidates(orgId), listJobs(orgId), listClients(orgId)])
      .then(([candidates, jobs, clients]) => {
        setPool([
          ...candidates.map((c) => ({
            type: "candidate" as ResultType,
            id: c.id,
            label: c.fullName,
            sub: c.email ?? c.phone,
          })),
          ...jobs.map((j) => ({
            type: "job" as ResultType,
            id: j.id,
            label: j.title,
            sub: j.status,
          })),
          ...clients.map((cl) => ({
            type: "client" as ResultType,
            id: cl.id,
            label: cl.name,
            sub: cl.industry,
          })),
        ]);
      })
      .finally(() => setLoading(false));
  }, [orgId]);

  const filtered = useMemo(() => {
    const q = term.toLowerCase();
    if (!q) return pool;
    return pool.filter((item) => item.label.toLowerCase().includes(q));
  }, [term, pool]);

  function hrefFor(item: PoolItem) {
    if (item.type === "candidate") return `/app/${orgId}/candidates/${item.id}`;
    if (item.type === "job") return `/app/${orgId}/jobs`;
    return `/app/${orgId}/clients`;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Kërkim global</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Kërko kandidatë, punë dhe klientë menjëherë.
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Kërko..."
          className="pl-9 h-10"
          autoFocus
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
          <Search className="size-8 opacity-30" />
          <p className="text-sm font-medium">
            {term ? `Asnjë rezultat për "${term}"` : "Shkruani për të kërkuar"}
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((item) => {
            const { icon: Icon, label: typeLabel, variant } = TYPE_CONFIG[item.type];
            return (
              <Link
                key={`${item.type}-${item.id}`}
                to={hrefFor(item)}
                className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 hover:border-primary hover:bg-muted/40 transition-colors"
              >
                <Icon className="size-4 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{item.label}</p>
                  {item.sub && (
                    <p className="text-xs text-muted-foreground truncate">{item.sub}</p>
                  )}
                </div>
                <Badge variant={variant} className="text-xs shrink-0">
                  {typeLabel}
                </Badge>
              </Link>
            );
          })}
          <p className="text-xs text-muted-foreground text-center pt-1">
            {filtered.length} rezultate
          </p>
        </div>
      )}
    </div>
  );
}
