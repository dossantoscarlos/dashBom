type LoadingSkeletonProps = {
  rows?: number;
  className?: string;
};

export function LoadingSkeleton({ rows = 4, className = "" }: LoadingSkeletonProps) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`} aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800"
          style={{ width: `${85 - i * 8}%` }}
        />
      ))}
      <span className="sr-only">Carregando...</span>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="h-4 w-1/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>
      <div className="divide-y divide-zinc-100 p-4 dark:divide-zinc-800">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 py-3">
            <div className="h-4 flex-1 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
      <span className="sr-only">Carregando tabela...</span>
    </div>
  );
}
