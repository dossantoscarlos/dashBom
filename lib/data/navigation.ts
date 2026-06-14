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
    href: "/modulos",
    label: "Módulos",
    icon: "🧩",
    group: "operacao",
  },
  {
    href: "/modulos?tab=campanhas",
    label: "Campanhas",
    icon: "📣",
    group: "operacao",
    permission: PERMISSIONS.CAMPANHAS_GERENCIAR,
  },
  {
    href: "/modulos?tab=usuarios",
    label: "Usuários",
    icon: "👤",
    group: "cadastros",
    permission: PERMISSIONS.USUARIOS_GERENCIAR,
  },
  {
    href: "/modulos?tab=parceiros",
    label: "Parceiros",
    icon: "🤝",
    group: "cadastros",
    permission: PERMISSIONS.PARCEIROS_GERENCIAR,
  },
  {
    href: "/modulos?tab=locais",
    label: "Locais (Comitê)",
    icon: "📍",
    group: "cadastros",
    permission: PERMISSIONS.LOCAIS_GERENCIAR,
  },
  {
    href: "/modulos?tab=regioes",
    label: "Regiões",
    icon: "🗺",
    group: "cadastros",
    permission: PERMISSIONS.REGIOES_GERENCIAR,
  },
  {
    href: "/modulos?tab=relatorios",
    label: "Relatórios",
    icon: "📊",
    group: "inteligencia",
    permission: PERMISSIONS.RELATORIOS_VISUALIZAR,
  },
  {
    href: "/modulos?tab=tre",
    label: "Consulta TRE",
    icon: "⚖",
    group: "inteligencia",
    permission: PERMISSIONS.TRE_CONSULTAR,
  },
  {
    href: "/modulos?tab=permissoes",
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
  modulos: "Módulos",
  usuarios: "Usuários",
  permissoes: "Permissões",
  parceiros: "Parceiros",
  locais: "Locais",
  regioes: "Regiões",
  relatorios: "Relatórios",
  tre: "Consulta TRE",
  campanhas: "Campanhas",
};
