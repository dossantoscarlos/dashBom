"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/dashboard/Badge";
import { BarChart } from "@/components/dashboard/BarChart";
import { DataTable } from "@/components/dashboard/DataTable";
import { LineChart } from "@/components/dashboard/LineChart";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RoleHint } from "@/components/dashboard/RoleHint";
import { buttonPrimaryClass, inputClass, labelClass } from "@/components/dashboard/form-styles";
import { TRE_SITUACAO_LABELS, TRE_SITUACAO_VARIANT } from "@/lib/domain/constants";
import { searchCandidates } from "@/lib/data/tre";
import type { TRECandidate } from "@/lib/domain/types";

export function TrePanel() {
  const [nome, setNome] = useState("");
  const [uf, setUf] = useState("SP");
  const [cargo, setCargo] = useState("Deputado Federal");
  const [partido, setPartido] = useState("");
  const [results, setResults] = useState<TRECandidate[]>([]);
  const [searched, setSearched] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [detail, setDetail] = useState<TRECandidate | null>(null);
  const compareList = useMemo(() => results.filter((c) => compareIds.includes(c.id)), [results, compareIds]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setResults(searchCandidates({ nome, uf, cargo, partido }));
    setSearched(true);
    setDetail(null);
    setCompareIds([]);
  }

  function toggleCompare(id: string) {
    setCompareIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev);
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader title="Consulta TRE" description="Consulta simulada — campos baseados na API DivulgaCand do TSE" />
      <RoleHint />
      <form onSubmit={handleSearch} className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5"><label htmlFor="tre-nome" className={labelClass}>Nome</label>
            <input id="tre-nome" className={inputClass} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Roberto" /></div>
          <div className="flex flex-col gap-1.5"><label htmlFor="tre-uf" className={labelClass}>UF</label>
            <select id="tre-uf" className={inputClass} value={uf} onChange={(e) => setUf(e.target.value)}>
              {["SP", "RJ", "MG", "BA", "RS"].map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
          <div className="flex flex-col gap-1.5"><label htmlFor="tre-cargo" className={labelClass}>Cargo</label>
            <select id="tre-cargo" className={inputClass} value={cargo} onChange={(e) => setCargo(e.target.value)}>
              <option value="Deputado Federal">Deputado Federal</option>
              <option value="Deputado Estadual">Deputado Estadual</option>
              <option value="Governador">Governador</option>
              <option value="Senador">Senador</option>
            </select></div>
          <div className="flex flex-col gap-1.5"><label htmlFor="tre-partido" className={labelClass}>Partido</label>
            <input id="tre-partido" className={inputClass} value={partido} onChange={(e) => setPartido(e.target.value)} placeholder="Sigla" /></div>
        </div>
        <button type="submit" className={`mt-4 ${buttonPrimaryClass}`}>Consultar TRE</button>
      </form>
      {compareIds.length > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300">
          Modo comparação: {compareIds.length} selecionado(s).{compareIds.length < 2 && " Selecione ao menos 2."}
        </div>
      )}
      {searched && (
        <DataTable data={results} keyExtractor={(c) => c.id} emptyMessage="Nenhum candidato encontrado."
          columns={[
            { key: "nome", header: "Nome de urna", render: (c) => <button type="button" onClick={() => setDetail(c)} className="font-medium hover:underline">{c.nomeUrna}</button> },
            { key: "numero", header: "Nº", render: (c) => c.numero },
            { key: "partido", header: "Partido", render: (c) => `${c.siglaPartido} — ${c.partido}` },
            { key: "situacao", header: "Situação", render: (c) => <Badge label={TRE_SITUACAO_LABELS[c.situacao]} variant={TRE_SITUACAO_VARIANT[c.situacao]} /> },
            { key: "intencao", header: "Intenção", render: (c) => `${c.intencaoVoto}%` },
            { key: "compare", header: "Comparar", render: (c) => <input type="checkbox" checked={compareIds.includes(c.id)} onChange={() => toggleCompare(c.id)} aria-label={`Comparar ${c.nomeUrna}`} /> },
          ]} />
      )}
      {detail && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><h3 className="text-lg font-semibold">{detail.nomeUrna}</h3><p className="text-sm text-zinc-500">Nº {detail.numero} · {detail.cargo}</p></div>
            <Badge label={TRE_SITUACAO_LABELS[detail.situacao]} variant={TRE_SITUACAO_VARIANT[detail.situacao]} />
          </div>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            <div><dt className="text-zinc-500">Nome completo</dt><dd className="font-medium">{detail.nome}</dd></div>
            <div><dt className="text-zinc-500">Partido / Coligação</dt><dd className="font-medium">{detail.siglaPartido} — {detail.coligacao}</dd></div>
            <div><dt className="text-zinc-500">UF / Município</dt><dd className="font-medium">{detail.uf} — {detail.municipio}</dd></div>
            <div><dt className="text-zinc-500">Ocupação</dt><dd className="font-medium">{detail.ocupacao}</dd></div>
            <div><dt className="text-zinc-500">Grau de instrução</dt><dd className="font-medium">{detail.grauInstrucao ?? "—"}</dd></div>
            <div><dt className="text-zinc-500">Bens declarados</dt><dd className="font-medium">{detail.bensDeclarados ? `R$ ${detail.bensDeclarados.toLocaleString("pt-BR")}` : "—"}</dd></div>
            <div><dt className="text-zinc-500">Votos (última eleição)</dt><dd className="font-medium">{detail.votos.toLocaleString("pt-BR")}</dd></div>
            <div><dt className="text-zinc-500">Intenção de voto</dt><dd className="font-medium text-lg text-blue-600">{detail.intencaoVoto}%</dd></div>
          </dl>
        </div>
      )}
      {compareList.length >= 2 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <BarChart title="Intenção de voto (%)" unit="%" data={compareList.map((c) => ({ label: c.nomeUrna, value: c.intencaoVoto }))} />
          <BarChart title="Votos última eleição" unit="k" data={compareList.map((c) => ({ label: c.nomeUrna, value: Math.round(c.votos / 1000) }))} />
          <div className="lg:col-span-2">
            <LineChart title="Evolução da intenção (simulada)" unit="%" series={compareList.map((c, i) => ({
              label: c.nomeUrna, color: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"][i % 4],
              points: [{ x: "Jan", y: c.intencaoVoto - 4 }, { x: "Mar", y: c.intencaoVoto - 1 }, { x: "Jun", y: c.intencaoVoto + 2 }],
            }))} />
          </div>
        </div>
      )}
    </div>
  );
}
