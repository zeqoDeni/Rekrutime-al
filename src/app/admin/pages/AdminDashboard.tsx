import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';
import { AdminLayout } from '../layout/AdminLayout';
import {
  listAllUsers,
  listAllJobsForAdmin,
  listAllApplicationsForAdmin,
  listRecentActivity,
  type ActivityLogEntry,
} from '@/lib/admin';
import type { User } from '@/lib/types/api';
import type { MarketplaceJob, MarketplaceApplication } from '@/lib/marketplace';
import { Users, Briefcase, FileText, Activity, UserPlus, PlusCircle, ArrowRight } from 'lucide-react';

interface Stats {
  users: User[];
  jobs: MarketplaceJob[];
  applications: MarketplaceApplication[];
  activity: ActivityLogEntry[];
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  href,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}) {
  return (
    <Link
      to={href}
      className="bg-card border rounded-lg p-5 hover:border-primary transition-colors block"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </Link>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      listAllUsers(user),
      listAllJobsForAdmin(user),
      listAllApplicationsForAdmin(user),
      listRecentActivity(user, 15),
    ])
      .then(([users, jobs, applications, activity]) =>
        setStats({ users, jobs, applications, activity })
      )
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [user]);

  if (isLoading) {
    return (
      <AdminLayout title="Paneli i Administrimit">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Paneli i Administrimit">
        <div className="bg-destructive/10 text-destructive rounded-lg p-4">{error}</div>
      </AdminLayout>
    );
  }

  if (!stats) return null;

  const activeJobs = stats.jobs.filter((j) => !j.isDeleted && j.status === 'active').length;
  const deletedJobs = stats.jobs.filter((j) => j.isDeleted).length;
  const newApps = stats.applications.filter((a) => a.status === 'new').length;
  const disabledUsers = stats.users.filter((u) => u.isDisabled).length;

  return (
    <AdminLayout
      title="Paneli i Administrimit"
      subtitle="Pasqyrë e gjendjes së platformës"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Përdorues"
          value={stats.users.length}
          sub={disabledUsers > 0 ? `${disabledUsers} të çaktivizuar` : undefined}
          icon={Users}
          href="/admin/users"
        />
        <StatCard
          label="Punë"
          value={stats.jobs.length}
          sub={`${activeJobs} aktive · ${deletedJobs} fshirë`}
          icon={Briefcase}
          href="/admin/jobs"
        />
        <StatCard
          label="Aplikime"
          value={stats.applications.length}
          sub={`${newApps} të reja`}
          icon={FileText}
          href="/admin/applications"
        />
        <StatCard
          label="Aktivitete (sot)"
          value={stats.activity.length}
          icon={Activity}
          href="/admin"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User distribution */}
        <div className="bg-card border rounded-lg p-5">
          <h2 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
            Shpërndarje sipas rolit
          </h2>
          {(['candidate', 'employer', 'admin'] as const).map((role) => {
            const count = stats.users.filter((u) => u.type === role).length;
            const pct = stats.users.length > 0 ? Math.round((count / stats.users.length) * 100) : 0;
            const labels: Record<string, string> = {
              candidate: 'Kandidatë',
              employer: 'Punëdhënës',
              admin: 'Adminë',
            };
            return (
              <div key={role} className="flex items-center gap-3 mb-3 last:mb-0">
                <span className="text-sm text-muted-foreground w-24 shrink-0">{labels[role]}</span>
                <div className="flex-1 bg-muted rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-sm font-medium tabular-nums w-6 text-right">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Recent activity timeline */}
        <div className="bg-card border rounded-lg p-5">
          <h2 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
            Aktivitet i fundit
          </h2>
          {stats.activity.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
              <Activity className="size-6 opacity-30" />
              <p className="text-xs">Nuk ka aktivitet të regjistruar.</p>
            </div>
          ) : (
            <ul className="space-y-0">
              {stats.activity.slice(0, 6).map((entry, i) => (
                <li key={entry.id} className="flex gap-3 pb-3 last:pb-0">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="size-1.5 rounded-full bg-primary mt-1.5" />
                    {i < Math.min(stats.activity.length, 6) - 1 && (
                      <div className="w-px flex-1 bg-border mt-1" />
                    )}
                  </div>
                  <div className="min-w-0 pb-1">
                    <p className="text-xs leading-snug">
                      <span className="font-medium">{entry.actorName}</span>
                      <span className="text-muted-foreground ml-1">{entry.type}</span>
                    </p>
                    {entry.details && (
                      <p className="text-xs text-muted-foreground truncate">{entry.details}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                      {new Date(entry.timestamp).toLocaleString('sq-AL', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-card border rounded-lg p-5">
          <h2 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
            Veprime të shpejta
          </h2>
          <div className="space-y-2">
            {[
              { label: 'Shiko të gjithë përdoruesit', href: '/admin/users', icon: Users },
              { label: 'Modero punët', href: '/admin/jobs', icon: Briefcase },
              { label: 'Shiko aplikimet', href: '/admin/applications', icon: FileText },
              { label: 'Shto përdorues admin', href: '/admin/users', icon: UserPlus },
              { label: 'Publiko punë të re', href: '/dashboard/employer/new-job', icon: PlusCircle },
            ].map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                to={href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors group"
              >
                <Icon className="size-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
                <span className="flex-1 truncate">{label}</span>
                <ArrowRight className="size-3 text-muted-foreground/50 group-hover:text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
