"use client";

import { useState } from "react";
import { Badge } from "@/components/dashboard/Badge";
import { CampaignWorkflow } from "@/components/dashboard/CampaignWorkflow";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { DataTable } from "@/components/dashboard/DataTable";
import { ModuleBlock } from "@/components/dashboard/ModuleBlock";
import { RoleHint } from "@/components/dashboard/RoleHint";
import { Wizard } from "@/components/dashboard/Wizard";
import { useToast } from "@/components/dashboard/Toast";
import {
  deleteCampaign,
  saveCampaign,
} from "@/app/actions/dashboard-crud";
import { buttonPrimaryClass, inputClass, labelClass } from "@/components/dashboard/form-styles";
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
  const [currentStep, setCurrentStep] = useState(0);

  const [form, setForm] = useState({
    name: "", type: "door-to-door" as CampaignType, regionId: regions[0]?.id ?? "",
    startDate: "", endDate: "", status: "planejada" as CampaignStatus, description: "",
  });
  const canManage = can("campanhas:gerenciar");

  function resetForm() {
    setForm({ name: "", type: "door-to-door", regionId: regions[0]?.id ?? "", startDate: "", endDate: "", status: "planejada", description: "" });
    setEditingId(null); setShowForm(false); setCurrentStep(0);
  }

  async function handleFinish() {
    const validation = combineValidations(validateRequired(form.name, "Nome"), validateDateRange(form.startDate, form.endDate));
    if (!validation.ok) { toast(validation.message, "error"); return; }
    try {
      if (editingId) {
        const saved = await saveCampaign({ id: editingId, ...form }, true);
        setCampaigns((prev) => prev.map((c) => (c.id === editingId ? saved : c)));
        toast("Campanha atualizada.");
      } else {
        const saved = await saveCampaign({ id: `cam-${Date.now()}`, ...form }, false);
        setCampaigns((prev) => [...prev, saved]);
        toast("Campanha criada com sucesso.");
      }
      resetForm();
    } catch {
      toast("Não foi possível salvar a campanha.", "error");
    }
  }

  async function advanceStatus(campaign: Campaign) {
    const next = getNextCampaignStatus(campaign.status);
    if (!next) return;
    try {
      const saved = await saveCampaign({ ...campaign, status: next }, true);
      setCampaigns((prev) => prev.map((c) => (c.id === campaign.id ? saved : c)));
      toast(`Campanha avançou para: ${CAMPAIGN_STATUS_LABELS[next]}.`);
    } catch {
      toast("Não foi possível avançar a campanha.", "error");
    }
  }

  const steps = [
    { id: "info", title: "Informações Básicas", description: "Identificação da atividade", isValid: form.name.length > 0 },
    { id: "territorial", title: "Territorial", description: "Onde a ação ocorrerá", isValid: !!form.regionId },
    { id: "calendar", title: "Cronograma", description: "Datas de execução", isValid: !!form.startDate && !!form.endDate },
    { id: "details", title: "Detalhes", description: "Informações complementares" },
  ];

  return (
    <ModuleBlock 
      title="Gestão de Campanhas" 
      icon="📣"
      action={canManage && !showForm ? <button type="button" onClick={() => { resetForm(); setShowForm(true); }} className={buttonPrimaryClass}>Nova campanha</button> : undefined}
    >
      <div className="flex flex-col gap-4">
        <RoleHint />

        {showForm && canManage && (
          <Wizard
            steps={steps}
            currentStepIndex={currentStep}
            onStepChange={setCurrentStep}
            onFinish={handleFinish}
            onCancel={resetForm}
          >
            {currentStep === 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label htmlFor="cam-name" className={labelClass}>Nome da Campanha</label>
                  <input id="cam-name" className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label htmlFor="cam-type" className={labelClass}>Tipo de Atividade</label>
                  <select id="cam-type" className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CampaignType })}>
                    {Object.entries(CAMPAIGN_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
            )}
            {currentStep === 1 && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="cam-region" className={labelClass}>Região Alvo</label>
                <select id="cam-region" className={inputClass} value={form.regionId} onChange={(e) => setForm({ ...form, regionId: e.target.value })}>
                  {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            )}
            {currentStep === 2 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="cam-start" className={labelClass}>Data de Início</label>
                  <input id="cam-start" type="date" className={inputClass} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="cam-end" className={labelClass}>Data de Término</label>
                  <input id="cam-end" type="date" className={inputClass} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
                </div>
              </div>
            )}
            {currentStep === 3 && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="cam-desc" className={labelClass}>Descrição da Atividade</label>
                <textarea id="cam-desc" className={inputClass} rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ex: Metas específicas, contatos principais, observações..." />
              </div>
            )}
          </Wizard>
        )}
        
        <DataTable data={campaigns} keyExtractor={(c) => c.id} emptyMessage="Nenhuma campanha cadastrada."
          columns={[
            { key: "name", header: "Campanha", render: (c) => c.name },
            { key: "type", header: "Tipo", render: (c) => CAMPAIGN_TYPE_LABELS[c.type], hiddenOn: "mobile" },
            { key: "region", header: "Região", render: (c) => getRegionName(c.regionId), hiddenOn: "tablet" },
            { key: "workflow", header: "Fluxo", render: (c) => <CampaignWorkflow status={c.status} compact />, hiddenOn: "mobile" },
            { key: "dates", header: "Período", render: (c) => `${c.startDate} — ${c.endDate}`, hiddenOn: "tablet" },
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
          onConfirm={async () => { if (deleteId) { try { await deleteCampaign(deleteId); setCampaigns((p) => p.filter((c) => c.id !== deleteId)); setDeleteId(null); toast("Campanha excluída."); } catch { toast("Não foi possível excluir a campanha.", "error"); } } }}
          onCancel={() => setDeleteId(null)} />
      </div>
    </ModuleBlock>
  );
}
