import { useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadTable } from "@/components/leads/LeadTable";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { LeadDrawer } from "@/components/leads/LeadDrawer";
import { useLeads } from "@/hooks/useLeads";
import { useLeadStore } from "@/store";
import { exportsApi } from "@/services/api";

const PAGE_SIZE = 25;

export default function Leads() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useLeads(page, PAGE_SIZE);
  const { selectedLeads, clearSelection } = useLeadStore();
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: "csv" | "json") => {
    setExporting(true);
    try {
      const ids =
        selectedLeads.size > 0 ? Array.from(selectedLeads) : (data?.items.map((l) => l.id) ?? []);
      await exportsApi.export({ lead_ids: ids, format });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border px-6 py-5 lg:px-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Leads</h1>
            <p className="page-subtitle">
              {data?.total ?? 0} total ·{" "}
              {selectedLeads.size > 0 ? `${selectedLeads.size} selected` : "none selected"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedLeads.size > 0 && (
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                <Trash2 className="h-3.5 w-3.5" />
                Deselect
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("csv")}
              disabled={exporting || (data?.total ?? 0) === 0}
            >
              <Download className="h-3.5 w-3.5" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("json")}
              disabled={exporting || (data?.total ?? 0) === 0}
            >
              <Download className="h-3.5 w-3.5" />
              JSON
            </Button>
          </div>
        </div>
      </div>

      <div className="shrink-0 border-b border-border bg-surface-soft px-6 py-4 lg:px-10">
        <LeadFilters />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <LeadTable
          data={data?.items ?? []}
          total={data?.total ?? 0}
          page={page}
          pageSize={PAGE_SIZE}
          totalPages={data?.total_pages ?? 0}
          isLoading={isLoading}
          onPageChange={setPage}
        />
      </div>

      <LeadDrawer />
    </div>
  );
}
