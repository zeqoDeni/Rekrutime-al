import { Skeleton } from '@/app/shared/ui/skeleton';

/**
 * Skeleton loader for job cards
 */
export function SkeletonJobCard() {
  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="h-4 w-full" />
    </div>
  );
}

/**
 * Skeleton loader for job list
 */
export function SkeletonJobList() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonJobCard key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton loader for dashboard stat cards
 */
export function SkeletonStatCard() {
  return (
    <div className="space-y-2 rounded-lg border bg-card p-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

/**
 * Skeleton loader for dashboard stats row
 */
export function SkeletonStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonStatCard key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton loader for application list item
 */
export function SkeletonApplicationCard() {
  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
      <Skeleton className="h-3 w-full" />
    </div>
  );
}

/**
 * Skeleton loader for application list
 */
export function SkeletonApplicationList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonApplicationCard key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton loader for message list
 */
export function SkeletonMessageList() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2 rounded-lg border bg-card p-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}
