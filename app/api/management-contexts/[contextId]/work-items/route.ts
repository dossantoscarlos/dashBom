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
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      type: searchParams.get("type") || undefined,
      status: searchParams.get("status") || undefined,
      priority: searchParams.get("priority") || undefined,
      requestingAreaId: searchParams.get("requestingAreaId") || undefined,
      assigneeId: searchParams.get("assigneeId") || undefined,
      projectId: searchParams.get("projectId") || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1,
      pageSize: searchParams.get("pageSize") ? parseInt(searchParams.get("pageSize")!, 10) : 25,
      sortBy: (searchParams.get("sortBy") as any) || "createdAt",
      sortDirection: (searchParams.get("sortDirection") as any) || "desc",
      view: (searchParams.get("view") as any) || "overview",
    };

    const response = ManagementContextService.getWorkItems(contextId, filters);
    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Falha ao carregar listagem de demandas e projetos", message: error.message },
      { status: 500 }
    );
  }
}
