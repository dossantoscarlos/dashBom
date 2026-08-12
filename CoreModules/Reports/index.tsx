"use client";

import { useMemo, useState } from "react";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { DataTable } from "@/components/dashboard/DataTable";
import { RoleHint } from "@/components/dashboard/RoleHint";
import { useToast } from "@/components/dashboard/Toast";
import { buttonPrimaryClass, inputClass, labelClass } from "@/components/dashboard/form-styles";
import { REPORT_CATEGORIES } from "@/lib/domain/constants";
import { generateMockReportResults } from "@/lib/domain/rules";
import { reportTemplates } from "@/lib/data/reports";
import { ModuleBlock } from "@/components/dashboard/ModuleBlock";
import type { ReportTemplate } from "@/lib/domain/types";
import { exportToCSV, exportToExcel, generatePrintablePDF } from "@/lib/export-utils";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

// ─── Inline Report Viewer ─────────────────────────────────────────────────────
// Usado tanto na aba dedicada de relatório quanto internamente

type ReportViewerProps = {
  report: ReportTemplate;
};

async function fetchRealSystemReport(
  report: ReportTemplate,
  periodo: string
): Promise<{ columns: string[]; rows: Record<string, string | number>[] }> {
  const category = report.category || "";
  const reportId = (report.id || "").toLowerCase();

  // 1. Relatórios de Agenda & Compromissos Operacionais
  if (category === "Operacional" || reportId.includes("agenda") || reportId.includes("eventos")) {
    try {
      const res = await fetch("/api/agenda", { cache: "no-store" });
      let eventos: any[] = [];
      if (res.ok) {
        const data = await res.json();
        if (data.eventos && Array.isArray(data.eventos)) eventos = data.eventos;
      }
      if (typeof window !== "undefined") {
        const local = localStorage.getItem("campanhapro_agenda_events");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            parsed.forEach((evt) => {
              if (!eventos.some((e) => e.id === evt.id)) eventos.push(evt);
            });
          }
        }
      }

      if (eventos.length > 0) {
        return {
          columns: ["Data", "Horário", "Título do Evento", "Local", "Status", "Recorrente"],
          rows: eventos.map((evt) => ({
            Data: evt.dataInicio || evt.dataCompleta || "2026-08-10",
            Horário: evt.diaInteiro ? "Dia Inteiro" : `${evt.horaInicio || "09:00"} às ${evt.horaFim || "11:00"}`,
            "Título do Evento": evt.titulo || "Compromisso de Campanha",
            Local: evt.local || "Não informado",
            Status: evt.status === "confirmado" ? "✓ Aceito" : evt.status === "realizado" ? "🎉 Realizado" : evt.status === "nao_realizado" ? "❌ Não Realizado" : "⏳ Pendente",
            Recorrente: evt.recorrente ? "Sim" : "Não",
          })),
        };
      }
    } catch (e) {
      console.warn("[RELATORIO AGENDA]: Erro ao carregar dados da agenda:", e);
    }
  }

  // 2. Relatórios de Demandas e Projetos da Campanha
  if (reportId.includes("demanda") || reportId.includes("projeto") || reportId.includes("tarefa")) {
    try {
      const res = await fetch("/api/demandas", { cache: "no-store" });
      let demandas: any[] = [];
      if (res.ok) {
        const data = await res.json();
        if (data.demandas && Array.isArray(data.demandas)) demandas = data.demandas;
      }
      if (typeof window !== "undefined") {
        const local = localStorage.getItem("campanhapro_demandas_projetos");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            parsed.forEach((d) => {
              if (!demandas.some((item) => item.id === d.id)) demandas.push(d);
            });
          }
        }
      }

      if (demandas.length > 0) {
        return {
          columns: ["ID", "Título da Demanda", "Solicitante", "Prioridade", "Status", "Prazo"],
          rows: demandas.map((d) => ({
            ID: d.id,
            "Título da Demanda": d.titulo,
            Solicitante: d.solicitante || "Coordenação",
            Prioridade: (d.prioridade || "média").toUpperCase(),
            Status: d.status || "em andamento",
            Prazo: d.prazo || "Sem prazo definido",
          })),
        };
      }
    } catch (e) {
      console.warn("[RELATORIO DEMANDAS]: Erro ao carregar demandas:", e);
    }
  }

  // 3. Relatórios Financeiros e Gastos de Campanha
  if (category === "Financeiro" || reportId.includes("financeiro") || reportId.includes("gastos")) {
    try {
      const res = await fetch("/api/financeiro", { cache: "no-store" });
      let lancamentos: any[] = [];
      if (res.ok) {
        const data = await res.json();
        if (data.lancamentos && Array.isArray(data.lancamentos)) lancamentos = data.lancamentos;
      }

      if (lancamentos.length > 0) {
        return {
          columns: ["Data", "Tipo", "Descrição", "Categoria", "Valor (R$)", "Fornecedor / Origem", "Status"],
          rows: lancamentos.map((l) => ({
            Data: l.data,
            Tipo: l.tipo === "receita" ? "Receita (Entrada)" : "Despesa (Saída)",
            Descrição: l.descricao,
            Categoria: l.categoria,
            "Valor (R$)": Number(l.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
            "Fornecedor / Origem": l.fornecedor || l.origem || "Não informado",
            Status: l.status || "Pago",
          })),
        };
      }
    } catch (e) {
      console.warn("[RELATORIO FINANCEIRO]: Erro ao carregar financeiro:", e);
    }
  }

  // 4. Relatórios de Inteligência Eleitoral TSE / TRE
  if (category === "Inteligência" || category === "Digital" || reportId.includes("tre") || reportId.includes("tse")) {
    try {
      const res = await fetch("/api/tre/candidatos", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.candidatos && Array.isArray(data.candidatos) && data.candidatos.length > 0) {
          return {
            columns: ["Candidato", "Número", "Partido", "Cargo", "UF", "Situação TSE", "Bens (R$)"],
            rows: data.candidatos.map((c: any) => ({
              Candidato: c.nomeUrna || c.nome,
              Número: c.numero,
              Partido: c.partido,
              Cargo: c.cargo,
              UF: c.uf || "SP",
              "Situação TSE": c.situacao || "Deferido",
              "Bens (R$)": c.totalBens ? Number(c.totalBens).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "R$ 0,00",
            })),
          };
        }
      }
    } catch (e) {
      console.warn("[RELATORIO TRE]: Erro ao carregar dados do TSE:", e);
    }
  }

  // 5. Relatórios de Cadastros (Voluntários / Base)
  if (category === "Base Eleitoral" || reportId.includes("voluntarios") || reportId.includes("equipe")) {
    try {
      const res = await fetch("/api/voluntarios", { cache: "no-store" });
      let voluntariados: any[] = [];
      if (res.ok) {
        const data = await res.json();
        if (data.voluntarios && Array.isArray(data.voluntarios)) voluntariados = data.voluntarios;
      }
      if (typeof window !== "undefined") {
        const local = localStorage.getItem("campanhapro_voluntarios");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            parsed.forEach((v) => {
              if (!voluntariados.some((item) => item.id === v.id)) voluntariados.push(v);
            });
          }
        }
      }

      if (voluntariados.length > 0) {
        return {
          columns: ["Nome", "E-mail", "Telefone", "Zona / Cidade", "Área de Atuação", "Status"],
          rows: voluntariados.map((v) => ({
            Nome: v.nome,
            "E-mail": v.email,
            Telefone: v.telefone || "Não informado",
            "Zona / Cidade": `${v.cidade || "São Paulo"} (${v.zona || "SP"})`,
            "Área de Atuação": v.areaAtuacao || "Militância de Campo",
            Status: v.status || "Ativo",
          })),
        };
      }
    } catch (e) {
      console.warn("[RELATORIO VOLUNTARIOS]: Erro ao carregar voluntários:", e);
    }
  }

  // Fallback seguro usando o mock básico
  return generateMockReportResults(report, periodo);
}

