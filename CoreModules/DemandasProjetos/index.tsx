"use client";

import React, { useState, useRef, useEffect } from "react";
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
import { AcompanhamentoDemandasProjetos } from "./AcompanhamentoDemandasProjetos";

export { AcompanhamentoDemandasProjetos };


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
  Search,
  ArrowLeft,
  RefreshCw,
  Eye,
  Download,
  Wallet,
  Printer,
} from "lucide-react";

// Emissão automatizada do Parecer Técnico Circunstanciado com Escopo, Documentos e Orçamento
export const generateConsolidatedTechnicalReport = (demanda: DemandaItem) => {
  const docsList =
    demanda.files && demanda.files.length > 0
      ? demanda.files.map((f, i) => `   ${i + 1}. [DOCUMENTO ANEXO] ${f}`).join("\n")
      : "   1. [MEMORIAL PRELIMINAR] Levantamento e diagnóstico inicial registrado digitalmente.";

  const budgetFormatted =
    demanda.hasBudget || (demanda.estimatedBudget && demanda.estimatedBudget > 0)
      ? `R$ ${(demanda.estimatedBudget || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (Fonte: ${demanda.budgetSource || "Dotação Orçamentária Geral / Fundo Municipal"})`
      : "Sem dotação orçamentária prévia vinculada (Recursos a serem alocados na conversão do projeto)";

  return `PARECER TÉCNICO CIRCUNSTANCIADO DE VIABILIDADE
Nº REGISTRO: ${demanda.code} | DATA DE EMISSÃO: ${new Date().toLocaleDateString("pt-BR")}

1. DESCRIÇÃO E ESCOPO DA DEMANDA:
- Título da Solicitação: ${demanda.title}
- Solicitante: ${demanda.applicantName || "Cidadão / Entidade Solicitante"} (Contato: ${demanda.applicantPhone || "Não informado"} | ${demanda.applicantEmail || "Não informado"})
- Localização: ${demanda.address || "Endereço registrado"}, ${demanda.bairro || "Bairro"} — ${demanda.municipio || "São Paulo / SP"} (CEP: ${demanda.cep || "Não informado"})
- Eixo Temático: ${demanda.category} | Prioridade: ${demanda.priority}
- Objeto Detalhado: ${demanda.description}

2. DOCUMENTAÇÃO TÉCNICA E ANEXOS ANALISADOS:
${docsList}
- Diagnóstico Documental: Peças técnicas conferidas e em conformidade com as diretrizes regulatórias.

3. PREVISÃO E DOTAÇÃO ORÇAMENTÁRIA:
- Dotação Estimada: ${budgetFormatted}
- Viabilidade Econômica: Demanda compatível com a capacidade executiva e planejamento de investimentos.

4. CONCLUSÃO TÉCNICA E RECOMENDAÇÃO:
A solicitação atende aos critérios de interesse público, consistência técnica e viabilidade operacional. Recomendamos a HOMOLOGAÇÃO e CONVERSÃO DA DEMANDA EM PROJETO PÚBLICO para início imediato das entregas e cronograma de trabalho.`;
};

