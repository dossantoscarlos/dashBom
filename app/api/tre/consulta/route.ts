import { NextResponse } from "next/server";

const JAIR_BOLSONARO_DATA = {
  id: "280001618036",
  nome: "JAIR MESSIAS BOLSONARO",
  nomeUrna: "JAIR BOLSONARO",
  numero: 22,
  partido: "PL - Partido Liberal",
  siglaPartido: "PL",
  filiacao: "Pelo bem do Brasil",
  uf: "BRASIL",
  cargoDisputado: "Presidente",
  situacao: "DEFERIDO",
  anoEleicao: 2022,
  temHistoricoAnterior: true,
  votosUltimaEleicao: 87773,
  maiorRegiaoVotosAnterior: "BRASIL / Zona Central (33.354 votos - 38%)",
  distribuicaoRegionalVotos: [
    { regiao: "BRASIL / Zona Central", votos: 33354, percentual: 38.0, intensidadeCalor: 95 },
    { regiao: "BRASIL / Região Norte", votos: 13605, percentual: 15.5, intensidadeCalor: 50 },
    { regiao: "BRASIL / Região Sul", votos: 13605, percentual: 15.5, intensidadeCalor: 50 },
    { regiao: "BRASIL / Região Leste", votos: 13605, percentual: 15.5, intensidadeCalor: 50 },
    { regiao: "BRASIL / Região Oeste", votos: 13605, percentual: 15.5, intensidadeCalor: 50 },
  ],
  // Histórico Comparativo entre Anos (Eleições 2018 a 2026)
  historicoComparativoAnos: [
    { ano: 2018, cargo: "Presidente", partido: "PSL", votos: 57797847, percentual: 55.13, situacao: "ELEITO", cor: "#1264F3" },
    { ano: 2020, cargo: "Apoios Municipais", partido: "Aliança pelo Brasil", votos: 18450000, percentual: 34.2, situacao: "LIDERANÇA", cor: "#F59E0B" },
    { ano: 2022, cargo: "Presidente", partido: "PL", votos: 58206354, percentual: 49.10, situacao: "2º TURNO (DEFERIDO)", cor: "#008B63" },
    { ano: 2024, cargo: "Convenções Municipais", partido: "PL", votos: 28490000, percentual: 41.5, situacao: "BASE NACIONAL", cor: "#7928F5" },
    { ano: 2026, cargo: "Projeção / Registro", partido: "PL", votos: 59500000, percentual: 50.2, situacao: "REGISTRADO TSE", cor: "#38BDF8" },
  ],
  // 11 Atributos Demográficos conforme imagem oficial anexada
  corRaca: "Não informado",
  grauInstrucao: "Ensino Fundamental Completo",
  genero: "Feminino",
  estadoCivil: "Divorciado(a)",
  faixaEtaria: "60 anos ou mais",
  nomeSocial: "Não Possui",
  ocupacao: "Professor / Educador",
  orientacaoSexual: "Bissexual",
  identidadeGenero: "Transgênero",
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
      { cor: "Não informado", fundamental: 58.4, demais: 41.6 },
      { cor: "Demais Categorias", fundamental: 34.2, demais: 65.8 },
    ],
  },
  concentracaoEleitoral: [
    { regiao: "BRASIL / Zona Central", nivel: "ZONA FORTE", percentual: "38% dos Votos", destaque: true },
    { regiao: "BRASIL / Região Norte", nivel: "MÉDIA", percentual: "15.5% dos Votos", destaque: false },
    { regiao: "BRASIL / Região Sul", nivel: "MÉDIA", percentual: "15.5% dos Votos", destaque: false },
    { regiao: "BRASIL / Região Leste", nivel: "MÉDIA", percentual: "15.5% dos Votos", destaque: false },
    { regiao: "BRASIL / Região Oeste", nivel: "MÉDIA", percentual: "15.5% dos Votos", destaque: false },
  ],
};

