import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { usersApi } from "@/features/users/api/users.api";
import { useUsersStore } from "@/features/users/store/users.store";
import { getApiErrorMessage } from "@/lib/api/api-response";
import { queryClient } from "@/lib/query/query-client";
import { useDebounce } from "@/hooks/use-debounce";

export const USERS_QUERY_KEYS = {
  all: ["users"],
  list: (params) => ["users", "list", params],
  detail: (userId) => ["users", "detail", userId],
};

export function useUsersQuery() {
  const search = useUsersStore((state) => state.search);
  const status = useUsersStore((state) => state.status);
  const department = useUsersStore((state) => state.department);
  const page = useUsersStore((state) => state.page);
  const limit = useUsersStore((state) => state.limit);
  const sortBy = useUsersStore((state) => state.sortBy);
  const sortOrder = useUsersStore((state) => state.sortOrder);

  const debouncedSearch = useDebounce(search, 400);

  const params = {
    search: debouncedSearch,
    status,
    department,
    page,
    limit,
    sortBy,
    sortOrder,
  };

  return useQuery({
    queryKey: USERS_QUERY_KEYS.list(params),
    queryFn: () => usersApi.getUsers(params),
    select: (data) => ({
      users: data?.users || [],
      pagination: data?.pagination || {
        total: 0,
        page: 1,
        limit,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    }),
  });
}

export function useUserDetailQuery(userId, options = {}) {
  return useQuery({
    queryKey: USERS_QUERY_KEYS.detail(userId),
    queryFn: () => usersApi.getUserById(userId),
    enabled: Boolean(userId) && options.enabled !== false,
    select: (data) => data?.user || null,
  });
}

export function useCreateUserMutation() {
  const resetAndCloseFormDialog = useUsersStore(
    (state) => state.resetAndCloseFormDialog
  );

  return useMutation({
    mutationFn: usersApi.createUser,
    onSuccess: () => {
      toast.success("User created successfully");
      resetAndCloseFormDialog();

      queryClient.invalidateQueries({
        queryKey: USERS_QUERY_KEYS.all,
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to create user"));
    },
  });
}

export function useUpdateUserMutation() {
  const resetAndCloseFormDialog = useUsersStore(
    (state) => state.resetAndCloseFormDialog
  );

  return useMutation({
    mutationFn: usersApi.updateUser,
    onSuccess: () => {
      toast.success("User updated successfully");
      resetAndCloseFormDialog();

      queryClient.invalidateQueries({
        queryKey: USERS_QUERY_KEYS.all,
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to update user"));
    },
  });
}

export function useUpdateUserStatusMutation() {
  const resetAndCloseStatusDialog = useUsersStore(
    (state) => state.resetAndCloseStatusDialog
  );

  return useMutation({
    mutationFn: usersApi.updateUserStatus,
    onSuccess: () => {
      toast.success("User status updated successfully");
      resetAndCloseStatusDialog();

      queryClient.invalidateQueries({
        queryKey: USERS_QUERY_KEYS.all,
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to update user status"));
    },
  });
}

export function useAssignUserRolesMutation() {
  const resetAndCloseRolesDialog = useUsersStore(
    (state) => state.resetAndCloseRolesDialog
  );

  return useMutation({
    mutationFn: usersApi.assignUserRoles,
    onSuccess: () => {
      toast.success("User roles updated successfully");
      resetAndCloseRolesDialog();

      queryClient.invalidateQueries({
        queryKey: USERS_QUERY_KEYS.all,
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to update user roles"));
    },
  });
}

export function useDeleteUserMutation() {
  const closeDeleteDialog = useUsersStore((state) => state.closeDeleteDialog);

  return useMutation({
    mutationFn: usersApi.deleteUser,
    onSuccess: () => {
      toast.success("User deleted successfully");
      closeDeleteDialog();

      queryClient.invalidateQueries({
        queryKey: USERS_QUERY_KEYS.all,
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to delete user"));
    },
  });
}