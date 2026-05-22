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

import { RoleFormDialog } from "@/features/roles/components/role-form-dialog";
import { RolePermissionsDialog } from "@/features/roles/components/role-permissions-dialog";
import { RolesTable } from "@/features/roles/components/roles-table";
import {
  useDeleteRoleMutation,
  useRolesQuery,
} from "@/features/roles/hooks/use-roles";
import { useRolesStore } from "@/features/roles/store/roles.store";
import { useActiveDepartmentsOptions } from "@/hooks/use-admin-options";
import { usePermissions } from "@/hooks/use-permissions";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export function RolesPage() {
  const search = useRolesStore((state) => state.search);
  const status = useRolesStore((state) => state.status);
  const department = useRolesStore((state) => state.department);
  const limit = useRolesStore((state) => state.limit);
  const deleteDialogOpen = useRolesStore((state) => state.deleteDialogOpen);
  const roleToDelete = useRolesStore((state) => state.roleToDelete);

  const setSearch = useRolesStore((state) => state.setSearch);
  const setStatus = useRolesStore((state) => state.setStatus);
  const setDepartment = useRolesStore((state) => state.setDepartment);
  const setPage = useRolesStore((state) => state.setPage);
  const setLimit = useRolesStore((state) => state.setLimit);
  const openCreateDialog = useRolesStore((state) => state.openCreateDialog);
  const closeDeleteDialog = useRolesStore((state) => state.closeDeleteDialog);

  const { can } = usePermissions();

  const rolesQuery = useRolesQuery();
  const departmentsQuery = useActiveDepartmentsOptions();
  const deleteRoleMutation = useDeleteRoleMutation();

  const roles = rolesQuery.data?.roles || [];
  const pagination = rolesQuery.data?.pagination;
  const departments = departmentsQuery.data || [];

  const canCreate = can(PERMISSIONS.ROLE.CREATE);

  const handleDeleteConfirm = () => {
    if (!roleToDelete?._id) {
      return;
    }

    deleteRoleMutation.mutate(roleToDelete._id);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Roles"
        description="Manage reusable permission bundles for RBAC."
        actions={
          canCreate ? (
            <Button type="button" onClick={openCreateDialog}>
              <Plus className="size-4" />
              Create role
            </Button>
          ) : null
        }
      />

      <Card className="overflow-hidden border-border/80">
        <CardHeader className="border-b bg-muted/20 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <CardTitle className="text-base">Role directory</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Create roles and assign permissions from one place.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-[1fr_150px_180px] xl:w-[680px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search roles..."
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
          {rolesQuery.isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={8} columns={5} />
            </div>
          ) : rolesQuery.isError ? (
            <div className="p-4">
              <ErrorState
                description="Unable to load roles."
                onRetry={() => rolesQuery.refetch()}
              />
            </div>
          ) : (
            <RolesTable roles={roles} />
          )}

          {!rolesQuery.isLoading && !rolesQuery.isError ? (
            <PaginationControls
              pagination={pagination}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          ) : null}
        </CardContent>
      </Card>

      <RoleFormDialog />
      <RolePermissionsDialog />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={closeDeleteDialog}
        title="Delete role?"
        description={
          roleToDelete
            ? `This will permanently delete "${roleToDelete.name}". This action cannot be undone.`
            : "This action cannot be undone."
        }
        confirmLabel="Delete role"
        isPending={deleteRoleMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}