"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Search,
  Upload,
  Plus,
  Calendar as CalendarIcon,
  RotateCcw,
  LayoutGrid,
  List as ListIcon,
  Kanban as KanbanIcon,
  CalendarRange,
  AlertTriangle,
  Clock,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Filter,
  Eye,
  Edit,
  Trash2,
  Check,
  FileSpreadsheet,
  TrendingUp,
  Folder,
  FileText,
  Download,
  Printer,
  Wallet,
} from "lucide-react";


import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import {
  WorkItem,
  WorkItemFilters,
  ViewMode,
  createDemandaSchema,
  CreateDemandaInput,
  ProjectProgressItem,
} from "@/lib/domain/demandas-projetos-types";

import {
  useExecutiveSummary,
  useWorkItemsList,
  useStatusDistribution,
  useWorkItemAlerts,
  useRecentActivities,
  useProjectProgress,
  useWorkItemOptions,
  useCreateDemanda,
  useExportDemands,
  useTransitionStatus,
  useConvertToProject,
} from "@/lib/hooks/use-demandas-projetos";

// CORES E TOKENS DO DESIGN SYSTEM
const STATUS_COLORS: Record<string, string> = {
  em_execucao: "#059669",
  em_analise: "#0B5FEA",
  triagem: "#7C3AED",
  concluida: "#10B981",
  aprovada: "#3B82F6",
  recebida: "#64748B",
  rascunho: "#94A3B8",
  arquivada: "#64748B",
  cancelada: "#DC2626",
};

const PRIORITY_COLORS: Record<string, string> = {
  baixa: "#64748B",
  media: "#0B5FEA",
  alta: "#EA7A00",
  urgente: "#DC2626",
};

export type AcompanhamentoDemandasProjetosProps = {
  onOpenNovaDemanda?: () => void;
  onOpenAnaliseDemanda?: (item: any) => void;
  onOpenProjetoAtivo?: (item: any) => void;
};

