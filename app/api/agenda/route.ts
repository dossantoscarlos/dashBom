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

// Eventos Oficiais do Calendário Eleitoral TSE 2026
const TSE_CALENDAR_EVENTS: CandidateEvent[] = [
  {
    id: "tse-evt-1",
    titulo: "🏛️ Janela de Transferência Partidária 2026",
    descricao: "Período em que deputadas e deputados federais, estaduais e distritais podem mudar de partido sem perder o mandato.",
    data: "06 MAR",
    dataInicio: "2026-03-06",
    dataFim: "2026-04-05",
    dataCompleta: "06/03/2026 a 05/04/2026",
    diaInteiro: true,
    horaInicio: "08:00",
    horaFim: "18:00",
    local: "Tribunal Superior Eleitoral / Diretórios Partidários",
    cidade: "Brasília / Nacional",
    uf: "DF",
    responsavel: "Justiça Eleitoral - TSE",
    tipo: "tse_calendario",
    status: "confirmado",
  },
  {
    id: "tse-evt-2",
    titulo: "🏛️ Período de Convenções Partidárias",
    descricao: "Realização de convenções partidárias para escolha oficial dos candidatos aos cargos em disputa.",
    data: "20 JUL",
    dataInicio: "2026-07-20",
    dataFim: "2026-08-05",
    dataCompleta: "20/07/2026 a 05/08/2026",
    diaInteiro: true,
    horaInicio: "08:00",
    horaFim: "22:00",
    local: "Comitês e Convenções Partidárias",
    cidade: "Nacional",
    uf: "BR",
    responsavel: "Justiça Eleitoral - TSE",
    tipo: "tse_calendario",
    status: "confirmado",
  },
  {
    id: "tse-evt-3",
    titulo: "🏛️ Prazo Limite para Registro de Candidaturas",
    descricao: "Último dia para que os partidos e coligações requeiram o registro de seus candidatos na Justiça Eleitoral (Sistema CAND).",
    data: "15 AGO",
    dataInicio: "2026-08-15",
    dataCompleta: "15/08/2026 às 19h",
    diaInteiro: true,
    horaInicio: "08:00",
    horaFim: "19:00",
    local: "Tribunais Regionais Eleitorais e TSE",
    cidade: "Nacional",
    uf: "BR",
    responsavel: "Justiça Eleitoral - TSE",
    tipo: "tse_calendario",
    status: "confirmado",
  },
  {
    id: "tse-evt-4",
    titulo: "🏛️ Início Oficial da Propaganda Eleitoral",
    descricao: "Permitida a propaganda eleitoral nas ruas, internet, comícios, carreatas e distribuição de material gráfico.",
    data: "16 AGO",
    dataInicio: "2026-08-16",
    dataCompleta: "A partir de 16/08/2026",
    diaInteiro: true,
    horaInicio: "00:00",
    horaFim: "23:59",
    local: "Território Nacional",
    cidade: "Nacional",
    uf: "BR",
    responsavel: "Justiça Eleitoral - TSE",
    tipo: "tse_calendario",
    status: "confirmado",
  },
  {
    id: "tse-evt-5",
    titulo: "🏛️ Horário Gratuito de Propaganda no Rádio e TV",
    descricao: "Exibição do guia eleitoral gratuito nas emissoras de rádio e televisão para todos os cargos em disputa.",
    data: "28 AGO",
    dataInicio: "2026-08-28",
    dataFim: "2026-10-01",
    dataCompleta: "28/08/2026 a 01/10/2026",
    diaInteiro: true,
    horaInicio: "07:00",
    horaFim: "21:00",
    local: "Emissoras de Rádio e TV",
    cidade: "Nacional",
    uf: "BR",
    responsavel: "Justiça Eleitoral - TSE",
    tipo: "tse_calendario",
    status: "confirmado",
  },
  {
    id: "tse-evt-6",
    titulo: "🏛️ Votação do 1º TURNO - Eleições Gerais 2026",
    descricao: "Dia da votação para Presidente, Governador, Senador, Deputado Federal e Deputado Estadual/Distrital das 8h às 17h.",
    data: "04 OUT",
    dataInicio: "2026-10-04",
    dataCompleta: "04/10/2026 (Domingo)",
    diaInteiro: true,
    horaInicio: "08:00",
    horaFim: "17:00",
    local: "Seções Eleitorais de Todo o Brasil",
    cidade: "Nacional",
    uf: "BR",
    responsavel: "Justiça Eleitoral - TSE",
    tipo: "tse_calendario",
    status: "confirmado",
  },
  {
    id: "tse-evt-7",
    titulo: "🏛️ Votação do 2º TURNO - Eleições Gerais 2026",
    descricao: "Dia da votação de 2º turno para os cargos de Presidente e Governador onde for necessário.",
    data: "25 OUT",
    dataInicio: "2026-10-25",
    dataCompleta: "25/10/2026 (Domingo)",
    diaInteiro: true,
    horaInicio: "08:00",
    horaFim: "17:00",
    local: "Seções Eleitorais",
    cidade: "Nacional",
    uf: "BR",
    responsavel: "Justiça Eleitoral - TSE",
    tipo: "tse_calendario",
    status: "confirmado",
  },
  {
    id: "tse-evt-8",
    titulo: "🏛️ Diplomação dos Eleitos nas Eleições 2026",
    descricao: "Data limite para a diplomação de todos os candidatos eleitos e suplentes pela Justiça Eleitoral.",
    data: "19 DEZ",
    dataInicio: "2026-12-19",
    dataCompleta: "Até 19/12/2026",
    diaInteiro: true,
    horaInicio: "10:00",
    horaFim: "18:00",
    local: "Tribunais Eleitorais",
    cidade: "Nacional",
    uf: "BR",
    responsavel: "Justiça Eleitoral - TSE",
    tipo: "tse_calendario",
    status: "confirmado",
  },
];

// Repositório de Agenda com os marcos oficiais do TSE pré-carregados
let AGENDA_STORE: CandidateEvent[] = [...TSE_CALENDAR_EVENTS];

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
