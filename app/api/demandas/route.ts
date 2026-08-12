import { NextResponse } from "next/server";

// Armazenamento em memória da API oficial de Demandas e Projetos
let globalDemandas: any[] = [
  {
    id: "dem-0104",
    code: "DEM-2026-0104",
    title: "Revitalização e Iluminação do Parque Linear Quintino",
    category: "Obras Públicas / Infraestrutura",
    description: "Solicitação para reforma completa, ampliação da iluminação LED e instalação de câmeras de monitoramento no Parque Linear.",
    priority: "Alta",
    channelOrigin: "Gabinete Virtual",
    regionId: "reg-01",
    municipio: "Rio de Janeiro / RJ",
    bairro: "Quintino Bocaiúva",
    address: "Rua Clarimundo de Melo, 1200",
    cep: "21380-000",
    responsible: "Ana Martins",
    team: "Equipe de Gestão de Projetos",
    status: "Em análise",
    receiptDate: "2026-07-10",
    analysisDeadline: "2026-07-25",
    applicantName: "Associação de Moradores de Quintino",
    applicantPhone: "(21) 98765-4321",
    applicantEmail: "contato@amquintino.org.br",
    files: ["memorial_descritivo.pdf", "planta_parque.dwg"],
    createdAt: "10/07/2026 14:30:00",
    criteria: {
      multDeliveries: true,
      needsTeam: true,
      hasTimeline: true,
      needsBudget: true,
      approvedByResponsible: true,
    },
    decision: "Aprovada para Projeto",
    technicalReport: "Demanda tecnicamente viável com impacto positivo para mais de 35.000 moradores da região de Quintino.",
  },
];

let globalProjetos: any[] = [];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const demanda = globalDemandas.find((d) => d.id === id || d.code === id);
    if (demanda) {
      return NextResponse.json({ demanda });
    }
    return NextResponse.json({ error: "Demanda não encontrada" }, { status: 404 });
  }

  return NextResponse.json({
    total: globalDemandas.length,
    demandas: globalDemandas,
    projetos: globalProjetos,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.type === "projeto") {
      const newProjeto = {
        ...body.projeto,
        id: body.projeto.id || `prj-${Date.now()}`,
        code: body.projeto.code || `PRJ-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString(),
      };
      // Evita duplicatas
      const existingIdx = globalProjetos.findIndex((p) => p.id === newProjeto.id);
      if (existingIdx >= 0) {
        globalProjetos[existingIdx] = newProjeto;
      } else {
        globalProjetos.unshift(newProjeto);
      }
      return NextResponse.json({ success: true, projeto: newProjeto });
    }

    const newDemanda = {
      ...body,
      id: body.id || `dem-${Date.now()}`,
      code: body.code || `DEM-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: body.createdAt || new Date().toLocaleString("pt-BR"),
    };

    const existingIdx = globalDemandas.findIndex((d) => d.id === newDemanda.id);
    if (existingIdx >= 0) {
      globalDemandas[existingIdx] = newDemanda;
    } else {
      globalDemandas.unshift(newDemanda);
    }

    return NextResponse.json({ success: true, demanda: newDemanda });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao salvar demanda/projeto" }, { status: 500 });
  }
}
