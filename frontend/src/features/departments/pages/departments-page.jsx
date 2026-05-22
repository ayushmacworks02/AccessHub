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

import { DepartmentsTable } from "@/features/departments/components/departments-table";
import { DepartmentFormDialog } from "@/features/departments/components/department-form-dialog";
import {
  useDeleteDepartmentMutation,
  useDepartmentsQuery,
} from "@/features/departments/hooks/use-departments";
import { useDepartmentsStore } from "@/features/departments/store/departments.store";
import { usePermissions } from "@/hooks/use-permissions";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export function DepartmentsPage() {
  const search = useDepartmentsStore((state) => state.search);
  const status = useDepartmentsStore((state) => state.status);
  const limit = useDepartmentsStore((state) => state.limit);
  const deleteDialogOpen = useDepartmentsStore(
    (state) => state.deleteDialogOpen
  );
  const departmentToDelete = useDepartmentsStore(
    (state) => state.departmentToDelete
  );

  const setSearch = useDepartmentsStore((state) => state.setSearch);
  const setStatus = useDepartmentsStore((state) => state.setStatus);
  const setPage = useDepartmentsStore((state) => state.setPage);
  const setLimit = useDepartmentsStore((state) => state.setLimit);
  const resetFilters = useDepartmentsStore((state) => state.resetFilters);
  const openCreateDialog = useDepartmentsStore((state) => state.openCreateDialog);
  const closeDeleteDialog = useDepartmentsStore(
    (state) => state.closeDeleteDialog
  );

  const { can } = usePermissions();

  const departmentsQuery = useDepartmentsQuery();
  const deleteDepartmentMutation = useDeleteDepartmentMutation();

  const departments = departmentsQuery.data?.departments || [];
  const pagination = departmentsQuery.data?.pagination;

  const canCreate = can(PERMISSIONS.DEPARTMENT.CREATE);

  const handleDeleteConfirm = () => {
    if (!departmentToDelete?._id) {
      return;
    }

    deleteDepartmentMutation.mutate(departmentToDelete._id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="Organize users and roles into departments for cleaner access management."
        actions={
          canCreate ? (
            <Button onClick={openCreateDialog}>
              <Plus className="size-4" />
              New Department
            </Button>
          ) : null
        }
      />

      <div className="rounded-xl border bg-card">
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search departments..."
              className="pl-8"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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

            <Button type="button" variant="outline" onClick={resetFilters}>
              <RotateCcw className="size-4" />
              Reset
            </Button>
          </div>
        </div>

        <div className="p-4">
          {departmentsQuery.isLoading ? (
            <TableSkeleton rows={8} columns={5} />
          ) : departmentsQuery.isError ? (
            <ErrorState
              description="Unable to load departments."
              onRetry={() => departmentsQuery.refetch()}
            />
          ) : (
            <DepartmentsTable departments={departments} />
          )}
        </div>

        {!departmentsQuery.isLoading && !departmentsQuery.isError ? (
          <PaginationControls
            pagination={pagination}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        ) : null}
      </div>

      <DepartmentFormDialog />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={closeDeleteDialog}
        title="Delete department?"
        description={
          departmentToDelete
            ? `This will permanently delete "${departmentToDelete.name}". This action cannot be undone.`
            : "This action cannot be undone."
        }
        confirmLabel="Delete department"
        isPending={deleteDepartmentMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}