"use client";

import { useEffect, useRef, useState } from "react";
import { logout } from "@/app/actions/auth";

type UserMenuProps = {
  userName: string;
  userEmail: string;
  roleName?: string;
};

export function UserMenu({ userName, userEmail, roleName }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-zinc-200 px-2 py-1.5 text-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
          {initials}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block font-medium text-zinc-900 dark:text-zinc-50">
            {userName}
          </span>
          {roleName && (
            <span className="block text-xs text-zinc-500 dark:text-zinc-400">
              {roleName}
            </span>
          )}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {userName}
            </p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              {userEmail}
            </p>
            {roleName && (
              <p className="mt-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                {roleName}
              </p>
            )}
          </div>
          <form action={logout} className="p-1">
            <button
              type="submit"
              role="menuitem"
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              Sair da sessão
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
