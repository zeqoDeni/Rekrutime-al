import { describe, expect, it } from 'vitest';
import { createJobSchema } from './validation';

describe('createJobSchema', () => {
  const valid = {
    title: 'Senior Frontend Developer',
    location: 'Tiranë',
    salaryMin: '1200',
    salaryMax: '1800',
    type: 'full-time',
    experience: '3+ vite',
    description: 'A description that is long enough to satisfy the minimum length requirement here.',
  };

  it('accepts valid input and coerces salary strings to numbers', () => {
    const result = createJobSchema.parse(valid);
    expect(result.salaryMin).toBe(1200);
    expect(result.salaryMax).toBe(1800);
    expect(result.type).toBe('full-time');
  });

  it('rejects when salaryMax is less than salaryMin', () => {
    expect(() =>
      createJobSchema.parse({ ...valid, salaryMin: '2000', salaryMax: '1000' })
    ).toThrow();
  });

  it('rejects a title that is too short', () => {
    expect(() => createJobSchema.parse({ ...valid, title: 'ab' })).toThrow();
  });

  it('rejects a description that is too short', () => {
    expect(() => createJobSchema.parse({ ...valid, description: 'too short' })).toThrow();
  });

  it('rejects an invalid job type', () => {
    expect(() => createJobSchema.parse({ ...valid, type: 'gig-work' })).toThrow();
  });

  it('allows experience to be omitted', () => {
    const { experience: _, ...withoutExp } = valid;
    const result = createJobSchema.parse(withoutExp);
    expect(result.experience).toBeUndefined();
  });
});
