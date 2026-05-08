import { Navigate } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.type !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
