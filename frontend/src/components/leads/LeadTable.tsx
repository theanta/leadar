import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useLeadStore } from "@/store";
import { truncate, formatDate } from "@/lib/utils";
import type { Lead } from "@/types";

const col = createColumnHelper<Lead>();

interface LeadTableProps {
  data: Lead[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (p: number) => void;
}

export function LeadTable({
  data,
  total,
  page,
  pageSize: _pageSize,
  totalPages,
  isLoading,
  onPageChange,
}: LeadTableProps) {
  const { selectedLeads, toggleSelect, selectAll, clearSelection, openDrawer, setFilters } =
    useLeadStore();

  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => [
      col.display({
        id: "select",
        header: () => (
          <input
            type="checkbox"
            className="rounded-sm border-border accent-foreground"
            checked={data.length > 0 && data.every((r) => selectedLeads.has(r.id))}
            onChange={(e) =>
              e.target.checked ? selectAll(data.map((r) => r.id)) : clearSelection()
            }
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="rounded-sm border-border accent-foreground"
            checked={selectedLeads.has(row.original.id)}
            onChange={() => toggleSelect(row.original.id)}
            onClick={(e) => e.stopPropagation()}
          />
        ),
        size: 40,
      }),
      col.accessor("company_name", {
        header: "Company",
        cell: (info) => (
          <span className="font-medium text-foreground">{info.getValue()}</span>
        ),
      }),
      col.accessor("contact_name", {
        header: "Contact",
        cell: (info) => <span className="text-muted-foreground">{info.getValue() ?? "—"}</span>,
      }),
      col.accessor("contact_title", {
        header: "Role",
        cell: (info) => (
          <span className="text-muted-foreground text-xs">{truncate(info.getValue(), 30)}</span>
        ),
      }),
      col.accessor("email", {
        header: "Email",
        cell: (info) =>
          info.getValue() ? (
            <a
              href={`mailto:${info.getValue()}`}
              className="text-primary text-xs hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {info.getValue()}
            </a>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      }),
      col.accessor("location", {
        header: "Location",
        cell: (info) => <span className="text-muted-foreground text-xs">{info.getValue() ?? "—"}</span>,
      }),
      col.accessor("industry", {
        header: "Industry",
        cell: (info) =>
          info.getValue() ? (
            <Badge variant="secondary" className="text-xs font-normal">
              {truncate(info.getValue()!, 24)}
            </Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      }),
      col.accessor("source", {
        header: "Source",
        cell: (info) => (
          <span className="text-xs text-muted-foreground capitalize">
            {info.getValue()?.replace("_", " ") ?? "—"}
          </span>
        ),
      }),
      col.accessor("created_at", {
        header: "Added",
        cell: (info) => (
          <span className="text-xs text-muted-foreground">{formatDate(info.getValue())}</span>
        ),
      }),
    ],
    [data, selectedLeads, toggleSelect, selectAll, clearSelection]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      setSorting(next);
      if (next.length > 0) {
        setFilters({ sort_by: next[0].id, sort_order: next[0].desc ? "desc" : "asc" });
      }
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: totalPages,
  });

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 border-b border-border bg-surface-soft">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="table-header whitespace-nowrap px-4 py-3 text-left"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        className={`flex items-center gap-1 ${header.column.getCanSort() ? "cursor-pointer select-none hover:text-foreground" : ""}`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="ml-0.5">
                            {header.column.getIsSorted() === "asc" ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ArrowDown className="h-3 w-3" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-40" />
                            )}
                          </span>
                        )}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">
                  No leads found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer border-b border-border transition-colors hover:bg-surface-soft/70"
                  onClick={() => openDrawer(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-border bg-surface-soft px-6 py-3">
        <p className="text-xs text-muted-foreground">
          {selectedLeads.size > 0 ? (
            <span className="text-primary font-medium">{selectedLeads.size} selected · </span>
          ) : null}
          {total} lead{total !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            {page} / {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
