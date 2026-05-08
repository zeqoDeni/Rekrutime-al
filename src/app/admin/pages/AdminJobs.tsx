import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { AdminLayout } from '../layout/AdminLayout';
import { listAllJobsForAdmin, adminSetJobStatus } from '@/lib/admin';
import type { MarketplaceJob } from '@/lib/marketplace';
import { Button } from '@/app/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/shared/ui/select';
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
} from '@/app/shared/ui/alert-dialog';

type StatusFilter = 'all' | 'active' | 'paused' | 'deleted';

const STATUS_LABELS: Record<string, string> = {
  active: 'Aktive',
  paused: 'Ndërprerë',
  deleted: 'Fshirë',
};

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  deleted: 'bg-red-100 text-red-800',
};

function jobDisplayStatus(job: MarketplaceJob): string {
  if (job.isDeleted) return 'deleted';
  return job.status;
}

export default function AdminJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<MarketplaceJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    listAllJobsForAdmin(user)
      .then(setJobs)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [user]);

  async function handleAction(jobId: string, action: 'active' | 'paused' | 'delete' | 'restore') {
    if (!user) return;
    setPendingId(jobId);
    try {
      await adminSetJobStatus(jobId, action, user);
      setJobs((prev) =>
        prev.map((j) => {
          if (j.id !== jobId) return j;
          if (action === 'delete') return { ...j, isDeleted: true };
          if (action === 'restore') return { ...j, isDeleted: false, status: 'active' };
          return { ...j, isDeleted: false, status: action };
        })
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPendingId(null);
    }
  }

  const filtered = jobs.filter((j) => {
    if (statusFilter === 'all') return true;
    return jobDisplayStatus(j) === statusFilter;
  });

  return (
    <AdminLayout title="Moderimi i Punëve" subtitle={`${jobs.length} punë gjithsej`}>
      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-3 mb-4 text-sm">{error}</div>
      )}

      <div className="flex items-center gap-3 mb-5">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Të gjitha</SelectItem>
            <SelectItem value="active">Aktive</SelectItem>
            <SelectItem value="paused">Ndërprerë</SelectItem>
            <SelectItem value="deleted">Fshirë</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filtered.length} rezultate</span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nuk u gjetën punë.</p>
      ) : (
        <div className="bg-card border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Titulli</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Kompania</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statusi</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Aplikime</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Veprime</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((job) => {
                const ds = jobDisplayStatus(job);
                const isPending = pendingId === job.id;
                return (
                  <tr key={job.id} className={job.isDeleted ? 'opacity-50' : ''}>
                    <td className="px-4 py-3">
                      <div className="font-medium truncate max-w-[180px]">{job.title}</div>
                      <div className="text-xs text-muted-foreground">{job.location}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell truncate max-w-[140px]">
                      {job.company}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[ds] ?? ''}`}>
                        {STATUS_LABELS[ds] ?? ds}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {job.applicationsCount}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {job.isDeleted ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            disabled={isPending}
                            onClick={() => handleAction(job.id, 'restore')}
                          >
                            {isPending ? '...' : 'Rikthe'}
                          </Button>
                        ) : (
                          <>
                            {job.status === 'active' ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-7"
                                disabled={isPending}
                                onClick={() => handleAction(job.id, 'paused')}
                              >
                                {isPending ? '...' : 'Ndërpre'}
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-7"
                                disabled={isPending}
                                onClick={() => handleAction(job.id, 'active')}
                              >
                                {isPending ? '...' : 'Aktivizo'}
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  disabled={isPending}
                                >
                                  Fshi
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Konfirmo fshirjen</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Punë <strong>{job.title}</strong> do të shënohet si e fshirë.
                                    Adminët mund ta rikthejnë nga lista.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Anulo</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleAction(job.id, 'delete')}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Fshi
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
