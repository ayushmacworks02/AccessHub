import { Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PageHeader } from "@/components/common/page-header";
import { TableSkeleton } from "@/components/loaders/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

  const flattenedPermissions = useMemo(() => {
    return groupedPermissions.flatMap((group) =>
      (group.permissions || []).map((permission) => ({
        ...permission,
        groupLabel: group.label || group.module,
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
        permission.key?.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [flattenedPermissions, search]);

  return (
    <div className="feature-page">
      <PageHeader
        title="Permissions"
        description="Review available system permissions grouped by module."
      />

      <Card className="feature-card">
        <CardHeader className="feature-card-header">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="size-4 text-muted-foreground" />
                Permission directory
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                {totalPermissions} permissions available from backend seed/configuration.
              </p>
            </div>

            <div className="feature-toolbar">
              <div className="feature-search">
                <Search className="feature-search-icon" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search permissions..."
                  className="feature-search-input"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {permissionsQuery.isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={8} columns={5} />
            </div>
          ) : permissionsQuery.isError ? (
            <div className="p-4 sm:p-6">
              <ErrorState
                description="Unable to load permissions."
                onRetry={() => permissionsQuery.refetch()}
              />
            </div>
          ) : filteredPermissions.length ? (
            <div className="feature-table-wrap">
              <table className="feature-table min-w-[1080px]">
                <thead className="feature-table-head">
                  <tr>
                    <th className="feature-th">Permission</th>
                    <th className="feature-th">Module</th>
                    <th className="feature-th">Action</th>
                    <th className="feature-th">Description</th>
                    <th className="feature-th">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredPermissions.map((permission) => (
                    <tr
                      key={permission._id || permission.key}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="feature-td">
                        <div className="min-w-0">
                          <p className="table-primary-text font-medium">
                            {permission.label}
                          </p>

                          <p className="mt-1 table-secondary-text font-mono text-xs text-muted-foreground">
                            {permission.key}
                          </p>
                        </div>
                      </td>

                      <td className="feature-td">
                        <Badge variant="outline" className="rounded-md">
                          {permission.groupLabel || permission.module}
                        </Badge>
                      </td>

                      <td className="feature-td">
                        <span className="table-code-text">
                          {permission.action}
                        </span>
                      </td>

                      <td className="feature-td">
                        {permission.description ? (
                          <p className="table-description-text text-xs leading-5 text-muted-foreground">
                            {permission.description}
                          </p>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>

                      <td className="feature-td">
                        <Badge variant="secondary" className="rounded-md capitalize">
                          {permission.status || "active"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 sm:p-6">
              <EmptyState
                title="No permissions found"
                description="Try a different search term."
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}