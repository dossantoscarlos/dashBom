import type {
  CampaignStatus,
  CampaignType,
  NavGroup,
  PartnerType,
  TRESituacao,
  UserStatus,
} from "./types";

export const ROLE_IDS = {
  ADMIN: "role-admin",
  COORDENADOR: "role-coordenador",
  AGENTE: "role-agente",
  ANALISTA: "role-analista",
} as const;

export const PERMISSIONS = {
  USUARIOS_GERENCIAR: "usuarios:gerenciar",
  PERMISSOES_GERENCIAR: "permissoes:gerenciar",
  PARCEIROS_GERENCIAR: "parceiros:gerenciar",
  PARCEIROS_VISUALIZAR: "parceiros:visualizar",
  LOCAIS_GERENCIAR: "locais:gerenciar",
  LOCAIS_VISUALIZAR: "locais:visualizar",
  REGIOES_GERENCIAR: "regioes:gerenciar",
  REGIOES_VISUALIZAR: "regioes:visualizar",
  RELATORIOS_VISUALIZAR: "relatorios:visualizar",
  RELATORIOS_EXPORTAR: "relatorios:exportar",
  TRE_CONSULTAR: "tre:consultar",
  CAMPANHAS_GERENCIAR: "campanhas:gerenciar",
  CAMPANHAS_VISUALIZAR: "campanhas:visualizar",
  CAMPANHAS_EXECUTAR: "campanhas:executar",
} as const;

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
  pendente: "Pendente",
};

export const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
  "door-to-door": "Porta a porta",
  evento: "Evento",
  digital: "Digital",
  rádio: "Rádio",
  comício: "Comício",
};

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  planejada: "Planejamento",
  "em andamento": "Execução",
  concluída: "Concluída",
  cancelada: "Cancelada",
};

/** Ordem do fluxo operacional de campanha */
export const CAMPAIGN_WORKFLOW: CampaignStatus[] = [
  "planejada",
  "em andamento",
  "concluída",
];

export const PARTNER_TYPE_LABELS: Record<PartnerType, string> = {
  fornecedor: "Fornecedor",
  mídia: "Mídia",
  institucional: "Institucional",
  voluntário: "Voluntário",
};

export const TRE_SITUACAO_LABELS: Record<TRESituacao, string> = {
  deferido: "Deferido",
  indeferido: "Indeferido",
  renúncia: "Renúncia",
  cassado: "Cassado",
  eleito: "Eleito",
  "não eleito": "Não eleito",
};

export const TRE_SITUACAO_VARIANT: Record<TRESituacao, string> = {
  deferido: "deferido",
  indeferido: "indeferido",
  renúncia: "pendente",
  cassado: "cancelada",
  eleito: "concluída",
  "não eleito": "inativo",
};

export const NAV_GROUP_LABELS: Record<NavGroup, string> = {
  operacao: "Operação",
  cadastros: "Cadastros",
  inteligencia: "Inteligência",
  configuracao: "Configuração",
};

export const NAV_GROUP_ORDER: NavGroup[] = [
  "operacao",
  "cadastros",
  "inteligencia",
  "configuracao",
];

export const REPORT_CATEGORIES = [
  "Territorial",
  "Financeiro",
  "Base Eleitoral",
  "Inteligência",
  "Operacional",
  "Digital",
] as const;

export const CAMPAIGN_VOTE_GOAL_DEFAULT = 500_000;
