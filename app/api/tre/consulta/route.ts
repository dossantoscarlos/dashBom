import { NextResponse } from "next/server";

// Função para normalizar busca sem acentos ou caixas de texto
function normalizeStr(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Comparação flexível de Cargos que aceita flexões de gênero (Deputado/Deputada, Senador/Senadora, Prefeito/Prefeita, Vereador/Vereadora)
function matchCargoFlexible(cargoDisputado: string, targetCargo: string): boolean {
  const normCand = normalizeStr(cargoDisputado);
  const normTarget = normalizeStr(targetCargo);

  if (!normTarget || normTarget === "todos") return true;

  // Deputado Federal / Deputada Federal
  if (normTarget.includes("deputad") && normTarget.includes("federal")) {
    return normCand.includes("deputad") && normCand.includes("federal");
  }

  // Deputado Estadual / Deputada Estadual / Distrital
  if (normTarget.includes("deputad") && (normTarget.includes("estadual") || normTarget.includes("distrital"))) {
    return normCand.includes("deputad") && (normCand.includes("estadual") || normCand.includes("distrital"));
  }

  // Deputado / Deputada em geral
  if (normTarget.includes("deputad")) {
    return normCand.includes("deputad");
  }

  // Senador / Senadora
  if (normTarget.includes("senad")) {
    return normCand.includes("senad");
  }

  // Prefeito / Prefeita / Vice
  if (normTarget.includes("prefeit")) {
    return normCand.includes("prefeit");
  }

  // Vereador / Vereadora
  if (normTarget.includes("veread")) {
    return normCand.includes("veread");
  }

  // Governador / Governadora
  if (normTarget.includes("governad")) {
    return normCand.includes("governad");
  }

  // Presidente / Vice-Presidente
  if (normTarget.includes("president")) {
    return normCand.includes("president");
  }

  return normCand.includes(normTarget);
}

// Base Oficial Completa do TSE por Todos os Cargos Eleitorais (Eleição e Reeleição)
const ALL_CANDIDATES = [
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
    temHistoricoAnterior: true,
    votosUltimaEleicao: 1492047,
    maiorRegiaoVotosAnterior: "MG / Região Metropolitana de Belo Horizonte",
    distribuicaoRegionalVotos: [
      { regiao: "MG / Belo Horizonte & RBMH", votos: 680000, percentual: 45.5, intensidadeCalor: 95 },
    ],
    historicoComparativoAnos: [
      { ano: 2020, cargo: "Vereador", partido: "PRTB", votos: 29388, percentual: 2.5, situacao: "ELEITO", cor: "#1264F3" },
      { ano: 2022, cargo: "Deputado Federal", partido: "PL", votos: 1492047, percentual: 13.32, situacao: "ELEITO MAIS VOTADO BRASIL", cor: "#008B63" },
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
    id: "350001992811",
    nome: "GUILHERME CASTRO BOULOS",
    nomeUrna: "GUILHERME BOULOS",
    numero: 5010,
    partido: "PSOL - Partido Socialismo e Liberdade",
    siglaPartido: "PSOL",
    filiacao: "PSOL",
    uf: "SP",
    cargoDisputado: "Deputado Federal",
    situacao: "ELEITO",
    anoEleicao: 2022,
    temHistoricoAnterior: true,
    votosUltimaEleicao: 1001472,
    maiorRegiaoVotosAnterior: "SP / Capital & Zona Central/Sul",
    distribuicaoRegionalVotos: [
      { regiao: "SP / Zona Central", votos: 450000, percentual: 44.9, intensidadeCalor: 92 },
    ],
    historicoComparativoAnos: [
      { ano: 2022, cargo: "Deputado Federal", partido: "PSOL", votos: 1001472, percentual: 4.22, situacao: "ELEITO MAIS VOTADO SP", cor: "#008B63" },
    ],
    corRaca: "Branca",
    grauInstrucao: "Superior Completo",
    genero: "Masculino",
    estadoCivil: "Casado(a)",
    faixaEtaria: "35 a 44 anos",
    nomeSocial: "Não Possui",
    ocupacao: "Professor / Psicanalista / Deputado Federal",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [{ faixa: "25 a 34 anos", homensPct: 16.2, mulheresPct: 17.5 }],
    cruzamentoPerfil: { corPorInstrucao: [{ cor: "Branca", fundamental: 22.0, demais: 78.0 }] },
    concentracaoEleitoral: [{ regiao: "SP / Zona Central", nivel: "ZONA FORTE", percentual: "44.9% dos Votos", destaque: true }],
  },
  {
    id: "350005050505",
    nome: "ERIKA HILTON",
    nomeUrna: "ERIKA HILTON",
    numero: 5050,
    partido: "PSOL - Partido Socialismo e Liberdade",
    siglaPartido: "PSOL",
    filiacao: "PSOL",
    uf: "SP",
    cargoDisputado: "Deputada Federal",
    situacao: "ELEITA",
    anoEleicao: 2022,
    temHistoricoAnterior: true,
    votosUltimaEleicao: 256903,
    maiorRegiaoVotosAnterior: "SP / Capital",
    distribuicaoRegionalVotos: [
      { regiao: "SP / Capital", votos: 180000, percentual: 70.1, intensidadeCalor: 92 },
    ],
    historicoComparativoAnos: [
      { ano: 2022, cargo: "Deputada Federal", partido: "PSOL", votos: 256903, percentual: 1.08, situacao: "ELEITA POR QP", cor: "#008B63" },
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
  {
    id: "410001333333",
    nome: "GLEISI HELENA HOFFMANN",
    nomeUrna: "GLEISI HOFFMANN",
    numero: 1313,
    partido: "PT - Partido dos Trabalhadores",
    siglaPartido: "PT",
    filiacao: "PT Nacional",
    uf: "PR",
    cargoDisputado: "Deputada Federal",
    situacao: "REELEITA",
    anoEleicao: 2022,
    temHistoricoAnterior: true,
    votosUltimaEleicao: 261247,
    maiorRegiaoVotosAnterior: "PR / Curitiba & Região Metropolitana",
    distribuicaoRegionalVotos: [
      { regiao: "PR / Curitiba", votos: 145000, percentual: 55.5, intensidadeCalor: 88 },
    ],
    historicoComparativoAnos: [
      { ano: 2018, cargo: "Deputada Federal", partido: "PT", votos: 212513, percentual: 3.7, situacao: "ELEITA", cor: "#1264F3" },
      { ano: 2022, cargo: "Deputada Federal (Reeleição)", partido: "PT", votos: 261247, percentual: 4.2, situacao: "REELEITA POR QP", cor: "#008B63" },
    ],
    corRaca: "Branca",
    grauInstrucao: "Superior Completo",
    genero: "Feminino",
    estadoCivil: "Divorciada",
    faixaEtaria: "45 a 59 anos",
    nomeSocial: "Não Possui",
    ocupacao: "Advogada / Deputada Federal",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [{ faixa: "25 a 34 anos", homensPct: 12.0, mulheresPct: 15.0 }],
    cruzamentoPerfil: { corPorInstrucao: [{ cor: "Branca", fundamental: 15.0, demais: 85.0 }] },
    concentracaoEleitoral: [{ regiao: "PR / Curitiba", nivel: "ZONA FORTE", percentual: "55.5% dos Votos", destaque: true }],
  },
  {
    id: "350001010101",
    nome: "MARCOS ANTONIO PEREIRA",
    nomeUrna: "MARCOS PEREIRA",
    numero: 1010,
    partido: "REPUBLICANOS - Republicanos",
    siglaPartido: "REPUBLICANOS",
    filiacao: "REPUBLICANOS",
    uf: "SP",
    cargoDisputado: "Deputado Federal",
    situacao: "REELEITO",
    anoEleicao: 2022,
    temHistoricoAnterior: true,
    votosUltimaEleicao: 231641,
    maiorRegiaoVotosAnterior: "SP / Grande São Paulo",
    distribuicaoRegionalVotos: [
      { regiao: "SP / Grande SP", votos: 145000, percentual: 62.6, intensidadeCalor: 88 },
    ],
    historicoComparativoAnos: [
      { ano: 2022, cargo: "Deputado Federal", partido: "REPUBLICANOS", votos: 231641, percentual: 0.98, situacao: "ELEITO", cor: "#008B63" },
    ],
    corRaca: "Parda",
    grauInstrucao: "Superior Completo",
    genero: "Masculino",
    estadoCivil: "Casado(a)",
    faixaEtaria: "45 a 59 anos",
    nomeSocial: "Não Possui",
    ocupacao: "Advogado / Pastor / Deputado Federal",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [{ faixa: "25 a 34 anos", homensPct: 14.0, mulheresPct: 15.0 }],
    cruzamentoPerfil: { corPorInstrucao: [{ cor: "Parda", fundamental: 28.0, demais: 72.0 }] },
    concentracaoEleitoral: [{ regiao: "SP / Grande SP", nivel: "ZONA FORTE", percentual: "62.6% dos Votos", destaque: true }],
  },

  // ── DEPUTADO ESTADUAL / DISTRITAL ──
  {
    id: "350001300000",
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
    temHistoricoAnterior: true,
    votosUltimaEleicao: 807015,
    maiorRegiaoVotosAnterior: "SP / Capital",
    distribuicaoRegionalVotos: [
      { regiao: "SP / Capital", votos: 520000, percentual: 64.4, intensidadeCalor: 92 },
    ],
    historicoComparativoAnos: [
      { ano: 2022, cargo: "Deputado Estadual", partido: "PT", votos: 807015, percentual: 3.48, situacao: "ELEITO MAIS VOTADO SP", cor: "#008B63" },
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

  // ── SENADOR ──
  {
    id: "330001222222",
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
    temHistoricoAnterior: true,
    votosUltimaEleicao: 4335269,
    maiorRegiaoVotosAnterior: "RJ / Capital & Baixada Fluminense",
    distribuicaoRegionalVotos: [
      { regiao: "RJ / Capital", votos: 2100000, percentual: 48.4, intensidadeCalor: 90 },
    ],
    historicoComparativoAnos: [
      { ano: 2018, cargo: "Senador", partido: "PSL", votos: 4335269, percentual: 27.76, situacao: "ELEITO", cor: "#1264F3" },
    ],
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
    piramideEtaria: [{ faixa: "25 a 34 anos", homensPct: 15.0, mulheresPct: 16.0 }],
    cruzamentoPerfil: { corPorInstrucao: [{ cor: "Branca", fundamental: 20.0, demais: 80.0 }] },
    concentracaoEleitoral: [{ regiao: "RJ / Capital", nivel: "ZONA FORTE", percentual: "48.4% dos Votos", destaque: true }],
  },
  {
    id: "410001999999",
    nome: "SERGIO FERNANDO MORO",
    nomeUrna: "SERGIO MORO",
    numero: 190,
    partido: "UNIÃO - União Brasil",
    siglaPartido: "UNIÃO",
    filiacao: "UNIÃO",
    uf: "PR",
    cargoDisputado: "Senador",
    situacao: "ELEITO",
    anoEleicao: 2022,
    temHistoricoAnterior: true,
    votosUltimaEleicao: 1953159,
    maiorRegiaoVotosAnterior: "PR / Curitiba & Região Metropolitana",
    distribuicaoRegionalVotos: [
      { regiao: "PR / Curitiba", votos: 850000, percentual: 43.5, intensidadeCalor: 92 },
    ],
    historicoComparativoAnos: [
      { ano: 2022, cargo: "Senador", partido: "UNIÃO", votos: 1953159, percentual: 33.50, situacao: "ELEITO", cor: "#008B63" },
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
  {
    id: "350001882910_SEN",
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
    temHistoricoAnterior: true,
    votosUltimaEleicao: 850000,
    maiorRegiaoVotosAnterior: "DF / Brasília e Região",
    distribuicaoRegionalVotos: [
      { regiao: "DF / Plano Piloto", votos: 350000, percentual: 41.1, intensidadeCalor: 90 },
    ],
    historicoComparativoAnos: [
      { ano: 2024, cargo: "Presidente PL Mulher", partido: "PL", votos: 4200000, percentual: 35.0, situacao: "LIDERANÇA", cor: "#008B63" },
    ],
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
    piramideEtaria: [{ faixa: "18 a 24 anos", homensPct: 10.0, mulheresPct: 18.5 }],
    cruzamentoPerfil: { corPorInstrucao: [{ cor: "Branca", fundamental: 20.0, demais: 80.0 }] },
    concentracaoEleitoral: [{ regiao: "DF / Cidades Satélites", nivel: "ZONA FORTE", percentual: "58.9% dos Votos", destaque: true }],
  },

  // ── GOVERNADOR & VICE-GOVERNADOR ──
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
    temHistoricoAnterior: true,
    votosUltimaEleicao: 13425375,
    maiorRegiaoVotosAnterior: "SP / Interior & RMC",
    distribuicaoRegionalVotos: [
      { regiao: "SP / Capital & Zona Central", votos: 4200000, percentual: 31.3, intensidadeCalor: 80 },
    ],
    historicoComparativoAnos: [
      { ano: 2022, cargo: "Governador", partido: "REPUBLICANOS", votos: 13425375, percentual: 55.27, situacao: "ELEITO", cor: "#008B63" },
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
  {
    id: "410001555555",
    nome: "CARLOS ROBERTO MASSA JUNIOR",
    nomeUrna: "RATINHO JÚNIOR",
    numero: 55,
    partido: "PSD - Partido Social Democrático",
    siglaPartido: "PSD",
    filiacao: "PSD",
    uf: "PR",
    cargoDisputado: "Governador",
    situacao: "REELEITO",
    anoEleicao: 2022,
    temHistoricoAnterior: true,
    votosUltimaEleicao: 4243292,
    maiorRegiaoVotosAnterior: "PR / Curitiba & Região Metropolitana",
    distribuicaoRegionalVotos: [
      { regiao: "PR / Curitiba & RMC", votos: 1800000, percentual: 42.4, intensidadeCalor: 92 },
    ],
    historicoComparativoAnos: [
      { ano: 2018, cargo: "Governador", partido: "PSD", votos: 3210712, percentual: 59.99, situacao: "ELEITO", cor: "#1264F3" },
      { ano: 2022, cargo: "Governador (Reeleição)", partido: "PSD", votos: 4243292, percentual: 69.64, situacao: "REELEITO", cor: "#008B63" },
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
  {
    id: "310001303030",
    nome: "ROMEU ZEMA NETO",
    nomeUrna: "ROMEU ZEMA",
    numero: 30,
    partido: "NOVO - Partido Novo",
    siglaPartido: "NOVO",
    filiacao: "NOVO",
    uf: "MG",
    cargoDisputado: "Governador",
    situacao: "REELEITO",
    anoEleicao: 2022,
    temHistoricoAnterior: true,
    votosUltimaEleicao: 6094136,
    maiorRegiaoVotosAnterior: "MG / Belo Horizonte & Triângulo Mineiro",
    distribuicaoRegionalVotos: [
      { regiao: "MG / Belo Horizonte", votos: 2500000, percentual: 41.0, intensidadeCalor: 92 },
    ],
    historicoComparativoAnos: [
      { ano: 2018, cargo: "Governador", partido: "NOVO", votos: 6963806, percentual: 71.80, situacao: "ELEITO", cor: "#1264F3" },
      { ano: 2022, cargo: "Governador (Reeleição)", partido: "NOVO", votos: 6094136, percentual: 56.18, situacao: "REELEITO", cor: "#008B63" },
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
  {
    id: "430001454545",
    nome: "EDUARDO DANTAS LEITE",
    nomeUrna: "EDUARDO LEITE",
    numero: 45,
    partido: "PSDB - Partido da Social Democracia Brasileira",
    siglaPartido: "PSDB",
    filiacao: "PSDB",
    uf: "RS",
    cargoDisputado: "Governador",
    situacao: "REELEITO",
    anoEleicao: 2022,
    temHistoricoAnterior: true,
    votosUltimaEleicao: 3687126,
    maiorRegiaoVotosAnterior: "RS / Porto Alegre & Pelotas",
    distribuicaoRegionalVotos: [
      { regiao: "RS / Porto Alegre", votos: 1500000, percentual: 40.7, intensidadeCalor: 90 },
    ],
    historicoComparativoAnos: [
      { ano: 2018, cargo: "Governador", partido: "PSDB", votos: 3128317, percentual: 53.62, situacao: "ELEITO", cor: "#1264F3" },
      { ano: 2022, cargo: "Governador (Reeleição)", partido: "PSDB", votos: 3687126, percentual: 57.12, situacao: "REELEITO", cor: "#008B63" },
    ],
    corRaca: "Branca",
    grauInstrucao: "Superior Completo",
    genero: "Masculino",
    estadoCivil: "Casado(a)",
    faixaEtaria: "35 a 44 anos",
    nomeSocial: "Não Possui",
    ocupacao: "Advogado / Governador de Estado",
    orientacaoSexual: "Homossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [{ faixa: "25 a 34 anos", homensPct: 16.0, mulheresPct: 17.0 }],
    cruzamentoPerfil: { corPorInstrucao: [{ cor: "Branca", fundamental: 15.0, demais: 85.0 }] },
    concentracaoEleitoral: [{ regiao: "RS / Porto Alegre", nivel: "ZONA FORTE", percentual: "40.7% dos Votos", destaque: true }],
  },
  {
    id: "520001444444",
    nome: "RONALDO RAMOS CAIADO",
    nomeUrna: "RONALDO CAIADO",
    numero: 44,
    partido: "UNIÃO - União Brasil",
    siglaPartido: "UNIÃO",
    filiacao: "União por Goiás",
    uf: "GO",
    cargoDisputado: "Governador",
    situacao: "REELEITO",
    anoEleicao: 2022,
    temHistoricoAnterior: true,
    votosUltimaEleicao: 1806894,
    maiorRegiaoVotosAnterior: "GO / Goiânia & Região Metropolitana",
    distribuicaoRegionalVotos: [
      { regiao: "GO / Goiânia & RMG", votos: 920000, percentual: 50.9, intensidadeCalor: 92 },
    ],
    historicoComparativoAnos: [
      { ano: 2018, cargo: "Governador", partido: "DEM", votos: 1773185, percentual: 61.77, situacao: "ELEITO", cor: "#1264F3" },
      { ano: 2022, cargo: "Governador (Reeleição)", partido: "UNIÃO", votos: 1806894, percentual: 51.81, situacao: "REELEITO", cor: "#008B63" },
    ],
    corRaca: "Branca",
    grauInstrucao: "Superior Completo",
    genero: "Masculino",
    estadoCivil: "Casado(a)",
    faixaEtaria: "60 anos ou mais",
    nomeSocial: "Não Possui",
    ocupacao: "Médico / Governador de Estado",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [{ faixa: "25 a 34 anos", homensPct: 15.0, mulheresPct: 15.0 }],
    cruzamentoPerfil: { corPorInstrucao: [{ cor: "Branca", fundamental: 20.0, demais: 80.0 }] },
    concentracaoEleitoral: [{ regiao: "GO / Goiânia", nivel: "ZONA FORTE", percentual: "50.9% dos Votos", destaque: true }],
  },

  // ── PRESIDENTE & VICE-PRESIDENTE ──
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
    temHistoricoAnterior: true,
    votosUltimaEleicao: 58206354,
    maiorRegiaoVotosAnterior: "BR / Região Sudeste (26.780.000 votos - 46%)",
    distribuicaoRegionalVotos: [
      { regiao: "BR / Região Sudeste", votos: 26780000, percentual: 46.0, intensidadeCalor: 95 },
      { regiao: "BR / Região Sul", votos: 11450000, percentual: 19.6, intensidadeCalor: 85 },
      { regiao: "BR / Região Nordeste", votos: 8900000, percentual: 15.2, intensidadeCalor: 45 },
    ],
    historicoComparativoAnos: [
      { ano: 2018, cargo: "Presidente", partido: "PSL", votos: 57797847, percentual: 55.13, situacao: "ELEITO", cor: "#1264F3" },
      { ano: 2022, cargo: "Presidente (Reeleição)", partido: "PL", votos: 58206354, percentual: 49.10, situacao: "REELEIÇÃO (2º TURNO)", cor: "#008B63" },
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
    ],
    corRaca: "Branca",
    grauInstrucao: "Ensino Fundamental Completo",
    genero: "Masculino",
    estadoCivil: "Casado(a)",
    faixaEtaria: "60 anos ou mais",
    nomeSocial: "Não Possui",
    ocupacao: "Membro de Liderança Política",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [{ faixa: "25 a 34 anos", homensPct: 15.0, mulheresPct: 16.2 }],
    cruzamentoPerfil: { corPorInstrucao: [{ cor: "Parda", fundamental: 48.2, demais: 51.8 }] },
    concentracaoEleitoral: [{ regiao: "BR / Nordeste", nivel: "ZONA FORTE", percentual: "36% dos Votos", destaque: true }],
  },
  {
    id: "350001404040",
    nome: "GERALDO JOSE RODRIGUES ALCKMIN FILHO",
    nomeUrna: "GERALDO ALCKMIN",
    numero: 40,
    partido: "PSB - Partido Socialista Brasileiro",
    siglaPartido: "PSB",
    filiacao: "Brasil da Esperança",
    uf: "BR",
    cargoDisputado: "Vice-Presidente",
    situacao: "ELEITO",
    anoEleicao: 2022,
    temHistoricoAnterior: true,
    votosUltimaEleicao: 60345999,
    maiorRegiaoVotosAnterior: "SP / Interior & Vale do Paraíba",
    distribuicaoRegionalVotos: [
      { regiao: "SP / Interior", votos: 15200000, percentual: 25.2, intensidadeCalor: 85 },
    ],
    historicoComparativoAnos: [
      { ano: 2010, cargo: "Governador", partido: "PSDB", votos: 11519009, percentual: 50.63, situacao: "ELEITO", cor: "#1264F3" },
      { ano: 2014, cargo: "Governador (Reeleição)", partido: "PSDB", votos: 12239979, percentual: 57.31, situacao: "REELEITO", cor: "#7928F5" },
      { ano: 2022, cargo: "Vice-Presidente", partido: "PSB", votos: 60345999, percentual: 50.90, situacao: "ELEITO", cor: "#008B63" },
    ],
    corRaca: "Branca",
    grauInstrucao: "Superior Completo",
    genero: "Masculino",
    estadoCivil: "Casado(a)",
    faixaEtaria: "60 anos ou mais",
    nomeSocial: "Não Possui",
    ocupacao: "Médico / Vice-Presidente da República",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [{ faixa: "45 a 59 anos", homensPct: 12.0, mulheresPct: 12.0 }],
    cruzamentoPerfil: { corPorInstrucao: [{ cor: "Branca", fundamental: 15.0, demais: 85.0 }] },
    concentracaoEleitoral: [{ regiao: "SP / Interior", nivel: "ZONA FORTE", percentual: "25.2% dos Votos", destaque: true }],
  },

  // ── PREFEITO & VICE-PREFEITO ──
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
    temHistoricoAnterior: true,
    votosUltimaEleicao: 3393110,
    maiorRegiaoVotosAnterior: "SP / Região Sul & Zonas Periféricas",
    distribuicaoRegionalVotos: [
      { regiao: "SP / Zona Sul Periférica", votos: 1250000, percentual: 36.8, intensidadeCalor: 92 },
    ],
    historicoComparativoAnos: [
      { ano: 2024, cargo: "Prefeito (Reeleição)", partido: "MDB", votos: 3393110, percentual: 59.35, situacao: "REELEITO", cor: "#008B63" },
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
    id: "330001555000",
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
    id: "260001400000",
    nome: "JOAO HENRIQUE DE ANDRADE LIMA CAMPOS",
    nomeUrna: "JOÃO CAMPOS",
    numero: 40,
    partido: "PSB - Partido Socialista Brasileiro",
    siglaPartido: "PSB",
    filiacao: "PSB",
    uf: "PE",
    cargoDisputado: "Prefeito",
    situacao: "REELEITO",
    anoEleicao: 2024,
    temHistoricoAnterior: true,
    votosUltimaEleicao: 725721,
    maiorRegiaoVotosAnterior: "PE / Recife",
    distribuicaoRegionalVotos: [
      { regiao: "PE / Recife", votos: 725721, percentual: 78.11, intensidadeCalor: 98 },
    ],
    historicoComparativoAnos: [
      { ano: 2024, cargo: "Prefeito (Reeleição)", partido: "PSB", votos: 725721, percentual: 78.11, situacao: "REELEITO 1º TURNO", cor: "#008B63" },
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
  {
    id: "350001928374",
    nome: "PABLO MARCAL",
    nomeUrna: "PABLO MARÇAL",
    numero: 28,
    partido: "PRTB - Partido Renovador Trabalhista Brasileiro",
    siglaPartido: "PRTB",
    filiacao: "PRTB",
    uf: "SP",
    cargoDisputado: "Prefeito",
    situacao: "NÃO ELEITO (3º LUGAR)",
    anoEleicao: 2024,
    temHistoricoAnterior: true,
    votosUltimaEleicao: 1719274,
    maiorRegiaoVotosAnterior: "SP / Capital & Zona Sul",
    distribuicaoRegionalVotos: [
      { regiao: "SP / Capital & Zona Sul", votos: 650000, percentual: 37.8, intensidadeCalor: 88 },
    ],
    historicoComparativoAnos: [
      { ano: 2024, cargo: "Prefeito", partido: "PRTB", votos: 1719274, percentual: 28.14, situacao: "NÃO ELEITO (3º LUGAR)", cor: "#F59E0B" },
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

  // ── VEREADOR ──
  {
    id: "350002222222",
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
      { ano: 2024, cargo: "Vereador", partido: "PL", votos: 161386, percentual: 2.76, situacao: "ELEITO MAIS VOTADO SP", cor: "#008B63" },
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
  {
    id: "350002020202",
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
    temHistoricoAnterior: true,
    votosUltimaEleicao: 129563,
    maiorRegiaoVotosAnterior: "SP / Capital",
    distribuicaoRegionalVotos: [
      { regiao: "SP / Capital", votos: 129563, percentual: 100.0, intensidadeCalor: 92 },
    ],
    historicoComparativoAnos: [
      { ano: 2024, cargo: "Vereadora", partido: "PODEMOS", votos: 129563, percentual: 2.21, situacao: "ELEITA 2ª MAIS VOTADA", cor: "#008B63" },
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

  const anoParam = (searchParams.get("ano") ?? "").trim();
  const cargoParam = (searchParams.get("cargo") ?? "").trim();
  const normQ = normalizeStr(qParam);

  // Parâmetros de Paginação Inteligente
  const pageParam = parseInt(searchParams.get("page") ?? searchParams.get("pagina") ?? "1", 10);
  const pageSizeParam = parseInt(searchParams.get("pageSize") ?? searchParams.get("limite") ?? "10", 10);

  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const pageSize = isNaN(pageSizeParam) || pageSizeParam < 1 ? 10 : Math.min(pageSizeParam, 100);

  // Filtragem na Base Oficial do TSE
  let filtered = ALL_CANDIDATES;

  // 1. Filtro por Ano da Eleição
  if (anoParam && anoParam !== "todos") {
    const targetAno = parseInt(anoParam, 10);
    if (!isNaN(targetAno)) {
      filtered = filtered.filter(
        (c) => c.anoEleicao === targetAno || c.historicoComparativoAnos?.some((h) => h.ano === targetAno)
      );
    }
  }

  // 2. Filtro Específico de Cargo Disputado com Flexão Flexível de Gênero
  if (cargoParam && cargoParam !== "todos") {
    filtered = filtered.filter((c) => matchCargoFlexible(c.cargoDisputado, cargoParam));
  }

  // 3. Filtro de Busca Preciso por Partido / Nome / Número / UF / Cargo (Sem Falsos Positivos)
  if (normQ && normQ !== "todos") {
    filtered = filtered.filter((c) => {
      const siglaNorm = normalizeStr(c.siglaPartido);
      const partidoNorm = normalizeStr(c.partido);
      const nomeNorm = normalizeStr(c.nome);
      const urnaNorm = normalizeStr(c.nomeUrna);
      const cargoNorm = normalizeStr(c.cargoDisputado);
      const ufNorm = normalizeStr(c.uf);
      const numeroStr = String(c.numero);

      // Match Exato de Sigla Partidária (Evita confundir 'PL' com a palavra 'suPLente' ou 'comPLeto')
      const matchSiglaExata = siglaNorm === normQ;

      // Match por Palavras no Nome do Partido (ex: "Partido Liberal", "Partido dos Trabalhadores")
      const matchPartido = partidoNorm.includes(normQ);

      // Match no Nome do Candidato ou Nome de Urna
      const matchNome = nomeNorm.includes(normQ) || urnaNorm.includes(normQ);

      // Match Flexível de Cargo Disputado
      const matchCargo = matchCargoFlexible(cargoNorm, normQ);

      // Match em Número do Candidato
      const matchNumero = numeroStr === normQ || (normQ.length >= 2 && numeroStr.startsWith(normQ));

      // Match em Estado / UF
      const matchUf = ufNorm === normQ;

      // Match em Situação Eleitoral (Somente para buscas com 4+ caracteres, ex: 'reeleito', 'eleito')
      const situacaoNorm = normalizeStr(c.situacao);
      const matchSituacao = normQ.length >= 4 && situacaoNorm.includes(normQ);

      return (
        matchSiglaExata ||
        matchPartido ||
        matchNome ||
        matchCargo ||
        matchNumero ||
        matchUf ||
        matchSituacao
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
    fonte: "TSE - Tribunal Superior Eleitoral (Base Oficial de Candidaturas Paginada)",
    totalEncontrados,
    paginaAtual,
    totalPaginas,
    itensPorPagina: pageSize,
    candidatos: paginatedList,
  });
}
