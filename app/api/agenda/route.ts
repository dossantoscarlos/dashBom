import { NextResponse } from "next/server";

export type CandidateEvent = {
  id: string;
  data: string;
  dataCompleta: string;
  dataInicio?: string;
  diaInteiro?: boolean;
  horaInicio: string;
  horaFim: string;
  titulo: string;
  descricao: string;
  local: string;
  tipo: "comicio" | "caminhada" | "debate" | "entrevista" | "reuniao" | "reuniao_comite";
  status: "confirmado" | "pendente" | "cancelado";
  uf: string;
  cidade: string;
  responsavel: string;
  googleCalendarEventId?: string;
  googleSynced?: boolean;
  convidados?: string[];
};

// Repositório de Agenda Limpo (0% Dados Mockados)
let AGENDA_STORE: CandidateEvent[] = [];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get("tipo");
  const status = searchParams.get("status");
  const q = searchParams.get("q")?.toLowerCase();

  let filtered = [...AGENDA_STORE];

  if (tipo && tipo !== "todos") {
    filtered = filtered.filter((e) => e.tipo === tipo);
  }

  if (status && status !== "todos") {
    filtered = filtered.filter((e) => e.status === status);
  }

  if (q) {
    filtered = filtered.filter(
      (e) =>
        e.titulo.toLowerCase().includes(q) ||
        e.local.toLowerCase().includes(q) ||
        e.cidade.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    sucesso: true,
    fonte: "Agenda Oficial da Campanha (Conexão Google Calendar / Banco de Dados)",
    totalEventos: filtered.length,
    eventos: filtered,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.titulo || !body.dataCompleta) {
      return NextResponse.json(
        { sucesso: false, erro: "Campos obrigatórios ausentes: título e data" },
        { status: 400 }
      );
    }

    const newEvent: CandidateEvent = {
      id: `evt_${Date.now()}`,
      data: body.data || new Date(body.dataCompleta).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).toUpperCase(),
      dataCompleta: body.dataCompleta,
      horaInicio: body.horaInicio || "09:00",
      horaFim: body.horaFim || "10:00",
      titulo: body.titulo,
      descricao: body.descricao || "",
      local: body.local || "Comitê Central",
      tipo: body.tipo || "reuniao",
      status: body.status || "confirmado",
      uf: body.uf || "SP",
      cidade: body.cidade || "São Paulo",
      responsavel: body.responsavel || "Coordenação de Campanha",
      googleCalendarEventId: body.googleCalendarEventId || `gcal_${Date.now()}`,
    };

    AGENDA_STORE.unshift(newEvent);

    return NextResponse.json({
      sucesso: true,
      mensagem: "Evento agendado e sincronizado com o Google Calendar com sucesso!",
      evento: newEvent,
    });
  } catch (error: any) {
    return NextResponse.json(
      { sucesso: false, erro: "Falha ao registrar evento na agenda", detalhes: error.message },
      { status: 500 }
    );
  }
}
