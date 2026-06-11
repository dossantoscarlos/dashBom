import { CAMPAIGN_VOTE_GOAL_DEFAULT } from "./constants";
import type {
  Campaign,
  CampaignKPIs,
  DashboardUser,
  Location,
  Partner,
  Region,
  ReportTemplate,
  TRECandidate,
} from "./types";
import type { CampaignStatus } from "./types";

export function getNextCampaignStatus(
  current: CampaignStatus,
): CampaignStatus | null {
  if (current === "planejada") return "em andamento";
  if (current === "em andamento") return "concluída";
  return null;
}

export function canAdvanceCampaign(status: CampaignStatus): boolean {
  return status === "planejada" || status === "em andamento";
}

export function hasPermission(
  rolePermissions: string[],
  permission: string,
): boolean {
  return rolePermissions.includes(permission);
}

export function computeTerritorialCoverage(
  regions: Region[],
  campaigns: Campaign[],
): number {
  if (regions.length === 0) return 0;
  const activeRegionIds = new Set(
    campaigns
      .filter((c) => c.status === "em andamento" || c.status === "planejada")
      .map((c) => c.regionId),
  );
  return Math.round((activeRegionIds.size / regions.length) * 100);
}

export function computeAggregatedVoteIntent(candidates: TRECandidate[]): number {
  if (candidates.length === 0) return 0;
  const total = candidates.reduce((sum, c) => sum + c.intencaoVoto, 0);
  return Math.round((total / candidates.length) * 10) / 10;
}

export function computeCampaignKPIs(params: {
  regions: Region[];
  campaigns: Campaign[];
  partners: Partner[];
  locations: Location[];
  treCandidates: TRECandidate[];
  voteGoal?: number;
}): CampaignKPIs {
  const {
    regions,
    campaigns,
    partners,
    locations,
    treCandidates,
    voteGoal = CAMPAIGN_VOTE_GOAL_DEFAULT,
  } = params;

  const votosProjetados = regions.reduce(
    (sum, r) => sum + (r.votesProjected ?? 0),
    0,
  );
  const coberturaTerritorialPct = computeTerritorialCoverage(
    regions,
    campaigns,
  );
  const campanhasAtivas = campaigns.filter(
    (c) => c.status === "em andamento",
  ).length;
  const parceirosAtivos = partners.filter((p) => p.status === "ativo").length;
  const intencaoVotoAgregada = computeAggregatedVoteIntent(
    treCandidates.filter((c) => c.situacao === "deferido"),
  );
  const progressoMetaPct =
    voteGoal > 0 ? Math.round((votosProjetados / voteGoal) * 100) : 0;

  return {
    metaVotos: voteGoal,
    votosProjetados,
    coberturaTerritorialPct,
    campanhasAtivas,
    parceirosAtivos,
    comites: locations.length,
    intencaoVotoAgregada,
    progressoMetaPct,
  };
}

export function getRoleHint(roleName: string): string {
  const hints: Record<string, string> = {
    Administrador:
      "Você tem acesso completo à operação, cadastros e inteligência eleitoral.",
    "Coordenador Regional":
      "Gerencie campanhas e comitês da sua região. Relatórios territoriais disponíveis.",
    "Agente de Campo":
      "Foco em execução: visualize campanhas ativas e registre atividades de campo.",
    Analista:
      "Acesso prioritário a relatórios, TRE e indicadores de intenção de voto.",
  };
  return hints[roleName] ?? "Acesso conforme perfil atribuído pela coordenação.";
}

export function resolveUserRoleId(
  email: string,
  users: DashboardUser[],
): string | null {
  return users.find((u) => u.email === email)?.roleId ?? null;
}

export function generateMockReportResults(
  template: ReportTemplate,
  periodo: string,
): { columns: string[]; rows: Record<string, string | number>[] } {
  const mockByCategory: Record<
    string,
    { columns: string[]; rows: Record<string, string | number>[] }
  > = {
    Territorial: {
      columns: ["Região", "Apoiadores", "Meta (%)", "Campanhas"],
      rows: [
        { Região: "Zona Norte", Apoiadores: 12400, "Meta (%)": 78, Campanhas: 2 },
        { Região: "Capital", Apoiadores: 18900, "Meta (%)": 92, Campanhas: 3 },
        { Região: "Interior Oeste", Apoiadores: 6800, "Meta (%)": 54, Campanhas: 1 },
      ],
    },
    Financeiro: {
      columns: ["Categoria", "Valor (R$)", "Fornecedor", "Status"],
      rows: [
        { Categoria: "Mídia", "Valor (R$)": 45000, Fornecedor: "Rádio Interior FM", Status: "Pago" },
        { Categoria: "Material", "Valor (R$)": 12800, Fornecedor: "Gráfica Central", Status: "Pendente" },
        { Categoria: "Eventos", "Valor (R$)": 22000, Fornecedor: "Locação Praça", Status: "Aprovado" },
      ],
    },
    "Base Eleitoral": {
      columns: ["Comitê", "Contatos", "Zona", "Conversão (%)"],
      rows: [
        { Comitê: "Comitê Santana", Contatos: 3200, Zona: 127, "Conversão (%)": 18 },
        { Comitê: "Sede Capital", Contatos: 5100, Zona: "045", "Conversão (%)": 24 },
      ],
    },
    Inteligência: {
      columns: ["Candidato", "Intenção (%)", "Votos 2022", "Tendência"],
      rows: [
        { Candidato: "ROBERTO FERREIRA", "Intenção (%)": 28.5, "Votos 2022": 187432, Tendência: "↑" },
        { Candidato: "HELENA COSTA", "Intenção (%)": 24.2, "Votos 2022": 156890, Tendência: "→" },
        { Candidato: "CARLOS SOUZA", "Intenção (%)": 19.8, "Votos 2022": 134567, Tendência: "↓" },
      ],
    },
    Operacional: {
      columns: ["Agente", "Visitas", "Panfletos", "Eventos"],
      rows: [
        { Agente: "João Santos", Visitas: 340, Panfletos: 1200, Eventos: 4 },
        { Agente: "Maria Silva", Visitas: 280, Panfletos: 900, Eventos: 6 },
      ],
    },
    Digital: {
      columns: ["Campanha", "Impressões", "Cliques", "CTR (%)"],
      rows: [
        { Campanha: "#FuturoSP", Impressões: 450000, Cliques: 12400, "CTR (%)": 2.8 },
        { Campanha: "Interior Digital", Impressões: 120000, Cliques: 3100, "CTR (%)": 2.6 },
      ],
    },
  };

  const base = mockByCategory[template.category] ?? {
    columns: ["Indicador", "Valor"],
    rows: [{ Indicador: template.title, Valor: periodo }],
  };

  return base;
}
