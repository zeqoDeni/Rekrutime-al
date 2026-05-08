import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Navbar } from './Navbar';
import type { User } from '@/lib/types/api';

const mockUseAuth = vi.fn();

vi.mock('@/app/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const baseAuth = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  authError: '',
  login: vi.fn(),
  signup: vi.fn(),
  logout: vi.fn(),
  updateProfile: vi.fn(),
  refreshAuth: vi.fn(),
};

function renderNavbar(user: User | null = null, isLoading = false) {
  mockUseAuth.mockReturnValue({
    ...baseAuth,
    user,
    isAuthenticated: Boolean(user),
    isLoading,
  });

  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );
}

function makeUser(type: User['type']): User {
  return {
    id: `${type}-1`,
    email: `${type}@example.com`,
    name: type === 'candidate' ? 'Candidate User' : 'Employer User',
    type,
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('Navbar', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it('shows login and signup links when logged out', () => {
    renderNavbar();

    expect(screen.getByRole('link', { name: 'Hyni' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'Regjistrohu' })).toHaveAttribute('href', '/signup');
    expect(screen.queryByRole('link', { name: 'Paneli' })).not.toBeInTheDocument();
  });

  it('renders homepage section links with hash targets', () => {
    renderNavbar();

    expect(screen.getByRole('link', { name: 'Punë' })).toHaveAttribute('href', '/#jobs');
    expect(screen.getByRole('link', { name: 'Kandidatë' })).toHaveAttribute('href', '/#candidates');
    expect(screen.getByRole('link', { name: 'Si funksionon' })).toHaveAttribute('href', '/#si-funksionon');
    expect(screen.getByRole('link', { name: 'Kompani' })).toHaveAttribute('href', '/#kompani');
  });

  it('does not show auth actions while auth state is loading', () => {
    renderNavbar(null, true);

    expect(screen.queryByRole('link', { name: 'Hyni' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Regjistrohu' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Paneli' })).not.toBeInTheDocument();
  });

  it('routes candidate panel link to the candidate dashboard', () => {
    renderNavbar(makeUser('candidate'));

    expect(screen.getByRole('link', { name: 'Paneli' })).toHaveAttribute('href', '/dashboard/candidate');
    expect(screen.queryByRole('link', { name: 'Hyni' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Regjistrohu' })).not.toBeInTheDocument();
  });

  it('routes employer panel link to the employer dashboard', () => {
    renderNavbar(makeUser('employer'));

    expect(screen.getByRole('link', { name: 'Paneli' })).toHaveAttribute('href', '/dashboard/employer');
    expect(screen.queryByRole('link', { name: 'Hyni' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Regjistrohu' })).not.toBeInTheDocument();
  });

  it('routes admin panel link to /admin', () => {
    renderNavbar(makeUser('admin'));

    expect(screen.getByRole('link', { name: 'Paneli' })).toHaveAttribute('href', '/admin');
    expect(screen.queryByRole('link', { name: 'Hyni' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Regjistrohu' })).not.toBeInTheDocument();
  });
});
