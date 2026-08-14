"use client";

import React, { useState } from "react";
import type { CronogramaItem } from "./types";
import { useToast } from "@/components/dashboard/Toast";
import {
  Calendar as CalendarIcon,
  Search,
  Download,
  Plus,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  X,
  Share2,
  CalendarCheck,
  Building2,
  User,
  Clock,
  Sparkles,
} from "lucide-react";

interface ProjectCronogramaProps {
  cronogramaData: CronogramaItem[];
  onNavigateTab: (tab: any) => void;
}

export function ProjectCronograma({
  cronogramaData,
  onNavigateTab,
}: ProjectCronogramaProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [zoomLevel, setZoomLevel] = useState<"dia" | "semana" | "mes">("semana");
  const [expandedFases, setExpandedFases] = useState<Record<string, boolean>>({
    "phase-1": true,
    "phase-2": true,
    "phase-3": true,
    "phase-4": true,
  });
  const [showAddMarcoModal, setShowAddMarcoModal] = useState(false);
  const [marcoName, setMarcoName] = useState("");

  // Integração com Agenda da Campanha
  const [isSyncingAgenda, setIsSyncingAgenda] = useState(false);
  const [lastAgendaSync, setLastAgendaSync] = useState<string>("Sincronizado");
  const [showScheduleEventModal, setShowScheduleEventModal] = useState(false);
  const [selectedTaskForAgenda, setSelectedTaskForAgenda] = useState<any | null>(null);
  const [agendaEventTitle, setAgendaEventTitle] = useState("");
  const [agendaEventType, setAgendaEventType] = useState<string>("inauguracao");
  const [agendaEventDate, setAgendaEventDate] = useState("2026-08-15");
  const [agendaEventLocation, setAgendaEventLocation] = useState("Praça Central - Bairro Primavera");
  const [agendaEventResponsible, setAgendaEventResponsible] = useState("Coordenação de Campanha");

  const toggleFase = (id: string) => {
    setExpandedFases((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExportGantt = () => {
    toast("Exportação do Cronograma de Gantt em PDF/Excel iniciada!");
  };

  const handleAddMarco = () => {
    if (!marcoName.trim()) {
      toast("Por favor, preencha o nome do marco.", "error");
      return;
    }
    toast(`Novo marco '${marcoName}' adicionado ao cronograma com sucesso!`);
    setMarcoName("");
    setShowAddMarcoModal(false);
  };

  // Sincronizar todos os marcos e entregas com a Agenda da Campanha
  const handleSyncAllWithAgenda = async () => {
    setIsSyncingAgenda(true);
    try {
      let count = 0;
      for (const fase of cronogramaData) {
        if (fase.children) {
          for (const item of fase.children) {
            await fetch("/api/agenda", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                titulo: `[PRJ-2026-0042] ${item.name}`,
                descricao: `Entrega vinculada ao cronograma da fase '${fase.name}'. Responsável: ${item.responsible}`,
                dataCompleta: "2026-08-20",
                dataInicio: "2026-08-20",
                local: "Praça Central - São Paulo",
                tipo: item.isMilestone ? "marco_projeto" : "entrega_projeto",
                status: item.status === "Concluída" ? "realizado" : "confirmado",
                responsavel: item.responsible || "Equipe de Gestão de Projetos",
                projectCode: "PRJ-2026-0042",
                deliveryCode: item.code || "ETG-001",
                isProjectMilestone: Boolean(item.isMilestone),
              }),
            });
            count++;
          }
        }
      }
      setLastAgendaSync(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
      toast(`${count} marcos e entregas sincronizados com a Agenda oficial da Campanha!`);
    } catch (e) {
      toast("Falha na sincronização com a agenda.", "error");
    } finally {
      setIsSyncingAgenda(false);
    }
  };

  // Abrir modal para agendar evento na campanha a partir de uma entrega
  const handleOpenScheduleModal = (item: any, faseName: string) => {
    setSelectedTaskForAgenda({ ...item, faseName });
    setAgendaEventTitle(`[PRJ-2026-0042] ${item.name}`);
    setAgendaEventType(item.isMilestone ? "inauguracao" : "vistoria");
    setAgendaEventDate("2026-08-15");
    setAgendaEventLocation("São Paulo - Zona Sul");
    setAgendaEventResponsible(item.responsible || "Coordenação de Campanha");
    setShowScheduleEventModal(true);
  };

  const handleConfirmScheduleAgenda = async () => {
    if (!agendaEventTitle.trim() || !agendaEventDate) {
      toast("Informe o título e a data do evento.", "error");
      return;
    }

    try {
      await fetch("/api/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: agendaEventTitle.trim(),
          descricao: `Compromisso de campanha vinculado à entrega ${selectedTaskForAgenda?.code || ""} do Projeto PRJ-2026-0042.`,
          dataCompleta: agendaEventDate,
          dataInicio: agendaEventDate,
          local: agendaEventLocation,
          tipo: agendaEventType,
          status: "confirmado",
          responsavel: agendaEventResponsible,
          projectCode: "PRJ-2026-0042",
          deliveryCode: selectedTaskForAgenda?.code || "ETG-001",
          isProjectMilestone: Boolean(selectedTaskForAgenda?.isMilestone),
        }),
      });

      toast(`Evento '${agendaEventTitle}' agendado com sucesso na Agenda da Campanha!`);
      setShowScheduleEventModal(false);
    } catch (e) {
      toast("Erro ao agendar na campanha.", "error");
    }
  };

  return (
    <div className="flex flex-col gap-5 font-sans text-xs antialiased select-none">
      {/* ── BARRA SUPERIOR DE AÇÕES ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab("visao_geral")}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#10213D] font-bold text-xs transition shadow-2xs cursor-pointer"
          >
            Detalhes do projeto
          </button>

          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-[#008B63] text-white font-extrabold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <CalendarIcon className="h-4 w-4" strokeWidth={2.2} />
            <span>Visão cronograma</span>
          </button>

          <button
            type="button"
            onClick={handleSyncAllWithAgenda}
            disabled={isSyncingAgenda}
            className="px-3.5 py-2 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] hover:bg-[#DBEAFE] text-[#1D4ED8] font-extrabold text-xs transition shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Sincronizar prazos e marcos com a Agenda da Campanha"
          >
            <CalendarCheck className="h-4 w-4 text-[#2563EB]" strokeWidth={2} />
            <span>{isSyncingAgenda ? "Sincronizando..." : "Sincronizar com Agenda da Campanha"}</span>
          </button>

          <button
            type="button"
            onClick={handleExportGantt}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#10213D] font-bold text-xs transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="h-4 w-4 text-[#1264F3]" strokeWidth={2} />
            <span>Exportar</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[11px] font-bold text-[#1D4ED8]">
            <span className="h-2 w-2 rounded-full bg-[#3B82F6] animate-pulse" />
            Integrado à Agenda da Campanha ({lastAgendaSync})
          </span>

          <button
            type="button"
            onClick={() => setShowAddMarcoModal(true)}
            className="h-10 px-5 rounded-xl bg-[#008B63] hover:bg-[#007553] text-white font-extrabold text-xs transition shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            <span>Novo marco</span>
          </button>
        </div>
      </div>

      {/* ── BARRA DE INDICADORES DE CRONOGRAMA ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-2xs">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-7 w-7 text-[#1264F3] bg-[#EAF2FF] p-1.5 rounded-xl" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#64748B]">Início</span>
            <span className="text-sm font-black text-[#10213D]">02/06/2025</span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-[#F1F5F9] pl-3">
          <CalendarIcon className="h-7 w-7 text-[#008B63] bg-[#E8F7F1] p-1.5 rounded-xl" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#64748B]">Término previsto</span>
            <span className="text-sm font-black text-[#10213D]">07/09/2025</span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-[#F1F5F9] pl-3">
          <Clock className="h-7 w-7 text-[#7928F5] bg-[#F3EAFF] p-1.5 rounded-xl" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#64748B]">Duração total</span>
            <span className="text-sm font-black text-[#10213D]">98 dias</span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-[#F1F5F9] pl-3">
          <CheckCircle2 className="h-7 w-7 text-[#008B63] bg-[#E8F7F1] p-1.5 rounded-xl" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#64748B]">Progresso</span>
            <span className="text-sm font-black text-[#008B63]">65%</span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-[#F1F5F9] pl-3">
          <CalendarCheck className="h-7 w-7 text-[#2563EB] bg-[#EFF6FF] p-1.5 rounded-xl" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#64748B]">Eventos Campanha</span>
            <span className="text-sm font-black text-[#1D4ED8]">6 agendados</span>
          </div>
        </div>
      </div>

      {/* ── BARRA DE FERRAMENTAS DO CRONOGRAMA ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E2E8F0] shadow-2xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="h-4 w-4 text-[#64748B] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar tarefa ou entrega..."
            className="h-9 w-full pl-9 pr-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#10213D] focus:bg-white focus:border-[#1264F3] focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Seletor de Zoom (Dia, Semana, Mês) */}
          <div className="flex items-center bg-[#F8FAFC] border border-[#E2E8F0] p-0.5 rounded-xl">
            <button
              type="button"
              onClick={() => setZoomLevel("dia")}
              className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition cursor-pointer ${
                zoomLevel === "dia" ? "bg-white text-[#10213D] shadow-2xs" : "text-[#64748B]"
              }`}
            >
              Dia
            </button>

            <button
              type="button"
              onClick={() => setZoomLevel("semana")}
              className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition cursor-pointer ${
                zoomLevel === "semana" ? "bg-[#008B63] text-white shadow-xs" : "text-[#64748B]"
              }`}
            >
              Semana
            </button>

            <button
              type="button"
              onClick={() => setZoomLevel("mes")}
              className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition cursor-pointer ${
                zoomLevel === "mes" ? "bg-white text-[#10213D] shadow-2xs" : "text-[#64748B]"
              }`}
            >
              Mês
            </button>
          </div>

          <span className="font-mono text-xs font-bold text-[#10213D] px-3 py-1.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
            02/06 — 07/09/2025
          </span>
        </div>
      </div>

      {/* ── VISUALIZAÇÃO HIERÁRQUICA DO GANTT COM LINHA DO TEMPO ── */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto no-scrollbar">
          <div className="min-w-[1100px] flex flex-col">
            {/* Cabeçalho da Tabela e Timeline */}
            <div className="grid grid-cols-[420px_1fr] bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs font-bold text-[#64748B]">
              <div className="grid grid-cols-[170px_80px_60px_50px_60px] p-3 border-r border-[#E2E8F0] items-center">
                <span>Item</span>
                <span>Responsável</span>
                <span>Início/Fim</span>
                <span>Prog.</span>
                <span className="text-center">Agenda</span>
              </div>

              {/* Cabeçalho das Semanas e Meses */}
              <div className="flex flex-col">
                <div className="grid grid-cols-4 text-center border-b border-[#E2E8F0] py-1 font-extrabold text-[#10213D]">
                  <span>junho 2025</span>
                  <span>julho 2025</span>
                  <span>agosto 2025</span>
                  <span>setembro 2025</span>
                </div>
                <div className="grid grid-cols-16 text-[10px] text-center text-[#64748B] py-1 font-mono border-b border-[#E2E8F0]">
                  <span>02 - 08</span>
                  <span>09 - 15</span>
                  <span>16 - 22</span>
                  <span>23 - 29</span>
                  <span>30 - 06</span>
                  <span>07 - 13</span>
                  <span>14 - 20</span>
                  <span>21 - 27</span>
                  <span>28 - 03</span>
                  <span>04 - 10</span>
                  <span>11 - 17</span>
                  <span>18 - 24</span>
                  <span>25 - 31</span>
                  <span>01 - 07</span>
                  <span>08 - 14</span>
                  <span>15 - 21</span>
                </div>
              </div>
            </div>

            {/* Corpo Hierárquico das Fases do Projeto */}
            <div className="flex flex-col relative divide-y divide-[#F1F5F9]">
              {/* Linha Vertical 'Hoje' */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-[#1264F3] z-20 pointer-events-none flex flex-col items-center"
                style={{ left: "calc(420px + 18%)" }}
              >
                <span className="bg-[#1264F3] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-xs -mt-2">
                  Hoje
                </span>
              </div>

              {cronogramaData.map((fase) => {
                const isExpanded = expandedFases[fase.id];

                return (
                  <React.Fragment key={fase.id}>
                    {/* Linha da Fase Pai */}
                    <div className="grid grid-cols-[420px_1fr] items-center hover:bg-[#F8FAFC] transition text-xs font-extrabold text-[#10213D] py-2.5">
                      <div className="grid grid-cols-[170px_80px_60px_50px_60px] px-3 items-center border-r border-[#E2E8F0]">
                        <button
                          type="button"
                          onClick={() => toggleFase(fase.id)}
                          className="flex items-center gap-1.5 hover:text-[#1264F3] transition text-left cursor-pointer truncate"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 shrink-0 text-[#1264F3]" />
                          ) : (
                            <ChevronRight className="h-4 w-4 shrink-0 text-[#64748B]" />
                          )}
                          <span className="truncate">{fase.name}</span>
                        </button>
                        <span className="text-[11px] font-medium text-[#64748B] truncate">
                          {fase.responsible}
                        </span>
                        <span className="text-[10px] font-mono text-[#64748B]">{fase.startDate}</span>
                        <span className="text-[10px] font-extrabold text-[#008B63]">{fase.progress}%</span>
                        <span className="text-center text-[10px] text-[#94A3B8]">—</span>
                      </div>

                      {/* Barra Visual de Fase na Timeline */}
                      <div className="px-4 relative flex items-center h-full">
                        <div
                          className="h-3 rounded-full bg-[#008B63] shadow-2xs relative"
                          style={{
                            width: `${fase.id === "phase-1" ? 22 : fase.id === "phase-2" ? 32 : fase.id === "phase-3" ? 28 : 18}%`,
                            marginLeft: `${fase.id === "phase-1" ? 0 : fase.id === "phase-2" ? 22 : fase.id === "phase-3" ? 54 : 80}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Itens Filhos da Fase */}
                    {isExpanded &&
                      fase.children?.map((item, idx) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-[420px_1fr] items-center hover:bg-[#F8FAFC] transition text-xs text-[#10213D] py-2 pl-4"
                        >
                          <div className="grid grid-cols-[170px_80px_60px_50px_60px] px-3 items-center border-r border-[#E2E8F0]">
                            <div className="flex items-center gap-2 truncate">
                              {item.status === "Concluída" ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-[#008B63] shrink-0" />
                              ) : item.status === "Atrasada" ? (
                                <AlertTriangle className="h-3.5 w-3.5 text-[#EF4444] shrink-0" />
                              ) : (
                                <span className="h-2 w-2 rounded-full bg-[#1264F3] shrink-0" />
                              )}
                              <span className="truncate font-medium text-xs">{item.name}</span>
                            </div>
                            <span className="text-[11px] text-[#64748B] truncate">{item.responsible}</span>
                            <span className="text-[10px] font-mono text-[#64748B]">{item.startDate}</span>
                            <span className="text-[10px] font-bold text-[#10213D]">{item.progress}%</span>

                            {/* Ação de Agendamento na Campanha */}
                            <div className="flex justify-center">
                              <button
                                type="button"
                                onClick={() => handleOpenScheduleModal(item, fase.name)}
                                className="p-1 rounded-md text-[#2563EB] hover:bg-[#EFF6FF] transition cursor-pointer"
                                title="Agendar evento na Campanha / Agenda"
                              >
                                <CalendarCheck className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Barras/Marcos do Gantt para cada Item */}
                          <div className="px-4 relative flex items-center h-full">
                            {item.isMilestone ? (
                              <div
                                className="flex items-center gap-1.5 cursor-pointer group"
                                style={{ marginLeft: `${idx * 15 + 5}%` }}
                                onClick={() => handleOpenScheduleModal(item, fase.name)}
                                title="Clique para agendar na Campanha"
                              >
                                <span className="h-3.5 w-3.5 rotate-45 bg-[#008B63] shadow-xs inline-block group-hover:scale-125 transition" />
                                <span className="text-[9px] font-extrabold text-[#008B63]">
                                  {item.code}
                                </span>
                                <span className="text-[8px] px-1 py-0.2 rounded bg-[#EFF6FF] text-[#1D4ED8] font-bold border border-[#BFDBFE]">
                                  Agenda
                                </span>
                              </div>
                            ) : (
                              <div
                                className={`h-2.5 rounded-full shadow-2xs ${
                                  item.status === "Concluída"
                                    ? "bg-[#008B63]"
                                    : item.status === "Atrasada"
                                    ? "bg-[#EF4444]"
                                    : item.status === "Crítica"
                                    ? "bg-[#F59E0B]"
                                    : item.status === "Em andamento"
                                    ? "bg-[#1264F3]"
                                    : "bg-[#CBD5E1]"
                                }`}
                                style={{
                                  width: `${item.progress > 0 ? item.progress * 0.3 + 15 : 12}%`,
                                  marginLeft: `${idx * 12 + (fase.id === "phase-2" ? 22 : fase.id === "phase-3" ? 54 : 0)}%`,
                                }}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── LEGENDA DO CRONOGRAMA DE GANTT (RODAPÉ) ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-[#F8FAFC] border-t border-[#E2E8F0] text-xs font-bold text-[#10213D]">
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-[#008B63]" />
              <span>Concluída</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-[#1264F3]" />
              <span>Em andamento</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-[#EF4444]" />
              <span>Atrasada</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-[#F59E0B]" />
              <span>Crítica</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rotate-45 bg-[#008B63]" />
              <span>Marco</span>
            </div>

            <div className="flex items-center gap-1.5 text-[#1D4ED8]">
              <CalendarCheck className="h-3.5 w-3.5" />
              <span>Integrado à Agenda da Campanha</span>
            </div>
          </div>

          <span className="text-[10px] text-[#64748B] font-medium">
            Sincronização em tempo real ativada
          </span>
        </div>
      </div>

      {/* MODAL AGENDAR EVENTO NA CAMPANHA A PARTIR DO CRONOGRAMA */}
      {showScheduleEventModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-lg w-full p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-extrabold text-[#10213D] flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-[#2563EB]" />
                Agendar na Campanha (Agenda)
              </h3>
              <button
                type="button"
                onClick={() => setShowScheduleEventModal(false)}
                className="text-[#64748B] p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-[#64748B]">
              Crie um compromisso ou marco oficial na <strong>Agenda de Campanha</strong> vinculado a esta entrega do projeto:
            </p>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#10213D]">Título do compromisso *</label>
                <input
                  type="text"
                  value={agendaEventTitle}
                  onChange={(e) => setAgendaEventTitle(e.target.value)}
                  className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#10213D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#10213D]">Tipo de evento</label>
                  <select
                    value={agendaEventType}
                    onChange={(e) => setAgendaEventType(e.target.value)}
                    className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#10213D]"
                  >
                    <option value="inauguracao">🎉 Inauguração / Entrega</option>
                    <option value="vistoria">🔍 Vistoria Técnica</option>
                    <option value="audiencia_publica">📢 Audiência Pública</option>
                    <option value="reuniao_comite">👥 Reunião de Comitê</option>
                    <option value="comicio">🎤 Ato / Evento Público</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#10213D]">Data do evento *</label>
                  <input
                    type="date"
                    value={agendaEventDate}
                    onChange={(e) => setAgendaEventDate(e.target.value)}
                    className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#10213D]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#10213D]">Local / Endereço</label>
                <input
                  type="text"
                  value={agendaEventLocation}
                  onChange={(e) => setAgendaEventLocation(e.target.value)}
                  placeholder="Ex.: Av. Principal, 1000 - Praça Central"
                  className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#10213D]">Responsável pelo evento</label>
                <input
                  type="text"
                  value={agendaEventResponsible}
                  onChange={(e) => setAgendaEventResponsible(e.target.value)}
                  className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setShowScheduleEventModal(false)}
                className="px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmScheduleAgenda}
                className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <CalendarCheck className="h-4 w-4" />
                Publicar na Agenda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOVO MARCO */}
      {showAddMarcoModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-md w-full p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-extrabold text-[#10213D]">Novo Marco no Cronograma</h3>
              <button
                type="button"
                onClick={() => setShowAddMarcoModal(false)}
                className="text-[#64748B] p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#10213D]">Nome do Marco *</label>
              <input
                type="text"
                value={marcoName}
                onChange={(e) => setMarcoName(e.target.value)}
                placeholder="Ex.: MAR-006 • Homologação Final"
                className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowAddMarcoModal(false)}
                className="px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddMarco}
                className="px-5 py-2 rounded-xl bg-[#008B63] text-white font-extrabold cursor-pointer"
              >
                Adicionar Marco
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
