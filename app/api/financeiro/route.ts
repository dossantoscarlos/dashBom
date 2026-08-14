import { NextResponse } from "next/server";
import {
  INITIAL_BANK_ACCOUNTS,
  INITIAL_COST_CENTERS,
  INITIAL_BUDGETS,
  INITIAL_VENDORS,
  INITIAL_REVENUES,
  INITIAL_EXPENSES,
  INITIAL_CONTRACTS,
  INITIAL_BANK_TRANSACTIONS,
  INITIAL_ALERTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_PERIOD_CLOSURES,
  toCents,
  fromCents,
} from "@/lib/data/financeiro-store";
import type {
  BankAccount,
  CostCenter,
  Budget,
  Revenue,
  Expense,
  ExpenseStatus,
  Vendor,
  Contract,
  BankTransaction,
  FinancialAlert,
  FinancialAuditLog,
  FinancialPeriodClose,
  FinancialContextType,
} from "@/lib/domain/financeiro-types";

// Repositório em memória durante execução do servidor
let bankAccounts = [...INITIAL_BANK_ACCOUNTS];
let costCenters = [...INITIAL_COST_CENTERS];
let budgets = [...INITIAL_BUDGETS];
let vendors = [...INITIAL_VENDORS];
let revenues = [...INITIAL_REVENUES];
let expenses = [...INITIAL_EXPENSES];
let contracts = [...INITIAL_CONTRACTS];
let bankTransactions = [...INITIAL_BANK_TRANSACTIONS];
let alerts = [...INITIAL_ALERTS];
let auditLogs = [...INITIAL_AUDIT_LOGS];
let periodClosures = [...INITIAL_PERIOD_CLOSURES];

