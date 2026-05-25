import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownAZ,
  ArrowDownZA,
  Building2,
  KeyRound,
  MailPlus,
  MoreHorizontal,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserRoundCog,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { StatusBadge } from "@/components/common/status-badge";
import { formatDateTime } from "@/lib/utils/format-date";
import { useUsersStore } from "@/features/users/store/users.store";
import { usePermissions } from "@/hooks/use-permissions";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useSendUserPasswordResetMutation } from "@/features/users/hooks/use-users";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const columns = [
  {
    key: "name",
    label: "User",
    sortable: true,
  },
  {
    key: "email",
    label: "Email",
    sortable: true,
  },
  {
    key: "department",
    label: "Department",
    sortable: false,
  },
  {
    key: "roles",
    label: "Role",
    sortable: false,
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
  },
  {
    key: "createdAt",
    label: "Created",
    sortable: true,
  },
];

const getDepartmentLabel = (user) => {
  if (!user?.department) {
    return "No department";
  }

  return user.department.name || user.department.code || "Department";
};

const getRoleLabel = (user) => {
  if (user?.isSuperAdmin) {
    return "Super Admin";
  }

  if (!Array.isArray(user?.roles) || !user.roles.length) {
    return "No role";
  }

  if (user.roles.length === 1) {
    return user.roles[0]?.name || "Role";
  }

  return `${user.roles.length} roles`;
};

const getRoleSubLabel = (user) => {
  if (user?.isSuperAdmin) {
    return "Full access";
  }

  if (!Array.isArray(user?.roles) || !user.roles.length) {
    return "";
  }

  if (user.roles.length === 1) {
    return user.roles[0]?.code || "";
  }

  return user.roles
    .map((role) => role?.code || role?.name)
    .filter(Boolean)
    .slice(0, 2)
    .join(", ");
};

const isSameUser = (currentUser, rowUser) => {
  return Boolean(
    currentUser?._id && rowUser?._id && currentUser._id === rowUser._id
  );
};

const getRemainingMinutesText = (expiresAt, now) => {
  if (!expiresAt || !now) {
    return "";
  }

  const remainingMs = new Date(expiresAt).getTime() - now;

  if (remainingMs <= 0) {
    return "";
  }

  const minutes = Math.ceil(remainingMs / 60000);

  if (minutes <= 1) {
    return "Available soon";
  }

  return `${minutes} min left`;
};

