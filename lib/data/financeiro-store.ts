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
} from "@/lib/domain/financeiro-types";

// Helper de cálculo decimal preciso em centavos para evitar imprecisões de ponto flutuante
export function toCents(amount: number): number {
  return Math.round((amount || 0) * 100);
}

export function fromCents(cents: number): number {
  return (cents || 0) / 100;
}

export function formatCurrencyBR(amount: number): string {
  return (amount || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Inicialização 100% Limpa sem Dados Mockados (Exclusivo Banco de Dados ou Entrada de Usuário)
export const INITIAL_BANK_ACCOUNTS: BankAccount[] = [];
export const INITIAL_COST_CENTERS: CostCenter[] = [];
export const INITIAL_BUDGETS: Budget[] = [];
export const INITIAL_VENDORS: Vendor[] = [];
export const INITIAL_REVENUES: Revenue[] = [];
export const INITIAL_EXPENSES: Expense[] = [];
export const INITIAL_CONTRACTS: Contract[] = [];
export const INITIAL_BANK_TRANSACTIONS: BankTransaction[] = [];
export const INITIAL_ALERTS: FinancialAlert[] = [];
export const INITIAL_AUDIT_LOGS: FinancialAuditLog[] = [];
export const INITIAL_PERIOD_CLOSURES: FinancialPeriodClose[] = [];
