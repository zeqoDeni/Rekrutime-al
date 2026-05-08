import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/app/features/dashboard/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/shared/ui/card';
import { Button } from '@/app/shared/ui/button';
import { ArrowLeft, MessageSquare } from 'lucide-react';

// TODO: Implement Firestore-backed messaging (threads + messages subcollection).
// Not included in current paid scope.
export default function CandidateMessageDetail() {
  return (
    <DashboardLayout title="Detajet e Mesazhit">
      <div className="mb-6">
        <Button asChild variant="secondary" size="sm">
          <Link to="/dashboard/candidate/messages">
            <ArrowLeft className="size-4 mr-2" /> Kthehu te mesazhet
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Mesazh</CardTitle>
          <CardDescription>Detajet e mesazhit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-16 text-center text-muted-foreground">
            <MessageSquare className="size-12 mb-4 opacity-40" />
            <p className="font-medium text-foreground">Sistemi i mesazheve është duke u zhvilluar</p>
            <p className="text-sm mt-2">Mesazhet direkte do të aktivizohen së shpejti.</p>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
