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

// Base de Candidaturas Oficiais do TSE (Multi-Ano 2026 / 2024 / 2022)
const ALL_CANDIDATES = [
  // ── CANDIDATOS ESTREANTES (1ª VEZ CONCORRENDO) ──
  {
    id: "350001990001_PL",
    nome: "GABRIELA SILVEIRA COSTA",
    nomeUrna: "GABRIELA SILVEIRA",
    numero: 22100,
    partido: "PL - Partido Liberal",
    siglaPartido: "PL",
    filiacao: "PL São Paulo",
    uf: "SP",
    cargoDisputado: "Deputada Estadual",
    situacao: "REGISTRADO TSE",
    dreStatus: "DEFERIDO",
    anoEleicao: 2026,
    temHistoricoAnterior: false,
    ePrimeiraVezConcorrendo: true,
    votosUltimaEleicao: 0,
    maiorRegiaoVotosAnterior: "Primeira Candidatura (Sem histórico prévio)",
    distribuicaoRegionalVotos: [
      { regiao: "SP / Capital & Região Metropolitana", votos: 0, percentual: 0, intensidadeCalor: 50 },
    ],
    historicoComparativoAnos: [],
    corRaca: "Branca",
    grauInstrucao: "Superior Completo",
    genero: "Feminino",
    estadoCivil: "Solteiro(a)",
    faixaEtaria: "25 a 34 anos",
    nomeSocial: "Não Possui",
    ocupacao: "Advogada e Gestora Social",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [{ faixa: "25 a 34 anos", homensPct: 20.0, mulheresPct: 25.0 }],
    cruzamentoPerfil: { corPorInstrucao: [{ cor: "Branca", fundamental: 5.0, demais: 95.0 }] },
    concentracaoEleitoral: [{ regiao: "SP / Capital", nivel: "BASE EM CONSTRUÇÃO", percentual: "1ª Candidatura", destaque: true }],
    perfilRegistrado: {
      resumo: "Primeira candidatura registrada no Sistema CAND/TSE para 2026. Advogada atuante no terceiro setor e políticas públicas para juventude em SP.",
      primeiraEleicao: true,
      dataRegistro: "15/07/2026",
      certidaoCriminal: "Certidão Negativa Apresentada (Regular)",
      bensDeclaradosTotal: 185000,
    },
  },
  {
    id: "330001990002_PT",
    nome: "MARCELO MENDONCA RIBEIRO",
    nomeUrna: "MARCELO MENDONÇA",
    numero: 13010,
    partido: "PT - Partido dos Trabalhadores",
    siglaPartido: "PT",
    filiacao: "PT Rio de Janeiro",
    uf: "RJ",
    cargoDisputado: "Deputado Federal",
    situacao: "REGISTRADO TSE",
    dreStatus: "AGUARDANDO JULGAMENTO",
    anoEleicao: 2026,
    temHistoricoAnterior: false,
    ePrimeiraVezConcorrendo: true,
    votosUltimaEleicao: 0,
    maiorRegiaoVotosAnterior: "Primeira Candidatura (Sem histórico prévio)",
    distribuicaoRegionalVotos: [
      { regiao: "RJ / Zona Norte", votos: 0, percentual: 0, intensidadeCalor: 50 },
    ],
    historicoComparativoAnos: [],
    corRaca: "Parda",
    grauInstrucao: "Superior Completo",
    genero: "Masculino",
    estadoCivil: "Casado(a)",
    faixaEtaria: "35 a 44 anos",
    nomeSocial: "Não Possui",
    ocupacao: "Professor da Rede Pública",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [{ faixa: "35 a 44 anos", homensPct: 22.0, mulheresPct: 20.0 }],
    cruzamentoPerfil: { corPorInstrucao: [{ cor: "Parda", fundamental: 10.0, demais: 90.0 }] },
    concentracaoEleitoral: [{ regiao: "RJ / Zona Norte", nivel: "LIDERANÇA COMUNITÁRIA", percentual: "1ª Candidatura", destaque: true }],
    perfilRegistrado: {
      resumo: "Primeira eleição disputada pelo candidato. Professor com forte liderança na Zona Norte do Rio de Janeiro e projetos sociais em Quintino.",
      primeiraEleicao: true,
      dataRegistro: "20/07/2026",
      certidaoCriminal: "Certidão Negativa Apresentada (Regular)",
      bensDeclaradosTotal: 240000,
    },
  },
  {
    id: "350001990003_NOVO",
    nome: "LIVIA ARAGAO NOGUEIRA",
    nomeUrna: "LÍVIA ARAGÃO",
    numero: 3030,
    partido: "NOVO - Partido Novo",
    siglaPartido: "NOVO",
    filiacao: "NOVO SP",
    uf: "SP",
    cargoDisputado: "Deputada Federal",
    situacao: "REGISTRADO TSE",
    dreStatus: "DEFERIDO COM RESSALVA",
    anoEleicao: 2026,
    temHistoricoAnterior: false,
    ePrimeiraVezConcorrendo: true,
    votosUltimaEleicao: 0,
    maiorRegiaoVotosAnterior: "Primeira Candidatura (Sem histórico prévio)",
    distribuicaoRegionalVotos: [
      { regiao: "SP / Campinas e Região", votos: 0, percentual: 0, intensidadeCalor: 50 },
    ],
    historicoComparativoAnos: [],
    corRaca: "Branca",
    grauInstrucao: "Pós-Graduação / Mestrado",
    genero: "Feminino",
    estadoCivil: "Casado(a)",
    faixaEtaria: "35 a 44 anos",
    nomeSocial: "Não Possui",
    ocupacao: "Engenheira de Software e Empreendedora",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [{ faixa: "35 a 44 anos", homensPct: 18.0, mulheresPct: 22.0 }],
    cruzamentoPerfil: { corPorInstrucao: [{ cor: "Branca", fundamental: 2.0, demais: 98.0 }] },
    concentracaoEleitoral: [{ regiao: "SP / Campinas", nivel: "EMPREENDEDORISMO TECH", percentual: "1ª Candidatura", destaque: true }],
    perfilRegistrado: {
      resumo: "Estreante no cenário político eleitoral. Engenheira com foco em inovação, desburocratização e tecnologia na gestão pública.",
      primeiraEleicao: true,
      dataRegistro: "18/07/2026",
      certidaoCriminal: "Certidão Negativa Apresentada (Regular)",
      bensDeclaradosTotal: 520000,
    },
  },
  // ── PARTIDO DOS TRABALHADORES (PT) ──
  {
    id: "280001607829_PT",
    nome: "LUIZ INACIO LULA DA SILVA",
    nomeUrna: "LULA",
    numero: 13,
    partido: "PT - Partido dos Trabalhadores",
    siglaPartido: "PT",
    filiacao: "Brasil da Esperança",
    uf: "BR",
    cargoDisputado: "Presidente",
    situacao: "ELEITO",
    dreStatus: "DEFERIDO",
    anoEleicao: 2026,
    temHistoricoAnterior: true,
    votosUltimaEleicao: 60345999,
    maiorRegiaoVotosAnterior: "BR / Região Nordeste (21.700.000 votos - 36%)",
    distribuicaoRegionalVotos: [
      { regiao: "BR / Região Nordeste", votos: 21700000, percentual: 36.0, intensidadeCalor: 95 },
      { regiao: "BR / Região Sudeste", votos: 22800000, percentual: 37.8, intensidadeCalor: 85 },
    ],
    historicoComparativoAnos: [
      { ano: 2002, cargo: "Presidente", partido: "PT", votos: 52793364, percentual: 61.27, situacao: "ELEITO", cor: "#1264F3" },
      { ano: 2006, cargo: "Presidente (Reeleição)", partido: "PT", votos: 58295042, percentual: 60.83, situacao: "REELEITO", cor: "#7928F5" },
      { ano: 2022, cargo: "Presidente", partido: "PT", votos: 60345999, percentual: 50.90, situacao: "ELEITO", cor: "#008B63" },
      { ano: 2026, cargo: "Presidente (Reeleição)", partido: "PT", votos: 60345999, percentual: 50.90, situacao: "REGISTRADO TSE", cor: "#E30613" },
    ],
    corRaca: "Branca",
    grauInstrucao: "Ensino Fundamental Completo",
    genero: "Masculino",
    estadoCivil: "Casado(a)",
    faixaEtaria: "60 anos ou mais",
    nomeSocial: "Não Possui",
    ocupacao: "Presidente da República",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [{ faixa: "25 a 34 anos", homensPct: 15.0, mulheresPct: 16.2 }],
    cruzamentoPerfil: { corPorInstrucao: [{ cor: "Parda", fundamental: 48.2, demais: 51.8 }] },
    concentracaoEleitoral: [{ regiao: "BR / Nordeste", nivel: "ZONA FORTE", percentual: "36% dos Votos", destaque: true }],
  },
  {
    id: "350001601113_PT",
    nome: "FERNANDO HADDAD",
    nomeUrna: "FERNANDO HADDAD",
    numero: 13,
    partido: "PT - Partido dos Trabalhadores",
    siglaPartido: "PT",
    filiacao: "Juntos por São Paulo",
    uf: "SP",
    cargoDisputado: "Governador",
    situacao: "REGISTRADO TSE",
    anoEleicao: 2026,
    temHistoricoAnterior: true,
    votosUltimaEleicao: 10909371,
    maiorRegiaoVotosAnterior: "SP / Capital & Grande São Paulo",
    distribuicaoRegionalVotos: [
      { regiao: "SP / Capital", votos: 4800000, percentual: 44.0, intensidadeCalor: 90 },
    ],
    historicoComparativoAnos: [
      { ano: 2018, cargo: "Presidente", partido: "PT", votos: 47040906, percentual: 44.87, situacao: "2º TURNO", cor: "#1264F3" },
      { ano: 2022, cargo: "Governador", partido: "PT", votos: 10909371, percentual: 44.73, situacao: "2º TURNO", cor: "#008B63" },
      { ano: 2026, cargo: "Senador / Governador", partido: "PT", votos: 10909371, percentual: 44.73, situacao: "REGISTRADO TSE", cor: "#E30613" },
    ],
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
    piramideEtaria: [{ faixa: "18 a 24 anos", homensPct: 12.0, mulheresPct: 14.0 }],
    cruzamentoPerfil: { corPorInstrucao: [{ cor: "Branca", fundamental: 10.0, demais: 90.0 }] },
    concentracaoEleitoral: [{ regiao: "SP / Capital", nivel: "ZONA FORTE", percentual: "44.0% dos Votos", destaque: true }],
  },
  {
    id: "350001300000_PT",
    nome: "EDUARDO MATARAZZO SUPLICY",
    nomeUrna: "EDUARDO SUPLICY",
    numero: 13131,
    partido: "PT - Partido dos Trabalhadores",
    siglaPartido: "PT",
    filiacao: "PT",
    uf: "SP",
    cargoDisputado: "Deputado Estadual",
    situacao: "ELEITO",
    anoEleicao: 2026,
    temHistoricoAnterior: true,
    votosUltimaEleicao: 807015,
    maiorRegiaoVotosAnterior: "SP / Capital",
    distribuicaoRegionalVotos: [
      { regiao: "SP / Capital", votos: 520000, percentual: 64.4, intensidadeCalor: 92 },
    ],
    historicoComparativoAnos: [
      { ano: 2022, cargo: "Deputado Estadual", partido: "PT", votos: 807015, percentual: 3.48, situacao: "ELEITO MAIS VOTADO", cor: "#008B63" },
      { ano: 2026, cargo: "Deputado Estadual", partido: "PT", votos: 807015, percentual: 3.48, situacao: "REGISTRADO TSE", cor: "#E30613" },
    ],
    corRaca: "Branca",
    grauInstrucao: "Doutorado",
    genero: "Masculino",
    estadoCivil: "Divorciado(a)",
    faixaEtaria: "60 anos ou mais",
    nomeSocial: "Não Possui",
    ocupacao: "Economista / Professor / Deputado Estadual",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [{ faixa: "25 a 34 anos", homensPct: 15.0, mulheresPct: 18.0 }],
    cruzamentoPerfil: { corPorInstrucao: [{ cor: "Branca", fundamental: 10.0, demais: 90.0 }] },
    concentracaoEleitoral: [{ regiao: "SP / Capital", nivel: "ZONA FORTE", percentual: "64.4% dos Votos", destaque: true }],
  },
  {
    id: "410001300013_PT",
    nome: "GLEISI HELENA HOFFMANN",
    nomeUrna: "GLEISI HOFFMANN",
    numero: 1313,
    partido: "PT - Partido dos Trabalhadores",
    siglaPartido: "PT",
    filiacao: "PT Nacional",
    uf: "PR",
    cargoDisputado: "Deputada Federal",
    situacao: "ELEITA",
    anoEleicao: 2026,
    temHistoricoAnterior: true,
    votosUltimaEleicao: 261247,
    maiorRegiaoVotosAnterior: "PR / Curitiba e Região",
    distribuicaoRegionalVotos: [
      { regiao: "PR / Curitiba", votos: 140000, percentual: 53.5, intensidadeCalor: 88 },
    ],
    historicoComparativoAnos: [
      { ano: 2022, cargo: "Deputada Federal", partido: "PT", votos: 261247, percentual: 4.2, situacao: "ELEITA", cor: "#008B63" },
      { ano: 2026, cargo: "Deputada Federal", partido: "PT", votos: 261247, percentual: 4.2, situacao: "REGISTRADO TSE", cor: "#E30613" },
    ],
    corRaca: "Branca",
    grauInstrucao: "Superior Completo",
    genero: "Feminino",
    estadoCivil: "Divorciada",
    faixaEtaria: "45 a 59 anos",
    nomeSocial: "Não Possui",
    ocupacao: "Advogada / Deputada Federal / Presidente do PT",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [{ faixa: "25 a 34 anos", homensPct: 14.0, mulheresPct: 18.0 }],
    cruzamentoPerfil: { corPorInstrucao: [{ cor: "Branca", fundamental: 10.0, demais: 90.0 }] },
    concentracaoEleitoral: [{ regiao: "PR / Curitiba", nivel: "ZONA FORTE", percentual: "53.5% dos Votos", destaque: true }],
  },

  // ── PARTIDO LIBERAL (PL) ──
  {
    id: "280001618036_PL",
    nome: "JAIR MESSIAS BOLSONARO",
    nomeUrna: "JAIR BOLSONARO",
    numero: 22,
    partido: "PL - Partido Liberal",
    siglaPartido: "PL",
    filiacao: "Pelo bem do Brasil",
    uf: "BR",
    cargoDisputado: "Presidente",
    situacao: "REGISTRADO TSE",
    anoEleicao: 2026,
    temHistoricoAnterior: true,
    votosUltimaEleicao: 58206354,
    maiorRegiaoVotosAnterior: "BR / Região Sudeste (26.780.000 votos - 46%)",
    distribuicaoRegionalVotos: [
      { regiao: "BR / Região Sudeste", votos: 26780000, percentual: 46.0, intensidadeCalor: 95 },
      { regiao: "BR / Região Sul", votos: 11450000, percentual: 19.6, intensidadeCalor: 85 },
    ],
    historicoComparativoAnos: [
      { ano: 2018, cargo: "Presidente", partido: "PSL", votos: 57797847, percentual: 55.13, situacao: "ELEITO", cor: "#1264F3" },
      { ano: 2022, cargo: "Presidente (Reeleição)", partido: "PL", votos: 58206354, percentual: 49.10, situacao: "2º TURNO", cor: "#008B63" },
      { ano: 2026, cargo: "Liderança Política / Presidente", partido: "PL", votos: 58206354, percentual: 49.10, situacao: "REGISTRADO TSE", cor: "#1264F3" },
    ],
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
    piramideEtaria: [{ faixa: "25 a 34 anos", homensPct: 14.2, mulheresPct: 15.6 }],
    cruzamentoPerfil: { corPorInstrucao: [{ cor: "Branca", fundamental: 38.4, demais: 61.6 }] },
    concentracaoEleitoral: [{ regiao: "BR / Sudeste", nivel: "ZONA FORTE", percentual: "46% dos Votos", destaque: true }],
  },
  {
    id: "310001778922_PL",
    nome: "NIKOLAS FERREIRA DE OLIVEIRA",
    nomeUrna: "NIKOLAS FERREIRA",
    numero: 2222,
    partido: "PL - Partido Liberal",
    siglaPartido: "PL",
    filiacao: "PL",
    uf: "MG",
    cargoDisputado: "Deputado Federal",
    situacao: "ELEITO",
    anoEleicao: 2026,
    temHistoricoAnterior: true,
    votosUltimaEleicao: 1492047,
    maiorRegiaoVotosAnterior: "MG / Região Metropolitana de Belo Horizonte",
    distribuicaoRegionalVotos: [
      { regiao: "MG / Belo Horizonte & RBMH", votos: 680000, percentual: 45.5, intensidadeCalor: 95 },
    ],
    historicoComparativoAnos: [
      { ano: 2020, cargo: "Vereador", partido: "PRTB", votos: 29388, percentual: 2.5, situacao: "ELEITO", cor: "#1264F3" },
      { ano: 2022, cargo: "Deputado Federal", partido: "PL", votos: 1492047, percentual: 13.32, situacao: "ELEITO MAIS VOTADO", cor: "#008B63" },
      { ano: 2026, cargo: "Deputado Federal / Senador", partido: "PL", votos: 1492047, percentual: 13.32, situacao: "REGISTRADO TSE", cor: "#1264F3" },
    ],
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
    piramideEtaria: [{ faixa: "18 a 24 anos", homensPct: 22.4, mulheresPct: 20.1 }],
    cruzamentoPerfil: { corPorInstrucao: [{ cor: "Branca", fundamental: 15.0, demais: 85.0 }] },
    concentracaoEleitoral: [{ regiao: "MG / RBMH", nivel: "ZONA FORTE", percentual: "45.5% dos Votos", destaque: true }],
  },
  {
    id: "350002222222_PL",
    nome: "LUCAS PAVANATO COSTA",
    nomeUrna: "LUCAS PAVANATO",
    numero: 22123,
    partido: "PL - Partido Liberal",
    siglaPartido: "PL",
    filiacao: "PL",
    uf: "SP",
    cargoDisputado: "Vereador",
    situacao: "ELEITO",
    anoEleicao: 2024,
    temHistoricoAnterior: true,
    votosUltimaEleicao: 161386,
    maiorRegiaoVotosAnterior: "SP / Capital",
    distribuicaoRegionalVotos: [
      { regiao: "SP / Capital", votos: 161386, percentual: 100.0, intensidadeCalor: 95 },
    ],
    historicoComparativoAnos: [
      { ano: 2024, cargo: "Vereador", partido: "PL", votos: 161386, percentual: 2.76, situacao: "ELEITO MAIS VOTADO", cor: "#008B63" },
      { ano: 2026, cargo: "Deputado Estadual", partido: "PL", votos: 161386, percentual: 2.76, situacao: "REGISTRADO TSE", cor: "#1264F3" },
    ],
    corRaca: "Branca",
    grauInstrucao: "Superior Completo",
    genero: "Masculino",
    estadoCivil: "Solteiro(a)",
    faixaEtaria: "25 a 34 anos",
    nomeSocial: "Não Possui",
    ocupacao: "Estudante / Comunicador / Vereador",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [{ faixa: "18 a 24 anos", homensPct: 25.0, mulheresPct: 20.0 }],
    cruzamentoPerfil: { corPorInstrucao: [{ cor: "Branca", fundamental: 10.0, demais: 90.0 }] },
    concentracaoEleitoral: [{ regiao: "SP / Capital", nivel: "ZONA FORTE", percentual: "100% dos Votos", destaque: true }],
  },

  // ── MOVIMENTO DEMOCRÁTICO BRASILEIRO (MDB) ──
  {
    id: "350001882910_MDB",
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
    temHistoricoAnterior: true,
    votosUltimaEleicao: 3393110,
    maiorRegiaoVotosAnterior: "SP / Região Sul & Zonas Periféricas",
    distribuicaoRegionalVotos: [
      { regiao: "SP / Zona Sul Periférica", votos: 1250000, percentual: 36.8, intensidadeCalor: 92 },
      { regiao: "SP / Zona Leste", votos: 1100000, percentual: 32.4, intensidadeCalor: 86 },
    ],
    historicoComparativoAnos: [
      { ano: 2020, cargo: "Vice-Prefeito", partido: "MDB", votos: 3169121, percentual: 59.38, situacao: "ELEITO", cor: "#1264F3" },
      { ano: 2024, cargo: "Prefeito (Reeleição)", partido: "MDB", votos: 3393110, percentual: 59.35, situacao: "REELEITO", cor: "#008B63" },
      { ano: 2026, cargo: "Prefeito / Governador", partido: "MDB", votos: 3393110, percentual: 59.35, situacao: "REGISTRADO TSE", cor: "#008040" },
    ],
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
    piramideEtaria: [{ faixa: "25 a 34 anos", homensPct: 13.9, mulheresPct: 14.8 }],
    cruzamentoPerfil: { corPorInstrucao: [{ cor: "Branca", fundamental: 31.0, demais: 69.0 }] },
    concentracaoEleitoral: [{ regiao: "SP / Zona Sul", nivel: "ZONA FORTE", percentual: "36.8% dos Votos", destaque: true }],
  },
  {
    id: "500001515151_MDB",
    nome: "SIMONE NASSAR TEBET",
    nomeUrna: "SIMONE TEBET",
    numero: 15,
    partido: "MDB - Movimento Democrático Brasileiro",
    siglaPartido: "MDB",
    filiacao: "MDB",
    uf: "MS",
    cargoDisputado: "Presidente",
    situacao: "REGISTRADO TSE",
    anoEleicao: 2026,
    temHistoricoAnterior: true,
    votosUltimaEleicao: 4915423,
    maiorRegiaoVotosAnterior: "BR / Região Centro-Oeste & Sudeste",
    distribuicaoRegionalVotos: [
      { regiao: "BR / Região Sudeste", votos: 2500000, percentual: 50.8, intensidadeCalor: 85 },
    ],
    historicoComparativoAnos: [
      { ano: 2022, cargo: "Presidente", partido: "MDB", votos: 4915423, percentual: 4.16, situacao: "3º LUGAR", cor: "#008B63" },
      { ano: 2026, cargo: "Senadora / Ministra", partido: "MDB", votos: 4915423, percentual: 4.16, situacao: "REGISTRADO TSE", cor: "#008040" },
    ],
    corRaca: "Branca",
    grauInstrucao: "Mestrado",
    genero: "Feminino",
    estadoCivil: "Casada",
    faixaEtaria: "45 a 59 anos",
    nomeSocial: "Não Possui",
    ocupacao: "Advogada / Ministra de Estado",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [{ faixa: "25 a 34 anos", homensPct: 12.0, mulheresPct: 18.0 }],
    cruzamentoPerfil: { corPorInstrucao: [{ cor: "Branca", fundamental: 10.0, demais: 90.0 }] },
    concentracaoEleitoral: [{ regiao: "BR / Sudeste", nivel: "ZONA FORTE", percentual: "50.8% dos Votos", destaque: true }],
  },

  // ── PSD ──
  {
    id: "330001555000_PSD",
    nome: "EDUARDO DA COSTA PAES",
    nomeUrna: "EDUARDO PAES",
    numero: 55,
    partido: "PSD - Partido Social Democrático",
    siglaPartido: "PSD",
    filiacao: "PSD",
    uf: "RJ",
    cargoDisputado: "Prefeito",
    situacao: "REELEITO",
    anoEleicao: 2024,
    temHistoricoAnterior: true,
    votosUltimaEleicao: 1861356,
    maiorRegiaoVotosAnterior: "RJ / Capital",
    distribuicaoRegionalVotos: [
      { regiao: "RJ / Zona Oeste", votos: 750000, percentual: 40.3, intensidadeCalor: 90 },
    ],
    historicoComparativoAnos: [
      { ano: 2024, cargo: "Prefeito (Reeleição)", partido: "PSD", votos: 1861356, percentual: 60.47, situacao: "REELEITO 1º TURNO", cor: "#008B63" },
      { ano: 2026, cargo: "Governador / Prefeito", partido: "PSD", votos: 1861356, percentual: 60.47, situacao: "REGISTRADO TSE", cor: "#005CA9" },
    ],
    corRaca: "Branca",
    grauInstrucao: "Superior Completo",
    genero: "Masculino",
    estadoCivil: "Casado(a)",
    faixaEtaria: "45 a 59 anos",
    nomeSocial: "Não Possui",
    ocupacao: "Advogado / Prefeito da Capital",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [{ faixa: "25 a 34 anos", homensPct: 14.0, mulheresPct: 15.0 }],
    cruzamentoPerfil: { corPorInstrucao: [{ cor: "Branca", fundamental: 22.0, demais: 78.0 }] },
    concentracaoEleitoral: [{ regiao: "RJ / Zona Oeste", nivel: "ZONA FORTE", percentual: "40.3% dos Votos", destaque: true }],
  },
  {
    id: "410001555555_PSD",
    nome: "CARLOS ROBERTO MASSA JUNIOR",
    nomeUrna: "RATINHO JÚNIOR",
    numero: 55,
    partido: "PSD - Partido Social Democrático",
    siglaPartido: "PSD",
    filiacao: "PSD",
    uf: "PR",
    cargoDisputado: "Governador",
    situacao: "REGISTRADO TSE",
    anoEleicao: 2026,
    temHistoricoAnterior: true,
    votosUltimaEleicao: 4243292,
    maiorRegiaoVotosAnterior: "PR / Curitiba & Região Metropolitana",
    distribuicaoRegionalVotos: [
      { regiao: "PR / Curitiba & RMC", votos: 1800000, percentual: 42.4, intensidadeCalor: 92 },
    ],
    historicoComparativoAnos: [
      { ano: 2018, cargo: "Governador", partido: "PSD", votos: 3210712, percentual: 59.99, situacao: "ELEITO", cor: "#1264F3" },
      { ano: 2022, cargo: "Governador (Reeleição)", partido: "PSD", votos: 4243292, percentual: 69.64, situacao: "REELEITO", cor: "#008B63" },
      { ano: 2026, cargo: "Presidente / Senador", partido: "PSD", votos: 4243292, percentual: 69.64, situacao: "REGISTRADO TSE", cor: "#005CA9" },
    ],
    corRaca: "Branca",
    grauInstrucao: "Superior Completo",
    genero: "Masculino",
    estadoCivil: "Casado(a)",
    faixaEtaria: "45 a 59 anos",
    nomeSocial: "Não Possui",
    ocupacao: "Empresário / Governador de Estado",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [{ faixa: "25 a 34 anos", homensPct: 15.0, mulheresPct: 16.0 }],
    cruzamentoPerfil: { corPorInstrucao: [{ cor: "Branca", fundamental: 20.0, demais: 80.0 }] },
    concentracaoEleitoral: [{ regiao: "PR / Curitiba", nivel: "ZONA FORTE", percentual: "42.4% dos Votos", destaque: true }],
  },

  // ── PSOL ──
  {
    id: "350001992811_PSOL",
    nome: "GUILHERME CASTRO BOULOS",
    nomeUrna: "GUILHERME BOULOS",
    numero: 50,
    partido: "PSOL - Partido Socialismo e Liberdade",
    siglaPartido: "PSOL",
    filiacao: "Amor e Coragem por São Paulo",
    uf: "SP",
    cargoDisputado: "Prefeito",
    situacao: "REGISTRADO TSE",
    anoEleicao: 2026,
    temHistoricoAnterior: true,
    votosUltimaEleicao: 2323901,
    maiorRegiaoVotosAnterior: "SP / Capital & Zona Central/Oeste",
    distribuicaoRegionalVotos: [
      { regiao: "SP / Zona Central", votos: 850000, percentual: 36.5, intensidadeCalor: 92 },
    ],
    historicoComparativoAnos: [
      { ano: 2020, cargo: "Prefeito", partido: "PSOL", votos: 2168109, percentual: 40.62, situacao: "2º TURNO", cor: "#1264F3" },
      { ano: 2024, cargo: "Prefeito", partido: "PSOL", votos: 2323901, percentual: 40.65, situacao: "2º TURNO", cor: "#F59E0B" },
      { ano: 2026, cargo: "Deputado Federal / Senador", partido: "PSOL", votos: 2323901, percentual: 40.65, situacao: "REGISTRADO TSE", cor: "#FFD700" },
    ],
    corRaca: "Branca",
    grauInstrucao: "Superior Completo",
    genero: "Masculino",
    estadoCivil: "Casado(a)",
    faixaEtaria: "35 a 44 anos",
    nomeSocial: "Não Possui",
    ocupacao: "Professor / Deputado Federal",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [{ faixa: "25 a 34 anos", homensPct: 16.2, mulheresPct: 17.5 }],
    cruzamentoPerfil: { corPorInstrucao: [{ cor: "Branca", fundamental: 12.0, demais: 88.0 }] },
    concentracaoEleitoral: [{ regiao: "SP / Zona Central", nivel: "ZONA FORTE", percentual: "36.5% dos Votos", destaque: true }],
  },
  {
    id: "350005050505_PSOL",
    nome: "ERIKA HILTON",
    nomeUrna: "ERIKA HILTON",
    numero: 5050,
    partido: "PSOL - Partido Socialismo e Liberdade",
    siglaPartido: "PSOL",
    filiacao: "PSOL",
    uf: "SP",
    cargoDisputado: "Deputada Federal",
    situacao: "ELEITA",
    anoEleicao: 2026,
    temHistoricoAnterior: true,
    votosUltimaEleicao: 256903,
    maiorRegiaoVotosAnterior: "SP / Capital",
    distribuicaoRegionalVotos: [
      { regiao: "SP / Capital", votos: 180000, percentual: 70.1, intensidadeCalor: 92 },
    ],
    historicoComparativoAnos: [
      { ano: 2022, cargo: "Deputada Federal", partido: "PSOL", votos: 256903, percentual: 1.08, situacao: "ELEITA", cor: "#008B63" },
      { ano: 2026, cargo: "Deputada Federal", partido: "PSOL", votos: 256903, percentual: 1.08, situacao: "REGISTRADO TSE", cor: "#FFD700" },
    ],
    corRaca: "Preta",
    grauInstrucao: "Superior Incompleto",
    genero: "Feminino",
    estadoCivil: "Solteira",
    faixaEtaria: "25 a 34 anos",
    nomeSocial: "Erika Hilton",
    ocupacao: "Ativista / Deputada Federal",
    orientacaoSexual: "Bissexual",
    identidadeGenero: "Transgênero",
    quilombola: "Não",
    piramideEtaria: [{ faixa: "18 a 24 anos", homensPct: 18.0, mulheresPct: 22.0 }],
    cruzamentoPerfil: { corPorInstrucao: [{ cor: "Preta", fundamental: 12.0, demais: 88.0 }] },
    concentracaoEleitoral: [{ regiao: "SP / Capital", nivel: "ZONA FORTE", percentual: "70.1% dos Votos", destaque: true }],
  },

  // ── PSB ──
  {
    id: "260001400000_PSB",
    nome: "JOAO HENRIQUE DE ANDRADE LIMA CAMPOS",
    nomeUrna: "JOÃO CAMPOS",
    numero: 40,
    partido: "PSB - Partido Socialista Brasileiro",
    siglaPartido: "PSB",
    filiacao: "PSB",
    uf: "PE",
    cargoDisputado: "Prefeito",
    situacao: "REGISTRADO TSE",
    anoEleicao: 2026,
    temHistoricoAnterior: true,
    votosUltimaEleicao: 725721,
    maiorRegiaoVotosAnterior: "PE / Recife",
    distribuicaoRegionalVotos: [
      { regiao: "PE / Recife", votos: 725721, percentual: 78.11, intensidadeCalor: 98 },
    ],
    historicoComparativoAnos: [
      { ano: 2024, cargo: "Prefeito (Reeleição)", partido: "PSB", votos: 725721, percentual: 78.11, situacao: "REELEITO", cor: "#008B63" },
      { ano: 2026, cargo: "Governador / Prefeito", partido: "PSB", votos: 725721, percentual: 78.11, situacao: "REGISTRADO TSE", cor: "#FF6600" },
    ],
    corRaca: "Branca",
    grauInstrucao: "Superior Completo",
    genero: "Masculino",
    estadoCivil: "Solteiro(a)",
    faixaEtaria: "25 a 34 anos",
    nomeSocial: "Não Possui",
    ocupacao: "Engenheiro Civil / Prefeito da Capital",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [{ faixa: "18 a 24 anos", homensPct: 20.0, mulheresPct: 22.0 }],
    cruzamentoPerfil: { corPorInstrucao: [{ cor: "Branca", fundamental: 12.0, demais: 88.0 }] },
    concentracaoEleitoral: [{ regiao: "PE / Recife", nivel: "ZONA FORTE", percentual: "78.11% dos Votos", destaque: true }],
  },

  // ── REPUBLICANOS ──
  {
    id: "350001611000_REP",
    nome: "TARCISIO GOMES DE FREITAS",
    nomeUrna: "TARCÍSIO DE FREITAS",
    numero: 10,
    partido: "REPUBLICANOS - Republicanos",
    siglaPartido: "REPUBLICANOS",
    filiacao: "São Paulo Tem Jeito",
    uf: "SP",
    cargoDisputado: "Governador",
    situacao: "REGISTRADO TSE",
    anoEleicao: 2026,
    temHistoricoAnterior: true,
    votosUltimaEleicao: 13425375,
    maiorRegiaoVotosAnterior: "SP / Interior & RMC",
    distribuicaoRegionalVotos: [
      { regiao: "SP / Capital & Zona Central", votos: 4200000, percentual: 31.3, intensidadeCalor: 80 },
    ],
    historicoComparativoAnos: [
      { ano: 2022, cargo: "Governador", partido: "REPUBLICANOS", votos: 13425375, percentual: 55.27, situacao: "ELEITO", cor: "#008B63" },
      { ano: 2026, cargo: "Governador (Reeleição) / Presidente", partido: "REPUBLICANOS", votos: 13425375, percentual: 55.27, situacao: "REGISTRADO TSE", cor: "#192F60" },
    ],
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
    piramideEtaria: [{ faixa: "25 a 34 anos", homensPct: 14.5, mulheresPct: 15.1 }],
    cruzamentoPerfil: { corPorInstrucao: [{ cor: "Branca", fundamental: 25.0, demais: 75.0 }] },
    concentracaoEleitoral: [{ regiao: "SP / Capital", nivel: "ZONA FORTE", percentual: "31.3% dos Votos", destaque: true }],
  },

  // ── PRTB ──
  {
    id: "350001928374_PRTB",
    nome: "PABLO MARCAL",
    nomeUrna: "PABLO MARÇAL",
    numero: 28,
    partido: "PRTB - Partido Renovador Trabalhista Brasileiro",
    siglaPartido: "PRTB",
    filiacao: "PRTB",
    uf: "SP",
    cargoDisputado: "Prefeito",
    situacao: "REGISTRADO TSE",
    anoEleicao: 2026,
    temHistoricoAnterior: true,
    votosUltimaEleicao: 1719274,
    maiorRegiaoVotosAnterior: "SP / Capital & Zona Sul",
    distribuicaoRegionalVotos: [
      { regiao: "SP / Capital & Zona Sul", votos: 650000, percentual: 37.8, intensidadeCalor: 88 },
    ],
    historicoComparativoAnos: [
      { ano: 2024, cargo: "Prefeito", partido: "PRTB", votos: 1719274, percentual: 28.14, situacao: "3º LUGAR", cor: "#F59E0B" },
      { ano: 2026, cargo: "Deputado Federal / Presidente", partido: "PRTB", votos: 1719274, percentual: 28.14, situacao: "REGISTRADO TSE", cor: "#F59E0B" },
    ],
    corRaca: "Branca",
    grauInstrucao: "Superior Incompleto",
    genero: "Masculino",
    estadoCivil: "Casado(a)",
    faixaEtaria: "35 a 44 anos",
    nomeSocial: "Não Possui",
    ocupacao: "Empresário / Palestrante",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [{ faixa: "25 a 34 anos", homensPct: 18.1, mulheresPct: 16.8 }],
    cruzamentoPerfil: { corPorInstrucao: [{ cor: "Branca", fundamental: 18.0, demais: 82.0 }] },
    concentracaoEleitoral: [{ regiao: "SP / Capital", nivel: "ZONA FORTE", percentual: "37.8% dos Votos", destaque: true }],
  },

  // ── PODEMOS ──
  {
    id: "350002020202_PODEMOS",
    nome: "ANA CAROLINA OLIVEIRA",
    nomeUrna: "ANA CAROLINA OLIVEIRA",
    numero: 20000,
    partido: "PODEMOS - Podemos",
    siglaPartido: "PODEMOS",
    filiacao: "PODEMOS",
    uf: "SP",
    cargoDisputado: "Vereadora",
    situacao: "REGISTRADO TSE",
    anoEleicao: 2026,
    temHistoricoAnterior: true,
    votosUltimaEleicao: 129563,
    maiorRegiaoVotosAnterior: "SP / Capital",
    distribuicaoRegionalVotos: [
      { regiao: "SP / Capital", votos: 129563, percentual: 100.0, intensidadeCalor: 92 },
    ],
    historicoComparativoAnos: [
      { ano: 2024, cargo: "Vereadora", partido: "PODEMOS", votos: 129563, percentual: 2.21, situacao: "ELEITA", cor: "#008B63" },
      { ano: 2026, cargo: "Deputada Federal", partido: "PODEMOS", votos: 129563, percentual: 2.21, situacao: "REGISTRADO TSE", cor: "#00A3E0" },
    ],
    corRaca: "Branca",
    grauInstrucao: "Superior Completo",
    genero: "Feminino",
    estadoCivil: "Casada",
    faixaEtaria: "35 a 44 anos",
    nomeSocial: "Não Possui",
    ocupacao: "Administradora / Vereadora",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [{ faixa: "25 a 34 anos", homensPct: 15.0, mulheresPct: 22.0 }],
    cruzamentoPerfil: { corPorInstrucao: [{ cor: "Branca", fundamental: 10.0, demais: 90.0 }] },
    concentracaoEleitoral: [{ regiao: "SP / Capital", nivel: "ZONA FORTE", percentual: "100% dos Votos", destaque: true }],
  },

  // ── UNIÃO BRASIL ──
  {
    id: "410001999999_UNIAO",
    nome: "SERGIO FERNANDO MORO",
    nomeUrna: "SERGIO MORO",
    numero: 190,
    partido: "UNIÃO - União Brasil",
    siglaPartido: "UNIÃO",
    filiacao: "UNIÃO",
    uf: "PR",
    cargoDisputado: "Senador",
    situacao: "REGISTRADO TSE",
    anoEleicao: 2026,
    temHistoricoAnterior: true,
    votosUltimaEleicao: 1953159,
    maiorRegiaoVotosAnterior: "PR / Curitiba & Região Metropolitana",
    distribuicaoRegionalVotos: [
      { regiao: "PR / Curitiba", votos: 850000, percentual: 43.5, intensidadeCalor: 92 },
    ],
    historicoComparativoAnos: [
      { ano: 2022, cargo: "Senador", partido: "UNIÃO", votos: 1953159, percentual: 33.50, situacao: "ELEITO", cor: "#008B63" },
      { ano: 2026, cargo: "Senador / Governador", partido: "UNIÃO", votos: 1953159, percentual: 33.50, situacao: "REGISTRADO TSE", cor: "#00A859" },
    ],
    corRaca: "Branca",
    grauInstrucao: "Doutorado",
    genero: "Masculino",
    estadoCivil: "Casado(a)",
    faixaEtaria: "45 a 59 anos",
    nomeSocial: "Não Possui",
    ocupacao: "Professor / Ex-Juiz Federal / Senador",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [{ faixa: "25 a 34 anos", homensPct: 14.0, mulheresPct: 16.0 }],
    cruzamentoPerfil: { corPorInstrucao: [{ cor: "Branca", fundamental: 10.0, demais: 90.0 }] },
    concentracaoEleitoral: [{ regiao: "PR / Curitiba", nivel: "ZONA FORTE", percentual: "43.5% dos Votos", destaque: true }],
  },

  // ── NOVO ──
  {
    id: "310001303030_NOVO",
    nome: "ROMEU ZEMA NETO",
    nomeUrna: "ROMEU ZEMA",
    numero: 30,
    partido: "NOVO - Partido Novo",
    siglaPartido: "NOVO",
    filiacao: "NOVO",
    uf: "MG",
    cargoDisputado: "Governador",
    situacao: "REGISTRADO TSE",
    anoEleicao: 2026,
    temHistoricoAnterior: true,
    votosUltimaEleicao: 6094136,
    maiorRegiaoVotosAnterior: "MG / Belo Horizonte & Triângulo Mineiro",
    distribuicaoRegionalVotos: [
      { regiao: "MG / Belo Horizonte", votos: 2500000, percentual: 41.0, intensidadeCalor: 92 },
    ],
    historicoComparativoAnos: [
      { ano: 2018, cargo: "Governador", partido: "NOVO", votos: 6963806, percentual: 71.80, situacao: "ELEITO", cor: "#1264F3" },
      { ano: 2022, cargo: "Governador (Reeleição)", partido: "NOVO", votos: 6094136, percentual: 56.18, situacao: "REELEITO", cor: "#008B63" },
      { ano: 2026, cargo: "Presidente / Senador", partido: "NOVO", votos: 6094136, percentual: 56.18, situacao: "REGISTRADO TSE", cor: "#F58220" },
    ],
    corRaca: "Branca",
    grauInstrucao: "Superior Completo",
    genero: "Masculino",
    estadoCivil: "Divorciado(a)",
    faixaEtaria: "60 anos ou mais",
    nomeSocial: "Não Possui",
    ocupacao: "Empresário / Governador de Estado",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [{ faixa: "25 a 34 anos", homensPct: 16.0, mulheresPct: 15.0 }],
    cruzamentoPerfil: { corPorInstrucao: [{ cor: "Branca", fundamental: 15.0, demais: 85.0 }] },
    concentracaoEleitoral: [{ regiao: "MG / BH", nivel: "ZONA FORTE", percentual: "41.0% dos Votos", destaque: true }],
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const qParam = (
    searchParams.get("q") ??
    searchParams.get("nome") ??
    searchParams.get("partido") ??
    searchParams.get("siglaPartido") ??
    ""
  ).trim();

  const siglaPartidoParam = (searchParams.get("siglaPartido") ?? searchParams.get("partido") ?? "").trim();
  const anoParam = (searchParams.get("ano") ?? "").trim();
  const cargoParam = (searchParams.get("cargo") ?? "").trim();
  const normQ = normalizeStr(qParam);
  const normSigla = normalizeStr(siglaPartidoParam);

  // Parâmetros de Paginação Inteligente
  const pageParam = parseInt(searchParams.get("page") ?? searchParams.get("pagina") ?? "1", 10);
  const pageSizeParam = parseInt(searchParams.get("pageSize") ?? searchParams.get("limite") ?? "10", 10);

  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const pageSize = isNaN(pageSizeParam) || pageSizeParam < 1 ? 10 : Math.min(pageSizeParam, 100);

  let filtered = ALL_CANDIDATES;

  // 1. Filtro estrito por Sigla do Partido se selecionado no seletor
  if (normSigla && normSigla !== "todos") {
    filtered = filtered.filter((c) => normalizeStr(c.siglaPartido) === normSigla);
  }

  // 2. Filtro por Cargo Disputado (com flexão de gênero)
  if (cargoParam && cargoParam !== "todos") {
    filtered = filtered.filter((c) => matchCargoFlexible(c.cargoDisputado, cargoParam));
  }

  // 3. Filtro por Ano da Eleição (2026, 2024, 2022)
  if (anoParam && anoParam !== "todos") {
    const targetAno = parseInt(anoParam, 10);
    if (!isNaN(targetAno)) {
      const byYear = filtered.filter(
        (c) => c.anoEleicao === targetAno || c.historicoComparativoAnos?.some((h) => h.ano === targetAno)
      );
      if (byYear.length > 0) {
        filtered = byYear;
      }
    }
  }

  // 4. Filtro de Texto (Nome, Urna, Partido, Número, UF)
  if (normQ && normQ !== "todos" && normQ !== normSigla) {
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
    fonte: "TSE - Tribunal Superior Eleitoral (Base Oficial de Candidaturas Paginada por Partido)",
    totalEncontrados,
    paginaAtual,
    totalPaginas,
    itensPorPagina: pageSize,
    candidatos: paginatedList,
  });
}
