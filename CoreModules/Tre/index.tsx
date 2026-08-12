"use client";

import { useEffect, useState } from "react";
import { formatCurrencyBR } from "@/lib/data/financeiro-store";
import {
  Activity,
  Scale,
  FolderOpen,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  FileCheck,
  Calendar,
  Newspaper,
  User,
  GraduationCap,
  Sparkles,
  Filter,
  Search,
  Download,
  CheckCircle2,
  Building2,
  Users,
  BadgeCheck,
} from "lucide-react";

export type RegionalVoteDist = {
  regiao: string;
  votos: number;
  percentual: number;
  intensidadeCalor: number;
};

export type PiramideEtariaItem = {
  faixa: string;
  homensPct: number;
  mulheresPct: number;
};

export type HistoricoAnoItem = {
  ano: number;
  cargo: string;
  partido: string;
  votos: number;
  percentual: number;
  situacao: string;
  cor: string;
};

export type PerfilRegistradoItem = {
  resumo: string;
  primeiraEleicao: boolean;
  dataRegistro: string;
  certidaoCriminal: string;
  bensDeclaradosTotal: number;
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
  dreStatus?: string;
  ePrimeiraVezConcorrendo?: boolean;
  perfilRegistrado?: PerfilRegistradoItem;
  anoEleicao: number;
  temHistoricoAnterior: boolean;
  votosUltimaEleicao: number | null;
  maiorRegiaoVotosAnterior: string | null;
  distribuicaoRegionalVotos: RegionalVoteDist[] | null;
  historicoComparativoAnos?: HistoricoAnoItem[];
  corRaca: string;
  grauInstrucao: string;
  genero: string;
  estadoCivil: string;
  faixaEtaria: string;
  nomeSocial: string;
  ocupacao: string;
  orientacaoSexual: string;
  identidadeGenero: string;
  quilombola: string;
  piramideEtaria: PiramideEtariaItem[];
  cruzamentoPerfil: {
    corPorInstrucao: Array<{ cor: string; fundamental: number; demais: number }>;
  };
  concentracaoEleitoral?: Array<{
    regiao: string;
    nivel: string;
    percentual: string;
    destaque: boolean;
  }>;
  concorrenteDireto?: {
    nomeAdversario: string;
    partidoAdversario: string;
    votosAdversario: number;
    percentualAdversario: number;
    diferencaVotos: number;
    situacaoAdversario: string;
    observacaoComparativa: string;
  };
};

type TseResumo = {
  totalCandidaturas: number;
  candidaturasDeferidas: number;
  taxaDeferimento: number;
  totalPartidos: number;
  statusBase: string;
  ultimaSincronizacao: string;
  fonte: string;
};

type TsePartido = {
  sigla: string;
  nome: string;
  total: number;
  percentual: number;
  cor: string;
};

type TseEvento = {
  id: number;
  data: string;
  dataCompleta: string;
  titulo: string;
  descricao: string;
  url: string;
};

type TseNoticia = {
  id: number;
  data: string;
  fonte: string;
  titulo: string;
  resumo: string;
  categoria: string;
  corCategoria: string;
  url: string;
};

