import { NextRequest, NextResponse } from "next/server";
import { ManagementContextService } from "@/lib/services/management-context-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ contextId: string; demandId: string }> }
) {
  try {
    const { contextId, demandId } = await params;
    const body = await request.json();

    if (body.action === "convert") {
      const project = ManagementContextService.convertToProject(contextId, demandId);
      return NextResponse.json({
        success: true,
        message: "Demanda convertida em Projeto com sucesso!",
        project,
      });
    }

    const { newStatus, technicalReport } = body;
    const updated = ManagementContextService.transitionStatus(
      contextId,
      demandId,
      newStatus,
      technicalReport
    );

    return NextResponse.json({
      success: true,
      message: `Situação alterada para '${updated.status.label}'`,
      demanda: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao atualizar fluxo transacional", message: error.message },
      { status: 400 }
    );
  }
}
