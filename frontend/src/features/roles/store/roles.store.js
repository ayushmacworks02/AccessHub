import { create } from "zustand";

const initialFilters = {
  search: "",
  status: "all",
  department: "all",
  page: 1,
  limit: 10,
  sortBy: "createdAt",
  sortOrder: "desc",
};

const roleEmptyDraft = {
  name: "",
  code: "",
  description: "",
  department: "none",
  status: "active",
  permissions: [],
};

const permissionsEmptyDraft = {
  search: "",
  permissions: [],
};

const getPermissionId = (permission) => {
  if (!permission) {
    return "";
  }

  if (typeof permission === "string") {
    return permission;
  }

  return permission._id || "";
};

const buildRoleDraft = (role) => ({
  name: role?.name || "",
  code: role?.code || "",
  description: role?.description || "",
  department: role?.department?._id || "none",
  status: role?.status || "active",
  permissions: Array.isArray(role?.permissions)
    ? role.permissions.map(getPermissionId).filter(Boolean)
    : [],
});

const buildPermissionsDraft = (role) => ({
  search: "",
  permissions: Array.isArray(role?.permissions)
    ? role.permissions.map(getPermissionId).filter(Boolean)
    : [],
});

export const useRolesStore = create((set) => ({
  ...initialFilters,

  formDialogOpen: false,
  selectedRole: null,
  formDraft: roleEmptyDraft,

  permissionsDialogOpen: false,
  roleForPermissions: null,
  permissionsDraft: permissionsEmptyDraft,

  deleteDialogOpen: false,
  roleToDelete: null,

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

  setDepartment: (department) => {
    set({
      department,
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
        department: formDraft?.department || "none",
        status: formDraft?.status || "active",
        permissions: Array.isArray(formDraft?.permissions)
          ? formDraft.permissions
          : [],
      },
    });
  },

  openCreateDialog: () => {
    set((state) => ({
      formDialogOpen: true,
      selectedRole: null,
      formDraft: state.selectedRole ? roleEmptyDraft : state.formDraft,
    }));
  },

  openEditDialog: (role) => {
    set((state) => {
      const isSameRole =
        state.selectedRole?._id && state.selectedRole._id === role._id;

      return {
        formDialogOpen: true,
        selectedRole: role,
        formDraft: isSameRole ? state.formDraft : buildRoleDraft(role),
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
      selectedRole: null,
      formDraft: roleEmptyDraft,
    });
  },

  setPermissionsDraft: (permissionsDraft) => {
    set({
      permissionsDraft: {
        search: permissionsDraft?.search || "",
        permissions: Array.isArray(permissionsDraft?.permissions)
          ? permissionsDraft.permissions
          : [],
      },
    });
  },

  openPermissionsDialog: (role) => {
    set((state) => {
      const isSameRole =
        state.roleForPermissions?._id &&
        state.roleForPermissions._id === role._id;

      return {
        permissionsDialogOpen: true,
        roleForPermissions: role,
        permissionsDraft: isSameRole
          ? state.permissionsDraft
          : buildPermissionsDraft(role),
      };
    });
  },

  closePermissionsDialog: () => {
    set({
      permissionsDialogOpen: false,
    });
  },

  resetAndClosePermissionsDialog: () => {
    set({
      permissionsDialogOpen: false,
      roleForPermissions: null,
      permissionsDraft: permissionsEmptyDraft,
    });
  },

  openDeleteDialog: (role) => {
    set({
      deleteDialogOpen: true,
      roleToDelete: role,
    });
  },

  closeDeleteDialog: () => {
    set({
      deleteDialogOpen: false,
      roleToDelete: null,
    });
  },
}));