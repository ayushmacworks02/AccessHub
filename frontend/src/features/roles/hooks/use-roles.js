import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { rolesApi } from "@/features/roles/api/roles.api";
import { useRolesStore } from "@/features/roles/store/roles.store";
import { getApiErrorMessage } from "@/lib/api/api-response";
import { queryClient } from "@/lib/query/query-client";
import { useDebounce } from "@/hooks/use-debounce";

export const ROLES_QUERY_KEYS = {
  all: ["roles"],
  list: (params) => ["roles", "list", params],
  detail: (roleId) => ["roles", "detail", roleId],
};

export function useRolesQuery() {
  const search = useRolesStore((state) => state.search);
  const status = useRolesStore((state) => state.status);
  const department = useRolesStore((state) => state.department);
  const page = useRolesStore((state) => state.page);
  const limit = useRolesStore((state) => state.limit);
  const sortBy = useRolesStore((state) => state.sortBy);
  const sortOrder = useRolesStore((state) => state.sortOrder);

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
    queryKey: ROLES_QUERY_KEYS.list(params),
    queryFn: () => rolesApi.getRoles(params),
    select: (data) => ({
      roles: data?.roles || [],
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

export function useCreateRoleMutation() {
  const resetAndCloseFormDialog = useRolesStore(
    (state) => state.resetAndCloseFormDialog
  );

  return useMutation({
    mutationFn: rolesApi.createRole,
    onSuccess: () => {
      toast.success("Role created successfully");
      resetAndCloseFormDialog();
      queryClient.invalidateQueries({
        queryKey: ROLES_QUERY_KEYS.all,
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to create role"));
    },
  });
}


export function useUpdateRoleMutation() {
  const resetAndCloseFormDialog = useRolesStore(
    (state) => state.resetAndCloseFormDialog
  );

  return useMutation({
    mutationFn: rolesApi.updateRole,
    onSuccess: () => {
      toast.success("Role updated successfully");
      resetAndCloseFormDialog();
      queryClient.invalidateQueries({
        queryKey: ROLES_QUERY_KEYS.all,
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to update role"));
    },
  });
}

export function useDeleteRoleMutation() {
  const closeDeleteDialog = useRolesStore((state) => state.closeDeleteDialog);

  return useMutation({
    mutationFn: rolesApi.deleteRole,
    onSuccess: () => {
      toast.success("Role deleted successfully");
      closeDeleteDialog();
      queryClient.invalidateQueries({
        queryKey: ROLES_QUERY_KEYS.all,
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to delete role"));
    },
  });
}

export function useReplaceRolePermissionsMutation() {
  const resetAndClosePermissionsDialog = useRolesStore(
    (state) => state.resetAndClosePermissionsDialog
  );

  return useMutation({
    mutationFn: rolesApi.replacePermissions,
    onSuccess: () => {
      toast.success("Role permissions updated successfully");
      resetAndClosePermissionsDialog();
      queryClient.invalidateQueries({
        queryKey: ROLES_QUERY_KEYS.all,
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to update permissions"));
    },
  });
}
export function useAppendRolePermissionsMutation() {
  const closePermissionsDialog = useRolesStore(
    (state) => state.closePermissionsDialog
  );

  return useMutation({
    mutationFn: rolesApi.appendPermissions,
    onSuccess: () => {
      toast.success("Role permissions appended successfully");
      closePermissionsDialog();
      queryClient.invalidateQueries({
        queryKey: ROLES_QUERY_KEYS.all,
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to append permissions"));
    },
  });
}

export function useRemoveRolePermissionsMutation() {
  const closePermissionsDialog = useRolesStore(
    (state) => state.closePermissionsDialog
  );

  return useMutation({
    mutationFn: rolesApi.removePermissions,
    onSuccess: () => {
      toast.success("Role permissions removed successfully");
      closePermissionsDialog();
      queryClient.invalidateQueries({
        queryKey: ROLES_QUERY_KEYS.all,
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to remove permissions"));
    },
  });
}