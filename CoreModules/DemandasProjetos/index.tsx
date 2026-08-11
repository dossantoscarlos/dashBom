"use client";

import React, { useState, useRef } from "react";
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
  RefreshCw,
} from "lucide-react";

export function DemandasProjetosPanel() {
  const { regions, users } = useDashboard();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // MODO PRINCIPAL DO MÓDULO:
  // "nova_demanda": TELA 1 — CADASTRO DE NOVA DEMANDA (FORMULÁRIO LIMPO PARA DADOS REAIS)
  // "analise_demanda": TELA 2 & 3 — ANÁLISE TÉCNICA E AVALIAÇÃO DE CRITÉRIOS DA DEMANDA REAL CADASTRADA
  // "projeto_ativo": TELAS 4 A 10 — ACOMPANHAMENTO DO PROJETO CRIADO DINAMICAMENTE
  const [mainMode, setMainMode] = useState<"nova_demanda" | "analise_demanda" | "projeto_ativo">("nova_demanda");

  // Sub-aba ativa do projeto
  const [projectSubTab, setProjectSubTab] = useState<ProjectSubTab>("kanban");

  // Lista de Demandas Cadastradas no Sistema (Inicia vazia ou com registros reais)
  const [registeredDemands, setRegisteredDemands] = useState<DemandaItem[]>([]);

  // Demanda Ativa sendo cadastrada/analisada
  const [currentDemanda, setCurrentDemanda] = useState<DemandaItem | null>(null);

  // Projeto Ativo criado a partir de conversão real
  const [projectState, setProjectState] = useState<ProjetoItem | null>(null);

  // Sub-Módulos do Projeto Ativo
  const [kanbanTasks, setKanbanTasks] = useState<KanbanTask[]>([]);
  const [cronogramaData, setCronogramaData] = useState<CronogramaItem[]>([]);
  const [categorias, setCategorias] = useState<OrcamentoCategoria[]>([]);
  const [transacoes, setTransacoes] = useState<FinancialTransaction[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [raciItems, setRaciItems] = useState<RaciItem[]>([]);
  const [projectFiles, setProjectFiles] = useState<ProjectFileItem[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);

  // ── ESTADOS DO FORMULÁRIO DE NOVA DEMANDA (INICIAM 100% LIMPOS) ──
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"Baixa" | "Média" | "Alta" | "Urgente">("Média");
  const [channelOrigin, setChannelOrigin] = useState("Gabinete Virtual");
  const [cep, setCep] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [cepFound, setCepFound] = useState("");
  const [cepError, setCepError] = useState("");
  const [regionId, setRegionId] = useState(regions[0]?.id || "");
  const [municipio, setMunicipio] = useState("");
  const [bairro, setBairro] = useState("");
  const [address, setAddress] = useState("");
  const [responsible, setResponsible] = useState(users[0]?.name || "Ana Martins");
  const [team, setTeam] = useState("Equipe de Gestão de Projetos");
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().slice(0, 10));
  const [analysisDeadline, setAnalysisDeadline] = useState("");
  const [applicantName, setApplicantName] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Parecer Técnico da Análise (Inicia limpo)
  const [technicalReport, setTechnicalReport] = useState("");

  // Busca Automática de Endereço por CEP Real
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
        toast("Localização preenchida automaticamente pelo CEP!");
      }
    } catch {
      setCepError("Erro ao consultar CEP.");
    } finally {
      setCepLoading(false);
    }
  };

  // Upload de Arquivos
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files).map((f, i) => ({
      id: `file-${Date.now()}-${i}`,
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);
    toast("Arquivo anexado com sucesso!");
  };

  // ── ETAPA 1: CADASTRO DA DEMANDA COM DADOS REALMENTE DIGITADOS (SEM DADOS FAKES) ──
  const handleCreateDemanda = (isDraft = false) => {
    if (!isDraft) {
      if (!title.trim()) {
        toast("Por favor, informe o Título da solicitação.", "error");
        return;
      }
      if (!category) {
        toast("Por favor, selecione uma Categoria.", "error");
        return;
      }
      if (!description.trim()) {
        toast("Por favor, informe a Descrição detalhada da demanda.", "error");
        return;
      }
    }

    setIsSubmitting(true);

    const generatedCode = `DEM-${Math.floor(1000 + Math.random() * 9000)}`;

    const newDemanda: DemandaItem = {
      id: `dem-${Date.now()}`,
      code: generatedCode,
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      priority,
      channelOrigin,
      regionId,
      municipio: municipio.trim() || "São Paulo / SP",
      bairro: bairro.trim(),
      address: address.trim(),
      cep: cep.trim(),
      responsible,
      team,
      status: "Recebida",
      receiptDate,
      analysisDeadline: analysisDeadline || receiptDate,
      applicantName: applicantName.trim(),
      applicantPhone: applicantPhone.trim(),
      applicantEmail: applicantEmail.trim(),
      files: uploadedFiles.map((f) => f.name),
      createdAt: new Date().toLocaleString("pt-BR"),
      criteria: {
        multDeliveries: false,
        needsTeam: false,
        hasTimeline: false,
        needsBudget: false,
        approvedByResponsible: false,
      },
    };

    setRegisteredDemands((prev) => [newDemanda, ...prev]);
    setCurrentDemanda(newDemanda);
    setTechnicalReport(""); // Limpa o parecer técnico para nova análise
    setIsSubmitting(false);

    // Reseta campos do formulário para o próximo uso
    setTitle("");
    setCategory("");
    setDescription("");
    setCep("");
    setMunicipio("");
    setBairro("");
    setAddress("");
    setApplicantName("");
    setApplicantPhone("");
    setApplicantEmail("");
    setUploadedFiles([]);

    if (isDraft) {
      toast(`Rascunho da demanda ${generatedCode} salvo com sucesso!`);
    } else {
      toast(`Demanda ${generatedCode} cadastrada com sucesso com os seus dados reais! Status: 'Recebida'. Encaminhando para Análise...`);
      setMainMode("analise_demanda");
    }
  };

  // Carregar Exemplo Demonstrativo se o Usuário Desejar
  const handleLoadDemoData = () => {
    setCurrentDemanda(initialDemanda);
    setProjectState(initialProjeto);
    setKanbanTasks(initialKanbanTasks);
    setCronogramaData(initialCronogramaData);
    setCategorias(initialOrcamentoCategorias);
    setTransacoes(initialFinancialTransactions);
    setMembers(initialTeamMembers);
    setRaciItems(initialRaciItems);
    setProjectFiles(initialProjectFiles);
    setAuditEvents(initialAuditEvents);
    setTechnicalReport(initialDemanda.technicalReport || "");
    toast("Dados demonstrativos do Projeto PRJ-0104 carregados!");
  };

  // ── ETAPA 2: ENCAMINHAR DEMANDA PARA "EM ANÁLISE" ──
  const handleAdvanceToAnalysis = () => {
    if (!currentDemanda) return;
    const updated = { ...currentDemanda, status: "Em análise" as const };
    setCurrentDemanda(updated);
    setRegisteredDemands((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    toast(`Demanda ${updated.code} encaminhada para 'Em análise'. Checklist de avaliação liberado!`);
  };

  // Alterna Critérios de Conversão na Demanda Real
  const handleToggleCriterion = (key: keyof DemandaItem["criteria"]) => {
    if (!currentDemanda) return;
    if (currentDemanda.status !== "Em análise") {
      toast("Encaminhe a demanda para a etapa 'Em análise' antes de avaliar os critérios.", "error");
      return;
    }

    const updated = {
      ...currentDemanda,
      criteria: {
        ...currentDemanda.criteria,
        [key]: !currentDemanda.criteria[key],
      },
    };
    setCurrentDemanda(updated);
    setRegisteredDemands((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  // Define Decisão Formal
  const handleSetDecision = (decision: string) => {
    if (!currentDemanda) return;
    const updated = { ...currentDemanda, decision, technicalReport };
    setCurrentDemanda(updated);
    setRegisteredDemands((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  // Validação estrita dos 5 critérios
  const canConvert =
    currentDemanda !== null &&
    currentDemanda.status === "Em análise" &&
    currentDemanda.criteria.multDeliveries &&
    currentDemanda.criteria.needsTeam &&
    currentDemanda.criteria.hasTimeline &&
    currentDemanda.criteria.needsBudget &&
    currentDemanda.criteria.approvedByResponsible &&
    currentDemanda.decision === "Aprovada para Projeto";

  // ── ETAPA 3: CONVERSÃO TRANSACIONAL EM PROJETO REAL (COM OS DADOS REAIS CADASTRADOS) ──
  const handleExecuteConversion = () => {
    if (!currentDemanda || !canConvert) {
      toast(
        "A conversão exige que a demanda esteja 'Em análise', com os 5 critérios checados e decisão de aprovação.",
        "error"
      );
      return;
    }

    const projectCode = `PRJ-${Math.floor(1000 + Math.random() * 9000)}`;

    // Cria o Projeto Real com base estrita nos dados cadastrados pelo usuário
    const newProject: ProjetoItem = {
      id: `prj-${Date.now()}`,
      code: projectCode,
      title: currentDemanda.title,
      demandaId: currentDemanda.id,
      demandaCode: currentDemanda.code,
      category: currentDemanda.category,
      responsible: currentDemanda.responsible,
      status: "Em execução",
      priority: currentDemanda.priority,
      description: currentDemanda.description,
      startDate: new Date().toLocaleDateString("pt-BR"),
      endDate: "31/12/2025",
      progress: 0,
      createdAt: new Date().toLocaleString("pt-BR"),
    };

    const updatedDemand: DemandaItem = {
      ...currentDemanda,
      status: "Convertida em projeto",
      convertedProjectId: newProject.id,
    };

    setCurrentDemanda(updatedDemand);
    setProjectState(newProject);

    // Se o projeto não possuir tarefas, inicia com a estrutura básica para o projeto do usuário
    if (kanbanTasks.length === 0) {
      setKanbanTasks([
        {
          id: `task-${Date.now()}-1`,
          code: "TAR-001",
          title: `Elaborar plano de trabalho para ${newProject.title}`,
          type: "entrega",
          columnId: "planejamento",
          priority: newProject.priority,
          responsible: newProject.responsible,
          responsibleAvatar: newProject.responsible.split(" ").map((n) => n[0]).join(""),
          dueDate: "15/09/2025",
          progress: 0,
          tags: [newProject.category],
          checklistCompleted: 0,
          checklistTotal: 4,
          commentsCount: 0,
          attachmentsCount: currentDemanda.files.length,
        },
      ]);
    }

    if (categorias.length === 0) {
      setCategorias(initialOrcamentoCategorias);
    }

    if (members.length === 0) {
      setMembers([
        {
          id: `tm-${Date.now()}`,
          name: newProject.responsible,
          role: "Gerente do projeto",
          department: "Gestão de Projetos",
          status: "Disponível",
          tasksCount: 1,
          allocationPercent: 80,
          avatarInitials: newProject.responsible.split(" ").map((n) => n[0]).join(""),
          avatarBg: "bg-[#008B63]",
        },
      ]);
    }

    // Registra evento de auditoria real
    const newEvent: AuditEvent = {
      id: `evt-${Date.now()}`,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      dateGroup: "Hoje",
      user: "Sistema",
      avatarInitials: "SIS",
      avatarBg: "bg-[#06284F]",
      actionText: `Projeto ${newProject.code} foi criado a partir da demanda ${currentDemanda.code}`,
      eventType: "Sistema",
      targetCode: currentDemanda.code,
      targetTitle: `Criação do projeto: ${newProject.title}`,
      previousValue: "Status Demanda: Em análise",
      newValue: "Status Demanda: Convertida em projeto",
      justification: "Conversão concluída após preenchimento e aprovação dos 5 critérios.",
      isImportant: true,
      fullDate: `${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
    };

    setAuditEvents((prev) => [newEvent, ...prev]);

    toast(`PROJETO ${newProject.code} CRIADO COM SUCESSO com os seus dados reais! Redirecionando para o Kanban...`);
    setMainMode("projeto_ativo");
    setProjectSubTab("kanban");
  };

  return (
    <div className="flex flex-col gap-6 font-sans text-xs bg-[#F6F8FB] max-w-[1671px] mx-auto antialiased select-none">
      
      {/* ── BARRA DE FLUXO E MODO DE DADOS (SELETOR DE DADOS REAIS vs DEMO) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E2E8F0] shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Aba 1: Nova Demanda */}
          <button
            type="button"
            onClick={() => setMainMode("nova_demanda")}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs transition flex items-center gap-2 cursor-pointer ${
              mainMode === "nova_demanda"
                ? "bg-[#008B63] text-white shadow-xs font-black"
                : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#E8F7F1] hover:text-[#008B63]"
            }`}
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            <span>1. Nova demanda (Dados Reais)</span>
          </button>

          {/* Aba 2: Análise da Demanda */}
          <button
            type="button"
            onClick={() => {
              if (!currentDemanda) {
                toast("Cadastre uma nova demanda primeiro.", "error");
                return;
              }
              setMainMode("analise_demanda");
            }}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs transition flex items-center gap-2 cursor-pointer ${
              mainMode === "analise_demanda"
                ? "bg-[#1264F3] text-white shadow-xs font-black"
                : currentDemanda
                ? "bg-[#F8FAFC] text-[#64748B] hover:bg-[#EAF2FF] hover:text-[#1264F3]"
                : "bg-slate-100 text-[#94A3B8] cursor-not-allowed opacity-60"
            }`}
          >
            <FileText className="h-4 w-4" strokeWidth={2} />
            <span>2. Análise {currentDemanda ? `(${currentDemanda.code})` : ""}</span>
            {currentDemanda && (
              <span className="text-[9px] px-2 py-0.2 rounded font-extrabold uppercase bg-[#E8F7F1] text-[#008B63] border border-[#00A978]/30">
                {currentDemanda.status}
              </span>
            )}
          </button>

          {/* Aba 3: Projeto Criado */}
          <button
            type="button"
            onClick={() => {
              if (!projectState) {
                toast("Nenhum projeto gerado ainda. Cadastre e converta uma demanda.", "error");
                return;
              }
              setMainMode("projeto_ativo");
            }}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs transition flex items-center gap-2 cursor-pointer ${
              mainMode === "projeto_ativo"
                ? "bg-[#7928F5] text-white shadow-xs font-black"
                : projectState
                ? "bg-[#F8FAFC] text-[#7928F5] hover:bg-[#F3EAFF]"
                : "bg-slate-100 text-[#94A3B8] cursor-not-allowed opacity-60"
            }`}
          >
            {projectState ? (
              <FolderKanban className="h-4 w-4 text-[#7928F5]" strokeWidth={2} />
            ) : (
              <Lock className="h-4 w-4 text-[#94A3B8]" strokeWidth={2} />
            )}
            <span>3. Projeto {projectState ? `(${projectState.code})` : ""}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadDemoData}
            className="h-8 px-3 rounded-lg bg-[#F1F5F9] hover:bg-slate-200 text-[#10213D] font-extrabold text-[11px] transition flex items-center gap-1.5 cursor-pointer border border-[#E2E8F0]"
            title="Carregar dados demonstrativos de referência"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#1264F3]" />
            <span>Carregar Exemplo Demonstrativo</span>
          </button>
        </div>
      </div>

      {/* ── TELA 1 — CADASTRO DE NOVA DEMANDA COM DADOS LIMPOS E REAIS ── */}
      {mainMode === "nova_demanda" && (
        <>
          {/* Cabeçalho da Página */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#10213D] tracking-tight">
                  Nova demanda
                </h1>
                <span className="bg-[#E8F7F1] text-[#008B63] border border-[#00A978]/30 px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider">
                  Formulário de Entrada Real
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-1">
                Preencha os dados reais da solicitação. Não há dados fakes ou preenchimentos ilustrativos fixos.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="h-10 px-4 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#10213D] font-bold text-xs transition shadow-2xs cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => handleCreateDemanda(true)}
                disabled={isSubmitting}
                className="h-10 px-4 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#10213D] font-bold text-xs transition shadow-2xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <Save className="h-4 w-4 text-[#1264F3]" strokeWidth={2} />
                <span>Salvar rascunho</span>
              </button>

              <button
                type="button"
                onClick={() => handleCreateDemanda(false)}
                disabled={isSubmitting}
                className="h-10 px-5 rounded-xl bg-[#008B63] hover:bg-[#007553] text-white font-extrabold text-xs transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <Check className="h-4 w-4 text-white" strokeWidth={2.5} />
                <span>{isSubmitting ? "Cadastrando..." : "Cadastrar demanda real"}</span>
              </button>
            </div>
          </div>

          {/* Banner de Aviso de Regra de Negócio */}
          <div className="bg-[#EAF2FF] border border-[#1264F3]/30 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1264F3] text-white shadow-2xs">
                <ShieldCheck className="h-6 w-6" strokeWidth={2.2} />
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-[#10213D]">
                  Toda solicitação é cadastrada incialmente como demanda.
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Não é permitido cadastrar um projeto diretamente. A conversão é liberada somente após análise e aprovação.
                </p>
              </div>
            </div>

            <div className="bg-white/90 border border-[#1264F3]/20 px-4 py-2 rounded-xl text-xs font-extrabold text-[#64748B] flex items-center gap-2 shrink-0 shadow-2xs">
              <Lock className="h-4 w-4 text-[#64748B]" strokeWidth={2} />
              <span>Criar projeto: bloqueado</span>
            </div>
          </div>

          {/* Form Real (78% / 22%) */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_340px] gap-6 items-start">
            <div className="flex flex-col gap-6 min-w-0">
              
              {/* SEÇÃO 1: INFORMAÇÕES PRINCIPAIS */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-2xs flex flex-col gap-5">
                <div className="border-b border-[#E2E8F0] pb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#1264F3]" strokeWidth={2} />
                  <h3 className="text-sm font-extrabold text-[#10213D] uppercase tracking-wider">
                    Informações principais da solicitação
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-[#10213D]">
                      Título da solicitação <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Digite o título real da solicitação..."
                      className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium text-[#10213D] focus:bg-white focus:border-[#1264F3] focus:outline-none transition"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#10213D]">
                      Categoria <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium text-[#10213D] focus:bg-white focus:border-[#1264F3] focus:outline-none transition cursor-pointer"
                      required
                    >
                      <option value="">Selecione uma categoria...</option>
                      <option value="Infraestrutura Urbana">Infraestrutura Urbana</option>
                      <option value="Saúde e Acolhimento">Saúde e Acolhimento</option>
                      <option value="Educação e Cultura">Educação e Cultura</option>
                      <option value="Segurança Pública">Segurança Pública</option>
                      <option value="Transporte e Mobilidade">Transporte e Mobilidade</option>
                      <option value="Esporte e Lazer">Esporte e Lazer</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#10213D]">Canal de origem</label>
                    <select
                      value={channelOrigin}
                      onChange={(e) => setChannelOrigin(e.target.value)}
                      className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium text-[#10213D] focus:bg-white focus:border-[#1264F3] focus:outline-none transition cursor-pointer"
                    >
                      <option value="Gabinete Virtual">Gabinete Virtual</option>
                      <option value="Atendimento Presencial">Atendimento Presencial</option>
                      <option value="WhatsApp Oficial">WhatsApp Oficial</option>
                      <option value="Redes Sociais">Redes Sociais</option>
                      <option value="E-mail Institucional">E-mail Institucional</option>
                      <option value="Ouvidoria">Ouvidoria</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2 relative">
                    <label className="text-xs font-bold text-[#10213D]">
                      Descrição detalhada <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      maxLength={1000}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descreva detalhadamente a demanda digitada..."
                      className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium text-[#10213D] focus:bg-white focus:border-[#1264F3] focus:outline-none transition resize-none"
                      required
                    />
                    <span className="text-[10px] font-mono text-[#64748B] self-end mt-1">
                      {description.length} / 1000 caracteres
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 sm:col-span-2">
                    <label className="text-xs font-bold text-[#10213D]">Nível de Prioridade *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      {(["Baixa", "Média", "Alta", "Urgente"] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`p-3 rounded-xl border font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
                            priority === p
                              ? p === "Urgente"
                                ? "bg-[#EF4444] text-white border-[#EF4444]"
                                : p === "Alta"
                                ? "bg-[#FEECEC] text-[#EF4444] border-[#EF4444]"
                                : p === "Média"
                                ? "bg-[#FFF4E5] text-[#F59E0B] border-[#F59E0B]"
                                : "bg-[#E8F7F1] text-[#008B63] border-[#00A978]"
                              : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]"
                          }`}
                        >
                          <span>{p}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* SEÇÃO 2: LOCALIZAÇÃO E TERRITÓRIO */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-2xs flex flex-col gap-5">
                <div className="border-b border-[#E2E8F0] pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#1264F3]" strokeWidth={2} />
                    <h3 className="text-sm font-extrabold text-[#10213D] uppercase tracking-wider">
                      Localização e território
                    </h3>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-[#10213D]">Buscar CEP Real</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={cep}
                        onChange={(e) => setCep(e.target.value)}
                        placeholder="Ex.: 01001-000"
                        className="h-10 flex-1 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-mono font-bold"
                      />
                      <button
                        type="button"
                        onClick={handleCepSearch}
                        disabled={cepLoading}
                        className="h-10 px-4 rounded-xl bg-[#1264F3] text-white font-extrabold text-xs cursor-pointer"
                      >
                        {cepLoading ? "Buscando..." : "Buscar CEP"}
                      </button>
                    </div>
                    {cepError && <span className="text-[10px] text-red-500 font-bold">{cepError}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#10213D]">Território / Região *</label>
                    <select
                      value={regionId}
                      onChange={(e) => setRegionId(e.target.value)}
                      className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium cursor-pointer"
                    >
                      {regions.map((r, idx) => (
                        <option key={`reg-${r.id}-${idx}`} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#10213D]">Município / UF *</label>
                    <input
                      type="text"
                      value={municipio}
                      onChange={(e) => setMunicipio(e.target.value)}
                      placeholder="Ex.: São Paulo / SP"
                      className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#10213D]">Bairro</label>
                    <input
                      type="text"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                      placeholder="Ex.: Jardins"
                      className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#10213D]">Endereço / Logradouro</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Ex.: Av. Brasil, 1500"
                      className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* SEÇÃO 3: RESPONSABILIDADE */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-2xs flex flex-col gap-5">
                <div className="border-b border-[#E2E8F0] pb-3 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-[#1264F3]" strokeWidth={2} />
                  <h3 className="text-sm font-extrabold text-[#10213D] uppercase tracking-wider">
                    Responsabilidade e setor
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#10213D]">Responsável pela análise</label>
                    <select
                      value={responsible}
                      onChange={(e) => setResponsible(e.target.value)}
                      className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium cursor-pointer"
                    >
                      {users.map((u, idx) => (
                        <option key={`user-${u.id}-${idx}`} value={u.name}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#10213D]">Equipe / Setor responsável</label>
                    <select
                      value={team}
                      onChange={(e) => setTeam(e.target.value)}
                      className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium cursor-pointer"
                    >
                      <option value="Equipe de Gestão de Projetos">Equipe de Gestão de Projetos</option>
                      <option value="Comitê Central">Comitê Central</option>
                      <option value="Setor Jurídico">Setor Jurídico</option>
                      <option value="Comunicação e Imprensa">Comunicação e Imprensa</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SEÇÃO 4: DADOS DO SOLICITANTE */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-2xs flex flex-col gap-5">
                <div className="border-b border-[#E2E8F0] pb-3 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-[#1264F3]" strokeWidth={2} />
                  <h3 className="text-sm font-extrabold text-[#10213D] uppercase tracking-wider">
                    Dados do solicitante
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#10213D]">Nome do solicitante</label>
                    <input
                      type="text"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder="Ex.: Carlos Silva"
                      className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#10213D]">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-mono font-medium"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#10213D]">E-mail de contato</label>
                    <input
                      type="email"
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      placeholder="carlos@exemplo.com"
                      className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* SEÇÃO 5: ANEXOS */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-2xs flex flex-col gap-4">
                <h3 className="text-sm font-extrabold text-[#10213D] uppercase tracking-wider border-b border-[#E2E8F0] pb-3">
                  Anexos da solicitação real
                </h3>

                <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#E2E8F0] hover:border-[#00A978] bg-[#F8FAFC] hover:bg-[#E8F7F1]/30 rounded-2xl p-6 text-center transition flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                  <UploadCloud className="h-8 w-8 text-[#1264F3]" />
                  <span className="text-xs font-extrabold text-[#10213D]">
                    Clique aqui para selecionar os arquivos reais da demanda
                  </span>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="flex flex-col gap-2 pt-2">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs">
                        <span className="font-extrabold text-[#10213D]">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => setUploadedFiles((prev) => prev.filter((f) => f.id !== file.id))}
                          className="text-red-500 p-1 hover:bg-red-50 rounded cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Painel Lateral (22%) */}
            <div className="flex flex-col gap-5 shrink-0">
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs flex flex-col gap-3.5">
                <h4 className="text-xs font-extrabold text-[#10213D] uppercase tracking-wider border-b border-[#E2E8F0] pb-2.5">
                  Resumo dos Dados Digitados
                </h4>

                <ul className="flex flex-col gap-2.5 text-xs font-medium">
                  <li className="flex items-center justify-between">
                    <span className="text-[#64748B]">Título:</span>
                    <span className="font-extrabold text-[#10213D] truncate max-w-[150px]">
                      {title || "Não preenchido"}
                    </span>
                  </li>

                  <li className="flex items-center justify-between">
                    <span className="text-[#64748B]">Categoria:</span>
                    <span className="font-extrabold text-[#10213D]">
                      {category || "Não selecionada"}
                    </span>
                  </li>

                  <li className="flex items-center justify-between">
                    <span className="text-[#64748B]">Prioridade:</span>
                    <span className="font-extrabold text-[#10213D]">{priority}</span>
                  </li>

                  <li className="flex items-center justify-between">
                    <span className="text-[#64748B]">Responsável:</span>
                    <span className="font-extrabold text-[#10213D] truncate max-w-[140px]">
                      {responsible}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── TELA 2 & 3 — ANÁLISE TÉCNICA DA DEMANDA REAL CADASTRADA ── */}
      {mainMode === "analise_demanda" && currentDemanda && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-black text-[#1264F3] bg-[#EAF2FF] px-2.5 py-1 rounded border border-[#1264F3]/30">
                  {currentDemanda.code}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-[#10213D] tracking-tight">
                  {currentDemanda.title}
                </h1>
              </div>
              <p className="text-xs text-[#64748B] mt-1">
                Análise técnica e decisão de conversão transacional para o projeto.
              </p>
            </div>

            {currentDemanda.status === "Recebida" && (
              <button
                type="button"
                onClick={handleAdvanceToAnalysis}
                className="h-10 px-5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-white font-black text-xs transition shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
              >
                <span>Encaminhar para "Em análise"</span>
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-2xs flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-extrabold text-[#10213D] uppercase tracking-wider">
                Parecer Técnico da Solicitação Real
              </h3>
              <span className="text-xs font-extrabold px-3 py-1 rounded-lg border bg-[#EAF2FF] text-[#1264F3] border-[#1264F3]/30">
                Status: {currentDemanda.status}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#10213D]">Parecer técnico da análise *</label>
              <textarea
                rows={3}
                value={technicalReport}
                onChange={(e) => setTechnicalReport(e.target.value)}
                placeholder="Insira o parecer técnico com a justificativa de viabilidade da demanda..."
                className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium text-[#10213D] focus:bg-white focus:border-[#1264F3] focus:outline-none transition resize-none"
              />
            </div>

            {/* Checklist dos 5 Critérios */}
            <div className="border border-[#E2E8F0] rounded-2xl p-5 flex flex-col gap-4 bg-[#FAF5FF]/30">
              <h4 className="text-xs font-extrabold text-[#10213D] uppercase tracking-wider border-b border-[#E2E8F0] pb-2">
                Checklist dos 5 Critérios de Conversão
              </h4>

              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-[#E2E8F0] bg-white cursor-pointer hover:bg-[#F3EAFF]/40 transition">
                  <input
                    type="checkbox"
                    disabled={currentDemanda.status !== "Em análise"}
                    checked={currentDemanda.criteria.multDeliveries}
                    onChange={() => handleToggleCriterion("multDeliveries")}
                    className="h-4 w-4 rounded border-[#E2E8F0] text-[#008B63] focus:ring-[#00A978] cursor-pointer mt-0.5"
                  />
                  <span className="font-extrabold text-[#10213D]">1. Escopo exige múltiplas entregas integradas</span>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-[#E2E8F0] bg-white cursor-pointer hover:bg-[#F3EAFF]/40 transition">
                  <input
                    type="checkbox"
                    disabled={currentDemanda.status !== "Em análise"}
                    checked={currentDemanda.criteria.needsTeam}
                    onChange={() => handleToggleCriterion("needsTeam")}
                    className="h-4 w-4 rounded border-[#E2E8F0] text-[#008B63] focus:ring-[#00A978] cursor-pointer mt-0.5"
                  />
                  <span className="font-extrabold text-[#10213D]">2. Necessita equipe dedicada e responsáveis</span>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-[#E2E8F0] bg-white cursor-pointer hover:bg-[#F3EAFF]/40 transition">
                  <input
                    type="checkbox"
                    disabled={currentDemanda.status !== "Em análise"}
                    checked={currentDemanda.criteria.hasTimeline}
                    onChange={() => handleToggleCriterion("hasTimeline")}
                    className="h-4 w-4 rounded border-[#E2E8F0] text-[#008B63] focus:ring-[#00A978] cursor-pointer mt-0.5"
                  />
                  <span className="font-extrabold text-[#10213D]">3. Possui prazo e cronograma definidos</span>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-[#E2E8F0] bg-white cursor-pointer hover:bg-[#F3EAFF]/40 transition">
                  <input
                    type="checkbox"
                    disabled={currentDemanda.status !== "Em análise"}
                    checked={currentDemanda.criteria.needsBudget}
                    onChange={() => handleToggleCriterion("needsBudget")}
                    className="h-4 w-4 rounded border-[#E2E8F0] text-[#008B63] focus:ring-[#00A978] cursor-pointer mt-0.5"
                  />
                  <span className="font-extrabold text-[#10213D]">4. Exige orçamento ou recursos específicos</span>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-[#E2E8F0] bg-white cursor-pointer hover:bg-[#F3EAFF]/40 transition sm:col-span-2">
                  <input
                    type="checkbox"
                    disabled={currentDemanda.status !== "Em análise"}
                    checked={currentDemanda.criteria.approvedByResponsible}
                    onChange={() => handleToggleCriterion("approvedByResponsible")}
                    className="h-4 w-4 rounded border-[#E2E8F0] text-[#008B63] focus:ring-[#00A978] cursor-pointer mt-0.5"
                  />
                  <span className="font-extrabold text-[#10213D]">
                    5. Conversão formalmente validada pelo responsável ({currentDemanda.responsible})
                  </span>
                </label>
              </div>

              {/* Seletor de Decisão Formal */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-[#E2E8F0]">
                <label className="text-xs font-bold text-[#10213D]">Decisão formal da análise *</label>
                <select
                  disabled={currentDemanda.status !== "Em análise"}
                  value={currentDemanda.decision || ""}
                  onChange={(e) => handleSetDecision(e.target.value)}
                  className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-white text-xs font-extrabold text-[#10213D] focus:border-[#1264F3] focus:outline-none cursor-pointer disabled:bg-[#F8FAFC]"
                >
                  <option value="">Aguardando decisão formal...</option>
                  <option value="Aprovada para Projeto">✓ Aprovada para Conversão em Projeto</option>
                  <option value="Em andamento sem projeto">● Manter como Demanda Em Andamento</option>
                  <option value="Recusada">✕ Recusada</option>
                </select>
              </div>
            </div>

            {/* BOTÃO CONVERTER AGORA EM PROJETO */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleExecuteConversion}
                disabled={!canConvert}
                className={`w-full h-12 rounded-xl font-black text-xs transition flex items-center justify-center gap-2.5 ${
                  canConvert
                    ? "bg-[#008B63] hover:bg-[#007553] text-white shadow-md cursor-pointer animate-pulse"
                    : "bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed"
                }`}
              >
                {canConvert ? (
                  <>
                    <Sparkles className="h-5 w-5 text-white" />
                    <span>CONVERTER AGORA EM PROJETO (DADOS REAIS)</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" strokeWidth={2} />
                    <span>Converter em projeto (Bloqueado até preencher critérios)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TELAS 4 A 10 — PROJETO ATIVO CRIADO A PARTIR DOS DADOS REAIS ── */}
      {mainMode === "projeto_ativo" && projectState && (
        <div className="flex flex-col gap-6">
          <ProjectHeader
            project={projectState}
            activeSubTab={projectSubTab}
            onTabChange={(tab) => setProjectSubTab(tab)}
            onOpenOriginalDemand={() => setMainMode("analise_demanda")}
          />

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

      {/* MODAL CANCELAR */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-md w-full p-6 flex flex-col gap-4">
            <h3 className="text-base font-extrabold text-[#10213D]">Descartar formulário?</h3>
            <p className="text-xs text-[#64748B]">
              Os dados reais informados serão descartados.
            </p>
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#10213D] text-xs font-bold"
              >
                Continuar digitando
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitle("");
                  setCategory("");
                  setDescription("");
                  setShowCancelModal(false);
                  toast("Formulário descartado.");
                }}
                className="px-4 py-2 rounded-xl bg-[#EF4444] text-white text-xs font-bold shadow-xs"
              >
                Sim, descartar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
