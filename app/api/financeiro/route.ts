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

    // Filtro por contexto ativo
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

    // Métricas agregadas usando tipo de cálculo decimal (cents)
    const totalReceitasCents = filteredRevenues.reduce((sum, r) => sum + toCents(r.amount), 0);
    const totalDespesasCents = filteredExpenses.reduce((sum, e) => sum + toCents(e.finalAmount), 0);
    const totalOrcadoCents = filteredBudgets.reduce((sum, b) => sum + toCents(b.planned), 0);
    const totalComprometidoCents = filteredBudgets.reduce((sum, b) => sum + toCents(b.committed), 0);

    return NextResponse.json({
      status: "sucesso",
      contextType,
      summary: {
        totalReceitas: fromCents(totalReceitasCents),
        totalDespesas: fromCents(totalDespesasCents),
        saldoLiquido: fromCents(totalReceitasCents - totalDespesasCents),
        totalOrcado: fromCents(totalOrcadoCents),
        totalComprometido: fromCents(totalComprometidoCents),
        totalDisponivel: fromCents(totalOrcadoCents - totalComprometidoCents),
        alertasPendentesCount: filteredAlerts.filter((a) => a.status === "pendente").length,
      },
      accounts: filteredAccounts,
      costCenters: costCenters.filter((c) => c.contextType === contextType),
      budgets: filteredBudgets,
      vendors,
      revenues: filteredRevenues,
      expenses: filteredExpenses,
      contracts: filteredContracts,
      bankTransactions: bankTransactions.filter((bt) =>
        filteredAccounts.some((acc) => acc.id === bt.bankAccountId)
      ),
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
