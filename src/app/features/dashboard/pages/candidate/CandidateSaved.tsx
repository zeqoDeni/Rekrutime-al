import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/app/features/dashboard/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/shared/ui/card';
import { Button } from '@/app/shared/ui/button';
import { Skeleton } from '@/app/shared/ui/skeleton';
import { Bookmark, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/app/context/AuthContext';
import {
  listSavedJobIds,
  listMarketplaceJobs,
  setSavedJob,
  formatSalary,
  type MarketplaceJob,
} from '@/lib/marketplace';

export default function CandidateSaved() {
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState<MarketplaceJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unsaving, setUnsaving] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    Promise.all([listSavedJobIds(user), listMarketplaceJobs()])
      .then(([savedIds, allJobs]) => {
        setSavedJobs(allJobs.filter((j) => savedIds.includes(j.id)));
      })
      .catch((err) => {
        console.error(err);
        toast.error('Ndodhi një gabim gjatë ngarkimit të punëve të ruajtura.');
      })
      .finally(() => setIsLoading(false));
  }, [user]);

  const handleUnsave = async (jobId: string) => {
    if (!user) return;
    setUnsaving(jobId);
    try {
      await setSavedJob(jobId, false, user);
      setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
      toast.success('Puna u hoq nga të ruajturat.');
    } catch (err) {
      console.error(err);
      toast.error('Ndodhi një gabim gjatë heqjes.');
    } finally {
      setUnsaving(null);
    }
  };

  return (
    <DashboardLayout title="Punët e Ruajtura">
      <Card>
        <CardHeader>
          <CardTitle>Punë të ruajtura</CardTitle>
          <CardDescription>Shikoni dhe menaxhoni punët që keni ruajtur.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : savedJobs.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center text-muted-foreground">
              <Bookmark className="size-12 mb-4 opacity-40" />
              <p className="font-medium">Nuk keni punë të ruajtura.</p>
              <p className="text-sm mt-1">Ruani punë nga lista e punëve për t'i gjetur lehtë.</p>
              <Button asChild variant="outline" className="mt-6">
                <Link to="/jobs">
                  <Search className="size-4 mr-2" />
                  Shfletoni punët
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {savedJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{job.title}</p>
                    <p className="text-sm text-muted-foreground">{job.company}</p>
                    <p className="text-sm font-medium text-foreground mt-1">
                      {formatSalary(job.salary)} · {job.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button asChild variant="outline" size="sm">
                      <Link to="/jobs">Apliko</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnsave(job.id)}
                      disabled={unsaving === job.id}
                    >
                      {unsaving === job.id ? 'Duke hequr...' : 'Hiq'}
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
