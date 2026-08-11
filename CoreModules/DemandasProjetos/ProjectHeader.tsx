"use client";

import React from "react";
import type { ProjetoItem } from "./types";
import { Link2, ExternalLink, ShieldCheck } from "lucide-react";

export type ProjectSubTab =
  | "visao_geral"
  | "kanban"
  | "cronograma"
  | "orcamento"
  | "equipe"
  | "arquivos"
  | "historico";

interface ProjectHeaderProps {
  project: ProjetoItem;
  activeSubTab: ProjectSubTab;
  onTabChange: (tab: ProjectSubTab) => void;
  onOpenOriginalDemand: () => void;
  rightActions?: React.ReactNode;
}

export function ProjectHeader({
  project,
  activeSubTab,
  onTabChange,
  onOpenOriginalDemand,
  rightActions,
}: ProjectHeaderProps) {
  const tabs: Array<{ id: ProjectSubTab; label: string }> = [
    { id: "visao_geral", label: "Visão geral" },
    { id: "kanban", label: "Kanban" },
    { id: "cronograma", label: "Cronograma" },
    { id: "orcamento", label: "Orçamento" },
    { id: "equipe", label: "Equipe" },
    { id: "arquivos", label: "Arquivos" },
    { id: "historico", label: "Histórico" },
  ];

  return (
    <div className="flex flex-col gap-4 font-sans antialiased">
      {/* Breadcrumb e Ações Superiores */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-[#64748B] font-medium">
          <span>Demandas e Projetos</span>
          <span>/</span>
          <span>Projetos</span>
          <span>/</span>
          <span className="font-extrabold text-[#10213D]">{project.code}</span>
        </div>

        {rightActions && <div className="flex items-center gap-2">{rightActions}</div>}
      </div>

      {/* Título Principal e Badges */}
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-black text-[#10213D] tracking-tight">
            {project.title}
          </h1>

          <span className="font-mono text-xs font-black text-[#10213D] bg-[#F1F5F9] px-2.5 py-0.5 rounded-md border border-[#E2E8F0]">
            {project.code}
          </span>

          <span className="bg-[#EAF2FF] text-[#1264F3] border border-[#1264F3]/30 px-3 py-0.5 rounded-md text-xs font-black uppercase tracking-wider">
            {project.status}
          </span>

          <span className="bg-[#FEECEC] text-[#EF4444] border border-[#EF4444]/30 px-3 py-0.5 rounded-md text-xs font-black uppercase tracking-wider">
            Prioridade {project.priority.toLowerCase()}
          </span>
        </div>

        <p className="text-xs text-[#64748B] mt-0.5 font-medium">
          {project.description}
        </p>
      </div>

      {/* BANNER DE ORIGEM DA DEMANDA */}
      <div className="bg-[#EAF2FF] border border-[#1264F3]/30 p-3.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5 text-xs text-[#1264F3] font-bold">
          <Link2 className="h-4 w-4 shrink-0" strokeWidth={2.2} />
          <span>
            Projeto originado da demanda{" "}
            <strong className="font-mono font-black">{project.demandaCode}</strong> — análise concluída e conversão aprovada.
          </span>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <button
            type="button"
            onClick={onOpenOriginalDemand}
            className="text-xs font-extrabold text-[#1264F3] hover:underline flex items-center gap-1 transition cursor-pointer"
          >
            <span>Abrir demanda original</span>
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
          </button>

          <span className="bg-[#E8F7F1] text-[#008B63] border border-[#00A978]/30 px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} />
            <span>Vínculo permanente</span>
          </span>
        </div>
      </div>

      {/* SUBNAVEGAÇÃO DO PROJETO (Visão geral, Kanban, Cronograma, Orçamento, Equipe, Arquivos, Histórico) */}
      <div className="border-b border-[#E2E8F0] pt-1 flex items-center gap-6 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`pb-3 text-xs font-bold transition-all relative whitespace-nowrap cursor-pointer ${
                isActive
                  ? "text-[#008B63] font-black"
                  : "text-[#64748B] hover:text-[#10213D]"
              }`}
            >
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#008B63] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
