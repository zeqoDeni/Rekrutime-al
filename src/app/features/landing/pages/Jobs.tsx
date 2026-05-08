import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bookmark, CalendarDays, MapPin, Search } from 'lucide-react';
import { featuredJobs, categories, quickSearches } from '@/app/features/landing/data/landing';
import { useAuth } from '@/app/context/AuthContext';
import { Badge } from '@/app/shared/ui/badge';
import { Button } from '@/app/shared/ui/button';
import { Input } from '@/app/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/shared/ui/select';
import { Navbar } from '@/app/shared/layout/Navbar';
import { Footer } from '@/app/shared/layout/Footer';
import { SkeletonJobList } from '@/app/shared/feedback/SkeletonLoaders';
import {
  defaultJobFilters,
  deleteSavedSearch,
  filterAndSortJobs,
  formatSalary,
  JobFilters,
  listApplicationsForCandidate,
  listMarketplaceJobs,
  listSavedJobIds,
  listSavedSearches,
  MarketplaceJob,
  saveSearch,
  setSavedJob,
  SavedSearch,
} from '@/lib/marketplace';
import { toast } from 'sonner';
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
import { ApplyDialog } from '@/app/features/landing/components/ApplyDialog';

const FILTER_STORAGE_KEY = 'rekrutime_job_filters';
const LOCAL_SAVED_SEARCHES_KEY = 'rekrutime_saved_searches';

function featuredJobToMarketplaceJob(job: (typeof featuredJobs)[number], index: number): MarketplaceJob {
  const salaryNumbers = job.salary.match(/\d[\d,.]*/g)?.map((value) => Number(value.replace(/[,.]/g, ''))) || [];
  return {
    id: `featured-${index}`,
    title: job.title,
    company: job.company,
    description: job.description,
    location: job.location,
    salary: {
      min: salaryNumbers[0] || 1000,
      max: salaryNumbers[1] || salaryNumbers[0] || 2000,
      currency: 'EUR',
    },
    type: job.type as MarketplaceJob['type'],
    category: job.category,
    experience: 'Mid',
    requirements: job.requirements,
    employerId: `featured-employer-${index}`,
    createdAt: new Date(Date.now() - index * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - index * 86400000).toISOString(),
    applicationsCount: 0,
    savedCount: 0,
    status: 'active',
  };
}

function getInitialFilters(searchParams: URLSearchParams): JobFilters {
  const stored = localStorage.getItem(FILTER_STORAGE_KEY);
  const parsed = stored ? (JSON.parse(stored) as Partial<JobFilters>) : {};

  return {
    ...defaultJobFilters,
    ...parsed,
    query: searchParams.get('q') ?? parsed.query ?? '',
    category: searchParams.get('category') ?? parsed.category ?? 'Të gjitha',
    location: searchParams.get('location') ?? parsed.location ?? 'Të gjitha',
    type: searchParams.get('type') ?? parsed.type ?? 'Të gjitha',
  };
}

