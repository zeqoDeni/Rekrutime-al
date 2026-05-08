/**
 * Hero layout concepts considered:
 *
 * A) "Talent Network" — agency hub at center with candidate nodes orbiting it,
 *    connected by dashed lines to company badges on the right.
 *    Communicates: agency connects workers → employers.
 *
 * B) "Journey Flow" — horizontal pipeline: Apply → Screen → Interview → Hire,
 *    shown as large step icons connected by a path.
 *    Communicates: the full recruitment journey.
 *
 * Chosen: Concept A — more visually dynamic, immediately shows the agency's
 * role as the connector between workers and companies, works better on mobile.
 */

import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { heroStats } from '@/app/features/landing/data/landing';
import { Button } from '@/app/shared/ui/button';
import { SearchBar } from './SearchBar';

// ─── Illustration sub-components ────────────────────────────────────────────

function WorkerCard({
  initials,
  name,
  role,
  accent,
}: {
  initials: string;
  name: string;
  role: string;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border bg-card/95 px-3 py-2.5 shadow-md backdrop-blur-sm">
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
        style={{ background: accent }}
      >
        {initials}
      </div>
      <div className="min-w-0">
        <p className="truncate text-[12px] font-semibold text-foreground">{name}</p>
        <p className="truncate text-[11px] text-muted-foreground">{role}</p>
      </div>
    </div>
  );
}

function CompanyBadge({
  name,
  hired,
  accent,
}: {
  name: string;
  hired: number;
  accent: string;
}) {
  return (
    <div className="rounded-xl border bg-card/95 px-3.5 py-2.5 shadow-md backdrop-blur-sm">
      <p className="text-[12px] font-bold text-foreground">{name}</p>
      <div className="mt-1 flex items-center gap-1.5">
        <div
          className="flex size-4 items-center justify-center rounded-full text-white"
          style={{ background: accent }}
        >
          <svg viewBox="0 0 10 10" className="size-2.5" fill="none">
            <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-[11px] text-muted-foreground">{hired} të punësuar</span>
      </div>
    </div>
  );
}

function RecruitmentIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-[500px] select-none" aria-hidden="true">
      {/* Soft gradient canvas */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-violet-500/6 to-emerald-500/8 blur-sm" />

      {/* Decorative rings — centered on the hub */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="size-48 rounded-full border border-primary/10" />
      </div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="size-72 rounded-full border border-primary/5" />
      </div>

      {/* SVG connecting lines — drawn behind the cards */}
      <svg
        viewBox="0 0 500 380"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <marker id="arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L0,7 L7,3.5 z" fill="#10b981" fillOpacity="0.55" />
          </marker>
        </defs>

        {/* Workers → hub (dashed indigo) */}
        <path d="M 148 68  C 200 90  220 140 240 180" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="5 4" strokeOpacity="0.35" fill="none" />
        <path d="M 148 158 C 195 162 220 168 240 178" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="5 4" strokeOpacity="0.35" fill="none" />
        <path d="M 148 248 C 195 230 220 210 240 185" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="5 4" strokeOpacity="0.35" fill="none" />
        <path d="M 148 330 C 200 290 225 230 242 192" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="5 4" strokeOpacity="0.28" fill="none" />

        {/* Hub → companies (solid emerald with arrows) */}
        <path d="M 270 168 C 320 130 355 110 385 98"  stroke="#10b981" strokeWidth="1.8" strokeOpacity="0.5" fill="none" markerEnd="url(#arrow)" />
        <path d="M 272 182 C 330 182 360 182 385 185" stroke="#10b981" strokeWidth="1.8" strokeOpacity="0.5" fill="none" markerEnd="url(#arrow)" />
        <path d="M 270 196 C 320 240 355 260 385 268" stroke="#10b981" strokeWidth="1.8" strokeOpacity="0.45" fill="none" markerEnd="url(#arrow)" />

        {/* Dot at every worker end */}
        {[68, 158, 248, 330].map((y) => (
          <circle key={y} cx={148} cy={y} r="3.5" fill="#6366f1" fillOpacity="0.4" />
        ))}
        {/* Dot at every company end */}
        {[98, 185, 268].map((y) => (
          <circle key={y} cx={385} cy={y} r="3.5" fill="#10b981" fillOpacity="0.5" />
        ))}
      </svg>

      {/* Main layout grid */}
      <div className="relative flex items-center justify-between px-4 py-10">

        {/* LEFT — workers */}
        <div className="flex flex-col gap-3 w-40">
          <WorkerCard initials="AH" name="Arben Hoxha" role="Frontend Dev"    accent="#3b82f6" />
          <WorkerCard initials="BK" name="Besa Krasniqi" role="Product Mgr"   accent="#8b5cf6" />
          <WorkerCard initials="DS" name="Drita Sefa"    role="UI Designer"   accent="#f59e0b" />
          <WorkerCard initials="LP" name="Liri Popa"     role="Backend Dev"   accent="#ec4899" />
        </div>

        {/* CENTER — agency hub */}
        <div className="flex flex-col items-center gap-2 mx-2 shrink-0">
          {/* Glow ring */}
          <div className="relative flex items-center justify-center">
            <div className="absolute size-20 rounded-full bg-primary/20 blur-md" />
            <div className="relative flex size-16 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/40">
              <span className="text-2xl font-black text-white tracking-tight">R</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-[11px] font-bold text-foreground">Rekrutime</p>
            <p className="text-[10px] text-muted-foreground">Agjensia</p>
          </div>
        </div>

        {/* RIGHT — companies */}
        <div className="flex flex-col gap-3 w-36">
          <CompanyBadge name="BalkanPay" hired={3} accent="#10b981" />
          <CompanyBadge name="Aventus"   hired={2} accent="#10b981" />
          <CompanyBadge name="Patoko"    hired={1} accent="#10b981" />
        </div>
      </div>

      {/* Floating status badge */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border bg-card px-4 py-2 shadow-lg">
        <span className="size-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-semibold text-foreground whitespace-nowrap">6 punësime këtë muaj</span>
      </div>
    </div>
  );
}

// ─── Hero section ────────────────────────────────────────────────────────────

export function HeroSection() {
  return (
    <section className="relative border-b bg-background">
      {/* Background gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-indigo-500/6 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl gap-14 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-20 lg:px-8 lg:py-24">

        {/* ── Left: copy ── */}
        <div className="flex flex-col gap-8">
          <span className="w-fit rounded-full border bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Platforma #1 për agjenci rekrutimi
          </span>

          <div className="space-y-5">
            <h1 className="text-4xl font-bold leading-[1.07] tracking-tight text-foreground sm:text-5xl lg:text-[3.2rem]">
              Nga aplikimi{' '}
              <span className="text-primary">deri në punësim</span>
              {' '}— gjithçka në një platformë
            </h1>
            <p className="max-w-xl text-lg leading-8 text-muted-foreground">
              Platformë për agjenci që rekrutojnë dhe menaxhojnë punëtorë
              në shkallë të gjerë. ATS, CRM dhe pipeline — të integruara.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-md px-7 text-base">
              <a href="#jobs">
                Shiko punët
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-md px-7 text-base">
              <Link to="/signup">Regjistrohu falas</Link>
            </Button>
          </div>

          {/* Search bar */}
          <SearchBar />

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {heroStats.map((stat) => (
              <div key={stat.label} className="rounded-lg border bg-card px-4 py-3">
                <div className="text-xl font-bold text-foreground">{stat.value}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Trust row */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            {[
              'Pa kosto fillestare',
              'Setup në 5 minuta',
              'Të dhëna 100% të sigurta',
            ].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-green-500" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* ── Right: illustration ── */}
        <div className="flex items-center justify-center pb-6 lg:justify-end lg:pb-0">
          <RecruitmentIllustration />
        </div>
      </div>
    </section>
  );
}
