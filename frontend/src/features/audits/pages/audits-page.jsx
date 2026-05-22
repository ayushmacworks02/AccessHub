import { Search } from "lucide-react";

import { AuditDetailDialog } from "@/features/audits/components/audit-detail-dialog";
import { AuditsTable } from "@/features/audits/components/audits-table";
import { useAuditsQuery } from "@/features/audits/hooks/use-audits";
import { useAuditsStore } from "@/features/audits/store/audits.store";

import { ErrorState } from "@/components/common/error-state";
import { PageHeader } from "@/components/common/page-header";
import { PaginationControls } from "@/components/common/pagination-controls";
import { TableSkeleton } from "@/components/loaders/table-skeleton";
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

  const auditsQuery = useAuditsQuery();

  const audits = auditsQuery.data?.audits || [];
  const pagination = auditsQuery.data?.pagination;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Audit Logs"
        description="Review authentication and administrative events."
      />

      <Card className="overflow-hidden border-border/80">
        <CardHeader className="border-b bg-muted/20 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <CardTitle className="text-base">Audit trail</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Track important user and access management activity.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-[1fr_160px_160px] xl:w-[680px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search audit logs..."
                  className="h-10 pl-9"
                />
              </div>

              <Select value={action} onValueChange={setAction}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  <SelectItem value="CREATE">Create</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                  <SelectItem value="LOGIN_SUCCESS">Login</SelectItem>
                  <SelectItem value="LOGOUT_SUCCESS">Logout</SelectItem>
                  <SelectItem value="PASSWORD_RESET_SUCCESS">
                    Password reset
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={resource} onValueChange={setResource}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Resource" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All resources</SelectItem>
                  <SelectItem value="AUTH">Auth</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ROLE">Role</SelectItem>
                  <SelectItem value="GROUP">Group</SelectItem>
                  <SelectItem value="DEPARTMENT">Department</SelectItem>
                  <SelectItem value="PERMISSION">Permission</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {auditsQuery.isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={8} columns={5} />
            </div>
          ) : auditsQuery.isError ? (
            <div className="p-4">
              <ErrorState
                description="Unable to load audit logs."
                onRetry={() => auditsQuery.refetch()}
              />
            </div>
          ) : (
            <AuditsTable audits={audits} />
          )}

          {!auditsQuery.isLoading && !auditsQuery.isError ? (
            <PaginationControls
              pagination={pagination}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          ) : null}
        </CardContent>
      </Card>

      <AuditDetailDialog />
    </div>
  );
}