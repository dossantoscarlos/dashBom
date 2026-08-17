import {
  WorkItem,
  WorkItemFilters,
  ExecutiveSummary,
  StatusDistributionResponse,
  WorkItemAlertsResponse,
  RecentActivitiesResponse,
  ProjectProgressResponse,
  PaginatedWorkItemsResponse,
  CreateDemandaInput,
  WorkItemStatus,
  AuditActivity,
} from "../domain/demandas-projetos-types";


// BANCO DE DADOS EM MEMÓRIA / SEED REAL DO CONTEXTO DE GESTÃO PÚBLICA
const dbWorkItems: WorkItem[] = [
  {
    id: "wi-101",
    code: "DEM-2026-0104",
    title: "Implantação de Iluminação LED na Av. Principal",
    description: "Substituição de luminárias antigas por LED de alta eficiência energética.",
    type: "demanda",
    requestingArea: { id: "area-infra", name: "Infraestrutura" },
    assignee: { id: "user-ana", name: "Ana Martins", email: "ana.martins@gov.br" },
    priority: { code: "alta", label: "ALTA", colorToken: "#EA7A00" },
    status: { code: "em_analise", label: "Em Análise", colorToken: "#0B5FEA" },
    progress: { percentage: 40, completedMilestones: 2, totalMilestones: 5 },
    deadline: "2026-09-15",
    startDate: "2026-08-01",
    overdue: false,
    blocked: false,
    riskLevel: "baixo",
    project: { id: "prj-01", code: "PRJ-2026-0012", name: "Modernização Urbana 2026" },
    files: ["memorial_descritivo_iluminacao.pdf", "planta_trecho_avenida.dwg"],
    hasBudget: true,
    budgetValue: 185000,
    budgetSource: "Secretaria de Obras & Financiamento BID",
    approvedBy: "Ana Martins (Coordenadora de Projetos)",
    approvalDate: "05/08/2026 10:30",
    permissions: { canView: true, canEdit: true, canAssign: true, canTransition: true, canCancel: true },
    createdAt: "2026-08-01T10:00:00Z",
    updatedAt: "2026-08-12T14:30:00Z",
  },
  {
    id: "wi-102",
    code: "PRJ-2026-0042",
    title: "Reforma da Unidade Básica de Saúde Central",
    description: "Adequação de acessibilidade e ampliação das salas de atendimento.",
    type: "projeto",
    requestingArea: { id: "area-saude", name: "Saúde Pública" },
    assignee: { id: "user-[#0B5FEA]", name: "Carlos Santos", email: "carlos.santos@gov.br" },
    priority: { code: "urgente", label: "URGENTE", colorToken: "#DC2626" },
    status: { code: "em_execucao", label: "Em Execução", colorToken: "#059669" },
    progress: { percentage: 75, completedMilestones: 6, totalMilestones: 8 },
    deadline: "2026-10-30",
    startDate: "2026-05-10",
    overdue: false,
    blocked: false,
    riskLevel: "medio",
    project: { id: "prj-02", code: "PRJ-2026-0042", name: "Reforma UBS Central" },
    files: ["projeto_arquitetonico_ubs.pdf", "alvara_sanitario.pdf", "cronograma_fisico_financeiro.xlsx"],
    hasBudget: true,
    budgetValue: 480000,
    budgetSource: "Fundo Municipal de Saúde",
    approvedBy: "Carlos Santos (Diretor de Infraestrutura Sanitária)",
    approvalDate: "12/05/2026 14:00",
    permissions: { canView: true, canEdit: true, canAssign: true, canTransition: true, canCancel: false },
    createdAt: "2026-05-01T09:00:00Z",
    updatedAt: "2026-08-13T11:00:00Z",
  },
  {
    id: "wi-103",
    code: "DEM-2026-0108",
    title: "Sistema de Coleta Seletiva Bairro Solar",
    description: "Instalação de ecopontos e definição de rotas semanais de recolhimento.",
    type: "demanda",
    requestingArea: { id: "area-meioambiente", name: "Meio Ambiente" },
    assignee: { id: "user-marcos", name: "Marcos Lima", email: "marcos.lima@gov.br" },
    priority: { code: "media", label: "MÉDIA", colorToken: "#0B5FEA" },
    status: { code: "triagem", label: "Triagem", colorToken: "#7C3AED" },
    progress: { percentage: 15, completedMilestones: 1, totalMilestones: 6 },
    deadline: "2026-08-05",
    startDate: "2026-07-20",
    overdue: true,
    blocked: true,
    blockerReason: "Aguardando aprovação de licença ambiental estadual.",
    riskLevel: "alto",
    project: null,
    files: ["estudo_impacto_ambiental.pdf"],
    hasBudget: false,
    budgetValue: 0,
    budgetSource: "Aguardando Alocação Orçamentária",
    approvedBy: null,
    permissions: { canView: true, canEdit: true, canAssign: true, canTransition: true, canCancel: true },
    createdAt: "2026-07-15T08:30:00Z",
    updatedAt: "2026-08-10T16:00:00Z",
  },
  {
    id: "wi-104",
    code: "DEM-2026-0112",
    title: "Capacitação em Governança Digital",
    description: "Treinamento para 150 servidores municipais sobre processos eletrônicos.",
    type: "demanda",
    requestingArea: { id: "area-admin", name: "Administração" },
    assignee: { id: "user-fernanda", name: "Fernanda Costa", email: "fernanda.costa@gov.br" },
    priority: { code: "baixa", label: "BAIXA", colorToken: "#64748B" },
    status: { code: "concluida", label: "Concluído", colorToken: "#10B981" },
    progress: { percentage: 100, completedMilestones: 4, totalMilestones: 4 },
    deadline: "2026-08-01",
    startDate: "2026-06-01",
    overdue: false,
    blocked: false,
    riskLevel: "baixo",
    project: null,
    files: ["plano_pedagogico_treinamento.pdf", "lista_presenca_certificados.pdf"],
    hasBudget: true,
    budgetValue: 35000,
    budgetSource: "Recursos Próprios / Escola de Governo",
    approvedBy: "Fernanda Costa (Secretária de Administração)",
    approvalDate: "28/05/2026 09:15",
    permissions: { canView: true, canEdit: false, canAssign: false, canTransition: false, canCancel: false },
    createdAt: "2026-05-20T11:15:00Z",
    updatedAt: "2026-08-01T17:00:00Z",
  },
  {
    id: "wi-105",
    code: "DEM-2026-0115",
    title: "Aquisição de Equipamentos de Informática para Escolas",
    description: "Compra de 200 computadores para laboratórios pedagógicos.",
    type: "demanda",
    requestingArea: { id: "area-educacao", name: "Educação" },
    assignee: null,
    priority: { code: "alta", label: "ALTA", colorToken: "#EA7A00" },
    status: { code: "recebida", label: "Aguardando Início", colorToken: "#64748B" },
    progress: { percentage: 0, completedMilestones: 0, totalMilestones: 5 },
    deadline: "2026-11-20",
    startDate: null,
    overdue: false,
    blocked: false,
    riskLevel: "baixo",
    project: null,
    files: [],
    hasBudget: false,
    budgetValue: 0,
    budgetSource: "Em Análise de Viabilidade Financeira",
    approvedBy: null,
    permissions: { canView: true, canEdit: true, canAssign: true, canTransition: true, canCancel: true },
    createdAt: "2026-08-11T13:45:00Z",
    updatedAt: "2026-08-11T13:45:00Z",
  },
];

