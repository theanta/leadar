import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leadsApi } from "@/services/api";
import { useLeadStore } from "@/store";
import type { LeadFilters } from "@/types";

export function useLeads(page: number, pageSize: number) {
  const filters = useLeadStore((s) => s.filters);
  const cleanFilters: LeadFilters = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== "" && v != null)
  ) as LeadFilters;

  return useQuery({
    queryKey: ["leads", page, pageSize, cleanFilters],
    queryFn: () => leadsApi.list(page, pageSize, cleanFilters),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof leadsApi.update>[1] }) =>
      leadsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leadsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}
