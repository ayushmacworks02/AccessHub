import { create } from "zustand";

const RESET_LINK_RECOVERY_MINUTES = 15;

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
  expiresAt: null,
  recoverable: false,
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

const getDefaultResetLinkExpiresAt = () => {
  const expiresAt = new Date();

  expiresAt.setMinutes(expiresAt.getMinutes() + RESET_LINK_RECOVERY_MINUTES);

  return expiresAt.toISOString();
};

const isPreviewStillRecoverable = (dialog) => {
  if (!dialog?.recoverable || !dialog?.previewUrl || !dialog?.expiresAt) {
    return false;
  }

  return new Date(dialog.expiresAt).getTime() > Date.now();
};

export const useUsersStore = create((set, get) => ({
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

  resetEmailRequestPending: false,
  resetEmailRequestUserId: "",

  resetEmailCooldownUserId: "",
  resetEmailCooldownExpiresAt: null,

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

  setSort: ({ sortBy, sortOrder }) => {
    set({
      sortBy,
      sortOrder,
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
    set({
      ...initialFilters,
    });
  },

  openCreateDialog: () => {
    set({
      formDialogOpen: true,
      formMode: "create",
      selectedUser: null,
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

  startResetEmailRequest: (userId) => {
    set({
      resetEmailRequestPending: true,
      resetEmailRequestUserId: userId || "",
    });
  },

  finishResetEmailRequest: () => {
    set({
      resetEmailRequestPending: false,
      resetEmailRequestUserId: "",
    });
  },

  activateResetEmailCooldown: ({ userId, expiresAt }) => {
    set({
      resetEmailCooldownUserId: userId || "",
      resetEmailCooldownExpiresAt: expiresAt || getDefaultResetLinkExpiresAt(),
    });
  },

  clearResetEmailCooldown: () => {
    set({
      resetEmailCooldownUserId: "",
      resetEmailCooldownExpiresAt: null,
    });
  },

  openEmailPreviewDialog: (payload = {}) => {
    set({
      emailPreviewDialog: {
        ...previewEmptyState,
        ...payload,
        open: true,
        expiresAt: payload.expiresAt || null,
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

  hideEmailPreviewDialog: () => {
    const currentDialog = get().emailPreviewDialog;

    if (isPreviewStillRecoverable(currentDialog)) {
      set({
        emailPreviewDialog: {
          ...currentDialog,
          open: false,
        },
      });

      return;
    }

    set({
      emailPreviewDialog: previewEmptyState,
    });
  },

  reopenEmailPreviewDialog: () => {
    const currentDialog = get().emailPreviewDialog;

    if (!isPreviewStillRecoverable(currentDialog)) {
      set({
        emailPreviewDialog: previewEmptyState,
      });

      return;
    }

    set({
      emailPreviewDialog: {
        ...currentDialog,
        open: true,
      },
    });
  },

  clearEmailPreviewDialog: () => {
    set({
      emailPreviewDialog: previewEmptyState,
      resetEmailRequestPending: false,
      resetEmailRequestUserId: "",
      resetEmailCooldownUserId: "",
      resetEmailCooldownExpiresAt: null,
    });
  },

  getDefaultResetLinkExpiresAt,
}));