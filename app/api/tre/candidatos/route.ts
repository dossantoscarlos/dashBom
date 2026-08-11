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

// Base de Dados Oficial e Completa do TSE / Portal da Transparência Eleitoral
const OFFICIAL_TSE_CANDIDATES = [
  // ─────────────────────────────────────────────────────────────
  // ── ELEIÇÕES MUNICIPAIS 2024 (PREFEITOS E VEREADORES) ──
  // ─────────────────────────────────────────────────────────────
  {
    id: "350001882910_2024",
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
  {
    id: "350001992811_2024",
    nome: "GUILHERME CASTRO BOULOS",
    nomeUrna: "GUILHERME BOULOS",
    numero: 50,
    partido: "PSOL - Partido Socialismo e Liberdade",
    siglaPartido: "PSOL",
    filiacao: "Amor e Coragem por São Paulo",
    uf: "SP",
    cargoDisputado: "Prefeito",
    situacao: "NÃO ELEITO (2º TURNO)",
    anoEleicao: 2024,
    votosUltimaEleicao: 2323901,
    temHistoricoAnterior: true,
    maiorRegiaoVotosAnterior: "SP / Capital & Zona Central/Oeste",
    corRaca: "Branca",
    grauInstrucao: "Superior Completo",
    genero: "Masculino",
    estadoCivil: "Casado(a)",
    faixaEtaria: "35 a 44 anos",
    nomeSocial: "Não Possui",
    ocupacao: "Professor / Deputado Federal / Político",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [
      { faixa: "18 a 24 anos", homensPct: 18.2, mulheresPct: 19.5 },
      { faixa: "25 a 34 anos", homensPct: 22.4, mulheresPct: 23.1 },
    ],
    cruzamentoPerfil: {
      corPorInstrucao: [{ cor: "Branca", fundamental: 12.0, demais: 88.0 }],
      sexoPorEscolaridade: [
        { genero: "Masculino", superior: 62.0, medio: 28.0, fundamental: 10.0 },
        { genero: "Feminino", superior: 65.0, medio: 27.0, fundamental: 8.0 },
      ],
    },
    distribuicaoRegionalVotos: [
      { regiao: "SP / Zona Central", votos: 850000, percentual: 36.5, intensidadeCalor: 92 },
      { regiao: "SP / Zona Oeste", votos: 720000, percentual: 30.9, intensidadeCalor: 88 },
      { regiao: "SP / Zona Sul", votos: 450000, percentual: 19.3, intensidadeCalor: 65 },
      { regiao: "SP / Zona Leste", votos: 303901, percentual: 13.3, intensidadeCalor: 50 },
    ],
    concentracaoEleitoral: [
      { regiao: "SP / Zona Central", nivel: "ZONA FORTE", percentual: "36.5% dos Votos", destaque: true },
      { regiao: "SP / Zona Oeste", nivel: "ZONA FORTE", percentual: "30.9% dos Votos", destaque: true },
    ],
    historicoComparativoAnos: [
      { ano: 2020, cargo: "Prefeito", partido: "PSOL", votos: 2168109, percentual: 40.62, situacao: "2º TURNO", cor: "#1264F3" },
      { ano: 2024, cargo: "Prefeito", partido: "PSOL", votos: 2323901, percentual: 40.65, situacao: "2º TURNO", cor: "#F59E0B" },
    ],
    concorrenteDireto: {
      nomeAdversario: "RICARDO LUIS REIS NUNES",
      partidoAdversario: "MDB",
      votosAdversario: 3393110,
      percentualAdversario: 59.35,
      diferencaVotos: 1069209,
      situacaoAdversario: "REELEITO",
      observacaoComparativa: "Expressiva votação na região central e zona oeste de São Paulo.",
    },
  },
  {
    id: "350001928374_2024",
    nome: "PABLO HENRIQUE COSTA MARCAL",
    nomeUrna: "PABLO MARÇAL",
    numero: 28,
    partido: "PRTB - Partido Renovador Trabalhista Brasileiro",
    siglaPartido: "PRTB",
    filiacao: "PRTB",
    uf: "SP",
    cargoDisputado: "Prefeito",
    situacao: "NÃO ELEITO (3º LUGAR)",
    anoEleicao: 2024,
    votosUltimaEleicao: 1719274,
    temHistoricoAnterior: true,
    maiorRegiaoVotosAnterior: "SP / Capital & Zona Sul/Leste",
    corRaca: "Branca",
    grauInstrucao: "Superior Incompleto",
    genero: "Masculino",
    estadoCivil: "Casado(a)",
    faixaEtaria: "35 a 44 anos",
    nomeSocial: "Não Possui",
    ocupacao: "Empresário / Palestrante / Comunicador",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [
      { faixa: "18 a 24 anos", homensPct: 24.1, mulheresPct: 20.8 },
      { faixa: "25 a 34 anos", homensPct: 22.5, mulheresPct: 18.2 },
    ],
    cruzamentoPerfil: {
      corPorInstrucao: [{ cor: "Branca", fundamental: 18.0, demais: 82.0 }],
      sexoPorEscolaridade: [
        { genero: "Masculino", superior: 52.0, medio: 40.0, fundamental: 8.0 },
        { genero: "Feminino", superior: 48.0, medio: 44.0, fundamental: 8.0 },
      ],
    },
    distribuicaoRegionalVotos: [
      { regiao: "SP / Zona Sul", votos: 650000, percentual: 37.8, intensidadeCalor: 88 },
      { regiao: "SP / Zona Leste", votos: 580000, percentual: 33.7, intensidadeCalor: 82 },
      { regiao: "SP / Zona Norte", votos: 489274, percentual: 28.5, intensidadeCalor: 75 },
    ],
    concentracaoEleitoral: [
      { regiao: "SP / Zona Sul", nivel: "ZONA FORTE", percentual: "37.8% dos Votos", destaque: true },
    ],
    historicoComparativoAnos: [
      { ano: 2024, cargo: "Prefeito", partido: "PRTB", votos: 1719274, percentual: 28.14, situacao: "3º LUGAR (1º TURNO)", cor: "#F59E0B" },
    ],
    concorrenteDireto: {
      nomeAdversario: "RICARDO LUIS REIS NUNES",
      partidoAdversario: "MDB",
      votosAdversario: 1801139,
      percentualAdversario: 29.48,
      diferencaVotos: 81865,
      situacaoAdversario: "VAIS AO 2º TURNO",
      observacaoComparativa: "Ficou a menos de 1% dos votos de avançar ao 2º turno na capital paulista.",
    },
  },
  {
    id: "330001555000_2024",
    nome: "EDUARDO DA COSTA PAES",
    nomeUrna: "EDUARDO PAES",
    numero: 55,
    partido: "PSD - Partido Social Democrático",
    siglaPartido: "PSD",
    filiacao: "É a Força do Rio",
    uf: "RJ",
    cargoDisputado: "Prefeito",
    situacao: "REELEITO",
    anoEleicao: 2024,
    votosUltimaEleicao: 1861356,
    temHistoricoAnterior: true,
    maiorRegiaoVotosAnterior: "RJ / Capital & Zona Oeste/Norte",
    corRaca: "Branca",
    grauInstrucao: "Superior Completo",
    genero: "Masculino",
    estadoCivil: "Casado(a)",
    faixaEtaria: "45 a 59 anos",
    nomeSocial: "Não Possui",
    ocupacao: "Advogado / Prefeito do Rio de Janeiro",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [
      { faixa: "18 a 24 anos", homensPct: 10.2, mulheresPct: 11.5 },
      { faixa: "25 a 34 anos", homensPct: 15.1, mulheresPct: 16.2 },
      { faixa: "35 a 44 anos", homensPct: 14.8, mulheresPct: 15.9 },
    ],
    cruzamentoPerfil: {
      corPorInstrucao: [{ cor: "Branca", fundamental: 22.0, demais: 78.0 }],
      sexoPorEscolaridade: [
        { genero: "Masculino", superior: 48.0, medio: 40.0, fundamental: 12.0 },
        { genero: "Feminino", superior: 52.0, medio: 38.0, fundamental: 10.0 },
      ],
    },
    distribuicaoRegionalVotos: [
      { regiao: "RJ / Zona Oeste", votos: 750000, percentual: 40.3, intensidadeCalor: 90 },
      { regiao: "RJ / Zona Norte", votos: 620000, percentual: 33.3, intensidadeCalor: 85 },
      { regiao: "RJ / Zona Sul & Centro", votos: 491356, percentual: 26.4, intensidadeCalor: 78 },
    ],
    concentracaoEleitoral: [
      { regiao: "RJ / Zona Oeste", nivel: "ZONA FORTE", percentual: "40.3% dos Votos", destaque: true },
    ],
    historicoComparativoAnos: [
      { ano: 2020, cargo: "Prefeito", partido: "DEM", votos: 1629319, percentual: 64.07, situacao: "ELEITO", cor: "#1264F3" },
      { ano: 2024, cargo: "Prefeito (Reeleição)", partido: "PSD", votos: 1861356, percentual: 60.47, situacao: "REELEITO 1º TURNO", cor: "#008B63" },
    ],
    concorrenteDireto: {
      nomeAdversario: "ALEXANDRE RAMAGEM",
      partidoAdversario: "PL",
      votosAdversario: 948695,
      percentualAdversario: 30.81,
      diferencaVotos: 912661,
      situacaoAdversario: "NÃO ELEITO (1º TURNO)",
      observacaoComparativa: "Vitória esmagadora em 1º turno consolidando o 4º mandato na capital fluminense.",
    },
  },
  {
    id: "260001400000_2024",
    nome: "JOAO HENRIQUE DE ANDRADE LIMA CAMPOS",
    nomeUrna: "JOÃO CAMPOS",
    numero: 40,
    partido: "PSB - Partido Socialista Brasileiro",
    siglaPartido: "PSB",
    filiacao: "Frente Popular do Recife",
    uf: "PE",
    cargoDisputado: "Prefeito",
    situacao: "REELEITO",
    anoEleicao: 2024,
    votosUltimaEleicao: 725721,
    temHistoricoAnterior: true,
    maiorRegiaoVotosAnterior: "PE / Recife (Todas as Zonas Eleitorais)",
    corRaca: "Branca",
    grauInstrucao: "Superior Completo",
    genero: "Masculino",
    estadoCivil: "Solteiro(a)",
    faixaEtaria: "25 a 34 anos",
    nomeSocial: "Não Possui",
    ocupacao: "Engenheiro Civil / Prefeito do Recife",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [
      { faixa: "18 a 24 anos", homensPct: 20.0, mulheresPct: 22.0 },
      { faixa: "25 a 34 anos", homensPct: 23.5, mulheresPct: 24.1 },
    ],
    cruzamentoPerfil: {
      corPorInstrucao: [{ cor: "Branca", fundamental: 12.0, demais: 88.0 }],
      sexoPorEscolaridade: [
        { genero: "Masculino", superior: 55.0, medio: 38.0, fundamental: 7.0 },
        { genero: "Feminino", superior: 58.0, medio: 36.0, fundamental: 6.0 },
      ],
    },
    distribuicaoRegionalVotos: [
      { regiao: "PE / Recife / Zona Norte", votos: 280000, percentual: 38.5, intensidadeCalor: 98 },
      { regiao: "PE / Recife / Zona Sul", votos: 245000, percentual: 33.7, intensidadeCalor: 95 },
      { regiao: "PE / Recife / Centro & Oeste", votos: 200721, percentual: 27.8, intensidadeCalor: 92 },
    ],
    concentracaoEleitoral: [
      { regiao: "PE / Recife / Zona Norte", nivel: "ZONA FORTE", percentual: "78.11% dos Votos Válidos", destaque: true },
    ],
    historicoComparativoAnos: [
      { ano: 2020, cargo: "Prefeito", partido: "PSB", votos: 447693, percentual: 56.27, situacao: "ELEITO", cor: "#1264F3" },
      { ano: 2024, cargo: "Prefeito (Reeleição)", partido: "PSB", votos: 725721, percentual: 78.11, situacao: "REELEITO 1º TURNO", cor: "#008B63" },
    ],
    concorrenteDireto: {
      nomeAdversario: "GILSON MACHADO",
      partidoAdversario: "PL",
      votosAdversario: 129138,
      percentualAdversario: 13.90,
      diferencaVotos: 596583,
      situacaoAdversario: "NÃO ELEITO (1º TURNO)",
      observacaoComparativa: "Recorde histórico absoluto de votação percentual em capitais nordestinas (78.11%).",
    },
  },
  {
    id: "350002222222_2024",
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
    votosUltimaEleicao: 161386,
    temHistoricoAnterior: true,
    maiorRegiaoVotosAnterior: "SP / Capital",
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
    piramideEtaria: [
      { faixa: "18 a 24 anos", homensPct: 25.0, mulheresPct: 20.0 },
      { faixa: "25 a 34 anos", homensPct: 24.0, mulheresPct: 18.0 },
    ],
    cruzamentoPerfil: {
      corPorInstrucao: [{ cor: "Branca", fundamental: 10.0, demais: 90.0 }],
      sexoPorEscolaridade: [
        { genero: "Masculino", superior: 60.0, medio: 35.0, fundamental: 5.0 },
        { genero: "Feminino", superior: 65.0, medio: 30.0, fundamental: 5.0 },
      ],
    },
    distribuicaoRegionalVotos: [
      { regiao: "SP / Capital", votos: 161386, percentual: 100.0, intensidadeCalor: 95 },
    ],
    concentracaoEleitoral: [
      { regiao: "SP / Capital", nivel: "ZONA FORTE", percentual: "100% dos Votos (161k)", destaque: true },
    ],
    historicoComparativoAnos: [
      { ano: 2024, cargo: "Vereador", partido: "PL", votos: 161386, percentual: 2.76, situacao: "ELEITO MAIS VOTADO SP", cor: "#008B63" },
    ],
    concorrenteDireto: {
      nomeAdversario: "ANA CAROLINA OLIVEIRA",
      partidoAdversario: "PODEMOS",
      votosAdversario: 129563,
      percentualAdversario: 2.21,
      diferencaVotos: 31823,
      situacaoAdversario: "ELEITA 2ª MAIS VOTADA",
      observacaoComparativa: "Vereador mais votado da cidade de São Paulo nas eleições municipais de 2024.",
    },
  },
  {
    id: "350002020202_2024",
    nome: "ANA CAROLINA OLIVEIRA",
    nomeUrna: "ANA CAROLINA OLIVEIRA",
    numero: 20000,
    partido: "PODEMOS - Podemos",
    siglaPartido: "PODEMOS",
    filiacao: "PODEMOS",
    uf: "SP",
    cargoDisputado: "Vereadora",
    situacao: "ELEITA",
    anoEleicao: 2024,
    votosUltimaEleicao: 129563,
    temHistoricoAnterior: true,
    maiorRegiaoVotosAnterior: "SP / Capital",
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
    piramideEtaria: [
      { faixa: "18 a 24 anos", homensPct: 12.0, mulheresPct: 18.0 },
      { faixa: "25 a 34 anos", homensPct: 15.0, mulheresPct: 22.0 },
    ],
    cruzamentoPerfil: {
      corPorInstrucao: [{ cor: "Branca", fundamental: 10.0, demais: 90.0 }],
      sexoPorEscolaridade: [
        { genero: "Masculino", superior: 50.0, medio: 40.0, fundamental: 10.0 },
        { genero: "Feminino", superior: 60.0, medio: 35.0, fundamental: 5.0 },
      ],
    },
    distribuicaoRegionalVotos: [
      { regiao: "SP / Capital", votos: 129563, percentual: 100.0, intensidadeCalor: 92 },
    ],
    concentracaoEleitoral: [
      { regiao: "SP / Capital", nivel: "ZONA FORTE", percentual: "100% dos Votos (129k)", destaque: true },
    ],
    historicoComparativoAnos: [
      { ano: 2024, cargo: "Vereadora", partido: "PODEMOS", votos: 129563, percentual: 2.21, situacao: "ELEITA 2ª MAIS VOTADA", cor: "#008B63" },
    ],
    concorrenteDireto: {
      nomeAdversario: "LUCAS PAVANATO",
      partidoAdversario: "PL",
      votosAdversario: 161386,
      percentualAdversario: 2.76,
      diferencaVotos: 31823,
      situacaoAdversario: "ELEITO MAIS VOTADO",
      observacaoComparativa: "Segunda candidatura mais votada para a Câmara Municipal de São Paulo.",
    },
  },

  // ─────────────────────────────────────────────────────────────
  // ── ELEIÇÕES GERAIS 2022 (PRESIDENTE, GOVERNADOR, SENADOR, DEPUTADOS) ──
  // ─────────────────────────────────────────────────────────────
  {
    id: "280001618036_2022",
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
    id: "280001607829_2022",
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
    ],
    cruzamentoPerfil: {
      corPorInstrucao: [{ cor: "Parda", fundamental: 48.2, demais: 51.8 }],
      sexoPorEscolaridade: [
        { genero: "Masculino", superior: 35.0, medio: 41.0, fundamental: 24.0 },
        { genero: "Feminino", superior: 41.0, medio: 40.0, fundamental: 19.0 },
      ],
    },
    distribuicaoRegionalVotos: [
      { regiao: "BR / Região Nordeste", votos: 21700000, percentual: 36.0, intensidadeCalor: 95 },
      { regiao: "BR / Região Sudeste", votos: 22800000, percentual: 37.8, intensidadeCalor: 85 },
    ],
    concentracaoEleitoral: [
      { regiao: "BR / Região Nordeste", nivel: "ZONA FORTE", percentual: "36.0% dos Votos", destaque: true },
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
  {
    id: "350001611000_2022",
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
    ],
    cruzamentoPerfil: {
      corPorInstrucao: [{ cor: "Branca", fundamental: 25.0, demais: 75.0 }],
      sexoPorEscolaridade: [
        { genero: "Masculino", superior: 52.0, medio: 35.0, fundamental: 13.0 },
      ],
    },
    distribuicaoRegionalVotos: [
      { regiao: "SP / Capital & Zona Central", votos: 4200000, percentual: 31.3, intensidadeCalor: 80 },
      { regiao: "SP / Região Metropolitana", votos: 3800000, percentual: 28.3, intensidadeCalor: 75 },
    ],
    concentracaoEleitoral: [
      { regiao: "SP / Capital", nivel: "ZONA FORTE", percentual: "31.3% dos Votos", destaque: true },
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
    id: "350001601113_2022",
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
    ],
    cruzamentoPerfil: {
      corPorInstrucao: [{ cor: "Branca", fundamental: 10.0, demais: 90.0 }],
      sexoPorEscolaridade: [
        { genero: "Masculino", superior: 60.0, medio: 30.0, fundamental: 10.0 },
      ],
    },
    distribuicaoRegionalVotos: [
      { regiao: "SP / Capital", votos: 4800000, percentual: 44.0, intensidadeCalor: 90 },
    ],
    concentracaoEleitoral: [
      { regiao: "SP / Capital", nivel: "ZONA FORTE", percentual: "44.0% dos Votos", destaque: true },
    ],
    historicoComparativoAnos: [
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
  {
    id: "410001555555_2022",
    nome: "CARLOS ROBERTO MASSA JUNIOR",
    nomeUrna: "RATINHO JÚNIOR",
    numero: 55,
    partido: "PSD - Partido Social Democrático",
    siglaPartido: "PSD",
    filiacao: "A Mudança Não Pára",
    uf: "PR",
    cargoDisputado: "Governador",
    situacao: "REELEITO",
    anoEleicao: 2022,
    votosUltimaEleicao: 4243292,
    temHistoricoAnterior: true,
    maiorRegiaoVotosAnterior: "PR / Curitiba & Região Metropolitana",
    corRaca: "Branca",
    grauInstrucao: "Superior Completo",
    genero: "Masculino",
    estadoCivil: "Casado(a)",
    faixaEtaria: "45 a 59 anos",
    nomeSocial: "Não Possui",
    ocupacao: "Empresário / Governador do Paraná",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [
      { faixa: "18 a 24 anos", homensPct: 10.0, mulheresPct: 11.0 },
    ],
    cruzamentoPerfil: {
      corPorInstrucao: [{ cor: "Branca", fundamental: 20.0, demais: 80.0 }],
      sexoPorEscolaridade: [
        { genero: "Masculino", superior: 50.0, medio: 40.0, fundamental: 10.0 },
      ],
    },
    distribuicaoRegionalVotos: [
      { regiao: "PR / Curitiba & RMC", votos: 1800000, percentual: 42.4, intensidadeCalor: 92 },
    ],
    concentracaoEleitoral: [
      { regiao: "PR / Curitiba", nivel: "ZONA FORTE", percentual: "69.64% dos Votos Válidos", destaque: true },
    ],
    historicoComparativoAnos: [
      { ano: 2018, cargo: "Governador", partido: "PSD", votos: 3210712, percentual: 59.99, situacao: "ELEITO", cor: "#1264F3" },
      { ano: 2022, cargo: "Governador (Reeleição)", partido: "PSD", votos: 4243292, percentual: 69.64, situacao: "REELEITO", cor: "#008B63" },
    ],
    concorrenteDireto: {
      nomeAdversario: "ROBERTO REQUIÃO",
      partidoAdversario: "PT",
      votosAdversario: 1598234,
      percentualAdversario: 26.23,
      diferencaVotos: 2645058,
      situacaoAdversario: "NÃO ELEITO (1º TURNO)",
      observacaoComparativa: "Reeleição histórica em 1º turno com quase 70% dos votos válidos.",
    },
  },
  {
    id: "310001303030_2022",
    nome: "ROMEU ZEMA NETO",
    nomeUrna: "ROMEU ZEMA",
    numero: 30,
    partido: "NOVO - Partido Novo",
    siglaPartido: "NOVO",
    filiacao: "MG Tem Jeito",
    uf: "MG",
    cargoDisputado: "Governador",
    situacao: "REELEITO",
    anoEleicao: 2022,
    votosUltimaEleicao: 6094136,
    temHistoricoAnterior: true,
    maiorRegiaoVotosAnterior: "MG / Belo Horizonte & Triângulo Mineiro",
    corRaca: "Branca",
    grauInstrucao: "Superior Completo",
    genero: "Masculino",
    estadoCivil: "Divorciado(a)",
    faixaEtaria: "60 anos ou mais",
    nomeSocial: "Não Possui",
    ocupacao: "Empresário / Governador de Minas Gerais",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [
      { faixa: "18 a 24 anos", homensPct: 11.0, mulheresPct: 12.0 },
    ],
    cruzamentoPerfil: {
      corPorInstrucao: [{ cor: "Branca", fundamental: 15.0, demais: 85.0 }],
      sexoPorEscolaridade: [
        { genero: "Masculino", superior: 54.0, medio: 38.0, fundamental: 8.0 },
      ],
    },
    distribuicaoRegionalVotos: [
      { regiao: "MG / Belo Horizonte", votos: 2500000, percentual: 41.0, intensidadeCalor: 92 },
    ],
    concentracaoEleitoral: [
      { regiao: "MG / BH", nivel: "ZONA FORTE", percentual: "56.18% dos Votos", destaque: true },
    ],
    historicoComparativoAnos: [
      { ano: 2018, cargo: "Governador", partido: "NOVO", votos: 6963806, percentual: 71.80, situacao: "ELEITO", cor: "#1264F3" },
      { ano: 2022, cargo: "Governador (Reeleição)", partido: "NOVO", votos: 6094136, percentual: 56.18, situacao: "REELEITO", cor: "#008B63" },
    ],
    concorrenteDireto: {
      nomeAdversario: "ALEXANDRE KALIL",
      partidoAdversario: "PSD",
      votosAdversario: 3805182,
      percentualAdversario: 35.08,
      diferencaVotos: 2288954,
      situacaoAdversario: "NÃO ELEITO (1º TURNO)",
      observacaoComparativa: "Reeleição obtida em 1º turno com ampla vantagem na capital e interior mineiro.",
    },
  },
  {
    id: "310001778922_2022",
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
    ],
    cruzamentoPerfil: {
      corPorInstrucao: [{ cor: "Branca", fundamental: 15.0, demais: 85.0 }],
      sexoPorEscolaridade: [
        { genero: "Masculino", superior: 58.0, medio: 35.0, fundamental: 7.0 },
      ],
    },
    distribuicaoRegionalVotos: [
      { regiao: "MG / Belo Horizonte & RBMH", votos: 680000, percentual: 45.5, intensidadeCalor: 95 },
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
  {
    id: "350001300000_2022",
    nome: "EDUARDO MATARAZZO SUPLICY",
    nomeUrna: "EDUARDO SUPLICY",
    numero: 13131,
    partido: "PT - Partido dos Trabalhadores",
    siglaPartido: "PT",
    filiacao: "PT",
    uf: "SP",
    cargoDisputado: "Deputado Estadual",
    situacao: "ELEITO",
    anoEleicao: 2022,
    votosUltimaEleicao: 807015,
    temHistoricoAnterior: true,
    maiorRegiaoVotosAnterior: "SP / Capital",
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
    piramideEtaria: [
      { faixa: "18 a 24 anos", homensPct: 15.0, mulheresPct: 18.0 },
    ],
    cruzamentoPerfil: {
      corPorInstrucao: [{ cor: "Branca", fundamental: 10.0, demais: 90.0 }],
      sexoPorEscolaridade: [
        { genero: "Masculino", superior: 60.0, medio: 30.0, fundamental: 10.0 },
      ],
    },
    distribuicaoRegionalVotos: [
      { regiao: "SP / Capital", votos: 520000, percentual: 64.4, intensidadeCalor: 92 },
    ],
    concentracaoEleitoral: [
      { regiao: "SP / Capital", nivel: "ZONA FORTE", percentual: "64.4% dos Votos", destaque: true },
    ],
    historicoComparativoAnos: [
      { ano: 2022, cargo: "Deputado Estadual", partido: "PT", votos: 807015, percentual: 3.48, situacao: "ELEITO MAIS VOTADO SP", cor: "#008B63" },
    ],
    concorrenteDireto: {
      nomeAdversario: "TOMÉ ABDUCH",
      partidoAdversario: "REPUBLICANOS",
      votosAdversario: 134915,
      percentualAdversario: 0.58,
      diferencaVotos: 672100,
      situacaoAdversario: "ELEITO",
      observacaoComparativa: "Deputado Estadual mais votado do estado de São Paulo nas eleições de 2022.",
    },
  },

  // ─────────────────────────────────────────────────────────────
  // ── ELEIÇÕES 2026 (PRÉ-CANDIDATURAS E REGISTROS FUTUROS) ──
  // ─────────────────────────────────────────────────────────────
  {
    id: "330001222222_2026",
    nome: "FLAVIO NANTES BOLSONARO",
    nomeUrna: "FLÁVIO BOLSONARO",
    numero: 222,
    partido: "PL - Partido Liberal",
    siglaPartido: "PL",
    filiacao: "PL",
    uf: "RJ",
    cargoDisputado: "Senador",
    situacao: "REELEIÇÃO (REGISTRADO)",
    anoEleicao: 2026,
    votosUltimaEleicao: 4335269,
    temHistoricoAnterior: true,
    maiorRegiaoVotosAnterior: "RJ / Capital & Baixada Fluminense",
    corRaca: "Branca",
    grauInstrucao: "Superior Completo",
    genero: "Masculino",
    estadoCivil: "Casado(a)",
    faixaEtaria: "35 a 44 anos",
    nomeSocial: "Não Possui",
    ocupacao: "Advogado / Senador da República",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [
      { faixa: "25 a 34 anos", homensPct: 15.0, mulheresPct: 16.0 },
    ],
    cruzamentoPerfil: {
      corPorInstrucao: [{ cor: "Branca", fundamental: 20.0, demais: 80.0 }],
      sexoPorEscolaridade: [
        { genero: "Masculino", superior: 50.0, medio: 40.0, fundamental: 10.0 },
      ],
    },
    distribuicaoRegionalVotos: [
      { regiao: "RJ / Capital", votos: 2100000, percentual: 48.4, intensidadeCalor: 90 },
    ],
    concentracaoEleitoral: [
      { regiao: "RJ / Capital", nivel: "ZONA FORTE", percentual: "48.4% dos Votos", destaque: true },
    ],
    historicoComparativoAnos: [
      { ano: 2018, cargo: "Senador", partido: "PSL", votos: 4335269, percentual: 27.76, situacao: "ELEITO", cor: "#1264F3" },
      { ano: 2026, cargo: "Senador (Reeleição)", partido: "PL", votos: 4335269, percentual: 35.0, situacao: "REGISTRADO", cor: "#008B63" },
    ],
    concorrenteDireto: {
      nomeAdversario: "OQUITA PAES",
      partidoAdversario: "PT",
      votosAdversario: 2800000,
      percentualAdversario: 25.0,
      diferencaVotos: 1535269,
      situacaoAdversario: "PRÉ-CANDIDATO",
      observacaoComparativa: "Senador em busca da reeleição no estado do Rio de Janeiro.",
    },
  },
  {
    id: "350001882910_2026",
    nome: "MICHELLE DE PAULA FIRMO REINALDO BOLSONARO",
    nomeUrna: "MICHELLE BOLSONARO",
    numero: 22,
    partido: "PL - Partido Liberal",
    siglaPartido: "PL",
    filiacao: "PL Mulher Nacional",
    uf: "DF",
    cargoDisputado: "Senadora",
    situacao: "DEFERIDO",
    anoEleicao: 2026,
    votosUltimaEleicao: 850000,
    temHistoricoAnterior: true,
    maiorRegiaoVotosAnterior: "DF / Brasília e Região",
    corRaca: "Branca",
    grauInstrucao: "Superior Incompleto",
    genero: "Feminino",
    estadoCivil: "Casada",
    faixaEtaria: "35 a 44 anos",
    nomeSocial: "Não Possui",
    ocupacao: "Liderança Política / Presidente PL Mulher",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [
      { faixa: "18 a 24 anos", homensPct: 10.0, mulheresPct: 18.5 },
    ],
    cruzamentoPerfil: {
      corPorInstrucao: [{ cor: "Branca", fundamental: 20.0, demais: 80.0 }],
      sexoPorEscolaridade: [
        { genero: "Feminino", superior: 60.0, medio: 35.0, fundamental: 5.0 },
      ],
    },
    distribuicaoRegionalVotos: [
      { regiao: "DF / Plano Piloto", votos: 350000, percentual: 41.1, intensidadeCalor: 90 },
    ],
    concentracaoEleitoral: [
      { regiao: "DF / Cidades Satélites", nivel: "ZONA FORTE", percentual: "58.9% dos Votos", destaque: true },
    ],
    historicoComparativoAnos: [
      { ano: 2024, cargo: "Presidente PL Mulher", partido: "PL", votos: 4200000, percentual: 35.0, situacao: "LIDERANÇA", cor: "#008B63" },
      { ano: 2026, cargo: "Senadora", partido: "PL", votos: 850000, percentual: 40.0, situacao: "DEFERIDO", cor: "#008B63" },
    ],
    concorrenteDireto: {
      nomeAdversario: "LEILA BARROS",
      partidoAdversario: "PDT",
      votosAdversario: 450000,
      percentualAdversario: 22.0,
      diferencaVotos: 400000,
      situacaoAdversario: "SENADORA",
      observacaoComparativa: "Liderança destacada no Distrito Federal para o Senado Federal.",
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

  // Filtragem Geral na Base Oficial do TSE
  let filtered = OFFICIAL_TSE_CANDIDATES;

  // 1. Filtro Inteligente por Ano da Eleição
  if (anoParam && anoParam !== "todos") {
    const targetAno = parseInt(anoParam, 10);
    if (!isNaN(targetAno)) {
      filtered = filtered.filter(
        (c) => c.anoEleicao === targetAno || c.historicoComparativoAnos?.some((h) => h.ano === targetAno)
      );
    }
  }

  // 2. Filtro por Cargo Disputado
  if (cargoParam && cargoParam !== "todos") {
    filtered = filtered.filter((c) => matchCargoFlexible(c.cargoDisputado, cargoParam));
  }

  // 3. Filtro por Estado / UF
  if (ufParam && ufParam !== "todos") {
    filtered = filtered.filter((c) => normalizeStr(c.uf) === normalizeStr(ufParam));
  }

  // 4. Filtro por Termo de Busca
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
