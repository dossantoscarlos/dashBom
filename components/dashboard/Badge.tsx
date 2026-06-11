const variants: Record<string, string> = {
  ativo: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400",
  inativo: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  pendente: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400",
  deferido: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400",
  indeferido: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400",
  renúncia: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400",
  cassado: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400",
  eleito: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400",
  "não eleito": "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  "em andamento":
    "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400",
  planejada: "bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-400",
  concluída: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400",
  cancelada: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400",
};

type BadgeProps = {
  label: string;
  variant?: string;
};

export function Badge({ label, variant }: BadgeProps) {
  const key = variant ?? label.toLowerCase();
  const classes = variants[key] ?? "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${classes}`}
    >
      {label}
    </span>
  );
}
