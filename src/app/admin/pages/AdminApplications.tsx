import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { AdminLayout } from '../layout/AdminLayout';
import { listAllApplicationsForAdmin } from '@/lib/admin';
import type { MarketplaceApplication, MarketplaceApplicationStatus } from '@/lib/marketplace';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/shared/ui/select';

type StatusFilter = 'all' | MarketplaceApplicationStatus;

const STATUS_LABELS: Record<string, string> = {
  new: 'E re',
  reviewed: 'Shqyrtuar',
  shortlisted: 'Listë e shkurtër',
  rejected: 'Refuzuar',
  hired: 'Punësuar',
};

const STATUS_BADGE: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  reviewed: 'bg-yellow-100 text-yellow-800',
  shortlisted: 'bg-purple-100 text-purple-800',
  rejected: 'bg-red-100 text-red-800',
  hired: 'bg-green-100 text-green-800',
};

export default function AdminApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<MarketplaceApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    if (!user) return;
    listAllApplicationsForAdmin(user)
      .then(setApplications)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [user]);

  const filtered =
    statusFilter === 'all' ? applications : applications.filter((a) => a.status === statusFilter);

  return (
    <AdminLayout title="Monitorimi i Aplikimeve" subtitle={`${applications.length} aplikime gjithsej`}>
      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-3 mb-4 text-sm">{error}</div>
      )}

      <div className="flex items-center gap-3 mb-5">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Të gjitha</SelectItem>
            <SelectItem value="new">E re</SelectItem>
            <SelectItem value="reviewed">Shqyrtuar</SelectItem>
            <SelectItem value="shortlisted">Listë e shkurtër</SelectItem>
            <SelectItem value="rejected">Refuzuar</SelectItem>
            <SelectItem value="hired">Punësuar</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filtered.length} rezultate</span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nuk u gjetën aplikime.</p>
      ) : (
        <div className="bg-card border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Kandidati</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Job ID</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statusi</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((app) => (
                <tr key={app.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium truncate max-w-[160px]">{app.candidateName}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[160px]">{app.candidateEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell font-mono text-xs truncate max-w-[140px]">
                    {app.jobId}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[app.status] ?? ''}`}>
                      {STATUS_LABELS[app.status] ?? app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">
                    {new Date(app.createdAt).toLocaleDateString('sq-AL')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
