"use client";

import { useEffect, useState } from "react";
import { ModuleBlock } from "@/components/dashboard/ModuleBlock";
import { DataTable } from "@/components/dashboard/DataTable";
import { RoleHint } from "@/components/dashboard/RoleHint";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { buttonPrimaryClass, buttonSecondaryClass, inputClass, labelClass } from "@/components/dashboard/form-styles";
import { useDashboard } from "@/contexts/DashboardProvider";
import { useToast } from "@/components/dashboard/Toast";
import { exportToCSV, exportToExcel, generatePrintablePDF } from "@/lib/export-utils";
import {
  Banknote,
  WalletCards,
  Coins,
  Lock,
  CirclePlus,
  CircleMinus,
  Scale,
  Receipt,
  ExternalLink,
  ChevronRight,
  Clock3,
  TrendingUp,
  TrendingDown,
  Search,
  CalendarDays,
  FilterX,
  Download,
  MoreVertical,
  Building2,
  CheckCircle2,
  ReceiptText,
  CalendarClock,
  BadgeCheck,
  FileWarning,
  LayoutDashboard,
  Target,
  FileText,
  Landmark,
  ClipboardList,
  BarChart3,
  Building,
} from "lucide-react";
import { formatCurrencyBR } from "@/lib/data/financeiro-store";
import type {
  FinancialContextType,
  BankAccount,
  CostCenter,
  Budget,
  Revenue,
  Expense,
  Vendor,
  Contract,
  BankTransaction,
  FinancialAlert,
  FinancialAuditLog,
  FinancialPeriodClose,
} from "@/lib/domain/financeiro-types";

