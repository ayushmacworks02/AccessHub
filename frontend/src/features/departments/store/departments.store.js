import { create } from "zustand";

const initialFilters = {
  search: "",
  status: "all",
  page: 1,
  limit: 10,
  sortBy: "createdAt",
  sortOrder: "desc",
};

const departmentEmptyDraft = {
  name: "",
  code: "",
  description: "",
  status: "active",
};

const buildDepartmentDraft = (department) => ({
  name: department?.name || "",
  code: department?.code || "",
  description: department?.description || "",
  status: department?.status || "active",
});

export const useDepartmentsStore = create((set) => ({
  ...initialFilters,

  formDialogOpen: false,
  selectedDepartment: null,
  formDraft: departmentEmptyDraft,

  deleteDialogOpen: false,
  departmentToDelete: null,

  setSearch: (search) => {
    set({
      search,
      page: 1,
    });
  },

  setStatus: (status) => {
    set({
      status,
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

  setFormDraft: (formDraft) => {
    set({
      formDraft: {
        name: formDraft?.name || "",
        code: formDraft?.code || "",
        description: formDraft?.description || "",
        status: formDraft?.status || "active",
      },
    });
  },

  openCreateDialog: () => {
    set((state) => ({
      formDialogOpen: true,
      selectedDepartment: null,
      formDraft: state.selectedDepartment
        ? departmentEmptyDraft
        : state.formDraft,
    }));
  },

  openEditDialog: (department) => {
    set((state) => {
      const isSameDepartment =
        state.selectedDepartment?._id &&
        state.selectedDepartment._id === department._id;

      return {
        formDialogOpen: true,
        selectedDepartment: department,
        formDraft: isSameDepartment
          ? state.formDraft
          : buildDepartmentDraft(department),
      };
    });
  },

  closeFormDialog: () => {
    set({
      formDialogOpen: false,
    });
  },

  resetAndCloseFormDialog: () => {
    set({
      formDialogOpen: false,
      selectedDepartment: null,
      formDraft: departmentEmptyDraft,
    });
  },

  openDeleteDialog: (department) => {
    set({
      deleteDialogOpen: true,
      departmentToDelete: department,
    });
  },

  closeDeleteDialog: () => {
    set({
      deleteDialogOpen: false,
      departmentToDelete: null,
    });
  },
}));