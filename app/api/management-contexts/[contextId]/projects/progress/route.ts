import { NextRequest, NextResponse } from "next/server";
import { ManagementContextService } from "@/lib/services/management-context-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ contextId: string }> }
) {
  try {
    const { contextId } = await params;
    const progress = ManagementContextService.getProjectProgress(contextId);
    return NextResponse.json(progress);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Falha ao carregar progresso dos projetos", message: error.message },
      { status: 500 }
    );
  }
}
