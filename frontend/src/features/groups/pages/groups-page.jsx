import {
  Edit,
  KeyRound,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { useMemo } from "react";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PageHeader } from "@/components/common/page-header";
import { PaginationControls } from "@/components/common/pagination-controls";
import { StatusBadge } from "@/components/common/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { GroupFormDialog } from "@/features/groups/components/group-form-dialog";
import { GroupRolesDialog } from "@/features/groups/components/group-roles-dialog";
import { GroupUsersDialog } from "@/features/groups/components/group-users-dialog";
import {
  useDeleteGroupMutation,
  useGroupsQuery,
} from "@/features/groups/hooks/use-groups";
import { useGroupsStore } from "@/features/groups/store/groups.store";
import { useDebounce } from "@/hooks/use-debounce";
import { usePermissions } from "@/hooks/use-permissions";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { formatDateTime } from "@/lib/utils/format-date";

function GroupsTableSkeleton() {
  return (
    <div className="divide-y">
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          key={`group-table-skeleton-${index}`}
          className="grid min-w-[1120px] grid-cols-[1.2fr_1.5fr_120px_110px_110px_170px_64px] items-center gap-4 px-4 py-3"
        >
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>

          <Skeleton className="h-4 w-72 max-w-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="ml-auto size-8 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

const getCount = (items) => {
  return Array.isArray(items) ? items.length : 0;
};

export function GroupsPage() {
  const { can } = usePermissions();

  const filters = useGroupsStore((state) => state.filters);
  const setFilters = useGroupsStore((state) => state.setFilters);

  const openCreateDialog = useGroupsStore((state) => state.openCreateDialog);
  const openEditDialog = useGroupsStore((state) => state.openEditDialog);
  const openUsersDialog = useGroupsStore((state) => state.openUsersDialog);
  const openRolesDialog = useGroupsStore((state) => state.openRolesDialog);
  const openDeleteDialog = useGroupsStore((state) => state.openDeleteDialog);
  const closeDeleteDialog = useGroupsStore((state) => state.closeDeleteDialog);

  const deleteDialogOpen = useGroupsStore((state) => state.deleteDialogOpen);
  const groupForDelete = useGroupsStore((state) => state.groupForDelete);

  const deleteGroupMutation = useDeleteGroupMutation();

  const canCreate = can(PERMISSIONS.GROUP.CREATE);
  const canUpdate = can(PERMISSIONS.GROUP.UPDATE);
  const canDelete = can(PERMISSIONS.GROUP.DELETE);
  const canManageUsers = can(PERMISSIONS.GROUP.MANAGE_USERS);
  const canManageRoles = can(PERMISSIONS.GROUP.MANAGE_ROLES);

  const debouncedSearch = useDebounce(filters.search, 400);

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch,
      status: filters.status,
      user: "all",
      role: "all",
      page: filters.page,
      limit: filters.limit,
      sortBy: "createdAt",
      sortOrder: "desc",
    }),
    [debouncedSearch, filters.limit, filters.page, filters.status]
  );

  const groupsQuery = useGroupsQuery(queryParams);

  const groups = groupsQuery.data?.groups || [];
  const pagination = groupsQuery.data?.pagination;

  const handleSearchChange = (event) => {
    setFilters({
      search: event.target.value,
      page: 1,
    });
  };

  const handleStatusChange = (value) => {
    setFilters({
      status: value,
      page: 1,
    });
  };

  const handleLimitChange = (nextLimit) => {
    setFilters({
      limit: nextLimit,
      page: 1,
    });
  };

  const handleDeleteConfirm = () => {
    if (!groupForDelete?._id) {
      return;
    }

    deleteGroupMutation.mutate(groupForDelete._id);
  };

  const hasAnyRowAction =
    canUpdate || canManageUsers || canManageRoles || canDelete;

  return (
    <div className="feature-page">
      <PageHeader
        title="Groups"
        description="Manage cross-department access groups."
        actions={
          canCreate ? (
            <Button type="button" onClick={openCreateDialog}>
              <Plus className="size-4" />
              Create group
            </Button>
          ) : null
        }
      />

      <Card className="feature-card">
        <CardHeader className="feature-card-header">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <UsersRound className="size-4 text-muted-foreground" />
                Group directory
              </CardTitle>

              <p className="mt-1 table-description-text text-sm text-muted-foreground">
                Assign users and inherited roles from one place.
              </p>
            </div>

            <div className="feature-toolbar">
              <div className="feature-search">
                <Search className="feature-search-icon" />
                <Input
                  value={filters.search}
                  onChange={handleSearchChange}
                  placeholder="Search groups..."
                  className="feature-search-input"
                />
              </div>

              <Select value={filters.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="feature-filter-trigger">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {groupsQuery.isLoading ? (
            <div className="feature-table-wrap">
              <GroupsTableSkeleton />
            </div>
          ) : groupsQuery.isError ? (
            <div className="p-4 sm:p-6">
              <ErrorState description="Unable to load groups." />
            </div>
          ) : groups.length ? (
            <>
              <div className="feature-table-wrap">
                <table className="feature-table min-w-[1120px]">
                  <thead className="feature-table-head">
                    <tr>
                      <th className="feature-th">Group</th>
                      <th className="feature-th">Description</th>
                      <th className="feature-th">Status</th>
                      <th className="feature-th">Users</th>
                      <th className="feature-th">Roles</th>
                      <th className="feature-th">Created</th>
                      {hasAnyRowAction ? (
                        <th className="feature-th w-16 text-right">Actions</th>
                      ) : null}
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {groups.map((group) => (
                      <tr
                        key={group._id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <td className="feature-td">
                          <div className="min-w-0">
                            <p className="table-primary-text font-medium">
                              {group.name}
                            </p>

                            <p className="mt-1 table-code-text">
                              {group.code}
                            </p>
                          </div>
                        </td>

                        <td className="feature-td">
                          {group.description ? (
                            <p className="table-description-text text-xs leading-5 text-muted-foreground">
                              {group.description}
                            </p>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              -
                            </span>
                          )}
                        </td>

                        <td className="feature-td">
                          <StatusBadge status={group.status} />
                        </td>

                        <td className="feature-td">
                          <Badge
                            variant="outline"
                            className="rounded-md font-normal"
                          >
                            {getCount(group.users)}
                          </Badge>
                        </td>

                        <td className="feature-td">
                          <Badge
                            variant="outline"
                            className="rounded-md font-normal"
                          >
                            {getCount(group.roles)}
                          </Badge>
                        </td>

                        <td className="feature-td text-sm text-muted-foreground">
                          {formatDateTime(group.createdAt)}
                        </td>

                        {hasAnyRowAction ? (
                          <td className="feature-td text-right">
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

              <PaginationControls
                pagination={pagination}
                limit={filters.limit}
                onPageChange={(nextPage) =>
                  setFilters({
                    page: nextPage,
                  })
                }
                onLimitChange={handleLimitChange}
              />
            </>
          ) : (
            <div className="p-4 sm:p-6">
              <EmptyState
                title="No groups found"
                description="Create a group to assign users and inherited roles."
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
          )}
        </CardContent>
      </Card>

      <GroupFormDialog />
      <GroupUsersDialog />
      <GroupRolesDialog />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            closeDeleteDialog();
          }
        }}
        title="Delete group?"
        description={
          groupForDelete
            ? `This will permanently delete "${groupForDelete.name}". This action cannot be undone.`
            : "This action cannot be undone."
        }
        confirmLabel="Delete group"
        isPending={deleteGroupMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}