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
import type { Location, LocationType } from "@/lib/domain/types";
import { ModuleBlock } from "@/components/dashboard/ModuleBlock";

export function LocationsPanel() {
  const { locations, regions, setLocations, getRegionName } = useDashboard();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // ── CEP lookup state ──────────────────────────────────────────────────────
  const [cep, setCep] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [cepFound, setCepFound] = useState<string | null>(null);

  const emptyForm = {
    name: "",
    address: "",
    regionId: regions[0]?.id ?? "",
    type: "comitê" as LocationType,
    capacity: 30,
    responsible: "",
  };

  const [form, setForm] = useState(emptyForm);

  function resetForm() {
    setForm({ ...emptyForm, regionId: regions[0]?.id ?? "" });
    setCep("");
    setCepError(null);
    setCepFound(null);
    setEditingId(null);
    setShowForm(false);
  }

  // ── ViaCEP lookup ─────────────────────────────────────────────────────────
  async function handleCepLookup() {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      setCepError("Informe um CEP válido com 8 dígitos.");
      return;
    }
    setCepLoading(true);
    setCepError(null);
    setCepFound(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCepError("CEP não encontrado. Verifique e tente novamente.");
        return;
      }
      const parts = [data.logradouro, data.bairro, data.localidade, data.uf].filter(Boolean);
      const fullAddress =
        parts.join(", ") +
        (cleanCep
          ? ` — CEP ${cleanCep.replace(/(\d{5})(\d{3})/, "$1-$2")}`
          : "");
      setForm((prev) => ({ ...prev, address: fullAddress }));
      setCepFound(
        `✓ ${data.logradouro || ""} — ${data.bairro || ""}, ${data.localidade}/${data.uf}`,
      );
    } catch {
      setCepError("Erro ao consultar o CEP. Verifique sua conexão.");
    } finally {
      setCepLoading(false);
    }
  }

  // ── Save locally in context (sem dependência de backend Laravel) ──────────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        // Editar existente
        const updated: Location = { id: editingId, ...form };
        setLocations((prev) =>
          prev.map((l) => (l.id === editingId ? updated : l)),
        );
        toast("Local atualizado com sucesso.");
      } else {
        // Criar novo
        const newLoc: Location = {
          id: `loc-${Date.now()}`,
          ...form,
        };
        setLocations((prev) => [...prev, newLoc]);
        toast("Local cadastrado com sucesso.");
      }
      resetForm();
    } catch {
      toast("Não foi possível salvar o local.", "error");
    }
  }

  function handleDelete(id: string) {
    try {
      setLocations((prev) => prev.filter((x) => x.id !== id));
      setDeleteId(null);
      toast("Local removido.");
    } catch {
      toast("Não foi possível remover o local.", "error");
    }
  }

  return (
    <ModuleBlock
      title="Cadastro de Locais (Comitês e Pontos de Apoio)"
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
          + Novo local
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <RoleHint />

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 flex flex-col gap-4 shadow-xs"
          >
            {/* Header do formulário */}
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-850 pb-3">
              <span className="text-lg">🏛️</span>
              <div>
                <h3 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  {editingId ? "Editar Local / Comitê" : "Cadastrar Novo Local / Comitê"}
                </h3>
                <p className="text-[10px] text-zinc-400">
                  Use o campo CEP para preencher o endereço automaticamente.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">

              {/* ── BUSCA POR CEP ─────────────────────────────────────── */}
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label
                  htmlFor="loc-cep"
                  className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1"
                >
                  🔍 Buscar Endereço pelo CEP
                  <span className="text-[9px] font-normal text-zinc-400">
                    (preenchimento automático)
                  </span>
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    id="loc-cep"
                    type="text"
                    inputMode="numeric"
                    maxLength={9}
                    className={`${inputClass} max-w-[180px]`}
                    placeholder="00000-000"
                    value={cep}
                    onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, "");
                      if (v.length > 5) v = v.slice(0, 5) + "-" + v.slice(5, 8);
                      setCep(v);
                      setCepError(null);
                      setCepFound(null);
                    }}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), handleCepLookup())
                    }
                  />
                  <button
                    type="button"
                    onClick={handleCepLookup}
                    disabled={cepLoading}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-extrabold px-4 py-2 text-[11px] transition shadow-sm"
                  >
                    {cepLoading ? (
                      <>
                        <svg
                          className="animate-spin h-3 w-3 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          />
                        </svg>
                        Buscando...
                      </>
                    ) : (
                      "🔍 Buscar CEP"
                    )}
                  </button>
                </div>

                {cepFound && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 px-3 py-1.5 text-[10px] text-emerald-800 dark:text-emerald-300 font-bold">
                    {cepFound}
                    <span className="text-emerald-500 dark:text-emerald-400 ml-1">
                      — Endereço preenchido automaticamente!
                    </span>
                  </div>
                )}
                {cepError && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-3 py-1.5 text-[10px] text-red-700 dark:text-red-400 font-bold">
                    ⚠️ {cepError}
                  </div>
                )}
              </div>

              {/* ── NOME ──────────────────────────────────────────────── */}
              <div className="flex flex-col gap-1">
                <label htmlFor="loc-name" className={labelClass}>
                  Nome do Local / Comitê *
                </label>
                <input
                  id="loc-name"
                  className={inputClass}
                  placeholder="Ex: Comitê Zona Norte"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              {/* ── TIPO ──────────────────────────────────────────────── */}
              <div className="flex flex-col gap-1">
                <label htmlFor="loc-type" className={labelClass}>
                  Tipo
                </label>
                <select
                  id="loc-type"
                  className={inputClass}
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value as LocationType })
                  }
                >
                  <option value="comitê">🏛️ Comitê</option>
                  <option value="sede">🏢 Sede</option>
                  <option value="ponto de apoio">📌 Ponto de apoio</option>
                </select>
              </div>

              {/* ── ENDEREÇO (preenchido pelo CEP) ───────────────────── */}
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label htmlFor="loc-address" className={labelClass}>
                  Endereço completo
                  {cepFound && (
                    <span className="ml-2 text-[9px] text-emerald-600 dark:text-emerald-400 font-bold normal-case">
                      ✓ Preenchido via CEP
                    </span>
                  )}
                </label>
                <input
                  id="loc-address"
                  className={inputClass}
                  placeholder="Rua / Avenida, número, bairro, cidade — preenchido pelo CEP ou manualmente"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  required
                />
              </div>

              {/* ── REGIÃO ────────────────────────────────────────────── */}
              <div className="flex flex-col gap-1">
                <label htmlFor="loc-region" className={labelClass}>
                  Região
                </label>
                <select
                  id="loc-region"
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

              {/* ── CAPACIDADE ────────────────────────────────────────── */}
              <div className="flex flex-col gap-1">
                <label htmlFor="loc-capacity" className={labelClass}>
                  Capacidade (pessoas)
                </label>
                <input
                  id="loc-capacity"
                  type="number"
                  className={inputClass}
                  value={form.capacity}
                  onChange={(e) =>
                    setForm({ ...form, capacity: Number(e.target.value) })
                  }
                  min={1}
                />
              </div>

              {/* ── RESPONSÁVEL ───────────────────────────────────────── */}
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label htmlFor="loc-responsible" className={labelClass}>
                  Responsável pelo local
                </label>
                <input
                  id="loc-responsible"
                  className={inputClass}
                  placeholder="Nome do coordenador ou responsável..."
                  value={form.responsible}
                  onChange={(e) =>
                    setForm({ ...form, responsible: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-850">
              <button
                type="submit"
                className={`${buttonPrimaryClass} bg-emerald-600 hover:bg-emerald-700 text-white`}
              >
                {editingId ? "💾 Salvar Alterações" : "💾 Cadastrar Local"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className={buttonSecondaryClass}
              >
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
            {
              key: "type",
              header: "Tipo",
              render: (l) => (
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    l.type === "comitê"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                      : l.type === "sede"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  {l.type === "comitê" ? "🏛️" : l.type === "sede" ? "🏢" : "📌"}{" "}
                  {l.type}
                </span>
              ),
              hiddenOn: "mobile",
            },
            {
              key: "address",
              header: "Endereço",
              render: (l) => (
                <span className="max-w-xs truncate block text-xs text-zinc-600 dark:text-zinc-400">
                  {l.address}
                </span>
              ),
              hiddenOn: "tablet",
            },
            {
              key: "region",
              header: "Região",
              render: (l) => getRegionName(l.regionId),
              hiddenOn: "mobile",
            },
            {
              key: "capacity",
              header: "Capacidade",
              render: (l) => `${l.capacity} pessoas`,
              hiddenOn: "tablet",
            },
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
                      setForm({
                        name: l.name,
                        address: l.address,
                        regionId: l.regionId,
                        type: l.type,
                        capacity: l.capacity,
                        responsible: l.responsible,
                      });
                      setCep("");
                      setCepError(null);
                      setCepFound(null);
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
          onConfirm={() => deleteId && handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      </div>
    </ModuleBlock>
  );
}
