export type DemandaStatus =
  | "Recebida"
  | "Em análise"
  | "Aprovada"
  | "Recusada"
  | "Convertida em projeto";

export type PriorityType = "Baixa" | "Média" | "Alta" | "Urgente";

export type ProjetoStatus =
  | "Planejamento"
  | "Em execução"
  | "Em validação"
  | "Concluído"
  | "Suspenso"
  | "Cancelado";

export type KanbanColumnId =
  | "planejamento"
  | "afazer"
  | "execucao"
  | "validacao"
  | "concluidas";

export interface DemandaCriteria {
  multDeliveries: boolean;
  needsTeam: boolean;
  hasTimeline: boolean;
  needsBudget: boolean;
  approvedByResponsible: boolean;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: string;
  progress: number;
}

export interface DemandaItem {
  id: string;
  code: string;
  title: string;
  category: string;
  description: string;
  priority: PriorityType;
  channelOrigin: string;
  regionId: string;
  municipio: string;
  bairro: string;
  address: string;
  cep?: string;
  responsible: string;
  team: string;
  status: DemandaStatus;
  receiptDate: string;
  analysisDeadline: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail: string;
  contactChannel?: string;
  contactAuthorized?: boolean;
  files: string[];
  createdAt: string;
  criteria: DemandaCriteria;
  technicalReport?: string;
  identifiedRisks?: string;
  expectedBenefits?: string;
  restrictions?: string;
  estimatedTimeline?: string;
  hasBudget?: boolean;
  estimatedBudget?: number;
  budgetSource?: string;
  budgetDestination?: string;
  costCenterContext?: "mandato" | "campanha" | "partido" | "interno";
  approvedBy?: string;
  approvalDate?: string;
  approvalRole?: string;
  decision?: string;
  decisionJustification?: string;
  convertedProjectId?: string;
}

export interface ProjetoItem {
  id: string;
  code: string;
  title: string;
  demandaId: string;
  demandaCode: string;
  category: string;
  responsible: string;
  status: ProjetoStatus;
  priority: PriorityType;
  description: string;
  startDate: string;
  endDate: string;
  progress: number;
  createdAt: string;
}

export interface KanbanTask {
  id: string;
  code: string;
  title: string;
  type: "tarefa" | "entrega" | "marco";
  columnId: KanbanColumnId;
  priority: PriorityType;
  responsible: string;
  responsibleAvatar: string;
  dueDate: string;
  progress: number;
  tags: string[];
  checklistCompleted: number;
  checklistTotal: number;
  commentsCount: number;
  attachmentsCount: number;
  blocked?: boolean;
}

export interface CronogramaItem {
  id: string;
  code?: string;
  name: string;
  responsible: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: "Concluída" | "Em andamento" | "Atrasada" | "Crítica" | "Futura";
  isMilestone?: boolean;
  dependencyId?: string;
  level: number; // 1 = Fase, 2 = Item
  children?: CronogramaItem[];
}

export interface OrcamentoCategoria {
  id: string;
  name: string;
  planned: number;
  committed: number;
  paid: number;
  balance: number;
  utilization: number;
  color: string;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  document: string;
  description: string;
  supplier: string;
  category: string;
  value: number;
  status: "Pago" | "Aguardando aprovação" | "Comprometido" | "Rejeitado";
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  status: "Disponível" | "Adequada" | "Sobrecarga";
  tasksCount: number;
  allocationPercent: number;
  avatarInitials: string;
  avatarBg: string;
}

export interface RaciItem {
  id: string;
  deliveryCode: string;
  deliveryName: string;
  responsible: string;
  approver: string;
  consulted: string[];
  informed: string[];
  dueDate: string;
}

export interface ProjectFileItem {
  id: string;
  name: string;
  type: string;
  size: string;
  folder: string;
  url?: string;
  linkedItem: string;

  responsible: string;
  version: string;
  modifiedAt: string;
  verified: boolean;
  versionsHistory: Array<{
    version: string;
    modifiedAt: string;
    responsible: string;
    size: string;
    isCurrent?: boolean;
  }>;
}

export interface AuditEvent {
  id: string;
  time: string;
  dateGroup: "Hoje" | "Ontem" | string;
  user: string;
  avatarInitials: string;
  avatarBg: string;
  actionText: string;
  eventType: "Tarefa" | "Aprovação" | "Arquivo" | "Orçamento" | "Prazo" | "Comentário" | "Equipe" | "Sistema";
  targetCode: string;
  targetTitle: string;
  previousValue?: string;
  newValue?: string;
  justification?: string;
  isImportant?: boolean;
  fullDate: string;
}
