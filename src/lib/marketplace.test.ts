import { describe, expect, it } from 'vitest';
import { defaultJobFilters, filterAndSortJobs, MarketplaceJob } from './marketplace';

const jobs: MarketplaceJob[] = [
  {
    id: 'job-1',
    title: 'Frontend Developer',
    company: 'BalkanTech',
    description: 'React and TypeScript role',
    location: 'Tiranë',
    salary: { min: 1200, max: 1800, currency: 'EUR' },
    type: 'full-time',
    category: 'Inxhinieri softueri',
    experience: 'Mid',
    requirements: ['React', 'TypeScript'],
    employerId: 'employer-1',
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    applicationsCount: 0,
    savedCount: 0,
    status: 'active',
  },
  {
    id: 'job-2',
    title: 'Backend Developer',
    company: 'CloudWorks',
    description: 'Node.js APIs',
    location: 'Prishtinë',
    salary: { min: 1800, max: 2600, currency: 'EUR' },
    type: 'contract',
    category: 'Inxhinieri softueri',
    experience: 'Senior',
    requirements: ['Node.js', 'Firebase'],
    employerId: 'employer-2',
    createdAt: '2026-01-03T00:00:00.000Z',
    updatedAt: '2026-01-03T00:00:00.000Z',
    applicationsCount: 0,
    savedCount: 0,
    status: 'active',
  },
  {
    id: 'job-3',
    title: 'Paused QA Role',
    company: 'Hidden',
    description: 'Not active',
    location: 'Tiranë',
    salary: { min: 800, max: 1100, currency: 'EUR' },
    type: 'part-time',
    category: 'QA',
    experience: 'Junior',
    requirements: ['Testing'],
    employerId: 'employer-3',
    createdAt: '2026-01-04T00:00:00.000Z',
    updatedAt: '2026-01-04T00:00:00.000Z',
    applicationsCount: 0,
    savedCount: 0,
    status: 'paused',
  },
];

describe('filterAndSortJobs', () => {
  it('excludes paused jobs by default', () => {
    expect(filterAndSortJobs(jobs, defaultJobFilters).map((job) => job.id)).toEqual(['job-2', 'job-1']);
  });

  it('filters by query, location, type, experience and salary range', () => {
    const result = filterAndSortJobs(jobs, {
      ...defaultJobFilters,
      query: 'node',
      location: 'Prishtinë',
      type: 'contract',
      experience: 'Senior',
      salaryMin: 2000,
      salaryMax: 3000,
    });

    expect(result.map((job) => job.id)).toEqual(['job-2']);
  });

  it('sorts by salary low and high', () => {
    expect(filterAndSortJobs(jobs, { ...defaultJobFilters, sort: 'salary-low' }).map((job) => job.id)).toEqual([
      'job-1',
      'job-2',
    ]);
    expect(filterAndSortJobs(jobs, { ...defaultJobFilters, sort: 'salary-high' }).map((job) => job.id)).toEqual([
      'job-2',
      'job-1',
    ]);
  });
});
