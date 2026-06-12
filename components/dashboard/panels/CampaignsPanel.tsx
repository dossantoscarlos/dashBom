"use client";

import { useState } from "react";
import { Badge } from "@/components/dashboard/Badge";
import { CampaignWorkflow } from "@/components/dashboard/CampaignWorkflow";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { DataTable } from "@/components/dashboard/DataTable";
import { FormCard } from "@/components/dashboard/FormCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RoleHint } from "@/components/dashboard/RoleHint";
import { useToast } from "@/components/dashboard/Toast";
import { buttonPrimaryClass, buttonSecondaryClass, inputClass, labelClass } from "@/components/dashboard/form-styles";
import { useDashboard } from "@/contexts/DashboardProvider";
import { CAMPAIGN_STATUS_LABELS, CAMPAIGN_TYPE_LABELS } from "@/lib/domain/constants";
import { canAdvanceCampaign, getNextCampaignStatus } from "@/lib/domain/rules";
import { combineValidations, validateDateRange, validateRequired } from "@/lib/domain/validation";
import type { Campaign, CampaignStatus, CampaignType } from "@/lib/domain/types";

export function CampaignsPanel() {
  const { campaigns, regions, setCampaigns, getRegionName, can } = useDashboard();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", type: "door-to-door" as CampaignType, regionId: regions[0]?.id ?? "",
    startDate: "", endDate: "", status: "planejada" as CampaignStatus, description: "",
  });
  const canManage = can("campanhas:gerenciar");

  function resetForm() {
    setForm({ name: "", type: "door-to-door", regionId: regions[0]?.id ?? "", startDate: "", endDate: "", status: "planejada", description: "" });
    setEditingId(null); setShowForm(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validation = combineValidations(validateRequired(form.name, "Nome"), validateDateRange(form.startDate, form.endDate));
    if (!validation.ok) { toast(validation.message, "error"); return; }
    if (editingId) {
      setCampaigns((prev) => prev.map((c) => (c.id === editingId ? { ...c, ...form } : c)));
      toast("Campanha atualizada.");
    } else {
      setCampaigns((prev) => [...prev, { id: `cam-${Date.now()}`, ...form }]);
      toast("Campanha criada em planejamento.");
    }
    resetForm();
  }

  function advanceStatus(campaign: Campaign) {
    const next = getNextCampaignStatus(campaign.status);
    if (!next) return;
    setCampaigns((prev) => prev.map((c) => (c.id === campaign.id ? { ...c, status: next } : c)));
    toast(`Campanha avançou para: ${CAMPAIGN_STATUS_LABELS[next]}.`);
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader title="Campanhas" description="Atividades de campanha — planejamento, execução e conclusão por região"
        action={canManage ? <button type="button" onClick={() => { resetForm(); setShowForm(true); }} className={buttonPrimaryClass}>Nova campanha</button> : undefined} />
      <RoleHint />
      {showForm && canManage && (
        <FormCard title={editingId ? "Editar campanha" : "Nova atividade"} onSubmit={handleSubmit}
          actions={<><button type="submit" className={buttonPrimaryClass}>{editingId ? "Salvar" : "Criar"}</button><button type="button" onClick={resetForm} className={buttonSecondaryClass}>Cancelar</button></>}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2"><label htmlFor="cam-name" className={labelClass}>Nome</label>
              <input id="cam-name" className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="flex flex-col gap-1.5"><label htmlFor="cam-type" className={labelClass}>Tipo</label>
              <select id="cam-type" className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CampaignType })}>
                {Object.entries(CAMPAIGN_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
            <div className="flex flex-col gap-1.5"><label htmlFor="cam-region" className={labelClass}>Região</label>
              <select id="cam-region" className={inputClass} value={form.regionId} onChange={(e) => setForm({ ...form, regionId: e.target.value })}>
                {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
            <div className="flex flex-col gap-1.5"><label htmlFor="cam-start" className={labelClass}>Início</label>
              <input id="cam-start" type="date" className={inputClass} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required /></div>
            <div className="flex flex-col gap-1.5"><label htmlFor="cam-end" className={labelClass}>Fim</label>
              <input id="cam-end" type="date" className={inputClass} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required /></div>
            <div className="flex flex-col gap-1.5 sm:col-span-2"><label htmlFor="cam-desc" className={labelClass}>Descrição</label>
              <textarea id="cam-desc" className={inputClass} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          </div>
        </FormCard>
      )}
      <DataTable data={campaigns} keyExtractor={(c) => c.id} emptyMessage="Nenhuma campanha cadastrada."
        columns={[
          { key: "name", header: "Campanha", render: (c) => c.name },
          { key: "type", header: "Tipo", render: (c) => CAMPAIGN_TYPE_LABELS[c.type] },
          { key: "region", header: "Região", render: (c) => getRegionName(c.regionId) },
          { key: "workflow", header: "Fluxo", render: (c) => <CampaignWorkflow status={c.status} compact /> },
          { key: "dates", header: "Período", render: (c) => `${c.startDate} — ${c.endDate}` },
          { key: "status", header: "Status", render: (c) => <Badge label={CAMPAIGN_STATUS_LABELS[c.status]} variant={c.status} /> },
          { key: "actions", header: "Ações", render: (c) => canManage ? (
            <div className="flex flex-wrap gap-2">
              {canAdvanceCampaign(c.status) && <button type="button" onClick={() => advanceStatus(c)} className="text-xs font-medium text-blue-600 hover:underline">Avançar</button>}
              <button type="button" onClick={() => { setForm(c); setEditingId(c.id); setShowForm(true); }} className="text-xs font-medium text-zinc-600 hover:underline">Editar</button>
              <button type="button" onClick={() => setDeleteId(c.id)} className="text-xs font-medium text-red-600 hover:underline">Excluir</button>
            </div>
          ) : <span className="text-xs text-zinc-400">Visualização</span> },
        ]} />
      <ConfirmDialog open={deleteId !== null} title="Excluir campanha" message="Deseja remover esta campanha?"
        onConfirm={() => { if (deleteId) { setCampaigns((p) => p.filter((c) => c.id !== deleteId)); setDeleteId(null); toast("Campanha excluída."); } }}
        onCancel={() => setDeleteId(null)} />
    </div>
  );
}
