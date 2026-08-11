"use client";

import React, { useState } from "react";
import { useDashboard } from "@/contexts/DashboardProvider";
import { useToast } from "@/components/dashboard/Toast";

import type {
  DemandaItem,
  ProjetoItem,
  KanbanTask,
  CronogramaItem,
  OrcamentoCategoria,
  FinancialTransaction,
  TeamMember,
  RaciItem,
  ProjectFileItem,
  AuditEvent,
} from "./types";

import {
  initialDemanda,
  initialProjeto,
  initialKanbanTasks,
  initialCronogramaData,
  initialOrcamentoCategorias,
  initialFinancialTransactions,
  initialTeamMembers,
  initialRaciItems,
  initialProjectFiles,
  initialAuditEvents,
} from "./mockData";

import { ProjectHeader, type ProjectSubTab } from "./ProjectHeader";
import { ProjectVisaoGeral } from "./ProjectVisaoGeral";
import { ProjectKanban } from "./ProjectKanban";
import { ProjectCronograma } from "./ProjectCronograma";
import { ProjectOrcamento } from "./ProjectOrcamento";
import { ProjectEquipe } from "./ProjectEquipe";
import { ProjectArquivos } from "./ProjectArquivos";
import { ProjectHistorico } from "./ProjectHistorico";

import {
  FileText,
  ShieldCheck,
  Lock,
  Save,
  Check,
  X,
  MapPin,
  Calendar,
  Phone,
  Mail,
  UploadCloud,
  File,
  Trash2,
  AlertTriangle,
  Info,
  Clock,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  ChevronRight,
  Building,
  Sparkles,
  FolderKanban,
  CheckSquare,
  Plus,
  RotateCcw,
  ExternalLink,
  Layers,
  Search,
  ArrowLeft,
} from "lucide-react";

