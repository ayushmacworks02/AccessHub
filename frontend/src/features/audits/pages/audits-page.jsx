import { RotateCcw, Search } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { ErrorState } from "@/components/common/error-state";
import { PaginationControls } from "@/components/common/pagination-controls";
import { TableSkeleton } from "@/components/loaders/table-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { AuditsTable } from "@/features/audits/components/audits-table";
import { AuditDetailDialog } from "@/features/audits/components/audit-detail-dialog";
import { useAuditsQuery } from "@/features/audits/hooks/use-audits";
import { useAuditsStore } from "@/features/audits/store/audits.store";

export function AuditsPage() {
  const search = useAuditsStore((state) => state.search);
  const action = useAuditsStore((state) => state.action);
  const resource = useAuditsStore((state) => state.resource);
  const limit = useAuditsStore((state) => state.limit);

  const setSearch = useAuditsStore((state) => state.setSearch);
  const setAction = useAuditsStore((state) => state.setAction);
  const setResource = useAuditsStore((state) => state.setResource);
  const setPage = useAuditsStore((state) => state.setPage);
  const setLimit = useAuditsStore((state) => state.setLimit);
  const resetFilters = useAuditsStore((state) => state.resetFilters);

  const auditsQuery = useAuditsQuery();

  const audits = auditsQuery.data?.audits || [];
  const pagination = auditsQuery.data?.pagination;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Review important authentication, authorization, and administrative events."
      />

      <div className="rounded-xl border bg-card">
        <div className="flex flex-col gap-3 border-b p-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-sm">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search audit logs..."
              className="pl-8"
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-3 xl:flex xl:items-center">
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Action" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
                <SelectItem value="password_reset">Password Reset</SelectItem>
              </SelectContent>
            </Select>

            <Select value={resource} onValueChange={setResource}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Resource" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                <SelectItem value="auth">Auth</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="role">Role</SelectItem>
                <SelectItem value="department">Department</SelectItem>
                <SelectItem value="permission">Permission</SelectItem>
              </SelectContent>
            </Select>

            <Button type="button" variant="outline" onClick={resetFilters}>
              <RotateCcw className="size-4" />
              Reset
            </Button>
          </div>
        </div>

        <div className="p-4">
          {auditsQuery.isLoading ? (
            <TableSkeleton rows={8} columns={5} />
          ) : auditsQuery.isError ? (
            <ErrorState
              description="Unable to load audit logs."
              onRetry={() => auditsQuery.refetch()}
            />
          ) : (
            <AuditsTable audits={audits} />
          )}
        </div>

        {!auditsQuery.isLoading && !auditsQuery.isError ? (
          <PaginationControls
            pagination={pagination}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        ) : null}
      </div>

      <AuditDetailDialog />
    </div>
  );
}