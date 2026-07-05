"use client";

import { useState } from "react";
import { Badge } from "@/components/dashboard/Badge";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { DataTable } from "@/components/dashboard/DataTable";
import { ModuleBlock } from "@/components/dashboard/ModuleBlock";
import { RoleHint } from "@/components/dashboard/RoleHint";
import { useToast } from "@/components/dashboard/Toast";
import { useDashboard } from "@/contexts/DashboardProvider";
import { saveSurvey, deleteSurvey } from "@/app/actions/dashboard-crud";
import { buttonPrimaryClass, inputClass, labelClass } from "@/components/dashboard/form-styles";
import type { Survey, SurveyType } from "@/lib/domain/types";

export function SurveysPanel() {
  const { toast } = useToast();
  const { surveys, setSurveys, users, can } = useDashboard();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    type: "porta" as SurveyType,
    responsible: users[0]?.name ?? "Administrador",
    targetAudience: "",
    link: "",
  });

  const canManage = can("pesquisas:gerenciar");

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      type: "porta",
      responsible: users[0]?.name ?? "Administrador",
      targetAudience: "",
      link: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast("O nome da pesquisa é obrigatório.", "error");
      return;
    }
    if (!form.startDate || !form.endDate) {
      toast("As datas de início e término são obrigatórias.", "error");
      return;
    }
    if (new Date(form.startDate) > new Date(form.endDate)) {
      toast("A data de início deve ser anterior ou igual à data de término.", "error");
      return;
    }
    if (form.type === "online" && !form.link.trim()) {
      toast("O link do formulário é obrigatório para pesquisas online.", "error");
      return;
    }

    const payload: Survey = {
      id: editingId ?? `srv-${Date.now()}`,
      name: form.name,
      description: form.description,
      startDate: form.startDate,
      endDate: form.endDate,
      type: form.type,
      responsible: form.responsible,
      targetAudience: form.targetAudience,
      link: form.type === "online" ? form.link : null,
    };

    try {
      const saved = await saveSurvey(payload, !!editingId);
      if (editingId) {
        setSurveys((prev) => prev.map((s) => (s.id === editingId ? saved : s)));
        toast("Pesquisa atualizada com sucesso.");
      } else {
        setSurveys((prev) => [saved, ...prev]);
        toast("Pesquisa cadastrada com sucesso.");
      }
      resetForm();
    } catch {
      toast("Erro ao salvar a pesquisa no servidor.", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteSurvey(deleteId);
      setSurveys((prev) => prev.filter((s) => s.id !== deleteId));
      toast("Pesquisa excluída.");
      setDeleteId(null);
    } catch {
      toast("Erro ao remover a pesquisa do servidor.", "error");
    }
  };

  return (
    <ModuleBlock
      title="Gestão de Pesquisas"
      icon="🔍"
      action={
        canManage && !showForm ? (
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className={buttonPrimaryClass}
          >
            Nova pesquisa
          </button>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4">
        <RoleHint />

        {showForm && canManage && (
          <form
            onSubmit={handleSubmit}
            className="border border-[#cbd5e1] dark:border-zinc-800 rounded p-4 bg-[#f8fbff] dark:bg-[#111c26] space-y-4"
          >
            <h3 className="font-bold text-[#154f85] dark:text-blue-400 text-xs">
              {editingId ? "Editar Pesquisa" : "Registrar Nova Pesquisa"}
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="srv-name" className={labelClass}>Nome da Pesquisa</label>
                <input
                  id="srv-name"
                  type="text"
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nome identificador da pesquisa"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="srv-type" className={labelClass}>Tipo de Pesquisa</label>
                <select
                  id="srv-type"
                  className={inputClass}
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target.value as SurveyType,
                      link: e.target.value === "online" ? form.link : "",
                    })
                  }
                >
                  <option value="porta">Porta a Porta (Física)</option>
                  <option value="online">Online (Formulário Web)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="srv-resp" className={labelClass}>Responsável</label>
                <select
                  id="srv-resp"
                  className={inputClass}
                  value={form.responsible}
                  onChange={(e) => setForm({ ...form, responsible: e.target.value })}
                  required
                >
                  <option value="">Selecione o Responsável</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.name}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="srv-audience" className={labelClass}>Público Alvo</label>
                <input
                  id="srv-audience"
                  type="text"
                  className={inputClass}
                  value={form.targetAudience}
                  onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                  placeholder="Ex: Jovens de 16 a 24 anos"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="srv-start" className={labelClass}>Data de Início</label>
                <input
                  id="srv-start"
                  type="date"
                  className={inputClass}
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="srv-end" className={labelClass}>Data de Término</label>
                <input
                  id="srv-end"
                  type="date"
                  className={inputClass}
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  required
                />
              </div>

              {form.type === "online" && (
                <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3">
                  <label htmlFor="srv-link" className={labelClass}>Link do Formulário (Obrigatório se Online)</label>
                  <input
                    id="srv-link"
                    type="url"
                    className={inputClass}
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                    placeholder="https://forms.gle/..."
                    required
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3">
                <label htmlFor="srv-desc" className={labelClass}>Descrição / Observações</label>
                <textarea
                  id="srv-desc"
                  className={inputClass}
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Objetivos ou notas metodológicas da pesquisa..."
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-1.5 bg-zinc-400 text-white rounded text-[10px] font-bold hover:bg-zinc-500 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={buttonPrimaryClass}
              >
                Salvar Pesquisa
              </button>
            </div>
          </form>
        )}

        <DataTable
          data={surveys}
          keyExtractor={(s) => s.id}
          emptyMessage="Nenhuma pesquisa cadastrada."
          columns={[
            { key: "name", header: "Pesquisa", render: (s) => s.name },
            {
              key: "type",
              header: "Tipo",
              render: (s) => (
                <span className="capitalize font-semibold">
                  {s.type === "online" ? "Online" : "Porta a Porta"}
                </span>
              ),
            },
            {
              key: "dates",
              header: "Período",
              render: (s) => (
                <span className="font-mono text-xs">
                  {s.startDate} a {s.endDate}
                </span>
              ),
            },
            { key: "responsible", header: "Responsável", render: (s) => s.responsible },
            { key: "audience", header: "Público Alvo", render: (s) => s.targetAudience, hiddenOn: "tablet" },
            {
              key: "link",
              header: "Link",
              render: (s) =>
                s.link ? (
                  <a
                    href={s.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-mono text-xs max-w-xs truncate block"
                  >
                    {s.link}
                  </a>
                ) : (
                  <span className="text-zinc-400 italic">N/A</span>
                ),
              hiddenOn: "mobile",
            },
            {
              key: "actions",
              header: "Ações",
              render: (s) =>
                canManage ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setForm({
                          name: s.name,
                          description: s.description || "",
                          startDate: s.startDate,
                          endDate: s.endDate,
                          type: s.type,
                          responsible: s.responsible,
                          targetAudience: s.targetAudience,
                          link: s.link || "",
                        });
                        setEditingId(s.id);
                        setShowForm(true);
                      }}
                      className="text-xs font-medium text-zinc-600 hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(s.id)}
                      className="text-xs font-medium text-red-650 hover:underline"
                    >
                      Excluir
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-zinc-400">Leitura</span>
                ),
            },
          ]}
        />

        <ConfirmDialog
          open={deleteId !== null}
          title="Excluir Pesquisa"
          message="Deseja remover esta pesquisa permanentemente do servidor?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      </div>
    </ModuleBlock>
  );
}
