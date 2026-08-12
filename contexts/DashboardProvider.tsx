"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
  FinancialTransaction,
  Survey,
} from "@/lib/domain/types";

type DashboardContextValue = {
  regions: Region[];
  campaigns: Campaign[];
  partners: Partner[];
  locations: Location[];
  users: DashboardUser[];
  roles: Role[];
  availablePermissions: PermissionDefinition[];
  finances: FinancialTransaction[];
  surveys: Survey[];
  currentRole: Role | null;
  userEmail: string;
  getRegionName: (id: string) => string;
  getRoleName: (roleId: string) => string;
  can: (permission: string) => boolean;
  setRegions: React.Dispatch<React.SetStateAction<Region[]>>;
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  setPartners: React.Dispatch<React.SetStateAction<Partner[]>>;
  setLocations: React.Dispatch<React.SetStateAction<Location[]>>;
  setUsers: React.Dispatch<React.SetStateAction<DashboardUser[]>>;
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
  setFinances: React.Dispatch<React.SetStateAction<FinancialTransaction[]>>;
  setSurveys: React.Dispatch<React.SetStateAction<Survey[]>>;
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
  initialFinances?: FinancialTransaction[];
  initialSurveys?: Survey[];
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
  initialFinances,
  initialSurveys,
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
  const [locations, setLocations] = useState<Location[]>(
    () => initialLocations ?? [],
  );
  const [isMounted, setIsMounted] = useState(false);

  // Carregar do localStorage após a hidratação
  useEffect(() => {
    setIsMounted(true);
    try {
      // Regiões
      const savedReg = localStorage.getItem("dashbom_regions");
      if (savedReg) {
        const parsedReg = JSON.parse(savedReg);
        if (Array.isArray(parsedReg)) setRegions(parsedReg);
      }
      // Locais / Comitês
      const savedLoc = localStorage.getItem("dashbom_locations");
      if (savedLoc) {
        const parsedLoc = JSON.parse(savedLoc);
        if (Array.isArray(parsedLoc)) {
          const realLocations = parsedLoc.filter((loc: any) => loc.id && !loc.id.startsWith("loc-"));
          setLocations(realLocations);
        }
      }
      // Campanhas
      const savedCam = localStorage.getItem("dashbom_campaigns");
      if (savedCam) {
        const parsedCam = JSON.parse(savedCam);
        if (Array.isArray(parsedCam)) setCampaigns(parsedCam);
      }
      // Parceiros
      const savedPar = localStorage.getItem("dashbom_partners");
      if (savedPar) {
        const parsedPar = JSON.parse(savedPar);
        if (Array.isArray(parsedPar)) setPartners(parsedPar);
      }
    } catch {}
  }, []);

  // Persistir alterações no localStorage após a montagem
  useEffect(() => {
    if (isMounted && typeof window !== "undefined") {
      try {
        localStorage.setItem("dashbom_regions", JSON.stringify(regions));
        localStorage.setItem("dashbom_locations", JSON.stringify(locations));
        localStorage.setItem("dashbom_campaigns", JSON.stringify(campaigns));
        localStorage.setItem("dashbom_partners", JSON.stringify(partners));
      } catch {}
    }
  }, [regions, locations, campaigns, partners, isMounted]);
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
  const [finances, setFinances] = useState<FinancialTransaction[]>(() =>
    initialFinances ?? [],
  );
  const [surveys, setSurveys] = useState<Survey[]>(() =>
    initialSurveys ?? [],
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
      finances,
      surveys,
      currentRole,
      userEmail,
      getRegionName,
      getRoleName,
      can,
      setRegions,
      setCampaigns,
      setPartners,
      setLocations,
      setUsers,
      setRoles,
      setFinances,
      setSurveys,
    }),
    [
      regions,
      campaigns,
      partners,
      locations,
      users,
      roles,
      availablePermissions,
      finances,
      surveys,
      currentRole,
      userEmail,
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
