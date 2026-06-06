import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/services/api";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.stats,
    refetchInterval: 30_000,
  });
}
