import { NextRequest, NextResponse } from "next/server";
import { ManagementContextService } from "@/lib/services/management-context-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contextId: string }> }
) {
  try {
    const { contextId } = await params;
    const searchParams = request.nextUrl.searchParams;

    const filters = {
      search: searchParams.get("search") || undefined,
      type: searchParams.get("type") || undefined,
      status: searchParams.get("status") || undefined,
      priority: searchParams.get("priority") || undefined,
    };

    const summary = ManagementContextService.getExecutiveSummary(contextId, filters);
    return NextResponse.json(summary);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Falha ao buscar resumo executivo", message: error.message },
      { status: 500 }
    );
  }
}
