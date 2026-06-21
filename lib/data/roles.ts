import type { Role } from "./types";

export const initialRoles: Role[] = [
  {
    id: "role-admin",
    name: "Administrador",
    description: "Acesso total ao sistema de campanha",
    permissions: [
      "dashboard:visualizar",
      "usuarios:gerenciar",
      "usuarios:visualizar",
      "permissoes:gerenciar",
      "parceiros:gerenciar",
      "parceiros:visualizar",
      "locais:gerenciar",
      "locais:visualizar",
      "regioes:gerenciar",
      "regioes:visualizar",
      "relatorios:visualizar",
      "relatorios:exportar",
      "tre:consultar",
      "campanhas:gerenciar",
      "campanhas:visualizar",
      "campanhas:executar",
      "perfil:visualizar",
    ],
  },
  {
    id: "role-coordenador",
    name: "Coordenador Regional",
    description: "Gerencia equipe e atividades em sua região",
    permissions: [
      "dashboard:visualizar",
      "parceiros:visualizar",
      "locais:gerenciar",
      "locais:visualizar",
      "regioes:visualizar",
      "relatorios:visualizar",
      "tre:consultar",
      "campanhas:gerenciar",
      "campanhas:visualizar",
      "perfil:visualizar",
    ],
  },
  {
    id: "role-agente",
    name: "Agente de Campo",
    description: "Executa atividades e registra apoiadores",
    permissions: [
      "dashboard:visualizar",
      "locais:visualizar",
      "campanhas:visualizar",
      "campanhas:executar",
      "perfil:visualizar",
    ],
  },
  {
    id: "role-analista",
    name: "Analista",
    description: "Acesso a relatórios e consultas TRE",
    permissions: [
      "dashboard:visualizar",
      "relatorios:visualizar",
      "relatorios:exportar",
      "tre:consultar",
      "campanhas:visualizar",
      "perfil:visualizar",
    ],
  },
];

// ─── Registro completo de todas as permissões do sistema ─────────────────────
// Toda tela/módulo criado DEVE ser adicionado aqui para aparecer na ACL.
export const allPermissions = [
  // ── Dashboard ──────────────────────────────────────────────────────────────
  { id: "dashboard:visualizar", label: "Visualizar dashboard", group: "Dashboard" },

  // ── Campanhas ──────────────────────────────────────────────────────────────
  { id: "campanhas:gerenciar", label: "Gerenciar campanhas", group: "Campanhas" },
  { id: "campanhas:visualizar", label: "Visualizar campanhas", group: "Campanhas" },
  { id: "campanhas:executar", label: "Executar campanhas", group: "Campanhas" },

  // ── Usuários ───────────────────────────────────────────────────────────────
  { id: "usuarios:gerenciar", label: "Gerenciar usuários", group: "Usuários" },
  { id: "usuarios:visualizar", label: "Visualizar usuários", group: "Usuários" },

  // ── Parceiros ──────────────────────────────────────────────────────────────
  { id: "parceiros:gerenciar", label: "Gerenciar parceiros", group: "Parceiros" },
  { id: "parceiros:visualizar", label: "Visualizar parceiros", group: "Parceiros" },

  // ── Locais ────────────────────────────────────────────────────────────────
  { id: "locais:gerenciar", label: "Gerenciar locais", group: "Locais" },
  { id: "locais:visualizar", label: "Visualizar locais", group: "Locais" },

  // ── Regiões ───────────────────────────────────────────────────────────────
  { id: "regioes:gerenciar", label: "Gerenciar regiões", group: "Regiões" },
  { id: "regioes:visualizar", label: "Visualizar regiões", group: "Regiões" },

  // ── Relatórios ────────────────────────────────────────────────────────────
  { id: "relatorios:visualizar", label: "Visualizar relatórios", group: "Relatórios" },
  { id: "relatorios:exportar", label: "Exportar relatórios", group: "Relatórios" },

  // ── TRE ───────────────────────────────────────────────────────────────────
  { id: "tre:consultar", label: "Consultar TRE", group: "TRE" },

  // ── Permissões ────────────────────────────────────────────────────────────
  { id: "permissoes:gerenciar", label: "Gerenciar permissões", group: "Permissões" },

  // ── Perfil ────────────────────────────────────────────────────────────────
  { id: "perfil:visualizar", label: "Visualizar perfil", group: "Perfil" },
];
