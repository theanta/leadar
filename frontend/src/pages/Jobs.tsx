import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JobStatusBadge } from "@/components/leads/StatusBadge";
import { useJobs } from "@/hooks/useJobs";
import { formatDateTime } from "@/lib/utils";
import type { JobStatus } from "@/types";

const PAGE_SIZE = 25;

export default function Jobs() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { data, isLoading, refetch, isFetching } = useJobs(
    page,
    PAGE_SIZE,
    statusFilter || undefined
  );

  const pagination = (
    <div className="flex shrink-0 items-center justify-between border-t border-border bg-surface-soft px-4 py-3 sm:px-6 lg:px-10">
      <p className="text-xs text-muted-foreground">{data?.total ?? 0} jobs</p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-xs text-muted-foreground">
          {page} / {data?.total_pages || 1}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= (data?.total_pages ?? 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Page header — stacks on mobile */}
      <div className="shrink-0 border-b border-border px-4 py-4 sm:px-6 sm:py-5 lg:px-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="page-title">Scraping Jobs</h1>
            <p className="page-subtitle">{data?.total ?? 0} total jobs</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
              <SelectTrigger className="w-36 rounded-md">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => navigate("/search")}>
              <Search className="h-3.5 w-3.5" />
              New Search
            </Button>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {isLoading ? (
          <div className="space-y-2 p-4 sm:p-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full bg-surface-card" />
            ))}
          </div>
        ) : (
          <>
            {/* ── Mobile card list (hidden on md+) ── */}
            <div className="md:hidden h-full overflow-auto">
              {(data?.items.length ?? 0) === 0 ? (
                <div className="px-4 py-16 text-center text-muted-foreground">
                  No jobs found.{" "}
                  <button
                    onClick={() => navigate("/search")}
                    className="font-medium text-foreground hover:underline"
                  >
                    Start a search →
                  </button>
                </div>
              ) : (
                data?.items.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-start gap-3 border-b border-border px-4 py-4 transition-colors active:bg-surface-soft/60"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-medium text-foreground">{job.keyword}</p>
                        <JobStatusBadge status={job.status as JobStatus} />
                      </div>
                      {job.error_message && (
                        <p className="mt-0.5 truncate text-xs text-destructive">{job.error_message}</p>
                      )}
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                        <span className="capitalize">{job.source.replace("_", " ")}</span>
                        {job.location && <span>{job.location}</span>}
                        {job.total_results > 0 && (
                          <button
                            className="font-medium text-foreground hover:underline"
                            onClick={() => navigate(`/leads?job_id=${job.id}`)}
                          >
                            {job.total_results} leads →
                          </button>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDateTime(job.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ── Desktop table (hidden below md) ── */}
            <div className="hidden md:block h-full overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 border-b border-border bg-surface-soft">
                  <tr>
                    {["Search Query", "Source", "Status", "Leads Found", "Location", "Started", "Completed"].map(
                      (h) => (
                        <th key={h} className="table-header whitespace-nowrap px-4 py-3 text-left">
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data?.items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                        No jobs found.{" "}
                        <button
                          onClick={() => navigate("/search")}
                          className="font-medium text-foreground hover:underline"
                        >
                          Start a search →
                        </button>
                      </td>
                    </tr>
                  ) : (
                    data?.items.map((job) => (
                      <tr
                        key={job.id}
                        className="border-b border-border transition-colors hover:bg-surface-soft/60"
                      >
                        <td className="px-4 py-3">
                          <p className="max-w-xs truncate font-medium text-foreground">{job.keyword}</p>
                          {job.error_message && (
                            <p className="mt-0.5 max-w-xs truncate text-xs text-destructive">
                              {job.error_message}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs capitalize text-muted-foreground">
                          {job.source.replace("_", " ")}
                        </td>
                        <td className="px-4 py-3">
                          <JobStatusBadge status={job.status as JobStatus} />
                        </td>
                        <td className="px-4 py-3">
                          {job.total_results > 0 ? (
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs"
                              onClick={() => navigate(`/leads?job_id=${job.id}`)}
                            >
                              {job.total_results} leads →
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{job.location ?? "—"}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                          {formatDateTime(job.created_at)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                          {job.completed_at ? formatDateTime(job.completed_at) : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {pagination}
    </div>
  );
}