const dbActivities: AuditActivity[] = [
  {

    id: "act-01",
    userId: "user-ana",
    userName: "Ana Martins",
    action: "Emitiu parecer técnico favorável",
    targetId: "wi-101",
    targetCode: "DEM-2026-0104",
    targetTitle: "Implantação de Iluminação LED na Av. Principal",
    timestamp: "Há 15 minutos",
    details: "Situação alterada de Triagem para Em Análise",
  },
  {
    id: "act-02",
    userId: "user-marcos",
    userName: "Marcos Lima",
    action: "Registrou bloqueio por dependência externa",
    targetId: "wi-103",
    targetCode: "DEM-2026-0108",
    targetTitle: "Sistema de Coleta Seletiva Bairro Solar",
    timestamp: "Há 2 horas",
    details: "Aguardando licença da agência reguladora estadual",
  },
  {
    id: "act-03",
    userId: "user-[#0B5FEA]",
    userName: "Carlos Santos",
    action: "Atualizou progresso físico da obra",
    targetId: "wi-102",
    targetCode: "PRJ-2026-0042",
    targetTitle: "Reforma da Unidade Básica de Saúde Central",
    timestamp: "Há 1 dia",
    details: "Conclusão do bloco de instalações hidráulicas (75%)",
  },
];

export class ManagementContextService {
  /**
   * Buscar Resumo Executivo das Métricas (KPIs)
   */
  public static getExecutiveSummary(contextId: string, filters?: WorkItemFilters): ExecutiveSummary {
    const items = this.filterWorkItems(dbWorkItems, filters);

    const totalDemands = items.length;
    const inProgress = items.filter(
      (i) => i.status.code === "em_execucao" || i.status.code === "em_analise" || i.status.code === "triagem"
    ).length;
    const completed = items.filter((i) => i.status.code === "concluida").length;
    const overdue = items.filter((i) => i.overdue).length;
    const waitingStart = items.filter(
      (i) => i.status.code === "recebida" || i.status.code === "rascunho"
    ).length;
    const blockedOrAtRisk = items.filter((i) => i.blocked || i.riskLevel === "alto" || i.riskLevel === "critico").length;

    return {
      totalDemands,
      inProgress,
      completed,
      overdue,
      waitingStart,
      blockedOrAtRisk,
      periodComparisonPercentage: 12.5,
    };
  }

