type StatCardProps = {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: string;
};

export function StatCard({ label, value, change, trend, icon }: StatCardProps) {
  const trendColor =
    trend === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : trend === "down"
        ? "text-red-600 dark:text-red-400"
        : "text-zinc-500 dark:text-zinc-400";

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          {label}
        </p>
        {icon && (
          <span className="text-sm opacity-60" aria-hidden>
            {icon}
          </span>
        )}
      </div>
      <p className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
      {change && (
        <p className={`mt-0.5 text-[10px] font-semibold ${trendColor}`}>{change}</p>
      )}
    </div>
  );
}
