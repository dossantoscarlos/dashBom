"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { ToastProvider } from "@/components/dashboard/Toast";
import { hasPermission } from "@/lib/domain/rules";
import type {
  Campaign,
  DashboardUser,
  Location,
  Partner,
  Region,
  Role,
} from "@/lib/domain/types";
import {
  campaignsRepo,
  locationsRepo,
  partnersRepo,
  regionsRepo,
  rolesRepo,
  usersRepo,
} from "@/lib/data/repositories";

type DashboardContextValue = {
  regions: Region[];
  campaigns: Campaign[];
  partners: Partner[];
  locations: Location[];
  users: DashboardUser[];
  roles: Role[];
  currentRole: Role | null;
  getRegionName: (id: string) => string;
  getRoleName: (roleId: string) => string;
  can: (permission: string) => boolean;
  setRegions: React.Dispatch<React.SetStateAction<Region[]>>;
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  setPartners: React.Dispatch<React.SetStateAction<Partner[]>>;
  setLocations: React.Dispatch<React.SetStateAction<Location[]>>;
  setUsers: React.Dispatch<React.SetStateAction<DashboardUser[]>>;
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

type DashboardProviderProps = {
  userEmail: string;
  children: React.ReactNode;
};

export function DashboardProvider({
  userEmail,
  children,
}: DashboardProviderProps) {
  const [regions, setRegions] = useState<Region[]>(() => regionsRepo.getAll());
  const [campaigns, setCampaigns] = useState<Campaign[]>(() =>
    campaignsRepo.getAll(),
  );
  const [partners, setPartners] = useState<Partner[]>(() =>
    partnersRepo.getAll(),
  );
  const [locations, setLocations] = useState<Location[]>(() =>
    locationsRepo.getAll(),
  );
  const [users, setUsers] = useState<DashboardUser[]>(() =>
    usersRepo.getAll(),
  );
  const [roles, setRoles] = useState<Role[]>(() => rolesRepo.getAll());

  const currentUser = useMemo(
    () => users.find((u) => u.email === userEmail) ?? usersRepo.getByEmail(userEmail),
    [userEmail, users],
  );

  const currentRole = useMemo(
    () => roles.find((r) => r.id === currentUser?.roleId) ?? null,
    [currentUser, roles],
  );

  const getRegionName = useCallback(
    (id: string) => regions.find((r) => r.id === id)?.name ?? id,
    [regions],
  );

  const getRoleName = useCallback(
    (roleId: string) => roles.find((r) => r.id === roleId)?.name ?? roleId,
    [roles],
  );

  const can = useCallback(
    (permission: string) =>
      currentRole ? hasPermission(currentRole.permissions, permission) : false,
    [currentRole],
  );

  const value = useMemo(
    () => ({
      regions,
      campaigns,
      partners,
      locations,
      users,
      roles,
      currentRole,
      getRegionName,
      getRoleName,
      can,
      setRegions,
      setCampaigns,
      setPartners,
      setLocations,
      setUsers,
      setRoles,
    }),
    [
      regions,
      campaigns,
      partners,
      locations,
      users,
      roles,
      currentRole,
      getRegionName,
      getRoleName,
      can,
    ],
  );

  return (
    <DashboardContext.Provider value={value}>
      <ToastProvider>{children}</ToastProvider>
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard deve ser usado dentro de DashboardProvider");
  }
  return ctx;
}
