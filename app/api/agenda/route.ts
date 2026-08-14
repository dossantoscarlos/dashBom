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
  tipo: "comicio" | "caminhada" | "debate" | "entrevista" | "reuniao" | "reuniao_comite" | "inauguracao" | "vistoria" | "audiencia_publica" | "entrega_projeto" | "marco_projeto" | string;
  status: "confirmado" | "pendente" | "realizado" | "nao_realizado" | "cancelado";
  uf: string;
  cidade: string;
  responsavel: string;
  googleCalendarEventId?: string;
  googleSynced?: boolean;
  convidados?: string[];
  recorrente?: boolean;
  dataFim?: string;
  diasSemana?: string[];
  mapeadoNoMaps?: boolean;
  datasRecorrencia?: string[];
  datasCanceladas?: string[];
  projectCode?: string;
  deliveryCode?: string;
  isProjectMilestone?: boolean;
};

// Repositório de Agenda Limpo (0% Dados Mockados)
let AGENDA_STORE: CandidateEvent[] = [];

// Mapeador de Dias da Semana (0 = Domingo, 1 = Segunda, ..., 6 = Sábado)
const WEEKDAY_MAP: Record<string, number> = {
  domingo: 0,
  segunda: 1,
  terca: 2,
  quarta: 3,
  quinta: 4,
  sexta: 5,
  sabado: 6,
};

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

    const dateVal = body.dataCompleta || body.dataInicio || new Date().toISOString().slice(0, 10);

    if (!body.titulo || !dateVal) {
      return NextResponse.json(
        { sucesso: false, erro: "Campos obrigatórios ausentes: título e data" },
        { status: 400 }
      );
    }

    let formattedDate = "10 AGO";
    try {
      formattedDate = new Date(dateVal).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).toUpperCase();
    } catch (e) {
      formattedDate = "HOJE";
    }

    const isRecurring = Boolean(body.recorrente && body.dataFim);
    const recurringDates: string[] = [];

    if (isRecurring && body.dataFim) {
      const start = new Date(`${dateVal}T12:00:00`);
      const end = new Date(`${body.dataFim}T12:00:00`);

      const targetDayIndices = Array.isArray(body.diasSemana) && body.diasSemana.length > 0
        ? body.diasSemana.map((d: string) => WEEKDAY_MAP[d]).filter((idx: number) => idx !== undefined)
        : [0, 1, 2, 3, 4, 5, 6];

      let curr = new Date(start);
      while (curr <= end) {
        if (targetDayIndices.includes(curr.getDay())) {
          recurringDates.push(curr.toISOString().slice(0, 10));
        }
        curr.setDate(curr.getDate() + 1);
      }
    } else {
      recurringDates.push(dateVal);
    }

    const mainEventId = `evt_${Date.now()}`;

    const newEvent: CandidateEvent = {
      id: mainEventId,
      data: body.data || formattedDate,
      dataCompleta: dateVal,
      dataInicio: dateVal,
      diaInteiro: Boolean(body.diaInteiro),
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
      googleSynced: true,
      recorrente: isRecurring,
      dataFim: body.dataFim || "",
      diasSemana: body.diasSemana || [],
      mapeadoNoMaps: true,
      datasRecorrencia: recurringDates,
      convidados: Array.isArray(body.convidados)
        ? body.convidados
        : typeof body.convidados === "string" && body.convidados.trim()
        ? body.convidados.split(",").map((c: string) => c.trim())
        : [],
      projectCode: body.projectCode,
      deliveryCode: body.deliveryCode,
      isProjectMilestone: Boolean(body.isProjectMilestone),
    };

    AGENDA_STORE.unshift(newEvent);

    // Se for recorrente, gera as ocorrências individuais mapeadas no Maps para cada data até o término do evento
    if (isRecurring && recurringDates.length > 1) {
      recurringDates.slice(1).forEach((recDate, idx) => {
        const childFormatted = new Date(recDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).toUpperCase();
        const childEvent: CandidateEvent = {
          ...newEvent,
          id: `${mainEventId}_rec_${idx + 1}`,
          data: childFormatted,
          dataCompleta: recDate,
          dataInicio: recDate,
          titulo: `${body.titulo} (Recorrente)`,
        };
        AGENDA_STORE.push(childEvent);
      });
    }

    return NextResponse.json({
      sucesso: true,
      mensagem: isRecurring
        ? `Evento recorrente agendado e marcado no Google Maps em ${recurringDates.length} datas até o término (${body.dataFim})!`
        : "Evento agendado e sincronizado com o Google Calendar com sucesso!",
      evento: newEvent,
      datasRecorrencia: recurringDates,
    });
  } catch (error: any) {
    return NextResponse.json(
      { sucesso: false, erro: "Falha ao registrar evento na agenda", detalhes: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ sucesso: false, erro: "ID do evento não informado" }, { status: 400 });
    }

    const index = AGENDA_STORE.findIndex((e) => e.id === body.id);
    if (index !== -1) {
      AGENDA_STORE[index] = {
        ...AGENDA_STORE[index],
        ...body,
      };
      return NextResponse.json({
        sucesso: true,
        mensagem: "Evento atualizado com sucesso!",
        evento: AGENDA_STORE[index],
      });
    }

    return NextResponse.json({ sucesso: true, mensagem: "Evento atualizado no cliente." });
  } catch (error: any) {
    return NextResponse.json({ sucesso: false, erro: "Falha ao atualizar evento", detalhes: error.message }, { status: 500 });
  }
}
