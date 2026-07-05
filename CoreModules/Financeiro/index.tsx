"use client";

import { useEffect, useState } from "react";
import { ModuleBlock } from "@/components/dashboard/ModuleBlock";
import { DataTable } from "@/components/dashboard/DataTable";
import { Badge } from "@/components/dashboard/Badge";
import { RoleHint } from "@/components/dashboard/RoleHint";
import { useToast } from "@/components/dashboard/Toast";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { buttonPrimaryClass, inputClass, labelClass } from "@/components/dashboard/form-styles";
import { useDashboard } from "@/contexts/DashboardProvider";
import {
  saveFinancialTransaction,
  deleteFinancialTransaction,
} from "@/app/actions/dashboard-crud";
import type { FinancialTransaction } from "@/lib/domain/types";

export function FinanceiroPanel() {
  const { toast } = useToast();
  const { finances, setFinances, campaigns, locations, users, can, getRoleName } = useDashboard();
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<"todos" | "receber" | "pagar">("todos");

  const [form, setForm] = useState({
    type: "despesa" as "receita" | "despesa",
    transactionDate: new Date().toISOString().split("T")[0],
    competencyDate: new Date().toISOString().split("T")[0],
    projectedCost: "",
    finalCost: "",
    entityType: "campanha" as "campanha" | "locais" | "eventos",
    entityExternalId: "",
    responsible: "",
    approver: "",
  });

  const canManage = can("financeiro:gerenciar");

  const financeUsers = users.filter((u) => {
    const keywords = ["root", "admin", "administrador", "super usuario", "super-usuario", "suporte", "support"];
    const roleName = getRoleName ? getRoleName(u.roleId) : "";
    const text = `${u.name} ${u.email} ${u.roleId || ""} ${roleName || ""}`.toLowerCase();
    return !keywords.some((kw) => text.includes(kw));
  });

  // Synchronize responsible from entity selection reactively
  useEffect(() => {
    if (form.entityType === "campanha") {
      const camp = campaigns.find((c) => c.id === form.entityExternalId);
      if (camp) {
        setForm((prev) => ({ ...prev, responsible: camp.responsible || "" }));
      } else {
        setForm((prev) => ({ ...prev, responsible: "" }));
      }
    } else if (form.entityType === "locais") {
      const loc = locations.find((l) => l.id === form.entityExternalId);
      if (loc) {
        setForm((prev) => ({ ...prev, responsible: loc.responsible || "" }));
      } else {
        setForm((prev) => ({ ...prev, responsible: "" }));
      }
    }
  }, [form.entityExternalId, form.entityType, campaigns, locations]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.responsible.trim()) {
      toast("Responsável é obrigatório.", "error");
      return;
    }
    if (!form.entityExternalId) {
      toast("O campo 'Referente a' é obrigatório.", "error");
      return;
    }
    if (!form.approver) {
      toast("Aprovador é obrigatório.", "error");
      return;
    }

    const final = parseFloat(form.finalCost);

    if (isNaN(final) || final < 0) {
      toast("Informe um valor válido.", "error");
      return;
    }

    const newTx: FinancialTransaction = {
      id: `fin-${Date.now()}`,
      type: form.type,
      transactionDate: form.transactionDate,
      competencyDate: form.transactionDate,
      projectedCost: final,
      finalCost: final,
      entityType: form.entityType,
      entityExternalId: form.entityExternalId,
      responsible: form.responsible,
      approver: form.approver,
    };

    try {
      const saved = await saveFinancialTransaction(newTx, false);
      setFinances((prev) => [saved, ...prev]);
      toast("Lançamento financeiro registrado com sucesso.");
      setShowForm(false);
      setForm({
        type: "despesa",
        transactionDate: new Date().toISOString().split("T")[0],
        competencyDate: new Date().toISOString().split("T")[0],
        projectedCost: "",
        finalCost: "",
        entityType: "campanha",
        entityExternalId: "",
        responsible: "",
        approver: "",
      });
    } catch {
      toast("Erro ao registrar o lançamento financeiro no backend.", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteFinancialTransaction(deleteId);
      setFinances((prev) => prev.filter((t) => t.id !== deleteId));
      toast("Lançamento financeiro removido.");
      setDeleteId(null);
    } catch {
      toast("Não foi possível remover a transação do servidor.", "error");
    }
  };

  // Totals calculations based on final cost
  const totalReceitas = finances
    .filter((t) => t.type === "receita")
    .reduce((acc, t) => acc + t.finalCost, 0);

  const totalDespesas = finances
    .filter((t) => t.type === "despesa")
    .reduce((acc, t) => acc + t.finalCost, 0);

  const balance = totalReceitas - totalDespesas;

  return (
    <ModuleBlock
      title="Área Financeira"
      icon="💰"
      action={
        canManage && !showForm ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className={buttonPrimaryClass}
          >
            Nova transação
          </button>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-5">
        <RoleHint />

        {/* Finance Balance Metrics */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs relative overflow-hidden">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Receitas (Final)</p>
            <p className="text-xl font-black text-emerald-600 mt-1">
              R$ {totalReceitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <span className="absolute right-4 bottom-2 text-2xl opacity-15">📈</span>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs relative overflow-hidden">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Despesas (Final)</p>
            <p className="text-xl font-black text-rose-600 mt-1">
              R$ {totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <span className="absolute right-4 bottom-2 text-2xl opacity-15">📉</span>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs relative overflow-hidden">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Saldo Líquido</p>
            <p className={`text-xl font-black mt-1 ${balance >= 0 ? "text-indigo-600" : "text-amber-600"}`}>
              R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <span className="absolute right-4 bottom-2 text-2xl opacity-15">⚖️</span>
          </div>
        </div>

        {/* Form Container */}
        {showForm && canManage && (
          <form
            onSubmit={handleAddTransaction}
            className="border border-[#cbd5e1] dark:border-zinc-800 rounded p-4 bg-[#f8fbff] dark:bg-[#111c26] space-y-4"
          >
            <h3 className="font-bold text-[#154f85] dark:text-blue-400 text-xs">
              Registrar Movimentação Financeira
            </h3>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="tx-type" className={labelClass}>Tipo de Lançamento</label>
                <select
                  id="tx-type"
                  className={inputClass}
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as "receita" | "despesa" })}
                >
                  <option value="despesa">Despesa (Saída)</option>
                  <option value="receita">Receita (Entrada)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="tx-date" className={labelClass}>Data do Lançamento</label>
                <input
                  id="tx-date"
                  type="date"
                  className={inputClass}
                  value={form.transactionDate}
                  onChange={(e) => setForm({ ...form, transactionDate: e.target.value })}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="tx-final" className={labelClass}>Valor (R$)</label>
                <input
                  id="tx-final"
                  type="number"
                  step="0.01"
                  min="0"
                  className={inputClass}
                  value={form.finalCost}
                  onChange={(e) => setForm({ ...form, finalCost: e.target.value })}
                  placeholder="0,00"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="tx-entity-type" className={labelClass}>Entidade Tipo</label>
                <select
                  id="tx-entity-type"
                  className={inputClass}
                  value={form.entityType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      entityType: e.target.value as "campanha" | "locais" | "eventos",
                      entityExternalId: "",
                      responsible: "",
                    })
                  }
                >
                  <option value="campanha">Campanha</option>
                  <option value="locais">Locais</option>
                  <option value="eventos">Eventos</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="tx-referente" className={labelClass}>Referente a (Código/ID)</label>
                {form.entityType === "campanha" ? (
                  <select
                    id="tx-referente"
                    className={inputClass}
                    value={form.entityExternalId}
                    onChange={(e) => setForm({ ...form, entityExternalId: e.target.value })}
                    required
                  >
                    <option value="">Selecione a Campanha</option>
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                ) : form.entityType === "locais" ? (
                  <select
                    id="tx-referente"
                    className={inputClass}
                    value={form.entityExternalId}
                    onChange={(e) => setForm({ ...form, entityExternalId: e.target.value })}
                    required
                  >
                    <option value="">Selecione o Local</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="tx-referente"
                    type="text"
                    className={inputClass}
                    value={form.entityExternalId}
                    onChange={(e) => setForm({ ...form, entityExternalId: e.target.value })}
                    placeholder="Código do evento"
                    required
                  />
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="tx-responsible" className={labelClass}>Responsável</label>
                {form.entityType === "eventos" ? (
                  <select
                    id="tx-responsible"
                    className={inputClass}
                    value={form.responsible}
                    onChange={(e) => setForm({ ...form, responsible: e.target.value })}
                    required
                  >
                    <option value="">Selecione o Responsável</option>
                    {financeUsers.map((u) => (
                      <option key={u.id} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="tx-responsible"
                    type="text"
                    className={`${inputClass} bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 cursor-not-allowed`}
                    value={form.responsible}
                    readOnly
                    required
                    placeholder="Preenchido automaticamente"
                  />
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="tx-approver" className={labelClass}>Aprovador</label>
                <select
                  id="tx-approver"
                  className={inputClass}
                  value={form.approver}
                  onChange={(e) => setForm({ ...form, approver: e.target.value })}
                  required
                >
                  <option value="">Selecione o Aprovador</option>
                  {financeUsers.map((u) => (
                    <option key={u.id} value={u.name}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3 py-1.5 bg-zinc-400 text-white rounded text-[10px] font-bold hover:bg-zinc-500 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={buttonPrimaryClass}
              >
                Salvar Lançamento
              </button>
            </div>
          </form>
        )}

        {/* Sub-tabs segment buttons for Contas a Receber / Contas a Pagar */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 pb-1 gap-2">
          <button
            type="button"
            onClick={() => setSubTab("todos")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              subTab === "todos"
                ? "bg-[#154f85] text-white"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            Todos os Lançamentos
          </button>
          <button
            type="button"
            onClick={() => setSubTab("receber")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              subTab === "receber"
                ? "bg-emerald-600 text-white"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            Contas a Receber (Receitas)
          </button>
          <button
            type="button"
            onClick={() => setSubTab("pagar")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              subTab === "pagar"
                ? "bg-rose-600 text-white"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            Contas a Pagar (Despesas)
          </button>
        </div>

        {/* Transactions list */}
        <DataTable
          data={finances.filter((t) => {
            if (subTab === "receber") return t.type === "receita";
            if (subTab === "pagar") return t.type === "despesa";
            return true;
          })}
          keyExtractor={(t) => t.id}
          emptyMessage="Nenhuma movimentação financeira registrada para este filtro."
          columns={[
            {
              key: "type",
              header: "Tipo",
              render: (t) => (
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    t.type === "receita"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {t.type === "receita" ? "Receita" : "Despesa"}
                </span>
              ),
            },
            {
              key: "dates",
              header: "Data",
              render: (t) => (
                <span className="text-[11px] font-mono">{t.transactionDate}</span>
              ),
            },
            {
              key: "costs",
              header: "Valor",
              render: (t) => (
                <span className="font-mono text-[11px] font-bold text-zinc-950 dark:text-zinc-50">
                  R$ {t.finalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              ),
            },
            {
              key: "reference",
              header: "Referente a",
              render: (t) => (
                <div className="flex flex-col">
                  <span className="font-bold text-zinc-900 dark:text-zinc-50 capitalize">
                    {t.entityType}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    ID: {t.entityExternalId}
                  </span>
                </div>
              ),
            },
            {
              key: "people",
              header: "Resp. / Aprov.",
              render: (t) => (
                <div className="flex flex-col text-[11px]">
                  <span>Resp: {t.responsible}</span>
                  <span className="text-zinc-400 text-[10px]">Aprov: {t.approver}</span>
                </div>
              ),
            },
            {
              key: "actions",
              header: "Ações",
              render: (t) =>
                canManage ? (
                  <button
                    type="button"
                    onClick={() => setDeleteId(t.id)}
                    className="text-xs font-medium text-red-650 hover:underline"
                  >
                    Excluir
                  </button>
                ) : (
                  <span className="text-xs text-zinc-400">Leitura</span>
                ),
            },
          ]}
        />

        <ConfirmDialog
          open={deleteId !== null}
          title="Excluir Transação"
          message="Deseja excluir esta movimentação financeira permanentemente do backend?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      </div>
    </ModuleBlock>
  );
}
