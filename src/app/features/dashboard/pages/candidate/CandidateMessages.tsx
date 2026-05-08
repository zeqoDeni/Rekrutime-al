import { DashboardLayout } from '@/app/features/dashboard/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/shared/ui/card';
import { MessageSquare } from 'lucide-react';

// TODO: Implement Firestore-backed messaging (threads + messages subcollection).
// Not included in current paid scope. Hiding broken mock UI.
export default function CandidateMessages() {
  return (
    <DashboardLayout title="Mesazhet">
      <Card>
        <CardHeader>
          <CardTitle>Mesazhet</CardTitle>
          <CardDescription>Komunikimi direkt me punëdhënësit.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-16 text-center text-muted-foreground">
            <MessageSquare className="size-12 mb-4 opacity-40" />
            <p className="font-medium text-foreground">Sistemi i mesazheve është duke u zhvilluar</p>
            <p className="text-sm mt-2 max-w-sm">
              Mesazhet direkte me punëdhënësit do të aktivizohen së shpejti.
              Komunikoni nëpërmjet email-it për momentin.
            </p>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
