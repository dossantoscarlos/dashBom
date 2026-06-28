import { laravelApi } from "@/lib/laravel-api";
import type {
  Campaign,
  DashboardUser,
  Location,
  Partner,
  PermissionDefinition,
  Region,
  Role,
} from "@/lib/domain/types";
import type { SessionPayload } from "@/lib/auth";

export type PreparedUserServerState = {
  user: DashboardUser;
  regions: Region[];
  campaigns: Campaign[];
  partners: Partner[];
  locations: Location[];
  users: DashboardUser[];
  roles: Role[];
  availablePermissions: PermissionDefinition[];
};

type LaravelDashboardData = Omit<PreparedUserServerState, "user">;

export async function prepareUserServerState(
  session: SessionPayload,
): Promise<PreparedUserServerState> {
  const dashboard = await laravelApi<LaravelDashboardData>("/api/dashboard-data");
  const user = dashboard.users.find((item) => item.email === session.email);

  return {
    ...dashboard,
    user: user ?? {
      id: session.sub,
      name: session.name,
      email: session.email,
      roleId: "",
      status: "pendente",
      createdAt: new Date().toISOString().slice(0, 10),
    },
  };
}
