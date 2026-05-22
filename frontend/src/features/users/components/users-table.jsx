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

export function UsersTable({ users = [] }) {
  const sortBy = useUsersStore((state) => state.sortBy);
  const sortOrder = useUsersStore((state) => state.sortOrder);
  const setSorting = useUsersStore((state) => state.setSorting);

  const openCreateDialog = useUsersStore((state) => state.openCreateDialog);
  const openEditDialog = useUsersStore((state) => state.openEditDialog);
  const openStatusDialog = useUsersStore((state) => state.openStatusDialog);
  const openRolesDialog = useUsersStore((state) => state.openRolesDialog);
  const openDeleteDialog = useUsersStore((state) => state.openDeleteDialog);

  const currentUser = useAuthStore((state) => state.user);
  const resetPasswordMutation = useSendUserPasswordResetMutation();

  const { can } = usePermissions();

  const canCreate = can(PERMISSIONS.USER.CREATE);
  const canUpdate = can(PERMISSIONS.USER.UPDATE);
  const canDelete = can(PERMISSIONS.USER.DELETE);
  const canChangeStatus = can(PERMISSIONS.USER.CHANGE_STATUS);
  const canAssignRole = can(PERMISSIONS.USER.ASSIGN_ROLE);

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

  if (!users.length) {
    return (
      <div className="p-6">
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
    <div className="feature-table-wrap">
      <table className="feature-table">
        <thead className="feature-table-head">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="feature-th">
                {column.sortable ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
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

            <th className="feature-th w-16 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {users.map((user) => {
            const isSelf = currentUser?._id === user._id;
            const isProtectedSuperAdmin = Boolean(user.isSuperAdmin);

            const canShowEdit = canUpdate && !isProtectedSuperAdmin;
            const canShowStatus =
              canChangeStatus && !isProtectedSuperAdmin && !isSelf;
            const canShowRoles = canAssignRole && !isProtectedSuperAdmin;
            const canShowDelete = canDelete && !isProtectedSuperAdmin && !isSelf;
            const canShowResetPassword = canUpdate;

            return (
              <tr key={user._id} className="transition-colors hover:bg-muted/30">
                <td className="feature-td">
                  <div className="min-w-0">
                    <p className="table-primary-text font-medium">{user.name}</p>

                    <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                      <Building2 className="size-3.5 shrink-0" />
                      <span className="table-secondary-text">
                        {getDepartmentLabel(user)}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="feature-td">
                  <div className="min-w-0">
                    <p className="table-secondary-text text-muted-foreground">
                      {user.email}
                    </p>

                    <p className="mt-1 table-meta-text text-xs text-muted-foreground">
                      {getRoleLabel(user)}
                    </p>
                  </div>
                </td>

                <td className="feature-td">
                  <StatusBadge status={user.status} />
                </td>

                <td className="feature-td text-sm text-muted-foreground">
                  {formatDateTime(user.createdAt)}
                </td>

                <td className="feature-td text-right">
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Open actions</span>
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-56">
                      {canShowEdit ? (
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

                      {canShowStatus ? (
                        <DropdownMenuItem
                          onSelect={(event) => {
                            event.preventDefault();
                            openStatusDialog(user);
                          }}
                        >
                          <ShieldCheck className="size-4" />
                          Change status
                        </DropdownMenuItem>
                      ) : null}

                      {canShowRoles ? (
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

                      {canShowResetPassword ? (
                        <DropdownMenuItem
                          disabled={resetPasswordMutation.isPending}
                          onSelect={(event) => {
                            event.preventDefault();
                            resetPasswordMutation.mutate(user);
                          }}
                        >
                          <MailPlus className="size-4" />
                          Send reset email
                        </DropdownMenuItem>
                      ) : null}

                      {canShowDelete ? (
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

                      {!canShowEdit &&
                      !canShowStatus &&
                      !canShowRoles &&
                      !canShowResetPassword &&
                      !canShowDelete ? (
                        <DropdownMenuItem disabled>
                          <UserRoundCog className="size-4" />
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