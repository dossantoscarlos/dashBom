import type { TRECandidate } from "./types";

export const treCandidates: TRECandidate[] = [
  {
    id: "tre-1",
    nome: "Roberto Almeida Ferreira",
    nomeUrna: "ROBERTO FERREIRA",
    numero: 45,
    partido: "Partido da Renovação Democrática",
    siglaPartido: "PRD",
    cargo: "Deputado Federal",
    uf: "SP",
    municipio: "São Paulo",
    situacao: "deferido",
    votos: 187432,
    intencaoVoto: 28.5,
    genero: "Masculino",
    ocupacao: "Advogado",
    coligacao: "SP pelo Futuro",
    grauInstrucao: "Superior completo",
    dataNascimento: "1978-03-15",
    bensDeclarados: 485000,
  },
  {
    id: "tre-2",
    nome: "Helena Martins Costa",
    nomeUrna: "HELENA COSTA",
    numero: 13,
    partido: "Partido do Trabalho Popular",
    siglaPartido: "PTP",
    cargo: "Deputado Federal",
    uf: "SP",
    municipio: "São Paulo",
    situacao: "deferido",
    votos: 156890,
    intencaoVoto: 24.2,
    genero: "Feminino",
    ocupacao: "Professora",
    coligacao: "Frente Popular SP",
    grauInstrucao: "Superior completo",
    dataNascimento: "1982-11-22",
    bensDeclarados: 210000,
  },
  {
    id: "tre-3",
    nome: "Carlos Eduardo Souza",
    nomeUrna: "CARLOS SOUZA",
    numero: 22,
    partido: "Partido Liberal Conservador",
    siglaPartido: "PLC",
    cargo: "Deputado Federal",
    uf: "SP",
    municipio: "São Paulo",
    situacao: "deferido",
    votos: 134567,
    intencaoVoto: 19.8,
    genero: "Masculino",
    ocupacao: "Empresário",
    coligacao: "União pelo Brasil",
  },
  {
    id: "tre-4",
    nome: "Fernanda Lima Rocha",
    nomeUrna: "FERNANDA ROCHA",
    numero: 55,
    partido: "Partido Verde Social",
    siglaPartido: "PVS",
    cargo: "Deputado Federal",
    uf: "SP",
    municipio: "São Paulo",
    situacao: "deferido",
    votos: 89234,
    intencaoVoto: 12.1,
    genero: "Feminino",
    ocupacao: "Médica",
    coligacao: "SP Sustentável",
  },
  {
    id: "tre-5",
    nome: "Marcos Antônio Vieira",
    nomeUrna: "MARCOS VIEIRA",
    numero: 77,
    partido: "Partido Democrático Nacional",
    siglaPartido: "PDN",
    cargo: "Deputado Federal",
    uf: "SP",
    municipio: "São Paulo",
    situacao: "deferido",
    votos: 67890,
    intencaoVoto: 8.4,
    genero: "Masculino",
    ocupacao: "Servidor Público",
    coligacao: "Frente Popular SP",
  },
  {
    id: "tre-6",
    nome: "Juliana Pereira Santos",
    nomeUrna: "JULIANA SANTOS",
    numero: 40,
    partido: "Partido da Renovação Democrática",
    siglaPartido: "PRD",
    cargo: "Deputado Estadual",
    uf: "SP",
    municipio: "Campinas",
    situacao: "deferido",
    votos: 45678,
    intencaoVoto: 15.3,
    genero: "Feminino",
    ocupacao: "Engenheira",
    coligacao: "SP pelo Futuro",
  },
];

export function searchCandidates(params: {
  nome?: string;
  uf?: string;
  cargo?: string;
  partido?: string;
}): TRECandidate[] {
  return treCandidates.filter((c) => {
    if (params.nome) {
      const q = params.nome.toLowerCase();
      if (
        !c.nome.toLowerCase().includes(q) &&
        !c.nomeUrna.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (params.uf && c.uf !== params.uf) return false;
    if (params.cargo && !c.cargo.toLowerCase().includes(params.cargo.toLowerCase()))
      return false;
    if (
      params.partido &&
      !c.siglaPartido.toLowerCase().includes(params.partido.toLowerCase()) &&
      !c.partido.toLowerCase().includes(params.partido.toLowerCase())
    ) {
      return false;
    }
    return true;
  });
}
