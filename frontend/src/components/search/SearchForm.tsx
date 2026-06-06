import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useStartSearch } from "@/hooks/useJobs";
import type { SearchRequest } from "@/types";

const EXAMPLE_SEARCHES = [
  "Manufacturing companies in Detroit",
  "Logistics companies in Michigan",
  "Automotive suppliers USA",
  "Tech startups in Chicago",
];

interface SearchFormProps {
  onSuccess?: (jobId: string) => void;
}

export function SearchForm({ onSuccess }: SearchFormProps) {
  const [form, setForm] = useState<SearchRequest>({
    keyword: "",
    industry: "",
    location: "",
    company_size: "",
    source: "google_maps",
  });
  const startSearch = useStartSearch();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.keyword.trim()) return;

    const payload: SearchRequest = {
      keyword: form.keyword,
      source: form.source,
      ...(form.industry && { industry: form.industry }),
      ...(form.location && { location: form.location }),
      ...(form.company_size && { company_size: form.company_size }),
    };

    startSearch.mutate(payload, {
      onSuccess: (job) => {
        setForm({ keyword: "", industry: "", location: "", company_size: "", source: "google_maps" });
        onSuccess?.(job.id);
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Lead Search</CardTitle>
        <CardDescription>
          Enter search criteria to discover new leads. The search runs in the background via Apify.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="keyword">
              Search Query <span className="text-destructive">*</span>
            </Label>
            <Input
              id="keyword"
              placeholder="e.g. manufacturing companies in Detroit"
              value={form.keyword}
              onChange={(e) => setForm((f) => ({ ...f, keyword: e.target.value }))}
              required
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {EXAMPLE_SEARCHES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, keyword: ex }))}
                  className="rounded-md border border-border bg-surface-soft px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                placeholder="e.g. automotive"
                value={form.industry}
                onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g. Michigan, USA"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_size">Company Size</Label>
              <Select
                value={form.company_size || "any"}
                onValueChange={(v) => setForm((f) => ({ ...f, company_size: v === "any" ? "" : v }))}
              >
                <SelectTrigger id="company_size">
                  <SelectValue placeholder="Any size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any size</SelectItem>
                  <SelectItem value="1-10">1–10 employees</SelectItem>
                  <SelectItem value="11-50">11–50 employees</SelectItem>
                  <SelectItem value="51-200">51–200 employees</SelectItem>
                  <SelectItem value="201-1000">201–1000 employees</SelectItem>
                  <SelectItem value="1000+">1000+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Data Source</Label>
              <Select
                value={form.source}
                onValueChange={(v) => setForm((f) => ({ ...f, source: v }))}
              >
                <SelectTrigger id="source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google_maps">Google Maps</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={startSearch.isPending || !form.keyword.trim()}
          >
            {startSearch.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Starting search...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Start Search
              </>
            )}
          </Button>

          {startSearch.isError && (
            <p className="text-sm text-destructive text-center">
              Failed to start search. Check your Apify configuration.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
