import {
  ArrowDownAZ,
  ArrowDownZA,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { StatusBadge } from "@/components/common/status-badge";
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
    label: "Department",
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
    key: "updatedAt",
    label: "Last updated",
    sortable: true,
  },
];

export function DepartmentsTable({ departments = [] }) {
  const sortBy = useDepartmentsStore((state) => state.sortBy);
  const sortOrder = useDepartmentsStore((state) => state.sortOrder);
  const setSorting = useDepartmentsStore((state) => state.setSorting);

  const openCreateDialog = useDepartmentsStore((state) => state.openCreateDialog);
  const openEditDialog = useDepartmentsStore((state) => state.openEditDialog);
  const openDeleteDialog = useDepartmentsStore(
    (state) => state.openDeleteDialog
  );

  const { can } = usePermissions();

  const canCreate = can(PERMISSIONS.DEPARTMENT.CREATE);
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
      <div className="p-6">
        <EmptyState
          title="No departments found"
          description="Create your first department or adjust the current filters."
          action={
            canCreate ? (
              <Button type="button" onClick={openCreateDialog}>
                <Plus className="size-4" />
                Create department
              </Button>
            ) : null
          }
        />
      </div>
    );
  }

  return (
    <div className="feature-table-wrap">
      <table className="feature-table min-w-[1080px]">
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
          {departments.map((department) => (
            <tr
              key={department._id}
              className="transition-colors hover:bg-muted/30"
            >
              <td className="feature-td">
                <p className="table-primary-text font-medium">
                  {department.name}
                </p>
              </td>

              <td className="feature-td">
                <p className="table-secondary-text text-muted-foreground">
                  {department.code}
                </p>
              </td>

              <td className="feature-td">
                {department.description ? (
                  <p className="table-description-text text-xs leading-5 text-muted-foreground">
                    {department.description}
                  </p>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </td>

              <td className="feature-td">
                <StatusBadge status={department.status} />
              </td>

              <td className="feature-td text-sm text-muted-foreground">
                {formatDateTime(department.updatedAt || department.createdAt)}
              </td>

              <td className="feature-td text-right">
                {canUpdate || canDelete ? (
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Open actions</span>
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-48">
                      {canUpdate ? (
                        <DropdownMenuItem
                          onSelect={(event) => {
                            event.preventDefault();
                            openEditDialog(department);
                          }}
                        >
                          <Pencil className="size-4" />
                          Edit department
                        </DropdownMenuItem>
                      ) : null}

                      {canDelete ? (
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={(event) => {
                            event.preventDefault();
                            openDeleteDialog(department);
                          }}
                        >
                          <Trash2 className="size-4" />
                          Delete department
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
  );
}