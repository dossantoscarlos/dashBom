"use client";

import React, { useState } from "react";
import type { TeamMember, RaciItem } from "./types";
import { useToast } from "@/components/dashboard/Toast";
import {
  Users,
  UserPlus,
  ShieldCheck,
  AlertTriangle,
  MoreVertical,
  CheckCircle2,
  Clock,
  X,
} from "lucide-react";

interface ProjectEquipeProps {
  members: TeamMember[];
  raciItems: RaciItem[];
  onAddMember: (m: TeamMember) => void;
  onNavigateTab: (tab: any) => void;
}

export function ProjectEquipe({
  members,
  raciItems,
  onAddMember,
  onNavigateTab,
}: ProjectEquipeProps) {
  const { toast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<"membros" | "papeis" | "raci">("membros");
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // Form State para Novo Integrante
  const [name, setName] = useState("");
  const [role, setRole] = useState("Analista");
  const [department, setDepartment] = useState("Engenharia");

  const handleCreateMember = () => {
    if (!name.trim()) {
      toast("Por favor, preencha o nome do integrante.", "error");
      return;
    }

    const initials = name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    const newMember: TeamMember = {
      id: `tm-${Date.now()}`,
      name,
      role,
      department,
      status: "Disponível",
      tasksCount: 1,
      allocationPercent: 50,
      avatarInitials: initials,
      avatarBg: "bg-[#1264F3]",
    };

    onAddMember(newMember);
    toast(`Integrante ${name} adicionado à equipe com sucesso!`);
    setName("");
    setShowAddMemberModal(false);
  };

  return (
    <div className="flex flex-col gap-6 font-sans text-xs antialiased select-none">
      {/* ── BARRA SUPERIOR DE AÇÕES (IMAGEM 2) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toast("Matriz de Permissões da Equipe aberta!")}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#10213D] font-bold text-xs transition shadow-2xs cursor-pointer"
          >
            Gerenciar permissões
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowAddMemberModal(true)}
          className="h-10 px-5 rounded-xl bg-[#008B63] hover:bg-[#007553] text-white font-extrabold text-xs transition shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
        >
          <UserPlus className="h-4 w-4" strokeWidth={2.5} />
          <span>Adicionar integrante</span>
        </button>
      </div>

      {/* ── CARD INDICADORES DE EQUIPE CHAVE (IMAGEM 2) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-2xs">
        <div className="flex items-center gap-3">
          <Users className="h-7 w-7 text-[#1264F3] bg-[#EAF2FF] p-1.5 rounded-xl shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#64748B]">Integrantes</span>
            <span className="text-sm font-black text-[#10213D]">{members.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-[#F1F5F9] pl-3">
          <ShieldCheck className="h-7 w-7 text-[#008B63] bg-[#E8F7F1] p-1.5 rounded-xl shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#64748B]">Papéis definidos</span>
            <span className="text-sm font-black text-[#10213D]">{members.length} de {members.length}</span>
          </div>
        </div>

        <div className="flex flex-col border-l border-[#F1F5F9] pl-3 justify-center">
          <span className="text-[10px] font-bold text-[#64748B]">Capacidade utilizada</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm font-black text-[#10213D]">68%</span>
            <div className="w-16 bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
              <div className="bg-[#1264F3] h-full rounded-full" style={{ width: "68%" }} />
            </div>
          </div>
        </div>

        <div className="flex flex-col border-l border-[#F1F5F9] pl-3 justify-center">
          <span className="text-[10px] font-bold text-[#64748B]">Tarefas atribuídas</span>
          <span className="text-sm font-black text-[#10213D]">13 de 16</span>
        </div>

        <div className="flex items-center gap-3 border-l border-[#F1F5F9] pl-3">
          <AlertTriangle className="h-7 w-7 text-[#F59E0B] bg-[#FFF4E5] p-1.5 rounded-xl shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#64748B]">Sobrecarga</span>
            <span className="text-sm font-black text-[#F59E0B]">1 integrante</span>
          </div>
        </div>
      </div>

      {/* ── SUB-NAVEGAÇÃO INTERNA DA EQUIPE (Membros, Papéis e permissões, Matriz RACI) ── */}
      <div className="border-b border-[#E2E8F0] flex items-center gap-6">
        <button
          type="button"
          onClick={() => setActiveSubTab("membros")}
          className={`pb-2.5 text-xs font-bold transition relative cursor-pointer ${
            activeSubTab === "membros" ? "text-[#008B63] font-black" : "text-[#64748B]"
          }`}
        >
          <span>Membros</span>
          {activeSubTab === "membros" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#008B63]" />}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("papeis")}
          className={`pb-2.5 text-xs font-bold transition relative cursor-pointer ${
            activeSubTab === "papeis" ? "text-[#008B63] font-black" : "text-[#64748B]"
          }`}
        >
          <span>Papéis e permissões</span>
          {activeSubTab === "papeis" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#008B63]" />}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("raci")}
          className={`pb-2.5 text-xs font-bold transition relative cursor-pointer ${
            activeSubTab === "raci" ? "text-[#008B63] font-black" : "text-[#64748B]"
          }`}
        >
          <span>Matriz RACI</span>
          {activeSubTab === "raci" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#008B63]" />}
        </button>
      </div>

      {/* ── GRID DE MEMBROS E GRÁFICO DE CARGA DE TRABALHO (IMAGEM 2) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* Cartões dos Membros da Equipe */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-col gap-4">
          <h3 className="text-xs font-extrabold text-[#10213D] uppercase tracking-wider border-b border-[#E2E8F0] pb-2.5">
            Membros do projeto
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {members.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white transition flex flex-col gap-3 shadow-2xs relative"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full ${m.avatarBg} text-white font-black text-xs flex items-center justify-center shadow-2xs`}>
                      {m.avatarInitials}
                    </div>

                    <div className="flex flex-col">
                      <h4 className="font-extrabold text-[#10213D] text-xs">{m.name}</h4>
                      <span className="text-[11px] font-semibold text-[#64748B]">{m.role}</span>
                      <span className="text-[10px] text-[#64748B]">Equipe: {m.department}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      m.status === "Disponível"
                        ? "bg-[#E8F7F1] text-[#008B63]"
                        : m.status === "Adequada"
                        ? "bg-[#EAF2FF] text-[#1264F3]"
                        : "bg-[#FFF4E5] text-[#F59E0B]"
                    }`}
                  >
                    {m.status}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] text-[11px]">
                  <span className="text-[#64748B]">Tarefas: <strong className="text-[#10213D] font-black">{m.tasksCount}</strong></span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#64748B]">Alocação: <strong className="text-[#10213D] font-black">{m.allocationPercent}%</strong></span>
                    <div className="w-14 bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          m.allocationPercent > 100
                            ? "bg-[#F59E0B]"
                            : m.allocationPercent >= 90
                            ? "bg-[#1264F3]"
                            : "bg-[#008B63]"
                        }`}
                        style={{ width: `${Math.min(m.allocationPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de Carga de Trabalho & Distribuição de Tarefas (Imagem 2) */}
        <div className="flex flex-col gap-5">
          {/* Carga de Trabalho Por Integrante */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-col gap-4">
            <h3 className="text-xs font-extrabold text-[#10213D] uppercase tracking-wider border-b border-[#E2E8F0] pb-2.5">
              Carga de trabalho
            </h3>

            <div className="flex flex-col gap-3">
              {members.map((m) => (
                <div key={m.id} className="flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#10213D]">{m.name}</span>
                    <span className="font-mono text-[11px] font-bold text-[#64748B]">{m.allocationPercent}%</span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        m.allocationPercent > 100
                          ? "bg-[#F59E0B]"
                          : m.allocationPercent >= 90
                          ? "bg-[#1264F3]"
                          : "bg-[#008B63]"
                      }`}
                      style={{ width: `${Math.min(m.allocationPercent, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 text-[10px] font-bold border-t border-[#E2E8F0] pt-2">
              <div className="flex items-center gap-1.5 text-[#008B63]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#008B63]" />
                <span>Disponível</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#1264F3]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#1264F3]" />
                <span>Adequada</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#F59E0B]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
                <span>Sobrecarga</span>
              </div>
            </div>
          </div>

          {/* Distribuição de Tarefas */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-col gap-3">
            <h4 className="text-xs font-extrabold text-[#10213D] uppercase tracking-wider border-b border-[#E2E8F0] pb-2">
              Distribuição de tarefas
            </h4>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-3 bg-[#EAF2FF] rounded-xl border border-[#1264F3]/30">
                <span className="text-[10px] text-[#1264F3] font-bold block">A fazer</span>
                <span className="text-base font-black text-[#10213D]">6</span>
              </div>

              <div className="p-3 bg-[#F3EAFF] rounded-xl border border-[#7928F5]/30">
                <span className="text-[10px] text-[#7928F5] font-bold block">Em execução</span>
                <span className="text-base font-black text-[#10213D]">5</span>
              </div>

              <div className="p-3 bg-[#FFF4E5] rounded-xl border border-[#F59E0B]/30">
                <span className="text-[10px] text-[#F59E0B] font-bold block">Em validação</span>
                <span className="text-base font-black text-[#10213D]">3</span>
              </div>

              <div className="p-3 bg-[#FEECEC] rounded-xl border border-[#EF4444]/30">
                <span className="text-[10px] text-[#EF4444] font-bold block">Atrasadas</span>
                <span className="text-base font-black text-[#EF4444]">2</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABELA MATRIZ RACI DAS ENTREGAS (IMAGEM 2) ── */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-col gap-4">
        <h3 className="text-xs font-extrabold text-[#10213D] uppercase tracking-wider border-b border-[#E2E8F0] pb-2.5">
          Responsabilidades nas entregas (Matriz RACI)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B] font-extrabold">
                <th className="py-2.5">Entrega</th>
                <th className="py-2.5">Responsável (R)</th>
                <th className="py-2.5">Aprovador (A)</th>
                <th className="py-2.5">Consultados (C)</th>
                <th className="py-2.5">Informados (I)</th>
                <th className="py-2.5 text-right">Prazo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] font-medium text-[#10213D]">
              {raciItems.map((raci) => (
                <tr key={raci.id} className="hover:bg-[#F8FAFC]">
                  <td className="py-3 font-extrabold flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[#1264F3] bg-[#EAF2FF] px-2 py-0.5 rounded">
                      {raci.deliveryCode}
                    </span>
                    <span>{raci.deliveryName}</span>
                  </td>

                  <td className="py-3 font-bold text-[#10213D]">{raci.responsible}</td>
                  <td className="py-3 text-[#008B63] font-extrabold">{raci.approver}</td>

                  {/* Consultados */}
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      {raci.consulted.map((c, i) => (
                        <span key={i} className="h-5 w-5 rounded-full bg-[#1264F3] text-white text-[9px] font-black flex items-center justify-center">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Informados */}
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      {raci.informed.map((inf, i) => (
                        <span key={i} className="h-5 w-5 rounded-full bg-[#F59E0B] text-white text-[9px] font-black flex items-center justify-center">
                          {inf}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3 text-right font-mono font-bold text-[#EF4444]">{raci.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL NOVO INTEGRANTE */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-md w-full p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-extrabold text-[#10213D]">Adicionar Integrante à Equipe</h3>
              <button type="button" onClick={() => setShowAddMemberModal(false)} className="text-[#64748B] p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#10213D]">Nome Completo *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex.: Mariana Fernandes"
                  className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#10213D]">Papel / Função</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium"
                  >
                    <option value="Gerente do projeto">Gerente do projeto</option>
                    <option value="Responsável técnico">Responsável técnico</option>
                    <option value="Revisor">Revisor</option>
                    <option value="Analista">Analista</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Comunicação">Comunicação</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#10213D]">Equipe / Depto</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium"
                  >
                    <option value="Gestão de Projetos">Gestão de Projetos</option>
                    <option value="Engenharia">Engenharia</option>
                    <option value="Qualidade">Qualidade</option>
                    <option value="Planejamento">Planejamento</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Comunicação">Comunicação</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setShowAddMemberModal(false)}
                className="px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateMember}
                className="px-5 py-2 rounded-xl bg-[#008B63] text-white font-extrabold"
              >
                Adicionar Integrante
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
