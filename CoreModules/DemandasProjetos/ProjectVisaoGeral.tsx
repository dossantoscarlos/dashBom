"use client";

import React from "react";
import type { ProjetoItem } from "./types";
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
  Kanban,
  FileSpreadsheet,
} from "lucide-react";

interface ProjectVisaoGeralProps {
  project: ProjetoItem;
  onNavigateTab: (tab: any) => void;
}

export function ProjectVisaoGeral({
  project,
  onNavigateTab,
}: ProjectVisaoGeralProps) {
  return (
    <div className="flex flex-col gap-6 font-sans text-xs antialiased">
      {/* Cards Indicadores Executivos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Progresso Geral */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-col gap-2">
          <span className="text-xs font-bold text-[#64748B]">Progresso Geral</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-[#10213D]">{project.progress}%</span>
            <span className="text-[11px] font-extrabold text-[#008B63] bg-[#E8F7F1] px-2 py-0.5 rounded">
              Em andamento
            </span>
          </div>
          <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden mt-1">
            <div className="bg-[#008B63] h-full rounded-full" style={{ width: `${project.progress}%` }} />
          </div>
        </div>

        {/* Período do Projeto */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-col gap-2">
          <span className="text-xs font-bold text-[#64748B]">Prazo de Execução</span>
          <div className="flex flex-col">
            <span className="text-sm font-black text-[#10213D]">
              {project.startDate} a {project.endDate}
            </span>
            <span className="text-[11px] text-[#64748B] mt-0.5">Término previsto em 45 dias</span>
          </div>
        </div>

        {/* Orçamento Resumido */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-col gap-2">
          <span className="text-xs font-bold text-[#64748B]">Orçamento Aprovado</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-[#10213D]">R$ 480.000,00</span>
            <span className="text-[11px] font-extrabold text-[#1264F3] bg-[#EAF2FF] px-2 py-0.5 rounded">
              38% pago
            </span>
          </div>
          <span className="text-[10px] text-[#64748B]">Saldo disponível: R$ 200.800,00</span>
        </div>

        {/* Equipe Resumida */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-col gap-2">
          <span className="text-xs font-bold text-[#64748B]">Equipe Alocada</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-[#10213D]">6 Integrantes</span>
            <span className="text-[11px] font-extrabold text-[#F59E0B] bg-[#FFF4E5] px-2 py-0.5 rounded">
              68% cap.
            </span>
          </div>
          <span className="text-[10px] text-[#64748B]">1 integrante em sobrecarga</span>
        </div>
      </div>

      {/* Ações Rápidas de Atalho */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-extrabold text-[#10213D] uppercase tracking-wider">
          Ações Rápidas do Projeto:
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab("kanban")}
            className="px-3.5 py-2 rounded-xl bg-[#008B63] hover:bg-[#007553] text-white font-extrabold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Nova tarefa</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("cronograma")}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#10213D] font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Calendar className="h-3.5 w-3.5 text-[#1264F3]" />
            <span>Novo marco</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("orcamento")}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#10213D] font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Wallet className="h-3.5 w-3.5 text-[#F59E0B]" />
            <span>Nova despesa</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("equipe")}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#10213D] font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <UserPlus className="h-3.5 w-3.5 text-[#008B63]" />
            <span>Adicionar integrante</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("arquivos")}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#10213D] font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Upload className="h-3.5 w-3.5 text-[#7928F5]" />
            <span>Enviar arquivo</span>
          </button>
        </div>
      </div>

      {/* Grid de Seções de Acompanhamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas Entregas e Marcos */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <h3 className="text-xs font-extrabold text-[#10213D] uppercase tracking-wider">
              Próximos Marcos e Entregas
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
            <li className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#008B63]" />
                <div>
                  <h4 className="font-extrabold text-[#10213D]">MAR-003 • Aprovação do termo de abertura</h4>
                  <p className="text-[10px] text-[#64748B]">Concluído em 04/06/2025 por Ana Paula</p>
                </div>
              </div>
              <span className="bg-[#E8F7F1] text-[#008B63] px-2 py-0.5 rounded text-[10px] font-extrabold">100%</span>
            </li>

            <li className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-[#1264F3]" />
                <div>
                  <h4 className="font-extrabold text-[#10213D]">ETG-009 • Diagnóstico e levantamento técnico</h4>
                  <p className="text-[10px] text-[#64748B]">Prazo: 18/07/2025 · Resp: Rafael Pereira</p>
                </div>
              </div>
              <span className="bg-[#EAF2FF] text-[#1264F3] px-2 py-0.5 rounded text-[10px] font-extrabold">65%</span>
            </li>

            <li className="flex items-center justify-between p-3 rounded-xl bg-[#FEECEC] border border-[#EF4444]/30">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-[#EF4444]" />
                <div>
                  <h4 className="font-extrabold text-[#10213D]">ETG-007 • Projeto arquitetônico preliminar</h4>
                  <p className="text-[10px] text-[#EF4444]">Atrasado · Revisa acessibilidade</p>
                </div>
              </div>
              <span className="bg-[#EF4444] text-white px-2 py-0.5 rounded text-[10px] font-extrabold">20%</span>
            </li>
          </ul>
        </div>

        {/* Resumo de Riscos e Alertas Orçamentários */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <h3 className="text-xs font-extrabold text-[#10213D] uppercase tracking-wider">
              Alertas e Riscos Monitorados
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
            <div className="p-3 rounded-xl bg-[#FFF4E5] border border-[#F59E0B]/30 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-[#F59E0B] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-[#10213D]">Atenção no Orçamento de Obras</h4>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  A categoria Obras e infraestrutura atingiu 72% de comprometimento financeiro.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#EAF2FF] border border-[#1264F3]/30 flex items-start gap-3">
              <Users className="h-5 w-5 text-[#1264F3] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-[#10213D]">Alocação de Integrante</h4>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  João Victor encontra-se em sobrecarga (120% de alocação) na revisão de entregas.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#E8F7F1] border border-[#00A978]/30 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#008B63] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-[#10213D]">Reserva de Contingência Preservada</h4>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Saldo de R$ 12.000,00 preservado para imprevistos da fase final.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
