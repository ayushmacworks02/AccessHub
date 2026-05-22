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

const userCreateEmptyDraft = {
  name: "",
  email: "",
  password: "",
  department: "none",
  roles: [],
  status: "active",
};

const userEditEmptyDraft = {
  name: "",
  email: "",
  password: "",
  department: "none",
};

const userStatusEmptyDraft = {
  status: "active",
};

const userRolesEmptyDraft = {
  roles: [],
};

const previewEmptyState = {
  open: false,
  title: "",
  description: "",
  previewUrl: "",
  messageId: "",
  status: "idle",
};

const getEntityId = (entity) => {
  if (!entity) {
    return "";
  }

  if (typeof entity === "string") {
    return entity;
  }

  return entity._id || "";
};

const buildCreateDraft = () => ({
  ...userCreateEmptyDraft,
});

const buildEditDraft = (user) => ({
  name: user?.name || "",
  email: user?.email || "",
  password: "",
  department: user?.department?._id || "none",
});

const buildStatusDraft = (user) => ({
  status: user?.status || "active",
});

const buildRolesDraft = (user) => ({
  roles: Array.isArray(user?.roles)
    ? user.roles.map(getEntityId).filter(Boolean)
    : [],
});

export const useUsersStore = create((set) => ({
  ...initialFilters,

  formDialogOpen: false,
  selectedUser: null,
  formMode: "create",
  createDraft: userCreateEmptyDraft,
  editDraft: userEditEmptyDraft,

  statusDialogOpen: false,
  userForStatus: null,
  statusDraft: userStatusEmptyDraft,

  rolesDialogOpen: false,
  userForRoles: null,
  rolesDraft: userRolesEmptyDraft,

  deleteDialogOpen: false,
  userToDelete: null,

  emailPreviewDialog: previewEmptyState,

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

  openCreateDialog: () => {
    set({
      formDialogOpen: true,
      formMode: "create",
      selectedUser: null,
      createDraft: buildCreateDraft(),
    });
  },

  openEditDialog: (user) => {
    set({
      formDialogOpen: true,
      formMode: "edit",
      selectedUser: user,
      editDraft: buildEditDraft(user),
    });
  },

  closeFormDialog: () => {
    set({
      formDialogOpen: false,
      selectedUser: null,
    });
  },

  setCreateDraft: (draft) => {
    set({
      createDraft: {
        ...userCreateEmptyDraft,
        ...draft,
      },
    });
  },

  setEditDraft: (draft) => {
    set({
      editDraft: {
        ...userEditEmptyDraft,
        ...draft,
      },
    });
  },

  resetAndCloseFormDialog: () => {
    set({
      formDialogOpen: false,
      selectedUser: null,
      formMode: "create",
      createDraft: buildCreateDraft(),
      editDraft: userEditEmptyDraft,
    });
  },

  openStatusDialog: (user) => {
    set({
      statusDialogOpen: true,
      userForStatus: user,
      statusDraft: buildStatusDraft(user),
    });
  },

  closeStatusDialog: () => {
    set({
      statusDialogOpen: false,
      userForStatus: null,
    });
  },

  setStatusDraft: (draft) => {
    set({
      statusDraft: {
        ...userStatusEmptyDraft,
        ...draft,
      },
    });
  },

  resetAndCloseStatusDialog: () => {
    set({
      statusDialogOpen: false,
      userForStatus: null,
      statusDraft: userStatusEmptyDraft,
    });
  },

  openRolesDialog: (user) => {
    set({
      rolesDialogOpen: true,
      userForRoles: user,
      rolesDraft: buildRolesDraft(user),
    });
  },

  closeRolesDialog: () => {
    set({
      rolesDialogOpen: false,
      userForRoles: null,
    });
  },

  setRolesDraft: (draft) => {
    set({
      rolesDraft: {
        ...userRolesEmptyDraft,
        ...draft,
      },
    });
  },

  resetAndCloseRolesDialog: () => {
    set({
      rolesDialogOpen: false,
      userForRoles: null,
      rolesDraft: userRolesEmptyDraft,
    });
  },

  openDeleteDialog: (user) => {
    set({
      deleteDialogOpen: true,
      userToDelete: user,
    });
  },

  closeDeleteDialog: () => {
    set({
      deleteDialogOpen: false,
      userToDelete: null,
    });
  },

  openEmailPreviewDialog: (payload = {}) => {
    set({
      emailPreviewDialog: {
        ...previewEmptyState,
        open: true,
        ...payload,
      },
    });
  },

  updateEmailPreviewDialog: (payload = {}) => {
    set((state) => ({
      emailPreviewDialog: {
        ...state.emailPreviewDialog,
        ...payload,
        open: true,
      },
    }));
  },

  closeEmailPreviewDialog: () => {
    set({
      emailPreviewDialog: previewEmptyState,
    });
  },
}));