export default function Jobs() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [filters, setFilters] = useState<JobFilters>(() => getInitialFilters(searchParams));
  const [jobs, setJobs] = useState<MarketplaceJob[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const locations = useMemo(
    () => ['Të gjitha', ...Array.from(new Set(jobs.map((job) => job.location)))],
    [jobs]
  );

  const jobTypes = useMemo(
    () => ['Të gjitha', ...Array.from(new Set(jobs.map((job) => job.type)))],
    [jobs]
  );

  const experienceLevels = useMemo(
    () => ['Të gjitha', ...Array.from(new Set(jobs.map((job) => job.experience).filter(Boolean)))],
    [jobs]
  );

  useEffect(() => {
    setIsLoading(true);
    listMarketplaceJobs()
      .then((records) => setJobs(records.length > 0 ? records : featuredJobs.map(featuredJobToMarketplaceJob)))
      .catch((error) => {
        console.error('Error loading jobs:', error);
        setJobs(featuredJobs.map(featuredJobToMarketplaceJob));
        toast.error('Punët nuk u ngarkuan nga serveri. Po shfaqen të dhëna rezervë.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (user?.type === 'candidate') {
      listSavedSearches(user).then(setSavedSearches).catch(() => setSavedSearches([]));
      listSavedJobIds(user).then(setSavedJobIds).catch(() => setSavedJobIds([]));
      listApplicationsForCandidate(user)
        .then((apps) => setAppliedJobIds(new Set(apps.map((a) => a.jobId))))
        .catch(() => {});
      return;
    }

    const stored = localStorage.getItem(LOCAL_SAVED_SEARCHES_KEY);
    if (stored) {
      const localSearches = JSON.parse(stored) as Array<{
        id: string;
        label: string;
        term: string;
        category: string;
        location: string;
        type: string;
      }>;
      setSavedSearches(
        localSearches.map((search) => ({
          id: search.id,
          userId: 'local',
          label: search.label,
          query: search.term,
          category: search.category,
          location: search.location,
          type: search.type,
          experience: 'Të gjitha',
          salaryMin: null,
          salaryMax: null,
          sort: 'newest',
          createdAt: new Date().toISOString(),
        }))
      );
    }
  }, [user]);

  useEffect(() => {
    setFilters((current) => ({
      ...current,
      query: searchParams.get('q') ?? current.query,
      category: searchParams.get('category') ?? current.category,
      location: searchParams.get('location') ?? current.location,
      type: searchParams.get('type') ?? current.type,
    }));
  }, [searchParams]);

  useEffect(() => {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const updateFilter = <Key extends keyof JobFilters>(key: Key, value: JobFilters[Key]) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const saveCurrentSearch = async () => {
    const labelParts = [];
    if (filters.query) labelParts.push(`"${filters.query}"`);
    if (filters.category !== 'Të gjitha') labelParts.push(filters.category);
    if (filters.location !== 'Të gjitha') labelParts.push(filters.location);
    if (filters.type !== 'Të gjitha') labelParts.push(filters.type);
    if (filters.experience !== 'Të gjitha') labelParts.push(filters.experience);
    const label = labelParts.length > 0 ? labelParts.join(' · ') : 'Kërkim i përgjithshëm';

    const nextSearch = {
      id: String(Date.now()),
      userId: user?.id || 'local',
      label,
      query: filters.query,
      category: filters.category,
      location: filters.location,
      type: filters.type,
      experience: filters.experience,
      salaryMin: filters.salaryMin,
      salaryMax: filters.salaryMax,
      sort: filters.sort,
      createdAt: new Date().toISOString(),
    }

    const persistedSearch =
      user?.type === 'candidate'
        ? await saveSearch(
            {
              label,
              query: filters.query,
              category: filters.category,
              location: filters.location,
              type: filters.type,
              experience: filters.experience,
              salaryMin: filters.salaryMin,
              salaryMax: filters.salaryMax,
              sort: filters.sort,
            },
            user
          )
        : nextSearch;
    const nextSavedSearches = [persistedSearch, ...savedSearches].slice(0, 5);
    setSavedSearches(nextSavedSearches);
    if (!user) localStorage.setItem(LOCAL_SAVED_SEARCHES_KEY, JSON.stringify(nextSavedSearches));
    toast.success('Kërkimi u ruajt.');
  };

  const applySavedSearch = (search: SavedSearch) => {
    setFilters({
      query: search.query,
      category: search.category,
      location: search.location,
      type: search.type,
      experience: search.experience,
      salaryMin: search.salaryMin,
      salaryMax: search.salaryMax,
      sort: search.sort,
    });
  };

  const removeSavedSearch = async (search: SavedSearch) => {
    if (user?.type === 'candidate') await deleteSavedSearch(search.id, user);
    const nextSavedSearches = savedSearches.filter((item) => item.id !== search.id);
    setSavedSearches(nextSavedSearches);
    if (!user) localStorage.setItem(LOCAL_SAVED_SEARCHES_KEY, JSON.stringify(nextSavedSearches));
  };

  const toggleSavedJob = async (job: MarketplaceJob) => {
    if (!user || user.type !== 'candidate') {
      toast.error('Hyni si kandidat për të ruajtur punë.');
      return;
    }
    const isSaved = savedJobIds.includes(job.id);
    await setSavedJob(job.id, !isSaved, user);
    setSavedJobIds((current) => (isSaved ? current.filter((id) => id !== job.id) : [...current, job.id]));
    toast.success(isSaved ? 'Puna u hoq nga të ruajturat.' : 'Puna u ruajt.');
  };

  const clearFilters = () => setFilters(defaultJobFilters);
  const filteredJobs = filterAndSortJobs(jobs, filters);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Punë</h1>
            <p className="mt-2 text-base leading-7 text-muted-foreground">
              Gjeni punën tuaj të ëndrrave nga kompanitë më të mira në Shqipëri.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Kërko punë, kompani, ose fjalë kyçe..."
                  value={filters.query}
                  onChange={(e) => updateFilter('query', e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Kategoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.location} onValueChange={(value) => updateFilter('location', value)}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Vendndodhja" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Tipi i punës" />
                </SelectTrigger>
                <SelectContent>
                  {jobTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Select value={filters.experience} onValueChange={(value) => updateFilter('experience', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Eksperienca" />
                </SelectTrigger>
                <SelectContent>
                  {experienceLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                inputMode="numeric"
                placeholder="Paga min."
                value={filters.salaryMin ?? ''}
                onChange={(event) =>
                  updateFilter('salaryMin', event.target.value ? Number(event.target.value) : null)
                }
              />
              <Input
                inputMode="numeric"
                placeholder="Paga max."
                value={filters.salaryMax ?? ''}
                onChange={(event) =>
                  updateFilter('salaryMax', event.target.value ? Number(event.target.value) : null)
                }
              />
              <Select value={filters.sort} onValueChange={(value) => updateFilter('sort', value as JobFilters['sort'])}>
                <SelectTrigger>
                  <SelectValue placeholder="Renditja" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Më të rejat</SelectItem>
                  <SelectItem value="salary-high">Paga më e lartë</SelectItem>
                  <SelectItem value="salary-low">Paga më e ulët</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" type="button" onClick={clearFilters}>
                Pastro filtrat
              </Button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {quickSearches.map((item) => (
                  <Button key={item} variant="outline" size="sm" onClick={() => updateFilter('query', item)}>
                    {item}
                  </Button>
                ))}
              </div>
              <Button variant="secondary" type="button" onClick={saveCurrentSearch}>
                Ruaj kriteret e kërkimit
              </Button>
            </div>
          </div>

          {savedSearches.length > 0 && (
            <div className="mb-6 rounded-xl border bg-card p-4">
              <p className="mb-3 text-sm font-medium text-foreground">Kërkimet e ruajtura</p>
              <div className="flex flex-wrap gap-2">
                {savedSearches.map((search) => (
                  <div key={search.id} className="flex items-center gap-1 rounded-md border px-1">
                    <Button variant="ghost" size="sm" onClick={() => applySavedSearch(search)}>
                      {search.label}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => removeSavedSearch(search)}>
                      Fshi
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results count */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              {filteredJobs.length} punë të gjetura
            </p>
          </div>

          {/* Jobs List */}
          <div className="space-y-4">
            {isLoading ? (
              <SkeletonJobList />
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
              <article
                className="rounded-lg border bg-card p-6 shadow-sm"
                key={job.id}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground">{job.title}</h3>
                    <p className="mt-1 text-sm font-medium text-muted-foreground">{job.company}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{job.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="outline">{formatSalary(job.salary)}</Badge>
                      <Badge variant="secondary">{job.type}</Badge>
                      <Badge variant="outline">{job.category}</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="size-4" />
                        {new Date(job.createdAt).toLocaleDateString('sq-AL')}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                    <ApplyDialog
                      job={job}
                      isApplied={appliedJobIds.has(job.id)}
                      onApplied={(id) =>
                        setAppliedJobIds((prev) => new Set([...prev, id]))
                      }
                    />

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
                            <Badge variant="outline">{formatSalary(job.salary)}</Badge>
                            <Badge variant="secondary">{job.type}</Badge>
                          </div>
                          <p className="text-sm leading-6 text-muted-foreground">{job.description}</p>
                          <div>
                            <h4 className="font-medium text-foreground">Kërkesat:</h4>
                            <ul className="mt-2 flex flex-col gap-2 text-sm text-muted-foreground">
                              {job.requirements.map((requirement) => (
                                <li className="flex gap-2" key={requirement}>
                                  <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-primary" />
                                  {requirement}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Mbyll</Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button
                      aria-label={`Ruaj ${job.title}`}
                      size="icon"
                      variant={savedJobIds.includes(job.id) ? 'default' : 'ghost'}
                      onClick={() => toggleSavedJob(job)}
                    >
                      <Bookmark />
                    </Button>
                  </div>
                </div>
              </article>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nuk u gjetën punë që përputhen me kriteret tuaja.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}