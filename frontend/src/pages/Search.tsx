import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";
import { SearchForm } from "@/components/search/SearchForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useJobs } from "@/hooks/useJobs";
import { JobStatusBadge } from "@/components/leads/StatusBadge";
import { formatDate } from "@/lib/utils";
import type { JobStatus } from "@/types";

export default function Search() {
  const navigate = useNavigate();
  const [lastJobId, setLastJobId] = useState<string | null>(null);
  const { data: jobs } = useJobs(1, 5);

  return (
    <div className="mx-auto max-w-3xl space-y-8 overflow-y-auto p-6 lg:p-10">
      <div>
        <h1 className="page-title">New Lead Search</h1>
        <p className="page-subtitle">Trigger an Apify scraping job to discover new leads.</p>
      </div>

      {lastJobId && (
        <div className="flex items-center gap-4 rounded-lg border border-brand-mint/40 bg-brand-mint/10 px-4 py-4">
          <CheckCircle className="h-4 w-4 shrink-0 text-success" />
          <span className="flex-1 text-sm text-foreground">
            Search started. Results will appear in Leads once complete.
          </span>
          <Button variant="ghost" size="sm" onClick={() => navigate("/jobs")}>
            View jobs
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      <SearchForm onSuccess={setLastJobId} />

      {(jobs?.items.length ?? 0) > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Recent Searches</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y divide-border">
              {jobs?.items.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between py-3 transition-colors hover:bg-surface-soft rounded-md px-2 -mx-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{job.keyword}</p>
                    <p className="text-xs text-muted-foreground">
                      {job.location ? `${job.location} · ` : ""}
                      {formatDate(job.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{job.total_results} leads</span>
                    <JobStatusBadge status={job.status as JobStatus} />
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="mt-4 w-full" onClick={() => navigate("/jobs")}>
              View all jobs
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
