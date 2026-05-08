import { describe, expect, it } from 'vitest';
import { getDashboardRoute } from './dashboardRoute';

describe('getDashboardRoute', () => {
  it('routes employers to the employer dashboard', () => {
    expect(getDashboardRoute({ type: 'employer' })).toBe('/dashboard/employer');
  });

  it('routes candidates to the candidate dashboard', () => {
    expect(getDashboardRoute({ type: 'candidate' })).toBe('/dashboard/candidate');
  });

  it('routes admins to the admin panel', () => {
    expect(getDashboardRoute({ type: 'admin' })).toBe('/admin');
  });
});
