export interface Lead {
  id: string;
  company_name: string;
  website: string | null;
  linkedin_url: string | null;
  industry: string | null;
  employee_count: string | null;
  contact_name: string | null;
  contact_title: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  source: string | null;
  source_url: string | null;
  notes: string | null;
  job_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadListResponse {
  items: Lead[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface LeadFilters {
  search?: string;
  industry?: string;
  location?: string;
  source?: string;
  job_id?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export type JobStatus = "pending" | "running" | "completed" | "failed";

export interface ScrapingJob {
  id: string;
  keyword: string;
  industry: string | null;
  location: string | null;
  company_size: string | null;
  source: string;
  status: JobStatus;
  apify_run_id: string | null;
  total_results: number;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface JobListResponse {
  items: ScrapingJob[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface SearchRequest {
  keyword: string;
  industry?: string;
  location?: string;
  company_size?: string;
  source?: string;
}

export interface DashboardStats {
  total_leads: number;
  total_companies: number;
  active_jobs: number;
  completed_jobs: number;
  recent_leads: Array<{
    id: string;
    company_name: string;
    contact_name: string | null;
    location: string | null;
    created_at: string;
  }>;
  recent_jobs: Array<{
    id: string;
    keyword: string;
    status: string;
    total_results: number;
    created_at: string;
  }>;
}

export interface ExportRequest {
  lead_ids: string[];
  format: "csv" | "json";
}

export type SortOrder = "asc" | "desc";
