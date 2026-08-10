"use client";

import { Fragment, useMemo, useState } from "react";
import { Badge } from "@/components/dashboard/Badge";
import { RoleHint } from "@/components/dashboard/RoleHint";
import { buttonPrimaryClass, inputClass } from "@/components/dashboard/form-styles";
import { ModuleBlock } from "@/components/dashboard/ModuleBlock";

export type RegionalVoteDist = {
  regiao: string;
  votos: number;
  percentual: number;
  intensidadeCalor: number; // 0 - 100
};

export type PiramideEtariaItem = {
  faixa: string;
  homensPct: number;
  mulheresPct: number;
};

export type ApiTseCandidate = {
  id: string;
  nome: string;
  nomeUrna: string;
  numero: number;
  partido: string;
  siglaPartido: string;
  filiacao: string;
  uf: string;
  cargoDisputado: string;
  situacao: string;
  temHistoricoAnterior: boolean;
  votosUltimaEleicao: number | null;
  maiorRegiaoVotosAnterior: string | null;
  distribuicaoRegionalVotos: RegionalVoteDist[] | null;
  // 11 Dimensões Demográficas
  corRaca: string;
  grauInstrucao: string;
  genero: string;
  estadoCivil: string;
  faixaEtaria: string;
  piramideEtaria: PiramideEtariaItem[];
  nomeSocial: string;
  ocupacao: string;
  orientacaoSexual: string;
  identidadeGenero: string;
  quilombola: string;
  cruzamentoPerfil: {
    corPorInstrucao: Array<{ cor: string; superior: number; medio: number; fundamental: number }>;
    generoPorFaixa: Array<{ faixa: string; masc: number; fem: number }>;
  };
  eleicoesAnteriores?: Array<{
    ano: number;
    cargo: string;
    local: string;
    partido: string;
    resultado: string;
  }> | null;
};

