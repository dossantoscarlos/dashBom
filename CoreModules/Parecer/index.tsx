"use client";

import { useEffect, useState } from "react";
import { ModuleBlock } from "@/components/dashboard/ModuleBlock";
import { useToast } from "@/components/dashboard/Toast";
import { useDashboard } from "@/contexts/DashboardProvider";
import { getFinancialAudits } from "@/app/actions/dashboard-crud";
import type { FinancialAudit } from "@/lib/domain/types";

export function ParecerPanel() {
  const { toast } = useToast();
  const { can } = useDashboard();
  const [audits, setAudits] = useState<FinancialAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAudit, setSelectedAudit] = useState<FinancialAudit | null>(null);
  const [visibleCount, setVisibleCount] = useState(50);

  useEffect(() => {
    if (!can("parecer:visualizar")) {
      setLoading(false);
      return;
    }

    async function loadAudits() {
      try {
        const data = await getFinancialAudits();
        setAudits(data || []);
      } catch {
        toast("Erro ao carregar os registros de auditoria.", "error");
      } finally {
        setLoading(false);
      }
    }

    loadAudits();
  }, [can, toast]);

  if (!can("parecer:visualizar")) {
    return (
      <ModuleBlock title="Parecer de Lançamentos" icon="⚖️">
        <div className="p-8 text-center text-zinc-500 font-medium">
          ⚠️ Você não possui permissões para visualizar os pareceres e auditoria financeira.
        </div>
      </ModuleBlock>
    );
  }

  // Group visible audits by day
  const visibleAudits = audits.slice(0, visibleCount);
  
  const groupedByDay: Record<string, FinancialAudit[]> = {};
  visibleAudits.forEach((audit) => {
    const dateStr = audit.criadoEm.split("T")[0]; // YYYY-MM-DD
    if (!groupedByDay[dateStr]) {
      groupedByDay[dateStr] = [];
    }
    groupedByDay[dateStr].push(audit);
  });

  const sortedDays = Object.keys(groupedByDay).sort((a, b) => b.localeCompare(a));

  function formatDateHeader(dateStr: string): string {
    const today = new Date().toISOString().split("T")[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split("T")[0];

    const [year, month, day] = dateStr.split("-");
    const formatted = `${day}/${month}/${year}`;

    if (dateStr === today) {
      return `Hoje - ${formatted}`;
    } else if (dateStr === yesterday) {
      return `Ontem - ${formatted}`;
    }
    return formatted;
  }

  function formatTime(isoStr: string): string {
    try {
      const date = new Date(isoStr);
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    } catch {
      return "00:00";
    }
  }

  function formatDateTime(isoStr: string): string {
    try {
      const date = new Date(isoStr);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    } catch {
      return isoStr;
    }
  }

  return (
    <ModuleBlock title="Parecer de Lançamentos" icon="⚖️">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-sm font-bold text-[#154f85] dark:text-blue-400">Auditoria & Pareceres</h2>
          <p className="text-[10px] text-zinc-400">Histórico de auditoria imutável dos lançamentos financeiros criados</p>
        </div>

        {loading ? (
          <div className="py-8 text-center text-zinc-400 text-xs">Carregando auditoria...</div>
        ) : audits.length === 0 ? (
          <div className="py-8 text-center text-zinc-400 text-xs">Nenhum registro de auditoria disponível.</div>
        ) : (
          <div className="space-y-6">
            {sortedDays.map((day) => (
              <div key={day} className="space-y-2">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wide border-b border-zinc-100 dark:border-zinc-800 pb-1">
                  {formatDateHeader(day)}
                </h3>
                
                <div className="divide-y divide-zinc-100 dark:divide-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-950">
                  {groupedByDay[day].map((audit) => (
                    <button
                      key={audit.id}
                      type="button"
                      onClick={() => setSelectedAudit(audit)}
                      className="w-full text-left p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition flex items-center gap-3 text-xs active:scale-[0.99]"
                    >
                      <span className="font-mono font-semibold text-zinc-400 shrink-0">
                        {formatTime(audit.criadoEm)}
                      </span>
                      <span className={`h-2 w-2 rounded-full shrink-0 ${
                        audit.tipoLancamento === "RECEITA" ? "bg-emerald-500" : "bg-rose-500"
                      }`} />
                      <span className="flex-1 font-medium text-zinc-700 dark:text-zinc-300 line-clamp-1">
                        {audit.descricaoCurta}
                      </span>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline uppercase font-bold text-[9px] tracking-wider shrink-0">
                        Ver Detalhes
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {audits.length > visibleCount && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 50)}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded text-xs font-semibold transition active:scale-95"
                >
                  Carregar Mais Registros
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Audit Detail Modal */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-[#fdfdfd] dark:bg-zinc-900">
              <h3 className="font-bold text-sm text-[#154f85] dark:text-blue-400 flex items-center gap-1.5">
                <span>Parecer Técnico #{selectedAudit.id}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded font-black tracking-wider uppercase ${
                  selectedAudit.tipoLancamento === "RECEITA"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300"
                }`}>
                  {selectedAudit.tipoLancamento}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedAudit(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-base"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-4">
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block mb-0.5">Valor</span>
                  <span className="font-black text-sm text-zinc-800 dark:text-zinc-100">
                    R$ {selectedAudit.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block mb-0.5">Data/Hora Auditoria</span>
                  <span className="font-medium text-zinc-800 dark:text-zinc-100 font-mono">
                    {formatDateTime(selectedAudit.criadoEm)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-4">
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block mb-0.5">Tipo de Entidade</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-100 capitalize">
                    {selectedAudit.tipoEntidade.replace("_", " ").toLowerCase()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block mb-0.5">Entidade Vinculada</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-100">
                    {selectedAudit.entidadeDescricao || selectedAudit.entidadeId}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-4">
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block mb-0.5">Usuário Autor</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                    {selectedAudit.usuarioLogadoNome || "Sistema"}
                  </span>
                  {selectedAudit.usuarioLogadoId && (
                    <span className="text-[9px] font-mono text-zinc-400 block">ID: {selectedAudit.usuarioLogadoId}</span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block mb-0.5">Aprovado Por</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                    {selectedAudit.aprovadoPorNome || "—"}
                  </span>
                  {selectedAudit.aprovadoPorId && (
                    <span className="text-[9px] font-mono text-zinc-400 block">ID: {selectedAudit.aprovadoPorId}</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase block mb-0.5">Lançamento ID Original</span>
                <span className="font-mono text-zinc-600 dark:text-zinc-300 font-bold">{selectedAudit.lancamentoId}</span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-zinc-400 font-bold uppercase block">Payload Enviado ao Backend</span>
                <pre className="p-3 bg-zinc-950 text-emerald-400 font-mono text-[11px] rounded-lg overflow-auto max-h-48 border border-zinc-850 whitespace-pre">
                  {JSON.stringify(selectedAudit.payload, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-[#fdfdfd] dark:bg-zinc-900 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAudit(null)}
                className="px-4 py-2 bg-zinc-650 hover:bg-zinc-700 text-white rounded font-bold transition active:scale-95"
              >
                Fechar Parecer
              </button>
            </div>
          </div>
        </div>
      )}
    </ModuleBlock>
  );
}
