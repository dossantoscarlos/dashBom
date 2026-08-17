import React from "react";

function ShieldCheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}

export function SecureEnvironmentNotice() {
  return (
    <div className="w-full min-h-[60px] rounded-[9px] bg-[#EEF9F6] border border-[#C7E4DD] p-3 px-4 flex items-center gap-3 select-none">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#008E66]/10 text-[#008E66]">
        <ShieldCheckIcon className="h-5 w-5" />
      </div>
      <div className="flex flex-col justify-center gap-0.5">
        <p className="text-[13px] sm:text-[14px] font-semibold text-[#0F172A] leading-tight">
          Ambiente de demonstração seguro.
        </p>
        <p className="text-[11px] sm:text-[12px] text-[#64748B] leading-tight">
          Seus dados estão protegidos.
        </p>
      </div>
    </div>
  );
}
