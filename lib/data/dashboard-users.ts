import type { DashboardUser } from "./types";

export const initialDashboardUsers: DashboardUser[] = [
  {
    id: "1",
    name: "Administrador",
    email: "admin@example.com",
    roleId: "role-admin",
    status: "ativo",
    createdAt: "2025-01-15",
  },
  {
    id: "2",
    name: "Maria Silva",
    email: "maria.silva@campanha.br",
    roleId: "role-coordenador",
    status: "ativo",
    createdAt: "2025-02-01",
  },
  {
    id: "3",
    name: "João Santos",
    email: "joao.santos@campanha.br",
    roleId: "role-agente",
    status: "ativo",
    createdAt: "2025-02-10",
  },
  {
    id: "4",
    name: "Ana Costa",
    email: "ana.costa@campanha.br",
    roleId: "role-analista",
    status: "pendente",
    createdAt: "2025-03-05",
  },
];
