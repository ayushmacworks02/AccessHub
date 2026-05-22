import {
  ArrowDownAZ,
  ArrowDownZA,
  KeyRound,
  MoreHorizontal,
  Pencil,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
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

export function RolesTable({ roles = [] }) {
  const sortBy = useRolesStore((state) => state.sortBy);
  const sortOrder = useRolesStore((state) => state.sortOrder);
  const setSorting = useRolesStore((state) => state.setSorting);
  const openEditDialog = useRolesStore((state) => state.openEditDialog);
  const openDeleteDialog = useRolesStore((state) => state.openDeleteDialog);
  const openPermissionsDialog = useRolesStore(
    (state) => state.openPermissionsDialog
  );

  const { can } = usePermissions();

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
      <EmptyState
        title="No roles found"
        description="Create your first role or adjust the current filters."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
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
              <th className="px-4 py-3 font-medium">Permissions</th>
              <th className="w-16 px-4 py-3 text-right font-medium">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {roles.map((role) => (
              <tr key={role._id} className="transition-colors hover:bg-muted/40">
                <td className="px-4 py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{role.name}</p>

                      {role.isSystemRole ? (
                        <span className="inline-flex items-center gap-1 rounded-md border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                          <ShieldCheck className="size-3" />
                          System
                        </span>
                      ) : null}
                    </div>

                    {role.description ? (
                      <p className="mt-1 line-clamp-1 max-w-md text-xs text-muted-foreground">
                        {role.description}
                      </p>
                    ) : null}
                  </div>
                </td>

                <td className="px-4 py-3">
                  <span className="rounded-md border bg-muted px-2 py-1 font-mono text-xs">
                    {role.code}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <StatusBadge status={role.status} />
                </td>

                <td className="px-4 py-3 text-muted-foreground">
                  {formatDateTime(role.createdAt)}
                </td>

                <td className="px-4 py-3">
                  {role.department ? (
                    <div>
                      <p className="font-medium">{role.department.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {role.department.code}
                      </p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Global</span>
                  )}
                </td>

                <td className="px-4 py-3">
                  <div className="inline-flex items-center gap-1.5 rounded-md border bg-muted px-2 py-1 text-xs">
                    <KeyRound className="size-3.5 text-muted-foreground" />
                    <span>{role.permissions?.length || 0}</span>
                  </div>
                </td>

                <td className="px-4 py-3 text-right">
                  {canUpdate || canDelete || canAssignPermission ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Open actions</span>
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        {canUpdate ? (
                          <DropdownMenuItem onSelect={() => openEditDialog(role)}>
                            <Pencil className="size-4" />
                            Edit
                          </DropdownMenuItem>
                        ) : null}

                        {canAssignPermission ? (
                          <DropdownMenuItem
                            onSelect={() => openPermissionsDialog(role)}
                          >
                            <KeyRound className="size-4" />
                            Manage Permissions
                          </DropdownMenuItem>
                        ) : null}

                        {canDelete && !role.isSystemRole ? (
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => openDeleteDialog(role)}
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