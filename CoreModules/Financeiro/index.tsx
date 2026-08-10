"use client";

import { useEffect, useState } from "react";
import { ModuleBlock } from "@/components/dashboard/ModuleBlock";
import { DataTable } from "@/components/dashboard/DataTable";
import { RoleHint } from "@/components/dashboard/RoleHint";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { buttonPrimaryClass, buttonSecondaryClass, inputClass, labelClass } from "@/components/dashboard/form-styles";
import { useDashboard } from "@/contexts/DashboardProvider";
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
  const canManage = can("financeiro:gerenciar");

  // ── SELETOR DO CONTEXTO ATIVO ───────────────────────────────────────────────
  const [activeContext, setActiveContext] = useState<FinancialContextType>("campanha");
  const [activeSubTab, setActiveSubTab] = useState<
    | "visao_geral"
    | "receitas"
    | "despesas"
    | "contas_pagar_receber"
    | "aprovacoes"
    | "orcamentos"
    | "fornecedores"
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

  const [summary, setSummary] = useState({
    totalReceitas: 0,
    totalDespesas: 0,
    saldoLiquido: 0,
    totalOrcado: 0,
    totalComprometido: 0,
    totalDisponivel: 0,
    alertasPendentesCount: 0,
  });

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
            { id: "visao_geral", label: "📊 Visão Geral" },
            { id: "receitas", label: "📈 Receitas" },
            { id: "despesas", label: "📉 Despesas & Solicitações" },
            { id: "contas_pagar_receber", label: "🗓️ Contas Pagar/Receber" },
            { id: "aprovacoes", label: "✅ Aprovações" },
            { id: "orcamentos", label: "🎯 Orçamentos & Centros" },
            { id: "fornecedores", label: "🏢 Fornecedores" },
            { id: "contratos", label: "📄 Contratos" },
            { id: "contas_bancarias", label: "🏦 Contas Bancárias" },
            { id: "conciliacao", label: "⚖️ Conciliação OFX/CSV" },
            { id: "prestacao_contas", label: "📋 Prestação de Contas" },
            { id: "relatorios", label: "📊 Relatórios & Transparência" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                activeSubTab === tab.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ---------------- 3. SUB-VISÃO 1: VISÃO GERAL (DASHBOARD PAINEL) ---------------- */}
        {activeSubTab === "visao_geral" && (
          <div className="flex flex-col gap-5">
            {/* CARDS DE KPIS FINANCEIROS */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs relative overflow-hidden">
                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Receitas Acumuladas</p>
                <p className="text-xl font-black text-emerald-600 mt-1">{formatCurrencyBR(summary.totalReceitas)}</p>
                <span className="text-[10px] text-emerald-600 font-bold mt-1 block">✓ Confirmadas e Conciliadas</span>
                <span className="absolute right-3 bottom-2 text-3xl opacity-10">📈</span>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs relative overflow-hidden">
                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Despesas Totais</p>
                <p className="text-xl font-black text-rose-600 mt-1">{formatCurrencyBR(summary.totalDespesas)}</p>
                <span className="text-[10px] text-rose-600 font-bold mt-1 block">✓ Pagas e Comprometidas</span>
                <span className="absolute right-3 bottom-2 text-3xl opacity-10">📉</span>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs relative overflow-hidden">
                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Saldo Líquido em Conta</p>
                <p className={`text-xl font-black mt-1 ${summary.saldoLiquido >= 0 ? "text-indigo-600" : "text-amber-600"}`}>
                  {formatCurrencyBR(summary.saldoLiquido)}
                </p>
                <span className="text-[10px] text-indigo-600 font-bold mt-1 block">Disponível em Bancos</span>
                <span className="absolute right-3 bottom-2 text-3xl opacity-10">⚖️</span>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs relative overflow-hidden">
                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Saldo Orçamentário</p>
                <p className="text-xl font-black text-blue-600 mt-1">{formatCurrencyBR(summary.totalDisponivel)}</p>
                <span className="text-[10px] text-blue-600 font-bold mt-1 block">Teto Livre de Gastos</span>
                <span className="absolute right-3 bottom-2 text-3xl opacity-10">🎯</span>
              </div>
            </div>

            {/* ORÇAMENTO PLANEJADO VS RESERVADO VS PAGO */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-850 pb-3">
                <h3 className="text-xs font-extrabold uppercase text-zinc-800 dark:text-zinc-200 tracking-wider">
                  Execução Orçamentária por Centro de Custo ({activeContext.toUpperCase()})
                </h3>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                  Orçado: {formatCurrencyBR(summary.totalOrcado)} | Disponível: {formatCurrencyBR(summary.totalDisponivel)}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {budgets.map((b) => {
                  const pctPaid = Math.min(100, Math.round((b.paid / b.planned) * 100)) || 0;
                  return (
                    <div key={b.id} className="rounded-xl border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-850 dark:bg-zinc-900 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{b.costCenterName}</span>
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{formatCurrencyBR(b.planned)}</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${pctPaid}%` }} />
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-zinc-500">
                        <span>Pago: {formatCurrencyBR(b.paid)} ({pctPaid}%)</span>
                        <span>Disponível: {formatCurrencyBR(b.available)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FLUXO DE CAIXA PROJETADO (30, 60 E 90 DIAS) */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs flex flex-col gap-3">
              <h3 className="text-xs font-extrabold uppercase text-zinc-800 dark:text-zinc-200 tracking-wider">
                Projeção de Fluxo de Caixa Futuro (30, 60 e 90 Dias)
              </h3>
              <div className="grid grid-cols-3 gap-3 text-xs text-center">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
                  <span className="text-[9px] font-bold uppercase text-blue-700 dark:text-blue-300 block">30 Dias</span>
                  <span className="text-base font-extrabold text-blue-800 dark:text-blue-200 mt-1 block">{formatCurrencyBR(summary.saldoLiquido + 25000)}</span>
                </div>
                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900">
                  <span className="text-[9px] font-bold uppercase text-indigo-700 dark:text-indigo-300 block">60 Dias</span>
                  <span className="text-base font-extrabold text-indigo-800 dark:text-indigo-200 mt-1 block">{formatCurrencyBR(summary.saldoLiquido + 45000)}</span>
                </div>
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900">
                  <span className="text-[9px] font-bold uppercase text-purple-700 dark:text-purple-300 block">90 Dias</span>
                  <span className="text-base font-extrabold text-purple-800 dark:text-purple-200 mt-1 block">{formatCurrencyBR(summary.saldoLiquido + 70000)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 4. SUB-VISÃO 2: RECEITAS ---------------- */}
        {activeSubTab === "receitas" && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Receitas Registradas ({revenues.length})</h3>
              {canManage && (
                <button onClick={() => setShowRevenueModal(true)} className={buttonPrimaryClass}>
                  + Nova Receita / Doação
                </button>
              )}
            </div>

            <DataTable
              data={revenues}
              keyExtractor={(r) => r.id}
              emptyMessage="Nenhuma receita registrada para este contexto."
              columns={[
                { key: "date", header: "Data", render: (r) => <span className="font-mono text-xs">{r.date}</span> },
                { key: "donor", header: "Origem / Doador", render: (r) => <span className="font-bold">{r.donorName} ({r.donorCpfCnpj || "FEFC/Partidário"})</span> },
                { key: "origin", header: "Categoria", render: (r) => <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px] uppercase">{r.origin}</span> },
                { key: "amount", header: "Valor", render: (r) => <span className="font-mono font-bold text-emerald-600">{formatCurrencyBR(r.amount)}</span> },
                { key: "bank", header: "Conta Bancária", render: (r) => <span className="text-xs text-zinc-600 dark:text-zinc-400">{r.bankAccountName}</span> },
                { key: "status", header: "Status", render: (r) => <span className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold px-2 py-0.5 rounded text-[10px]">{r.status}</span> },
              ]}
            />
          </div>
        )}

        {/* ---------------- 5. SUB-VISÃO 3: DESPESAS & SOLICITAÇÕES ---------------- */}
        {activeSubTab === "despesas" && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Despesas & Solicitações ({expenses.length})</h3>
              {canManage && (
                <button onClick={() => setShowExpenseModal(true)} className={buttonPrimaryClass}>
                  + Nova Solicitação de Despesa
                </button>
              )}
            </div>

            <DataTable
              data={expenses}
              keyExtractor={(e) => e.id}
              emptyMessage="Nenhuma despesa registrada para este contexto."
              columns={[
                { key: "code", header: "Código", render: (e) => <span className="font-mono font-bold text-blue-600">{e.code}</span> },
                { key: "desc", header: "Descrição", render: (e) => <span className="font-bold">{e.description}</span> },
                { key: "vendor", header: "Fornecedor", render: (e) => <span>{e.vendorName}</span> },
                { key: "dueDate", header: "Vencimento", render: (e) => <span className="font-mono text-xs">{e.dueDate}</span> },
                { key: "amount", header: "Valor Final", render: (e) => <span className="font-mono font-bold text-rose-600">{formatCurrencyBR(e.finalAmount)}</span> },
                {
                  key: "status",
                  header: "Status Workflow",
                  render: (e) => (
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${e.status === "paga" ? "bg-emerald-100 text-emerald-800" : e.status === "aprovada" ? "bg-blue-100 text-blue-800" : e.status === "rejeitada" || e.status === "cancelada" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"}`}>
                      {e.status}
                    </span>
                  ),
                },
                {
                  key: "actions",
                  header: "Ações",
                  render: (e) => (
                    <div className="flex gap-2 text-xs">
                      {e.status === "aprovada" && (
                        <button onClick={() => handlePayExpense(e.id)} className="font-bold text-emerald-600 hover:underline">Pagar</button>
                      )}
                      {canManage && e.status !== "cancelada" && (
                        <button onClick={() => setDeleteExpenseId(e.id)} className="font-medium text-red-600 hover:underline">Cancelar</button>
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}

        {/* ---------------- 6. SUB-VISÃO 5: APROVAÇÕES ---------------- */}
        {activeSubTab === "aprovacoes" && (
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Central de Alçadas & Aprovações de Despesas</h3>
            <DataTable
              data={expenses.filter((e) => e.status === "solicitada" || e.status === "em_validacao")}
              keyExtractor={(e) => e.id}
              emptyMessage="Nenhuma despesa pendente de aprovação no momento."
              columns={[
                { key: "code", header: "Código", render: (e) => <span className="font-mono font-bold text-blue-600">{e.code}</span> },
                { key: "desc", header: "Descrição / Solicitação", render: (e) => <div><p className="font-bold">{e.description}</p><p className="text-[10px] text-zinc-400">Solicitado por: {e.requestedBy}</p></div> },
                { key: "vendor", header: "Fornecedor", render: (e) => <span>{e.vendorName} ({e.vendorCpfCnpj})</span> },
                { key: "amount", header: "Valor Total", render: (e) => <span className="font-mono font-bold text-xs">{formatCurrencyBR(e.finalAmount)}</span> },
                {
                  key: "actions",
                  header: "Decisão do Aprovador",
                  render: (e) => (
                    <div className="flex gap-1">
                      <button onClick={() => setApprovalTarget({ expense: e, decision: "aprovar" })} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded text-[10px]">Aprovar</button>
                      <button onClick={() => setApprovalTarget({ expense: e, decision: "ressalva" })} className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-2 py-1 rounded text-[10px]">Ressalva</button>
                      <button onClick={() => setApprovalTarget({ expense: e, decision: "rejeitar" })} className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-2 py-1 rounded text-[10px]">Rejeitar</button>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}

        {/* ---------------- 7. SUB-VISÃO 7: FORNECEDORES ---------------- */}
        {activeSubTab === "fornecedores" && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Dossiê e Cadastro Integrado de Fornecedores ({vendors.length})</h3>
              {canManage && (
                <button onClick={() => setShowVendorModal(true)} className={buttonPrimaryClass}>
                  + Cadastrar Fornecedor
                </button>
              )}
            </div>

            <DataTable
              data={vendors}
              keyExtractor={(v) => v.id}
              emptyMessage="Nenhum fornecedor cadastrado."
              columns={[
                { key: "name", header: "Razão Social / Nome", render: (v) => <div><p className="font-bold">{v.name}</p><p className="text-[10px] text-zinc-400">{v.email} | {v.phone}</p></div> },
                { key: "cnpj", header: "CPF / CNPJ", render: (v) => <span className="font-mono text-xs">{v.cpfCnpj}</span> },
                { key: "category", header: "Categoria", render: (v) => <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-[10px] font-bold">{v.serviceCategory}</span> },
                { key: "bank", header: "Dados Bancários", render: (v) => <span className="text-xs">{v.bankName} - Ag {v.bankAgency} Cc {v.bankAccount}</span> },
                { key: "doc", header: "Situação Doc.", render: (v) => <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${v.documentationStatus === "regular" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{v.documentationStatus}</span> },
              ]}
            />
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
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Relatórios Gerenciais e Dados de Transparência</h3>
              <button onClick={() => window.print()} className={buttonSecondaryClass}>
                🖨️ Imprimir / Exportar PDF
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs">
              <div className="p-4 border rounded-xl bg-white dark:bg-zinc-950 flex flex-col gap-2">
                <span className="font-bold text-blue-600">📊 Relatório Orçado vs Realizado</span>
                <p className="text-[10px] text-zinc-500">Comparativo entre o teto planejado por centro de custo e o montante efetivamente pago.</p>
                <button onClick={() => alert("Relatório gerado em memória!")} className="text-[10px] font-bold text-blue-600 hover:underline self-start">Exportar CSV</button>
              </div>
              <div className="p-4 border rounded-xl bg-white dark:bg-zinc-950 flex flex-col gap-2">
                <span className="font-bold text-emerald-600">📈 Extrato de Receitas por Doador</span>
                <p className="text-[10px] text-zinc-500">Consolidado com nome, CPF/CNPJ, tipo de fundo e recibos emitidos.</p>
                <button onClick={() => alert("Relatório gerado em memória!")} className="text-[10px] font-bold text-emerald-600 hover:underline self-start">Exportar CSV</button>
              </div>
              <div className="p-4 border rounded-xl bg-white dark:bg-zinc-950 flex flex-col gap-2">
                <span className="font-bold text-purple-600">🛡️ Trilha de Auditoria Completa</span>
                <p className="text-[10px] text-zinc-500">Histórico *append-only* de criação, edições, aprovações e liquidações.</p>
                <button onClick={() => alert("Trilha gerada!")} className="text-[10px] font-bold text-purple-600 hover:underline self-start">Exportar Logs</button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 11. DEMAIS SUB-VISÕES SIMPLIFICADAS DA ESTRUTURA ---------------- */}
        {["contas_pagar_receber", "orcamentos", "contratos", "contas_bancarias", "prestacao_contas"].includes(activeSubTab) && (
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
