import { Plus, Search } from "lucide-react";

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

import { UserEmailPreviewDialog } from "@/features/users/components/user-email-preview-dialog";
import { UserFormDialog } from "@/features/users/components/user-form-dialog";
import { UserRolesDialog } from "@/features/users/components/user-roles-dialog";
import { UserStatusDialog } from "@/features/users/components/user-status-dialog";
import { UsersTable } from "@/features/users/components/users-table";
import {
  useDeleteUserMutation,
  useUsersQuery,
} from "@/features/users/hooks/use-users";
import { useUsersStore } from "@/features/users/store/users.store";
import { useActiveDepartmentsOptions } from "@/hooks/use-admin-options";
import { usePermissions } from "@/hooks/use-permissions";
import { PERMISSIONS } from "@/lib/rbac/permissions";

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
    <div className="space-y-5">
      <PageHeader
        title="Users"
        description="Manage users, departments, roles, and account status."
        actions={
          canCreate ? (
            <Button type="button" onClick={openCreateDialog}>
              <Plus className="size-4" />
              Create user
            </Button>
          ) : null
        }
      />

      <Card className="overflow-hidden border-border/80">
        <CardHeader className="border-b bg-muted/20 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <CardTitle className="text-base">User directory</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                View and manage application user access.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-[1fr_150px_180px] xl:w-[680px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search users..."
                  className="h-10 pl-9"
                />
              </div>

              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="invited">Invited</SelectItem>
                </SelectContent>
              </Select>

              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {departments.map((item) => (
                    <SelectItem key={item._id} value={item._id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {usersQuery.isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={8} columns={5} />
            </div>
          ) : usersQuery.isError ? (
            <div className="p-4">
              <ErrorState
                description="Unable to load users."
                onRetry={() => usersQuery.refetch()}
              />
            </div>
          ) : (
            <UsersTable users={users} />
          )}

          {!usersQuery.isLoading && !usersQuery.isError ? (
            <PaginationControls
              pagination={pagination}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          ) : null}
        </CardContent>
      </Card>

      <UserFormDialog />
      <UserStatusDialog />
      <UserRolesDialog />
      <UserEmailPreviewDialog />

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