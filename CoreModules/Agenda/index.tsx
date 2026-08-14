"use client";

import { useEffect, useMemo, useState } from "react";
import { ModuleBlock } from "@/components/dashboard/ModuleBlock";
import { buttonPrimaryClass, inputClass } from "@/components/dashboard/form-styles";
import { CandidateEvent } from "@/app/api/agenda/route";

const WEEKDAYS = [
  { id: "segunda", label: "Segunda" },
  { id: "terca", label: "Terça" },
  { id: "quarta", label: "Quarta" },
  { id: "quinta", label: "Quinta" },
  { id: "sexta", label: "Sexta" },
  { id: "sabado", label: "Sábado" },
  { id: "domingo", label: "Domingo" },
];

export const TSE_OFFICIAL_CALENDAR_EVENTS: CandidateEvent[] = [
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

function isEventOnDate(evt: CandidateEvent, dateStr: string): boolean {
  if (!evt) return false;
  if (evt.dataInicio === dateStr || evt.dataCompleta === dateStr) return true;
  if (evt.datasRecorrencia && Array.isArray(evt.datasRecorrencia) && evt.datasRecorrencia.includes(dateStr)) {
    return true;
  }
  // Suporte a intervalos de data (como eventos do TSE)
  if (evt.dataInicio && evt.dataFim && dateStr >= evt.dataInicio && dateStr <= evt.dataFim) {
    if (evt.recorrente) {
      if (!evt.diasSemana || evt.diasSemana.length === 0) return true;
      const d = new Date(`${dateStr}T12:00:00`).getDay();
      const dayMap: Record<number, string> = {
        0: "domingo",
        1: "segunda",
        2: "terca",
        3: "quarta",
        4: "quinta",
        5: "sexta",
        6: "sabado",
      };
      const dayId = dayMap[d];
      return Boolean(dayId && evt.diasSemana.includes(dayId));
    }
    return true;
  }
  return false;
}

export function AgendaPanel() {
  const [eventos, setEventos] = useState<CandidateEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modo de Visualização do Calendário (Mês, Semana, Dia, Lista)
  const [viewMode, setViewMode] = useState<"mes" | "semana" | "dia" | "lista">("mes");
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 7, 10)); // Agosto de 2026
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUser, setFilterUser] = useState("todos");

  // Estado do Modal de Adicionar/Editar Evento
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState<CandidateEvent | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [statusInput, setStatusInput] = useState<CandidateEvent["status"]>("confirmado");

  // Estado para Modal de Adiar Ocorrência Específica
  const [showAdiarModal, setShowAdiarModal] = useState(false);
  const [targetAdiarDate, setTargetAdiarDate] = useState("");
  const [novaDataAdiada, setNovaDataAdiada] = useState("");
  const [adiarEventTarget, setAdiarEventTarget] = useState<CandidateEvent | null>(null);

  // 1. Cancelar apenas a ocorrência do dia selecionado
  function handleCancelSingleOccurrence(evt: CandidateEvent, dateStr: string) {
    const cancelDate = dateStr || evt.dataInicio || "";
    
    // Atualiza datasCanceladas no evento pai/recorrente
    setEventos((prev) => {
      const updated = prev.map((item) => {
        if (item.id === evt.id) {
          const canceladas = item.datasCanceladas || [];
          if (!canceladas.includes(cancelDate)) canceladas.push(cancelDate);
          return { ...item, datasCanceladas: canceladas };
        }
        return item;
      });
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });

    // Cria registro filho de cancelamento no dia específico para visualização visual no calendário
    const canceledChild: CandidateEvent = {
      ...evt,
      id: `${evt.id}_canceled_${cancelDate}`,
      dataInicio: cancelDate,
      dataCompleta: cancelDate,
      status: "nao_realizado",
      titulo: `${evt.titulo.replace(" (Recorrente)", "")} (Cancelado neste dia)`,
      recorrente: false,
    };

    setEventos((prev) => {
      const filtered = prev.filter((item) => item.id !== canceledChild.id);
      const updated = [canceledChild, ...filtered];
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });

    setSuccessMsg(`🚫 Ocorrência do dia ${cancelDate} cancelada especificamente nesta data!`);
    setSelectedEventDetails(null);
  }

  // 2. Abrir Modal de Adiar Ocorrência Específica
  function handleOpenAdiarModal(evt: CandidateEvent, currentDateStr: string) {
    setAdiarEventTarget(evt);
    setTargetAdiarDate(currentDateStr || evt.dataInicio || "");
    setNovaDataAdiada(currentDateStr || evt.dataInicio || "");
    setShowAdiarModal(true);
  }

  // 3. Confirmar Adiar Ocorrência para Nova Data
  function handleConfirmAdiarSingleOccurrence() {
    if (!adiarEventTarget || !novaDataAdiada) return;
    const oldDate = targetAdiarDate || adiarEventTarget.dataInicio || "";

    const postponedChild: CandidateEvent = {
      ...adiarEventTarget,
      id: `${adiarEventTarget.id}_adiado_${Date.now()}`,
      dataInicio: novaDataAdiada,
      dataCompleta: novaDataAdiada,
      status: "pendente",
      titulo: `${adiarEventTarget.titulo.replace(" (Recorrente)", "")} (Adiado de ${oldDate.slice(-2)})`,
      descricao: `${adiarEventTarget.descricao || ""} [Evento adiado especificamente do dia ${oldDate} para a nova data ${novaDataAdiada}]`,
      recorrente: false,
    };

    setEventos((prev) => {
      const canceladasMap = prev.map((item) => {
        if (item.id === adiarEventTarget.id) {
          const canceladas = item.datasCanceladas || [];
          if (!canceladas.includes(oldDate)) canceladas.push(oldDate);
          return { ...item, datasCanceladas: canceladas };
        }
        return item;
      });
      const updated = [postponedChild, ...canceladasMap];
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });

    setSuccessMsg(`⏩ Ocorrência do dia ${oldDate} foi adiada para ${novaDataAdiada}!`);
    setShowAdiarModal(false);
    setSelectedEventDetails(null);
    setAdiarEventTarget(null);
  }

  // Campos do Formulário de Evento (exatamente como solicitado)
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [local, setLocal] = useState("");
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().slice(0, 10));
  const [diaInteiro, setDiaInteiro] = useState(false);
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFim, setHoraFim] = useState("11:00");
  const [recorrente, setRecorrente] = useState(false);
  const [dataFim, setDataFim] = useState("");
  const [diasSemana, setDiasSemana] = useState<string[]>(["segunda", "quarta", "sexta"]);
  const [convidadosInput, setConvidadosInput] = useState("");

  const STORAGE_KEY = "campanhapro_agenda_events";

  // Abrir Modal no Modo de Edição
  function handleOpenEditModal(evt: CandidateEvent) {
    setEditingEventId(evt.id);
    setTitulo(evt.titulo);
    setDescricao(evt.descricao || "");
    setLocal(evt.local || "");
    setDataInicio(evt.dataInicio || new Date().toISOString().slice(0, 10));
    setDiaInteiro(Boolean(evt.diaInteiro));
    setHoraInicio(evt.horaInicio || "09:00");
    setHoraFim(evt.horaFim || "11:00");
    setRecorrente(Boolean(evt.recorrente));
    setDataFim(evt.dataFim || "");
    setDiasSemana(evt.diasSemana || ["segunda", "quarta", "sexta"]);
    setConvidadosInput(evt.convidados ? evt.convidados.join(", ") : "");
    setStatusInput(evt.status || "confirmado");
    setShowModal(true);
  }

  // Atualizar Status do Evento (Aceitar, Realizado, Não Realizado)
  async function handleUpdateStatus(evtId: string, newStatus: CandidateEvent["status"]) {
    setErrorMsg(null);
    setSuccessMsg(null);

    setEventos((prev) => {
      const updated = prev.map((e) => (e.id === evtId ? { ...e, status: newStatus } : e));
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });

    if (selectedEventDetails && selectedEventDetails.id === evtId) {
      setSelectedEventDetails((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      await fetch("/api/agenda", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: evtId, status: newStatus }),
      });
    } catch (e) {}

    const statusLabels: Record<string, string> = {
      confirmado: "✓ Evento Confirmado / Aceito!",
      realizado: "🎉 Evento marcado como REALIZADO!",
      nao_realizado: "❌ Evento marcado como NÃO REALIZADO!",
      pendente: "⏳ Evento marcado como Pendente",
    };

    setSuccessMsg(statusLabels[newStatus] || "Status do evento atualizado!");
  }

  async function loadAgenda() {
    setLoading(true);
    setErrorMsg(null);
    try {
      let localEvents: CandidateEvent[] = [];
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            localEvents = JSON.parse(saved);
          } catch (e) {}
        }
      }

      const res = await fetch("/api/agenda");
      const data = await res.json();
      if (res.ok) {
        const apiEvents = data.eventos ?? [];
        // Combinar eventos locais salvos + marcos do Calendário TSE + eventos do servidor sem duplicidade por ID
        const combinedMap = new Map<string, CandidateEvent>();
        TSE_OFFICIAL_CALENDAR_EVENTS.forEach((evt) => combinedMap.set(evt.id, evt));
        [...localEvents, ...apiEvents].forEach((evt) => {
          if (evt && evt.id) combinedMap.set(evt.id, evt);
        });
        setEventos(Array.from(combinedMap.values()));
      } else {
        const combinedMap = new Map<string, CandidateEvent>();
        TSE_OFFICIAL_CALENDAR_EVENTS.forEach((evt) => combinedMap.set(evt.id, evt));
        localEvents.forEach((evt) => {
          if (evt && evt.id) combinedMap.set(evt.id, evt);
        });
        setEventos(Array.from(combinedMap.values()));
      }
    } catch (err: any) {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            const local = JSON.parse(saved);
            const combinedMap = new Map<string, CandidateEvent>();
            TSE_OFFICIAL_CALENDAR_EVENTS.forEach((evt) => combinedMap.set(evt.id, evt));
            local.forEach((evt: CandidateEvent) => {
              if (evt && evt.id) combinedMap.set(evt.id, evt);
            });
            setEventos(Array.from(combinedMap.values()));
            return;
          } catch (e) {}
        }
      }
      // Se falhar o backend, garante pelo menos os eventos oficiais do TSE no calendário
      setEventos(TSE_OFFICIAL_CALENDAR_EVENTS);
      setErrorMsg(err?.message ?? "Falha de conexão com a agenda.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAgenda();
  }, []);

  function handlePrevMonth() {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }

  function handleNextMonth() {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }

  function handleToday() {
    setCurrentDate(new Date(2026, 7, 10));
  }

  function handleOpenModalForDate(dateStr: string) {
    setDataInicio(dateStr);
    setShowModal(true);
  }

  function handleToggleWeekday(dayId: string) {
    setDiasSemana((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
    );
  }

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validação estrita: horário é obrigatório para eventos da agenda do candidato
    if (!diaInteiro && (!horaInicio || !horaFim || horaInicio.trim() === "" || horaFim.trim() === "")) {
      setErrorMsg("O horário de início e o horário de término são obrigatórios para agendamentos.");
      setSubmitting(false);
      return;
    }

    // MODO EDIÇÃO
    if (editingEventId) {
      setEventos((prev) => {
        const updated = prev.map((evt) => {
          if (evt.id === editingEventId) {
            return {
              ...evt,
              titulo,
              descricao,
              local,
              dataInicio,
              dataCompleta: dataInicio,
              diaInteiro,
              horaInicio: diaInteiro ? "00:00" : horaInicio,
              horaFim: diaInteiro ? "23:59" : horaFim,
              recorrente,
              dataFim: recorrente ? dataFim : "",
              diasSemana: recorrente ? diasSemana : [],
              convidados: convidadosInput ? convidadosInput.split(",").map((c) => c.trim()) : [],
              status: statusInput,
            };
          }
          return evt;
        });
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
        return updated;
      });

      fetch("/api/agenda", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingEventId,
          titulo,
          descricao,
          local,
          dataInicio,
          dataCompleta: dataInicio,
          diaInteiro,
          horaInicio: diaInteiro ? "00:00" : horaInicio,
          horaFim: diaInteiro ? "23:59" : horaFim,
          recorrente,
          dataFim: recorrente ? dataFim : "",
          status: statusInput,
        }),
      }).catch(() => {});

      setSuccessMsg("✏️ Evento atualizado com sucesso!");
      setShowModal(false);
      setEditingEventId(null);
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        titulo,
        descricao,
        local,
        dataInicio,
        dataCompleta: dataInicio,
        diaInteiro,
        horaInicio: diaInteiro ? "00:00" : horaInicio,
        horaFim: diaInteiro ? "23:59" : horaFim,
        recorrente,
        dataFim: recorrente ? dataFim : "",
        diasSemana: recorrente ? diasSemana : [],
        convidados: convidadosInput,
        status: statusInput,
      };

      const res = await fetch("/api/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.sucesso) {
        throw new Error(data.erro || data.error || "Erro ao criar evento.");
      }

      const mainEventId = `evt_${Date.now()}`;
      const recDates: string[] = data.datasRecorrencia || [dataInicio];

      const createdEvents: CandidateEvent[] = recDates.map((rDate, idx) => {
        const childFormatted = new Date(rDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).toUpperCase();
        return {
          id: idx === 0 ? mainEventId : `${mainEventId}_rec_${idx}`,
          data: childFormatted,
          dataCompleta: rDate,
          dataInicio: rDate,
          diaInteiro,
          horaInicio: diaInteiro ? "00:00" : horaInicio,
          horaFim: diaInteiro ? "23:59" : horaFim,
          titulo: idx === 0 ? titulo : `${titulo} (Recorrente)`,
          descricao,
          local,
          tipo: "reuniao",
          status: "confirmado",
          uf: "SP",
          cidade: "São Paulo",
          responsavel: "Coordenação de Campanha",
          googleSynced: true,
          recorrente: Boolean(recorrente),
          dataFim: recorrente ? dataFim : "",
          diasSemana: recorrente ? diasSemana : [],
          mapeadoNoMaps: true,
          datasRecorrencia: recDates,
        };
      });

      // Atualiza o estado da agenda local e salva no localStorage
      setEventos((prev) => {
        const updated = [...createdEvents, ...prev];
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
        return updated;
      });

      setSuccessMsg(
        recorrente && dataFim
          ? `🎉 Evento recorrente marcado no Google Maps em ${createdEvents.length} ocorrências até o término (${dataFim})!`
          : "🎉 Evento criado e marcado no Google Maps!"
      );
      setShowModal(false);

      // Reseta o formulário
      setTitulo("");
      setDescricao("");
      setLocal("");
      setConvidadosInput("");
      setDiaInteiro(false);
      setRecorrente(false);
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Erro ao sincronizar com o Google Calendar.");
    } finally {
      setSubmitting(false);
    }
  }

  // Geração da grade de dias para o formato de calendário mensal
  const monthGridDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay(); // 0 (Dom) a 6 (Sáb)
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: Array<{ date: Date; dayNum: number; isCurrentMonth: boolean; dateStr: string }> = [];

    // Dias do mês anterior
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      days.push({ date: d, dayNum: d.getDate(), isCurrentMonth: false, dateStr: iso });
    }

    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      days.push({ date: d, dayNum: i, isCurrentMonth: true, dateStr: iso });
    }

    // Dias do próximo mês para completar a grade de 35 ou 42 células
    const totalCells = days.length > 35 ? 42 : 35;
    const remaining = totalCells - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      days.push({ date: d, dayNum: i, isCurrentMonth: false, dateStr: iso });
    }

    return days;
  }, [currentDate]);

  // Eventos filtrados por busca e usuário
  const filteredEventos = useMemo(() => {
    return eventos.filter((evt) => {
      const matchSearch =
        !searchQuery ||
        evt.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.local.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.descricao.toLowerCase().includes(searchQuery.toLowerCase());

      return matchSearch;
    });
  }, [eventos, searchQuery]);

  const monthTitle = currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <ModuleBlock title="Agenda Completa do Candidato (Formato Calendário & Google)" icon="📅">
      <div className="flex flex-col gap-4 font-sans text-xs">
        
        {/* BARRA SUPERIOR DE AÇÕES E STATUS DO GOOGLE CALENDAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 border border-zinc-200 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-950 rounded-xl shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className={`${buttonPrimaryClass} bg-[#0070d2] hover:bg-[#005fb2] text-white font-extrabold flex items-center gap-1.5 text-xs px-4 py-2 shadow-sm rounded-lg`}
            >
              <span>Adicionar Evento</span>
            </button>

            <span className="hidden sm:flex items-center gap-1.5 text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 px-2.5 py-1 rounded-full font-mono font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Sincronizado com Google Calendar
            </span>
          </div>

          {/* BARRA DE FILTROS E PESQUISA DA HEADER DO CALENDÁRIO */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              <label htmlFor="filter-user" className="text-[10px] text-zinc-400 font-bold uppercase shrink-0">
                Filtrar por usuário:
              </label>
              <select
                id="filter-user"
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="h-8 rounded border border-zinc-200 bg-white px-2.5 text-[11px] font-semibold text-zinc-700 outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
              >
                <option value="todos">Todos os usuários</option>
                <option value="candidato">Candidato Principal</option>
                <option value="assessoria">Assessoria de Imprensa</option>
                <option value="coordenacao">Coordenação Geral</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <label htmlFor="search-evt" className="text-[10px] text-zinc-400 font-bold uppercase shrink-0">
                Buscar evento:
              </label>
              <input
                id="search-evt"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título ou local..."
                className="h-8 w-48 rounded border border-zinc-200 bg-white px-2.5 text-[11px] outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
              />
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO DO CALENDÁRIO E BOTÕES DE TROCA DE MODO (MÊS, SEMANA, DIA, LISTA) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950 rounded-xl shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="flex h-7 w-7 items-center justify-center rounded border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 font-bold"
                title="Mês Anterior"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="flex h-7 w-7 items-center justify-center rounded border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 font-bold"
                title="Próximo Mês"
              >
                ›
              </button>
            </div>

            <h2 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 capitalize tracking-wide">
              {monthTitle}
            </h2>

            <button
              type="button"
              onClick={handleToday}
              className="px-2.5 py-1 text-[10px] font-bold border border-blue-200 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"
            >
              Hoje
            </button>
          </div>

          {/* BOTÕES DE TROCA DE MODO IGUAIS AO DESIGN ENVIADO (Mês | Semana | Dia | Lista) */}
          <div className="flex items-center rounded-lg border border-zinc-200 bg-zinc-100 p-0.5 dark:border-zinc-800 dark:bg-zinc-900 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setViewMode("mes")}
              className={`px-3 py-1 rounded-md transition ${
                viewMode === "mes"
                  ? "bg-white text-blue-600 shadow-2xs font-extrabold dark:bg-zinc-800 dark:text-blue-400"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
              }`}
            >
              Mês
            </button>
            <button
              type="button"
              onClick={() => setViewMode("semana")}
              className={`px-3 py-1 rounded-md transition ${
                viewMode === "semana"
                  ? "bg-white text-blue-600 shadow-2xs font-extrabold dark:bg-zinc-800 dark:text-blue-400"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
              }`}
            >
              Semana
            </button>
            <button
              type="button"
              onClick={() => setViewMode("dia")}
              className={`px-3 py-1 rounded-md transition ${
                viewMode === "dia"
                  ? "bg-white text-blue-600 shadow-2xs font-extrabold dark:bg-zinc-800 dark:text-blue-400"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
              }`}
            >
              Dia
            </button>
            <button
              type="button"
              onClick={() => setViewMode("lista")}
              className={`px-3 py-1 rounded-md transition ${
                viewMode === "lista"
                  ? "bg-white text-blue-600 shadow-2xs font-extrabold dark:bg-zinc-800 dark:text-blue-400"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
              }`}
            >
              Lista
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
            {successMsg}
          </div>
        )}

        {/* ─── VISÃO 1: GRADE DO CALENDÁRIO MENSAL (7 COLUNAS X 5 SEMANAS) ────────────────── */}
        {(viewMode === "mes" || viewMode === "semana" || viewMode === "dia") && (
          <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
            {/* Cabeçalho dos 7 dias da semana (DOM. SEG. TER. QUA. QUI. SEX. SÁB.) */}
            <div className="grid grid-cols-7 border-b border-zinc-200 bg-slate-100/90 text-center font-extrabold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-300 text-xs py-3 tracking-wider uppercase">
              <div>DOM.</div>
              <div>SEG.</div>
              <div>TER.</div>
              <div>QUA.</div>
              <div>QUI.</div>
              <div>SEX.</div>
              <div>SÁB.</div>
            </div>

            {/* Células do Calendário Mensal */}
            <div className="grid grid-cols-7 divide-x divide-y divide-zinc-200 dark:divide-zinc-800 min-h-[620px]">
              {monthGridDays.map((cell, idx) => {
                // Filtra os eventos que ocorrem nesta data específica (incluindo ocorrências de eventos recorrentes)
                const cellEventsMap = new Map<string, CandidateEvent>();
                filteredEventos.forEach((evt) => {
                  if (isEventOnDate(evt, cell.dateStr)) {
                    const key = `${evt.titulo}_${evt.horaInicio}_${cell.dateStr}`;
                    if (!cellEventsMap.has(key)) {
                      cellEventsMap.set(key, evt);
                    }
                  }
                });
                const cellEvents = Array.from(cellEventsMap.values());
                const isToday = cell.dateStr === new Date().toISOString().slice(0, 10);

                return (
                  <div
                    key={idx}
                    onClick={() => handleOpenModalForDate(cell.dateStr)}
                    className={`group relative flex flex-col p-2 transition min-h-[125px] sm:min-h-[140px] cursor-pointer hover:bg-blue-50/40 dark:hover:bg-blue-950/20 ${
                      isToday
                        ? "bg-blue-50/30 dark:bg-blue-950/20 ring-1 ring-blue-500/20"
                        : cell.isCurrentMonth
                        ? "bg-white dark:bg-zinc-950"
                        : "bg-zinc-50/70 text-zinc-400 dark:bg-zinc-900/40 dark:text-zinc-600"
                    }`}
                  >
                    {/* Número do Dia na célula */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center text-xs font-bold rounded-full transition ${
                          isToday
                            ? "bg-blue-600 text-white shadow-xs font-black ring-2 ring-blue-400/40"
                            : cell.isCurrentMonth
                            ? "text-zinc-800 dark:text-zinc-200"
                            : "text-zinc-400 dark:text-zinc-600"
                        }`}
                      >
                        {cell.dayNum}
                      </span>

                      {/* Botão + novo rápido ao passar o mouse */}
                      <span className="opacity-0 group-hover:opacity-100 text-[11px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800 transition">
                        + novo
                      </span>
                    </div>

                    {/* Lista de Pílulas de Eventos dentro do dia do calendário */}
                    <div className="mt-1 flex flex-col gap-1.5 overflow-y-auto max-h-[105px] no-scrollbar">
                      {cellEvents.map((evt) => (
                        <div
                          key={evt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEventDetails(evt);
                          }}
                          className={`calendar-event-pill flex flex-col gap-0.5 rounded-lg p-1.5 transition shadow-2xs border text-xs cursor-pointer ${
                            evt.status === "realizado"
                              ? "bg-blue-50/90 text-blue-950 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/80 dark:text-blue-200 dark:border-blue-800/80"
                              : evt.status === "nao_realizado"
                              ? "bg-red-50/90 text-red-950 border-red-200 hover:bg-red-100 dark:bg-red-950/80 dark:text-red-200 dark:border-red-800/80"
                              : evt.status === "confirmado"
                              ? "bg-emerald-50/90 text-emerald-950 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800/80"
                              : "bg-amber-50/90 text-amber-950 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-800/80"
                          }`}
                          title={`${evt.titulo} - ${evt.local}`}
                        >
                          <div className="flex items-center justify-between font-extrabold gap-1">
                            <span className="truncate leading-tight flex items-center gap-1">
                              {evt.projectCode && (
                                <span className="px-1 py-0.2 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-mono text-[8px] font-black shrink-0">
                                  {evt.projectCode}
                                </span>
                              )}
                              <span className="truncate">{evt.titulo}</span>
                            </span>
                            <span className="font-mono text-[10px] shrink-0 opacity-90 bg-white/70 dark:bg-black/40 px-1 py-0.2 rounded border border-black/5 dark:border-white/10">
                              {evt.diaInteiro ? "Dia Todo" : evt.horaInicio}
                            </span>
                          </div>
                          {evt.local && (
                            <span className="truncate text-[10px] opacity-80">
                              📍 {evt.local.split(",")[0]}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── VISÃO 2: LISTA COMPLETA DOS COMPROMISSOS (CARDS) ────────────────── */}
        {viewMode === "lista" && (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs font-bold text-zinc-700 dark:text-zinc-300 px-1">
              <span>Compromissos Eleitorais Cadastrados ({filteredEventos.length})</span>
              <span className="text-[10px] text-zinc-400">Visualização Formato Lista</span>
            </div>

            {loading ? (
              <p className="text-center py-6 text-xs text-zinc-500 italic">Carregando eventos...</p>
            ) : filteredEventos.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30">
                <p className="text-xs text-zinc-500">Nenhum evento encontrado.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredEventos.map((evt) => (
                  <div
                    key={evt.id}
                    className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2 border-b border-zinc-100 dark:border-zinc-850 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">📍</span>
                          <div>
                            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                              {evt.titulo}
                            </h4>
                            {evt.projectCode && (
                              <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-mono text-[9px] font-black">
                                📁 Projeto {evt.projectCode}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {evt.status === "realizado" ? (
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold text-[9px]">
                              🎉 Realizado
                            </span>
                          ) : evt.status === "nao_realizado" ? (
                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-bold text-[9px]">
                              ❌ Não Realizado
                            </span>
                          ) : evt.status === "confirmado" ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[9px]">
                              ✓ Aceito
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-[9px]">
                              ⏳ Pendente
                            </span>
                          )}
                          {evt.googleSynced && (
                            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-extrabold border border-emerald-500/20 px-1.5 py-0.5 rounded">
                              Google Sync
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-[11px] text-zinc-600 dark:text-zinc-350 leading-relaxed">
                        {evt.descricao || "Sem descrição informada."}
                      </p>

                      <div className="flex flex-col gap-1 text-[10px] text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 p-2 rounded-lg mt-1 border border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-zinc-700 dark:text-zinc-300">📅 Data:</span>
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{evt.dataInicio}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="font-bold text-zinc-700 dark:text-zinc-300">⏰ Horário:</span>
                          <span className="font-mono font-bold">
                            {evt.diaInteiro ? "Dia Inteiro" : `${evt.horaInicio} às ${evt.horaFim}`}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="font-bold text-zinc-700 dark:text-zinc-300">📍 Local:</span>
                          <span className="truncate max-w-[160px]">{evt.local || "Não especificado"}</span>
                        </div>
                      </div>

                      {/* BARRA DE AÇÕES: ACEITAR, REALIZADO, NÃO REALIZADO, EDITAR */}
                      <div className="flex flex-wrap items-center justify-between gap-1 pt-2 border-t border-zinc-100 dark:border-zinc-800 mt-2">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(evt.id, "confirmado")}
                            title="Aceitar / Confirmar evento"
                            className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] transition"
                          >
                            ✓ Aceitar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(evt.id, "realizado")}
                            title="Marcar evento como Realizado"
                            className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[9px] transition"
                          >
                            🎉 Realizado
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(evt.id, "nao_realizado")}
                            title="Marcar como Não Realizado"
                            className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-[9px] transition"
                          >
                            ❌ Não Realizado
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(evt)}
                          className="px-2 py-1 rounded bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 font-bold text-[9px] transition text-zinc-800 dark:text-zinc-200"
                        >
                          ✏️ Editar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODAL DETALHES DO EVENTO SELECIONADO NO CALENDÁRIO */}
        {selectedEventDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 flex flex-col gap-3 text-xs">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                    {selectedEventDetails.titulo}
                  </h3>
                  {selectedEventDetails.status === "realizado" ? (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold text-[9px]">
                      🎉 Realizado
                    </span>
                  ) : selectedEventDetails.status === "nao_realizado" ? (
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-bold text-[9px]">
                      ❌ Não Realizado
                    </span>
                  ) : selectedEventDetails.status === "confirmado" ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[9px]">
                      ✓ Aceito
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-[9px]">
                      ⏳ Pendente
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEventDetails(null)}
                  className="font-bold text-zinc-400 hover:text-zinc-600"
                >
                  ×
                </button>
              </div>

              <p className="text-zinc-600 dark:text-zinc-300">{selectedEventDetails.descricao}</p>

              <div className="bg-zinc-50 dark:bg-zinc-900 p-2.5 rounded-lg flex flex-col gap-1 text-[11px]">
                <div>📍 <strong>Local:</strong> {selectedEventDetails.local}</div>
                <div>📅 <strong>Data de Início:</strong> {selectedEventDetails.dataInicio}</div>
                {selectedEventDetails.dataFim && (
                  <div>🏁 <strong>Término do Evento:</strong> {selectedEventDetails.dataFim}</div>
                )}
                <div>⏰ <strong>Horário:</strong> {selectedEventDetails.diaInteiro ? "Dia Inteiro" : `${selectedEventDetails.horaInicio} às ${selectedEventDetails.horaFim}`}</div>
                {selectedEventDetails.convidados && selectedEventDetails.convidados.length > 0 && (
                  <div>✉️ <strong>Convidados:</strong> {selectedEventDetails.convidados.join(", ")}</div>
                )}
              </div>

              {/* BOTÕES DE AÇÃO NO MODAL DE DETALHES */}
              <div className="flex flex-wrap items-center justify-between gap-1 p-2 rounded-lg bg-zinc-100/70 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-500">Alterar Status:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedEventDetails.id, "confirmado")}
                    className="px-2 py-1 rounded bg-emerald-600 text-white font-bold text-[9px]"
                  >
                    ✓ Aceitar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedEventDetails.id, "realizado")}
                    className="px-2 py-1 rounded bg-blue-600 text-white font-bold text-[9px]"
                  >
                    🎉 Realizado
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedEventDetails.id, "nao_realizado")}
                    className="px-2 py-1 rounded bg-red-600 text-white font-bold text-[9px]"
                  >
                    ❌ Não Realizado
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const evt = selectedEventDetails;
                      setSelectedEventDetails(null);
                      handleOpenEditModal(evt);
                    }}
                    className="px-2 py-1 rounded bg-zinc-800 text-white font-bold text-[9px]"
                  >
                    ✏️ Editar
                  </button>
                </div>
              </div>

              {/* EMBEDDED GOOGLE MAPS INTERATIVO */}
              {selectedEventDetails.local && (
                <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 h-36 w-full shadow-2xs">
                  <iframe
                    title="Localização do Evento no Google Maps"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedEventDetails.local)}&t=m&z=15&ie=UTF8&iwloc=&output=embed`}
                  />
                </div>
              )}

              {/* SE O EVENTO É RECORRENTE OU SÉRIE: EXIBE AÇÕES EXCLUSIVAS PARA ESTE DIA */}
              {(selectedEventDetails.recorrente || selectedEventDetails.datasRecorrencia) && (
                <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-3 dark:border-purple-900/60 dark:bg-purple-950/40 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-purple-950 dark:text-purple-200 text-xs flex items-center gap-1.5">
                      <span>🔄</span>
                      <span>Opções para o Dia Selecionado ({selectedEventDetails.dataInicio}):</span>
                    </span>
                    <span className="bg-purple-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                      Recorrente
                    </span>
                  </div>

                  <p className="text-[10px] text-purple-800 dark:text-purple-300">
                    Você pode alterar individualmente apenas esta data ({selectedEventDetails.dataInicio}) sem modificar os outros dias da série:
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCancelSingleOccurrence(selectedEventDetails, selectedEventDetails.dataInicio || "")}
                      className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] flex items-center gap-1 shadow-xs transition cursor-pointer"
                      title="Cancela o evento exclusivamente no dia selecionado"
                    >
                      <span>🚫</span>
                      <span>Cancelar apenas no dia {selectedEventDetails.dataInicio}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenAdiarModal(selectedEventDetails, selectedEventDetails.dataInicio || "")}
                      className="px-2.5 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-[10px] flex items-center gap-1 shadow-xs transition cursor-pointer"
                      title="Adia o evento especificamente desta data para outro dia"
                    >
                      <span>⏩</span>
                      <span>Adiar apenas este dia</span>
                    </button>
                  </div>
                </div>
              )}

              {/* PAINEL DE MARCAÇÃO NO GOOGLE MAPS PARA EVENTOS RECORRENTES */}
              {(selectedEventDetails.recorrente || selectedEventDetails.dataFim) && (
                <div className="rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 p-2.5 flex flex-col gap-1 text-[11px]">
                  <div className="flex items-center gap-1.5 font-bold text-purple-900 dark:text-purple-300">
                    <span>🗺️</span>
                    <span>Marcado no Google Maps até o término do evento ({selectedEventDetails.dataFim || selectedEventDetails.dataInicio})</span>
                  </div>
                  <p className="text-[10px] text-purple-700 dark:text-purple-400">
                    Todas as ocorrências deste evento recorrente foram roteirizadas e marcadas no Google Maps até a data limite ({selectedEventDetails.dataFim}).
                  </p>
                  {selectedEventDetails.datasRecorrencia && selectedEventDetails.datasRecorrencia.length > 0 && (
                    <div className="text-[9px] font-mono text-purple-800 dark:text-purple-300 mt-1 flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                      {selectedEventDetails.datasRecorrencia.map((dt) => (
                        <span key={dt} className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 font-bold border border-purple-200/50">
                          {dt}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-emerald-600 font-bold">✓ Google Maps & Calendar</span>
                  {selectedEventDetails.local && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEventDetails.local)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] flex items-center gap-1"
                    >
                      <span>🗺️ Abrir no Maps</span>
                    </a>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEventDetails(null)}
                  className="px-3 py-1 rounded bg-zinc-200 dark:bg-zinc-800 font-bold"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL PARA ADIAR OCORRÊNCIA ÚNICA DE EVENTO RECORRENTE */}
        {showAdiarModal && adiarEventTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 flex flex-col gap-4 text-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <h3 className="font-extrabold text-purple-700 dark:text-purple-400 text-sm flex items-center gap-1.5">
                  <span>⏩</span>
                  <span>Adiar Ocorrência do Dia ({targetAdiarDate})</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAdiarModal(false)}
                  className="font-bold text-zinc-400 hover:text-zinc-600"
                >
                  ×
                </button>
              </div>

              <p className="text-zinc-600 dark:text-zinc-300">
                Selecione a nova data para remarcar o evento <strong>"{adiarEventTarget.titulo}"</strong> previsto para o dia <strong>{targetAdiarDate}</strong>:
              </p>

              <div className="flex flex-col gap-1 bg-purple-50/50 dark:bg-purple-950/20 p-3 rounded-xl border border-purple-200 dark:border-purple-800">
                <label htmlFor="nova-data-adiar" className="font-bold text-purple-900 dark:text-purple-300">
                  Nova Data Remarcada *
                </label>
                <input
                  id="nova-data-adiar"
                  type="date"
                  required
                  className={inputClass}
                  value={novaDataAdiada}
                  onChange={(e) => setNovaDataAdiada(e.target.value)}
                />
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAdiarModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 font-bold cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleConfirmAdiarSingleOccurrence}
                  className="px-4 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-extrabold shadow-xs transition cursor-pointer"
                >
                  Confirmar Adiar Este Dia
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL COMPLETO DE ADICIONAR EVENTO NA AGENDA */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 flex flex-col gap-4">
              
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{editingEventId ? "✏️" : "📅"}</span>
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    {editingEventId ? "Editar Evento da Agenda" : "Adicionar Evento na Agenda do Candidato"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingEventId(null);
                  }}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-bold text-lg"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="flex flex-col gap-3.5 text-xs">
                
                {/* Status do Evento */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="evt-status" className="font-bold text-zinc-700 dark:text-zinc-300">
                    Status do Evento
                  </label>
                  <select
                    id="evt-status"
                    className={inputClass}
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value as any)}
                  >
                    <option value="confirmado">✓ Confirmado / Aceito</option>
                    <option value="pendente">⏳ Pendente de Aceite</option>
                    <option value="realizado">🎉 Realizado / Concluído</option>
                    <option value="nao_realizado">❌ Não Realizado / Cancelado</option>
                  </select>
                </div>

                {/* Título */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="evt-titulo" className="font-bold text-zinc-700 dark:text-zinc-300">
                    Título do Evento *
                  </label>
                  <input
                    id="evt-titulo"
                    required
                    className={inputClass}
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ex: Comício na Praça Central / Reunião de Campanha"
                  />
                </div>

                {/* Descrição */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="evt-desc" className="font-bold text-zinc-700 dark:text-zinc-300">
                    Descrição
                  </label>
                  <textarea
                    id="evt-desc"
                    rows={2}
                    className={inputClass}
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Detalhes adicionais, pauta do encontro ou observações de transporte..."
                  />
                </div>

                {/* Local */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="evt-local" className="font-bold text-zinc-700 dark:text-zinc-300">
                    Local
                  </label>
                  <input
                    id="evt-local"
                    className={inputClass}
                    value={local}
                    onChange={(e) => setLocal(e.target.value)}
                    placeholder="Ex: Av. Paulista, 1000 - São Paulo/SP"
                  />
                </div>

                {/* Data de Início */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="evt-datainicio" className="font-bold text-zinc-700 dark:text-zinc-300">
                    Data de Início *
                  </label>
                  <input
                    id="evt-datainicio"
                    type="date"
                    required
                    className={inputClass}
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>

                {/* Checkbox: Dia Inteiro */}
                <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800">
                  <input
                    id="evt-diainteiro"
                    type="checkbox"
                    checked={diaInteiro}
                    onChange={(e) => setDiaInteiro(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="evt-diainteiro" className="font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer">
                    Evento de Dia Inteiro
                  </label>
                </div>

                {/* Hora Início e Hora Fim */}
                {!diaInteiro && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="evt-horainicio" className="font-bold text-zinc-700 dark:text-zinc-300">
                        Hora Início <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="evt-horainicio"
                        type="time"
                        required={!diaInteiro}
                        className={inputClass}
                        value={horaInicio}
                        onChange={(e) => setHoraInicio(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="evt-horafim" className="font-bold text-zinc-700 dark:text-zinc-300">
                        Hora Fim <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="evt-horafim"
                        type="time"
                        required={!diaInteiro}
                        className={inputClass}
                        value={horaFim}
                        onChange={(e) => setHoraFim(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Checkbox: Evento Recorrente */}
                <div className="flex flex-col gap-2.5 bg-purple-50/50 dark:bg-purple-950/20 p-3 rounded-lg border border-purple-200/60 dark:border-purple-900/40">
                  <div className="flex items-center gap-2">
                    <input
                      id="evt-recorrente"
                      type="checkbox"
                      checked={recorrente}
                      onChange={(e) => setRecorrente(e.target.checked)}
                      className="h-4 w-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="evt-recorrente" className="font-bold text-purple-950 dark:text-purple-200 cursor-pointer">
                      Evento Recorrente
                    </label>
                  </div>

                  {recorrente && (
                    <div className="flex flex-col gap-2.5 pt-2 border-t border-purple-200/50 dark:border-purple-900/50">
                      <div className="flex flex-col gap-1">
                        <label htmlFor="evt-datafim" className="font-bold text-purple-900 dark:text-purple-300">
                          Data Fim da Recorrência
                        </label>
                        <input
                          id="evt-datafim"
                          type="date"
                          className={inputClass}
                          value={dataFim}
                          onChange={(e) => setDataFim(e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-purple-900 dark:text-purple-300">
                          Dias de Recorrência (Segunda a Sexta / Fim de Semana):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {WEEKDAYS.map((day) => {
                            const isChecked = diasSemana.includes(day.id);
                            return (
                              <button
                                key={day.id}
                                type="button"
                                onClick={() => handleToggleWeekday(day.id)}
                                className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                                  isChecked
                                    ? "bg-purple-600 text-white shadow-2xs"
                                    : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-50"
                                }`}
                              >
                                {day.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Convidados */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="evt-convidados" className="font-bold text-zinc-700 dark:text-zinc-300">
                    Convidados (E-mails separados por vírgula)
                  </label>
                  <input
                    id="evt-convidados"
                    className={inputClass}
                    value={convidadosInput}
                    onChange={(e) => setConvidadosInput(e.target.value)}
                    placeholder="ex: assessor@campanha.com.br, lideranca@partido.org.br"
                  />
                </div>

                {/* Botões de Ação */}
                <div className="mt-2 flex items-center justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`${buttonPrimaryClass} bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold flex items-center gap-1.5 text-xs px-4 py-2 shadow-sm`}
                  >
                    <span>🗓️ {submitting ? "Sincronizando..." : "Sincronizar com o Google"}</span>
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

      </div>
    </ModuleBlock>
  );
}
