import type { Role } from "./types";

export const initialRoles: Role[] = [
  {
    id: "role-admin",
    name: "Administrador",
    description: "Acesso total ao sistema de campanha",
    permissions: [
      "usuarios:gerenciar",
      "permissoes:gerenciar",
      "parceiros:gerenciar",
      "locais:gerenciar",
      "regioes:gerenciar",
      "relatorios:visualizar",
      "tre:consultar",
      "campanhas:gerenciar",
    ],
  },
  {
    id: "role-coordenador",
    name: "Coordenador Regional",
    description: "Gerencia equipe e atividades em sua região",
    permissions: [
      "parceiros:visualizar",
      "locais:gerenciar",
      "regioes:visualizar",
      "relatorios:visualizar",
      "tre:consultar",
      "campanhas:gerenciar",
    ],
  },
  {
    id: "role-agente",
    name: "Agente de Campo",
    description: "Executa atividades e registra apoiadores",
    permissions: [
      "locais:visualizar",
      "campanhas:visualizar",
      "campanhas:executar",
    ],
  },
  {
    id: "role-analista",
    name: "Analista",
    description: "Acesso a relatórios e consultas TRE",
    permissions: [
      "relatorios:visualizar",
      "relatorios:exportar",
      "tre:consultar",
      "campanhas:visualizar",
    ],
  },
];

export const allPermissions = [
  { id: "usuarios:gerenciar", label: "Gerenciar usuários" },
  { id: "permissoes:gerenciar", label: "Gerenciar permissões" },
  { id: "parceiros:gerenciar", label: "Gerenciar parceiros" },
  { id: "parceiros:visualizar", label: "Visualizar parceiros" },
  { id: "locais:gerenciar", label: "Gerenciar locais" },
  { id: "locais:visualizar", label: "Visualizar locais" },
  { id: "regioes:gerenciar", label: "Gerenciar regiões" },
  { id: "regioes:visualizar", label: "Visualizar regiões" },
  { id: "relatorios:visualizar", label: "Visualizar relatórios" },
  { id: "relatorios:exportar", label: "Exportar relatórios" },
  { id: "tre:consultar", label: "Consultar TRE" },
  { id: "campanhas:gerenciar", label: "Gerenciar campanhas" },
  { id: "campanhas:visualizar", label: "Visualizar campanhas" },
  { id: "campanhas:executar", label: "Executar campanhas" },
];
