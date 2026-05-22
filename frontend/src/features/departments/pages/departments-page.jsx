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

import { DepartmentFormDialog } from "@/features/departments/components/department-form-dialog";
import { DepartmentsTable } from "@/features/departments/components/departments-table";
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
    <div className="space-y-5">
      <PageHeader
        title="Departments"
        description="Organize users and roles into departments."
        actions={
          canCreate ? (
            <Button type="button" onClick={openCreateDialog}>
              <Plus className="size-4" />
              Create department
            </Button>
          ) : null
        }
      />

      <Card className="overflow-hidden border-border/80">
        <CardHeader className="border-b bg-muted/20 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <CardTitle className="text-base">Department directory</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Maintain department records used across users and roles.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-[1fr_150px] xl:w-[520px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search departments..."
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
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {departmentsQuery.isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={8} columns={5} />
            </div>
          ) : departmentsQuery.isError ? (
            <div className="p-4">
              <ErrorState
                description="Unable to load departments."
                onRetry={() => departmentsQuery.refetch()}
              />
            </div>
          ) : (
            <DepartmentsTable departments={departments} />
          )}

          {!departmentsQuery.isLoading && !departmentsQuery.isError ? (
            <PaginationControls
              pagination={pagination}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          ) : null}
        </CardContent>
      </Card>

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