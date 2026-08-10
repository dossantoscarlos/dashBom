import React from "react";

type ModuleBlockProps = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode | string;
  children: React.ReactNode;
  action?: React.ReactNode;
};

/**
 * Representa um módulo independente no sistema campanhaPRO com ícones vetoriais atualizados.
 */
export function ModuleBlock({ title, subtitle, icon, children, action }: ModuleBlockProps) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] pb-3.5 gap-2">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF2FF] text-[#1264F3]">
              {typeof icon === "string" ? <span className="text-lg">{icon}</span> : icon}
            </div>
          )}
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-[#10213D]">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[11px] text-[#64748B] mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0 self-start sm:self-center">{action}</div>}
      </div>
      <div className="min-h-0 w-full">{children}</div>
    </section>
  );
}
