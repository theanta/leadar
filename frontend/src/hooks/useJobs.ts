import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsApi, searchesApi } from "@/services/api";
import type { SearchRequest } from "@/types";

export function useJobs(page: number, pageSize: number, status?: string) {
  return useQuery({
    queryKey: ["jobs", page, pageSize, status],
    queryFn: () => jobsApi.list(page, pageSize, status),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const hasActive = data.items.some((j) => j.status === "pending" || j.status === "running");
      return hasActive ? 5000 : false;
    },
    placeholderData: (prev) => prev,
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ["jobs", id],
    queryFn: () => jobsApi.get(id),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      return data.status === "pending" || data.status === "running" ? 3000 : false;
    },
  });
}

export function useStartSearch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SearchRequest) => searchesApi.start(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
