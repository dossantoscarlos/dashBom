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
} from "lucide-react";

export function DemandasProjetosPanel() {
  const { regions, users } = useDashboard();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // MODO PRINCIPAL DO MÓDULO:
  // "nova_demanda": TELA 1 — CADASTRO DE NOVA DEMANDA (PREMISSA INICIAL OBRIGATÓRIA!)
  // "analise_demanda": TELA 2 & 3 — DETALHES E ANÁLISE DA DEMANDA (ONDE É APROVADA OU NÃO)
  // "projeto_ativo": TELAS 4 A 10 — ACOMPANHAMENTO DO PROJETO CONVERTIDO (DESBLOQUEADO APÓS APROVAÇÃO)
  const [mainMode, setMainMode] = useState<"nova_demanda" | "analise_demanda" | "projeto_ativo">("nova_demanda");

  // Sub-aba ativa do projeto (quando em modo "projeto_ativo")
  const [projectSubTab, setProjectSubTab] = useState<ProjectSubTab>("kanban");

  // Estado da Demanda Atual no Fluxo
  const [currentDemanda, setCurrentDemanda] = useState<DemandaItem>({
    id: "dem-0235",
    code: "DEM-0235",
    title: "",
    category: "",
    description: "",
    priority: "Média",
    channelOrigin: "Gabinete Virtual",
    regionId: regions[0]?.id || "reg-1",
    municipio: "São Paulo / SP",
    bairro: "Centro",
    address: "",
    cep: "",
    responsible: users[0]?.name || "Ana Martins",
    team: "Equipe de Gestão de Projetos",
    status: "Recebida",
    receiptDate: new Date().toISOString().slice(0, 10),
    analysisDeadline: "",
    applicantName: "",
    applicantPhone: "",
    applicantEmail: "",
    files: [],
    createdAt: new Date().toLocaleString("pt-BR"),
    criteria: {
      multDeliveries: false,
      needsTeam: false,
      hasTimeline: false,
      needsBudget: false,
      approvedByResponsible: false,
    },
  });

  // Estado do Projeto Ativo (PRJ-0104)
  const [projectState, setProjectState] = useState<ProjetoItem>(initialProjeto);

  // Sub-Módulos do Projeto
  const [kanbanTasks, setKanbanTasks] = useState<KanbanTask[]>(initialKanbanTasks);
  const [cronogramaData, setCronogramaData] = useState<CronogramaItem[]>(initialCronogramaData);
  const [categorias, setCategorias] = useState<OrcamentoCategoria[]>(initialOrcamentoCategorias);
  const [transacoes, setTransacoes] = useState<FinancialTransaction[]>(initialFinancialTransactions);
  const [members, setMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [raciItems, setRaciItems] = useState<RaciItem[]>(initialRaciItems);
  const [projectFiles, setProjectFiles] = useState<ProjectFileItem[]>(initialProjectFiles);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(initialAuditEvents);

  // Formulário State "Nova Demanda"
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
  const [bairro, setBairro] = useState("");
  const [address, setAddress] = useState("");
  const [responsible, setResponsible] = useState("Ana Martins");
  const [team, setTeam] = useState("Equipe de Gestão de Projetos");
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().slice(0, 10));
  const [analysisDeadline, setAnalysisDeadline] = useState("");
  const [notifyResponsible, setNotifyResponsible] = useState(true);
  const [applicantName, setApplicantName] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [contactChannel, setContactChannel] = useState("");
  const [contactAuthorized, setContactAuthorized] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Parecer Técnico da Análise
  const [technicalReport, setTechnicalReport] = useState(
    "Solicitação de reformas estruturais, iluminação de LED, pavimentação das quadras e implantação de acessibilidade no Centro Esportivo. Apresenta alta viabilidade técnica e impacto social relevante."
  );

  // Busca Automática por CEP
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
      setCepError("Erro de conexão ao consultar CEP.");
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
    toast("Arquivo(s) anexado(s) com sucesso!");
  };

  const handleSimulateAddSampleFile = () => {
    const sample = {
      id: `sample-${Date.now()}`,
      name: `documento_solicitacao_${uploadedFiles.length + 1}.pdf`,
      size: "1.8 MB",
    };
    setUploadedFiles((prev) => [...prev, sample]);
    toast("Anexo de demonstração adicionado!");
  };

  // ── ETAPA 1: CADASCRO DE NOVA DEMANDA ──
  const handleCreateDemanda = (isDraft = false) => {
    if (!isDraft) {
      if (!title.trim()) {
        toast("Por favor, preencha o Título da solicitação.", "error");
        return;
      }
      if (!category) {
        toast("Por favor, selecione uma Categoria.", "error");
        return;
      }
      if (!description.trim()) {
        toast("Por favor, preencha a Descrição da demanda.", "error");
        return;
      }
    }

    setIsSubmitting(true);

    const created: DemandaItem = {
      id: `dem-${Date.now()}`,
      code: "DEM-0235",
      title: title || "Modernização e Qualificação do Centro Esportivo Comunitário",
      category: category || "Infraestrutura Urbana",
      description: description || "Solicitação de reformas estruturais, iluminação de LED e acessibilidade.",
      priority: priority || "Alta",
      channelOrigin: channelOrigin || "Gabinete Virtual",
      regionId,
      municipio,
      bairro: bairro || "Centro",
      address: address || "Av. do Esporte, 500",
      cep,
      responsible: responsible || "Ana Martins",
      team: team || "Equipe de Gestão de Projetos",
      status: "Recebida",
      receiptDate,
      analysisDeadline: analysisDeadline || receiptDate,
      applicantName: applicantName || "Associação de Moradores do Centro",
      applicantPhone,
      applicantEmail,
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

    setCurrentDemanda(created);
    setIsSubmitting(false);

    if (isDraft) {
      toast("Rascunho da demanda salvo com sucesso!");
    } else {
      toast("Demanda DEM-0235 cadastrada com sucesso! Status inicial: 'Recebida'. Encaminhando para Análise...");
      // Avança para a Etapa de Análise
      setMainMode("analise_demanda");
    }
  };

  // ── ETAPA 2: ENCAMINHAR DEMANDA PARA "EM ANÁLISE" ──
  const handleAdvanceToAnalysis = () => {
    setCurrentDemanda((prev) => ({ ...prev, status: "Em análise" }));
    toast("Demanda encaminhada para a etapa 'Em análise'. Checklist de avaliação liberado!");
  };

  // Alterna Critérios de Conversão
  const handleToggleCriterion = (key: keyof DemandaItem["criteria"]) => {
    if (currentDemanda.status !== "Em análise") {
      toast("Encaminhe a demanda para a etapa 'Em análise' antes de preencher os critérios.", "error");
      return;
    }

    setCurrentDemanda((prev) => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        [key]: !prev.criteria[key],
      },
    }));
  };

  // Define Decisão Formal da Análise
  const handleSetDecision = (decision: string) => {
    setCurrentDemanda((prev) => ({ ...prev, decision }));
  };

  // Valida se os 5 critérios estão marcados
  const canConvert =
    currentDemanda.status === "Em análise" &&
    currentDemanda.criteria.multDeliveries &&
    currentDemanda.criteria.needsTeam &&
    currentDemanda.criteria.hasTimeline &&
    currentDemanda.criteria.needsBudget &&
    currentDemanda.criteria.approvedByResponsible &&
    currentDemanda.decision === "Aprovada para Projeto";

  // ── ETAPA 3: OPERAÇÃO TRANSACIONAL DE CONVERSÃO EM PROJETO ──
  const handleExecuteConversion = () => {
    if (!canConvert) {
      toast(
        "A conversão exige que a demanda esteja 'Em análise', com os 5 critérios checados e decisão de aprovação.",
        "error"
      );
      return;
    }

    // Transação de Conversão Efetiva
    const updatedDemand: DemandaItem = {
      ...currentDemanda,
      status: "Convertida em projeto",
      convertedProjectId: "prj-0104",
    };

    setCurrentDemanda(updatedDemand);

    // Registra Evento de Auditoria no Histórico
    const newEvent: AuditEvent = {
      id: `evt-${Date.now()}`,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      dateGroup: "Hoje",
      user: "Sistema",
      avatarInitials: "SIS",
      avatarBg: "bg-[#06284F]",
      actionText: `Projeto ${projectState.code} foi criado a partir da demanda ${currentDemanda.code}`,
      eventType: "Sistema",
      targetCode: currentDemanda.code,
      targetTitle: "Criação do projeto com status Planejamento",
      previousValue: "Status Demanda: Em análise",
      newValue: "Status Demanda: Convertida em projeto",
      justification: "Transação de conversão concluída com 5 critérios validados.",
      isImportant: true,
      fullDate: `${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
    };

    setAuditEvents((prev) => [newEvent, ...prev]);

    toast(`Demanda ${currentDemanda.code} APROVADA e CONVERTIDA com sucesso no Projeto PRJ-0104! Redirecionando para o Kanban...`);
    
    // Redireciona para as Telas de Acompanhamento do Projeto PRJ-0104
    setMainMode("projeto_ativo");
    setProjectSubTab("kanban");
  };

  return (
    <div className="flex flex-col gap-6 font-sans text-xs bg-[#F6F8FB] max-w-[1671px] mx-auto antialiased select-none">
      
      {/* ── BARRA SUPERIOR DE FLUXO CONTEXTUAL DA APLICAÇÃO ── */}
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
            <span>1. Nova demanda</span>
          </button>

          {/* Aba 2: Análise da Demanda */}
          <button
            type="button"
            onClick={() => setMainMode("analise_demanda")}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs transition flex items-center gap-2 cursor-pointer ${
              mainMode === "analise_demanda"
                ? "bg-[#1264F3] text-white shadow-xs font-black"
                : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#EAF2FF] hover:text-[#1264F3]"
            }`}
          >
            <FileText className="h-4 w-4" strokeWidth={2} />
            <span>2. Análise da Demanda ({currentDemanda.code})</span>
            <span
              className={`text-[9px] px-2 py-0.2 rounded font-extrabold uppercase border ${
                currentDemanda.status === "Recebida"
                  ? "bg-[#EAF2FF] text-[#1264F3] border-[#1264F3]/30"
                  : currentDemanda.status === "Em análise"
                  ? "bg-[#FFF4E5] text-[#F59E0B] border-[#F59E0B]/30"
                  : "bg-[#E8F7F1] text-[#008B63] border-[#00A978]/30"
              }`}
            >
              {currentDemanda.status}
            </span>
          </button>

          {/* Aba 3: Projeto Convertido PRJ-0104 */}
          <button
            type="button"
            onClick={() => {
              if (currentDemanda.status !== "Convertida em projeto") {
                toast("O acesso ao Projeto PRJ-0104 só é liberado após concluir a análise e aprovar a conversão.", "error");
                return;
              }
              setMainMode("projeto_ativo");
            }}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs transition flex items-center gap-2 cursor-pointer ${
              mainMode === "projeto_ativo"
                ? "bg-[#7928F5] text-white shadow-xs font-black"
                : currentDemanda.status === "Convertida em projeto"
                ? "bg-[#F8FAFC] text-[#7928F5] hover:bg-[#F3EAFF]"
                : "bg-slate-100 text-[#94A3B8] cursor-not-allowed opacity-60"
            }`}
          >
            {currentDemanda.status === "Convertida em projeto" ? (
              <FolderKanban className="h-4 w-4 text-[#7928F5]" strokeWidth={2} />
            ) : (
              <Lock className="h-4 w-4 text-[#94A3B8]" strokeWidth={2} />
            )}
            <span>3. Projeto PRJ-0104 (Acompanhamento)</span>
          </button>
        </div>

        <span className="text-[10px] font-extrabold text-[#008B63] bg-[#E8F7F1] px-3 py-1 rounded-lg border border-[#00A978]/30 self-start sm:self-auto">
          ● Regra de Negócio: Demanda → Análise → Aprovação → Projeto
        </span>
      </div>

      {/* ── TELA 1 — CADASTRO DE NOVA DEMANDA (PREMISSA INICIAL OBRIGATÓRIA DA TELA) ── */}
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
                  Novo cadastro
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-1">
                Registre a solicitação para análise e encaminhamento.
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
                <span>{isSubmitting ? "Cadastrando..." : "Cadastrar demanda"}</span>
              </button>
            </div>
          </div>

          {/* Banner da Regra de Conversão */}
          <div className="bg-[#EAF2FF] border border-[#1264F3]/30 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1264F3] text-white shadow-2xs">
                <ShieldCheck className="h-6 w-6" strokeWidth={2.2} />
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-[#10213D]">
                  Toda solicitação é cadastrada como demanda.
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  A conversão em projeto será liberada somente após a análise e aprovação.
                </p>
              </div>
            </div>

            <div className="bg-white/90 border border-[#1264F3]/20 px-4 py-2 rounded-xl text-xs font-extrabold text-[#64748B] flex items-center gap-2 shrink-0 shadow-2xs">
              <Lock className="h-4 w-4 text-[#64748B]" strokeWidth={2} />
              <span>Criar projeto: bloqueado</span>
            </div>
          </div>

          {/* Estrutura do Conteúdo: Formulário Principal (78%) e Painel Lateral (22%) */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_340px] gap-6 items-start">
            <div className="flex flex-col gap-6 min-w-0">
              
              {/* SEÇÃO 1: INFORMAÇÕES PRINCIPAIS */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-2xs flex flex-col gap-5">
                <div className="border-b border-[#E2E8F0] pb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#1264F3]" strokeWidth={2} />
                  <h3 className="text-sm font-extrabold text-[#10213D] uppercase tracking-wider">
                    Informações principais
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
                      placeholder="Ex.: Solicitação de iluminação pública na Av. Paulista"
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
                      <option value="">Selecione uma categoria</option>
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
                      <option value="">Selecione o canal</option>
                      <option value="Atendimento Presencial">Atendimento Presencial</option>
                      <option value="WhatsApp Oficial">WhatsApp Oficial</option>
                      <option value="Redes Sociais">Redes Sociais</option>
                      <option value="Gabinete Virtual">Gabinete Virtual</option>
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
                      placeholder="Descreva a necessidade, o contexto e o resultado esperado da demanda..."
                      className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium text-[#10213D] focus:bg-white focus:border-[#1264F3] focus:outline-none transition resize-none"
                      required
                    />
                    <span className="text-[10px] font-mono text-[#64748B] self-end mt-1">
                      {description.length} / 1000 caracteres
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 sm:col-span-2">
                    <label className="text-xs font-bold text-[#10213D]">
                      Nível de Prioridade <span className="text-red-500">*</span>
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <button
                        type="button"
                        onClick={() => setPriority("Baixa")}
                        className={`p-3 rounded-xl border font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
                          priority === "Baixa"
                            ? "bg-[#E8F7F1] text-[#008B63] border-[#00A978] ring-2 ring-[#00A978]/30 shadow-2xs"
                            : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]"
                        }`}
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-[#008B63]" />
                        <span>Baixa</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPriority("Média")}
                        className={`p-3 rounded-xl border font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
                          priority === "Média"
                            ? "bg-[#FFF4E5] text-[#F59E0B] border-[#F59E0B] ring-2 ring-[#F59E0B]/30 shadow-2xs"
                            : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]"
                        }`}
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
                        <span>Média</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPriority("Alta")}
                        className={`p-3 rounded-xl border font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
                          priority === "Alta"
                            ? "bg-[#FEECEC] text-[#EF4444] border-[#EF4444] ring-2 ring-[#EF4444]/30 shadow-2xs"
                            : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]"
                        }`}
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
                        <span>Alta</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPriority("Urgente")}
                        className={`p-3 rounded-xl border font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          priority === "Urgente"
                            ? "bg-[#EF4444] text-white border-[#EF4444] ring-2 ring-[#EF4444]/40 shadow-xs"
                            : "bg-[#F8FAFC] border-[#E2E8F0] text-[#EF4444]"
                        }`}
                      >
                        <AlertTriangle className="h-4 w-4" strokeWidth={2.2} />
                        <span>Urgente</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SEÇÃO 2: LOCALIZAÇÃO E TERRITÓRIO (COM BUSCA VIA CEP) */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-2xs flex flex-col gap-5">
                <div className="border-b border-[#E2E8F0] pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#1264F3]" strokeWidth={2} />
                    <h3 className="text-sm font-extrabold text-[#10213D] uppercase tracking-wider">
                      Localização e território
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => toast("Selecione o ponto no mapa interativo.")}
                    className="h-8 px-3 rounded-lg bg-[#EAF2FF] hover:bg-[#1264F3] text-[#1264F3] hover:text-white font-bold text-xs transition border border-[#1264F3]/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
                    <span>Selecionar no mapa</span>
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-[#10213D] flex items-center justify-between">
                      <span>Buscar Endereço por CEP</span>
                      {cepFound && (
                        <span className="text-[10px] text-[#008B63] font-extrabold">
                          ✓ Localizado automaticamente por CEP!
                        </span>
                      )}
                    </label>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={cep}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "");
                          if (val.length > 8) val = val.slice(0, 8);
                          if (val.length > 5) val = `${val.slice(0, 5)}-${val.slice(5)}`;
                          setCep(val);
                          if (val.replace(/\D/g, "").length === 8) handleCepSearch();
                        }}
                        placeholder="00000-000"
                        className="h-10 flex-1 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-mono font-bold text-[#10213D]"
                      />

                      <button
                        type="button"
                        onClick={handleCepSearch}
                        disabled={cepLoading}
                        className="h-10 px-4 rounded-xl bg-[#1264F3] hover:bg-blue-700 text-white font-extrabold text-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-60 shrink-0"
                      >
                        {cepLoading ? <span>Buscando...</span> : <span>🔍 Buscar CEP</span>}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#10213D]">
                      Território / Região <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={regionId}
                      onChange={(e) => setRegionId(e.target.value)}
                      className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium text-[#10213D] cursor-pointer"
                      required
                    >
                      {regions.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#10213D]">
                      Município / UF <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={municipio}
                      onChange={(e) => setMunicipio(e.target.value)}
                      placeholder="Ex.: São Paulo / SP"
                      className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#10213D]">Bairro</label>
                    <input
                      type="text"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                      placeholder="Ex.: Centro"
                      className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#10213D]">Endereço</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Ex.: Rua das Flores, 123"
                      className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* SEÇÃO 3: RESPONSABILIDADE E PRAZO */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-2xs flex flex-col gap-5">
                <div className="border-b border-[#E2E8F0] pb-3 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-[#1264F3]" strokeWidth={2} />
                  <h3 className="text-sm font-extrabold text-[#10213D] uppercase tracking-wider">
                    Responsabilidade e prazo
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
                      {users.map((u) => (
                        <option key={u.id} value={u.name}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#10213D]">Equipe / Setor</label>
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

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#10213D] flex items-center gap-1">
                      Status inicial <Lock className="h-3 w-3 text-[#1264F3]" strokeWidth={2} />
                    </label>
                    <div className="h-10 px-3.5 rounded-xl border border-[#1264F3]/30 bg-[#EAF2FF] text-xs font-extrabold text-[#1264F3] flex items-center gap-2 cursor-not-allowed">
                      <Lock className="h-3.5 w-3.5 text-[#1264F3]" strokeWidth={2} />
                      <span>Recebida</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#10213D]">Data de recebimento</label>
                    <input
                      type="date"
                      value={receiptDate}
                      onChange={(e) => setReceiptDate(e.target.value)}
                      className="h-10 w-full px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* SEÇÃO 4: ANEXOS */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-2xs flex flex-col gap-4">
                <div className="border-b border-[#E2E8F0] pb-3 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-[#10213D] uppercase tracking-wider">
                    Anexos da solicitação
                  </h3>
                  <button
                    type="button"
                    onClick={handleSimulateAddSampleFile}
                    className="h-8 px-3 rounded-lg bg-[#EAF2FF] hover:bg-[#1264F3] text-[#1264F3] hover:text-white font-bold text-xs transition border border-[#1264F3]/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Anexar Documento Exemplo</span>
                  </button>
                </div>

                <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#E2E8F0] hover:border-[#00A978] bg-[#F8FAFC] hover:bg-[#E8F7F1]/30 rounded-2xl p-6 text-center transition flex flex-col items-center justify-center gap-2 cursor-pointer group select-none"
                >
                  <div className="h-12 w-12 rounded-full bg-[#EAF2FF] group-hover:bg-[#E8F7F1] text-[#1264F3] group-hover:text-[#008B63] flex items-center justify-center transition shadow-2xs">
                    <UploadCloud className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <span className="text-xs font-extrabold text-[#10213D] mt-1">
                    Arraste arquivos aqui ou clique para selecionar
                  </span>
                  <span className="text-[10px] text-[#64748B]">PDF, JPG ou PNG • até 10 MB por arquivo</span>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="flex flex-col gap-2 pt-2">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs">
                        <div className="flex items-center gap-3">
                          <File className="h-5 w-5 text-[#1264F3]" strokeWidth={2} />
                          <span className="font-extrabold text-[#10213D]">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setUploadedFiles((prev) => prev.filter((f) => f.id !== file.id))}
                          className="text-red-500 p-1 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Coluna Direita: Painel Lateral de Acompanhamento (22%) */}
            <div className="flex flex-col gap-5 shrink-0">
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs flex flex-col gap-3.5">
                <h4 className="text-xs font-extrabold text-[#10213D] uppercase tracking-wider border-b border-[#E2E8F0] pb-2.5">
                  Resumo do cadastro
                </h4>

                <ul className="flex flex-col gap-2.5 text-xs font-medium">
                  <li className="flex items-center justify-between">
                    <span className="text-[#64748B]">Tipo:</span>
                    <span className="bg-[#E8F7F1] text-[#008B63] border border-[#00A978]/30 px-2 py-0.5 rounded text-[10px] font-extrabold">
                      Demanda
                    </span>
                  </li>

                  <li className="flex items-center justify-between">
                    <span className="text-[#64748B]">Etapa inicial:</span>
                    <span className="bg-[#EAF2FF] text-[#1264F3] border border-[#1264F3]/30 px-2 py-0.5 rounded text-[10px] font-extrabold">
                      Recebida
                    </span>
                  </li>

                  <li className="flex items-center justify-between">
                    <span className="text-[#64748B]">Análise:</span>
                    <span className="bg-[#FFF4E5] text-[#F59E0B] border border-[#F59E0B]/30 px-2 py-0.5 rounded text-[10px] font-extrabold">
                      Obrigatória
                    </span>
                  </li>

                  <li className="flex items-center justify-between">
                    <span className="text-[#64748B]">Projeto:</span>
                    <span className="bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0] px-2 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-1">
                      <Lock className="h-3 w-3" strokeWidth={2} />
                      <span>Bloqueado</span>
                    </span>
                  </li>

                  <li className="flex items-center justify-between border-t border-[#F1F5F9] pt-2">
                    <span className="text-[#64748B]">Prioridade:</span>
                    <span className="font-extrabold text-[#10213D]">{priority || "Não definida"}</span>
                  </li>

                  <li className="flex items-center justify-between">
                    <span className="text-[#64748B]">Responsável:</span>
                    <span className="font-extrabold text-[#10213D] truncate max-w-[140px]">
                      {responsible || "Não definido"}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Stepper Vertical do Fluxo Obrigatório */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs flex flex-col gap-3.5">
                <h4 className="text-xs font-extrabold text-[#10213D] uppercase tracking-wider border-b border-[#E2E8F0] pb-2.5">
                  Fluxo obrigatório
                </h4>

                <div className="flex flex-col gap-3 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#008B63] text-white font-extrabold text-xs shrink-0 shadow-2xs">
                      1
                    </div>
                    <div className="flex flex-col pt-0.5">
                      <span className="font-extrabold text-[#008B63] flex items-center gap-1.5">
                        Recebida <span className="text-[9px] bg-[#E8F7F1] px-1.5 py-0.2 rounded border border-[#00A978]/30">Ativa</span>
                      </span>
                      <span className="text-[10px] text-[#64748B]">Cadastro inicial efetuado</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 opacity-60">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E2E8F0] text-[#64748B] font-bold text-xs shrink-0">
                      2
                    </div>
                    <div className="flex flex-col pt-0.5">
                      <span className="font-bold text-[#64748B]">Em análise</span>
                      <span className="text-[10px] text-[#94A3B8]">Etapa obrigatória de avaliação</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 opacity-60">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E2E8F0] text-[#64748B] font-bold text-xs shrink-0">
                      3
                    </div>
                    <div className="flex flex-col pt-0.5">
                      <span className="font-bold text-[#64748B]">Decisão da análise</span>
                      <span className="text-[10px] text-[#94A3B8]">Aprovação ou recusa formal</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 opacity-60">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E2E8F0] text-[#64748B] font-bold text-xs shrink-0">
                      <Lock className="h-3.5 w-3.5" strokeWidth={2} />
                    </div>
                    <div className="flex flex-col pt-0.5">
                      <span className="font-bold text-[#64748B]">Conversão aprovada</span>
                      <span className="text-[10px] text-[#94A3B8]">Liberada após análise</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 opacity-60">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E2E8F0] text-[#64748B] font-bold text-xs shrink-0">
                      <Lock className="h-3.5 w-3.5" strokeWidth={2} />
                    </div>
                    <div className="flex flex-col pt-0.5">
                      <span className="font-bold text-[#64748B]">Projeto em planejamento</span>
                      <span className="text-[10px] text-[#94A3B8]">Criação do projeto</span>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-[#64748B] bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0] mt-1">
                  💡 Sem aprovação, a demanda segue para Em andamento ou Concluída.
                </p>
              </div>

              {/* Critérios da Análise Desabilitados na Criação */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs flex flex-col gap-3.5">
                <h4 className="text-xs font-extrabold text-[#10213D] uppercase tracking-wider border-b border-[#E2E8F0] pb-2.5">
                  Critérios da análise
                </h4>

                <ul className="flex flex-col gap-2 text-xs text-[#64748B]">
                  <li className="flex items-center gap-2 opacity-60">
                    <input type="checkbox" disabled className="h-3.5 w-3.5 rounded border-[#E2E8F0]" />
                    <span>Escopo exige múltiplas entregas.</span>
                  </li>
                  <li className="flex items-center gap-2 opacity-60">
                    <input type="checkbox" disabled className="h-3.5 w-3.5 rounded border-[#E2E8F0]" />
                    <span>Necessita equipe e responsáveis.</span>
                  </li>
                  <li className="flex items-center gap-2 opacity-60">
                    <input type="checkbox" disabled className="h-3.5 w-3.5 rounded border-[#E2E8F0]" />
                    <span>Possui prazo ou cronograma.</span>
                  </li>
                  <li className="flex items-center gap-2 opacity-60">
                    <input type="checkbox" disabled className="h-3.5 w-3.5 rounded border-[#E2E8F0]" />
                    <span>Exige orçamento ou recursos.</span>
                  </li>
                  <li className="flex items-center gap-2 opacity-60">
                    <input type="checkbox" disabled className="h-3.5 w-3.5 rounded border-[#E2E8F0]" />
                    <span>Conversão aprovada pelo responsável.</span>
                  </li>
                </ul>

                <div className="pt-2 flex flex-col gap-1.5">
                  <button
                    type="button"
                    disabled
                    className="w-full h-11 bg-[#E2E8F0] text-[#94A3B8] font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-not-allowed shadow-none"
                  >
                    <Lock className="h-4 w-4" strokeWidth={2} />
                    <span>Converter em projeto</span>
                  </button>
                  <span className="text-[10px] text-[#64748B] text-center font-medium">
                    Disponível após concluir e aprovar a análise.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── TELA 2 & 3 — DETALHES E ANÁLISE DA DEMANDA CADASTRADA (ETAPA DE APROVAÇÃO/RECUSA) ── */}
      {mainMode === "analise_demanda" && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-black text-[#1264F3] bg-[#EAF2FF] px-2.5 py-1 rounded border border-[#1264F3]/30">
                  {currentDemanda.code}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-[#10213D] tracking-tight">
                  {currentDemanda.title || "Modernização e Qualificação do Centro Esportivo"}
                </h1>
              </div>
              <p className="text-xs text-[#64748B] mt-1">
                Análise técnica e decisão de conversão transacional para o projeto.
              </p>
            </div>

            {/* Ação de Avançar Status: Recebida -> Em análise */}
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

          {/* Parecer Técnico e Checklist Interativo dos 5 Critérios da Análise */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-2xs flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-extrabold text-[#10213D] uppercase tracking-wider">
                Formulário da Análise Técnica
              </h3>
              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-lg border ${
                  currentDemanda.status === "Em análise"
                    ? "bg-[#FFF4E5] text-[#F59E0B] border-[#F59E0B]/30"
                    : "bg-[#E8F7F1] text-[#008B63] border-[#00A978]/30"
                }`}
              >
                Status: {currentDemanda.status}
              </span>
            </div>

            {/* Textarea Parecer Técnico */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#10213D]">Parecer técnico obrigatório *</label>
              <textarea
                rows={3}
                value={technicalReport}
                onChange={(e) => setTechnicalReport(e.target.value)}
                placeholder="Insira o parecer técnico detalhado..."
                className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium text-[#10213D] focus:bg-white focus:border-[#1264F3] focus:outline-none transition resize-none"
              />
            </div>

            {/* Checklist dos 5 Critérios de Conversão */}
            <div className="border border-[#E2E8F0] rounded-2xl p-5 flex flex-col gap-4 bg-[#FAF5FF]/30">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <div>
                  <h4 className="text-xs font-extrabold text-[#10213D] uppercase tracking-wider">
                    Checklist dos 5 Critérios de Conversão (Marque para habilitar)
                  </h4>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    {currentDemanda.status === "Em análise"
                      ? "Marque todos os 5 critérios para desbloquear o botão de conversão em projeto."
                      : "Clique em 'Encaminhar para Em análise' acima para habilitar o preenchimento."}
                  </p>
                </div>

                <span className="text-xs font-extrabold text-[#7928F5] bg-[#F3EAFF] px-3 py-1 rounded-lg border border-[#7928F5]/30">
                  Etapa de Avaliação
                </span>
              </div>

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

            {/* BOTÃO TRANSACIONAL DE CONVERSÃO (DESBLOQUEADO SE CRITÉRIOS = OK) */}
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
                    <span>CONVERTER AGORA EM PROJETO (DESBLOQUEADO)</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" strokeWidth={2} />
                    <span>Converter em projeto (Bloqueado)</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-[#64748B] text-center font-medium">
                {canConvert
                  ? "✓ Requisitos atendidos! Clique para executar a conversão transacional para o Projeto PRJ-0104."
                  : "🔒 Requisitos pendentes: Estar em 'Em análise', marcar os 5 critérios e selecionar 'Aprovada para Projeto'."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TELAS 4 A 10 — ACOMPANHAMENTO DO PROJETO CONVERTIDO (LIBERADO APÓS APROVAÇÃO E CONVERSÃO) ── */}
      {mainMode === "projeto_ativo" && (
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

      {/* MODAL CONFIRMAÇÃO DE CANCELAMENTO */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-md w-full p-6 flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
            <h3 className="text-base font-extrabold text-[#10213D]">
              Cancelar cadastro de demanda?
            </h3>
            <p className="text-xs text-[#64748B]">
              As informações não salvas serão perdidas. Deseja descartar o formulário?
            </p>
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#10213D] text-xs font-bold"
              >
                Continuar preenchendo
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCancelModal(false);
                  toast("Cadastro descartado.");
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
