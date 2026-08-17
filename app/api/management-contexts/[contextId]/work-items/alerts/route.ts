import { NextRequest, NextResponse } from "next/server";
import { ManagementContextService } from "@/lib/services/management-context-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ contextId: string }> }
) {
  try {
    const { contextId } = await params;
    const alerts = ManagementContextService.getAlerts(contextId);
    return NextResponse.json(alerts);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Falha ao carregar prazos e alertas", message: error.message },
      { status: 500 }
    );
  }
}