function logAudit(
  actor: string,
  action: FinancialAuditLog["action"],
  contextType: FinancialContextType,
  entityType: string,
  entityId: string,
  details: string,
  previousState?: string,
  newState?: string
) {
  const log: FinancialAuditLog = {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    actor,
    action,
    contextType,
    entityType,
    entityId,
    details,
    previousState,
    newState,
  };
  auditLogs.unshift(log);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const contextType = (searchParams.get("contextType") as FinancialContextType) || "campanha";
    const q = searchParams.get("q")?.toLowerCase();

    // Filtro por contexto ativo (Isolamento estrito)
    let filteredRevenues = revenues.filter((r) => r.contextType === contextType);
    let filteredExpenses = expenses.filter((e) => e.contextType === contextType);
    let filteredBudgets = budgets.filter((b) => b.contextType === contextType);
    let filteredAccounts = bankAccounts.filter((a) => a.contextType === contextType);
    let filteredContracts = contracts.filter((c) => c.contextType === contextType);
    let filteredAlerts = alerts.filter((a) => a.contextType === contextType);
    let filteredAudit = auditLogs.filter((l) => l.contextType === contextType);

    if (q) {
      filteredRevenues = filteredRevenues.filter(
        (r) => r.donorName.toLowerCase().includes(q) || r.purpose.toLowerCase().includes(q)
      );
      filteredExpenses = filteredExpenses.filter(
        (e) => e.description.toLowerCase().includes(q) || e.vendorName.toLowerCase().includes(q) || e.code.toLowerCase().includes(q)
      );
    }

    // 1. Métricas Agregadas do Indicadores Principais (Regras Financeiras Oficiais)
    const totalReceitasCents = filteredRevenues
      .filter((r) => r.status === "confirmada" || r.status === "conciliada")
      .reduce((sum, r) => sum + toCents(r.amount), 0);

    const totalDespesasPagasCents = filteredExpenses
      .filter((e) => e.status === "paga" || e.status === "conciliada")
      .reduce((sum, e) => sum + toCents(e.finalAmount), 0);

    const totalComprometidoCents = filteredExpenses
      .filter((e) => e.status === "solicitada" || e.status === "em_validacao" || e.status === "aprovada")
      .reduce((sum, e) => sum + toCents(e.finalAmount), 0) +
      filteredBudgets.reduce((sum, b) => sum + toCents(b.committed), 0);

    const totalOrcadoCents = filteredBudgets.reduce((sum, b) => sum + toCents(b.planned), 0);

    const bankBalanceCents = filteredAccounts.reduce((sum, a) => sum + toCents(a.balance), 0);
    const saldoLiquidoCents = totalReceitasCents - totalDespesasPagasCents;
    const saldoDisponivelCents = bankBalanceCents > 0 ? (bankBalanceCents - totalComprometidoCents) : (totalReceitasCents - totalDespesasPagasCents - totalComprometidoCents);

    const totalArrecadadoVal = fromCents(totalReceitasCents);
    const despesasPagasVal = fromCents(totalDespesasPagasCents);
    const saldoDisponivelVal = Math.max(0, fromCents(saldoDisponivelCents));
    const valorComprometidoVal = fromCents(totalComprometidoCents);

    const pctArrecadadoTarget = totalOrcadoCents > 0 ? Math.round((totalReceitasCents / totalOrcadoCents) * 100) : 100;
    const pctDespesasPagas = totalReceitasCents > 0 ? Number(((totalDespesasPagasCents / totalReceitasCents) * 100).toFixed(1)) : 0;
    const pctSaldoDisponivel = totalReceitasCents > 0 ? Number(((saldoDisponivelCents / totalReceitasCents) * 100).toFixed(1)) : 0;
    const pctValorComprometido = totalReceitasCents > 0 ? Number(((totalComprometidoCents / totalReceitasCents) * 100).toFixed(1)) : 0;

    // 2. Gráfico de Fluxo Financeiro (Mensal)
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const currentYear = new Date().getFullYear();

    const cashFlow = months.map((m, idx) => {
      const revMonth = filteredRevenues
        .filter((r) => {
          if (!r.date) return false;
          const d = new Date(r.date);
          return d.getMonth() === idx && d.getFullYear() === currentYear;
        })
        .reduce((sum, r) => sum + r.amount, 0);

      const expMonth = filteredExpenses
        .filter((e) => {
          if (!e.dueDate) return false;
          const d = new Date(e.dueDate);
          return d.getMonth() === idx && d.getFullYear() === currentYear;
        })
        .reduce((sum, e) => sum + e.finalAmount, 0);

      return {
        mes: m,
        receita: revMonth,
        despesa: expMonth,
      };
    });

    // 3. Orçamento por Categoria / Centro de Custo
    const categoryBudgets = filteredBudgets.map((b) => {
      const pct = b.planned > 0 ? Math.round(((b.paid + b.committed) / b.planned) * 100) : 0;
      let color = "green";
      if (pct >= 100) color = "red";
      else if (pct >= 90) color = "orange";
      else if (pct >= 75) color = "blue";
      else if (b.planned === 0) color = "gray";

      return {
        id: b.id,
        name: b.costCenterName || "Sem Categoria",
        planned: b.planned,
        committed: b.committed,
        paid: b.paid,
        balance: b.available,
        pctUsed: pct,
        color,
      };
    });

    // 4. Painel de Conformidade Eleitoral/Fiscal
    const recibosPendentesCount = filteredRevenues.filter((r) => !r.documentNumber && r.status !== "estornada").length +
      filteredExpenses.filter((e) => !e.fiscalDocumentNumber && e.status !== "cancelada").length;

    const currentBankTx = bankTransactions.filter((bt) =>
      filteredAccounts.some((acc) => acc.id === bt.bankAccountId)
    );
    const conciliacoesPendentesCount = currentBankTx.filter((bt) => !bt.reconciled).length;

    const totalIssues = recibosPendentesCount + conciliacoesPendentesCount;
    const situacaoConformidade = totalIssues === 0 ? "Em dia" : totalIssues <= 2 ? "Atenção" : "Pendente";
    const pctExigenciasAtendidas = totalIssues === 0 ? 100 : Math.max(50, 100 - totalIssues * 15);

    // 5. Projeções Futuras (30, 60, 90 dias)
    const projections = {
      dias30: Math.max(0, saldoDisponivelVal + 25000),
      dias60: Math.max(0, saldoDisponivelVal + 45000),
      dias90: Math.max(0, saldoDisponivelVal + 70000),
    };

    // 6. Últimos Lançamentos (Unificados)
    const combinedTransactions = [
      ...filteredRevenues.map((r) => ({
        id: r.id,
        date: r.date || r.createdAt || new Date().toISOString().slice(0, 10),
        type: "Receita" as const,
        description: r.purpose || `Doação — ${r.donorName}`,
        category: r.origin === "doacao_pf" ? "Doações PF" : r.origin === "fundo_eleitoral" ? "Fundo Eleitoral (FEFC)" : "Outras Receitas",
        amount: r.amount,
        status: r.status === "confirmada" || r.status === "conciliada" ? "Confirmado" : "Pendente",
        rawType: "revenue",
      })),
      ...filteredExpenses.map((e) => ({
        id: e.id,
        date: e.dueDate || e.createdAt || new Date().toISOString().slice(0, 10),
        type: "Despesa" as const,
        description: e.description,
        category: e.allocations?.[0]?.costCenterName || "Despesas Gerais",
        amount: e.finalAmount,
        status: e.status === "paga" || e.status === "conciliada" ? "Pago" : e.status === "aprovada" ? "Aprovado" : "Pendente",
        rawType: "expense",
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      status: "sucesso",
      contextType,
      summary: {
        totalReceitas: totalArrecadadoVal,
        totalDespesas: despesasPagasVal,
        saldoLiquido: saldoLiquidoCents / 100,
        totalOrcado: fromCents(totalOrcadoCents),
        totalComprometido: valorComprometidoVal,
        totalDisponivel: saldoDisponivelVal,
        pctArrecadadoTarget,
        pctDespesasPagas,
        pctSaldoDisponivel,
        pctValorComprometido,
        alertasPendentesCount: filteredAlerts.filter((a) => a.status === "pendente").length,
      },
      cashFlow,
      categoryBudgets,
      compliance: {
        recibosPendentesCount,
        conciliacoesPendentesCount,
        situacao: situacaoConformidade,
        pctExigenciasAtendidas,
        lastCheckTimestamp: new Date().toLocaleDateString("pt-BR") + " às " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      },
      projections,
      recentTransactions: combinedTransactions.slice(0, 5),
      accounts: filteredAccounts,
      costCenters: costCenters.filter((c) => c.contextType === contextType),
      budgets: filteredBudgets,
      vendors,
      revenues: filteredRevenues,
      expenses: filteredExpenses,
      contracts: filteredContracts,
      bankTransactions: currentBankTx,
      alerts: filteredAlerts,
      auditLogs: filteredAudit,
      periodClosures: periodClosures.filter((pc) => pc.contextType === contextType),
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao consultar dados financeiros: " + String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action || "create_expense";

    // 1. Criar Solicitação de Despesa
    if (action === "create_expense") {
      if (!body.description || !body.amount || !body.vendorId) {
        return NextResponse.json({ error: "Descrição, fornecedor e valor são obrigatórios." }, { status: 400 });
      }

      const vendor = vendors.find((v) => v.id === body.vendorId);
      const amountNum = Number(body.amount);

      const newExpense: Expense = {
        id: `exp-${Date.now()}`,
        code: `DESP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        contextType: body.contextType || "campanha",
        entityId: body.entityId || "ent-01",
        entityName: body.entityName || "Entidade Principal",
        expenseType: body.expenseType || "avulsa",
        description: body.description,
        vendorId: body.vendorId,
        vendorName: vendor ? vendor.name : body.vendorName || "Fornecedor Não Cadastrado",
        vendorCpfCnpj: vendor ? vendor.cpfCnpj : body.vendorCpfCnpj || "",
        dueDate: body.dueDate || new Date().toISOString().slice(0, 10),
        competencyDate: body.competencyDate || new Date().toISOString().slice(0, 10),
        amount: amountNum,
        finalAmount: amountNum,
        bankAccountId: body.bankAccountId || "bank-01",
        bankAccountName: body.bankAccountName || "Conta Principal",
        status: "solicitada",
        allocations: body.allocations || [
          { costCenterId: "cc-03", costCenterName: "Propaganda & Mídia", percentage: 100, amount: amountNum },
        ],
        fiscalDocumentType: body.fiscalDocumentType || "recibo",
        fiscalDocumentNumber: body.fiscalDocumentNumber || "",
        requestedBy: body.actor || "Usuário do Sistema",
        reconciled: false,
        createdAt: new Date().toISOString().slice(0, 10),
      };

      expenses.unshift(newExpense);

      // Regra de Alerta se não houver documentação fiscal completa
      if (!body.fiscalDocumentNumber) {
        alerts.unshift({
          id: `alt-${Date.now()}`,
          ruleCode: "RULE-NO-DOC",
          ruleVersion: "v1.0",
          title: "Despesa Solicitada sem Documento Fiscal",
          description: `A solicitação ${newExpense.code} foi enviada sem número de documento fiscal anexado.`,
          severity: "media",
          contextType: newExpense.contextType,
          evidence: `Registrado por ${newExpense.requestedBy} no valor de R$ ${newExpense.finalAmount}`,
          status: "pendente",
          createdAt: new Date().toISOString().slice(0, 10),
        });
      }

      logAudit(
        body.actor || "Usuário",
        "CRIAR",
        newExpense.contextType,
        "Expense",
        newExpense.id,
        `Solicitação de despesa ${newExpense.code} criada no valor de R$ ${newExpense.finalAmount}.`
      );

      return NextResponse.json({
        status: "sucesso",
        mensagem: "Solicitação de despesa registrada com sucesso!",
        expense: newExpense,
      });
    }

    // 2. Registrar Nova Receita
    if (action === "create_revenue") {
      if (!body.amount || !body.donorName) {
        return NextResponse.json({ error: "Valor e nome do doador/origem são obrigatórios." }, { status: 400 });
      }

      const amountNum = Number(body.amount);
      const newRev: Revenue = {
        id: `rev-${Date.now()}`,
        contextType: body.contextType || "campanha",
        entityId: body.entityId || "cmp-01",
        entityName: body.entityName || "Campanha Principal",
        date: body.date || new Date().toISOString().slice(0, 10),
        competencyDate: body.competencyDate || new Date().toISOString().slice(0, 10),
        amount: amountNum,
        currency: "BRL",
        origin: body.origin || "doacao_pf",
        donorName: body.donorName,
        donorCpfCnpj: body.donorCpfCnpj || "",
        bankAccountId: body.bankAccountId || "bank-01",
        bankAccountName: body.bankAccountName || "Conta Eleitoral",
        costCenterId: body.costCenterId || "cc-03",
        costCenterName: body.costCenterName || "Geral",
        purpose: body.purpose || "Doação registrada no sistema",
        documentNumber: body.documentNumber || `REC-${Date.now().toString().slice(-4)}`,
        status: "confirmada",
        createdBy: body.actor || "Usuário do Sistema",
        createdAt: new Date().toISOString().slice(0, 10),
      };

      revenues.unshift(newRev);

      // Atualizar saldo da conta bancária de forma segura
      const bankAcc = bankAccounts.find((b) => b.id === newRev.bankAccountId);
      if (bankAcc) {
        bankAcc.balance = fromCents(toCents(bankAcc.balance) + toCents(newRev.amount));
      }

      logAudit(
        body.actor || "Usuário",
        "CRIAR",
        newRev.contextType,
        "Revenue",
        newRev.id,
        `Receita ${newRev.documentNumber} registrada no valor de R$ ${newRev.amount}.`
      );

      return NextResponse.json({
        status: "sucesso",
        mensagem: "Receita registrada com sucesso e saldo atualizado!",
        revenue: newRev,
      });
    }

    // 3. Cadastrar Fornecedor
    if (action === "create_vendor") {
      if (!body.name || !body.cpfCnpj) {
        return NextResponse.json({ error: "Nome/Razão Social e CPF/CNPJ são obrigatórios." }, { status: 400 });
      }

      const newVendor: Vendor = {
        id: `vnd-${Date.now()}`,
        name: body.name,
        tradeName: body.tradeName || "",
        cpfCnpj: body.cpfCnpj,
        email: body.email || "",
        phone: body.phone || "",
        bankName: body.bankName || "Banco do Brasil",
        bankAgency: body.bankAgency || "0000",
        bankAccount: body.bankAccount || "00000-0",
        pixKey: body.pixKey || "",
        serviceCategory: body.serviceCategory || "Serviços Gerais",
        documentationStatus: "regular",
        complianceAlert: false,
        createdAt: new Date().toISOString().slice(0, 10),
      };

      vendors.unshift(newVendor);

      logAudit(
        body.actor || "Usuário",
        "CRIAR",
        "campanha",
        "Vendor",
        newVendor.id,
        `Fornecedor ${newVendor.name} (${newVendor.cpfCnpj}) cadastrado no sistema.`
      );

      return NextResponse.json({
        status: "sucesso",
        mensagem: "Fornecedor cadastrado com sucesso!",
        vendor: newVendor,
      });
    }

    // 4. Conciliação por Importação de Extrato OFX/CSV
    if (action === "import_reconciliation") {
      const rawText = body.fileContent || "";
      const accountId = body.bankAccountId || "bank-01";
      const bankAcc = bankAccounts.find((a) => a.id === accountId);

      // Simulação de parser seguro de OFX / CSV
      const lines = rawText.split("\n").filter((l: string) => l.trim().length > 0);
      let importedCount = 0;

      lines.forEach((line: string, idx: number) => {
        if (line.includes(";") || line.includes(",") || line.includes("TRNTYPE")) {
          const parts = line.split(/[;,]/);
          const date = parts[0]?.trim() || new Date().toISOString().slice(0, 10);
          const desc = parts[1]?.trim() || `Transação Importada #${idx + 1}`;
          const amountVal = Math.abs(parseFloat(parts[2]) || 150.0);

          const newTx: BankTransaction = {
            id: `btx-imp-${Date.now()}-${idx}`,
            bankAccountId: accountId,
            bankAccountName: bankAcc ? bankAcc.name : "Conta Bancária",
            date: date.length === 10 ? date : new Date().toISOString().slice(0, 10),
            description: desc,
            amount: amountVal,
            type: line.toLowerCase().includes("credit") || line.includes("+") ? "credito" : "debito",
            fitid: `FIT-${Date.now()}-${idx}`,
            reconciled: false,
          };
          bankTransactions.unshift(newTx);
          importedCount++;
        }
      });

      logAudit(
        body.actor || "Usuário",
        "CONCILIAR",
        body.contextType || "campanha",
        "BankTransaction",
        accountId,
        `Importados ${importedCount} lançamentos do extrato bancário para conciliação.`
      );

      return NextResponse.json({
        status: "sucesso",
        mensagem: `${importedCount} lançamentos de extrato bancário importados com sucesso para conciliação!`,
        importedCount,
      });
    }

    // 5. Sincronizar Despesa de Projeto / Demanda
    if (action === "sync_project_expense") {
      const { transaction, projectCode, projectName, actor } = body;
      if (!transaction || !transaction.id) {
        return NextResponse.json({ error: "Dados da transação do projeto inválidos." }, { status: 400 });
      }

      const existingIndex = expenses.findIndex(
        (e) => e.id === transaction.id || (transaction.document && e.fiscalDocumentNumber === transaction.document)
      );
      const amountNum = Number(transaction.value) || 0;

      const mappedStatus: ExpenseStatus =
        transaction.status === "Pago"
          ? "paga"
          : transaction.status === "Comprometido"
          ? "aprovada"
          : transaction.status === "Rejeitado"
          ? "rejeitada"
          : "solicitada";

      const expenseData: Expense = {
        id: transaction.id,
        code: `PRJ-${projectCode ? projectCode.replace(/[^a-zA-Z0-9]/g, "") : "2026"}-${String(transaction.id).slice(-4)}`,
        contextType: "campanha",
        entityId: projectCode || "proj-01",
        entityName: projectName || `Projeto ${projectCode || "Geral"}`,
        expenseType: "avulsa",
        description: `[Projeto ${projectCode || "Geral"}] ${transaction.description}`,
        vendorId: `vnd-${Date.now()}`,
        vendorName: transaction.supplier || "Fornecedor Cadastrado",
        vendorCpfCnpj: "00.000.000/0001-00",
        dueDate: transaction.date || new Date().toISOString().slice(0, 10),
        competencyDate: transaction.date || new Date().toISOString().slice(0, 10),
        amount: amountNum,
        finalAmount: amountNum,
        bankAccountId: "bank-01",
        bankAccountName: "Conta de Gestão de Projetos",
        status: mappedStatus,
        allocations: [
          {
            costCenterId: "cc-proj",
            costCenterName: `Projetos: ${transaction.category || "Obras e Infraestrutura"}`,
            percentage: 100,
            amount: amountNum,
          },
        ],
        fiscalDocumentType: "nota_fiscal",
        fiscalDocumentNumber: transaction.document || "",
        requestedBy: actor || "Gestor de Projetos",
        reconciled: transaction.status === "Pago",
        projectCode: projectCode || "PRJ-2026",
        createdAt: new Date().toISOString().slice(0, 10),
      };

      if (existingIndex !== -1) {
        expenses[existingIndex] = { ...expenses[existingIndex], ...expenseData };
      } else {
        expenses.unshift(expenseData);
      }

      logAudit(
        actor || "Gestor de Projetos",
        existingIndex !== -1 ? "EDITAR" : "CRIAR",
        "campanha",
        "Expense",
        expenseData.id,
        `Despesa do projeto ${projectCode || "Geral"} sincronizada no módulo financeiro (R$ ${amountNum}).`
      );

      return NextResponse.json({
        status: "sucesso",
        mensagem: "Despesa do projeto sincronizada com sucesso no Financeiro!",
        expense: expenseData,
      });
    }

    return NextResponse.json({ error: "Ação não reconhecida." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Falha ao processar operação financeira: " + String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const action = body.action;

    // 1. Workflow de Aprovação / Rejeição / Ressalva de Despesa
    if (action === "approve_expense") {
      const { expenseId, decision, notes, actor } = body;
      const expense = expenses.find((e) => e.id === expenseId);
      if (!expense) {
        return NextResponse.json({ error: "Despesa não encontrada." }, { status: 404 });
      }

      const prevStatus = expense.status;
      if (decision === "aprovar") {
        expense.status = "aprovada";
        expense.approvedBy = actor || "Aprovador Autorizado";
        expense.approvalDate = new Date().toISOString().slice(0, 10);
        expense.approvalNotes = notes || "Aprovado sem ressalvas.";
      } else if (decision === "rejeitar") {
        expense.status = "rejeitada";
        expense.approvalNotes = notes || "Rejeitado conforme política de alçadas.";
      } else if (decision === "ressalva") {
        expense.status = "aprovada";
        expense.approvedBy = actor || "Aprovador Autorizado";
        expense.approvalDate = new Date().toISOString().slice(0, 10);
        expense.approvalNotes = `Aprovado com ressalva: ${notes || "Apresentar documento fiscal original em 5 dias."}`;
      }

      logAudit(
        actor || "Aprovador",
        decision === "rejeitar" ? "REJEITAR" : "APROVAR",
        expense.contextType,
        "Expense",
        expense.id,
        `Decisão '${decision}' na despesa ${expense.code}. Justificativa: ${expense.approvalNotes}`,
        prevStatus,
        expense.status
      );

      return NextResponse.json({
        status: "sucesso",
        mensagem: `Despesa ${expense.code} atualizada para '${expense.status}' com sucesso!`,
        expense,
      });
    }

    // 2. Efetivar Pagamento de Despesa
    if (action === "pay_expense") {
      const { expenseId, bankAccountId, actor } = body;
      const expense = expenses.find((e) => e.id === expenseId);
      if (!expense) {
        return NextResponse.json({ error: "Despesa não encontrada." }, { status: 404 });
      }

      expense.status = "paga";
      expense.paymentDate = new Date().toISOString().slice(0, 10);
      expense.paidBy = actor || "Responsável pelo Pagamento";

      // Subtrair do saldo da conta bancária
      const bankAcc = bankAccounts.find((b) => b.id === (bankAccountId || expense.bankAccountId));
      if (bankAcc) {
        bankAcc.balance = fromCents(toCents(bankAcc.balance) - toCents(expense.finalAmount));
      }

      logAudit(
        actor || "Operador Financeiro",
        "PAGAR",
        expense.contextType,
        "Expense",
        expense.id,
        `Pagamento efetuado para a despesa ${expense.code} no valor de R$ ${expense.finalAmount}.`
      );

      return NextResponse.json({
        status: "sucesso",
        mensagem: `Pagamento da despesa ${expense.code} realizado e saldo bancário debitado!`,
        expense,
      });
    }

    // 3. Tratar Alerta de Conformidade
    if (action === "resolve_alert") {
      const { alertId, resolutionStatus, notes, actor } = body;
      const alert = alerts.find((a) => a.id === alertId);
      if (!alert) {
        return NextResponse.json({ error: "Alerta não encontrado." }, { status: 404 });
      }

      alert.status = resolutionStatus || "resolvido";
      alert.resolutionNotes = notes || "Tratado e regularizado pelo controle interno.";
      alert.resolvedBy = actor || "Auditor Interno";
      alert.resolvedAt = new Date().toISOString();

      logAudit(
        actor || "Auditor",
        "EDITAR",
        alert.contextType,
        "FinancialAlert",
        alert.id,
        `Alerta '${alert.title}' resolvido com status '${alert.status}'. Motivo: ${alert.resolutionNotes}`
      );

      return NextResponse.json({
        status: "sucesso",
        mensagem: "Alerta de conformidade atualizado e arquivado na trilha de auditoria!",
        alert,
      });
    }

    return NextResponse.json({ error: "Ação PUT não reconhecida." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Falha ao atualizar registro financeiro: " + String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const actor = searchParams.get("actor") || "Administrador";

    if (!id) {
      return NextResponse.json({ error: "ID do registro é obrigatório." }, { status: 400 });
    }

    const expIndex = expenses.findIndex((e) => e.id === id);
    if (expIndex !== -1) {
      const expense = expenses[expIndex];
      // Exclusão Lógica / Cancelamento
      expense.status = "cancelada";

      logAudit(
        actor,
        "REJEITAR",
        expense.contextType,
        "Expense",
        expense.id,
        `Despesa ${expense.code} foi cancelada / desativada logicamente com justificativa auditada.`
      );

      return NextResponse.json({
        status: "sucesso",
        mensagem: `Despesa ${expense.code} cancelada com sucesso! Registro mantido para auditoria.`,
      });
    }

    return NextResponse.json({ error: "Registro não encontrado para cancelamento." }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: "Falha ao cancelar registro: " + String(error) }, { status: 500 });
  }
}
