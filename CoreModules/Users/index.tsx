"use client";

import { useState } from "react";
import { Badge } from "@/components/dashboard/Badge";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { DataTable } from "@/components/dashboard/DataTable";
import { FormCard } from "@/components/dashboard/FormCard";
import { RoleHint } from "@/components/dashboard/RoleHint";
import { useToast } from "@/components/dashboard/Toast";
import {
  deleteDashboardUser,
  saveDashboardUser,
} from "@/app/actions/dashboard-crud";
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  inputClass,
  labelClass,
} from "@/components/dashboard/form-styles";
import { useDashboard } from "@/contexts/DashboardProvider";
import { USER_STATUS_LABELS } from "@/lib/domain/constants";
import { combineValidations, validateEmail, validateRequired } from "@/lib/domain/validation";
import type { DashboardUser, UserStatus } from "@/lib/domain/types";
import { useCrudList } from "@/hooks/useCrudList";

import { ModuleBlock } from "@/components/dashboard/ModuleBlock";

export function UsersPanel() {
  const { users, roles, setUsers, getRoleName, can } = useDashboard();
  const { toast } = useToast();
  const crud = useCrudList({ initial: users });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    roleId: roles[0]?.id ?? "",
    status: "ativo" as UserStatus,
  });

  const canManage = can("usuarios:gerenciar");

  function resetForm() {
    setForm({
      name: "",
      email: "",
      roleId: roles[0]?.id ?? "",
      status: "ativo",
    });
    crud.closeForm();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validation = combineValidations(
      validateRequired(form.name, "Nome"),
      validateEmail(form.email),
    );
    if (!validation.ok) {
      toast(validation.message, "error");
      return;
    }

    try {
      if (crud.editingId) {
        const current = crud.items.find((user) => user.id === crud.editingId);
        const saved = await saveDashboardUser(
          { id: crud.editingId, createdAt: current?.createdAt ?? new Date().toISOString().slice(0, 10), ...form },
          true,
        );
        const updated = crud.items.map((u) =>
          u.id === crud.editingId ? saved : u,
        );
        crud.setItems(updated);
        setUsers(updated);
        toast("Usuário atualizado com sucesso.");
      } else {
        const saved = await saveDashboardUser(
          {
            id: `user-${Date.now()}`,
            ...form,
            createdAt: new Date().toISOString().slice(0, 10),
          },
          false,
        );
        const updated = [...crud.items, saved];
        crud.setItems(updated);
        setUsers(updated);
        toast("Usuário cadastrado com sucesso.");
      }
      resetForm();
    } catch {
      toast("Não foi possível salvar o usuário.", "error");
    }
  }

  function startEdit(user: DashboardUser) {
    setForm({
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      status: user.status,
    });
    crud.openEdit(user.id);
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await deleteDashboardUser(deleteId);
      const updated = crud.items.filter((u) => u.id !== deleteId);
      crud.setItems(updated);
      setUsers(updated);
      setDeleteId(null);
      toast("Usuário removido.");
    } catch {
      toast("Não foi possível remover o usuário.", "error");
    }
  }

  return (
    <ModuleBlock 
      title="Equipe Operacional" 
      icon="👤"
      action={
        canManage && !crud.showForm ? (
          <button
            type="button"
            onClick={() => {
              resetForm();
              crud.openCreate();
            }}
            className={buttonPrimaryClass}
          >
            Novo usuário
          </button>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4">
        <RoleHint />

        {crud.showForm && canManage && (
          <FormCard
            title={crud.editingId ? "Editar usuário" : "Novo usuário"}
            onSubmit={handleSubmit}
            actions={
              <>
                <button type="submit" className={buttonPrimaryClass}>
                  {crud.editingId ? "Salvar" : "Cadastrar"}
                </button>
                <button type="button" onClick={resetForm} className={buttonSecondaryClass}>
                  Cancelar
                </button>
              </>
            }
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label htmlFor="user-name" className={labelClass}>
                  Nome
                </label>
                <input
                  id="user-name"
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="user-email" className={labelClass}>
                  E-mail
                </label>
                <input
                  id="user-email"
                  type="email"
                  className={inputClass}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="user-role" className={labelClass}>
                  Perfil
                </label>
                <select
                  id="user-role"
                  className={inputClass}
                  value={form.roleId}
                  onChange={(e) => setForm({ ...form, roleId: e.target.value })}
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="user-status" className={labelClass}>
                  Status
                </label>
                <select
                  id="user-status"
                  className={inputClass}
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as UserStatus })
                  }
                >
                  {Object.entries(USER_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </FormCard>
        )}

        <DataTable
          data={users}
          keyExtractor={(u) => u.id}
          emptyMessage="Nenhum usuário cadastrado."
          columns={[
            { key: "name", header: "Nome", render: (u) => u.name },
            { key: "email", header: "E-mail", render: (u) => u.email, hiddenOn: "mobile" },
            {
              key: "role",
              header: "Perfil",
              render: (u) => (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 uppercase">
                  {getRoleName(u.roleId)}
                </span>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (u) => <Badge label={USER_STATUS_LABELS[u.status]} variant={u.status} />,
            },
            { key: "created", header: "Cadastro", render: (u) => u.createdAt, hiddenOn: "tablet" },
            {
              key: "actions",
              header: "Ações",
              render: (u) =>
                canManage ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(u)}
                      className="text-xs font-medium text-zinc-600 hover:underline dark:text-zinc-400"
                    >
                      Editar
                    </button>
                    {u.id !== "1" && (
                      <button
                        type="button"
                        onClick={() => setDeleteId(u.id)}
                        className="text-xs font-medium text-red-600 hover:underline"
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-zinc-400">Somente leitura</span>
                ),
            },
          ]}
        />

        <ConfirmDialog
          open={deleteId !== null}
          title="Excluir usuário"
          message="Esta ação não pode ser desfeita. Deseja remover este usuário da equipe?"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
        />
      </div>
    </ModuleBlock>
  );
}
