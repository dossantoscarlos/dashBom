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
import { initialCampaigns } from "@/lib/data/campaigns";
import { initialDashboardUsers } from "@/lib/data/dashboard-users";
import { initialLocations } from "@/lib/data/locations";
import { initialPartners } from "@/lib/data/partners";
import { initialRegions } from "@/lib/data/regions";
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
    dashboard = {
      regions: initialRegions,
      campaigns: initialCampaigns,
      partners: initialPartners,
      locations: initialLocations,
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
