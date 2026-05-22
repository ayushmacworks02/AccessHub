import { create } from "zustand";

const initialFilters = {
  search: "",
  action: "all",
  resource: "all",
  page: 1,
  limit: 10,
  sortBy: "createdAt",
  sortOrder: "desc",
};

export const useAuditsStore = create((set) => ({
  ...initialFilters,

  detailDialogOpen: false,
  selectedAudit: null,

  setSearch: (search) => {
    set({
      search,
      page: 1,
    });
  },

  setAction: (action) => {
    set({
      action,
      page: 1,
    });
  },

  setResource: (resource) => {
    set({
      resource,
      page: 1,
    });
  },

  setPage: (page) => {
    set({
      page,
    });
  },

  setLimit: (limit) => {
    set({
      limit,
      page: 1,
    });
  },

  setSorting: ({ sortBy, sortOrder }) => {
    set({
      sortBy,
      sortOrder,
      page: 1,
    });
  },

  resetFilters: () => {
    set(initialFilters);
  },

  openDetailDialog: (audit) => {
    set({
      detailDialogOpen: true,
      selectedAudit: audit,
    });
  },

  closeDetailDialog: () => {
    set({
      detailDialogOpen: false,
      selectedAudit: null,
    });
  },
}));