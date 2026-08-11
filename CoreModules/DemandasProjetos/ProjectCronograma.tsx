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
  Clock,
  AlertTriangle,
  CheckCircle2,
  X,
  Diamond,
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

  return (
    <div className="flex flex-col gap-5 font-sans text-xs antialiased select-none">
      {/* ── BARRA SUPERIOR DE AÇÕES (CONFORME IMAGEM 4) ── */}
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
            onClick={() => toast("Navegado para o dia atual no gráfico de Gantt")}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#10213D] font-bold text-xs transition shadow-2xs cursor-pointer"
          >
            Hoje
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

        <button
          type="button"
          onClick={() => setShowAddMarcoModal(true)}
          className="h-10 px-5 rounded-xl bg-[#008B63] hover:bg-[#007553] text-white font-extrabold text-xs transition shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          <span>Novo marco</span>
        </button>
      </div>

      {/* ── BARRA DE INDICADORES DE CRONOGRAMA (CONFORME IMAGEM 4) ── */}
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
            <span className="text-sm font-black text-[#10213D]">30/09/2025</span>
          </div>
        </div>

        <div className="flex flex-col border-l border-[#F1F5F9] pl-3 justify-center">
          <span className="text-[10px] font-bold text-[#64748B]">Progresso geral</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm font-black text-[#10213D]">45%</span>
            <div className="w-20 bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
              <div className="bg-[#008B63] h-full rounded-full" style={{ width: "45%" }} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-[#F1F5F9] pl-3">
          <CheckCircle2 className="h-7 w-7 text-[#008B63] bg-[#E8F7F1] p-1.5 rounded-xl" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#64748B]">Marcos concluídos</span>
            <span className="text-sm font-black text-[#008B63]">3 de 8</span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-[#F1F5F9] pl-3">
          <AlertTriangle className="h-7 w-7 text-[#EF4444] bg-[#FEECEC] p-1.5 rounded-xl" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#64748B]">Itens atrasados</span>
            <span className="text-sm font-black text-[#EF4444]">2</span>
          </div>
        </div>
      </div>

      {/* ── BARRA DE CONTROLES DE ZOOM E FILTROS ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E2E8F0] shadow-2xs">
        <div className="relative flex-1 max-w-xs">
          <Search className="h-4 w-4 text-[#64748B] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar tarefa ou entrega..."
            className="h-9 w-full pl-9 pr-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#10213D] focus:bg-white focus:border-[#1264F3] focus:outline-none"
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

      {/* ── VISUALIZAÇÃO HIERÁRQUICA DO GANTT COM LINHA DO TEMPO (IMAGEM 4) ── */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto no-scrollbar">
          <div className="min-w-[1100px] flex flex-col">
            
            {/* Cabeçalho da Tabela e Timeline de Meses */}
            <div className="grid grid-cols-[380px_1fr] bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs font-bold text-[#64748B]">
              <div className="grid grid-cols-[180px_90px_55px_55px] p-3 border-r border-[#E2E8F0]">
                <span>Item</span>
                <span>Responsável</span>
                <span>Início / Fim</span>
                <span>Prog.</span>
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
                style={{ left: "calc(380px + 18%)" }}
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
                    <div className="grid grid-cols-[380px_1fr] items-center hover:bg-[#F8FAFC] transition text-xs font-extrabold text-[#10213D] py-2.5">
                      <div className="grid grid-cols-[180px_90px_55px_55px] px-3 items-center border-r border-[#E2E8F0]">
                        <button
                          type="button"
                          onClick={() => toggleFase(fase.id)}
                          className="flex items-center gap-1.5 hover:text-[#1264F3] transition text-left cursor-pointer truncate"
                        >
                          {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0 text-[#1264F3]" /> : <ChevronRight className="h-4 w-4 shrink-0 text-[#64748B]" />}
                          <span className="truncate">{fase.name}</span>
                        </button>
                        <span className="text-[11px] font-medium text-[#64748B] truncate">{fase.responsible}</span>
                        <span className="text-[10px] font-mono text-[#64748B]">{fase.startDate}</span>
                        <span className="text-[10px] font-extrabold text-[#008B63]">{fase.progress}%</span>
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
                          className="grid grid-cols-[380px_1fr] items-center hover:bg-[#F8FAFC] transition text-xs text-[#10213D] py-2 pl-4"
                        >
                          <div className="grid grid-cols-[180px_90px_55px_55px] px-3 items-center border-r border-[#E2E8F0]">
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
                          </div>

                          {/* Barras/Marcos do Gantt para cada Item */}
                          <div className="px-4 relative flex items-center h-full">
                            {item.isMilestone ? (
                              <div
                                className="flex items-center gap-1"
                                style={{ marginLeft: `${idx * 15 + 5}%` }}
                              >
                                <span className="h-3.5 w-3.5 rotate-45 bg-[#008B63] shadow-xs inline-block" />
                                <span className="text-[9px] font-extrabold text-[#008B63]">{item.code}</span>
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
              <span className="h-3 w-3 rounded bg-[#CBD5E1]" />
              <span>Futura</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rotate-45 bg-[#008B63]" />
              <span>Marco</span>
            </div>

            <div className="flex items-center gap-2 text-[#64748B]">
              <span>→ Dependência</span>
            </div>
          </div>

          <span className="text-[10px] text-[#64748B] font-medium">
            Sincronização em tempo real ativada
          </span>
        </div>
      </div>

      {/* MODAL NOVO MARCO */}
      {showAddMarcoModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-md w-full p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-extrabold text-[#10213D]">Novo Marco no Cronograma</h3>
              <button type="button" onClick={() => setShowAddMarcoModal(false)} className="text-[#64748B] p-1">
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
                className="px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddMarco}
                className="px-5 py-2 rounded-xl bg-[#008B63] text-white font-extrabold"
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
