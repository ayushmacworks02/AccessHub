import {
  ArrowDownAZ,
  ArrowDownZA,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { formatDateTime } from "@/lib/utils/format-date";
import { useDepartmentsStore } from "@/features/departments/store/departments.store";
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
    label: "Name",
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
    key: "updatedAt",
    label: "Last Updated",
    sortable: true,
  },
];

export function DepartmentsTable({ departments = [] }) {
  const sortBy = useDepartmentsStore((state) => state.sortBy);
  const sortOrder = useDepartmentsStore((state) => state.sortOrder);
  const setSorting = useDepartmentsStore((state) => state.setSorting);
  const openEditDialog = useDepartmentsStore((state) => state.openEditDialog);
  const openDeleteDialog = useDepartmentsStore(
    (state) => state.openDeleteDialog
  );

  const { can } = usePermissions();

  const canUpdate = can(PERMISSIONS.DEPARTMENT.UPDATE);
  const canDelete = can(PERMISSIONS.DEPARTMENT.DELETE);

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

  if (!departments.length) {
    return (
      <EmptyState
        title="No departments found"
        description="Create your first department or adjust the current filters."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
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

              <th className="w-16 px-4 py-3 text-right font-medium">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {departments.map((department) => (
              <tr
                key={department._id}
                className="transition-colors hover:bg-muted/40"
              >
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{department.name}</p>
                    {department.description ? (
                      <p className="mt-1 line-clamp-1 max-w-md text-xs text-muted-foreground">
                        {department.description}
                      </p>
                    ) : null}
                  </div>
                </td>

                <td className="px-4 py-3">
                  <span className="rounded-md border bg-muted px-2 py-1 font-mono text-xs">
                    {department.code}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <StatusBadge status={department.status} />
                </td>

                <td className="px-4 py-3 text-muted-foreground">
                  {formatDateTime(department.updatedAt || department.createdAt)}
                </td>

                <td className="px-4 py-3 text-right">
                  {canUpdate || canDelete ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Open actions</span>
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        {canUpdate ? (
                          <DropdownMenuItem
                            onSelect={() => openEditDialog(department)}
                          >
                            <Pencil className="size-4" />
                            Edit
                          </DropdownMenuItem>
                        ) : null}

                        {canDelete ? (
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => openDeleteDialog(department)}
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