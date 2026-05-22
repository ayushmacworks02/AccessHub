import {
  ArrowDownAZ,
  ArrowDownZA,
  KeyRound,
  MoreHorizontal,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { StatusBadge } from "@/components/common/status-badge";
import { formatDateTime } from "@/lib/utils/format-date";
import { useRolesStore } from "@/features/roles/store/roles.store";
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
    label: "Role",
    sortable: true,
  },
  {
    key: "code",
    label: "Code",
    sortable: true,
  },
  {
    key: "description",
    label: "Description",
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

const getDepartmentLabel = (role) => {
  if (!role?.department) {
    return "Global role";
  }

  return role.department.name || role.department.code || "Department";
};

export function RolesTable({ roles = [] }) {
  const sortBy = useRolesStore((state) => state.sortBy);
  const sortOrder = useRolesStore((state) => state.sortOrder);
  const setSorting = useRolesStore((state) => state.setSorting);

  const openCreateDialog = useRolesStore((state) => state.openCreateDialog);
  const openEditDialog = useRolesStore((state) => state.openEditDialog);
  const openDeleteDialog = useRolesStore((state) => state.openDeleteDialog);
  const openPermissionsDialog = useRolesStore(
    (state) => state.openPermissionsDialog
  );

  const { can } = usePermissions();

  const canCreate = can(PERMISSIONS.ROLE.CREATE);
  const canUpdate = can(PERMISSIONS.ROLE.UPDATE);
  const canDelete = can(PERMISSIONS.ROLE.DELETE);
  const canAssignPermission = can(PERMISSIONS.ROLE.ASSIGN_PERMISSION);

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

  if (!roles.length) {
    return (
      <div className="p-6">
        <EmptyState
          title="No roles found"
          description="Create your first role or adjust the current filters."
          action={
            canCreate ? (
              <Button type="button" onClick={openCreateDialog}>
                <Plus className="size-4" />
                Create role
              </Button>
            ) : null
          }
        />
      </div>
    );
  }

  return (
    <div className="feature-table-wrap">
      <table className="feature-table min-w-[1120px]">
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
          {roles.map((role) => {
            const isSystemRole = Boolean(role.isSystemRole);
            const canShowEdit = canUpdate && !isSystemRole;
            const canShowDelete = canDelete && !isSystemRole;
            const canShowPermissions = canAssignPermission;

            return (
              <tr key={role._id} className="transition-colors hover:bg-muted/30">
                <td className="feature-td">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="table-primary-text font-medium">{role.name}</p>

                    {isSystemRole ? (
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        System
                      </span>
                    ) : null}
                  </div>
                </td>

                <td className="feature-td">
                  <div className="min-w-0">
                    <p className="table-secondary-text text-muted-foreground">
                      {role.code}
                    </p>

                    <p className="mt-1 table-meta-text text-xs text-muted-foreground">
                      {getDepartmentLabel(role)}
                    </p>
                  </div>
                </td>

                <td className="feature-td">
                  {role.description ? (
                    <p className="table-description-text text-xs leading-5 text-muted-foreground">
                      {role.description}
                    </p>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </td>

                <td className="feature-td">
                  <StatusBadge status={role.status} />
                </td>

                <td className="feature-td text-sm text-muted-foreground">
                  {formatDateTime(role.createdAt)}
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
                            openEditDialog(role);
                          }}
                        >
                          <Pencil className="size-4" />
                          Edit role
                        </DropdownMenuItem>
                      ) : null}

                      {canShowPermissions ? (
                        <DropdownMenuItem
                          onSelect={(event) => {
                            event.preventDefault();
                            openPermissionsDialog(role);
                          }}
                        >
                          <KeyRound className="size-4" />
                          Manage permissions
                        </DropdownMenuItem>
                      ) : null}

                      {canShowDelete ? (
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={(event) => {
                            event.preventDefault();
                            openDeleteDialog(role);
                          }}
                        >
                          <Trash2 className="size-4" />
                          Delete role
                        </DropdownMenuItem>
                      ) : null}

                      {!canShowEdit && !canShowPermissions && !canShowDelete ? (
                        <DropdownMenuItem disabled>
                          <ShieldCheck className="size-4" />
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