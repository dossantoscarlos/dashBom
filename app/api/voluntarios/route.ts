import { NextResponse } from "next/server";

export type Voluntario = {
  id: string;
  nome: string;
  genero: string;
  dataNascimento: string; // YYYY-MM-DD
  tituloEleitor: string;
  tseStatus: "REGULAR_ATIVO" | "CANCELADO" | "PENDENTE";
  tseZona?: string;
  tseSecao?: string;
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
  indicadoPor: string;
  idade: number;
  regiaoDesignada: string;
  comiteId: string;   // ID do comitê/local registrado no sistema
  comiteNome: string; // Nome do comitê para exibição
  dataCadastro: string;
};

// Base mock inicial de voluntários cadastrados
let MOCK_VOLUNTARIOS: Voluntario[] = [
  {
    id: "vol-01",
    nome: "Carlos Eduardo da Silva",
    genero: "Masculino",
    dataNascimento: `${new Date().getFullYear()-29}-${String(new Date().getMonth()+1).padStart(2,"0")}-${String(new Date().getDate()).padStart(2,"0")}`, // Aniversário hoje para demo
    tituloEleitor: "123456780199",
    tseStatus: "REGULAR_ATIVO",
    tseZona: "001ª ZONA ELEITORAL",
    tseSecao: "0142",
    cep: "01310-100",
    logradouro: "Av. Paulista, 1000",
    bairro: "Bela Vista",
    cidade: "São Paulo",
    uf: "SP",
    indicadoPor: "Vereador Marcos Souza",
    idade: 29,
    regiaoDesignada: "Zona Central",
    comiteId: "loc-1",
    comiteNome: "Comitê Central - Sede Principal",
    dataCadastro: "2026-08-01",
  },
  {
    id: "vol-02",
    nome: "Mariana Alencar Ribeiro",
    genero: "Feminino",
    dataNascimento: "1992-03-15",
    tituloEleitor: "987654320288",
    tseStatus: "REGULAR_ATIVO",
    tseZona: "258ª ZONA ELEITORAL",
    tseSecao: "0088",
    cep: "02012-000",
    logradouro: "Rua Voluntários da Pátria, 500",
    bairro: "Santana",
    cidade: "São Paulo",
    uf: "SP",
    indicadoPor: "Liderança Comunitária Dona Ana",
    idade: 34,
    regiaoDesignada: "Zona Norte",
    comiteId: "loc-2",
    comiteNome: "Comitê Zona Norte",
    dataCadastro: "2026-08-05",
  },
  {
    id: "vol-03",
    nome: "Roberto Mendes",
    genero: "Masculino",
    dataNascimento: "1984-11-22",
    tituloEleitor: "456789120377",
    tseStatus: "REGULAR_ATIVO",
    tseZona: "320ª ZONA ELEITORAL",
    tseSecao: "0210",
    cep: "04571-010",
    logradouro: "Av. Engenheiro Luís Carlos Berrini, 1200",
    bairro: "Brooklin",
    cidade: "São Paulo",
    uf: "SP",
    indicadoPor: "Coordenador Regional Pedro",
    idade: 42,
    regiaoDesignada: "Zona Sul",
    comiteId: "loc-3",
    comiteNome: "Comitê Zona Sul",
    dataCadastro: "2026-08-08",
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.toLowerCase();

    let list = MOCK_VOLUNTARIOS;
    if (q) {
      list = list.filter(
        (v) =>
          v.nome.toLowerCase().includes(q) ||
          v.tituloEleitor.includes(q) ||
          v.regiaoDesignada.toLowerCase().includes(q) ||
          v.indicadoPor.toLowerCase().includes(q) ||
          v.comiteNome.toLowerCase().includes(q),
      );
    }

    return NextResponse.json({
      status: "sucesso",
      total: list.length,
      voluntarios: list,
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao consultar voluntários: " + String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.nome || !body.tituloEleitor) {
      return NextResponse.json({ error: "Nome completo e Título de Eleitor são obrigatórios." }, { status: 400 });
    }

    // Validação mock com o TSE para verificar se eleitor está ativo
    const isTseValid = body.tituloEleitor.length >= 10 && !body.tituloEleitor.endsWith("00");

    const newVoluntario: Voluntario = {
      id: `vol-${Date.now()}`,
      nome: body.nome,
      genero: body.genero ?? "Não informado",
      dataNascimento: body.dataNascimento ?? "",
      tituloEleitor: body.tituloEleitor,
      tseStatus: isTseValid ? "REGULAR_ATIVO" : "CANCELADO",
      tseZona: `${Math.floor(Math.random() * 300 + 1)}ª ZONA ELEITORAL`,
      tseSecao: `0${Math.floor(Math.random() * 200 + 10)}`,
      cep: body.cep ?? "",
      logradouro: body.logradouro ?? "",
      bairro: body.bairro ?? "",
      cidade: body.cidade ?? "",
      uf: body.uf ?? "SP",
      indicadoPor: body.indicadoPor ?? "Inscrição Direta",
      idade: Number(body.idade) || 18,
      regiaoDesignada: body.regiaoDesignada ?? "Geral",
      comiteId: body.comiteId ?? "",
      comiteNome: body.comiteNome ?? "Não vinculado",
      dataCadastro: new Date().toISOString().slice(0, 10),
    };

    MOCK_VOLUNTARIOS.unshift(newVoluntario);

    return NextResponse.json({
      status: "sucesso",
      mensagem: "Voluntário cadastrado e validado junto à base da Justiça Eleitoral!",
      voluntario: newVoluntario,
    });
  } catch (error) {
    return NextResponse.json({ error: "Falha ao cadastrar voluntário: " + String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "ID do voluntário é obrigatório." }, { status: 400 });
    }

    const index = MOCK_VOLUNTARIOS.findIndex((v) => v.id === body.id);
    if (index === -1) {
      return NextResponse.json({ error: "Voluntário não encontrado." }, { status: 404 });
    }

    const isTseValid = body.tituloEleitor ? (!body.tituloEleitor.endsWith("00") && body.tituloEleitor.length >= 10) : true;

    MOCK_VOLUNTARIOS[index] = {
      ...MOCK_VOLUNTARIOS[index],
      nome: body.nome ?? MOCK_VOLUNTARIOS[index].nome,
      genero: body.genero ?? MOCK_VOLUNTARIOS[index].genero,
      dataNascimento: body.dataNascimento ?? MOCK_VOLUNTARIOS[index].dataNascimento,
      tituloEleitor: body.tituloEleitor ?? MOCK_VOLUNTARIOS[index].tituloEleitor,
      tseStatus: isTseValid ? "REGULAR_ATIVO" : "CANCELADO",
      cep: body.cep ?? MOCK_VOLUNTARIOS[index].cep,
      logradouro: body.logradouro ?? MOCK_VOLUNTARIOS[index].logradouro,
      bairro: body.bairro ?? MOCK_VOLUNTARIOS[index].bairro,
      cidade: body.cidade ?? MOCK_VOLUNTARIOS[index].cidade,
      uf: body.uf ?? MOCK_VOLUNTARIOS[index].uf,
      indicadoPor: body.indicadoPor ?? MOCK_VOLUNTARIOS[index].indicadoPor,
      idade: body.idade !== undefined ? Number(body.idade) : MOCK_VOLUNTARIOS[index].idade,
      regiaoDesignada: body.regiaoDesignada ?? MOCK_VOLUNTARIOS[index].regiaoDesignada,
      comiteId: body.comiteId ?? MOCK_VOLUNTARIOS[index].comiteId,
      comiteNome: body.comiteNome ?? MOCK_VOLUNTARIOS[index].comiteNome,
    };

    return NextResponse.json({
      status: "sucesso",
      mensagem: "Dados do voluntário atualizados com sucesso!",
      voluntario: MOCK_VOLUNTARIOS[index],
    });
  } catch (error) {
    return NextResponse.json({ error: "Falha ao atualizar voluntário: " + String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID do voluntário é obrigatório." }, { status: 400 });
    }

    const index = MOCK_VOLUNTARIOS.findIndex((v) => v.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Voluntário não encontrado." }, { status: 404 });
    }

    const removed = MOCK_VOLUNTARIOS.splice(index, 1);

    return NextResponse.json({
      status: "sucesso",
      mensagem: "Voluntário removido com sucesso!",
      voluntario: removed[0],
    });
  } catch (error) {
    return NextResponse.json({ error: "Falha ao excluir voluntário: " + String(error) }, { status: 500 });
  }
}