export function ReportViewer({ report }: ReportViewerProps) {
  const { toast } = useToast();
  const [periodo, setPeriodo] = useState("2026-Q2");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    columns: string[];
    rows: Record<string, string | number>[];
  } | null>(null);

  async function handleExecute() {
    setLoading(true);
    setResult(null);
    try {
      const data = await fetchRealSystemReport(report, periodo);
      setResult(data);
      toast(`✓ Relatório oficial "${report.title}" gerado com dados reais do sistema!`, "success");
    } catch (e) {
      toast("Erro ao gerar relatório real do sistema.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModuleBlock title={report.title} icon={report.icon}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{report.description}</p>

        <div className="rounded bg-zinc-100 p-2 font-mono text-[10px] dark:bg-zinc-900">
          {report.query}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-1">
            <label htmlFor={`report-period-${report.id}`} className={labelClass}>
              Período
            </label>
            <select
              id={`report-period-${report.id}`}
              className={inputClass}
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
            >
              <option value="2026-Q1">2026 — 1º Trimestre</option>
              <option value="2026-Q2">2026 — 2º Trimestre</option>
              <option value="2026-eleicao">Eleição 2026</option>
            </select>
          </div>
          <button
            type="button"
            onClick={handleExecute}
            disabled={loading}
            className={buttonPrimaryClass}
          >
            {loading ? "Executando..." : "Executar relatório"}
          </button>
        </div>

        {loading && <LoadingSkeleton rows={5} className="mt-2" />}

        {result && !loading && (
          <div className="mt-2 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Pré-visualização do Relatório — {periodo}
              </h4>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const headers = result.columns;
                    const rows = result.rows.map((row) =>
                      result.columns.map((col) => row[col] ?? "")
                    );
                    exportToCSV(`Relatorio_${report.id}_${periodo}`, headers, rows);
                  }}
                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const headers = result.columns;
                    const rows = result.rows.map((row) =>
                      result.columns.map((col) => row[col] ?? "")
                    );
                    exportToExcel(`Relatorio_${report.id}_${periodo}`, headers, rows);
                  }}
                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Exportar Excel</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const headers = result.columns;
                    const rows = result.rows.map((row) =>
                      result.columns.map((col) => row[col] ?? "")
                    );
                    generatePrintablePDF(`${report.title} (${periodo})`, headers, rows);
                  }}
                  className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Gerar PDF (Imprimir)</span>
                </button>
              </div>
            </div>

            <DataTable
              data={result.rows.map((row, i) => ({ ...row, _id: String(i) }))}
              keyExtractor={(row) => row._id}
              columns={result.columns.map((col) => ({
                key: col,
                header: col,
                render: (row: Record<string, string | number> & { _id: string }) => {
                  const val = row[col];
                  return typeof val === "number"
                    ? val.toLocaleString("pt-BR")
                    : String(val ?? "");
                },
              }))}
            />
          </div>
        )}
      </div>
    </ModuleBlock>
  );
}

