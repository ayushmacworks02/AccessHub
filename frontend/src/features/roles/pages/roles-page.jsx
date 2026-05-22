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

import { RolesTable } from "@/features/roles/components/roles-table";
import { RoleFormDialog } from "@/features/roles/components/role-form-dialog";
import { RolePermissionsDialog } from "@/features/roles/components/role-permissions-dialog";
import {
  useDeleteRoleMutation,
  useRolesQuery,
} from "@/features/roles/hooks/use-roles";
import { useRolesStore } from "@/features/roles/store/roles.store";
import { usePermissions } from "@/hooks/use-permissions";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { useActiveDepartmentsOptions } from "@/hooks/use-admin-options";

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
  const resetFilters = useRolesStore((state) => state.resetFilters);
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
    <div className="space-y-6">
      <PageHeader
        title="Roles"
        description="Create roles and assign reusable permission sets for scalable RBAC."
        actions={
          canCreate ? (
            <Button onClick={openCreateDialog}>
              <Plus className="size-4" />
              New Role
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
              placeholder="Search roles..."
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
          {rolesQuery.isLoading ? (
            <TableSkeleton rows={8} columns={7} />
          ) : rolesQuery.isError ? (
            <ErrorState
              description="Unable to load roles."
              onRetry={() => rolesQuery.refetch()}
            />
          ) : (
            <RolesTable roles={roles} />
          )}
        </div>

        {!rolesQuery.isLoading && !rolesQuery.isError ? (
          <PaginationControls
            pagination={pagination}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        ) : null}
      </div>

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