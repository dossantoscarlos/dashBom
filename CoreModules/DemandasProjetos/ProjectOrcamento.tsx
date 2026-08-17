"use client";

import React, { useState } from "react";
import type { OrcamentoCategoria, FinancialTransaction, ProjetoItem } from "./types";
import { useToast } from "@/components/dashboard/Toast";
import {
  Wallet,
  Download,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  X,
  PieChart as PieChartIcon,
  Pencil,
  Trash2,
  ChevronDown,
  MoreVertical,
} from "lucide-react";

interface ProjectOrcamentoProps {
  categorias: OrcamentoCategoria[];
  transacoes: FinancialTransaction[];
  project?: ProjetoItem;
  onAddTransaction: (tx: FinancialTransaction) => void;
  onUpdateTransaction?: (tx: FinancialTransaction) => void;
  onDeleteTransaction?: (id: string) => void;
  onNavigateTab: (tab: any) => void;
}

const STATUS_OPTIONS = [
  "Aguardando aprovação",
  "Comprometido",
  "Pago",
  "Rejeitado",
] as const;

export function ProjectOrcamento({
  categorias,
  transacoes,
  project,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onNavigateTab,
}: ProjectOrcamentoProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  // Form State para Nova Despesa / Edição
  const [editingTx, setEditingTx] = useState<FinancialTransaction | null>(null);
  const [docNumber, setDocNumber] = useState("");
  const [description, setDescription] = useState("");
  const [supplier, setSupplier] = useState("");
  const [categoryName, setCategoryName] = useState(categorias[0]?.name || "Obras e infraestrutura");
  const [valueAmount, setValueAmount] = useState("");
  const [txStatus, setTxStatus] = useState<string>("Aguardando aprovação");

  // Menu de ações por linha
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [statusMenuId, setStatusMenuId] = useState<string | null>(null);
  // Modal de exclusão
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);

  const filteredTx = transacoes.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.document.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory ? tx.category === selectedCategory : true;
    return matchesSearch && matchesCat;
  });

  const openAddModal = () => {
    setEditingTx(null);
    setDocNumber("");
    setDescription("");
    setSupplier("");
    setCategoryName(categorias[0]?.name || "Obras e infraestrutura");
    setValueAmount("");
    setTxStatus("Aguardando aprovação");
    setShowAddExpenseModal(true);
  };

  const openEditModal = (tx: FinancialTransaction) => {
    setEditingTx(tx);
    setDocNumber(tx.document);
    setDescription(tx.description);
    setSupplier(tx.supplier);
    setCategoryName(tx.category);
    setValueAmount(tx.value.toString());
    setTxStatus(tx.status);
    setShowAddExpenseModal(true);
    setActionMenuId(null);
  };

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string>("Sincronizado");

  const syncTransactionToFinance = async (tx: FinancialTransaction) => {
    try {
      await fetch("/api/financeiro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sync_project_expense",
          transaction: tx,
          projectCode: project?.code || "PRJ-2026-0001",
          projectName: project?.title || "Projeto da Demanda",
          actor: project?.responsible || "Gestor de Projetos",
        }),
      });
      setLastSync(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    } catch (e) {
      console.warn("Sincronização com financeiro em background:", e);
    }
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      for (const tx of transacoes) {
        await syncTransactionToFinance(tx);
      }
      toast("Todas as despesas foram integradas ao Módulo Financeiro Central (DRE e Fluxo de Caixa)!");
    } catch (e) {
      toast("Falha na sincronização financeira.", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSave = () => {
    if (!description.trim() || !valueAmount) {
      toast("Por favor, preencha a descrição e o valor da despesa.", "error");
      return;
    }
    const numVal = parseFloat(valueAmount.replace(",", "."));
    if (isNaN(numVal) || numVal <= 0) {
      toast("Informe um valor numérico válido.", "error");
      return;
    }

    if (editingTx) {
      // EDITAR
      const updated: FinancialTransaction = {
        ...editingTx,
        document: docNumber || editingTx.document,
        description,
        supplier: supplier || editingTx.supplier,
        category: categoryName,
        value: numVal,
        status: txStatus as any,
      };
      onUpdateTransaction?.(updated);
      syncTransactionToFinance(updated);
      toast("Despesa atualizada e sincronizada com o Financeiro!");
    } else {
      // CRIAR
      const newTx: FinancialTransaction = {
        id: `tx-${Date.now()}`,
        date: new Date().toLocaleDateString("pt-BR"),
        document: docNumber || `NF-2025-${Math.floor(Math.random() * 9000 + 1000)}`,
        description,
        supplier: supplier || "Fornecedor Cadastrado",
        category: categoryName,
        value: numVal,
        status: "Aguardando aprovação",
      };
      onAddTransaction(newTx);
      syncTransactionToFinance(newTx);
      toast("Nova despesa registrada e sincronizada com o Financeiro!");
    }

    setShowAddExpenseModal(false);
    setEditingTx(null);
  };

  const handleChangeStatus = (tx: FinancialTransaction, newStatus: string) => {
    const updated = { ...tx, status: newStatus as any };
    onUpdateTransaction?.(updated);
    syncTransactionToFinance(updated);
    toast(`Status alterado para "${newStatus}" e atualizado no Financeiro.`);
    setStatusMenuId(null);
    setActionMenuId(null);
  };

  const handleOpenDelete = (id: string) => {
    setDeleteTxId(id);
    setShowDeleteModal(true);
    setActionMenuId(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteTxId) return;
    onDeleteTransaction?.(deleteTxId);
    toast("Despesa excluída do projeto.", "error");
    setShowDeleteModal(false);
    setDeleteTxId(null);
  };

  const statusBadge = (status: string) => {
    const cls =
      status === "Pago"
        ? "bg-[#E8F7F1] text-[#008B63] border-[#00A978]/30"
        : status === "Aguardando aprovação"
        ? "bg-[#FFF4E5] text-[#F59E0B] border-[#F59E0B]/30"
        : status === "Comprometido"
        ? "bg-[#EAF2FF] text-[#1264F3] border-[#1264F3]/30"
        : "bg-[#FEECEC] text-[#EF4444] border-[#EF4444]/30";
    return (
      <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${cls}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6 font-sans text-xs antialiased select-none" onClick={() => { setActionMenuId(null); setStatusMenuId(null); }}>
      {/* ── BARRA SUPERIOR DE AÇÕES ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab("visao_geral")}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#10213D] font-bold text-xs transition shadow-2xs cursor-pointer"
          >
            Detalhes do projeto
          </button>

          <button
            type="button"
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="px-3.5 py-2 rounded-xl bg-[#F0FDF4] border border-[#86EFAC] hover:bg-[#DCFCE7] text-[#166534] font-bold text-xs transition shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Sincronizar lançamentos com o Módulo Financeiro central"
          >
            <Wallet className="h-4 w-4 text-[#16A34A]" strokeWidth={2} />
            <span>{isSyncing ? "Sincronizando..." : "Sincronizar com Financeiro"}</span>
          </button>

          <button
            type="button"
            onClick={() => toast("Exportação do relatório financeiro iniciada em PDF/Excel.")}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#10213D] font-bold text-xs transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="h-4 w-4 text-[#1264F3]" strokeWidth={2} />
            <span>Exportar relatório</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[11px] font-bold text-[#059669]">
            <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
            Integrado ao Financeiro ({lastSync})
          </span>

          <button
            type="button"
            onClick={openAddModal}
            className="h-10 px-5 rounded-xl bg-[#008B63] hover:bg-[#007553] text-white font-extrabold text-xs transition shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            <span>Nova despesa</span>
          </button>
        </div>
      </div>

      {/* ── CARD INDICADORES FINANCEIROS CHAVE ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-2xs">
        <div className="flex items-center gap-3">
          <Wallet className="h-7 w-7 text-[#1264F3] bg-[#EAF2FF] p-1.5 rounded-xl shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#64748B]">Orçamento aprovado</span>
            <span className="text-sm font-black text-[#10213D]">R$ 480.000,00</span>
          </div>
        </div>

        <div className="flex flex-col border-l border-[#F1F5F9] pl-3 justify-center">
          <span className="text-[10px] font-bold text-[#64748B]">Comprometido</span>
          <span className="text-sm font-black text-[#10213D]">R$ 182.400,00</span>
        </div>

        <div className="flex flex-col border-l border-[#F1F5F9] pl-3 justify-center">
          <span className="text-[10px] font-bold text-[#64748B]">Pago</span>
          <span className="text-sm font-black text-[#008B63]">R$ 96.800,00</span>
        </div>

        <div className="flex flex-col border-l border-[#F1F5F9] pl-3 justify-center">
          <span className="text-[10px] font-bold text-[#64748B]">Saldo disponível</span>
          <span className="text-sm font-black text-[#10213D]">R$ 200.800,00</span>
        </div>

        <div className="flex flex-col border-l border-[#F1F5F9] pl-3 justify-center">
          <span className="text-[10px] font-bold text-[#64748B]">Utilização</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm font-black text-[#10213D]">38%</span>
            <div className="w-16 bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
              <div className="bg-[#1264F3] h-full rounded-full" style={{ width: "38%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── GRID DE TABELA DE CATEGORIAS E GRÁFICO ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* Tabela de Orçamento por Categoria */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-col gap-4">
          <h3 className="text-xs font-extrabold text-[#10213D] uppercase tracking-wider border-b border-[#E2E8F0] pb-2.5">
            Orçamento por categoria
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] font-extrabold pb-2">
                  <th className="py-2 pr-4">Categoria</th>
                  <th className="py-2 px-2 text-right">Planejado</th>
                  <th className="py-2 px-2 text-right">Comprometido</th>
                  <th className="py-2 px-2 text-right">Pago</th>
                  <th className="py-2 px-2 text-right">Saldo</th>
                  <th className="py-2 pl-4 text-center">Utilização</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] font-medium text-[#10213D]">
                {categorias.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-3 pr-4 font-extrabold flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span>{cat.name}</span>
                    </td>
                    <td className="py-3 px-2 text-right font-mono">R$ {cat.planned.toLocaleString("pt-BR")},00</td>
                    <td className="py-3 px-2 text-right font-mono">R$ {cat.committed.toLocaleString("pt-BR")},00</td>
                    <td className="py-3 px-2 text-right font-mono text-[#008B63]">R$ {cat.paid.toLocaleString("pt-BR")},00</td>
                    <td className="py-3 px-2 text-right font-mono">R$ {cat.balance.toLocaleString("pt-BR")},00</td>
                    <td className="py-3 pl-4">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-extrabold text-[11px] w-8 text-right">{cat.utilization}%</span>
                        <div className="w-16 bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${cat.utilization}%`, backgroundColor: cat.color }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#E2E8F0] font-black text-[#10213D]">
                  <td className="py-3 uppercase">Total</td>
                  <td className="py-3 text-right font-mono">R$ 480.000,00</td>
                  <td className="py-3 text-right font-mono">R$ 182.400,00</td>
                  <td className="py-3 text-right font-mono text-[#008B63]">R$ 96.800,00</td>
                  <td className="py-3 text-right font-mono">R$ 200.800,00</td>
                  <td className="py-3 text-center">38%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Gráfico e Alertas */}
        <div className="flex flex-col gap-5">
          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-col gap-4">
            <h3 className="text-xs font-extrabold text-[#10213D] uppercase tracking-wider border-b border-[#E2E8F0] pb-2.5">
              Distribuição do orçamento
            </h3>

            <div className="flex items-center justify-center relative my-2">
              <div className="relative h-44 w-44 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#00A978" strokeWidth="18" strokeDasharray="119 238" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#1264F3" strokeWidth="18" strokeDasharray="50 238" strokeDashoffset="-119" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#7928F5" strokeWidth="18" strokeDasharray="35 238" strokeDashoffset="-169" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#F59E0B" strokeWidth="18" strokeDasharray="14 238" strokeDashoffset="-204" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#00C49F" strokeWidth="18" strokeDasharray="20 238" strokeDashoffset="-218" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] font-bold text-[#64748B]">R$</span>
                  <span className="text-lg font-black text-[#10213D] leading-none">480 mil</span>
                </div>
              </div>
            </div>

            <ul className="flex flex-col gap-1.5 text-xs">
              {[
                { color: "#00A978", label: "Obras e infraestrutura", value: "R$ 240.000,00 (50%)" },
                { color: "#1264F3", label: "Equipamentos", value: "R$ 100.000,00 (21%)" },
                { color: "#7928F5", label: "Serviços técnicos", value: "R$ 70.000,00 (15%)" },
                { color: "#F59E0B", label: "Comunicação", value: "R$ 30.000,00 (6%)" },
                { color: "#00C49F", label: "Reserva de contingência", value: "R$ 40.000,00 (8%)" },
              ].map((item) => (
                <li key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[#64748B]">{item.label}</span>
                  </div>
                  <span className="font-extrabold text-[#10213D]">{item.value}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-col gap-3">
            <h4 className="text-xs font-extrabold text-[#10213D] uppercase tracking-wider border-b border-[#E2E8F0] pb-2">
              Alertas Orçamentários
            </h4>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2 text-[#F59E0B]">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span className="font-extrabold text-[#10213D]">Obras e infraestrutura atingiu 72%</span>
              </div>
              <div className="flex items-center gap-2 text-[#1264F3]">
                <Clock className="h-4 w-4 shrink-0" />
                <span className="font-extrabold text-[#10213D]">Duas despesas aguardam aprovação</span>
              </div>
              <div className="flex items-center gap-2 text-[#008B63]">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span className="font-extrabold text-[#10213D]">Reserva de contingência preservada</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABELA DE MOVIMENTAÇÕES FINANCEIRAS COM AÇÕES ── */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
          <h3 className="text-xs font-extrabold text-[#10213D] uppercase tracking-wider">
            Movimentações financeiras
          </h3>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-[#64748B] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por documento ou fornecedor..."
                className="h-8 pl-8 pr-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-8 px-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs"
            >
              <option value="">Todas as categorias</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B] font-extrabold">
                <th className="py-2.5">Data</th>
                <th className="py-2.5">Documento</th>
                <th className="py-2.5">Descrição</th>
                <th className="py-2.5">Fornecedor</th>
                <th className="py-2.5">Categoria</th>
                <th className="py-2.5 text-right">Valor</th>
                <th className="py-2.5 text-center">Status</th>
                <th className="py-2.5 text-center w-10">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] font-medium text-[#10213D]">
              {filteredTx.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#F8FAFC] group">
                  <td className="py-3 text-[#64748B] font-mono">{tx.date}</td>
                  <td className="py-3 font-mono font-bold text-[#1264F3]">{tx.document}</td>
                  <td className="py-3 font-bold">{tx.description}</td>
                  <td className="py-3 text-[#64748B]">{tx.supplier}</td>
                  <td className="py-3">
                    <span className="bg-[#F1F5F9] text-[#10213D] px-2 py-0.5 rounded text-[10px] font-extrabold">
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-3 text-right font-mono font-bold">
                    R$ {tx.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 text-center">
                    {/* Status com dropdown inline */}
                    <div className="relative inline-block">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setStatusMenuId(statusMenuId === tx.id ? null : tx.id); setActionMenuId(null); }}
                        className="flex items-center gap-1 cursor-pointer"
                        title="Alterar status"
                      >
                        {statusBadge(tx.status)}
                        <ChevronDown className="h-3 w-3 text-[#94A3B8] opacity-0 group-hover:opacity-100 transition" />
                      </button>
                      {statusMenuId === tx.id && (
                        <div className="absolute top-7 left-0 z-50 bg-white border border-[#E2E8F0] rounded-xl shadow-xl py-1 min-w-[180px]" onClick={(e) => e.stopPropagation()}>
                          {STATUS_OPTIONS.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => handleChangeStatus(tx, s)}
                              className={`w-full text-left px-3 py-2 text-xs hover:bg-[#F8FAFC] flex items-center gap-2 ${tx.status === s ? "font-extrabold text-[#0B5FEA]" : "text-[#10213D]"}`}
                            >
                              {tx.status === s && <CheckCircle2 className="h-3 w-3 text-[#008B63]" />}
                              {tx.status !== s && <span className="h-3 w-3" />}
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <div className="relative inline-block">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setActionMenuId(actionMenuId === tx.id ? null : tx.id); setStatusMenuId(null); }}
                        className="p-1 rounded hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#10213D] transition cursor-pointer"
                        title="Ações"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {actionMenuId === tx.id && (
                        <div className="absolute right-0 top-7 z-50 bg-white border border-[#E2E8F0] rounded-xl shadow-xl py-1 min-w-[160px]" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => openEditModal(tx)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#10213D] hover:bg-[#F8FAFC] cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5 text-[#1264F3]" />
                            Editar despesa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(tx.id)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#EF4444] hover:bg-[#FEF2F2] cursor-pointer border-t border-[#F1F5F9] mt-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Excluir despesa
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTx.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#64748B]">Nenhuma movimentação encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL NOVA / EDITAR DESPESA */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-md w-full p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-extrabold text-[#10213D]">
                {editingTx ? "Editar Despesa" : "Registrar Nova Despesa"}
              </h3>
              <button type="button" onClick={() => setShowAddExpenseModal(false)} className="text-[#64748B] p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#10213D]">Descrição da Despesa *</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex.: Aquisição de tintas e piso tátil"
                  className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#10213D]">Documento / Nota</label>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder="NF-2025-..."
                    className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#10213D]">Valor (R$) *</label>
                  <input
                    type="text"
                    value={valueAmount}
                    onChange={(e) => setValueAmount(e.target.value)}
                    placeholder="15000,00"
                    className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#10213D]">Categoria</label>
                <select
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium"
                >
                  {categorias.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#10213D]">Fornecedor</label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Nome da empresa fornecedora"
                  className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs"
                />
              </div>

              {editingTx && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#10213D]">Status</label>
                  <select
                    value={txStatus}
                    onChange={(e) => setTxStatus(e.target.value)}
                    className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setShowAddExpenseModal(false)}
                className="px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 rounded-xl bg-[#008B63] hover:bg-[#007553] text-white font-extrabold text-xs shadow-xs"
              >
                {editingTx ? "Salvar alterações" : "Registrar Despesa"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EXCLUIR DESPESA */}
      {showDeleteModal && (() => {
        const txToDelete = transacoes.find((t) => t.id === deleteTxId);
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-md w-full p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <h3 className="text-base font-extrabold text-[#EF4444] flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Excluir despesa
                </h3>
                <button type="button" onClick={() => setShowDeleteModal(false)} className="text-[#64748B] p-1">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-xs text-[#64748B]">
                Tem certeza que deseja excluir a despesa{" "}
                <strong className="text-[#10213D]">{txToDelete?.description}</strong>{" "}
                no valor de{" "}
                <strong className="text-[#10213D]">
                  R$ {txToDelete?.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </strong>?
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
                <button type="button" onClick={() => setShowDeleteModal(false)} className="px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] font-bold text-xs">Cancelar</button>
                <button type="button" onClick={handleConfirmDelete} className="px-5 py-2 rounded-xl bg-[#EF4444] text-white font-extrabold text-xs">Excluir</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
