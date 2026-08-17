import { NextResponse } from "next/server";

export type NotificationRecord = {
  id: string;
  type: "agenda" | "tse" | "sistema" | "demanda";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
  dateISO?: string;
};

// Armazenamento em memória das notificações dinâmicas da API
let STORED_NOTIFICATIONS: NotificationRecord[] = [];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get("unread") === "true";

  // Busca dados em tempo real da API de Agenda e Notícias TSE para montar as notificações
  const notificationsMap = new Map<string, NotificationRecord>();

  // 1. Carrega notificações já armazenadas
  STORED_NOTIFICATIONS.forEach((n) => notificationsMap.set(n.id, n));

  // 2. Busca Eventos da Agenda do Candidato para HOJE e próximos dias (API /api/agenda)
  try {
    const origin = new URL(request.url).origin;
    const resAgenda = await fetch(`${origin}/api/agenda`, { cache: "no-store" });
    if (resAgenda.ok) {
      const dataAgenda = await resAgenda.json();
      if (dataAgenda.eventos && Array.isArray(dataAgenda.eventos)) {
        const todayStr = new Date().toISOString().slice(0, 10);
        
        dataAgenda.eventos.slice(0, 8).forEach((evt: any) => {
          const notifId = `notif_evt_${evt.id}`;
          if (!notificationsMap.has(notifId)) {
            const isToday = evt.dataInicio === todayStr || evt.dataCompleta === todayStr;
            const isCanceled = evt.status === "nao_realizado" || evt.status === "cancelado";

            notificationsMap.set(notifId, {
              id: notifId,
              type: "agenda",
              title: isCanceled
                ? `❌ Evento Cancelado: ${evt.titulo}`
                : isToday
                ? `🚨 ALERTA HOJE NA AGENDA: ${evt.titulo}`
                : `🗓️ Compromisso da Agenda: ${evt.titulo}`,
              message: `${evt.local ? `📍 ${evt.local} · ` : ""}⏰ ${evt.diaInteiro ? "Dia Inteiro" : `${evt.horaInicio || "09:00"} às ${evt.horaFim || "11:00"}`} (${evt.dataInicio || "Recorrente"})`,
              timestamp: isToday ? "HOJE" : evt.dataInicio || "Agendado",
              read: false,
              link: "/modulos?tab=agenda",
              dateISO: evt.dataInicio,
            });
          }
        });
      }
    }
  } catch (e) {
    console.warn("[NOTIFICACOES API]: Erro ao buscar agenda:", e);
  }

  // 3. Busca Boletins Oficiais do TSE (API /api/tre/noticias)
  try {
    const origin = new URL(request.url).origin;
    const resTse = await fetch(`${origin}/api/tre/noticias`, { cache: "no-store" });
    if (resTse.ok) {
      const dataTse = await resTse.json();
      if (dataTse.noticias && Array.isArray(dataTse.noticias)) {
        dataTse.noticias.slice(0, 5).forEach((noticia: any, idx: number) => {
          const notifId = `notif_tse_${noticia.id || idx}`;
          if (!notificationsMap.has(notifId)) {
            notificationsMap.set(notifId, {
              id: notifId,
              type: "tse",
              title: `🏛️ TSE 2026: ${noticia.titulo || "Boletim Oficial"}`,
              message: noticia.resumo || noticia.fonte || "Informativo oficial publicado pelo Tribunal Superior Eleitoral.",
              timestamp: noticia.dataPublicacao || "Recente",
              read: false,
              link: "/modulos?tab=tre",
            });
          }
        });
      }
    }
  } catch (e) {
    console.warn("[NOTIFICACOES API]: Erro ao buscar noticias TSE:", e);
  }

  // 4. Busca Demandas Recentes (API /api/demandas)
  try {
    const origin = new URL(request.url).origin;
    const resDemandas = await fetch(`${origin}/api/demandas`, { cache: "no-store" });
    if (resDemandas.ok) {
      const dataDemandas = await resDemandas.json();
      if (dataDemandas.demandas && Array.isArray(dataDemandas.demandas)) {
        dataDemandas.demandas.slice(0, 3).forEach((dem: any) => {
          const notifId = `notif_dem_${dem.id}`;
          if (!notificationsMap.has(notifId)) {
            notificationsMap.set(notifId, {
              id: notifId,
              type: "demanda",
              title: `📌 Demanda: ${dem.titulo}`,
              message: `Status: ${dem.status || "em andamento"} · Prioridade: ${dem.prioridade || "média"}.`,
              timestamp: dem.prazo ? `Prazo: ${dem.prazo}` : "Em andamento",
              read: false,
              link: "/modulos?tab=demandas",
            });
          }
        });
      }
    }
  } catch (e) {
    console.warn("[NOTIFICACOES API]: Erro ao buscar demandas:", e);
  }

  let list = Array.from(notificationsMap.values());
  if (unreadOnly) {
    list = list.filter((n) => !n.read);
  }

  // Atualiza o store em memória
  STORED_NOTIFICATIONS = list;

  return NextResponse.json({
    sucesso: true,
    total: list.length,
    naoLidas: list.filter((n) => !n.read).length,
    notificacoes: list,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Marcar como lida
    if (body.action === "mark_read" && body.id) {
      STORED_NOTIFICATIONS = STORED_NOTIFICATIONS.map((n) =>
        n.id === body.id ? { ...n, read: true } : n
      );
      return NextResponse.json({ sucesso: true, mensagem: "Notificação marcada como lida" });
    }

    // Marcar todas como lidas
    if (body.action === "mark_all_read") {
      STORED_NOTIFICATIONS = STORED_NOTIFICATIONS.map((n) => ({ ...n, read: true }));
      return NextResponse.json({ sucesso: true, mensagem: "Todas as notificações marcadas como lidas" });
    }

    // Criar nova notificação customizada via API
    if (body.title && body.message) {
      const newNotif: NotificationRecord = {
        id: `notif_custom_${Date.now()}`,
        type: body.type || "sistema",
        title: body.title,
        message: body.message,
        timestamp: "Agora",
        read: false,
        link: body.link,
      };
      STORED_NOTIFICATIONS.unshift(newNotif);
      return NextResponse.json({ sucesso: true, notificacao: newNotif });
    }

    return NextResponse.json({ sucesso: false, erro: "Ação não especificada" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ sucesso: false, erro: e.message }, { status: 500 });
  }
}