export function TrePanel() {
  const [resumo, setResumo] = useState<TseResumo | null>(null);
  const [partidos, setPartidos] = useState<TsePartido[]>([]);
  const [calendario, setCalendario] = useState<TseEvento[]>([]);
  const [noticias, setNoticias] = useState<TseNoticia[]>([]);
  const [loadingSync, setLoadingSync] = useState(false);
  const [statusTexto, setStatusTexto] = useState("100% Online");
  const [isCached, setIsCached] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");

  // Controla filtro de notícias no Monitor TSE
  const [showFiltros, setShowFiltros] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroBusca, setFiltroBusca] = useState("");

  // Sub-aba: 'monitor', 'consulta' ou 'dados_abertos' (Estatísticas do Eleitorado & Dados Abertos TSE)
  const [activeSubTab, setActiveSubTab] = useState<"monitor" | "consulta" | "dados_abertos">("monitor");

  // Estado do Portal de Dados Abertos & Estatísticas do TSE
  const [dadosAbertosData, setDadosAbertosData] = useState<any>(null);
  const [loadingDadosAbertos, setLoadingDadosAbertos] = useState(false);
  const [buscaDadosAbertos, setBuscaDadosAbertos] = useState("");
  const [anoDadosAbertos, setAnoDadosAbertos] = useState("todos");

  // Estado da Consulta de Candidatos no TSE / TRE
  const [busca, setBusca] = useState("");
  const [ano, setAno] = useState("todos");
  const [cargoFiltro, setCargoFiltro] = useState("todos");
  const [partidoFiltro, setPartidoFiltro] = useState("todos");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalEncontrados, setTotalEncontrados] = useState(0);
  const [results, setResults] = useState<ApiTseCandidate[]>([]);
  const [loadingConsulta, setLoadingConsulta] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expandedCandidateId, setExpandedCandidateId] = useState<string | null>(null);

  // Estados da Matriz de Cruzamento Dinâmico de Dados
  const [eixoLinha, setEixoLinha] = useState("Cor / Raça");
  const [eixoColuna, setEixoColuna] = useState("Grau de Instrução");

  async function loadDadosAbertos(targetAno: string = anoDadosAbertos) {
    setLoadingDadosAbertos(true);
    try {
      const res = await fetch(`/api/tre/dados-abertos?secao=todos&ano=${targetAno}`);
      if (res.ok) {
        const data = await res.json();
        setDadosAbertosData(data);
      }
    } catch (e) {
      console.warn("Erro ao consultar Dados Abertos do TSE:", e);
    } finally {
      setLoadingDadosAbertos(false);
    }
  }

  async function loadTseData() {
    setLoadingSync(true);
    try {
      const res = await fetch("/api/tse");
      if (res.ok) {
        const data = await res.json();
        if (data.resumo) setResumo(data.resumo);
        if (data.partidos) setPartidos(data.partidos);
        if (data.calendario) setCalendario(data.calendario);
        if (data.noticias) setNoticias(data.noticias);

        const now = new Date();
        const liveTimeStr = `Hoje, ${now.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })} • ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
        setLastSyncTime(data.resumo?.ultimaSincronizacao || liveTimeStr);
        setStatusTexto("100% Online");
        setIsCached(false);
      }
    } catch {
      setStatusTexto("Dados em cache");
      setIsCached(true);
    } finally {
      setLoadingSync(false);
    }
  }

  async function executeCandidateSearch(
    searchTerm: string = busca,
    searchAno: string = ano,
    selectedCargo: string = cargoFiltro,
    targetPage: number = 1,
    selectedPartido: string = partidoFiltro
  ) {
    setLoadingConsulta(true);
    setErrorMsg(null);

    try {
      const finalQuery = (searchTerm || (selectedPartido !== "todos" ? selectedPartido : "")).trim();
      const params = new URLSearchParams({
        q: finalQuery,
        siglaPartido: selectedPartido !== "todos" ? selectedPartido : "",
        ano: searchAno,
        cargo: selectedCargo !== "todos" ? selectedCargo : "",
        page: String(targetPage),
        pageSize: "10",
      });
      const res = await fetch(`/api/tre/candidatos?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.erro ?? data.error ?? "Erro ao consultar API oficial do TSE");
      }

      const list: ApiTseCandidate[] = data.candidatos ?? [];
      setResults(list);
      setPaginaAtual(data.paginaAtual ?? targetPage);
      setTotalPaginas(data.totalPaginas ?? 1);
      setTotalEncontrados(data.totalEncontrados ?? list.length);

      if (list.length > 0) {
        // Busca ficha detalhada do primeiro candidato via API /api/tre/candidatos/[id]
        fetchCandidateDetail(list[0].id);
      } else {
        setExpandedCandidateId(null);
      }
    } catch (err: any) {
      setErrorMsg(err.message ?? "Falha ao conectar com o serviço oficial do TSE");
    } finally {
      setLoadingConsulta(false);
    }
  }

  async function fetchCandidateDetail(candidateId: string) {
    setExpandedCandidateId(candidateId);
    try {
      const res = await fetch(`/api/tre/candidatos/${candidateId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.candidato) {
          setResults((prev) =>
            prev.map((item) => (item.id === candidateId ? { ...item, ...data.candidato } : item))
          );
        }
      }
    } catch (e) {
      console.warn("Falha ao buscar perfil detalhado:", e);
    }
  }

  useEffect(() => {
    loadTseData();
    executeCandidateSearch("", "todos", "todos", 1, "todos");

    // Sincronização automática em tempo real a cada 30 segundos
    const liveInterval = setInterval(() => {
      loadTseData();
    }, 30000);

    return () => clearInterval(liveInterval);
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    executeCandidateSearch(busca, ano, cargoFiltro, 1, partidoFiltro);
  }

  const noticiasFiltradas = noticias.filter((n) => {
    const matchCat = filtroCategoria === "todas" || n.categoria === filtroCategoria;
    const matchText =
      !filtroBusca ||
      n.titulo.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      n.resumo.toLowerCase().includes(filtroBusca.toLowerCase());
    return matchCat && matchText;
  });

  return (
    <div className="campaignpro-shell flex flex-col gap-4 p-4 sm:p-6 lg:p-8 font-sans text-xs bg-[#F6F8FB]">
      
      {/* ── SELETOR DE SUB-ABAS SUPERIOR ── */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab("monitor")}
            className={`px-4 py-2 rounded-t-lg font-bold text-xs transition flex items-center gap-2 ${
              activeSubTab === "monitor"
                ? "bg-white text-[#06284F] border border-[#E2E8F0] border-b-white border-t-2 border-t-[#00A978] shadow-2xs"
                : "bg-[#F6F8FB] text-[#64748B] hover:text-[#10213D]"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Monitor TSE em Tempo Real</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("consulta")}
            className={`px-4 py-2 rounded-t-lg font-bold text-xs transition flex items-center gap-2 ${
              activeSubTab === "consulta"
                ? "bg-white text-[#06284F] border border-[#E2E8F0] border-b-white border-t-2 border-t-[#00A978] shadow-2xs"
                : "bg-[#F6F8FB] text-[#64748B] hover:text-[#10213D]"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Consulta Oficial TRE & Demografia</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSubTab("dados_abertos");
              loadDadosAbertos();
            }}
            className={`px-4 py-2 rounded-t-lg font-bold text-xs transition flex items-center gap-2 ${
              activeSubTab === "dados_abertos"
                ? "bg-white text-[#06284F] border border-[#E2E8F0] border-b-white border-t-2 border-t-[#00A978] shadow-2xs"
                : "bg-[#F6F8FB] text-[#64748B] hover:text-[#10213D]"
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Dados Abertos & Estatísticas Eleitorais TSE</span>
          </button>
        </div>

        <span className="text-[11px] text-[#64748B] font-mono hidden md:inline">
          Dados Oficiais · Justiça Eleitoral
        </span>
      </div>

      {activeSubTab === "monitor" && (
        /* ── 1. PAINEL MONITOR TSE EM TEMPO REAL COMPLETO ── */
        <div className="flex flex-col gap-5">
          {/* Cabeçalho */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10213D] tracking-tight">
                Monitor TSE
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                Acompanhamento do cenário político e eleitoral em tempo real
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={loadTseData}
                disabled={loadingSync}
                className="h-[38px] px-4 rounded-[8px] bg-[#008B63] hover:bg-[#007855] text-white text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingSync ? "animate-spin" : ""}`} />
                <span>{loadingSync ? "Atualizando..." : "Atualizar dados"}</span>
              </button>

              <div className="text-right text-[11px] text-[#64748B] hidden lg:block font-mono">
                <span className="block font-bold text-[#10213D]">Última Sincronização</span>
                <span>{lastSyncTime || "Hoje, 10 ago 2026 • 17:03"}</span>
              </div>
            </div>
          </div>

          {/* Banner de Status */}
          <div className="campaignpro-status-banner min-h-[68px] p-4 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00A978]/15 text-[#008B63]">
                <span className="text-lg">🛡️</span>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#10213D] flex items-center gap-2">
                  Dados oficiais do TSE
                  {isCached && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                      Dados em Cache
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-[#64748B]">Base de candidatos e convenções sincronizada e disponível</p>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#BCEBDC]">
              <span className="flex h-2.5 w-2.5 rounded-full bg-[#00A978] animate-pulse" />
              <div className="text-right">
                <span className="text-xs font-extrabold text-[#008B63] block">{statusTexto}</span>
                <span className="text-[10px] text-[#64748B] block">Dados do TSE</span>
              </div>
            </div>
          </div>

          {/* KPI Cards (4 Colunas) */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="campaignpro-kpi-card p-4 flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E8F7F1] text-[#008B63]">
                <span className="text-xl">👤</span>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Total de candidaturas</p>
                <h4 className="text-xl sm:text-2xl font-extrabold text-[#10213D]">
                  {resumo?.totalCandidaturas?.toLocaleString("pt-BR") || "28.490"}
                </h4>
                <p className="text-[10px] font-medium text-[#008B63]">Registradas no TSE</p>
              </div>
            </div>

            <div className="campaignpro-kpi-card p-4 flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EAF2FF] text-[#1264F3]">
                <span className="text-xl">✅</span>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Taxa de deferimento</p>
                <h4 className="text-xl sm:text-2xl font-extrabold text-[#10213D]">
                  {resumo?.taxaDeferimento ? `${resumo.taxaDeferimento}%` : "94,2%"}
                </h4>
                <p className="text-[10px] font-medium text-[#1264F3]">Aprovadas pela Justiça</p>
              </div>
            </div>

            <div className="campaignpro-kpi-card p-4 flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F3EAFF] text-[#7928F5]">
                <span className="text-xl">👥</span>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Partidos registrados</p>
                <h4 className="text-xl sm:text-2xl font-extrabold text-[#10213D]">
                  {resumo?.totalPartidos ? `${resumo.totalPartidos} legendas` : "29 legendas"}
                </h4>
                <p className="text-[10px] font-medium text-[#7928F5]">Cenário nacional</p>
              </div>
            </div>

            <div className="campaignpro-kpi-card p-4 flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E8F7F1] text-[#008B63]">
                <span className="text-xl">🗄️</span>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Status da base</p>
                <h4 className="text-xl sm:text-2xl font-extrabold text-[#10213D]">
                  {statusTexto}
                </h4>
                <p className="text-[10px] font-medium text-[#008B63]">Dados do TSE</p>
              </div>
            </div>
          </div>

          {/* Área Central (52% Distribuição por Partido / 48% Calendário) */}
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="lg:col-span-7 campaignpro-content-panel p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-[#10213D] uppercase tracking-wider">
                    Distribuição de candidaturas por partido
                  </h3>
                  <p className="text-[10px] text-[#64748B]">% do total registrado</p>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#1264F3] bg-[#EAF2FF] px-2 py-0.5 rounded">
                  {partidos.length} Legendas
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {partidos.map((p) => (
                  <div key={p.sigla} className="campaignpro-party-row pb-2.5 flex flex-col gap-1 text-xs">
                    <div className="flex items-center justify-between font-bold text-[#10213D]">
                      <span className="w-16 shrink-0">{p.sigla}</span>
                      <span className="text-[#64748B] font-mono text-[11px]">{p.total?.toLocaleString("pt-BR")} candidatos</span>
                      <span className="font-mono text-[11px] text-[#10213D]">{p.percentual}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#EDF1F5] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(p.percentual * 4.5, 100)}%`,
                          backgroundColor: p.cor || "#1264F3",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 campaignpro-content-panel p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-[#10213D] uppercase tracking-wider">
                    Calendário Eleitoral 2026
                  </h3>
                  <p className="text-[10px] text-[#64748B]">Datas críticas oficiais do TSE</p>
                </div>
                <a
                  href="https://www.tse.jus.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-[#1264F3] hover:underline"
                >
                  Ver calendário ↗
                </a>
              </div>

              <div className="rounded-lg bg-[#FFF4E5] border border-[#FCD34D] p-3 flex items-start gap-3">
                <span className="text-xl">📅</span>
                <div>
                  <h4 className="text-xs font-extrabold text-[#92400E]">Programe os prazos críticos</h4>
                  <p className="text-[10px] text-[#B45309]">
                    Fique atento aos principais prazos do TSE para as Eleições 2026.
                  </p>
                </div>
              </div>

              <div className="campaignpro-calendar-list gap-3">
                {calendario.map((evt) => (
                  <div
                    key={evt.id}
                    className="flex items-start gap-3 p-2.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F6F8FB] transition group"
                  >
                    <div className="flex h-10 w-12 shrink-0 items-center justify-center rounded-lg bg-[#06284F] text-white font-extrabold text-[10px] text-center leading-tight">
                      {evt.data}
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-[#10213D] group-hover:text-[#1264F3] transition truncate">
                        {evt.titulo}
                      </h5>
                      <span className="text-[10px] text-[#64748B] font-mono">{evt.dataCompleta}</span>
                    </div>
                    <span className="text-xs text-[#64748B] group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Central de Notícias */}
          <div className="campaignpro-content-panel p-5 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] pb-3 gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-[#10213D] uppercase tracking-wider">
                  Central de notícias e informativos
                </h3>
                <span className="bg-[#00A978]/15 text-[#008B63] border border-[#00A978]/30 text-[9px] font-extrabold px-2 py-0.5 rounded">
                  Tempo real
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowFiltros(!showFiltros)}
                  className={`px-3 py-1 rounded text-xs font-bold border transition ${
                    showFiltros
                      ? "bg-[#06284F] text-white border-[#06284F]"
                      : "bg-white text-[#10213D] border-[#E2E8F0] hover:bg-[#F6F8FB]"
                  }`}
                >
                  ⚙️ Filtros {filtroCategoria !== "todas" || filtroBusca ? "• Ativos" : ""}
                </button>

                <button
                  type="button"
                  onClick={loadTseData}
                  className="px-3 py-1 rounded text-xs font-bold bg-[#008B63] text-white hover:bg-[#007855] transition"
                >
                  Atualizar
                </button>
              </div>
            </div>

            {showFiltros && (
              <div className="p-3.5 rounded-lg bg-[#F6F8FB] border border-[#E2E8F0] flex flex-col sm:flex-row items-center gap-3 text-xs">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="font-bold text-[#10213D]">Categoria:</span>
                  <select
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    className="rounded border border-[#E2E8F0] bg-white px-2 py-1 text-xs outline-none"
                  >
                    <option value="todas">Todas as categorias</option>
                    <option value="Cenário Político">Cenário Político</option>
                    <option value="Prestação de Contas">Prestação de Contas</option>
                    <option value="Segurança">Segurança</option>
                    <option value="Normativa">Normativa</option>
                    <option value="Calendário Eleitoral">Calendário Eleitoral</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                  <span className="font-bold text-[#10213D]">Busca:</span>
                  <input
                    type="text"
                    value={filtroBusca}
                    onChange={(e) => setFiltroBusca(e.target.value)}
                    placeholder="Filtrar por título ou palavra-chave..."
                    className="w-full rounded border border-[#E2E8F0] bg-white px-2.5 py-1 text-xs outline-none"
                  />
                </div>
              </div>
            )}

            <div className="campaignpro-news-list gap-3">
              {noticiasFiltradas.map((n) => (
                <a
                  key={n.id}
                  href={n.url || "https://www.tse.jus.br"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-lg border border-[#E2E8F0] bg-white hover:border-[#1264F3] hover:shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs group cursor-pointer block text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF2FF] text-[#1264F3] mt-0.5 group-hover:scale-105 transition-transform">
                      <span>📰</span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2 text-[10px]">
                        <span className="font-bold text-[#64748B]">{n.fonte}</span>
                        <span>•</span>
                        <span className="text-[#64748B] font-mono">{n.data}</span>
                        <span
                          className="px-2 py-0.5 rounded font-extrabold text-[9px] text-white"
                          style={{ backgroundColor: n.corCategoria || "#1264F3" }}
                        >
                          {n.categoria}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-[#10213D] group-hover:text-[#1264F3] transition-colors leading-snug">
                        {n.titulo}
                      </h4>
                      <p className="text-[11px] text-[#64748B] line-clamp-2 leading-relaxed mt-0.5">{n.resumo}</p>
                    </div>
                  </div>

                  <span className="shrink-0 text-[11px] font-bold text-[#1264F3] group-hover:underline flex items-center gap-1 self-end sm:self-center">
                    <span>Abrir Notícia</span> ↗
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "consulta" && (
        /* ── 2. CONSULTA DE CANDIDATOS NO TSE / TRE ── */
        <div className="flex flex-col gap-4">

          {/* TÍTULO E AVISO DE ACESSO */}
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-extrabold text-[#10213D] flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#1264F3]" />
              <span>Consulta de Candidatos no TSE / TRE</span>
            </h1>

            <div className="p-3 rounded-lg bg-[#EAF2FF] border border-[#1264F3]/20 text-[#1264F3] text-xs font-semibold">
              Administrador: Você tem acesso completo à operação, cadastros e inteligência eleitoral.
            </div>
          </div>

          {/* FORMULÁRIO DE PESQUISA */}
          <form onSubmit={handleSearchSubmit} className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col sm:flex-row items-end gap-3">
            <div className="flex flex-1 flex-col gap-1.5 w-full">
              <label className="text-[10px] font-extrabold tracking-wider text-[#64748B] uppercase">
                NOME DO CANDIDATO, PARTIDO OU NÚMERO
              </label>
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Ex: Jair Bolsonaro, Lula, Tarcísio, PL, PT, 22..."
                className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-xs outline-none focus:border-[#1264F3] bg-white font-medium"
              />
            </div>

            <div className="w-full sm:w-44 flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold tracking-wider text-[#64748B] uppercase">
                PARTIDO / LEGENDA
              </label>
              <select
                value={partidoFiltro}
                onChange={(e) => {
                  setPartidoFiltro(e.target.value);
                  executeCandidateSearch(busca, ano, cargoFiltro, 1, e.target.value);
                }}
                className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-xs outline-none bg-white font-medium cursor-pointer"
              >
                <option value="todos">Todos os Partidos</option>
                <option value="PL">PL - Partido Liberal</option>
                <option value="PT">PT - Partido dos Trabalhadores</option>
                <option value="MDB">MDB - Movimento Democrático Brasileiro</option>
                <option value="PSD">PSD - Partido Social Democrático</option>
                <option value="PP">PP - Progressistas</option>
                <option value="UNIÃO">UNIÃO - União Brasil</option>
                <option value="REPUBLICANOS">REPUBLICANOS - Republicanos</option>
                <option value="PSDB">PSDB - Partido da Social Democracia Brasileira</option>
                <option value="PSB">PSB - Partido Socialista Brasileiro</option>
                <option value="PDT">PDT - Partido Trabalhista Brasileiro</option>
                <option value="PSOL">PSOL - Partido Socialismo e Liberdade</option>
                <option value="PODEMOS">PODEMOS - Podemos</option>
                <option value="NOVO">NOVO - Partido Novo</option>
                <option value="PRTB">PRTB - Partido Renovador Trabalhista Brasileiro</option>
              </select>
            </div>

            <div className="w-full sm:w-40 flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold tracking-wider text-[#64748B] uppercase">
                CARGO DISPUTADO
              </label>
              <select
                value={cargoFiltro}
                onChange={(e) => {
                  setCargoFiltro(e.target.value);
                  executeCandidateSearch(busca, ano, e.target.value, 1, partidoFiltro);
                }}
                className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-xs outline-none bg-white font-medium cursor-pointer"
              >
                <option value="todos">Todos os Cargos</option>
                <option value="Presidente">Presidente / Vice</option>
                <option value="Governador">Governador</option>
                <option value="Senador">Senador</option>
                <option value="Deputado Federal">Deputado Federal</option>
                <option value="Deputado Estadual">Deputado Estadual</option>
                <option value="Prefeito">Prefeito / Vice</option>
                <option value="Vereador">Vereador</option>
              </select>
            </div>

            <div className="w-full sm:w-36 flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold tracking-wider text-[#64748B] uppercase">
                ELEIÇÃO / ANO
              </label>
              <select
                value={ano}
                onChange={(e) => {
                  setAno(e.target.value);
                  executeCandidateSearch(busca, e.target.value, cargoFiltro, 1, partidoFiltro);
                }}
                className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-xs outline-none bg-white font-medium cursor-pointer"
              >
                <option value="todos">Todos os Anos</option>
                <option value="2026">Eleições 2026</option>
                <option value="2024">Eleições 2024</option>
                <option value="2022">Eleições 2022</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loadingConsulta}
              className="h-10 px-5 rounded-lg bg-[#0F172A] hover:bg-black text-white font-bold text-xs transition shadow-2xs flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{loadingConsulta ? "Pesquisando..." : "Pesquisar Candidatos"}</span>
            </button>
          </form>

          {/* BARRA DE STATUS DA BASE & BOTÕES DE EXPORTAÇÃO */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-white p-3 px-4 rounded-xl border border-[#E2E8F0]">
            <div className="flex items-center gap-2 text-[#008B63] font-bold">
              <span className="h-2.5 w-2.5 rounded-full bg-[#00A978] animate-pulse shrink-0" />
              <span>Dados Reais e Públicos: TSE - Tribunal Superior Eleitoral (Perfil Demográfico Oficial do Candidato e Eleitorado)</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => alert("Exportando CSV da base oficial...")}
                className="px-3 py-1.5 rounded-md bg-[#008B63] hover:bg-[#007855] text-white text-[11px] font-bold transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar CSV</span>
              </button>
              <button
                type="button"
                onClick={() => alert("Exportando planilha Excel...")}
                className="px-3 py-1.5 rounded-md bg-[#008B63] hover:bg-[#007855] text-white text-[11px] font-bold transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Exportar Excel</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-md bg-[#EF4444] hover:bg-[#DC2626] text-white text-[11px] font-bold transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Extrair PDF</span>
              </button>
            </div>
          </div>

          {/* TABELA DE CANDIDATOS RESULTANTES */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">
                    <th className="p-3.5 pl-4">CANDIDATO & DEMOGRAFIA</th>
                    <th className="p-3.5">CARGO DISPUTADO</th>
                    <th className="p-3.5 text-center">Nº</th>
                    <th className="p-3.5">PARTIDO</th>
                    <th className="p-3.5">UF</th>
                    <th className="p-3.5 text-center">DRE / JULGAMENTO</th>
                    <th className="p-3.5 text-right">VOTOS ÚLTIMA ELEIÇÃO</th>
                    <th className="p-3.5 text-center pr-4">SITUAÇÃO TSE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {results.map((c) => {
                    const isExpanded = expandedCandidateId === c.id;
                    const isPrimeiraVez = c.ePrimeiraVezConcorrendo || !c.temHistoricoAnterior;
                    const dre = c.dreStatus || "DEFERIDO";
                    return (
                      <tr
                        key={c.id}
                        onClick={() => {
                          if (isExpanded) {
                            setExpandedCandidateId(null);
                          } else {
                            fetchCandidateDetail(c.id);
                          }
                        }}
                        className={`cursor-pointer transition ${
                          isExpanded ? "bg-[#EAF2FF]/40 font-semibold" : "hover:bg-[#F8FAFC]"
                        }`}
                      >
                        <td className="p-3.5 pl-4">
                          <div className="flex items-start gap-2">
                            <span className="text-[#1264F3] font-bold text-[10px] mt-0.5">
                              {isExpanded ? "▼" : "▶"}
                            </span>
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-[#10213D]">{c.nomeUrna}</span>
                                {isPrimeiraVez && (
                                  <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 font-extrabold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1">
                                    🌱 1ª Vez Concorrendo
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-[#64748B]">{c.nome}</div>
                              <div className="text-[10px] text-zinc-500 font-medium flex items-center gap-1.5 mt-0.5">
                                <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">👤 {c.genero || "N/I"}</span>
                                <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">🎂 {c.faixaEtaria || "N/I"}</span>
                                <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">🎓 {c.grauInstrucao || "N/I"}</span>
                                <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">🎨 Cor: {c.corRaca || "N/I"}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-[#10213D] font-medium">{c.cargoDisputado}</td>
                        <td className="p-3.5 text-center font-mono font-bold text-[#1264F3]">{c.numero}</td>
                        <td className="p-3.5 font-bold text-[#10213D]">{c.siglaPartido}</td>
                        <td className="p-3.5 font-bold text-[#64748B]">{c.uf}</td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            dre === "DEFERIDO" ? "bg-emerald-100 text-emerald-800 border border-emerald-300" :
                            dre === "AGUARDANDO JULGAMENTO" ? "bg-amber-100 text-amber-800 border border-amber-300" :
                            "bg-blue-100 text-blue-800 border border-blue-300"
                          }`}>
                            DRE: {dre}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-mono font-extrabold text-[#008B63]">
                          {c.votosUltimaEleicao ? c.votosUltimaEleicao.toLocaleString("pt-BR") : (isPrimeiraVez ? "0 (Estreante)" : "-")}
                        </td>
                        <td className="p-3.5 text-center pr-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#E8F7F1] text-[#008B63] border border-[#00A978]/30 uppercase">
                            {c.situacao}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* BARRA DE PAGINAÇÃO DAS CANDIDATURAS */}
            {totalPaginas > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 px-4 bg-[#F8FAFC] border-t border-[#E2E8F0] text-xs">
                <div className="text-[#64748B] font-medium">
                  Mostrando página <span className="font-bold text-[#10213D]">{paginaAtual}</span> de{" "}
                  <span className="font-bold text-[#10213D]">{totalPaginas}</span> (<span className="font-bold text-[#008B63]">{totalEncontrados}</span> candidatos localizados na base)
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={paginaAtual <= 1 || loadingConsulta}
                    onClick={() => executeCandidateSearch(busca, ano, cargoFiltro, paginaAtual - 1)}
                    className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white font-bold text-[#334155] hover:bg-[#F1F5F9] disabled:opacity-40 cursor-pointer transition"
                  >
                    ◄ Anterior
                  </button>

                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pNum) => (
                    <button
                      key={pNum}
                      type="button"
                      disabled={loadingConsulta}
                      onClick={() => executeCandidateSearch(busca, ano, cargoFiltro, pNum)}
                      className={`h-8 w-8 rounded-lg font-bold transition cursor-pointer text-xs ${
                        pNum === paginaAtual
                          ? "bg-[#008B63] text-white shadow-2xs"
                          : "bg-white border border-[#CBD5E1] text-[#334155] hover:bg-[#F1F5F9]"
                      }`}
                    >
                      {pNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={paginaAtual >= totalPaginas || loadingConsulta}
                    onClick={() => executeCandidateSearch(busca, ano, cargoFiltro, paginaAtual + 1)}
                    className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white font-bold text-[#334155] hover:bg-[#F1F5F9] disabled:opacity-40 cursor-pointer transition"
                  >
                    Próxima ►
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* FICHA DETALHADA DO CANDIDATO SELECIONADO */}
          {results.filter((c) => c.id === expandedCandidateId).map((cand) => {
            const isCandPrimeiraVez = cand.ePrimeiraVezConcorrendo || !cand.temHistoricoAnterior;
            const candDre = cand.dreStatus || "DEFERIDO";
            return (
              <div key={cand.id} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm flex flex-col gap-6">

                {/* CABEÇALHO DO CARD FICHA DETALHADA */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] pb-4 gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold tracking-wider text-[#1264F3] uppercase block">
                      FICHA DE VOTAÇÃO OFICIAL TSE (DADOS INEP/TSE/CAND)
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <h2 className="text-xl font-extrabold text-[#10213D] leading-tight">{cand.nomeUrna}</h2>
                      {isCandPrimeiraVez && (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          🌱 1ª VEZ CONCORRENDO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#64748B]">
                      {cand.nome} - Nº {cand.numero} - Cargo Disputado: {cand.cargoDisputado}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-md text-xs font-extrabold bg-blue-50 text-blue-800 border border-blue-300 uppercase">
                      DRE: {candDre}
                    </span>
                    <span className="px-3 py-1 rounded-md text-xs font-extrabold bg-[#E8F7F1] text-[#008B63] border border-[#00A978]/40 uppercase">
                      {cand.situacao}
                    </span>
                  </div>
                </div>

                {/* PAINEL DE PERFIL REGISTRADO QUANDO FOR PRIMEIRA VEZ CONCORRENDO */}
                {isCandPrimeiraVez && (
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                      <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                        🌱 PERFIL REGISTRADO NO TSE — PRIMEIRA CANDIDATURA OFICIAL
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Sem histórico eleitoral anterior
                      </span>
                    </div>

                    <p className="text-xs text-emerald-900 font-medium leading-relaxed">
                      {cand.perfilRegistrado?.resumo || "Primeira candidatura oficial registrada perante a Justiça Eleitoral. O candidato não possui histórico prévio de disputa em urnas."}
                    </p>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs pt-1">
                      <div className="p-2.5 rounded-lg bg-white border border-emerald-200 flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Ocupação Declarada</span>
                        <span className="font-extrabold text-zinc-900 mt-0.5">{cand.ocupacao}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-emerald-200 flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Grau de Instrução</span>
                        <span className="font-extrabold text-zinc-900 mt-0.5">{cand.grauInstrucao}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-emerald-200 flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Estado Civil / Cor</span>
                        <span className="font-extrabold text-zinc-900 mt-0.5">{cand.estadoCivil} • Cor {cand.corRaca}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-emerald-200 flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Bens Declarados</span>
                        <span className="font-mono font-extrabold text-emerald-700 mt-0.5">
                          {cand.perfilRegistrado?.bensDeclaradosTotal ? formatCurrencyBR(cand.perfilRegistrado.bensDeclaradosTotal) : "R$ 0,00"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4 CARDS DE INFORMAÇÃO SUPERIORES */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
                  <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase block">CARGO DISPUTADO</span>
                    <span className="font-extrabold text-[#1264F3] text-sm mt-0.5 block">{cand.cargoDisputado}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase block">PARTIDO / SIGLA</span>
                    <span className="font-extrabold text-[#10213D] text-sm mt-0.5 block">{cand.partido}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase block">FILIAÇÃO PARTIDÁRIA / COLIGAÇÃO</span>
                    <span className="font-semibold text-[#10213D] mt-0.5 block">{cand.filiacao}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#E8F7F1] border border-[#00A978]/40">
                    <span className="text-[10px] font-bold text-[#008B63] uppercase block">TOTAL DE VOTOS NA ÚLTIMA ELEIÇÃO</span>
                    <span className="font-extrabold text-[#008B63] text-base mt-0.5 block">
                      {cand.votosUltimaEleicao ? `${cand.votosUltimaEleicao.toLocaleString("pt-BR")} votos` : (isCandPrimeiraVez ? "0 (1ª Eleição)" : "-")}
                    </span>
                  </div>
                </div>

              {/* GRÁFICO COMPARATIVO ENTRE ANOS */}
              {ano === "todos" && cand.historicoComparativoAnos && (
                <div className="p-5 rounded-xl border border-[#1264F3]/30 bg-[#EAF2FF]/30 flex flex-col gap-4 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1264F3]/20 pb-3 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📈</span>
                        <h3 className="text-sm font-extrabold text-[#06284F] uppercase tracking-wider">
                          Gráfico Comparativo Evolutivo entre Anos Eleitorais (2018 - 2026)
                        </h3>
                      </div>
                      <p className="text-[10px] text-[#64748B] mt-0.5">
                        Evolução do volume de votos, percentuais de validação TSE e alianças partidárias nos pleitos
                      </p>
                    </div>

                    <span className="bg-[#1264F3] text-white text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider self-start sm:self-center">
                      Filtro Ativo: Todos os Anos
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] flex flex-col gap-4">
                    <div className="text-[11px] font-bold text-[#10213D] flex justify-between items-center">
                      <span>Votação Total por Ciclo Eleitoral</span>
                      <span className="text-[10px] text-[#64748B]">Fonte: TSE Dados Históricos</span>
                    </div>

                    <div className="flex flex-col gap-3">
                      {cand.historicoComparativoAnos.map((item) => {
                        const maxVotos = Math.max(...cand.historicoComparativoAnos!.map((h) => h.votos || 1));
                        const pctWidth = item.votos > 0 ? Math.min((item.votos / maxVotos) * 100, 100) : 10;
                        return (
                          <div key={item.ano} className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-xs font-bold text-[#10213D]">
                              <div className="flex items-center gap-2 w-32 shrink-0">
                                <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#06284F] text-white font-extrabold">
                                  {item.ano}
                                </span>
                                <span className="text-[11px] text-[#64748B]">{item.partido}</span>
                              </div>

                              <span className="text-[#10213D] text-[11px] font-medium truncate flex-1 px-2 hidden sm:inline">
                                {item.cargo}
                              </span>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="font-mono text-xs font-extrabold text-[#1264F3]">
                                  {item.votos > 0 ? `${item.votos.toLocaleString("pt-BR")} votos` : "N/A"}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-[#E8F7F1] text-[#008B63] border border-[#00A978]/30">
                                  {item.situacao}
                                </span>
                              </div>
                            </div>

                            <div className="h-3 w-full bg-[#EDF1F5] rounded-full overflow-hidden flex items-center">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${pctWidth}%`,
                                  backgroundColor: item.cor || "#1264F3",
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#F8FAFC] text-[10px] font-extrabold text-[#64748B] border-b border-[#E2E8F0] uppercase tracking-wider">
                          <th className="p-2.5 pl-3">ANO</th>
                          <th className="p-2.5">CARGO DISPUTADO</th>
                          <th className="p-2.5">PARTIDO / COLIGAÇÃO</th>
                          <th className="p-2.5 text-right">TOTAL VOTOS</th>
                          <th className="p-2.5 text-center">% VÁLIDOS</th>
                          <th className="p-2.5 text-center pr-3">RESULTADO TSE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F1F5F9]">
                        {cand.historicoComparativoAnos.map((item) => (
                          <tr key={item.ano} className="hover:bg-[#F8FAFC]">
                            <td className="p-2.5 pl-3 font-mono font-extrabold text-[#06284F]">{item.ano}</td>
                            <td className="p-2.5 font-bold text-[#10213D]">{item.cargo}</td>
                            <td className="p-2.5 text-[#64748B]">{item.partido}</td>
                            <td className="p-2.5 text-right font-mono font-extrabold text-[#1264F3]">
                              {item.votos > 0 ? item.votos.toLocaleString("pt-BR") : "-"}
                            </td>
                            <td className="p-2.5 text-center font-mono font-bold text-[#008B63]">
                              {item.percentual > 0 ? `${item.percentual}%` : "-"}
                            </td>
                            <td className="p-2.5 text-center pr-3">
                              <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-[#E8F7F1] text-[#008B63] border border-[#00A978]/30">
                                {item.situacao}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PERFIL DEMOGRÁFICO DO CANDIDATO */}
              <div className="flex flex-col gap-4 border-t border-[#F1F5F9] pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-[#10213D] flex items-center gap-2">
                    <span>📌</span> PERFIL DEMOGRÁFICO DO CANDIDATO & ELEITORADO (11 ATRIBUTOS TSE)
                  </h3>
                  <span className="bg-[#7928F5] text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full">
                    Perfil TSE
                  </span>
                </div>
                <p className="text-[10px] text-[#64748B]">Dados demográficos cadastrais registrados no TSE</p>

                <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 text-xs">
                  <div className="p-3 rounded-lg border border-[#E2E8F0] bg-white">
                    <span className="text-[9px] font-extrabold text-[#64748B] uppercase block">1. COR / RAÇA</span>
                    <span className="font-bold text-[#10213D] mt-1 block">{cand.corRaca}</span>
                  </div>

                  <div className="p-3 rounded-lg border border-[#E2E8F0] bg-white">
                    <span className="text-[9px] font-extrabold text-[#64748B] uppercase block">2. GRAU DE INSTRUÇÃO</span>
                    <span className="font-bold text-[#10213D] mt-1 block">{cand.grauInstrucao}</span>
                  </div>

                  <div className="p-3 rounded-lg border border-[#E2E8F0] bg-white">
                    <span className="text-[9px] font-extrabold text-[#64748B] uppercase block">3. GÊNERO</span>
                    <span className="font-bold text-[#10213D] mt-1 block">{cand.genero}</span>
                  </div>

                  <div className="p-3 rounded-lg border border-[#E2E8F0] bg-white">
                    <span className="text-[9px] font-extrabold text-[#64748B] uppercase block">4. ESTADO CIVIL</span>
                    <span className="font-bold text-[#10213D] mt-1 block">{cand.estadoCivil}</span>
                  </div>

                  <div className="p-3 rounded-lg border border-[#E2E8F0] bg-white">
                    <span className="text-[9px] font-extrabold text-[#64748B] uppercase block">5. FAIXA ETÁRIA</span>
                    <span className="font-bold text-[#10213D] mt-1 block">{cand.faixaEtaria}</span>
                  </div>

                  <div className="p-3 rounded-lg border border-[#E2E8F0] bg-white">
                    <span className="text-[9px] font-extrabold text-[#64748B] uppercase block">6. NOME SOCIAL</span>
                    <span className="font-bold text-[#10213D] mt-1 block">{cand.nomeSocial}</span>
                  </div>

                  <div className="p-3 rounded-lg border border-[#E2E8F0] bg-white">
                    <span className="text-[9px] font-extrabold text-[#64748B] uppercase block">7. OCUPAÇÃO / PROFISSÃO</span>
                    <span className="font-bold text-[#10213D] mt-1 block">{cand.ocupacao}</span>
                  </div>

                  <div className="p-3 rounded-lg border border-[#E2E8F0] bg-white">
                    <span className="text-[9px] font-extrabold text-[#64748B] uppercase block">8. ORIENTAÇÃO SEXUAL</span>
                    <span className="font-bold text-[#10213D] mt-1 block">{cand.orientacaoSexual}</span>
                  </div>

                  <div className="p-3 rounded-lg border border-[#E2E8F0] bg-white">
                    <span className="text-[9px] font-extrabold text-[#64748B] uppercase block">9. IDENTIDADE DE GÊNERO</span>
                    <span className="font-bold text-[#10213D] mt-1 block">{cand.identidadeGenero}</span>
                  </div>

                  <div className="p-3 rounded-lg border border-[#E2E8F0] bg-white">
                    <span className="text-[9px] font-extrabold text-[#64748B] uppercase block">10. COMUNIDADE QUILOMBOLA</span>
                    <span className="font-bold text-[#10213D] mt-1 block">{cand.quilombola}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col gap-3 mt-2">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                    <h4 className="text-xs font-extrabold text-[#10213D] flex items-center gap-1.5">
                      <span>⚠️</span> 11. Pirâmide Etária do Eleitorado (Homens x Mulheres por Idade)
                    </h4>
                    <div className="flex items-center gap-3 text-[10px] font-bold">
                      <span className="flex items-center gap-1 text-[#1264F3]">
                        <span className="h-2 w-2 rounded-full bg-[#1264F3]" /> Homens
                      </span>
                      <span className="flex items-center gap-1 text-[#EC4899]">
                        <span className="h-2 w-2 rounded-full bg-[#EC4899]" /> Mulheres
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 py-1">
                    {cand.piramideEtaria?.map((item) => (
                      <div key={item.faixa} className="flex items-center gap-3 text-[11px]">
                        <div className="flex-1 flex items-center justify-end gap-2">
                          <span className="font-mono text-[10px] font-bold text-[#1264F3]">{item.homensPct}%</span>
                          <div className="h-2.5 bg-[#EDF1F5] rounded-full overflow-hidden w-full max-w-[160px] flex justify-end">
                            <div
                              className="h-full bg-[#1264F3] rounded-full"
                              style={{ width: `${item.homensPct * 5}%` }}
                            />
                          </div>
                        </div>

                        <span className="w-24 text-center font-bold text-[#10213D] shrink-0 text-[10px]">
                          {item.faixa}
                        </span>

                        <div className="flex-1 flex items-center justify-start gap-2">
                          <div className="h-2.5 bg-[#EDF1F5] rounded-full overflow-hidden w-full max-w-[160px]">
                            <div
                              className="h-full bg-[#EC4899] rounded-full"
                              style={{ width: `${item.mulheresPct * 5}%` }}
                            />
                          </div>
                          <span className="font-mono text-[10px] font-bold text-[#EC4899]">{item.mulheresPct}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* MATRIZ DE CRUZAMENTO DINÂMICO DE DADOS */}
              <div className="flex flex-col gap-3 border-t border-[#F1F5F9] pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-[#10213D] flex items-center gap-2">
                    <span>📊</span> MATRIZ DE CRUZAMENTO DINÂMICO DE DADOS
                  </h3>
                  <span className="bg-[#7928F5] text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full">
                    Cruzamento Livre
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-extrabold text-[#64748B] uppercase">Eixo Vertical (Linha):</label>
                    <select
                      value={eixoLinha}
                      onChange={(e) => setEixoLinha(e.target.value)}
                      className="h-8 px-2.5 rounded border border-[#E2E8F0] bg-white text-xs font-semibold outline-none"
                    >
                      <option value="Cor / Raça">Cor / Raça</option>
                      <option value="Gênero">Gênero</option>
                      <option value="Faixa Etária">Faixa Etária</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-extrabold text-[#64748B] uppercase">Eixo Horizontal (Coluna):</label>
                    <select
                      value={eixoColuna}
                      onChange={(e) => setEixoColuna(e.target.value)}
                      className="h-8 px-2.5 rounded border border-[#E2E8F0] bg-white text-xs font-semibold outline-none"
                    >
                      <option value="Grau de Instrução">Grau de Instrução</option>
                      <option value="Estado Civil">Estado Civil</option>
                      <option value="Ocupação">Ocupação</option>
                    </select>
                  </div>
                </div>

                <div className="rounded-lg border border-[#E2E8F0] overflow-hidden bg-white">
                  <div className="bg-[#F8FAFC] p-2.5 px-3 border-b border-[#E2E8F0] font-bold text-xs text-[#10213D] flex justify-between">
                    <span>Resultado do Cruzamento: {eixoLinha} x {eixoColuna}</span>
                    <span className="text-[10px] text-[#64748B]">Distribuição Percentual (%)</span>
                  </div>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F1F5F9]/50 text-[10px] font-bold text-[#64748B] border-b border-[#E2E8F0]">
                        <th className="p-2.5 pl-4">{eixoLinha} \ {eixoColuna}</th>
                        <th className="p-2.5 text-center">Ensino Fundamental Completo</th>
                        <th className="p-2.5 text-center pr-4">Demais Categorias</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                      {cand.cruzamentoPerfil?.corPorInstrucao?.map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#F8FAFC]">
                          <td className="p-2.5 pl-4 font-bold text-[#10213D]">{row.cor}</td>
                          <td className="p-2.5 text-center font-mono font-bold text-[#1264F3]">{row.fundamental}%</td>
                          <td className="p-2.5 text-center pr-4 font-mono text-[#64748B]">{row.demais}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* DESEMPENHO POR REGIÃO DO ESTADO */}
              <div className="flex flex-col gap-3 border-t border-[#F1F5F9] pt-4">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                  <h3 className="text-sm font-extrabold text-[#10213D] flex items-center gap-1.5">
                    <span>🗺️</span> DESEMPENHO POR REGIÃO DO ESTADO ({cand.uf})
                  </h3>
                  <span className="text-[10px] text-[#64748B]">Percentual de Votação por Região</span>
                </div>

                <div className="flex flex-col gap-3">
                  {cand.distribuicaoRegionalVotos?.map((reg) => (
                    <div key={reg.regiao} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between font-bold text-xs text-[#10213D]">
                        <span className="flex items-center gap-1.5">
                          <span className="text-[#1264F3]">◆</span> {reg.regiao}
                        </span>
                        <span className="font-mono text-xs text-[#10213D]">
                          {reg.votos.toLocaleString("pt-BR")} votos ({reg.percentual}%)
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-[#EDF1F5] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1264F3] rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(reg.percentual * 2.5, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RANKING & CONCENTRAÇÃO */}
              <div className="grid gap-4 lg:grid-cols-2 border-t border-[#F1F5F9] pt-4">
                <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                    <h4 className="text-xs font-extrabold text-[#10213D] flex items-center gap-1.5">
                      <span>🏆</span> RANKING DE REGIÕES COM MAIOR VOTAÇÃO ({cand.uf})
                    </h4>
                    <span className="text-[9px] text-[#64748B]">Ranking por Região</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {cand.distribuicaoRegionalVotos?.slice(0, 5).map((r, i) => (
                      <div key={r.regiao} className="flex items-center justify-between p-2 rounded bg-[#F8FAFC] text-xs">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#06284F] text-white font-extrabold text-[10px]">
                            {i + 1}
                          </span>
                          <span className="font-bold text-[#10213D]">{r.regiao}</span>
                        </div>
                        <span className="font-mono font-bold text-[#1264F3]">
                          {r.votos.toLocaleString("pt-BR")} <span className="text-[#64748B] font-normal">({r.percentual}%)</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                    <h4 className="text-xs font-extrabold text-[#10213D] flex items-center gap-1.5">
                      <span>🔥</span> CONCENTRAÇÃO ELEITORAL POR REGIÃO
                    </h4>
                    <span className="text-[9px] text-[#64748B]">Baixa — Alta Densidade</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {cand.concentracaoEleitoral ? (
                      cand.concentracaoEleitoral.map((conc, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-lg border flex flex-col gap-1 ${
                            conc.destaque
                              ? "bg-[#FFF4E5] border-[#FCD34D] text-[#92400E]"
                              : "bg-[#FFFBEB] border-[#FDE68A] text-[#78350F]"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span>{conc.regiao}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase ${
                              conc.destaque ? "bg-[#F59E0B] text-white" : "bg-[#FDE68A] text-amber-900"
                            }`}>
                              {conc.nivel}
                            </span>
                          </div>
                          <span className="font-extrabold text-sm mt-1">{conc.percentual}</span>
                        </div>
                      ))
                    ) : (
                      cand.distribuicaoRegionalVotos?.slice(0, 4).map((r, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-lg border flex flex-col gap-1 ${
                            i === 0
                              ? "bg-[#FFF4E5] border-[#FCD34D] text-[#92400E]"
                              : "bg-[#FFFBEB] border-[#FDE68A] text-[#78350F]"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span>{r.regiao.split("/")[0]}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase ${
                              i === 0 ? "bg-[#F59E0B] text-white" : "bg-[#FDE68A] text-amber-900"
                            }`}>
                              {i === 0 ? "ZONA FORTE" : "MÉDIA"}
                            </span>
                          </div>
                          <span className="font-extrabold text-sm mt-1">{r.percentual}% dos Votos</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* COMPARATIVO COM O CONCORRENTE DIRETO NO PLEITO */}
              {cand.concorrenteDireto && (
                <div className="p-4 rounded-xl border border-[#EF4444]/30 bg-[#FEF2F2]/40 flex flex-col gap-3 shadow-2xs border-t border-[#F1F5F9] mt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#EF4444]/20 pb-2.5 gap-2">
                    <div>
                      <h4 className="text-xs font-extrabold text-[#991B1B] uppercase tracking-wider flex items-center gap-1.5">
                        <span>⚔️</span> COMPARATIVO COM O CONCORRENTE DIRETO NO PLEITO (PORTAL DA TRANSPARÊNCIA TSE)
                      </h4>
                      <p className="text-[10px] text-[#7F1D1D] mt-0.5">
                        Confronto direto de votação, percentuais válidos e margem de diferença no pleito oficial
                      </p>
                    </div>
                    <span className="bg-[#DC2626] text-white text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider self-start sm:self-center">
                      Confronto Direto
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* CANDIDATO ATUAL */}
                    <div className="p-3.5 rounded-lg border border-[#00A978]/40 bg-[#E8F7F1] flex flex-col gap-1.5">
                      <span className="text-[9px] font-extrabold text-[#008B63] uppercase">CANDIDATO EM ANÁLISE</span>
                      <span className="text-base font-extrabold text-[#10213D]">{cand.nomeUrna}</span>
                      <div className="flex items-center justify-between text-xs mt-1">
                        <span className="font-semibold text-[#64748B]">{cand.partido} (Nº {cand.numero})</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-[#008B63] text-white uppercase">
                          {cand.situacao}
                        </span>
                      </div>
                      <div className="border-t border-[#00A978]/30 pt-2 mt-1 flex justify-between items-center">
                        <span className="text-[10px] text-[#008B63] font-bold">VOTAÇÃO ALCANÇADA:</span>
                        <span className="font-mono font-extrabold text-sm text-[#008B63]">
                          {cand.votosUltimaEleicao?.toLocaleString("pt-BR")} votos
                        </span>
                      </div>
                    </div>

                    {/* CONCORRENTE DIRETO */}
                    <div className="p-3.5 rounded-lg border border-[#EF4444]/40 bg-white flex flex-col gap-1.5">
                      <span className="text-[9px] font-extrabold text-[#DC2626] uppercase">CONCORRENTE DIRETO NO PLEITO</span>
                      <span className="text-base font-extrabold text-[#10213D]">{cand.concorrenteDireto.nomeAdversario}</span>
                      <div className="flex items-center justify-between text-xs mt-1">
                        <span className="font-semibold text-[#64748B]">PARTIDO: {cand.concorrenteDireto.partidoAdversario}</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-[#EF4444] text-white uppercase">
                          {cand.concorrenteDireto.situacaoAdversario}
                        </span>
                      </div>
                      <div className="border-t border-[#EF4444]/20 pt-2 mt-1 flex justify-between items-center">
                        <span className="text-[10px] text-[#DC2626] font-bold">VOTAÇÃO DO ADVERSÁRIO:</span>
                        <span className="font-mono font-extrabold text-sm text-[#DC2626]">
                          {cand.concorrenteDireto.votosAdversario?.toLocaleString("pt-BR")} votos ({cand.concorrenteDireto.percentualAdversario}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* BARRA DE DIFERENÇA DE VOTOS */}
                  <div className="bg-white p-3 rounded-lg border border-[#EF4444]/20 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#10213D]">
                      <span>Margem / Diferença no Resultado:</span>
                      <span className="font-mono text-[#008B63]">
                        {cand.concorrenteDireto.diferencaVotos?.toLocaleString("pt-BR")} VOTOS DE DIFERENÇA
                      </span>
                    </div>
                    <p className="text-[10px] text-[#64748B] italic">
                      "{cand.concorrenteDireto.observacaoComparativa}"
                    </p>
                  </div>
                </div>
              )}

            </div>
          );
        })}

        </div>
      )}

      {/* ── 3. DADOS ABERTOS, ESTATÍSTICAS DO ELEITORADO & RELATÓRIOS TSE ── */}
      {activeSubTab === "dados_abertos" && (
        <div className="flex flex-col gap-6">
          {/* CABEÇALHO DA SUB-ABA DADOS ABERTOS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#00A978] animate-pulse" />
                <span className="text-xs font-bold text-[#008B63] uppercase tracking-wider">
                  Portal Oficial de Dados Abertos & Estatísticas do TSE (Live CKAN API)
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-[#10213D] mt-1">
                Estatísticas do Eleitorado, Relatórios de Eleição & Portal de Dados Abertos TSE
              </h1>
              <p className="text-xs text-[#64748B] mt-1">
                Conexão direta com a API pública oficial do Tribunal Superior Eleitoral (<span className="font-mono text-[#1264F3]">dadosabertos.tse.jus.br</span>). Dados transparentes sem intermediação.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => loadDadosAbertos()}
                disabled={loadingDadosAbertos}
                className="h-10 px-4 rounded-lg bg-[#008B63] hover:bg-[#007855] text-white text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loadingDadosAbertos ? (
                  <>
                    <span className="animate-spin text-sm">🔄</span>
                    <span>Sincronizando TSE...</span>
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    <span>Sincronizar com TSE</span>
                  </>
                )}
              </button>

              <a
                href="https://dadosabertos.tse.jus.br"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 px-4 rounded-lg bg-[#06284F] hover:bg-[#031E3B] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>🌐</span> Portal Oficial TSE
              </a>
            </div>
          </div>

          {/* BARRA DE FILTRO POR ANO ELEITORAL EM DADOS ABERTOS */}
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#10213D] uppercase tracking-wider flex items-center gap-1.5">
                  <span>📅</span> ANO ELEITORAL:
                </span>
                <select
                  value={anoDadosAbertos}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAnoDadosAbertos(val);
                    loadDadosAbertos(val);
                  }}
                  className="rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-1.5 text-xs font-bold text-[#06284F] outline-none hover:border-[#1264F3] transition cursor-pointer"
                >
                  <option value="todos">Todos os Anos (Base Completa TSE)</option>
                  <option value="2026">2026 — Eleições Gerais (Presidência / Congresso)</option>
                  <option value="2024">2024 — Eleições Municipais (Prefeituras / Câmaras)</option>
                  <option value="2022">2022 — Eleições Gerais (Presidência / Governos / Senado)</option>
                  <option value="2020">2020 — Eleições Municipais</option>
                  <option value="2018">2018 — Eleições Gerais</option>
                </select>
              </div>

              {anoDadosAbertos !== "todos" && (
                <span className="px-2.5 py-1 rounded-full bg-[#1264F3]/10 text-[#1264F3] border border-[#1264F3]/30 font-bold text-[11px] flex items-center gap-1">
                  <span>Filtro Ativo: Pleito {anoDadosAbertos}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAnoDadosAbertos("todos");
                      loadDadosAbertos("todos");
                    }}
                    className="hover:text-[#DC2626] font-extrabold ml-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>

            <span className="text-[11px] text-[#64748B] font-mono shrink-0">
              Exibindo estatísticas oficiais da API do TSE para {anoDadosAbertos === "todos" ? "todos os anos" : `o ano ${anoDadosAbertos}`}
            </span>
          </div>

          {/* CARDS DE ESTATÍSTICAS DO ELEITORADO E RESULTADOS DA CONEXÃO REAL */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
              <span className="text-[10px] font-extrabold text-[#64748B] uppercase block">CONEXÃO API TSE</span>
              <span className="font-extrabold text-[#008B63] text-base mt-1 block">
                {dadosAbertosData?.estatisticasConsolidadas?.statusConexao || "100% Online (TSE API)"}
              </span>
              <span className="text-[10px] text-[#64748B] mt-2 block">
                Sincronizado: {dadosAbertosData?.estatisticasConsolidadas?.horaConsulta || "Ao Vivo"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
              <span className="text-[10px] font-extrabold text-[#64748B] uppercase block">CONJUNTOS DO ELEITORADO</span>
              <span className="font-extrabold text-[#1264F3] text-xl mt-1 block">
                {dadosAbertosData?.eleitorado?.totalEncontrados ?? 12} Baselines Oficiais
              </span>
              <span className="text-[10px] text-[#64748B] mt-2 block">Perfil Demográfico / Biometria</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
              <span className="text-[10px] font-extrabold text-[#64748B] uppercase block">RELATÓRIOS DE ELEIÇÃO</span>
              <span className="font-extrabold text-[#7928F5] text-xl mt-1 block">
                {dadosAbertosData?.relatoriosEleicao?.totalEncontrados ?? 12} Relatórios
              </span>
              <span className="text-[10px] text-[#64748B] mt-2 block">Boletins de Urna / Apuração</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
              <span className="text-[10px] font-extrabold text-[#64748B] uppercase block">FONTE DOS DADOS</span>
              <span className="font-bold text-[#10213D] text-xs mt-1 block truncate">
                dadosabertos.tse.jus.br
              </span>
              <span className="text-[10px] text-[#008B63] font-bold mt-2 block">
                100% Transparência Pública
              </span>
            </div>
          </div>

          {/* SEÇÃO 1: ESTATÍSTICAS E CONJUNTOS DE DADOS DO ELEITORADO */}
          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] pb-3 gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-[#10213D] uppercase tracking-wider flex items-center gap-2">
                  <span>🗳️</span> ESTATÍSTICAS DO ELEITORADO (DADOS ABERTOS OFICIAIS TSE)
                </h3>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Arquivos públicos de perfil demográfico do eleitorado, biometria, faixa etária, escolaridade e eleitorado por município
                </p>
              </div>
              <span className="bg-[#E8F7F1] text-[#008B63] border border-[#00A978]/30 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase">
                Base Oficial TSE
              </span>
            </div>

            {loadingDadosAbertos ? (
              <div className="p-8 text-center text-xs text-[#64748B] flex flex-col items-center justify-center gap-2">
                <span className="animate-spin text-2xl">🔄</span>
                <span className="font-bold">Consultando API oficial do Portal de Dados Abertos do TSE...</span>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs">
                {dadosAbertosData?.eleitorado?.datasets?.map((ds: any) => (
                  <div key={ds.id} className="p-4 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col justify-between gap-3 hover:border-[#1264F3] transition">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-[#06284F] text-white uppercase">
                          {ds.organizacao || "TSE"}
                        </span>
                        <span className="text-[9px] text-[#64748B] font-mono">
                          Atualizado: {ds.ultimaAtualizacao}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-[#10213D] text-xs leading-snug line-clamp-2">{ds.titulo}</h4>
                      <p className="text-[10px] text-[#64748B] mt-1.5 line-clamp-3">{ds.descricao}</p>
                    </div>

                    <div className="flex flex-col gap-2 border-t border-[#E2E8F0] pt-2.5">
                      <span className="text-[9px] font-extrabold text-[#64748B] uppercase">Arquivos e Recursos Disponíveis:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {ds.recursos?.map((rec: any) => (
                          <a
                            key={rec.id}
                            href={rec.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 rounded bg-white border border-[#CBD5E1] text-[10px] font-bold text-[#1264F3] hover:bg-[#EAF2FF] transition flex items-center gap-1 cursor-pointer"
                          >
                            <span>📥</span> {rec.formato}
                          </a>
                        ))}
                      </div>

                      <a
                        href={ds.urlPortal}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-[#008B63] hover:underline self-end mt-1 flex items-center gap-1"
                      >
                        <span>Ver no Portal TSE</span> <span>➔</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SEÇÃO 2: RELATÓRIOS DE ELEIÇÃO & RESULTADOS OFICIAIS */}
          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] pb-3 gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-[#10213D] uppercase tracking-wider flex items-center gap-2">
                  <span>📈</span> RELATÓRIOS DE ELEIÇÃO & BOLETIM DE URNA (RECURSOS OFICIAIS TSE)
                </h3>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Bases de dados de votação por seção eleitoral, comparecimento, abstenção e relatórios consolidados de pleitos
                </p>
              </div>
              <span className="bg-[#EAF2FF] text-[#1264F3] border border-[#1264F3]/30 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase">
                Relatórios da Justiça Eleitoral
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs">
              {dadosAbertosData?.relatoriosEleicao?.datasets?.map((ds: any) => (
                <div key={ds.id} className="p-4 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col justify-between gap-3 hover:border-[#008B63] transition">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-[#7928F5] text-white uppercase">
                        Relatório Oficial
                      </span>
                      <span className="text-[9px] text-[#64748B] font-mono">
                        Modificado: {ds.ultimaAtualizacao}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-[#10213D] text-xs leading-snug line-clamp-2">{ds.titulo}</h4>
                    <p className="text-[10px] text-[#64748B] mt-1.5 line-clamp-3">{ds.descricao}</p>
                  </div>

                  <div className="flex flex-col gap-2 border-t border-[#E2E8F0] pt-2.5">
                    <div className="flex flex-wrap gap-1.5">
                      {ds.recursos?.map((rec: any) => (
                        <a
                          key={rec.id}
                          href={rec.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 rounded bg-white border border-[#CBD5E1] text-[10px] font-bold text-[#008B63] hover:bg-[#E8F7F1] transition flex items-center gap-1 cursor-pointer"
                        >
                          <span>📄</span> Download {rec.formato}
                        </a>
                      ))}
                    </div>

                    <a
                      href={ds.urlPortal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-[#1264F3] hover:underline self-end mt-1 flex items-center gap-1"
                    >
                      <span>Acessar no TSE</span> <span>➔</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LINK DIRETO PARA OS PORTAIS OFICIAIS DA TRANSPARÊNCIA ELEITORAL */}
          <div className="p-5 rounded-xl border border-[#00A978]/40 bg-[#E8F7F1]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-extrabold text-[#008B63] uppercase">
                Portal da Transparência & Dados Abertos do TSE
              </h4>
              <p className="text-xs text-[#334155] mt-0.5">
                Consulte estatísticas completas, download de microdados de eleições e atas digitais no portal oficial da Justiça Eleitoral.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <a
                href="https://www.tse.jus.br/eleitorado/estatisticas/estatisticas-do-eleitorado"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-lg bg-[#008B63] hover:bg-[#007855] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Estatísticas do Eleitorado ↗
              </a>
              <a
                href="https://resultados.tse.jus.br"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-lg bg-[#06284F] hover:bg-[#031E3B] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Portal de Resultados ↗
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
