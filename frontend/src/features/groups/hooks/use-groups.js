import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { groupsApi } from "@/features/groups/api/groups.api";
import { useGroupsStore } from "@/features/groups/store/groups.store";
import { queryClient } from "@/lib/query/query-client";
import { getApiErrorMessage } from "@/lib/api/api-response";

export const GROUPS_QUERY_KEYS = {
  all: ["groups"],
  list: (params) => ["groups", "list", params],
  detail: (groupId) => ["groups", "detail", groupId],
};

const invalidateGroups = () => {
  queryClient.invalidateQueries({
    queryKey: GROUPS_QUERY_KEYS.all,
  });

  queryClient.invalidateQueries({
    queryKey: ["dashboard", "groups-count"],
  });
};

export function useGroupsQuery(params = {}) {
  return useQuery({
    queryKey: GROUPS_QUERY_KEYS.list(params),
    queryFn: () => groupsApi.getGroups(params),
    keepPreviousData: true,
  });
}

export function useGroupByIdQuery(groupId, enabled = true) {
  return useQuery({
    queryKey: GROUPS_QUERY_KEYS.detail(groupId),
    queryFn: () => groupsApi.getGroupById(groupId),
    enabled: Boolean(groupId) && enabled,
    select: (data) => data?.group || null,
  });
}

export function useCreateGroupMutation() {
  const closeFormDialog = useGroupsStore((state) => state.closeFormDialog);
  const clearCreateDraft = useGroupsStore((state) => state.clearCreateDraft);

  return useMutation({
    mutationFn: groupsApi.createGroup,
    onSuccess: () => {
      clearCreateDraft();
      closeFormDialog();
      invalidateGroups();

      toast.success("Group created successfully", {
        id: "create-group-success",
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to create group"), {
        id: "create-group-error",
      });
    },
  });
}

export function useUpdateGroupMutation() {
  const closeFormDialog = useGroupsStore((state) => state.closeFormDialog);
  const clearEditDraft = useGroupsStore((state) => state.clearEditDraft);

  return useMutation({
    mutationFn: groupsApi.updateGroup,
    onSuccess: () => {
      clearEditDraft();
      closeFormDialog();
      invalidateGroups();

      toast.success("Group updated successfully", {
        id: "update-group-success",
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to update group"), {
        id: "update-group-error",
      });
    },
  });
}

export function useAssignGroupUsersMutation() {
  const closeUsersDialog = useGroupsStore((state) => state.closeUsersDialog);

  return useMutation({
    mutationFn: groupsApi.assignGroupUsers,
    onSuccess: () => {
      closeUsersDialog();
      invalidateGroups();

      toast.success("Group users updated successfully", {
        id: "assign-group-users-success",
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to update group users"), {
        id: "assign-group-users-error",
      });
    },
  });
}

export function useAssignGroupRolesMutation() {
  const closeRolesDialog = useGroupsStore((state) => state.closeRolesDialog);

  return useMutation({
    mutationFn: groupsApi.assignGroupRoles,
    onSuccess: () => {
      closeRolesDialog();
      invalidateGroups();

      toast.success("Group roles updated successfully", {
        id: "assign-group-roles-success",
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to update group roles"), {
        id: "assign-group-roles-error",
      });
    },
  });
}

export function useDeleteGroupMutation() {
  const closeDeleteDialog = useGroupsStore((state) => state.closeDeleteDialog);

  return useMutation({
    mutationFn: groupsApi.deleteGroup,
    onSuccess: () => {
      closeDeleteDialog();
      invalidateGroups();

      toast.success("Group deleted successfully", {
        id: "delete-group-success",
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to delete group"), {
        id: "delete-group-error",
      });
    },
  });
}