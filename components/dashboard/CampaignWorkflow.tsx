"use client";

import {
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_WORKFLOW,
} from "@/lib/domain/constants";
import type { CampaignStatus } from "@/lib/domain/types";

type CampaignWorkflowProps = {
  status: CampaignStatus;
  compact?: boolean;
};

export function CampaignWorkflow({ status, compact }: CampaignWorkflowProps) {
  const currentIndex = CAMPAIGN_WORKFLOW.indexOf(
    status as (typeof CAMPAIGN_WORKFLOW)[number],
  );
  const isCancelled = status === "cancelada";

  if (isCancelled) {
    return (
      <span className="text-xs font-medium text-red-600 dark:text-red-400">
        Cancelada
      </span>
    );
  }

  return (
    <div
      className={`flex items-center ${compact ? "gap-1" : "gap-2"}`}
      role="list"
      aria-label="Fluxo da campanha"
    >
      {CAMPAIGN_WORKFLOW.map((step, index) => {
        const isActive = step === status;
        const isDone = currentIndex > index;
        return (
          <div key={step} className="flex items-center gap-1" role="listitem">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                isActive
                  ? "bg-blue-600 text-white"
                  : isDone
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400"
                    : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
              }`}
            >
              {CAMPAIGN_STATUS_LABELS[step]}
            </span>
            {index < CAMPAIGN_WORKFLOW.length - 1 && (
              <span
                aria-hidden
                className={`text-xs ${isDone ? "text-emerald-500" : "text-zinc-300 dark:text-zinc-600"}`}
              >
                →
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