export function AcompanhamentoDemandasProjetos({
  onOpenNovaDemanda,
  onOpenAnaliseDemanda,
  onOpenProjetoAtivo,
}: AcompanhamentoDemandasProjetosProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // CONTEXTO ORGANIZACIONAL ATIVO
  const [contextId] = useState<string>("ctx-gov-2026");

  // SELETOR DE VISUALIZAÇÃO COM SINCRONIZAÇÃO DE URL
  const initialView = (searchParams.get("view") as ViewMode) || "overview";
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);

  // ESTADO DOS FILTROS HORIZONTAIS
  const [filters, setFilters] = useState<WorkItemFilters>({
    search: searchParams.get("search") || "",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
    dateType: "criacao",
    type: searchParams.get("type") || "all",
    status: searchParams.get("status") || "all",
    priority: searchParams.get("priority") || "all",
    requestingAreaId: searchParams.get("requestingAreaId") || "all",
    assigneeId: searchParams.get("assigneeId") || "all",
    projectId: searchParams.get("projectId") || "all",
    page: searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1,
    pageSize: 25,
    sortBy: "createdAt",
    sortDirection: "desc",
    view: initialView,
  });

  // INPUT SEARCH COM DEBOUNCE
  const [searchInput, setSearchInput] = useState(filters.search || "");

  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // ITENS SELECIONADOS NA TABELA
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<WorkItem | null>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

  // DOCUMENTOS TÉCNICOS ANEXADOS REAIS
  const [attachedDocsMap, setAttachedDocsMap] = useState<
    Record<string, { id: string; name: string; url: string; size: string; type: string; rawFile?: File }[]>
  >({
    "wi-101": [
      { id: "doc-1", name: "Memorial_Descritivo_LED.pdf", url: "#", size: "1.2 MB", type: "pdf" },
      { id: "doc-2", name: "Planta_Baixa_AvPrincipal.dwg", url: "#", size: "3.4 MB", type: "dwg" },
    ],
    "wi-102": [
      { id: "doc-3", name: "Laudo_Tecnico_Estrutural.pdf", url: "#", size: "2.1 MB", type: "pdf" },
      { id: "doc-4", name: "Licenca_Ambiental_Previa.pdf", url: "#", size: "850 KB", type: "pdf" },
    ],
  });
  const [previewDoc, setPreviewDoc] = useState<{ name: string; url: string; type: string } | null>(null);

  const handleDetailFileUpload = (workItemId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newDocs = Array.from(files).map((file) => ({
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: file.name,
      url: URL.createObjectURL(file),
      size: `${(file.size / 1024).toFixed(1)} KB`,
      type: file.name.split(".").pop()?.toLowerCase() || "doc",
      rawFile: file,
    }));

    setAttachedDocsMap((prev) => ({
      ...prev,
      [workItemId]: [...(prev[workItemId] || []), ...newDocs],
    }));
  };



  // ATUALIZAÇÃO DA URL AO MUDAR FILTROS OU VISÃO
  useEffect(() => {
    const params = new URLSearchParams();
    if (viewMode !== "overview") params.set("view", viewMode);
    if (filters.search) params.set("search", filters.search);
    if (filters.type && filters.type !== "all") params.set("type", filters.type);
    if (filters.status && filters.status !== "all") params.set("status", filters.status);
    if (filters.priority && filters.priority !== "all") params.set("priority", filters.priority);
    if (filters.requestingAreaId && filters.requestingAreaId !== "all")
      params.set("requestingAreaId", filters.requestingAreaId);
    if (filters.assigneeId && filters.assigneeId !== "all") params.set("assigneeId", filters.assigneeId);
    if (filters.projectId && filters.projectId !== "all") params.set("projectId", filters.projectId);
    if (filters.page && filters.page > 1) params.set("page", filters.page.toString());

    startTransition(() => {
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  }, [viewMode, filters, router]);

  // CONSULTAS TANKSTACK QUERY
  const summaryQuery = useExecutiveSummary(contextId, filters);
  const workItemsQuery = useWorkItemsList(contextId, { ...filters, view: viewMode });
  const distributionQuery = useStatusDistribution(contextId, filters);
  const alertsQuery = useWorkItemAlerts(contextId);
  const activitiesQuery = useRecentActivities(contextId);
  const projectProgressQuery = useProjectProgress(contextId);
  const optionsQuery = useWorkItemOptions(contextId);

  // MUTATIONS
  const createDemandaMutation = useCreateDemanda(contextId);
  const exportMutation = useExportDemands(contextId);
  const transitionStatusMutation = useTransitionStatus(contextId);
  const convertToProjectMutation = useConvertToProject(contextId);

  const handleTransition = async (newStatus: string) => {
    if (!selectedDetailItem) return;
    try {
      const res = await transitionStatusMutation.mutateAsync({
        demandId: selectedDetailItem.id,
        newStatus,
      });
      setSelectedDetailItem(res.demanda);
      setExportMessage(`Situação atualizada: ${res.demanda.status.label}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleConvert = async () => {
    if (!selectedDetailItem) return;
    try {
      const res = await convertToProjectMutation.mutateAsync({
        demandId: selectedDetailItem.id,
      });
      setSelectedDetailItem(res.project);
      setExportMessage(`Demanda aprovada e convertida no Projeto ${res.project.code}!`);
    } catch (e) {
      console.error(e);
    }
  };

  // FORMULÁRIO DE NOVA DEMANDA
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreateForm,
    formState: { errors: createErrors, isSubmitting: isCreating },
  } = useForm({
    resolver: zodResolver(createDemandaSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "demanda" as const,
      requestingAreaId: "area-infra",
      priority: "media" as const,
      status: "recebida" as const,
    },
  });

  const onSubmitCreate = async (data: CreateDemandaInput) => {
    try {
      await createDemandaMutation.mutateAsync(data);
      setIsCreateModalOpen(false);
      resetCreateForm();
      setExportMessage("Nova demanda cadastrada com sucesso!");
      setTimeout(() => setExportMessage(null), 4000);
    } catch (err: any) {
      alert(`Erro ao criar demanda: ${err.message}`);
    }
  };

  const handleExport = async () => {
    try {
      setExportMessage("Gerando exportação dos registros...");
      const blob = await exportMutation.mutateAsync(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `demandas_projetos_export_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setExportMessage("Exportação concluída com sucesso!");
      setTimeout(() => setExportMessage(null), 4000);
    } catch (err) {
      setExportMessage("Erro ao exportar arquivo.");
      setTimeout(() => setExportMessage(null), 4000);
    }
  };

  // Exportar CSV client-side (sem API)
  const handleExportCSV = () => {
    setShowExportMenu(false);
    const items = workItemsQuery.data?.items || [];
    const summary = summaryQuery.data;
    const header = [
      `# Acompanhamento de Demandas e Projetos — Exportado em ${new Date().toLocaleString("pt-BR")}`,
      `# Total: ${summary?.totalDemands ?? 0} | Em andamento: ${summary?.inProgress ?? 0} | Concluídos: ${summary?.completed ?? 0} | Atrasados: ${summary?.overdue ?? 0} | Aguardando: ${summary?.waitingStart ?? 0} | Em risco: ${summary?.blockedOrAtRisk ?? 0}`,
      "",
      "Código,Título,Tipo,Área Solicitante,Responsável,Prioridade,Situação,Progresso (%),Prazo,Atrasado",
    ];
    const rows = items.map((i) =>
      [
        i.code,
        `"${i.title.replace(/"/g, '""')}"`,
        i.type,
        `"${i.requestingArea.name}"`,
        `"${i.assignee?.name || "-"}"`,
        i.priority.label,
        i.status.label,
        i.progress?.percentage ?? 0,
        i.deadline ? new Date(i.deadline).toLocaleDateString("pt-BR") : "-",
        i.overdue ? "Sim" : "Não",
      ].join(",")
    );
    const csv = [...header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `demandas_projetos_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setExportMessage("Planilha CSV exportada com sucesso!");
    setTimeout(() => setExportMessage(null), 4000);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setFilters({
      search: "",
      startDate: "",
      endDate: "",
      dateType: "criacao",
      type: "all",
      status: "all",
      priority: "all",
      requestingAreaId: "all",
      assigneeId: "all",
      projectId: "all",
      page: 1,
      pageSize: 25,
      sortBy: "createdAt",
      sortDirection: "desc",
      view: viewMode,
    });
  };

  // CHECKBOX SELEÇÃO
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked && workItemsQuery.data?.items) {
      setSelectedItems(workItemsQuery.data.items.map((i) => i.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased">
      {/* BANNER INFORMATIVO SE EXPORTAÇÃO COMPLETA */}
      {exportMessage && (
        <div className="bg-[#EFF6FF] border-b border-[#0B5FEA]/20 px-6 py-2 flex items-center justify-between text-xs text-[#0B5FEA] font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{exportMessage}</span>
          </div>
          <button type="button" onClick={() => setExportMessage(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* CONTEÚDO PRINCIPAL DA TELA                                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      <main className="max-w-[1720px] mx-auto px-6 py-6 space-y-6">
        {/* ÁREA DO CABEÇALHO DA PÁGINA (BREADCRUMB, TÍTULO, SUBTÍTULO, AÇÕES) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs" aria-label="Navegação estruturada">
              <a href="#" className="text-[#0B5FEA] font-medium hover:underline">
                Demandas e Projetos
              </a>
              <span className="text-[#94A3B8]">/</span>
              <span className="text-[#475569]">Acompanhamento</span>
            </nav>

            {/* Título Principal */}
            <h1 className="text-[28px] font-bold text-[#0F172A] leading-tight tracking-tight">
              Acompanhamento de Demandas e Projetos
            </h1>

            {/* Subtítulo */}
            <p className="text-sm text-[#475569]">
              Monitore andamento, prazos, responsáveis, prioridades, riscos e resultados.
            </p>
          </div>

          {/* Botões de Ação do Cabeçalho: Exportar (PDF / CSV) e Nova Demanda */}
          <div className="flex items-center gap-3 self-start md:self-auto relative">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={exportMutation.isPending}
                className="h-[44px] px-5 rounded-[7px] border border-[#DCE2EA] bg-white text-[#0F172A] text-xs font-semibold hover:bg-[#F8FAFC] transition-colors flex items-center gap-2 shadow-2xs disabled:opacity-50 cursor-pointer"
              >
                <Upload className="h-4 w-4 text-[#475569]" strokeWidth={2} />
                <span>Exportar</span>
                <span className="text-[10px] text-[#64748B]">▼</span>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-1.5 w-64 bg-white border border-[#DCE2EA] rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                  <button
                    type="button"
                    onClick={() => {
                      setShowExportMenu(false);
                      setShowPdfModal(true);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#F1F5F9] text-xs font-semibold text-[#0F172A] flex items-center gap-2.5 transition-colors"
                  >
                    <FileText className="h-4 w-4 text-[#0B5FEA]" />
                    <div>
                      <span className="block font-bold">Relatório Executivo PDF</span>
                      <span className="text-[10px] text-[#64748B] block">Formatado para Apresentação</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#F1F5F9] text-xs font-semibold text-[#0F172A] flex items-center gap-2.5 transition-colors border-t border-[#F1F5F9]"
                  >
                    <Download className="h-4 w-4 text-[#059669]" />
                    <div>
                      <span className="block font-bold">Planilha CSV</span>
                      <span className="text-[10px] text-[#64748B] block">Exportar dados reais (client-side)</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => (onOpenNovaDemanda ? onOpenNovaDemanda() : setIsCreateModalOpen(true))}
              className="h-[44px] px-5 rounded-[7px] bg-[#0B5FEA] text-white text-xs font-semibold hover:bg-[#0952CD] transition-colors flex items-center gap-2 shadow-2xs cursor-pointer"
            >
              <FileText className="h-4 w-4 text-white" strokeWidth={2.2} />
              <span>Nova demanda</span>
            </button>
          </div>

        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* SELETOR DOS 4 MODOS DE VISUALIZAÇÃO                           */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="inline-flex p-1 bg-white border border-[#DCE2EA] rounded-lg shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode("overview")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
              viewMode === "overview"
                ? "bg-[#EFF6FF] text-[#0B5FEA] shadow-2xs"
                : "text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Visão geral</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
              viewMode === "list"
                ? "bg-[#EFF6FF] text-[#0B5FEA] shadow-2xs"
                : "text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
            }`}
          >
            <ListIcon className="h-4 w-4" />
            <span>Lista</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("kanban")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
              viewMode === "kanban"
                ? "bg-[#EFF6FF] text-[#0B5FEA] shadow-2xs"
                : "text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
            }`}
          >
            <KanbanIcon className="h-4 w-4" />
            <span>Quadro</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("gantt")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
              viewMode === "gantt"
                ? "bg-[#EFF6FF] text-[#0B5FEA] shadow-2xs"
                : "text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
            }`}
          >
            <CalendarRange className="h-4 w-4" />
            <span>Cronograma</span>
          </button>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* BLOCOS DE MÉTRICAS KPI (6 CARTÕES SUPERIORES)                 */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Card 1: Total de demandas */}
          <div className="bg-white border border-[#DCE2EA] rounded-xl p-4 shadow-2xs flex flex-col justify-between h-[104px]">
            <span className="text-xs font-medium text-[#475569]">Total de demandas</span>
            {summaryQuery.isLoading ? (
              <div className="space-y-2">
                <div className="h-6 w-16 bg-[#D9DDE3] rounded-md animate-pulse" />
                <div className="h-3 w-12 bg-[#D9DDE3] rounded-md animate-pulse" />
              </div>
            ) : (
              <div>
                <span className="text-2xl font-bold text-[#0F172A]">
                  {summaryQuery.data?.totalDemands ?? 0}
                </span>
                <span className="text-[11px] text-[#059669] font-medium block">
                  +{summaryQuery.data?.periodComparisonPercentage}% este mês
                </span>
              </div>
            )}
          </div>

          {/* Card 2: Em andamento */}
          <div className="bg-white border border-[#DCE2EA] rounded-xl p-4 shadow-2xs flex flex-col justify-between h-[104px]">
            <span className="text-xs font-medium text-[#475569]">Em andamento</span>
            {summaryQuery.isLoading ? (
              <div className="space-y-2">
                <div className="h-6 w-16 bg-[#D9DDE3] rounded-md animate-pulse" />
                <div className="h-3 w-12 bg-[#D9DDE3] rounded-md animate-pulse" />
              </div>
            ) : (
              <div>
                <span className="text-2xl font-bold text-[#0B5FEA]">
                  {summaryQuery.data?.inProgress ?? 0}
                </span>
                <span className="text-[11px] text-[#475569] block">Em execução</span>
              </div>
            )}
          </div>

          {/* Card 3: Concluídos */}
          <div className="bg-white border border-[#DCE2EA] rounded-xl p-4 shadow-2xs flex flex-col justify-between h-[104px]">
            <span className="text-xs font-medium text-[#475569]">Concluídos</span>
            {summaryQuery.isLoading ? (
              <div className="space-y-2">
                <div className="h-6 w-16 bg-[#D9DDE3] rounded-md animate-pulse" />
                <div className="h-3 w-12 bg-[#D9DDE3] rounded-md animate-pulse" />
              </div>
            ) : (
              <div>
                <span className="text-2xl font-bold text-[#059669]">
                  {summaryQuery.data?.completed ?? 0}
                </span>
                <span className="text-[11px] text-[#059669] font-medium block">100% finalizados</span>
              </div>
            )}
          </div>

          {/* Card 4: Atrasados */}
          <div className="bg-white border border-[#DCE2EA] rounded-xl p-4 shadow-2xs flex flex-col justify-between h-[104px]">
            <span className="text-xs font-medium text-[#475569]">Atrasados</span>
            {summaryQuery.isLoading ? (
              <div className="space-y-2">
                <div className="h-6 w-16 bg-[#D9DDE3] rounded-md animate-pulse" />
                <div className="h-3 w-12 bg-[#D9DDE3] rounded-md animate-pulse" />
              </div>
            ) : (
              <div>
                <span className="text-2xl font-bold text-[#DC2626]">
                  {summaryQuery.data?.overdue ?? 0}
                </span>
                <span className="text-[11px] text-[#DC2626] font-medium block">Requer atenção</span>
              </div>
            )}
          </div>

          {/* Card 5: Aguardando início */}
          <div className="bg-white border border-[#DCE2EA] rounded-xl p-4 shadow-2xs flex flex-col justify-between h-[104px]">
            <span className="text-xs font-medium text-[#475569]">Aguardando início</span>
            {summaryQuery.isLoading ? (
              <div className="space-y-2">
                <div className="h-6 w-16 bg-[#D9DDE3] rounded-md animate-pulse" />
                <div className="h-3 w-12 bg-[#D9DDE3] rounded-md animate-pulse" />
              </div>
            ) : (
              <div>
                <span className="text-2xl font-bold text-[#475569]">
                  {summaryQuery.data?.waitingStart ?? 0}
                </span>
                <span className="text-[11px] text-[#475569] block">Na fila de triagem</span>
              </div>
            )}
          </div>

          {/* Card 6: Bloqueados ou em risco */}
          <div className="bg-white border border-[#DCE2EA] rounded-xl p-4 shadow-2xs flex flex-col justify-between h-[104px]">
            <span className="text-xs font-medium text-[#475569]">Bloqueados ou em risco</span>
            {summaryQuery.isLoading ? (
              <div className="space-y-2">
                <div className="h-6 w-16 bg-[#D9DDE3] rounded-md animate-pulse" />
                <div className="h-3 w-12 bg-[#D9DDE3] rounded-md animate-pulse" />
              </div>
            ) : (
              <div>
                <span className="text-2xl font-bold text-[#EA7A00]">
                  {summaryQuery.data?.blockedOrAtRisk ?? 0}
                </span>
                <span className="text-[11px] text-[#EA7A00] font-medium block">Pendência ambiental/jurídica</span>
              </div>
            )}
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* BARRA HORIZONTAL DE FILTROS (8 CAMPOS + LIMPAR)               */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="bg-white border border-[#DCE2EA] rounded-xl p-4 shadow-2xs flex flex-wrap items-center gap-3">
          {/* Campo 1: Buscar */}
          <div className="flex-1 min-w-[200px] relative">
            <span className="text-[11px] font-semibold text-[#475569] block mb-1">Buscar</span>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-[#94A3B8]" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Código, demanda ou projeto..."
                className="w-full h-9 pl-9 pr-3 border border-[#DCE2EA] rounded-md text-xs focus:outline-hidden focus:border-[#0B5FEA]"
              />
            </div>
          </div>

          {/* Campo 2: Período */}
          <div className="w-[140px]">
            <span className="text-[11px] font-semibold text-[#475569] block mb-1">Período</span>
            <div className="relative">
              <input
                type="date"
                value={filters.startDate || ""}
                onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value, page: 1 }))}
                className="w-full h-9 px-2 border border-[#DCE2EA] rounded-md text-xs text-[#0F172A] focus:outline-hidden focus:border-[#0B5FEA]"
              />
            </div>
          </div>

          {/* Campo 3: Tipo */}
          <div className="w-[130px]">
            <span className="text-[11px] font-semibold text-[#475569] block mb-1">Tipo</span>
            <select
              value={filters.type || "all"}
              onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value, page: 1 }))}
              className="w-full h-9 px-2 border border-[#DCE2EA] rounded-md text-xs focus:outline-hidden focus:border-[#0B5FEA]"
            >
              <option value="all">Todos os tipos</option>
              <option value="demanda">Demanda</option>
              <option value="projeto">Projeto</option>
              <option value="iniciativa">Iniciativa</option>
            </select>
          </div>

          {/* Campo 4: Situação */}
          <div className="w-[150px]">
            <span className="text-[11px] font-semibold text-[#475569] block mb-1">Situação</span>
            <select
              value={filters.status || "all"}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
              className="w-full h-9 px-2 border border-[#DCE2EA] rounded-md text-xs focus:outline-hidden focus:border-[#0B5FEA]"
            >
              <option value="all">Todas as situações</option>
              <option value="recebida">Aguardando Início</option>
              <option value="triagem">Triagem</option>
              <option value="em_analise">Em Análise</option>
              <option value="em_execucao">Em Execução</option>
              <option value="concluida">Concluídos</option>
            </select>
          </div>

          {/* Campo 5: Prioridade */}
          <div className="w-[130px]">
            <span className="text-[11px] font-semibold text-[#475569] block mb-1">Prioridade</span>
            <select
              value={filters.priority || "all"}
              onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value, page: 1 }))}
              className="w-full h-9 px-2 border border-[#DCE2EA] rounded-md text-xs focus:outline-hidden focus:border-[#0B5FEA]"
            >
              <option value="all">Todas</option>
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>

          {/* Campo 6: Área solicitante */}
          <div className="w-[160px]">
            <span className="text-[11px] font-semibold text-[#475569] block mb-1">Área solicitante</span>
            <select
              value={filters.requestingAreaId || "all"}
              onChange={(e) => setFilters((prev) => ({ ...prev, requestingAreaId: e.target.value, page: 1 }))}
              className="w-full h-9 px-2 border border-[#DCE2EA] rounded-md text-xs focus:outline-hidden focus:border-[#0B5FEA]"
            >
              <option value="all">Todas as áreas</option>
              {optionsQuery.data?.requestingAreas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>

          {/* Campo 7: Responsável */}
          <div className="w-[150px]">
            <span className="text-[11px] font-semibold text-[#475569] block mb-1">Responsável</span>
            <select
              value={filters.assigneeId || "all"}
              onChange={(e) => setFilters((prev) => ({ ...prev, assigneeId: e.target.value, page: 1 }))}
              className="w-full h-9 px-2 border border-[#DCE2EA] rounded-md text-xs focus:outline-hidden focus:border-[#0B5FEA]"
            >
              <option value="all">Todos</option>
              {optionsQuery.data?.eligibleAssignees.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          {/* Campo 8: Limpar Filtros */}
          <div className="self-end pb-0.5">
            <button
              type="button"
              onClick={handleClearFilters}
              className="h-9 px-3 text-[#0B5FEA] hover:bg-[#EFF6FF] rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Limpar filtros</span>
            </button>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────── */}
        {/* VIEW: OVERVIEW (65/35 grid — tabela + 4 cartões laterais)   */}
        {/* ─────────────────────────────────────────────────────────── */}
        {viewMode === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* COLUNA DA ESQUERDA (65% -> 8 de 12 colunas) - TABELA PRINCIPAL */}
            <div className="lg:col-span-8 bg-white border border-[#DCE2EA] rounded-xl shadow-2xs overflow-hidden flex flex-col justify-between">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                    <ListIcon className="h-4 w-4 text-[#0B5FEA]" />
                    <span>Demandas e projetos</span>
                  </h2>
                  <span className="text-xs text-[#475569]">
                    Exibindo {workItemsQuery.data?.items.length || 0} de{" "}
                    {workItemsQuery.data?.pagination.total || 0} registros
                  </span>
                </div>

                {/* TABELA */}
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-y border-[#DCE2EA] text-[#475569] font-semibold text-[10px] uppercase">
                        <th className="py-2.5 px-1.5 text-center w-6"><input type="checkbox" onChange={handleSelectAll} className="rounded-xs border-[#DCE2EA] text-[#0B5FEA] focus:ring-[#0B5FEA]" /></th>
                        <th className="py-2.5 px-1.5 w-20">Código</th>
                        <th className="py-2.5 px-1.5">Demanda ou projeto</th>
                        <th className="py-2.5 px-1.5 w-14 text-center">Tipo</th>
                        <th className="py-2.5 px-1.5 w-24">Área solicitante</th>
                        <th className="py-2.5 px-1.5 w-24">Responsável</th>
                        <th className="py-2.5 px-1.5 w-20 text-center">Prioridade</th>
                        <th className="py-2.5 px-1.5 w-24 text-center">Situação</th>
                        <th className="py-2.5 px-1.5 w-16 text-center">Progresso</th>
                        <th className="py-2.5 px-1.5 w-20 text-center">Prazo</th>
                        <th className="py-2.5 px-1.5 text-center w-10">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DCE2EA]">
                      {workItemsQuery.isLoading ? Array.from({ length: 6 }).map((_, i) => (
                        <tr key={i} className="h-[50px]">
                          {Array.from({ length: 11 }).map((__, j) => (
                            <td key={j} className="py-3 px-3"><div className="h-4 w-full max-w-[80px] bg-[#D9DDE3] rounded-md animate-pulse" /></td>
                          ))}
                        </tr>
                      )) : workItemsQuery.isError ? (
                        <tr><td colSpan={11} className="py-12 text-center text-xs text-[#DC2626]"><div className="flex flex-col items-center gap-2"><AlertTriangle className="h-6 w-6" /><p>Falha ao carregar listagem do servidor.</p><button type="button" onClick={() => workItemsQuery.refetch()} className="px-3 py-1 bg-[#EFF6FF] text-[#0B5FEA] rounded-md font-semibold text-xs">Tentar novamente</button></div></td></tr>
                      ) : workItemsQuery.data?.items.length === 0 ? (
                        <tr><td colSpan={11} className="py-16 text-center text-xs text-[#475569]">Nenhuma demanda ou projeto encontrado.</td></tr>
                      ) : workItemsQuery.data?.items.map((item) => (
                        <tr key={item.id} className="h-[46px] hover:bg-[#F8FAFC] transition-colors border-b border-[#F1F5F9]">
                          <td className="py-2 px-1 text-center w-6"><input type="checkbox" checked={selectedItems.includes(item.id)} onChange={() => handleSelectItem(item.id)} className="rounded-xs border-[#DCE2EA] text-[#0B5FEA] focus:ring-[#0B5FEA]" /></td>
                          <td className="py-2 px-1.5 font-mono font-bold text-[#0B5FEA] text-[11px] cursor-pointer hover:underline whitespace-nowrap" onClick={() => { if (item.type === "projeto" && onOpenProjetoAtivo) { onOpenProjetoAtivo(item); } else if (onOpenAnaliseDemanda) { onOpenAnaliseDemanda(item); } else { setSelectedDetailItem(item); } }}>{item.code}</td>
                          <td className="py-2 px-1.5">
                            <div className="font-semibold text-[#0F172A] text-[11px] truncate max-w-[170px] cursor-pointer hover:text-[#0B5FEA]" onClick={() => setSelectedDetailItem(item)} title={item.title}>{item.title}</div>
                            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                              {item.project && <span className="text-[9px] text-[#475569] flex items-center gap-0.5 truncate max-w-[130px]"><Folder className="h-2.5 w-2.5 text-[#0B5FEA] shrink-0" /> {item.project.name}</span>}
                              {item.files && item.files.length > 0 && <span className="text-[9px] font-bold text-[#0B5FEA] bg-[#EFF6FF] px-1 py-0.2 rounded border border-[#BFDBFE]">📎 {item.files.length} doc(s)</span>}
                              {item.hasBudget && item.budgetValue ? <span className="text-[9px] font-bold text-[#059669] bg-[#ECFDF5] px-1 py-0.2 rounded border border-[#A7F3D0]">💰 R$ {(item.budgetValue / 1000).toFixed(0)}k</span> : <span className="text-[9px] text-[#94A3B8] bg-[#F8FAFC] px-1 py-0.2 rounded border border-[#E2E8F0]">Sem orç.</span>}
                              {item.approvedBy ? <span className="text-[9px] font-bold text-[#7C3AED] bg-[#F5F3FF] px-1 py-0.2 rounded border border-[#DDD6FE]">✓ {typeof item.approvedBy === "string" ? item.approvedBy.split(" ")[0] : item.approvedBy.name}</span> : null}
                            </div>
                          </td>
                          <td className="py-2 px-1 text-center"><span className="inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F1F5F9] text-[#475569] border border-[#DCE2EA] uppercase">{item.type}</span></td>
                          <td className="py-2 px-1 text-[#475569] text-[11px] truncate max-w-[90px]" title={item.requestingArea.name}>{item.requestingArea.name}</td>
                          <td className="py-2 px-1 text-[#0F172A] text-[11px] truncate max-w-[90px]" title={item.assignee?.name || ""}>{item.assignee?.name || <span className="text-[#94A3B8]">—</span>}</td>
                          <td className="py-2 px-1 text-center"><span className="inline-flex items-center gap-1 font-bold text-[10px] uppercase" style={{ color: PRIORITY_COLORS[item.priority.code] || "#475569" }}><span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: PRIORITY_COLORS[item.priority.code] }} />{item.priority.label}</span></td>
                          <td className="py-2 px-1 text-center"><span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-2xs whitespace-nowrap" style={{ backgroundColor: STATUS_COLORS[item.status.code] || "#64748B" }}>{item.status.label}</span></td>
                          <td className="py-2 px-1 text-center"><div className="w-12 bg-[#E2E8F0] rounded-full h-1.5 overflow-hidden mx-auto"><div className="bg-[#059669] h-1.5 rounded-full" style={{ width: `${item.progress.percentage}%` }} /></div><span className="text-[9px] text-[#475569] font-bold block mt-0.5">{item.progress.percentage}%</span></td>
                          <td className="py-2 px-1 text-center whitespace-nowrap"><span className={`text-[10px] font-semibold block ${item.overdue ? "text-[#DC2626] font-bold" : "text-[#475569]"}`}>{item.deadline ? new Date(item.deadline).toLocaleDateString("pt-BR") : "A definir"}</span></td>
                          <td className="py-2 px-1 text-center"><button type="button" onClick={() => setSelectedDetailItem(item)} className="p-1 text-[#475569] hover:text-[#0B5FEA] hover:bg-[#EFF6FF] rounded-md transition-colors" title="Ver detalhes"><Eye className="h-4 w-4" /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* PAGINAÇÃO */}
              <div className="p-4 border-t border-[#DCE2EA] bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-[#475569]">Página {workItemsQuery.data?.pagination.page || 1} de {workItemsQuery.data?.pagination.totalPages || 1}</span>
                <div className="flex items-center gap-1">
                  <button type="button" disabled={(workItemsQuery.data?.pagination.page || 1) <= 1} onClick={() => setFilters((prev) => ({ ...prev, page: 1 }))} className="p-1.5 border border-[#DCE2EA] rounded-md text-[#475569] hover:bg-white disabled:opacity-40"><ChevronsLeft className="h-4 w-4" /></button>
                  <button type="button" disabled={(workItemsQuery.data?.pagination.page || 1) <= 1} onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))} className="p-1.5 border border-[#DCE2EA] rounded-md text-[#475569] hover:bg-white disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
                  {Array.from({ length: Math.min(5, workItemsQuery.data?.pagination.totalPages || 1) }).map((_, idx) => { const pNum = idx + 1; const isActive = pNum === (workItemsQuery.data?.pagination.page || 1); return <button key={pNum} type="button" onClick={() => setFilters((prev) => ({ ...prev, page: pNum }))} className={`h-8 w-8 rounded-md text-xs font-semibold ${isActive ? "bg-[#0B5FEA] text-white shadow-2xs" : "border border-[#DCE2EA] text-[#475569] hover:bg-white"}`}>{pNum}</button>; })}
                  <button type="button" disabled={(workItemsQuery.data?.pagination.page || 1) >= (workItemsQuery.data?.pagination.totalPages || 1)} onClick={() => setFilters((prev) => ({ ...prev, page: Math.min(workItemsQuery.data?.pagination.totalPages || 1, (prev.page || 1) + 1) }))} className="p-1.5 border border-[#DCE2EA] rounded-md text-[#475569] hover:bg-white disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
                </div>
              </div>
            </div>

            {/* COLUNA DA DIREITA (35% -> 4 de 12 colunas) */}
            <div className="lg:col-span-4 space-y-6">
              {/* CARTÃO 1: DISTRIBUIÇÃO POR SITUAÇÃO */}
              <div className="bg-white border border-[#DCE2EA] rounded-xl p-4 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold text-[#0F172A] flex items-center gap-2"><FileSpreadsheet className="h-4 w-4 text-[#0B5FEA]" /><span>Distribuição por situação</span></h3>
                {distributionQuery.isLoading ? <div className="h-[140px] flex items-center justify-center"><div className="h-24 w-24 rounded-full border-4 border-[#D9DDE3] border-t-[#0B5FEA] animate-spin" /></div> : (
                  <div className="flex items-center gap-4">
                    <div className="h-[130px] w-[130px] relative shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart><Pie data={distributionQuery.data?.items} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="count">{distributionQuery.data?.items.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.colorToken} />)}</Pie><RechartsTooltip /></PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-0 text-[11px]">
                      {distributionQuery.data?.items.map((item) => (<div key={item.status} className="flex items-center justify-between gap-1"><span className="flex items-center gap-1.5 truncate text-[#475569]"><span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.colorToken }} /><span className="truncate">{item.label}</span></span><span className="font-semibold text-[#0F172A]">{item.percentage}%</span></div>))}
                    </div>
                  </div>
                )}
              </div>

              {/* CARTÃO 2: PRAZOS E ALERTAS */}
              <div className="bg-white border border-[#DCE2EA] rounded-xl p-4 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold text-[#0F172A] flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-[#EA7A00]" /><span>Prazos e alertas</span></h3>
                {alertsQuery.isLoading ? <div className="space-y-3"><div className="h-10 bg-[#D9DDE3] rounded-md animate-pulse" /><div className="h-10 bg-[#D9DDE3] rounded-md animate-pulse" /></div> : alertsQuery.data?.alerts.length === 0 ? <p className="text-xs text-[#475569]">Nenhum alerta pendente.</p> : (
                  <div className="space-y-2.5">{alertsQuery.data?.alerts.map((alert) => (<div key={alert.id} className="p-2.5 bg-[#FFFBEB] border border-[#FCD34D]/40 rounded-lg text-xs space-y-0.5"><div className="flex items-center justify-between"><span className="font-mono font-bold text-[#0B5FEA]">{alert.workItemCode}</span><span className="text-[10px] font-semibold uppercase text-[#DC2626]">{alert.type}</span></div><p className="font-semibold text-[#0F172A] truncate">{alert.title}</p><p className="text-[11px] text-[#475569]">{alert.message}</p></div>))}</div>
                )}
              </div>

              {/* CARTÃO 3: ATIVIDADES RECENTES */}
              <div className="bg-white border border-[#DCE2EA] rounded-xl p-4 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold text-[#0F172A] flex items-center gap-2"><Clock className="h-4 w-4 text-[#0B5FEA]" /><span>Atividades recentes</span></h3>
                {activitiesQuery.isLoading ? <div className="space-y-3"><div className="h-8 bg-[#D9DDE3] rounded-md animate-pulse" /><div className="h-8 bg-[#D9DDE3] rounded-md animate-pulse" /></div> : (
                  <div className="space-y-3">{activitiesQuery.data?.activities.map((act) => (<div key={act.id} className="flex gap-2.5 text-xs"><div className="h-6 w-6 rounded-full bg-[#EFF6FF] text-[#0B5FEA] flex items-center justify-center shrink-0 text-[10px] font-bold">{act.userName.charAt(0)}</div><div className="space-y-0.5 min-w-0 flex-1"><p className="text-[#0F172A]"><strong className="font-semibold">{act.userName}</strong> {act.action} em <span className="font-mono text-[#0B5FEA] font-bold">{act.targetCode}</span></p><span className="text-[10px] text-[#94A3B8] block">{act.timestamp}</span></div></div>))}
                  </div>
                )}
              </div>

              {/* CARTÃO 4: PROGRESSO DOS PROJETOS */}
              <div className="bg-white border border-[#DCE2EA] rounded-xl p-4 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold text-[#0F172A] flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[#059669]" /><span>Progresso dos projetos</span></h3>
                {projectProgressQuery.isLoading ? <div className="space-y-3"><div className="h-4 bg-[#D9DDE3] rounded-md animate-pulse" /><div className="h-4 bg-[#D9DDE3] rounded-md animate-pulse" /></div> : (
                  <div className="space-y-3">{projectProgressQuery.data?.projects.map((proj: any) => (<div key={proj.id} className="space-y-1"><div className="flex items-center justify-between text-xs"><span className="font-semibold text-[#0F172A] truncate max-w-[180px]">{proj.name}</span><span className="text-[11px] font-bold text-[#059669]">{proj.progressPercentage}%</span></div><div className="w-full bg-[#E2E8F0] rounded-full h-1.5 overflow-hidden"><div className="bg-[#059669] h-1.5 rounded-full" style={{ width: `${proj.progressPercentage}%` }} /></div></div>))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────── */}
        {/* VIEW: LISTA (tabela full-width, mais colunas, sem sidebar) */}
        {/* ─────────────────────────────────────────────────────────── */}
        {viewMode === "list" && (
          <div className="bg-white border border-[#DCE2EA] rounded-xl shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-[#DCE2EA] flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2"><ListIcon className="h-4 w-4 text-[#0B5FEA]" />Lista completa</h2>
              <span className="text-xs text-[#475569]">{workItemsQuery.data?.pagination.total || 0} registros</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#DCE2EA] text-[#475569] font-semibold text-[10px] uppercase">
                    <th className="py-2.5 px-2">Código</th>
                    <th className="py-2.5 px-2">Demanda / Projeto</th>
                    <th className="py-2.5 px-2 text-center">Tipo</th>
                    <th className="py-2.5 px-2">Área Solicitante</th>
                    <th className="py-2.5 px-2">Responsável</th>
                    <th className="py-2.5 px-2 text-center">Prioridade</th>
                    <th className="py-2.5 px-2 text-center">Situação</th>
                    <th className="py-2.5 px-2 text-center">Progresso</th>
                    <th className="py-2.5 px-2 text-center">Prazo</th>
                    <th className="py-2.5 px-2 text-center">Atrasado</th>
                    <th className="py-2.5 px-2 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {workItemsQuery.isLoading ? Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="h-[44px]">{Array.from({ length: 11 }).map((__, j) => <td key={j} className="px-2"><div className="h-3 w-full bg-[#D9DDE3] rounded animate-pulse" /></td>)}</tr>
                  )) : workItemsQuery.data?.items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-2.5 px-2 font-mono font-bold text-[#0B5FEA] cursor-pointer hover:underline" onClick={() => setSelectedDetailItem(item)}>{item.code}</td>
                      <td className="py-2.5 px-2">
                        <div className="font-semibold text-[#0F172A] cursor-pointer hover:text-[#0B5FEA]" onClick={() => setSelectedDetailItem(item)}>{item.title}</div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          {item.project && <span className="text-[9px] text-[#0B5FEA] font-bold">{item.project.name}</span>}
                          {item.files && item.files.length > 0 && <span className="text-[9px] font-bold text-[#0B5FEA] bg-[#EFF6FF] px-1 py-0.2 rounded border border-[#BFDBFE]">📎 {item.files.length} doc(s)</span>}
                          {item.hasBudget && item.budgetValue ? <span className="text-[9px] font-bold text-[#059669] bg-[#ECFDF5] px-1 py-0.2 rounded border border-[#A7F3D0]">💰 R$ {(item.budgetValue / 1000).toFixed(0)}k</span> : <span className="text-[9px] text-[#94A3B8] bg-[#F8FAFC] px-1 py-0.2 rounded border border-[#E2E8F0]">Sem orç.</span>}
                          {item.approvedBy ? <span className="text-[9px] font-bold text-[#7C3AED] bg-[#F5F3FF] px-1 py-0.2 rounded border border-[#DDD6FE]">✓ Aprovado: {typeof item.approvedBy === "string" ? item.approvedBy.split(" ")[0] : item.approvedBy.name}</span> : null}
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center"><span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F1F5F9] text-[#475569] border border-[#DCE2EA] uppercase">{item.type}</span></td>
                      <td className="py-2.5 px-2 text-[#475569] truncate max-w-[120px]">{item.requestingArea.name}</td>
                      <td className="py-2.5 px-2 text-[#0F172A] truncate max-w-[120px]">{item.assignee?.name || <span className="text-[#94A3B8]">—</span>}</td>
                      <td className="py-2.5 px-2 text-center"><span className="font-bold text-[10px]" style={{ color: PRIORITY_COLORS[item.priority.code] || "#475569" }}>{item.priority.label}</span></td>
                      <td className="py-2.5 px-2 text-center"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: STATUS_COLORS[item.status.code] || "#64748B" }}>{item.status.label}</span></td>
                      <td className="py-2.5 px-2 text-center">
                        <div className="flex items-center gap-1.5 justify-center">
                          <div className="w-16 bg-[#E2E8F0] rounded-full h-1.5 overflow-hidden"><div className="bg-[#059669] h-1.5 rounded-full" style={{ width: `${item.progress.percentage}%` }} /></div>
                          <span className="text-[10px] font-bold text-[#475569] w-8">{item.progress.percentage}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center text-[10px] text-[#475569] whitespace-nowrap">{item.deadline ? new Date(item.deadline).toLocaleDateString("pt-BR") : "—"}</td>
                      <td className="py-2.5 px-2 text-center">{item.overdue ? <span className="px-1.5 py-0.5 rounded bg-[#FEF2F2] text-[#DC2626] text-[10px] font-bold border border-[#DC2626]/20">Sim</span> : <span className="text-[#94A3B8] text-[10px]">Não</span>}</td>
                      <td className="py-2.5 px-2 text-center"><button type="button" onClick={() => setSelectedDetailItem(item)} className="p-1 text-[#475569] hover:text-[#0B5FEA] hover:bg-[#EFF6FF] rounded-md transition-colors" title="Ver detalhes"><Eye className="h-4 w-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* PAGINAÇÃO */}
            <div className="p-4 border-t border-[#DCE2EA] bg-[#F8FAFC] flex items-center justify-between">
              <span className="text-xs text-[#475569]">Página {workItemsQuery.data?.pagination.page || 1} de {workItemsQuery.data?.pagination.totalPages || 1}</span>
              <div className="flex items-center gap-1">
                <button type="button" disabled={(workItemsQuery.data?.pagination.page || 1) <= 1} onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))} className="p-1.5 border border-[#DCE2EA] rounded-md text-[#475569] hover:bg-white disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
                <button type="button" disabled={(workItemsQuery.data?.pagination.page || 1) >= (workItemsQuery.data?.pagination.totalPages || 1)} onClick={() => setFilters((prev) => ({ ...prev, page: Math.min(workItemsQuery.data?.pagination.totalPages || 1, (prev.page || 1) + 1) }))} className="p-1.5 border border-[#DCE2EA] rounded-md text-[#475569] hover:bg-white disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────── */}
        {/* VIEW: QUADRO / KANBAN — colunas por status                 */}
        {/* ─────────────────────────────────────────────────────────── */}
        {viewMode === "kanban" && (() => {
          const STATUS_COLS = [
            { code: "recebida",   label: "Aguardando",   color: "#64748B", bg: "#F1F5F9" },
            { code: "triagem",    label: "Triagem",      color: "#7C3AED", bg: "#F5F3FF" },
            { code: "em_analise",  label: "Em Análise",   color: "#0B5FEA", bg: "#EFF6FF" },
            { code: "em_execucao", label: "Em Execução",  color: "#059669", bg: "#ECFDF5" },
            { code: "concluida",  label: "Concluído",    color: "#10B981", bg: "#D1FAE5" },
          ];
          const items = workItemsQuery.data?.items || [];
          return (
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-4 min-w-[900px]">
                {STATUS_COLS.map((col) => {
                  const colItems = items.filter((i) => i.status.code === col.code);
                  return (
                    <div key={col.code} className="flex-1 min-w-[180px] max-w-[260px]">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                          <span className="text-xs font-bold" style={{ color: col.color }}>{col.label}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: col.bg, color: col.color }}>{colItems.length}</span>
                      </div>
                      <div className="flex flex-col gap-2.5 min-h-[200px]">
                        {workItemsQuery.isLoading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-[#D9DDE3] rounded-xl animate-pulse" />) :
                          colItems.length === 0 ? <div className="flex items-center justify-center h-20 border-2 border-dashed border-[#E2E8F0] rounded-xl text-[10px] text-[#94A3B8]">Vazio</div> :
                          colItems.map((item) => (
                            <div key={item.id} className="bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-2xs hover:shadow-md transition-shadow cursor-pointer group" onClick={() => setSelectedDetailItem(item)}>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <span className="font-mono text-[10px] font-bold text-[#0B5FEA]">{item.code}</span>
                                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[item.priority.code] + "20", color: PRIORITY_COLORS[item.priority.code] }}>{item.priority.label}</span>
                              </div>
                              <p className="text-[11px] font-semibold text-[#0F172A] line-clamp-2 mb-2">{item.title}</p>
                              <div className="flex items-center justify-between text-[10px] text-[#475569]">
                                <span className="truncate max-w-[100px]">{item.assignee?.name || "Sem responsável"}</span>
                                <span className={item.overdue ? "text-[#DC2626] font-bold" : ""}>{item.deadline ? new Date(item.deadline).toLocaleDateString("pt-BR") : "—"}</span>
                              </div>
                              <div className="mt-2">
                                <div className="w-full bg-[#E2E8F0] rounded-full h-1 overflow-hidden"><div style={{ width: `${item.progress.percentage}%`, backgroundColor: col.color }} className="h-1 rounded-full" /></div>
                                <span className="text-[9px] text-[#475569]">{item.progress.percentage}%</span>
                              </div>
                              <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedDetailItem(item); }} className="mt-2 w-full text-[10px] font-bold text-[#0B5FEA] hover:underline opacity-0 group-hover:opacity-100 transition text-left">Ver detalhes →</button>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* ─────────────────────────────────────────────────────────── */}
        {/* VIEW: CRONOGRAMA — barras de prazo/progresso por item      */}
        {/* ─────────────────────────────────────────────────────────── */}
        {viewMode === "gantt" && (
          <div className="bg-white border border-[#DCE2EA] rounded-xl shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-[#DCE2EA] flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2"><CalendarRange className="h-4 w-4 text-[#0B5FEA]" />Cronograma de demandas e projetos</h2>
              <span className="text-xs text-[#475569]">Exibindo {workItemsQuery.data?.items.length || 0} itens</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#DCE2EA] text-[#475569] font-semibold text-[10px] uppercase">
                    <th className="py-2.5 px-3 w-28">Código</th>
                    <th className="py-2.5 px-3">Demanda / Projeto</th>
                    <th className="py-2.5 px-3 w-24 text-center">Situação</th>
                    <th className="py-2.5 px-3 w-24 text-center">Responsável</th>
                    <th className="py-2.5 px-3 w-24 text-center">Prazo</th>
                    <th className="py-2.5 px-3">Progresso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {workItemsQuery.isLoading ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="h-[52px]">{Array.from({ length: 6 }).map((__, j) => <td key={j} className="px-3"><div className="h-3 w-full bg-[#D9DDE3] rounded animate-pulse" /></td>)}</tr>
                  )) : workItemsQuery.data?.items.map((item) => {
                    const pct = item.progress?.percentage ?? 0;
                    const isOverdue = item.overdue;
                    const barColor = isOverdue ? "#DC2626" : pct >= 80 ? "#059669" : pct >= 50 ? "#0B5FEA" : "#EA7A00";
                    return (
                      <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors group cursor-pointer" onClick={() => setSelectedDetailItem(item)}>
                        <td className="py-3 px-3 font-mono font-bold text-[#0B5FEA]">{item.code}</td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-[#0F172A]">{item.title}</div>
                          {item.project && <span className="text-[9px] text-[#0B5FEA]">{item.project.name}</span>}
                        </td>
                        <td className="py-3 px-3 text-center"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: STATUS_COLORS[item.status.code] || "#64748B" }}>{item.status.label}</span></td>
                        <td className="py-3 px-3 text-center text-[#475569] truncate max-w-[100px]">{item.assignee?.name || "—"}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`text-[10px] font-semibold ${isOverdue ? "text-[#DC2626] font-bold" : "text-[#475569]"}`}>
                            {item.deadline ? new Date(item.deadline).toLocaleDateString("pt-BR") : "A definir"}
                          </span>
                          {isOverdue && <span className="block text-[9px] text-[#DC2626] font-bold">ATRASADO</span>}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-[#E2E8F0] rounded-full h-3 overflow-hidden relative">
                              <div className="h-3 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white mix-blend-multiply">{pct > 15 ? `${pct}%` : ""}</span>
                            </div>
                            <span className="text-[10px] font-bold w-8 text-right" style={{ color: barColor }}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* PAGINAÇÃO */}
            <div className="p-4 border-t border-[#DCE2EA] bg-[#F8FAFC] flex items-center justify-between">
              <span className="text-xs text-[#475569]">Página {workItemsQuery.data?.pagination.page || 1} de {workItemsQuery.data?.pagination.totalPages || 1}</span>
              <div className="flex items-center gap-1">
                <button type="button" disabled={(workItemsQuery.data?.pagination.page || 1) <= 1} onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))} className="p-1.5 border border-[#DCE2EA] rounded-md text-[#475569] hover:bg-white disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
                <button type="button" disabled={(workItemsQuery.data?.pagination.page || 1) >= (workItemsQuery.data?.pagination.totalPages || 1)} onClick={() => setFilters((prev) => ({ ...prev, page: Math.min(workItemsQuery.data?.pagination.totalPages || 1, (prev.page || 1) + 1) }))} className="p-1.5 border border-[#DCE2EA] rounded-md text-[#475569] hover:bg-white disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL / GAVETA DE CRIAR NOVA DEMANDA                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-[#DCE2EA] flex items-center justify-between bg-[#F8FAFC]">
              <h3 className="text-sm font-bold text-[#0F172A]">Cadastrar Nova Demanda</h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#0F172A]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCreate(onSubmitCreate)} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#0F172A]">Título da solicitação *</label>
                <input
                  type="text"
                  {...registerCreate("title")}
                  placeholder="Ex: Reforma da Praça Central"
                  className="w-full h-9 px-3 border border-[#DCE2EA] rounded-md text-xs focus:outline-hidden focus:border-[#0B5FEA]"
                />
                {createErrors.title && (
                  <span className="text-[10px] text-[#DC2626]">{createErrors.title.message}</span>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0F172A]">Descrição detalhada</label>
                <textarea
                  {...registerCreate("description")}
                  rows={3}
                  placeholder="Informe o escopo e justificativa técnica..."
                  className="w-full p-3 border border-[#DCE2EA] rounded-md text-xs focus:outline-hidden focus:border-[#0B5FEA]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#0F172A]">Tipo de Entrada *</label>
                  <select
                    {...registerCreate("type")}
                    disabled
                    className="w-full h-9 px-3 border border-[#DCE2EA] rounded-md text-xs bg-[#F1F5F9] text-[#0F172A] font-semibold"
                  >
                    <option value="demanda">Demanda (Solicitação Inicial)</option>
                  </select>
                  <p className="text-[10px] text-[#0B5FEA]">
                    Toda solicitação nasce como Demanda e torna-se Projeto após parecer favorável.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#0F172A]">Prioridade *</label>
                  <select
                    {...registerCreate("priority")}
                    className="w-full h-9 px-3 border border-[#DCE2EA] rounded-md text-xs focus:outline-hidden focus:border-[#0B5FEA]"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#0F172A]">Área Solicitante *</label>
                  <select
                    {...registerCreate("requestingAreaId")}
                    className="w-full h-9 px-3 border border-[#DCE2EA] rounded-md text-xs focus:outline-hidden focus:border-[#0B5FEA]"
                  >
                    {optionsQuery.data?.requestingAreas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#0F172A]">Prazo Estimado</label>
                  <input
                    type="date"
                    {...registerCreate("deadline")}
                    className="w-full h-9 px-3 border border-[#DCE2EA] rounded-md text-xs focus:outline-hidden focus:border-[#0B5FEA]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#DCE2EA] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-[#DCE2EA] rounded-md text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 bg-[#0B5FEA] text-white rounded-md text-xs font-semibold hover:bg-[#0952CD] disabled:opacity-50"
                >
                  {isCreating ? "Salvando..." : "Salvar demanda"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL DE CADASTRO DE NOVA DEMANDA                             */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 border border-[#DCE2EA]">
            <div className="px-6 py-4 border-b border-[#DCE2EA] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-[#0B5FEA]" />
                <h3 className="text-sm font-bold text-[#0F172A]">Cadastrar Nova Demanda</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#0F172A] p-1 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCreate(onSubmitCreate)} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#0F172A]">Título da solicitação *</label>
                <input
                  type="text"
                  {...registerCreate("title")}
                  placeholder="Ex: Implantação de Iluminação LED na Av. Principal"
                  className="w-full h-9 px-3 border border-[#DCE2EA] rounded-md text-xs focus:outline-hidden focus:border-[#0B5FEA]"
                />
                {createErrors.title && (
                  <span className="text-[10px] text-[#DC2626]">{createErrors.title.message}</span>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0F172A]">Descrição detalhada</label>
                <textarea
                  {...registerCreate("description")}
                  rows={3}
                  placeholder="Informe o escopo e justificativa técnica da demanda..."
                  className="w-full p-3 border border-[#DCE2EA] rounded-md text-xs focus:outline-hidden focus:border-[#0B5FEA]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#0F172A]">Tipo de Entrada *</label>
                  <select
                    {...registerCreate("type")}
                    disabled
                    className="w-full h-9 px-3 border border-[#DCE2EA] rounded-md text-xs bg-[#F1F5F9] text-[#0F172A] font-semibold"
                  >
                    <option value="demanda">Demanda (Solicitação Inicial)</option>
                  </select>
                  <p className="text-[10px] text-[#0B5FEA]">
                    Toda solicitação nasce como Demanda e torna-se Projeto após parecer favorável.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#0F172A]">Prioridade *</label>
                  <select
                    {...registerCreate("priority")}
                    className="w-full h-9 px-3 border border-[#DCE2EA] rounded-md text-xs focus:outline-hidden focus:border-[#0B5FEA]"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#0F172A]">Área Solicitante *</label>
                  <select
                    {...registerCreate("requestingAreaId")}
                    className="w-full h-9 px-3 border border-[#DCE2EA] rounded-md text-xs focus:outline-hidden focus:border-[#0B5FEA]"
                  >
                    {optionsQuery.data?.requestingAreas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#0F172A]">Prazo Estimado</label>
                  <input
                    type="date"
                    {...registerCreate("deadline")}
                    className="w-full h-9 px-3 border border-[#DCE2EA] rounded-md text-xs focus:outline-hidden focus:border-[#0B5FEA]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#DCE2EA] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-[#DCE2EA] rounded-md text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 bg-[#0B5FEA] text-white rounded-md text-xs font-semibold hover:bg-[#0952CD] disabled:opacity-50 shadow-2xs"
                >
                  {isCreating ? "Salvando..." : "Salvar Demanda"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL DE DETALHES DA DEMANDA OU PROJETO                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      {selectedDetailItem && (

        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-[#DCE2EA] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[#0B5FEA] text-sm">
                  {selectedDetailItem.code}
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-white"
                  style={{
                    backgroundColor:
                      STATUS_COLORS[selectedDetailItem.status.code] || "#64748B",
                  }}
                >
                  {selectedDetailItem.status.label}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailItem(null)}
                className="text-[#94A3B8] hover:text-[#0F172A]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">
                  {selectedDetailItem.title}
                </h3>
                {selectedDetailItem.project && (
                  <p className="text-xs text-[#0B5FEA] font-medium mt-0.5">
                    Projeto relacionado: {selectedDetailItem.project.name} (
                    {selectedDetailItem.project.code})
                  </p>
                )}
              </div>

              {selectedDetailItem.description && (
                <div className="p-3 bg-[#F8FAFC] rounded-md border border-[#DCE2EA]">
                  <p className="font-semibold text-[#0F172A] mb-1">Descrição</p>
                  <p className="text-[#475569]">{selectedDetailItem.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-[#F8FAFC] p-3 rounded-md border border-[#DCE2EA]">
                <div>
                  <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">
                    Tipo
                  </span>
                  <span className="font-semibold text-[#0F172A] uppercase">
                    {selectedDetailItem.type}
                  </span>
                </div>
                <div>
                  <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">
                    Área Solicitante
                  </span>
                  <span className="font-semibold text-[#0F172A]">
                    {selectedDetailItem.requestingArea.name}
                  </span>
                </div>
                <div>
                  <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">
                    Responsável
                  </span>
                  <span className="font-semibold text-[#0F172A]">
                    {selectedDetailItem.assignee?.name || "Sem responsável"}
                  </span>
                </div>
                <div>
                  <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">
                    Prioridade
                  </span>
                  <span className="font-semibold text-[#0F172A]">
                    {selectedDetailItem.priority.label}
                  </span>
                </div>
                <div>
                  <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">
                    Prazo
                  </span>
                  <span
                    className={`font-semibold ${
                      selectedDetailItem.overdue ? "text-[#DC2626]" : "text-[#0F172A]"
                    }`}
                  >
                    {selectedDetailItem.deadline
                      ? new Date(selectedDetailItem.deadline).toLocaleDateString("pt-BR")
                      : "A definir"}
                  </span>
                </div>
                <div>
                  <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">
                    Nível de Risco
                  </span>
                  <span className="font-semibold text-[#0F172A] capitalize">
                    {selectedDetailItem.riskLevel || "Baixo"}
                  </span>
                </div>
              </div>

              {/* CARD: DOTAÇÃO ORÇAMENTÁRIA & APROVAÇÃO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#F8FAFC] border border-[#DCE2EA] rounded-xl text-xs">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#0F172A]">
                    <Wallet className="h-4 w-4 text-[#008B63]" />
                    <span className="uppercase text-[10px] text-[#64748B]">Dotação Orçamentária</span>
                  </div>
                  <span className="font-extrabold text-[#0F172A]">
                    {selectedDetailItem.hasBudget || (selectedDetailItem.budgetValue && selectedDetailItem.budgetValue > 0)
                      ? `Sim — R$ ${(selectedDetailItem.budgetValue || 480000).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                      : "Não possui orçamento previsto"}
                  </span>
                  <span className="text-[10px] text-[#64748B]">
                    Fonte: {selectedDetailItem.budgetSource || "Dotação Geral / Recursos Municipais"}
                  </span>
                </div>

                <div className="flex flex-col gap-1 border-t sm:border-t-0 sm:border-l border-[#DCE2EA] sm:pl-3 pt-2 sm:pt-0">
                  <div className="flex items-center gap-1.5 font-bold text-[#0F172A]">
                    <CheckCircle2 className="h-4 w-4 text-[#7C3AED]" />
                    <span className="uppercase text-[10px] text-[#64748B]">Aprovação & Homologação</span>
                  </div>
                  <span className="font-extrabold text-[#7C3AED]">
                    {selectedDetailItem.approvedBy
                      ? `Aprovado por: ${typeof selectedDetailItem.approvedBy === "string" ? selectedDetailItem.approvedBy : selectedDetailItem.approvedBy.name}`
                      : "Aguardando Aprovação Formal"}
                  </span>
                  <span className="text-[10px] text-[#64748B]">
                    Data: {selectedDetailItem.approvalDate || "Pendente de emissão"}
                  </span>
                </div>
              </div>

              {/* Barra de Progresso */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold text-[#0F172A]">
                  <span>Progresso Oficial</span>
                  <span>{selectedDetailItem.progress?.percentage || 0}%</span>
                </div>
                <div className="w-full bg-[#E2E8F0] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#059669] h-2 rounded-full"
                    style={{
                      width: `${selectedDetailItem.progress?.percentage || 0}%`,
                    }}
                  />
                </div>
              </div>

              {selectedDetailItem.blocked && (
                <div className="p-3 bg-[#FEF2F2] border border-[#DC2626]/20 rounded-md text-[#DC2626]">
                  <p className="font-bold flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" /> Item Bloqueado
                  </p>
                  <p className="text-[11px] mt-0.5">
                    {selectedDetailItem.blockerReason ||
                      "Aguardando liberação de dependência técnica ou ambiental."}
                  </p>
                </div>
              )}

              {/* SEÇÃO DE DOCUMENTOS TÉCNICOS ANEXADOS REAIS */}
              <div className="pt-4 border-t border-[#DCE2EA] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-[#0B5FEA]" />
                    <span>Documentos Técnicos Anexados</span>
                  </h4>
                  <label className="px-3 py-1 bg-[#EFF6FF] text-[#0B5FEA] hover:bg-[#DBEAFE] rounded-md text-[11px] font-bold cursor-pointer transition flex items-center gap-1">
                    <Plus className="h-3.5 w-3.5" />
                    <span>Anexar Documento</span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => handleDetailFileUpload(selectedDetailItem.id, e)}
                    />
                  </label>
                </div>

                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {(() => {
                    const uploaded = attachedDocsMap[selectedDetailItem.id] || [];
                    const staticDocs = (selectedDetailItem.files || []).map((fn, idx) => ({
                      id: `doc-${selectedDetailItem.id}-${idx}`,
                      name: fn,
                      size: "2.4 MB",
                      url: "#",
                    }));
                    const allDocs = [...uploaded, ...staticDocs.filter((sd) => !uploaded.some((u) => u.name === sd.name))];

                    if (allDocs.length === 0) {
                      return (
                        <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-center text-[#64748B] text-[11px]">
                          Nenhum documento técnico anexado a esta solicitação. Clique em "Anexar Documento" acima para fazer upload.
                        </div>
                      );
                    }

                    return allDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs hover:bg-[#F1F5F9] transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="h-4 w-4 text-[#0B5FEA] shrink-0" />
                          <div className="truncate">
                            <span className="font-semibold text-[#0F172A] block truncate">{doc.name}</span>
                            <span className="text-[10px] text-[#64748B] block">{doc.size}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              if (doc.url && doc.url !== "#") {
                                window.open(doc.url, "_blank");
                              } else {
                                alert(`Visualizando documento anexado: ${doc.name}`);
                              }
                            }}
                            className="px-2.5 py-1 bg-white border border-[#DCE2EA] text-[#0F172A] hover:bg-[#F8FAFC] rounded-md text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Eye className="h-3 w-3 text-[#0B5FEA]" />
                            <span>Visualizar</span>
                          </button>

                          <a
                            href={doc.url}
                            download={doc.name}
                            className="px-2.5 py-1 bg-[#008B63] hover:bg-[#007553] text-white rounded-md text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Download className="h-3 w-3" />
                            <span>Baixar</span>
                          </a>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>


              <div className="pt-4 border-t border-[#DCE2EA] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {selectedDetailItem.type === "demanda" && selectedDetailItem.status.code === "recebida" && (
                    <button
                      type="button"
                      onClick={() => handleTransition("triagem")}
                      className="px-3 py-1.5 bg-[#7C3AED] text-white rounded-md text-xs font-semibold hover:bg-[#6D28D9]"
                    >
                      Encaminhar para Triagem
                    </button>
                  )}
                  {selectedDetailItem.type === "demanda" && selectedDetailItem.status.code === "triagem" && (
                    <button
                      type="button"
                      onClick={() => handleTransition("em_analise")}
                      className="px-3 py-1.5 bg-[#0B5FEA] text-white rounded-md text-xs font-semibold hover:bg-[#0952CD]"
                    >
                      Iniciar Análise Técnica
                    </button>
                  )}
                  {selectedDetailItem.type === "demanda" && selectedDetailItem.status.code === "em_analise" && (
                    <button
                      type="button"
                      onClick={() => handleTransition("aprovada")}
                      className="px-3 py-1.5 bg-[#D97706] text-white rounded-md text-xs font-semibold hover:bg-[#B45309]"
                    >
                      Emitir Parecer & Aprovar
                    </button>
                  )}
                  {selectedDetailItem.type === "demanda" &&
                    (selectedDetailItem.status.code === "aprovada" || selectedDetailItem.status.code === "em_analise") && (
                      <button
                        type="button"
                        onClick={handleConvert}
                        disabled={convertToProjectMutation.isPending}
                        className="px-4 py-1.5 bg-[#059669] text-white rounded-md text-xs font-semibold hover:bg-[#047857] flex items-center gap-1.5 shadow-2xs"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Converter em Projeto (PRJ-XXXX)</span>
                      </button>
                    )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDetailItem(null)}
                  className="px-4 py-2 border border-[#DCE2EA] rounded-md text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC]"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL DE RELATÓRIO EXECUTIVO PDF (PRONTO PARA APRESENTAÇÃO)  */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showPdfModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 overflow-y-auto print:p-0 print:bg-white print:static">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-[#DCE2EA] animate-in fade-in zoom-in-95 print:shadow-none print:border-none print:max-w-none print:max-h-none">
            
            {/* Barra de Ações do Relatório (Oculta ao Imprimir) */}
            <div className="px-6 py-4 border-b border-[#DCE2EA] flex items-center justify-between bg-[#F8FAFC] sticky top-0 z-10 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#0B5FEA]" />
                <h3 className="text-sm font-bold text-[#0F172A]">Relatório Executivo para Apresentação</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#008B63] hover:bg-[#007553] text-white rounded-md text-xs font-bold transition flex items-center gap-2 shadow-2xs cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>Imprimir / Salvar como PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPdfModal(false)}
                  className="text-[#94A3B8] hover:text-[#0F172A] p-1 rounded-md"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Conteúdo Imprimível com Marca do Sistema */}
            <div className="p-8 space-y-6 text-xs text-[#0F172A] print:p-6 bg-white" id="printable-executive-report">
              
              {/* CABEÇALHO DA APRESENTAÇÃO COM LOGO DA APLICAÇÃO */}
              <div className="flex items-center justify-between border-b-2 border-[#0B5FEA] pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-[#0B5FEA] rounded-xl flex items-center justify-center text-white font-black text-lg shadow-xs">
                    cP
                  </div>
                  <div>
                    <h1 className="text-xl font-extrabold text-[#06284F] tracking-tight flex items-center gap-2">
                      campanha<span className="text-[#00A978]">PRO</span>
                    </h1>
                    <p className="text-[11px] font-semibold text-[#64748B]">
                      Sistema Executivo de Gestão Pública & Eleitoral
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-[#EFF6FF] text-[#0B5FEA] border border-[#0B5FEA]/30 rounded-full font-bold text-[11px] uppercase tracking-wider mb-1">
                    Relatório Executivo Oficial
                  </span>
                  <p className="text-[10px] text-[#64748B]">
                    Emissão: {new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>

              {/* TÍTULO E SUBTÍTULO DA APRESENTAÇÃO */}
              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">
                  Acompanhamento de Demandas e Projetos
                </h2>
                <p className="text-xs text-[#475569]">
                  Relatório executivo consolidado com indicadores de andamento, prioridades, responsáveis e progresso.
                </p>
              </div>

              {/* INDICADORES CHAVE (KPIS) DA APRESENTAÇÃO */}
              <div className="grid grid-cols-6 gap-3">
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-center">
                  <span className="block text-[10px] font-bold text-[#64748B] uppercase">Total</span>
                  <span className="text-lg font-black text-[#0F172A]">{summaryQuery.data?.totalDemands ?? 0}</span>
                </div>
                <div className="p-3 bg-[#EFF6FF] border border-[#0B5FEA]/20 rounded-lg text-center">
                  <span className="block text-[10px] font-bold text-[#0B5FEA] uppercase">Em Andamento</span>
                  <span className="text-lg font-black text-[#0B5FEA]">{summaryQuery.data?.inProgress ?? 0}</span>
                </div>
                <div className="p-3 bg-[#ECFDF5] border border-[#059669]/20 rounded-lg text-center">
                  <span className="block text-[10px] font-bold text-[#059669] uppercase">Concluídos</span>
                  <span className="text-lg font-black text-[#059669]">{summaryQuery.data?.completed ?? 0}</span>
                </div>
                <div className="p-3 bg-[#FEF2F2] border border-[#DC2626]/20 rounded-lg text-center">
                  <span className="block text-[10px] font-bold text-[#DC2626] uppercase">Atrasados</span>
                  <span className="text-lg font-black text-[#DC2626]">{summaryQuery.data?.overdue ?? 0}</span>
                </div>
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-center">
                  <span className="block text-[10px] font-bold text-[#475569] uppercase">Aguardando</span>
                  <span className="text-lg font-black text-[#475569]">{summaryQuery.data?.waitingStart ?? 0}</span>
                </div>
                <div className="p-3 bg-[#FFF7ED] border border-[#EA7A00]/20 rounded-lg text-center">
                  <span className="block text-[10px] font-bold text-[#EA7A00] uppercase">Em Risco</span>
                  <span className="text-lg font-black text-[#EA7A00]">{summaryQuery.data?.blockedOrAtRisk ?? 0}</span>
                </div>
              </div>

              {/* TABELA DE REGISTROS DA APRESENTAÇÃO */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider border-b border-[#E2E8F0] pb-1">
                  Quadro Geral das Solicitações ({workItemsQuery.data?.items.length ?? 0} registros exibidos)
                </h3>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F1F5F9] border-b border-[#CBD5E1] text-[10px] uppercase font-bold text-[#475569]">
                      <th className="py-2 px-2">Código</th>
                      <th className="py-2 px-2">Demanda / Projeto</th>
                      <th className="py-2 px-2">Tipo</th>
                      <th className="py-2 px-2">Área Solicitante</th>
                      <th className="py-2 px-2">Responsável</th>
                      <th className="py-2 px-2">Prioridade</th>
                      <th className="py-2 px-2">Situação</th>
                      <th className="py-2 px-2 text-right">Progresso</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-[11px]">
                    {workItemsQuery.data?.items.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-2.5 px-2 font-mono font-bold text-[#0B5FEA]">{item.code}</td>
                        <td className="py-2.5 px-2 font-semibold text-[#0F172A]">{item.title}</td>
                        <td className="py-2.5 px-2 uppercase font-bold text-[10px] text-[#64748B]">{item.type}</td>
                        <td className="py-2.5 px-2 text-[#475569]">{item.requestingArea.name}</td>
                        <td className="py-2.5 px-2 text-[#475569]">{item.assignee?.name || "—"}</td>
                        <td className="py-2.5 px-2 font-bold text-[#0F172A]">{item.priority.label}</td>
                        <td className="py-2.5 px-2">
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                            style={{ backgroundColor: STATUS_COLORS[item.status.code] || "#64748B" }}
                          >
                            {item.status.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 font-bold text-[#059669] text-right">
                          {item.progress?.percentage ?? 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* RODAPÉ DO RELATÓRIO */}
              <div className="pt-6 border-t border-[#E2E8F0] flex items-center justify-between text-[10px] text-[#64748B]">
                <p>Documento gerado automaticamente pelo módulo de Demandas e Projetos • campanhaPRO</p>
                <p>Status: Pronto para Apresentação Executiva</p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

