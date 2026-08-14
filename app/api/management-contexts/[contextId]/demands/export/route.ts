import { NextRequest, NextResponse } from "next/server";
import { ManagementContextService } from "@/lib/services/management-context-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ contextId: string }> }
) {
  try {
    const { contextId } = await params;
    const body = await request.json();
    const filters = body.filters || {};

    const data = ManagementContextService.getWorkItems(contextId, { ...filters, pageSize: 10000 });

    const header = "Código,Título,Tipo,Área Solicitante,Responsável,Prioridade,Situação,Progresso (%),Prazo\n";
    const rows = data.items
      .map(
        (i) =>
          `"${i.code}","${i.title.replace(/"/g, '""')}","${i.type}","${i.requestingArea.name}","${
            i.assignee?.name || "Sem responsável"
          }","${i.priority.label}","${i.status.label}","${i.progress.percentage}","${i.deadline || ""}"`
      )
      .join("\n");

    const csvContent = header + rows;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="demandas_projetos_export_${Date.now()}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Falha ao exportar registros", message: error.message },
      { status: 500 }
    );
  }
}
