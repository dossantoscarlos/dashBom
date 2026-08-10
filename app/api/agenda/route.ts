import { NextResponse } from "next/server";

export type CandidateEvent = {
  id: string;
  titulo: string;
  descricao: string;
  local: string;
  dataInicio: string; // YYYY-MM-DD
  diaInteiro: boolean;
  horaInicio?: string; // HH:MM
  horaFim?: string; // HH:MM
  recorrente: boolean;
  dataFim?: string; // YYYY-MM-DD
  diasSemana?: string[]; // ["segunda", "terca", ...]
  convidados: string[];
  googleSynced: boolean;
  googleCalendarId?: string;
  status: "confirmado" | "pendente" | "cancelado";
};

// Base mock inicial sincronizada com o Google Calendar do candidato (oficial)
let MOCK_AGENDA: CandidateEvent[] = [
  {
    id: "evt-01",
    titulo: "Caminhada e Panfletagem na Zona Norte",
    descricao: "Encontro com lideranças comunitárias e caminhada pelo comércio local.",
    local: "Av. Tucuruvi, 450 - São Paulo/SP",
    dataInicio: new Date().toISOString().slice(0, 10),
    diaInteiro: false,
    horaInicio: "09:00",
    horaFim: "12:00",
    recorrente: false,
    convidados: ["coordenacao@campanha.com.br", "imprensa@campanha.com.br"],
    googleSynced: true,
    googleCalendarId: "gcal_evt_101",
    status: "confirmado",
  },
  {
    id: "evt-02",
    titulo: "Reunião de Alinhamento Político de Coligação",
    descricao: "Alinhamento de metas eleitorais e estratégias de propaganda com deputados da bancada.",
    local: "Comitê Central - Sala de Reuniões 01",
    dataInicio: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    diaInteiro: false,
    horaInicio: "14:30",
    horaFim: "17:00",
    recorrente: true,
    dataFim: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
    diasSemana: ["segunda", "quarta"],
    convidados: ["deputados@coligacao.org.br"],
    googleSynced: true,
    googleCalendarId: "gcal_evt_102",
    status: "confirmado",
  },
  {
    id: "evt-03",
    titulo: "Debate de Propostas na Rádio Metropolitana",
    descricao: "Entrevista ao vivo na rádio sobre propostas de saúde e educação.",
    local: "Estúdio Rádio Metropolitana, Centro",
    dataInicio: new Date(Date.now() + 86400000 * 4).toISOString().slice(0, 10),
    diaInteiro: false,
    horaInicio: "10:00",
    horaFim: "11:30",
    recorrente: false,
    convidados: ["assessoria@candidato.com.br"],
    googleSynced: true,
    googleCalendarId: "gcal_evt_103",
    status: "confirmado",
  },
];

export async function GET() {
  try {
    return NextResponse.json({
      status: "sucesso",
      googleSynced: true,
      googleCalendarName: "Agenda Oficial do Candidato (Google Workspace)",
      eventos: MOCK_AGENDA,
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar agenda: " + String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.titulo || !body.dataInicio) {
      return NextResponse.json({ error: "Título e Data de Início são obrigatórios." }, { status: 400 });
    }

    const newEvent: CandidateEvent = {
      id: `evt-${Date.now()}`,
      titulo: body.titulo,
      descricao: body.descricao ?? "",
      local: body.local ?? "",
      dataInicio: body.dataInicio,
      diaInteiro: Boolean(body.diaInteiro),
      horaInicio: body.horaInicio ?? "08:00",
      horaFim: body.horaFim ?? "18:00",
      recorrente: Boolean(body.recorrente),
      dataFim: body.dataFim ?? "",
      diasSemana: body.diasSemana ?? [],
      convidados: Array.isArray(body.convidados)
        ? body.convidados
        : typeof body.convidados === "string" && body.convidados.trim() !== ""
        ? body.convidados.split(",").map((e: string) => e.trim())
        : [],
      googleSynced: true,
      googleCalendarId: `gcal_${Math.random().toString(36).substring(2, 9)}`,
      status: "confirmado",
    };

    MOCK_AGENDA.unshift(newEvent);

    return NextResponse.json({
      status: "sucesso",
      mensagem: "Evento criado e sincronizado com o Google Calendar com sucesso!",
      evento: newEvent,
    });
  } catch (error) {
    return NextResponse.json({ error: "Falha ao criar e sincronizar evento: " + String(error) }, { status: 500 });
  }
}
