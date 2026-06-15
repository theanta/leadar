import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLeadStore } from "@/store";

const SOURCES = [
  { value: "google_maps", label: "Google Maps" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "manual", label: "Manual" },
];

export function LeadFilters() {
  const { filters, setFilters, resetFilters } = useLeadStore();
  const hasActive = filters.search || filters.industry || filters.location || filters.source;

  return (
    /*
     * Mobile: 2-col grid — search spans both cols, then industry/location
     *         fill one col each, then source + clear share the bottom row.
     * sm+:    flat flex-wrap row (original desktop layout).
     */
    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
      {/* Search — full width on mobile */}
      <div className="col-span-2 relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-8 w-full sm:w-52"
          placeholder="Search leads..."
          value={filters.search ?? ""}
          onChange={(e) => setFilters({ search: e.target.value })}
        />
      </div>

      {/* Industry */}
      <Input
        className="w-full sm:w-40"
        placeholder="Industry"
        value={filters.industry ?? ""}
        onChange={(e) => setFilters({ industry: e.target.value })}
      />

      {/* Location */}
      <Input
        className="w-full sm:w-40"
        placeholder="Location"
        value={filters.location ?? ""}
        onChange={(e) => setFilters({ location: e.target.value })}
      />

      {/* Source */}
      <Select
        value={filters.source ?? ""}
        onValueChange={(v) => setFilters({ source: v === "all" ? "" : v })}
      >
        <SelectTrigger className="w-full sm:w-36">
          <SelectValue placeholder="Source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All sources</SelectItem>
          {SOURCES.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear — stays in the same row as Source on mobile */}
      {hasActive ? (
        <Button variant="ghost" size="sm" onClick={resetFilters} className="w-full sm:w-auto">
          <X className="h-3.5 w-3.5 mr-1" />
          Clear
        </Button>
      ) : (
        /* Empty placeholder keeps the grid balanced when Clear is hidden */
        <div />
      )}
    </div>
  );
}
