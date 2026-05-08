# Rekrutime ATS/CRM Spec Snapshot

## Current Stack

- Frontend: Vite + React + TypeScript + Tailwind + Radix UI.
- Auth/Data: Firebase Auth + Firestore + Storage.
- Routing: React Router v6.
- Existing legacy B2C pages are preserved.
- New ATS/CRM platform is mounted at `/app/*`.

## Product Scope Implemented

- Multi-tenant organizations (`orgs/{orgId}`) and membership roles.
- CRM areas: clients and jobs.
- ATS areas: candidates, applicants pipeline stages, notes/tasks.
- Collaboration: team invite flow via callable Functions.
- Security baseline: Firestore and Storage rules for tenant isolation + RBAC.
- Reporting baseline: dashboard cards and average time-in-stage summary.

## Data Model

- `orgs/{orgId}`
  - `members/{uid}`
  - `clients/{clientId}`
  - `jobs/{jobId}`
    - `applicants/{applicantId}`
  - `candidates/{candidateId}`
  - `notes/{noteId}`
  - `tasks/{taskId}`
  - `activities/{activityId}`
  - `auditLog/{logId}`
- `userOrgs/{uid}/{orgId}`
- `invites/{inviteId}`

## Backend Privileged Ops

- Firebase Cloud Functions:
  - create/accept/revoke invite
  - change member role
  - sensitive deletes for org/client/job
  - applicant stage-change audit trigger

## Remaining Intentional Stubs

- Stripe billing checkout implementation.
- Production email provider wiring (currently mock adapter).
