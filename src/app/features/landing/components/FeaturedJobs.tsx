import { Bookmark, CalendarDays, CheckCircle2, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { featuredJobs } from '@/app/features/landing/data/landing';
import { Badge } from '@/app/shared/ui/badge';
import { Button } from '@/app/shared/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/shared/ui/dialog';

export function FeaturedJobs() {
  return (
    <section className="bg-background py-16 sm:py-20" id="jobs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Punë të fundit</h2>
            <p className="mt-2 text-base leading-7 text-muted-foreground">
              Zgjidh role me pagë transparente dhe kompani aktive që po punësojnë realisht.
            </p>
          </div>
          <Button asChild variant="outline">
            <a href="#jobs">Shiko të gjitha rolet</a>
          </Button>
        </div>

        <div className="mt-8 overflow-hidden rounded-md border bg-card">
          {featuredJobs.map((job) => (
            <article
              className="grid gap-4 border-b p-5 last:border-b-0 md:grid-cols-[1.25fr_0.95fr_auto] md:items-center"
              key={`${job.company}-${job.title}`}
            >
              <div>
                <h3 className="text-xl font-semibold text-foreground">{job.title}</h3>
                <p className="mt-1 text-sm font-medium text-muted-foreground">{job.company}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="outline">{job.salary}</Badge>
                  <Badge variant="secondary">{job.type}</Badge>
                  <Badge variant="outline">{job.category}</Badge>
                </div>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  {job.location}
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4" />
                  {job.posted}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
                <Button asChild className="rounded-md">
                  <Link to={`/jobs?q=${encodeURIComponent(job.title)}`}>Apliko</Link>
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Detaje</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                      <DialogTitle>{job.title}</DialogTitle>
                      <DialogDescription>
                        {job.company} · {job.location}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{job.salary}</Badge>
                        <Badge variant="secondary">{job.type}</Badge>
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">{job.description}</p>
                      <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                        {job.requirements.map((requirement) => (
                          <li className="flex gap-2" key={requirement}>
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                            {requirement}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Mbyll</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button aria-label={`Ruaj ${job.title}`} size="icon" variant="ghost">
                  <Bookmark />
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
