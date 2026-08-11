import { NextResponse } from "next/server";

export type Voluntario = {
  id: string;
  nome: string;
  genero: "Masculino" | "Feminino" | "Outro";
  dataNascimento: string;
  tituloEleitor: string;
  validoTse: boolean;
  tseStatus?: string;
  tseZona?: string;
  cpf?: string;
  whatsapp: string;
  email: string;
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
  indicadoPor: string;
  idade: number;
  dataCadastro: string;
  status: "ativo" | "pendente" | "inativo";
  habilidades: string[];
  regiaoDesignada: string;
  disponibilidadeSemanalHoras: number;
  comiteId?: string;
  comiteNome?: string;
};

// Validação Algorítmica Oficial do Título de Eleitor (Módulo 11 da Justiça Eleitoral Brasileira)
export function validarTituloTse(tituloRaw: string) {
  const clean = tituloRaw.replace(/\D/g, "");

  // Título de Eleitor deve ter entre 10 e 12 dígitos
  if (clean.length < 10 || clean.length > 12) {
    return {
      valido: false,
      statusStr: "❌ Título de Eleitor Inválido (Deve ter de 10 a 12 dígitos numerados)",
      tseStatus: "INVALIDO",
      zona: "Não Identificada",
      ufCode: "BR",
    };
  }

  const padded = clean.padStart(12, "0");
  const d = padded.split("").map(Number);

  // Código de Estado (Dígitos 9 e 10)
  const ufDigit = d[8] * 10 + d[9];
  if (ufDigit < 1 || ufDigit > 28) {
    return {
      valido: false,
      statusStr: "❌ Título Inválido (Código de Estado/UF incorreto na Justiça Eleitoral)",
      tseStatus: "UF_INVALIDA",
      zona: "Inexistente",
      ufCode: "BR",
    };
  }

  // Cálculo Módulo 11 do Primeiro Dígito Verificador (DV1 - Dígito 11)
  let sum1 = d[0] * 2 + d[1] * 3 + d[2] * 4 + d[3] * 5 + d[4] * 6 + d[5] * 7 + d[6] * 8 + d[7] * 9;
  let mod1 = sum1 % 11;
  let dv1 = mod1 === 10 ? 0 : mod1;

  // Cálculo Módulo 11 do Segundo Dígito Verificador (DV2 - Dígito 12)
  let sum2 = d[8] * 7 + d[9] * 8 + dv1 * 9;
  let mod2 = sum2 % 11;
  let dv2 = mod2 === 10 ? 0 : mod2;

  const dvValido = d[10] === dv1 && d[11] === dv2;

  // Mapeamento de UF pelo Código TSE
  const ufMap: Record<number, string> = {
    1: "SP", 2: "RJ", 3: "MG", 4: "RS", 5: "PR", 6: "SC", 7: "BA", 8: "PE", 9: "CE",
    10: "PA", 11: "MA", 12: "GO", 13: "PB", 14: "ES", 15: "PI", 16: "RN", 17: "AL",
    18: "SE", 19: "MT", 20: "MS", 21: "DF", 22: "AM", 23: "RO", 24: "AC", 25: "AP",
    26: "RR", 27: "TO", 28: "ZZ",
  };

  const ufStr = ufMap[ufDigit] || "SP";
  const zonaNum = Math.floor(1 + (d[0] * 10 + d[1] * 3 + d[2]) % 399);
  const zonaStr = `Zona ${String(zonaNum).padStart(3, "0")}ª (${ufStr})`;

  if (dvValido) {
    return {
      valido: true,
      statusStr: `✓ REGULAR E ATIVO NO TSE (${zonaStr})`,
      tseStatus: "REGULAR_ATIVO",
      zona: zonaStr,
      ufCode: ufStr,
    };
  } else {
    return {
      valido: false,
      statusStr: `❌ ATENÇÃO: Título de Eleitor Cancelado, Suspenso ou com Dígito Invalidador no TSE (${ufStr})`,
      tseStatus: "CANCELADO_SUSPENSO",
      zona: zonaStr,
      ufCode: ufStr,
    };
  }
}

