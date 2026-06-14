"use client";

import Link from "next/link";
import { BarChart } from "@/components/dashboard/BarChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { CampaignWorkflow } from "@/components/dashboard/CampaignWorkflow";
import { useDashboard } from "@/contexts/DashboardProvider";
import { CAMPAIGN_TYPE_LABELS } from "@/lib/domain/constants";
import { computeCampaignKPIs } from "@/lib/domain/rules";
import { navItems } from "@/lib/data/navigation";
import { treCandidates } from "@/lib/data/tre";

export function DashboardHome({ userName }: { userName: string }) {
  const { regions, campaigns, partners, locations, can } = useDashboard();

  const kpis = computeCampaignKPIs({
    regions,
    campaigns,
    partners,
    locations,
    treCandidates,
  });

  const activeCampaigns = campaigns.filter((c) => c.status === "em andamento");
  const visibleNav = navItems.filter(
    (item) => item.href !== "/dashboard" && (!item.permission || can(item.permission)),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Console Principal
          </h1>
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide">
            Bem-vindo, {userName} · Status operacional do sistema
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Meta de votos"
          value={kpis.metaVotos.toLocaleString("pt-BR")}
          change={`${kpis.progressoMetaPct}% projetado`}
          trend={kpis.progressoMetaPct >= 60 ? "up" : "neutral"}
          icon="🎯"
        />
        <StatCard
          label="Cobertura"
          value={`${kpis.coberturaTerritorialPct}%`}
          change={`${regions.length} regiões`}
          trend={kpis.coberturaTerritorialPct >= 75 ? "up" : "neutral"}
          icon="🗺"
        />
        <StatCard
          label="Ativas"
          value={kpis.campanhasAtivas}
          change="Campanhas"
          trend="up"
          icon="📣"
        />
        <StatCard
          label="Intenção"
          value={`${kpis.intencaoVotoAgregada}%`}
          change="Média geral"
          trend="up"
          icon="📈"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BarChart
            title="Projeção de votos por região"
            data={regions.map((r) => ({
              label: r.name,
              value: r.votesProjected ?? 0,
            }))}
          />
        </div>
        
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">
            Execução em Tempo Real
          </h2>
          {activeCampaigns.length === 0 ? (
            <p className="text-[11px] text-zinc-500">
              Nenhuma atividade em execução.
            </p>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {activeCampaigns.map((c) => (
                <li key={c.id} className="py-2 first:pt-0">
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50 truncate">
                    {c.name}
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    {CAMPAIGN_TYPE_LABELS[c.type]}
                  </p>
                  <div className="mt-1">
                    <CampaignWorkflow status={c.status} compact />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <section>
        <h2 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Acesso Rápido aos Módulos
        </h2>
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {visibleNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 rounded-lg border border-zinc-200 bg-white p-3 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
            >
              <span className="text-xl" aria-hidden>
                {item.icon}
              </span>
              <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 text-center">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
