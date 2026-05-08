import { DashboardLayout } from '@/app/features/dashboard/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/shared/ui/card';
import { BarChart3, Users, Briefcase, TrendingUp } from 'lucide-react';

export default function EmployerAnalytics() {
  return (
    <DashboardLayout title="Statistikat e Punëdhënësit">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Shikime të punëve</CardTitle>
            <CardDescription>Sa shikime kanë marrë njoftimet e punës.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <BarChart3 className="size-6 text-primary" />
              <div>
                <p className="text-3xl font-semibold text-foreground">1,240</p>
                <p className="text-sm text-muted-foreground">+18% krahasuar me javën e kaluar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aplikime të reja</CardTitle>
            <CardDescription>Sa aplikime kanë ardhur për ofertat tuaja.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Users className="size-6 text-emerald-500" />
              <div>
                <p className="text-3xl font-semibold text-foreground">35</p>
                <p className="text-sm text-muted-foreground">+12% krahasuar me muajin e kaluar</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Konvertimet e kandidateve</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <TrendingUp className="size-6 text-blue-500" />
              <div>
                <p className="text-3xl font-semibold text-foreground">12.5%</p>
                <p className="text-sm text-muted-foreground">Rritje e angazhimit për ofertat tuaja</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Punë aktive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Briefcase className="size-6 text-violet-500" />
              <div>
                <p className="text-3xl font-semibold text-foreground">3</p>
                <p className="text-sm text-muted-foreground">Njoftime aktuale aktive</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