export function DemandasProjetosPanel() {
  const { regions, users } = useDashboard();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // MODO PRINCIPAL DO MÓDULO:
  const [mainMode, setMainMode] = useState<"acompanhamento" | "nova_demanda" | "analise_demanda" | "projeto_ativo">("acompanhamento");


  // Sub-aba ativa do projeto
  const [projectSubTab, setProjectSubTab] = useState<ProjectSubTab>("kanban");

  // Lista de Demandas Cadastradas no Sistema
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

  // ── SISTEMA DE PERSISTÊNCIA EM LOCALSTORAGE E API ──
  const STORAGE_KEYS = {
    REGISTERED_DEMANDS: "campanhapro_demandas_list",
    CURRENT_DEMANDA: "campanhapro_current_demanda",
    PROJECT_STATE: "campanhapro_project_state",
    MAIN_MODE: "campanhapro_demandas_main_mode",
    PROJECT_SUBTAB: "campanhapro_project_subtab",
    KANBAN_TASKS: "campanhapro_kanban_tasks",
    CRONOGRAMA_DATA: "campanhapro_cronograma_data",
    CATEGORIAS: "campanhapro_orcamento_categorias",
    TRANSACOES: "campanhapro_financial_transactions",
    MEMBERS: "campanhapro_team_members",
    RACI_ITEMS: "campanhapro_raci_items",
    PROJECT_FILES: "campanhapro_project_files",
    AUDIT_EVENTS: "campanhapro_audit_events",
    TECHNICAL_REPORT: "campanhapro_technical_report",
  };

  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar dados salvos no recarregamento da página (Mount)
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedDemands = localStorage.getItem(STORAGE_KEYS.REGISTERED_DEMANDS);
      if (savedDemands) {
        const parsed = JSON.parse(savedDemands);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRegisteredDemands(parsed);
        }
      }

      const savedCurrentDemanda = localStorage.getItem(STORAGE_KEYS.CURRENT_DEMANDA);
      if (savedCurrentDemanda) {
        setCurrentDemanda(JSON.parse(savedCurrentDemanda));
      }

      const savedProjectState = localStorage.getItem(STORAGE_KEYS.PROJECT_STATE);
      if (savedProjectState) {
        setProjectState(JSON.parse(savedProjectState));
      }

      const savedMainMode = localStorage.getItem(STORAGE_KEYS.MAIN_MODE);
      if (savedMainMode && savedMainMode === "acompanhamento") {
        setMainMode("acompanhamento");
      } else {
        setMainMode("acompanhamento");
      }


      const savedSubTab = localStorage.getItem(STORAGE_KEYS.PROJECT_SUBTAB);
      if (savedSubTab) {
        setProjectSubTab(savedSubTab as any);
      }

      const savedKanban = localStorage.getItem(STORAGE_KEYS.KANBAN_TASKS);
      if (savedKanban) {
        setKanbanTasks(JSON.parse(savedKanban));
      }

      const savedCronograma = localStorage.getItem(STORAGE_KEYS.CRONOGRAMA_DATA);
      if (savedCronograma) {
        setCronogramaData(JSON.parse(savedCronograma));
      }

      const savedCategorias = localStorage.getItem(STORAGE_KEYS.CATEGORIAS);
      if (savedCategorias) {
        setCategorias(JSON.parse(savedCategorias));
      }

      const savedTransacoes = localStorage.getItem(STORAGE_KEYS.TRANSACOES);
      if (savedTransacoes) {
        setTransacoes(JSON.parse(savedTransacoes));
      }

      const savedMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      if (savedMembers) {
        setMembers(JSON.parse(savedMembers));
      }

      const savedRaci = localStorage.getItem(STORAGE_KEYS.RACI_ITEMS);
      if (savedRaci) {
        setRaciItems(JSON.parse(savedRaci));
      }

      const savedFiles = localStorage.getItem(STORAGE_KEYS.PROJECT_FILES);
      if (savedFiles) {
        setProjectFiles(JSON.parse(savedFiles));
      }

      const savedAudit = localStorage.getItem(STORAGE_KEYS.AUDIT_EVENTS);
      if (savedAudit) {
        setAuditEvents(JSON.parse(savedAudit));
      }

      const savedReport = localStorage.getItem(STORAGE_KEYS.TECHNICAL_REPORT);
      if (savedReport) {
        setTechnicalReport(savedReport);
      }
    } catch (e) {
      console.error("Erro ao recarregar dados de demandas do localStorage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Salvar automaticamente no localStorage sempre que houver modificação nos dados
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.REGISTERED_DEMANDS, JSON.stringify(registeredDemands));
  }, [registeredDemands, isLoaded]);

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    if (currentDemanda) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_DEMANDA, JSON.stringify(currentDemanda));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_DEMANDA);
    }
  }, [currentDemanda, isLoaded]);

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    if (projectState) {
      localStorage.setItem(STORAGE_KEYS.PROJECT_STATE, JSON.stringify(projectState));
    } else {
      localStorage.removeItem(STORAGE_KEYS.PROJECT_STATE);
    }
  }, [projectState, isLoaded]);

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.MAIN_MODE, mainMode);
  }, [mainMode, isLoaded]);

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.PROJECT_SUBTAB, projectSubTab);
  }, [projectSubTab, isLoaded]);

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.KANBAN_TASKS, JSON.stringify(kanbanTasks));
  }, [kanbanTasks, isLoaded]);

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.CRONOGRAMA_DATA, JSON.stringify(cronogramaData));
  }, [cronogramaData, isLoaded]);

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.CATEGORIAS, JSON.stringify(categorias));
  }, [categorias, isLoaded]);

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.TRANSACOES, JSON.stringify(transacoes));
  }, [transacoes, isLoaded]);

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  }, [members, isLoaded]);

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.RACI_ITEMS, JSON.stringify(raciItems));
  }, [raciItems, isLoaded]);

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.PROJECT_FILES, JSON.stringify(projectFiles));
  }, [projectFiles, isLoaded]);

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.AUDIT_EVENTS, JSON.stringify(auditEvents));
  }, [auditEvents, isLoaded]);

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
  const [hasBudget, setHasBudget] = useState(false);
  const [estimatedBudget, setEstimatedBudget] = useState("");
  const [budgetSource, setBudgetSource] = useState("Dotação Orçamentária Geral");
  const [approverName, setApproverName] = useState("Ana Martins");
  const [approverRole, setApproverRole] = useState("Coordenadora de Projetos / Gestora Técnica");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Parecer Técnico da Análise
  const [technicalReport, setTechnicalReport] = useState("");

  // Mantém o parecer técnico sempre populado com a descrição, documentações e orçamento da demanda ativa
  useEffect(() => {
    if (currentDemanda) {
      const rep =
        currentDemanda.technicalReport && currentDemanda.technicalReport.trim().length > 0
          ? currentDemanda.technicalReport
          : generateConsolidatedTechnicalReport(currentDemanda);
      setTechnicalReport(rep);
      if (currentDemanda.approvedBy) {
        setApproverName(currentDemanda.approvedBy);
      }
      if (currentDemanda.approvalRole) {
        setApproverRole(currentDemanda.approvalRole);
      }
    }
  }, [currentDemanda?.id, currentDemanda?.code, currentDemanda?.files?.length, currentDemanda?.status]);

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
      if (uploadedFiles.length === 0) {
        toast("É obrigatório anexar pelo menos um documento técnico para cadastrar e avançar com a demanda.", "error");
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
      hasBudget,
      estimatedBudget: hasBudget && estimatedBudget ? parseFloat(estimatedBudget.replace(",", ".")) : 0,
      budgetSource: hasBudget ? budgetSource : undefined,
      createdAt: new Date().toLocaleString("pt-BR"),
      criteria: {
        multDeliveries: false,
        needsTeam: false,
        hasTimeline: false,
        needsBudget: false,
        approvedByResponsible: false,
      },
    };

    // Gera o parecer técnico consolidado imediatamente para a nova demanda
    const reportContent = generateConsolidatedTechnicalReport(newDemanda);
    newDemanda.technicalReport = reportContent;

    setRegisteredDemands((prev) => [newDemanda, ...prev]);
    setCurrentDemanda(newDemanda);
    setTechnicalReport(reportContent);
    setIsSubmitting(false);

    // Sincroniza via API REST no servidor
    fetch("/api/demandas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newDemanda),
    }).catch(() => {});

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
    setHasBudget(false);
    setEstimatedBudget("");
    setBudgetSource("Dotação Orçamentária Geral");

    if (isDraft) {
      toast(`Rascunho da demanda ${generatedCode} salvo com sucesso!`);
    } else {
      toast(`Demanda ${generatedCode} cadastrada com sucesso! Parecer Técnico inicial gerado.`);
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

  // ── ETAPA 2: INICIAR ANÁLISE TÉCNICA E EMITIR PARECER AUTOMÁTICO ──
  const handleAdvanceToAnalysis = () => {
    if (!currentDemanda) return;
    if (!currentDemanda.files || currentDemanda.files.length === 0) {
      toast("É obrigatório anexar pelo menos um documento técnico para iniciar a Análise Técnica.", "error");
      return;
    }
    const reportText = generateConsolidatedTechnicalReport(currentDemanda);
    setTechnicalReport(reportText);

    const updated: DemandaItem = {
      ...currentDemanda,
      status: "Em análise",
      technicalReport: reportText,
      criteria: {
        multDeliveries: true,
        needsTeam: true,
        hasTimeline: true,
        needsBudget: true,
        approvedByResponsible: false, // Aguarda a etapa seguinte: aprovação formal da autoridade
      },
    };
    setCurrentDemanda(updated);
    setRegisteredDemands((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    toast(`Análise Técnica iniciada! Parecer Técnico com documentações e orçamento gerado com sucesso.`);
  };

  // ── ETAPA 3: SOLICITAR E HOMOLOGAR APROVAÇÃO FORMAL ──
  const handleApproveDemand = () => {
    if (!currentDemanda) return;
    const finalApprover = approverName.trim() || currentDemanda.responsible || "Ana Martins";
    const finalRole = approverRole.trim() || "Coordenadora de Projetos / Gestora Técnica";
    const approvalDate = new Date().toLocaleString("pt-BR");

    const updated: DemandaItem = {
      ...currentDemanda,
      decision: "Aprovada para Projeto",
      technicalReport: technicalReport || generateConsolidatedTechnicalReport(currentDemanda),
      approvedBy: finalApprover,
      approvalRole: finalRole,
      approvalDate,
      criteria: {
        ...currentDemanda.criteria,
        approvedByResponsible: true,
      },
    };

    setCurrentDemanda(updated);
    setRegisteredDemands((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    toast(`Demanda ${updated.code} homologada e aprovada por ${finalApprover}! Liberação para conversão em projeto concluída.`);
  };

  // Alterna Critérios de Conversão na Demanda Real
  const handleToggleCriterion = (key: keyof DemandaItem["criteria"]) => {
    if (!currentDemanda) return;
    if (currentDemanda.status !== "Em análise") {
      toast("Inicie a Análise Técnica antes de avaliar os critérios.", "error");
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
    const isApproved = decision === "Aprovada para Projeto";
    const updated: DemandaItem = {
      ...currentDemanda,
      decision,
      technicalReport,
      approvedBy: isApproved ? (approverName || currentDemanda.responsible || "Ana Martins") : currentDemanda.approvedBy,
      approvalDate: isApproved ? new Date().toLocaleString("pt-BR") : currentDemanda.approvalDate,
      approvalRole: isApproved ? (approverRole || "Coordenadora de Projetos / Gestora Técnica") : currentDemanda.approvalRole,
      criteria: {
        ...currentDemanda.criteria,
        approvedByResponsible: isApproved ? true : currentDemanda.criteria.approvedByResponsible,
      },
    };
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
      {/* ── TELA 0 — ACOMPANHAMENTO EXECUTIVO DE DEMANDAS E PROJETOS ── */}
      {mainMode === "acompanhamento" && (
        <AcompanhamentoDemandasProjetos
          onOpenNovaDemanda={() => setMainMode("nova_demanda")}
          onOpenAnaliseDemanda={(item: any) => {
            setCurrentDemanda({
              id: item.id || `dem-${Date.now()}`,
              code: item.code || "DEM-2026-0104",
              title: item.title || "Solicitação sem título",
              category: "Infraestrutura e Obras Públicas",
              description: item.description || item.title || "",
              priority: item.priority?.label || "Média",
              channelOrigin: "Gabinete Virtual",
              regionId: "reg-01",
              municipio: "Rio de Janeiro / RJ",
              bairro: "Bairro Central",
              address: "Rua Principal, 100",
              cep: "21380-000",
              responsible: item.assignee?.name || "Ana Martins",
              team: "Equipe de Gestão de Projetos",
              status: item.status?.label || "Em análise",
              receiptDate: item.createdAt ? item.createdAt.substring(0, 10) : "2026-08-01",
              analysisDeadline: item.deadline || "2026-09-01",
              applicantName: item.requestingArea?.name || "Associação de Moradores",
              applicantPhone: "(21) 98765-4321",
              applicantEmail: "contato@solicitante.org.br",
              files: ["memorial_descritivo.pdf"],
              createdAt: item.createdAt || "2026-08-01 14:30:00",
              criteria: {
                multDeliveries: true,
                needsTeam: true,
                hasTimeline: true,
                needsBudget: true,
                approvedByResponsible: true,
              },
              decision: "Aprovada para Projeto",
              technicalReport: "Demanda tecnicamente viável após parecer da equipe de engenharia.",
            });
            setMainMode("analise_demanda");
          }}
          onOpenProjetoAtivo={(item: any) => {
            setProjectState({
              id: item.id || `prj-${Date.now()}`,
              code: item.code || "PRJ-2026-0042",
              title: item.title || "Projeto sem título",
              demandaId: `dem-${item.id}`,
              demandaCode: item.code || "DEM-2026-0104",
              category: "Infraestrutura",
              responsible: item.assignee?.name || "Carlos Eduardo Santos",
              status: "Em execução",
              priority: item.priority?.label || "Urgente",
              description: item.description || item.title || "",
              startDate: item.startDate || "01/08/2026",
              endDate: item.deadline || "31/12/2026",
              progress: item.progress?.percentage || 35,
              createdAt: item.createdAt || "2026-08-01 08:00:00",
            });
            setMainMode("projeto_ativo");
          }}
        />
      )}

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

              {/* SEÇÃO 5: PREVISÃO ORÇAMENTÁRIA */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-2xs flex flex-col gap-5">
                <div className="border-b border-[#E2E8F0] pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-[#1264F3]" strokeWidth={2} />
                    <h3 className="text-sm font-extrabold text-[#10213D] uppercase tracking-wider">
                      Previsão e Dotação Orçamentária
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-[#64748B]">Obrigatório informar se tem orçamento</span>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                    <input
                      type="checkbox"
                      id="chk-has-budget"
                      checked={hasBudget}
                      onChange={(e) => setHasBudget(e.target.checked)}
                      className="h-4 w-4 rounded border-[#E2E8F0] text-[#008B63] focus:ring-[#00A978] cursor-pointer"
                    />
                    <label htmlFor="chk-has-budget" className="text-xs font-extrabold text-[#10213D] cursor-pointer flex-1">
                      Esta demanda possui orçamento previsto, verba vinculada ou dotação estimada?
                    </label>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                        hasBudget
                          ? "bg-[#E8F7F1] text-[#008B63] border-[#00A978]/30"
                          : "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]"
                      }`}
                    >
                      {hasBudget ? "Sim (Com Orçamento)" : "Não (Sem Orçamento)"}
                    </span>
                  </div>

                  {hasBudget && (
                    <div className="grid gap-4 sm:grid-cols-2 p-4 bg-[#F0FDF4] border border-[#86EFAC]/50 rounded-xl">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#10213D]">
                          Valor estimado do orçamento (R$) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={estimatedBudget}
                          onChange={(e) => setEstimatedBudget(e.target.value)}
                          placeholder="Ex.: 150000.00"
                          className="h-10 px-3.5 rounded-xl border border-[#86EFAC] bg-white text-xs font-mono font-bold text-[#10213D] focus:border-[#008B63] focus:outline-hidden"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#10213D]">
                          Fonte de recursos / Centro de custo
                        </label>
                        <input
                          type="text"
                          value={budgetSource}
                          onChange={(e) => setBudgetSource(e.target.value)}
                          placeholder="Ex.: Secretaria de Obras / Emenda Parlamentar"
                          className="h-10 px-3.5 rounded-xl border border-[#86EFAC] bg-white text-xs font-medium text-[#10213D] focus:border-[#008B63] focus:outline-hidden"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SEÇÃO 6: ANEXOS */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-2xs flex flex-col gap-4">
                <div className="border-b border-[#E2E8F0] pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#1264F3]" strokeWidth={2} />
                    <h3 className="text-sm font-extrabold text-[#10213D] uppercase tracking-wider">
                      Documentação Técnica e Anexos <span className="text-red-500">*</span>
                    </h3>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                      uploadedFiles.length > 0
                        ? "bg-[#E8F7F1] text-[#008B63] border-[#00A978]/30"
                        : "bg-red-50 text-red-600 border-red-200"
                    }`}
                  >
                    {uploadedFiles.length > 0 ? `${uploadedFiles.length} documento(s) anexado(s)` : "* Mínimo 1 anexo obrigatório"}
                  </span>
                </div>

                <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#E2E8F0] hover:border-[#00A978] bg-[#F8FAFC] hover:bg-[#E8F7F1]/30 rounded-2xl p-6 text-center transition flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                  <UploadCloud className="h-8 w-8 text-[#1264F3]" />
                  <span className="text-xs font-extrabold text-[#10213D]">
                    Clique aqui para selecionar os arquivos reais da demanda (PDF, DWG, DOCX, imagens)
                  </span>
                  <span className="text-[11px] text-[#64748B]">
                    Obrigatório anexar pelo menos um documento para cadastrar e avançar
                  </span>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="flex flex-col gap-2 pt-2">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-[#1264F3]" />
                          <span className="font-extrabold text-[#10213D]">{file.name}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (file.url && file.url !== "#") {
                                window.open(file.url, "_blank");
                              } else {
                                alert(`Visualizando documento: ${file.name}`);
                              }
                            }}
                            className="px-2.5 py-1 bg-white border border-[#E2E8F0] text-[#10213D] hover:bg-slate-100 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Eye className="h-3 w-3 text-[#1264F3]" />
                            <span>Visualizar</span>
                          </button>

                          <a
                            href={file.url}
                            download={file.name}
                            className="px-2.5 py-1 bg-[#008B63] hover:bg-[#007553] text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Download className="h-3 w-3" />
                            <span>Baixar</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => setUploadedFiles((prev) => prev.filter((f) => f.id !== file.id))}
                            className="text-red-500 p-1 hover:bg-red-50 rounded cursor-pointer"
                            title="Remover arquivo"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
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
                Fluxo de emissão do parecer técnico consolidado, aprovação institucional e conversão em projeto.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* BOTÃO IMPRIMIR/EXPORTAR PARECER */}
              <button
                type="button"
                onClick={() => window.print()}
                className="h-10 px-4 rounded-xl bg-white border border-[#DCE2EA] hover:bg-[#F8FAFC] text-[#0F172A] font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Printer className="h-4 w-4 text-[#1264F3]" />
                <span>Imprimir Parecer</span>
              </button>

              {currentDemanda.status === "Recebida" ? (
                <button
                  type="button"
                  onClick={handleAdvanceToAnalysis}
                  className="h-10 px-5 rounded-xl bg-[#008B63] hover:bg-[#007553] text-white font-black text-xs transition shadow-md flex items-center gap-2 cursor-pointer animate-pulse shrink-0"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>INICIAR ANÁLISE TÉCNICA E EMITIR PARECER</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const r = generateConsolidatedTechnicalReport(currentDemanda);
                    setTechnicalReport(r);
                    toast("Parecer Técnico reemitido e atualizado com a descrição, documentações e orçamento!");
                  }}
                  className="h-10 px-4 rounded-xl bg-[#EFF6FF] text-[#1264F3] hover:bg-[#DBEAFE] font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Reemitir Parecer Consolidado</span>
                </button>
              )}
            </div>
          </div>

          {/* BARRA DE ETAPAS VISUAL DO FLUXO */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-white border border-[#E2E8F0] rounded-xl flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-[#EAF2FF] text-[#1264F3] font-black text-xs flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <span className="font-extrabold text-[#10213D] text-xs block">1. Parecer Técnico Emitido</span>
                <span className="text-[10px] text-[#64748B]">Escopo, Documentos e Orçamento</span>
              </div>
            </div>

            <div
              className={`p-3.5 border rounded-xl flex items-center gap-3 ${
                currentDemanda.approvedBy
                  ? "bg-[#ECFDF5] border-[#A7F3D0]"
                  : "bg-white border-[#E2E8F0]"
              }`}
            >
              <div
                className={`h-8 w-8 rounded-full font-black text-xs flex items-center justify-center shrink-0 ${
                  currentDemanda.approvedBy
                    ? "bg-[#059669] text-white"
                    : "bg-[#F3EAFF] text-[#7C3AED]"
                }`}
              >
                {currentDemanda.approvedBy ? "✓" : "2"}
              </div>
              <div>
                <span className="font-extrabold text-[#10213D] text-xs block">2. Homologação & Aprovação</span>
                <span className="text-[10px] text-[#64748B]">
                  {currentDemanda.approvedBy ? `Aprovado por ${currentDemanda.approvedBy}` : "Aguardando homologação"}
                </span>
              </div>
            </div>

            <div
              className={`p-3.5 border rounded-xl flex items-center gap-3 ${
                canConvert ? "bg-[#F0FDF4] border-[#86EFAC]" : "bg-[#F8FAFC] border-[#E2E8F0]"
              }`}
            >
              <div
                className={`h-8 w-8 rounded-full font-black text-xs flex items-center justify-center shrink-0 ${
                  canConvert ? "bg-[#008B63] text-white" : "bg-[#E2E8F0] text-[#94A3B8]"
                }`}
              >
                3
              </div>
              <div>
                <span className="font-extrabold text-[#10213D] text-xs block">3. Conversão em Projeto</span>
                <span className="text-[10px] text-[#64748B]">
                  {canConvert ? "Pronto para conversão" : "Bloqueado até aprovação"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-2xs flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#1264F3]" />
                <h3 className="text-sm font-extrabold text-[#10213D] uppercase tracking-wider">
                  Parecer Técnico Circunstanciado de Viabilidade
                </h3>
              </div>
              <span className="text-xs font-extrabold px-3 py-1 rounded-lg border bg-[#EAF2FF] text-[#1264F3] border-[#1264F3]/30">
                Status: {currentDemanda.status}
              </span>
            </div>

            {/* DOCUMENTO OFICIAL DE PARECER TÉCNICO */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#10213D]">
                  Conteúdo do Parecer Oficial Consolidado (Editável)
                </label>
                <span className="text-[10px] font-bold text-[#64748B]">
                  Emitido automaticamente a partir da descrição, anexos e orçamento
                </span>
              </div>
              <textarea
                rows={9}
                value={technicalReport}
                onChange={(e) => setTechnicalReport(e.target.value)}
                placeholder="Clique em 'Iniciar Análise Técnica' acima para emitir o parecer consolidado..."
                className="p-4 rounded-xl border border-[#DCE2EA] bg-[#F8FAFC] text-xs font-mono font-medium text-[#10213D] focus:bg-white focus:border-[#1264F3] focus:outline-hidden transition resize-y leading-relaxed"
              />
            </div>

            {/* SEÇÃO DE DOCUMENTOS ANEXADOS DA DEMANDA */}
            <div className="border border-[#E2E8F0] rounded-2xl p-5 flex flex-col gap-4 bg-[#F8FAFC]">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#1264F3]" />
                  <h4 className="text-xs font-extrabold text-[#10213D] uppercase tracking-wider">
                    Documentações e Peças Técnicas Anexadas
                  </h4>
                </div>
                <span className="text-[11px] font-bold text-[#64748B]">
                  {currentDemanda.files && currentDemanda.files.length > 0
                    ? `${currentDemanda.files.length} documento(s) anexado(s)`
                    : "Sem anexos"}
                </span>
              </div>

              {currentDemanda.files && currentDemanda.files.length > 0 ? (
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {currentDemanda.files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl border border-[#E2E8F0] bg-white shadow-2xs text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="h-4 w-4 text-[#1264F3] shrink-0" />
                        <div className="truncate">
                          <span className="font-extrabold text-[#10213D] block truncate">{file}</span>
                          <span className="text-[10px] text-[#64748B] block">Peça Técnica Validada</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => alert(`Visualizando documento: ${file}`)}
                          className="px-2.5 py-1 bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#EFF6FF] text-[#10213D] rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Eye className="h-3 w-3 text-[#1264F3]" />
                          <span>Visualizar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toast(`Download do arquivo ${file} iniciado.`)}
                          className="px-2.5 py-1 bg-[#008B63] hover:bg-[#007553] text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Download className="h-3 w-3" />
                          <span>Baixar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-[#E2E8F0] bg-white text-center text-[#64748B] text-xs">
                  Nenhum documento anexado a esta demanda durante o cadastro inicial.
                </div>
              )}
            </div>

            {/* SEÇÃO DE PREVISÃO E DOTAÇÃO ORÇAMENTÁRIA */}
            <div className="border border-[#E2E8F0] rounded-2xl p-5 flex flex-col gap-4 bg-[#F0FDF4]/40">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-[#008B63]" />
                  <h4 className="text-xs font-extrabold text-[#10213D] uppercase tracking-wider">
                    Diagnóstico Orçamentário e Financeiro
                  </h4>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                    currentDemanda.hasBudget || (currentDemanda.estimatedBudget && currentDemanda.estimatedBudget > 0)
                      ? "bg-[#E8F7F1] text-[#008B63] border-[#00A978]/30"
                      : "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]"
                  }`}
                >
                  {currentDemanda.hasBudget || (currentDemanda.estimatedBudget && currentDemanda.estimatedBudget > 0)
                    ? "Possui Orçamento Previsto"
                    : "Sem Orçamento Previsto"}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div className="flex flex-col gap-1 p-3 bg-white border border-[#E2E8F0] rounded-xl">
                  <span className="text-[#64748B] font-bold text-[10px] uppercase">Valor Estimado</span>
                  <span className="text-sm font-black text-[#10213D]">
                    {currentDemanda.estimatedBudget && currentDemanda.estimatedBudget > 0
                      ? `R$ ${currentDemanda.estimatedBudget.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                      : "R$ 0,00 (Não orçado)"}
                  </span>
                </div>

                <div className="flex flex-col gap-1 p-3 bg-white border border-[#E2E8F0] rounded-xl">
                  <span className="text-[#64748B] font-bold text-[10px] uppercase">Fonte de Recursos</span>
                  <span className="text-xs font-extrabold text-[#10213D]">
                    {currentDemanda.budgetSource || "Dotação Geral / A definir na conversão"}
                  </span>
                </div>
              </div>
            </div>

            {/* SEÇÃO 2: SOLICITAÇÃO E HOMOLOGAÇÃO DE APROVAÇÃO */}
            <div className="border border-[#E2E8F0] rounded-2xl p-5 flex flex-col gap-4 bg-[#FAF5FF]/40">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-[#7C3AED]" />
                  <h4 className="text-xs font-extrabold text-[#10213D] uppercase tracking-wider">
                    Aprovação e Homologação da Autoridade
                  </h4>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                    currentDemanda.approvedBy
                      ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                      : "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]"
                  }`}
                >
                  {currentDemanda.approvedBy ? "Homologada & Aprovada" : "Aguardando Aprovação Formal"}
                </span>
              </div>

              {/* Checklist dos Critérios Avaliados */}
              <div className="grid gap-2.5 sm:grid-cols-2 text-xs">
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
              </div>

              {/* IDENTIFICAÇÃO DO APROVADOR E BOTÃO DE APROVAÇÃO FORMAL */}
              <div className="grid gap-4 sm:grid-cols-2 pt-3 border-t border-[#E2E8F0]">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#10213D]">
                    Nome do Aprovador / Autoridade Responsável *
                  </label>
                  <input
                    type="text"
                    value={approverName}
                    onChange={(e) => setApproverName(e.target.value)}
                    placeholder="Ex.: Ana Martins"
                    disabled={currentDemanda.status !== "Em análise"}
                    className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-white text-xs font-extrabold text-[#10213D] focus:border-[#1264F3] focus:outline-hidden disabled:bg-[#F8FAFC]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#10213D]">
                    Cargo / Função do Aprovador *
                  </label>
                  <input
                    type="text"
                    value={approverRole}
                    onChange={(e) => setApproverRole(e.target.value)}
                    placeholder="Ex.: Coordenadora de Projetos / Gestora Técnica"
                    disabled={currentDemanda.status !== "Em análise"}
                    className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-white text-xs font-medium text-[#10213D] focus:border-[#1264F3] focus:outline-hidden disabled:bg-[#F8FAFC]"
                  />
                </div>
              </div>

              {/* BOTÃO SOLICITAR E CONCEDER APROVAÇÃO FORMAL */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleApproveDemand}
                  disabled={currentDemanda.status !== "Em análise"}
                  className="w-full h-11 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-extrabold text-xs transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:bg-[#E2E8F0] disabled:text-[#94A3B8] disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>HOMOLOGAR E APROVAR DEMANDA PARA CONVERSÃO EM PROJETO</span>
                </button>
              </div>

              {/* CARIMBO DE APROVAÇÃO OFICIAL */}
              {currentDemanda.approvedBy && (
                <div className="p-3.5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-[#059669] shrink-0" />
                    <div>
                      <span className="font-extrabold text-[#065F46] block text-xs">
                        DEMANDA FORMALMENTE APROVADA POR: {currentDemanda.approvedBy} ({currentDemanda.approvalRole || "Gestor Responsável"})
                      </span>
                      <span className="text-[10px] text-[#047857]">
                        Homologada em: {currentDemanda.approvalDate || "Hoje"} • Termo de Viabilidade Técnica e Orçamentária Válido
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-[#059669] text-white rounded-lg text-[10px] font-black uppercase">
                    Aprovado
                  </span>
                </div>
              )}
            </div>

            {/* ETAPA 3: BOTÃO CONVERTER AGORA EM PROJETO */}
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
                    <span>3. CONVERTER AGORA EM PROJETO (DADOS REAIS CONSOLIDADOS)</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" strokeWidth={2} />
                    <span>3. Converter em projeto (Bloqueado até homologar a aprovação da autoridade)</span>
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
              onUpdateTransaction={(tx) =>
                setTransacoes((prev) => prev.map((t) => (t.id === tx.id ? tx : t)))
              }
              onDeleteTransaction={(id) =>
                setTransacoes((prev) => prev.filter((t) => t.id !== id))
              }
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
              onAddFile={(f) => {
                setProjectFiles((prev) => [f, ...prev]);
                setAuditEvents((prev) => [
                  {
                    id: `evt-${Date.now()}`,
                    time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
                    dateGroup: "Hoje",
                    user: "Usuário atual",
                    avatarInitials: "UC",
                    avatarBg: "bg-[#008B63]",
                    actionText: `enviou o arquivo '${f.name}' para a pasta '${f.folder}'`,
                    eventType: "Arquivo" as const,
                    targetCode: f.linkedItem,
                    targetTitle: f.name,
                    newValue: `Arquivo adicionado: ${f.name} (${f.size})`,
                    isImportant: false,
                    fullDate: new Date().toLocaleString("pt-BR"),
                  },
                  ...prev,
                ]);
              }}
              onDeleteFile={(id) =>
                setProjectFiles((prev) => prev.filter((f) => f.id !== id))
              }
              onRenameFile={(id, newName) =>
                setProjectFiles((prev) =>
                  prev.map((f) => (f.id === id ? { ...f, name: newName } : f))
                )
              }
              onUpdateFile={(file) =>
                setProjectFiles((prev) =>
                  prev.map((f) => (f.id === file.id ? file : f))
                )
              }
              onAddAuditEvent={(event) =>
                setAuditEvents((prev) => [event, ...prev])
              }
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
