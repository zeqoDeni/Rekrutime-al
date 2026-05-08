import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/app/features/dashboard/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/shared/ui/card';
import { Button } from '@/app/shared/ui/button';
import { Badge } from '@/app/shared/ui/badge';
import { Skeleton } from '@/app/shared/ui/skeleton';
import { Plus, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/app/context/AuthContext';
import {
  listMarketplaceJobs,
  listApplicationsForEmployer,
  deleteMarketplaceJob,
  formatSalary,
  type MarketplaceJob,
  type MarketplaceApplication,
} from '@/lib/marketplace';

interface DashboardData {
  jobs: MarketplaceJob[];
  applications: MarketplaceApplication[];
}

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    Promise.all([listMarketplaceJobs(), listApplicationsForEmployer(user)])
      .then(([allJobs, applications]) => {
        const jobs = allJobs.filter((j) => j.employerId === user.id);
        setData({ jobs, applications });
      })
      .catch((err) => {
        console.error(err);
        toast.error('Ndodhi një gabim gjatë ngarkimit të të dhënave.');
      })
      .finally(() => setIsLoading(false));
  }, [user]);

  const handleDeleteJob = async (jobId: string) => {
    if (!user) return;
    try {
      await deleteMarketplaceJob(jobId, user);
      setData((prev) =>
        prev ? { ...prev, jobs: prev.jobs.filter((j) => j.id !== jobId) } : prev
      );
      toast.success('Puna u fshi me sukses.');
    } catch (err) {
      console.error(err);
      toast.error('Ndodhi një gabim gjatë fshirjes së punës.');
    }
  };

  const activeJobs = data?.jobs.filter((j) => j.status === 'active').length ?? 0;
  const totalApplications = data?.applications.length ?? 0;
  const newApplications = data?.applications.filter((a) => a.status === 'new').length ?? 0;
  const shortlisted = data?.applications.filter((a) => a.status === 'shortlisted').length ?? 0;
  const recentApplications = data?.applications.slice(0, 5) ?? [];

  return (
    <DashboardLayout title="Paneli i Punëdhënësit">
      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-28" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Punë Aktive</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeJobs}</div>
                  <p className="text-xs text-muted-foreground">nga {data?.jobs.length ?? 0} gjithsej</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aplikime Gjithsej</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalApplications}</div>
                  <p className="text-xs text-muted-foreground">të gjitha punët</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Të Reja</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{newApplications}</div>
                  <p className="text-xs text-muted-foreground">pa u shqyrtuar</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Të Listuara</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{shortlisted}</div>
                  <p className="text-xs text-muted-foreground">kandidatë të listuar</p>
                </CardContent>
              </Card>
            </>
          )}
      </div>

      {/* Jobs table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Punët e Mia</CardTitle>
              <CardDescription>Menaxhoni punët tuaja të publikuara</CardDescription>
            </div>
            <Button asChild>
              <Link to="/dashboard/employer/new-job">
                <Plus className="size-4 mr-2" />
                Shto Punë të Re
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (data?.jobs.length ?? 0) === 0 ? (
            <div className="flex flex-col items-center py-10 text-center text-muted-foreground">
              <FileText className="size-10 mb-3 opacity-40" />
              <p>Nuk keni publikuar asnjë punë ende.</p>
              <Button asChild variant="outline" className="mt-4">
                <Link to="/dashboard/employer/new-job">Krijo punën e parë</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {data!.jobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-medium text-foreground truncate">{job.title}</h3>
                      <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                        {job.status === 'active' ? 'Aktiv' : 'Pauzuar'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {job.location} · {formatSalary(job.salary)} · {job.applicationsCount} aplikime
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <Button asChild variant="outline" size="sm">
                      <Link to="/dashboard/employer/applications">Aplikimet</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteJob(job.id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent applications */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Aplikime të Fundit</CardTitle>
              <CardDescription>5 aplikimet më të reja</CardDescription>
            </div>
            {(data?.applications.length ?? 0) > 0 && (
              <Button asChild variant="outline" size="sm">
                <Link to="/dashboard/employer/applications">Shiko të gjitha</Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : recentApplications.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center text-muted-foreground">
              <FileText className="size-10 mb-3 opacity-40" />
              <p>Nuk ka aplikime të reja.</p>
              <p className="text-sm">Aplikimet do të shfaqen këtu kur kandidatët të aplikojnë.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium text-foreground text-sm">{app.candidateName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(app.createdAt).toLocaleDateString('sq-AL')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={app.status === 'rejected' ? 'destructive' : app.status === 'hired' ? 'default' : 'secondary'}>
                      {app.status === 'new' ? 'E Re' : app.status === 'reviewed' ? 'Shqyrtuar' : app.status === 'shortlisted' ? 'Listuar' : app.status === 'hired' ? 'Pranuar' : 'Refuzuar'}
                    </Badge>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/dashboard/employer/applications/${app.id}`}>Shiko</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
