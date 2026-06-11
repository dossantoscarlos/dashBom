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
    <div className="flex min-h-full bg-zinc-50 dark:bg-black">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
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
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white/95 px-4 backdrop-blur sm:px-6 dark:border-zinc-800 dark:bg-zinc-950/95">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 lg:hidden dark:text-zinc-400 dark:hover:bg-zinc-900"
              aria-label="Abrir menu"
            >
              <svg
                className="h-5 w-5"
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
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                CampanhaPro
              </p>
              <p className="hidden text-xs text-zinc-500 sm:block dark:text-zinc-400">
                Gestão de Campanha Eleitoral
              </p>
            </div>
          </div>
          <UserMenu
            userName={userName}
            userEmail={userEmail}
            roleName={currentRole?.name}
          />
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Breadcrumbs />
          {children}
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
