import { NextRequest, NextResponse } from "next/server";
import { ManagementContextService } from "@/lib/services/management-context-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ contextId: string }> }
) {
  try {
    const { contextId } = await params;
    const activities = ManagementContextService.getRecentActivities(contextId);
    return NextResponse.json(activities);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Falha ao carregar atividades recentes", message: error.message },
      { status: 500 }
    );
  }
}
