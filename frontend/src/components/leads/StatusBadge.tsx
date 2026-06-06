import { Badge } from "@/components/ui/badge";
import type { JobStatus } from "@/types";

const statusConfig: Record<JobStatus, { label: string; variant: "success" | "info" | "warning" | "destructive" }> = {
  completed: { label: "Completed", variant: "success" },
  running: { label: "Running", variant: "info" },
  pending: { label: "Pending", variant: "warning" },
  failed: { label: "Failed", variant: "destructive" },
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const cfg = statusConfig[status] ?? { label: status, variant: "info" as const };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
