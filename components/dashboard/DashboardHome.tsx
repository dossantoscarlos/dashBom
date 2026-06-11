"use client";

import Link from "next/link";
import { BarChart } from "@/components/dashboard/BarChart";
import { RoleHint } from "@/components/dashboard/RoleHint";
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
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Olá, {userName}
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Painel operacional da campanha — indicadores, cobertura e execução
        </p>
      </div>

      <RoleHint />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Meta de votos"
          value={kpis.metaVotos.toLocaleString("pt-BR")}
          change={`${kpis.progressoMetaPct}% projetado (${kpis.votosProjetados.toLocaleString("pt-BR")})`}
          trend={kpis.progressoMetaPct >= 60 ? "up" : "neutral"}
          icon="🎯"
        />
        <StatCard
          label="Cobertura territorial"
          value={`${kpis.coberturaTerritorialPct}%`}
          change={`${regions.length} regiões mapeadas`}
          trend={kpis.coberturaTerritorialPct >= 75 ? "up" : "neutral"}
          icon="🗺"
        />
        <StatCard
          label="Campanhas ativas"
          value={kpis.campanhasAtivas}
          change={`${campaigns.length} no total`}
          trend="up"
          icon="📣"
        />
        <StatCard
          label="Intenção de voto"
          value={`${kpis.intencaoVotoAgregada}%`}
          change="Média dos deferidos (mock)"
          trend="up"
          icon="📈"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Parceiros ativos"
          value={kpis.parceirosAtivos}
          change={`${partners.length} cadastrados`}
          trend="neutral"
          icon="🤝"
        />
        <StatCard
          label="Comitês"
          value={kpis.comites}
          change="Pontos de operação"
          trend="neutral"
          icon="📍"
        />
        <StatCard
          label="Progresso da meta"
          value={`${kpis.progressoMetaPct}%`}
          change="Projeção regional agregada"
          trend={kpis.progressoMetaPct >= 60 ? "up" : "down"}
          icon="✓"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BarChart
          title="Projeção de votos por região"
          data={regions.map((r) => ({
            label: r.name,
            value: r.votesProjected ?? 0,
          }))}
        />
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Campanhas em execução
          </h2>
          {activeCampaigns.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">
              Nenhuma campanha em execução no momento.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800">
              {activeCampaigns.map((c) => (
                <li key={c.id} className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-50">
                        {c.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {CAMPAIGN_TYPE_LABELS[c.type]} ·{" "}
                        {c.startDate} — {c.endDate}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <CampaignWorkflow status={c.status} compact />
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/dashboard/campanhas"
            className="mt-4 inline-block text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-50"
          >
            Gerenciar campanhas →
          </Link>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Acesso rápido
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
            >
              <span className="text-2xl" aria-hidden>
                {item.icon}
              </span>
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-50">
                  {item.label}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Acessar módulo
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
