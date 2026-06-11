"use client";

import { getRoleHint } from "@/lib/domain/rules";
import { useDashboard } from "@/contexts/DashboardProvider";

export function RoleHint() {
  const { currentRole } = useDashboard();
  if (!currentRole) return null;

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300">
      <span className="font-medium">{currentRole.name}:</span>{" "}
      {getRoleHint(currentRole.name)}
    </div>
  );
}
