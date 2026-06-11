"use client";

import { useState } from "react";
import { DataTable } from "@/components/dashboard/DataTable";
import { PageHeader } from "@/components/dashboard/PageHeader";
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  inputClass,
  labelClass,
} from "@/components/dashboard/form-styles";
import { RoleHint } from "@/components/dashboard/RoleHint";
import { useToast } from "@/components/dashboard/Toast";
import { useDashboard } from "@/contexts/DashboardProvider";
import { allPermissions } from "@/lib/data/roles";
import type { Role } from "@/lib/domain/types";

export function PermissionsPanel() {
  const { roles, setRoles } = useDashboard();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", permissions: [] as string[] });

  function togglePermission(permId: string) {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter((p) => p !== permId)
        : [...prev.permissions, permId],
    }));
  }

  function saveRole(e: React.FormEvent) {
    e.preventDefault();
    if (selectedRole) {
      setRoles((prev) =>
        prev.map((r) =>
          r.id === selectedRole.id ? { ...r, ...form } : r,
        ),
      );
    } else {
      setRoles((prev) => [
        ...prev,
        { id: `role-${Date.now()}`, ...form },
      ]);
    }
    setShowForm(false);
    setSelectedRole(null);
    setForm({ name: "", description: "", permissions: [] });
    toast(selectedRole ? "Perfil atualizado." : "Perfil criado.");
  }

  function editRole(role: Role) {
    setSelectedRole(role);
    setForm({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions],
    });
    setShowForm(true);
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Permissões"
        description="Configure perfis de acesso e permissões da equipe de campanha"
        action={
          <button
            type="button"
            onClick={() => {
              setSelectedRole(null);
              setForm({ name: "", description: "", permissions: [] });
              setShowForm(true);
            }}
            className={buttonPrimaryClass}
          >
            Novo perfil
          </button>
        }
      />

      <RoleHint />

      {showForm && (
        <form
          onSubmit={saveRole}
          className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <h3 className="mb-4 font-medium text-zinc-900 dark:text-zinc-50">
            {selectedRole ? `Editar: ${selectedRole.name}` : "Novo perfil"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Nome do perfil</label>
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className={labelClass}>Descrição</label>
              <input
                className={inputClass}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-4">
            <p className={labelClass}>Permissões</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {allPermissions.map((perm) => (
                <label
                  key={perm.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700"
                >
                  <input
                    type="checkbox"
                    checked={form.permissions.includes(perm.id)}
                    onChange={() => togglePermission(perm.id)}
                  />
                  {perm.label}
                </label>
              ))}
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" className={buttonPrimaryClass}>
              Salvar perfil
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className={buttonSecondaryClass}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <DataTable
        data={roles}
        keyExtractor={(r) => r.id}
        columns={[
          { key: "name", header: "Perfil", render: (r) => r.name },
          { key: "desc", header: "Descrição", render: (r) => r.description },
          {
            key: "perms",
            header: "Permissões",
            render: (r) => (
              <span className="text-xs text-zinc-500">
                {r.permissions.length} permissões
              </span>
            ),
          },
          {
            key: "actions",
            header: "Ações",
            render: (r) => (
              <button
                type="button"
                onClick={() => editRole(r)}
                className="text-xs font-medium text-zinc-600 hover:underline dark:text-zinc-400"
              >
                Editar
              </button>
            ),
          },
        ]}
      />
    </div>
  );
}
