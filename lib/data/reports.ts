import type { ReportTemplate } from "./types";

export const reportTemplates: ReportTemplate[] = [
  {
    id: "rep-1",
    title: "Desempenho por Região",
    description:
      "Análise de metas atingidas, apoiadores cadastrados e atividades por região territorial",
    category: "Territorial",
    query:
      "SELECT regiao, SUM(apoiadores), AVG(meta_atingida) FROM campanha GROUP BY regiao",
    icon: "🗺",
  },
  {
    id: "rep-2",
    title: "Gastos de Campanha",
    description:
      "Prestação de contas resumida por categoria de despesa e fornecedor",
    category: "Financeiro",
    query:
      "SELECT categoria, SUM(valor), fornecedor FROM despesas WHERE periodo = :periodo GROUP BY categoria",
    icon: "💰",
  },
  {
    id: "rep-3",
    title: "Eleitores por Comitê",
    description:
      "Distribuição de apoiadores e contatos por comitê e ponto de apoio",
    category: "Base Eleitoral",
    query:
      "SELECT comite, COUNT(eleitor_id), zona_eleitoral FROM apoiadores GROUP BY comite",
    icon: "👥",
  },
  {
    id: "rep-4",
    title: "Comparativo de Adversários",
    description:
      "Intenção de voto e histórico eleitoral dos principais concorrentes",
    category: "Inteligência",
    query:
      "SELECT candidato, intencao_voto, votos_2018, votos_2022 FROM pesquisas ORDER BY intencao_voto DESC",
    icon: "⚔",
  },
  {
    id: "rep-5",
    title: "Atividades de Campo",
    description:
      "Volume de visitas, panfletagens e eventos realizados por equipe",
    category: "Operacional",
    query:
      "SELECT agente, tipo_atividade, COUNT(*) FROM atividades WHERE data BETWEEN :inicio AND :fim GROUP BY agente",
    icon: "📋",
  },
  {
    id: "rep-6",
    title: "Engajamento Digital",
    description:
      "Alcance, cliques e conversões das campanhas em mídias sociais",
    category: "Digital",
    query:
      "SELECT campanha, impressoes, cliques, ctr FROM metricas_ads WHERE plataforma = :plataforma",
    icon: "📱",
  },
];
