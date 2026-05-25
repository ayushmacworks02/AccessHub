import { Plus, RotateCcw, Search } from "lucide-react";
import { useMemo } from "react";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { ErrorState } from "@/components/common/error-state";
import { PageHeader } from "@/components/common/page-header";
import { PaginationControls } from "@/components/common/pagination-controls";
import { TableSkeleton } from "@/components/loaders/table-skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { GroupFormDialog } from "@/features/groups/components/group-form-dialog";
import { GroupRolesDialog } from "@/features/groups/components/group-roles-dialog";
import { GroupsTable } from "@/features/groups/components/groups-table";
import { GroupUsersDialog } from "@/features/groups/components/group-users-dialog";
import {
  useDeleteGroupMutation,
  useGroupsQuery,
} from "@/features/groups/hooks/use-groups";
import { useGroupsStore } from "@/features/groups/store/groups.store";
import { useDebounce } from "@/hooks/use-debounce";
import { usePermissions } from "@/hooks/use-permissions";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export function GroupsPage() {
  const { can } = usePermissions();

  const filters = useGroupsStore((state) => state.filters);
  const setFilters = useGroupsStore((state) => state.setFilters);

  const openCreateDialog = useGroupsStore((state) => state.openCreateDialog);
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
      sortBy: filters.sortBy || "createdAt",
      sortOrder: filters.sortOrder || "desc",
    }),
    [
      debouncedSearch,
      filters.limit,
      filters.page,
      filters.status,
      filters.sortBy,
      filters.sortOrder,
    ]
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

  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "all",
      page: 1,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  const handleDeleteConfirm = () => {
    if (!groupForDelete?._id) {
      return;
    }

    deleteGroupMutation.mutate(groupForDelete._id);
  };

  return (
    <div className="space-y-5">
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

      <Card className="overflow-hidden border-border/80">
        <CardHeader className="border-b bg-muted/20 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <CardTitle className="text-base">Group directory</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Assign users and inherited roles from one place.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-[1fr_160px_auto] xl:w-[620px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={filters.search}
                  onChange={handleSearchChange}
                  placeholder="Search groups..."
                  className="h-10 pl-9"
                />
              </div>

              <Select value={filters.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="outline"
                onClick={handleResetFilters}
                className="h-10"
              >
                <RotateCcw className="size-4" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {groupsQuery.isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={8} columns={7} />
            </div>
          ) : groupsQuery.isError ? (
            <div className="p-4">
              <ErrorState
                description="Unable to load groups."
                onRetry={() => groupsQuery.refetch()}
              />
            </div>
          ) : (
            <GroupsTable
              groups={groups}
              canCreate={canCreate}
              canUpdate={canUpdate}
              canDelete={canDelete}
              canManageUsers={canManageUsers}
              canManageRoles={canManageRoles}
            />
          )}

          {!groupsQuery.isLoading && !groupsQuery.isError && groups.length ? (
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
          ) : null}
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