import { RotateCcw, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { ErrorState } from "@/components/common/error-state";
import { PageHeader } from "@/components/common/page-header";
import { TableSkeleton } from "@/components/loaders/table-skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { PermissionsTable } from "@/features/permissions/components/permissions-table";
import { useGroupedPermissionsQuery } from "@/features/permissions/hooks/use-permissions-query";

const getComparableValue = (permission, key) => {
  if (key === "module") {
    return permission.groupLabel || permission.module || "";
  }

  if (key === "status") {
    return permission.status || "active";
  }

  return permission[key] || "";
};

export function PermissionsPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("module");
  const [sortOrder, setSortOrder] = useState("asc");

  const permissionsQuery = useGroupedPermissionsQuery();
  const groupedPermissions = permissionsQuery.data || [];

  const totalPermissions = useMemo(() => {
    return groupedPermissions.reduce(
      (count, group) => count + (group.permissions?.length || 0),
      0
    );
  }, [groupedPermissions]);

  const flattenedPermissions = useMemo(() => {
    return groupedPermissions.flatMap((group) =>
      (group.permissions || []).map((permission) => ({
        ...permission,
        groupLabel: group.label || group.module || permission.module,
      }))
    );
  }, [groupedPermissions]);

  const filteredPermissions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return flattenedPermissions;
    }

    return flattenedPermissions.filter((permission) => {
      return (
        permission.label?.toLowerCase().includes(normalizedSearch) ||
        permission.description?.toLowerCase().includes(normalizedSearch) ||
        permission.module?.toLowerCase().includes(normalizedSearch) ||
        permission.action?.toLowerCase().includes(normalizedSearch) ||
        permission.key?.toLowerCase().includes(normalizedSearch) ||
        permission.groupLabel?.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [flattenedPermissions, search]);

  const sortedPermissions = useMemo(() => {
    return [...filteredPermissions].sort((first, second) => {
      const firstValue = String(
        getComparableValue(first, sortBy)
      ).toLowerCase();
      const secondValue = String(
        getComparableValue(second, sortBy)
      ).toLowerCase();

      if (firstValue < secondValue) {
        return sortOrder === "asc" ? -1 : 1;
      }

      if (firstValue > secondValue) {
        return sortOrder === "asc" ? 1 : -1;
      }

      return 0;
    });
  }, [filteredPermissions, sortBy, sortOrder]);

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder((currentOrder) =>
        currentOrder === "asc" ? "desc" : "asc"
      );

      return;
    }

    setSortBy(columnKey);
    setSortOrder("asc");
  };

  const handleResetFilters = () => {
    setSearch("");
    setSortBy("module");
    setSortOrder("asc");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Permissions"
        description="Review available system permissions grouped by module."
      />

      <Card className="overflow-hidden border-border/80">
        <CardHeader className="border-b bg-muted/20 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <CardTitle className="text-base">Permission directory</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {totalPermissions} permissions available from backend
                seed/configuration.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-[1fr_auto] xl:w-[520px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search permissions..."
                  className="h-10 pl-9"
                />
              </div>

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
          {permissionsQuery.isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={8} columns={5} />
            </div>
          ) : permissionsQuery.isError ? (
            <div className="p-4">
              <ErrorState
                description="Unable to load permissions."
                onRetry={() => permissionsQuery.refetch()}
              />
            </div>
          ) : (
            <PermissionsTable
              permissions={sortedPermissions}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}