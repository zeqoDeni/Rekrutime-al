import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/app/features/dashboard/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/shared/ui/card';
import { Button } from '@/app/shared/ui/button';
import { Badge } from '@/app/shared/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/shared/ui/select';
import { Skeleton } from '@/app/shared/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/app/context/AuthContext';
import {
  getApplicationForEmployer,
  getMarketplaceJob,
  updateMarketplaceApplicationStatus,
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

export default function EmployerApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [application, setApplication] = useState<MarketplaceApplication | null>(null);
  const [job, setJob] = useState<MarketplaceJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<MarketplaceApplicationStatus>('new');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!user || !id) return;
    setIsLoading(true);
    getApplicationForEmployer(id, user)
      .then(async (app) => {
        if (!app) return;
        setApplication(app);
        setSelectedStatus(app.status);
        const jobDoc = await getMarketplaceJob(app.jobId);
        setJob(jobDoc);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Ndodhi një gabim gjatë ngarkimit të aplikimit.');
      })
      .finally(() => setIsLoading(false));
  }, [user, id]);

  const handleStatusUpdate = async () => {
    if (!user || !application || selectedStatus === application.status) return;
    setIsUpdating(true);
    try {
      const updated = await updateMarketplaceApplicationStatus(application.id, selectedStatus, user);
      setApplication(updated);
      toast.success('Statusi u përditësua me sukses!');
    } catch (err) {
      console.error(err);
      toast.error('Ndodhi një gabim gjatë përditësimit të statusit.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DashboardLayout title="Detajet e Aplikimit">
      <div className="mb-6">
        <Button asChild variant="secondary" size="sm">
          <Link to="/dashboard/employer/applications">
            <ArrowLeft className="size-4 mr-2" /> Kthehu te aplikimet
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isLoading ? <Skeleton className="h-6 w-48" /> : (application?.candidateName ?? 'Detajet e aplikimit')}
          </CardTitle>
          <CardDescription>
            {isLoading ? <Skeleton className="h-4 w-32 mt-1" /> : `Aplikimi për pozicionin ${job?.title ?? ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : !application ? (
            <p className="text-sm text-destructive">Aplikimi nuk u gjet ose nuk keni leje ta shihni.</p>
          ) : (
            <div className="space-y-6">
              {/* Status + timestamps */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border bg-muted p-4">
                  <p className="text-sm text-muted-foreground">Statusi aktual</p>
                  <div className="mt-2">
                    <StatusBadge status={application.status} />
                  </div>
                  {application.updatedAt !== application.createdAt && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Ndërruar më {new Date(application.updatedAt).toLocaleDateString('sq-AL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
                <div className="rounded-lg border bg-muted p-4">
                  <p className="text-sm text-muted-foreground">Data e aplikimit</p>
                  <p className="mt-2 font-medium text-foreground">
                    {new Date(application.createdAt).toLocaleDateString('sq-AL', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Contact info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Email i kandidatit</p>
                  <p className="font-medium text-foreground">{application.candidateEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Emri i kandidatit</p>
                  <p className="font-medium text-foreground">{application.candidateName}</p>
                </div>
              </div>

              {/* Experience */}
              {application.experience && (
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Përmbledhje përvojash</p>
                  <p className="mt-2 text-foreground whitespace-pre-line">{application.experience}</p>
                </div>
              )}

              {/* Cover letter */}
              {application.coverLetter && (
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Letër motivimi</p>
                  <p className="mt-2 text-foreground whitespace-pre-line">{application.coverLetter}</p>
                </div>
              )}

              {/* Status update */}
              <div className="rounded-lg border p-4 space-y-3">
                <p className="text-sm font-medium">Ndrysho statusin e aplikimit</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Select
                    value={selectedStatus}
                    onValueChange={(val) => setSelectedStatus(val as MarketplaceApplicationStatus)}
                  >
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(STATUS_LABELS) as MarketplaceApplicationStatus[]).map((s) => (
                        <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleStatusUpdate}
                    disabled={isUpdating || selectedStatus === application.status}
                  >
                    {isUpdating ? 'Po ruhet...' : 'Ruaj statusin'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
