import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  // Delega para a rota principal passando o id como query parameter
  const origin = new URL(request.url).origin;
  const res = await fetch(`${origin}/api/tre/candidatos?id=${id}`);
  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  return NextResponse.json(data);
}
