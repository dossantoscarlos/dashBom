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

import { ModuleBlock } from "@/components/dashboard/ModuleBlock";

export function RegionsPanel() {
  const { regions, setRegions } = useDashboard();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    uf: "SP",
    municipalities: 1,
    population: 0,
    coordinator: "",
  });

  function resetForm() {
    setForm({
      name: "",
      uf: "SP",
      municipalities: 1,
      population: 0,
      coordinator: "",
    });
    setEditingId(null);
    setShowForm(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      setRegions((prev) =>
        prev.map((r) => (r.id === editingId ? { ...r, ...form } : r)),
      );
    } else {
      setRegions((prev) => [
        ...prev,
        { id: `reg-${Date.now()}`, ...form },
      ]);
    }
    resetForm();
    toast(editingId ? "Região atualizada." : "Região cadastrada.");
  }

  return (
    <ModuleBlock 
      title="Cadastro de Regiões" 
      icon="🗺"
      action={
        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className={buttonPrimaryClass}
        >
          Nova região
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
                <label htmlFor="region-name" className={labelClass}>
                  Nome da região
                </label>
                <input
                  id="region-name"
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex.: Grande São Paulo"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="region-uf" className={labelClass}>
                  UF
                </label>
                <input
                  id="region-uf"
                  className={inputClass}
                  value={form.uf}
                  onChange={(e) => setForm({ ...form, uf: e.target.value.toUpperCase() })}
                  placeholder="SP"
                  maxLength={2}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="region-municipalities" className={labelClass}>
                  Municípios
                </label>
                <input
                  id="region-municipalities"
                  type="number"
                  className={inputClass}
                  value={form.municipalities}
                  onChange={(e) =>
                    setForm({ ...form, municipalities: Number(e.target.value) })
                  }
                  min={1}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="region-population" className={labelClass}>
                  População
                </label>
                <input
                  id="region-population"
                  type="number"
                  className={inputClass}
                  value={form.population}
                  onChange={(e) =>
                    setForm({ ...form, population: Number(e.target.value) })
                  }
                  min={0}
                />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label htmlFor="region-coordinator" className={labelClass}>
                  Coordenador
                </label>
                <input
                  id="region-coordinator"
                  className={inputClass}
                  value={form.coordinator}
                  onChange={(e) =>
                    setForm({ ...form, coordinator: e.target.value })
                  }
                  placeholder="Nome do coordenador regional"
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
          data={regions}
          keyExtractor={(r) => r.id}
          columns={[
            { key: "name", header: "Região", render: (r) => r.name },
            { key: "uf", header: "UF", render: (r) => r.uf, hiddenOn: "mobile" },
            {
              key: "municipalities",
              header: "Municípios",
              render: (r) => r.municipalities,
              hiddenOn: "tablet"
            },
            {
              key: "population",
              header: "População",
              render: (r) => r.population.toLocaleString("pt-BR"),
              hiddenOn: "tablet"
            },
            {
              key: "coordinator",
              header: "Coordenador",
              render: (r) => r.coordinator,
            },
            {
              key: "actions",
              header: "Ações",
              render: (r) => (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForm(r);
                      setEditingId(r.id);
                      setShowForm(true);
                    }}
                    className="text-xs font-medium text-zinc-600 hover:underline dark:text-zinc-400"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(r.id)}
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
          title="Excluir região"
          message="Parceiros e campanhas vinculados podem ficar órfãos. Continuar?"
          onConfirm={() => {
            if (deleteId) {
              setRegions((prev) => prev.filter((x) => x.id !== deleteId));
              setDeleteId(null);
              toast("Região removida.");
            }
          }}
          onCancel={() => setDeleteId(null)}
        />
      </div>
    </ModuleBlock>
  );
}
