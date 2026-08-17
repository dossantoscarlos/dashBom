"use client";

import React from "react";
import type { ProjetoItem, DemandaItem, OrcamentoCategoria, FinancialTransaction, TeamMember, CronogramaItem, KanbanTask } from "./types";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Wallet,
  Users,
  Calendar,
  ArrowRight,
  Plus,
  FileText,
  Upload,
  UserPlus,
  Building,
  Target,
} from "lucide-react";

interface ProjectVisaoGeralProps {
  project: ProjetoItem;
  demanda?: DemandaItem | null;
  categorias?: OrcamentoCategoria[];
  transacoes?: FinancialTransaction[];
  members?: TeamMember[];
  cronogramaData?: CronogramaItem[];
  kanbanTasks?: KanbanTask[];
  onNavigateTab: (tab: any) => void;
  onOpenOriginalDemand?: () => void;
}

export function ProjectVisaoGeral({
  project,
  demanda,
  categorias = [],
  transacoes = [],
  members = [],
  cronogramaData = [],
  kanbanTasks = [],
  onNavigateTab,
  onOpenOriginalDemand,
}: ProjectVisaoGeralProps) {
  // Cálculo do Orçamento Real do Projeto
  const totalOrcado =
    categorias.length > 0
      ? categorias.reduce((acc, cat) => acc + cat.planned, 0)
      : demanda?.estimatedBudget || 0;

  const totalPago = transacoes
    .filter((tx) => tx.status === "Pago")
    .reduce((acc, tx) => acc + tx.value, 0);

  const totalComprometido = transacoes
    .filter((tx) => tx.status === "Comprometido" || tx.status === "Aguardando aprovação")
    .reduce((acc, tx) => acc + tx.value, 0);

  const saldoDisponivel = Math.max(0, totalOrcado - (totalPago + totalComprometido));
  const pctPago = totalOrcado > 0 ? Math.min(100, Math.round((totalPago / totalOrcado) * 100)) : 0;

  // Extrair entregas e marcos reais do cronograma ou kanban
  const allDeliveries: { code: string; name: string; responsible: string; status: string; isMilestone: boolean }[] = [];
  cronogramaData.forEach((fase) => {
    if (fase.children) {
      fase.children.forEach((c) => {
        allDeliveries.push({
          code: c.code || "ETG-001",
          name: c.name,
          responsible: c.responsible || project.responsible,
          status: c.status,
          isMilestone: Boolean(c.isMilestone),
        });
      });
    }
  });

  return (
    <div className="flex flex-col gap-6 font-sans text-xs antialiased">
      {/* Banner de Contexto da Demanda de Origem */}
      {demanda && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-zinc-900 dark:to-zinc-950 border border-blue-200 dark:border-zinc-800 rounded-2xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
              PRJ
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase text-blue-700 dark:text-blue-400">
                Projeto Criado a partir da Demanda{" "}
                <button
                  type="button"
                  onClick={onOpenOriginalDemand}
                  className="font-mono font-black underline hover:text-[#008B63] transition cursor-pointer"
                  title="Abrir Análise Técnica da Demanda Original"
                >
                  {demanda.code}
                </button>
              </span>
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">{project.title}</h3>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                Solicitante: <strong>{demanda.applicantName || "Comunidade"}</strong> • Local: <strong>{demanda.bairro || demanda.municipio || "Geral"}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200">
              Centro de Custo: {demanda.costCenterName || demanda.budgetSource || "Campanha Parlamentar"}
            </span>
          </div>
        </div>
      )}

      {/* Cards Indicadores Executivos com Dados Reais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Progresso Geral */}
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-[#E2E8F0] dark:border-zinc-800 shadow-2xs flex flex-col gap-2">
          <span className="text-xs font-bold text-[#64748B]">Progresso Geral</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-[#10213D] dark:text-zinc-100">{project.progress}%</span>
            <span className="text-[11px] font-extrabold text-[#008B63] bg-[#E8F7F1] dark:bg-emerald-950/50 px-2 py-0.5 rounded">
              {project.status || "Em andamento"}
            </span>
          </div>
          <div className="w-full bg-[#E2E8F0] dark:bg-zinc-800 h-2 rounded-full overflow-hidden mt-1">
            <div className="bg-[#008B63] h-full rounded-full" style={{ width: `${project.progress}%` }} />
          </div>
        </div>

        {/* Período do Projeto */}
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-[#E2E8F0] dark:border-zinc-800 shadow-2xs flex flex-col gap-2">
          <span className="text-xs font-bold text-[#64748B]">Prazo de Execução</span>
          <div className="flex flex-col">
            <span className="text-sm font-black text-[#10213D] dark:text-zinc-100">
              {project.startDate} a {project.endDate}
            </span>
            <span className="text-[11px] text-[#64748B] mt-0.5">
              Prioridade: <strong className="text-amber-600">{project.priority}</strong>
            </span>
          </div>
        </div>

        {/* Orçamento Resumido */}
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-[#E2E8F0] dark:border-zinc-800 shadow-2xs flex flex-col gap-2">
          <span className="text-xs font-bold text-[#64748B]">Orçamento da Demanda</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-[#10213D] dark:text-zinc-100">
              R$ {totalOrcado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] font-extrabold text-[#1264F3] bg-[#EAF2FF] dark:bg-blue-950/50 px-2 py-0.5 rounded">
              {pctPago}% pago
            </span>
          </div>
          <span className="text-[10px] text-[#64748B]">
            Saldo disponível: R$ {saldoDisponivel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Equipe Resumida */}
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-[#E2E8F0] dark:border-zinc-800 shadow-2xs flex flex-col gap-2">
          <span className="text-xs font-bold text-[#64748B]">Equipe Alocada</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-[#10213D] dark:text-zinc-100">
              {members.length > 0 ? members.length : 1} Integrantes
            </span>
            <span className="text-[11px] font-extrabold text-[#008B63] bg-[#E8F7F1] px-2 py-0.5 rounded">
              Ativo
            </span>
          </div>
          <span className="text-[10px] text-[#64748B]">
            Gerente: <strong>{project.responsible}</strong>
          </span>
        </div>
      </div>

      {/* Ações Rápidas de Atalho */}
      <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-[#E2E8F0] dark:border-zinc-800 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-extrabold text-[#10213D] dark:text-zinc-100 uppercase tracking-wider">
          Ações Rápidas do Projeto:
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab("kanban")}
            className="px-3.5 py-2 rounded-xl bg-[#008B63] hover:bg-[#007553] text-white font-extrabold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Ver Kanban ({kanbanTasks.length} tarefas)</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("cronograma")}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 hover:bg-[#F8FAFC] text-[#10213D] dark:text-zinc-100 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Calendar className="h-3.5 w-3.5 text-[#1264F3]" />
            <span>Cronograma & Gantt</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("orcamento")}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 hover:bg-[#F8FAFC] text-[#10213D] dark:text-zinc-100 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Wallet className="h-3.5 w-3.5 text-[#F59E0B]" />
            <span>Orçamento & Despesas</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("equipe")}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 hover:bg-[#F8FAFC] text-[#10213D] dark:text-zinc-100 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <UserPlus className="h-3.5 w-3.5 text-[#008B63]" />
            <span>Equipe ({members.length})</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("arquivos")}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 hover:bg-[#F8FAFC] text-[#10213D] dark:text-zinc-100 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Upload className="h-3.5 w-3.5 text-[#7928F5]" />
            <span>Arquivos & Documentos</span>
          </button>
        </div>
      </div>

      {/* Grid de Seções de Acompanhamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas Entregas e Marcos Reais */}
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-[#E2E8F0] dark:border-zinc-800 shadow-2xs flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-zinc-800 pb-3">
            <h3 className="text-xs font-extrabold text-[#10213D] dark:text-zinc-100 uppercase tracking-wider">
              Próximos Marcos e Entregas do Projeto
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab("cronograma")}
              className="text-xs font-bold text-[#1264F3] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver cronograma</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <ul className="flex flex-col gap-3">
            {allDeliveries.length === 0 ? (
              <li className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-center text-zinc-500 text-xs">
                Início das entregas programado para {project.startDate}.
              </li>
            ) : (
              allDeliveries.slice(0, 4).map((del, i) => (
                <li key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    {del.isMilestone ? (
                      <Target className="h-5 w-5 text-purple-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-[#008B63] shrink-0" />
                    )}
                    <div>
                      <h4 className="font-extrabold text-[#10213D] dark:text-zinc-100">
                        {del.code} • {del.name}
                      </h4>
                      <p className="text-[10px] text-[#64748B]">Responsável: {del.responsible}</p>
                    </div>
                  </div>
                  <span className="bg-[#E8F7F1] text-[#008B63] px-2 py-0.5 rounded text-[10px] font-extrabold">
                    {del.status}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Resumo de Riscos e Governança da Demanda */}
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-[#E2E8F0] dark:border-zinc-800 shadow-2xs flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-zinc-800 pb-3">
            <h3 className="text-xs font-extrabold text-[#10213D] dark:text-zinc-100 uppercase tracking-wider">
              Governança e Diretrizes do Projeto
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab("orcamento")}
              className="text-xs font-bold text-[#1264F3] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver orçamento</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <div className="p-3 rounded-xl bg-[#EAF2FF] dark:bg-blue-950/30 border border-[#1264F3]/30 flex items-start gap-3">
              <Building className="h-5 w-5 text-[#1264F3] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-[#10213D] dark:text-zinc-100">Centro de Custo e Orçamento</h4>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Recursos vinculados ao centro: <strong>{demanda?.costCenterName || demanda?.budgetSource || "Campanha Parlamentar"}</strong> no valor total de R$ {totalOrcado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#E8F7F1] dark:bg-emerald-950/30 border border-[#00A978]/30 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#008B63] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-[#10213D] dark:text-zinc-100">Homologação Técnica Válida</h4>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Parecer técnico emitido e aprovado formalmente por <strong>{demanda?.approvedBy || project.responsible}</strong>.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#FFF4E5] dark:bg-amber-950/30 border border-[#F59E0B]/30 flex items-start gap-3">
              <Clock className="h-5 w-5 text-[#F59E0B] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-[#10213D] dark:text-zinc-100">Prazo e Cronograma</h4>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Execução planejada com início em {project.startDate} e término previsto para {project.endDate}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