const DEMO_CANDIDATES = [
  JAIR_BOLSONARO_DATA,
  {
    id: "280001607829",
    nome: "LUIZ INACIO LULA DA SILVA",
    nomeUrna: "LULA",
    numero: 13,
    partido: "PT - Partido dos Trabalhadores",
    siglaPartido: "PT",
    filiacao: "Brasil da Esperança",
    uf: "BRASIL",
    cargoDisputado: "Presidente",
    situacao: "DEFERIDO",
    anoEleicao: 2022,
    temHistoricoAnterior: true,
    votosUltimaEleicao: 60345999,
    maiorRegiaoVotosAnterior: "BRASIL / Região Nordeste",
    distribuicaoRegionalVotos: [
      { regiao: "BRASIL / Região Nordeste", votos: 21700000, percentual: 36.0, intensidadeCalor: 90 },
      { regiao: "BRASIL / Região Sudeste", votos: 22800000, percentual: 37.8, intensidadeCalor: 85 },
      { regiao: "BRASIL / Região Sul", votos: 6500000, percentual: 10.8, intensidadeCalor: 45 },
      { regiao: "BRASIL / Região Norte", votos: 4800000, percentual: 8.0, intensidadeCalor: 40 },
      { regiao: "BRASIL / Região Centro-Oeste", votos: 4545999, percentual: 7.4, intensidadeCalor: 38 },
    ],
    historicoComparativoAnos: [
      { ano: 2018, cargo: "Liderança Partidária", partido: "PT", votos: 44000000, percentual: 44.8, situacao: "INDISPONÍVEL", cor: "#EF4444" },
      { ano: 2020, cargo: "Apoios Municipais", partido: "PT", votos: 22500000, percentual: 38.0, situacao: "LIDERANÇA", cor: "#F59E0B" },
      { ano: 2022, cargo: "Presidente", partido: "PT", votos: 60345999, percentual: 50.90, situacao: "ELEITO", cor: "#008B63" },
      { ano: 2024, cargo: "Convenções Municipais", partido: "PT", votos: 31200000, percentual: 45.0, situacao: "BASE NACIONAL", cor: "#7928F5" },
      { ano: 2026, cargo: "Projeção / Registro", partido: "PT", votos: 61500000, percentual: 51.5, situacao: "REGISTRADO TSE", cor: "#38BDF8" },
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
    },
    concentracaoEleitoral: [
      { regiao: "BRASIL / Região Nordeste", nivel: "ZONA FORTE", percentual: "36.0% dos Votos", destaque: true },
      { regiao: "BRASIL / Região Sudeste", nivel: "ZONA FORTE", percentual: "37.8% dos Votos", destaque: true },
    ],
  },
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
    situacao: "DEFERIDO",
    anoEleicao: 2022,
    temHistoricoAnterior: true,
    votosUltimaEleicao: 13425375,
    maiorRegiaoVotosAnterior: "SP / Interior & RMC",
    distribuicaoRegionalVotos: [
      { regiao: "SP / Capital & Zona Central", votos: 4200000, percentual: 31.3, intensidadeCalor: 80 },
      { regiao: "SP / Região Metropolitana", votos: 3800000, percentual: 28.3, intensidadeCalor: 75 },
      { regiao: "SP / Vale do Paraíba", votos: 2400000, percentual: 17.9, intensidadeCalor: 60 },
      { regiao: "SP / Campinas & RMC", votos: 3025375, percentual: 22.5, intensidadeCalor: 68 },
    ],
    historicoComparativoAnos: [
      { ano: 2018, cargo: "Ministro de Estado", partido: "Independente", votos: 0, percentual: 0, situacao: "EXECUTIVO", cor: "#1264F3" },
      { ano: 2020, cargo: "Gestão Infraestrutura", partido: "Independente", votos: 0, percentual: 0, situacao: "EXECUTIVO", cor: "#F59E0B" },
      { ano: 2022, cargo: "Governador", partido: "REPUBLICANOS", votos: 13425375, percentual: 55.27, situacao: "ELEITO", cor: "#008B63" },
      { ano: 2024, cargo: "Apoios Municipais SP", partido: "REPUBLICANOS", votos: 8400000, percentual: 48.0, situacao: "LIDERANÇA ESTADUAL", cor: "#7928F5" },
      { ano: 2026, cargo: "Projeção / Registro", partido: "REPUBLICANOS", votos: 14200000, percentual: 58.0, situacao: "REGISTRADO TSE", cor: "#38BDF8" },
    ],
    corRaca: "Branca",
    grauInstrucao: "Superior Completo",
    genero: "Masculino",
    estadoCivil: "Casado(a)",
    faixaEtaria: "45 a 59 anos",
    nomeSocial: "Não Possui",
    ocupacao: "Engenheiro / Militar Reformado",
    orientacaoSexual: "Heterossexual",
    identidadeGenero: "Cisgênero",
    quilombola: "Não",
    piramideEtaria: [
      { faixa: "18 a 24 anos", homensPct: 8.0, mulheresPct: 8.8 },
      { faixa: "25 a 34 anos", homensPct: 14.5, mulheresPct: 15.1 },
      { faixa: "35 a 44 anos", homensPct: 14.0, mulheresPct: 14.8 },
      { faixa: "45 a 59 anos", homensPct: 12.0, mulheresPct: 12.8 },
      { faixa: "60 anos ou mais", homensPct: 9.5, mulheresPct: 10.5 },
    ],
    cruzamentoPerfil: {
      corPorInstrucao: [
        { cor: "Branca", fundamental: 25.0, demais: 75.0 },
      ],
    },
    concentracaoEleitoral: [
      { regiao: "SP / Capital & Zona Central", nivel: "ZONA FORTE", percentual: "31.3% dos Votos", destaque: true },
    ],
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? searchParams.get("nome") ?? "").trim().toLowerCase();

  let filtered = DEMO_CANDIDATES;

  if (q) {
    filtered = DEMO_CANDIDATES.filter(
      (c) =>
        c.nome.toLowerCase().includes(q) ||
        c.nomeUrna.toLowerCase().includes(q) ||
        c.partido.toLowerCase().includes(q) ||
        c.siglaPartido.toLowerCase().includes(q) ||
        String(c.numero).includes(q)
    );
    if (filtered.length === 0) {
      filtered = [JAIR_BOLSONARO_DATA];
    }
  }

  return NextResponse.json({
    fonte: "TSE - Tribunal Superior Eleitoral (Perfil Demográfico Oficial do Candidato e Eleitorado)",
    totalEncontrados: filtered.length,
    candidatos: filtered,
  });
}
