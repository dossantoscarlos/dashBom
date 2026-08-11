"use client";

import React, { useState } from "react";
import type { AuditEvent } from "./types";
import { useToast } from "@/components/dashboard/Toast";
import {
  History,
  Download,
  Settings,
  Search,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Paperclip,
  Clock,
  ShieldCheck,
  Info,
  Layers,
  ArrowRight,
  Filter,
} from "lucide-react";

interface ProjectHistoricoProps {
  auditEvents: AuditEvent[];
  onNavigateTab: (tab: any) => void;
}

export function ProjectHistorico({
  auditEvents,
  onNavigateTab,
}: ProjectHistoricoProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEventType, setSelectedEventType] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [onlyImportant, setOnlyImportant] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>("evt-84");

  const filteredEvents = auditEvents.filter((evt) => {
    const matchesSearch =
      evt.actionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.targetCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.targetTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.user.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedEventType ? evt.eventType === selectedEventType : true;
    const matchesUser = selectedUser ? evt.user === selectedUser : true;
    const matchesImp = onlyImportant ? evt.isImportant : true;

    return matchesSearch && matchesType && matchesUser && matchesImp;
  });

  const selectedEvt = auditEvents.find((e) => e.id === selectedEventId) || auditEvents[0];

  // Agrupa eventos por data (Hoje, Ontem, etc.)
  const groupedEvents = filteredEvents.reduce<Record<string, AuditEvent[]>>((acc, evt) => {
    const group = evt.dateGroup;
    if (!acc[group]) acc[group] = [];
    acc[group].push(evt);
    return acc;
  }, {});

  const handleExportHistory = () => {
    toast("Relatório completo de auditoria do projeto exportado!");
  };

  return (
    <div className="flex flex-col gap-6 font-sans text-xs antialiased select-none">
      {/* ── BARRA SUPERIOR DE AÇÕES (IMAGEM 1) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab("visao_geral")}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#10213D] font-bold text-xs transition shadow-2xs cursor-pointer"
          >
            Detalhes do projeto
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportHistory}
            className="h-10 px-4 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#10213D] font-bold text-xs transition shadow-2xs flex items-center gap-2 cursor-pointer"
          >
            <Download className="h-4 w-4 text-[#1264F3]" strokeWidth={2} />
            <span>Exportar histórico</span>
          </button>

          <button
            type="button"
            onClick={() => toast("Configurações da Auditoria ativas")}
            className="h-10 w-10 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#10213D] flex items-center justify-center transition shadow-2xs cursor-pointer"
            title="Configurações da auditoria"
          >
            <Settings className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* ── CARDS INDICADORES DE EVENTOS DE AUDITORIA (IMAGEM 1) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-2xs">
        <div className="flex items-center gap-3">
          <History className="h-7 w-7 text-[#7928F5] bg-[#F3EAFF] p-1.5 rounded-xl shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#64748B]">Eventos registrados</span>
            <span className="text-sm font-black text-[#10213D]">84</span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-[#F1F5F9] pl-3">
          <ArrowRight className="h-7 w-7 text-[#1264F3] bg-[#EAF2FF] p-1.5 rounded-xl shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#64748B]">Movimentações</span>
            <span className="text-sm font-black text-[#10213D]">21</span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-[#F1F5F9] pl-3">
          <MessageSquare className="h-7 w-7 text-[#008B63] bg-[#E8F7F1] p-1.5 rounded-xl shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#64748B]">Comentários</span>
            <span className="text-sm font-black text-[#10213D]">18</span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-[#F1F5F9] pl-3">
          <Paperclip className="h-7 w-7 text-[#F59E0B] bg-[#FFF4E5] p-1.5 rounded-xl shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#64748B]">Arquivos</span>
            <span className="text-sm font-black text-[#10213D]">12</span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-[#F1F5F9] pl-3">
          <ShieldCheck className="h-7 w-7 text-[#00A978] bg-[#E8F7F1] p-1.5 rounded-xl shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#64748B]">Decisões</span>
            <span className="text-sm font-black text-[#008B63]">6</span>
          </div>
        </div>
      </div>

      {/* ── BARRA DE FERRAMENTAS DE BUSCA E FILTROS ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E2E8F0] shadow-2xs">
        <div className="relative flex-1 max-w-xs">
          <Search className="h-4 w-4 text-[#64748B] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar no histórico..."
            className="h-9 w-full pl-9 pr-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
            className="h-9 px-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] font-medium text-[#10213D]"
          >
            <option value="">Tipo de evento: Todos</option>
            <option value="Tarefa">Tarefa</option>
            <option value="Aprovação">Aprovação</option>
            <option value="Arquivo">Arquivo</option>
            <option value="Orçamento">Orçamento</option>
            <option value="Prazo">Prazo</option>
            <option value="Sistema">Sistema</option>
          </select>

          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="h-9 px-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] font-medium text-[#10213D]"
          >
            <option value="">Usuário: Todos</option>
            <option value="Ana Martins">Ana Martins</option>
            <option value="João Victor">João Victor</option>
            <option value="Rafael Pereira">Rafael Pereira</option>
            <option value="Carlos Souza">Carlos Souza</option>
            <option value="Ana Paula">Ana Paula</option>
            <option value="Sistema">Sistema</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedEventType("");
              setSelectedUser("");
              setOnlyImportant(false);
            }}
            className="text-xs font-extrabold text-[#64748B] hover:text-[#10213D] px-2 py-1 cursor-pointer"
          >
            Limpar filtros
          </button>

          {/* Toggle Somente Eventos Importantes */}
          <label className="flex items-center gap-2 cursor-pointer border-l border-[#E2E8F0] pl-3">
            <input
              type="checkbox"
              checked={onlyImportant}
              onChange={(e) => setOnlyImportant(e.target.checked)}
              className="h-4 w-4 rounded border-[#E2E8F0] text-[#008B63] focus:ring-[#00A978] cursor-pointer"
            />
            <span className="font-bold text-[#10213D]">Somente eventos importantes</span>
          </label>
        </div>
      </div>

      {/* ── GRID: LINHA DO TEMPO DA AUDITORIA (ESQUERDA) E DETALHES DO EVENTO (DIREITA) (IMAGEM 1) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* Linha do Tempo dos Eventos */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs flex flex-col gap-6">
          {Object.keys(groupedEvents).length === 0 ? (
            <div className="p-8 text-center text-[#64748B]">Nenhum evento localizado com os filtros aplicados.</div>
          ) : (
            Object.entries(groupedEvents).map(([groupTitle, events]) => (
              <div key={groupTitle} className="flex flex-col gap-3">
                <span className="text-xs font-black text-[#10213D] border-b border-[#F1F5F9] pb-1.5">
                  {groupTitle}
                </span>

                <div className="flex flex-col gap-2.5">
                  {events.map((evt) => {
                    const isSelected = selectedEventId === evt.id;

                    return (
                      <div
                        key={evt.id}
                        onClick={() => setSelectedEventId(evt.id)}
                        className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                          isSelected
                            ? "bg-[#EAF2FF] border-[#1264F3] shadow-2xs"
                            : "bg-[#F8FAFC] border-[#E2E8F0] hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="font-mono text-[11px] font-bold text-[#64748B] pt-0.5 min-w-[36px]">
                            {evt.time}
                          </span>

                          <div
                            className={`h-7 w-7 rounded-full ${evt.avatarBg} text-white font-black text-[10px] flex items-center justify-center shrink-0 shadow-2xs`}
                          >
                            {evt.avatarInitials}
                          </div>

                          <div className="flex flex-col gap-1 min-w-0">
                            <p className="text-xs text-[#10213D] leading-snug">
                              <strong className="font-extrabold">{evt.user}</strong> {evt.actionText}
                            </p>

                            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                              <span className="bg-[#EAF2FF] text-[#1264F3] border border-[#1264F3]/30 px-2 py-0.2 rounded font-extrabold">
                                {evt.eventType}
                              </span>
                              <span className="font-mono font-extrabold text-[#1264F3]">{evt.targetCode}</span>
                              <span className="text-[#64748B] truncate max-w-[220px]">{evt.targetTitle}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEventId(evt.id);
                          }}
                          className="text-[11px] font-extrabold text-[#1264F3] hover:underline flex items-center gap-1 shrink-0 pt-0.5"
                        >
                          <span>Abrir registro</span>
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Painel Lateral: Detalhes do Evento Selecionado e Rastreabilidade (Imagem 1) */}
        {selectedEvt && (
          <div className="flex flex-col gap-5">
            {/* Cartão de Detalhes do Evento */}
            <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-col gap-3.5">
              <h4 className="text-xs font-extrabold text-[#10213D] uppercase tracking-wider border-b border-[#E2E8F0] pb-2.5">
                Detalhes do evento
              </h4>

              <div className="flex flex-col gap-2 text-xs font-medium">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">ID do evento:</span>
                  <span className="font-mono font-black text-[#10213D]">EVT-0000{selectedEvt.id.replace(/\D/g, "")}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#64748B]">Data e hora:</span>
                  <span className="font-mono font-bold text-[#10213D]">{selectedEvt.fullDate}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#64748B]">Usuário:</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-5 w-5 rounded-full ${selectedEvt.avatarBg} text-white font-black text-[9px] flex items-center justify-center`}>
                      {selectedEvt.avatarInitials}
                    </span>
                    <span className="font-bold text-[#10213D]">{selectedEvt.user}</span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#64748B]">Origem:</span>
                  <span className="font-bold text-[#10213D]">Interface Web</span>
                </div>

                <div className="flex justify-between items-start pt-1 border-t border-[#F1F5F9]">
                  <span className="text-[#64748B]">Registro afetado:</span>
                  <span className="font-mono text-[#1264F3] font-bold flex items-center gap-1">
                    {selectedEvt.targetCode} <ExternalLink className="h-3 w-3" />
                  </span>
                </div>

                {selectedEvt.previousValue && (
                  <div className="flex justify-between pt-1 border-t border-[#F1F5F9]">
                    <span className="text-[#64748B]">Valor anterior:</span>
                    <span className="bg-[#F1F5F9] text-[#64748B] px-2 py-0.5 rounded text-[10px] font-bold">
                      {selectedEvt.previousValue}
                    </span>
                  </div>
                )}

                {selectedEvt.newValue && (
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Novo valor:</span>
                    <span className="bg-[#EAF2FF] text-[#1264F3] px-2 py-0.5 rounded text-[10px] font-black">
                      {selectedEvt.newValue}
                    </span>
                  </div>
                )}

                {selectedEvt.justification && (
                  <div className="flex flex-col gap-1 pt-2 border-t border-[#F1F5F9]">
                    <span className="text-[#64748B]">Justificativa:</span>
                    <p className="text-[11px] text-[#10213D] bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0]">
                      {selectedEvt.justification}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Cartão Rastreabilidade */}
            <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-col gap-3.5">
              <h4 className="text-xs font-extrabold text-[#10213D] uppercase tracking-wider border-b border-[#E2E8F0] pb-2.5">
                Rastreabilidade
              </h4>

              <ul className="flex flex-col gap-2.5 text-xs">
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#008B63] font-bold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Demanda original vinculada</span>
                  </span>
                  <span className="font-mono font-black text-[#10213D]">DEM-0235</span>
                </li>

                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#008B63] font-bold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Conversão aprovada</span>
                  </span>
                  <span className="font-mono text-[10px] text-[#64748B]">18/06/2025 às 08:30</span>
                </li>

                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#008B63] font-bold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Histórico preservado</span>
                  </span>
                  <span className="text-[10px] text-[#64748B]">Desde 12/06/2025</span>
                </li>

                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#008B63] font-bold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Auditoria ativa</span>
                  </span>
                  <span className="text-[10px] text-[#64748B]">Ativa desde a criação</span>
                </li>
              </ul>
            </div>

            {/* Alerta de Auditoria Inalterável (Imagem 1) */}
            <div className="bg-[#EAF2FF] border border-[#1264F3]/30 p-3.5 rounded-xl flex items-center gap-2.5 text-xs text-[#1264F3] font-medium shadow-2xs">
              <Info className="h-5 w-5 shrink-0 text-[#1264F3]" strokeWidth={2} />
              <span>Os eventos de auditoria são permanentes e não podem ser alterados.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
