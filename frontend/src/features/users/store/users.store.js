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

  setCreateDraft: (draft) => {
    set({
      createDraft: {
        name: draft?.name || "",
        email: draft?.email || "",
        password: draft?.password || "",
        department: draft?.department || "none",
        roles: Array.isArray(draft?.roles) ? draft.roles : [],
        status: draft?.status || "active",
      },
    });
  },

  setEditDraft: (draft) => {
    set({
      editDraft: {
        name: draft?.name || "",
        email: draft?.email || "",
        password: draft?.password || "",
        department: draft?.department || "none",
      },
    });
  },

  openCreateDialog: () => {
    set((state) => ({
      formDialogOpen: true,
      selectedUser: null,
      formMode: "create",
      createDraft: state.formMode === "edit" ? buildCreateDraft() : state.createDraft,
    }));
  },

  openEditDialog: (user) => {
    set((state) => {
      const isSameUser =
        state.selectedUser?._id && state.selectedUser._id === user._id;

      return {
        formDialogOpen: true,
        selectedUser: user,
        formMode: "edit",
        editDraft: isSameUser ? state.editDraft : buildEditDraft(user),
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
      selectedUser: null,
      formMode: "create",
      createDraft: userCreateEmptyDraft,
      editDraft: userEditEmptyDraft,
    });
  },

  setStatusDraft: (draft) => {
    set({
      statusDraft: {
        status: draft?.status || "active",
      },
    });
  },

  openStatusDialog: (user) => {
    set((state) => {
      const isSameUser =
        state.userForStatus?._id && state.userForStatus._id === user._id;

      return {
        statusDialogOpen: true,
        userForStatus: user,
        statusDraft: isSameUser ? state.statusDraft : buildStatusDraft(user),
      };
    });
  },

  closeStatusDialog: () => {
    set({
      statusDialogOpen: false,
    });
  },

  resetAndCloseStatusDialog: () => {
    set({
      statusDialogOpen: false,
      userForStatus: null,
      statusDraft: userStatusEmptyDraft,
    });
  },

  setRolesDraft: (draft) => {
    set({
      rolesDraft: {
        roles: Array.isArray(draft?.roles) ? draft.roles : [],
      },
    });
  },

  openRolesDialog: (user) => {
    set((state) => {
      const isSameUser =
        state.userForRoles?._id && state.userForRoles._id === user._id;

      return {
        rolesDialogOpen: true,
        userForRoles: user,
        rolesDraft: isSameUser ? state.rolesDraft : buildRolesDraft(user),
      };
    });
  },

  closeRolesDialog: () => {
    set({
      rolesDialogOpen: false,
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
}));