"use client";

import React, { useState } from "react";
import type { KanbanTask, KanbanColumnId } from "./types";
import { useToast } from "@/components/dashboard/Toast";
import {
  Plus,
  Search,
  Filter,
  CheckSquare,
  MessageSquare,
  Paperclip,
  Clock,
  User,
  Kanban as KanbanIcon,
  Calendar,
  AlertTriangle,
  Lock,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";

interface ProjectKanbanProps {
  tasks: KanbanTask[];
  onUpdateTasks: (newTasks: KanbanTask[]) => void;
  onNavigateTab: (tab: any) => void;
}

export function ProjectKanban({
  tasks,
  onUpdateTasks,
  onNavigateTab,
}: ProjectKanbanProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // Form State para Nova Tarefa
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCode, setNewTaskCode] = useState("");
  const [newTaskColumn, setNewTaskColumn] = useState<KanbanColumnId>("afazer");
  const [newTaskPriority, setNewTaskPriority] = useState<"Baixa" | "Média" | "Alta" | "Urgente">("Média");
  const [newTaskResponsible, setNewTaskResponsible] = useState("Rafael Pereira");

  const columns: Array<{ id: KanbanColumnId; name: string; color: string; bg: string }> = [
    { id: "planejamento", name: "Planejamento", color: "text-[#1264F3]", bg: "bg-[#EAF2FF]" },
    { id: "afazer", name: "A fazer", color: "text-[#64748B]", bg: "bg-[#F1F5F9]" },
    { id: "execucao", name: "Em execução", color: "text-[#7928F5]", bg: "bg-[#F3EAFF]" },
    { id: "validacao", name: "Em validação", color: "text-[#F59E0B]", bg: "bg-[#FFF4E5]" },
    { id: "concluidas", name: "Concluídas", color: "text-[#008B63]", bg: "bg-[#E8F7F1]" },
  ];

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.responsible.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag ? t.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  const handleMoveTask = (taskId: string, direction: "next" | "prev") => {
    const colOrder: KanbanColumnId[] = ["planejamento", "afazer", "execucao", "validacao", "concluidas"];
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const currentIdx = colOrder.indexOf(task.columnId);
    let nextIdx = direction === "next" ? currentIdx + 1 : currentIdx - 1;

    if (nextIdx < 0 || nextIdx >= colOrder.length) return;
    const nextCol = colOrder[nextIdx];

    // Validação de conclusão
    if (nextCol === "concluidas" && task.checklistCompleted < task.checklistTotal) {
      toast("Para mover para 'Concluídas', o checklist de tarefas deve estar 100% preenchido.", "error");
      return;
    }

    const updated = tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            columnId: nextCol,
            progress: nextCol === "concluidas" ? 100 : t.progress,
          }
        : t
    );

    onUpdateTasks(updated);
    toast(`Item ${task.code} movido para '${columns.find((c) => c.id === nextCol)?.name}'.`);
  };

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) {
      toast("Por favor, preencha o título do item.", "error");
      return;
    }

    const newCode = newTaskCode.trim() || `TAR-0${tasks.length + 40}`;
    const newTask: KanbanTask = {
      id: `task-${Date.now()}`,
      code: newCode,
      title: newTaskTitle,
      type: "tarefa",
      columnId: newTaskColumn,
      priority: newTaskPriority,
      responsible: newTaskResponsible,
      responsibleAvatar: newTaskResponsible.split(" ").map((n) => n[0]).join(""),
      dueDate: "30/08/2025",
      progress: 0,
      tags: ["Projeto"],
      checklistCompleted: 0,
      checklistTotal: 3,
      commentsCount: 0,
      attachmentsCount: 0,
    };

    onUpdateTasks([...tasks, newTask]);
    toast(`Nova tarefa ${newCode} adicionada com sucesso!`);
    setNewTaskTitle("");
    setNewTaskCode("");
    setShowAddTaskModal(false);
  };

  return (
    <div className="flex flex-col gap-5 font-sans text-xs antialiased select-none">
      {/* ── BARRA SUPERIOR DE AÇÕES E INDICADORES (CONFORME ESPECIFICAÇÃO) ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        {/* Lado Esquerdo: Ações de Visão */}
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
            <KanbanIcon className="h-4 w-4" strokeWidth={2.2} />
            <span>Visão Kanban</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("cronograma")}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#10213D] font-bold text-xs transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="h-4 w-4 text-[#1264F3]" strokeWidth={2} />
            <span>Visão cronograma</span>
          </button>
        </div>

        {/* Lado Direito: Botão Verde "+ Nova tarefa" */}
        <button
          type="button"
          onClick={() => setShowAddTaskModal(true)}
          className="h-10 px-5 rounded-xl bg-[#008B63] hover:bg-[#007553] text-white font-extrabold text-xs transition shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          <span>Nova tarefa</span>
        </button>
      </div>

      {/* ── BARRA DE INDICADORES CHAVE ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-2xs">
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-[#64748B]">Progresso geral:</span>
          <span className="text-sm font-black text-[#10213D] mt-0.5">45%</span>
        </div>

        <div className="flex flex-col border-l border-[#F1F5F9] pl-3">
          <span className="text-[11px] font-bold text-[#64748B]">Entregas concluídas:</span>
          <span className="text-sm font-black text-[#008B63] mt-0.5">7 de 16</span>
        </div>

        <div className="flex flex-col border-l border-[#F1F5F9] pl-3">
          <span className="text-[11px] font-bold text-[#64748B]">Equipe alocada:</span>
          <span className="text-sm font-black text-[#1264F3] mt-0.5">6 integrantes</span>
        </div>

        <div className="flex flex-col border-l border-[#F1F5F9] pl-3">
          <span className="text-[11px] font-bold text-[#64748B]">Prazo final:</span>
          <span className="text-sm font-black text-[#10213D] mt-0.5">30/09/2025</span>
        </div>

        <div className="flex flex-col border-l border-[#F1F5F9] pl-3">
          <span className="text-[11px] font-bold text-[#64748B]">Orçamento utilizado:</span>
          <span className="text-sm font-black text-[#7928F5] mt-0.5">38%</span>
        </div>
      </div>

      {/* ── CAMPO DE FILTROS E BUSCA ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 text-[#64748B] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar tarefa, entrega ou responsável..."
            className="h-10 w-full pl-9 pr-3.5 rounded-xl border border-[#E2E8F0] bg-white text-xs font-medium text-[#10213D] focus:border-[#1264F3] focus:outline-none transition shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedTag("")}
            className={`h-8 px-3 rounded-lg border text-[11px] font-extrabold transition cursor-pointer ${
              selectedTag === ""
                ? "bg-[#10213D] text-white border-[#10213D]"
                : "bg-white text-[#64748B] border-[#E2E8F0] hover:bg-slate-100"
            }`}
          >
            Todas as tags
          </button>
          {["Engenharia", "Arquitetura", "Contratação", "Comunicação"].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={`h-8 px-3 rounded-lg border text-[11px] font-extrabold transition cursor-pointer ${
                selectedTag === tag
                  ? "bg-[#1264F3] text-white border-[#1264F3]"
                  : "bg-white text-[#64748B] border-[#E2E8F0] hover:bg-slate-100"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* ── QUADRO KANBAN DE 5 COLUNAS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-4 no-scrollbar">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.columnId === col.id);

          return (
            <div
              key={col.id}
              className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-3 flex flex-col gap-3 min-w-[240px]"
            >
              {/* Cabeçalho da Coluna */}
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5 px-1">
                <div className="flex items-center gap-2">
                  <span className={`font-extrabold text-xs uppercase tracking-wider ${col.color}`}>
                    {col.name}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${col.bg} ${col.color}`}>
                    {colTasks.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setNewTaskColumn(col.id);
                    setShowAddTaskModal(true);
                  }}
                  className="text-[#64748B] hover:text-[#10213D] p-1 rounded hover:bg-slate-200 transition cursor-pointer"
                  title="Adicionar item nesta coluna"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Lista de Cartões da Coluna */}
              <div className="flex flex-col gap-3 min-h-[400px]">
                {colTasks.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-[#E2E8F0] rounded-xl flex items-center justify-center text-[11px] text-[#94A3B8] font-medium">
                    Nenhum item
                  </div>
                ) : (
                  colTasks.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white rounded-xl border border-[#E2E8F0] p-3.5 shadow-2xs hover:shadow-md transition flex flex-col gap-2.5 group relative"
                    >
                      {/* Código e Tag */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-black text-[#1264F3] bg-[#EAF2FF] px-2 py-0.5 rounded">
                          {t.code}
                        </span>

                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                            t.priority === "Urgente"
                              ? "bg-[#EF4444] text-white"
                              : t.priority === "Alta"
                              ? "bg-[#FEECEC] text-[#EF4444]"
                              : t.priority === "Média"
                              ? "bg-[#FFF4E5] text-[#F59E0B]"
                              : "bg-[#E8F7F1] text-[#008B63]"
                          }`}
                        >
                          {t.priority}
                        </span>
                      </div>

                      {/* Título da Tarefa */}
                      <h4 className="font-extrabold text-[#10213D] leading-snug">{t.title}</h4>

                      {/* Barra de Progresso do Item */}
                      {t.progress > 0 && (
                        <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#008B63] h-full rounded-full"
                            style={{ width: `${t.progress}%` }}
                          />
                        </div>
                      )}

                      {/* Meta Informações (Checklist, Comentários, Responsável) */}
                      <div className="flex items-center justify-between pt-1 border-t border-[#F1F5F9] text-[10px] text-[#64748B]">
                        <div className="flex items-center gap-2.5">
                          <span className="flex items-center gap-1 font-bold">
                            <CheckSquare className="h-3 w-3 text-[#008B63]" />
                            {t.checklistCompleted}/{t.checklistTotal}
                          </span>

                          <span className="flex items-center gap-1 font-bold">
                            <MessageSquare className="h-3 w-3" />
                            {t.commentsCount}
                          </span>

                          <span className="flex items-center gap-1 font-bold">
                            <Paperclip className="h-3 w-3" />
                            {t.attachmentsCount}
                          </span>
                        </div>

                        {/* Avatar do Responsável */}
                        <div
                          className="h-6 w-6 rounded-full bg-[#06284F] text-white font-black text-[9px] flex items-center justify-center border border-white shadow-2xs"
                          title={`Responsável: ${t.responsible}`}
                        >
                          {t.responsibleAvatar}
                        </div>
                      </div>

                      {/* Controles de Movimentação do Card entre Colunas */}
                      <div className="flex items-center justify-between pt-1 gap-1 border-t border-dashed border-[#E2E8F0]">
                        <button
                          type="button"
                          onClick={() => handleMoveTask(t.id, "prev")}
                          disabled={col.id === "planejamento"}
                          className="h-6 px-2 rounded bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-slate-200 text-[#10213D] font-bold text-[10px] flex items-center gap-0.5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="h-3 w-3" />
                          <span>Voltar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMoveTask(t.id, "next")}
                          disabled={col.id === "concluidas"}
                          className="h-6 px-2 rounded bg-[#008B63] hover:bg-[#007553] text-white font-extrabold text-[10px] flex items-center gap-0.5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <span>Avançar</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── MODAL DE ADICIONAR TAREFA AO KANBAN ── */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-lg w-full p-6 flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-extrabold text-[#10213D]">
                Adicionar Nova Tarefa ao Kanban
              </h3>
              <button
                type="button"
                onClick={() => setShowAddTaskModal(false)}
                className="text-[#64748B] hover:text-[#10213D] p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#10213D]">Título da Tarefa *</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Ex.: Realizar vistoria de engenharia no local"
                  className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium text-[#10213D] focus:bg-white focus:border-[#1264F3] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#10213D]">Coluna Inicial</label>
                  <select
                    value={newTaskColumn}
                    onChange={(e) => setNewTaskColumn(e.target.value as KanbanColumnId)}
                    className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium text-[#10213D]"
                  >
                    {columns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#10213D]">Prioridade</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium text-[#10213D]"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#10213D]">Responsável</label>
                <input
                  type="text"
                  value={newTaskResponsible}
                  onChange={(e) => setNewTaskResponsible(e.target.value)}
                  className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium text-[#10213D]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setShowAddTaskModal(false)}
                className="px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#10213D] font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateTask}
                className="px-5 py-2 rounded-xl bg-[#008B63] hover:bg-[#007553] text-white font-extrabold shadow-xs"
              >
                Criar Tarefa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
