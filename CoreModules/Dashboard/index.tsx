"use client";

import { useEffect, useMemo, useState } from "react";
import { useDashboard } from "@/contexts/DashboardProvider";
import { CAMPAIGN_STATUS_LABELS, CAMPAIGN_TYPE_LABELS } from "@/lib/domain/constants";
import { computeCampaignKPIs } from "@/lib/domain/rules";
import { treCandidates } from "@/lib/data/tre";
import { CommitteeMap } from "./CommitteeMap";

import {
  Zap,
  UsersRound,
  Building2,
  Megaphone,
  CircleDollarSign,
  CalendarDays,
  Scale,
  ChartNoAxesCombined,
  UserRoundCog,
  MapPinned,
  ClipboardCheck,
  BadgeCheck,
  Activity,
  CircleX,
  Handshake,
  CalendarClock,
  Cake,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type StatItem = {
  id: string;
  title: string;
  value: string | number;
  description: string;
  badge: string;
  badgeColor: "green" | "blue" | "purple" | "orange" | "red";
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function DashboardStatCard({ stat }: { stat: StatItem }) {
  const badgeClasses = {
    green: "bg-[#E8F7F1] text-[#008B63] border-[#00A978]/30",
    blue: "bg-[#EAF2FF] text-[#1264F3] border-[#1264F3]/30",
    purple: "bg-[#F3EAFF] text-[#7928F5] border-[#7928F5]/30",
    orange: "bg-[#FFF4E5] text-[#F59E0B] border-[#F59E0B]/30",
    red: "bg-[#FEECEC] text-[#EF4444] border-[#EF4444]/30",
  };

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-xs transition">
      <div className="flex items-start justify-between">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition"
          style={{ backgroundColor: stat.bgColor, color: stat.textColor }}
        >
          {stat.icon}
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-extrabold border uppercase tracking-wider ${
            badgeClasses[stat.badgeColor]
          }`}
        >
          {stat.badge}
        </span>
      </div>

      <div>
        <h4 className="text-2xl sm:text-3xl font-extrabold text-[#10213D] tracking-tight leading-none">
          {stat.value}
        </h4>
        <p className="text-xs font-bold text-[#10213D] mt-1.5">{stat.title}</p>
        <p className="text-[10px] text-[#64748B] mt-0.5">{stat.description}</p>
      </div>
    </div>
  );
}

function DonutChartCard({
  title,
  data,
  totalLabel,
}: {
  title: string;
  data: { label: string; value: number; color: string }[];
  totalLabel?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);

  const radius = 56;
  const cx = 75;
  const cy = 75;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  const slices = data.map((d) => {
    const pct = total > 0 ? d.value / total : 0;
    const offset = circumference * (1 - cumulative);
    const dash = circumference * pct;
    cumulative += pct;
    return { ...d, pct, offset, dash };
  });

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <h3 className="text-xs font-extrabold text-[#10213D] uppercase tracking-wider">
          {title}
        </h3>
        <a href="/campanhas" className="text-[10px] font-bold text-[#1264F3] hover:underline">
          Ver painel completo ↗
        </a>
      </div>

      {total === 0 ? (
        <div className="flex h-36 items-center justify-center text-xs text-[#64748B] font-medium">
          Nenhum dado registrado
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="relative flex items-center justify-center shrink-0">
            <svg viewBox="0 0 150 150" className="h-36 w-36 -rotate-90">
              {slices.map((s) => (
                <circle
                  key={s.label}
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={22}
                  strokeDasharray={`${s.dash} ${circumference - s.dash}`}
                  strokeDashoffset={s.offset}
                  strokeLinecap="butt"
                />
              ))}
              <circle cx={cx} cy={cy} r={40} fill="white" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-extrabold text-[#10213D] leading-none">{total}</span>
              <span className="text-[9px] text-[#64748B] font-bold mt-0.5">{totalLabel || "Total"}</span>
            </div>
          </div>

          <ul className="flex flex-col gap-2.5 flex-1 w-full text-xs">
            {slices.map((s) => (
              <li key={s.label} className="flex items-center justify-between font-medium">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-[#10213D] font-bold">{s.label}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <span className="font-extrabold text-[#10213D]">{s.value}</span>
                  <span className="text-[#64748B]">({Math.round(s.pct * 100)}%)</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function BarChartCard({
  title,
  data,
}: {
  title: string;
  data: { label: string; value: number }[];
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const colors = ["#1264F3", "#008B63", "#7928F5", "#F59E0B", "#EC4899", "#38BDF8"];

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <h3 className="text-xs font-extrabold text-[#10213D] uppercase tracking-wider">
          {title}
        </h3>
        <a href="/regioes" className="text-[10px] font-bold text-[#1264F3] hover:underline">
          Ver painel completo ↗
        </a>
      </div>

      {data.length === 0 ? (
        <div className="flex h-36 items-center justify-center text-xs text-[#64748B] font-medium">
          Nenhuma região registrada
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((item, i) => {
            const pct = (item.value / max) * 100;
            const barColor = colors[i % colors.length];
            return (
              <div key={item.label} className="flex flex-col gap-1 text-xs">
                <div className="flex justify-between font-bold text-[#10213D]">
                  <span className="truncate max-w-[180px]">{item.label}</span>
                  <span className="font-mono text-[#1264F3]">{item.value}</span>
                </div>
                <div className="h-2.5 w-full bg-[#EDF1F5] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(pct, 8)}%`, backgroundColor: barColor }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Surveys Data ─────────────────────────────────────────────────────────────
const MOCK_SURVEYS: any[] = [];

// ─── Main Dashboard Panel ─────────────────────────────────────────────────────

export function DashboardPanel() {
  const { regions, campaigns, partners, locations, users } = useDashboard();
  const [agendaEventos, setAgendaEventos] = useState<any[]>([]);
  const [voluntarios, setVoluntarios] = useState<any[]>([]);
  const [lastUpdateText, setLastUpdateText] = useState("Atualizado agora");

  useEffect(() => {
    fetch("/api/agenda")
      .then((res) => res.json())
      .then((data) => { if (data.eventos) setAgendaEventos(data.eventos); })
      .catch(() => {});
    fetch("/api/voluntarios")
      .then((res) => res.json())
      .then((data) => { if (data.voluntarios) setVoluntarios(data.voluntarios); })
      .catch(() => {});
  }, []);

  const handleRefresh = () => {
    const now = new Date();
    setLastUpdateText(`Atualizado às ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`);
  };

  const todayMMDD = new Date().toISOString().slice(5, 10);
  const aniversariantes = voluntarios.filter((v) => v.dataNascimento && v.dataNascimento.slice(5) === todayMMDD);

  const kpis = useMemo(
    () => computeCampaignKPIs({ regions, campaigns, partners, locations, treCandidates }),
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

  const pctCoverage = Math.round((regionsAlcancadas / Math.max(regions.length, 1)) * 100);
  const pctDone = Math.round((campaignsDone / Math.max(campaigns.length, 1)) * 100);

  // ── 8 Stat Cards ─────────────────────────────────────────────────────────────
  const stats: StatItem[] = [
    {
      id: "colaboradores",
      title: "Colaboradores",
      value: totalCollaborators,
      description: `${activeCollaborators} ativos no sistema`,
      badge: `${activeCollaborators}/${totalCollaborators} ativos`,
      badgeColor: "green",
      icon: <UsersRound className="h-6 w-6" strokeWidth={2} />,
      bgColor: "#E8F7F1",
      textColor: "#008B63",
    },
    {
      id: "comites",
      title: "Comitês / Locais",
      value: committees,
      description: `${totalLocations} locais no total`,
      badge: `${totalLocations} locais`,
      badgeColor: "purple",
      icon: <Building2 className="h-6 w-6" strokeWidth={2} />,
      bgColor: "#F3EAFF",
      textColor: "#7928F5",
    },
    {
      id: "regioes",
      title: "Regiões alcançadas",
      value: regionsAlcancadas,
      description: `de ${regions.length} regiões cadastradas`,
      badge: `${pctCoverage}% cobertura`,
      badgeColor: "blue",
      icon: <MapPinned className="h-6 w-6" strokeWidth={2} />,
      bgColor: "#EAF2FF",
      textColor: "#1264F3",
    },
    {
      id: "pesquisas",
      title: "Pesquisas feitas",
      value: surveysDone,
      description: `${surveysTotal - surveysDone} em andamento ou planejadas`,
      badge: `${surveysTotal} total`,
      badgeColor: "green",
      icon: <ClipboardCheck className="h-6 w-6" strokeWidth={2} />,
      bgColor: "#E8F7F1",
      textColor: "#008B63",
    },
    {
      id: "concluidas",
      title: "Campanhas concluídas",
      value: campaignsDone,
      description: `de ${campaigns.length} campanhas registradas`,
      badge: `${pctDone}%`,
      badgeColor: "green",
      icon: <BadgeCheck className="h-6 w-6" strokeWidth={2} />,
      bgColor: "#E8F7F1",
      textColor: "#008B63",
    },
    {
      id: "andamento",
      title: "Em andamento",
      value: campaignsOngoing,
      description: `${campaignsPlanned} planejadas`,
      badge: `${campaignsOngoing} ativas`,
      badgeColor: "orange",
      icon: <Activity className="h-6 w-6" strokeWidth={2} />,
      bgColor: "#FFF4E5",
      textColor: "#F59E0B",
    },
    {
      id: "canceladas",
      title: "Canceladas",
      value: campaignsCanceled,
      description: "campanhas encerradas",
      badge: campaignsCanceled === 0 ? "zerado" : `${campaignsCanceled} canceladas`,
      badgeColor: campaignsCanceled === 0 ? "blue" : "red",
      icon: <CircleX className="h-6 w-6" strokeWidth={2} />,
      bgColor: campaignsCanceled === 0 ? "#EAF2FF" : "#FEECEC",
      textColor: campaignsCanceled === 0 ? "#1264F3" : "#EF4444",
    },
    {
      id: "parceiros",
      title: "Parceiros ativos",
      value: kpis.parceirosAtivos,
      description: `${partners.length} parceiros cadastrados`,
      badge: `${partners.length} total`,
      badgeColor: "purple",
      icon: <Handshake className="h-6 w-6" strokeWidth={2} />,
      bgColor: "#F3EAFF",
      textColor: "#7928F5",
    },
  ];

  // ── Donut chart: campaigns by status ──────────────────────────────────────
  const campaignStatusData = [
    { label: "Em andamento", value: campaignsOngoing, color: "#F59E0B" },
    { label: "Concluídas", value: campaignsDone, color: "#008B63" },
    { label: "Planejadas", value: campaignsPlanned, color: "#1264F3" },
    { label: "Canceladas", value: campaignsCanceled, color: "#EF4444" },
  ].filter((d) => d.value > 0);

  // ── Donut chart: surveys by status ────────────────────────────────────────
  const surveyStatusData = [
    { label: "Concluídas", value: MOCK_SURVEYS.filter(s => s.status === "concluída").length, color: "#008B63" },
    { label: "Em andamento", value: MOCK_SURVEYS.filter(s => s.status === "em andamento").length, color: "#1264F3" },
    { label: "Planejadas", value: MOCK_SURVEYS.filter(s => s.status === "planejada").length, color: "#64748B" },
  ].filter((d) => d.value > 0);

  // ── Bar chart: campaigns per region ──────────────────────────────────────
  const campaignsByRegion = regions.map((r) => ({
    label: r.name,
    value: campaigns.filter((c) => c.regionId === r.id).length,
  }));

  return (
    <div className="flex flex-col gap-6 font-sans text-xs bg-[#F6F8FB]">

      {/* ── 1. CABEÇALHO DO DASHBOARD OPERACIONAL ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#10213D] tracking-tight">
            Dashboard Operacional
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Visão consolidada — colaboradores, comitês, regiões, pesquisas e campanhas
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <span className="text-xs font-semibold text-[#1264F3] bg-[#EAF2FF] px-3 py-1 rounded-lg border border-[#1264F3]/20 flex items-center gap-1.5">
            <span>{lastUpdateText}</span>
          </span>

          <button
            type="button"
            onClick={handleRefresh}
            className="h-8 px-3 rounded-lg bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#10213D] font-bold text-xs transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
            title="Atualizar dados do dashboard"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#1264F3]" strokeWidth={2.2} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* ── 2. MENUS RÁPIDOS E ATALHOS OPERACIONAIS ── */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-2xs flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EAF2FF] text-[#1264F3]">
              <Zap className="h-4 w-4" strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-[#10213D] uppercase tracking-wider">
                Menus rápidos e atalhos operacionais
              </h3>
              <p className="text-[10px] text-[#64748B]">Navegação instantânea entre módulos e ferramentas</p>
            </div>
          </div>

          <span className="bg-[#EAF2FF] text-[#1264F3] border border-[#1264F3]/30 text-[9px] font-extrabold px-2.5 py-0.5 rounded">
            Navegação rápida
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-xs">
          <a
            href="/voluntarios"
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#EAF2FF] hover:border-[#1264F3] transition text-center group"
          >
            <UsersRound className="h-6 w-6 text-[#008B63] mb-1.5 group-hover:scale-110 transition-transform" strokeWidth={2} />
            <span className="text-[11px] font-bold text-[#10213D]">Voluntários</span>
          </a>

          <a
            href="/locais"
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#EAF2FF] hover:border-[#1264F3] transition text-center group"
          >
            <Building2 className="h-6 w-6 text-[#1264F3] mb-1.5 group-hover:scale-110 transition-transform" strokeWidth={2} />
            <span className="text-[11px] font-bold text-[#10213D]">Comitês / Locais</span>
          </a>

          <a
            href="/campanhas"
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#EAF2FF] hover:border-[#1264F3] transition text-center group"
          >
            <Megaphone className="h-6 w-6 text-[#7928F5] mb-1.5 group-hover:scale-110 transition-transform" strokeWidth={2} />
            <span className="text-[11px] font-bold text-[#10213D]">Campanhas</span>
          </a>

          <a
            href="/modulos"
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#EAF2FF] hover:border-[#1264F3] transition text-center group"
          >
            <CircleDollarSign className="h-6 w-6 text-[#F59E0B] mb-1.5 group-hover:scale-110 transition-transform" strokeWidth={2} />
            <span className="text-[11px] font-bold text-[#10213D]">Financeiro</span>
          </a>

          <a
            href="/modulos"
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#EAF2FF] hover:border-[#1264F3] transition text-center group"
          >
            <CalendarDays className="h-6 w-6 text-[#1264F3] mb-1.5 group-hover:scale-110 transition-transform" strokeWidth={2} />
            <span className="text-[11px] font-bold text-[#10213D]">Agenda</span>
          </a>

          <a
            href="/tre"
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#EAF2FF] hover:border-[#1264F3] transition text-center group"
          >
            <Scale className="h-6 w-6 text-[#008B63] mb-1.5 group-hover:scale-110 transition-transform" strokeWidth={2} />
            <span className="text-[11px] font-bold text-[#10213D]">Notícias TSE</span>
          </a>

          <a
            href="/relatorios"
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#EAF2FF] hover:border-[#1264F3] transition text-center group"
          >
            <ChartNoAxesCombined className="h-6 w-6 text-[#7928F5] mb-1.5 group-hover:scale-110 transition-transform" strokeWidth={2} />
            <span className="text-[11px] font-bold text-[#10213D]">Relatórios</span>
          </a>

          <a
            href="/usuarios"
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#EAF2FF] hover:border-[#1264F3] transition text-center group"
          >
            <UserRoundCog className="h-6 w-6 text-[#1264F3] mb-1.5 group-hover:scale-110 transition-transform" strokeWidth={2} />
            <span className="text-[11px] font-bold text-[#10213D]">Usuários</span>
          </a>
        </div>
      </div>

      {/* ── 3. CARDS DE INDICADORES (8 CARDS DISTRIBUÍDOS EM 2 LINHAS X 4 COLUNAS) ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <DashboardStatCard key={s.id} stat={s} />
        ))}
      </div>

      {/* ── 4. AGENDA DA SEMANA DO CANDIDATO & ANIVERSARIANTES DO DIA ── */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Agenda da Semana (3 Colunas) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-[#1264F3]" strokeWidth={2.2} />
              <div>
                <h3 className="text-xs font-extrabold text-[#10213D] uppercase tracking-wider">
                  Agenda da semana do candidato
                </h3>
                <p className="text-[10px] text-[#64748B]">Compromissos e eventos agendados</p>
              </div>
            </div>
            <span className="bg-[#EAF2FF] text-[#1264F3] font-mono text-[9px] font-extrabold px-2.5 py-1 rounded border border-[#1264F3]/30">
              {agendaEventos.length} eventos agendados
            </span>
          </div>

          <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
            {agendaEventos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center gap-1">
                <CalendarDays className="h-8 w-8 text-[#64748B]" strokeWidth={1.5} />
                <p className="text-xs text-[#64748B] font-medium">Nenhum compromisso registrado para esta semana.</p>
              </div>
            ) : (
              agendaEventos.slice(0, 4).map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs hover:border-[#1264F3] transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center h-10 w-11 rounded-lg bg-[#1264F3] text-white font-extrabold leading-tight text-[11px] shrink-0 shadow-2xs">
                      <span>{evt.dataInicio ? evt.dataInicio.slice(-2) : "10"}</span>
                      <span className="text-[8px] uppercase font-mono">JUN</span>
                    </div>

                    <div className="flex flex-col gap-0.5 min-w-0">
                      <h4 className="font-bold text-[#10213D] truncate leading-snug">{evt.titulo}</h4>
                      <span className="text-[10px] text-[#64748B] truncate">📍 {evt.local || "Comitê Central"}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-[#1264F3] text-[11px] block">
                      {evt.diaInteiro ? "Dia Inteiro" : `${evt.horaInicio} - ${evt.horaFim}`}
                    </span>
                    <span className="text-[9px] font-extrabold text-[#008B63] block mt-0.5">● Confirmado</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Aniversariantes do Dia (2 Colunas) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div className="flex items-center gap-2">
              <Cake className="h-5 w-5 text-[#EC4899]" strokeWidth={2.2} />
              <div>
                <h3 className="text-xs font-extrabold text-[#10213D] uppercase tracking-wider">
                  Aniversariantes do dia
                </h3>
                <p className="text-[10px] text-[#64748B]">Voluntários e colaboradores</p>
              </div>
            </div>
            <span className="bg-[#FDF0F7] text-[#EC4899] text-[9px] font-extrabold px-2 py-0.5 rounded border border-[#EC4899]/30">
              {aniversariantes.length} hoje
            </span>
          </div>

          <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
            {aniversariantes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center gap-1">
                <Cake className="h-8 w-8 text-[#64748B]" strokeWidth={1.5} />
                <p className="text-xs text-[#64748B] font-medium">Nenhum aniversariante hoje.<br/>Datas registradas no cadastro.</p>
              </div>
            ) : (
              aniversariantes.map((v: any) => {
                const anos = new Date().getFullYear() - new Date(v.dataNascimento).getFullYear();
                return (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#FDF0F7] border border-[#EC4899]/30 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EC4899] text-white font-extrabold text-xs shrink-0 shadow-2xs">
                        {v.nome.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <span className="font-extrabold text-[#10213D]">{v.nome}</span>
                        <span className="text-[10px] text-[#64748B]">{v.comiteNome || "Comitê Central"} · {v.regiaoDesignada || "Área Central"}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <Cake className="h-4 w-4 text-[#EC4899] ml-auto" strokeWidth={2} />
                      <span className="text-[10px] font-extrabold text-[#EC4899] block mt-0.5">{anos} anos</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── 5. MAPA OPERACIONAL COMPLETO DE COMITÊS, VOLUNTÁRIOS E LOCAIS (100% FIEL AO MOCKUP) ── */}
      <CommitteeMap locations={locations} voluntarios={voluntarios} />

      {/* ── 6. GRÁFICOS DE CAMPANHAS E PESQUISAS POR STATUS E REGIÃO ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <DonutChartCard
          title="Campanhas por Status"
          data={campaignStatusData}
          totalLabel="Campanhas"
        />

        <DonutChartCard
          title="Pesquisas por Status"
          data={surveyStatusData}
          totalLabel="Pesquisas"
        />

        <BarChartCard
          title="Campanhas por Região"
          data={campaignsByRegion}
        />
      </div>

    </div>
  );
}
