import { Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/common/page-header";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { TableSkeleton } from "@/components/loaders/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGroupedPermissionsQuery } from "@/features/permissions/hooks/use-permissions-query";

export function PermissionsPage() {
  const [search, setSearch] = useState("");

  const permissionsQuery = useGroupedPermissionsQuery();
  const groupedPermissions = permissionsQuery.data || [];

  const totalPermissions = useMemo(() => {
    return groupedPermissions.reduce(
      (count, group) => count + (group.permissions?.length || 0),
      0
    );
  }, [groupedPermissions]);

  const filteredGroups = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return groupedPermissions;
    }

    return groupedPermissions
      .map((group) => {
        const permissions = (group.permissions || []).filter((permission) => {
          return (
            permission.label?.toLowerCase().includes(normalizedSearch) ||
            permission.description?.toLowerCase().includes(normalizedSearch) ||
            permission.module?.toLowerCase().includes(normalizedSearch) ||
            permission.action?.toLowerCase().includes(normalizedSearch)
          );
        });

        return {
          ...group,
          permissions,
        };
      })
      .filter((group) => group.permissions.length > 0);
  }, [groupedPermissions, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Permissions"
        description="Review available system permissions grouped by module. Permissions are managed by the backend seed/configuration layer."
      />

      <div className="rounded-xl border bg-card">
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search permissions..."
              className="pl-8"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="h-8 rounded-lg px-3">
              {groupedPermissions.length} modules
            </Badge>

            <Badge variant="secondary" className="h-8 rounded-lg px-3">
              {totalPermissions} permissions
            </Badge>
          </div>
        </div>

        <div className="p-4">
          {permissionsQuery.isLoading ? (
            <TableSkeleton rows={6} columns={3} />
          ) : permissionsQuery.isError ? (
            <ErrorState
              description="Unable to load permissions."
              onRetry={() => permissionsQuery.refetch()}
            />
          ) : filteredGroups.length ? (
            <div className="grid gap-4">
              {filteredGroups.map((group) => (
                <Card key={group.module} className="overflow-hidden">
                  <CardHeader className="border-b bg-muted/30 px-4 py-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <ShieldCheck className="size-4 text-muted-foreground" />
                        {group.label}
                      </CardTitle>

                      <Badge variant="outline" className="w-fit rounded-lg">
                        {group.permissions.length} permissions
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-3">
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      {group.permissions.map((permission) => (
                        <div
                          key={permission._id}
                          className="rounded-lg border bg-background p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="line-clamp-2 text-sm font-medium leading-5">
                              {permission.label}
                            </p>

                            {permission.action ? (
                              <Badge
                                variant="secondary"
                                className="shrink-0 rounded-md capitalize"
                              >
                                {permission.action.toLowerCase()}
                              </Badge>
                            ) : null}
                          </div>

                          {permission.description ? (
                            <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                              {permission.description}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No permissions found"
              description="Try changing your search term."
            />
          )}
        </div>
      </div>
    </div>
  );
}