"use client";

import { useState } from "react";
import { Badge } from "@/components/dashboard/Badge";
import { DataTable } from "@/components/dashboard/DataTable";
import { PageHeader } from "@/components/dashboard/PageHeader";
import {
  buttonDangerClass,
  buttonPrimaryClass,
  buttonSecondaryClass,
  inputClass,
  labelClass,
} from "@/components/dashboard/form-styles";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { RoleHint } from "@/components/dashboard/RoleHint";
import { useToast } from "@/components/dashboard/Toast";
import { useDashboard } from "@/contexts/DashboardProvider";
import type { PartnerType, UserStatus } from "@/lib/domain/types";

export function PartnersPanel() {
  const { partners, regions, setPartners, getRegionName, can } = useDashboard();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    type: "fornecedor" as PartnerType,
    contact: "",
    phone: "",
    regionId: regions[0]?.id ?? "",
    status: "ativo" as UserStatus,
  });

  function resetForm() {
    setForm({
      name: "",
      type: "fornecedor",
      contact: "",
      phone: "",
      regionId: regions[0]?.id ?? "",
      status: "ativo",
    });
    setEditingId(null);
    setShowForm(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      setPartners((prev) =>
        prev.map((p) => (p.id === editingId ? { ...p, ...form } : p)),
      );
    } else {
      setPartners((prev) => [
        ...prev,
        { id: `par-${Date.now()}`, ...form },
      ]);
    }
    resetForm();
    toast(editingId ? "Parceiro atualizado." : "Parceiro cadastrado.");
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Cadastro de Parceiros"
        description="Fornecedores, mídia, instituições e redes de voluntários"
        action={
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className={buttonPrimaryClass}
          >
            Novo parceiro
          </button>
        }
      />

      <RoleHint />

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="partner-name" className={labelClass}>
                Nome
              </label>
              <input
                id="partner-name"
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nome do parceiro"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="partner-type" className={labelClass}>
                Tipo
              </label>
              <select
                id="partner-type"
                className={inputClass}
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as PartnerType })
                }
              >
                <option value="fornecedor">Fornecedor</option>
                <option value="mídia">Mídia</option>
                <option value="institucional">Institucional</option>
                <option value="voluntário">Voluntário</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="partner-contact" className={labelClass}>
                Contato
              </label>
              <input
                id="partner-contact"
                className={inputClass}
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                placeholder="E-mail ou nome do contato"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="partner-phone" className={labelClass}>
                Telefone
              </label>
              <input
                id="partner-phone"
                className={inputClass}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="partner-region" className={labelClass}>
                Região
              </label>
              <select
                id="partner-region"
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
        data={partners}
        keyExtractor={(p) => p.id}
        columns={[
          { key: "name", header: "Nome", render: (p) => p.name },
          { key: "type", header: "Tipo", render: (p) => p.type },
          { key: "contact", header: "Contato", render: (p) => p.contact },
          { key: "phone", header: "Telefone", render: (p) => p.phone },
          {
            key: "region",
            header: "Região",
            render: (p) => getRegionName(p.regionId),
          },
          {
            key: "status",
            header: "Status",
            render: (p) => <Badge label={p.status} />,
          },
          {
            key: "actions",
            header: "Ações",
            render: (p) => (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setForm(p);
                    setEditingId(p.id);
                    setShowForm(true);
                  }}
                  className="text-xs font-medium text-zinc-600 hover:underline dark:text-zinc-400"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(p.id)}
                  className={buttonDangerClass}
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
        title="Excluir parceiro"
        message="Deseja remover este parceiro do cadastro?"
        onConfirm={() => {
          if (deleteId) {
            setPartners((prev) => prev.filter((x) => x.id !== deleteId));
            setDeleteId(null);
            toast("Parceiro removido.");
          }
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
