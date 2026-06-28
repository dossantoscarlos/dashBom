"use server";

import { laravelApi } from "@/lib/laravel-api";
import type {
  Campaign,
  DashboardUser,
  Location,
  Partner,
  Region,
  Role,
} from "@/lib/domain/types";

const resources = {
  regions: "/api/regions",
  campaigns: "/api/campaigns",
  partners: "/api/partners",
  locations: "/api/locations",
  users: "/api/users",
  roles: "/api/roles",
} as const;

async function saveResource<T extends { id: string }>(
  resource: keyof typeof resources,
  item: T,
  exists: boolean,
): Promise<T> {
  return laravelApi<T>(exists ? `${resources[resource]}/${item.id}` : resources[resource], {
    method: exists ? "PUT" : "POST",
    body: item,
  });
}

async function deleteResource(
  resource: keyof typeof resources,
  id: string,
): Promise<void> {
  await laravelApi<void>(`${resources[resource]}/${id}`, {
    method: "DELETE",
  });
}

export async function saveRegion(region: Region, exists: boolean): Promise<Region> {
  return saveResource("regions", region, exists);
}

export async function deleteRegion(id: string): Promise<void> {
  return deleteResource("regions", id);
}

export async function saveCampaign(
  campaign: Campaign,
  exists: boolean,
): Promise<Campaign> {
  return saveResource("campaigns", campaign, exists);
}

export async function deleteCampaign(id: string): Promise<void> {
  return deleteResource("campaigns", id);
}

export async function savePartner(partner: Partner, exists: boolean): Promise<Partner> {
  return saveResource("partners", partner, exists);
}

export async function deletePartner(id: string): Promise<void> {
  return deleteResource("partners", id);
}

export async function saveLocation(
  location: Location,
  exists: boolean,
): Promise<Location> {
  return saveResource("locations", location, exists);
}

export async function deleteLocation(id: string): Promise<void> {
  return deleteResource("locations", id);
}

export async function saveDashboardUser(
  user: DashboardUser,
  exists: boolean,
): Promise<DashboardUser> {
  return saveResource("users", user, exists);
}

export async function deleteDashboardUser(id: string): Promise<void> {
  return deleteResource("users", id);
}

export async function saveRole(role: Role, exists: boolean): Promise<Role> {
  return saveResource("roles", role, exists);
}

export async function deleteRole(id: string): Promise<void> {
  return deleteResource("roles", id);
}