export function DemandasProjetosPanel() {
  const { regions, users } = useDashboard();
  const { toast } = useToast();

  // Mode: "demandas" (Cadastro/Gestão/Análise) ou "projeto" (Visualização do Projeto PRJ-0104)
  const [mainMode, setMainMode] = useState<"demandas" | "projeto">("projeto");

  // Demandas State
  const [demandState, setDemandState] = useState<DemandaItem>(initialDemanda);

  // Projeto State
  const [projectState, setProjectState] = useState<ProjetoItem>(initialProjeto);

  // Sub-Aba Ativa do Projeto
  const [projectSubTab, setProjectSubTab] = useState<ProjectSubTab>("historico");

  // Estados dos Sub-Módulos do Projeto
  const [kanbanTasks, setKanbanTasks] = useState<KanbanTask[]>(initialKanbanTasks);
  const [cronogramaData, setCronogramaData] = useState<CronogramaItem[]>(initialCronogramaData);
  const [categorias, setCategorias] = useState<OrcamentoCategoria[]>(initialOrcamentoCategorias);
  const [transacoes, setTransacoes] = useState<FinancialTransaction[]>(initialFinancialTransactions);
  const [members, setMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [raciItems, setRaciItems] = useState<RaciItem[]>(initialRaciItems);
  const [projectFiles, setProjectFiles] = useState<ProjectFileItem[]>(initialProjectFiles);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(initialAuditEvents);

  // Formulário "Nova Demanda" State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<any>("Média");
  const [channelOrigin, setChannelOrigin] = useState("Gabinete Virtual");
  const [cep, setCep] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [cepFound, setCepFound] = useState("");
  const [cepError, setCepError] = useState("");
  const [regionId, setRegionId] = useState(regions[0]?.id || "");
  const [municipio, setMunicipio] = useState("São Paulo / SP");
  const [bairro, setBairro] = useState("Centro");
  const [address, setAddress] = useState("");
  const [responsible, setResponsible] = useState("Ana Martins");
  const [team, setTeam] = useState("Equipe de Gestão de Projetos");
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().slice(0, 10));
  const [analysisDeadline, setAnalysisDeadline] = useState("");
  const [applicantName, setApplicantName] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [contactChannel, setContactChannel] = useState("");
  const [contactAuthorized, setContactAuthorized] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // CEP Search
  const handleCepSearch = async () => {
    const raw = cep.replace(/\D/g, "");
    if (raw.length !== 8) {
      setCepError("Informe um CEP válido com 8 dígitos.");
      return;
    }

    setCepLoading(true);
    setCepError("");

    try {
      const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
      const data = await res.json();

      if (data.erro) {
        setCepError("CEP não localizado. Preencha o endereço manualmente.");
      } else {
        const fullAddr = data.logradouro || address;
        const b = data.bairro || bairro;
        const m = `${data.localidade} / ${data.uf}`;

        setAddress(fullAddr);
        setBairro(b);
        setMunicipio(m);
        setCepFound(`${fullAddr}, ${b} — ${m}`);
        toast("Localização e território preenchidos automaticamente pelo CEP!");
      }
    } catch {
      setCepError("Erro ao consultar CEP.");
    } finally {
      setCepLoading(false);
    }
  };

  // Transação de Conversão de Demanda em Projeto
  const handleExecuteConversion = () => {
    if (demandState.status === "Convertida em projeto") {
      toast("Esta demanda já foi convertida no Projeto PRJ-0104!");
      setMainMode("projeto");
      return;
    }

    const c = demandState.criteria;
    const allChecked =
      c.multDeliveries &&
      c.needsTeam &&
      c.hasTimeline &&
      c.needsBudget &&
      c.approvedByResponsible;

    if (!allChecked || demandState.decision !== "Aprovada para Projeto") {
      toast(
        "A conversão transacional exige que os 5 critérios de análise estejam preenchidos e validados pelo responsável.",
        "error"
      );
      return;
    }

    // Atualização Transacional Atômica
    const updatedDemand: DemandaItem = {
      ...demandState,
      status: "Convertida em projeto",
      convertedProjectId: "prj-0104",
    };

    setDemandState(updatedDemand);

    // Registra evento no histórico do projeto
    const newEvent: AuditEvent = {
      id: `evt-${Date.now()}`,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      dateGroup: "Hoje",
      user: "Sistema",
      avatarInitials: "SIS",
      avatarBg: "bg-[#06284F]",
      actionText: `Projeto ${projectState.code} foi criado a partir da demanda ${demandState.code}`,
      eventType: "Sistema",
      targetCode: demandState.code,
      targetTitle: "Criação do projeto com status Planejamento",
      previousValue: "Status Demanda: Em análise",
      newValue: "Status Demanda: Convertida em projeto",
      justification: "Transação de conversão concluída com os 5 critérios validados.",
      isImportant: true,
      fullDate: `${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
    };

    setAuditEvents((prev) => [newEvent, ...prev]);
    toast(`Transação Concluída! Demanda ${demandState.code} convertida no Projeto ${projectState.code}.`);
    setMainMode("projeto");
    setProjectSubTab("kanban");
  };

  return (
    <div className="flex flex-col gap-6 font-sans text-xs bg-[#F6F8FB] max-w-[1671px] mx-auto antialiased select-none">
      
      {/* ── BARRA SUPERIOR DE ALTERNÂNCIA: DEMANDAS vs PROJETO ATIVO PRJ-0104 ── */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2 bg-white p-3 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMainMode("projeto")}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs transition flex items-center gap-2 cursor-pointer ${
              mainMode === "projeto"
                ? "bg-[#008B63] text-white shadow-xs font-black"
                : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#E8F7F1] hover:text-[#008B63]"
            }`}
          >
            <FolderKanban className="h-4 w-4" strokeWidth={2.2} />
            <span>Projeto PRJ-0104 • Modernização do Centro Esportivo</span>
            <span className="bg-white/20 text-white text-[10px] px-2 py-0.2 rounded font-black">
              Em execução
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMainMode("demandas")}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs transition flex items-center gap-2 cursor-pointer ${
              mainMode === "demandas"
                ? "bg-[#1264F3] text-white shadow-xs font-black"
                : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#EAF2FF] hover:text-[#1264F3]"
            }`}
          >
            <FileText className="h-4 w-4" strokeWidth={2} />
            <span>Demanda Original ({demandState.code})</span>
            <span className="bg-[#E8F7F1] text-[#008B63] text-[10px] px-2 py-0.2 rounded font-extrabold border border-[#00A978]/30">
              Convertida
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold text-[#008B63] bg-[#E8F7F1] px-3 py-1 rounded-lg border border-[#00A978]/30">
            ● Vínculo Transacional Ativo
          </span>
        </div>
      </div>

      {/* ── MODO 1: PROJETO ATIVO PRJ-0104 (CONFORME TODAS AS AS 5 IMAGENS DE REFERÊNCIA) ── */}
      {mainMode === "projeto" && (
        <div className="flex flex-col gap-6">
          {/* Cabeçalho Compartilhado do Projeto */}
          <ProjectHeader
            project={projectState}
            activeSubTab={projectSubTab}
            onTabChange={(tab) => setProjectSubTab(tab)}
            onOpenOriginalDemand={() => setMainMode("demandas")}
          />

          {/* Renderização das Sub-Telas do Projeto conforme a Aba Ativa */}
          {projectSubTab === "visao_geral" && (
            <ProjectVisaoGeral
              project={projectState}
              onNavigateTab={(t) => setProjectSubTab(t)}
            />
          )}

          {projectSubTab === "kanban" && (
            <ProjectKanban
              tasks={kanbanTasks}
              onUpdateTasks={(newTasks) => setKanbanTasks(newTasks)}
              onNavigateTab={(t) => setProjectSubTab(t)}
            />
          )}

          {projectSubTab === "cronograma" && (
            <ProjectCronograma
              cronogramaData={cronogramaData}
              onNavigateTab={(t) => setProjectSubTab(t)}
            />
          )}

          {projectSubTab === "orcamento" && (
            <ProjectOrcamento
              categorias={categorias}
              transacoes={transacoes}
              onAddTransaction={(tx) => setTransacoes((prev) => [tx, ...prev])}
              onNavigateTab={(t) => setProjectSubTab(t)}
            />
          )}

          {projectSubTab === "equipe" && (
            <ProjectEquipe
              members={members}
              raciItems={raciItems}
              onAddMember={(m) => setMembers((prev) => [...prev, m])}
              onNavigateTab={(t) => setProjectSubTab(t)}
            />
          )}

          {projectSubTab === "arquivos" && (
            <ProjectArquivos
              files={projectFiles}
              onAddFile={(f) => setProjectFiles((prev) => [f, ...prev])}
              onNavigateTab={(t) => setProjectSubTab(t)}
            />
          )}

          {projectSubTab === "historico" && (
            <ProjectHistorico
              auditEvents={auditEvents}
              onNavigateTab={(t) => setProjectSubTab(t)}
            />
          )}
        </div>
      )}

      {/* ── MODO 2: DEMANDA ORIGINÁRIA DEM-0235 E ANÁLISE DE CONVERSÃO ── */}
      {mainMode === "demandas" && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMainMode("projeto")}
                className="p-2 rounded-xl bg-white border border-[#E2E8F0] hover:bg-slate-100 text-[#10213D] transition"
                title="Voltar ao Projeto"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-[#1264F3] bg-[#EAF2FF] px-2.5 py-0.5 rounded border border-[#1264F3]/30">
                    {demandState.code}
                  </span>
                  <h1 className="text-xl font-black text-[#10213D]">{demandState.title}</h1>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Demanda registrada em {demandState.createdAt} · Solicitante: {demandState.applicantName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="bg-[#E8F7F1] text-[#008B63] border border-[#00A978]/30 px-3 py-1 rounded-xl text-xs font-black uppercase">
                {demandState.status}
              </span>
            </div>
          </div>

          {/* Painel da Análise Técnica e Checklist dos 5 Critérios de Conversão */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-2xs flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-extrabold text-[#10213D] uppercase tracking-wider">
                Parecer da Análise e Critérios de Conversão Transacional
              </h3>
              <span className="text-xs font-black text-[#008B63] bg-[#E8F7F1] px-3 py-1 rounded-lg border border-[#00A978]/30">
                ✓ Análise Concluída
              </span>
            </div>

            <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] text-xs leading-relaxed text-[#10213D]">
              <span className="font-extrabold block mb-1">Parecer Técnico Registrado:</span>
              <p>{demandState.technicalReport}</p>
            </div>

            {/* Checklist dos 5 Critérios Obliterados */}
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="p-3 rounded-xl border border-[#00A978]/40 bg-[#E8F7F1] flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-[#008B63] shrink-0" />
                <span className="font-extrabold text-[#008B63]">1. Escopo exige múltiplas entregas (Validade OK)</span>
              </div>

              <div className="p-3 rounded-xl border border-[#00A978]/40 bg-[#E8F7F1] flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-[#008B63] shrink-0" />
                <span className="font-extrabold text-[#008B63]">2. Necessita equipe e responsáveis (Validade OK)</span>
              </div>

              <div className="p-3 rounded-xl border border-[#00A978]/40 bg-[#E8F7F1] flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-[#008B63] shrink-0" />
                <span className="font-extrabold text-[#008B63]">3. Possui prazo ou cronograma (Validade OK)</span>
              </div>

              <div className="p-3 rounded-xl border border-[#00A978]/40 bg-[#E8F7F1] flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-[#008B63] shrink-0" />
                <span className="font-extrabold text-[#008B63]">4. Exige orçamento ou recursos (Validade OK)</span>
              </div>

              <div className="p-3 rounded-xl border border-[#00A978]/40 bg-[#E8F7F1] flex items-center gap-2.5 sm:col-span-2">
                <CheckCircle2 className="h-5 w-5 text-[#008B63] shrink-0" />
                <span className="font-extrabold text-[#008B63]">
                  5. Conversão aprovada formalmente pela responsável ({demandState.responsible})
                </span>
              </div>
            </div>

            {/* Ação de Executar Conversão ou Abrir Projeto Acompanhante */}
            <div className="pt-3 border-t border-[#E2E8F0] flex flex-col gap-2">
              <button
                type="button"
                onClick={handleExecuteConversion}
                className="w-full h-12 bg-[#008B63] hover:bg-[#007553] text-white font-black text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="h-5 w-5 text-white" />
                <span>ABRIR PROJETO VINCULADO (PRJ-0104)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
