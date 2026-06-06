import axios from "axios";
import type {
  Lead,
  LeadListResponse,
  LeadFilters,
  ScrapingJob,
  JobListResponse,
  SearchRequest,
  DashboardStats,
  ExportRequest,
} from "@/types";

const client = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? ""}/api`,
  headers: { "Content-Type": "application/json" },
});

// Leads
export const leadsApi = {
  list: (page: number, pageSize: number, filters: LeadFilters): Promise<LeadListResponse> =>
    client
      .get("/leads", { params: { page, page_size: pageSize, ...filters } })
      .then((r) => r.data),

  get: (id: string): Promise<Lead> =>
    client.get(`/leads/${id}`).then((r) => r.data),

  update: (id: string, data: Partial<Lead>): Promise<Lead> =>
    client.patch(`/leads/${id}`, data).then((r) => r.data),

  delete: (id: string): Promise<void> =>
    client.delete(`/leads/${id}`).then((r) => r.data),
};

// Jobs
export const jobsApi = {
  list: (page: number, pageSize: number, status?: string): Promise<JobListResponse> =>
    client
      .get("/jobs", { params: { page, page_size: pageSize, status } })
      .then((r) => r.data),

  get: (id: string): Promise<ScrapingJob> =>
    client.get(`/jobs/${id}`).then((r) => r.data),
};

// Searches
export const searchesApi = {
  start: (data: SearchRequest): Promise<ScrapingJob> =>
    client.post("/searches", data).then((r) => r.data),
};

// Dashboard
export const dashboardApi = {
  stats: (): Promise<DashboardStats> =>
    client.get("/dashboard").then((r) => r.data),
};

// Exports
export const exportsApi = {
  export: async (data: ExportRequest): Promise<void> => {
    const response = await client.post("/exports", data, { responseType: "blob" });
    const ext = data.format === "csv" ? "csv" : "json";
    const mime = data.format === "csv" ? "text/csv" : "application/json";
    const blob = new Blob([response.data], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