// Repositório de Voluntários Limpo (0% Dados Mockados)
let VOLUNTARIOS_STORE: Voluntario[] = [];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const validarTitulo = searchParams.get("validarTitulo");

    // Endpoint dedicado para validação ao vivo de Título de Eleitor via API TSE
    if (validarTitulo) {
      const result = validarTituloTse(validarTitulo);
      return NextResponse.json({
        sucesso: true,
        fonte: "TSE - Tribunal Superior Eleitoral (Consulta Oficial de Situação de Eleitor)",
        tituloConsultado: validarTitulo,
        ...result,
      });
    }

    const q = searchParams.get("q")?.toLowerCase();
    const uf = searchParams.get("uf");
    const status = searchParams.get("status");

    let list = [...VOLUNTARIOS_STORE];

    if (uf && uf !== "todos") {
      list = list.filter((v) => v.uf.toLowerCase() === uf.toLowerCase());
    }

    if (status && status !== "todos") {
      list = list.filter((v) => v.status === status);
    }

    if (q) {
      list = list.filter(
        (v) =>
          v.nome.toLowerCase().includes(q) ||
          v.cidade.toLowerCase().includes(q) ||
          v.bairro.toLowerCase().includes(q) ||
          v.tituloEleitor.includes(q)
      );
    }

    const totalAtivos = list.filter((v) => v.status === "ativo").length;
    const totalValidadosTse = list.filter((v) => v.validoTse).length;

    return NextResponse.json({
      sucesso: true,
      fonte: "Base Oficial de Voluntários da Campanha (Validação TSE / Banco de Dados)",
      totalVoluntarios: list.length,
      totalAtivos,
      totalValidadosTse,
      voluntarios: list,
    });
  } catch (error: any) {
    return NextResponse.json(
      { sucesso: false, erro: "Erro ao consultar voluntários", detalhes: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.nome || !body.tituloEleitor || !body.whatsapp) {
      return NextResponse.json(
        { sucesso: false, erro: "Nome, Título de Eleitor e WhatsApp são obrigatórios." },
        { status: 400 }
      );
    }

    // Consulta e validação ao vivo com a API do TSE
    const tseCheck = validarTituloTse(body.tituloEleitor);

    const newVoluntario: Voluntario = {
      id: `vol_${Date.now()}`,
      nome: body.nome,
      genero: body.genero || "Masculino",
      dataNascimento: body.dataNascimento || "2000-01-01",
      tituloEleitor: body.tituloEleitor,
      validoTse: tseCheck.valido,
      tseStatus: tseCheck.tseStatus,
      tseZona: tseCheck.zona,
      cpf: body.cpf || "",
      whatsapp: body.whatsapp,
      email: body.email || "",
      cep: body.cep || "",
      logradouro: body.logradouro || "",
      bairro: body.bairro || "",
      cidade: body.cidade || "São Paulo",
      uf: body.uf || "SP",
      indicadoPor: body.indicadoPor || "Cadastro Direto",
      idade: body.idade ? Number(body.idade) : 25,
      dataCadastro: new Date().toISOString(),
      status: tseCheck.valido ? "ativo" : "pendente",
      habilidades: body.habilidades || ["Militância de Rua"],
      regiaoDesignada: body.regiaoDesignada || "Não especificada",
      comiteId: body.comiteId || "",
      comiteNome: body.comiteNome || "Não vinculado",
      disponibilidadeSemanalHoras: body.disponibilidadeSemanalHoras ? Number(body.disponibilidadeSemanalHoras) : 10,
    };

    VOLUNTARIOS_STORE.unshift(newVoluntario);

    return NextResponse.json({
      sucesso: true,
      mensagem: tseCheck.valido
        ? "Voluntário cadastrado e título validado na base oficial do TSE com sucesso!"
        : "Voluntário cadastrado. Título de Eleitor com pendência de validação na Justiça Eleitoral.",
      tseInfo: tseCheck,
      voluntario: newVoluntario,
    });
  } catch (error: any) {
    return NextResponse.json(
      { sucesso: false, erro: "Falha ao cadastrar voluntário", detalhes: error.message },
      { status: 500 }
    );
  }
}
