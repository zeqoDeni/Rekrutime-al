import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/app/features/dashboard/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/shared/ui/card';
import { Badge } from '@/app/shared/ui/badge';
import { Button } from '@/app/shared/ui/button';
import { useAuth } from '@/app/context/AuthContext';
import { getMarketplaceJob, listApplicationsForEmployer, MarketplaceApplication } from '@/lib/marketplace';

export default function EmployerApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Array<MarketplaceApplication & { jobTitle: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    listApplicationsForEmployer(user)
      .then(async (records) =>
        Promise.all(
          records.map(async (application) => {
            const job = await getMarketplaceJob(application.jobId);
            return { ...application, jobTitle: job?.title || 'Punë e fshirë' };
          })
        )
      )
      .then(setApplications)
      .finally(() => setIsLoading(false));
  }, [user]);

  return (
    <DashboardLayout title="Aplikimet për Punëdhënësin">
      <Card>
        <CardHeader>
          <CardTitle>Aplikimet e fundit</CardTitle>
          <CardDescription>Menaxhoni kandidatët që kanë aplikuar për punëdhënien tuaj</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Duke ngarkuar aplikimet...</p>
          ) : applications.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nuk ka aplikime të reja.</p>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <div key={application.id} className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-foreground">{application.candidateName}</p>
                    <p className="text-sm text-muted-foreground">{application.jobTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      Aplikuar më {new Date(application.createdAt).toLocaleDateString('sq-AL')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge>{application.status}</Badge>
                    <Button asChild variant="outline">
                      <Link to={`/dashboard/employer/applications/${application.id}`}>Shiko kandidat</Link>
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
