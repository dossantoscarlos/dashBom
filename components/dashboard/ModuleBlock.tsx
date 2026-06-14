import React from "react";

type ModuleBlockProps = {
  title: string;
  icon?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
};

/**
 * Representa um módulo independente no sistema.
 * Segue o padrão de blocos isolados para permitir modularidade.
 */
export function ModuleBlock({ title, icon, children, action }: ModuleBlockProps) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800/50">
        <div className="flex items-center gap-3">
          {icon && <span className="text-xl opacity-80" aria-hidden>{icon}</span>}
          <div>
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {title}
            </h2>
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="min-h-0 w-full">
        {children}
      </div>
    </section>
  );
}
