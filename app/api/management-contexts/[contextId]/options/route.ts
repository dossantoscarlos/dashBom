import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ contextId: string }> }
) {
  return NextResponse.json({
    requestingAreas: [
      { id: "area-infra", name: "Infraestrutura" },
      { id: "area-saude", name: "Saúde Pública" },
      { id: "area-educacao", name: "Educação" },
      { id: "area-meioambiente", name: "Meio Ambiente" },
      { id: "area-admin", name: "Administração" },
    ],
    eligibleAssignees: [
      { id: "user-ana", name: "Ana Martins" },
      { id: "user-[#0B5FEA]", name: "Carlos Santos" },
      { id: "user-marcos", name: "Marcos Lima" },
      { id: "user-fernanda", name: "Fernanda Costa" },
    ],
    projects: [
      { id: "prj-01", code: "PRJ-2026-0012", name: "Modernização Urbana 2026" },
      { id: "prj-02", code: "PRJ-2026-0042", name: "Reforma UBS Central" },
    ],
    workItemTypes: [
      { code: "demanda", label: "Demanda" },
      { code: "projeto", label: "Projeto" },
      { code: "iniciativa", label: "Iniciativa" },
      { code: "atividade", label: "Atividade" },
    ],
    priorities: [
      { code: "baixa", label: "Baixa" },
      { code: "media", label: "Média" },
      { code: "alta", label: "Alta" },
      { code: "urgente", label: "Urgente" },
    ],
    statuses: [
      { code: "recebida", label: "Aguardando Início" },
      { code: "triagem", label: "Triagem" },
      { code: "em_analise", label: "Em Análise" },
      { code: "em_execucao", label: "Em Execução" },
      { code: "concluida", label: "Concluído" },
      { code: "arquivada", label: "Arquivado" },
    ],
  });
}
