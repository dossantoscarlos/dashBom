"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/dashboard/DataTable";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RoleHint } from "@/components/dashboard/RoleHint";
import { useToast } from "@/components/dashboard/Toast";
import { buttonPrimaryClass, inputClass, labelClass } from "@/components/dashboard/form-styles";
import { REPORT_CATEGORIES } from "@/lib/domain/constants";
import { generateMockReportResults } from "@/lib/domain/rules";
import { reportTemplates } from "@/lib/data/reports";

export function ReportsPanel() {
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [periodo, setPeriodo] = useState("2026-Q2");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ columns: string[]; rows: Record<string, string | number>[] } | null>(null);

  const selected = reportTemplates.find((r) => r.id === selectedId);
  const filtered = useMemo(
    () => (categoryFilter === "all" ? reportTemplates : reportTemplates.filter((r) => r.category === categoryFilter)),
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

  function handleExecute() {
    if (!selected) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult(generateMockReportResults(selected, periodo));
      setLoading(false);
      toast(`Relatório "${selected.title}" executado.`);
    }, 800);
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader title="Relatórios" description="Modelos categorizados para análise territorial, financeira e eleitoral" />
      <RoleHint />
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setCategoryFilter("all")} className={`rounded-full px-3 py-1 text-xs font-medium ${categoryFilter === "all" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800"}`}>Todos</button>
        {REPORT_CATEGORIES.map((cat) => (
          <button key={cat} type="button" onClick={() => setCategoryFilter(cat)} className={`rounded-full px-3 py-1 text-xs font-medium ${categoryFilter === cat ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800"}`}>{cat}</button>
        ))}
      </div>
      {Array.from(grouped.entries()).map(([category, templates]) => (
        <section key={category}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">{category}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((report) => (
              <button key={report.id} type="button" onClick={() => { setSelectedId(report.id); setResult(null); }}
                className={`rounded-2xl border p-5 text-left transition ${selectedId === report.id ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900" : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"}`}>
                <span className="text-2xl" aria-hidden>{report.icon}</span>
                <p className="mt-3 font-medium">{report.title}</p>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{report.description}</p>
              </button>
            ))}
          </div>
        </section>
      ))}
      {selected && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="font-semibold">{selected.title}</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{selected.description}</p>
          <div className="mt-4 rounded-lg bg-zinc-100 p-3 font-mono text-xs dark:bg-zinc-900">{selected.query}</div>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="report-period" className={labelClass}>Período</label>
              <select id="report-period" className={inputClass} value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
                <option value="2026-Q1">2026 — 1º Trimestre</option>
                <option value="2026-Q2">2026 — 2º Trimestre</option>
                <option value="2026-eleicao">Eleição 2026</option>
              </select>
            </div>
            <button type="button" onClick={handleExecute} disabled={loading} className={buttonPrimaryClass}>
              {loading ? "Executando..." : "Executar relatório"}
            </button>
          </div>
          {loading && <LoadingSkeleton rows={5} className="mt-6" />}
          {result && !loading && (
            <div className="mt-6">
              <h4 className="mb-3 text-sm font-medium">Pré-visualização — {periodo}</h4>
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
      )}
    </div>
  );
}
