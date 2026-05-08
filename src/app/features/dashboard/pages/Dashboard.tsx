import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';
import { Navbar } from '@/app/shared/layout/Navbar';
import { Footer } from '@/app/shared/layout/Footer';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const dashboardPath =
        user.type === 'admin'
          ? '/admin'
          : user.type === 'employer'
          ? '/dashboard/employer'
          : '/dashboard/candidate';
      navigate(dashboardPath, { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Duke ngarkuar panelin...</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}