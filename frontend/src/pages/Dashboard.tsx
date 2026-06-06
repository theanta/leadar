import { Users, Building2, Briefcase, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { JobStatusBadge } from "@/components/leads/StatusBadge";
import { useDashboard } from "@/hooks/useDashboard";
import { formatDate } from "@/lib/utils";
import type { JobStatus } from "@/types";
import { cn } from "@/lib/utils";

const STAT_COLORS = [
  {
    bg: "bg-brand-pink",
    iconWrap: "bg-white/25",
    text: "text-white",
    sub: "text-white/75",
  },
  {
    bg: "bg-brand-teal",
    iconWrap: "bg-white/15",
    text: "text-white",
    sub: "text-white/75",
  },
  {
    bg: "bg-brand-lavender",
    iconWrap: "bg-black/10",
    text: "text-foreground",
    sub: "text-foreground/70",
  },
  {
    bg: "bg-brand-peach",
    iconWrap: "bg-black/10",
    text: "text-foreground",
    sub: "text-foreground/70",
  },
] as const;

function StatCard({
  title,
  value,
  icon: Icon,
  colorIndex,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  colorIndex: number;
}) {
  const color = STAT_COLORS[colorIndex % STAT_COLORS.length];
  return (
    <div className={cn("rounded-xl p-6", color.bg)}>
      <div className="mb-5 flex items-start justify-between">
        <p className={cn("text-label", color.sub)}>{title}</p>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", color.iconWrap)}>
          <Icon className={cn("h-5 w-5", color.text)} />
        </div>
      </div>
      <p className={cn("text-display-sm font-medium", color.text)}>{value}</p>
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="rounded-xl bg-surface-card p-6">
      <div className="mb-5 flex items-start justify-between">
        <Skeleton className="h-3 w-24 bg-surface-strong" />
        <Skeleton className="h-10 w-10 rounded-lg bg-surface-strong" />
      </div>
      <Skeleton className="h-9 w-16 bg-surface-strong" />
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading } = useDashboard();

  return (
    <div className="space-y-8 overflow-y-auto p-6 lg:p-10">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">ANTA Lead Intelligence overview</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard title="Total Leads" value={data?.total_leads ?? 0} icon={Users} colorIndex={0} />
            <StatCard title="Companies" value={data?.total_companies ?? 0} icon={Building2} colorIndex={1} />
            <StatCard title="Active Jobs" value={data?.active_jobs ?? 0} icon={Briefcase} colorIndex={2} />
            <StatCard title="Completed Jobs" value={data?.completed_jobs ?? 0} icon={CheckCircle} colorIndex={3} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Leads</CardTitle>
              <Link to="/leads" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                View all →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full bg-surface-card" />
                ))}
              </div>
            ) : data?.recent_leads.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No leads yet. Run a search to get started.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {data?.recent_leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between py-3 transition-colors hover:bg-surface-soft rounded-md px-2 -mx-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{lead.company_name}</p>
                      <p className="text-xs text-muted-foreground">{lead.location ?? "—"}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(lead.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Jobs</CardTitle>
              <Link to="/jobs" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                View all →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full bg-surface-card" />
                ))}
              </div>
            ) : data?.recent_jobs.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No jobs yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {data?.recent_jobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between py-3 transition-colors hover:bg-surface-soft rounded-md px-2 -mx-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{job.keyword}</p>
                      <p className="text-xs text-muted-foreground">{job.total_results} results</p>
                    </div>
                    <JobStatusBadge status={job.status as JobStatus} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
