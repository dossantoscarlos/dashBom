"use client";

import { useState } from "react";
import { DataTable } from "@/components/dashboard/DataTable";
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

import { ModuleBlock } from "@/components/dashboard/ModuleBlock";

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
    <ModuleBlock 
      title="Configurações de Acesso" 
      icon="🔐"
      action={
        !showForm ? (
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
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4">
        <RoleHint />

        {showForm && (
          <form
            onSubmit={saveRole}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <h3 className="mb-3 text-sm font-bold text-zinc-900 dark:text-zinc-50">
              {selectedRole ? `Editar: ${selectedRole.name}` : "Novo perfil de acesso"}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className={labelClass}>Nome do perfil</label>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className={labelClass}>Descrição</label>
                <input
                  className={inputClass}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Permissões</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {allPermissions.map((perm) => (
                  <label
                    key={perm.id}
                    className="flex cursor-pointer items-center gap-2 rounded border border-zinc-100 bg-zinc-50/50 px-2 py-1.5 text-xs transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/30 dark:hover:bg-zinc-800"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-zinc-300"
                      checked={form.permissions.includes(perm.id)}
                      onChange={() => togglePermission(perm.id)}
                    />
                    <span className="truncate">{perm.label}</span>
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
            { key: "name", header: "Perfil", render: (r) => <span className="font-bold">{r.name}</span> },
            { key: "desc", header: "Descrição", render: (r) => r.description, hiddenOn: "mobile" },
            {
              key: "perms",
              header: "Capacidades",
              render: (r) => (
                <span className="text-[10px] font-bold text-zinc-500 uppercase">
                  {r.permissions.length} regras ativas
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
                  Configurar
                </button>
              ),
            },
          ]}
        />
      </div>
    </ModuleBlock>
  );
}
