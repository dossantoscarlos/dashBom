"use client";

import { useState } from "react";
import { DataTable } from "@/components/dashboard/DataTable";
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  inputClass,
  labelClass,
} from "@/components/dashboard/form-styles";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { RoleHint } from "@/components/dashboard/RoleHint";
import { useToast } from "@/components/dashboard/Toast";
import { useDashboard } from "@/contexts/DashboardProvider";
import type { LocationType } from "@/lib/domain/types";

import { ModuleBlock } from "@/components/dashboard/ModuleBlock";

export function LocationsPanel() {
  const { locations, regions, setLocations, getRegionName } = useDashboard();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    address: "",
    regionId: regions[0]?.id ?? "",
    type: "comitê" as LocationType,
    capacity: 30,
    responsible: "",
  });

  function resetForm() {
    setForm({
      name: "",
      address: "",
      regionId: regions[0]?.id ?? "",
      type: "comitê",
      capacity: 30,
      responsible: "",
    });
    setEditingId(null);
    setShowForm(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      setLocations((prev) =>
        prev.map((l) => (l.id === editingId ? { ...l, ...form } : l)),
      );
    } else {
      setLocations((prev) => [
        ...prev,
        { id: `loc-${Date.now()}`, ...form },
      ]);
    }
    resetForm();
    toast(editingId ? "Local atualizado." : "Local cadastrado.");
  }

  return (
    <ModuleBlock 
      title="Cadastro de Locais" 
      icon="📍"
      action={
        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className={buttonPrimaryClass}
        >
          Novo local
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <RoleHint />

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className={labelClass}>Nome</label>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelClass}>Tipo</label>
                <select
                  className={inputClass}
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value as LocationType })
                  }
                >
                  <option value="comitê">Comitê</option>
                  <option value="sede">Sede</option>
                  <option value="ponto de apoio">Ponto de apoio</option>
                </select>
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className={labelClass}>Endereço</label>
                <input
                  className={inputClass}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelClass}>Região</label>
                <select
                  className={inputClass}
                  value={form.regionId}
                  onChange={(e) => setForm({ ...form, regionId: e.target.value })}
                >
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelClass}>Capacidade</label>
                <input
                  type="number"
                  className={inputClass}
                  value={form.capacity}
                  onChange={(e) =>
                    setForm({ ...form, capacity: Number(e.target.value) })
                  }
                  min={1}
                />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className={labelClass}>Responsável</label>
                <input
                  className={inputClass}
                  value={form.responsible}
                  onChange={(e) =>
                    setForm({ ...form, responsible: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="submit" className={buttonPrimaryClass}>
                {editingId ? "Salvar" : "Cadastrar"}
              </button>
              <button type="button" onClick={resetForm} className={buttonSecondaryClass}>
                Cancelar
              </button>
            </div>
          </form>
        )}

        <DataTable
          data={locations}
          keyExtractor={(l) => l.id}
          columns={[
            { key: "name", header: "Nome", render: (l) => l.name },
            { key: "type", header: "Tipo", render: (l) => l.type, hiddenOn: "mobile" },
            {
              key: "address",
              header: "Endereço",
              render: (l) => (
                <span className="max-w-xs truncate block">{l.address}</span>
              ),
              hiddenOn: "tablet"
            },
            {
              key: "region",
              header: "Região",
              render: (l) => getRegionName(l.regionId),
              hiddenOn: "mobile"
            },
            { key: "capacity", header: "Capacidade", render: (l) => l.capacity, hiddenOn: "tablet" },
            {
              key: "responsible",
              header: "Responsável",
              render: (l) => l.responsible,
            },
            {
              key: "actions",
              header: "Ações",
              render: (l) => (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForm(l);
                      setEditingId(l.id);
                      setShowForm(true);
                    }}
                    className="text-xs font-medium text-zinc-600 hover:underline dark:text-zinc-400"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(l.id)}
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    Excluir
                  </button>
                </div>
              ),
            },
          ]}
        />

        <ConfirmDialog
          open={deleteId !== null}
          title="Excluir local"
          message="Deseja remover este comitê ou ponto de apoio?"
          onConfirm={() => {
            if (deleteId) {
              setLocations((prev) => prev.filter((x) => x.id !== deleteId));
              setDeleteId(null);
              toast("Local removido.");
            }
          }}
          onCancel={() => setDeleteId(null)}
        />
      </div>
    </ModuleBlock>
  );
}