  /**
   * Listagem Paginada de Demandas e Projetos
   */
  public static getWorkItems(contextId: string, filters: WorkItemFilters): PaginatedWorkItemsResponse {
    let items = this.filterWorkItems(dbWorkItems, filters);

    // Ordenação
    const sortBy = filters.sortBy || "createdAt";
    const sortDir = filters.sortDirection || "desc";

    items.sort((a, b) => {
      let valA: any = a[sortBy as keyof WorkItem] || "";
      let valB: any = b[sortBy as keyof WorkItem] || "";

      if (sortBy === "priority") {
        const order = { baixa: 1, media: 2, alta: 3, urgente: 4 };
        valA = order[a.priority.code] || 0;
        valB = order[b.priority.code] || 0;
      }

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    const page = Math.max(1, filters.page || 1);
    const pageSize = Math.max(1, filters.pageSize || 25);
    const total = items.length;
    const totalPages = Math.ceil(total / pageSize) || 1;

    const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize);

    return {
      items: paginatedItems,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  }

  /**
   * Distribuição das Demandas por Situação para o Gráfico Donut
   */
  public static getStatusDistribution(contextId: string, filters?: WorkItemFilters): StatusDistributionResponse {
    const items = this.filterWorkItems(dbWorkItems, filters);
    const total = items.length;

    const counts: Record<string, { label: string; colorToken: string; count: number }> = {
      em_execucao: { label: "Em Execução", colorToken: "#059669", count: 0 },
      em_analise: { label: "Em Análise", colorToken: "#0B5FEA", count: 0 },
      triagem: { label: "Triagem", colorToken: "#7C3AED", count: 0 },
      concluida: { label: "Concluídos", colorToken: "#10B981", count: 0 },
      recebida: { label: "Aguardando Início", colorToken: "#64748B", count: 0 },
    };

    items.forEach((item) => {
      const code = item.status.code;
      if (counts[code]) {
        counts[code].count += 1;
      }
    });

    const result = Object.entries(counts).map(([statusKey, val]) => ({
      status: statusKey as WorkItemStatus,
      label: val.label,
      count: val.count,
      percentage: total > 0 ? Math.round((val.count / total) * 100) : 0,
      colorToken: val.colorToken,
    }));

    return {
      items: result,
      total,
    };
  }

  /**
   * Buscar Prazos e Alertas
   */
  public static getAlerts(contextId: string): WorkItemAlertsResponse {
    const alerts = dbWorkItems
      .filter((i) => i.overdue || i.blocked)
      .map((i) => ({
        id: `alert-${i.id}`,
        workItemId: i.id,
        workItemCode: i.code,
        title: i.title,
        type: i.blocked ? ("blocked" as const) : ("overdue" as const),
        severity: i.blocked ? ("high" as const) : ("medium" as const),
        message: i.blocked ? i.blockerReason || "Item bloqueado" : `Prazo ultrapassado em (${i.deadline})`,
        timestamp: i.updatedAt,
      }));

    return {
      alerts,
      totalCount: alerts.length,
    };
  }

  /**
   * Feed de Atividades Recentes
   */
  public static getRecentActivities(contextId: string): RecentActivitiesResponse {
    return {
      activities: dbActivities,
    };
  }

  /**
   * Progresso Oficial dos Projetos
   */
  public static getProjectProgress(contextId: string): ProjectProgressResponse {
    const projects = dbWorkItems
      .filter((i) => i.type === "projeto" || i.project != null)
      .map((i) => ({
        id: i.id,
        code: i.code,
        name: i.title,
        progressPercentage: i.progress.percentage,
        statusLabel: i.status.label,
        deadline: i.deadline || "A definir",
      }));

    return { projects };
  }

  /**
   * Criar Nova Demanda — Regra de Negócio:
   * Nenhuma solicitação pode ser criada diretamente como Projeto.
   * Toda entrada nasce obrigatoriamente como Demanda (status 'recebida').
   */
  public static createDemanda(contextId: string, input: CreateDemandaInput): WorkItem {
    const count = dbWorkItems.length + 105;
    const code = `DEM-2026-${String(count).padStart(4, "0")}`;

    const newWorkItem: WorkItem = {
      id: `wi-${Date.now()}`,
      code,
      title: input.title,
      description: input.description,
      type: "demanda",
      requestingArea: { id: input.requestingAreaId, name: "Área Solicitante" },
      assignee: input.assigneeId ? { id: input.assigneeId, name: "Responsável Designado" } : null,
      priority: { code: input.priority || "media", label: (input.priority || "media").toUpperCase(), colorToken: "#0B5FEA" },
      status: { code: "recebida", label: "Recebida", colorToken: "#64748B" },
      progress: { percentage: 0, completedMilestones: 0, totalMilestones: 5 },
      deadline: input.deadline || null,
      startDate: new Date().toISOString().split("T")[0],
      overdue: false,
      blocked: false,
      riskLevel: "baixo",
      permissions: { canView: true, canEdit: true, canAssign: true, canTransition: true, canCancel: true },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbWorkItems.unshift(newWorkItem);

    dbActivities.unshift({
      id: `act-${Date.now()}`,
      userId: "user-current",
      userName: "Usuário Autenticado",
      action: "Criou nova Demanda",
      targetId: newWorkItem.id,
      targetCode: newWorkItem.code,
      targetTitle: newWorkItem.title,
      timestamp: "Agora mesmo",
      details: "Status inicial: Recebida",
    });

    return newWorkItem;
  }

  /**
   * Transitar Situação da Demanda
   */
  public static transitionStatus(
    contextId: string,
    workItemId: string,
    newStatus: WorkItemStatus,
    technicalReport?: string
  ): WorkItem {
    const item = dbWorkItems.find((i) => i.id === workItemId);
    if (!item) throw new Error("Demanda não encontrada.");

    const statusLabels: Record<WorkItemStatus, string> = {
      rascunho: "Rascunho",
      recebida: "Recebida",
      triagem: "Triagem",
      em_analise: "Em Análise",
      parecer_tecnico: "Parecer Técnico",
      aprovada: "Aprovada",
      em_execucao: "Em Execução",
      concluida: "Concluída",
      arquivada: "Arquivada",
      cancelada: "Cancelada",
    };

    item.status = {
      code: newStatus,
      label: statusLabels[newStatus] || newStatus,
      colorToken: "#0B5FEA",
    };
    item.updatedAt = new Date().toISOString();

    dbActivities.unshift({
      id: `act-${Date.now()}`,
      userId: "user-current",
      userName: "Usuário Autenticado",
      action: `Alterou situação para ${statusLabels[newStatus]}`,
      targetId: item.id,
      targetCode: item.code,
      targetTitle: item.title,
      timestamp: "Agora mesmo",
      details: technicalReport ? `Parecer técnico: ${technicalReport}` : undefined,
    });

    return item;
  }

  /**
   * Conversão Transacional: Demanda Aprovada ➔ Projeto (PRJ-XXXX)
   */
  public static convertToProject(contextId: string, workItemId: string): WorkItem {
    const demand = dbWorkItems.find((i) => i.id === workItemId);
    if (!demand) throw new Error("Demanda não encontrada.");

    const count = dbWorkItems.length + 200;
    const projectCode = `PRJ-2026-${String(count).padStart(4, "0")}`;

    // Atualizar estado da demanda para Aprovada / Convertida
    demand.status = { code: "aprovada", label: "Aprovada para Projeto", colorToken: "#3B82F6" };

    // Criar o Projeto correspondente
    const newProject: WorkItem = {
      id: `prj-${Date.now()}`,
      code: projectCode,
      title: demand.title,
      description: demand.description,
      type: "projeto",
      requestingArea: demand.requestingArea,
      assignee: demand.assignee,
      priority: demand.priority,
      status: { code: "em_execucao", label: "Em Execução", colorToken: "#059669" },
      progress: { percentage: 0, completedMilestones: 0, totalMilestones: 8 },
      deadline: demand.deadline || "2026-12-31",
      startDate: new Date().toISOString().split("T")[0],
      overdue: false,
      blocked: false,
      riskLevel: "baixo",
      project: { id: `prj-${Date.now()}`, code: projectCode, name: demand.title },
      permissions: { canView: true, canEdit: true, canAssign: true, canTransition: true, canCancel: false },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbWorkItems.unshift(newProject);

    dbActivities.unshift({
      id: `act-${Date.now()}`,
      userId: "user-current",
      userName: "Usuário Autenticado",
      action: `Converteu Demanda ${demand.code} em Projeto ${projectCode}`,
      targetId: newProject.id,
      targetCode: newProject.code,
      targetTitle: newProject.title,
      timestamp: "Agora mesmo",
      details: "Projeto em execução após parecer técnico favorável",
    });

    return newProject;
  }

  /**
   * Utilitário Privado de Filtro
   */
  private static filterWorkItems(items: WorkItem[], filters?: WorkItemFilters): WorkItem[] {
    if (!filters) return [...items];

    return items.filter((item) => {
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesCode = item.code.toLowerCase().includes(query);
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query) || false;
        const matchesType = item.type.toLowerCase().includes(query);
        if (!matchesCode && !matchesTitle && !matchesDesc && !matchesType) return false;

      }

      if (filters.type && filters.type !== "all" && item.type !== filters.type) {
        return false;
      }

      if (filters.status && filters.status !== "all" && item.status.code !== filters.status) {
        return false;
      }

      if (filters.priority && filters.priority !== "all" && item.priority.code !== filters.priority) {
        return false;
      }

      if (
        filters.requestingAreaId &&
        filters.requestingAreaId !== "all" &&
        item.requestingArea.id !== filters.requestingAreaId
      ) {
        return false;
      }

      if (filters.assigneeId && filters.assigneeId !== "all" && item.assignee?.id !== filters.assigneeId) {
        return false;
      }

      return true;
    });
  }
}
