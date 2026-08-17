import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  WorkItemFilters,
  ExecutiveSummary,
  PaginatedWorkItemsResponse,
  StatusDistributionResponse,
  WorkItemAlertsResponse,
  RecentActivitiesResponse,
  ProjectProgressResponse,
  WorkItem,
  CreateDemandaInput,
} from "../domain/demandas-projetos-types";

const CONTEXT_ID = "ctx-gov-2026";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `Erro HTTP ${res.status}`);
  }
  return res.json();
}

// 1. QUERY PARA RESUMO EXECUTIVO (6 KPIs)
export function useExecutiveSummary(contextId: string = CONTEXT_ID, filters?: WorkItemFilters) {
  const params = new URLSearchParams();
  if (filters?.search) params.set("search", filters.search);
  if (filters?.type && filters.type !== "all") params.set("type", filters.type);
  if (filters?.status && filters.status !== "all") params.set("status", filters.status);
  if (filters?.priority && filters.priority !== "all") params.set("priority", filters.priority);

  return useQuery<ExecutiveSummary>({
    queryKey: ["management-context", contextId, "executive-summary", params.toString()],
    queryFn: () => fetchJson(`/api/management-contexts/${contextId}/work-items/summary?${params.toString()}`),
    staleTime: 30000,
  });
}

// 2. QUERY PARA LISTAGEM PAGINADA E FILTRADA
export function useWorkItemsList(contextId: string = CONTEXT_ID, filters: WorkItemFilters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);
  if (filters.type && filters.type !== "all") params.set("type", filters.type);
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.priority && filters.priority !== "all") params.set("priority", filters.priority);
  if (filters.requestingAreaId && filters.requestingAreaId !== "all")
    params.set("requestingAreaId", filters.requestingAreaId);
  if (filters.assigneeId && filters.assigneeId !== "all") params.set("assigneeId", filters.assigneeId);
  if (filters.projectId && filters.projectId !== "all") params.set("projectId", filters.projectId);
  if (filters.page) params.set("page", filters.page.toString());
  if (filters.pageSize) params.set("pageSize", filters.pageSize.toString());
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortDirection) params.set("sortDirection", filters.sortDirection);
  if (filters.view) params.set("view", filters.view);

  return useQuery<PaginatedWorkItemsResponse>({
    queryKey: ["management-context", contextId, "work-items", params.toString()],
    queryFn: () => fetchJson(`/api/management-contexts/${contextId}/work-items?${params.toString()}`),
    staleTime: 15000,
  });
}

// 3. QUERY PARA DISTRIBUIÇÃO POR SITUAÇÃO (GRÁFICO DONUT)
export function useStatusDistribution(contextId: string = CONTEXT_ID, filters?: WorkItemFilters) {
  const params = new URLSearchParams();
  if (filters?.type && filters.type !== "all") params.set("type", filters.type);
  if (filters?.priority && filters.priority !== "all") params.set("priority", filters.priority);

  return useQuery<StatusDistributionResponse>({
    queryKey: ["management-context", contextId, "status-distribution", params.toString()],
    queryFn: () =>
      fetchJson(`/api/management-contexts/${contextId}/work-items/status-distribution?${params.toString()}`),
    staleTime: 60000,
  });
}

// 4. QUERY PARA PRAZOS E ALERTAS
export function useWorkItemAlerts(contextId: string = CONTEXT_ID) {
  return useQuery<WorkItemAlertsResponse>({
    queryKey: ["management-context", contextId, "alerts"],
    queryFn: () => fetchJson(`/api/management-contexts/${contextId}/work-items/alerts`),
    staleTime: 30000,
  });
}

// 5. QUERY PARA ATIVIDADES RECENTES
export function useRecentActivities(contextId: string = CONTEXT_ID) {
  return useQuery<RecentActivitiesResponse>({
    queryKey: ["management-context", contextId, "recent-activities"],
    queryFn: () => fetchJson(`/api/management-contexts/${contextId}/work-items/recent-activities`),
    staleTime: 20000,
  });
}

// 6. QUERY PARA PROGRESSO DOS PROJETOS
export function useProjectProgress(contextId: string = CONTEXT_ID) {
  return useQuery<ProjectProgressResponse>({
    queryKey: ["management-context", contextId, "project-progress"],
    queryFn: () => fetchJson(`/api/management-contexts/${contextId}/projects/progress`),
    staleTime: 30000,
  });
}

// 7. QUERY PARA OPÇÕES DOS DROPDOWNS DE FILTRO
export function useWorkItemOptions(contextId: string = CONTEXT_ID) {
  return useQuery<{
    requestingAreas: { id: string; name: string }[];
    eligibleAssignees: { id: string; name: string }[];
    projects: { id: string; code: string; name: string }[];
    workItemTypes: { code: string; label: string }[];
    priorities: { code: string; label: string }[];
    statuses: { code: string; label: string }[];
  }>({
    queryKey: ["management-context", contextId, "options"],
    queryFn: () => fetchJson(`/api/management-contexts/${contextId}/options`),
    staleTime: 600000,
  });
}

// 8. MUTATION PARA CRIAR DEMANDA
export function useCreateDemanda(contextId: string = CONTEXT_ID) {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; demanda: WorkItem }, Error, CreateDemandaInput>({
    mutationFn: (newDemanda) =>
      fetchJson<{ success: boolean; demanda: WorkItem }>(`/api/management-contexts/${contextId}/demands`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDemanda),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["management-context", contextId] });
    },
  });
}

// 9. MUTATION PARA EXPORTAÇÃO
export function useExportDemands(contextId: string = CONTEXT_ID) {
  return useMutation<Blob, Error, WorkItemFilters>({
    mutationFn: async (filters) => {
      const res = await fetch(`/api/management-contexts/${contextId}/demands/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters }),
      });

      if (!res.ok) {
        throw new Error("Falha ao exportar dados.");
      }

      return res.blob();
    },
  });
}

// 10. MUTATION PARA ALTERAR SITUAÇÃO DA DEMANDA
export function useTransitionStatus(contextId: string = CONTEXT_ID) {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; message: string; demanda: WorkItem },
    Error,
    { demandId: string; newStatus: string; technicalReport?: string }
  >({
    mutationFn: ({ demandId, newStatus, technicalReport }) =>
      fetchJson(`/api/management-contexts/${contextId}/demands/${demandId}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStatus, technicalReport }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["management-context", contextId] });
    },
  });
}

// 11. MUTATION PARA CONVERTER DEMANDA EM PROJETO
export function useConvertToProject(contextId: string = CONTEXT_ID) {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; message: string; project: WorkItem },
    Error,
    { demandId: string }
  >({
    mutationFn: ({ demandId }) =>
      fetchJson(`/api/management-contexts/${contextId}/demands/${demandId}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "convert" }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["management-context", contextId] });
    },
  });
}
