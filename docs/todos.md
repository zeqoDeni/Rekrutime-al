# Client Delivery Checklist

## Persistence

- [x] Replace dashboard/marketplace `mockApi` usage with Firestore-backed services.
- [x] Add Firestore-backed marketplace service for jobs, applications, saved jobs, and saved searches.
- [x] Add employer job create/update/delete service functions with ownership checks.
- [x] Persist candidate/employer profile edits and reload from Firestore (`updateUserName` in userProfile.ts).
- [ ] Remove random/mock-only dashboard metrics from client-facing pages. *(done for job boards — no random stats remain)*

## Applications

- [x] Add service function for candidate applications.
- [x] Prevent duplicate applications per candidate/job in service layer.
- [x] Employer can list applications for their jobs (EmployerApplications.tsx).
- [x] Employer application detail view loads real candidate/job/application data (EmployerApplicationDetail.tsx).
- [x] Employer can update application status: `new`, `reviewed`, `shortlisted`, `rejected`, `hired`.
- [x] Status update timestamp (`updatedAt`) shown in detail view.

## Search

- [x] Advanced job filters: location, salary range, experience level, job type.
- [x] Sort and query persisted in URL/localStorage.
- [x] Clear-all filters action.
- [x] Mobile responsive search/filter controls.

## Saved Searches

- [x] Candidate can save current search configuration.
- [x] Candidate can load saved searches.
- [x] Candidate can delete saved searches.
- [x] Empty state for saved searches (CandidateSaved.tsx with Bookmark icon + call-to-action).

## Employer Dashboard

- [x] Real job list from Firestore (employer-scoped).
- [x] Real application counts and breakdown by status.
- [x] Recent applications list with links to detail views.
- [x] Delete job from dashboard.

## Candidate Dashboard

- [x] Real applications list from Firestore.
- [x] Real saved jobs list from Firestore.
- [x] Stats cards (applications, saved jobs, shortlisted, hired).
- [x] Empty states with call-to-action links.

## Job Creation

- [x] EmployerCreateJob uses `createMarketplaceJob` (real Firestore) instead of mockApi.
- [x] Form updated with numeric salary fields, job type select, experience field.

## Backend

- [x] Firebase-first marketplace backend (Firestore + security rules).
- [x] Firestore rules for marketplace jobs/applications/saved jobs/saved searches.
- [x] Firebase Functions reserved for privileged email/invite/ops actions.
- [ ] Document Node 20 requirement for Firebase CLI/functions deployment.

## Messaging

- [ ] Implement Firestore messaging (threads + messages subcollection).
  *Not in current paid scope. CandidateMessages + CandidateMessageDetail show "coming soon" stub.*

## Admin/Ops

- [ ] Add `/admin` or `/ops` route.
- [ ] Agency owner can quickly view jobs, applications, and users.
- [ ] Protect ops route to appropriate role/allowlist.

## Tests

- [x] Tests for employer job CRUD permissions (`marketplace.service.test.ts`).
- [x] Tests for application status update + permissions (`marketplace.service.test.ts`).
- [x] Tests for profile write service layer (`userProfile.test.ts`).
- [x] Tests for createJobSchema validation (`schemas/validation.test.ts`).
- [x] Tests for marketplace filtering/sorting (`marketplace.test.ts`).
- [x] All quality gates green: typecheck ✅ lint ✅ test (32/32) ✅ build ✅

## Docs

- [ ] Update `.env.example` if new env vars are introduced.
- [ ] Update `README.md` run/deploy instructions.
- [ ] Add Client Handoff section: setup, roles, posting jobs, applying, reviewing applications.
