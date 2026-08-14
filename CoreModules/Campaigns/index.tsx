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
  const { campaigns, regions, users, setCampaigns, getRegionName, can } = useDashboard();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const [form, setForm] = useState({
    name: "",
    type: "door-to-door" as CampaignType,
    regionId: regions[0]?.id ?? "",
    startDate: "",
    endDate: "",
    status: "planejada" as CampaignStatus,
    description: "",
    responsible: users[0]?.name ?? "Administrador",
  });
  const canManage = can("campanhas:gerenciar");

  function resetForm() {
    setForm({
      name: "",
      type: "door-to-door",
      regionId: regions[0]?.id ?? "",
      startDate: "",
      endDate: "",
      status: "planejada",
      description: "",
      responsible: users[0]?.name ?? "Administrador",
    });
    setEditingId(null);
    setShowForm(false);
    setCurrentStep(0);
  }

  async function handleFinish() {
    const validation = combineValidations(
      validateRequired(form.name, "Nome"),
      validateDateRange(form.startDate, form.endDate)
    );
    if (!validation.ok) {
      toast(validation.message, "error");
      return;
    }
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
      action={
        canManage && !showForm ? (
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className={buttonPrimaryClass}
          >
            Nova campanha
          </button>
        ) : undefined
      }
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
                  <input
                    id="cam-name"
                    className={inputClass}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label htmlFor="cam-type" className={labelClass}>Tipo de Atividade</label>
                  <select
                    id="cam-type"
                    className={inputClass}
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as CampaignType })}
                  >
                    {Object.entries(CAMPAIGN_TYPE_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            {currentStep === 1 && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="cam-region" className={labelClass}>Região Alvo</label>
                <select
                  id="cam-region"
                  className={inputClass}
                  value={form.regionId}
                  onChange={(e) => setForm({ ...form, regionId: e.target.value })}
                >
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            )}
            {currentStep === 2 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="cam-start" className={labelClass}>Data de Início</label>
                  <input
                    id="cam-start"
                    type="date"
                    className={inputClass}
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="cam-end" className={labelClass}>Data de Término</label>
                  <input
                    id="cam-end"
                    type="date"
                    className={inputClass}
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}
            {currentStep === 3 && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="cam-responsible" className={labelClass}>Responsável</label>
                  <select
                    id="cam-responsible"
                    className={inputClass}
                    value={form.responsible}
                    onChange={(e) => setForm({ ...form, responsible: e.target.value })}
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="cam-desc" className={labelClass}>Descrição da Atividade</label>
                  <textarea
                    id="cam-desc"
                    className={inputClass}
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Ex: Metas específicas, contatos principais, observações..."
                  />
                </div>
              </div>
            )}
          </Wizard>
        )}

        {/* ── CARD: MARCOS E ENTREGAS DE PROJETOS VINCULADOS À CAMPANHA ── */}
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/60 to-indigo-50/40 p-4 dark:border-blue-950 dark:from-blue-950/30 dark:to-indigo-950/20 shadow-xs flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/60 dark:border-blue-900/40 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-base">📁</span>
              <div>
                <h3 className="text-xs font-black text-blue-950 dark:text-blue-100">
                  Marcos e Entregas de Projetos Integrados à Agenda
                </h3>
                <span className="text-[11px] text-blue-700 dark:text-blue-300">
                  Compromissos e vistorias dependentes do cronograma de infraestrutura e demandas
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-800 rounded-lg text-[10px] font-extrabold text-blue-700 dark:text-blue-300">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              Sincronizado com Cronograma & Agenda
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-blue-100 dark:border-blue-900 shadow-2xs flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">PRJ-2026-0042</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-extrabold">15 AGO</span>
              </div>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">Vistoria Técnica de Iluminação</span>
              <span className="text-[10px] text-zinc-500">Praça Central • Ana Martins</span>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-blue-100 dark:border-blue-900 shadow-2xs flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-purple-600 dark:text-purple-400">PRJ-2026-0042</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-extrabold">20 AGO</span>
              </div>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">Inauguração da Etapa 1 - LED</span>
              <span className="text-[10px] text-zinc-500">Bairro Primavera • Coordenação</span>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-blue-100 dark:border-blue-900 shadow-2xs flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400">DEM-2026-0115</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-extrabold">07 SET</span>
              </div>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">Audiência Pública com Moradores</span>
              <span className="text-[10px] text-zinc-500">Comitê Setorial • Gestor de Projetos</span>
            </div>
          </div>
        </div>

        <DataTable
          data={campaigns}
          keyExtractor={(c) => c.id}
          emptyMessage="Nenhuma campanha cadastrada."
          columns={[
            { key: "name", header: "Campanha", render: (c) => c.name },
            { key: "type", header: "Tipo", render: (c) => CAMPAIGN_TYPE_LABELS[c.type], hiddenOn: "mobile" },
            { key: "region", header: "Região", render: (c) => getRegionName(c.regionId), hiddenOn: "tablet" },
            { key: "responsible", header: "Responsável", render: (c) => c.responsible ?? "Administrador", hiddenOn: "tablet" },
            { key: "workflow", header: "Fluxo", render: (c) => <CampaignWorkflow status={c.status} compact />, hiddenOn: "mobile" },
            { key: "dates", header: "Período", render: (c) => `${c.startDate} — ${c.endDate}`, hiddenOn: "tablet" },
            { key: "status", header: "Status", render: (c) => <Badge label={CAMPAIGN_STATUS_LABELS[c.status]} variant={c.status} /> },
            {
              key: "actions",
              header: "Ações",
              render: (c) =>
                canManage ? (
                  <div className="flex flex-wrap gap-2">
                    {canAdvanceCampaign(c.status) && (
                      <button
                        type="button"
                        onClick={() => advanceStatus(c)}
                        className="text-xs font-medium text-blue-600 hover:underline"
                      >
                        Avançar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setForm({
                          name: c.name,
                          type: c.type,
                          regionId: c.regionId,
                          startDate: c.startDate,
                          endDate: c.endDate,
                          status: c.status,
                          description: c.description,
                          responsible: c.responsible ?? users[0]?.name ?? "Administrador",
                        });
                        setEditingId(c.id);
                        setShowForm(true);
                      }}
                      className="text-xs font-medium text-zinc-600 hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(c.id)}
                      className="text-xs font-medium text-red-650 hover:underline"
                    >
                      Excluir
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-zinc-400">Visualização</span>
                ),
            },
          ]}
        />
        <ConfirmDialog
          open={deleteId !== null}
          title="Excluir campanha"
          message="Deseja remover esta campanha?"
          onConfirm={async () => {
            if (deleteId) {
              try {
                await deleteCampaign(deleteId);
                setCampaigns((p) => p.filter((c) => c.id !== deleteId));
                setDeleteId(null);
                toast("Campanha excluída.");
              } catch {
                toast("Não foi possível excluir a campanha.", "error");
              }
            }
          }}
          onCancel={() => setDeleteId(null)}
        />
      </div>
    </ModuleBlock>
  );
}
