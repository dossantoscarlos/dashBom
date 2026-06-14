"use client";

import { useState } from "react";
import { DashboardProvider } from "@/contexts/DashboardProvider";
import { Breadcrumbs } from "./Breadcrumbs";
import { Sidebar } from "./Sidebar";
import { UserMenu } from "./UserMenu";
import { useDashboard } from "@/contexts/DashboardProvider";

type DashboardShellProps = {
  userName: string;
  userEmail: string;
  children: React.ReactNode;
};

function ShellContent({
  userName,
  userEmail,
  children,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentRole } = useDashboard();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-50 dark:bg-black select-none">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Fechar menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        userName={userName}
        userEmail={userEmail}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-10 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded p-1 text-zinc-600 hover:bg-zinc-100 lg:hidden dark:text-zinc-400 dark:hover:bg-zinc-900"
              aria-label="Abrir menu"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-tight text-zinc-400">
                CampanhaPro
              </span>
              <span className="h-3 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
              <Breadcrumbs />
            </div>
          </div>
          <UserMenu
            userName={userName}
            userEmail={userEmail}
            roleName={currentRole?.name}
          />
        </header>
        <main className="flex-1 overflow-auto bg-zinc-100/50 p-3 dark:bg-zinc-900/20">
          <div className="mx-auto w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function DashboardShell({
  userName,
  userEmail,
  children,
}: DashboardShellProps) {
  return (
    <DashboardProvider userEmail={userEmail}>
      <ShellContent userName={userName} userEmail={userEmail}>
        {children}
      </ShellContent>
    </DashboardProvider>
  );
}
