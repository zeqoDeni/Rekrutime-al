import { useEffect } from 'react';
import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from '@/app/shared/ui/sonner';
import { ErrorBoundary } from '@/app/shared/routes/ErrorBoundary';
import Home from '@/app/features/landing/pages/Home';
import Jobs from '@/app/features/landing/pages/Jobs';
import Candidates from '@/app/features/landing/pages/Candidates';
import Login from '@/app/features/auth/pages/Login';
import Signup from '@/app/features/auth/pages/Signup';
import Dashboard from '@/app/features/dashboard/pages/Dashboard';
import EmployerDashboard from '@/app/features/dashboard/pages/employer/EmployerDashboard';
import EmployerApplications from '@/app/features/dashboard/pages/employer/EmployerApplications';
import EmployerApplicationDetail from '@/app/features/dashboard/pages/employer/EmployerApplicationDetail';
import EmployerAnalytics from '@/app/features/dashboard/pages/employer/EmployerAnalytics';
import EmployerProfile from '@/app/features/dashboard/pages/employer/EmployerProfile';
import EmployerCreateJob from '@/app/features/dashboard/pages/employer/EmployerCreateJob';
import CandidateDashboard from '@/app/features/dashboard/pages/candidate/CandidateDashboard';
import CandidateSaved from '@/app/features/dashboard/pages/candidate/CandidateSaved';
import CandidateMessages from '@/app/features/dashboard/pages/candidate/CandidateMessages';
import CandidateMessageDetail from '@/app/features/dashboard/pages/candidate/CandidateMessageDetail';
import CandidateProfile from '@/app/features/dashboard/pages/candidate/CandidateProfile';
import ProtectedRoute from '@/app/shared/routes/ProtectedRoute';
import AdminRoute from '@/app/admin/routes/AdminRoute';
import AdminDashboard from '@/app/admin/pages/AdminDashboard';
import AdminUsers from '@/app/admin/pages/AdminUsers';
import AdminJobs from '@/app/admin/pages/AdminJobs';
import AdminApplications from '@/app/admin/pages/AdminApplications';
import AppRoute from '@/app/platform/layout/AppRoute';
import AppLayout from '@/app/platform/layout/AppLayout';
import OnboardingPage from '@/app/platform/pages/OnboardingPage';
import AcceptInvitePage from '@/app/platform/pages/AcceptInvitePage';
import SelectOrgPage from '@/app/platform/pages/SelectOrgPage';
import PlatformDashboardPage from '@/app/platform/pages/PlatformDashboardPage';
import ClientsPage from '@/app/platform/pages/ClientsPage';
import JobsPage from '@/app/platform/pages/JobsPage';
import CandidatesPage from '@/app/platform/pages/CandidatesPage';
import CandidateNewPage from '@/app/platform/pages/CandidateNewPage';
import CandidateDetailPage from '@/app/platform/pages/CandidateDetailPage';
import SearchPage from '@/app/platform/pages/SearchPage';
import TeamSettingsPage from '@/app/platform/pages/TeamSettingsPage';
import BillingSettingsPage from '@/app/platform/pages/BillingSettingsPage';

function HashScroll() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;

    window.requestAnimationFrame(() => {
      const element = document.getElementById(hash.slice(1));
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [hash]);

  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Toaster richColors position="top-right" />
      <HashScroll />
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/candidates" element={<Candidates />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/employer" element={
        <ProtectedRoute requiredType="employer">
          <EmployerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/employer/applications" element={
        <ProtectedRoute requiredType="employer">
          <EmployerApplications />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/employer/applications/:id" element={
        <ProtectedRoute requiredType="employer">
          <EmployerApplicationDetail />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/employer/analytics" element={
        <ProtectedRoute requiredType="employer">
          <EmployerAnalytics />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/employer/profile" element={
        <ProtectedRoute requiredType="employer">
          <EmployerProfile />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/employer/new-job" element={
        <ProtectedRoute requiredType="employer">
          <EmployerCreateJob />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/candidate" element={
        <ProtectedRoute requiredType="candidate">
          <CandidateDashboard />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/candidate/saved" element={
        <ProtectedRoute requiredType="candidate">
          <CandidateSaved />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/candidate/messages" element={
        <ProtectedRoute requiredType="candidate">
          <CandidateMessages />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/candidate/messages/:id" element={
        <ProtectedRoute requiredType="candidate">
          <CandidateMessageDetail />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/candidate/profile" element={
        <ProtectedRoute requiredType="candidate">
          <CandidateProfile />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/admin/jobs" element={<AdminRoute><AdminJobs /></AdminRoute>} />
      <Route path="/admin/applications" element={<AdminRoute><AdminApplications /></AdminRoute>} />
      <Route path="/app" element={<AppRoute />}>
        <Route index element={<Navigate to="/app/select-org" replace />} />
        <Route path="onboarding" element={<OnboardingPage />} />
        <Route path="accept-invite" element={<AcceptInvitePage />} />
        <Route path="select-org" element={<SelectOrgPage />} />
        <Route path=":orgId" element={<AppLayout />}>
          <Route path="dashboard" element={<PlatformDashboardPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="candidates" element={<CandidatesPage />} />
          <Route path="candidates/new" element={<CandidateNewPage />} />
          <Route path="candidates/:candidateId" element={<CandidateDetailPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="settings/team" element={<TeamSettingsPage />} />
          <Route path="settings/billing" element={<BillingSettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Home />} />
      </Routes>
    </ErrorBoundary>
  );
}
