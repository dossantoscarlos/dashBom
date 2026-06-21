"use client";

import { useMemo } from "react";
import { useDashboard } from "@/contexts/DashboardProvider";
import { CAMPAIGN_STATUS_LABELS, CAMPAIGN_TYPE_LABELS } from "@/lib/domain/constants";
import { computeCampaignKPIs } from "@/lib/domain/rules";
import { treCandidates } from "@/lib/data/tre";

// ─── Types ───────────────────────────────────────────────────────────────────

type StatItem = {
  label: string;
  value: string | number;
  sub?: string;
  icon: string;
  color: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function DashboardStatCard({ stat }: { stat: StatItem }) {
  const trendColors = {
    up: "text-emerald-500",
    down: "text-red-500",
    neutral: "text-zinc-400",
  };
  const trendIcons = { up: "↑", down: "↓", neutral: "→" };
  const trend = stat.trend ?? "neutral";

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
    >
      {/* Decorative circle */}
      <div
        className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-10"
        style={{ background: stat.color }}
      />
      <div className="flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
          style={{ background: `${stat.color}20` }}
        >
          {stat.icon}
        </div>
        {stat.trendLabel && (
          <span className={`text-[11px] font-bold ${trendColors[trend]}`}>
            {trendIcons[trend]} {stat.trendLabel}
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
        {stat.value}
      </p>
      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
        {stat.label}
      </p>
      {stat.sub && (
        <p className="mt-1 text-[11px] text-zinc-500">{stat.sub}</p>
      )}
    </div>
  );
}

function DonutChart({
  data,
  title,
}: {
  data: { label: string; value: number; color: string }[];
  title: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0)
    return (
      <div className="flex h-40 items-center justify-center text-[12px] text-zinc-400">
        Sem dados
      </div>
    );

  const radius = 60;
  const cx = 90;
  const cy = 90;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  const slices = data.map((d) => {
    const pct = d.value / total;
    const offset = circumference * (1 - cumulative);
    const dash = circumference * pct;
    cumulative += pct;
    return { ...d, pct, offset, dash };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        {title}
      </h3>
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <svg viewBox="0 0 180 180" className="h-36 w-36 shrink-0 -rotate-90">
          {slices.map((s) => (
            <circle
              key={s.label}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={28}
              strokeDasharray={`${s.dash} ${circumference - s.dash}`}
              strokeDashoffset={s.offset}
              strokeLinecap="butt"
            />
          ))}
          {/* Inner white circle */}
          <circle cx={cx} cy={cy} r={44} fill="white" className="dark:fill-zinc-950" />
        </svg>
        <ul className="flex flex-col gap-2">
          {slices.map((s) => (
            <li key={s.label} className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 shrink-0 rounded-sm"
                style={{ background: s.color }}
              />
              <span className="text-[12px] text-zinc-600 dark:text-zinc-400">
                {s.label}
              </span>
              <span className="ml-auto text-[12px] font-bold text-zinc-800 dark:text-zinc-200">
                {s.value}
              </span>
              <span className="text-[11px] text-zinc-400">
                ({Math.round(s.pct * 100)}%)
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SimpleBarChart({
  data,
  title,
  colorFn,
}: {
  data: { label: string; value: number; color?: string }[];
  title: string;
  colorFn?: (i: number) => string;
}) {
  const defaultColors = [
    "#6366f1",
    "#8b5cf6",
    "#06b6d4",
    "#10b981",
    "#f59e0b",
    "#ef4444",
  ];
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        {title}
      </h3>
      <div className="flex flex-col gap-3">
        {data.map((item, i) => {
          const color =
            item.color ?? colorFn?.(i) ?? defaultColors[i % defaultColors.length];
          const pct = (item.value / max) * 100;
          return (
            <div key={item.label} className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px]">
                <span className="font-medium text-zinc-600 dark:text-zinc-400 truncate max-w-[140px]">
                  {item.label}
                </span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                  {item.value}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActivityFeed({
  items,
}: {
  items: { label: string; sub: string; icon: string; color: string }[];
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        Atividade Recente
      </h3>
      <ul className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base"
              style={{ background: `${item.color}18` }}
            >
              {item.icon}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-semibold text-zinc-800 dark:text-zinc-200">
                {item.label}
              </p>
              <p className="text-[11px] text-zinc-400">{item.sub}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Surveys mock data ────────────────────────────────────────────────────────
const MOCK_SURVEYS = [
  { id: "s1", title: "Intenção de Voto — Zona Norte", status: "concluída", responses: 342, date: "2026-05-10" },
  { id: "s2", title: "Satisfação do Eleitor", status: "em andamento", responses: 128, date: "2026-06-01" },
  { id: "s3", title: "Pesquisa de Imagem — Interior", status: "concluída", responses: 210, date: "2026-04-22" },
  { id: "s4", title: "Avaliação das Propostas", status: "planejada", responses: 0, date: "2026-07-01" },
  { id: "s5", title: "Perfil do Eleitor Capital", status: "em andamento", responses: 67, date: "2026-06-15" },
];

// ─── Main Dashboard Panel ─────────────────────────────────────────────────────

export function DashboardPanel() {
  const { regions, campaigns, partners, locations, users } = useDashboard();

  const kpis = useMemo(
    () =>
      computeCampaignKPIs({ regions, campaigns, partners, locations, treCandidates }),
    [regions, campaigns, partners, locations],
  );

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalCollaborators = users.length;
  const activeCollaborators = users.filter((u) => u.status === "ativo").length;

  const committees = locations.filter((l) => l.type === "comitê" || l.type === "sede").length;
  const totalLocations = locations.length;

  const regionsAlcancadas = new Set(
    campaigns
      .filter((c) => c.status === "em andamento" || c.status === "concluída")
      .map((c) => c.regionId),
  ).size;

  const surveysDone = MOCK_SURVEYS.filter((s) => s.status === "concluída").length;
  const surveysTotal = MOCK_SURVEYS.length;

  const campaignsDone = campaigns.filter((c) => c.status === "concluída").length;
  const campaignsCanceled = campaigns.filter((c) => c.status === "cancelada").length;
  const campaignsOngoing = campaigns.filter((c) => c.status === "em andamento").length;
  const campaignsPlanned = campaigns.filter((c) => c.status === "planejada").length;

  // ── Stat cards ─────────────────────────────────────────────────────────────
  const stats: StatItem[] = [
    {
      label: "Colaboradores",
      value: totalCollaborators,
      sub: `${activeCollaborators} ativos`,
      icon: "👥",
      color: "#6366f1",
      trend: "up",
      trendLabel: `${activeCollaborators}/${totalCollaborators} ativos`,
    },
    {
      label: "Comitês / Locais",
      value: committees,
      sub: `${totalLocations} locais no total`,
      icon: "🏛️",
      color: "#8b5cf6",
      trend: "neutral",
      trendLabel: `${totalLocations} locais`,
    },
    {
      label: "Regiões Alcançadas",
      value: regionsAlcancadas,
      sub: `de ${regions.length} regiões cadastradas`,
      icon: "🗺️",
      color: "#06b6d4",
      trend: regionsAlcancadas >= regions.length ? "up" : "neutral",
      trendLabel: `${Math.round((regionsAlcancadas / Math.max(regions.length, 1)) * 100)}% cobertura`,
    },
    {
      label: "Pesquisas Feitas",
      value: surveysDone,
      sub: `${surveysTotal - surveysDone} em andamento ou planejadas`,
      icon: "📋",
      color: "#10b981",
      trend: "up",
      trendLabel: `${surveysTotal} total`,
    },
    {
      label: "Campanhas Concluídas",
      value: campaignsDone,
      sub: `de ${campaigns.length} campanhas`,
      icon: "✅",
      color: "#22c55e",
      trend: campaignsDone > 0 ? "up" : "neutral",
      trendLabel: `${Math.round((campaignsDone / Math.max(campaigns.length, 1)) * 100)}%`,
    },
    {
      label: "Em Andamento",
      value: campaignsOngoing,
      sub: `${campaignsPlanned} planejadas`,
      icon: "⚡",
      color: "#f59e0b",
      trend: "up",
      trendLabel: "ativas",
    },
    {
      label: "Canceladas",
      value: campaignsCanceled,
      sub: "campanhas encerradas",
      icon: "🚫",
      color: "#ef4444",
      trend: campaignsCanceled > 0 ? "down" : "up",
      trendLabel: campaignsCanceled > 0 ? "atenção" : "zerado",
    },
    {
      label: "Parceiros Ativos",
      value: kpis.parceirosAtivos,
      sub: `${partners.length} parceiros cadastrados`,
      icon: "🤝",
      color: "#ec4899",
      trend: "neutral",
      trendLabel: `${partners.length} total`,
    },
  ];

  // ── Donut chart: campaigns by status ──────────────────────────────────────
  const campaignStatusData = [
    { label: "Em andamento", value: campaignsOngoing, color: "#f59e0b" },
    { label: "Concluídas", value: campaignsDone, color: "#22c55e" },
    { label: "Planejadas", value: campaignsPlanned, color: "#6366f1" },
    { label: "Canceladas", value: campaignsCanceled, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  // ── Donut chart: surveys by status ────────────────────────────────────────
  const surveyStatusData = [
    { label: "Concluídas", value: MOCK_SURVEYS.filter(s => s.status === "concluída").length, color: "#10b981" },
    { label: "Em andamento", value: MOCK_SURVEYS.filter(s => s.status === "em andamento").length, color: "#6366f1" },
    { label: "Planejadas", value: MOCK_SURVEYS.filter(s => s.status === "planejada").length, color: "#94a3b8" },
  ].filter((d) => d.value > 0);

  // ── Bar chart: campaigns per region ──────────────────────────────────────
  const campaignsByRegion = regions.map((r) => ({
    label: r.name,
    value: campaigns.filter((c) => c.regionId === r.id).length,
  }));

  // ── Bar chart: campaigns by type ─────────────────────────────────────────
  const campaignsByType = (Object.keys(CAMPAIGN_TYPE_LABELS) as (keyof typeof CAMPAIGN_TYPE_LABELS)[]).map((type) => ({
    label: CAMPAIGN_TYPE_LABELS[type],
    value: campaigns.filter((c) => c.type === type).length,
  })).filter((d) => d.value > 0);

  // ── Activity feed ─────────────────────────────────────────────────────────
  const activityItems = [
    ...campaigns.map((c) => ({
      label: c.name,
      sub: `${CAMPAIGN_STATUS_LABELS[c.status]} · ${c.startDate}`,
      icon: "📣",
      color: "#6366f1",
    })),
    ...MOCK_SURVEYS.slice(0, 3).map((s) => ({
      label: s.title,
      sub: `Pesquisa · ${s.responses} respostas`,
      icon: "📋",
      color: "#10b981",
    })),
  ].slice(0, 6);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Dashboard Operacional
          </h1>
          <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
            Visão consolidada · Colaboradores, comitês, regiões, pesquisas e campanhas
          </p>
        </div>
        <span className="hidden rounded-lg bg-indigo-50 px-3 py-1.5 text-[11px] font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 sm:inline-block">
          Atualizado agora
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <DashboardStatCard key={s.label} stat={s} />
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <DonutChart data={campaignStatusData} title="Campanhas por Status" />
        <DonutChart data={surveyStatusData} title="Pesquisas por Status" />
        <SimpleBarChart
          data={campaignsByRegion}
          title="Campanhas por Região"
        />
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SimpleBarChart
          data={campaignsByType}
          title="Campanhas por Tipo de Atividade"
          colorFn={(i) =>
            ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"][i % 5]
          }
        />
        <ActivityFeed items={activityItems} />
      </div>

      {/* Surveys table */}
      <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            📋 Pesquisas Realizadas
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-5 py-2.5 text-left font-bold uppercase tracking-wider text-zinc-400">
                  Pesquisa
                </th>
                <th className="px-5 py-2.5 text-left font-bold uppercase tracking-wider text-zinc-400">
                  Status
                </th>
                <th className="px-5 py-2.5 text-right font-bold uppercase tracking-wider text-zinc-400">
                  Respostas
                </th>
                <th className="px-5 py-2.5 text-right font-bold uppercase tracking-wider text-zinc-400">
                  Data
                </th>
              </tr>
            </thead>
            <tbody>
              {MOCK_SURVEYS.map((s) => {
                const statusColors: Record<string, string> = {
                  concluída: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
                  "em andamento": "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
                  planejada: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
                };
                return (
                  <tr
                    key={s.id}
                    className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50 dark:border-zinc-900 dark:hover:bg-zinc-900/50"
                  >
                    <td className="px-5 py-3 font-medium text-zinc-800 dark:text-zinc-200">
                      {s.title}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${
                          statusColors[s.status] ?? ""
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-zinc-700 dark:text-zinc-300">
                      {s.responses > 0 ? s.responses.toLocaleString("pt-BR") : "—"}
                    </td>
                    <td className="px-5 py-3 text-right text-zinc-400">
                      {s.date}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
