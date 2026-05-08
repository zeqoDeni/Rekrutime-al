import { useState } from 'react';
import { Clock3, MapPin, Search, WalletCards } from 'lucide-react';
import { featuredCandidates } from '@/app/features/landing/data/landing';
import { Badge } from '@/app/shared/ui/badge';
import { Button } from '@/app/shared/ui/button';
import { Input } from '@/app/shared/ui/input';
import { Navbar } from '@/app/shared/layout/Navbar';
import { Footer } from '@/app/shared/layout/Footer';
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

export default function Candidates() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCandidates = featuredCandidates.filter(candidate => {
    const matchesSearch = candidate.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         candidate.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Kandidatë</h1>
            <p className="mt-2 text-base leading-7 text-muted-foreground">
              Gjeni kandidatë të talentuar dhe të gatshëm për punësim.
            </p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Kërko role, aftësi, ose fjalë kyçe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Results count */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              {filteredCandidates.length} kandidatë të gjetur
            </p>
          </div>

          {/* Candidates Grid */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredCandidates.map((candidate) => (
              <article className="rounded-lg border bg-card p-6 shadow-sm" key={`${candidate.role}-${candidate.location}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{candidate.role}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{candidate.experience}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{candidate.expectedSalary}</span>
                </div>

                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{candidate.summary}</p>

                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <MapPin className="size-4" />
                    {candidate.location}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock3 className="size-4" />
                    {candidate.availability}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="mt-5 w-full rounded-md" variant="outline">
                      Shiko profilin
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                      <DialogTitle>{candidate.role}</DialogTitle>
                      <DialogDescription>
                        {candidate.experience} · {candidate.location}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <p className="text-sm leading-6 text-muted-foreground">{candidate.summary}</p>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-md border bg-card p-3">
                          <MapPin className="size-4 text-primary" />
                          <p className="mt-2 text-xs text-muted-foreground">Vendndodhja</p>
                          <p className="text-sm font-semibold text-foreground">{candidate.location}</p>
                        </div>
                        <div className="rounded-md border bg-card p-3">
                          <Clock3 className="size-4 text-primary" />
                          <p className="mt-2 text-xs text-muted-foreground">Disponueshmëria</p>
                          <p className="text-sm font-semibold text-foreground">{candidate.availability}</p>
                        </div>
                        <div className="rounded-md border bg-card p-3">
                          <WalletCards className="size-4 text-primary" />
                          <p className="mt-2 text-xs text-muted-foreground">Pritshmëria</p>
                          <p className="text-sm font-semibold text-foreground">{candidate.expectedSalary}</p>
                        </div>
                      </div>
                      <div className="rounded-md border bg-muted p-4 text-sm text-muted-foreground">
                        Preferenca e punës: <span className="font-medium text-foreground">{candidate.preferredWork}</span>
                      </div>
                    </div>

                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Mbyll</Button>
                      </DialogClose>
                      <Button disabled>Kontaktimi së shpejti</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </article>
            ))}
          </div>

          {filteredCandidates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nuk u gjetën kandidatë që përputhen me kriteret tuaja.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}