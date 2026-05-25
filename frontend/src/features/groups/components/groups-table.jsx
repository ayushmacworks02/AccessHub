import {
  ArrowDownAZ,
  ArrowDownZA,
  Edit,
  KeyRound,
  MoreHorizontal,
  Plus,
  Trash2,
  UserPlus,
} from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { StatusBadge } from "@/components/common/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useGroupsStore } from "@/features/groups/store/groups.store";
import { formatDateTime } from "@/lib/utils/format-date";

const columns = [
  {
    key: "name",
    label: "Group",
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
    key: "users",
    label: "Users",
    sortable: false,
  },
  {
    key: "roles",
    label: "Roles",
    sortable: false,
  },
  {
    key: "createdAt",
    label: "Created",
    sortable: true,
  },
];

const getCount = (items) => {
  return Array.isArray(items) ? items.length : 0;
};

export function GroupsTable({
  groups = [],
  canCreate = false,
  canUpdate = false,
  canDelete = false,
  canManageUsers = false,
  canManageRoles = false,
}) {
  const filters = useGroupsStore((state) => state.filters);
  const setFilters = useGroupsStore((state) => state.setFilters);

  const openCreateDialog = useGroupsStore((state) => state.openCreateDialog);
  const openEditDialog = useGroupsStore((state) => state.openEditDialog);
  const openUsersDialog = useGroupsStore((state) => state.openUsersDialog);
  const openRolesDialog = useGroupsStore((state) => state.openRolesDialog);
  const openDeleteDialog = useGroupsStore((state) => state.openDeleteDialog);

  const sortBy = filters.sortBy || "createdAt";
  const sortOrder = filters.sortOrder || "desc";

  const hasAnyRowAction =
    canUpdate || canManageUsers || canManageRoles || canDelete;

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setFilters({
        sortBy: columnKey,
        sortOrder: sortOrder === "asc" ? "desc" : "asc",
        page: 1,
      });

      return;
    }

    setFilters({
      sortBy: columnKey,
      sortOrder: "asc",
      page: 1,
    });
  };

  if (!groups.length) {
    return (
      <div className="feature-table-empty">
        <EmptyState
          title="No groups found"
          description="Create your first group or adjust the current filters."
          action={
            canCreate ? (
              <Button type="button" onClick={openCreateDialog}>
                <Plus className="size-4" />
                Create group
              </Button>
            ) : null
          }
        />
      </div>
    );
  }

  return (
    <div className="feature-table-wrap scrollbar-soft">
      <table className="feature-table min-w-[1200px]">
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

            {hasAnyRowAction ? (
              <th className="feature-th table-action-cell">Actions</th>
            ) : null}
          </tr>
        </thead>

        <tbody>
          {groups.map((group) => (
            <tr key={group._id}>
              <td className="feature-td">
                <p className="table-primary-text font-medium">{group.name}</p>
              </td>

              <td className="feature-td">
                <p className="table-secondary-text text-muted-foreground">
                  {group.code}
                </p>
              </td>

              <td className="feature-td">
                {group.description ? (
                  <p className="table-description-text text-xs leading-5 text-muted-foreground">
                    {group.description}
                  </p>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </td>

              <td className="feature-td">
                <StatusBadge status={group.status} />
              </td>

              <td className="feature-td">
                <Badge variant="outline" className="rounded-md font-normal">
                  {getCount(group.users)}
                </Badge>
              </td>

              <td className="feature-td">
                <Badge variant="outline" className="rounded-md font-normal">
                  {getCount(group.roles)}
                </Badge>
              </td>

              <td className="feature-td text-sm text-muted-foreground">
                {formatDateTime(group.createdAt)}
              </td>

              {hasAnyRowAction ? (
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

                    <DropdownMenuContent align="end" className="w-48">
                      {canUpdate ? (
                        <DropdownMenuItem
                          onSelect={(event) => {
                            event.preventDefault();
                            openEditDialog(group);
                          }}
                        >
                          <Edit className="size-4" />
                          Edit group
                        </DropdownMenuItem>
                      ) : null}

                      {canManageUsers ? (
                        <DropdownMenuItem
                          onSelect={(event) => {
                            event.preventDefault();
                            openUsersDialog(group);
                          }}
                        >
                          <UserPlus className="size-4" />
                          Manage users
                        </DropdownMenuItem>
                      ) : null}

                      {canManageRoles ? (
                        <DropdownMenuItem
                          onSelect={(event) => {
                            event.preventDefault();
                            openRolesDialog(group);
                          }}
                        >
                          <KeyRound className="size-4" />
                          Manage roles
                        </DropdownMenuItem>
                      ) : null}

                      {canDelete ? (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={(event) => {
                              event.preventDefault();
                              openDeleteDialog(group);
                            }}
                          >
                            <Trash2 className="size-4" />
                            Delete group
                          </DropdownMenuItem>
                        </>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}