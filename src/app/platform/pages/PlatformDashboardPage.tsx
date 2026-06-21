import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Clock, ListTodo, Users } from "lucide-react";
import { Skeleton } from "@/app/shared/ui/skeleton";
import { listCandidates } from "@/lib/orgs/candidates";
import { listJobs } from "@/lib/orgs/jobs";
import { listTasks } from "@/lib/orgs/tasks";
import { calculateAverageTimeInStage, listApplicants } from "@/lib/orgs/applicants";
import { useOrg } from "../context/OrgContext";
import { CandidateProfile, JobRequisition, TaskRecord } from "@/lib/types/ats";

const STAGE_LABELS: Record<string, string> = {
  sourced: "Gjetur",
  screened: "Selektuar",
  interview: "Intervistë",
  offer: "Ofertë",
  hired: "Punësuar",
  rejected: "Refuzuar",
};

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  href,
  loading,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  loading: boolean;
}) {
  return (
    <Link
      to={href}
      className="rounded-lg border bg-card p-5 hover:border-primary transition-colors block group"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        <Icon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      {loading ? (
        <Skeleton className="h-8 w-16" />
      ) : (
        <p className="text-3xl font-bold tabular-nums">{value}</p>
      )}
      {sub && !loading && (
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      )}
    </Link>
  );
}

export default function PlatformDashboardPage() {
  const { orgId } = useOrg();
  const [jobs, setJobs] = useState<JobRequisition[]>([]);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [avgStageHours, setAvgStageHours] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;
    Promise.all([listJobs(orgId), listCandidates(orgId), listTasks(orgId)])
      .then(([jobsData, candidatesData, tasksData]) => {
        setJobs(jobsData);
        setCandidates(candidatesData);
        setTasks(tasksData);
        if (jobsData[0]?.id) {
          listApplicants(orgId, jobsData[0].id).then((apps) =>
            setAvgStageHours(calculateAverageTimeInStage(apps))
          );
        }
      })
      .finally(() => setLoading(false));
  }, [orgId]);

  const openJobs = useMemo(() => jobs.filter((j) => j.status === "open").length, [jobs]);
  const filledJobs = useMemo(() => jobs.filter((j) => j.status === "filled").length, [jobs]);
  const pendingTasks = useMemo(() => tasks.filter((t) => t.status !== "done").length, [tasks]);
  const stageEntries = Object.entries(avgStageHours);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Paneli i Agjencisë</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Pasqyrë e aktivitetit të organizatës
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Punë të hapura"
          value={openJobs}
          sub={filledJobs > 0 ? `${filledJobs} të mbushura` : undefined}
          icon={Briefcase}
          href={`/app/${orgId}/jobs`}
          loading={loading}
        />
        <StatCard
          label="Kandidatë"
          value={candidates.length}
          icon={Users}
          href={`/app/${orgId}/candidates`}
          loading={loading}
        />
        <StatCard
          label="Detyra aktive"
          value={pendingTasks}
          sub={tasks.length > 0 ? `${tasks.length} gjithsej` : undefined}
          icon={ListTodo}
          href={`/app/${orgId}/tasks`}
          loading={loading}
        />
        <StatCard
          label="Kohë mesatare (orë)"
          value={
            stageEntries.length > 0
              ? Math.round(
                  stageEntries.reduce((s, [, v]) => s + v, 0) / stageEntries.length
                )
              : 0
          }
          sub={stageEntries.length > 0 ? "mesatare e të gjitha fazave" : "të dhëna të pamjaftueshme"}
          icon={Clock}
          href={`/app/${orgId}/jobs`}
          loading={loading}
        />
      </div>

      {/* Pipeline timing breakdown */}
      {stageEntries.length > 0 && (
        <div className="rounded-lg border bg-card p-5">
          <h2 className="text-sm font-semibold mb-4">
            Kohë mesatare sipas fazës (orë)
          </h2>
          <div className="space-y-2">
            {stageEntries.map(([stage, hours]) => {
              const maxHours = Math.max(...stageEntries.map(([, h]) => h));
              const pct = maxHours > 0 ? Math.round((hours / maxHours) * 100) : 0;
              return (
                <div key={stage} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-24 shrink-0">
                    {STAGE_LABELS[stage] ?? stage}
                  </span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium tabular-nums w-12 text-right">
                    {hours.toFixed(1)}h
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state when no data yet */}
      {!loading && jobs.length === 0 && candidates.length === 0 && (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Organizata juaj është e re
          </p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Filloni duke shtuar punët dhe kandidatët e parë.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              to={`/app/${orgId}/jobs`}
              className="text-xs underline text-primary"
            >
              Shto punë
            </Link>
            <Link
              to={`/app/${orgId}/candidates/new`}
              className="text-xs underline text-primary"
            >
              Shto kandidat
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
