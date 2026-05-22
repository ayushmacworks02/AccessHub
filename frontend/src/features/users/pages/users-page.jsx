import { Plus, RotateCcw, Search } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorState } from "@/components/common/error-state";
import { PaginationControls } from "@/components/common/pagination-controls";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { TableSkeleton } from "@/components/loaders/table-skeleton";

import { UsersTable } from "@/features/users/components/users-table";
import { UserFormDialog } from "@/features/users/components/user-form-dialog";
import { UserStatusDialog } from "@/features/users/components/user-status-dialog";
import { UserRolesDialog } from "@/features/users/components/user-roles-dialog";
import {
  useDeleteUserMutation,
  useUsersQuery,
} from "@/features/users/hooks/use-users";
import { useUsersStore } from "@/features/users/store/users.store";
import { usePermissions } from "@/hooks/use-permissions";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { useActiveDepartmentsOptions } from "@/hooks/use-admin-options";

export function UsersPage() {
  const search = useUsersStore((state) => state.search);
  const status = useUsersStore((state) => state.status);
  const department = useUsersStore((state) => state.department);
  const limit = useUsersStore((state) => state.limit);
  const deleteDialogOpen = useUsersStore((state) => state.deleteDialogOpen);
  const userToDelete = useUsersStore((state) => state.userToDelete);

  const setSearch = useUsersStore((state) => state.setSearch);
  const setStatus = useUsersStore((state) => state.setStatus);
  const setDepartment = useUsersStore((state) => state.setDepartment);
  const setPage = useUsersStore((state) => state.setPage);
  const setLimit = useUsersStore((state) => state.setLimit);
  const resetFilters = useUsersStore((state) => state.resetFilters);
  const openCreateDialog = useUsersStore((state) => state.openCreateDialog);
  const closeDeleteDialog = useUsersStore((state) => state.closeDeleteDialog);

  const { can } = usePermissions();

  const usersQuery = useUsersQuery();
  const departmentsQuery = useActiveDepartmentsOptions();
  const deleteUserMutation = useDeleteUserMutation();

  const users = usersQuery.data?.users || [];
  const pagination = usersQuery.data?.pagination;
  const departments = departmentsQuery.data || [];

  const canCreate = can(PERMISSIONS.USER.CREATE);

  const handleDeleteConfirm = () => {
    if (!userToDelete?._id) {
      return;
    }

    deleteUserMutation.mutate(userToDelete._id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Create and manage application users, departments, roles, and account status."
        actions={
          canCreate ? (
            <Button onClick={openCreateDialog}>
              <Plus className="size-4" />
              New User
            </Button>
          ) : null
        }
      />

      <div className="rounded-xl border bg-card">
        <div className="flex flex-col gap-3 border-b p-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-sm">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search users..."
              className="pl-8"
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-3 xl:flex xl:items-center">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="invited">Invited</SelectItem>
              </SelectContent>
            </Select>

            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Department" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>

                {departments.map((departmentItem) => (
                  <SelectItem
                    key={departmentItem._id}
                    value={departmentItem._id}
                  >
                    {departmentItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button type="button" variant="outline" onClick={resetFilters}>
              <RotateCcw className="size-4" />
              Reset
            </Button>
          </div>
        </div>

        <div className="p-4">
          {usersQuery.isLoading ? (
            <TableSkeleton rows={8} columns={7} />
          ) : usersQuery.isError ? (
            <ErrorState
              description="Unable to load users."
              onRetry={() => usersQuery.refetch()}
            />
          ) : (
            <UsersTable users={users} />
          )}
        </div>

        {!usersQuery.isLoading && !usersQuery.isError ? (
          <PaginationControls
            pagination={pagination}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        ) : null}
      </div>

      <UserFormDialog />
      <UserStatusDialog />
      <UserRolesDialog />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={closeDeleteDialog}
        title="Delete user?"
        description={
          userToDelete
            ? `This will permanently delete "${userToDelete.name}". This action cannot be undone.`
            : "This action cannot be undone."
        }
        confirmLabel="Delete user"
        isPending={deleteUserMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}