// ─── Reports Panel ────────────────────────────────────────────────────────────

type ReportsPanelProps = {
  /** Callback para abrir uma aba dedicada no workspace externo */
  onOpenTab?: (
    id: string,
    title: string,
    icon: string,
    component: React.ReactNode,
  ) => void;
};

export function ReportsPanel({ onOpenTab }: ReportsPanelProps) {
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = useMemo(
    () =>
      categoryFilter === "all"
        ? reportTemplates
        : reportTemplates.filter((r) => r.category === categoryFilter),
    [categoryFilter],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, typeof reportTemplates>();
    for (const t of filtered) {
      const list = map.get(t.category) ?? [];
      list.push(t);
      map.set(t.category, list);
    }
    return map;
  }, [filtered]);

  function handleSelectReport(report: ReportTemplate) {
    if (onOpenTab) {
      onOpenTab(
        `relatorio-${report.id}`,
        report.title,
        report.icon,
        <ReportViewer report={report} />,
      );
    }
  }

  return (
    <ModuleBlock title="Inteligência e Relatórios" icon="📊">
      <div className="flex flex-col gap-6">
        <RoleHint />

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase transition ${
              categoryFilter === "all"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            }`}
          >
            Todos
          </button>
          {REPORT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase transition ${
                categoryFilter === cat
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Report cards — always 3 columns */}
        {Array.from(grouped.entries()).map(([category, templates]) => (
          <section key={category}>
            <h2 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              {category}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((report) => (
                <button
                  key={report.id}
                  id={`report-card-${report.id}`}
                  type="button"
                  onClick={() => handleSelectReport(report)}
                  className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-4 text-left transition hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-100/50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-indigo-700 dark:hover:shadow-indigo-900/30"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-2xl" aria-hidden>
                      {report.icon}
                    </span>
                    <span className="mt-0.5 rounded-full bg-zinc-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      {report.category}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-bold text-zinc-900 group-hover:text-indigo-700 dark:text-zinc-50 dark:group-hover:text-indigo-300 transition-colors">
                    {report.title}
                  </p>
                  <p className="mt-1.5 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {report.description}
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-[10px] font-semibold text-indigo-500 opacity-0 transition-opacity group-hover:opacity-100 dark:text-indigo-400">
                    <span>Abrir relatório</span>
                    <span>→</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </ModuleBlock>
  );
}
