# Sprint 01: Dashboard & Data Integration

## Sprint Objective
Build the first major application sprint for Rekruti.me by converting the current static landing/app structure into a dynamically driven dashboard experience for both employers and candidates.

## Dates
- Start: May 6, 2026
- Target duration: 2-3 weeks

## Sprint Goals
- Stabilize dashboard routing and protected routes
- Build employer and candidate dashboard flows
- Integrate mock data through a central API layer
- Add profile and saved-job workflows
- Ensure the app builds cleanly and is runnable in development

## Today’s work
- Documented sprint goals and execution plan
- Started the implementation of data-driven dashboard pages
- Added a dedicated mock API endpoint for candidate saved jobs
- Began enhancing profile pages to use actual profile data
- Implemented employer job posting flow with a new create-job page and mock persistence

## Backlog
### High priority
- [x] Dashboard shell with role-based sidebar navigation
- [x] Employer dashboard overview + application list
- [x] Candidate dashboard overview + saved jobs flow
- [x] Profile editing pages for both roles
- [x] Mock API endpoints for dashboard data, saved jobs, and messages
- [x] Protected route enforcement for dashboard pages
- [x] Employer application detail page
- [x] Candidate messaging workflow / inbox

### Medium priority
- [x] Job posting creation/edit flow
- [x] Search filters and job discovery improvements
- [x] Job/posting discovery and saved search
- [ ] Persistent user state and form validation

### Low priority
- [ ] Analytics and charts
- [ ] Admin controls or moderation
- [ ] Interview scheduling and notifications

## Execution plan
1. Audit current app routes, auth, and dashboard components
2. Implement mock API data fetches for dashboard pages
3. Build the first working employer/candidate dashboard experience
4. Add real profile and saved-job pages
5. Validate with `npm run build` and browser testing

## Current status
- Sprint is in progress
- Dashboard pages exist and are wired into routes
- Employer job creation flow is implemented with mock persistence
- Candidate saved jobs now load from mock API
- Profile pages load and save user data
- Next task: build employer application workflow and candidate messaging/inbox experience
