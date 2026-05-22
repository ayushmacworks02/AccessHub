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

const getUserId = (userOrId) => {
  if (typeof userOrId === "string") {
    return userOrId;
  }

  return userOrId?._id || "";
};

const getUserLabel = (userOrId) => {
  if (!userOrId || typeof userOrId === "string") {
    return "selected user";
  }

  return userOrId.name || userOrId.email || "selected user";
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

  const openEmailPreviewDialog = useUsersStore(
    (state) => state.openEmailPreviewDialog
  );

  return useMutation({
    mutationFn: usersApi.createUser,
    onSuccess: (data) => {
      toast.success("User created successfully");

      resetAndCloseFormDialog();

      if (data?.emailPreviewUrl) {
        openEmailPreviewDialog({
          title: "User created email preview",
          description:
            "The credentials email was generated successfully. Open the preview link to verify the email content.",
          previewUrl: data.emailPreviewUrl,
          messageId: data.emailMessageId,
          status: "success",
        });
      }

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

export function useSendUserPasswordResetMutation() {
  const openEmailPreviewDialog = useUsersStore(
    (state) => state.openEmailPreviewDialog
  );

  const updateEmailPreviewDialog = useUsersStore(
    (state) => state.updateEmailPreviewDialog
  );

  return useMutation({
    mutationFn: (userOrId) => usersApi.sendPasswordResetEmail(getUserId(userOrId)),

    onMutate: (userOrId) => {
      openEmailPreviewDialog({
        title: "Sending reset email",
        description: `Generating and sending a password reset email for ${getUserLabel(
          userOrId
        )}.`,
        previewUrl: "",
        messageId: "",
        status: "sending",
      });
    },

    onSuccess: (data) => {
      toast.success("Password reset email sent successfully");

      updateEmailPreviewDialog({
        title: "Password reset email sent",
        description:
          "The password reset email was generated successfully. Open the preview link to verify the email content.",
        previewUrl: data?.emailPreviewUrl || "",
        messageId: data?.emailMessageId || "",
        status: "success",
      });

      queryClient.invalidateQueries({
        queryKey: USERS_QUERY_KEYS.all,
      });
    },

    onError: (error) => {
      const message = getApiErrorMessage(error, "Unable to send reset email");

      toast.error(message);

      updateEmailPreviewDialog({
        title: "Reset email failed",
        description: message,
        previewUrl: "",
        messageId: "",
        status: "error",
      });
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