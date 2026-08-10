export type FinancialContextType = "mandato" | "campanha" | "partido" | "interno";

export type FinancialContextFilter = {
  contextType: FinancialContextType;
  mandatoId?: string;
  campanhaId?: string;
  partidoId?: string;
  eleicaoAno?: number;
  gabineteNome?: string;
  diretorioNome?: string;
  contaBancariaId?: string;
};

export type BankAccountType = "eleitoral" | "fundo_partidario" | "doacao" | "operacional" | "mandato";

export type BankAccount = {
  id: string;
  contextType: FinancialContextType;
  name: string;
  bankName: string;
  bankCode: string;
  agency: string;
  accountNumber: string;
  pixKey?: string;
  type: BankAccountType;
  balance: number;
  initialBalance: number;
  status: "ativa" | "bloqueada" | "encerrada";
};

export type CostCenter = {
  id: string;
  code: string;
  name: string;
  contextType: FinancialContextType;
  budgetLimit: number;
  status: "ativo" | "inativo";
};

export type Budget = {
  id: string;
  contextType: FinancialContextType;
  costCenterId: string;
  costCenterName: string;
  year: number;
  month?: number;
  planned: number;
  reserved: number;
  committed: number;
  contracted: number;
  paid: number;
  available: number;
};

export type BudgetRevision = {
  id: string;
  budgetId: string;
  author: string;
  date: string;
  reason: string;
  oldPlanned: number;
  newPlanned: number;
  status: "aprovada" | "pendente" | "rejeitada";
};

export type RevenueOrigin = 
  | "doacao_pf"
  | "recurso_proprio"
  | "repasse_partidario"
  | "fundo_eleitoral"
  | "fundo_partidario"
  | "rendimento_financeiro"
  | "receita_operacional"
  | "estorno_devolucao";

export type RevenueStatus = "registrada" | "confirmada" | "conciliada" | "estornada";

export type Revenue = {
  id: string;
  contextType: FinancialContextType;
  entityId: string;
  entityName: string;
  date: string;
  competencyDate: string;
  amount: number;
  currency: string;
  origin: RevenueOrigin;
  donorName: string;
  donorCpfCnpj: string;
  bankAccountId: string;
  bankAccountName: string;
  costCenterId: string;
  costCenterName: string;
  purpose: string;
  documentNumber?: string;
  documentFileUrl?: string;
  status: RevenueStatus;
  createdBy: string;
  createdAt: string;
};

export type ExpenseType = "avulsa" | "recorrente" | "parcelada" | "parcial";

export type ExpenseStatus = 
  | "solicitada"
  | "em_validacao"
  | "aprovada"
  | "contratada"
  | "documentada"
  | "paga"
  | "conciliada"
  | "prestada_contas"
  | "rejeitada"
  | "cancelada";

export type CostAllocation = {
  costCenterId: string;
  costCenterName: string;
  percentage: number;
  amount: number;
};

export type Expense = {
  id: string;
  code: string;
  contextType: FinancialContextType;
  entityId: string;
  entityName: string;
  expenseType: ExpenseType;
  description: string;
  vendorId: string;
  vendorName: string;
  vendorCpfCnpj: string;
  dueDate: string;
  paymentDate?: string;
  competencyDate: string;
  amount: number;
  penaltyFee?: number;
  discount?: number;
  finalAmount: number;
  bankAccountId: string;
  bankAccountName: string;
  status: ExpenseStatus;
  allocations: CostAllocation[];
  fiscalDocumentType?: "nota_fiscal" | "recibo" | "contrato" | "comprovante";
  fiscalDocumentNumber?: string;
  fiscalDocumentUrl?: string;
  requestedBy: string;
  approvedBy?: string;
  approvalDate?: string;
  approvalNotes?: string;
  paidBy?: string;
  reconciled: boolean;
  createdAt: string;
};

export type Vendor = {
  id: string;
  name: string;
  tradeName?: string;
  cpfCnpj: string;
  email: string;
  phone: string;
  bankName: string;
  bankAgency: string;
  bankAccount: string;
  pixKey?: string;
  serviceCategory: string;
  documentationStatus: "regular" | "pendente" | "vencido";
  complianceAlert?: boolean;
  lastBankChangeAt?: string;
  createdAt: string;
};

export type Contract = {
  id: string;
  code: string;
  contextType: FinancialContextType;
  title: string;
  vendorId: string;
  vendorName: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  costCenterId: string;
  costCenterName: string;
  status: "ativo" | "encerrado" | "suspenso" | "proximo_vencimento";
  documentUrl?: string;
};

export type BankTransaction = {
  id: string;
  bankAccountId: string;
  bankAccountName: string;
  date: string;
  description: string;
  amount: number;
  type: "credito" | "debito";
  fitid?: string;
  reconciled: boolean;
  matchedEntityId?: string;
  matchedEntityType?: "receita" | "despesa";
};

export type FinancialAlertSeverity = "alta" | "media" | "baixa";

export type FinancialAlertStatus = "pendente" | "resolvido" | "justificado" | "falso_positivo";

export type FinancialAlert = {
  id: string;
  ruleCode: string;
  ruleVersion: string;
  title: string;
  description: string;
  severity: FinancialAlertSeverity;
  contextType: FinancialContextType;
  evidence: string;
  status: FinancialAlertStatus;
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
};

export type FinancialAuditLog = {
  id: string;
  timestamp: string;
  actor: string;
  action: "CRIAR" | "EDITAR" | "APROVAR" | "REJEITAR" | "PAGAR" | "CONCILIAR" | "FECHAR_PERIODO" | "EXPORTAR" | "TENTATIVA_NEGADA";
  contextType: FinancialContextType;
  entityType: string;
  entityId: string;
  details: string;
  previousState?: string;
  newState?: string;
};

export type FinancialPeriodClose = {
  id: string;
  contextType: FinancialContextType;
  periodYearMonth: string; // YYYY-MM
  status: "aberto" | "fechado";
  closedBy?: string;
  closedAt?: string;
  reopenedBy?: string;
  reopenedAt?: string;
  reopenReason?: string;
};
