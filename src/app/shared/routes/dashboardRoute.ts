import { User } from '@/lib/types/api';

export function getDashboardRoute(user: Pick<User, 'type'>) {
  if (user.type === 'admin') return '/admin';
  if (user.type === 'employer') return '/dashboard/employer';
  return '/dashboard/candidate';
}
