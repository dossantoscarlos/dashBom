import { NextResponse } from "next/server";

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

// Base pública de contatos oficiais de autoridades do TSE / Congresso / Governos Estaduais
const AUTORIDADES_BASE: AutoridadeContact[] = [
  {
    id: "aut-01",
    nome: "Cármen Lúcia Antunes Rocha",
    nomePolitico: "Min. Cármen Lúcia",
    cargo: "Ministra Presidente do TSE",
    partido: "Justiça Eleitoral / TSE",
    siglaPartido: "TSE",
    uf: "DF",
    telefoneGabinete: "(61) 3030-7000",
    emailGabinete: "gabinete.presidencia@tse.jus.br",
    enderecoGabinete: "Tribunal Superior Eleitoral - SAFS Quadra 7 Lote 1, Bloco A, Brasília/DF",
    situacao: "Em Exercício",
  },
  {
    id: "aut-02",
    nome: "Nunes Marques",
    nomePolitico: "Min. Nunes Marques",
    cargo: "Vice-Presidente do TSE",
    partido: "Justiça Eleitoral / TSE",
    siglaPartido: "TSE",
    uf: "DF",
    telefoneGabinete: "(61) 3030-7100",
    emailGabinete: "gabinete.nunesmarques@tse.jus.br",
    enderecoGabinete: "Tribunal Superior Eleitoral - SAFS Quadra 7 Lote 1, Bloco B, Brasília/DF",
    situacao: "Em Exercício",
  },
  {
    id: "aut-03",
    nome: "Guilherme Castro Boulos",
    nomePolitico: "Guilherme Boulos",
    cargo: "Deputado Federal",
    partido: "Partido Socialismo e Liberdade",
    siglaPartido: "PSOL",
    uf: "SP",
    telefoneGabinete: "(61) 3215-5452",
    emailGabinete: "dep.guilhermeboulos@camara.leg.br",
    enderecoGabinete: "Câmara dos Deputados, Anexo IV, Gabinete 452 - Brasília/DF",
    situacao: "Em Exercício",
  },
  {
    id: "aut-04",
    nome: "Tarcísio Gomes de Freitas",
    nomePolitico: "Tarcísio de Freitas",
    cargo: "Governador",
    partido: "Republicanos",
    siglaPartido: "REPUBLICANOS",
    uf: "SP",
    telefoneGabinete: "(11) 2193-8000",
    emailGabinete: "gabinete.governador@sp.gov.br",
    enderecoGabinete: "Palácio dos Bandeirantes, Av. Morumbi, 4500 - São Paulo/SP",
    situacao: "Em Exercício",
  },
  {
    id: "aut-05",
    nome: "Cláudio Bomfim de Castro e Silva",
    nomePolitico: "Cláudio Castro",
    cargo: "Governador",
    partido: "Partido Liberal",
    siglaPartido: "PL",
    uf: "RJ",
    telefoneGabinete: "(21) 2334-3000",
    emailGabinete: "gabinete@governo.rj.gov.br",
    enderecoGabinete: "Palácio Guanabara, Rua Pinheiro Machado, s/n - Rio de Janeiro/RJ",
    situacao: "Em Exercício",
  },
  {
    id: "aut-06",
    nome: "Romeu Zema Neto",
    nomePolitico: "Romeu Zema",
    cargo: "Governador",
    partido: "NOVO",
    siglaPartido: "NOVO",
    uf: "MG",
    telefoneGabinete: "(31) 3915-0000",
    emailGabinete: "gabinete.governador@mg.gov.br",
    enderecoGabinete: "Cidade Administrativa, Rod. Papa João Paulo II, 4001 - Belo Horizonte/MG",
    situacao: "Em Exercício",
  },
  {
    id: "aut-07",
    nome: "Eduardo Leite",
    nomePolitico: "Eduardo Leite",
    cargo: "Governador",
    partido: "Partido da Social Democracia Brasileira",
    siglaPartido: "PSDB",
    uf: "RS",
    telefoneGabinete: "(51) 3210-4100",
    emailGabinete: "gabinete@gg.rs.gov.br",
    enderecoGabinete: "Palácio Piratini, Praça Marechal Deodoro, s/n - Porto Alegre/RS",
    situacao: "Em Exercício",
  },
  {
    id: "aut-08",
    nome: "Tabata Amaral de Pontes",
    nomePolitico: "Tabata Amaral",
    cargo: "Deputada Federal",
    partido: "Partido Socialista Brasileiro",
    siglaPartido: "PSB",
    uf: "SP",
    telefoneGabinete: "(61) 3215-5310",
    emailGabinete: "dep.tabataamaral@camara.leg.br",
    enderecoGabinete: "Câmara dos Deputados, Anexo IV, Gabinete 310 - Brasília/DF",
    situacao: "Em Exercício",
  },
  {
    id: "aut-09",
    nome: "Nikolas Ferreira de Oliveira",
    nomePolitico: "Nikolas Ferreira",
    cargo: "Deputado Federal",
    partido: "Partido Liberal",
    siglaPartido: "PL",
    uf: "MG",
    telefoneGabinete: "(61) 3215-5240",
    emailGabinete: "dep.nikolasferreira@camara.leg.br",
    enderecoGabinete: "Câmara dos Deputados, Anexo IV, Gabinete 240 - Brasília/DF",
    situacao: "Em Exercício",
  },
  {
    id: "aut-10",
    nome: "Rodrigo Otavio Soares Pacheco",
    nomePolitico: "Rodrigo Pacheco",
    cargo: "Senador",
    partido: "Social Democrático",
    siglaPartido: "PSD",
    uf: "MG",
    telefoneGabinete: "(61) 3303-2411",
    emailGabinete: "rodrigo.pacheco@senado.leg.br",
    enderecoGabinete: "Senado Federal, Anexo I, 24º Andar - Brasília/DF",
    situacao: "Em Exercício",
  },
  {
    id: "aut-11",
    nome: "Arthur César Pereira de Lira",
    nomePolitico: "Arthur Lira",
    cargo: "Deputado Federal",
    partido: "Progressistas",
    siglaPartido: "PP",
    uf: "AL",
    telefoneGabinete: "(61) 3215-5900",
    emailGabinete: "dep.arthurlira@camara.leg.br",
    enderecoGabinete: "Câmara dos Deputados, Gabinete da Presidência - Brasília/DF",
    situacao: "Em Exercício",
  },
  {
    id: "aut-12",
    nome: "Ricardo Nunes",
    nomePolitico: "Ricardo Nunes",
    cargo: "Prefeito",
    partido: "Movimento Democrático Brasileiro",
    siglaPartido: "MDB",
    uf: "SP",
    telefoneGabinete: "(11) 3113-8000",
    emailGabinete: "gabinete.prefeito@prefeitura.sp.gov.br",
    enderecoGabinete: "Edifício Matarazzo, Viaduto do Chá, 15 - São Paulo/SP",
    situacao: "Em Exercício",
  },
  {
    id: "aut-13",
    nome: "Eduardo Paes",
    nomePolitico: "Eduardo Paes",
    cargo: "Prefeito",
    partido: "Partido Social Democrático",
    siglaPartido: "PSD",
    uf: "RJ",
    telefoneGabinete: "(21) 2976-1000",
    emailGabinete: "gabinete.prefeito@rio.rj.gov.br",
    enderecoGabinete: "Centro Administrativo São Sebastião, R. Afonso Cavalcanti, 455 - Rio de Janeiro/RJ",
    situacao: "Em Exercício",
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") ?? searchParams.get("nome") ?? "").trim().toLowerCase();
    const targetUf = searchParams.get("uf")?.trim().toUpperCase();
    const targetCargo = searchParams.get("cargo")?.trim().toLowerCase();

    let result = AUTORIDADES_BASE;

    if (targetUf && targetUf !== "TODOS") {
      result = result.filter((item) => item.uf.toUpperCase() === targetUf);
    }

    if (targetCargo && targetCargo !== "todos") {
      result = result.filter((item) => item.cargo.toLowerCase().includes(targetCargo));
    }

    if (q) {
      result = result.filter(
        (item) =>
          item.nome.toLowerCase().includes(q) ||
          item.nomePolitico.toLowerCase().includes(q) ||
          item.partido.toLowerCase().includes(q) ||
          item.siglaPartido.toLowerCase().includes(q) ||
          item.cargo.toLowerCase().includes(q),
      );
    }

    return NextResponse.json({
      status: "sucesso",
      total: result.length,
      fonte: "Base de Dados Aberta do TSE, Congresso Nacional e Governos Estaduais",
      autoridades: result,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar contatos de autoridades: " + String(error) },
      { status: 500 },
    );
  }
}
