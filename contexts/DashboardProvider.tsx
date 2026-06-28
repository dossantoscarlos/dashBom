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
  PermissionDefinition,
  Region,
  Role,
} from "@/lib/domain/types";

type DashboardContextValue = {
  regions: Region[];
  campaigns: Campaign[];
  partners: Partner[];
  locations: Location[];
  users: DashboardUser[];
  roles: Role[];
  availablePermissions: PermissionDefinition[];
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
  initialUser?: DashboardUser;
  initialRegions?: Region[];
  initialCampaigns?: Campaign[];
  initialPartners?: Partner[];
  initialLocations?: Location[];
  initialUsers?: DashboardUser[];
  initialRoles?: Role[];
  initialPermissions?: PermissionDefinition[];
  children: React.ReactNode;
};

export function DashboardProvider({
  userEmail,
  initialUser,
  initialRegions,
  initialCampaigns,
  initialPartners,
  initialLocations,
  initialUsers,
  initialRoles,
  initialPermissions,
  children,
}: DashboardProviderProps) {
  const [regions, setRegions] = useState<Region[]>(() =>
    initialRegions ?? [],
  );
  const [campaigns, setCampaigns] = useState<Campaign[]>(() =>
    initialCampaigns ?? [],
  );
  const [partners, setPartners] = useState<Partner[]>(() =>
    initialPartners ?? [],
  );
  const [locations, setLocations] = useState<Location[]>(() =>
    initialLocations ?? [],
  );
  const [users, setUsers] = useState<DashboardUser[]>(() => {
    const users = initialUsers ?? [];
    if (!initialUser) return users;

    const hasUser = users.some((user) => user.email === initialUser.email);
    return hasUser
      ? users.map((user) =>
          user.email === initialUser.email ? initialUser : user,
        )
      : [initialUser, ...users];
  });
  const [roles, setRoles] = useState<Role[]>(() =>
    initialRoles ?? [],
  );
  const [availablePermissions] = useState<PermissionDefinition[]>(() =>
    initialPermissions ?? [],
  );

  const currentUser = useMemo(
    () =>
      users.find((user) => user.email === userEmail) ?? null,
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
      availablePermissions,
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
      availablePermissions,
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
