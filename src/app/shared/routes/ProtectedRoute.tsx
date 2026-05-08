import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredType?: 'employer' | 'candidate';
}

export default function ProtectedRoute({ children, requiredType }: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admins can access any protected route
  if (user.type === 'admin') {
    return <>{children}</>;
  }

  if (requiredType && user.type !== requiredType) {
    const redirectPath = user.type === 'employer' ? '/dashboard/employer' : '/dashboard/candidate';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}