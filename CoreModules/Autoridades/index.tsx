"use client";

import { useEffect, useMemo, useState } from "react";
import { ModuleBlock } from "@/components/dashboard/ModuleBlock";
import { buttonPrimaryClass, inputClass } from "@/components/dashboard/form-styles";

export type AutoridadeContact = {
  id: string;
  nome: string;
  nomePolitico: string;
  cargo: string;
  partido: string;
  siglaPartido: string;
  uf: string;
  telefoneGabinete: string;
  emailGabinete: string;
  enderecoGabinete: string;
  situacao: string;
};

const ALL_UFS = [
  "TODOS", "SP", "RJ", "MG", "BA", "RS", "PR", "PE", "CE", "GO", "DF", "SC", "ES", "AM", "PA", "MA", "AL", "PB", "RN", "PI", "SE", "TO", "RO", "AC", "AP", "RR", "MS", "MT"
];

export function AutoridadesPanel() {
  const [busca, setBusca] = useState("");
  const [uf, setUf] = useState("TODOS");
  const [cargo, setCargo] = useState("todos");

  const [autoridades, setAutoridades] = useState<AutoridadeContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fonte, setFonte] = useState<string | null>(null);

  async function fetchAutoridades() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const params = new URLSearchParams();
      if (busca) params.set("q", busca);
      if (uf !== "TODOS") params.set("uf", uf);
      if (cargo !== "todos") params.set("cargo", cargo);

      const res = await fetch(`/api/tre/autoridades?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Erro ao consultar contatos de autoridades.");
      }

      setAutoridades(data.autoridades ?? []);
      setFonte(data.fonte ?? "TSE e Portais Oficiais do Poder Público");
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Falha de conexão com a base de dados de autoridades.");
      setAutoridades([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAutoridades();
  }, [uf, cargo]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchAutoridades();
  }

  function handleExportCSV() {
    if (autoridades.length === 0) return;
    const headers = ["ID", "Nome Completo", "Nome Politico", "Cargo", "Partido", "UF", "Telefone Gabinete", "Email Gabinete", "Endereco Gabinete"];
    const rows = autoridades.map((a) => [
      a.id,
      `"${a.nome.replace(/"/g, '""')}"`,
      `"${a.nomePolitico.replace(/"/g, '""')}"`,
      `"${a.cargo}"`,
      `"${a.siglaPartido}"`,
      `"${a.uf}"`,
      `"${a.telefoneGabinete}"`,
      `"${a.emailGabinete}"`,
      `"${a.enderecoGabinete.replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `contatos_autoridades_${uf}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleExportPDF() {
    window.print();
  }

  return (
    <ModuleBlock title="Contatos de Autoridades do TSE e Poder Público" icon="📇">
      <div className="flex flex-col gap-4">
        
        {/* ELEMENTOS DE TELA (OCULTOS NA IMPRESSÃO) */}
        <div className="print:hidden flex flex-col gap-4">
          
          {/* Formulário de Pesquisa e Filtros */}
          <form onSubmit={handleSearch} className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
            <div className="grid gap-3 sm:grid-cols-4 items-end">
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label htmlFor="aut-busca" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Nome da Autoridade ou Partido
                </label>
                <input
                  id="aut-busca"
                  className={inputClass}
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Pesquise por nome (ex: Cármen Lúcia, Tarcísio) ou partido..."
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="aut-uf" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Estado (UF)
                </label>
                <select
                  id="aut-uf"
                  className={inputClass}
                  value={uf}
                  onChange={(e) => setUf(e.target.value)}
                >
                  {ALL_UFS.map((state) => (
                    <option key={state} value={state}>{state === "TODOS" ? "Todos os Estados" : state}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="aut-cargo" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Cargo Público
                </label>
                <select
                  id="aut-cargo"
                  className={inputClass}
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                >
                  <option value="todos">Todos os Cargos</option>
                  <option value="ministro">Ministros do TSE</option>
                  <option value="governador">Governadores</option>
                  <option value="senador">Senadores</option>
                  <option value="deputado">Deputados Federais</option>
                  <option value="prefeito">Prefeitos</option>
                </select>
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <button type="submit" disabled={loading} className={`${buttonPrimaryClass} sm:w-auto w-full`}>
                {loading ? "Consultando..." : "🔎 Pesquisar Autoridades"}
              </button>
            </div>
          </form>

          {/* Barra de Status e Extração */}
          <div className="flex items-center justify-between flex-wrap gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span>Base Pública Atualizada: <strong>{fonte}</strong></span>
              <span className="bg-blue-600 text-white font-extrabold px-1.5 py-0.5 rounded text-[10px]">
                {autoridades.length} Contatos Encontrados
              </span>
            </div>

            {autoridades.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="rounded bg-emerald-600 px-2.5 py-1 text-[11px] font-extrabold text-white hover:bg-emerald-700 transition"
                >
                  📄 Exportar CSV
                </button>
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="rounded bg-rose-600 px-2.5 py-1 text-[11px] font-extrabold text-white hover:bg-rose-700 transition"
                >
                  🖨️ Imprimir / PDF
                </button>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          {/* GRID DE CARDS DOS CONTATOS DE AUTORIDADES */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {autoridades.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-800 font-black text-sm dark:bg-blue-950 dark:text-blue-300 shrink-0">
                        {item.nomePolitico.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                          {item.nomePolitico}
                        </h3>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                          {item.nome}
                        </p>
                      </div>
                    </div>
                    <span className="bg-slate-100 text-slate-800 dark:bg-zinc-800 dark:text-zinc-300 font-extrabold px-2 py-0.5 rounded text-[9px] shrink-0">
                      {item.siglaPartido} ({item.uf})
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 text-xs text-slate-700 dark:text-zinc-300 mt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-bold uppercase text-[9px]">Cargo:</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{item.cargo}</span>
                    </div>

                    <div className="flex flex-col gap-0.5 bg-slate-50 dark:bg-zinc-950 p-2 rounded border border-slate-100 dark:border-zinc-850">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Telefone do Gabinete:</span>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">{item.telefoneGabinete}</span>
                        <a
                          href={`tel:${item.telefoneGabinete.replace(/\D/g, "")}`}
                          className="bg-emerald-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded hover:bg-emerald-700 transition"
                        >
                          📞 Ligar
                        </a>
                      </div>
                    </div>

                    <div className="flex flex-col gap-0.5 bg-slate-50 dark:bg-zinc-950 p-2 rounded border border-slate-100 dark:border-zinc-850">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">E-mail do Gabinete:</span>
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-[10px] truncate text-slate-800 dark:text-zinc-200" title={item.emailGabinete}>
                          {item.emailGabinete}
                        </span>
                        <a
                          href={`mailto:${item.emailGabinete}`}
                          className="bg-blue-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded hover:bg-blue-700 transition shrink-0"
                        >
                          ✉️ E-mail
                        </a>
                      </div>
                    </div>

                    <div className="flex flex-col gap-0.5 pt-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Endereço do Gabinete:</span>
                      <span className="text-[10px] text-slate-600 dark:text-zinc-400 leading-tight">
                        📍 {item.enderecoGabinete}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 border-t border-slate-100 dark:border-zinc-800 pt-2 flex justify-between items-center text-[9px]">
                  <span className="text-slate-400">Status: <strong className="text-emerald-600 dark:text-emerald-400">{item.situacao}</strong></span>
                  <span className="text-slate-400">Dados Validados TSE</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ESTRUTURA PARA IMPRESSÃO EM PDF DE CONTATOS DE AUTORIDADES */}
        <div className="hidden print:block font-sans text-slate-900">
          <div className="border-b-2 border-slate-900 pb-3 mb-4 flex justify-between items-end">
            <div>
              <h1 className="text-base font-black uppercase tracking-wider text-slate-900">
                TSE / Poder Público — Relatório de Contatos de Autoridades
              </h1>
              <p className="text-xs text-slate-600">
                Catálogo Oficial de Gabinetes, Telefones e Endereços das Autoridades
              </p>
            </div>
            <div className="text-right text-xs text-slate-600">
              <p className="font-bold">Emissão do Relatório:</p>
              <p>{new Date().toLocaleString("pt-BR")}</p>
            </div>
          </div>

          <table className="w-full text-left border-collapse text-xs border border-slate-300">
            <thead>
              <tr className="bg-slate-200 border-b border-slate-300 text-slate-900">
                <th className="p-2 border-r border-slate-300 font-extrabold">#</th>
                <th className="p-2 border-r border-slate-300 font-extrabold">Nome Autoridade</th>
                <th className="p-2 border-r border-slate-300 font-extrabold">Cargo</th>
                <th className="p-2 border-r border-slate-300 font-extrabold">Partido / UF</th>
                <th className="p-2 border-r border-slate-300 font-extrabold">Telefone Gabinete</th>
                <th className="p-2 border-r border-slate-300 font-extrabold">E-mail Gabinete</th>
                <th className="p-2 font-extrabold">Endereço Gabinete</th>
              </tr>
            </thead>
            <tbody>
              {autoridades.map((item, idx) => (
                <tr key={`print-aut-${item.id}`} className="border-b border-slate-200">
                  <td className="p-2 border-r border-slate-200 font-bold">{idx + 1}</td>
                  <td className="p-2 border-r border-slate-200 font-extrabold">{item.nomePolitico}</td>
                  <td className="p-2 border-r border-slate-200 font-bold text-blue-900">{item.cargo}</td>
                  <td className="p-2 border-r border-slate-200">{item.siglaPartido} ({item.uf})</td>
                  <td className="p-2 border-r border-slate-200 font-mono font-bold">{item.telefoneGabinete}</td>
                  <td className="p-2 border-r border-slate-200 font-mono text-[10px]">{item.emailGabinete}</td>
                  <td className="p-2 text-[10px]">{item.enderecoGabinete}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </ModuleBlock>
  );
}
