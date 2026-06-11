import { NAV_GROUP_LABELS, NAV_GROUP_ORDER, PERMISSIONS } from "@/lib/domain/constants";
import type { NavGroup, NavItem } from "@/lib/domain/types";

export const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Visão Geral",
    icon: "◉",
    group: "operacao",
  },
  {
    href: "/dashboard/campanhas",
    label: "Campanhas",
    icon: "📣",
    group: "operacao",
    permission: PERMISSIONS.CAMPANHAS_GERENCIAR,
  },
  {
    href: "/dashboard/usuarios",
    label: "Usuários",
    icon: "👤",
    group: "cadastros",
    permission: PERMISSIONS.USUARIOS_GERENCIAR,
  },
  {
    href: "/dashboard/parceiros",
    label: "Parceiros",
    icon: "🤝",
    group: "cadastros",
    permission: PERMISSIONS.PARCEIROS_GERENCIAR,
  },
  {
    href: "/dashboard/locais",
    label: "Locais (Comitê)",
    icon: "📍",
    group: "cadastros",
    permission: PERMISSIONS.LOCAIS_GERENCIAR,
  },
  {
    href: "/dashboard/regioes",
    label: "Regiões",
    icon: "🗺",
    group: "cadastros",
    permission: PERMISSIONS.REGIOES_GERENCIAR,
  },
  {
    href: "/dashboard/relatorios",
    label: "Relatórios",
    icon: "📊",
    group: "inteligencia",
    permission: PERMISSIONS.RELATORIOS_VISUALIZAR,
  },
  {
    href: "/dashboard/tre",
    label: "Consulta TRE",
    icon: "⚖",
    group: "inteligencia",
    permission: PERMISSIONS.TRE_CONSULTAR,
  },
  {
    href: "/dashboard/permissoes",
    label: "Permissões",
    icon: "🔐",
    group: "configuracao",
    permission: PERMISSIONS.PERMISSOES_GERENCIAR,
  },
];

export const navGroups: Record<NavGroup, string> = NAV_GROUP_LABELS;
export const navGroupOrder: NavGroup[] = NAV_GROUP_ORDER;

export const breadcrumbLabels: Record<string, string> = {
  dashboard: "Visão Geral",
  usuarios: "Usuários",
  permissoes: "Permissões",
  parceiros: "Parceiros",
  locais: "Locais",
  regioes: "Regiões",
  relatorios: "Relatórios",
  tre: "Consulta TRE",
  campanhas: "Campanhas",
};