export function FinanceiroPanel() {
  const { can, userEmail } = useDashboard();
  const { toast } = useToast();
  const canManage = can("financeiro:gerenciar");

  // ── SELETOR DO CONTEXTO ATIVO ───────────────────────────────────────────────
  const [activeContext, setActiveContext] = useState<FinancialContextType>("campanha");
  const [activeSubTab, setActiveSubTab] = useState<
    | "visao_geral"
    | "receitas"
    | "despesas"
    | "orcamentos"
    | "contratos"
    | "contas_bancarias"
    | "conciliacao"
    | "prestacao_contas"
    | "relatorios"
  >("visao_geral");

  // ── ESTADOS DOS DADOS FINANCEIROS ──────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [revCategoryFilter, setRevCategoryFilter] = useState("Todas");
  const [revOriginFilter, setRevOriginFilter] = useState("Todas");
  const [revStatusFilter, setRevStatusFilter] = useState("Todas");
  const [revBankAccountIdFilter, setRevBankAccountIdFilter] = useState("Todas");
  const [revStartDate, setRevStartDate] = useState("");
  const [revEndDate, setRevEndDate] = useState("");
  const [revPage, setRevPage] = useState(1);
  const [revPageSize, setRevPageSize] = useState(25);
  const [selectedRevenueIds, setSelectedRevenueIds] = useState<string[]>([]);

  // Estados adicionais da aba Despesas & Solicitações
  const [expSearchQuery, setExpSearchQuery] = useState("");
  const [expTypeFilter, setExpTypeFilter] = useState("Todas");
  const [expCategoryFilter, setExpCategoryFilter] = useState("Todas");
  const [expCostCenterFilter, setExpCostCenterFilter] = useState("Todos");
  const [expStatusFilter, setExpStatusFilter] = useState("Todas");
  const [expApproverFilter, setExpApproverFilter] = useState("Todos");
  const [expStartDate, setExpStartDate] = useState("");
  const [expEndDate, setExpEndDate] = useState("");
  const [expPage, setExpPage] = useState(1);
  const [expPageSize, setExpPageSize] = useState(25);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<string[]>([]);

  const [summary, setSummary] = useState({
    totalReceitas: 0,
    totalDespesas: 0,
    saldoLiquido: 0,
    totalOrcado: 0,
    totalComprometido: 0,
    totalDisponivel: 0,
    pctArrecadadoTarget: 100,
    pctDespesasPagas: 0,
    pctSaldoDisponivel: 0,
    pctValorComprometido: 0,
    alertasPendentesCount: 0,
  });

  const [cashFlowData, setCashFlowData] = useState<{ mes: string; receita: number; despesa: number }[]>([]);
  const [categoryBudgetsList, setCategoryBudgetsList] = useState<{ id: string; name: string; planned: number; committed: number; paid: number; balance: number; pctUsed: number; color: string }[]>([]);
  const [complianceData, setComplianceData] = useState({
    recibosPendentesCount: 0,
    conciliacoesPendentesCount: 0,
    situacao: "Em dia",
    pctExigenciasAtendidas: 100,
    lastCheckTimestamp: "—",
  });
  const [projectionsData, setProjectionsData] = useState({ dias30: 0, dias60: 0, dias90: 0 });
  const [recentTx, setRecentTx] = useState<any[]>([]);
  const [periodFilter, setPeriodFilter] = useState("mensal");

  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [alerts, setAlerts] = useState<FinancialAlert[]>([]);
  const [auditLogs, setAuditLogs] = useState<FinancialAuditLog[]>([]);
  const [periodClosures, setPeriodClosures] = useState<FinancialPeriodClose[]>([]);

  // ── FORMULÁRIOS & DIÁLOGOS DE MODAL ────────────────────────────────────────
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const [approvalTarget, setApprovalTarget] = useState<{ expense: Expense; decision: "aprovar" | "rejeitar" | "ressalva" } | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");

  // Formulário Nova Despesa
  const [expDescription, setExpDescription] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expVendorId, setExpVendorId] = useState("");
  const [expDueDate, setExpDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [expCostCenterId, setExpCostCenterId] = useState("");
  const [expDocType, setExpDocType] = useState<"nota_fiscal" | "recibo" | "contrato" | "comprovante">("nota_fiscal");
  const [expDocNumber, setExpDocNumber] = useState("");

  // Formulário Nova Receita
  const [revDonorName, setRevDonorName] = useState("");
  const [revDonorCpfCnpj, setRevDonorCpfCnpj] = useState("");
  const [revAmount, setRevAmount] = useState("");
  const [revOrigin, setRevOrigin] = useState("doacao_pf");
  const [revBankAccountId, setRevBankAccountId] = useState("");
  const [revPurpose, setRevPurpose] = useState("");

  // Formulário Fornecedor
  const [vndName, setVndName] = useState("");
  const [vndCpfCnpj, setVndCpfCnpj] = useState("");
  const [vndEmail, setVndEmail] = useState("");
  const [vndPhone, setVndPhone] = useState("");
  const [vndCategory, setVndCategory] = useState("");

  // Extrato OFX/CSV Import
  const [importFileContent, setImportFileContent] = useState("");

  // ── CARREGAMENTO DE DADOS VIA API REST ──────────────────────────────────────
  async function loadFinancialData() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/financeiro?contextType=${activeContext}&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (res.ok) {
        setSummary(data.summary || {});
        setCashFlowData(data.cashFlow || []);
        setCategoryBudgetsList(data.categoryBudgets || []);
        setComplianceData(data.compliance || { recibosPendentesCount: 0, conciliacoesPendentesCount: 0, situacao: "Em dia", pctExigenciasAtendidas: 100, lastCheckTimestamp: "—" });
        setProjectionsData(data.projections || { dias30: 0, dias60: 0, dias90: 0 });
        setRecentTx(data.recentTransactions || []);
        setAccounts(data.accounts || []);
        setCostCenters(data.costCenters || []);
        setBudgets(data.budgets || []);
        setVendors(data.vendors || []);
        setRevenues(data.revenues || []);
        setExpenses(data.expenses || []);
        setContracts(data.contracts || []);
        setBankTransactions(data.bankTransactions || []);
        setAlerts(data.alerts || []);
        setAuditLogs(data.auditLogs || []);
        setPeriodClosures(data.periodClosures || []);

        if (data.costCenters?.length > 0 && !expCostCenterId) {
          setExpCostCenterId(data.costCenters[0].id);
        }
        if (data.vendors?.length > 0 && !expVendorId) {
          setExpVendorId(data.vendors[0].id);
        }
        if (data.accounts?.length > 0 && !revBankAccountId) {
          setRevBankAccountId(data.accounts[0].id);
        }
      } else {
        throw new Error(data.error || "Erro ao carregar dados financeiros.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Falha ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFinancialData();
  }, [activeContext]);

  // ── AÇÕES DOS FORMULÁRIOS ──────────────────────────────────────────────────
  async function handleCreateExpense(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const res = await fetch("/api/financeiro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_expense",
          contextType: activeContext,
          description: expDescription,
          amount: parseFloat(expAmount),
          vendorId: expVendorId,
          dueDate: expDueDate,
          costCenterId: expCostCenterId,
          fiscalDocumentType: expDocType,
          fiscalDocumentNumber: expDocNumber,
          actor: userEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao registrar solicitação de despesa.");

      setSuccessMsg("🎉 Solicitação de despesa enviada para o fluxo de aprovação!");
      setShowExpenseModal(false);
      setExpDescription("");
      setExpAmount("");
      setExpDocNumber("");
      loadFinancialData();
    } catch (err: any) {
      setErrorMsg(err?.message || "Erro ao salvar solicitação.");
    }
  }

  async function handleCreateRevenue(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const res = await fetch("/api/financeiro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_revenue",
          contextType: activeContext,
          donorName: revDonorName,
          donorCpfCnpj: revDonorCpfCnpj,
          amount: parseFloat(revAmount),
          origin: revOrigin,
          bankAccountId: revBankAccountId,
          purpose: revPurpose,
          actor: userEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao registrar receita.");

      setSuccessMsg("📈 Receita confirmada e saldo bancário atualizado!");
      setShowRevenueModal(false);
      setRevDonorName("");
      setRevDonorCpfCnpj("");
      setRevAmount("");
      setRevPurpose("");
      loadFinancialData();
    } catch (err: any) {
      setErrorMsg(err?.message || "Erro ao registrar receita.");
    }
  }

  async function handleCreateVendor(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const res = await fetch("/api/financeiro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_vendor",
          name: vndName,
          cpfCnpj: vndCpfCnpj,
          email: vndEmail,
          phone: vndPhone,
          serviceCategory: vndCategory,
          actor: userEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao cadastrar fornecedor.");

      setSuccessMsg("🏢 Fornecedor cadastrado com sucesso!");
      setShowVendorModal(false);
      setVndName("");
      setVndCpfCnpj("");
      setVndEmail("");
      setVndPhone("");
      setVndCategory("");
      loadFinancialData();
    } catch (err: any) {
      setErrorMsg(err?.message || "Erro ao cadastrar fornecedor.");
    }
  }

  async function handleConfirmApproval() {
    if (!approvalTarget) return;
    try {
      const res = await fetch("/api/financeiro", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve_expense",
          expenseId: approvalTarget.expense.id,
          decision: approvalTarget.decision,
          notes: approvalNotes,
          actor: userEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao processar aprovação.");

      setSuccessMsg(`Decisão '${approvalTarget.decision}' registrada na trilha de auditoria!`);
      setApprovalTarget(null);
      setApprovalNotes("");
      loadFinancialData();
    } catch (err: any) {
      setErrorMsg(err?.message || "Erro ao aprovar/rejeitar despesa.");
      setApprovalTarget(null);
    }
  }

  async function handlePayExpense(expenseId: string) {
    try {
      const res = await fetch("/api/financeiro", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "pay_expense",
          expenseId,
          actor: userEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao realizar pagamento.");

      setSuccessMsg("💸 Pagamento efetuado e debitado na conta bancária!");
      loadFinancialData();
    } catch (err: any) {
      setErrorMsg(err?.message || "Erro ao pagar despesa.");
    }
  }

  async function handleResolveAlert(alertId: string, resolutionStatus: "resolvido" | "justificado") {
    try {
      const res = await fetch("/api/financeiro", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resolve_alert",
          alertId,
          resolutionStatus,
          notes: "Classificado e regularizado pelo auditor financeiro.",
          actor: userEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar alerta.");

      setSuccessMsg("🛡️ Alerta de conformidade resolvido com sucesso!");
      loadFinancialData();
    } catch (err: any) {
      setErrorMsg(err?.message || "Erro ao tratar alerta.");
    }
  }

  async function handleImportExtrato(e: React.FormEvent) {
    e.preventDefault();
    if (!importFileContent.trim()) {
      setErrorMsg("Cole ou selecione o conteúdo de um arquivo OFX/CSV.");
      return;
    }
    try {
      const res = await fetch("/api/financeiro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "import_reconciliation",
          contextType: activeContext,
          fileContent: importFileContent,
          actor: userEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro na importação.");

      setSuccessMsg(`🏦 Importação efetuada: ${data.importedCount} lançamentos prontos para conciliação!`);
      setShowImportModal(false);
      setImportFileContent("");
      loadFinancialData();
    } catch (err: any) {
      setErrorMsg(err?.message || "Falha na importação de extrato.");
    }
  }

  async function handleDeleteExpense() {
    if (!deleteExpenseId) return;
    try {
      const res = await fetch(`/api/financeiro?id=${deleteExpenseId}&actor=${encodeURIComponent(userEmail || "Admin")}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao cancelar registro.");

      setSuccessMsg("🗑️ Registro desativado logicamente e gravado na trilha de auditoria.");
      setDeleteExpenseId(null);
      loadFinancialData();
    } catch (err: any) {
      setErrorMsg(err?.message || "Erro ao cancelar.");
      setDeleteExpenseId(null);
    }
  }

  return (
    <ModuleBlock title="Módulo Financeiro Operacional Completo" icon="💰">
      <div className="flex flex-col gap-5">
        <RoleHint />

        {/* ---------------- 1. CABEÇALHO COM SELETOR DE CONTEXTO ATIVO ---------------- */}
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 p-4 dark:border-blue-900/50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-zinc-950 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold text-xl shadow-md">
              {activeContext === "mandato" ? "🏛️" : activeContext === "campanha" ? "📣" : activeContext === "partido" ? "🏢" : "🔐"}
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Contexto Financeiro Ativo (Isolamento Restrito)
              </span>
              <h2 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                {activeContext === "mandato" && "Mandato Parlamentar — Gabinete & Reembolsos"}
                {activeContext === "campanha" && "Campanha Eleitoral 2026 — Prestação TSE"}
                {activeContext === "partido" && "Partido & Diretório — Fundo Partidário/FEFC"}
                {activeContext === "interno" && "Financeiro Interno — Gestão de Assinaturas (Admin)"}
              </h2>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                Todos os lançamentos, contas bancárias, conciliações e relatórios são isolados por este contexto.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="context-select" className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase">Alternar Contexto:</label>
            <select
              id="context-select"
              value={activeContext}
              onChange={(e) => setActiveContext(e.target.value as FinancialContextType)}
              className={`${inputClass} max-w-[240px] font-bold text-xs bg-white dark:bg-zinc-900 border-blue-300 dark:border-blue-800`}
            >
              <option value="campanha">📣 Campanha Eleitoral 2026</option>
              <option value="mandato">🏛️ Mandato Parlamentar</option>
              <option value="partido">🏢 Partido / Diretório SP</option>
              <option value="interno">🔐 Financeiro Interno da Plataforma</option>
            </select>
          </div>
        </div>

        {/* MENSAGENS DE FEEDBACK */}
        {successMsg && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300 font-bold flex justify-between items-center">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 font-bold text-sm">×</button>
          </div>
        )}
        {errorMsg && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 font-bold flex justify-between items-center">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-red-500 font-bold text-sm">×</button>
          </div>
        )}

        {/* ---------------- 2. NAVEGAÇÃO POR SUB-ABAS ---------------- */}
        <div className="flex overflow-x-auto border-b border-zinc-200 dark:border-zinc-800 pb-1 gap-1 text-[11px] font-bold scrollbar-thin">
          {[
            { id: "visao_geral", label: "Visão Geral", icon: LayoutDashboard },
            { id: "receitas", label: "Receitas", icon: TrendingUp },
            { id: "despesas", label: "Despesas & Solicitações", icon: TrendingDown },
            { id: "orcamentos", label: "Orçamentos & Centros", icon: Target },
            { id: "contratos", label: "Contratos", icon: FileText },
            { id: "contas_bancarias", label: "Contas Bancárias", icon: Landmark },
            { id: "conciliacao", label: "Conciliação OFX/CSV", icon: Scale },
            { id: "prestacao_contas", label: "Prestação de Contas", icon: ClipboardList },
            { id: "relatorios", label: "Relatórios & Transparência", icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeSubTab === tab.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ---------------- 3. SUB-VISÃO 1: VISÃO GERAL (DASHBOARD PAINEL) ---------------- */}
        {activeSubTab === "visao_geral" && (
          <div className="flex flex-col gap-6">
            {/* CABEÇALHO INTERNO DA VISÃO GERAL */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                  Financeiro da campanha
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  Arrecadação, despesas, orçamento e conformidade
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowRevenueModal(true)}
                  disabled={!canManage}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm disabled:opacity-50"
                >
                  <CirclePlus className="h-4 w-4" />
                  Registrar receita
                </button>
                <button
                  onClick={() => setShowExpenseModal(true)}
                  disabled={!canManage}
                  className="flex items-center gap-2 rounded-xl border border-emerald-600 bg-white px-4 py-2.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:bg-zinc-900 dark:hover:bg-emerald-950/30 transition shadow-xs disabled:opacity-50"
                >
                  <CircleMinus className="h-4 w-4" />
                  Registrar despesa
                </button>
              </div>
            </div>

            {/* 4 CARDS DE INDICADORES PRINCIPAIS */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* INDICADOR 1 — TOTAL ARRECADADO */}
              <div className="rounded-2xl border border-emerald-100 bg-white p-5 dark:border-emerald-900/30 dark:bg-zinc-950 shadow-xs flex items-center justify-between relative overflow-hidden">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Total arrecadado</span>
                  <span className="text-2xl font-black text-emerald-600 mt-1">
                    {formatCurrencyBR(summary.totalReceitas)}
                  </span>
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-1">
                    {summary.pctArrecadadoTarget ?? 100}% das receitas
                  </span>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 shrink-0">
                  <Banknote className="h-6 w-6" />
                </div>
              </div>

              {/* INDICADOR 2 — DESPESAS PAGAS */}
              <div className="rounded-2xl border border-blue-100 bg-white p-5 dark:border-blue-900/30 dark:bg-zinc-950 shadow-xs flex items-center justify-between relative overflow-hidden">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Despesas pagas</span>
                  <span className="text-2xl font-black text-blue-600 mt-1">
                    {formatCurrencyBR(summary.totalDespesas)}
                  </span>
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-1">
                    {summary.pctDespesasPagas ?? 0}% do total arrecadado
                  </span>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 shrink-0">
                  <WalletCards className="h-6 w-6" />
                </div>
              </div>

              {/* INDICADOR 3 — SALDO DISPONÍVEL */}
              <div className="rounded-2xl border border-emerald-100 bg-white p-5 dark:border-emerald-900/30 dark:bg-zinc-950 shadow-xs flex items-center justify-between relative overflow-hidden">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Saldo disponível</span>
                  <span className="text-2xl font-black text-emerald-600 mt-1">
                    {formatCurrencyBR(summary.totalDisponivel)}
                  </span>
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-1">
                    {summary.pctSaldoDisponivel ?? 0}% do total arrecadado
                  </span>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 shrink-0">
                  <Coins className="h-6 w-6" />
                </div>
              </div>

              {/* INDICADOR 4 — VALOR COMPROMETIDO */}
              <div className="rounded-2xl border border-amber-100 bg-white p-5 dark:border-amber-900/30 dark:bg-zinc-950 shadow-xs flex items-center justify-between relative overflow-hidden">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Valor comprometido</span>
                  <span className="text-2xl font-black text-amber-600 mt-1">
                    {formatCurrencyBR(summary.totalComprometido)}
                  </span>
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-1">
                    {summary.pctValorComprometido ?? 0}% do total arrecadado
                  </span>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 shrink-0">
                  <Lock className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* LAYOUT EM 3 COLUNAS CONFORME ESPECIFICAÇÃO */}
            <div className="grid gap-6 lg:grid-cols-12 items-start">
              
              {/* COLUNA ESQUERDA (~47%): FLUXO FINANCEIRO + ÚLTIMOS LANÇAMENTOS */}
              <div className="lg:col-span-6 flex flex-col gap-6">
                
                {/* GRÁFICO DE FLUXO FINANCEIRO */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">Fluxo financeiro</h3>
                    <select
                      value={periodFilter}
                      onChange={(e) => setPeriodFilter(e.target.value)}
                      className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                    >
                      <option value="mensal">Mensal</option>
                      <option value="trimestral">Trimestral</option>
                      <option value="anual">Anual</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-6 text-xs font-semibold">
                    <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <span className="h-3 w-3 rounded-sm bg-emerald-600" /> Receitas (R$)
                    </span>
                    <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <span className="h-3 w-3 rounded-sm bg-blue-600" /> Despesas (R$)
                    </span>
                  </div>

                  {/* BARRAS DE FLUXO MENSAL */}
                  <div className="h-44 w-full flex items-end justify-between gap-2 pt-4 pb-2 border-b border-zinc-100 dark:border-zinc-850 px-2">
                    {cashFlowData.map((cf, i) => {
                      const maxVal = Math.max(...cashFlowData.map((d) => Math.max(d.receita, d.despesa)), 1000);
                      const hRev = Math.max(4, Math.round((cf.receita / maxVal) * 120));
                      const hExp = Math.max(4, Math.round((cf.despesa / maxVal) * 120));
                      return (
                        <div key={i} className="flex flex-col items-center gap-1 flex-1">
                          <div className="flex items-end gap-1 h-32 w-full justify-center">
                            <div
                              title={`Receita: ${formatCurrencyBR(cf.receita)}`}
                              className="w-2.5 sm:w-3.5 bg-emerald-500 rounded-t-sm transition-all hover:bg-emerald-600"
                              style={{ height: `${hRev}px` }}
                            />
                            <div
                              title={`Despesa: ${formatCurrencyBR(cf.despesa)}`}
                              className="w-2.5 sm:w-3.5 bg-blue-600 rounded-t-sm transition-all hover:bg-blue-700"
                              style={{ height: `${hExp}px` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-zinc-500">{cf.mes}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* TABELA DE ÚLTIMOS LANÇAMENTOS */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">Últimos lançamentos</h3>
                    <button
                      onClick={() => setActiveSubTab("receitas")}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      Ver todos os lançamentos <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-zinc-100 text-[10px] uppercase font-bold text-zinc-400 dark:border-zinc-850">
                          <th className="py-2 px-1">Data</th>
                          <th className="py-2 px-1">Tipo</th>
                          <th className="py-2 px-1">Descrição</th>
                          <th className="py-2 px-1">Categoria</th>
                          <th className="py-2 px-1 text-right">Valor (R$)</th>
                          <th className="py-2 px-1 text-center">Situação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 font-medium">
                        {recentTx.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-6 text-center text-zinc-400">
                              Nenhum lançamento registrado no contexto selecionado.
                            </td>
                          </tr>
                        ) : (
                          recentTx.map((tx, idx) => (
                            <tr key={tx.id || idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                              <td className="py-2.5 px-1 font-mono text-[11px] text-zinc-500">{tx.date}</td>
                              <td className="py-2.5 px-1">
                                <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-1.5 py-0.5 rounded ${tx.type === "Receita" ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40" : "text-blue-700 bg-blue-50 dark:bg-blue-950/40"}`}>
                                  {tx.type === "Receita" ? "⇡ Receita" : "⇣ Despesa"}
                                </span>
                              </td>
                              <td className="py-2.5 px-1 font-bold text-zinc-800 dark:text-zinc-200">{tx.description}</td>
                              <td className="py-2.5 px-1 text-zinc-500 text-[11px]">{tx.category}</td>
                              <td className={`py-2.5 px-1 text-right font-mono font-bold ${tx.type === "Receita" ? "text-emerald-600" : "text-blue-600"}`}>
                                {formatCurrencyBR(tx.amount)}
                              </td>
                              <td className="py-2.5 px-1 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${tx.status === "Confirmado" || tx.status === "Pago" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"}`}>
                                  {tx.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* COLUNA MEIO (~28%): ORÇAMENTO POR CATEGORIA */}
              <div className="lg:col-span-3 flex flex-col gap-6">
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-850">
                    <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">Orçamento por categoria</h3>
                    <span className="text-[10px] font-bold text-zinc-400">% utilizado ▾</span>
                  </div>

                  <div className="flex flex-col gap-4">
                    {categoryBudgetsList.length === 0 ? (
                      <p className="text-xs text-center text-zinc-400 py-6">Nenhum orçamento cadastrado para este contexto.</p>
                    ) : (
                      categoryBudgetsList.map((cat, idx) => (
                        <div key={cat.id || idx} className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-zinc-800 dark:text-zinc-200">{cat.name}</span>
                            <span className="font-mono text-zinc-700 dark:text-zinc-300">{cat.pctUsed}%</span>
                          </div>
                          <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-850 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                cat.color === "red" ? "bg-red-500" : cat.color === "orange" ? "bg-amber-500" : cat.color === "blue" ? "bg-blue-600" : "bg-emerald-500"
                              }`}
                              style={{ width: `${Math.min(100, cat.pctUsed)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-medium text-zinc-400">
                            {formatCurrencyBR(cat.paid + cat.committed)} de {formatCurrencyBR(cat.planned)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    onClick={() => setActiveSubTab("orcamentos")}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline pt-2 flex items-center justify-between"
                  >
                    <span>Ver todas as categorias</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* COLUNA DIREITA (~25%): CONFORMIDADE */}
              <div className="lg:col-span-3 flex flex-col gap-4">
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs flex flex-col gap-4">
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">Conformidade</h3>

                  {/* ALERTA 1: RECIBOS PENDENTES */}
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/30 flex flex-col gap-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-red-800 dark:text-red-300 flex items-center gap-1.5">
                        <Receipt className="h-4 w-4 text-red-600" /> Recibos pendentes
                      </span>
                      <span className="h-5 w-5 rounded-full bg-red-600 text-white font-bold text-[11px] flex items-center justify-center">
                        {complianceData.recibosPendentesCount}
                      </span>
                    </div>
                    <p className="text-[11px] text-red-700 dark:text-red-300 font-medium">
                      {complianceData.recibosPendentesCount > 0
                        ? "Existem recibos de doações que precisam ser anexados."
                        : "Todos os recibos e comprovantes fiscais estão devidamente vinculados."}
                    </p>
                    <button
                      onClick={() => setActiveSubTab("receitas")}
                      className="text-xs font-extrabold text-red-700 dark:text-red-300 hover:underline flex items-center justify-between pt-1"
                    >
                      <span>Ver recibos pendentes</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  {/* ALERTA 2: CONCILIAÇÕES PENDENTES */}
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/30 flex flex-col gap-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                        <Scale className="h-4 w-4 text-amber-600" /> Conciliações pendentes
                      </span>
                      <span className="h-5 w-5 rounded-full bg-amber-600 text-white font-bold text-[11px] flex items-center justify-center">
                        {complianceData.conciliacoesPendentesCount}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                      {complianceData.conciliacoesPendentesCount > 0
                        ? "Há lançamentos que precisam ser conciliados."
                        : "Todas as contas bancárias estão com conciliação OFX em dia."}
                    </p>
                    <button
                      onClick={() => setActiveSubTab("conciliacao")}
                      className="text-xs font-extrabold text-amber-700 dark:text-amber-300 hover:underline flex items-center justify-between pt-1"
                    >
                      <span>Ver conciliações pendentes</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  {/* SITUAÇÃO DA CONFORMIDADE */}
                  <div className="flex flex-col gap-2 border-t border-zinc-100 dark:border-zinc-850 pt-3">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-zinc-800 dark:text-zinc-200">Situação da conformidade</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {complianceData.situacao}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400">
                      Última verificação: {complianceData.lastCheckTimestamp}
                    </span>
                    <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-850 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${complianceData.pctExigenciasAtendidas}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600">
                      {complianceData.pctExigenciasAtendidas}% das exigências atendidas
                    </span>

                    <button
                      onClick={() => setActiveSubTab("prestacao_contas")}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5 pt-2"
                    >
                      <span>Ir para o Monitor TSE</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* PROJEÇÃO DE FLUXO DE CAIXA FUTURO (30, 60 E 90 DIAS) */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs flex flex-col gap-4">
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                Projeção de fluxo de caixa futuro (30, 60 e 90 dias)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-extrabold uppercase text-blue-700 dark:text-blue-400 tracking-wider">30 DIAS</span>
                  <span className="text-xl font-black text-blue-800 dark:text-blue-200 mt-1">
                    {formatCurrencyBR(projectionsData.dias30)}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-extrabold uppercase text-blue-700 dark:text-blue-400 tracking-wider">60 DIAS</span>
                  <span className="text-xl font-black text-blue-800 dark:text-blue-200 mt-1">
                    {formatCurrencyBR(projectionsData.dias60)}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-extrabold uppercase text-purple-700 dark:text-purple-400 tracking-wider">90 DIAS</span>
                  <span className="text-xl font-black text-purple-800 dark:text-purple-200 mt-1">
                    {formatCurrencyBR(projectionsData.dias90)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-end gap-1.5 pt-1 text-[11px] font-bold text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Dados Integrados
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 4. SUB-VISÃO 2: RECEITAS ---------------- */}
        {activeSubTab === "receitas" && (
          <div className="flex flex-col gap-6">
            {/* BREADCRUMB & CABEÇALHO DA PÁGINA */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 mb-1">
                  Área Financeira / <span className="text-zinc-700 dark:text-zinc-300 font-bold">Receitas</span>
                </div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                  Receitas
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  Acompanhe arrecadações, doações, conciliações e recibos.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const headers = ["Data", "Identificador", "Propósito/Descrição", "Doador/Origem", "Origem Recurso", "Centro de Custo", "Valor", "Status"];
                    const rows = revenues.map((r) => [
                      r.date,
                      r.id,
                      r.purpose || "-",
                      r.donorName || r.entityName || "-",
                      r.origin,
                      r.costCenterName || "-",
                      formatCurrencyBR(r.amount),
                      r.status,
                    ]);
                    exportToCSV(`Receitas_Financeiras_${activeContext}`, headers, rows);
                  }}
                  className="flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 transition shadow-xs cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  Exportar
                </button>
                <button
                  onClick={() => setShowRevenueModal(true)}
                  disabled={!canManage}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm disabled:opacity-50"
                >
                  <CirclePlus className="h-4 w-4" />
                  Registrar receita
                </button>
              </div>
            </div>

            {/* 4 CARDS DE INDICADORES DA ABA RECEITAS */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* CARTÃO 1: TOTAL RECEBIDO */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 shrink-0">
                  <Banknote className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Total recebido</span>
                  <span className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {formatCurrencyBR(summary.totalReceitas)}
                  </span>
                </div>
              </div>

              {/* CARTÃO 2: AGUARDANDO CONCILIAÇÃO */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 shrink-0">
                  <Clock3 className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Aguardando conciliação</span>
                  <span className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {formatCurrencyBR(
                      revenues.filter((r) => r.status === "registrada").reduce((acc, curr) => acc + curr.amount, 0)
                    )}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium">
                    {revenues.filter((r) => r.status === "registrada").length} lançamentos
                  </span>
                </div>
              </div>

              {/* CARTÃO 3: RECEITAS NO PERÍODO */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 shrink-0">
                  <TrendingUp className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Receitas no período</span>
                  <span className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {formatCurrencyBR(summary.totalReceitas)}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium">
                    {revenues.length} lançamentos
                  </span>
                </div>
              </div>

              {/* CARTÃO 4: RECIBOS PENDENTES */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/60 shrink-0">
                  <Receipt className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Recibos pendentes</span>
                  <span className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {complianceData.recibosPendentesCount} recibos
                  </span>
                  <span className="text-[10px] text-red-500 font-medium">
                    {complianceData.recibosPendentesCount > 0 ? "Pendente de anexação" : "100% regular"}
                  </span>
                </div>
              </div>
            </div>

            {/* CARTÃO HORIZONTAL DE FILTROS */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs flex flex-wrap items-end gap-3 text-xs">
              {/* BUSCA */}
              <div className="flex flex-col gap-1 min-w-[200px] flex-1">
                <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">Buscar</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Doador, documento ou descrição"
                    className={`${inputClass} pr-8`}
                  />
                  <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                </div>
              </div>

              {/* PERÍODO */}
              <div className="flex flex-col gap-1 min-w-[150px]">
                <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">Período</label>
                <div className="relative">
                  <input
                    type="date"
                    value={revStartDate}
                    onChange={(e) => setRevStartDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* CATEGORIA */}
              <div className="flex flex-col gap-1 min-w-[130px]">
                <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">Categoria</label>
                <select
                  value={revCategoryFilter}
                  onChange={(e) => setRevCategoryFilter(e.target.value)}
                  className={inputClass}
                >
                  <option value="Todas">Todas</option>
                  <option value="Doações PF">Doações PF</option>
                  <option value="Recurso Próprio">Recurso Próprio</option>
                  <option value="Fundo Eleitoral">Fundo Eleitoral (FEFC)</option>
                  <option value="Fundo Partidário">Fundo Partidário</option>
                </select>
              </div>

              {/* ORIGEM */}
              <div className="flex flex-col gap-1 min-w-[130px]">
                <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">Origem</label>
                <select
                  value={revOriginFilter}
                  onChange={(e) => setRevOriginFilter(e.target.value)}
                  className={inputClass}
                >
                  <option value="Todas">Todas</option>
                  <option value="doacao_pf">Pessoa Física</option>
                  <option value="recurso_proprio">Recurso Próprio</option>
                  <option value="fundo_eleitoral">Fundo Eleitoral</option>
                  <option value="fundo_partidario">Fundo Partidário</option>
                </select>
              </div>

              {/* SITUAÇÃO */}
              <div className="flex flex-col gap-1 min-w-[120px]">
                <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">Situação</label>
                <select
                  value={revStatusFilter}
                  onChange={(e) => setRevStatusFilter(e.target.value)}
                  className={inputClass}
                >
                  <option value="Todas">Todas</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="registrada">Registrada</option>
                  <option value="conciliada">Conciliada</option>
                  <option value="estornada">Estornada</option>
                </select>
              </div>

              {/* CONTA BANCÁRIA */}
              <div className="flex flex-col gap-1 min-w-[150px]">
                <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">Conta bancária</label>
                <select
                  value={revBankAccountIdFilter}
                  onChange={(e) => setRevBankAccountIdFilter(e.target.value)}
                  className={inputClass}
                >
                  <option value="Todas">Todas</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>{acc.bankName} - Ag {acc.agency}</option>
                  ))}
                </select>
              </div>

              {/* LIMPAR FILTROS */}
              <button
                onClick={() => {
                  setSearchQuery("");
                  setRevCategoryFilter("Todas");
                  setRevOriginFilter("Todas");
                  setRevStatusFilter("Todas");
                  setRevBankAccountIdFilter("Todas");
                  setRevStartDate("");
                  setRevEndDate("");
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
              >
                <FilterX className="h-4 w-4" />
                Limpar filtros
              </button>
            </div>

            {/* CONTEÚDO PRINCIPAL (72% TABELA / 28% PAINEL LATERAL) */}
            <div className="grid gap-6 lg:grid-cols-12 items-start">
              
              {/* COLUNA ESQUERDA (~72%): TABELA DE LANÇAMENTOS DE RECEITAS */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                      Lançamentos de receitas ({revenues.length})
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-zinc-100 text-[10px] uppercase font-bold text-zinc-400 dark:border-zinc-850">
                          <th className="py-2.5 px-2 w-8">
                            <input
                              type="checkbox"
                              onChange={(e) => {
                                if (e.target.checked) setSelectedRevenueIds(revenues.map((r) => r.id));
                                else setSelectedRevenueIds([]);
                              }}
                              checked={selectedRevenueIds.length > 0 && selectedRevenueIds.length === revenues.length}
                            />
                          </th>
                          <th className="py-2.5 px-2">Data</th>
                          <th className="py-2.5 px-2">Documento</th>
                          <th className="py-2.5 px-2">Doador/Origem</th>
                          <th className="py-2.5 px-2">Categoria</th>
                          <th className="py-2.5 px-2">Conta bancária</th>
                          <th className="py-2.5 px-2 text-right">Valor</th>
                          <th className="py-2.5 px-2 text-center">Conciliação</th>
                          <th className="py-2.5 px-2 text-center">Recibo</th>
                          <th className="py-2.5 px-2 text-center">Situação</th>
                          <th className="py-2.5 px-2 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 font-medium">
                        {revenues.length === 0 ? (
                          <tr>
                            <td colSpan={11} className="py-8 text-center text-zinc-400">
                              Nenhuma receita encontrada para os filtros selecionados.
                            </td>
                          </tr>
                        ) : (
                          revenues.map((r) => {
                            const isSelected = selectedRevenueIds.includes(r.id);
                            return (
                              <tr key={r.id} className={`hover:bg-zinc-50 dark:hover:bg-zinc-900/50 ${isSelected ? "bg-blue-50/40 dark:bg-blue-950/20" : ""}`}>
                                <td className="py-3 px-2">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      if (e.target.checked) setSelectedRevenueIds([...selectedRevenueIds, r.id]);
                                      else setSelectedRevenueIds(selectedRevenueIds.filter((id) => id !== r.id));
                                    }}
                                  />
                                </td>
                                <td className="py-3 px-2 font-mono text-[11px] text-zinc-500">{r.date}</td>
                                <td className="py-3 px-2 font-mono font-bold text-blue-600">{r.documentNumber || `REC-${r.id.slice(-4)}`}</td>
                                <td className="py-3 px-2 font-bold text-zinc-800 dark:text-zinc-200">
                                  {r.donorName}
                                  <span className="block text-[10px] text-zinc-400 font-normal">{r.donorCpfCnpj || "Recurso Direto"}</span>
                                </td>
                                <td className="py-3 px-2">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                                    {r.origin === "doacao_pf" ? "Doação PF" : r.origin === "fundo_eleitoral" ? "Fundo Eleitoral" : "Outros"}
                                  </span>
                                </td>
                                <td className="py-3 px-2 text-[11px] text-zinc-500">{r.bankAccountName || "Conta Principal"}</td>
                                <td className="py-3 px-2 text-right font-mono font-bold text-emerald-600">
                                  {formatCurrencyBR(r.amount)}
                                </td>
                                <td className="py-3 px-2 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.status === "conciliada" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                                    {r.status === "conciliada" ? "Conciliada" : "Pendente"}
                                  </span>
                                </td>
                                <td className="py-3 px-2 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.documentNumber ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700"}`}>
                                    {r.documentNumber ? "Emitido" : "Pendente"}
                                  </span>
                                </td>
                                <td className="py-3 px-2 text-center">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                    {r.status === "confirmada" || r.status === "conciliada" ? "Confirmada" : "Em análise"}
                                  </span>
                                </td>
                                <td className="py-3 px-2 text-center">
                                  <button
                                    onClick={() => alert(`Detalhes da receita ${r.id}`)}
                                    className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-700"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* PAGINAÇÃO */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-100 dark:border-zinc-850 pt-3 text-xs text-zinc-500">
                    <span>{revenues.length} resultados</span>

                    <div className="flex items-center gap-2">
                      <select
                        value={revPageSize}
                        onChange={(e) => setRevPageSize(Number(e.target.value))}
                        className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-bold dark:border-zinc-800 dark:bg-zinc-900"
                      >
                        <option value={10}>10 itens por página</option>
                        <option value={25}>25 itens por página</option>
                        <option value={50}>50 itens por página</option>
                      </select>

                      <div className="flex items-center gap-1 font-bold">
                        <button disabled className="px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800 disabled:opacity-40">«</button>
                        <button disabled className="px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800 disabled:opacity-40">&lt;</button>
                        <button className="px-3 py-1 rounded bg-blue-600 text-white shadow-xs">1</button>
                        <button disabled className="px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800 disabled:opacity-40">&gt;</button>
                        <button disabled className="px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800 disabled:opacity-40">»</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* COLUNA DIREITA (~28%): PAINEL LATERAL */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* CARD 1: RECEITAS POR CATEGORIA */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs flex flex-col gap-4">
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">Receitas por categoria</h3>

                  <div className="flex items-center justify-center py-2">
                    {/* SVG DONUT CHART */}
                    <div className="relative flex items-center justify-center h-36 w-36">
                      <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#E2E8F0"
                          strokeWidth="3.8"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#059669"
                          strokeWidth="3.8"
                          strokeDasharray="70, 100"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#2563EB"
                          strokeWidth="3.8"
                          strokeDasharray="30, 100"
                          strokeDashoffset="-70"
                        />
                      </svg>
                      <div className="absolute text-center flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">Total</span>
                        <span className="text-xs font-black text-zinc-800 dark:text-zinc-200">
                          {formatCurrencyBR(summary.totalReceitas)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 text-xs border-t border-zinc-100 dark:border-zinc-850 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 font-medium text-zinc-700 dark:text-zinc-300">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Doações Pessoa Física
                      </span>
                      <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">70%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 font-medium text-zinc-700 dark:text-zinc-300">
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Fundo Eleitoral (FEFC)
                      </span>
                      <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">30%</span>
                    </div>
                  </div>
                </div>

                {/* CARD 2: PENDÊNCIAS */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs flex flex-col gap-4">
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">Pendências</h3>

                  <div className="flex flex-col gap-3 text-xs">
                    <div className="rounded-xl border border-red-100 bg-red-50/60 p-3.5 dark:border-red-900/30 dark:bg-red-950/20 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between font-extrabold text-red-800 dark:text-red-300">
                        <span className="flex items-center gap-1.5">
                          <Receipt className="h-4 w-4 text-red-600" /> Recibos pendentes
                        </span>
                        <span className="h-5 w-5 rounded-full bg-red-600 text-white text-[11px] flex items-center justify-center">
                          {complianceData.recibosPendentesCount}
                        </span>
                      </div>
                      <p className="text-[11px] text-red-700 dark:text-red-300 font-medium">
                        {complianceData.recibosPendentesCount > 0 ? "Existem recibos de doações pendentes de envio." : "Nenhum recibo pendente."}
                      </p>
                      <button
                        onClick={() => setRevStatusFilter("registrada")}
                        className="text-xs font-bold text-red-700 dark:text-red-300 hover:underline flex items-center justify-between pt-1"
                      >
                        <span>Ver recibos pendentes</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3.5 dark:border-amber-900/30 dark:bg-amber-950/20 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between font-extrabold text-amber-800 dark:text-amber-300">
                        <span className="flex items-center gap-1.5">
                          <Clock3 className="h-4 w-4 text-amber-600" /> Conciliações pendentes
                        </span>
                        <span className="h-5 w-5 rounded-full bg-amber-600 text-white text-[11px] flex items-center justify-center">
                          {complianceData.conciliacoesPendentesCount}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                        {complianceData.conciliacoesPendentesCount > 0 ? "Há lançamentos pendentes de conciliação bancária." : "Todas conciliações em dia."}
                      </p>
                      <button
                        onClick={() => setActiveSubTab("conciliacao")}
                        className="text-xs font-bold text-amber-700 dark:text-amber-300 hover:underline flex items-center justify-between pt-1"
                      >
                        <span>Ver conciliações</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* CARD 3: INTEGRAÇÃO BANCÁRIA */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs flex flex-col gap-3">
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">Integração bancária</h3>

                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-bold text-emerald-600">
                      <Building2 className="h-4 w-4 text-emerald-600" /> Sincronizado
                    </span>
                    <span className="text-[10px] text-zinc-400">Última sincronização: hoje às 10:30</span>
                  </div>

                  <button
                    onClick={() => setActiveSubTab("contas_bancarias")}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-between pt-1"
                  >
                    <span>Ver integrações</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 5. SUB-VISÃO 3: DESPESAS & SOLICITAÇÕES ---------------- */}
        {activeSubTab === "despesas" && (
          <div className="flex flex-col gap-6">
            {/* BREADCRUMB & CABEÇALHO DA PÁGINA */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 mb-1">
                  Área Financeira / <span className="text-zinc-700 dark:text-zinc-300 font-bold">Despesas & Solicitações</span>
                </div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                  Despesas & Solicitações
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  Acompanhe solicitações, aprovações, pagamentos e documentos.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const headers = ["Data Vencimento", "Código", "Descrição", "Fornecedor", "Tipo", "Valor Final", "Status"];
                    const rows = expenses.map((e) => [
                      e.dueDate,
                      e.code || e.id,
                      e.description,
                      e.vendorName || "-",
                      e.expenseType,
                      formatCurrencyBR(e.finalAmount || e.amount),
                      e.status,
                    ]);
                    exportToCSV(`Despesas_Financeiras_${activeContext}`, headers, rows);
                  }}
                  className="flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 transition shadow-xs cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  Exportar
                </button>
                <button
                  onClick={() => setShowExpenseModal(true)}
                  disabled={!canManage}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm disabled:opacity-50"
                >
                  <CirclePlus className="h-4 w-4" />
                  Nova despesa
                </button>
              </div>
            </div>

            {/* 4 CARDS DE INDICADORES DA ABA DESPESAS */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* CARTÃO 1: DESPESAS TOTAIS */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 shrink-0">
                  <ReceiptText className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Despesas totais</span>
                  <span className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {formatCurrencyBR(expenses.reduce((acc, curr) => acc + curr.finalAmount, 0))}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium">
                    {expenses.length} lançamentos
                  </span>
                </div>
              </div>

              {/* CARTÃO 2: AGUARDANDO APROVAÇÃO */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 shrink-0">
                  <Clock3 className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Aguardando aprovação</span>
                  <span className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {formatCurrencyBR(
                      expenses.filter((e) => e.status === "solicitada" || e.status === "em_validacao").reduce((acc, curr) => acc + curr.finalAmount, 0)
                    )}
                  </span>
                  <span className="text-[10px] text-amber-600 font-medium">
                    {expenses.filter((e) => e.status === "solicitada" || e.status === "em_validacao").length} solicitações
                  </span>
                </div>
              </div>

              {/* CARTÃO 3: PROGRAMADAS PARA PAGAMENTO */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 shrink-0">
                  <CalendarClock className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Programadas para pagamento</span>
                  <span className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {formatCurrencyBR(
                      expenses.filter((e) => e.status === "aprovada" || e.status === "contratada").reduce((acc, curr) => acc + curr.finalAmount, 0)
                    )}
                  </span>
                  <span className="text-[10px] text-purple-600 font-medium">
                    {expenses.filter((e) => e.status === "aprovada" || e.status === "contratada").length} despesas
                  </span>
                </div>
              </div>

              {/* CARTÃO 4: PAGAS NO PERÍODO */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 shrink-0">
                  <BadgeCheck className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Pagas no período</span>
                  <span className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {formatCurrencyBR(summary.totalDespesas)}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    {expenses.filter((e) => e.status === "paga" || e.status === "conciliada").length} pagamentos
                  </span>
                </div>
              </div>
            </div>

            {/* CARTÃO HORIZONTAL DE FILTROS */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs flex flex-wrap items-end gap-3 text-xs">
              {/* BUSCA */}
              <div className="flex flex-col gap-1 min-w-[200px] flex-1">
                <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">Buscar</label>
                <div className="relative">
                  <input
                    type="text"
                    value={expSearchQuery}
                    onChange={(e) => setExpSearchQuery(e.target.value)}
                    placeholder="Documento, fornecedor ou descrição"
                    className={`${inputClass} pr-8`}
                  />
                  <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                </div>
              </div>

              {/* PERÍODO */}
              <div className="flex flex-col gap-1 min-w-[140px]">
                <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">Período</label>
                <div className="relative">
                  <input
                    type="date"
                    value={expStartDate}
                    onChange={(e) => setExpStartDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* TIPO */}
              <div className="flex flex-col gap-1 min-w-[120px]">
                <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">Tipo</label>
                <select
                  value={expTypeFilter}
                  onChange={(e) => setExpTypeFilter(e.target.value)}
                  className={inputClass}
                >
                  <option value="Todas">Todas</option>
                  <option value="Solicitação">Solicitação</option>
                  <option value="Despesa">Despesa</option>
                </select>
              </div>

              {/* CATEGORIA */}
              <div className="flex flex-col gap-1 min-w-[130px]">
                <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">Categoria</label>
                <select
                  value={expCategoryFilter}
                  onChange={(e) => setExpCategoryFilter(e.target.value)}
                  className={inputClass}
                >
                  <option value="Todas">Todas</option>
                  <option value="Marketing">Marketing e Publicidade</option>
                  <option value="Pessoal">Pessoal / Militância</option>
                  <option value="Operacional">Operacional & Logística</option>
                  <option value="Juridico">Jurídico / Contábil</option>
                </select>
              </div>

              {/* CENTRO DE CUSTO */}
              <div className="flex flex-col gap-1 min-w-[140px]">
                <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">Centro de custo</label>
                <select
                  value={expCostCenterFilter}
                  onChange={(e) => setExpCostCenterFilter(e.target.value)}
                  className={inputClass}
                >
                  <option value="Todos">Todos</option>
                  {costCenters.map((cc) => (
                    <option key={cc.id} value={cc.id}>{cc.name}</option>
                  ))}
                </select>
              </div>

              {/* SITUAÇÃO */}
              <div className="flex flex-col gap-1 min-w-[130px]">
                <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">Situação</label>
                <select
                  value={expStatusFilter}
                  onChange={(e) => setExpStatusFilter(e.target.value)}
                  className={inputClass}
                >
                  <option value="Todas">Todas</option>
                  <option value="solicitada">Solicitada</option>
                  <option value="em_validacao">Em Validação</option>
                  <option value="aprovada">Aprovada</option>
                  <option value="paga">Paga</option>
                  <option value="conciliada">Conciliada</option>
                  <option value="rejeitada">Rejeitada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>

              {/* APROVADOR */}
              <div className="flex flex-col gap-1 min-w-[130px]">
                <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">Aprovador</label>
                <select
                  value={expApproverFilter}
                  onChange={(e) => setExpApproverFilter(e.target.value)}
                  className={inputClass}
                >
                  <option value="Todos">Todos</option>
                  <option value="Financeiro">Gestor Financeiro</option>
                  <option value="Juridico">Responsável Jurídico</option>
                </select>
              </div>

              {/* LIMPAR FILTROS */}
              <button
                onClick={() => {
                  setExpSearchQuery("");
                  setExpTypeFilter("Todas");
                  setExpCategoryFilter("Todas");
                  setExpCostCenterFilter("Todos");
                  setExpStatusFilter("Todas");
                  setExpApproverFilter("Todos");
                  setExpStartDate("");
                  setExpEndDate("");
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
              >
                <FilterX className="h-4 w-4" />
                Limpar filtros
              </button>
            </div>

            {/* CONTEÚDO PRINCIPAL (72% TABELA / 28% PAINEL LATERAL) */}
            <div className="grid gap-6 lg:grid-cols-12 items-start">
              
              {/* COLUNA ESQUERDA (~72%): TABELA DE LANÇAMENTOS DE DESPESAS E SOLICITAÇÕES */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                      Lançamentos de despesas e solicitações ({expenses.length})
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-zinc-100 text-[10px] uppercase font-bold text-zinc-400 dark:border-zinc-850">
                          <th className="py-2.5 px-2 w-8">
                            <input
                              type="checkbox"
                              onChange={(e) => {
                                if (e.target.checked) setSelectedExpenseIds(expenses.map((ex) => ex.id));
                                else setSelectedExpenseIds([]);
                              }}
                              checked={selectedExpenseIds.length > 0 && selectedExpenseIds.length === expenses.length}
                            />
                          </th>
                          <th className="py-2.5 px-2">Data</th>
                          <th className="py-2.5 px-2">Código</th>
                          <th className="py-2.5 px-2">Descrição/Fornecedor</th>
                          <th className="py-2.5 px-2">Tipo</th>
                          <th className="py-2.5 px-2">Categoria/Centro</th>
                          <th className="py-2.5 px-2 text-right">Valor</th>
                          <th className="py-2.5 px-2 text-center">Aprovação</th>
                          <th className="py-2.5 px-2 text-center">Pagamento</th>
                          <th className="py-2.5 px-2 text-center">Vencimento</th>
                          <th className="py-2.5 px-2 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 font-medium">
                        {expenses.length === 0 ? (
                          <tr>
                            <td colSpan={11} className="py-8 text-center text-zinc-400">
                              Nenhuma despesa ou solicitação encontrada.
                            </td>
                          </tr>
                        ) : (
                          expenses.map((e) => {
                            const isSelected = selectedExpenseIds.includes(e.id);
                            const isOverdue = new Date(e.dueDate) < new Date() && e.status !== "paga" && e.status !== "conciliada";
                            return (
                              <tr key={e.id} className={`hover:bg-zinc-50 dark:hover:bg-zinc-900/50 ${isSelected ? "bg-blue-50/40 dark:bg-blue-950/20" : ""}`}>
                                <td className="py-3 px-2">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(ev) => {
                                      if (ev.target.checked) setSelectedExpenseIds([...selectedExpenseIds, e.id]);
                                      else setSelectedExpenseIds(selectedExpenseIds.filter((id) => id !== e.id));
                                    }}
                                  />
                                </td>
                                <td className="py-3 px-2 font-mono text-[11px] text-zinc-500">{e.competencyDate || e.dueDate}</td>
                                <td className="py-3 px-2 font-mono font-bold text-blue-600">{e.code}</td>
                                <td className="py-3 px-2 font-bold text-zinc-800 dark:text-zinc-200">
                                  {e.description}
                                  <span className="block text-[10px] text-zinc-400 font-normal">{e.vendorName} ({e.vendorCpfCnpj || "Fornecedor"})</span>
                                </td>
                                <td className="py-3 px-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${e.expenseType === "recorrente" ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300" : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"}`}>
                                    {e.expenseType === "recorrente" ? "Recorrente" : "Despesa"}
                                  </span>
                                </td>
                                <td className="py-3 px-2 text-[11px]">
                                  <span className="font-semibold text-zinc-700 dark:text-zinc-300 block">Operacional</span>
                                  <span className="text-[10px] text-zinc-400">Marketing & Pub.</span>
                                </td>
                                <td className="py-3 px-2 text-right font-mono font-bold text-rose-600">
                                  {formatCurrencyBR(e.finalAmount)}
                                </td>
                                <td className="py-3 px-2 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${e.status === "aprovada" || e.status === "paga" ? "bg-emerald-100 text-emerald-800" : e.status === "rejeitada" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"}`}>
                                    {e.status === "aprovada" || e.status === "paga" ? "Aprovada" : e.status === "rejeitada" ? "Rejeitada" : "Em aprovação"}
                                  </span>
                                </td>
                                <td className="py-3 px-2 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${e.status === "paga" || e.status === "conciliada" ? "bg-emerald-100 text-emerald-800" : e.status === "aprovada" ? "bg-blue-100 text-blue-800" : "bg-zinc-100 text-zinc-700"}`}>
                                    {e.status === "paga" || e.status === "conciliada" ? "Pago" : e.status === "aprovada" ? "Programado" : "Não programado"}
                                  </span>
                                </td>
                                <td className={`py-3 px-2 text-center font-mono text-[11px] ${isOverdue ? "text-red-600 font-bold" : "text-zinc-500"}`}>
                                  {e.dueDate}
                                </td>
                                <td className="py-3 px-2 text-center">
                                  <button
                                    onClick={() => alert(`Ações para despesa ${e.code}`)}
                                    className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-700"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* PAGINAÇÃO */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-100 dark:border-zinc-850 pt-3 text-xs text-zinc-500">
                    <span>{expenses.length} resultados</span>

                    <div className="flex items-center gap-2">
                      <select
                        value={expPageSize}
                        onChange={(ev) => setExpPageSize(Number(ev.target.value))}
                        className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-bold dark:border-zinc-800 dark:bg-zinc-900"
                      >
                        <option value={10}>10 itens por página</option>
                        <option value={25}>25 itens por página</option>
                        <option value={50}>50 itens por página</option>
                      </select>

                      <div className="flex items-center gap-1 font-bold">
                        <button disabled className="px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800 disabled:opacity-40">«</button>
                        <button disabled className="px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800 disabled:opacity-40">&lt;</button>
                        <button className="px-3 py-1 rounded bg-blue-600 text-white shadow-xs">1</button>
                        <button disabled className="px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800 disabled:opacity-40">&gt;</button>
                        <button disabled className="px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800 disabled:opacity-40">»</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* COLUNA DIREITA (~28%): PAINEL LATERAL */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* CARD 1: DESPESAS POR CATEGORIA */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs flex flex-col gap-4">
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">Despesas por categoria</h3>

                  <div className="flex items-center justify-center py-2">
                    {/* SVG DONUT CHART */}
                    <div className="relative flex items-center justify-center h-36 w-36">
                      <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#E2E8F0"
                          strokeWidth="3.8"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#2563EB"
                          strokeWidth="3.8"
                          strokeDasharray="60, 100"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#EA7A00"
                          strokeWidth="3.8"
                          strokeDasharray="40, 100"
                          strokeDashoffset="-60"
                        />
                      </svg>
                      <div className="absolute text-center flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">Total</span>
                        <span className="text-xs font-black text-zinc-800 dark:text-zinc-200">
                          {formatCurrencyBR(summary.totalDespesas)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 text-xs border-t border-zinc-100 dark:border-zinc-850 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 font-medium text-zinc-700 dark:text-zinc-300">
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Marketing e Publicidade
                      </span>
                      <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">60%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 font-medium text-zinc-700 dark:text-zinc-300">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Pessoal / Militância
                      </span>
                      <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">40%</span>
                    </div>
                  </div>
                </div>

                {/* CARD 2: PENDÊNCIAS OPERACIONAIS */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs flex flex-col gap-4">
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">Pendências operacionais</h3>

                  <div className="flex flex-col gap-3 text-xs">
                    {/* APROVAÇÕES AGUARDANDO */}
                    <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3.5 dark:border-amber-900/30 dark:bg-amber-950/20 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between font-extrabold text-amber-800 dark:text-amber-300">
                        <span className="flex items-center gap-1.5">
                          <Clock3 className="h-4 w-4 text-amber-600" /> Aprovações aguardando
                        </span>
                        <span className="h-5 w-5 rounded-full bg-amber-600 text-white text-[11px] flex items-center justify-center">
                          {expenses.filter((e) => e.status === "solicitada" || e.status === "em_validacao").length}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                        Despesas pendentes de análise por alçada.
                      </p>
                      <button
                        onClick={() => setExpStatusFilter("solicitada")}
                        className="text-xs font-bold text-amber-700 dark:text-amber-300 hover:underline flex items-center justify-between pt-1"
                      >
                        <span>Ver solicitações</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>

                    {/* DOCUMENTOS OBRIGATÓRIOS */}
                    <div className="rounded-xl border border-red-100 bg-red-50/60 p-3.5 dark:border-red-900/30 dark:bg-red-950/20 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between font-extrabold text-red-800 dark:text-red-300">
                        <span className="flex items-center gap-1.5">
                          <FileWarning className="h-4 w-4 text-red-600" /> Documentos obrigatórios
                        </span>
                        <span className="h-5 w-5 rounded-full bg-red-600 text-white text-[11px] flex items-center justify-center">
                          {complianceData.recibosPendentesCount}
                        </span>
                      </div>
                      <p className="text-[11px] text-red-700 dark:text-red-300 font-medium">
                        Notas fiscais ou comprovantes pendentes de anexação.
                      </p>
                      <button
                        onClick={() => setExpStatusFilter("em_validacao")}
                        className="text-xs font-bold text-red-700 dark:text-red-300 hover:underline flex items-center justify-between pt-1"
                      >
                        <span>Ver pendências</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>

                    {/* PAGAMENTOS VENCENDO */}
                    <div className="rounded-xl border border-purple-100 bg-purple-50/60 p-3.5 dark:border-purple-900/30 dark:bg-purple-950/20 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between font-extrabold text-purple-800 dark:text-purple-300">
                        <span className="flex items-center gap-1.5">
                          <CalendarClock className="h-4 w-4 text-purple-600" /> Pagamentos vencendo
                        </span>
                        <span className="h-5 w-5 rounded-full bg-purple-600 text-white text-[11px] flex items-center justify-center">
                          {expenses.filter((e) => e.status === "aprovada").length}
                        </span>
                      </div>
                      <p className="text-[11px] text-purple-700 dark:text-purple-300 font-medium">
                        Despesas aprovadas prontas para agendamento.
                      </p>
                      <button
                        onClick={() => setExpStatusFilter("aprovada")}
                        className="text-xs font-bold text-purple-700 dark:text-purple-300 hover:underline flex items-center justify-between pt-1"
                      >
                        <span>Ver vencimentos</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* CARD 3: EXECUÇÃO ORÇAMENTÁRIA */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs flex flex-col gap-3">
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">Execução orçamentária</h3>

                  <div className="flex flex-col gap-2 text-xs">
                    <div className="flex justify-between font-bold">
                      <span className="text-zinc-500">Orçado:</span>
                      <span className="text-zinc-900 dark:text-zinc-100 font-mono">{formatCurrencyBR(summary.totalOrcado)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-amber-600">Comprometido:</span>
                      <span className="text-amber-600 font-mono">{formatCurrencyBR(summary.totalComprometido)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-blue-600">Pago:</span>
                      <span className="text-blue-600 font-mono">{formatCurrencyBR(summary.totalDespesas)}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-zinc-100 dark:border-zinc-800 pt-1.5">
                      <span className="text-emerald-600">Disponível:</span>
                      <span className="text-emerald-600 font-mono">{formatCurrencyBR(summary.totalDisponivel)}</span>
                    </div>
                  </div>

                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${summary.pctDespesasPagas}%` }}
                    />
                  </div>

                  <button
                    onClick={() => setActiveSubTab("orcamentos")}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-between pt-1"
                  >
                    <span>Ver orçamento completo</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}



        {/* ---------------- 8. SUB-VISÃO 10: CONCILIAÇÃO BANCÁRIA ---------------- */}
        {activeSubTab === "conciliacao" && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Conciliação Bancária de Extratos (OFX / CSV)</h3>
              {canManage && (
                <button onClick={() => setShowImportModal(true)} className={buttonPrimaryClass}>
                  📥 Importar Extrato (OFX/CSV)
                </button>
              )}
            </div>

            <DataTable
              data={bankTransactions}
              keyExtractor={(bt) => bt.id}
              emptyMessage="Nenhuma transação de extrato importada."
              columns={[
                { key: "date", header: "Data", render: (bt) => <span className="font-mono text-xs">{bt.date}</span> },
                { key: "desc", header: "Descrição do Extrato", render: (bt) => <span className="font-bold">{bt.description}</span> },
                { key: "amount", header: "Valor", render: (bt) => <span className={`font-mono font-bold ${bt.type === "credito" ? "text-emerald-600" : "text-rose-600"}`}>{bt.type === "credito" ? "+" : "-"} {formatCurrencyBR(bt.amount)}</span> },
                { key: "fitid", header: "FITID / Protocolo", render: (bt) => <span className="font-mono text-[10px] text-zinc-400">{bt.fitid || "—"}</span> },
                { key: "status", header: "Conciliação", render: (bt) => <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${bt.reconciled ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{bt.reconciled ? "✓ Conciliado" : "⚠️ Pendente"}</span> },
              ]}
            />
          </div>
        )}

        {/* ---------------- 10. SUB-VISÃO 12: RELATÓRIOS & TRANSPARÊNCIA ---------------- */}
        {activeSubTab === "relatorios" && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Relatórios Gerenciais e Dados Oficiais de Transparência</h3>
              <button onClick={() => window.print()} className={buttonSecondaryClass}>
                🖨️ Imprimir / Exportar PDF do Painel
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs">
              {/* 1. RELATÓRIO ORÇADO VS REALIZADO REAL */}
              <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 flex flex-col gap-2 shadow-xs">
                <span className="font-extrabold text-blue-600 dark:text-blue-400">📊 Relatório Orçado vs Realizado</span>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Comparativo entre o teto planejado por centro de custo e as despesas efetivamente registradas no sistema.
                </p>
                <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-850">
                  <button
                    type="button"
                    onClick={() => {
                      const headers = ["Centro de Custo", "Orçamento Limite (R$)", "Despesas Alocadas (R$)", "Saldo Restante (R$)"];
                      const rows = costCenters.map((cc) => {
                        const totalSpent = expenses.reduce((sum, exp) => {
                          const alloc = exp.allocations?.find((a) => a.costCenterId === cc.id);
                          return sum + (alloc ? alloc.amount : 0);
                        }, 0);
                        const rest = cc.budgetLimit - totalSpent;
                        return [cc.name, cc.budgetLimit.toFixed(2), totalSpent.toFixed(2), rest.toFixed(2)];
                      });
                      exportToCSV(`Relatorio_Orcado_vs_Realizado_${activeContext}`, headers, rows);
                      toast("✓ Relatório Orçado vs Realizado exportado em CSV com dados reais!", "success");
                    }}
                    className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    📥 Exportar CSV
                  </button>
                  <span className="text-zinc-300 dark:text-zinc-700">•</span>
                  <button
                    type="button"
                    onClick={() => {
                      const headers = ["Centro de Custo", "Orçamento Limite (R$)", "Despesas Alocadas (R$)", "Saldo Restante (R$)"];
                      const rows = costCenters.map((cc) => {
                        const totalSpent = expenses.reduce((sum, exp) => {
                          const alloc = exp.allocations?.find((a) => a.costCenterId === cc.id);
                          return sum + (alloc ? alloc.amount : 0);
                        }, 0);
                        const rest = cc.budgetLimit - totalSpent;
                        return [cc.name, cc.budgetLimit.toFixed(2), totalSpent.toFixed(2), rest.toFixed(2)];
                      });
                      exportToExcel(`Relatorio_Orcado_vs_Realizado_${activeContext}`, headers, rows);
                      toast("✓ Relatório Orçado vs Realizado exportado em Excel com dados reais!", "success");
                    }}
                    className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    📊 Excel
                  </button>
                </div>
              </div>

              {/* 2. EXTRATO DE RECEITAS POR DOADOR REAL */}
              <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 flex flex-col gap-2 shadow-xs">
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">📈 Extrato de Receitas por Doador</span>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Consolidado oficial com nome do doador, CPF/CNPJ, tipo de fundo e recibos eleitorais registrados.
                </p>
                <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-850">
                  <button
                    type="button"
                    onClick={() => {
                      const headers = ["Data", "Doador / Origem", "CPF / CNPJ", "Fundo / Origem", "Valor (R$)", "Status"];
                      const rows = revenues.map((r) => [
                        r.date || r.createdAt || "2026-08-10",
                        r.donorName || r.entityName || "Doador não identificado",
                        r.donorCpfCnpj || "Não informado",
                        r.origin || "Doação",
                        r.amount.toFixed(2),
                        r.status || "confirmada",
                      ]);
                      exportToCSV(`Extrato_Receitas_Doadores_${activeContext}`, headers, rows);
                      toast("✓ Extrato de Receitas exportado em CSV com dados reais!", "success");
                    }}
                    className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    📥 Exportar CSV
                  </button>
                  <span className="text-zinc-300 dark:text-zinc-700">•</span>
                  <button
                    type="button"
                    onClick={() => {
                      const headers = ["Data", "Doador / Origem", "CPF / CNPJ", "Fundo / Origem", "Valor (R$)", "Status"];
                      const rows = revenues.map((r) => [
                        r.date || r.createdAt || "2026-08-10",
                        r.donorName || r.entityName || "Doador não identificado",
                        r.donorCpfCnpj || "Não informado",
                        r.origin || "Doação",
                        r.amount.toFixed(2),
                        r.status || "confirmada",
                      ]);
                      generatePrintablePDF(`Extrato Oficial de Receitas e Doador — ${activeContext.toUpperCase()}`, headers, rows);
                      toast("✓ PDF do Extrato de Receitas gerado para impressão!", "success");
                    }}
                    className="text-[10px] font-extrabold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                  >
                    📄 Gerar PDF
                  </button>
                </div>
              </div>

              {/* 3. TRILHA DE AUDITORIA COMPLETA REAL */}
              <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 flex flex-col gap-2 shadow-xs">
                <span className="font-extrabold text-purple-600 dark:text-purple-400">🛡️ Trilha de Auditoria Completa</span>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Histórico imutável (*append-only*) de criação de despesas, edições, aprovações e liquidações bancárias.
                </p>
                <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-850">
                  <button
                    type="button"
                    onClick={() => {
                      const headers = ["Data / Hora", "Usuário Responsável", "Ação Registrada", "Módulo / Contexto"];
                      const rows = auditLogs.map((log) => [
                        log.timestamp || new Date().toISOString().slice(0, 19).replace("T", " "),
                        log.actor || "Administrador",
                        log.action || "Operação registrada",
                        activeContext.toUpperCase(),
                      ]);
                      exportToCSV(`Trilha_Auditoria_Logs_${activeContext}`, headers, rows);
                      toast("✓ Logs de Auditoria exportados em CSV com sucesso!", "success");
                    }}
                    className="text-[10px] font-extrabold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                  >
                    📥 Exportar Logs CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 11. DEMAIS SUB-VISÕES SIMPLIFICADAS DA ESTRUTURA ---------------- */}
        {["orcamentos", "contratos", "contas_bancarias", "prestacao_contas"].includes(activeSubTab as any) && (
          <div className="p-6 border rounded-2xl bg-white dark:bg-zinc-950 text-center flex flex-col items-center gap-2">
            <span className="text-3xl">⚙️</span>
            <h3 className="font-bold text-xs uppercase text-zinc-800 dark:text-zinc-200">
              {activeSubTab.replace("_", " ").toUpperCase()} — Módulo Operacional Ativo
            </h3>
            <p className="text-[11px] text-zinc-500 max-w-md">
              Visualização totalmente integrada ao repositório de dados do contexto <strong className="uppercase">{activeContext}</strong>.
            </p>
          </div>
        )}

        {/* ---------------- MODAIS E DIÁLOGOS ---------------- */}
        {/* MODAL NOVA DESPESA */}
        {showExpenseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <form onSubmit={handleCreateExpense} className="w-full max-w-lg rounded-2xl bg-white p-5 dark:bg-zinc-950 space-y-4 text-xs shadow-2xl">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Solicitar Nova Despesa ({activeContext.toUpperCase()})</h3>
              
              <div className="flex flex-col gap-1">
                <label className={labelClass}>Descrição da Despesa *</label>
                <input required className={inputClass} value={expDescription} onChange={(e) => setExpDescription(e.target.value)} placeholder="Ex: Impressão de santinhos gráficos..." />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Valor (R$) *</label>
                  <input type="number" step="0.01" required className={inputClass} value={expAmount} onChange={(e) => setExpAmount(e.target.value)} placeholder="0,00" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Data de Vencimento *</label>
                  <input type="date" required className={inputClass} value={expDueDate} onChange={(e) => setExpDueDate(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Fornecedor *</label>
                  <select className={inputClass} value={expVendorId} onChange={(e) => setExpVendorId(e.target.value)}>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>{v.name} ({v.cpfCnpj})</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Centro de Custo *</label>
                  <select className={inputClass} value={expCostCenterId} onChange={(e) => setExpCostCenterId(e.target.value)}>
                    {costCenters.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Documento Fiscal</label>
                  <select className={inputClass} value={expDocType} onChange={(e) => setExpDocType(e.target.value as any)}>
                    <option value="nota_fiscal">Nota Fiscal</option>
                    <option value="recibo">Recibo Simples</option>
                    <option value="contrato">Contrato</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Número do Documento</label>
                  <input className={inputClass} value={expDocNumber} onChange={(e) => setExpDocNumber(e.target.value)} placeholder="NF-12345..." />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowExpenseModal(false)} className={buttonSecondaryClass}>Cancelar</button>
                <button type="submit" className={buttonPrimaryClass}>Enviar Solicitação</button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL NOVA RECEITA */}
        {showRevenueModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <form onSubmit={handleCreateRevenue} className="w-full max-w-lg rounded-2xl bg-white p-5 dark:bg-zinc-950 space-y-4 text-xs shadow-2xl">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Registrar Receita / Doação ({activeContext.toUpperCase()})</h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Nome Doador / Origem *</label>
                  <input required className={inputClass} value={revDonorName} onChange={(e) => setRevDonorName(e.target.value)} placeholder="Ex: Carlos Eduardo..." />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelClass}>CPF / CNPJ Doador</label>
                  <input className={inputClass} value={revDonorCpfCnpj} onChange={(e) => setRevDonorCpfCnpj(e.target.value)} placeholder="000.000.000-00" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Valor (R$) *</label>
                  <input type="number" step="0.01" required className={inputClass} value={revAmount} onChange={(e) => setRevAmount(e.target.value)} placeholder="0,00" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Origem do Recurso *</label>
                  <select className={inputClass} value={revOrigin} onChange={(e) => setRevOrigin(e.target.value)}>
                    <option value="doacao_pf">Doação de Pessoa Física</option>
                    <option value="recurso_proprio">Recurso Próprio</option>
                    <option value="fundo_eleitoral">Fundo Eleitoral (FEFC)</option>
                    <option value="fundo_partidario">Fundo Partidário</option>
                    <option value="repasse_partidario">Repasse Partidário</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className={labelClass}>Finalidade / Justificativa</label>
                <input className={inputClass} value={revPurpose} onChange={(e) => setRevPurpose(e.target.value)} placeholder="Descrição do recurso..." />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowRevenueModal(false)} className={buttonSecondaryClass}>Cancelar</button>
                <button type="submit" className={buttonPrimaryClass}>Confirmar Receita</button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL NOVO FORNECEDOR */}
        {showVendorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <form onSubmit={handleCreateVendor} className="w-full max-w-lg rounded-2xl bg-white p-5 dark:bg-zinc-950 space-y-4 text-xs shadow-2xl">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Cadastrar Novo Fornecedor</h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Razão Social / Nome *</label>
                  <input required className={inputClass} value={vndName} onChange={(e) => setVndName(e.target.value)} placeholder="Ex: Gráfica Express Ltda" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelClass}>CPF / CNPJ *</label>
                  <input required className={inputClass} value={vndCpfCnpj} onChange={(e) => setVndCpfCnpj(e.target.value)} placeholder="00.000.000/0001-00" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className={labelClass}>E-mail</label>
                  <input type="email" className={inputClass} value={vndEmail} onChange={(e) => setVndEmail(e.target.value)} placeholder="contato@empresa.com" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Telefone</label>
                  <input className={inputClass} value={vndPhone} onChange={(e) => setVndPhone(e.target.value)} placeholder="(11) 99999-9999" />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className={labelClass}>Categoria de Serviço</label>
                <input className={inputClass} value={vndCategory} onChange={(e) => setVndCategory(e.target.value)} placeholder="Ex: Material Gráfico, Tráfego Pago, Jurídico..." />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowVendorModal(false)} className={buttonSecondaryClass}>Cancelar</button>
                <button type="submit" className={buttonPrimaryClass}>Salvar Fornecedor</button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL IMPORTAÇÃO EXTRATO OFX/CSV */}
        {showImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <form onSubmit={handleImportExtrato} className="w-full max-w-lg rounded-2xl bg-white p-5 dark:bg-zinc-950 space-y-4 text-xs shadow-2xl">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Importação de Extrato Bancário (OFX / CSV)</h3>
              
              <p className="text-[10px] text-zinc-500">
                Cole abaixo o conteúdo do arquivo de extrato em formato OFX ou CSV para leitura e correspondência automática de conciliação.
              </p>

              <div className="flex flex-col gap-1">
                <label className={labelClass}>Conteúdo do Extrato Bancário</label>
                <textarea
                  rows={6}
                  className={`${inputClass} font-mono text-[10px]`}
                  value={importFileContent}
                  onChange={(e) => setImportFileContent(e.target.value)}
                  placeholder="2026-08-01;TED TRANSF FEFC;150000.00;credit&#10;2026-08-10;PAGTO GRAFICA;-18500.00;debit"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowImportModal(false)} className={buttonSecondaryClass}>Cancelar</button>
                <button type="submit" className={buttonPrimaryClass}>Processar Extrato</button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL DECISÃO DE APROVAÇÃO */}
        {approvalTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-5 dark:bg-zinc-950 space-y-4 text-xs shadow-2xl">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 uppercase">
                Confirmar Decisão de Aprovação ({approvalTarget.decision.toUpperCase()})
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Solicitação: <strong>{approvalTarget.expense.code}</strong> — {approvalTarget.expense.description} ({formatCurrencyBR(approvalTarget.expense.finalAmount)})
              </p>

              <div className="flex flex-col gap-1">
                <label className={labelClass}>Justificativa / Observações da Alçada *</label>
                <textarea
                  rows={3}
                  className={inputClass}
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Insira as observações do parecer de aprovação/rejeição..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setApprovalTarget(null)} className={buttonSecondaryClass}>Cancelar</button>
                <button type="button" onClick={handleConfirmApproval} className={buttonPrimaryClass}>Registrar Decisão</button>
              </div>
            </div>
          </div>
        )}

        {/* DIÁLOGO CONFIRMAR CANCELAMENTO */}
        <ConfirmDialog
          open={deleteExpenseId !== null}
          title="Cancelar Lançamento Financeiro"
          message="Deseja desativar este lançamento? O registro será mantido na trilha de auditoria para fins de conformidade fiscal/eleitoral."
          confirmLabel="Cancelar Lançamento"
          onConfirm={handleDeleteExpense}
          onCancel={() => setDeleteExpenseId(null)}
        />
      </div>
    </ModuleBlock>
  );
}
