import {
  ArrowDownAZ,
  ArrowDownZA,
  Building2,
  KeyRound,
  MoreHorizontal,
  Pencil,
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

export function UsersTable({ users = [] }) {
  const sortBy = useUsersStore((state) => state.sortBy);
  const sortOrder = useUsersStore((state) => state.sortOrder);
  const setSorting = useUsersStore((state) => state.setSorting);

  const openEditDialog = useUsersStore((state) => state.openEditDialog);
  const openStatusDialog = useUsersStore((state) => state.openStatusDialog);
  const openRolesDialog = useUsersStore((state) => state.openRolesDialog);
  const openDeleteDialog = useUsersStore((state) => state.openDeleteDialog);

  const { can } = usePermissions();

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
      <EmptyState
        title="No users found"
        description="Create your first user or adjust the current filters."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] text-left text-sm">
          <thead className="border-b bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-medium">
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

              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Roles</th>
              <th className="w-16 px-4 py-3 text-right font-medium">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user._id} className="transition-colors hover:bg-muted/40">
                <td className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border bg-muted text-xs font-semibold uppercase">
                      {(user.name || user.email || "U").slice(0, 2)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{user.name}</p>

                        {user.isSuperAdmin ? (
                          <span className="inline-flex items-center gap-1 rounded-md border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                            <ShieldCheck className="size-3" />
                            Super Admin
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-1 text-xs text-muted-foreground">
                        ID: {user._id}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <p className="font-medium">{user.email}</p>
                </td>

                <td className="px-4 py-3">
                  <StatusBadge status={user.status} />
                </td>

                <td className="px-4 py-3 text-muted-foreground">
                  {formatDateTime(user.createdAt)}
                </td>

                <td className="px-4 py-3">
                  {user.department ? (
                    <div className="flex items-start gap-2">
                      <Building2 className="mt-0.5 size-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{user.department.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {user.department.code}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Not assigned</span>
                  )}
                </td>

                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {user.roles?.length ? (
                      user.roles.slice(0, 2).map((role) => (
                        <span
                          key={role._id || role}
                          className="inline-flex items-center gap-1 rounded-md border bg-muted px-2 py-1 text-xs"
                        >
                          <KeyRound className="size-3 text-muted-foreground" />
                          {role.name || role}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-foreground">No roles</span>
                    )}

                    {user.roles?.length > 2 ? (
                      <span className="inline-flex items-center rounded-md border bg-muted px-2 py-1 text-xs text-muted-foreground">
                        +{user.roles.length - 2}
                      </span>
                    ) : null}
                  </div>
                </td>

                <td className="px-4 py-3 text-right">
                  {canUpdate || canDelete || canChangeStatus || canAssignRole ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Open actions</span>
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        {canUpdate ? (
                          <DropdownMenuItem onSelect={() => openEditDialog(user)}>
                            <Pencil className="size-4" />
                            Edit
                          </DropdownMenuItem>
                        ) : null}

                        {canChangeStatus && !user.isSuperAdmin ? (
                          <DropdownMenuItem
                            onSelect={() => openStatusDialog(user)}
                          >
                            <UserRoundCog className="size-4" />
                            Change Status
                          </DropdownMenuItem>
                        ) : null}

                        {canAssignRole && !user.isSuperAdmin ? (
                          <DropdownMenuItem onSelect={() => openRolesDialog(user)}>
                            <KeyRound className="size-4" />
                            Manage Roles
                          </DropdownMenuItem>
                        ) : null}

                        {canDelete && !user.isSuperAdmin ? (
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => openDeleteDialog(user)}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}