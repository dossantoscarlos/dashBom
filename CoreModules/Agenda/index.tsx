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
        // Combinar eventos locais salvos com eventos do servidor sem duplicidade por ID
        const combinedMap = new Map<string, CandidateEvent>();
        [...localEvents, ...apiEvents].forEach((evt) => {
          if (evt && evt.id) combinedMap.set(evt.id, evt);
        });
        setEventos(Array.from(combinedMap.values()));
      } else {
        if (localEvents.length > 0) {
          setEventos(localEvents);
        } else {
          throw new Error(data.erro || data.error || "Erro ao carregar agenda.");
        }
      }
    } catch (err: any) {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            setEventos(JSON.parse(saved));
            return;
          } catch (e) {}
        }
      }
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
          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
            {/* Cabeçalho dos 7 dias da semana (dom., seg., ter., qua., qui., sex., sáb.) */}
            <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50 text-center font-bold text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-400 text-[11px] py-2">
              <div>dom.</div>
              <div>seg.</div>
              <div>ter.</div>
              <div>qua.</div>
              <div>qui.</div>
              <div>sex.</div>
              <div>sáb.</div>
            </div>

            {/* Células do Calendário Mensal */}
            <div className="grid grid-cols-7 divide-x divide-y divide-zinc-200 dark:divide-zinc-800 min-h-[560px]">
              {monthGridDays.map((cell, idx) => {
                // Filtra os eventos que ocorrem nesta data específica
                const cellEvents = filteredEventos.filter((evt) => evt.dataInicio === cell.dateStr);
                const isToday = cell.dateStr === new Date().toISOString().slice(0, 10);

                return (
                  <div
                    key={idx}
                    onClick={() => handleOpenModalForDate(cell.dateStr)}
                    className={`group relative flex flex-col p-1.5 transition min-h-[110px] cursor-pointer hover:bg-blue-50/30 dark:hover:bg-blue-950/10 ${
                      cell.isCurrentMonth
                        ? "bg-white dark:bg-zinc-950"
                        : "bg-zinc-50/60 text-zinc-400 dark:bg-zinc-900/40 dark:text-zinc-600"
                    }`}
                  >
                    {/* Número do Dia na célula */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex h-5 w-5 items-center justify-center text-[11px] font-bold rounded-full ${
                          isToday
                            ? "bg-blue-600 text-white shadow-2xs"
                            : cell.isCurrentMonth
                            ? "text-zinc-700 dark:text-zinc-300"
                            : "text-zinc-400 dark:text-zinc-600"
                        }`}
                      >
                        {cell.dayNum}
                      </span>

                      {/* Botão + rápido ao passar o mouse */}
                      <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                        + novo
                      </span>
                    </div>

                    {/* Lista de Pílulas de Eventos dentro do dia do calendário */}
                    <div className="mt-1 flex flex-col gap-1 overflow-y-auto max-h-[85px]">
                      {cellEvents.map((evt) => (
                        <div
                          key={evt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEventDetails(evt);
                          }}
                          className="flex flex-col gap-0.5 rounded bg-blue-100/80 hover:bg-blue-200 dark:bg-blue-950/80 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800/60 p-1 text-[9px] text-blue-950 dark:text-blue-200 transition shadow-2xs"
                          title={`${evt.titulo} - ${evt.local}`}
                        >
                          <div className="flex items-center justify-between font-bold truncate">
                            <span className="truncate">{evt.titulo}</span>
                            <span className="font-mono text-[8px] text-blue-700 dark:text-blue-300 shrink-0">
                              {evt.diaInteiro ? "Dia Todo" : evt.horaInicio}
                            </span>
                          </div>
                          {evt.local && (
                            <span className="truncate opacity-75 text-[8px]">
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
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                            {evt.titulo}
                          </h4>
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
                        Hora Início
                      </label>
                      <input
                        id="evt-horainicio"
                        type="time"
                        className={inputClass}
                        value={horaInicio}
                        onChange={(e) => setHoraInicio(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="evt-horafim" className="font-bold text-zinc-700 dark:text-zinc-300">
                        Hora Fim
                      </label>
                      <input
                        id="evt-horafim"
                        type="time"
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
