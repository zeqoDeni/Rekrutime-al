import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/app/features/dashboard/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/shared/ui/card';
import { Button } from '@/app/shared/ui/button';
import { Badge } from '@/app/shared/ui/badge';
import { Skeleton } from '@/app/shared/ui/skeleton';
import { FileText, Bookmark, Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/app/context/AuthContext';
import {
  listApplicationsForCandidate,
  listSavedJobIds,
  listMarketplaceJobs,
  formatSalary,
  type MarketplaceApplication,
  type MarketplaceApplicationStatus,
  type MarketplaceJob,
} from '@/lib/marketplace';

const STATUS_LABELS: Record<MarketplaceApplicationStatus, string> = {
  new: 'E Re',
  reviewed: 'E Shqyrtuar',
  shortlisted: 'E Listuar',
  rejected: 'E Refuzuar',
  hired: 'E Pranuar',
};

function StatusBadge({ status }: { status: MarketplaceApplicationStatus }) {
  if (status === 'rejected') return <Badge variant="destructive">{STATUS_LABELS[status]}</Badge>;
  if (status === 'hired') return <Badge className="bg-green-600 text-white">{STATUS_LABELS[status]}</Badge>;
  if (status === 'shortlisted') return <Badge variant="outline">{STATUS_LABELS[status]}</Badge>;
  if (status === 'reviewed') return <Badge>{STATUS_LABELS[status]}</Badge>;
  return <Badge variant="secondary">{STATUS_LABELS[status]}</Badge>;
}

function StatusIcon({ status }: { status: MarketplaceApplicationStatus }) {
  if (status === 'hired') return <CheckCircle className="size-4 text-green-600" />;
  if (status === 'rejected') return <XCircle className="size-4 text-destructive" />;
  if (status === 'shortlisted') return <CheckCircle className="size-4 text-blue-500" />;
  if (status === 'reviewed') return <CheckCircle className="size-4 text-yellow-500" />;
  return <Clock className="size-4 text-muted-foreground" />;
}

interface DashboardData {
  applications: MarketplaceApplication[];
  savedJobs: MarketplaceJob[];
}

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    Promise.all([
      listApplicationsForCandidate(user),
      listSavedJobIds(user),
      listMarketplaceJobs(),
    ])
      .then(([applications, savedIds, allJobs]) => {
        const savedJobs = allJobs.filter((j) => savedIds.includes(j.id));
        setData({ applications, savedJobs });
      })
      .catch((err) => {
        console.error(err);
        toast.error('Ndodhi një gabim gjatë ngarkimit të të dhënave.');
      })
      .finally(() => setIsLoading(false));
  }, [user]);

  return (
    <DashboardLayout title="Paneli i Kandidatit">
      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2"><Skeleton className="h-4 w-28" /></CardHeader>
                <CardContent><Skeleton className="h-8 w-16" /></CardContent>
              </Card>
            ))
          : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aplikime Gjithsej</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data?.applications.length ?? 0}</div>
                  <p className="text-xs text-muted-foreground">aplikime aktive</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Punë të Ruajtura</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data?.savedJobs.length ?? 0}</div>
                  <p className="text-xs text-muted-foreground">të ruajtura</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Të Listuara</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data?.applications.filter((a) => a.status === 'shortlisted').length ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground">kandidaturë e listuar</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Të Pranuara</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data?.applications.filter((a) => a.status === 'hired').length ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground">oferta të pranuara</p>
                </CardContent>
              </Card>
            </>
          )}
      </div>

      {/* Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Aplikimet e Mia</CardTitle>
          <CardDescription>Gjurmimi i statusit të aplikimeve tuaja</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (data?.applications.length ?? 0) === 0 ? (
            <div className="flex flex-col items-center py-10 text-center text-muted-foreground">
              <FileText className="size-10 mb-3 opacity-40" />
              <p>Nuk keni aplikuar ende për asnjë punë.</p>
              <Button asChild variant="outline" className="mt-4">
                <Link to="/jobs">Kërkoni punë</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {data!.applications.map((app) => (
                <div key={app.id} className="flex items-start justify-between rounded-lg border p-4">
                  <div className="flex items-start gap-3">
                    <StatusIcon status={app.status} />
                    <div>
                      <p className="font-medium text-foreground text-sm">Aplikim #{app.id.slice(-6)}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <StatusBadge status={app.status} />
                        <span className="text-xs text-muted-foreground">
                          Aplikuar më {new Date(app.createdAt).toLocaleDateString('sq-AL')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Saved jobs preview */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Punë të Ruajtura</CardTitle>
              <CardDescription>Punë që keni ruajtur për të aplikuar</CardDescription>
            </div>
            {(data?.savedJobs.length ?? 0) > 0 && (
              <Button asChild variant="outline" size="sm">
                <Link to="/dashboard/candidate/saved">Shiko të gjitha</Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : (data?.savedJobs.length ?? 0) === 0 ? (
            <div className="flex flex-col items-center py-8 text-center text-muted-foreground">
              <Bookmark className="size-10 mb-3 opacity-40" />
              <p>Nuk keni ruajtur asnjë punë.</p>
              <Button asChild variant="outline" className="mt-4">
                <Link to="/jobs">Shfletoni punët</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {data!.savedJobs.slice(0, 3).map((job) => (
                <div key={job.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium text-foreground text-sm">{job.title}</p>
                    <p className="text-xs text-muted-foreground">{job.company} · {formatSalary(job.salary)}</p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/jobs">Apliko</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Veprime të Shpejta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Button asChild className="h-auto p-4 flex-col items-start">
              <Link to="/dashboard/candidate/profile">
                <FileText className="size-6 mb-2" />
                <span className="font-medium">Përditëso Profilin</span>
                <span className="text-sm opacity-80">Plotëso informacionet për më shumë mundësi</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex-col items-start">
              <Link to="/jobs">
                <Search className="size-6 mb-2" />
                <span className="font-medium">Kërko Punë të Reja</span>
                <span className="text-sm text-muted-foreground">Shiko punët e fundit</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
