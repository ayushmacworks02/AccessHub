import { create } from "zustand";

const initialFilters = {
  search: "",
  status: "all",
  page: 1,
  limit: 10,
};

const initialFormDraft = {
  name: "",
  code: "",
  description: "",
  status: "active",
};

const initialUsersDraft = {
  users: [],
};

const initialRolesDraft = {
  roles: [],
};

export const useGroupsStore = create((set) => ({
  filters: initialFilters,

  formDialogOpen: false,
  formMode: "create",
  selectedGroup: null,
  createDraft: initialFormDraft,
  editDraft: initialFormDraft,

  usersDialogOpen: false,
  groupForUsers: null,
  usersDraft: initialUsersDraft,

  rolesDialogOpen: false,
  groupForRoles: null,
  rolesDraft: initialRolesDraft,

  deleteDialogOpen: false,
  groupForDelete: null,

  setFilters: (updates) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...updates,
      },
    })),

  resetFilters: () =>
    set({
      filters: initialFilters,
    }),

  openCreateDialog: () =>
    set({
      formDialogOpen: true,
      formMode: "create",
      selectedGroup: null,
    }),

  openEditDialog: (group) =>
    set({
      formDialogOpen: true,
      formMode: "edit",
      selectedGroup: group,
      editDraft: {
        name: group?.name || "",
        code: group?.code || "",
        description: group?.description || "",
        status: group?.status || "active",
      },
    }),

  closeFormDialog: () =>
    set({
      formDialogOpen: false,
      selectedGroup: null,
    }),

  setCreateDraft: (draft) =>
    set({
      createDraft: {
        ...initialFormDraft,
        ...draft,
      },
    }),

  setEditDraft: (draft) =>
    set({
      editDraft: {
        ...initialFormDraft,
        ...draft,
      },
    }),

  clearCreateDraft: () =>
    set({
      createDraft: initialFormDraft,
    }),

  clearEditDraft: () =>
    set({
      editDraft: initialFormDraft,
    }),

  openUsersDialog: (group) =>
    set({
      usersDialogOpen: true,
      groupForUsers: group,
      usersDraft: {
        users: Array.isArray(group?.users)
          ? group.users.map((user) => user._id)
          : [],
      },
    }),

  closeUsersDialog: () =>
    set({
      usersDialogOpen: false,
      groupForUsers: null,
    }),

  setUsersDraft: (draft) =>
    set({
      usersDraft: {
        ...initialUsersDraft,
        ...draft,
      },
    }),

  openRolesDialog: (group) =>
    set({
      rolesDialogOpen: true,
      groupForRoles: group,
      rolesDraft: {
        roles: Array.isArray(group?.roles)
          ? group.roles.map((role) => role._id)
          : [],
      },
    }),

  closeRolesDialog: () =>
    set({
      rolesDialogOpen: false,
      groupForRoles: null,
    }),

  setRolesDraft: (draft) =>
    set({
      rolesDraft: {
        ...initialRolesDraft,
        ...draft,
      },
    }),

  openDeleteDialog: (group) =>
    set({
      deleteDialogOpen: true,
      groupForDelete: group,
    }),

  closeDeleteDialog: () =>
    set({
      deleteDialogOpen: false,
      groupForDelete: null,
    }),
}));