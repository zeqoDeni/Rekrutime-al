
# Rekrutime — Platformë ATS + CRM për Agjenci Rekrutimi

Rekrutime kombinon faqe publike pune, ATS dhe CRM kandidatësh në një produkt të vetëm për agjenci shqiptare.

## Stack

| Layer | Teknologjia |
|-------|-------------|
| Frontend | React 18 + TypeScript + Vite |
| UI | Tailwind CSS + shadcn/ui (Radix UI) |
| Routing | React Router v6 |
| Backend | Firebase (Firestore + Auth + Storage) |
| Functions | Firebase Cloud Functions (ops të privilegjuara) |
| Testing | Vitest + Testing Library |
| Hosting | Vercel (rekomanduar) |

## Setup lokal

```bash
npm install
cp .env.example .env.local   # plotësoni vlerat Firebase
npm run dev                  # http://localhost:5173
```

Vlerat Firebase gjenden te [Firebase Console](https://console.firebase.google.com) → Project Settings → Your apps.

## Skriptet

| Komanda | Funksioni |
|---------|-----------|
| `npm run dev` | Server zhvillimi |
| `npm run build` | Build prodhimi |
| `npm run lint` | ESLint |
| `npm run test` | Smoke tests |
| `npm run typecheck` | TypeScript check |
| `npm run firebase:emulators` | Emulatorë lokal (auth/firestore/storage/functions) |

## Krijimi i llogarisë admin

1. Regjistrohuni te `/signup`
2. Gjeni UID te Firebase Console → Authentication
3. Firestore → `users/{uid}` → ndryshoni `type` në `"admin"`
4. Hyni sërish → akses te `/admin`

## Deploy në Vercel

```bash
npm i -g vercel
vercel          # preview
vercel --prod   # prodhim
```

Shtoni të njëjtat variabla mjedisi te Vercel Dashboard → Settings → Environment Variables.

## Deploy Firebase (rules + functions)

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage,functions
```

## Route-t kryesore

| Route | Funksioni |
|-------|-----------|
| `/` | Faqja publike (landing) |
| `/jobs` | Listë publike punësh |
| `/candidates` | Listë publike kandidatësh |
| `/login` `/signup` | Autentifikim |
| `/dashboard/candidate/*` | Paneli i kandidatit |
| `/dashboard/employer/*` | Paneli i punëdhënësit |
| `/admin/*` | Admin i platformës |
| `/app/select-org` | Zgjedhje workspace |
| `/app/:orgId/dashboard` | KPI agjenci |
| `/app/:orgId/candidates` | CRM kandidatësh |
| `/app/:orgId/jobs` | ATS + pipeline |
| `/app/:orgId/clients` | Klientët |
| `/app/:orgId/settings/team` | Ekipi + ftesat |
| `/app/:orgId/settings/billing` | Abonimi |

## Indekset Firestore të nevojshme

Krijoni indeksin kompozit nëse shfaqet gabim `requires an index`:
- Koleksioni `marketplaceApplications`: `employerId ASC + createdAt DESC`

Klikoni linkun në konsolën e browserit për ta krijuar automatikisht.

## Shënime

- Firestore paths: `orgs/{orgId}`, anëtarë te `orgs/{orgId}/members/{uid}`, referenca te `userOrgs/{userId}/memberships/{orgId}`
- Email dhe Stripe janë scaffold — nuk janë të lidhur
- Mesazhet janë UI-only — backend nuk është implementuar