export function UsersTable({ users = [] }) {
  const [cooldownNow, setCooldownNow] = useState(0);

  const sortBy = useUsersStore((state) => state.sortBy);
  const sortOrder = useUsersStore((state) => state.sortOrder);
  const setSorting = useUsersStore((state) => state.setSorting);

  const openCreateDialog = useUsersStore((state) => state.openCreateDialog);
  const openEditDialog = useUsersStore((state) => state.openEditDialog);
  const openStatusDialog = useUsersStore((state) => state.openStatusDialog);
  const openRolesDialog = useUsersStore((state) => state.openRolesDialog);
  const openDeleteDialog = useUsersStore((state) => state.openDeleteDialog);

  const resetEmailRequestPending = useUsersStore(
    (state) => state.resetEmailRequestPending
  );
  const resetEmailRequestUserId = useUsersStore(
    (state) => state.resetEmailRequestUserId
  );

  const resetEmailCooldownUserId = useUsersStore(
    (state) => state.resetEmailCooldownUserId
  );
  const resetEmailCooldownExpiresAt = useUsersStore(
    (state) => state.resetEmailCooldownExpiresAt
  );
  const clearResetEmailCooldown = useUsersStore(
    (state) => state.clearResetEmailCooldown
  );

  const currentUser = useAuthStore((state) => state.user);
  const resetPasswordMutation = useSendUserPasswordResetMutation();

  const { can } = usePermissions();

  const canCreate = can(PERMISSIONS.USER.CREATE);
  const canUpdate = can(PERMISSIONS.USER.UPDATE);
  const canDelete = can(PERMISSIONS.USER.DELETE);
  const canChangeStatus = can(PERMISSIONS.USER.CHANGE_STATUS);
  const canAssignRole = can(PERMISSIONS.USER.ASSIGN_ROLE);

  const resetEmailCooldownActive = useMemo(() => {
    if (!resetEmailCooldownExpiresAt || !cooldownNow) {
      return false;
    }

    return new Date(resetEmailCooldownExpiresAt).getTime() > cooldownNow;
  }, [cooldownNow, resetEmailCooldownExpiresAt]);

  const resetEmailCooldownText = useMemo(
    () => getRemainingMinutesText(resetEmailCooldownExpiresAt, cooldownNow),
    [cooldownNow, resetEmailCooldownExpiresAt]
  );

  useEffect(() => {
    if (!resetEmailCooldownExpiresAt) {
      return undefined;
    }

    const firstTickId = window.setTimeout(() => {
      setCooldownNow(Date.now());
    }, 0);

    const intervalId = window.setInterval(() => {
      setCooldownNow(Date.now());
    }, 1000);

    return () => {
      window.clearTimeout(firstTickId);
      window.clearInterval(intervalId);
    };
  }, [resetEmailCooldownExpiresAt]);

  useEffect(() => {
    if (
      !cooldownNow ||
      !resetEmailCooldownExpiresAt ||
      new Date(resetEmailCooldownExpiresAt).getTime() > cooldownNow
    ) {
      return undefined;
    }

    const cleanupId = window.setTimeout(() => {
      clearResetEmailCooldown();
      setCooldownNow(0);
    }, 0);

    return () => window.clearTimeout(cleanupId);
  }, [clearResetEmailCooldown, cooldownNow, resetEmailCooldownExpiresAt]);

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSorting({
        sortBy: columnKey,
        sortOrder: sortOrder === "asc" ? "desc" : "asc",
      });

      return;
    }

    setSorting({
      sortBy: columnKey,
      sortOrder: "asc",
    });
  };

  const handleSendResetEmail = (user) => {
    if (
      !user?._id ||
      resetPasswordMutation.isPending ||
      resetEmailRequestPending ||
      resetEmailCooldownActive
    ) {
      return;
    }

    resetPasswordMutation.mutate(user);
  };

  if (!users.length) {
    return (
      <div className="feature-table-empty">
        <EmptyState
          title="No users found"
          description="Create your first user or adjust the current filters."
          action={
            canCreate ? (
              <Button type="button" onClick={openCreateDialog}>
                <Plus className="size-4" />
                Create user
              </Button>
            ) : null
          }
        />
      </div>
    );
  }

  return (
    <div className="feature-table-wrap scrollbar-soft">
      <table className="feature-table min-w-[1180px]">
        <thead className="feature-table-head">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="feature-th">
                {column.sortable ? (
                  <button
                    type="button"
                    className="table-sort-button"
                    onClick={() => handleSort(column.key)}
                  >
                    <span>{column.label}</span>

                    {sortBy === column.key ? (
                      sortOrder === "asc" ? (
                        <ArrowDownAZ className="size-3.5" />
                      ) : (
                        <ArrowDownZA className="size-3.5" />
                      )
                    ) : null}
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}

            <th className="feature-th table-action-cell">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => {
            const isCurrentUser = isSameUser(currentUser, user);
            const isSystemSuperAdmin = Boolean(user.isSuperAdmin);

            const canEditThisUser = canUpdate && !isSystemSuperAdmin;
            const canDeleteThisUser =
              canDelete && !isCurrentUser && !isSystemSuperAdmin;
            const canChangeThisUserStatus =
              canChangeStatus && !isCurrentUser && !isSystemSuperAdmin;
            const canAssignThisUserRoles =
              canAssignRole && !isSystemSuperAdmin;
            const canSendResetEmail = canUpdate;

            const isThisResetEmailPending =
              resetEmailRequestPending && resetEmailRequestUserId === user._id;

            const isThisResetEmailCooldown =
              resetEmailCooldownActive &&
              resetEmailCooldownUserId === user._id;

            const resetEmailDisabled =
              resetPasswordMutation.isPending ||
              resetEmailRequestPending ||
              resetEmailCooldownActive;

            return (
              <tr key={user._id}>
                <td className="feature-td">
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="table-primary-text font-medium">
                        {user.name}
                      </p>

                      {user.isSuperAdmin ? (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-md border bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                          <ShieldCheck className="size-3" />
                          Super Admin
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-1 table-secondary-text text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </td>

                <td className="feature-td">
                  <p className="table-secondary-text text-muted-foreground">
                    {user.email}
                  </p>
                </td>

                <td className="feature-td">
                  <div className="flex min-w-0 items-center gap-2">
                    <Building2 className="size-4 shrink-0 text-muted-foreground" />
                    <span className="table-secondary-text text-muted-foreground">
                      {getDepartmentLabel(user)}
                    </span>
                  </div>
                </td>

                <td className="feature-td">
                  <div className="flex min-w-0 items-center gap-2">
                    <KeyRound className="size-4 shrink-0 text-muted-foreground" />

                    <div className="min-w-0">
                      <p className="table-secondary-text font-medium">
                        {getRoleLabel(user)}
                      </p>

                      {getRoleSubLabel(user) ? (
                        <p className="table-meta-text text-xs text-muted-foreground">
                          {getRoleSubLabel(user)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </td>

                <td className="feature-td">
                  <StatusBadge status={user.status} />
                </td>

                <td className="feature-td text-sm text-muted-foreground">
                  {formatDateTime(user.createdAt)}
                </td>

                <td className="feature-td table-action-cell">
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                      >
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Open actions</span>
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-60">
                      {canEditThisUser ? (
                        <DropdownMenuItem
                          onSelect={(event) => {
                            event.preventDefault();
                            openEditDialog(user);
                          }}
                        >
                          <Pencil className="size-4" />
                          Edit user
                        </DropdownMenuItem>
                      ) : null}

                      {canChangeThisUserStatus ? (
                        <DropdownMenuItem
                          onSelect={(event) => {
                            event.preventDefault();
                            openStatusDialog(user);
                          }}
                        >
                          <UserRoundCog className="size-4" />
                          Change status
                        </DropdownMenuItem>
                      ) : null}

                      {canAssignThisUserRoles ? (
                        <DropdownMenuItem
                          onSelect={(event) => {
                            event.preventDefault();
                            openRolesDialog(user);
                          }}
                        >
                          <KeyRound className="size-4" />
                          Manage roles
                        </DropdownMenuItem>
                      ) : null}

                      {canSendResetEmail ? (
                        <DropdownMenuItem
                          disabled={resetEmailDisabled}
                          onSelect={(event) => {
                            event.preventDefault();
                            handleSendResetEmail(user);
                          }}
                        >
                          <MailPlus className="size-4" />
                          {isThisResetEmailPending
                            ? "Sending reset email..."
                            : isThisResetEmailCooldown
                              ? `Reset available in ${resetEmailCooldownText}`
                              : resetEmailCooldownActive
                                ? "Reset email cooldown active"
                                : "Send reset email"}
                        </DropdownMenuItem>
                      ) : null}

                      {canDeleteThisUser ? (
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={(event) => {
                            event.preventDefault();
                            openDeleteDialog(user);
                          }}
                        >
                          <Trash2 className="size-4" />
                          Delete user
                        </DropdownMenuItem>
                      ) : null}

                      {!canEditThisUser &&
                      !canChangeThisUserStatus &&
                      !canAssignThisUserRoles &&
                      !canSendResetEmail &&
                      !canDeleteThisUser ? (
                        <DropdownMenuItem disabled>
                          No actions available
                        </DropdownMenuItem>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}