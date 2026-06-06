import { create } from "zustand";
import type { Lead, LeadFilters } from "@/types";

interface LeadStore {
  selectedLeads: Set<string>;
  selectedLead: Lead | null;
  drawerOpen: boolean;
  filters: LeadFilters;

  toggleSelect: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  openDrawer: (lead: Lead) => void;
  closeDrawer: () => void;
  setFilters: (filters: Partial<LeadFilters>) => void;
  resetFilters: () => void;
}

const DEFAULT_FILTERS: LeadFilters = {
  search: "",
  industry: "",
  location: "",
  source: "",
  sort_by: "created_at",
  sort_order: "desc",
};

export const useLeadStore = create<LeadStore>((set) => ({
  selectedLeads: new Set(),
  selectedLead: null,
  drawerOpen: false,
  filters: DEFAULT_FILTERS,

  toggleSelect: (id) =>
    set((state) => {
      const next = new Set(state.selectedLeads);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selectedLeads: next };
    }),

  selectAll: (ids) =>
    set((state) => {
      const next = new Set(state.selectedLeads);
      ids.forEach((id) => next.add(id));
      return { selectedLeads: next };
    }),

  clearSelection: () => set({ selectedLeads: new Set() }),

  openDrawer: (lead) => set({ selectedLead: lead, drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
}));