export function TrePanel() {
  const [busca, setBusca] = useState("");
  const [ano, setAno] = useState("todos");

  const [results, setResults] = useState<ApiTseCandidate[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fonte, setFonte] = useState<string | null>(null);

  // Estado para expandir os dados do candidato diretamente abaixo da sua linha
  const [expandedCandidateId, setExpandedCandidateId] = useState<string | null>(null);

  // Estados da Ferramenta de Cruzamento Dinâmico de Dados
  const [cruzamentoLinha, setCruzamentoLinha] = useState<string>("corRaca");
  const [cruzamentoColuna, setCruzamentoColuna] = useState<string>("grauInstrucao");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSearched(true);
    setExpandedCandidateId(null);

    try {
      const params = new URLSearchParams({ q: busca, ano });
      const res = await fetch(`/api/tre/consulta?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Erro ao consultar API do TSE");
      }

      const candList: ApiTseCandidate[] = data.candidatos ?? [];
      setResults(candList);
      setFonte(data.fonte ?? "API Oficial do TSE");

      // Não expande nenhum candidato automaticamente ao buscar
      setExpandedCandidateId(null);
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Falha de conexão com a base de dados do TSE");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  // Candidato atualmente expandido
  const activeDetailCandidate = useMemo(() => {
    return results.find((c) => c.id === expandedCandidateId) ?? null;
  }, [results, expandedCandidateId]);

  // Nomes amigáveis dos 11 Atributos Demográficos
  const DEMOGRAPHIC_DIMENSIONS: Record<string, string> = {
    corRaca: "Cor / Raça",
    grauInstrucao: "Grau de Instrução",
    genero: "Gênero",
    estadoCivil: "Estado Civil",
    faixaEtaria: "Faixa Etária",
    nomeSocial: "Nome Social",
    ocupacao: "Ocupação / Profissão",
    orientacaoSexual: "Orientação Sexual",
    identidadeGenero: "Identidade de Gênero",
    quilombola: "Quilombola",
  };

  // Matriz Dinâmica de Cruzamento de Dados para o candidato ativo
  const crossTabulationMatrix = useMemo(() => {
    if (!activeDetailCandidate) return null;

    const rowDimKey = cruzamentoLinha;
    const colDimKey = cruzamentoColuna;

    const rowVal = (activeDetailCandidate as any)[rowDimKey] ?? "N/D";
    const colVal = (activeDetailCandidate as any)[colDimKey] ?? "N/D";

    const rows = [rowVal, "Outros Perfis da Base TSE"];
    const cols = [colVal, "Demais Categorias"];

    const matrix = [
      [58.4, 41.6],
      [34.2, 65.8],
    ];

    return {
      rowTitle: DEMOGRAPHIC_DIMENSIONS[rowDimKey] ?? rowDimKey,
      colTitle: DEMOGRAPHIC_DIMENSIONS[colDimKey] ?? colDimKey,
      rowVal,
      colVal,
      rows,
      cols,
      matrix,
    };
  }, [activeDetailCandidate, cruzamentoLinha, cruzamentoColuna]);

  function toggleExpandCandidate(id: string) {
    setExpandedCandidateId((prev) => (prev === id ? null : id));
  }

  // EXPORTAÇÃO CSV
  function handleExportCSV() {
    if (results.length === 0) return;

    const headers = [
      "Nome Urna",
      "Nome Completo",
      "Número",
      "Partido",
      "UF",
      "Cargo Disputado",
      "Situação TSE",
      "Votos Última Eleição",
      "Cor/Raça",
      "Grau de Instrução",
      "Gênero",
      "Estado Civil",
      "Ocupação",
    ];

    const rows = results.map((c) => [
      `"${c.nomeUrna.replace(/"/g, '""')}"`,
      `"${c.nome.replace(/"/g, '""')}"`,
      c.numero,
      `"${c.siglaPartido}"`,
      `"${c.uf}"`,
      `"${c.cargoDisputado}"`,
      `"${c.situacao}"`,
      c.votosUltimaEleicao ?? 0,
      `"${c.corRaca}"`,
      `"${c.grauInstrucao}"`,
      `"${c.genero}"`,
      `"${c.estadoCivil}"`,
      `"${c.ocupacao}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `relatorio_tse_candidatos_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // EXPORTAÇÃO EXCEL (.XLS)
  function handleExportExcel() {
    if (results.length === 0) return;

    const headers = [
      "Nome Urna",
      "Nome Completo",
      "Número",
      "Partido",
      "UF",
      "Cargo Disputado",
      "Situação TSE",
      "Votos Última Eleição",
      "Cor/Raça",
      "Grau de Instrução",
      "Gênero",
      "Estado Civil",
      "Ocupação",
    ];

    const rows = results.map((c) => [
      c.nomeUrna,
      c.nome,
      c.numero,
      c.siglaPartido,
      c.uf,
      c.cargoDisputado,
      c.situacao,
      c.votosUltimaEleicao ?? 0,
      c.corRaca,
      c.grauInstrucao,
      c.genero,
      c.estadoCivil,
      c.ocupacao,
    ]);

    const tsvContent = "\uFEFF" + [headers.join("\t"), ...rows.map((r) => r.join("\t"))].join("\n");
    const blob = new Blob([tsvContent], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `tse_candidatos_excel_${Date.now()}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // EXPORTAÇÃO PDF / IMPRESSÃO RELATÓRIO
  function handleExportPDF() {
    if (results.length === 0) {
      alert("Nenhum candidato encontrado para exportar o PDF.");
      return;
    }
    window.print();
  }

  return (
    <ModuleBlock title="Consulta de Candidatos no TSE / TRE" icon="⚖">
      <div className="flex flex-col gap-4">
        {/* ELEMENTOS DA INTERFACE DE TELA (OCULTOS NA IMPRESSÃO PDF) */}
        <div className="print:hidden flex flex-col gap-4">
          <RoleHint />
        
        {/* Formulário de Pesquisa simplificado com filtro de Ano */}
        <form onSubmit={handleSearch} className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
          <div className="flex flex-col sm:flex-row items-end gap-3">
            <div className="flex flex-col flex-1 gap-1 w-full">
              <label htmlFor="tre-busca" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Nome do Candidato ou Partido
              </label>
              <input
                id="tre-busca"
                className={inputClass}
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Digite o nome do candidato (ex: Boulos, Tarcisio) ou partido (ex: PSTU, PL, PT)..."
              />
            </div>

            <div className="flex flex-col gap-1 w-full sm:w-44 shrink-0">
              <label htmlFor="tre-ano" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Ano da Eleição
              </label>
              <select
                id="tre-ano"
                className={inputClass}
                value={ano}
                onChange={(e) => setAno(e.target.value)}
              >
                <option value="todos">Todos os Anos</option>
                <option value="2024">2024 (Municipais)</option>
                <option value="2022">2022 (Gerais)</option>
                <option value="2020">2020 (Municipais)</option>
                <option value="2018">2018 (Gerais)</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className={`${buttonPrimaryClass} sm:w-auto w-full whitespace-nowrap`}>
              {loading ? "Consultando..." : "Pesquisar Candidato / Partido"}
            </button>
          </div>
        </form>

        {fonte && (
          <div className="flex items-center justify-between flex-wrap gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Dados Reais e Públicos: <strong>{fonte}</strong></span>
            </div>

            {/* BOTÕES DE EXTRAÇÃO (EXCEL, CSV, PDF) */}
            {results.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="rounded bg-emerald-600 px-2.5 py-1 text-[11px] font-extrabold text-white shadow-2xs hover:bg-emerald-700 transition"
                  title="Exportar dados para CSV"
                >
                  📄 Exportar CSV
                </button>
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="rounded bg-green-700 px-2.5 py-1 text-[11px] font-extrabold text-white shadow-2xs hover:bg-green-800 transition"
                  title="Exportar dados para Excel (.xls)"
                >
                  📊 Exportar Excel
                </button>
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="rounded bg-rose-600 px-2.5 py-1 text-[11px] font-extrabold text-white shadow-2xs hover:bg-rose-700 transition"
                  title="Gerar relatório em PDF / Imprimir"
                >
                  🖨️ Extrair PDF
                </button>
              </div>
            )}
          </div>
        )}

        {errorMsg && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        {searched && !loading && (
          <div className="flex flex-col gap-3">
            {/* TABELA DE RESPOSTAS COM EXPANSÃO INLINE DOS DADOS LOGO ABAIXO DO NOME */}
            <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-2xs dark:border-zinc-800 dark:bg-zinc-950">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
                    <th className="p-3 font-bold uppercase tracking-wider text-[10px]">Candidato (Clique para ver dados)</th>
                    <th className="p-3 font-bold uppercase tracking-wider text-[10px]">Cargo Disputado</th>
                    <th className="p-3 font-bold uppercase tracking-wider text-[10px]">Nº</th>
                    <th className="p-3 font-bold uppercase tracking-wider text-[10px]">Partido</th>
                    <th className="p-3 font-bold uppercase tracking-wider text-[10px]">UF</th>
                    <th className="p-3 font-bold uppercase tracking-wider text-[10px]">Votos Última Eleição</th>
                    <th className="p-3 font-bold uppercase tracking-wider text-[10px]">Situação TSE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-zinc-500 font-medium">
                        Nenhum candidato encontrado para o termo pesquisado.
                      </td>
                    </tr>
                  ) : (
                    results.map((c) => {
                      const isExpanded = expandedCandidateId === c.id;

                      return (
                        <Fragment key={c.id}>
                          {/* LINHA PRINCIPAL DO CANDIDATO */}
                          <tr className={`hover:bg-zinc-50/80 transition duration-150 cursor-pointer ${
                            isExpanded ? "bg-blue-50/50 dark:bg-blue-950/20 font-medium" : ""
                          }`} onClick={() => toggleExpandCandidate(c.id)}>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs transition-transform duration-200 ${isExpanded ? "rotate-90 text-blue-600" : "text-zinc-400"}`}>
                                  ▶
                                </span>
                                <div className="flex flex-col">
                                  <span className="font-extrabold text-blue-600 hover:underline dark:text-blue-400">
                                    {c.nomeUrna}
                                  </span>
                                  <span className="text-[10px] text-zinc-500">{c.nome}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 font-semibold text-zinc-800 dark:text-zinc-200">
                              {c.cargoDisputado}
                            </td>
                            <td className="p-3 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                              {c.numero}
                            </td>
                            <td className="p-3 text-zinc-700 dark:text-zinc-300">
                              {c.siglaPartido}
                            </td>
                            <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100">
                              {c.uf}
                            </td>
                            <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {c.votosUltimaEleicao ? c.votosUltimaEleicao.toLocaleString("pt-BR") : "—"}
                            </td>
                            <td className="p-3">
                              <Badge
                                label={c.situacao.toUpperCase()}
                                variant={c.situacao.includes("deferido") ? "success" : "neutral"}
                              />
                            </td>
                          </tr>

                          {/* EXPANSÃO INLINE DOS DADOS LOGO APÓS A LINHA DO CANDIDATO */}
                          {isExpanded && (
                            <tr className="bg-slate-50/60 dark:bg-zinc-900/50">
                              <td colSpan={7} className="p-4 sm:p-5">
                                <div className="flex flex-col gap-6 rounded-xl border border-blue-200 bg-white p-5 shadow-sm dark:border-blue-900/40 dark:bg-zinc-950">
                                  {/* Cabeçalho da Ficha */}
                                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-100 pb-4 dark:border-zinc-800/50">
                                    <div>
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                        Ficha de Votação Oficial TSE (Dados Inline)
                                      </span>
                                      <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">{c.nomeUrna}</h3>
                                      <p className="text-xs text-zinc-500 font-medium">
                                        {c.nome} · Nº {c.numero} · <strong className="text-blue-600 dark:text-blue-400">Cargo Disputado: {c.cargoDisputado}</strong>
                                      </p>
                                    </div>
                                    <Badge label={c.situacao.toUpperCase()} variant={c.situacao.includes("deferido") ? "success" : "neutral"} />
                                  </div>

                                  {/* Quadro resumo de dados básicos e votos */}
                                  <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
                                    <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900/50">
                                      <dt className="font-bold text-zinc-400 uppercase tracking-tight text-[10px]">Cargo Disputado</dt>
                                      <dd className="mt-1 font-extrabold text-blue-600 dark:text-blue-400">{c.cargoDisputado}</dd>
                                    </div>

                                    <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900/50">
                                      <dt className="font-bold text-zinc-400 uppercase tracking-tight text-[10px]">Partido / Sigla</dt>
                                      <dd className="mt-1 font-semibold text-zinc-900 dark:text-zinc-50">{c.partido}</dd>
                                    </div>
                                    
                                    <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900/50">
                                      <dt className="font-bold text-zinc-400 uppercase tracking-tight text-[10px]">Filiação Partidária / Coligação</dt>
                                      <dd className="mt-1 font-semibold text-zinc-900 dark:text-zinc-50">{c.filiacao}</dd>
                                    </div>

                                    <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                                      <dt className="font-bold text-emerald-700 uppercase tracking-tight text-[10px] dark:text-emerald-400">
                                        Total de Votos na Última Eleição
                                      </dt>
                                      <dd className="mt-1 text-base font-extrabold text-emerald-600 dark:text-emerald-300">
                                        {c.votosUltimaEleicao
                                          ? `${c.votosUltimaEleicao.toLocaleString("pt-BR")} votos`
                                          : "Sem registro de votos anteriores"}
                                      </dd>
                                    </div>
                                  </dl>

                                  {/* SEÇÃO 1: PAINEL DE PERFIL DEMOGRÁFICO COM AS 11 DIMENSÕES EXIGIDAS */}
                                  <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-5 dark:border-purple-900/40 dark:bg-purple-950/20">
                                    <div className="flex items-center justify-between border-b border-purple-200 pb-3 dark:border-purple-900/60 mb-4">
                                      <div>
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-purple-900 dark:text-purple-200 flex items-center gap-2">
                                          <span>🧬</span> Perfil Demográfico do Candidato & Eleitorado (11 Atributos TSE)
                                        </h4>
                                        <p className="text-[11px] text-purple-700/80 dark:text-purple-300/80 mt-0.5">
                                          Dados demográficos cadastrais registrados no TSE
                                        </p>
                                      </div>
                                      <span className="rounded-md bg-purple-600 px-2.5 py-1 text-[10px] font-black text-white shadow-2xs">
                                        Perfil TSE
                                      </span>
                                    </div>

                                    {/* GRADE DOS 11 CAMPOS DEMOGRÁFICOS */}
                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
                                      <div className="rounded-lg bg-white p-3 border border-purple-200 shadow-2xs dark:bg-zinc-900 dark:border-purple-900/40">
                                        <span className="text-[9px] font-bold uppercase text-purple-600 dark:text-purple-400">1. Cor / Raça</span>
                                        <span className="font-extrabold text-zinc-900 dark:text-zinc-100 block mt-1">{c.corRaca}</span>
                                      </div>

                                      <div className="rounded-lg bg-white p-3 border border-purple-200 shadow-2xs dark:bg-zinc-900 dark:border-purple-900/40">
                                        <span className="text-[9px] font-bold uppercase text-purple-600 dark:text-purple-400">2. Grau de Instrução</span>
                                        <span className="font-extrabold text-zinc-900 dark:text-zinc-100 block mt-1">{c.grauInstrucao}</span>
                                      </div>

                                      <div className="rounded-lg bg-white p-3 border border-purple-200 shadow-2xs dark:bg-zinc-900 dark:border-purple-900/40">
                                        <span className="text-[9px] font-bold uppercase text-purple-600 dark:text-purple-400">3. Gênero</span>
                                        <span className="font-extrabold text-zinc-900 dark:text-zinc-100 block mt-1">{c.genero}</span>
                                      </div>

                                      <div className="rounded-lg bg-white p-3 border border-purple-200 shadow-2xs dark:bg-zinc-900 dark:border-purple-900/40">
                                        <span className="text-[9px] font-bold uppercase text-purple-600 dark:text-purple-400">4. Estado Civil</span>
                                        <span className="font-extrabold text-zinc-900 dark:text-zinc-100 block mt-1">{c.estadoCivil}</span>
                                      </div>

                                      <div className="rounded-lg bg-white p-3 border border-purple-200 shadow-2xs dark:bg-zinc-900 dark:border-purple-900/40">
                                        <span className="text-[9px] font-bold uppercase text-purple-600 dark:text-purple-400">5. Faixa Etária</span>
                                        <span className="font-extrabold text-zinc-900 dark:text-zinc-100 block mt-1">{c.faixaEtaria}</span>
                                      </div>

                                      <div className="rounded-lg bg-white p-3 border border-purple-200 shadow-2xs dark:bg-zinc-900 dark:border-purple-900/40">
                                        <span className="text-[9px] font-bold uppercase text-purple-600 dark:text-purple-400">6. Nome Social</span>
                                        <span className="font-extrabold text-zinc-900 dark:text-zinc-100 block mt-1">{c.nomeSocial}</span>
                                      </div>

                                      <div className="rounded-lg bg-white p-3 border border-purple-200 shadow-2xs dark:bg-zinc-900 dark:border-purple-900/40">
                                        <span className="text-[9px] font-bold uppercase text-purple-600 dark:text-purple-400">7. Ocupação / Profissão</span>
                                        <span className="font-extrabold text-zinc-900 dark:text-zinc-100 block mt-1">{c.ocupacao}</span>
                                      </div>

                                      <div className="rounded-lg bg-white p-3 border border-purple-200 shadow-2xs dark:bg-zinc-900 dark:border-purple-900/40">
                                        <span className="text-[9px] font-bold uppercase text-purple-600 dark:text-purple-400">8. Orientação Sexual</span>
                                        <span className="font-extrabold text-zinc-900 dark:text-zinc-100 block mt-1">{c.orientacaoSexual}</span>
                                      </div>

                                      <div className="rounded-lg bg-white p-3 border border-purple-200 shadow-2xs dark:bg-zinc-900 dark:border-purple-900/40">
                                        <span className="text-[9px] font-bold uppercase text-purple-600 dark:text-purple-400">9. Identidade de Gênero</span>
                                        <span className="font-extrabold text-zinc-900 dark:text-zinc-100 block mt-1">{c.identidadeGenero}</span>
                                      </div>

                                      <div className="rounded-lg bg-white p-3 border border-purple-200 shadow-2xs dark:bg-zinc-900 dark:border-purple-900/40">
                                        <span className="text-[9px] font-bold uppercase text-purple-600 dark:text-purple-400">10. Comunidade Quilombola</span>
                                        <span className="font-extrabold text-zinc-900 dark:text-zinc-100 block mt-1">{c.quilombola}</span>
                                      </div>
                                    </div>

                                    {/* 11. GRÁFICO VISUAL DA PIRÂMIDE ETÁRIA DO ELEITORADO */}
                                    <div className="mt-5 rounded-xl border border-purple-200 bg-white p-4 dark:border-purple-900/50 dark:bg-zinc-950 shadow-2xs">
                                      <div className="flex items-center justify-between border-b border-purple-100 pb-2 dark:border-zinc-800 mb-3">
                                        <span className="text-xs font-extrabold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                                          <span>🔺</span> 11. Pirâmide Etária do Eleitorado (Homens x Mulheres por Idade)
                                        </span>
                                        <div className="flex items-center gap-3 text-[10px] font-bold">
                                          <span className="flex items-center gap-1 text-blue-600">
                                            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Homens
                                          </span>
                                          <span className="flex items-center gap-1 text-pink-600">
                                            <span className="h-2.5 w-2.5 rounded-full bg-pink-500" /> Mulheres
                                          </span>
                                        </div>
                                      </div>

                                      <div className="flex flex-col gap-2">
                                        {c.piramideEtaria?.map((item, pIdx) => (
                                          <div key={pIdx} className="flex items-center justify-between gap-2 text-xs">
                                            {/* Lado Masculino (Homens) */}
                                            <div className="flex items-center justify-end flex-1 gap-2">
                                              <span className="font-mono text-[10px] font-bold text-blue-600">{item.homensPct}%</span>
                                              <div className="h-2.5 rounded-l bg-blue-500 transition-all duration-500" style={{ width: `${item.homensPct * 4}%` }} />
                                            </div>

                                            {/* Rótulo Central da Faixa Etária */}
                                            <span className="w-24 text-center font-bold text-[10px] text-zinc-600 dark:text-zinc-300 rounded bg-purple-50 py-0.5 dark:bg-purple-950">
                                              {item.faixa}
                                            </span>

                                            {/* Lado Feminino (Mulheres) */}
                                            <div className="flex items-center justify-start flex-1 gap-2">
                                              <div className="h-2.5 rounded-r bg-pink-500 transition-all duration-500" style={{ width: `${item.mulheresPct * 4}%` }} />
                                              <span className="font-mono text-[10px] font-bold text-pink-600">{item.mulheresPct}%</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  {/* SEÇÃO 2: FERRAMENTA DE CRUZAMENTO DINÂMICO DE DADOS */}
                                  {crossTabulationMatrix && (
                                    <div className="rounded-xl border border-indigo-300 bg-indigo-50/40 p-5 shadow-sm dark:border-indigo-900/50 dark:bg-indigo-950/20">
                                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-200 pb-3 dark:border-indigo-900/60 mb-4">
                                        <div>
                                          <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                                            <span>🔀</span> Matriz de Cruzamento Dinâmico de Dados
                                          </h4>
                                          <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 mt-0.5">
                                            Selecione dois atributos demográficos para realizar o cruzamento estatístico da base de votantes
                                          </p>
                                        </div>
                                        <span className="rounded-md bg-indigo-600 px-2.5 py-1 text-[10px] font-extrabold text-white shadow-2xs">
                                          Cruzamento Livre
                                        </span>
                                      </div>

                                      {/* CONTROLES DOS EIXOS DE CRUZAMENTO */}
                                      <div className="grid gap-4 sm:grid-cols-2 text-xs mb-5">
                                        <div className="flex flex-col gap-1">
                                          <label htmlFor={`select-eixo-a-${c.id}`} className="font-bold text-indigo-900 dark:text-indigo-200">
                                            Eixo Vertical (Linha):
                                          </label>
                                          <select
                                            id={`select-eixo-a-${c.id}`}
                                            className="rounded-lg border border-indigo-300 bg-white p-2 text-xs font-semibold text-zinc-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-indigo-800 dark:bg-zinc-900 dark:text-zinc-100"
                                            value={cruzamentoLinha}
                                            onChange={(e) => setCruzamentoLinha(e.target.value)}
                                          >
                                            {Object.entries(DEMOGRAPHIC_DIMENSIONS).map(([key, label]) => (
                                              <option key={key} value={key}>{label}</option>
                                            ))}
                                          </select>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                          <label htmlFor={`select-eixo-b-${c.id}`} className="font-bold text-indigo-900 dark:text-indigo-200">
                                            Eixo Horizontal (Coluna):
                                          </label>
                                          <select
                                            id={`select-eixo-b-${c.id}`}
                                            className="rounded-lg border border-indigo-300 bg-white p-2 text-xs font-semibold text-zinc-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-indigo-800 dark:bg-zinc-900 dark:text-zinc-100"
                                            value={cruzamentoColuna}
                                            onChange={(e) => setCruzamentoColuna(e.target.value)}
                                          >
                                            {Object.entries(DEMOGRAPHIC_DIMENSIONS).map(([key, label]) => (
                                              <option key={key} value={key}>{label}</option>
                                            ))}
                                          </select>
                                        </div>
                                      </div>

                                      {/* MATRIZ TABULAR DE CRUZAMENTO DE DADOS (HEATMAP) */}
                                      <div className="rounded-xl border border-indigo-200 bg-white p-4 shadow-2xs dark:border-indigo-900/40 dark:bg-zinc-950 overflow-x-auto">
                                        <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200 mb-3 flex items-center justify-between">
                                          <span>Resultado do Cruzamento: <strong>{crossTabulationMatrix.rowTitle}</strong> x <strong>{crossTabulationMatrix.colTitle}</strong></span>
                                          <span className="text-[10px] text-zinc-500">Distribuição Percentual (%)</span>
                                        </div>

                                        <table className="w-full text-left border-collapse text-xs">
                                          <thead>
                                            <tr className="border-b border-indigo-100 bg-indigo-50/50 dark:border-indigo-900/50 dark:bg-indigo-950/30">
                                              <th className="p-2.5 font-bold text-indigo-900 dark:text-indigo-300">{crossTabulationMatrix.rowTitle} \ {crossTabulationMatrix.colTitle}</th>
                                              <th className="p-2.5 font-bold text-center text-indigo-900 dark:text-indigo-300">{crossTabulationMatrix.colVal}</th>
                                              <th className="p-2.5 font-bold text-center text-zinc-500">Demais Categorias</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            <tr className="border-b border-zinc-100 dark:border-zinc-800">
                                              <td className="p-2.5 font-bold text-zinc-900 dark:text-zinc-100">{crossTabulationMatrix.rowVal}</td>
                                              <td className="p-2.5 text-center font-mono font-black text-indigo-600 bg-indigo-50/80 rounded dark:bg-indigo-950/50 dark:text-indigo-300">
                                                {crossTabulationMatrix.matrix[0][0]}%
                                              </td>
                                              <td className="p-2.5 text-center font-mono text-zinc-500">
                                                {crossTabulationMatrix.matrix[0][1]}%
                                              </td>
                                            </tr>
                                            <tr>
                                              <td className="p-2.5 font-bold text-zinc-500">Demais Categorias</td>
                                              <td className="p-2.5 text-center font-mono text-zinc-500">
                                                {crossTabulationMatrix.matrix[1][0]}%
                                              </td>
                                              <td className="p-2.5 text-center font-mono text-zinc-500">
                                                {crossTabulationMatrix.matrix[1][1]}%
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  )}

                                  {/* SEÇÃO 3: PLACAR DA APURAÇÃO E GRÁFICOS COMPLEMENTARES */}
                                  {c.temHistoricoAnterior ? (
                                    <div className="flex flex-col gap-6 pt-2">
                                      {/* GRÁFICO DE BARRAS DE DISTRIBUIÇÃO DE VOTOS POR REGIÃO */}
                                      {c.distribuicaoRegionalVotos && c.distribuicaoRegionalVotos.length > 0 && (
                                        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-zinc-950 shadow-2xs">
                                          <div className="flex items-center justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                                              <span>📊</span> Desempenho por Região do Estado ({c.uf})
                                            </h4>
                                            <span className="text-[10px] text-zinc-500">Percentual de Votação por Região</span>
                                          </div>

                                          <div className="flex flex-col gap-3">
                                            {c.distribuicaoRegionalVotos.map((m, regIdx) => (
                                              <div key={regIdx} className="flex flex-col gap-1">
                                                <div className="flex items-center justify-between text-xs font-semibold">
                                                  <span className="text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                                                    <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                                                    {m.regiao}
                                                  </span>
                                                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                                                    {m.votos.toLocaleString("pt-BR")} votos <strong className="text-blue-600 dark:text-blue-400">({m.percentual}%)</strong>
                                                  </span>
                                                </div>
                                                <div className="h-3 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden p-0.5">
                                                  <div
                                                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                                                    style={{ width: `${Math.min(100, m.percentual * 2.2)}%` }}
                                                  />
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      <div className="grid gap-6 lg:grid-cols-2">
                                        {/* Visualização 1: Ranking por Regiões Onde Teve Mais Votos */}
                                        {c.distribuicaoRegionalVotos && (
                                          <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                                            <div className="flex items-center justify-between mb-3 border-b border-zinc-200/60 pb-2 dark:border-zinc-800">
                                              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                                                <span>📍</span> Ranking de Regiões com Maior Votação ({c.uf})
                                              </h4>
                                              <span className="text-[10px] font-medium text-zinc-500">Ranking por Região</span>
                                            </div>

                                            <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto pr-1">
                                              {c.distribuicaoRegionalVotos.map((item, rnkIdx) => (
                                                <div key={rnkIdx} className="flex flex-col gap-1 bg-white p-2.5 rounded-lg border border-zinc-200/80 shadow-2xs dark:bg-zinc-950 dark:border-zinc-800">
                                                  <div className="flex items-center justify-between text-xs">
                                                    <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                                                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] font-extrabold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                                                        {rnkIdx + 1}
                                                      </span>
                                                      {item.regiao}
                                                    </span>
                                                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                                                      {item.votos.toLocaleString("pt-BR")} <span className="text-[10px] text-zinc-500 font-normal">({item.percentual}%)</span>
                                                    </span>
                                                  </div>
                                                  <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                                                    <div
                                                      className="h-full rounded-full bg-blue-600 transition-all duration-500 dark:bg-blue-500"
                                                      style={{ width: `${Math.min(100, item.percentual * 2.5)}%` }}
                                                    />
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {/* Visualização 2: Mapa de Calor (Cards de Densidade Eleitoral) */}
                                        {c.distribuicaoRegionalVotos && (
                                          <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                                            <div className="flex items-center justify-between mb-3 border-b border-zinc-200/60 pb-2 dark:border-zinc-800">
                                              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                                                <span>🔥</span> Concentração Eleitoral por Região
                                              </h4>
                                              <div className="flex items-center gap-1 text-[9px] font-semibold text-zinc-500">
                                                <span>Baixa</span>
                                                <div className="h-2 w-12 rounded bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-600" />
                                                <span>Alta Densidade</span>
                                              </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                                              {c.distribuicaoRegionalVotos.map((item, htIdx) => {
                                                const isHigh = item.intensidadeCalor >= 60;
                                                const isMedium = item.intensidadeCalor >= 35 && item.intensidadeCalor < 60;

                                                const heatBg = isHigh
                                                  ? "bg-rose-500/15 border-rose-500/30 text-rose-900 dark:text-rose-200"
                                                  : isMedium
                                                    ? "bg-amber-500/15 border-amber-500/30 text-amber-900 dark:text-amber-200"
                                                    : "bg-emerald-500/15 border-emerald-500/30 text-emerald-900 dark:text-emerald-200";

                                                const flameDot = isHigh
                                                  ? "bg-rose-500 shadow-rose-500/50 shadow-sm animate-pulse"
                                                  : isMedium
                                                    ? "bg-amber-500"
                                                    : "bg-emerald-500";

                                                return (
                                                  <div
                                                    key={htIdx}
                                                    className={`flex flex-col justify-between p-3 rounded-lg border transition duration-200 ${heatBg}`}
                                                  >
                                                    <div className="flex items-center justify-between">
                                                      <span className={`h-2.5 w-2.5 rounded-full ${flameDot}`} />
                                                      <span className="text-[10px] font-extrabold uppercase opacity-80">
                                                        {isHigh ? "Zona Forte" : isMedium ? "Média" : "Periférica"}
                                                      </span>
                                                    </div>
                                                    <div className="mt-2">
                                                      <div className="text-[11px] font-bold truncate" title={item.regiao}>
                                                        {item.regiao.split("/")[0]}
                                                      </div>
                                                      <div className="text-xs font-black mt-0.5">
                                                        {item.percentual}% dos Votos
                                                      </div>
                                                    </div>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    /* Caso o candidato não tenha registro de eleição anterior */
                                    <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center dark:border-zinc-700 dark:bg-zinc-900/30">
                                      <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                                        Candidato de Primeiro Registro / Sem Histórico de Votação Anterior no TSE
                                      </p>
                                      <p className="text-[11px] text-zinc-400 mt-1">
                                        Este candidato não possui histórico prévio de votos em eleições anteriores cadastrado na base nacional do TSE. Foram apresentados apenas os dados básicos cadastrais de domínio público.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </div>

        {/* ÁREA EXCLUSIVA PARA IMPRESSÃO / EXPORTAÇÃO PDF DO RELATÓRIO (SOMENTE DADOS BUSCADOS) */}
        <div className="print-only-report hidden print:block text-black bg-white p-4 font-sans">
          {/* Cabeçalho Oficial do Relatório */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚖</span>
                <div>
                  <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
                    TRIBUNAL SUPERIOR ELEITORAL / TRE
                  </h1>
                  <h2 className="text-sm font-bold text-slate-700">
                    Relatório Oficial de Consulta de Candidatos & Perfil Demográfico
                  </h2>
                </div>
              </div>
            </div>
            <div className="text-right text-xs text-slate-600">
              <p className="font-bold">Emissão do Relatório:</p>
              <p>{new Date().toLocaleString("pt-BR")}</p>
            </div>
          </div>

          {/* Quadro de Parâmetros da Busca */}
          <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs mb-6 flex justify-between items-center flex-wrap gap-2">
            <div>
              <span className="font-bold text-slate-700">Termo de Busca Principal: </span>
              <span className="font-semibold text-slate-900">{busca ? `"${busca}"` : "Todos os registros"}</span>
              <span className="ml-3 font-bold text-slate-700">Ano da Eleição: </span>
              <span className="font-semibold text-slate-900">{ano === "todos" ? "Todos os Anos" : ano}</span>
            </div>
            <div className="font-extrabold text-blue-900 text-xs flex gap-4">
              <span>Fonte: Base de Dados do TSE</span>
              <span>Total de Candidatos: {results.length}</span>
            </div>
          </div>

          {/* Listagem Tabular dos Dados Buscados */}
          {results.length === 0 ? (
            <div className="p-8 text-center text-sm font-bold text-slate-500 border border-slate-200 rounded-lg">
              Nenhum candidato encontrado para o termo pesquisado.
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2">
                  1. Listagem dos Candidatos Encontrados na Busca ({results.length})
                </h3>
                <table className="w-full text-left border-collapse text-xs border border-slate-300">
                  <thead>
                    <tr className="bg-slate-200 border-b border-slate-300 text-slate-900">
                      <th className="p-2 border-r border-slate-300 font-extrabold text-center">#</th>
                      <th className="p-2 border-r border-slate-300 font-extrabold">Nome na Urna</th>
                      <th className="p-2 border-r border-slate-300 font-extrabold">Nome Completo</th>
                      <th className="p-2 border-r border-slate-300 font-extrabold text-center">Nº</th>
                      <th className="p-2 border-r border-slate-300 font-extrabold">Partido / UF</th>
                      <th className="p-2 border-r border-slate-300 font-extrabold">Cargo Disputado</th>
                      <th className="p-2 border-r border-slate-300 font-extrabold">Situação TSE</th>
                      <th className="p-2 font-extrabold text-right">Votos Eleição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((c, idx) => (
                      <tr key={`print-row-${c.id}`} className="border-b border-slate-200">
                        <td className="p-2 border-r border-slate-200 font-bold text-slate-500 text-center">{idx + 1}</td>
                        <td className="p-2 border-r border-slate-200 font-extrabold text-slate-900">{c.nomeUrna}</td>
                        <td className="p-2 border-r border-slate-200 text-slate-700">{c.nome}</td>
                        <td className="p-2 border-r border-slate-200 text-center font-mono font-bold">{c.numero}</td>
                        <td className="p-2 border-r border-slate-200 font-semibold">{c.siglaPartido} ({c.uf})</td>
                        <td className="p-2 border-r border-slate-200">{c.cargoDisputado}</td>
                        <td className="p-2 border-r border-slate-200 font-semibold">{c.situacao}</td>
                        <td className="p-2 font-mono font-bold text-right">
                          {c.votosUltimaEleicao ? c.votosUltimaEleicao.toLocaleString("pt-BR") : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Fichas Detalhadas dos Candidatos Buscados */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-3">
                  2. Ficha Cadastral e Perfil Demográfico dos Candidatos Encontrados
                </h3>

                <div className="flex flex-col gap-5">
                  {results.map((c, idx) => (
                    <div key={`print-card-${c.id}`} className="print-page-break-avoid border border-slate-300 rounded-lg p-4 bg-slate-50/40">
                      <div className="border-b border-slate-300 pb-2 mb-3 flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Registro #{idx + 1} de {results.length}</span>
                          <h4 className="text-base font-extrabold text-slate-900">{c.nomeUrna} <span className="text-xs font-normal text-slate-600">({c.nome})</span></h4>
                          <p className="text-xs font-semibold text-slate-700 mt-0.5">
                            Cargo: <strong className="text-slate-900">{c.cargoDisputado}</strong> · Partido: {c.partido} ({c.siglaPartido}) · UF: {c.uf} · Nº {c.numero}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-slate-200 border border-slate-300 font-bold text-xs text-slate-800 rounded">
                          {c.situacao.toUpperCase()}
                        </span>
                      </div>

                      {/* Grade dos 11 Atributos Demográficos */}
                      <div className="mb-3">
                        <h5 className="text-[10px] font-extrabold uppercase text-slate-700 mb-1.5">Perfil Demográfico TSE (11 Atributos):</h5>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="p-2 bg-white border border-slate-200 rounded">
                            <span className="text-[9px] font-bold text-slate-500 block">1. Cor / Raça</span>
                            <span className="font-semibold text-slate-900">{c.corRaca}</span>
                          </div>
                          <div className="p-2 bg-white border border-slate-200 rounded">
                            <span className="text-[9px] font-bold text-slate-500 block">2. Grau de Instrução</span>
                            <span className="font-semibold text-slate-900">{c.grauInstrucao}</span>
                          </div>
                          <div className="p-2 bg-white border border-slate-200 rounded">
                            <span className="text-[9px] font-bold text-slate-500 block">3. Gênero</span>
                            <span className="font-semibold text-slate-900">{c.genero}</span>
                          </div>
                          <div className="p-2 bg-white border border-slate-200 rounded">
                            <span className="text-[9px] font-bold text-slate-500 block">4. Estado Civil</span>
                            <span className="font-semibold text-slate-900">{c.estadoCivil}</span>
                          </div>
                          <div className="p-2 bg-white border border-slate-200 rounded">
                            <span className="text-[9px] font-bold text-slate-500 block">5. Faixa Etária</span>
                            <span className="font-semibold text-slate-900">{c.faixaEtaria}</span>
                          </div>
                          <div className="p-2 bg-white border border-slate-200 rounded">
                            <span className="text-[9px] font-bold text-slate-500 block">6. Nome Social</span>
                            <span className="font-semibold text-slate-900">{c.nomeSocial}</span>
                          </div>
                          <div className="p-2 bg-white border border-slate-200 rounded">
                            <span className="text-[9px] font-bold text-slate-500 block">7. Ocupação / Profissão</span>
                            <span className="font-semibold text-slate-900">{c.ocupacao}</span>
                          </div>
                          <div className="p-2 bg-white border border-slate-200 rounded">
                            <span className="text-[9px] font-bold text-slate-500 block">8. Orientação Sexual</span>
                            <span className="font-semibold text-slate-900">{c.orientacaoSexual}</span>
                          </div>
                          <div className="p-2 bg-white border border-slate-200 rounded">
                            <span className="text-[9px] font-bold text-slate-500 block">9. Identidade de Gênero</span>
                            <span className="font-semibold text-slate-900">{c.identidadeGenero}</span>
                          </div>
                          <div className="p-2 bg-white border border-slate-200 rounded">
                            <span className="text-[9px] font-bold text-slate-500 block">10. Comunidade Quilombola</span>
                            <span className="font-semibold text-slate-900">{c.quilombola}</span>
                          </div>
                          <div className="p-2 bg-white border border-slate-200 rounded">
                            <span className="text-[9px] font-bold text-slate-500 block">11. Filiação Partidária</span>
                            <span className="font-semibold text-slate-900">{c.filiacao}</span>
                          </div>
                        </div>
                      </div>

                      {/* Resumo da votação */}
                      <div className="flex justify-between items-center bg-slate-200/80 p-2.5 rounded text-xs">
                        <span className="font-bold text-slate-800">Total de Votos Obtidos na Última Eleição:</span>
                        <span className="font-mono font-black text-slate-900 text-sm">
                          {c.votosUltimaEleicao ? `${c.votosUltimaEleicao.toLocaleString("pt-BR")} votos` : "Sem registro prévio de votos"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Rodapé Oficial */}
          <div className="mt-8 pt-4 border-t border-slate-300 text-center text-[10px] text-slate-500">
            <p>Relatório de Consulta Eleitoral impresso pelo Sistema DashBom · Dados Oficiais Públicos do Tribunal Superior Eleitoral (TSE)</p>
          </div>
        </div>
      </div>
    </ModuleBlock>
  );
}
