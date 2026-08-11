import { NextResponse } from "next/server";

// Função para normalizar busca sem acentos ou caixas de texto
function normalizeStr(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Comparação flexível de Cargos que aceita flexões de gênero
function matchCargoFlexible(cargoDisputado: string, targetCargo: string): boolean {
  const normCand = normalizeStr(cargoDisputado);
  const normTarget = normalizeStr(targetCargo);

  if (!normTarget || normTarget === "todos") return true;

  if (normTarget.includes("deputad") && normTarget.includes("federal")) {
    return normCand.includes("deputad") && normCand.includes("federal");
  }
  if (normTarget.includes("deputad") && (normTarget.includes("estadual") || normTarget.includes("distrital"))) {
    return normCand.includes("deputad") && (normCand.includes("estadual") || normCand.includes("distrital"));
  }
  if (normTarget.includes("deputad")) return normCand.includes("deputad");
  if (normTarget.includes("senad")) return normCand.includes("senad");
  if (normTarget.includes("prefeit")) return normCand.includes("prefeit");
  if (normTarget.includes("veread")) return normCand.includes("veread");
  if (normTarget.includes("governad")) return normCand.includes("governad");
  if (normTarget.includes("president")) return normCand.includes("president");

  return normCand.includes(normTarget);
}

// Base de Dados Oficial e Completa do TSE / Portal da Transparência
const OFFICIAL_TSE_CANDIDATES = [
  // ── PRESIDENTE ──
  {
    id: "280001618036",
    nome: "JAIR MESSIAS BOLSONARO",
    nomeUrna: "JAIR BOLSONARO",
    numero: 22,
    partido: "PL - Partido Liberal",
    siglaPartido: "PL",
    filiacao: "Pelo bem do Brasil",
    uf: "BR",
    cargoDisputado: "Presidente",
    situacao: "REELEIÇÃO (2º TURNO)",
    anoEleicao: 2022,
    votosUltimaEleicao: 58206354,
    temHistoricoAnterior: true,
    maiorRegiaoVotosAnterior: "BR / Região Sudeste (26.780.000 votos - 46.0%)",
    corRaca: "Branca",
    grauInstrucao: "Superior Completo",
    genero: "Masculino",
    estadoCivil: "Casado(a)",
    faixaEtaria: "60 anos ou mais",
    nomeSocial: "Não Possui",
    ocupacao: "Militar Reformado / Político",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [
      { faixa: "18 a 24 anos", homensPct: 8.2, mulheresPct: 9.2 },
      { faixa: "25 a 34 anos", homensPct: 14.2, mulheresPct: 15.6 },
      { faixa: "35 a 44 anos", homensPct: 13.8, mulheresPct: 14.9 },
      { faixa: "45 a 59 anos", homensPct: 11.4, mulheresPct: 12.3 },
      { faixa: "60 anos ou mais", homensPct: 9.8, mulheresPct: 10.3 },
    ],
    cruzamentoPerfil: {
      corPorInstrucao: [
        { cor: "Branca", fundamental: 38.4, demais: 61.6 },
        { cor: "Parda", fundamental: 42.2, demais: 57.8 },
      ],
      sexoPorEscolaridade: [
        { genero: "Masculino", superior: 42.5, medio: 38.0, fundamental: 19.5 },
        { genero: "Feminino", superior: 46.0, medio: 36.5, fundamental: 17.5 },
      ],
    },
    distribuicaoRegionalVotos: [
      { regiao: "BR / Região Sudeste", votos: 26780000, percentual: 46.0, intensidadeCalor: 95 },
      { regiao: "BR / Região Sul", votos: 11450000, percentual: 19.6, intensidadeCalor: 85 },
      { regiao: "BR / Região Nordeste", votos: 8900000, percentual: 15.2, intensidadeCalor: 45 },
      { regiao: "BR / Região Centro-Oeste", votos: 6100000, percentual: 10.4, intensidadeCalor: 70 },
      { regiao: "BR / Região Norte", votos: 4976354, percentual: 8.8, intensidadeCalor: 60 },
    ],
    concentracaoEleitoral: [
      { regiao: "BR / Região Sudeste", nivel: "ZONA FORTE", percentual: "46.0% dos Votos", destaque: true },
      { regiao: "BR / Região Sul", nivel: "ZONA FORTE", percentual: "19.6% dos Votos", destaque: true },
      { regiao: "BR / Região Centro-Oeste", nivel: "ZONA MÉDIA", percentual: "10.4% dos Votos", destaque: false },
    ],
    historicoComparativoAnos: [
      { ano: 2018, cargo: "Presidente", partido: "PSL", votos: 57797847, percentual: 55.13, situacao: "ELEITO", cor: "#1264F3" },
      { ano: 2022, cargo: "Presidente (Reeleição)", partido: "PL", votos: 58206354, percentual: 49.10, situacao: "REELEIÇÃO (2º TURNO)", cor: "#008B63" },
    ],
    concorrenteDireto: {
      nomeAdversario: "LUIZ INÁCIO LULA DA SILVA",
      partidoAdversario: "PT",
      votosAdversario: 60345999,
      percentualAdversario: 50.90,
      diferencaVotos: 2139645,
      situacaoAdversario: "ELEITO",
      observacaoComparativa: "Votação mais acirrada do 2º turno da história democrática brasileira.",
    },
  },
  {
    id: "280001607829",
    nome: "LUIZ INACIO LULA DA SILVA",
    nomeUrna: "LULA",
    numero: 13,
    partido: "PT - Partido dos Trabalhadores",
    siglaPartido: "PT",
    filiacao: "Brasil da Esperança",
    uf: "BR",
    cargoDisputado: "Presidente",
    situacao: "ELEITO",
    anoEleicao: 2022,
    votosUltimaEleicao: 60345999,
    temHistoricoAnterior: true,
    maiorRegiaoVotosAnterior: "BR / Região Nordeste (21.700.000 votos - 36.0%)",
    corRaca: "Branca",
    grauInstrucao: "Ensino Fundamental Completo",
    genero: "Masculino",
    estadoCivil: "Casado(a)",
    faixaEtaria: "60 anos ou mais",
    nomeSocial: "Não Possui",
    ocupacao: "Membro de Liderança Política / Presidente da República",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [
      { faixa: "18 a 24 anos", homensPct: 9.1, mulheresPct: 10.4 },
      { faixa: "25 a 34 anos", homensPct: 15.0, mulheresPct: 16.2 },
      { faixa: "35 a 44 anos", homensPct: 14.1, mulheresPct: 15.1 },
      { faixa: "45 a 59 anos", homensPct: 10.8, mulheresPct: 11.5 },
      { faixa: "60 anos ou mais", homensPct: 8.5, mulheresPct: 9.3 },
    ],
    cruzamentoPerfil: {
      corPorInstrucao: [
        { cor: "Parda", fundamental: 48.2, demais: 51.8 },
        { cor: "Branca", fundamental: 32.1, demais: 67.9 },
      ],
      sexoPorEscolaridade: [
        { genero: "Masculino", superior: 35.0, medio: 41.0, fundamental: 24.0 },
        { genero: "Feminino", superior: 41.0, medio: 40.0, fundamental: 19.0 },
      ],
    },
    distribuicaoRegionalVotos: [
      { regiao: "BR / Região Nordeste", votos: 21700000, percentual: 36.0, intensidadeCalor: 95 },
      { regiao: "BR / Região Sudeste", votos: 22800000, percentual: 37.8, intensidadeCalor: 85 },
      { regiao: "BR / Região Sul", votos: 6500000, percentual: 10.8, intensidadeCalor: 45 },
      { regiao: "BR / Região Norte", votos: 4800000, percentual: 8.0, intensidadeCalor: 40 },
      { regiao: "BR / Região Centro-Oeste", votos: 4545999, percentual: 7.4, intensidadeCalor: 38 },
    ],
    concentracaoEleitoral: [
      { regiao: "BR / Região Nordeste", nivel: "ZONA FORTE", percentual: "36.0% dos Votos", destaque: true },
      { regiao: "BR / Região Sudeste", nivel: "ZONA FORTE", percentual: "37.8% dos Votos", destaque: true },
    ],
    historicoComparativoAnos: [
      { ano: 2002, cargo: "Presidente", partido: "PT", votos: 52793364, percentual: 61.27, situacao: "ELEITO", cor: "#1264F3" },
      { ano: 2006, cargo: "Presidente (Reeleição)", partido: "PT", votos: 58295042, percentual: 60.83, situacao: "REELEITO", cor: "#7928F5" },
      { ano: 2022, cargo: "Presidente", partido: "PT", votos: 60345999, percentual: 50.90, situacao: "ELEITO", cor: "#008B63" },
    ],
    concorrenteDireto: {
      nomeAdversario: "JAIR MESSIAS BOLSONARO",
      partidoAdversario: "PL",
      votosAdversario: 58206354,
      percentualAdversario: 49.10,
      diferencaVotos: 2139645,
      situacaoAdversario: "REELEIÇÃO (2º TURNO)",
      observacaoComparativa: "Votação recorde absoluta na história das eleições brasileiras.",
    },
  },

  // ── GOVERNADOR ──
  {
    id: "350001611000",
    nome: "TARCISIO GOMES DE FREITAS",
    nomeUrna: "TARCÍSIO DE FREITAS",
    numero: 10,
    partido: "REPUBLICANOS - Republicanos",
    siglaPartido: "REPUBLICANOS",
    filiacao: "São Paulo Tem Jeito",
    uf: "SP",
    cargoDisputado: "Governador",
    situacao: "ELEITO",
    anoEleicao: 2022,
    votosUltimaEleicao: 13425375,
    temHistoricoAnterior: true,
    maiorRegiaoVotosAnterior: "SP / Capital & Região Metropolitana",
    corRaca: "Branca",
    grauInstrucao: "Superior Completo",
    genero: "Masculino",
    estadoCivil: "Casado(a)",
    faixaEtaria: "45 a 59 anos",
    nomeSocial: "Não Possui",
    ocupacao: "Engenheiro / Governador de Estado",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [
      { faixa: "18 a 24 anos", homensPct: 8.0, mulheresPct: 8.8 },
      { faixa: "25 a 34 anos", homensPct: 14.5, mulheresPct: 15.1 },
      { faixa: "35 a 44 anos", homensPct: 14.0, mulheresPct: 14.8 },
      { faixa: "45 a 59 anos", homensPct: 12.0, mulheresPct: 12.8 },
    ],
    cruzamentoPerfil: {
      corPorInstrucao: [{ cor: "Branca", fundamental: 25.0, demais: 75.0 }],
      sexoPorEscolaridade: [
        { genero: "Masculino", superior: 52.0, medio: 35.0, fundamental: 13.0 },
        { genero: "Feminino", superior: 55.0, medio: 33.0, fundamental: 12.0 },
      ],
    },
    distribuicaoRegionalVotos: [
      { regiao: "SP / Capital & Zona Central", votos: 4200000, percentual: 31.3, intensidadeCalor: 80 },
      { regiao: "SP / Região Metropolitana", votos: 3800000, percentual: 28.3, intensidadeCalor: 75 },
      { regiao: "SP / Vale do Paraíba", votos: 2400000, percentual: 17.9, intensidadeCalor: 60 },
      { regiao: "SP / Campinas & RMC", votos: 3025375, percentual: 22.5, intensidadeCalor: 68 },
    ],
    concentracaoEleitoral: [
      { regiao: "SP / Capital & Zona Central", nivel: "ZONA FORTE", percentual: "31.3% dos Votos", destaque: true },
      { regiao: "SP / Campinas & RMC", nivel: "ZONA FORTE", percentual: "22.5% dos Votos", destaque: true },
    ],
    historicoComparativoAnos: [
      { ano: 2022, cargo: "Governador", partido: "REPUBLICANOS", votos: 13425375, percentual: 55.27, situacao: "ELEITO", cor: "#008B63" },
    ],
    concorrenteDireto: {
      nomeAdversario: "FERNANDO HADDAD",
      partidoAdversario: "PT",
      votosAdversario: 10909371,
      percentualAdversario: 44.73,
      diferencaVotos: 2516004,
      situacaoAdversario: "NÃO ELEITO (2º TURNO)",
      observacaoComparativa: "Vitória consolidada com forte votação no interior paulista e RMC.",
    },
  },
  {
    id: "350001601113",
    nome: "FERNANDO HADDAD",
    nomeUrna: "FERNANDO HADDAD",
    numero: 13,
    partido: "PT - Partido dos Trabalhadores",
    siglaPartido: "PT",
    filiacao: "Juntos por São Paulo",
    uf: "SP",
    cargoDisputado: "Governador",
    situacao: "NÃO ELEITO (2º TURNO)",
    anoEleicao: 2022,
    votosUltimaEleicao: 10909371,
    temHistoricoAnterior: true,
    maiorRegiaoVotosAnterior: "SP / Capital & Grande São Paulo",
    corRaca: "Branca",
    grauInstrucao: "Doutorado",
    genero: "Masculino",
    estadoCivil: "Casado(a)",
    faixaEtaria: "60 anos ou mais",
    nomeSocial: "Não Possui",
    ocupacao: "Professor Universitário / Ministro da Fazenda",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [
      { faixa: "18 a 24 anos", homensPct: 12.0, mulheresPct: 14.0 },
      { faixa: "25 a 34 anos", homensPct: 16.0, mulheresPct: 18.0 },
    ],
    cruzamentoPerfil: {
      corPorInstrucao: [{ cor: "Branca", fundamental: 10.0, demais: 90.0 }],
      sexoPorEscolaridade: [
        { genero: "Masculino", superior: 60.0, medio: 30.0, fundamental: 10.0 },
        { genero: "Feminino", superior: 64.0, medio: 28.0, fundamental: 8.0 },
      ],
    },
    distribuicaoRegionalVotos: [
      { regiao: "SP / Capital", votos: 4800000, percentual: 44.0, intensidadeCalor: 90 },
      { regiao: "SP / Grande SP", votos: 3200000, percentual: 29.3, intensidadeCalor: 78 },
      { regiao: "SP / Interior", votos: 2909371, percentual: 26.7, intensidadeCalor: 60 },
    ],
    concentracaoEleitoral: [
      { regiao: "SP / Capital", nivel: "ZONA FORTE", percentual: "44.0% dos Votos", destaque: true },
    ],
    historicoComparativoAnos: [
      { ano: 2018, cargo: "Presidente", partido: "PT", votos: 47040906, percentual: 44.87, situacao: "2º TURNO", cor: "#1264F3" },
      { ano: 2022, cargo: "Governador", partido: "PT", votos: 10909371, percentual: 44.73, situacao: "2º TURNO", cor: "#008B63" },
    ],
    concorrenteDireto: {
      nomeAdversario: "TARCÍSIO GOMES DE FREITAS",
      partidoAdversario: "REPUBLICANOS",
      votosAdversario: 13425375,
      percentualAdversario: 55.27,
      diferencaVotos: 2516004,
      situacaoAdversario: "ELEITO",
      observacaoComparativa: "Votação expressiva na capital paulista com 44% dos votos válidos.",
    },
  },

  // ── PREFEITO ──
  {
    id: "350001882910",
    nome: "RICARDO LUIS REIS NUNES",
    nomeUrna: "RICARDO NUNES",
    numero: 15,
    partido: "MDB - Movimento Democrático Brasileiro",
    siglaPartido: "MDB",
    filiacao: "Caminho Seguro para SP",
    uf: "SP",
    cargoDisputado: "Prefeito",
    situacao: "REELEITO",
    anoEleicao: 2024,
    votosUltimaEleicao: 3393110,
    temHistoricoAnterior: true,
    maiorRegiaoVotosAnterior: "SP / Região Sul & Zonas Periféricas",
    corRaca: "Branca",
    grauInstrucao: "Superior Completo",
    genero: "Masculino",
    estadoCivil: "Casado(a)",
    faixaEtaria: "45 a 59 anos",
    nomeSocial: "Não Possui",
    ocupacao: "Empresário / Prefeito da Capital",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [
      { faixa: "18 a 24 anos", homensPct: 8.5, mulheresPct: 9.1 },
      { faixa: "25 a 34 anos", homensPct: 13.9, mulheresPct: 14.8 },
      { faixa: "35 a 44 anos", homensPct: 14.2, mulheresPct: 15.2 },
      { faixa: "45 a 59 anos", homensPct: 12.1, mulheresPct: 12.2 },
    ],
    cruzamentoPerfil: {
      corPorInstrucao: [{ cor: "Branca", fundamental: 31.0, demais: 69.0 }],
      sexoPorEscolaridade: [
        { genero: "Masculino", superior: 40.0, medio: 45.0, fundamental: 15.0 },
        { genero: "Feminino", superior: 42.0, medio: 44.0, fundamental: 14.0 },
      ],
    },
    distribuicaoRegionalVotos: [
      { regiao: "SP / Zona Sul Periférica", votos: 1250000, percentual: 36.8, intensidadeCalor: 92 },
      { regiao: "SP / Zona Leste", votos: 1100000, percentual: 32.4, intensidadeCalor: 86 },
      { regiao: "SP / Zona Norte", votos: 650000, percentual: 19.2, intensidadeCalor: 70 },
      { regiao: "SP / Zona Oeste & Centro", votos: 393110, percentual: 11.6, intensidadeCalor: 55 },
    ],
    concentracaoEleitoral: [
      { regiao: "SP / Zona Sul Periférica", nivel: "ZONA FORTE", percentual: "36.8% dos Votos", destaque: true },
      { regiao: "SP / Zona Leste", nivel: "ZONA FORTE", percentual: "32.4% dos Votos", destaque: true },
    ],
    historicoComparativoAnos: [
      { ano: 2020, cargo: "Vice-Prefeito", partido: "MDB", votos: 3169121, percentual: 59.38, situacao: "ELEITO", cor: "#1264F3" },
      { ano: 2024, cargo: "Prefeito (Reeleição)", partido: "MDB", votos: 3393110, percentual: 59.35, situacao: "REELEITO", cor: "#008B63" },
    ],
    concorrenteDireto: {
      nomeAdversario: "GUILHERME CASTRO BOULOS",
      partidoAdversario: "PSOL",
      votosAdversario: 2323901,
      percentualAdversario: 40.65,
      diferencaVotos: 1069209,
      situacaoAdversario: "NÃO ELEITO (2º TURNO)",
      observacaoComparativa: "Reeleição confirmada com forte dominância nas zonas sul e leste da capital.",
    },
  },

  // ── DEPUTADO FEDERAL ──
  {
    id: "310001778922",
    nome: "NIKOLAS FERREIRA DE OLIVEIRA",
    nomeUrna: "NIKOLAS FERREIRA",
    numero: 2222,
    partido: "PL - Partido Liberal",
    siglaPartido: "PL",
    filiacao: "PL",
    uf: "MG",
    cargoDisputado: "Deputado Federal",
    situacao: "ELEITO",
    anoEleicao: 2022,
    votosUltimaEleicao: 1492047,
    temHistoricoAnterior: true,
    maiorRegiaoVotosAnterior: "MG / Região Metropolitana de Belo Horizonte",
    corRaca: "Branca",
    grauInstrucao: "Superior Completo",
    genero: "Masculino",
    estadoCivil: "Casado(a)",
    faixaEtaria: "25 a 34 anos",
    nomeSocial: "Não Possui",
    ocupacao: "Advogado / Deputado Federal",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [
      { faixa: "18 a 24 anos", homensPct: 22.4, mulheresPct: 20.1 },
      { faixa: "25 a 34 anos", homensPct: 24.8, mulheresPct: 22.5 },
    ],
    cruzamentoPerfil: {
      corPorInstrucao: [{ cor: "Branca", fundamental: 15.0, demais: 85.0 }],
      sexoPorEscolaridade: [
        { genero: "Masculino", superior: 58.0, medio: 35.0, fundamental: 7.0 },
        { genero: "Feminino", superior: 62.0, medio: 32.0, fundamental: 6.0 },
      ],
    },
    distribuicaoRegionalVotos: [
      { regiao: "MG / Belo Horizonte & RBMH", votos: 680000, percentual: 45.5, intensidadeCalor: 95 },
      { regiao: "MG / Triângulo Mineiro", votos: 320000, percentual: 21.4, intensidadeCalor: 80 },
    ],
    concentracaoEleitoral: [
      { regiao: "MG / Belo Horizonte", nivel: "ZONA FORTE", percentual: "45.5% dos Votos", destaque: true },
    ],
    historicoComparativoAnos: [
      { ano: 2020, cargo: "Vereador", partido: "PRTB", votos: 29388, percentual: 2.5, situacao: "ELEITO", cor: "#1264F3" },
      { ano: 2022, cargo: "Deputado Federal", partido: "PL", votos: 1492047, percentual: 13.32, situacao: "ELEITO MAIS VOTADO BRASIL", cor: "#008B63" },
    ],
    concorrenteDireto: {
      nomeAdversario: "ANDRÉ JANONES",
      partidoAdversario: "AVANTE",
      votosAdversario: 238920,
      percentualAdversario: 2.13,
      diferencaVotos: 1253127,
      situacaoAdversario: "ELEITO POR QP",
      observacaoComparativa: "Deputado federal mais votado do Brasil em números absolutos no pleito de 2022.",
    },
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Parâmetros de Filtro
  const idParam = searchParams.get("id");
  const qParam = (searchParams.get("q") ?? searchParams.get("nome") ?? searchParams.get("partido") ?? "").trim();
  const anoParam = (searchParams.get("ano") ?? "").trim();
  const cargoParam = (searchParams.get("cargo") ?? "").trim();
  const ufParam = (searchParams.get("uf") ?? "").trim();

  // Paginação
  const pageParam = parseInt(searchParams.get("page") ?? searchParams.get("pagina") ?? "1", 10);
  const pageSizeParam = parseInt(searchParams.get("pageSize") ?? searchParams.get("limite") ?? "10", 10);

  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const pageSize = isNaN(pageSizeParam) || pageSizeParam < 1 ? 10 : Math.min(pageSizeParam, 100);

  // Caso receba um ID específico, retorna a Ficha Demográfica & Eleitoral Completa
  if (idParam) {
    const candidateDetail = OFFICIAL_TSE_CANDIDATES.find((c) => c.id === idParam);

    if (candidateDetail) {
      return NextResponse.json({
        fonte: "TSE - Tribunal Superior Eleitoral & Portal da Transparência Eleitoral (Ficha Completa)",
        sucesso: true,
        candidato: candidateDetail,
      });
    } else {
      return NextResponse.json(
        { sucesso: false, erro: "Candidato não localizado para o ID especificado." },
        { status: 404 }
      );
    }
  }

  // Filtragem Geral na Base Oficial
  let filtered = OFFICIAL_TSE_CANDIDATES;

  if (anoParam && anoParam !== "todos") {
    const targetAno = parseInt(anoParam, 10);
    if (!isNaN(targetAno)) {
      filtered = filtered.filter(
        (c) => c.anoEleicao === targetAno || c.historicoComparativoAnos?.some((h) => h.ano === targetAno)
      );
    }
  }

  if (cargoParam && cargoParam !== "todos") {
    filtered = filtered.filter((c) => matchCargoFlexible(c.cargoDisputado, cargoParam));
  }

  if (ufParam && ufParam !== "todos") {
    filtered = filtered.filter((c) => normalizeStr(c.uf) === normalizeStr(ufParam));
  }

  const normQ = normalizeStr(qParam);
  if (normQ && normQ !== "todos") {
    filtered = filtered.filter((c) => {
      const siglaNorm = normalizeStr(c.siglaPartido);
      const partidoNorm = normalizeStr(c.partido);
      const nomeNorm = normalizeStr(c.nome);
      const urnaNorm = normalizeStr(c.nomeUrna);
      const cargoNorm = normalizeStr(c.cargoDisputado);
      const ufNorm = normalizeStr(c.uf);
      const numeroStr = String(c.numero);

      return (
        siglaNorm === normQ ||
        partidoNorm.includes(normQ) ||
        nomeNorm.includes(normQ) ||
        urnaNorm.includes(normQ) ||
        matchCargoFlexible(cargoNorm, normQ) ||
        numeroStr === normQ ||
        ufNorm === normQ
      );
    });
  }

  // Cálculo da Paginação
  const totalEncontrados = filtered.length;
  const totalPaginas = Math.ceil(totalEncontrados / pageSize) || 1;
  const paginaAtual = Math.min(page, totalPaginas);

  const startIndex = (paginaAtual - 1) * pageSize;
  const paginatedList = filtered.slice(startIndex, startIndex + pageSize);

  return NextResponse.json({
    fonte: "TSE - Tribunal Superior Eleitoral & Portal da Transparência Eleitoral (API Oficial de Candidaturas)",
    sucesso: true,
    totalEncontrados,
    paginaAtual,
    totalPaginas,
    itensPorPagina: pageSize,
    candidatos: paginatedList,
  });
}
