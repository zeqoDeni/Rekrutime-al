import { useState } from 'react';
import type { FormEvent } from 'react';
import { MapPin, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { categories, quickSearches } from '@/app/features/landing/data/landing';
import { Button } from '@/app/shared/ui/button';
import { Input } from '@/app/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/shared/ui/select';

export function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [category] = useState(categories[0]);
  const [location] = useState('Të gjitha');

  const goToJobs = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (category !== 'Të gjitha') params.set('category', category);
    if (location.trim() && location !== 'Të gjitha') params.set('location', location);

    navigate(`/jobs?${params.toString()}`);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    goToJobs();
  };

  return (
    <form
      aria-label="Kërko punë"
      className="w-full rounded-md border bg-card p-3 shadow-sm shadow-slate-900/5"
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_0.95fr_auto] md:items-end">
        <label className="flex min-w-0 flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Roli</span>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input className="h-11 rounded-md bg-background pl-9" placeholder="Frontend, Produkt, Marketing" />
          </div>
        </label>

        <label className="flex min-w-0 flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Vendndodhja</span>
          <div className="relative">
            <MapPin
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input className="h-11 rounded-md bg-background pl-9" placeholder="Tiranë, Durrës, Remote" />
          </div>
        </label>

        <label className="flex min-w-0 flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Kategoria</span>
          <Select defaultValue={categories[0]}>
            <SelectTrigger className="h-11 rounded-md bg-background">
              <SelectValue placeholder="Zgjidh kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </label>

        <Button className="h-11 rounded-md px-6">
          <Search data-icon="inline-start" />
          Kërko
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {quickSearches.map((item) => (
          <button
            className="rounded-full border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
            key={item}
            type="button"
            onClick={() => {
              setQuery(item);
              navigate(`/jobs?q=${encodeURIComponent(item)}`);
            }}
          >
            {item}
          </button>
        ))}
      </div>
    </form>
  );
}
