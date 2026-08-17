import { NextRequest, NextResponse } from "next/server";
import { ManagementContextService } from "@/lib/services/management-context-service";
import { createDemandaSchema } from "@/lib/domain/demandas-projetos-types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ contextId: string }> }
) {
  try {
    const { contextId } = await params;
    const body = await request.json();

    const validatedInput = createDemandaSchema.parse(body);
    const newDemanda = ManagementContextService.createDemanda(contextId, validatedInput);

    return NextResponse.json({
      success: true,
      message: "Demanda criada com sucesso!",
      demanda: newDemanda,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Dados inválidos para criação da demanda", message: error.message || error.errors },
      { status: 400 }
    );
  }
}
