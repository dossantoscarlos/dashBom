export type UserStatus = "ativo" | "inativo" | "pendente";

export type DashboardUser = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  status: UserStatus;
  createdAt: string;
};

export type Role = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
};

export type PermissionDefinition = {
  id: string;
  label: string;
  group: string;
};

export type PartnerType = "fornecedor" | "mídia" | "institucional" | "voluntário";

export type Partner = {
  id: string;
  name: string;
  type: PartnerType;
  contact: string;
  phone: string;
  regionId: string;
  status: UserStatus;
};

export type LocationType = "comitê" | "sede" | "ponto de apoio";

export type Location = {
  id: string;
  name: string;
  address: string;
  regionId: string;
  type: LocationType;
  capacity: number;
  responsible: string;
};

export type Region = {
  id: string;
  name: string;
  uf: string;
  municipalities: number;
  population: number;
  coordinator: string;
  voteGoal?: number;
  votesProjected?: number;
};

export type CampaignType =
  | "door-to-door"
  | "evento"
  | "digital"
  | "rádio"
  | "comício";

/** Fluxo operacional: planejamento → execução → conclusão */
export type CampaignStatus =
  | "planejada"
  | "em andamento"
  | "concluída"
  | "cancelada";

export type Campaign = {
  id: string;
  name: string;
  type: CampaignType;
  regionId: string;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  description: string;
  voteGoal?: number;
};

export type ReportCategory =
  | "Territorial"
  | "Financeiro"
  | "Base Eleitoral"
  | "Inteligência"
  | "Operacional"
  | "Digital";

export type ReportTemplate = {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  query: string;
  icon: string;
};

export type TRESituacao =
  | "deferido"
  | "indeferido"
  | "renúncia"
  | "cassado"
  | "eleito"
  | "não eleito";

export type TRECandidate = {
  id: string;
  nome: string;
  nomeUrna: string;
  numero: number;
  partido: string;
  siglaPartido: string;
  cargo: string;
  uf: string;
  municipio: string;
  situacao: TRESituacao;
  votos: number;
  intencaoVoto: number;
  genero: string;
  ocupacao: string;
  coligacao: string;
  grauInstrucao?: string;
  dataNascimento?: string;
  bensDeclarados?: number;
};

export type NavGroup =
  | "operacao"
  | "cadastros"
  | "inteligencia"
  | "configuracao";

export type NavItem = {
  href: string;
  label: string;
  icon: string;
  group: NavGroup;
  permission?: string;
};

export type CampaignKPIs = {
  metaVotos: number;
  votosProjetados: number;
  coberturaTerritorialPct: number;
  campanhasAtivas: number;
  parceirosAtivos: number;
  comites: number;
  intencaoVotoAgregada: number;
  progressoMetaPct: number;
};

export type ReportResultRow = Record<string, string | number>;
