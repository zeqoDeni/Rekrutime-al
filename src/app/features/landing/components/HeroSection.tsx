import { ArrowRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/app/shared/ui/button';
import { SearchBar } from './SearchBar';

const PREVIEW_JOBS = [
  {
    company: 'BalkanPay',
    initial: 'B',
    color: '#3b82f6',
    role: 'Senior Frontend Engineer',
    location: 'Tiranë',
    salaryLabel: 'EUR 2,000+',
    tags: ['React', 'TypeScript'],
    featured: true,
  },
  {
    company: 'Aventus',
    initial: 'A',
    color: '#8b5cf6',
    role: 'Product Manager',
    location: 'Tiranë',
    salaryLabel: 'EUR 1,700+',
    tags: ['Roadmap', 'Analytics'],
    featured: false,
  },
  {
    company: 'Patoko',
    initial: 'P',
    color: '#f59e0b',
    role: 'Growth Marketing Lead',
    location: 'Remote',
    salaryLabel: 'EUR 1,400+',
    tags: ['Paid Ads', 'CRM'],
    featured: false,
  },
] as const;

function JobPreviewCard({
  company,
  initial,
  color,
  role,
  location,
  salaryLabel,
  tags,
  featured,
}: (typeof PREVIEW_JOBS)[number]) {
  return (
    <div
      className={[
        'rounded-xl border bg-card p-4 transition-shadow',
        featured
          ? 'shadow-lg shadow-primary/10 ring-1 ring-primary/15'
          : 'shadow-sm',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
            style={{ background: color }}
          >
            {initial}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{company}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3" />
              {location}
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          {salaryLabel}
        </span>
      </div>

      <p className="mt-3 text-[15px] font-semibold leading-snug text-foreground">{role}</p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border px-2 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
        {featured && (
          <Link
            to="/jobs"
            className="shrink-0 text-xs font-semibold text-primary hover:underline"
          >
            Apliko →
          </Link>
        )}
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="border-b bg-background">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_0.88fr] lg:items-center lg:gap-16 lg:px-8 lg:py-28">

        {/* Left — copy */}
        <div className="flex flex-col gap-8">
          <div className="space-y-5">
            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
              Punë me pagë{' '}
              <span className="text-primary">transparente</span>{' '}
              në Shqipëri.
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
              Role aktive, kompani reale. Apliko pa email-e të panevojshme.
            </p>
          </div>

          <SearchBar />

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-12 rounded-lg px-7 text-base">
              <Link to="/jobs">
                Shfleto rolet
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="h-12 px-7 text-base">
              <Link to="/signup">Regjistrohu falas</Link>
            </Button>
          </div>
        </div>

        {/* Right — job card preview */}
        <div className="hidden lg:block">
          <div className="rounded-2xl border bg-muted/50 p-5 [background-image:radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:22px_22px]">
            <div className="flex flex-col gap-3">
              {PREVIEW_JOBS.map((job) => (
                <JobPreviewCard key={job.company} {...job} />
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between px-1">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="inline-block size-2 animate-pulse rounded-full bg-green-500" />
                1,500+ role aktive
              </p>
              <Link
                to="/jobs"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Shiko të gjitha →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
