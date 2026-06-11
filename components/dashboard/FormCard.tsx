type FormCardProps = {
  title: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  actions: React.ReactNode;
};

export function FormCard({ title, children, onSubmit, actions }: FormCardProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      <h3 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h3>
      {children}
      <div className="mt-4 flex gap-2">{actions}</div>
    </form>
  );
}
