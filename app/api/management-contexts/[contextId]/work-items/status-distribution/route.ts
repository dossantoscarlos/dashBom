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
      type: searchParams.get("type") || undefined,
      priority: searchParams.get("priority") || undefined,
    };

    const distribution = ManagementContextService.getStatusDistribution(contextId, filters);
    return NextResponse.json(distribution);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Falha ao carregar distribuição de situação", message: error.message },
      { status: 500 }
    );
  }
}
