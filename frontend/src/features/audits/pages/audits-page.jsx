import { RotateCcw, Search } from "lucide-react";

import { AuditDetailDialog } from "@/features/audits/components/audit-detail-dialog";
import { AuditsTable } from "@/features/audits/components/audits-table";
import { useAuditsQuery } from "@/features/audits/hooks/use-audits";
import { useAuditsStore } from "@/features/audits/store/audits.store";

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
  const filters = auditsQuery.data?.filters || {};

  const actionOptions = Array.isArray(filters.actions) ? filters.actions : [];
  const resourceOptions = Array.isArray(filters.resources)
    ? filters.resources
    : [];

  const handleResetFilters = () => {
    resetFilters();
  };

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

            <div className="grid gap-2 sm:grid-cols-[1fr_150px_160px_auto] xl:w-[760px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search audits..."
                  className="h-10 pl-9"
                />
              </div>

              <Select
                value={action}
                onValueChange={(value) => {
                  setAction(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  {actionOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {String(item).replaceAll("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={resource}
                onValueChange={(value) => {
                  setResource(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Resource" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All resources</SelectItem>
                  {resourceOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {String(item).replaceAll("_", " ")}
                    </SelectItem>
                  ))}
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
          {auditsQuery.isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={8} columns={7} />
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

          {!auditsQuery.isLoading && !auditsQuery.isError && audits.length ? (
            <PaginationControls
              pagination={pagination}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={(nextLimit) => {
                setLimit(nextLimit);
                setPage(1);
              }}
            />
          ) : null}
        </CardContent>
      </Card>

      <AuditDetailDialog />
    </div>
  );
}