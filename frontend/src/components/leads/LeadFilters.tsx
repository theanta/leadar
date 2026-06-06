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
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-8 w-52"
          placeholder="Search leads..."
          value={filters.search ?? ""}
          onChange={(e) => setFilters({ search: e.target.value })}
        />
      </div>
      <Input
        className="w-40"
        placeholder="Industry"
        value={filters.industry ?? ""}
        onChange={(e) => setFilters({ industry: e.target.value })}
      />
      <Input
        className="w-40"
        placeholder="Location"
        value={filters.location ?? ""}
        onChange={(e) => setFilters({ location: e.target.value })}
      />
      <Select
        value={filters.source ?? ""}
        onValueChange={(v) => setFilters({ source: v === "all" ? "" : v })}
      >
        <SelectTrigger className="w-36">
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
      {hasActive && (
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          <X className="h-3.5 w-3.5 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
