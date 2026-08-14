import { z } from "zod";

export type ViewMode = "overview" | "list" | "kanban" | "gantt";
export type WorkItemType = "demanda" | "projeto" | "iniciativa" | "atividade";

export type WorkItemStatus =
  | "rascunho"
  | "recebida"
  | "triagem"
  | "em_analise"
  | "parecer_tecnico"
  | "aprovada"
  | "em_execucao"
  | "concluida"
  | "arquivada"
  | "cancelada";

export type WorkItemPriority = "baixa" | "media" | "alta" | "urgente";

export interface StatusBadge {
  code: WorkItemStatus;
  label: string;
  colorToken: string;
}

export interface PriorityBadge {
  code: WorkItemPriority;
  label: string;
  colorToken: string;
}

export interface RequestingArea {
  id: string;
  name: string;
  code?: string;
}

export interface Assignee {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
}

export interface RelatedProject {
  id: string;
  code: string;
  name: string;
}

export interface ProgressMetric {
  percentage: number;
  completedMilestones: number;
  totalMilestones: number;
}

export interface WorkItem {
  id: string;
  code: string;
  title: string;
  description?: string;
  type: WorkItemType;
  requestingArea: RequestingArea;
  assignee?: Assignee | null;
  priority: PriorityBadge;
  status: StatusBadge;
  progress: ProgressMetric;
  deadline?: string | null;
  startDate?: string | null;
  overdue: boolean;
  blocked: boolean;
  blockerReason?: string;
  riskLevel?: "baixo" | "medio" | "alto" | "critico";
  project?: RelatedProject | null;
  files?: string[];
  hasBudget?: boolean;
  budgetValue?: number;
  budgetSource?: string;
  approvedBy?: string | { id?: string; name: string; role?: string; at: string } | null;
  approvalDate?: string;
  permissions: {
    canView: boolean;
    canEdit: boolean;
    canAssign: boolean;
    canTransition: boolean;
    canCancel: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ExecutiveSummary {
  totalDemands: number;
  inProgress: number;
  completed: number;
  overdue: number;
  waitingStart: number;
  blockedOrAtRisk: number;
  periodComparisonPercentage: number;
}

export interface StatusDistributionItem {
  status: WorkItemStatus;
  label: string;
  count: number;
  percentage: number;
  colorToken: string;
}

export interface StatusDistributionResponse {
  items: StatusDistributionItem[];
  total: number;
}

export interface WorkItemAlert {
  id: string;
  workItemId: string;
  workItemCode: string;
  title: string;
  type: "overdue" | "blocked" | "deadline_approaching" | "risk_high";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  timestamp: string;
}

export interface WorkItemAlertsResponse {
  alerts: WorkItemAlert[];
  totalCount: number;
}

export interface AuditActivity {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: string;
  targetId: string;
  targetCode: string;
  targetTitle: string;
  timestamp: string;
  details?: string;
}

export interface RecentActivitiesResponse {
  activities: AuditActivity[];
}

export interface ProjectProgressItem {
  id: string;
  code: string;
  name: string;
  progressPercentage: number;
  statusLabel: string;
  deadline: string;
}

export interface ProjectProgressResponse {
  projects: ProjectProgressItem[];
}

export interface WorkItemFilters {
  search?: string;
  startDate?: string;
  endDate?: string;
  dateType?: "criacao" | "prazo" | "atualizacao";
  type?: string;
  status?: string;
  priority?: string;
  requestingAreaId?: string;
  assigneeId?: string;
  projectId?: string;
  page?: number;
  pageSize?: number;
  sortBy?: "code" | "title" | "createdAt" | "deadline" | "priority" | "status";
  sortDirection?: "asc" | "desc";
  view?: ViewMode;
}

export interface PaginatedWorkItemsResponse {
  items: WorkItem[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export const createDemandaSchema = z.object({
  title: z.string().min(3, "O título deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  type: z.enum(["demanda", "projeto", "iniciativa", "atividade"]).default("demanda"),
  requestingAreaId: z.string().min(1, "Selecione uma área solicitante"),
  assigneeId: z.string().optional(),
  priority: z.enum(["baixa", "media", "alta", "urgente"]).default("media"),
  status: z.enum([
    "rascunho",
    "recebida",
    "triagem",
    "em_analise",
    "parecer_tecnico",
    "aprovada",
    "em_execucao",
    "concluida",
    "arquivada",
    "cancelada",
  ]).default("recebida"),
  deadline: z.string().optional(),
  projectId: z.string().optional(),
});

export type CreateDemandaInput = z.infer<typeof createDemandaSchema>;
