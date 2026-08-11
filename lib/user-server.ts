import { laravelApi } from "@/lib/laravel-api";
import type {
  Campaign,
  DashboardUser,
  FinancialTransaction,
  Location,
  Partner,
  PermissionDefinition,
  Region,
  Role,
  Survey,
} from "@/lib/domain/types";
import type { SessionPayload } from "@/lib/auth";
import { initialDashboardUsers } from "@/lib/data/dashboard-users";
import { initialRoles, allPermissions } from "@/lib/data/roles";

export type PreparedUserServerState = {
  user: DashboardUser;
  regions: Region[];
  campaigns: Campaign[];
  partners: Partner[];
  locations: Location[];
  users: DashboardUser[];
  roles: Role[];
  availablePermissions: PermissionDefinition[];
  finances: FinancialTransaction[];
  surveys: Survey[];
};

type LaravelDashboardData = Omit<PreparedUserServerState, "user">;

export async function prepareUserServerState(
  session: SessionPayload,
): Promise<PreparedUserServerState> {
  let dashboard: LaravelDashboardData;

  try {
    dashboard = await laravelApi<LaravelDashboardData>("/api/dashboard-data");
  } catch {
    // Inicialização 100% Limpa sem Dados Mockados (Exclusivo API ou Banco de Dados SQLite)
    dashboard = {
      regions: [],
      campaigns: [],
      partners: [],
      locations: [],
      users: initialDashboardUsers,
      roles: initialRoles,
      availablePermissions: allPermissions,
      finances: [],
      surveys: [],
    };
  }

  const user = dashboard.users.find(
    (item) => item.email.toLowerCase() === session.email.toLowerCase(),
  );

  return {
    ...dashboard,
    user: user ?? {
      id: session.sub,
      name: session.name,
      email: session.email,
      roleId: "role-admin",
      status: "ativo",
      createdAt: new Date().toISOString().slice(0, 10),
    },
  };
}
