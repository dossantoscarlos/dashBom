import { initialCampaigns } from "./campaigns";
import { initialDashboardUsers } from "./dashboard-users";
import { initialLocations } from "./locations";
import { initialPartners } from "./partners";
import { initialRegions } from "./regions";
import { initialRoles } from "./roles";
import { reportTemplates } from "./reports";
import { treCandidates } from "./tre";
import type {
  Campaign,
  DashboardUser,
  Location,
  Partner,
  Region,
  Role,
  TRECandidate,
} from "@/lib/domain/types";

/** Repositórios em memória — substituir por adaptadores de DB/API em produção. */

export const regionsRepo = {
  getAll: (): Region[] => initialRegions,
  getById: (id: string): Region | undefined =>
    initialRegions.find((r) => r.id === id),
  getName: (id: string): string =>
    initialRegions.find((r) => r.id === id)?.name ?? id,
};

export const campaignsRepo = {
  getAll: (): Campaign[] => initialCampaigns,
  getActive: (): Campaign[] =>
    initialCampaigns.filter((c) => c.status === "em andamento"),
};

export const partnersRepo = {
  getAll: (): Partner[] => initialPartners,
};

export const locationsRepo = {
  getAll: (): Location[] => initialLocations,
};

export const usersRepo = {
  getAll: (): DashboardUser[] => initialDashboardUsers,
  getByEmail: (email: string): DashboardUser | undefined =>
    initialDashboardUsers.find((u) => u.email === email),
};

export const rolesRepo = {
  getAll: (): Role[] => initialRoles,
  getById: (id: string): Role | undefined =>
    initialRoles.find((r) => r.id === id),
};

export const treRepo = {
  getAll: (): TRECandidate[] => treCandidates,
};

export const reportsRepo = {
  getTemplates: () => reportTemplates,
};
